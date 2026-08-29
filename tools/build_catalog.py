#!/usr/bin/env python3
"""
Build deduplicated per-account catalogs from transactions + receipts.

Phase 1 deliverable. Two hard rules:
  * Accounts never merge. Each is built from its own sources only.
  * Nothing is inferred. A field absent from the source stays None.

CONFIDENCE means extraction certainty (how sure are we the title string is
right), NOT metadata completeness:
  High   - exact string from a structured export, corroborated by a second
           independent source (receipt email and/or launcher screenshot)
  Medium - exact string from the structured export, single source
  Low    - string is unusable or unverifiable as-is (literal "N/A",
           truncated by the launcher UI, empty)
"""
import json
import re
import argparse
from pathlib import Path
from collections import defaultdict

# ---------------------------------------------------------------- classification
# Deliberately narrow. A "Collection"/"Bundle" of full games is still a game,
# so those words are NOT demotion signals. Only explicit non-game markers count.

CURRENCY_OR_COSMETIC = (
    'starter pack', 'party favor', 'coins', 'credits', 'currency',
    'skin pack', 'cosmetic',
)
DLC_MARKERS = (
    'modding kit', 'creator kit', 'season pass', 'expansion pass',
    'content pack', 'character pack', 'map pack', 'dlc',
)
DEMO_MARKERS = ('demo', 'prologue', 'free offer')
# Exact-title apps/services (substring matching would catch "Discord Nitro"
# inside unrelated titles, and would misfire on games containing these words).
APP_TITLES = {
    'discord', 'discord nitro',
    'voicemod: real-time ai voice changer & soundboard',
    'aimlabs', 'unreal physics', 'dreamhaven',
}
SUBSCRIPTION_TITLES = {'discord nitro'}


def classify_title(title):
    """game | dlc | add-on | app | demo. Conservative: defaults to 'game'."""
    low = title.lower().strip()

    if low in APP_TITLES:
        return 'subscription' if low in SUBSCRIPTION_TITLES else 'app'
    if any(m in low for m in DEMO_MARKERS):
        return 'demo'
    if any(m in low for m in CURRENCY_OR_COSMETIC):
        return 'add-on'
    if any(m in low for m in DLC_MARKERS):
        return 'dlc'
    return 'game'


# ---------------------------------------------------------------- confidence
TRUNCATION_RE = re.compile(r'(\.\.\.|…)$')


def assess_confidence(title, corroborating_sources):
    """Return (confidence, issues[]). corroborating_sources counts receipt+screenshot."""
    issues = []
    t = title.strip()

    if t in ('N/A', 'n/a', ''):
        issues.append('source_reports_no_title')
    if TRUNCATION_RE.search(t):
        issues.append('truncated_in_source')

    if issues:
        return 'Low', issues
    if corroborating_sources >= 1:
        return 'High', []
    return 'Medium', []


# ---------------------------------------------------------------- build
def build_account_catalog(tx_path, receipts, screenshot_titles=None):
    tx_data = json.loads(Path(tx_path).read_text(encoding='utf-8'))
    screenshot_titles = {s.lower() for s in (screenshot_titles or [])}

    # orderId -> title -> receipt fields
    receipt_map = defaultdict(dict)
    for r in receipts:
        for item in r['items']:
            receipt_map[r['orderId']][item['title']] = item

    catalog, verification = [], []
    # Dedup on (title, orderId, occurrence) so genuinely repeated unknown rows
    # inside one order are preserved rather than collapsed.
    occurrence = defaultdict(int)

    for tx in tx_data:
        title, oid = tx['title'], tx['orderId']
        occurrence[(title, oid)] += 1
        nth = occurrence[(title, oid)]

        rec = receipt_map.get(oid, {}).get(title, {})
        in_receipt = bool(rec)
        in_screenshot = title.lower() in screenshot_titles

        conf, issues = assess_confidence(title, int(in_receipt) + int(in_screenshot))
        cls = classify_title(title)

        entry = {
            'title': title if title not in ('N/A', '') else 'Needs Manual Verification',
            'rawTitle': title,
            'duplicateOccurrence': nth,        # 1 unless the source repeated the row
            'classification': cls,
            'confidence': conf,
            'issues': issues,
            'sources': {
                'transactionHistory': True,
                'receiptEmail': in_receipt,
                'launcherScreenshot': in_screenshot,
            },
            'ownership': {
                'purchaseDate': tx.get('purchaseDate'),
                'orderId': oid,
                'marketplace': tx.get('marketplace'),
                # msrp = list price shown on the line item (real, from source)
                'msrp': tx.get('msrp'),
                # amountPaid = what the receipt says was actually charged
                'amountPaid': rec.get('price'),
                'currency': rec.get('currency') or tx.get('currency'),
                'playtimeSeconds': tx.get('playtimeSeconds'),
                'playtimeRaw': tx.get('playtimeRaw'),
            },
            # Phase 2 fills these. Publisher is already verified for receipt rows.
            'metadata': {
                'publisher': rec.get('publisher'),
                'developer': None,
                'franchise': None,
                'releaseDate': None,
                'genres': [],
                'themes': [],
                'tags': [],
            },
        }
        catalog.append(entry)

        if conf == 'Low':
            verification.append({
                'screenshot': None,
                'possibleTitle': title if title not in ('N/A', '') else None,
                'confidence': conf,
                'reason': '; '.join(issues),
                'orderId': oid,
                'purchaseDate': tx.get('purchaseDate'),
            })

    return catalog, verification


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--raw', default='data/raw')
    ap.add_argument('--out', default='data/catalogs')
    args = ap.parse_args()

    raw, out = Path(args.raw), Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    receipts = json.loads((raw / 'receipts.json').read_text(encoding='utf-8'))
    oids = {}
    for acc in 'AB':
        data = json.loads((raw / f'account{acc}.raw.json').read_text(encoding='utf-8'))
        oids[acc] = {r['orderId'] for r in data}

    # Launcher screenshots correspond to Account B (verified: GTA V playtime
    # 2d 9h 58m 27s == 57h 58m shown in the launcher).
    # Use the RESOLVED titles from match_screenshots.py, not the raw launcher
    # labels - the raw ones are UI-truncated and would never match a catalog row.
    resolved_path = raw / 'screenshot_resolved_titles.json'
    if resolved_path.exists():
        shots = json.loads(resolved_path.read_text(encoding='utf-8'))
    else:
        print('WARNING: screenshot_resolved_titles.json missing; '
              'run tools/match_screenshots.py first. Proceeding without '
              'screenshot corroboration.')
        shots = []

    for acc in 'AB':
        acc_receipts = [r for r in receipts if r['orderId'] in oids[acc]]
        catalog, verification = build_account_catalog(
            raw / f'account{acc}.raw.json',
            acc_receipts,
            shots if acc == 'B' else [],
        )

        (out / f'account{acc}.catalog.json').write_text(
            json.dumps(catalog, indent=2, ensure_ascii=False), encoding='utf-8')
        (out / f'account{acc}.verification.json').write_text(
            json.dumps(verification, indent=2, ensure_ascii=False), encoding='utf-8')

        cls = defaultdict(int)
        conf = defaultdict(int)
        for e in catalog:
            cls[e['classification']] += 1
            conf[e['confidence']] += 1
        pub = sum(1 for e in catalog if e['metadata']['publisher'])

        print(f'Account {acc}: {len(catalog)} entitlements | receipts {len(acc_receipts)}')
        print(f'  classification : {dict(cls)}')
        print(f'  confidence     : {dict(conf)}')
        print(f'  verified pub.  : {pub}')
        print(f'  needs review   : {len(verification)}')


if __name__ == '__main__':
    main()
