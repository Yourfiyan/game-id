#!/usr/bin/env python3
"""
Parse Epic Games receipt .eml files.
Extract: game title, publisher, price, currency, order ID, order date.

Body structure (HTML stripped):
    ...
    Order ID:
    F2009211657376748
    Order Date:
    September 21, 2020
    ...
    HERE'S WHAT YOU ORDERED:
    Description:       Publisher:         Price:
    <title 1>
    <publisher 1>
    <currency> <price 1>
    <title 2>
    <publisher 2>
    <currency> <price 2>
    ...
    TOTAL [...]

SOURCE FILES ARE GONE -- verified 2026-08-23. This script's --eml-dir default
used to point at C:/Users/Sufiyan/AppData/Local/Temp/gid_extract. That directory
no longer exists, no .eml file survives anywhere in the project, and the temp
sweep TODO.md C2 warned about has therefore already happened. Stage 2 is no
longer re-runnable from source.

Nothing downstream is lost: data/raw/receipts.json preserves all 14 orders and
all 32 line items. That matters more than it looks -- those 14 receipts are the
SOLE source of ownership.purchasePrice, which is populated on exactly 32 of 226
records (14.2%) and on no record that lacks a "Receipt email" provenance source.
The correspondence is 1:1 and was re-measured 2026-08-23.

The 14 files that would need re-exporting from the mailbox to re-run this stage,
with the order each produced (recorded in receipts.json's "source" field):

    Your Epic Games Receipt F2009211657376748.eml   1 item
    Your Epic Games Receipt F2012171750490744.eml   1 item
    Your Epic Games Receipt F2111080537065416.eml   1 item
    Your Epic Games Receipt F2201060710588262.eml   1 item
    Your Epic Games Receipt F2201060717384786.eml   1 item
    Your Epic Games Receipt F2204281602094327.eml   2 items
    Your Epic Games Receipt F2206091613224327.eml   1 item
    Your Epic Games Receipt F2303250801030768.eml  11 items
    Your Epic Games Receipt.eml                     2 items  F2606181457396485
    Your Epic Games Receipt_1.eml                   2 items  F2606280810195969
    Your Epic Games Receipt_2.eml                   2 items  F2605291022377931
    Your Epic Games Receipt_3.eml                   2 items  F2605211531459269
    Your Epic Games Receipt_4.eml                   3 items  F2605161404518642
    Your Epic Games Receipt_5.eml                   2 items  F2605131329102605

The default below now points at data/source/receipts/, matching the convention
data/source/account{A,B}.transactions.txt already sets, so a re-export lands
somewhere durable and in-project rather than in a directory Windows will delete.
The directory is intentionally not created empty -- an empty receipts dir would
make this script report "0 orders" as though that were a measurement.
"""
import email
import re
import html
from email import policy
from pathlib import Path
import json
import argparse
from datetime import datetime


def strip_html(raw_html):
    """Remove HTML tags and decode entities."""
    h = re.sub(r'<(script|style)[^>]*>.*?</\1>', '', raw_html, flags=re.S | re.I)
    h = re.sub(r'<br\s*/?>|</tr>|</p>|</div>|</h[1-6]>', '\n', h, flags=re.I)
    h = re.sub(r'</t[dh]>', '\n', h, flags=re.I)
    h = re.sub(r'<[^>]+>', '', h)
    return html.unescape(h)


def parse_email_body(eml_path):
    """Extract structured data from one .eml file."""
    msg = email.message_from_bytes(Path(eml_path).read_bytes(), policy=policy.default)

    subject = msg.get('Subject', '')
    date_header = msg.get('Date', '')
    recipient = msg.get('To', '')

    # Order ID from subject (older receipts include it there)
    order_id = None
    oid_match = re.search(r'F\d{16}', subject)
    if oid_match:
        order_id = oid_match.group(0)

    # Prefer HTML body (text/plain is often a stub)
    body = None
    for part in msg.walk():
        if part.get_content_type() == 'text/html':
            body = strip_html(part.get_content())
            break
    if body is None:
        for part in msg.walk():
            if part.get_content_type() == 'text/plain':
                content = part.get_content()
                # Skip stub/fallback messages
                if 'might not support HTML' in content or 'open the following link' in content:
                    return None
                body = content
                break

    if not body:
        return None

    lines = [ln.strip() for ln in body.split('\n') if ln.strip()]

    # Extract Order ID from body if not in subject
    # Body layout (2-column flattened): "Order ID:" "Bill To:" <order_id> <email>
    if not order_id:
        for i, ln in enumerate(lines):
            if ln == 'Order ID:' and i + 2 < len(lines):
                candidate = lines[i + 2]
                if re.match(r'F\d{16}', candidate):
                    order_id = candidate
                    break

    # Extract Order Date. Two layouts exist:
    #   1-column:  "Order Date:" / "September 21, 2020"
    #   2-column:  "Order Date:" / "Source:" / "May 21, 2026" / "Epic Games Store"
    # So scan forward for the first line that actually parses as a date.
    DATE_TEXT_RE = re.compile(
        r'^(January|February|March|April|May|June|July|August|September'
        r'|October|November|December)\s+\d{1,2},\s+\d{4}$'
    )
    order_date = None
    for i, ln in enumerate(lines):
        if ln == 'Order Date:':
            for j in range(i + 1, min(i + 5, len(lines))):
                if DATE_TEXT_RE.match(lines[j]):
                    order_date = lines[j]
                    break
            break

    # Extract line items (after "HERE'S WHAT YOU ORDERED:")
    items = []
    try:
        start_idx = lines.index("HERE'S WHAT YOU ORDERED:")
        # Skip the header row (Description: | Publisher: | Price:)
        i = start_idx + 1
        while i < len(lines) and lines[i] not in ('Description:', 'TOTAL'):
            i += 1
        if i < len(lines) and lines[i] == 'Description:':
            i += 3  # skip header row (Description: | Publisher: | Price:)

        # Parse 3-line blocks: title, publisher, price
        while i + 2 < len(lines):
            title = lines[i].strip()
            publisher = lines[i + 1].strip()
            price_line = lines[i + 2].strip()

            # Stop at footer / discount blocks - these are not line items.
            # Newer receipts emit:  Discounts: / Sale Discount / - <amount>
            if (title.startswith('TOTAL') or title.startswith('Discounts')
                    or title.startswith('Sale Discount') or title.startswith('Subtotal')
                    or title.startswith('PAID FROM') or 'VAT' in title
                    or 'PAYMENT' in title):
                break

            # Parse price: "INR ₹ 0.00" or "$ 41.99"
            price_match = re.search(r'([₹$€£])\s*([\d,]+\.?\d*)', price_line)
            if price_match:
                currency_symbol = price_match.group(1)
                price_str = price_match.group(2).replace(',', '')
                currency_map = {'₹': 'INR', '$': 'USD', '€': 'EUR', '£': 'GBP'}
                currency = currency_map.get(currency_symbol, 'USD')
                try:
                    price = float(price_str)
                except:
                    price = None
            else:
                currency = None
                price = None

            if title and publisher:
                items.append({
                    'title': title,
                    'publisher': publisher,
                    'price': price,
                    'currency': currency
                })

            i += 3

    except (ValueError, IndexError):
        pass

    return {
        'source': Path(eml_path).name,
        'recipient': recipient,
        'dateHeader': date_header,
        'orderId': order_id,
        'orderDate': order_date,
        'items': items
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--eml-dir', default='data/source/receipts')
    ap.add_argument('--out', default='data/raw/receipts.json')
    args = ap.parse_args()

    eml_dir = Path(args.eml_dir)
    receipts = []

    # Refuse to run against a missing or empty source directory.
    #
    # Path.glob on a non-existent directory yields zero matches and raises
    # nothing -- verified 2026-08-23. Without this guard, running the script
    # after the source .eml files went missing would parse zero receipts and
    # then happily overwrite data/raw/receipts.json with [], destroying the only
    # surviving copy of all 14 orders and 32 line items. Those 32 items are the
    # sole source of ownership.purchasePrice across the whole corpus, so the
    # overwrite would be unrecoverable.
    #
    # A zero from a glob that reached nothing is not a measurement. Exit non-zero
    # and leave the existing output untouched.
    if not eml_dir.is_dir():
        raise SystemExit(
            f"--eml-dir does not exist: {eml_dir}\n"
            "Refusing to run: writing now would overwrite "
            f"{args.out} with an empty list.\n"
            "The original sources were lost from a Windows temp directory; "
            "re-export the 14 receipt .eml files listed in this file's "
            "docstring into data/source/receipts/ before re-running."
        )
    eml_files = sorted(eml_dir.glob('*.eml'))
    if not eml_files:
        raise SystemExit(
            f"No .eml files in {eml_dir}\n"
            f"Refusing to run: writing now would overwrite {args.out} "
            "with an empty list."
        )

    for eml_file in eml_files:
        result = parse_email_body(eml_file)
        if result:
            receipts.append(result)
            print(f"{eml_file.name}: Order {result['orderId']}, {result['orderDate']}, {len(result['items'])} items")
        else:
            print(f"{eml_file.name}: SKIPPED (stub or empty)")

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(receipts, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f"\nExtracted {len(receipts)} receipts -> {out_path}")


if __name__ == '__main__':
    main()
