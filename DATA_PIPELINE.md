# Game ID — Data Pipeline

**Owner of:** the Python extraction/enrichment chain in `tools/`, the `data/` provenance tree,
and every measured figure about the corpus.

**Not the owner of:** the Figma design system (see `CLAUDE.md`), the roadmap (`HANDOFF.md`,
`TODO.md`), or the frontend (gated — see the implementation gate in `HANDOFF.md` §3).

Last measured against the live files **2026-08-05**. Every number below was re-run from
`data/accountA.json` + `data/accountB.json` on that date, not copied from an earlier document.

---

## 1. Why this file exists

The design system is built to fit **this** corpus. Several load-bearing design decisions —
the Confidence Badge, the absence of a completion field, the refusal to make playtime a default
sort, the sparse Game Card being a first-class variant rather than an edge case — are downstream
of measurements taken here. If the pipeline is ever re-run and the shape of the data changes,
those design decisions must be re-examined, not preserved out of habit.

The corollary matters just as much: **do not design a surface the data cannot fill.**

---

## 2. Status

The pipeline is **built and has been run to completion.** It is not under active development.
Its output (`data/accountA.json`, `data/accountB.json`, `data/config.json`, `data/genres.json`)
is stable and dated `2026-07-31T14:00:27+00:00`.

There is no work outstanding on it that blocks the design system. The two open items are
recorded in §9 and neither is urgent.

---

## 3. The two hard rules

These are enforced mechanically in the code, not by convention, and they are the reason the
corpus is trustworthy enough to design against.

### NO FABRICATION

A field is written **only if a source literally returned it.** Anything unverified is written as
`null` — never backfilled with `0`, `""`, a guess, or a value inferred from the title string.
The one exception is a title that could not be extracted at all, which is written as the literal
string `"Needs Manual Verification"` so it is impossible to mistake for real data.

This is why the fill rates in §7 have hard cliffs rather than a smooth gradient. A 58.4% figure
means 58.4% of records were verified, not that the rest are approximately known.

### NO MERGING

Each account is read, built and written in its own pass. **There is no code path in
`build_app_data.py` that holds both accounts' games in one list.** The two accounts are separate
ownership realities; a combined "library" figure would be a fiction that double-counts the
6 titles owned on both.

Consequence for the UI: any total shown must be scoped to an account, or must state that it is
a cross-account sum and account for duplicates explicitly.

---

## 4. What "confidence" means — read this before designing anything that shows it

`provenance.confidence` is **extraction certainty** — how sure we are that the *title string* is
correct. It is **not** metadata completeness, and it is not a quality score for the record.

| Level | Definition | Count |
|---|---|---|
| **High** | Exact string from a structured export, corroborated by a **second independent source** (receipt email and/or launcher screenshot) | 63 |
| **Medium** | Exact string from the structured export, **single source** | 161 |
| **Low** | String is unusable or unverifiable as-is — literal `"N/A"`, truncated by the launcher UI, or empty | 2 |

**There is no "none" bucket, and there never was.** Confidence is present on **226/226 records
(100%)**. Any design that shows a four-way High/Medium/Low/None split is showing a bucket that
does not exist. (This is a live defect in the Metric Card — see `TODO.md`.)

A Medium record is not a deficient record. Medium is the *normal* case: 71% of the corpus.

---

## 5. The chain

Six scripts in `tools/`, run in order. Each writes files that the next reads. All paths are
relative to the repo root `D:\work\Game ID`.

```
data/source/*.transactions.txt   ─┐
                                  ├─▶ 1. parse_transactions.py ─▶ data/raw/account{A,B}.raw.json
  (Epic "Transaction History"     │
   text exports, per account)     │
                                  │
  .eml receipt emails ────────────┼─▶ 2. parse_receipts.py ─────▶ data/raw/receipts.json
                                  │                               data/raw/receipt_structure.json
                                  │                               data/raw/receipt_crosscheck.json
                                  │
  launcher screenshot labels ─────┴─▶ 3. match_screenshots.py ──▶ data/raw/screenshot_resolution.json
   (data/raw/screenshot_titles.json)                              data/raw/screenshot_resolved_titles.json
                                                                          │
                                                                          ▼
                        4. build_catalog.py ──▶ data/catalogs/account{A,B}.catalog.json
                                                data/catalogs/account{A,B}.verification.json
                                                                          │
                                                                          ▼
                        5. enrich.py ─────────▶ data/enriched/account{A,B}.enriched.json
                             (Steam public API + IGDB if credentialed; all
                              responses cached to .cache/)
                                                                          │
                                                                          ▼
                        6. build_app_data.py ─▶ data/account{A,B}.json    ← the runtime files
                                                data/genres.json
                                                data/config.json
```

### 1. `parse_transactions.py`

```bash
python tools/parse_transactions.py --source data/source --out data/raw
```

Parses Epic's "Transaction History" tab/newline text dumps. An order block looks like:

```
Jun 28, 2026 <TAB>
Purchased
RollerCoaster Tycoon 3 Complete Edition and 1 more   <- order summary LABEL, not an item
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
...
```

Every **line item** between the Order ID and the first terminator is a real owned entitlement.
The headline `"... and N more"` summary is **not** an item — it is a label, and treating it as
one is the classic way to inflate the count. Emits one record per line item.

Output: `accountA.raw.json` (51), `accountB.raw.json` (175).

### 2. `parse_receipts.py`

```bash
python tools/parse_receipts.py --eml-dir data/source/receipts --out data/raw/receipts.json
```

Parses Epic receipt `.eml` files — title, publisher, price, currency, order ID, order date —
from the HTML-stripped body, which lays out as `Description: / Publisher: / Price:` triplets
under `HERE'S WHAT YOU ORDERED:`.

**🔴 THIS STAGE IS NO LONGER RE-RUNNABLE. The sources are gone — verified 2026-08-23.**
`--eml-dir` used to default to `C:/Users/Sufiyan/AppData/Local/Temp/gid_extract`. That directory
no longer exists, and `find . -iname "*.eml"` returns nothing anywhere in the project. The temp
sweep this document warned about has already happened. The default is now
`data/source/receipts/`, matching the convention `data/source/account{A,B}.transactions.txt`
already sets, so a mailbox re-export lands somewhere durable — but **as of today that directory
does not exist and the stage cannot run.**

**Nothing downstream is lost.** `data/raw/receipts.json` preserves all **14 orders and all 32 line
items**, and it is the only surviving copy. Its value is higher than the order count suggests:
re-measured 2026-08-23, these receipts are the **sole** source of `ownership.purchasePrice`,
populated on exactly **32 of 226 records (14.2%)**, and the correspondence is 1:1 in both
directions — every record citing a `Receipt email` provenance source carries a price, and no
record without one does. Nothing else in the pipeline can supply it.

**The script now refuses to run rather than destroying that artifact.** `Path.glob()` on a missing
directory yields zero matches and raises nothing, so the original code would have globbed zero
files and then overwritten `data/raw/receipts.json` with `[]` — unrecoverably. It now exits
non-zero when `--eml-dir` is absent or empty, leaving the output untouched (verified: md5 unchanged
after a default-args run, still 14 orders / 32 items). All 14 lost filenames, with the order id and
item count each produced, are listed in the script's docstring so a re-export is possible.

The empty `data/source/receipts/` directory is **deliberately not created** — an empty receipts dir
would make the script report "0 orders" as though that were a measurement.

Also emits `receipt_structure.json` and `receipt_crosscheck.json` (14 entries) — the crosscheck
is what lets `build_catalog.py` promote a title to High confidence.

### 3. `match_screenshots.py`

```bash
python tools/match_screenshots.py --raw data/raw --account B --out data/raw/screenshot_resolution.json
```

Also writes `screenshot_resolved_titles.json`. Resolves Epic Games Launcher screenshot labels —
which the launcher clips to fit its grid tiles (`"Tomb Raider I-III Remas…"`) — against the
account's own transaction history. 46 labels in, 46 resolutions out.

The resolution order matters and is deliberate:

1. **Exact normalized match wins outright.** This is not redundant with step 2 — the prefix
   `"Pinball FX"` would otherwise ambiguously match both `"Pinball FX"` and `"Pinball FX Midnight"`.
2. Otherwise, a **unique prefix** match resolves it.
3. Multiple prefix candidates → `AMBIGUOUS`, reported for manual verification.
4. No candidate → `UNMATCHED` (expected for permanently-free titles like Fortnite, which Epic
   grants without generating an order).

**Nothing is guessed.** Ambiguous and unmatched labels are reported, never resolved by picking a
"most likely" candidate. Normalization folds case, unifies quotes and dashes, and drops `®™©`.

### 4. `build_catalog.py`

```bash
python tools/build_catalog.py --raw data/raw --out data/catalogs
```

Deduplicates per account and assigns the confidence level defined in §4. Also classifies each
entitlement.

Classification is **deliberately narrow**: a "Collection" or "Bundle" of full games is still a
game, so those words are *not* demotion signals. Only explicit non-game markers count —
currency/cosmetic packs (`starter pack`, `coins`, `credits`, `skin pack`, …) and DLC markers
(`modding kit`, `season pass`, `expansion pass`, …).

Emits `account{A,B}.catalog.json` plus `account{A,B}.verification.json` — the second is the
audit trail for anything the script would not resolve on its own.

### 5. `enrich.py`

```bash
python tools/enrich.py --catalogs data/catalogs --out data/enriched --cc IN --limit 0
```

Source priority per the brief: **IGDB → Steam → Epic/GOG/publisher.**

- **IGDB is credential-gated.** Set `IGDB_CLIENT_ID` and `IGDB_CLIENT_SECRET` to enable. Without
  them the entire IGDB stage is skipped and every IGDB-only field (`igdbId`, `themes`,
  `franchise`, IGDB artwork) stays `null`. **It is never faked.** This run had no credentials:
  `igdbStatus` is `skipped_no_credentials` on 220 records and `not_attempted` on 6.
- **Steam runs unauthenticated** against the public storefront API:
  `storesearch` → `appdetails` → `appreviews`. `--cc IN` sets the storefront country, which is
  why prices come back in INR.
- Every network response is **cached to `.cache/`** so re-runs cost nothing and the build is
  reproducible offline.

Hard rule restated in this file's own docstring: a field is written **only** if a source
literally returned it. Nothing is inferred from the title string.

### 6. `build_app_data.py`

```bash
python tools/build_app_data.py
```

**Takes no arguments** — `ROOT = Path(__file__).resolve().parent.parent`, so it must be run from
anywhere inside the repo with the tree intact. Merges catalog (ownership + provenance) with
enriched (Steam/IGDB metadata) into the runtime files, enforcing NO MERGING and NO FABRICATION
mechanically.

Emits `data/account{A,B}.json`, `data/genres.json`, `data/config.json`.

> ⚠️ Its docstring also claims it emits `data/analytics/*.json`. **`data/analytics/` does not
> exist.** Either the emit was removed, or it silently no-ops. Low priority — nothing consumes
> it — but the docstring is currently lying. Tracked in `TODO.md`.

### Full re-run

```bash
cd "D:/work/Game ID"
python tools/parse_transactions.py --source data/source --out data/raw
# STAGE 2 CANNOT RUN — the .eml sources are gone (see section 2). It now exits
# non-zero rather than overwriting data/raw/receipts.json with an empty list.
# Skip it and keep the existing receipts.json; re-export the 14 files into
# data/source/receipts/ first if this stage must genuinely be reproduced.
python tools/parse_receipts.py --eml-dir data/source/receipts --out data/raw/receipts.json
python tools/match_screenshots.py --raw data/raw --account B --out data/raw/screenshot_resolution.json
python tools/build_catalog.py --raw data/raw --out data/catalogs
python tools/enrich.py --catalogs data/catalogs --out data/enriched --cc IN --limit 0
python tools/build_app_data.py
```

**`.cache/` must not be cleared casually.** It is what makes stage 5 reproducible offline and
free to re-run. Do not commit it.

---

## 6. Record schema

The runtime file is a dict, not a bare list:

```json
{
  "account": "A",
  "generatedAt": "2026-07-31T14:00:27+00:00",
  "entitlementCount": 51,
  "games": [ … ]
}
```

**`json.load(...)` returns a dict — read `["games"]`.** Iterating the top level yields the four
key strings, which is a silent way to measure nothing.

One record, verbatim from `data/accountA.json` — this is a fully unenriched record, which is
41.6% of the corpus:

```json
{
  "id": "F2601251442041716_rustler_grand_theft_horse_1",
  "title": "Rustler - Grand Theft Horse",
  "rawTitle": "Rustler - Grand Theft Horse",
  "store": "Epic Games Store",
  "classification": "game",
  "cover": "assets/placeholders/cover.svg",
  "background": "assets/placeholders/background.svg",
  "screenshots": [],
  "developer": null,
  "publisher": null,
  "franchise": null,
  "releaseDate": null,
  "genres": [],
  "themes": [],
  "tags": [],
  "platforms": [],
  "summary": null,
  "about": null,
  "ratings": {
    "metacritic": null, "steam": null, "steamReviewCount": null,
    "igdbCritic": null, "igdbUser": null, "opencritic": null
  },
  "pricing": {
    "currency": "INR", "msrp": 899.0, "current": 899.0,
    "discountPercent": null, "historicalLowest": null
  },
  "isFree": false,
  "features": {},
  "steamDeck": null,
  "ownership": {
    "purchaseDate": "Jan 25, 2026",
    "purchasePrice": null,
    "marketplace": "Epic Games Store",
    "transactionId": "F2601251442041716",
    "playtimeSeconds": 0,
    "playtimeRaw": "0"
  },
  "provenance": {
    "confidence": "Medium",
    "sources": ["Transaction history"],
    "issues": [],
    "steamAppId": null,
    "igdbId": null,
    "steamStatus": "not_on_steam",
    "igdbStatus": "skipped_no_credentials"
  }
}
```

**Field paths that bite.** Several fields are one level deeper than their name suggests, and a
wrong path returns `0.0%` rather than an error — the exact shape of a silent measurement failure:

| looks like | actually is |
|---|---|
| `purchaseDate` | `ownership.purchaseDate` |
| `playtime` | `ownership.playtimeSeconds` |
| `purchasePrice` | `ownership.purchasePrice` |
| `steamAppId` | `provenance.steamAppId` |
| `confidence` | `provenance.confidence` |
| `sources` | `provenance.sources` |
| `coverImage` | `cover` |
| `price` | `pricing.current` (a bare number, **not** an object) |

---

## 7. Measured corpus — N = 226

**A = 51, B = 175.** `generatedAt` `2026-07-31T14:00:27+00:00`. Re-measured 2026-08-05.

**✅ Independently re-verified in full on 2026-08-23** — every figure in this section was
re-derived from `data/account{A,B}.json` against the live files, and **all of them matched.** That
includes the totals (226 / 51 / 175), the confidence split (Medium 161 · High 63 · Low 2, zero
missing, no fourth bucket), the 132/94 enrichment cliff, the playtime figures (present on 177,
nonzero on exactly 4, so 222 zero-or-null), all six `steamStatus` buckets, `igdbStatus`, the
Epic-only marketplace, the `INR 222 / USD 4` currency split, the 0% fields
(`tags` · `themes` · `franchise` · `igdbId`), `purchasePrice` on 32, and the six cross-account
duplicate titles. Two figures **this section did not previously carry** were added below: the title
collision analysis, and the `1,299 INR` result.

One caution for whoever re-measures next: `confidence` is **nested at
`provenance.confidence`**, not top-level. A top-level probe returns `MISSING` on all 226 and looks
like a catastrophic schema failure. It is not — it is a selector that reached nothing.

### Fill rates

| Field | n | % |
|---|---:|---:|
| `title` · `rawTitle` · `store` · `classification` · `isFree` | 226 | 100% |
| `ownership.marketplace` · `.purchaseDate` · `.transactionId` | 226 | 100% |
| `provenance.confidence` | 226 | 100% |
| `pricing.current` · `pricing.msrp` | 226 | 100% |
| `cover` · `background` | 226 | 100% |
| `ownership.playtimeSeconds` | 177 | 78.3% |
| `publisher` | 139 | 61.5% |
| **`provenance.steamAppId` · `developer` · `genres` · `summary` · `screenshots` · `platforms` · `features.achievements`** | **132** | **58.4%** |
| `about` | 131 | 58.0% |
| `releaseDate` · `ratings.steam` · `ratings.steamReviewCount` | 128 | 56.6% |
| `pricing.discountPercent` | 64 | 28.3% |
| `ratings.metacritic` | 42 | 18.6% |
| `ownership.purchasePrice` | 32 | 14.2% |
| `provenance.igdbId` · `ratings.opencritic` · `ratings.igdbCritic` · `ratings.igdbUser` · `pricing.historicalLowest` · `tags` · `themes` · `franchise` · `steamDeck` | 0 | 0% |

### The enrichment cliff

**132 records (58.4%) matched a Steam appId and got enriched. The other 94 (41.6%) got nothing.**

Those 94 have no cover (they carry `assets/placeholders/cover.svg`), no genres, no developer, no
summary, no ratings, no platforms, and `features: {}`. **A sparse Game Card is a ~42% case, not
an edge case** — which is the direct reason the design system treats the unenriched state as a
first-class variant and why Confidence Badge exists at all.

### Distributions

```
provenance.confidence   Medium 161 · High 63 · Low 2            (no "none" bucket)
provenance.sources      Transaction history alone          163
                        + Launcher screenshot               31
                        + Receipt email                     20
                        all three                           12
provenance.issues       224 empty · 2 = ("source_reports_no_title",)
provenance.steamStatus  exact 129 · not_on_steam 72 · ambiguous 15
                        not_attempted 6 · prefix 3 · detail_failed 1
provenance.igdbStatus   skipped_no_credentials 220 · not_attempted 6
classification          game 208 · demo 7 · app 5 · subscription 2 · dlc 2 · add-on 2
ownership.marketplace   Epic Games Store 226  (100%)
platforms               windows 132 · mac 39 · linux 19   ← OS support, NOT storefront
cover / background      132 remote Steam akamai URLs · 94 assets/placeholders/*.svg
isFree                  false 158 · true 68
pricing.currency        INR 222 · USD 4
duplicate titles across A and B: 6
```

### 🔴 The title is not a unique identifier — measured 2026-08-23

**226 records carry only 218 distinct title strings**, and the collisions are of three different
kinds. This matters because Game Card / Row's shipped rationale states *"the title is the
identifier"*, and P6 will build lists keyed on it.

**The arithmetic, because a first pass of this section got it wrong.** Eight titles each appear
twice, so they account for eight surplus rows: 226 − 8 = **218**. An earlier revision published
**224**, which is a real figure measuring something else entirely — the number of rows whose title
is not the `Needs Manual Verification` placeholder (226 − 2). Two nearby quantities, one of them
plausible-looking, and the wrong one was published. **Distinct-strings, rows-with-a-real-title and
distinct-real-titles are three different numbers: 218, 224 and 217.**

| kind | n | detail |
|---|---:|---|
| **Cross-account** — same game owned on both accounts | **6** | Fall Guys · HITMAN WOA Free Demo ft. Eminem vs. Slim Shady · Hogwarts Legacy · Idle Champions of the Forgotten Realms · VALORANT · World of Warships. **Must appear twice** — the accounts are never merged. |
| **Intra-account** — same title twice *inside one account* | **1 pair** | `Discord Nitro` × 2 in account **A**, two separate entitlements with distinct transaction ids. Deduping by title *within* a single list would silently destroy one. |
| **Placeholder collision** — two different games, identical string | **1 pair** | Two records in account **B** both render the literal `Needs Manual Verification`. These are **not** the same game; the string is what the NO FABRICATION rule writes when no source verified a title. |

**Consequences for the design, not just the data:**

- **Key rows on `id`, never on `title`.** `id` is **verified globally unique — 226 distinct of 226,
  zero nulls, zero overlap between accounts** — and is formed `<transactionId>_<slug>_<n>`. It is
  the only safe key.
- **Two rows reading `Needs Manual Verification` side by side is a correct render, not a bug.**
  A reviewer will read it as duplication; it is two genuinely unidentified titles. Both come from
  the *same* order `F2403301554153074`, distinguished only by the trailing item index
  (`…_needs_manual_verification_1` and `…_2`) — two line items, two entitlements.
- **Never dedupe by title anywhere**, not even within one account. The `Discord Nitro` pair carries
  two *different* transaction ids a year apart (`F2412111815280195`, `F2512172110114389`), so it is
  two real purchases, not a duplicated record.

**⚠ A related figure in the Figma file does not reconcile and could not be checked.** `HANDOFF.md`
§8 and `TODO.md` B1 both record Data & Provenance `10:10` (`27:372` / `27:378`) as ruling out a bare
"226 games" on the grounds that *"226 is ledger rows, 220 is unique titles and 208 is actual
games"*. Two of those three are confirmed here: **226 rows** ✅ and **208 with
`classification: "game"`** ✅ — the other 18 are 7 demos, 5 apps, 2 DLC, 2 add-ons and 2
subscriptions. **`220` matches nothing measurable in the corpus:** distinct title strings is 218,
distinct real titles 217, rows with a real title 224. It may predate a corpus change or use a
definition nobody wrote down. **Re-read `27:372` when the Figma MCP is available and either source
the 220 or correct it** — the *rule* it supports is sound regardless, and the rule is what matters.
Filed against `TODO.md` B1's label confirmation, since that is where the sentence is quoted.

**A naive first count of this returned 8 and looked like it contradicted the documented 6.** It did
not: a global title counter sweeps in the intra-account pair and the placeholder pair, neither of
which is a cross-account duplicate. The documented **6 is correct**. Recurring shape #16 — when an
audit says the document is wrong, suspect the audit.

### Playtime

`ownership.playtimeSeconds` is present on 177 records (78.3%) and **nonzero on exactly four**:

```
208,707 s = 57.97 h
  1,707 s =  0.47 h
    123 s =  0.03 h
     59 s =  0.02 h
```

**222 of 226 (98.2%) are zero or null.** Playtime can never be a default sort, a headline
metric, or a column. A column that is empty 98% of the time is not a column.

### Money

`pricing.current` is populated on all 226 but **nonzero on 84**. Currency is mixed — INR 222,
USD 4 — so a raw sum across records is not a valid total without normalization. The two sums,
kept separate: **INR 85,440.57** and **USD 66.98**.

Per `data/config.json`, `pricing.current` is the primary monetary metric (labelled
*"Current store value"*) and `ownership.purchasePrice` is the low-prominence one with the note
*"Purchase price is ownership metadata and must render de-emphasised."* — but purchasePrice
exists on only 32 records (14.2%).

**`1,299 INR` is not a corpus value — measured 2026-08-23.** `pricing.msrp` is populated on
**226 of 226** records, so this was fully checkable, and `1299` occurs **zero times**. The 51
distinct MSRP values include `1149.0`, `1300.0` and `1350.0` but never `1299.0`; `pricing.current`
and `ownership.purchasePrice` were checked too, same result. The figure appears on three Figma text
nodes (`17:21`, `17:13`, `16:108`) and is therefore a fabrication of the same class as `20,400` and
`1,247` — landing within one rupee of the real `1300.0`, which is exactly what makes it read as
measured. `TODO.md` **B14**; the text edit is blocked on Figma access.

---

## 8. What the data forbids

These are settled and appear in `CLAUDE.md` as design constraints. They are restated here with
their measurements so the reasoning survives independently of the design file.

| Constraint | Measurement |
|---|---|
| **There is no completion field.** Never design one. | Absent from the schema entirely. `features.achievements` is a **capability boolean** (present on 132), not earned progress — achievement counts do not exist. |
| **Playtime is never a default sort or a headline metric.** | 98.2% zero/null. |
| **The multi-store design must be data-driven, not a redesign.** | 226/226 Epic Games Store. Thirteen store marks exist so that adding a second store is a *data* change. A "which storefront owns the most" chart has exactly one bar today. |
| **Collections have no backing data.** | `tags`, `themes`, `franchise`, `steamDeck` are 0% across all 226. |
| **The sparse card is the normal card.** | 41.6% unenriched. |
| **`platforms` is OS support, not storefront.** | windows 132 / mac 39 / linux 19 — these are Steam's OS flags. |
| **Any total must be account-scoped.** | NO MERGING; 6 titles owned on both accounts. |
| **Confidence is a real signal worth surfacing.** | Present on 100%, three-way split, and it is genuine *ownership intelligence* — the product category. |

---

## 9. Open items

**Both were closed 2026-08-23.** Neither ever blocked the design system, and neither does now.

1. **~~`data/analytics/` is promised but absent~~ ✅ CLOSED — the docstring was simply false.**
   `grep -n analytics tools/build_app_data.py` returns **only the docstring line**: there is no
   emit code path anywhere in the file, so the output was never removed and never silently
   no-opped. Fixed by correcting the docstring, not by restoring an emit nothing consumes — at 226
   records, precomputing analytics buys nothing. The script's real outputs are
   `data/account{A,B}.json`, `data/genres.json` and `data/config.json`, and all three exist.
2. **~~Receipt `.eml` sources live in a Windows temp directory~~ ✅ CLOSED — 🔴 the sweep already
   happened and the sources are lost.** `…/Temp/gid_extract` no longer exists and no `.eml` survives
   anywhere in the project, so **stage 2 is no longer re-runnable** and the recommended fix (move
   them into `data/source/receipts/`) was never executable. `data/raw/receipts.json` — 14 orders, 32
   line items — is the only surviving copy, and it is the **sole** source of
   `ownership.purchasePrice` (32 of 226, 14.2%, 1:1 with the `Receipt email` provenance source).
   The investigation also caught a live **data-destruction bug**: `Path.glob()` on a missing
   directory returns zero matches silently, so running the script would have overwritten that
   artifact with `[]`. It now refuses to run when `--eml-dir` is missing or empty, the default
   points at `data/source/receipts/`, and all 14 lost filenames are recorded in its docstring.
   Full detail in section 2 and in `TODO.md` C2.

Not defects, recorded so they are not mistaken for gaps:

- **IGDB, OpenCritic, IsThereAnyDeal and HowLongToBeat are all unconfigured**, and
  `data/config.json` records this explicitly under `unavailableSources`. Every field they would
  have supplied is `null` rather than estimated. This is the NO FABRICATION rule working, not a
  failure.
- **72 records are `not_on_steam`.** Epic-exclusive and Epic-giveaway titles genuinely are not on
  Steam. Enrichment cannot reach them by any amount of retrying.
- **15 `ambiguous` + 3 `prefix` Steam matches** were left unresolved rather than guessed.

---

## 10. Repository layout (data side)

```
tools/
  parse_transactions.py   parse_receipts.py    match_screenshots.py
  build_catalog.py        enrich.py            build_app_data.py

data/
  source/       accountA.transactions.txt  accountB.transactions.txt
  raw/          accountA.raw.json (51)     accountB.raw.json (175)
                receipts.json (14)         receipt_structure.json
                receipt_crosscheck.json (14)
                screenshot_titles.json (46)          screenshot_resolution.json (46)
                screenshot_resolved_titles.json
  catalogs/     account{A,B}.catalog.json  account{A,B}.verification.json
  enriched/     account{A,B}.enriched.json
  accountA.json (51)   accountB.json (175)   config.json   genres.json

.cache/         steam_applist.json  steam_search/  steam_detail/  steam_reviews/
                figma_mcp_probe.py
                ↑ do not commit, do not clear casually

assets/placeholders/   cover.svg  background.svg
app/                   LEGACY static frontend — GATED, see HANDOFF.md §3
```

### `data/config.json`

```
app.name              "Game Library"
app.defaultAccount    "B"
app.defaultView       "grid"
app.defaultSort       "title-asc"
accounts              A = 51, B = 175
assets.priority       [IGDB, Official store artwork, Steam capsule, Local placeholder]
monetary.primaryMetric        "pricing.current"        label "Current store value"
monetary.lowProminenceMetric  "ownership.purchasePrice"
                              note "Purchase price is ownership metadata and must render de-emphasised."
unavailableSources    igdb · opencritic · isthereanydeal · howlongtobeat  (all unconfigured)
```

---

## 11. Measuring the corpus yourself

Do this rather than trusting any figure in this file, in `CLAUDE.md`, or in memory. The field
paths in §6 are the part that goes wrong.

```bash
cd "D:/work/Game ID" && python -c "
import json, collections
recs = []
for a in ['A','B']:
    recs += json.load(open('data/account%s.json' % a, encoding='utf-8'))['games']
def g(r, p):
    c = r
    for k in p.split('.'):
        if not isinstance(c, dict): return None
        c = c.get(k)
    return c
print('N =', len(recs))
for f in ['provenance.steamAppId','ownership.purchasePrice','ownership.playtimeSeconds']:
    n = sum(1 for r in recs if g(r, f) not in (None, '', [], {}))
    print('%-32s %3d %5.1f%%' % (f, n, 100 * n / len(recs)))
print(collections.Counter(g(r, 'provenance.confidence') for r in recs))
"
```
