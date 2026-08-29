#!/usr/bin/env python3
"""
Phase 2 metadata enrichment.

Source priority, per the brief: IGDB -> Steam -> Epic/GOG/publisher.
  * IGDB is CREDENTIAL-GATED. Set IGDB_CLIENT_ID + IGDB_CLIENT_SECRET to enable.
    Without them the IGDB stage is skipped and every IGDB-only field
    (igdbId, themes, franchise, artwork) stays null - it is never faked.
  * Steam runs unauthenticated via the public storefront API.

Hard rule: a field is written ONLY if a source literally returned it.
Anything else stays null. Nothing is inferred from the title string.

Every network response is cached to .cache/ so re-runs cost nothing and the
build is reproducible offline.
"""
import json
import os
import re
import time
import argparse
import unicodedata
import urllib.parse
import urllib.request
from pathlib import Path

CACHE = Path('.cache')
STEAM_SEARCH = 'https://store.steampowered.com/api/storesearch/?term={term}&cc={cc}&l=english'
STEAM_DETAIL = 'https://store.steampowered.com/api/appdetails?appids={appid}&cc={cc}&l=english'
STEAM_REVIEWS = ('https://store.steampowered.com/appreviews/{appid}'
                 '?json=1&language=all&purchase_type=all&num_per_page=0')
IGDB_TOKEN_URL = 'https://id.twitch.tv/oauth2/token'
IGDB_GAMES_URL = 'https://api.igdb.com/v4/games'

USER_AGENT = 'GameLibraryDashboard/1.0 (local metadata enrichment)'
THROTTLE_SECONDS = 1.3

TRADEMARK_RE = re.compile(r'[®™©]')


# ---------------------------------------------------------------- utilities
def normalize(title):
    t = unicodedata.normalize('NFKC', title)
    t = TRADEMARK_RE.sub('', t)
    t = t.replace('’', "'").replace('‘', "'").replace('—', '-').replace('–', '-')
    t = re.sub(r"[':\.,\-\(\)\[\]!?&+]", ' ', t)
    return re.sub(r'\s+', ' ', t).strip().lower()


def cache_path(kind, key):
    safe = re.sub(r'[^A-Za-z0-9_.-]', '_', str(key))[:120]
    d = CACHE / kind
    d.mkdir(parents=True, exist_ok=True)
    return d / f'{safe}.json'


def fetch_json(url, kind, key, headers=None, data=None, throttle=True):
    """GET/POST with disk cache. Returns (payload, from_cache). None payload on failure."""
    cp = cache_path(kind, key)
    if cp.exists():
        try:
            return json.loads(cp.read_text(encoding='utf-8')), True
        except json.JSONDecodeError:
            cp.unlink(missing_ok=True)

    req = urllib.request.Request(url, data=data)
    req.add_header('User-Agent', USER_AGENT)
    for h, v in (headers or {}).items():
        req.add_header(h, v)

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            payload = json.loads(resp.read().decode('utf-8'))
    except Exception as exc:                                  # noqa: BLE001
        cp.write_text(json.dumps({'_error': str(exc)}), encoding='utf-8')
        if throttle:
            time.sleep(THROTTLE_SECONDS)
        return None, False

    cp.write_text(json.dumps(payload, ensure_ascii=False), encoding='utf-8')
    if throttle:
        time.sleep(THROTTLE_SECONDS)
    return payload, False


# ---------------------------------------------------------------- Steam
def steam_find_appid(title, cc):
    """Resolve a title to a Steam appid. Exact normalized match only - no fuzzy guessing."""
    url = STEAM_SEARCH.format(term=urllib.parse.quote(title), cc=cc)
    payload, _ = fetch_json(url, 'steam_search', f'{cc}_{title}')
    if not payload or '_error' in payload:
        return None, 'search_failed'

    items = payload.get('items') or []
    if not items:
        return None, 'not_on_steam'

    target = normalize(title)
    for item in items:
        if normalize(item.get('name', '')) == target:
            return item['id'], 'exact'

    # Accept a single result whose name starts with the full requested title
    # (covers "Game" -> "Game: Definitive Edition" style store renames).
    prefix_hits = [i for i in items if normalize(i.get('name', '')).startswith(target)]
    if len(prefix_hits) == 1:
        return prefix_hits[0]['id'], 'prefix'

    return None, 'ambiguous'


CATEGORY_FLAGS = {
    'Single-player': 'singlePlayer',
    'Multi-player': 'multiplayer',
    'PvP': 'pvp',
    'Online PvP': 'onlinePvp',
    'Co-op': 'coop',
    'Online Co-op': 'onlineCoop',
    'Shared/Split Screen': 'splitScreen',
    'Steam Achievements': 'achievements',
    'Full controller support': 'controllerSupport',
    'Partial Controller Support': 'partialControllerSupport',
    'Steam Cloud': 'cloudSaves',
    'Steam Trading Cards': 'tradingCards',
    'Remote Play Together': 'remotePlayTogether',
}


def steam_details(appid, cc):
    payload, _ = fetch_json(STEAM_DETAIL.format(appid=appid, cc=cc), 'steam_detail', f'{cc}_{appid}')
    if not payload or '_error' in payload:
        return None
    node = payload.get(str(appid)) or {}
    if not node.get('success'):
        return None
    return node.get('data') or None


def steam_review_score(appid):
    payload, _ = fetch_json(STEAM_REVIEWS.format(appid=appid), 'steam_reviews', appid)
    if not payload or '_error' in payload:
        return None, None
    summary = payload.get('query_summary') or {}
    total = summary.get('total_reviews') or 0
    positive = summary.get('total_positive') or 0
    if total <= 0:
        return None, None
    return round(positive / total * 100), total


def parse_steam_date(raw):
    """'13 Apr, 2015' -> '2015-04-13'. Returns None when Steam gives a vague date."""
    if not raw:
        return None
    raw = raw.strip()
    for fmt in ('%d %b, %Y', '%d %B, %Y', '%b %d, %Y', '%B %d, %Y'):
        try:
            return time.strftime('%Y-%m-%d', time.strptime(raw, fmt))
        except ValueError:
            continue
    m = re.fullmatch(r'(\d{4})', raw)
    return f'{m.group(1)}-01-01' if m else None


def from_steam(data, appid, cc):
    """Map a Steam appdetails payload onto our schema. Absent field -> None."""
    price = data.get('price_overview') or {}
    metacritic = data.get('metacritic') or {}
    categories = {c['description'] for c in data.get('categories') or []}
    steam_pct, review_count = steam_review_score(appid)

    features = {flag: (label in categories) for label, flag in CATEGORY_FLAGS.items()}

    is_free = data.get('is_free', False)
    msrp = (price.get('initial') / 100) if price.get('initial') is not None else (0.0 if is_free else None)
    current = (price.get('final') / 100) if price.get('final') is not None else (0.0 if is_free else None)

    return {
        'steamAppId': appid,
        'steamStoreName': data.get('name'),
        'developer': (data.get('developers') or [None])[0],
        'publisher': (data.get('publishers') or [None])[0],
        'developers': data.get('developers') or [],
        'publishers': data.get('publishers') or [],
        'releaseDate': parse_steam_date((data.get('release_date') or {}).get('date')),
        'releaseDateRaw': (data.get('release_date') or {}).get('date') or None,
        'comingSoon': (data.get('release_date') or {}).get('coming_soon'),
        'genres': [g['description'] for g in data.get('genres') or []],
        'steamCategories': sorted(categories),
        'shortDescription': data.get('short_description') or None,
        'aboutText': re.sub(r'<[^>]+>', '', data.get('about_the_game') or '').strip() or None,
        'headerImage': data.get('header_image') or None,
        'capsuleImage': data.get('capsule_image') or None,
        'background': data.get('background_raw') or data.get('background') or None,
        'screenshots': [s['path_full'] for s in (data.get('screenshots') or [])][:8],
        'website': data.get('website') or None,
        'isFree': is_free,
        'requiredAge': data.get('required_age'),
        'platforms': sorted(k for k, v in (data.get('platforms') or {}).items() if v),
        'supportedLanguages': re.sub(r'<[^>]+>', '', data.get('supported_languages') or '') or None,
        'ratings': {
            'metacritic': metacritic.get('score'),
            'metacriticUrl': metacritic.get('url'),
            'steamPositivePercent': steam_pct,
            'steamReviewCount': review_count,
            'opencritic': None,          # requires OpenCritic API - not available
        },
        'pricing': {
            'currency': price.get('currency') or (cc and 'INR' if cc == 'IN' else None),
            'msrp': msrp,
            'current': current,
            'discountPercent': price.get('discount_percent'),
            'historicalLowest': None,    # requires IsThereAnyDeal API - not available
        },
        'features': features,
        'dlcCount': len(data.get('dlc') or []),
        'steamDeck': None,               # not exposed by this endpoint
    }


# ---------------------------------------------------------------- IGDB
def igdb_token(client_id, client_secret):
    body = urllib.parse.urlencode({
        'client_id': client_id,
        'client_secret': client_secret,
        'grant_type': 'client_credentials',
    }).encode()
    payload, _ = fetch_json(IGDB_TOKEN_URL, 'igdb_auth', client_id, data=body, throttle=False)
    if not payload or '_error' in payload:
        return None
    return payload.get('access_token')


IGDB_FIELDS = (
    'fields id,name,slug,summary,storyline,first_release_date,'
    'genres.name,themes.name,keywords.name,franchise.name,franchises.name,'
    'involved_companies.company.name,involved_companies.developer,'
    'involved_companies.publisher,platforms.name,'
    'aggregated_rating,aggregated_rating_count,rating,rating_count,'
    'cover.image_id,artworks.image_id,screenshots.image_id,'
    'game_modes.name,player_perspectives.name,url;'
)


def igdb_lookup(title, client_id, token):
    headers = {'Client-ID': client_id, 'Authorization': f'Bearer {token}',
               'Content-Type': 'text/plain'}
    body = f'search "{title.replace(chr(34), "")}"; {IGDB_FIELDS} limit 8;'.encode()
    payload, _ = fetch_json(IGDB_GAMES_URL, 'igdb_games', title, headers=headers, data=body)
    if not payload or isinstance(payload, dict):
        return None, 'lookup_failed'
    target = normalize(title)
    for row in payload:
        if normalize(row.get('name', '')) == target:
            return row, 'exact'
    return None, 'no_exact_match'


def from_igdb(row):
    companies = row.get('involved_companies') or []
    devs = [c['company']['name'] for c in companies if c.get('developer') and c.get('company')]
    pubs = [c['company']['name'] for c in companies if c.get('publisher') and c.get('company')]
    franchise = (row.get('franchise') or {}).get('name')
    if not franchise and row.get('franchises'):
        franchise = row['franchises'][0].get('name')

    released = row.get('first_release_date')
    cover = (row.get('cover') or {}).get('image_id')
    artworks = [a['image_id'] for a in row.get('artworks') or []]

    return {
        'igdbId': row.get('id'),
        'igdbSlug': row.get('slug'),
        'igdbUrl': row.get('url'),
        'name': row.get('name'),
        'summary': row.get('summary'),
        'developers': devs,
        'publishers': pubs,
        'developer': devs[0] if devs else None,
        'publisher': pubs[0] if pubs else None,
        'franchise': franchise,
        'releaseDate': time.strftime('%Y-%m-%d', time.gmtime(released)) if released else None,
        'genres': [g['name'] for g in row.get('genres') or []],
        'themes': [t['name'] for t in row.get('themes') or []],
        'tags': [k['name'] for k in row.get('keywords') or []][:25],
        'gameModes': [m['name'] for m in row.get('game_modes') or []],
        'perspectives': [p['name'] for p in row.get('player_perspectives') or []],
        'platforms': [p['name'] for p in row.get('platforms') or []],
        'ratings': {
            'igdbCritic': round(row['aggregated_rating']) if row.get('aggregated_rating') else None,
            'igdbCriticCount': row.get('aggregated_rating_count'),
            'igdbUser': round(row['rating']) if row.get('rating') else None,
            'igdbUserCount': row.get('rating_count'),
        },
        'cover': f'https://images.igdb.com/igdb/image/upload/t_cover_big/{cover}.jpg' if cover else None,
        'artwork': (f'https://images.igdb.com/igdb/image/upload/t_1080p/{artworks[0]}.jpg'
                    if artworks else None),
    }


# ---------------------------------------------------------------- driver
def enrichable_titles(catalogs):
    """Distinct titles worth looking up, per account. Skips unusable rows."""
    out = {}
    for acc, rows in catalogs.items():
        titles = []
        for row in rows:
            if row['confidence'] == 'Low':
                continue
            if row['classification'] in ('add-on', 'subscription'):
                continue
            if row['rawTitle'] not in titles:
                titles.append(row['rawTitle'])
        out[acc] = titles
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--catalogs', default='data/catalogs')
    ap.add_argument('--out', default='data/enriched')
    ap.add_argument('--cc', default='IN', help='Steam country code for pricing (source data is INR).')
    ap.add_argument('--limit', type=int, default=0, help='Cap lookups per account (0 = all).')
    args = ap.parse_args()

    cat_dir, out_dir = Path(args.catalogs), Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    catalogs = {acc: json.loads((cat_dir / f'account{acc}.catalog.json').read_text(encoding='utf-8'))
                for acc in 'AB'}

    client_id = os.environ.get('IGDB_CLIENT_ID')
    client_secret = os.environ.get('IGDB_CLIENT_SECRET')
    token = igdb_token(client_id, client_secret) if client_id and client_secret else None
    if token:
        print('IGDB : credentials accepted, primary source ENABLED')
    else:
        print('IGDB : no credentials -> stage SKIPPED. igdbId/themes/franchise/'
              'artwork stay null (not fabricated).')
    print(f'Steam: public storefront API, pricing region cc={args.cc}\n')

    targets = enrichable_titles(catalogs)
    resolution = {}

    for acc, titles in targets.items():
        if args.limit:
            titles = titles[:args.limit]
        print(f'--- Account {acc}: resolving {len(titles)} distinct titles ---')
        results = {}
        for n, title in enumerate(titles, 1):
            record = {'title': title, 'igdb': None, 'steam': None,
                      'igdbStatus': 'skipped_no_credentials' if not token else None,
                      'steamStatus': None}

            if token:
                row, status = igdb_lookup(title, client_id, token)
                record['igdbStatus'] = status
                if row:
                    record['igdb'] = from_igdb(row)

            appid, status = steam_find_appid(title, args.cc)
            record['steamStatus'] = status
            if appid:
                data = steam_details(appid, args.cc)
                if data:
                    record['steam'] = from_steam(data, appid, args.cc)
                else:
                    record['steamStatus'] = 'detail_failed'

            results[title] = record
            if n % 20 == 0 or n == len(titles):
                hits = sum(1 for r in results.values() if r['steam'] or r['igdb'])
                print(f'  {n}/{len(titles)} processed | {hits} with metadata')

        resolution[acc] = results
        dest = out_dir / f'account{acc}.enriched.json'
        dest.write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding='utf-8')

        steam_hits = sum(1 for r in results.values() if r['steam'])
        igdb_hits = sum(1 for r in results.values() if r['igdb'])
        print(f'  Steam matched: {steam_hits}/{len(results)} | IGDB matched: {igdb_hits}/{len(results)}')
        print(f'  -> {dest}\n')


if __name__ == '__main__':
    main()
