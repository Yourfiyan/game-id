# Game ID

A **game ownership intelligence dashboard** — a web application and data pipeline for cataloguing, browsing, analyzing, and understanding a personal game library across multiple accounts and stores.

## What it does

Game ID reads your ownership and transaction history from the Epic Games Store, enriches each record with metadata from Steam and IGDB, and surfaces the result as a rich, browsable, filterable, and searchable library view with deep analytics. It is not a launcher — it is a read-only intelligence layer on top of ownership data you already have.

- **Interactive Web Dashboard**: Browse library games with cover art, status tags, genre badges, playtime, reviews, and detailed metadata.
- **Client-Side Sync & Extraction**: Import official Epic Games account data exports (`.zip` or `.pdf`) directly in the browser with 100% local processing and zero server uploads.
- **Multi-Account Support**: Switch seamlessly between accounts without merging or double-counting overlapping titles.
- **Analytics & Intelligence**: Breakdown of library value, genres, platform support, store distribution, and acquisition timelines.
- **Fluent 2 Design System**: Precision-crafted UI supporting both Dark and Light themes.

---

## How to Export & Sync Your Epic Games Account Data

Game ID includes a built-in client-side sync engine that extracts your entire library, connected accounts, and profile data directly from your official Epic Games data export.

### Phase 1: Request & Download Your Epic Games Data

Follow these steps to request your GDPR / account data export from Epic Games:

#### Step 1: Open Epic Games Store & Sign In
Go to [store.epicgames.com](https://store.epicgames.com), sign in to your Epic Games account, and click on your profile name / avatar in the top-right corner of the navigation bar.

![Step 1: Epic Games Store profile](docs/images/01-epic-store-profile.png)

#### Step 2: Open Account Settings
In the user dropdown menu, click **Account** to open your account management portal.

![Step 2: Select Account](docs/images/02-epic-menu-account.png)

#### Step 3: Scroll Down in Account Settings
On the **Settings** page (`Account -> Settings`), scroll down past the Account Information and Personal Details sections.

![Step 3: Scroll down in Settings](docs/images/03-epic-settings-scroll.png)

#### Step 4: Request Account Data
Under the **Download account data** section, click the blue **Request Data** button. Epic Games will prepare your account data package and send you an email when it is ready.

![Step 4: Click Request Data](docs/images/04-epic-request-data.png)

#### Step 5: Download the Data Export from Your Email
Check your email inbox for a message from Epic Games titled **"Your Data is ready"**. Open the email and click the blue **Get my PDF** button (or download the full `EpicGamesAccountData.zip` archive if provided).

![Step 5: Get my PDF from email](docs/images/05-epic-email-download-pdf.png)

---

### Phase 2: Import & Sync with Game ID

Once you have your export file (`.zip` or `.pdf`), you can import it into Game ID:

#### Step 6: Click "Sync now" in Game ID
Open the Game ID dashboard (e.g., `http://localhost:8766/app/`), navigate to **Settings** or look at the top header, and click the **Sync now** button.

![Step 6: Click Sync now](docs/images/06-gameid-sync-now.png)

#### Step 7: Drag and Drop Your Export File
In the **Sync Account Data** modal, drag and drop your downloaded `EpicGamesAccountData.zip` or PDF export into the drop zone (or click to browse and select the file from your computer).

![Step 7: Dropzone modal](docs/images/07-gameid-sync-modal-dropzone.png)

> **🔒 Privacy First:** All file parsing and data extraction happen **100% locally inside your browser** using client-side WebAssembly and JS workers (`pdf.js` & `jszip`). No personal data or credentials are ever uploaded to any server.

#### Step 8: Review Extracted Data & Apply to Library
Game ID parses your account metadata (Display Name, Account ID, country), connected external authentications (Steam, PlayStation, Xbox, Twitch, Nintendo, etc.), and all consented game entitlements. Review the extracted games list and click **Apply to Library** to update your dashboard.

![Step 8: Extracted data and Apply to Library](docs/images/08-gameid-sync-apply-library.png)

---

## Running the Web Application

Game ID runs directly in your browser with zero backend build steps required:

```bash
# Serve the repository root
python -m http.server 8766

# Open the app in your browser:
# http://localhost:8766/app/
```

### Available Pages

| Page | URL Route | Description |
|---|---|---|
| **Home** | `#/` | Overview dashboard with featured highlights, quick stats, and recent additions |
| **Library** | `#/library` | Grid and list views with filtering by store, status, tag, and search |
| **Collections** | `#/collections` | Custom user-curated game collections and categories |
| **Stores** | `#/stores` | Storefront breakdown and connected platform metrics |
| **Accounts** | `#/accounts` | Per-account profile cards, linked external authentications, and entitlement logs |
| **Analytics** | `#/analytics` | Detailed charts: library valuation, genre distribution, platform readiness |
| **Search** | `#/search` | Fast multi-field search across titles, developers, publishers, and tags |
| **Settings** | `#/settings` | Theme switching (Dark/Light), default account selection, page size, data refresh & sync |

---

## Data pipeline (CLI Tools)

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

### Running the pipeline

```bash
# Parse Epic transaction exports into structured records
python tools/parse_transactions.py

# Enrich records with Steam / IGDB metadata (requires network)
python tools/enrich.py

# Build per-account deduplicated catalogs
python tools/build_catalog.py
```

Set `IGDB_CLIENT_ID` and `IGDB_CLIENT_SECRET` environment variables to enable IGDB enrichment. Without them, the IGDB stage is skipped and IGDB-only fields stay `null`.

---

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

---

## Project structure

```
Game ID/
├── app/                     # Web application
│   ├── index.html           # Main entry point and shell
│   ├── app.js               # Router, navigation, and state controller
│   ├── theme.css            # Fluent 2 design tokens and CSS variables
│   ├── components/          # Reusable UI components (e.g. Sync Modal)
│   ├── pages/               # Page controllers and modular stylesheets
│   ├── services/            # Client-side extractor, filters, loader, analytics
│   └── vendor/              # Local vendor libraries (PDF.js, JSZip)
├── data/
│   ├── source/              # Raw Epic transaction exports
│   ├── raw/                 # Parsed records, screenshots, cross-checks
│   ├── catalogs/            # Final per-account catalogs + verification
│   └── analytics/           # Aggregated corpus statistics
├── docs/
│   └── images/              # Step-by-step screenshots for export & sync guides
├── tools/                   # Python pipeline scripts
├── .cache/                  # Cached API responses (Steam search/detail/reviews)
├── CLAUDE.md                # Design system build notes (Figma)
├── HANDOFF.md               # Session handoff entry point
├── TODO.md                  # Prioritised backlog and open defects
├── WORKFLOW_CONTEXT.md      # Design rationale and conventions
├── DATA_PIPELINE.md         # Corpus measurements and data architecture
└── CHANGELOG.md             # Session-by-session build log
```

---

## Design system

The frontend design system is built using **Microsoft Fluent 2** (dark mode primary, light fully supported), **Inter** typeface, and a custom icon set.

The design system covers:

- **Tokens**: 215 variables across 7 collections (Primitives, Color, Spacing, Dimension, Type Primitives, Type, Motion)
- **Components**: 33 component sets covering buttons, form controls, cards, navigation, pagination, modals, menus, charts, avatars, badges, skeleton loaders, and more
- **Wireframes**: 7 screens (Library, Collections, Stores, Accounts, Analytics, Search, Settings) with a full annotation layer
- **Page templates**: Responsive and scalable desktop layouts

---

## Documentation

| File | Owns |
|---|---|
| `CLAUDE.md` | Constraints, token values, node IDs, API knowledge |
| `HANDOFF.md` | Zero-context entry point — current state and next steps |
| `TODO.md` | Ranked backlog and open defects |
| `WORKFLOW_CONTEXT.md` | Design rationale, derivations, conventions |
| `DATA_PIPELINE.md` | Pipeline architecture and corpus measurements |
| `CHANGELOG.md` | Session-by-session build record |
