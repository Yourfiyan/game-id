import json, glob, re

def norm(s):
    if not s: return ''
    return re.sub(r'[\W_]+', '', s.lower().strip())

def to_usd(val, is_free=False):
    if is_free or val == 0:
        return 0.0
    if val is None:
        return 19.99
    # If the price is > 100, it's an INR amount (e.g. 899, 1499, 3599)
    if val > 100:
        if val >= 3000: return 59.99
        if val >= 2000: return 39.99
        if val >= 1200: return 29.99
        if val >= 800:  return 19.99
        if val >= 400:  return 14.99
        return round(val / 84.0, 2)
    return float(val)

# Steam App IDs and standard store prices for known titles
STEAM_MAPPINGS = {
    norm('Disco Elysium - The Final Cut'): {'steamAppId': 632470, 'msrp': 39.99, 'current': 39.99, 'genres': ['RPG', 'Story Rich', 'Open World'], 'developer': 'ZA/UM', 'publisher': 'ZA/UM', 'isFree': False},
    norm('The Callisto Protocol'): {'steamAppId': 1544020, 'msrp': 59.99, 'current': 59.99, 'genres': ['Action', 'Horror', 'Sci-Fi'], 'developer': 'Striking Distance Studios', 'publisher': 'KRAFTON', 'isFree': False},
    norm('Bloodstained: Ritual of the Night'): {'steamAppId': 692850, 'msrp': 39.99, 'current': 39.99, 'genres': ['Action', 'Metroidvania', 'RPG'], 'developer': 'ArtPlay', 'publisher': '505 Games', 'isFree': False},
    norm('Paradise Killer'): {'steamAppId': 1160220, 'msrp': 19.99, 'current': 19.99, 'genres': ['Adventure', 'Mystery', 'Detective'], 'developer': 'Kaizen Game Works', 'publisher': 'Fellow Traveller', 'isFree': False},
    norm('Sorry We\'re Closed'): {'steamAppId': 1796580, 'msrp': 19.99, 'current': 19.99, 'genres': ['Survival Horror', 'Action', 'Indie'], 'developer': 'à la mode games', 'publisher': 'Akupara Games', 'isFree': False},
    norm('Jotunnslayer: Hordes of Hel'): {'steamAppId': 2820820, 'msrp': 14.99, 'current': 14.99, 'genres': ['Action', 'Roguelike', 'Mythology'], 'developer': 'Grindstone', 'publisher': 'Grindstone', 'isFree': False},
    norm('Hogwarts Legacy'): {'steamAppId': 990080, 'msrp': 59.99, 'current': 59.99, 'genres': ['Action RPG', 'Open World', 'Magic'], 'developer': 'Avalanche Software', 'publisher': 'Warner Bros. Games', 'isFree': False},
    norm('Hogwarts Legacy Creator Kit'): {'steamAppId': 990080, 'msrp': 0.0, 'current': 0.0, 'genres': ['Utilities', 'Modding'], 'developer': 'Avalanche Software', 'publisher': 'Warner Bros. Games', 'isFree': True},
    norm('Monument Valley'): {'steamAppId': 1927720, 'msrp': 7.99, 'current': 7.99, 'genres': ['Puzzle', 'Relaxing', 'Atmospheric'], 'developer': 'ustwo games', 'publisher': 'ustwo games', 'isFree': False},
    norm('Make Way'): {'steamAppId': 1445790, 'msrp': 14.99, 'current': 14.99, 'genres': ['Racing', 'Multiplayer', 'Party'], 'developer': 'Ice BEAM', 'publisher': 'Secret Mode', 'isFree': False},
    norm('Machinarium'): {'steamAppId': 40700, 'msrp': 14.99, 'current': 14.99, 'genres': ['Adventure', 'Point & Click', 'Puzzle'], 'developer': 'Amanita Design', 'publisher': 'Amanita Design', 'isFree': False},
    norm('Aimlabs'): {'steamAppId': 714010, 'msrp': 0.0, 'current': 0.0, 'genres': ['Simulation', 'Action', 'Free to Play'], 'developer': 'State Space Labs', 'publisher': 'State Space Labs', 'isFree': True},
    norm('Two Point Hospital'): {'steamAppId': 535930, 'msrp': 29.99, 'current': 29.99, 'genres': ['Management', 'Building', 'Simulation'], 'developer': 'Two Point Studios', 'publisher': 'SEGA', 'isFree': False},
    norm('Tiny Tina\'s Wonderlands'): {'steamAppId': 1286680, 'msrp': 59.99, 'current': 59.99, 'genres': ['Looter Shooter', 'RPG', 'Action'], 'developer': 'Gearbox Software', 'publisher': '2K', 'isFree': False},
    norm('Limbo'): {'steamAppId': 48000, 'msrp': 9.99, 'current': 9.99, 'genres': ['Indie', 'Puzzle', 'Atmospheric'], 'developer': 'Playdead', 'publisher': 'Playdead', 'isFree': False},
    norm('River City Girls'): {'steamAppId': 1049320, 'msrp': 29.99, 'current': 29.99, 'genres': ['Beat \'em up', 'Action', 'Co-op'], 'developer': 'WayForward', 'publisher': 'WayForward', 'isFree': False},
    norm('Arcadegeddon'): {'steamAppId': 1515640, 'msrp': 19.99, 'current': 19.99, 'genres': ['Action', 'Shooter', 'Multiplayer'], 'developer': 'IllFonic', 'publisher': 'IllFonic', 'isFree': False},
    norm('Poppy Playtime'): {'steamAppId': 1721470, 'msrp': 0.0, 'current': 0.0, 'genres': ['Horror', 'Puzzle', 'Free to Play'], 'developer': 'Mob Entertainment', 'publisher': 'Mob Entertainment', 'isFree': True},
    norm('Fall Guys'): {'steamAppId': 1097150, 'msrp': 0.0, 'current': 0.0, 'genres': ['Party', 'Multiplayer', 'Platformer'], 'developer': 'Mediatonic', 'publisher': 'Epic Games', 'isFree': True},
    norm('Jurassic World Evolution 2'): {'steamAppId': 1244460, 'msrp': 59.99, 'current': 59.99, 'genres': ['Management', 'Building', 'Dinosaurs'], 'developer': 'Frontier Developments', 'publisher': 'Frontier Developments', 'isFree': False},
    norm('World of Warships'): {'steamAppId': 552990, 'msrp': 0.0, 'current': 0.0, 'genres': ['Free to Play', 'Naval Combat', 'Multiplayer'], 'developer': 'Wargaming Group', 'publisher': 'Wargaming Group', 'isFree': True},
    norm('Mortal Shell'): {'steamAppId': 1110910, 'msrp': 29.99, 'current': 29.99, 'genres': ['Souls-like', 'Action RPG', 'Dark Fantasy'], 'developer': 'Cold Symmetry', 'publisher': 'Playstack', 'isFree': False},
    norm('Hell Let Loose'): {'steamAppId': 686810, 'msrp': 49.99, 'current': 49.99, 'genres': ['Shooter', 'WWII', 'Tactical', 'FPS'], 'developer': 'Black Matter', 'publisher': 'Team17', 'isFree': False},
    norm('Rustler - Grand Theft Horse'): {'steamAppId': 844260, 'msrp': 24.99, 'current': 24.99, 'genres': ['Action', 'Open World', 'Comedy'], 'developer': 'Jutsu Games', 'publisher': 'Modus Games', 'isFree': False},
    norm('Total War: THREE KINGDOMS'): {'steamAppId': 779340, 'msrp': 59.99, 'current': 59.99, 'genres': ['Strategy', 'Historical', 'Turn-Based'], 'developer': 'CREATIVE ASSEMBLY', 'publisher': 'SEGA', 'isFree': False},
    norm('RollerCoaster Tycoon 3 Complete Edition'): {'steamAppId': 1368820, 'msrp': 19.99, 'current': 19.99, 'genres': ['Simulation', 'Management', 'Building'], 'developer': 'Frontier Developments', 'publisher': 'Frontier Developments', 'isFree': False},
    norm('The Ouroboros King'): {'steamAppId': 2096510, 'msrp': 9.99, 'current': 9.99, 'genres': ['Chess', 'Roguelike', 'Strategy'], 'developer': 'Oriol Cosp', 'publisher': 'Oriol Cosp', 'isFree': False},
    norm('SKALD: Against the Black Priory'): {'steamAppId': 1069160, 'msrp': 14.99, 'current': 14.99, 'genres': ['CRPG', 'Dark Fantasy', 'Retro'], 'developer': 'High North Studios', 'publisher': 'Raw Fury', 'isFree': False},
    norm('Cassette Beasts'): {'steamAppId': 1321440, 'msrp': 19.99, 'current': 19.99, 'genres': ['Creature Collector', 'RPG', 'Open World'], 'developer': 'Bytten Studio', 'publisher': 'Raw Fury', 'isFree': False},
    norm('Voidwrought'): {'steamAppId': 2014550, 'msrp': 19.99, 'current': 19.99, 'genres': ['Metroidvania', 'Action', 'Dark Fantasy'], 'developer': 'Powersnake', 'publisher': 'Powersnake', 'isFree': False},
    norm('Rise of the Tomb Raider: 20 Year Celebration'): {'steamAppId': 391220, 'msrp': 29.99, 'current': 29.99, 'genres': ['Action', 'Adventure'], 'developer': 'Crystal Dynamics', 'publisher': 'Crystal Dynamics', 'isFree': False},
    norm('Sid Meier’s Civilization VI'): {'steamAppId': 289070, 'msrp': 59.99, 'current': 59.99, 'genres': ['Strategy', 'Turn-Based'], 'developer': 'Firaxis Games', 'publisher': '2K', 'isFree': False},
    norm('Never Alone (Kisima Ingitchuna)'): {'steamAppId': 295790, 'msrp': 14.99, 'current': 14.99, 'genres': ['Adventure', 'Indie', 'Platformer'], 'developer': 'Upper One Games', 'publisher': 'E-Line Media', 'isFree': False},
    norm('The Big Con'): {'steamAppId': 1139280, 'msrp': 14.99, 'current': 14.99, 'genres': ['Adventure', 'Comedy'], 'developer': 'Mighty Yell', 'publisher': 'Skybound Games', 'isFree': False},
    norm('Maid of Sker'): {'steamAppId': 826940, 'msrp': 24.99, 'current': 24.99, 'genres': ['Survival Horror', 'Action'], 'developer': 'Wales Interactive', 'publisher': 'Wales Interactive', 'isFree': False},
    norm('Genshin Impact'): {'steamAppId': None, 'msrp': 0.0, 'current': 0.0, 'genres': ['Action RPG', 'Open World', 'Anime'], 'developer': 'miHoYo / COGNOSPHERE', 'publisher': 'COGNOSPHERE', 'isFree': True},
    norm('Warframe'): {'steamAppId': 230410, 'msrp': 0.0, 'current': 0.0, 'genres': ['Shooter', 'Action', 'Free to Play'], 'developer': 'Digital Extremes', 'publisher': 'Digital Extremes', 'isFree': True},
    norm('The Lord of The Rings: Return to Moria'): {'steamAppId': 2933620, 'msrp': 39.99, 'current': 39.99, 'genres': ['Survival Craft', 'Co-op', 'Fantasy'], 'developer': 'Free Range Games', 'publisher': 'North Beach Games', 'isFree': False},
    norm('Warhammer 40,000: Speed Freeks'): {'steamAppId': 2078450, 'msrp': 0.0, 'current': 0.0, 'genres': ['Vehicular Combat', 'Multiplayer', 'Warhammer 40k'], 'developer': 'Caged Element Inc.', 'publisher': 'Plaion', 'isFree': True},
    norm('Wildgate - Standard Edition'): {'steamAppId': 2478440, 'msrp': 19.99, 'current': 19.99, 'genres': ['Action', 'Adventure'], 'developer': 'Wildgate Studios', 'publisher': 'Wildgate Studios', 'isFree': False},
    norm('Trine Classic Collection'): {'steamAppId': 35700, 'msrp': 29.99, 'current': 29.99, 'genres': ['Puzzle', 'Platformer', 'Co-op'], 'developer': 'Frozenbyte', 'publisher': 'Frozenbyte', 'isFree': False},
}

db = {}

# 1. Base catalogs
for path in ['data/catalogs/accountA.catalog.json', 'data/catalogs/accountB.catalog.json']:
    with open(path, encoding='utf-8') as f:
        for g in json.load(f):
            t = g['title']
            k = norm(t)
            raw_msrp = g.get('ownership', {}).get('msrp')
            cls = g.get('classification', 'game')
            meta = g.get('metadata') or {}
            is_f2p = cls in ['app', 'subscription'] or raw_msrp == 0
            msrp_usd = to_usd(raw_msrp, is_f2p)

            if k not in db:
                db[k] = {
                    'title': t,
                    'classification': cls,
                    'msrp': msrp_usd,
                    'current': msrp_usd,
                    'currency': 'USD',
                    'genres': meta.get('genres') or [],
                    'developer': meta.get('developer'),
                    'publisher': meta.get('publisher'),
                    'releaseDate': meta.get('releaseDate'),
                    'isFree': is_f2p,
                    'steamAppId': None,
                }

# 2. Steam enriched data
for path in ['data/enriched/accountA.enriched.json', 'data/enriched/accountB.enriched.json']:
    with open(path, encoding='utf-8') as f:
        d = json.load(f)
        for t, val in d.items():
            if not val: continue
            st = val.get('steam') or {}
            k = norm(t)
            if st and st.get('steamAppId'):
                app_id = st.get('steamAppId')
                p = st.get('pricing') or {}
                r = st.get('ratings') or {}

                is_f2p = st.get('isFree', False)
                msrp_usd = to_usd(p.get('msrp') or p.get('current'), is_f2p)

                db[k] = {
                    'title': t,
                    'classification': 'game',
                    'steamAppId': app_id,
                    'developer': st.get('developer') or (st.get('developers') or [None])[0],
                    'publisher': st.get('publisher') or (st.get('publishers') or [None])[0],
                    'releaseDate': st.get('releaseDate'),
                    'genres': st.get('genres') or [],
                    'tags': (st.get('steamCategories') or [])[:8],
                    'platforms': st.get('platforms') or ['windows'],
                    'summary': st.get('shortDescription'),
                    'msrp': msrp_usd,
                    'current': msrp_usd,
                    'currency': 'USD',
                    'isFree': is_f2p,
                    'metacritic': r.get('metacritic'),
                    'steamScore': r.get('steamPositivePercent'),
                    'steamReviewCount': r.get('steamReviewCount'),
                    'cover': st.get('headerImage') or f'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/{app_id}/header.jpg',
                    'background': st.get('background') or f'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/{app_id}/page_bg_raw.jpg',
                    'screenshots': (st.get('screenshots') or [])[:4],
                }

# 3. Explicit known mappings
for k, val in STEAM_MAPPINGS.items():
    if k in db:
        db[k].update(val)
    else:
        db[k] = val

# 4. Fill covers and backgrounds for any entry with steamAppId
for k, v in db.items():
    app_id = v.get('steamAppId')
    if app_id:
        if not v.get('cover'):
            v['cover'] = f"https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/{app_id}/header.jpg"
        if not v.get('background'):
            v['background'] = f"https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/{app_id}/page_bg_raw.jpg"

print(f"Total entries compiled into DB: {len(db)}")
with_cover = sum(1 for v in db.values() if v.get('cover'))
print(f"Entries with official artwork: {with_cover}")

header = """/* ==========================================================================
   Game ID — In-Browser Game Knowledge & Enrichment Database
   Provides instant offline & client-side metadata, artwork, genres & MSRP
   ========================================================================== */

export const GAME_DATABASE = """

footer = """

export function normalizeTitle(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .replace(/[™®©]/g, '')
    .replace(/\\b(standard|deluxe|enhanced|complete|gold|goty|game of the year|anniversary|director's cut|definitive|edition|bundle|collection)\\b/gi, '')
    .replace(/[\\W_]+/g, '')
    .trim();
}

/**
 * Generate a dynamic fallback SVG cover with beautiful colors and typography
 */
export function generateFallbackCover(title, genre = 'Game') {
  const t = (title || 'Game').slice(0, 30);
  const hash = Array.from(title || 'game').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hues = [[210, 240], [280, 320], [160, 200], [340, 20], [30, 60], [180, 220]];
  const [h1, h2] = hues[hash % hues.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 215" width="460" height="215">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="hsl(${h1}, 65%, 22%)"/>
        <stop offset="100%" stop-color="hsl(${h2}, 75%, 12%)"/>
      </linearGradient>
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="460" height="215" fill="url(#grad)"/>
    <rect width="460" height="215" fill="url(#grid)"/>
    <circle cx="400" cy="40" r="100" fill="hsl(${h1}, 70%, 40%)" opacity="0.12"/>
    <circle cx="60" cy="180" r="80" fill="hsl(${h2}, 70%, 40%)" opacity="0.12"/>
    <g transform="translate(32, 110)">
      <rect x="0" y="-80" width="36" height="36" rx="8" fill="rgba(255,255,255,0.1)"/>
      <text x="18" y="-56" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" text-anchor="middle" fill="#ffffff">🎮</text>
      <text x="0" y="-12" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700" fill="#ffffff" letter-spacing="-0.02em">${escapeXml(t)}</text>
      <text x="0" y="16" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="500" fill="rgba(255,255,255,0.6)" letter-spacing="0.05em" text-transform="uppercase">${escapeXml(genre)}</text>
    </g>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function escapeXml(unsafe) {
  return String(unsafe || '').replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\\'': return '&apos;';
      case '\"': return '&quot;';
    }
  });
}

/**
 * Match a raw game title against the built-in database
 */
export function lookupGame(rawTitle) {
  if (!rawTitle) return null;
  const key = normalizeTitle(rawTitle);
  if (GAME_DATABASE[key]) return GAME_DATABASE[key];

  // Try substring / word match
  for (const [k, data] of Object.entries(GAME_DATABASE)) {
    if (k.length > 4 && (key.includes(k) || k.includes(key))) {
      return data;
    }
  }
  return null;
}
"""

with open('app/services/game-catalog-db.js', 'w', encoding='utf-8') as out_f:
    out_f.write(header + json.dumps(db, indent=2, ensure_ascii=False) + ';' + footer)

print('Updated app/services/game-catalog-db.js with clean USD prices successfully!')
