# Game ID

A **game ownership intelligence dashboard** — a desktop application for cataloguing, browsing, and understanding a personal game library. The project is in active design-system development in Figma; no application code has been written yet.

## What it does

Game ID reads your purchase history from the Epic Games Store, enriches each record with metadata from Steam and IGDB, and surfaces the result as a browsable, filterable, searchable library view. It is not a launcher — it is a read-only intelligence layer on top of ownership data you already have.

## Data pipeline

The `tools/` chain extracts and enriches the corpus from raw source files:

| Step | Script | Input | Output |
|---|---|---|---|
| 1. Parse | `tools/parse_transactions.py` | Epic transaction history exports | Structured records with title, date, price, order IDs |
| 2. Match | `tools/match_screenshots.py` | Launcher screenshots | Title resolution for records missing clean strings |
| 3. Enrich | `tools/enrich.py` | Raw records + Steam/IGDB APIs | Metadata: genres, release date, playtime, reviews, confidence score |
| 4. Catalog | `tools/build_catalog.py` | Per-account enriched data | Deduplicated catalogs, one per account |

**Two hard rules govern the pipeline:**

- **No fabrication** — a field is written only if a source literally returned it. Unverified fields stay `null`, never backfilled with guesses.
- **No merging** — each account is built independently. A combined total would double-count the 6 titles owned on both accounts.

## Corpus facts

These are measured from the live data, not estimated:

| Metric | Value |
|---|---|
| Total records | **226** |
| Accounts | **2** (51 + 175, 6 shared titles) |
| Connected stores | Epic Games Store only (100%) |
| Enriched | **132 of 226** (58.4%) |
| Unenriched | **94 of 226** |
| Records with playtime | **4 of 226** (173 explicit 0, 49 null) |
| Confidence: High / Medium / Low | **63 / 161 / 2** |

**Key design implications:** playtime can never be a default sort (98% are zero or unmeasured), title is not a unique identifier (218 distinct strings across 226 rows), and there is no completion field in the schema.

## Project structure

```
Game ID/
├── data/
│   ├── source/              # Raw Epic transaction exports
│   ├── raw/                 # Parsed records, screenshots, cross-checks
│   ├── catalogs/            # Final per-account catalogs + verification
│   └── analytics/           # Aggregated corpus statistics
├── tools/                   # Python pipeline scripts
├── .cache/                  # Cached API responses (Steam search/detail/reviews)
├── CLAUDE.md                # Design system build notes (Figma)
├── HANDOFF.md               # Session handoff entry point
├── TODO.md                  # Prioritised backlog and open defects
├── WORKFLOW_CONTEXT.md      # Design rationale and conventions
├── DATA_PIPELINE.md         # Corpus measurements and data architecture
└── CHANGELOG.md             # Session-by-session build log
```

## Design system

The frontend design system is being built in a Figma file using **Microsoft Fluent 2** (dark mode primary, light fully supported), **Inter** typeface, and a custom icon set drawn as vectors in-file. It is not a web or desktop application yet — the implementation is gated until the design is explicitly approved.

The design system covers:

- **Tokens**: 215 variables across 7 collections (Primitives, Color, Spacing, Dimension, Type Primitives, Type, Motion)
- **Components**: 33 component sets covering buttons, form controls, cards, navigation, pagination, modals, menus, charts, avatars, badges, skeleton loaders, and more
- **Wireframes**: 7 screens (Library, Collections, Stores, Accounts, Analytics, Search, Settings) with a full annotation layer
- **Page templates**: in progress (P5)

No application code has been written. The design phase covers Phases 1–8; P5 (page templates) is the current active step.

## Getting started

### Data pipeline

```bash
# Parse Epic transaction exports into structured records
python tools/parse_transactions.py

# Enrich records with Steam / IGDB metadata (requires network)
python tools/enrich.py

# Build per-account deduplicated catalogs
python tools/build_catalog.py
```

Set `IGDB_CLIENT_ID` and `IGDB_CLIENT_SECRET` environment variables to enable IGDB enrichment. Without them, the IGDB stage is skipped and IGDB-only fields stay `null`.

## Design system build

The design system is constructed directly in Figma using the `figma-generate-library` and `figma-use` skills. See `HANDOFF.md` for the current step and `CLAUDE.md` for the full token catalogue, component inventory, and API knowledge accumulated during the build.

## Documentation

| File | Owns |
|---|---|
| `CLAUDE.md` | Constraints, token values, node IDs, API knowledge |
| `HANDOFF.md` | Zero-context entry point — current state and next steps |
| `TODO.md` | Ranked backlog and open defects |
| `WORKFLOW_CONTEXT.md` | Design rationale, derivations, conventions |
| `DATA_PIPELINE.md` | Pipeline architecture and corpus measurements |
| `CHANGELOG.md` | Session-by-session build record |
