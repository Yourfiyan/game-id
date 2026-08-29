#!/usr/bin/env python3
"""
Parse Epic Games "Transaction History" exports (tab/newline text dumps).

An order block looks like this:

    Jun 28, 2026 <TAB>
    Purchased
    RollerCoaster Tycoon 3 Complete Edition and 1 more   <- order summary label
    - Rs.0.00                                            <- order total charged
    Epic Games Store                                     <- marketplace
    Order ID
    F2606280810195969
    Voidwrought                                          <- line item 1
    Rs.719.00                                            <-   its list price (MSRP)
    Play time: 0
    RollerCoaster Tycoon 3 Complete Edition              <- line item 2
    Rs.1,490.00
    Play time: 0
    Sale Discount                                        <- terminator
    - Rs.2,209.00
    Subtotal
    Rs.0.00
    Total
    Rs.0.00

Every LINE ITEM between the Order ID and the first terminator is a real owned
entitlement. The headline "... and N more" summary is NOT an item, it is a label.

Emits one record per line item. No inference: any field not literally present in
the source becomes None.
"""
import re
import json
import argparse
from pathlib import Path

DATE_RE = re.compile(r'^([A-Z][a-z]{2}\s+\d{1,2},\s+\d{4})\s*$')
PRICE_RE = re.compile(r'^([₹$])\s*([\d,]+(?:\.\d+)?)\s*$')
NEG_PRICE_RE = re.compile(r'^-\s*[₹$]')
PLAYTIME_RE = re.compile(r'^Play time:\s*(.*)$')
TERMINATORS = ('Sale Discount', 'Subtotal', 'Total')
CURRENCY = {'₹': 'INR', '$': 'USD'}


def parse_playtime(raw):
    """'2d 9h 58m 27s' -> 208707 seconds. '0' -> 0. Unparseable -> None."""
    if raw is None:
        return None
    raw = raw.strip()
    if raw == '0':
        return 0
    units = {'d': 86400, 'h': 3600, 'm': 60, 's': 1}
    total, found = 0, False
    for value, unit in re.findall(r'(\d+)\s*([dhms])', raw):
        total += int(value) * units[unit]
        found = True
    return total if found else None


def split_blocks(lines):
    """Yield (date, block_lines) for each order block."""
    starts = [i for i, ln in enumerate(lines) if DATE_RE.match(ln.strip().rstrip('\t'))]
    for n, start in enumerate(starts):
        end = starts[n + 1] if n + 1 < len(starts) else len(lines)
        date = DATE_RE.match(lines[start].strip().rstrip('\t')).group(1)
        yield date, lines[start + 1:end]


def parse_block(date, block):
    """Extract every line item from one order block."""
    text = [ln.strip() for ln in block]

    order_id = None
    for i, ln in enumerate(text):
        if ln == 'Order ID' and i + 1 < len(text):
            order_id = text[i + 1]
            item_start = i + 2
            break
    else:
        return []  # malformed block, no order id

    marketplace = None
    for ln in text[:item_start]:
        if 'Epic Games Store' in ln:
            marketplace = 'Epic Games Store'
            break

    items = []
    current = None
    i = item_start
    while i < len(text):
        ln = text[i]

        if ln in TERMINATORS:
            break
        if not ln:
            i += 1
            continue

        price_match = PRICE_RE.match(ln)
        playtime_match = PLAYTIME_RE.match(ln)

        if price_match and current is not None:
            current['msrp'] = float(price_match.group(2).replace(',', ''))
            current['currency'] = CURRENCY[price_match.group(1)]
        elif playtime_match and current is not None:
            current['playtimeRaw'] = playtime_match.group(1).strip()
            current['playtimeSeconds'] = parse_playtime(playtime_match.group(1))
        elif NEG_PRICE_RE.match(ln):
            pass  # a discount line that slipped inside the item range
        else:
            # a new line item title
            if current is not None:
                items.append(current)
            current = {
                'title': ln,
                'purchaseDate': date,
                'msrp': None,
                'currency': None,
                'marketplace': marketplace,
                'orderId': order_id,
                'playtimeRaw': None,
                'playtimeSeconds': None,
            }
        i += 1

    if current is not None:
        items.append(current)
    return items


def parse_file(path):
    lines = Path(path).read_text(encoding='utf-8').split('\n')
    records = []
    for date, block in split_blocks(lines):
        records.extend(parse_block(date, block))
    return records


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--source', default='data/source')
    ap.add_argument('--out', default='data/raw')
    args = ap.parse_args()

    src = Path(args.source)
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    for account in ('A', 'B'):
        path = src / f'account{account}.transactions.txt'
        if not path.exists():
            print(f'Account {account}: SOURCE MISSING ({path})')
            continue
        records = parse_file(path)
        dest = out / f'account{account}.raw.json'
        dest.write_text(json.dumps(records, indent=2, ensure_ascii=False), encoding='utf-8')

        orders = len({r['orderId'] for r in records})
        titles = len({r['title'] for r in records})
        played = sum(1 for r in records if (r['playtimeSeconds'] or 0) > 0)
        priced = sum(1 for r in records if r['msrp'])
        print(f'Account {account}: {len(records)} line items | {orders} orders | '
              f'{titles} distinct titles | {priced} with price | {played} with playtime '
              f'-> {dest}')


if __name__ == '__main__':
    main()
