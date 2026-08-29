#!/usr/bin/env python3
"""
Resolve Epic Games Launcher screenshot labels to canonical transaction titles.

The launcher clips long titles to fit its grid tiles ("Tomb Raider I-III Remas…").
This resolves each clipped label against the account's own transaction history:

  1. EXACT normalized match wins outright. This matters: the prefix "Pinball FX"
     would otherwise ambiguously match both "Pinball FX" and "Pinball FX Midnight".
  2. Otherwise, UNIQUE prefix match resolves it.
  3. Multiple prefix candidates -> AMBIGUOUS, reported for manual verification.
  4. No candidate -> UNMATCHED (expected for permanently-free titles like
     Fortnite that Epic grants without generating an order).

Nothing is guessed. Ambiguous and unmatched labels are reported, never resolved
by picking a "most likely" candidate.
"""
import json
import re
import argparse
import unicodedata
from pathlib import Path

ELLIPSIS_RE = re.compile(r'(\.\.\.|…)\s*$')
TRADEMARK_RE = re.compile(r'[®™©]')


def normalize(title):
    """Fold case, unify quotes/dashes, drop trademark glyphs and punctuation noise."""
    t = unicodedata.normalize('NFKC', title)
    t = TRADEMARK_RE.sub('', t)
    t = t.replace('’', "'").replace('‘', "'")
    t = t.replace('“', '"').replace('”', '"')
    t = t.replace('—', '-').replace('–', '-')
    t = re.sub(r"[':\.,\-\(\)\[\]!?&]", ' ', t)
    t = re.sub(r'\s+', ' ', t)
    return t.strip().lower()


def resolve(label, candidates):
    """
    candidates: {normalized_title: [original_title, ...]}
    Returns (status, resolved_titles[])
    """
    was_truncated = bool(ELLIPSIS_RE.search(label))
    stem = normalize(ELLIPSIS_RE.sub('', label))

    if not stem:
        return 'unmatched', []

    # 1. exact match takes precedence over any prefix logic
    if stem in candidates:
        return 'exact', sorted(candidates[stem])

    # 2. prefix match
    hits = sorted({orig
                   for norm, originals in candidates.items()
                   if norm.startswith(stem)
                   for orig in originals})

    if len(hits) == 1:
        return ('prefix_truncated' if was_truncated else 'prefix'), hits
    if len(hits) > 1:
        return 'ambiguous', hits
    return 'unmatched', []


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--raw', default='data/raw')
    ap.add_argument('--account', default='B',
                    help='Account whose transaction history the screenshots belong to.')
    ap.add_argument('--out', default='data/raw/screenshot_resolution.json')
    args = ap.parse_args()

    raw = Path(args.raw)
    labels = json.loads((raw / 'screenshot_titles.json').read_text(encoding='utf-8'))
    tx = json.loads((raw / f'account{args.account}.raw.json').read_text(encoding='utf-8'))

    candidates = {}
    for row in tx:
        candidates.setdefault(normalize(row['title']), set()).add(row['title'])
    candidates = {k: list(v) for k, v in candidates.items()}

    results, resolved_titles = [], set()
    for label in labels:
        status, hits = resolve(label, candidates)
        results.append({
            'launcherLabel': label,
            'truncatedInUI': bool(ELLIPSIS_RE.search(label)),
            'status': status,
            'resolvedTitle': hits[0] if len(hits) == 1 else None,
            'candidates': hits if status == 'ambiguous' else [],
        })
        if len(hits) == 1:
            resolved_titles.add(hits[0])

    (raw / 'screenshot_resolution.json').write_text(
        json.dumps(results, indent=2, ensure_ascii=False), encoding='utf-8')

    # Canonical title list for the catalog builder's corroboration check
    Path(args.out).with_name('screenshot_resolved_titles.json').write_text(
        json.dumps(sorted(resolved_titles), indent=2, ensure_ascii=False), encoding='utf-8')

    counts = {}
    for r in results:
        counts[r['status']] = counts.get(r['status'], 0) + 1

    print(f'Labels read from screenshots : {len(labels)}')
    print(f'Distinct titles resolved     : {len(resolved_titles)}')
    print(f'Status breakdown             : {counts}')
    for r in results:
        if r['status'] in ('ambiguous', 'unmatched'):
            extra = f" -> candidates {r['candidates']}" if r['candidates'] else ''
            print(f"  [{r['status'].upper()}] {r['launcherLabel']}{extra}")


if __name__ == '__main__':
    main()
