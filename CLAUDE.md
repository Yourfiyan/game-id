# Game ID — Design System Build

Handoff notes. Everything needed to resume this project in a fresh session.

## What this is

A production-grade design system for **Game ID**, a desktop *game ownership intelligence*
dashboard. All work lives in one Figma file. No application code has been written yet — see
the implementation gate below.

Workflow followed: the `figma-generate-library` + `figma-use` skills. **Both skill names must
be passed in `skillNames` on every `use_figma` call** (`"figma-use,figma-generate-library"`).

### The document set — read `HANDOFF.md` first

This file is one of six. It is auto-loaded, which is why the pointer lives here, but it is **not**
the entry point. Authority order, highest first:

| # | File | Owns |
|---|---|---|
| 0 | **the Figma file** | everything. If a document and the file disagree, the file wins. |
| 1 | `CLAUDE.md` (this file) | constraints, token values, node ids, the page map, API knowledge, closeout records |
| 2 | `HANDOFF.md` | **the zero-context entry point** — current state and the exact next steps |
| 3 | `TODO.md` | the ranked backlog and every open defect, with node ids |
| 4 | `WORKFLOW_CONTEXT.md` | design rationale, derivations, build conventions, quirk tables |
| 5 | `CHANGELOG.md` | the dated session-by-session record |
|   | `DATA_PIPELINE.md` | the `tools/` chain, the `data/` tree, and every measured corpus figure |

`WORKFLOW_CONTEXT.md` deliberately holds **no counts, ids or state** — it went four days stale
because it and this file both owned mutable state. Anything countable belongs here.

## Governing constraints

These have held across the whole build. Do not relitigate them.

- **Implementation gate.** No HTML, CSS, JavaScript, React or Vue for Game ID until the design
  is explicitly approved by the user.
- **Figma is the source of truth.** If code and the file disagree, the file wins.
- **Never invent a token.** A value gets a named, scoped token in Figma first, then is consumed.
  A raw number in a component is a defect.
- **Refine, do not reinvent.** Layout is settled architecture. Later passes adjust spacing,
  wording and states — not navigation, card sizes, or working components.
- **The data decides the hierarchy.** A field present on ~5% of rows never drives a sort, a
  chart, or a headline.
- Design language **Microsoft Fluent 2**. Dark mode primary, Light fully supported.
- 1920×1080 primary target, 1440 minimum. Page content max width 1560.
- **Inter only** — no Segoe UI.
- **No Fluent or third-party icon library.** Icons are drawn as vectors in-file.

Session guidance that was in force: do not call the Agent tool and do not use Workflow /
deep-research unless the user asks. This was kept even when an ultracode notice said otherwise,
because skill rule 13 requires Figma mutations to be strictly sequential — a fan-out workflow
would violate the thing it was meant to serve.

## The file

- **fileKey** `00QEeirxnqT4Zg829aeDVZ`
- **RUN_ID** `gameid-ds-2026-07-31`
- Every created scene node is tagged:
  `node.setSharedPluginData('dsb', 'run_id' | 'phase' | 'key', value)`.
  `getPluginData` / `setPluginData` are **not supported** — shared plugin data only.
- No on-disk state ledger was ever written. State is reconstructed each session by a read-only
  Figma audit, which has worked reliably. This file replaces that ledger.

## Data reality — this drives every design decision

Percentages below are measured. **Absolute record counts were re-measured live 2026-08-05 and the
figure this file used to assert was wrong — see the warning at the end of this section.**

- **Epic Games is the only connected store today**, 100% of records. Thirteen store marks exist
  so that adding a second store is a *data* change, not a design change.
- **~42% of records are unenriched** (measured: 94 of 226, 41.6%). This is why Confidence Badge
  exists and why a confidence filter is a normal part of the filter bar rather than an advanced
  option.
- **222 of 226 records have zero *or unknown* playtime — nonzero on exactly 4.** Re-measured
  2026-08-23: **173 explicit `0`, 49 `null`, 4 nonzero** (`123`, `1707`, `59`, `208707` seconds).
  The 49 nulls are records no source could measure; per the pipeline's NO FABRICATION rule they are
  **never backfilled to 0**, so "98% zero" is the wrong phrasing — say **zero or null**. Either way
  playtime can never be a default sort or a headline metric, and any UI reading it must render
  "unknown" distinctly from "0 hours".
- **There is no completion field.** Never design one.
- **Confidence is present on 100% of rows** — Medium 161 · High 63 · Low 2. **There is no "none"
  bucket in the schema.** Never design a fourth confidence state. (Metric Card shipped one; fixed
  2026-08-22, `TODO.md` B1 ✅ — the bucket was **deleted, not zeroed**.) Note the field is nested at
  `provenance.confidence`, not top level: a top-level probe returns `MISSING` on all 226 rows and
  looks like a schema failure when nothing is wrong.
- **The two accounts are never merged into one list.** A 51 records, B 175. Six titles are owned
  on both accounts and must appear twice.
- **🔴 `title` is NOT a unique identifier — measured 2026-08-23.** 226 records resolve to only **218
  distinct title strings** (eight titles each appear twice: 226 − 8), and the collisions come in three
  different kinds:

  | kind | pairs | example |
  |---|---|---|
  | cross-account — same game owned twice | 6 | the six titles above |
  | intra-account duplicate purchase | 1 | `Discord Nitro` twice in account A |
  | placeholder collision | 1 | two rows both reading `Needs Manual Verification` |

  **Key every row on `id`, never on `title`.** `id` is verified safe: **226 distinct of 226, zero
  nulls, zero cross-account overlap**, formed `<transactionId>_<slug>_<n>`. Consequences that touch
  the design directly: Game Card / Row's shipped rationale says "the title is the identifier", which
  is true *for the reader* and false *for the data layer* — two `Needs Manual Verification` rows side
  by side is a **correct** render (both from order `F2403301554153074`, items `_1` and `_2`), and the
  `Discord Nitro` pair carries two different transaction ids (`F2412111815280195`,
  `F2512172110114389`). **Never dedupe by title.** Full measurement in `DATA_PIPELINE.md` §7.

  **This bullet said `224` for a few hours on the day it was written**, which is a real measurement of
  a *different* question — rows whose title is not the placeholder. Three adjacent quantities:
  distinct strings **218**, rows with a real title **224**, distinct real titles **217**. Freshly
  measured is not the same as measured for the question being asked. **And `220` — quoted from Data &
  Provenance `27:372` as "unique titles" — reconciles with none of the three**; `226` and `208`
  (`classification: "game"`) both reconcile exactly. Re-read `27:372` when Figma is reachable.

  A naive one-pass count returns **8** shared titles and appears to contradict the documented 6 —
  the documented figure is right and counts only the *cross-account* kind. Recurring shape #16.

**⚠ The library size WAS unsettled, and this file caused it. DECIDED 2026-08-09.** `~20,400`
originated as prose here and was never measured; it then propagated into the shipped doc pages
listed below, where it is load-bearing — Pagination's seven-slot fixed run and
no-page-size-below-50 rule are both argued from "20,400 at 50 is 408 pages". The measured corpus is
**226 records**, which is what the Data & Provenance page `10:10` correctly carries. Metric Card
shipped a third figure, 1,247, which was fabricated — **fixed 2026-08-22**.

**User decision 2026-08-09 (`TODO.md` B2): use 226 everywhere. `20,400` is retired entirely** — not
relabelled as illustrative, not kept for scale-behaviour copy. Do not cite it anywhere. Real
measured figures live in `DATA_PIPELINE.md` §7.

**Two consequences, neither of them a copy edit:**

- **`TODO.md` B10 — Pagination's rationale was orphaned. Route 1 approved 2026-08-22 by the user:
  keep the component, rewrite the rationale. Pagination was NOT re-scoped.** 226 removes the premise
  the seven-slot run and the 50-minimum page size were *argued from* (226 at 50 is 5 pages, so
  ellipses never render). The component is still right — a run that never reflows under the pointer is
  defensible at any size — but the stated reason was not. **✅ Re-derived, not recaptioned, on doc
  `395:85` and on W5's caption `499:986`** — the run is *sized for the library to grow into* and the
  ellipsis is *dormant, not wrong*. The full argument is in the ⚠ block of the Pagination close-out.
- **`TODO.md` B1 — ✅ closed 2026-08-22.** "Games owned" reads **226**, the breakdown is
  **63 high · 161 medium · 2 low** with the fourth "none" bucket **deleted, not zeroed**, and
  enrichment reads **132 of 226**. Fixed on the rendered-text layer *and* the property layer.

**✅ The count is eight, resolved 2026-08-22 — the "seven shipped doc pages" phrasing was the error,
not the id list.** A literal scan of all 44 pages for `20,400` / `20400` hit **nine** pages; excluding
the wireframes page `10:32` (a P4 defect, since fixed) that is exactly the eight ids this list has
always carried — `191:45`, `292:2`, `304:2`, `333:1645`, `373:37`, `395:85`, `274:2`, `419:34`. Say
**eight**.

**And the sweep was a component-layer fix, not eight pages of copy edits — ✅ RAN 2026-08-22.**
Most hits were not page text at all; they were **Count Badge instances nested inside component
variants**, which every consumer then inherits:

- Section Header set `286:82` — `I286:6;55:54`, `I286:13;55:54`, `I286:30;55:54`
- Nav Item set `301:44` — `I301:6;55:56` … `I301:25;55:56`

Top Bar, Modal and the wireframes inherit from those two, so **the components were fixed first, then
the file re-scanned, then residual overrides cleaned** — editing the doc pages first would have left
the source producing the retired figure into every future instance. Outcome: **26 text nodes
corrected in three shapes at five source components**, final file-wide sweep **`bareCount 0`**.
Recorded in `HANDOFF.md` §8 item 2 and `TODO.md` B2. **Nothing here is outstanding** — the
imperative phrasing above is kept because it is the correct method to reuse, not because work
remains.

## Variables

Seven collections, **215 variables. Counts re-audited live 2026-08-05 — the numbers below are
current.** They have drifted six times during the build; the rule now is that any collection change
implies a Cover rewrite in the same session, and **two Cover nodes carry counts, not one** —
`35:17` (Color) and `35:21` (Motion). Both were rewritten 2026-08-05.

Loading & Skeleton added three: **`alpha/black-12`** (Primitives 54 → **55**), **`bg/skeleton`**
(Color 58 → **59**) and **`duration/pulse`** (Motion 10 → **11**).

| Collection | Vars | Modes |
|---|---|---|
| Primitives | 55 | Value |
| Color | 59 | Dark, Light |
| Spacing | 13 | Value |
| Dimension | 26 | Value |
| Type Primitives | 22 | Value |
| Type | 29 | Value |
| Motion | 11 | Value |

**The Motion collection's code syntax does not follow the Color scheme.** For Motion, **ANDROID and
iOS are identical** — `duration/slower` is `tSlower` on both, `easing/standard` is `easeStandard` on
both, and `duration/pulse` is `tPulse` on both. Only WEB differs (`var(--t-pulse)`). Derived from
the collection's own majority, not assumed. Do not "correct" Motion onto Color's rules, where
ANDROID camels across `/` and iOS does not.

Rules: primitives have `scopes = []` (hidden from the picker — this is deliberate, not a bug).
Semantics carry real scopes (`FRAME_FILL`/`SHAPE_FILL`, `TEXT_FILL`, `STROKE_COLOR`, `GAP`,
`CORNER_RADIUS`). Every variable has code syntax: WEB `var(--token-name)`, ANDROID
`colorCamelCase`, iOS `Color.camelCase`.

### Semantic colour ladder (measured, both modes)

Contrast is against canvas / layer / subtle. Everything listed clears 4.5:1 as text unless noted.

| Token | Dark | Light |
|---|---|---|
| bg/canvas | `#141414` | `#f0f0f0` |
| bg/layer | `#1f1f1f` | `#ffffff` |
| bg/subtle | `#292929` | `#e6e6e6` |
| bg/layer-hover | `#292929` | `#fafafa` |
| bg/layer-selected | `#333333` | `#d6d6d6` |
| bg/disabled | `#242424` | `#f0f0f0` |
| bg/media | `#767676` 4.06/3.63/3.20 | `#767676` 3.99/4.54/3.64 |
| bg/chip | `alpha/white-08` (8% white) | `alpha/black-06` (6% black) — plate 1.23–1.28 Dark, 1.14 Light |
| bg/nav-hover | `alpha/white-08` | `alpha/black-06` — 1.21 Dark / 1.14 Light on `bg/nav` |
| bg/overlay-hover | `alpha/white-08` | `alpha/black-06` — 1.28 Dark / 1.14 Light on `bg/overlay` |
| bg/skeleton | `alpha/white-12` | `alpha/black-12` — 1.40–1.46 Dark / 1.31–1.32 Light, host-independent |
| fg/primary | `#ffffff` 18.42/16.48/14.55 | `#1f1f1f` 14.46/16.48/13.21 |
| fg/secondary | `#d6d6d6` 12.68/11.34/10.01 | `#424242` 8.82/10.05/8.05 |
| fg/tertiary | `#adadad` 8.21/7.34/6.48 | `#5c5c5c` 5.87/6.69/5.36 |
| fg/quaternary | `#949494` 6.07/5.43/4.80 | `#666666` 5.04/5.74/4.60 |
| fg/disabled | `#5c5c5c` 2.76/2.46/2.18 | `#adadad` 1.97/2.24/1.80 — **fails AA by design** |
| brand/rest | `#115ea3` | `#0f6cbd` |
| brand/hover | `#0f6cbd` | `#115ea3` |
| brand/pressed | `#0f548c` | `#0f548c` |
| brand/selected | `#77b7f7` | `#115ea3` |
| stroke/divider | `alpha/white-06` (6% white) | `alpha/black-06` (6% black) |
| stroke/subtle | `alpha/white-08` | `alpha/black-08` (8% black) |
| stroke/default | `#424242` | `#d6d6d6` |
| stroke/strong | `#666666` | `#767676` |
| stroke/control | `#767676` 4.06/3.63/3.20 | `#767676` 3.99/4.54/3.64 |
| stroke/focus-outer | `#ffffff` | `#1f1f1f` |
| stroke/focus-inner | `#141414` | `#ffffff` |
| status/success-fg | `#5ec75e` | `#107c10` |
| status/caution-fg | `#f2c661` | `#835b00` |
| status/danger-fg | `#e37d80` | `#d13438` |
| status/danger-fg-strong | `#efa3a6` (`red/140`) | `#a4262c` (`red/60`) — for danger text on a hover plate |
| status/info-fg | `#479ef5` | `#0f6cbd` |
| confidence/high | `#5ec75e` (`green/120`) | `#0c5e0c` (`green/60`) |
| confidence/medium | `#f2c661` (`marigold/120`) | `#4c3600` (`marigold/20`) |
| confidence/low | `#efa3a6` (`red/140`) | `#751d21` (`red/40`) |
| confidence/empty | `#767676` 3.20 on subtle | `#767676` 3.64 on subtle — non-text only |
| bg/chip | `alpha/white-08` (8% white) | `alpha/black-06` (6% black) |

`bg/chip` is the plate behind any chip, pip cluster or inset badge. It is **alpha, not an opaque
rung**, and that is the whole point: it composites off whatever surface it lands on, so it can
never collide with a host the way an opaque value can. Measured plate hex and ratio vs. host:

| host | Dark plate | Light plate |
|---|---|---|
| bg/canvas | `#272727` 1.23 | `#e2e2e2` 1.14 |
| bg/layer | `#313131` 1.27 | `#f0f0f0` 1.14 |
| bg/subtle | `#3a3a3a` 1.28 | `#d8d8d8` 1.14 |
| bg/layer-hover | `#3a3a3a` 1.28 | `#ebebeb` 1.14 |
| bg/layer-selected | `#434343` 1.28 | `#e2e2e2` 1.14 |

Text on the composited plate, measured after the 2026-08-02 confidence fix: **every level clears
4.5:1 on every plate in both modes.** The tightest is `confidence/high` at 4.60 Dark / 4.84 Light
on a plate over `bg/layer-selected`, which is the lightest plate in Dark (`#434343`) and the
darkest in Light (`#c9c9c9`).

**Correction — a false claim previously lived here.** An earlier revision said 4.06:1 "clears AA
for the 12 px Semi Bold level word (the 3:1 large-text threshold with margin)". That is wrong.
WCAG's large-text exemption begins at **18.66 px bold / 24 px regular**; a 12 px Semi Bold word
needs the full **4.5:1**. Under the correct reading five pairs were failing, not zero:

| mode | token | failed on | was |
|---|---|---|---|
| Dark | `confidence/low` | layer-hover, subtle, layer-selected | 4.06 / 4.06 / 3.52 |
| Light | `confidence/medium` | subtle, layer-selected | 4.26 / 3.67 |
| Light | `confidence/low` | layer-selected | 4.39 |

Fixed at the token layer: `confidence/low` Dark `red/120` → new **`red/140` `#efa3a6`**,
`confidence/low` Light `red/60` → `red/40`, `confidence/medium` Light `marigold/60` →
`marigold/20`. `red/140` had to be created because nothing sat between `red/120` (3.52, fails) and
`red/160` (9.05, but near-white and no longer reads as red). **Never cite a large-text exemption
for the level word.**

Side effect worth keeping: the darker Light rungs pull away from the grey unfilled pip, so
filled-vs-unfilled separation in Light improved from 1.76 / 1.34 / 1.60 to **1.76 / 2.52 / 2.37**
(high / medium / low). The pips are still not a substitute for the word.

Notes on the tokens that were *fixed* during the build, so they are not "corrected" back:

- `brand/rest` in Dark is deliberately **darker** than in Light. Fluent 2 does this so a white
  label on the brand fill gains contrast: 6.66:1 Dark, 5.38:1 Light. A lighter Dark accent was
  tried and measured 3.78:1, which fails for 12 px Semi Bold.
- `confidence/*` in Light use darker rungs (`green/60`, `marigold/20`, `red/40`) because the
  mid-ramp values measured as low as **1.73:1** on a light panel, and the level word is 12 px text.
  The rungs are deliberately **uneven across the three levels** — each was chosen as the nearest one
  that clears 4.5:1 on the worst plate for that hue, not for ramp symmetry. Do not "tidy" them onto
  a single rung number.
- `confidence/empty` exists because `fg/quaternary` backs ~342 text nodes and had to stay tuned
  for text; the unfilled pip needed a non-text token instead. Filled pips must always
  out-contrast the empty one or "2 of 3" reads as "1 of 3".
- `bg/chip` is **alpha-based on purpose** and must stay that way. An opaque plate cannot work:
  `bg/subtle` and `bg/layer-hover` are both `#292929` in Dark, so a `bg/subtle` chip on a hovered
  card measured **1.00:1** and vanished. Worse, every badge specimen on `10:13` sits on a
  `bg/subtle` host, so the plates had **never rendered at all, in either mode, on the shipped
  docs**. An alpha plate composites off whatever it lands on and holds 1.23–1.28 Dark / 1.14 Light
  across canvas, layer, subtle, layer-hover and layer-selected. Do not swap it for a flat hex.
- `confidence/empty` sits at **2.50–2.87 Dark** on the new chip plate, under the 3:1 graphic floor,
  and that is accepted. Lifting the plate and holding that pip above 3:1 are mathematically
  exclusive — even 4% white lands at 2.82. Lightening the pip instead would collapse
  filled-vs-unfilled from 1.62 to ~1.24 and break the "2 of 3 never reads as 1 of 3" guarantee.
  **Precedent:** Progress Bar `119:66` and Progress Ring `119:103` both use `bg/subtle` as Track at
  **1.13 Dark / 1.25 Light**. An unfilled pip is meter track, not information. The ratio that
  matters — filled against unfilled — is plate-independent because both pips sit on it.
- `stroke/control` exists because `stroke/strong` measured 2.87:1 on `bg/layer` in Dark, under
  the 3:1 graphic floor — and a border is the only thing signalling an unchecked control exists.

### Dimension & spacing

```
XXS 2  XS 4  SNudge 6  S 8  MNudge 10  M 12  L 16  XL 20  XXL 24  XXXL 32
4XL 40  5XL 48  6XL 64
radius/none 0  small 2  medium 4  large 6  xlarge 8  circular 9999
stroke/thin 1  thick 2  thicker 3
icon/xs 12  sm 16  md 20  lg 24  xl 32
control/height-sm 24  md 32  lg 40
layout/sidebar-expanded 280  sidebar-collapsed 48  topbar-height 48
layout/page-max 1560  page-gutter 32  grid-gutter 24
layout/card-width 240  card-cover-height 320  row-height 56
```

### Text styles

`micro` 10/14 · `caption` 12/16 · `caption-strong` 12/16 SB · `body` 14/20 ·
`body-strong` 14/20 SB · `subtitle` 16/22 SB · `title` 20/28 SB · `page-title` 24/32 SB ·
`display` 32/40 SB · `mono` 12/16

## Page map

Page ids are stable; use them rather than searching by name.

| Page | id | State |
|---|---|---|
| Cover | `0:1` | done — `35:17` corrected 2026-08-02 to "51 primitives, 54 semantic" |
| Getting Started | `10:2` | done |
| Color | `10:4` | done, root `11:2` |
| Typography | `10:5` | done |
| Spacing & Layout | `10:6` | done |
| Elevation & Radius | `10:7` | done |
| Motion | `10:8` | done |
| Iconography | `10:9` | done (docs only — the icon *components* are on `10:12`) |
| Data & Provenance | `10:10` | done |
| Icon | `10:12` | done — 43 icon components |
| Badges | `10:13` | done, root `52:2` |
| Buttons | `10:14` | done, root `98:2`, set `93:454` |
| Form Controls | `10:15` | done, doc `111:45` |
| Filter Chip | `10:16` | done, set `115:74`, doc `118:14` |
| Divider & Progress | `10:17` | done, doc `191:45` |
| Avatar | `10:18` | done, root `207:24` |
| Metric Card | `10:19` | done — set `154:23` (1592×572), doc `169:23` (1560×1964). **Ids resolved 2026-08-05.** Fabricated data fixed 2026-08-22 (`TODO.md` B1 ✅); `Detail#156:26` wiring open as B11 |
| Game Card / Grid | `10:20` | done — set `221:141`, doc `249:2`, verified both modes |
| Game Card / Row | `10:21` | done — set `272:144`, doc `274:2`, verified both modes |
| Section Header | `10:22` | done — set `286:82`, doc `292:2`, verified both modes |
| Sidebar & Nav Item | `10:23` | done — Nav Item set `301:44`, Sidebar set `302:96`, doc `304:2`, verified both modes |
| Top Bar | `10:24` | done — set `321:35`, doc `333:1645`, verified both modes |
| Context Menu | `10:25` | done — Menu Item set `353:18`, Context Menu set `354:1629`, doc `357:47`, verified both modes |
| Modal | `10:26` | done — set `370:112`, doc `373:37`, verified both modes |
| Pagination | `10:27` | done — Page Button set `391:39`, Pagination set `392:186`, doc `395:85`, verified both modes |
| Empty State | `10:28` | done — set `417:128`, doc `419:34`, verified both modes |
| Loading & Skeleton | `10:29` | done — set `451:2`, doc `454:2`, verified both modes |
| Charts | `10:30` | done — Bar Chart set `474:104`, Distribution Bar set `475:38`, doc `478:2`, verified both modes |
| Wireframes | `10:32` | **done — closes P4 2026-08-22.** 7 screens + 8-node annotation layer = 15 top-level nodes, all 9 defects closed, verified Dark **and** Light, six-check audit clean. Layout is settled architecture. See § Wireframes |
| Page Templates | `10:33` | **empty — re-verified live 2026-08-22** (`count: 0`, `children: []`). This is P5's target and its pre-flight gate is satisfied |
| Dashboard … Settings | `10:35`–`10:42` | empty — verified live 2026-08-06. **`10:35` "Dashboard" is an orphan page, dropped from P6 2026-08-09**, see § Wireframes |
| Changelog | `10:44` | empty |

## Components built

| Component | Set id | Variants | Props |
|---|---|---|---|
| Icon (43 components) | page `10:12` | — | — |
| Badge | `53:50` | 12 | Label, Show icon, Icon swap |
| Store Badge | `54:22` | 2 | mark swap |
| Confidence Badge | `55:52` | 6 | — |
| Count Badge | `55:61` | 4 | — |
| Button | `93:454` | 75 | Label, 5 appearances × 3 sizes × 5 states |
| Checkbox | `106:53` | 12 | State × Interaction |
| Radio | `106:86` | 8 | State × Interaction |
| Switch | `106:123` | 8 | State × Interaction |
| Text Input | `107:140` | 42 | Size × State × Icon |
| Field (wrapper) | `107:141` | — | Label, Hint, Required, Show hint |
| Select | `109:114` | 21 | Size × State |
| Textarea | `109:131` | 7 | State |
| Filter Chip | `115:74` | 20 | `Label#117:0`, Type × State × Interaction |
| Divider | `119:14` | 4 | `Label#191:0`, Orientation × Content |
| Progress Bar | `119:66` | 17 | Type × Tone × Value |
| Progress Ring | `119:103` | 12 | Size × Type × Value |
| Avatar | `193:108` | 35 | `Initials#193:0`, Size × Content × Shape |
| Avatar Group | `193:144` | 4 | Count |
| Metric Card | `154:23` | 12 | axes **not re-audited** — read `componentPropertyDefinitions` before use. Doc `169:23` |
| Game Card / Grid | `221:141` | 9 | Type × State (Rest/Hover/Focus) |
| Game Card / Row | `272:144` | 12 | Type × State (adds **Selected**) |
| Section Header | `286:82` | 6 | Level × Actions, `Show count`, `Show description` |
| Nav Item | `301:44` | 8 | Form × State (Rest/Hover/Selected/Focus) |
| Sidebar | `302:96` | 2 | Form (Expanded 280 / Collapsed 48) |
| Top Bar | `321:35` | 3 | Sync (Synced / Syncing / Failed) |
| Menu Item | `353:18` | 12 | Type (Default/Destructive/Selected) × State (Rest/Hover/Focus/Disabled) |
| Context Menu | `354:1629` | 2 | Size (Compact 240×115 / Full 240×224) |
| Modal | `370:112` | 4 | Type (Confirm 400 / Destructive 400 / Form 560 / Choose 720) |
| Page Button | `391:39` | 5 | `Label#391:0`, `Show label`, `Show icon`, `Icon`, State (Rest/Hover/Current/Focus/Disabled) |
| Pagination | `392:186` | 6 | Type (Full 960 / Compact 320) × Position (Start/Middle/End) |
| Empty State | `417:128` | 8 | `Show action#417:0`, Type (No results / No connection / Empty collection / Error) × Size (Page 560 / Panel 320) |
| Loading Skeleton | `451:2` | 4 | Type (Grid card 240×416 / Row 960×56 / Metric card 356×148 / Text line 320×20) |
| Bar Chart | `474:104` | 4 | Size (Full 720 / Compact 320) × Bars (4 / 3) |
| Distribution Bar | `475:38` | 2 | Size (Full 720 / Compact 320) |

### Icon component ids (page `10:12`)

43 components. Names below are the segment after `Icon / ` — **every store mark carries the
`store-` prefix**, which an earlier revision of this list dropped on twelve of the thirteen.

```
44:19 search    44:28 check     44:37 close      44:46 chevron-down
44:55 chevron-up 44:64 chevron-right 44:73 chevron-left 44:82 filter
44:91 sort      44:106 grid-view 44:118 list-view 44:128 more-horizontal
44:141 sliders  44:152 refresh  44:163 external-link
45:12 info      45:24 warning   45:35 error      45:46 success
45:58 unknown   45:69 clock     45:82 never-played
45:93 trend-up  45:104 trend-down 45:117 database 45:130 link
45:139 chart-bar 45:152 calendar
46:10 store-epic     46:23 store-steam    46:34 store-gog
46:47 store-xbox     46:60 store-playstation 46:70 store-battlenet
46:81 store-ubisoft  46:92 store-ea       46:101 store-rockstar
46:113 store-itch    46:124 store-amazon  46:133 store-humble
46:146 store-generic            47:5 Store Mark
129:16 person
```

**`Icon / person` `129:16` exists** — 16×16, one VECTOR glyph, cell `Cell / person 131:18`, glyph
`137:17`, **zero instances anywhere in the file**. An earlier revision of this document asserted
*"There is no person/user/avatar icon"* and gave the count as 42. Both were wrong; verified live
2026-08-05.

The two decisions that cited the absent glyph still stand, but now on their real grounds, not on a
false premise:

- **Avatar draws its silhouette inline** (head ellipse + shoulder arc vector, scaled from a 16 px
  basis) because it needs to scale across five box sizes and take the plate tokens. Do not retarget
  it onto `129:16`.
- **Sidebar's Accounts item uses `Icon / link`** because an account here is a *connection to a
  store*, not a profile. That reasoning is unaffected — the doc rationale sentence "the file has no
  person glyph" is the part that was wrong, not the choice.

`129:16` is therefore an unconsumed component. Leave it; it is the right glyph if a real profile
destination ever appears. It is not a defect.

## Documentation page pattern

Every component doc page follows the same shape. Read the conventions off an existing page
rather than hardcoding them — `10:14` root `98:2` is the reference.

```
Root  VERTICAL, 1560 wide, fills bg/canvas, pad 32, gap 32
├── Header          gap 8  → page-title + body description
├── Section — X     gap 16
│   ├── Head        gap 4  → title (fg/primary) + body (fg/secondary)
│   └── Body        pad 24, gap 16, fills bg/subtle, radius/large
├── Section — In use        a realistic composition, not a swatch grid
└── Section — Rules        two columns: Always / Never
```

Rules columns: `status/success-bg` + `status/success-fg` for Always; `status/danger-bg` +
`status/danger-fg` for Never. Column heading is `body-strong` in the tone's `-fg`. Each rule is
an Item row with a 6×20 FIXED Bullet frame (HORIZONTAL, CENTER/CENTER) holding a 4×4 ELLIPSE
filled with the tone's `-fg`, then `caption` text in `fg/secondary` at FILL.

**No icons in the Rules columns.** An earlier revision of this document said Always used icon
`45:46` and Never used `45:35`. It was wrong — every shipped page uses the ellipse bullet above.
Verified against `98:2` and matched on Avatar. Rule text is `fg/secondary`, not the tone colour;
`fg/secondary` measures 11.35/11.93 Dark and 9.42/9.24 Light on the two tinted panels, where the
tone `-fg` on its own tint only reaches 7.70/6.20 Dark and 5.03/4.53 Light.

Specimen strips use a **fixed-height Holder above the caption** so captions share a baseline
across cells of differing specimen height. This was a real bug twice; the pattern is:

```js
cell   VERTICAL, FIXED width, HUG height, gap 8, clipsContent = false
├── Holder  FIXED w × FIXED h, counterAxisAlignItems CENTER, clipsContent = false
│   └── instance
└── Caption micro / fg/quaternary, FILL
```

Doc pages are rebuilt idempotently: find the previous root by name and `.remove()` it first.

## Hard-won API knowledge

Things that cost real debugging time. Trust these.

- **`return` is the only output channel.** `console.log` is invisible. `figma.notify()` throws.
- **Colors are 0–1**, not 0–255.
- Font style is **"Semi Bold"**, not "SemiBold".
- **`swapComponentAsync` does not exist** — use synchronous `instance.swapComponent(target)`.
- **`INSTANCE_SWAP` property values must be node ids (`comp.id`), never component keys.**
  Confirmed three times. But `preferredValues` entries *do* use `{type:'COMPONENT', key: comp.key}`.
- An INSTANCE_SWAP property on a COMPONENT_SET carries **one shared default across all variants** —
  per-variant icon defaults are impossible.
- **Applying an `INSTANCE_SWAP` property resets every nested override inside that slot — including
  variable bindings.** Setting the swap re-instantiates the slot's subtree from the new main
  component, so a fill you had bound on a child vector silently reverts to the main's value. All 12
  Pagination arrow glyphs came back as `fg/primary`, which made a Disabled arrow indistinguishable
  from a Rest one. **Re-bind the slot's children after every swap.** And do not audit the
  *component* to conclude the *instances* are fine — the Page Button component was correct; the
  defect lived only in the instances.
- **A component property key carries an id suffix that must be read from the live file, never
  remembered.** `Show count` on Section Header is `Show count#287:14`, but `#287:15` was used —
  `setProperties` with an unknown key is a **silent no-op**, exactly like `V['spacing/L']` being
  `undefined`. The Empty State `In use` stage rendered a count of 20,400 under a filter matching
  nothing for a whole session because of it. Read `inst.componentProperties` (or the set's
  `componentPropertyDefinitions`) and use those keys verbatim. And verify by *looking* — the
  call does not throw.
- **A component set frame does not re-fit when a variant's height changes.** The Empty State set
  grew its Page variants 174 → 194 after a measure cap and silently overflowed its own frame by
  20 px. Audit `max(child.y + child.height)` against `frame.height` after any variant resize, and
  hold the file's absolute-grid padding convention: **24** for badge-scale sets (Badge `53:50`,
  Confidence `55:52`), **32** for mid sets (Button `93:454`, Pagination `392:186`), **48** for
  large ones (Modal `370:112`). Relay out on explicit PAD/GAP with per-row height =
  `max(rowVariants)`, then `resizeWithoutConstraints`.
- **The Spacing collection uses BARE variable names** — `XXS`, `XS`, `SNudge`, `S`, `MNudge`, `M`,
  `L`, `XL`, `XXL`, `XXXL`, `4XL`, `5XL`, `6XL`. There is no `spacing/` prefix. Dimension *is*
  prefixed (`radius/*`, `stroke/*`, `icon/*`, `control/*`, `layout/*`), which is what makes the
  mistake easy to make. A lookup like `V['spacing/L']` yields `undefined` and `setBoundVariable`
  then **fails silently** — every gap and padding on a whole page went unbound this way, and the
  only tell was `boundVariables` reading back as `{}`. Repair by sweeping on **value**, not name:
  build `SP[resolvedNumber] = variable` from the collection, then rebind matching raw numbers on
  `itemSpacing` / `padding*` / `counterAxisSpacing`. Skip `INSTANCE` nodes — they inherit from
  their main component.
- **`layoutGrow` must be an INTEGER.** `Property "layoutGrow" failed validation: Expected integer,
  received float`. Any proportional ratio has to be rounded before assignment — which means the
  *scale* you round at decides the precision of the drawing. Charts hit this directly: at percent
  scale `Math.round` took a 0.88% segment to 1%, and with a 2 px minimum on top it drew at 13.5 px,
  **more than double its true size, on the one segment a reader is most likely to misread**. Weight
  at **per mille** instead (`Math.round(n / total * 1000)`) and the same segment lands at 6.1 px on
  a 680 track with no floor needed. Rule: when a ratio must become an integer, pick the scale from
  the smallest value you have to represent honestly, not from the unit that reads nicely.
- **`layoutGrow = 1` pins a child to FILL and silently defeats every attempt to make it hug.**
  Setting `primaryAxisSizingMode = 'AUTO'` or `layoutSizingVertical = 'HUG'` on such a child appears
  to succeed — no throw, no warning — and the height does not move. The read-back then shows your
  value *rejected*: `primary` still reads `FIXED`. **Clear `layoutGrow = 0` first, then set HUG.**
  Found 2026-08-06 on the Library wireframe, whose `Page` frame `494:119` held 1528 px of content
  inside a 1032 px box: the pager and two of three card rows rendered nowhere. Two calls were spent
  setting sizing modes that could never apply. The diagnostic is to read back
  `layoutGrow` / `layoutAlign` / `layoutSizingVertical` together — a sizing write that reports the
  old value is a *constraint* problem, not a syntax one.
- **`setBoundVariableForPaint` returns a NEW paint** — capture and reassign, don't mutate.
- **Append the child before setting HUG/FILL or resizing.** Order matters.
- `layoutSizingHorizontal` / `layoutSizingVertical` (child) vs `primaryAxisSizingMode` /
  `counterAxisSizingMode` (frame) are different enums. Never cross them.
- **`figma.createAutoLayout()` ships a white fill.** Every container needs `fills = []` or an
  explicit token, or you get a white sheet over the page.
- Any `section()`-style helper must set `body.layoutSizingVertical = 'HUG'` or content clips.
- **`setVariableCodeSyntax(platform, value)` works**; platforms `'WEB' | 'ANDROID' | 'iOS'`.
  `variable.codeSyntax` reads back as a plain object. Clean way to add a ramp rung: read a
  sibling's syntax and string-replace the number. **Beware** — replacing `'high'`→`'empty'`
  mangles `colorConfidenceHigh` into `colorconfidenceEmpty`. Verify casing after.
- Alias resolution must be null-guarded — `return (val && val.r !== undefined) ? val : null` —
  or luminance throws `cannot read property 'r' of undefined`.
- Cross-collection aliasing: a 2-mode semantic can alias a 1-mode primitive. Fall back to
  `col.modes[0].modeId` when `valuesByMode[modeId]` is undefined.
- **Never assume node type before a type-specific call.** `findAll` exists on containers, not on
  TEXT. Use a recursive `walk` that inspects `n.type` / `n.children`.
- Loading fonts on existing text must handle `figma.mixed`: iterate
  `getRangeFontName(i, i+1)` per character.
- `node.setExplicitVariableModeForCollection(collection, modeId)` takes the **collection object**
  (the id-string overload also works as a fallback). This is how you screenshot Light mode.
  **Always `clearExplicitVariableModeForCollection` afterwards.** And never leave a pin on a
  COMPONENT, a variant or an INSTANCE: `createInstance()` copies the source's
  `explicitVariableModes`, so a pinned component permanently freezes every instance it produces.
  Pins belong on documentation FRAMEs only.
- Failed scripts are **atomic** — nothing mutates, so a throw is safe to retry.
- Keep all mutating `use_figma` calls **strictly sequential**. Never parallelize writes.
  Read-only calls can safely run alongside screenshots.
- **`page.loadAsync()` reads many pages in one call and does *not* switch the current page.** This is
  a different API from the forbidden `loadAllPagesAsync`, and it is how a file-wide text sweep runs in
  one script: `for (const p of figma.root.children) { await p.loadAsync(); walk(p) }`. The
  once-per-call limit applies to `setCurrentPageAsync`, not to `loadAsync`.
- **Sweep for a *shape*, never for the needles you happen to remember.** A literal scan for
  `20,400 / 20400 / 1,247 / 8,200` returned clean while the file still carried `8,540`, `4,102` and
  `20,412`. The class pattern `/\d,\d{3}/` caught all three. And a fourth fabrication, `311`, has no
  comma and no pattern at all — it was found only by *reading* the full text of the nodes around a
  known hit. A needle sweep proves the needles are gone; it proves nothing about the class.
- **A stored component-property value that references no text node is invisible twice over** — a
  `characters` sweep cannot see it and the render cannot show it — and it appears the instant someone
  switches the variant. Metric Card held both fabricated figures this way on nine of twelve variants
  after the rendered text was already correct. **Audit `componentProperties` values, not just text.**
- **A default and an override are separate storage, and each fix reaches only one of them.**
  `set.editComponentProperty(key, {defaultValue})` corrects every variant still on the default and
  cannot touch an instance carrying its own value; `instance.setProperties()` does the converse.
  Read both before deciding which to write — and prefer **aligning** the two over clearing one.
- **Figma auto-names TEXT nodes from their content**, so a fabricated figure survives in `node.name`
  long after `characters` is fixed. A name is not decoration here; it is a second copy of the string.
- **A zero is only trustworthy from a selector proven able to find non-zero.** Corollary to recurring
  shape #16, and the reason W7 was a false alarm in both directions. Related trap: `query()` attribute
  selectors break **silently** on unquoted spaces — `TEXT[name=Delta label]` matches nothing and
  throws nothing. Quote the value, or prove the selector first on a node you know exists.
- **Skip nodes with an INSTANCE *ancestor*, not merely nodes whose own type is INSTANCE.** A spacing
  or fill sweep that only checks `n.type === 'INSTANCE'` will happily rebind a frame *inside* an
  instance, which is an override the main component will then fight.

### Verification loop — do not skip this

```
get_screenshot(nodeId) → curl -sL -o /tmp/<n>.png "<url>" → Read the PNG and actually look
```

On this machine `/tmp/x.png` is read back at `C:\Users\Sufiyan\AppData\Local\Temp\x.png`.
Screenshot asset URLs are **short-lived and should be treated like a secret** — download once,
don't persist or publish them.

**A structural read-back is not verification.** A geometry check reported the Badges footer
notes as "no clipping — pass" while they were rendering at 1.97:1 and were effectively
illegible. Only measured contrast plus looking at the image catches that class of defect.

Corollary: **identical contrast ratios against two different surfaces is a collision tell.**
When all seven `fg/*` tokens returned the same number on canvas and subtle in Light, that meant
the two surfaces resolved to the same hex — not that the maths was wrong.

### Defects found by verification — the recurring shapes

Worth knowing because they will recur in the components still to build.

1. **Dual-role tokens.** A token backing both text and shapes is constrained from both sides.
   Text wants ≥4.5:1, graphics need ≥3:1 but must not vanish. `fg/quaternary` (342 text nodes +
   6 pip ellipses) and `confidence/*` (4 text nodes + 10–14 pips each) both hit this. Audit
   usage — separating text consumers from shape consumers — *before* retargeting.
2. **A surface ladder that collapses in one mode.** `bg/canvas`, `bg/subtle`, `bg/disabled` and
   `bg/layer-selected` all resolved to `#f0f0f0` in Light, so every inset panel was invisible
   and the text ladder had no headroom. Fix the surface first, then the text. **Only `bg/subtle`
   was actually moved** (to `#e6e6e6`) — `bg/canvas`, `bg/disabled` and `bg/layer-selected` are
   still a three-way `#f0f0f0` pile-up in Light. Open; see Known loose ends.
3. **A plate that is the same colour as a state it has to survive.** A chip on a card must stay
   visible when the card hovers. `bg/subtle` = `bg/layer-hover` = `#292929` in Dark made the
   Confidence Badge plate disappear on hover — and, because docs specimens also sit on
   `bg/subtle`, never appear at all. The fix is an **alpha** plate (`bg/chip`), not a different
   opaque rung: an opaque value can always collide with some future surface, an alpha one cannot.
   Ask of any plate: what surfaces will this land on, and does it survive all of them?
4. **A caption that documents a measurement goes stale when the token moves.** Compute the ratio
   in the *same script* that writes the sentence. Never hardcode a number into copy.
5. **Copy that over-promises what the measurement supports.** A rewritten Confidence Badge note
   claimed the badge "still reads in a greyscale export" while the tightest filled-vs-unfilled pip
   pair measured **1.34:1** — in greyscale the pips are one tone. Scope the claim to what actually
   survives (the level *word*, never below 4.06:1) and state the dependency as a rule: never ship
   the pips without the word. If copy makes a claim, measure that exact claim.
6. **Fixed pixels where a ratio belongs.** Progress Bar's fill was 144 px inside a 240 px track,
   so a 60% bar stretched to 480 px silently displayed 30%. Now a `layoutGrow` ratio —
   verified 60% at both widths. Check anything that claims a proportion.
7. **A state change that resizes the control.** Filter/Selected/Disabled dropped its dismiss ×
   and became narrower than its siblings, so the filter bar would reflow on disable.
8. **Alpha-bearing tokens break naive contrast maths.** `stroke/divider` resolves to `#ffffff`
   but is 6% white. A resolver that ignores alpha reports a blazing white line that isn't there.
9. **Ragged caption baselines** whenever specimens of different heights sit in a top-aligned
   strip. Fixed by uniform holder heights — see the specimen pattern above.
10. **Icons live on `10:12`, not on the Iconography page.** A page-level scan of `10:9` returns
    zero components and looks alarming. They are nested inside the documentation frame there.
11. **A component set's own frame is not a host surface.** Screenshotting `55:52` to check the
    alpha plates showed nothing — a set's backing is not a real surface, so alpha composites
    against nothing meaningful. Verify alpha-bearing components in **real usage** (a card, a doc
    panel), never against the set.
12. **A specimen taller than its holder bleeds instead of clipping.** The Forms section put a
    720 px Sidebar in a 420 px holder with `clipsContent = false`; the instance centred at
    `y = -150`, so it was cut at the top *and* overlapped the next cell, while the caption beside
    it truncated to "Ex|". Two screenshots went by before I read it correctly. Measure the
    component's real height and size the holder to it — and remember that a holder which does not
    clip will silently overrun its neighbours rather than showing a clean edge.
13. ~~**Downscaled screenshots make small dark text look like a contrast failure.**~~ **This entry
    was wrong and is retracted — see #14.** It claimed the Sort button only *looked* washed out in
    Light at 918 px and measured a safe 8.82:1. The button was genuinely broken. I reached 8.82 by
    resolving the *token* in Light instead of reading what the *node* actually rendered, then
    blamed my eye for the discrepancy. Three times. The real ratio was **1.28:1**.
    The salvageable half: downscaling *is* real, so raise `maxDimension` rather than squinting.
    But never let "it's probably the render" close an observation — resolve the node, not the token.
14. **An explicit variable-mode pin on a component silently freezes every instance ever made from
    it.** `createInstance()` copies the source component's `explicitVariableModes`, so the instance
    ignores the mode of whatever page or frame it lands in. The Button set, 74 of its variants and
    the Badge set were pinned to Dark. Every button in the file — Section Header's Sort and View
    all, the Sidebar doc's composition, and my new Top Bar — rendered Dark-styled under Light:
    `fg/secondary` `#d6d6d6` on Light canvas `#f0f0f0` is **1.28:1**, against the 8.82 the token
    would have given. Found only because the Top Bar's Rest buttons rendered *paler* than its
    Disabled one, which is backwards. Swept 89 pins off components and instances; **110 remain and
    must stay** — they are documentation FRAMEs, and the Color and Elevation pages need theirs to
    show both modes side by side. The rule: **a pin belongs on a doc frame, never on a component,
    a variant, or an instance.** Audit with
    `n.explicitVariableModes[colorCollection.id]` before trusting any Light screenshot.
15. **A state baked into a container variant.** The Context Menu's Compact variant shipped with its
    second item set to `State=Hover`, so every Compact instance in the file would have rendered a
    phantom hover plate. A geometry read-back cannot see this — the structure is valid, only a
    nested instance's variant *value* is wrong. **A container variant must ship every child at
    rest.** Check nested instance variants, not just the container's own props.
16. **A convention re-derived from intuition instead of from the file.** Twice now I have written a
    "correct" generator, run it against the file, and produced a wall of false positives — the
    ANDROID/iOS codeSyntax rules (58 false hits in one pass), and the array-shaped `boundVariables`
    on TEXT nodes. Both times my first instinct was that the file was broken. **When an audit says
    everything is wrong, suspect the audit.** Derive the rule from the file's own majority first,
    then flag the minority.

## Copy voice

Documentation prose is declarative and reason-giving, never marketing. It states what a thing
is, what decides which variant to use, and what the tradeoff was. Where a choice was contested,
the doc says so and cites the measurement — e.g. the Brand chip note records that `#115ea3`
measures 2.77:1 against canvas, under the 3:1 non-text floor, and that this was accepted because
the white label clears 6.66:1 and the chip is never the only cue separating two controls.

Rules are written to be **enforceable in review** — "One Primary per view", not "use Primary
sparingly". Every page ends with Always / Never columns in that register.

## Current status

**Phase 4 — COMPLETE, closed 2026-08-22. Phase 5 is IN PROGRESS as of 2026-08-23.** Phases 1 through
4 are all done. **P5 is page templates on `10:33`**, entry plan `HANDOFF.md` §9.

**✅ The 2026-08-23 Figma blocker is CLEARED — the tools are bound and the file is reachable.** Proved
by execution, not by configuration: three read-only `use_figma` scripts returned data (`pageCount: 44`
with the full page list, a depth-4 structural walk of all seven wireframes on `10:32`, and a focused
geometry read of Library's card rows). The diagnosis was right — **session binding, not connectivity;
the fix is a fresh session**, because tools are enumerated once at launch. The outage record and its
four wrong-question "confirmations" are kept in this file's § Wireframes close-out and `HANDOFF.md` §5
as a diagnostic lesson, not as a live blocker.

**The pre-flight gate is satisfied on a reading taken in the building session** — `10:33` re-read
**2026-08-23** returned `{name: "Page Templates", count: 0, children: []}`. The 2026-08-22 reading was
deliberately not reused: this document has twice called a page empty while it held finished work.

Wireframes `10:32` finished with 7 screens plus an 8-node annotation layer, all 9 defects closed, all
15 top-level nodes verified in Dark **and** Light, and a clean six-check close-out audit. Read
§ Wireframes before touching the page — the layout there is now **settled architecture**, and P5 and
P6 refine it rather than reinventing it.

**`10:32` was NOT empty.** Seven wireframes were already built when the 2026-08-06 session opened —
the page map said "empty", which was **wrong for the third time in this project's history**. The
read-only audit is the only reason finished work was not rebuilt over. This is the failure mode this
document warns about four times; it has now happened again.

**Landed 2026-08-06:** the Library `494:2` overflow fix — 1544 px of content in a 1080 px frame, with
the pager and two of three card rows rendering nowhere. Root cause was `layoutGrow = 1` silently
defeating HUG (now in Hard-won API knowledge). Library is 1576 with overflow 0, and all seven frames
were relaid onto a non-overlapping 3-column grid.

**Closed 2026-08-22: all nine defects.** W1 was the serious one — Analytics now reads
**"132 of 226 records enriched"** under a `58%` value (132/226 = 58.4%) beside a card reading `226`,
and a page-wide scan returns **zero residual `1,247` / `20,400` / `724 of` anywhere on `10:32`**.
W7 turned out to be a false alarm (30 bound, 0 unbound), W9 was found and fixed during the sweep, and
the last two — W5's size-dependent caption and W8's annotation layer — landed under **B10 route 1**
with Pagination **not re-scoped**.

**Two documentation items were closed by measurement in the same window.** `TODO.md` **B1** —
Metric Card's fabricated `1,247` and its schema-forbidden fourth "none" confidence bucket — is fixed
on **both** the rendered-text layer and the property layer, with the fourth bucket **deleted, not
zeroed**. `TODO.md` **B2**'s retired-figure sweep ran as a *shape* scan (`/\d,\d{3}/`) rather than a
needle scan for known strings, which is the only reason it caught `8,540`, `4,102` and `20,412`.
**B6 was closed as false** — Select's `State=Filled` ships on all three sizes and always did.

**No Figma mutation in P4 created a token**, so counts stand at 215 and no Cover rewrite is implied.

Three sessions ran on 2026-08-05. The **first made no Figma mutations** — it reconstructed the
handoff document set and audited the file read-only. The **second built Loading & Skeleton**, added
three tokens, rewrote Cover `35:17` and `35:21`, and fixed a shipped defect in Sidebar `302:96`.
The **third built Charts** and added no tokens.

`bg/overlay` ties to other surfaces in both modes (and is *identical* to `bg/layer` in Light).
This is a **non-defect** — an overlay is separated by its shadow, not by surface value. Context Menu
and Modal both sit on it. Do not "fix" it.

**Before verifying anything in Light, read the mode-pin section below.** A component carrying an
explicit variable-mode pin freezes every instance made from it, and 89 such pins were swept on
2026-08-03. New components must never carry one.

Done and visually verified in both modes: Icon, Badges, Buttons, Form Controls, Filter Chip,
Divider & Progress, Avatar, Metric Card, Game Card / Grid, Game Card / Row, Section Header,
Sidebar & Nav Item, Top Bar, Context Menu, Modal, Pagination, Empty State, Loading & Skeleton,
Charts.

### Avatar — closed out 2026-08-02

Components verified by screenshot: the inline silhouette renders correctly at all five sizes,
and the Avatar Group overlap reads as a stack, not a collision — each avatar carries a 2 px ring
in `bg/layer` which is what keeps adjacent circles separate.

Doc page built at root `207:24`, six sections — Sizes, Content, Shape, **Group**, In use, Rules.
Group is one more than the pattern called for; Avatar Group was a built component with no
documentation anywhere, so it got a section.

Two real defects were found and fixed at the token layer:

- **All 10 `Content=Image` variants carried a raw, unbound, mode-blind `#596b80`** — also foreign
  to the palette, a blue-grey where the neutral family is pure grey. Created **`bg/media`**
  (Color, aliased to `grey/46` in both modes, scopes `FRAME_FILL`/`SHAPE_FILL`) and bound all 10.
  Image is held to the 3:1 graphic floor where the other three plates are not, because an Image
  avatar has no children — before the picture loads the plate is the only cue the component is
  there. Initials, Icon and Store each carry perceivability in their own content, so their plates
  sit at 1.13–2.18 by design. **Do not "fix" them upward**; a high-contrast plate behind a
  silhouette reads as a button. The Content section note on the page states this with live ratios.
- **Store mark sizes were 12/15/20/25/30**, three of them raw. Retargeted onto the `icon/*` scale
  (12/16/20/24/32) matching the shipped Store Badge precedent at `54:22`. The mark-to-box ratio
  now wobbles 0.60–0.667 instead of a flat 0.625 — accepted as the cost of landing on a discrete
  scale, and padding per side stays an even integer at every size.

Established as non-defects, so they are not re-opened:

- **Avatar's 1×35 single-column variant strip is correct.** Checkbox, Radio, Switch, Select,
  Filter Chip, Progress Bar and Progress Ring are all single-column VERTICAL. Only Badge,
  Confidence Badge and Button are absolute-positioned grids. Skill rule 8 prefers grids; the file
  convention wins.
- **Store has no Circular variant by design.** 5 × (Initials 2 + Icon 2 + Image 2 + Store 1) = 35
  exactly. Circle-cropping a store logo clips the mark.
- **Fixed geometry stays raw.** Avatar's 20/24/32/40/48 box sizes are plain numbers, matching
  Progress Ring, Checkbox and Switch. *User decision.* The no-raw-numbers rule governs visual
  style — colour, spacing, radius — not intrinsic component geometry. **This is now the file's
  precedent for every remaining fixed-geometry component.**

Verified: all 22 text/surface pairs the page introduces clear 4.5:1 in both Dark and Light.
The five sub-3:1 graphic results are the three plates above plus `stroke/divider`, all cases
where the fill is never the sole cue.

### Section Header — closed out 2026-08-02

Set `286:82`, 6 variants at 960 wide, doc `292:2` with six sections (Levels, Actions, Content,
In use, Rules). `Level` = Page / Section, `Actions` = None / Link / Sort, plus `Show count` and
`Show description` booleans.

- **Level is scope, not size.** Page names the whole view and takes `page-title` 24/32; Section
  names one band inside it and takes `title` 20/28. One Page header per view; Sections repeat.
- **The trailing slot holds at most one control, scoped to the records under that header.** Sort
  belongs on Page because it governs the result set; View all belongs on a Section whose band is a
  truncated view. Two controls means you want a toolbar, which is a different component.
- **The count must match what is rendered.** Under a filter it is the filtered figure, never the
  library total. Turn `Show count` off when the number is not yet known rather than showing a
  placeholder.
- **`fg/accent`, not `brand/rest`, for the View all link** — `brand/rest` is a fill token and
  measures under 3:1 against canvas in Dark. The link reads 6.56 Dark / 4.72 Light on canvas, and
  4.72 is the lowest figure anywhere in the component.

**A set-level TEXT property forces one shared default across every variant.** Adding `Title` and
`Description` as set properties silently overwrote the per-variant copy — all six variants
collapsed to "Library" and the Page description. Deleted both; per-variant copy is the right model
here and instance text is still editable. Clear `componentPropertyReferences` on the consuming
nodes before calling `deleteComponentProperty`, or deletion is refused.

**Read `boundVariables` array-aware on TEXT nodes.** `boundVariables.fontSize` comes back as
`[{type:'VARIABLE_ALIAS', id}]`, not a bare object. A naive `bv.fontSize.id` check reports every
correctly-bound text node as `RAW` — I briefly "found" a token defect that did not exist. Same trap
as `fontFamily` earlier in the build. Always use an array-aware resolver.

### Game Card / Row — closed out 2026-08-02

Set `272:144`, 12 variants at 960×56, doc `274:2` with seven sections (Types, States, Anatomy,
**Grid or row**, In use, Rules). Row is the first component to consume `bg/layer-selected`.

Decisions worth not relitigating:

- **Row has Selected; Grid deliberately does not.** Row is the working view — the title is the
  identifier, ~18 records fit a 1080 screen against the grid's ~10, and bulk actions (tag, hide,
  add to a collection) live here and only here. The Grid rules say "a card click navigates"; that
  divergence is intentional and both doc pages state it.
- **Selected is two cues, never fill alone.** The fill reaches only **1.28:1** against the page and
  **1.39:1** against hover in Light. A 2 px leading bar in **`brand/selected`** carries the state at
  **5.96:1 Dark / 4.58:1 Light**. `brand/rest` was the first choice and measured **1.90:1 in Dark** —
  it is deliberately dark in Dark mode, which would have made the second cue the invisible one.
  **Use `brand/selected` for any selection accent, not `brand/rest`.**
- **The divider is a bottom-edge stroke on the row itself**, `stroke/divider` at `stroke/thin`. It is
  alpha, so it survives all four state fills including Selected (1.19 rest / 1.20 selected in Dark).
  Sub-3:1 by design: a list separator is structure, and the fixed row height carries the rhythm.
- **Focus ring is drawn `OUTSIDE`.** With `INSIDE` on a 960 px rect the ring landed exactly on the
  row edge and was indistinguishable from the divider — it rendered as if Focus were Rest. Rows are
  stacked, so verify a focus ring in a *stack*, never against a single specimen.
- **Fixed geometry stays raw** per the Avatar precedent: 56 height (bound to `layout/row-height`),
  30×40 thumb, `icon/sm` marks. The thumb keeps the card's 3:4 poster ratio — never square-cropped.
- **No playtime column.** 222 of 226 records are zero or null — nonzero on exactly 4. A column that
  is empty or unmeasured on 98% of rows is not a column.

Two defects the render caught that a structural read-back would not have:

- The Unmatched chip shipped with `Show icon#53:13` **true** (Grid's is false), adding a stray info
  glyph and widening the chip 80 → 96. An `INSTANCE_SWAP`-bearing badge does not inherit the
  sibling's boolean — set it explicitly.
- An orphaned `Stack` frame, 1448×100 with zero children, left ~90 px of dead band at the top of the
  States section. Created in the first pass, superseded by `Cell —` frames, never removed.

### Top Bar — closed out 2026-08-03

Set `321:35`, 3 variants at 1280×48, doc `333:1645` with four sections (Sync states, Anatomy,
In use, Rules). One variant axis — `Sync` = Synced / Syncing / Failed.

The bar carries exactly three global concerns: search across the whole library, the state of the
last store sync, and the account. Layout is leading search → flexible gap → trailing cluster
(sync chip, 1×24 divider, avatar), so nothing between the two ends is position-dependent and the
bar resizes cleanly.

Built entirely from shipped components — Text Input Medium (400 wide), Badge (Neutral for
Synced/Syncing, **Danger for Failed**), Button Subtle Medium, Divider Vertical resized to 1×24,
Avatar Medium Initials. **No new component was needed** — I had planned a separate "Sync Status"
chip and deleted the task once it was clear Badge already does exactly this with a tone swap.

Decisions worth not relitigating:

- **The bar is 1280, not 1560.** It spans the content column only — 1560 page max minus the 280
  rail. It never runs over the rail. The `In use` shell proves the fold: brand block 48 and
  Top Bar 48 (`layout/topbar-height`) share a centre line.
- **Search lives in the chrome, not under a Section Header**, because it searches the whole library
  rather than the current view. That is the whole reason it is here.
- **Sync is a status readout, not a progress bar.** Syncing counts records against the known total
  (**`Syncing 91 of 226`** — read live 2026-08-22 off `I320:30;53:5`) so a slow sync is
  distinguishable from a stuck one, but the chip never animates a fill.
  **This closeout used to quote `Syncing 8,200 of 20,400`.** The component never held that string;
  the *document* did. Both figures were retired by B2, and a retired figure sitting in a closeout
  paragraph is exactly how this project's recurring failure works — prose with no live source, read
  later as measurement. The live variants, probed 2026-08-22:
  `Synced` `320:2` chip `I320:9;53:5` "Synced 4m ago" · `Syncing` `320:24` chip `I320:30;53:5`
  "Syncing 91 of 226" · `Failed` `320:44` chip `I320:50;53:37` "Sync failed" `Tone=Danger`.
- **The action stays in place across all three states** — `Sync now` Rest (`I320:15;93:216`),
  `Sync now` **Disabled** (`320:35`, confirmed live), `Retry` (`I320:56;93:216`). Recurring-shape #7:
  a state change must not resize the control or the bar reflows.
- **Synced carries a relative timestamp** (`Synced 4m ago`), not an absolute one, so the reader
  doesn't do arithmetic.
- The bottom hairline is `stroke/divider` at `stroke/thin`, alpha, **1.14 in both modes**. The rail
  itself sits only 1.04 Dark / 1.09 Light against canvas — near-flat on purpose. A stronger step
  would read as a floating toolbar rather than as chrome.

Measured, all in the script that wrote the copy: neutral chip label **10.92 Dark / 8.43 Light**;
button label **13.19 / 9.63**; input placeholder **5.43 / 5.74**; input border **4.22 / 4.35**
(above the 3:1 graphic floor — the border is the only thing signalling the control exists);
avatar initials **6.66 / 5.38**.

Two accepted sub-threshold results, both consistent with existing precedent:

- **Disabled `Sync now` reads 2.87 Dark / 2.15 Light.** `fg/disabled` fails AA by design and
  inactive controls are WCAG-exempt.
- **The Failed chip's `status/danger-bg` plate lifts only 1.11 Dark / 1.04 Light on the rail** — in
  Light the plate effectively does not render. Accepted, and stated as a rule on the page: the
  *label* carries the state at 4.53 Light / 6.20 Dark, and the plate is never the sole cue. Moving
  `status/danger-bg` would touch every Danger badge in the file to fix one host.

### Context Menu — closed out 2026-08-04

Menu Item `353:18` (12 variants, Type × State, 240×32 on `control/height-md`, `radius/medium`,
focus ring drawn `OUTSIDE` per the Row precedent), Context Menu `354:1629` (Size = Compact 240×115 /
Full 240×224), doc `357:47` with five sections (Sizes, Item types, Anatomy, In use, Rules).

This is the first component to sit on `bg/overlay`, and that changes the contrast problem: every
token had to be measured against the overlay, not the canvas. Two new tokens came out of it.

- **`bg/overlay-hover`** — Dark `alpha/white-08`, Light `alpha/black-06`, scopes
  `FRAME_FILL`/`SHAPE_FILL`. Lifts 1.28 Dark / 1.14 Light. Necessary because **`bg/layer-hover` is
  *darker* than `bg/overlay` in Dark** (`#292929` on `#333333`) — reusing it would have made the
  hovered item go backwards. This is the **fourth** token to hit the alpha rule (`bg/chip`, the
  Light strokes, `bg/nav-hover`, now this). The rule is settled: any fill that must stay visible on
  a surface it does not control is alpha, not an opaque rung.
- **`status/danger-fg-strong`** — Dark `red/140` `#efa3a6`, Light `red/60` `#a4262c`, scopes
  `SHAPE_FILL`/`TEXT_FILL`. `status/danger-fg` is tuned for a Danger badge sitting on
  `status/danger-bg`; on the menu hover plate it measures **3.52 Dark / 4.31 Light**, both under
  4.5 — and hover is exactly the moment the pointer is on the item about to be clicked. Measuring
  the whole red ramp showed **no single rung clears both modes** (Dark wants `red/140` at
  6.29 / 4.90; Light wants `red/60` at 7.26 / 6.35), which is why the token is mode-dependent
  rather than one shared value. Same shape as the `confidence/*` fix — do not "tidy" the two modes
  onto one rung.

Decisions worth not relitigating:

- **Both sizes are 240 wide, fixed.** A fixed width keeps the destructive item in the same place
  every time, so it is never hit by muscle memory aimed at the item above it. Compact is the
  overflow control on a row (three actions, one separator); Full is right-click on a card and adds
  the actions that only make sense with the record in view.
- **The destructive item is always last, alone, below a separator.** The separator groups; it does
  not inform. It is `stroke/divider` inset in a 5-tall wrapper at 1.20 Dark / 1.14 Light, sub-3:1
  by design.
- **A disabled item stays in place rather than disappearing** — recurring shape #7 again. Removing
  it would reflow the menu between openings.
- **The surface tie is a non-defect.** `bg/overlay` measures 1.46 Dark / 1.14 Light against
  `bg/canvas` and 1.30 / **1.00** against `bg/layer` — in Light it is the same value as
  `bg/layer`. An overlay is separated by **elevation**, not by surface value; `elevation/8` is what
  makes it read as floating. Every prior attempt to break this tie by moving the token created a
  worse collision elsewhere (see the Light surface section). A menu without its shadow is a bug,
  not a style choice.

Measured, all computed in the script that wrote the copy: label 12.63 Dark / 16.48 Light rest and
9.84 / 14.42 hover; icon 8.69 / 10.05; destructive 6.29 / 7.26 rest and 4.90 / 6.35 hover; check
`fg/accent` 4.50 / 5.38; disabled 1.89 / 2.24 (fails AA by design, WCAG-exempt); edge
`stroke/subtle` 1.28 / 1.20.

One defect the render caught that the structure did not: **the Compact variant shipped with its
second item baked as `State=Hover`**, so every instance of Compact anywhere in the file would have
shown a phantom hover plate. A container variant must ship at rest — a state baked into a
container is invisible to a geometry read-back and only shows up when you look at the image.

### Modal — closed out 2026-08-04

Set `370:112` on `10:26`, 4 variants, one axis — `Type` = Confirm 400×220 / Destructive 400×220 /
Form 560×268 / Choose 720×332. Doc `373:37` with four sections (Types, Anatomy, In use, Rules).
Built entirely from shipped components: Button (Secondary + Primary/Danger), Text Input Medium,
Checkbox, Icon `44:37` close. **No new component and no new token were needed** — `bg/scrim`
already existed and had never been consumed.

**Width is part of the type, not a grid decision.** 400 for a question, 560 for a single field
(400 truncates a 40-character collection name), 720 for a list that must show a collection name
*and* its record count. Widening a Confirm to match a Choose only pads the question with air.

Decisions worth not relitigating:

- **The scrim is the component's real subject.** `bg/scrim` is 50% black in Dark, 30% in Light,
  and lifts the modal to **1.57 Dark / 2.38 Light** against the dimmed page. It is the only cue
  that the page beneath is inert, so it covers the *whole* viewport — rail and bar included. The
  `In use` stage proves this literally: Sidebar Expanded + Top Bar Synced + Section Header + five
  Rows, all under one full-bleed scrim rect with `STRETCH` constraints.
- **`elevation/16`, the highest step used anywhere in the file.** Context Menu sits at
  `elevation/8`. A modal outranks every other floating surface because nothing above it may be
  interacted with. Same reasoning as the menu: the surface is near-flat (1.46 Dark / 1.14 Light
  against the page) and separated by shadow, not by value.
- **Footer order is fixed forever: Cancel left, action right.** The action is rightmost because
  that is where the pointer finishes reading, and Cancel sits left of it so a mis-aimed click
  lands on the safe control. Stable across all four types so muscle memory transfers.
- **The action button names itself** — Hide, Re-run, Create, Add. Never OK. A reader who only
  reads the button still knows what they authorized.
- **Destructive states what is *not* lost.** "Control Ultimate Edition stays in your Epic account"
  is the first line of the body, because the fear the reader brings to a Hide dialog is deletion.
  The data makes this literally true: Game ID owns no records, it only reads Epic.
- **The modal sits at 40% of the stage height, not 50%.** Slightly above centre keeps the footer
  clear of the fold on a 1080 screen.

Measured, all computed in the script that wrote the copy: title 12.63 Dark / 16.48 Light; body and
close glyph 8.69 / 10.05; Choose option row `bg/subtle` on `bg/overlay` 1.15 / 1.25 with its count
in `fg/tertiary` at 6.48 / 5.36; edge `stroke/subtle` 1.28 / 1.20 (sub-3:1 by design — the edge
tidies the corner where the shadow fades, it is not the surface cue).

One defect the render caught: the **Form variant's Text Input shipped carrying the Top Bar's
placeholder, "Search your library"** — a "new collection" dialog asking the reader to search. An
instance inherits the main component's text, and the main component's text was authored for a
different host. **Retarget every string on a reused instance, not just the ones the variant adds.**
This is the same shape as Game Card / Row's inherited `Show icon` boolean: a component instance
carries its origin's content, and the origin was written for somewhere else.

### Pagination — closed out 2026-08-04

Page Button `391:39` (5 variants — Rest / Hover / Current / Focus / Disabled, 32×32 on
`control/height-md`, `radius/medium`, focus ring drawn `OUTSIDE`), Pagination `392:186`
(Type = Full 960 / Compact 320 × Position = Start / Middle / End, 6 variants at height 32), doc
`395:85` with seven sections (Types, Position, Page button, Anatomy, In use, Rules). Built
entirely from shipped components — Page Button, Select Medium, Divider Vertical, Icon
`44:73`/`44:64`. **No new token was needed.**

**The slot run is fixed at seven slots, 248 px, in every position** — 7 × 32 plus 6 × 4. That is
the whole design. A run that grows and shrinks as you page moves the arrows under a pointer that
is already there, so the reader's next click lands on a different control than the one they aimed
at. Everything else follows from holding that width: first and last page always shown, the current
page always keeps a neighbour on each side, ellipses fill the gaps, and where there is no gap the
run pads outward from the current page.

**⚠ The rationale was re-derived 2026-08-22, not recaptioned — `TODO.md` B10, route 1, user-approved.**
This component was originally argued from a library size that was never measured, via "20,400 at 50 is
408 pages". That premise is retired. **The component is unchanged and was deliberately not re-scoped**;
what changed is the reason, and the reason now has to stand on its own:

- **A run that never reflows under the pointer is correct at any corpus size.** That argument never
  depended on the number of pages — it depends only on the pointer already being somewhere. This is
  why the component survived its premise dying.
- **At the real corpus the machinery is dormant, not wrong.** 226 records at 50 per page is **five
  pages**, so the run renders `‹ 1 2 3 4 5 ›`, there is no gap to elide, and the ellipsis and the
  first/last jumps never fire. Verified concretely on the Library wireframe (W9): the ellipsis had to
  be hidden on that instance. Dormant is the honest word — the slots are sized for the library to
  grow into.
- **At 25 per page it is ten pages, and `1 2 3 4 5 … 10` exercises the run exactly.** Kept in the copy
  as a **worked example only** — explicitly *not* as an argument for lowering the page-size floor.

Decisions worth not relitigating:

- **The readout leads, and it is stated in records with a total** — `1–50 of 226`. A bare
  page number tells the reader nothing about how much is left. Under a filter it reports the
  *filtered* total; the library total is only correct when nothing is filtered.
- **Previous and Next stay in place at the ends and go Disabled**, never disappear —
  recurring shape #7. Removing either would shift the whole run by 36 px between pages.
- **The ellipsis is not a button.** It takes no hover and no focus. It holds the run's width where
  pages were elided; making it clickable invents a destination nobody aimed at.
- **No page size below 50 — as a default, not as arithmetic.** A slot holds three digits, which caps
  the control at 999 pages, and that ceiling is real. But the *floor* no longer has a numeric argument
  behind it: at 226 records nothing below 50 breaks anything. It stands because 50 is the right amount
  of scrolling per page, which is a judgement, and the doc now says so rather than dressing it as
  a calculation.
- **The page size sits outside the slot run, behind a 1 × 20 divider.** It is a setting, not a
  destination — which is exactly what the divider is separating.
- **Compact is 320 and steps only.** It is for a panel or a card footer. Never use it on a set
  large enough to need a jump — the numbered run exists for exactly that case.
- **The current page is two cues** — a `brand/rest` plate *and* the readout naming the page in
  words. The plate measures **2.77 Dark / 4.72 Light** against the page, under the 3:1 graphic
  floor in Dark, accepted on the Brand chip precedent: the white label clears 4.5:1 and the plate
  is never the only cue.

Measured, all computed in the script that wrote the copy: range readout `fg/secondary`
**12.68 Dark / 8.82 Light**; page-size value `fg/primary` 18.42 / 14.46; Rest slot 12.68 / 8.82;
Hover plate 1.27 / 1.09 with its label lifting to 14.55 / 15.79; Current label 6.66 / 5.38;
ellipsis `fg/quaternary` 6.07 / 5.04; Disabled arrow 2.76 / 1.97 (fails AA by design,
WCAG-exempt); divider 1.16 / 1.14 (sub-3:1 by design).

Three defects the render caught that a structural read-back did not:

- **Every gap and padding written this session was unbound**, because the Spacing collection uses
  bare names and `V['spacing/L']` was `undefined` — a silent no-op. Swept by value; 11 bound, then
  `{rawCount: 0, boundCount: 62}`.
- **All 12 arrow glyphs reverted to `fg/primary`** after the `INSTANCE_SWAP` was applied, so a
  Disabled arrow rendered identically to a Rest one. Both of these are now in Hard-won API
  knowledge.
- **The Hover specimen was invisible at 1.00:1** — the Page button specimens sat directly on the
  `bg/subtle` Body panel, and `bg/subtle` = `bg/layer-hover` = `#292929` in Dark. Recurring shape
  #3, and the fix was to change the *host*, not the token: every specimen now sits on a `bg/canvas`
  tile, which is also the surface a page button actually lands on. That change then went stale on
  two captions carrying `bg/subtle` figures (recurring shape #4) — all five Page button captions
  and the Types note were recomputed against the new host.

**Select still has no "value shown" state.** Its Rest variant renders a Placeholder, so the
`50 per page` value needed an instance-level rebind to `fg/primary`. Worth a variant when Form
Controls is revisited.

### Empty State — closed out 2026-08-04

Set `417:128` on `10:28`, 8 variants at 976×948, two axes — `Type` = No results / No connection /
Empty collection / Error × `Size` = Page 560 / Panel 320, plus the boolean `Show action#417:0`.
Doc `419:34` with seven sections (Types, Sizes, Action, Anatomy, In use, Rules). Built entirely
from shipped components — Button, and the file's own icons `44:19` search, `45:130` link,
`44:106` grid-view, `45:35` error. **No new component and no new token were needed** — `bg/chip`
already does the icon plate, and it is the fifth consumer of the alpha-plate rule.

**Four types because there are four reasons a region comes back empty**, and each one has a
different way out. The type is chosen by the *cause*, never by the layout:

- **No results** — recoverable by the reader. The filter matched nothing; the only thing that
  changes the answer is changing the filter, so the action is **Secondary** `93:124` "Clear
  filters", not Primary. Nothing here is broken.
- **No connection** — the first-run state. Game ID reads from a store account and none is
  connected, so this is the one type whose action is genuinely the sole route forward: Primary
  "Connect a store".
- **Empty collection** — a container the reader made and has not filled. The body says a
  collection is *a view of records you already own*, because the reader has not lost anything.
- **Error** — the answer never arrived. Tinted `status/danger-fg`, and the body names the Epic
  account explicitly: "Your games are safe in your Epic account — nothing was lost."

Decisions worth not relitigating:

- **Page 560 and Panel 320 are scope, not scale.** Page is the whole content column coming back
  empty; Panel is a card or a band inside a view that still works. The distinction decides the
  action's rank: **never a Primary in a Panel** — a panel does not own the view, so its action
  must not outrank the view's own. Panel defaults to Subtle `93:184`.
- **The body is capped at a 400 px measure inside the 560 Page**, not run to full width. At 560
  a two-line sentence renders as one long line and the centred block loses its shape. This cap is
  what grew the Page variants 174 → 194 and overflowed the set frame — see Hard-won API knowledge.
- **Panel copy is rewritten, not truncated.** "No matches" is a shorter *sentence*, not a clipped
  "No games match these filters". A Panel title that ends mid-phrase reads as a rendering bug.
- **The action is a property, not a rebuild.** `Show action#417:0` toggles the Actions frame, so
  a state with no useful action keeps its geometry. Turn it off entirely when nothing the reader
  can do here would change the answer — an empty state offering a choice has stopped explaining
  the emptiness and started being a menu.
- **The chrome that produced the emptiness stays.** The `In use` stage is Library under three
  Selected filter chips that matched nothing: header, chips and Clear all all remain, and only the
  list is replaced. That is the whole rule — an empty state fills the region that came back empty,
  never the page.
- **The header count reads 0, not the library total.** This is the shipped Section Header rule applied
  literally: the count must match what is rendered, and under a filter that is the filtered figure.
  Setting it to zero is more honest than hiding it.
- **Pagination is gone rather than disabled**, which is the one place this component departs from
  recurring shape #7. There is no range to report; a control reading "0–0 of 0" is worse than no
  control. Sort *stays*, because removing it would reflow the chrome between a full page and an
  empty one.

Measured, all computed in the script that wrote the copy: title `fg/primary` **18.42 Dark /
14.46 Light** on canvas and 16.48 / 16.48 on a card; body `fg/secondary` **12.68 / 8.82** on
canvas, 11.34 / 10.05 on a card; icon `fg/quaternary` on the composited chip plate **4.94 / 4.42**
over canvas and 4.29 / 5.02 over a card; Error's `status/danger-fg` on the plate 5.36 / 3.79 over
canvas and 4.66 / 4.31 over a card; Primary label `fg/on-accent` on `brand/rest` 6.66 / 5.38;
Secondary label 16.48 / 16.48; chip plate vs canvas 1.23 / 1.14 and vs layer 1.27 / 1.14 (sub-3:1
by design — the plate is a shape behind a glyph, never the cue itself).

Two defects found this session that a structural read-back would not have caught:

- **The `In use` header rendered 20,400 under a filter matching nothing** — a direct violation of
  the Section Header rule the file already ships. The earlier attempt to suppress it had used
  `Show count#287:15`; the real key is `#287:14`, and a wrong key is a silent no-op. Now in
  Hard-won API knowledge.
- **The set frame overflowed itself by 20 px** after the 400 px measure cap grew the Page
  variants, and the grid was also ignoring the padding convention every other absolute-positioned
  set uses. Relaid out on PAD 24 / GAP 48 with per-row height = max(Page, Panel). Also now in
  Hard-won API knowledge.

The set screenshot renders washed out on its own frame — **that is recurring shape #11, not a
defect.** A set frame carries no fill (verified `fill: null` on Badge `53:50`, Confidence `55:52`,
Button `93:454`, Context Menu `354:1629`, Modal `370:112`, Pagination `392:186`), so the alpha chip
plates composite against nothing. Verify alpha-bearing components in real usage — the doc panels
and the `In use` stage — never against the set.

### Charts — closed out 2026-08-05 · closes P3.5

Bar Chart `474:104` (4 variants — Size Full 720 / Compact 320 × Bars 4 / 3), Distribution Bar
`475:38` (2 variants — Size Full 720 / Compact 320), doc `478:2` (1560×3026) with six sections
(Palette, Bar chart, Distribution, In use, Rules). **No new token was created** — the phase existed
to consume the seven `viz/*` tokens that had been in the Color collection since P1 with **zero
component consumers**. Variable counts are unchanged at 215, so no Cover rewrite is implied.

**Measure the palette before designing against it, and use deltaE — not contrast ratio — for
categorical separation.** Two colours of equal luminance return 1.00:1 while being plainly
distinct, so a ratio-only pass would have hidden the whole problem. Three measurements set the
scope:

- **The viz ramp is sequential, not categorical.** Adjacent CIE76 deltaE: 1v2 **9.2** Dark / 8.5
  Light, 2v3 **7.4 / 8.6**, 3v4 **38.2 / 39.7**, 4v5 21.1 / 21.1, 5v6 10.6 / 14.9. Ranks 1–3 read
  as one blue. The single real step is rank-3 → rank-4 — blue giving way to grey. That is an
  **emphasis** boundary (the answer vs. the tail), never an identity one.
- **Only ranks 1–4 clear 3:1 on `bg/layer` in both modes.** rank-5 is 3.63 Dark but **2.24 Light**;
  rank-6 is **2.46 Dark / 1.45 Light**. Four data marks is the working ceiling of this palette.
  rank-5 and rank-6 stay in the collection, documented and unconsumed, for large fills where the
  shape carries the mark.
- **`viz/track` = `bg/canvas` = `#f0f0f0` at exactly 1.00:1 in Light.** Recurring shape #3. This is
  why every chart owns a `bg/layer` surface and is **never drawn onto the page canvas**.

Decisions worth not relitigating:

- **Two components, not a chart library.** No pie, no donut, no line, no multi-series anything — a
  multi-series chart needs colour to identify a series and at deltaE 7.4 this palette cannot. The
  corpus also forbids most charts outright: no completion field, 222/226 at zero *or null* playtime,
  one storefront, `tags`/`themes`/`franchise` 0% populated.
- **Values and legend are structural, not properties.** "Never ship a chart without its numbers"
  becomes impossible to violate rather than a rule someone has to remember. Same move as making the
  Confidence Badge's level word non-optional.
- **Every mark is a ratio of its track, never a fixed width** — Progress Bar's precedent (recurring
  shape #6). Verified at both widths: Bar Chart's largest error is **0.31 px at 720 and 0.13 px at
  320**.
- **Weight ratios at per mille, not per cent.** See Hard-won API knowledge — `layoutGrow` must be an
  integer, and percent-scale rounding drew a 0.88% segment at 13.5 px instead of 6.1.
- **Distribution Bar has one axis, because confidence has one shape.** A `Segments=4` axis was built
  and **deleted**: the array feeding it was confidence plus a duplicated `Low`, i.e. a fabricated
  fourth confidence level — the exact defect `TODO.md` B1 flags in Metric Card. The corpus has
  exactly one good 4-way split (`steamStatus`) and Bar Chart already spends it. **Inventing a
  variant for axis symmetry is how B1 happened.**
- **Confidence uses `confidence/*`, never viz ranks.** Those tokens already carry the meaning
  product-wide. Viz ranks are for dimensions that own no semantic colour — `steamStatus`,
  `classification`, genres, publishers. Two colour encodings for one dimension is the defect to
  avoid.
- **A chart nested in a card drops its own fill and padding.** Two `bg/layer` surfaces with nothing
  between them read as a rendering seam; the card owns the elevation and the title.
- **A chart band's Section Header ships `Show count` off.** There is no rendered record list, so
  there is no number for a count to match — the shipped Section Header rule applied literally.

**The stacked-bar measurement that matters is segment against *neighbour*, not segment against
surface.** This was a real defect in my own copy, caught only in Light: I published `confidence/*`
against `bg/layer` (7.70 / 10.22 / 8.21 Dark, 8.01 / 11.44 / 10.75 Light) as evidence the segments
were legible. In a stacked bar the segments **tile the whole track — nothing is behind them.**
Measured correctly:

| pair | Dark deltaE | Light deltaE | Dark ratio | Light ratio |
|---|---|---|---|---|
| high \| medium | 58.1 | 45.3 | 1.33 | 1.43 |
| medium \| low | 52.1 | 36.1 | 1.25 | **1.06** |

Comfortably separated **by hue**; at `medium|low` **1.06:1 in Light**, essentially not separated by
**luminance** — so that boundary does not survive a greyscale export or a colour vision deficiency.
Fixed **structurally, not at the token layer**: a **2 px `bg/layer` rule** between segments, which
is achromatic and therefore holds in every mode and every export. Moving `confidence/*` was never an
option — they are tuned as 12 px text colours and back the Confidence Badge. Proportions held
exactly through the change (27.9 / 71.2 / 0.9 against a true 27.88 / 71.24 / 0.88).

Measured, all computed in the scripts that wrote the copy — **including the Rules columns, which is
where I got it wrong first.** Palette and section notes were live from the start, but the Rules
columns and specimen captions shipped hardcoded figures: recurring shape #4 in work written minutes
earlier. Every number on the page now derives in the script that writes it — ratios and deltaE from
the tokens, bar and segment widths read off the live instances.

Four more defects the render caught that a structural read-back did not:

- **The Full legend grouped each value with the wrong label.** Items were `layoutGrow = 1` with
  right-aligned values, so `63` sat closer to `Medium` than to `High`. Proximity beats order — items
  now hug, 8 px inside an item against 20 px between.
- **The `In use` Section Header shipped the `Library` copy it was authored with.** Same
  inherited-content trap as Modal's placeholder and Game Card / Row's inherited boolean: an instance
  carries its origin's content, and the origin was written for somewhere else.
- **The two `In use` cards top-aligned at 134 and 258**, a ragged bottom edge that reads as a layout
  bug. Both FILL to 258.
- **The `In use` stage carried 68 px of dead space** because its content column was set to FILL
  inside a FIXED stage.

Close-out audit clean on all six checks: zero mode pins on the page, zero raw fills, zero raw
spacing, **zero nested non-rest states**, every top-level node tagged, neither set frame
overflowing.

### Wireframes — closed out 2026-08-22 · closes P4

**Read this before touching `10:32`.** Seven wireframes exist and were **already built when the
2026-08-06 session started** — the page map said "empty", which was wrong for the third time in this
project's history. The audit is what caught it; acting on the "empty" marker would have rebuilt
finished work.

**State: 7 screens · 8-node annotation layer · all 9 defects CLOSED · all 15 top-level nodes
verified in Dark *and* Light · six-check close-out audit clean.** The defect count went 8 → 9 because
the sweep found W9 (the Library pager still reporting a retired total), then closed it.

| Wireframe | Id | Size | At | Annotation | Closed |
|---|---|---|---|---|---|
| Library | `494:2` | 1560×**1576** | 0, 0 | `549:943` | W9, W8 fold marker |
| Collections | `496:329` | 1560×1080 | 1680, 0 | `549:946` | W8 |
| Stores | `496:432` | 1560×1080 | 3360, 0 | `549:949` | W6, W8 (lifted out of `496:536`) |
| Accounts | `497:491` | 1560×1080 | 0, 1816 | `549:951` | W2 ×3, W8 |
| Analytics | `497:630` | 1560×1080 | 1680, 1816 | `549:954` | **W1 🔴**, W2 ×2, W8 |
| Search | `499:731` | 1560×1080 | 3360, 1816 | `549:957` 1560×166 | W3 |
| Settings | `499:867` | 1560×1080 | 0, 3136 | `549:960` 1560×118 | W4 ×2, **W5**, W7 false alarm |

Plus the page-level note **`549:938`** "Wireframes — Page note" 1560×220 at **(0, −316)** — above the
grid, so it reads as a masthead rather than as a caption on Library. Per-screen notes sit 32 px below
their frame. **15 top-level nodes total**, re-verified live 2026-08-22.

Full measured detail per defect is in `TODO.md` A3; the four findings worth carrying here:

- **W1 is genuinely closed and internally consistent** — `I497:724;152:34` now reads
  **`132 of 226 records enriched`** under a `58%` value (132/226 = 58.4%), beside a card reading
  `226`. **Zero residual hits** for `1,247` / `20,400` / `724 of` across all seven frames.
- **W2 was an instance-copy fix on the `Caption` node, not a property fix** — `Detail#156:26` is
  wired to only 3 of 12 Metric Card variants, so `setProperties` silently no-ops on nine. That is
  now `TODO.md` **B11**, and **wiring the property would be actively harmful** per the Section
  Header precedent. Every figure on Accounts and Analytics now reconciles to the corpus: 34+98 = 132
  enriched, 17+77 = 94 unenriched, 51+175 = 226, "Needs manual review 2" = confidence Low 2.
- **W7 was a false alarm** — 30 bound, 0 unbound. See § Notes item 6 for the audit-trust corollary.
- **W8 is narrower than recorded.** There is no page-level annotation layer and the 240 px `ROWGAP`
  is unused, but annotation *prose* already exists on three frames — Stores `496:537`, Search
  `499:866`, Settings `499:986`. Four frames have none. Stores' annotation sits **inside** the
  product panel "Add store" `496:536` and must come out before P6 mistakes it for UI.

**Verified in Light 2026-08-22, all 15 top-level nodes.** Pinned to Light mode `2:7` one node at a
time, screenshotted, read, then **cleared** — 15 pins set, 15 cleared, zero left behind. This is the
whole reason the mode-pin rule exists: a pin on a doc FRAME is correct and temporary, a pin left on
anything is a permanent freeze. No Light-only defect was found on any of the seven screens, which is
the expected result for wireframes built entirely from already-Light-verified components — it
confirms the components, it does not excuse skipping the check.

**Landed 2026-08-06 — the Library geometry fix.** `494:2` held **1544 px of content in a 1080 px
frame**: `Grid` `494:168` ran y=192→1488 and `Pagination` `494:305` sat at y=1512, so two of three
card rows and the entire pager rendered nowhere. Root cause was **`layoutGrow = 1` on `Page`
`494:119`** — see Hard-won API knowledge; it silently rejects HUG. Fixed by clearing the grow, then
letting `Page` → `Content column` `494:84` → root hug, with `Rail` `494:3` set to FILL. Library is
now **1576 tall with overflow 0 and the pagination visible.**

That change forced a **page relayout**, because Library at 1576 would have overlapped Accounts at
y=1240. All seven are now on a deliberate 3-column grid — `x` = 0 / 1680 / 3360, rows at
y = 0 / 1816 / 3136, `ROWGAP` 240 to leave room for the caption layer that does not exist yet.
**Verified zero pairwise overlaps.** Do not hand-place a frame on this page; extend the grid.

**The last two defects, both closed 2026-08-22.** Node ids in `TODO.md` A3.

- **W5 🟡 A size-dependent claim that was false at 226 records.** `499:986` read *"Below 50, the page
  count outgrows the pager's seven fixed slots."* At 226 records, 25-per-page is 10 pages and fits
  fine. Rewritten under **approved route 1** alongside the Pagination doc `395:85` in one pass, so the
  caption and the component tell one story: the run is **sized for the library to grow into**, and at
  this corpus the ellipsis is **dormant, not wrong**. Pagination was **not re-scoped**.
- **W8 🟡 The annotation layer**, built into the unused 240 px `ROWGAP` — one page-level note plus
  seven per-screen captions, ids in the table above. Stores' prose was **lifted out of the product
  panel `496:536`**, where P6 would have read it as UI. Library gained its fold marker at 1080. The
  four bare frames gained annotation. Every other page in this file states its own rationale on
  canvas; this page now does too, which is what stops a reviewer relitigating settled layout.

**The other seven, closed the same day.** Kept in one block because the *shapes* recur, not the nodes:

- **W1 🔴** Analytics' fabricated `724 of 1,247` → `132 of 226 records enriched`, verified consistent
  with the `58%` value above it and the `226` card beside it. Zero residual retired figures page-wide.
- **W2 🟠 ×5** the inherited "Across 1 connected store" footer, on Accounts `497:577` / `497:586` /
  `497:595` and Analytics `497:715` / `497:741`. Fixed on each card's **`Caption` node** — the
  `Detail#156:26` route silently no-ops on 9 of 12 variants (`TODO.md` **B11**). Accounts' third card
  now explains *why* 6 titles are counted twice, which was the whole point of the footer.
- **W3 🟠** Search's Top Bar → `State=Filled` with the text `control`. **The `Filled` variant carried
  its own inherited content, "Half-Life 2"** — a variant swap does not free you from the
  inherited-content trap, it hands you a different origin's copy.
- **W4 🟠 ×2** both Settings switches' stray literal "Label" hidden; the underlying component gap
  stays open as **B9**, now with two consumers paying the per-instance workaround.
- **W6 🟡** was the Stores card footer — the same inherited-footer defect as W2, not a separate one.
- **W7 🟠** **false alarm**: 30 bound, 0 unbound. Nothing to fix.
- **W9 🟡** *new, found by this sweep*: the Library pager read `1–50 of 20,400`. Now `1–50 of 226`,
  with the ellipsis and the `408` hidden because **226 at 50 per page is five pages** — the run
  renders `‹ 1 2 3 4 5 ›` with no gap to elide. Overflow 0. This is B10 made concrete: at this corpus
  the seven-slot machinery is **dormant, not wrong**.

**Two findings that are not defects, and matter more than the defects.**

- **There is no Dashboard, and that is correct.** The shipped Sidebar's destinations are Library,
  Collections, Stores, Accounts, Analytics, Search, then Settings — **seven, and exactly the seven
  wireframes that exist.** So the set is not missing a screen; **page `10:35` "Dashboard" is an
  orphan name predating the rail design.** Do not invent a destination the shipped Sidebar does not
  have. **Decided 2026-08-09: dropped from P6 scope**; deleting the page is optional cleanup.
- **`TODO.md` B6 is CLOSED, and it was false.** Settings `499:963` renders `State=Filled`, so the
  render already contradicted the claim — but the item itself said instance evidence was not proof,
  because the observation came from an audit of instances rather than of the set. Probing the set
  settled it: **Select `109:114` is `Size` [Small, Medium, Large] × `State` [Rest, Hover, Focus, Open,
  Filled, Error, Disabled]** — 3 × 7 = 21, every variant accounted for. **`Filled` ships on all three
  sizes and always did.** This is the third time this document has asserted an absence that a one-call
  probe disproved (`brand/tint` vs the existing `brand/subtle`, `Icon / person`, now this). The rule:
  **read the set or the collection before writing down that something does not exist.**

**Close-out audit, all six checks clean** across all 15 top-level nodes: **zero mode pins** on any
COMPONENT / COMPONENT_SET / INSTANCE · **zero raw fills** · **zero raw spacing** — re-measured
2026-08-22 at 30 bound / 0 unbound, which retired the one check that had ever failed here ·
**zero nested non-rest states**, every apparent one legitimate (the rail's Selected item is the
destination you are on, `Unselected` is a Filter Chip at rest, Pagination correctly ships
`Previous=Disabled` + `Page 1=Current`, and Settings' `Filled` / `On` controls are a settings screen
showing its current values) · every top-level node tagged · zero pairwise overlaps on the grid.

**P4 is closed. P5, page templates `10:33`, is in progress as of 2026-08-23** — `HANDOFF.md` §9 holds
the entry plan, the pre-flight is done live, and the 🔴 blocker recorded below **cleared the same day**
(§ Current status). The layout on `10:32` is now **settled architecture**: P5 and P6 refine it, they do
not reinvent it, and **no frame is hand-placed on this page** — extend the 3-column grid.

**✅ The `20,400` component-layer sweep is CLOSED, not open.** An earlier revision of this file said
*"Not P4, still open"* and told the next session to fix the components, re-scan, then clean residual
overrides. **That is exactly what was done on 2026-08-22**, and the result is recorded in
`HANDOFF.md` §8 item 2 and `TODO.md` B2/§E: the sweep corrected **26 text nodes in three shapes at
five source components** across the eight doc pages plus `10:32`, fixing the Count Badge instances
*inside* Section Header `286:82` (`I286:6;55:54`, `I286:13;55:54`, `I286:30;55:54`) and Nav Item
`301:44` (`I301:6;55:56` … `I301:25;55:56`) **first**, then re-scanning — which is what stopped it
regrowing into Top Bar, Modal and the wireframes. Final file-wide sweep: **`bareCount 0`**. No
future instance of those two sets inherits the retired figure. Reconciled 2026-08-23; this paragraph
was the last place in the document set still describing the work as pending.

**The 2026-08-22 environmental block cleared, and a different one arrived on 2026-08-23.** On
2026-08-22 the Figma MCP was disconnected and disk space was preventing the workspace from starting,
which killed the screenshot loop; the user confirmed both were environmental, and both were working by
the end of that day. The instruction during that outage was **"don't work around either blocker"**, and
it was honoured: nothing was mutated blind and no defect was closed on a structural read-back alone.

**A second outage on 2026-08-23 — recorded as a diagnostic lesson, because it CLEARED the same day.**
For part of that day no `use_figma`, `get_screenshot`, `get_metadata` or `ToolSearch` existed in the
session's tool list, so there was genuinely nothing to retry: an absent tool cannot fail when called,
and loading the `figma-use` skill does not surface a deferred one. **The cause was session binding, not
connectivity** — `claude mcp list` reported `plugin:figma:figma: https://mcp.figma.com/mcp (HTTP)`
**✔ Connected**, bundle `figma_prod@2_2_96`, throughout. Tools are enumerated once at launch, so **the
fix is to start a fresh session**; that is what cleared it, and three read-only scripts then returned
data.

**Four "confirmations" recorded during that outage answered the wrong question, and this is the part
worth keeping.** `C:\Users\Sufiyan\.claude.json` reading `mcpServers: []` proves nothing when the scope
is *dynamic config from the command line*. The absent Figma process, the dead localhost ports and
`curl … → 000` are all irrelevant to a **remote HTTPS** endpoint at `mcp.figma.com`. And "a browser tab
gives the session nothing" is false when the server is hosted. **Non-vacuous zeros to the wrong question
are still wrong answers** — the same shape as § Notes item 11, where a figure was freshly measured
against a neighbouring question. The one trap that survives the fix: the desktop app's **Dev Mode** MCP
server (localhost 3845) is *not* a substitute — it serves read-only code/image/variable tools and cannot
execute Plugin API scripts, which is precisely what building `10:33` requires.

**The instruction during both outages was "do not work around it", and it was honoured** in each:
nothing was mutated blind and no defect was closed on a structural read-back alone. That discipline
still governs now that the tools are back.

**What was done during the 2026-08-23 outage, none of it needing the file:** `TODO.md` §C closed
entirely (C1 was a false docstring claim, C2's premise had expired); a **live data-destruction bug**
found and fixed in `tools/parse_receipts.py`; `DATA_PIPELINE.md` §7 independently re-verified in full;
two new measured findings (`title` is not unique, `1,299 INR` is fabricated); and the document set
reconciled. Detail in `CHANGELOG.md` 2026-08-23 and `HANDOFF.md` §8 items 9–12.

### Loading & Skeleton — closed out 2026-08-05 · closes P3.4

Set `451:2` on `10:29`, 4 variants, one axis — `Type` = Grid card 240×416 / Row 960×56 /
Metric card 356×148 / Text line 320×20. Doc `454:2` (1560×2986) with six sections (Variants,
Anatomy, Motion, In use, Rules). Three new tokens: `alpha/black-12`, `bg/skeleton`,
`duration/pulse`.

**A skeleton is the exact geometry of the component it stands in for.** That is the whole
component. Every variant was measured pixel-exact against its real counterpart before being built —
Grid 240×416 with a 320 cover, Metric 356×148 with a 64 top block, Row 960×56 with a 36 text block,
Text line 320×20 — so nothing moves when the real record lands. **`HANDOFF.md` §9 says the Grid card
is 240×320; the live set `221:141` is 240×416.** 320 is the *cover* height (`layout/card-cover-height`),
not the card. Measure the counterpart, never quote a doc.

**New token `bg/skeleton`** — Dark `alpha/white-12`, Light new `alpha/black-12`, scopes
`FRAME_FILL`/`SHAPE_FILL`. This is the **sixth** consumer of the alpha rule (`bg/chip`, the Light
strokes, `bg/nav-hover`, `bg/overlay-hover`, now this). A skeleton block lands on a card interior,
the page canvas *and* a `bg/subtle` documentation panel, and controls none of them — the exact
condition the rule names. Measured **1.40 canvas / 1.45 layer / 1.46 subtle / 1.46 layer-hover** in
Dark and **1.31 / 1.32 / 1.31 / 1.31** in Light. 12% is deliberately stronger than the 8% used for
plates: a plate sits *behind* content that carries its own perceivability, whereas a skeleton block
**is** the content and has nothing in front of it.

**New token `duration/pulse` — derived, not picked.** `Motion` topped out at `duration/slower` 400 ms,
which is a **transition** ceiling; reusing it as a loop period is the same category error as reusing
`bg/chip` for a skeleton block. `duration/pulse` = **3 × `duration/slower`** read live = **1200 ms**,
and the derivation is stated in both the variable description and the page copy so it survives a
change to the base. A loop must be clearly slower than the slowest state transition or the two read
as the same event. **Loop period only — never use it for a transition.**

Decisions worth not relitigating:

- **The variant is chosen by what is loading, never by how much space is free.** A Row skeleton in a
  grid slot tells the reader the wrong thing is coming.
- **Blocks never carry text, an icon, or a real colour.** A skeleton showing a store mark or a
  partial title is not a skeleton — it is a half-rendered record, and the reader will try to read it.
- **The pulse runs on the whole skeleton at once, in phase.** Staggering blocks reads as content
  arriving one field at a time, which is a claim about progress the view cannot make. Honour
  prefers-reduced-motion by holding the block **at rest** — the skeleton still reserves the space,
  which is its actual job.
- **Opacity is the only animated property**, 100% → 40%, on `easing/standard` `cubic-bezier(0.33, 0,
  0.67, 1)` — symmetric in and out, because the pulse has no arrival, so it must not accelerate or
  decelerate as though it were about to finish. `bg/skeleton` is already alpha, so dimming composites
  correctly on every host without a second token.
- **Skeletonise only the region that is waiting.** Chrome the app can render from state it already
  holds — rail, bar, header, filters — renders normally. This is the Empty State rule applied to
  loading: the state fills the region, never the page.
- **Never leave a skeleton on screen with no request behind it.** If nothing is in flight, the region
  is empty, not loading — that is Empty State. A skeleton that never resolves is indistinguishable
  from a hang.
- **Fill the visible area, not the whole list.** Enough rows or cards to reach the fold, so the
  reader sees a loading list rather than a loading fragment.

Measured, all computed in the scripts that wrote the copy: title `fg/primary` **18.42 Dark /
14.46 Light**; body `fg/secondary` **12.68 / 8.82**; caption `fg/quaternary` on `bg/subtle`
**4.80 / 4.60**; edge `stroke/subtle` 1.27 / 1.20 (sub-3:1 by design).

Four defects the render caught that a structural read-back did not — three mine, one shipped:

- **The `In use` rail rendered a `20,400` count badge on Library.** It violates the shipped Section
  Header rule *and* the note I had written two calls earlier, and it put B2's disputed number into
  new work. Hidden (`I457:36;302:5;301:18`).
- **My `In use` copy claimed a Sort control the header did not render** — `Actions` defaulted to
  `None`. Fixed with the key read live off `sh.componentProperties` (`Show count#287:14`, the same
  trap that silently no-opped on Empty State).
- **Five Grid cards overflowed the content column** — 5 × 240 + 4 × 24 = 1296 in a 1152 grid, and the
  stage clipped the card row mid-height. Now four cards, stage 700 → 780.
- **🔴 Shipped defect in Sidebar `302:96`: both variants baked `Stores` as `State=Hover`**
  (`302:23` Expanded, `302:74` Collapsed), so **every Sidebar instance in the file** rendered a
  phantom hover. Recurring shape #15, and the second time it has appeared — the Context Menu had the
  same defect. Verified against the Sidebar doc `304:2` first that no instance was relying on it as a
  hover demo (the three instances `308:5` / `308:93` / `305:86` sit in "Cell — Expanded",
  "Cell — Collapsed" and "In use / Shell"), then set both to `State=Rest`. **Audit nested instance
  variant *values* on any container set you build on.**

Two tokens found already in the file that this build did not need but that correct earlier notes.
Both verified live 2026-08-05 with scopes and code syntax intact:

- **`bg/subtle-hover` `VariableID:5:7` exists** and was missing from the ladder table above.
- **`brand/subtle` `VariableID:5:16` exists**, which answers the "consider a `brand/tint` token — it
  does not exist yet" loose end. `brand/tint` genuinely does not exist, but `brand/subtle` is the
  token that role wants. Check it before creating anything new for a soft brand background.

Also confirmed while creating `alpha/black-12`: **`alpha/white-12` already existed** — the Dark side
of `bg/skeleton` needed no new primitive. The Primitives alpha family is now `black-06 / 08 / 12 /
30 / 50` and `white-04 / 06 / 08 / 12 / 18`.




`createInstance()` copies the source component's `explicitVariableModes`. The Button set, 74 of its
variants and the Badge set were pinned to **Dark**, so every instance ever created from them was
frozen Dark regardless of the mode of the page it sat on. In Light that renders `fg/secondary`
`#d6d6d6` on `#f0f0f0` — **1.28:1**.

Found by accident: my Top Bar's *Rest* buttons rendered paler than its *Disabled* one, which is
backwards. A structural read-back would never have caught it; only asking why the render disagreed
with the measurement did.

**This is what I had been calling a downscaling artifact.** Three times across earlier sessions I
looked at the Section Header Sort button in Light, saw it washed out, "verified" it at 8.82:1, and
concluded my eye was wrong. 8.82 is what you get resolving the *token* in Light. The *node* was
rendering at 1.28. Recurring-shape #13 has been retracted and replaced.

Swept **89 pins** off components, variants and instances across `10:13`, `10:14`, `10:22`, `10:23`,
`10:24`. Verified after: Section Header `286:82` and the Sidebar `In use` shell `305:85` both now
theme correctly in Light, Sort rendering as dark text on light.

**110 pins remain and must stay.** They are documentation FRAMEs — the Color page's paired
`Dark fill` / `Light fill` swatches and the Elevation strips exist precisely to show both modes at
once. The rule: **a pin belongs on a doc frame, never on a component, a variant, or an instance.**

Audit before trusting any Light screenshot:

```js
const color = (await figma.variables.getLocalVariableCollectionsAsync()).find(c=>c.name==='Color');
// walk every page; flag any COMPONENT / COMPONENT_SET / INSTANCE carrying explicitVariableModes[color.id]
```

### Sidebar & Nav Item — closed out 2026-08-02

Nav Item `301:44` (8 variants, Form × State), Sidebar `302:96` (2 variants), doc `304:2` (7
sections). Lowest text figure anywhere on the rail is **8.43:1**.

**New token `bg/nav-hover`** — Dark `alpha/white-08`, Light `alpha/black-06`, scopes
`FRAME_FILL`/`SHAPE_FILL`. Created because an opaque hover fill measured **1.00:1** against
`bg/nav` in Light: the hovered nav item was completely invisible. As alpha it lifts at 1.21 Dark /
1.14 Light, against the 1.13 / 1.04 the file already accepts for a card hover. **`bg/layer-hover`
must never be used on the rail** — it is the same hex as `bg/nav` in Light.

That is the **third** token to hit this exact wall (`bg/chip`, the Light strokes, now `bg/nav-hover`),
so it is now a general rule rather than three anecdotes: **any fill that has to stay visible on a
surface it does not control should be alpha, not an opaque rung.** Ask it of every hover, plate and
divider before picking a value.

Design decisions worth not re-litigating:

- **Selection is two cues** — `bg/layer-selected` fill *plus* a 2 px `brand/selected` bar, because
  the fill alone reaches only 1.39:1 against the rail in Light. The bar carries it at 5.96 / 4.58.
  It is 2 × 24, vertically centred, so it reads as a marker and not a border.
- **The Collapsed rail keeps state and the accent bar** and drops only labels and counts. Losing
  labels is the trade you are making; losing "where am I" is not.
- **Stores uses `Icon / store-generic`, not the Epic mark.** Branding the section for the one
  connected store makes adding a second store a redesign. (The Epic mark rendered as a filled plate
  that also read as permanently selected next to the real Selected item.)
- **Accounts uses `Icon / link`** — an account here is a connection to a store, not a profile.
  (The rationale recorded at the time also said "the file has no person glyph". **That part was
  false** — `Icon / person` `129:16` exists and always did. The choice is still right on its own
  terms; do not swap it for the person glyph.)
- **No Completion, Playtime or Recently played destination.** No completion field exists at all,
  222 of 226 records carry zero or unknown playtime, and "recently played" is a sort inside Library
  rather than a place. The data decides the destinations.

### Light surface collision — closed out 2026-08-02

The documented three-way `#f0f0f0` pile-up (`bg/canvas` / `bg/disabled` / `bg/layer-selected`) was
real. A full audit of every opaque `bg/*` and `stroke/*` in both modes found it was **worse than
recorded** — `stroke/subtle` and `stroke/divider` were *also* `#f0f0f0` in Light, so it was a
five-way, and card hairlines had never rendered on the page surface in Light at all.

**Root cause: the Light neutral ramp has six usable rungs for twelve surface-and-stroke roles.**
Shuffling opaque values only moves the collision — I confirmed this the hard way by trying it. Two
successive retargets each fixed one pair and created another. Dark had already solved the problem
years-of-decisions ago: its `stroke/subtle` and `stroke/divider` are `alpha/white-08` and
`alpha/white-06`. Light had flattened both to opaque grey, and that was the actual defect.

The fix, mirroring Dark:

- `stroke/divider` Light → `alpha/black-06`, `stroke/subtle` Light → new `alpha/black-08`.
  Both now hold **1.14–1.20 on every surface in both modes**, including `bg/layer-selected`, and
  are structurally incapable of colliding with a host.
- `bg/layer-selected` Light `grey/94` → **`grey/84` `#d6d6d6`**: 1.28 vs canvas, 1.45 vs layer,
  1.39 vs hover, 1.16 vs subtle — parity with Dark's own 1.46 / 1.30 / 1.15 / 1.15. All of
  `fg/primary` 11.34, `fg/secondary` 6.91 and `fg/tertiary` 4.60 clear 4.5:1 on it.
  **`fg/quaternary` measures 3.95 on selected in Light and 4.17 in Dark — do not put quaternary
  text on a selected surface.**
- `bg/disabled` deliberately **left** at `grey/94` = canvas. A disabled control being flat on the
  page is the correct semantic. The real defect there is that **Primary and Danger Disabled
  buttons carry no stroke** (`93:22`, `93:52`, `93:82`, `93:382`, `93:412`, `93:442`) while
  Secondary Disabled carries `stroke/subtle` — so in Light a Primary Disabled button on the page
  has no edge at all. That is a component fix, not a token one. **Still open.**

Two things I got wrong mid-fix, recorded so they are not repeated:

- I moved `bg/overlay` Dark off `grey/20` to break its tie with `bg/layer-selected`, which created
  a *new* collision with `stroke/default` at `#424242`. **Reverted.** Overlay ties are non-defects —
  an overlay is separated by its shadow, which is why `bg/overlay` = `bg/layer` `#ffffff` in Light
  has shipped correctly all along. Never "fix" an overlay collision.
- I created `grey/92` `#ebebeb` for the selected rung first. It measures **1.05 against canvas** —
  the narrowest gap on the ramp, invisible. Deleted. When picking a new rung, measure against the
  host *before* creating the primitive.

Surviving opaque ties, all verified non-defects — do not re-open:

| mode | tie | why it is fine |
|---|---|---|
| both | `bg/overlay` = layer-selected / layer | shadow separates an overlay |
| Light | `bg/canvas` = `bg/disabled` | disabled is meant to be flat on the page |
| both | `stroke/focus-inner` = canvas / layer | that *is* its job — the gap in a two-tone ring |
| both | `stroke/control` = `bg/media` | different roles, never adjacent |
| Light | `bg/layer-hover` = `bg/nav` | a nav rail and a hovered card never touch |
| Dark | `bg/layer-hover` = `bg/subtle` | the original bug `bg/chip` already solved |

### Chip plate collision — closed out 2026-08-02

Opened by a screenshot of the Game Card set: the Low-confidence **Hover** card rendered `Low`
bare while Rest and Focus showed a plated `••• Low`. A structural audit proved the three variants
byte-identical, so it was a fill collision, not structure.

**Root cause, and it was systemic.** `bg/subtle` and `bg/layer-hover` are both `#292929` in Dark —
the same hex — so a chip plate melts into a hovered card. 38 components use `bg/subtle` as a root
plate. And every badge specimen on Badges `10:13` (`Tone table` `57:16`, `All marks` `57:128`,
`Levels` `57:196`) sits on a `bg/subtle` host while the chip was itself `bg/subtle` — **1.00:1.
The plates had never rendered at all, in either mode, on the shipped documentation.** Moving
`bg/layer-hover` would have fixed the card and left the docs broken; a host-independent plate
fixes both.

**The fix.** New `bg/chip` (Color, scopes `FRAME_FILL`/`SHAPE_FILL`), alpha-based so it composites
off whatever it lands on — Dark aliases `alpha/white-08`, Light aliases the newly created
`alpha/black-06` (Primitives, `scopes = []`, `{r:0,g:0,b:0,a:0.06}`).

| host | Dark plate | ratio | Light plate | ratio |
|---|---|---|---|---|
| bg/canvas | `#272727` | 1.23 | `#e2e2e2` | 1.14 |
| bg/layer | `#313131` | 1.27 | `#f0f0f0` | 1.14 |
| bg/subtle | `#3a3a3a` | 1.28 | `#d8d8d8` | 1.14 |
| bg/layer-hover | `#3a3a3a` | 1.28 | `#ebebeb` | 1.14 |
| bg/layer-selected | `#434343` | 1.28 | `#e2e2e2` | 1.14 |

**25 variants bound**, all of them plates that ride on an unknown surface:

```
Badge Neutral      53:2, 53:6
Confidence Badge   55:16, 55:22, 55:28, 55:34, 55:40, 55:46
Store Badge        54:14, 54:18
Avatar Icon (10)   193:27, 193:31, 193:44, 193:48, 193:61,
                   193:65, 193:78, 193:82, 193:95, 193:99
Avatar Store (5)   193:37, 193:54, 193:71, 193:88, 193:105
```

**13 of the 38 at-risk were deliberately left on `bg/subtle`** — Button Secondary/Subtle Pressed
(`93:106`, `93:136`, `93:166`, `93:196`, `93:226`, `93:256`), Text Input Read-only (`107:42`,
`107:44`, `107:88`, `107:90`, `107:134`, `107:136`), Textarea Read-only (`109:129`). These are
**control states on a known surface**, not plates on an unknown one: a button knows what it sits
on, the state is transient, and most already carry a stroke doing the separating. Do not sweep
them into `bg/chip` for consistency's sake — the token means "plate on an unknown host".

Four doc sentences were rewritten, every figure computed in the same script that wrote it:
`57:245` (Confidence pip note), `212:87` (Avatar plate note), `208:82` (Avatar Icon row),
`210:150` (Avatar Rules). All four verified by screenshot, not by geometry read-back.

Verified visually in both modes: Game Card `221:141` Dark and Light show plates on all three Low
cards **including Hover**; `57:196` in Light shows the Levels specimens plated for the first time.



- **P3.2 COMPLETE.** Metric Card `10:19`, Game Card / Grid `10:20`, Game Card / Row `10:21`,
  Section Header `10:22` — all built, documented and verified in both modes.
- **P3.3 COMPLETE.** Sidebar & Nav Item `10:23`, Top Bar `10:24`, Context Menu `10:25` — all
  built, documented and verified in both modes.
- **P3.4 COMPLETE.** Modal `10:26`, Pagination `10:27`, Empty State `10:28`, Loading & Skeleton
  `10:29` — all built, documented and verified in both modes.
- **P3.5 COMPLETE.** Charts `10:30` — Bar Chart `474:104` and Distribution Bar `475:38`, built,
  documented and verified in both modes. Consumed the existing `viz/*` tokens; no token created.
- **P4 COMPLETE.** Wireframes `10:32` — 7 screens + an 8-node annotation layer = **15 top-level
  nodes**, Library overflow fixed, **all 9 defects closed 2026-08-22**, verified in Dark **and**
  Light, six-check close-out audit clean. Details in § Wireframes. The layout is settled
  architecture — P5 and P6 refine it, and no frame is hand-placed on that page.
- **P5 — IN PROGRESS 2026-08-23.** Page templates and layout rules `10:33`. Entry plan is
  `HANDOFF.md` §9. The blocker recorded there cleared the same day; the pre-flight was **re-run live
  on a fresh session** rather than trusted from the 2026-08-22 marker, and `10:33` is genuinely empty
  (`count: 0`, `children: []`).
- **P6** High-fidelity mockups — **seven screens**, matching the shipped rail: Library, Collections,
  Stores, Accounts, Analytics, Search, Settings (`10:36`–`10:42`), Changelog `10:44`.
  **`10:35` "Dashboard" is dropped** — decided 2026-08-09; never add a Dashboard destination.
- **P7** Validate consistency across screens
- **P8** Present the design for approval — this is the gate that unlocks implementation

### 2026-08-05 — documentation reconstruction · no Figma mutations

**Every `use_figma` call this session was read-only.** No component, variable, style, page or text
node was created or modified. The session's entire output is documentation, plus a live read-only
audit of the file and of the dataset.

Live audit, replacing figures that had been carried forward in prose:

```
pages          44
variables     212     Primitives 54 · Color 58 · Spacing 13 · Dimension 26
                      Type Primitives 22 · Type 29 · Motion 10
text styles    10
effect styles   5     elevation/2 /4 /8 /16 /28
paint styles    0
components    422     = 378 variants across 30 sets + 43 icons + 1 standalone (Field)
```

**These figures are historical — they are what the file held *before* Loading & Skeleton was
built later the same day.** Current, re-counted live 2026-08-22: **215 variables** (Primitives 55,
Color 59, Motion 11) and **432 components** = 388 variants across **33** sets + 43 icons + 1
standalone (Field). The § Variables table above is the authority; this block is a record of that
session's reading.

Found, and all four were things this document itself had got wrong:

- **`Icon / person` `129:16` exists** — the "no person icon" claim was false and the icon count
  was 42, not 43. Corrected above.
- **Metric Card ids resolved** — set `154:23`, doc `169:23`. The page map had said "verify ids
  before trusting" and the components table carried **no Metric Card row at all**.
- **Four components were listed only as "on page X"** — Store Badge `54:22`, Count Badge `55:61`,
  Text Input `107:140`, Field `107:141`. Exact ids now recorded.
- **`~20,400` was never measured.** It originated as prose in this file and propagated into eight
  shipped doc pages. **Retired entirely 2026-08-09** — see the § Data reality decision; the sweep
  that removed it from the file ran 2026-08-22.

And one defect that is *not* a documentation error:

- **🔴 Metric Card `154:23` ships fabricated data** — `1,247` games and a confidence breakdown
  `584 high · 118 medium · 22 low · 523 none`. The corpus is 226 records with confidence on 100%
  of rows and **no "none" bucket in the schema**. It contradicts the Data & Provenance page
  `10:10` in the same file. Node ids and the fix are `TODO.md` B1. Fix **B2 first** — the
  library-size convention decides what goes in "Games owned".
  **✅ Closed 2026-08-22** on both the rendered-text layer and the property layer, fourth bucket
  **deleted rather than zeroed**. Left in place as the session's finding, not as an open defect.

Written this session: `HANDOFF.md` (new — the zero-context entry point), `DATA_PIPELINE.md` (new),
`TODO.md` (new), `CHANGELOG.md` (new), `WORKFLOW_CONTEXT.md` (rewritten — it had gone four days
stale, still claimed Phase 3.1 and 204 variables, and listed pages `10:20`–`10:29` as
**"Not Started"** when eight of them are finished, documented and verified; a fresh chat reading it
would have rebuilt finished work), and this file.

**Stayed solo — no Workflow, no subagents**, despite an ultracode notice instructing otherwise,
because Figma mutations must be strictly sequential and a fan-out would have violated the
constraint it was meant to serve. For documentation work specifically it would also have risked
fabrication: the measurements had to come from one context that held the actual readings.

**Did not unilaterally resolve the 20,400 / 1,247 / 226 inconsistency.** Choosing a convention
rewrites copy on eight shipped, verified doc pages (this session said seven; the literal scan later
found eight), so it was recorded as a decision to make with a recommendation rather than made.
**The user decided it on 2026-08-09: 226 everywhere.**

### Known loose ends

Ranked backlog with proposed fixes lives in `TODO.md`. Summarised here because this file is the
one that is auto-loaded:

- **✅ Metric Card `154:23` fabricated data — CLOSED 2026-08-22.** It shipped `1,247` games and a
  confidence breakdown with a **fourth "none" bucket that does not exist in the schema** — a reader
  would have designed a legend, a filter and a chart segment for a state that can never occur. Now
  226 / 63 high · 161 medium · 2 low / 132 of 226, with the fourth bucket **deleted rather than
  zeroed**. Fixed on **both** layers: the rendered text *and* the stored `Detail#156:26` property
  values, which a text sweep cannot see. `TODO.md` B1.
- **✅ Three library sizes — DECIDED 2026-08-09: 226 everywhere, `20,400` retired.** See the
  warning in § Data reality. **This created `TODO.md` B10 — route 1 approved 2026-08-22:** keep
  Pagination, re-derive the rationale as *sized for the library to grow into*. **The component was
  not re-scoped**, and the re-derivation has landed on doc `395:85` and on W5's caption `499:986`
  — see the ⚠ block in the Pagination close-out for the argument as it now stands.
- **✅ The `20,400` sweep — CLOSED 2026-08-22.** It was component-layer work, not eight pages of copy
  edits: the retired figure lived in Count Badge instances inside Section Header `286:82` and Nav Item
  `301:44`, which Top Bar, Modal and the wireframes all inherited. Those two sets were fixed first, the
  file re-scanned, then residual overrides cleaned — **26 text nodes across three shapes at five source
  components, final sweep `bareCount 0`.** Node ids in § Data reality; record in `HANDOFF.md` §8 item 2
  and `TODO.md` B2. **The page count was eight, not seven** — verified by literal scan.
- **🟠 `Detail#156:26` on Metric Card `154:23` is wired to 3 of 12 variants** — `setProperties`
  silently no-ops on the other nine, and wiring it across the set would collapse all twelve detail
  lines per the Section Header precedent. `TODO.md` **B11**, a user decision.
- **✅ Page `10:35` "Dashboard" — DECIDED 2026-08-09: dropped from P6.** P6 is **seven** screens,
  matching the shipped rail's seven destinations. **Never add a Dashboard destination to the rail.**
  Deleting the page is optional cleanup; keeping it in P6 scope is not.
- **✅ Both data-layer items — CLOSED 2026-08-23, and neither closed the way `TODO.md` proposed.**
  `data/analytics/` was **never emitted by anything** — the docstring claim in
  `tools/build_app_data.py` was simply false, so the claim was corrected rather than an unwanted
  output manufactured. And the receipt `.eml` sources **were already gone**: C2's premise expired
  before it could be acted on, so the recommended file-move was never executable. The 14 orders / 32
  line items survive only in `data/raw/receipts.json`, where they are the **sole source of
  `ownership.purchasePrice`** — exactly **32 of 226** records, 1:1 with the `Receipt email` provenance
  source. `TODO.md` C1 / C2.
- **🔴 A data-destruction bug was found and fixed while closing C2** — worth carrying here because the
  mechanism generalises. **`Path.glob()` on a non-existent directory yields zero matches and raises
  nothing.** So `python tools/parse_receipts.py` would have parsed zero receipts and overwritten the
  only copy of the price data with `[]`. The script now refuses to run on a missing or empty source
  dir and exits non-zero; verified by md5 across a default-args run. **This is the audit-trust
  corollary in executable form: a zero from a selector that reached nothing is not a measurement** —
  and here it was not merely misleading, it was destructive. Any tool that globs a directory needs the
  guard; only this one lacked it.
- ~~**Cover `35:17` is stale again.**~~ **Fixed 2026-08-05** — rewritten from live counts to
  "Color — 55 primitives, 59 semantic". **`35:21` was stale too and the 2026-08-04 pass missed it**,
  because that pass checked the other seven texts against "live collections" but Motion had not
  changed then; adding `duration/pulse` made it "Motion — 6 durations, 4 curves" against a live 7.
  Now "Motion — 7 durations, 4 curves". **Two Cover nodes carry variable counts, not one** — `35:17`
  (Color) and `35:21` (Motion). `35:17` has now gone stale four times. **Treat any
  variable-collection change as automatically implying a rewrite of both, in the same session, from
  a live count.** The remaining numeric texts (`35:18`, `35:19`, `35:20`, `35:49`, `35:55`, `35:58`)
  were re-checked live 2026-08-05 and are correct.
- ~~The Light surface ladder three-way collision~~ — **fixed 2026-08-02**, see the section above.
  `bg/layer-selected` is now `#d6d6d6` in Light and both Light strokes are alpha. Game Card / Row
  `10:21` and Sidebar & Nav Item `10:23` are unblocked and can consume `bg/layer-selected` directly.
- **Primary and Danger Disabled buttons have no stroke.** Six variants: `93:22`, `93:52`, `93:82`,
  `93:382`, `93:412`, `93:442`. In Light their `bg/disabled` fill is `#f0f0f0`, identical to
  `bg/canvas`, so on a page surface the button has no edge whatsoever. Secondary Disabled already
  carries `stroke/subtle` and reads correctly — apply the same. Do **not** solve this by moving
  `bg/disabled`; flat-on-the-page is the intended semantic.
- **`fg/quaternary` fails on a selected surface** — 3.95 Light, 4.17 Dark. It backs ~342 text nodes,
  so it cannot move. Use `fg/tertiary` (4.60 Light) or stronger for any text on `bg/layer-selected`.
- ~~**Three Color variables have wrong codeSyntax.**~~ **Closed 2026-08-03, re-verified 58/58
  on 2026-08-04.** The background session never landed it, so it was done here. Auditing all 57
  Color variables found **10** deviations, not three: the documented `stroke/control`,
  `danger/hover` and `danger/pressed`, plus four `confidence/*` using a shorthand and three
  missing the `color-` prefix. All normalized, and the two Context Menu tokens added afterwards
  conform too.

  **The three platforms treat `/` differently — this is the part that keeps biting.** Derived
  from the file's own majority, not assumed:

  | platform | rule | `bg/canvas` | `status/danger-fg-strong` |
  |---|---|---|---|
  | WEB | every separator → `-` | `var(--color-bg-canvas)` | `var(--color-status-danger-fg-strong)` |
  | ANDROID | `color` + camel on **both** `/` and `-` | `colorbgCanvas` | `colorstatusDangerFgStrong` |
  | iOS | `Color.` + camel on **`-` only**; `/` joins flat | `Color.bgcanvas` | `Color.statusdangerFgStrong` |

  Note ANDROID capitalizes across `/` and iOS does **not**. Both look like typos and neither is.
  I twice wrote a "correct" generator from intuition, ran it, and got a wall of false positives
  — 58/58 the second time. **The file is the spec; re-derive from it before flagging anything.** The two Context Menu tokens added after the audit follow it.
- **Form Controls (`10:15`) has component sets but no overview doc page.** Every other completed
  component page has one. Decide whether to add it or fold the guidance into the individual
  control sections.
- ~~**Select has no "value shown" state.**~~ **FALSE — closed 2026-08-22.** Probed live: Select
  `109:114` is `Size` [Small, Medium, Large] × `State` [Rest, Hover, Focus, Open, **Filled**, Error,
  Disabled] = 21 variants, every one accounted for. **`Filled` ships on all three sizes and always
  did.** Pagination's `50 per page` carries an instance-level `fg/primary` rebind that is now
  redundant — swapping that instance to `State=Filled` would retire it (`TODO.md`, low priority).
  This was the **third** absence this document asserted that a one-call probe disproved, after
  `brand/tint` and `Icon / person`. **Read the set or the collection before writing down that
  something does not exist.**
- **🟠 `Detail#156:26` on Metric Card `154:23` is wired to 3 of 12 variants.** The other nine store a
  value that references no text node — invisible to a text sweep *and* to the render, and it surfaces
  the instant the variant is switched. Wiring it across the set would collapse all twelve detail
  lines to one shared default, per the Section Header precedent. `TODO.md` **B11** — recommendation is
  to delete the property; a user decision. Clear `componentPropertyReferences` on the consuming nodes
  before `deleteComponentProperty`, or deletion is refused.
- **🟠 Metric Card's trend and delta both need a decision.** The delta is bound unconditionally to
  `status/success-fg`, so a negative delta would render green, and the trend's granularity has never
  been checked against a corpus where 109 of 226 records land in a single 2024-03 backfill month.
  `TODO.md` **B12**, a user decision — do not pick a granularity unilaterally.
- **🟠 No binary control carries a `Show label` boolean.** Checkbox `106:53`, Radio `106:86` and
  Switch `106:123` each ship a nested label that cannot be hidden, which is why both Settings
  switches rendered a stray literal "Label" until it was hidden per instance. `Field 107:141` already
  owns a labelling path, so the recommendation is to **add the boolean defaulting to `true`, never to
  delete the nested label**. `TODO.md` **B9**, a user decision.
- **🟡 Nothing in the file switches between Grid and Row.** `Icon / list-view` `44:118` has zero
  instances anywhere. Both card components are shipped and verified, but the control that chooses
  between them does not exist. `TODO.md` **B13** — **do not build it in P5**; a view switch is chrome,
  and chrome is settled architecture on `10:32`.
- **🟢 "1,299 INR" on three text nodes is fabricated — measured 2026-08-23, edit blocked on Figma.**
  `17:21`, `17:13`, `16:108`. **A corpus field does carry a price** — `pricing.msrp`, populated on
  **226/226** records — which is what makes the earlier note here ("no corpus field carries one")
  wrong and the real finding sharper: **`1299` occurs zero times in it.** The 51 distinct values
  include `1149.0`, `1300.0` and `1350.0`, but never `1299.0`. Same class as `20,400` and `1,247`, and
  it lands *within one rupee* of a real value — which is precisely why it reads as measured.
  **Do not simply delete the nodes**; they demonstrate the unit rule on `27:378`. Preferred route is to
  relabel as an explicit example, second choice is to substitute a measured value. `TODO.md` **B14**.
- **🟡 Nine container sets still owe a nested-variant audit** — `321:35`, `370:112`, `392:186`,
  `417:128`, `154:23`, `221:141`, `272:144`, `286:82`, `451:2`. `TODO.md` **B8**; see the Sidebar
  entry below for why.
- ~~Consider a `brand/tint` token when a component needs a soft brand background.~~ **Answered
  2026-08-05: `brand/subtle` `VariableID:5:16` already exists**, scoped `FRAME_FILL`/`SHAPE_FILL`,
  with full code syntax. `brand/tint` does not exist and should not be created — `brand/subtle` is
  that role. `bg/subtle-hover` `VariableID:5:7` also exists and was likewise missing from this
  document. **Both are a reminder to grep the live collection before concluding a token is absent.**
- **🟠 Sidebar `302:96` shipped with a baked hover state** on both variants — fixed 2026-08-05, but
  it is the second occurrence of recurring shape #15 (Context Menu was the first). **Every remaining
  container set should have its nested instance variant *values* audited**, not just its own props.
  A geometry read-back cannot see this class of defect.

## Notes for whoever picks this up

**Start at `HANDOFF.md`** — it is written for a reader with zero context and holds the exact next
steps. Then come back here for ids, tokens and API knowledge.

Resume by auditing the file read-only rather than trusting this document blindly — it is accurate
as of the last session but the file is authoritative. **This document has now been wrong eleven
times, and every one was a claim that looked settled** — including #11, which was written and
corrected within a single session:

1. It said the Rules columns used icons `45:46` / `45:35`. Every shipped page uses ellipse bullets.
2. It listed Metric Card `10:19` as **empty** when the page already held a component set and a
   full doc page. An "empty" marker is the dangerous one — acting on it means rebuilding over
   finished work.
3. It said **there is no person icon**. `Icon / person` `129:16` exists and always did, and the
   icon count was 43, not 42.
4. It asserted the library is **~20,400 records** under a heading called "Data reality", where it
   read as measured. It was never measured; the corpus is 226. That number then propagated into
   **eight** shipped doc pages — and the document simultaneously said "seven" while listing eight
   ids, so the propagation claim was wrong in its own count too. Measured 2026-08-22.
5. It listed Wireframes `10:32` as **empty** on 2026-08-06 when the page already held **seven built
   screens**. This is the same shape as #2 and the second time an "empty" marker has been wrong —
   which makes it the single most dangerous kind of error in this document, because acting on it
   destroys finished work rather than merely misinforming. The read-only audit is what caught it.
6. It recorded **W7 — "Settings `499:867` carries 8 raw spacing values, unbound"** — as a defect.
   Measured 2026-08-22: **30 bound, 0 unbound** across 16 auto-layout frames. There was nothing to
   fix. The "8" had no live source, exactly like the 20,400.

   The generalisable half is a **corollary to recurring shape #16**: that audit was only trustworthy
   because it returned a **non-zero positive count** alongside the zero. A walk that reaches nothing
   and a file with no defects both report zero. **Never accept a clean audit result that does not
   also prove the walk reached real nodes.**
7. It said **Select has no "value shown" state**. `State=Filled` ships on all three sizes and always
   did — disproved by one read of set `109:114`. This is the **third** asserted absence, after
   `brand/tint` (where `brand/subtle` already existed) and `Icon / person`. The three together are a
   distinct sub-shape of the failure: **an absence is a claim about the whole file, and it is the one
   kind of claim that cannot be verified by remembering.** Read the set or the collection.
8. It said **"no corpus field carries" a price**, in the B14 loose end. `pricing.msrp` is populated on
   **226/226** records. Measured 2026-08-23 — and the **fourth** asserted absence, so the sub-shape in
   #7 is now the most frequent single failure in this document. Correcting it made the finding
   *stronger*, not weaker: the field exists, `1299` simply is not one of its 51 values, landing within
   one rupee of the real `1300.0`. **A false absence does not merely misinform — it hides the sharper
   true claim underneath it.**
9. It stated **"98% of records have zero playtime"** in four places. The measurement is **173 explicit
   `0`, 49 `null`, 4 nonzero**. The percentage is roughly right and the *category* is wrong: 49 records
   are **unmeasured**, not idle, and the pipeline's NO FABRICATION rule keeps them `null` for exactly
   that reason. Corrected 2026-08-23. **A rounded percentage silently absorbed a schema distinction the
   pipeline works hard to preserve** — which is a different failure from a wrong number, and harder to
   see, because nothing about "98%" looks unsourced.
10. It described the **`20,400` component-layer sweep as still pending in three places** — twice in
    § Data reality, once in § Known loose ends — after that sweep closed on 2026-08-22 with
    `bareCount 0`. The *reverse* of #2 and #5: not work described as unstarted that was finished, but
    work described as outstanding that was done. Less dangerous (it wastes a session rather than
    destroying one) but the same root cause, and the imperative phrasing is what made it read as live.
    **When you close something, grep the whole document set for every place that described it as open** —
    the closeout paragraph is never the only one.
11. It said **226 records resolve to 224 distinct title strings**. They resolve to **218** — eight
    titles appear twice, so 226 − 8. This one is different in kind from every entry above it, and worse
    for it: **`224` was freshly measured, in the same session, from the live corpus.** It is the honest
    answer to a *different* question — how many rows carry a title other than the
    `Needs Manual Verification` placeholder (226 − 2). Three adjacent quantities exist here — distinct
    strings 218, rows with a real title 224, distinct real titles 217 — and the wrong one was published
    under the right label. The collision table beside it was correct throughout and its own arithmetic
    (6 + 1 + 1 pairs) contradicted the headline figure, which is what the close-out audit caught.
    **"I measured it" is not the same as "I measured the thing I then wrote down."** State the
    arithmetic next to the figure — `226 − 8 = 218` cannot be wrong quietly.

    Same audit surfaced a figure that **cannot** be checked: Data & Provenance `27:372` is quoted in
    `HANDOFF.md` §8 and `TODO.md` B1 as *"226 is ledger rows, 220 is unique titles, 208 is actual
    games"*. **226 ✅ and 208 ✅ reconcile exactly** — 208 is precisely `classification: "game"`, the
    other 18 being 7 demos, 5 apps, 2 DLC, 2 add-ons, 2 subscriptions. **220 reconciles with nothing.**
    Reading that node needs Figma, so it is recorded, not resolved. The rule it supports — no bare
    "226 games" in the UI — is right on any of these numbers.

The shape is the same each time: **a number or a fact that no longer had a live source got carried
forward as prose and then consumed as truth** — with #11 as the sharpest variant, where the source was
live and answered a neighbouring question. So — always read the target page before building on
it, and re-measure anything countable rather than quoting this file, **against the question you are
actually about to answer.** The audit pattern that works:
list pages, then walk the target page collecting `type`, `name`, `id`, size, layout mode and bound
variables, and return a compact summary.

**And it has now happened to a session summary, not just to this file.** A compaction note carried
into 2026-08-22 asserted that CLAUDE.md was "still entirely unedited". A grep before writing showed
it already held the B2 decision and the whole defect sweep. Writing from the note would have
overwritten landed work — the same shape as the two false "empty page" markers, applied to my own
record of what I had done. **Grep the document before editing it, exactly as you read the page before
building on it.**

Then continue the component library in the order listed. Same conventions, same verification
loop, no redesigning of finished foundations unless a genuine defect turns up — and when one
does, fix it at the token layer rather than patching the page, because everything built
afterwards inherits it.




