#!/usr/bin/env python3
"""
Phase 6 - build the runtime data files the app actually loads.

Merges  data/catalogs/account{A,B}.catalog.json   (ownership + provenance)
with    data/enriched/account{A,B}.enriched.json  (Steam / IGDB metadata)
into    data/account{A,B}.json                    (one file per account)

Also emits data/genres.json and data/config.json.

This docstring used to promise data/analytics/*.json as well. No such emit has
ever existed in this file and nothing reads it -- the claim was corrected on
2026-08-23 rather than by adding an output no consumer wants. Analytics figures
are measured on demand instead; the corpus is 226 records, small enough that
precomputing them buys nothing. See DATA_PIPELINE.md section 7.

Two rules are enforced mechanically here, not by convention:

  1. NO MERGING. Each account is read, built and written in its own pass. There
     is no code path in this file that holds both accounts' games in one list.

  2. NO FABRICATION. A field is written only if a source verified it. Anything
     unverified is written as null (or the literal "Needs Manual Verification"
     for titles). Absence is never backfilled with 0, "", or a guess.

Field priority, per the brief: IGDB -> Steam -> catalog/receipt.
IGDB was skipped this run (no credentials), so igdb.* is null everywhere and
Steam supplies what it can. That is a coverage gap, not an error.
"""

from __future__ import annotations

import json
import re
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / 'data'
ACCOUNTS = ('A', 'B')

PLACEHOLDER_COVER = 'assets/placeholders/cover.svg'
PLACEHOLDER_BG = 'assets/placeholders/background.svg'

SOURCE_LABELS = {
    'transactionHistory': 'Transaction history',
    'receiptEmail': 'Receipt email',
    'launcherScreenshot': 'Launcher screenshot',
}


def load(path: Path):
    with path.open(encoding='utf-8') as fh:
        return json.load(fh)


def dump(path: Path, payload) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('w', encoding='utf-8') as fh:
        json.dump(payload, fh, ensure_ascii=False, indent=2)
    print(f'  -> {path.relative_to(ROOT)}  ({path.stat().st_size:,} bytes)')


def slug(text: str) -> str:
    return re.sub(r'\W+', '_', text.lower()).strip('_')


def first(*values):
    """First value that is not None and not an empty string/list."""
    for v in values:
        if v is None:
            continue
        if isinstance(v, (str, list, dict)) and len(v) == 0:
            continue
        return v
    return None


def build_game(entry: dict, enrich: dict) -> dict:
    """One catalog row + its enrichment -> one runtime game object."""
    igdb = (enrich or {}).get('igdb') or {}
    steam = (enrich or {}).get('steam') or {}

    own = entry['ownership']
    meta = entry.get('metadata') or {}

    s_ratings = steam.get('ratings') or {}
    s_pricing = steam.get('pricing') or {}
    i_ratings = igdb.get('ratings') or {}

    # id must survive the catalog's deliberate duplicate rows (two untitled
    # line items in one order), so duplicateOccurrence is part of the key.
    game_id = f"{own['orderId']}_{slug(entry['title'])}_{entry.get('duplicateOccurrence', 1)}"

    sources = [SOURCE_LABELS[k] for k, v in (entry.get('sources') or {}).items() if v]

    return {
        # ---- identity ----------------------------------------------------
        'id': game_id,
        'title': entry['title'],
        'rawTitle': entry.get('rawTitle'),
        'store': own.get('marketplace'),
        'classification': entry.get('classification'),

        # ---- artwork: IGDB -> Steam -> local placeholder -----------------
        'cover': first(igdb.get('cover'), steam.get('headerImage'),
                       steam.get('capsuleImage')) or PLACEHOLDER_COVER,
        'background': first(igdb.get('artwork'), steam.get('background')) or PLACEHOLDER_BG,
        'screenshots': steam.get('screenshots') or [],

        # ---- credits -----------------------------------------------------
        'developer': first(igdb.get('developer'), steam.get('developer'), meta.get('developer')),
        'publisher': first(igdb.get('publisher'), steam.get('publisher'), meta.get('publisher')),
        'franchise': first(igdb.get('franchise'), meta.get('franchise')),
        'releaseDate': first(igdb.get('releaseDate'), steam.get('releaseDate'),
                             meta.get('releaseDate')),

        # ---- taxonomy ----------------------------------------------------
        'genres': first(igdb.get('genres'), steam.get('genres'), meta.get('genres')) or [],
        'themes': first(igdb.get('themes'), meta.get('themes')) or [],
        'tags': first(igdb.get('tags'), meta.get('tags')) or [],
        'platforms': first(steam.get('platforms'), igdb.get('platforms')) or [],

        # ---- description -------------------------------------------------
        'summary': first(igdb.get('summary'), steam.get('shortDescription')),
        'about': steam.get('aboutText'),

        # ---- ratings (null where unverified) -----------------------------
        'ratings': {
            'metacritic': s_ratings.get('metacritic'),
            'steam': s_ratings.get('steamPositivePercent'),
            'steamReviewCount': s_ratings.get('steamReviewCount'),
            'igdbCritic': i_ratings.get('igdbCritic'),
            'igdbUser': i_ratings.get('igdbUser'),
            # Explicitly unavailable rather than guessed:
            'opencritic': None,
        },

        # ---- pricing: CURRENT STORE VALUE is the primary metric ----------
        'pricing': {
            'currency': first(s_pricing.get('currency'), own.get('currency')) or 'INR',
            'msrp': first(s_pricing.get('msrp'), own.get('msrp')),
            'current': first(s_pricing.get('current'), own.get('msrp')),
            'discountPercent': s_pricing.get('discountPercent'),
            # Needs IsThereAnyDeal; never inferred from msrp.
            'historicalLowest': s_pricing.get('historicalLowest'),
        },
        'isFree': steam.get('isFree') if 'isFree' in steam
        else (own.get('msrp') == 0 and own.get('amountPaid') == 0),

        # ---- features ----------------------------------------------------
        'features': steam.get('features') or {},
        'steamDeck': steam.get('steamDeck'),

        # ---- ownership metadata (LOW visual prominence in the UI) --------
        'ownership': {
            'purchaseDate': own.get('purchaseDate'),
            'purchasePrice': own.get('amountPaid'),
            'marketplace': own.get('marketplace'),
            'transactionId': own.get('orderId'),
            'playtimeSeconds': own.get('playtimeSeconds'),
            'playtimeRaw': own.get('playtimeRaw'),
        },

        # ---- provenance --------------------------------------------------
        'provenance': {
            'confidence': entry.get('confidence'),
            'sources': sources,
            'issues': entry.get('issues') or [],
            'steamAppId': steam.get('steamAppId'),
            'igdbId': igdb.get('igdbId'),
            'steamStatus': (enrich or {}).get('steamStatus', 'not_attempted'),
            'igdbStatus': (enrich or {}).get('igdbStatus', 'not_attempted'),
        },
    }


def build_account(letter: str) -> list[dict]:
    catalog = load(DATA / 'catalogs' / f'account{letter}.catalog.json')
    enriched = load(DATA / 'enriched' / f'account{letter}.enriched.json')

    games = [build_game(row, enriched.get(row['title'])) for row in catalog]

    ids = Counter(g['id'] for g in games)
    clashes = [i for i, n in ids.items() if n > 1]
    if clashes:
        raise SystemExit(f'FATAL: duplicate ids in account {letter}: {clashes}')

    matched = sum(1 for g in games if g['provenance']['steamAppId'])
    print(f'  {len(games)} entitlements | {matched} Steam-matched | {len(ids)} unique ids')
    return games


def genre_taxonomy(per_account: dict[str, list[dict]]) -> dict:
    """Canonical genre list with per-account counts. Accounts stay separate."""
    out: dict[str, dict] = {}
    for letter, games in per_account.items():
        for g in games:
            for name in g['genres']:
                slot = out.setdefault(name, {'name': name, 'slug': slug(name), 'counts': {}})
                slot['counts'][letter] = slot['counts'].get(letter, 0) + 1
    return {
        'source': 'Steam store genres (IGDB taxonomy unavailable - no credentials this run)',
        'generatedAt': datetime.now(timezone.utc).isoformat(timespec='seconds'),
        'genres': sorted(out.values(), key=lambda x: -sum(x['counts'].values())),
    }


def main() -> None:
    print('Building runtime app data')
    print('=' * 62)

    per_account: dict[str, list[dict]] = {}

    # Each account is built and written independently. Nothing concatenates.
    for letter in ACCOUNTS:
        print(f'\nAccount {letter}')
        games = build_account(letter)
        per_account[letter] = games

        dump(DATA / f'account{letter}.json', {
            'account': letter,
            'generatedAt': datetime.now(timezone.utc).isoformat(timespec='seconds'),
            'entitlementCount': len(games),
            'games': games,
        })

    print('\nTaxonomy and config')
    dump(DATA / 'genres.json', genre_taxonomy(per_account))

    dump(DATA / 'config.json', {
        'app': {'name': 'Game Library', 'defaultAccount': 'B', 'defaultView': 'grid',
                'defaultSort': 'title-asc'},
        'accounts': [
            {'id': letter, 'label': f'Account {letter}',
             'dataFile': f'account{letter}.json',
             'entitlements': len(per_account[letter])}
            for letter in ACCOUNTS
        ],
        'assets': {
            'priority': ['IGDB', 'Official store artwork', 'Steam capsule', 'Local placeholder'],
            'placeholders': {'cover': PLACEHOLDER_COVER, 'background': PLACEHOLDER_BG},
        },
        'monetary': {
            'primaryMetric': 'pricing.current',
            'primaryMetricLabel': 'Current store value',
            'lowProminenceMetric': 'ownership.purchasePrice',
            'note': 'Purchase price is ownership metadata and must render de-emphasised.',
        },
        'unavailableSources': {
            'igdb': 'IGDB_CLIENT_ID / IGDB_CLIENT_SECRET not set - igdb.* fields are null',
            'opencritic': 'OpenCritic API not configured - ratings.opencritic is null',
            'isthereanydeal': 'IsThereAnyDeal not configured - pricing.historicalLowest is null',
            'howlongtobeat': 'HowLongToBeat not configured - completion estimates unavailable',
        },
    })

    print('\nDone. Accounts remain separate: two files, never concatenated.')


if __name__ == '__main__':
    main()
