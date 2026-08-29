# Game ID — TODO

**Owner of:** the prioritised backlog and every open defect, with node ids and proposed fixes.

**Not the owner of:** the roadmap narrative (`HANDOFF.md` §7), token values or API knowledge
(`CLAUDE.md`), design rationale (`WORKFLOW_CONTEXT.md`), or the data corpus (`DATA_PIPELINE.md`).

Last reconciled against the live Figma file **2026-08-22**; against the local data layer and the
document set **2026-08-23**. **P4 is closed** — all nine wireframe defects resolved, an eight-node
annotation layer added, and all fifteen top-level nodes on `10:32` verified in Dark *and* Light.
Current build step is **P5 — Page Templates `10:33`**; the entry plan is `HANDOFF.md` §9.

> **✅ THE BLOCKER IS CLEARED — 2026-08-23, later the same day.** The Figma tools are bound into the
> session and the file is reachable. Verified by **execution, not by configuration**: three
> read-only `use_figma` scripts ran against `00QEeirxnqT4Zg829aeDVZ` and returned data —
> `pageCount: 44` with the full page list, a depth-4 structural walk of all seven wireframes on
> `10:32`, and a focused geometry read of Library's card rows. **A4's pre-flight was re-run live:
> `10:33` is `{name: "Page Templates", count: 0, children: []}`**, so the gate is satisfied on a
> fresh reading rather than on the 2026-08-22 marker. **A4, B3, B4, B5, B8, B14's text edit and the
> Pagination `50 per page` cleanup are all unblocked.**
>
> **The diagnosis that closed it was "start a fresh session", and that was correct** — the failure was
> session binding, never connectivity. `claude mcp list` had reported
> `plugin:figma:figma: https://mcp.figma.com/mcp (HTTP)` **✔ Connected**, bundle
> `figma_prod@2_2_96`, throughout. Tools are enumerated once at session start; a server connected
> after that point cannot appear mid-session, and no retry can conjure it.
>
> **Keep the diagnostic lesson — it is the durable part.** Four "confirmations" recorded during the
> outage answered the wrong question, and are corrected in `HANDOFF.md` §5: reading `~/.claude.json`
> proves nothing when the scope is *dynamic config*; the absent Figma process, the dead localhost
> ports and `curl … → 000` are all irrelevant to a **remote HTTPS** endpoint at `mcp.figma.com`; and
> "a browser tab gives the session nothing" is false when the server is hosted. Non-vacuous zeros to
> the wrong question are still wrong answers — § 12 item 11. The one trap that survives the fix: the
> desktop **Dev Mode** server (localhost 3845) is *not* a substitute, as it cannot execute Plugin API
> scripts, which is what building `10:33` requires.
>
> **Nothing was mutated blind during the outage and no item was closed on a structural read-back** —
> see `HANDOFF.md` §4. That discipline still governs now that the tools are back.
>
> **Not blocked, and closed on 2026-08-23 instead:** **C1** and **C2**, plus a 🔴 data-destruction
> bug found in `tools/parse_receipts.py` while closing C2, and four measurement drifts in `CLAUDE.md`.

**Four questions belong to the user, not to the next session:** **B11** (delete `Detail#156:26` or
document it as scoped), **B9** (should Checkbox, Radio and Switch all gain `Show label` — probed
2026-08-22, none of the three has it), **B12** (is a month-granularity trend defensible on this corpus,
and should its delta stay bound to success green), and the **"Records owned" label confirmation** under
B1. **None of the four blocks P5** — the Figma MCP does.

**Three items were filed 2026-08-22 and are not questions** — B13 (nothing switches between Grid and
Row; `44:118` has zero consumers), B14 (an unverified example price), and B6, which was **closed as
false**: Select's `State=Filled` ships and always did.

---

## How to use this file

Items are grouped by kind, then ranked. Severity marks:

- 🔴 **ships wrong information** — a reader of the design would be misled
- 🟠 **a real visual or structural defect** — something renders wrong or is missing
- 🟡 **an inconsistency or a gap** — correct but incomplete
- 🟢 **anticipatory** — not wrong yet, will be needed

Every fix must respect the standing constraints in `HANDOFF.md` §4 — in particular:
**fix at the token layer, not the page**, and **verify by screenshot, never by structural
read-back**.

---

## A. Blocking the next build step

### ~~A1 — Build Loading & Skeleton on page `10:29` · closes P3.4~~ ✅ DONE 2026-08-05

Set `451:2` (4 variants, 1024×652, PAD 32, overflow 0/0), doc `454:2` (1560×2986, six sections),
verified in Dark and Light, Light pin cleared, **zero stray pins on the page**. **P3.4 is closed.**
Full closeout in `CLAUDE.md` § Loading & Skeleton.

Three new tokens: `alpha/black-12` (Primitives → 55), `bg/skeleton` (Color → 59, sixth consumer of
the alpha rule), `duration/pulse` (Motion → 11, derived as 3 × `duration/slower` read live = 1200 ms).
Cover `35:17` **and `35:21`** rewritten from live counts.

Corrections to the step list this item shipped with, so they are not repeated:

- **Game Card / Grid is 240 × 416, not 240 × 320.** 320 is `layout/card-cover-height`. The same
  error is in `HANDOFF.md` §9. Measure the counterpart; never quote a doc for geometry.
- **`bg/subtle` was the wrong precedent** and the alpha test settled it, as step 2 hoped. A meter
  track sits inside a control that owns its surface; a skeleton block lands on a card interior, the
  page canvas *and* a `bg/subtle` doc panel. `bg/subtle` on `bg/subtle` is 1.00:1 — recurring shape
  #3 exactly. `bg/skeleton` is alpha at 12%, stronger than the 8% used for plates because a skeleton
  block **is** the content, not a backing for it.
- **The Motion ramp topped out at 400 ms, a *transition* ceiling.** A loop period is a different
  quantity, so reusing `duration/slower` would have been the same category error as reusing
  `bg/chip`. Derived rather than picked, with the derivation recorded in the token description.

### ~~A2 🟢 Build Charts on page `10:30` · closes P3.5~~ ✅ DONE 2026-08-05

Bar Chart `474:104` (4 variants, 1152×476, PAD 32, overflow 0/0), Distribution Bar `475:38`
(2 variants, 1152×192, PAD 32, overflow 0/0), doc `478:2` (1560×3026, six sections), verified in
Dark and Light, Light pin cleared, **zero stray pins on the page**. **P3.5 is closed.** Full
closeout in `CLAUDE.md` § Charts.

**No token was created.** The seven `viz/*` tokens existed and had **zero component consumers** —
their only 52 consumers were the Color page's paired swatches. Variable counts stand at 215, so no
Cover rewrite was implied.

Corrections to the step list this item shipped with, so they are not repeated:

- **Contrast ratio is the wrong metric for categorical colour separation** — use CIE76 deltaE
  alongside it. Two colours of equal luminance return 1.00:1 while being plainly distinct. The step
  list said to measure the ramp against the three surfaces, which was necessary but not sufficient:
  it would have passed a palette whose adjacent ranks are **7.4 deltaE** apart and indistinguishable.
- **"A six-colour categorical ramp" was the wrong premise.** The viz ramp is **sequential** — ranks
  1–3 are one blue, and the only perceptible step is rank-3 → rank-4 (deltaE 38.2). Four data marks
  is the ceiling, set by contrast: rank-5 is 2.24:1 and rank-6 is 1.45:1 on `bg/layer` in Light.
- **The Low-segment problem the step list flagged was real but mis-stated.** It is not that ~1% is
  invisible; it is that **rounding it to 1% and flooring it to 2 px drew it at 13.5 px**, over double
  the truth. Per-mille weights with no floor land it at 6.1 px on a 680 track unaided.
- **In a stacked bar, measure a segment against its *neighbour*, not against the surface.** The
  segments tile the track, so nothing is behind them. `confidence/medium` against `confidence/low` is
  **1.06:1 by luminance in Light** — separated by hue only, which dies in greyscale. Fixed with a 2 px
  achromatic `bg/layer` rule between segments, not by moving a token.

### ~~A3 🟠 Wireframes `10:32` (P4)~~ ✅ **DONE 2026-08-22 · P4 CLOSED**

**`10:32` was never empty.** Seven wireframes were already built when the 2026-08-06 session opened.
`CLAUDE.md`'s page map and `HANDOFF.md` §6 both said "empty" — **wrong, and the second time an
"empty" marker has been wrong in this project.** Audit read-only before you touch any page this file
calls empty; `10:33` is the next one it says that about.

**Final state: 7 screens · 8-node annotation layer · all 9 defects closed · all 15 top-level nodes
verified in Dark and Light.** Fifteen Light pins set and **fifteen cleared** — zero residual.
Six-check close-out audit clean, every zero paired with the positive count that proves the walk
reached real nodes.

| Wireframe | Id | Size | Closed |
|---|---|---|---|
| Library | `494:2` | 1560×**1576** | overflow (08-06), **W9** |
| Collections | `496:329` | 1560×1080 | — |
| Stores | `496:432` | 1560×1080 | **W6** |
| Accounts | `497:491` | 1560×1080 | **W2** |
| Analytics | `497:630` | 1560×1080 | **W1**, **W2** |
| Search | `499:731` | 1560×1080 | **W3** |
| Settings | `499:867` | 1560×1080 | **W4**, **W5**, **W7** (false alarm) |
| annotation layer | `549:938` + 7 captions | — | **W8** |

Annotation nodes: page note **`549:938`**, then one caption per screen — `549:943` Library,
`549:946` Collections, `549:949` Stores, `549:951` Accounts, `549:954` Analytics, `549:957` Search,
`549:960` Settings.

Final sweep across the page for retired and unqualified figures: **`commaCount 4` · `unitCount 2` ·
`bareCount 0`** — the four remaining comma-figures are legitimate (they are not counts), and every
count names its unit per Data & Provenance `10:10` `27:372`.

Frames sit on a deliberate 3-column grid — `x` = 0 / 1680 / 3360, rows at y = 0 / 1816 / 3136, with
`ROWGAP` 240, which is where the annotation layer landed. Zero pairwise overlaps, verified.
**Extend the grid; do not hand-place a frame.**

#### Fixed 2026-08-06 — Library overflow

`494:2` held **1544 px of content in a 1080 px frame**. `Pagination` `494:305` sat at y=1512 and two
of three card rows were below the fold, so a shipped component rendered nowhere. Root cause:
**`layoutGrow = 1` on `Page` `494:119` pinned it to FILL and silently rejected HUG** — two calls were
spent setting sizing modes that could never apply. Now in `CLAUDE.md` § Hard-won API knowledge.
Result: root/col 1576, Page 1528, Rail FILL, **overflow 0, pagination visible.**
**Re-screenshotted and confirmed by eye 2026-08-22**, in both modes.

#### W1 ✅ RESOLVED 2026-08-22 — Analytics no longer ships the fabricated 1,247

Footer `I497:724;152:34` now reads **"132 of 226 records enriched"** under a `58%` value
(132 / 226 = 58.4%), beside a card reading `226` / "Across 2 accounts, 1 store". **Measured live, not
remembered.** A literal scan of all seven frames for `1,247`, `20,400` and `724 of` returns
**zero hits**.

Note for B1: the fix landed on the **Caption** text node, not through `Detail#156:26`. That property
is wired to only 3 of 12 variants — see **B11**, which is why the property route silently no-ops.

#### W2 ✅ RESOLVED 2026-08-22 — page-wide, and the arithmetic now reconciles

`Across 1 connected store` is gone from every card. **Zero of the seven Metric Cards on `10:32`
retain the boilerplate**, verified by enumerating all of them:

| card | value | footer |
|---|---|---|
| Stores `496:526` Epic | 226 | Across 2 connected accounts |
| Accounts `497:577` A | 51 | 34 matched to a catalogue · 17 not |
| Accounts `497:586` B | 175 | 98 matched to a catalogue · 77 not |
| Accounts `497:595` both | 6 | **Counted twice, on purpose** |
| Analytics `497:715` | 226 | Across 2 accounts, 1 store |
| Analytics `497:724` | 58% | 132 of 226 records enriched |
| Analytics `497:741` | 2 | Titles the matcher could not resolve |

**Every figure reconciles to the measured corpus:** 34 + 98 = **132 enriched**, 17 + 77 = **94
unenriched**, 51 + 175 = **226**, and `Needs manual review = 2` is exactly confidence Low = 2. The
`Owned on both` footer now carries the explanation this item said was missing.

#### W3 ✅ RESOLVED 2026-08-22 — Search's Top Bar renders its query

`I499:787;320:3` is now `State=Filled` reading **`control`** in the value tone with the border
present. Verified by screenshot. The other six Top Bars stay `Rest`, which is correct — an idle
search box on a screen whose state was not produced by search.

**The `Filled` variant shipped the string "Half-Life 2"** — the inherited-content trap again, caught
only because the re-derived subtree was read before being overwritten. A variant swap re-derives the
subtree, so the pre-swap text node id is stale; re-walk, then read before you write.

#### W4 ✅ RESOLVED 2026-08-22 — stray "Label" hidden on both switches

`I499:995;106:108` and `I499:1011;106:108` both hidden; `strayLabelsRemaining: 0`. Verified by
screenshot — switch flush right, **no gap left where the label was**.

**The underlying component question is already tracked as B9** — should Switch `106:123` gain a
`Show label` boolean? Every consumer that puts a switch in a labelled row hits this, and hiding a
nested text per instance is the workaround that gets forgotten. This wireframe fix is the second
consumer to pay that cost, which strengthens B9 rather than opening a new item.

#### W9 ✅ RESOLVED 2026-08-22 — the Library pager reported a retired total

Not in the original eight; found during this sweep. Readout `I494:305;392:3` read `1–50 of 20,400`.

Now `1–50 of 226`, and because **226 at 50 per page is five pages**, the ellipsis `I494:305;392:44`
and the `408` slot `I494:305;392:46` are **hidden**. Verified by screenshot: `‹ 1 2 3 4 5 ›` with page
1 on the brand plate, the run closed up with no gap. Library holds at h 1576, contentBottom 1576,
**overflow 0**.

This is B10 made concrete — at 226 the seven-slot machinery is **dormant, not wrong**.

The pager instance reads 1216 wide against the component's 960 because it FILLs the content column.
**Not a defect.**

#### W5 ✅ RESOLVED 2026-08-22 — rewritten in one pass with B10, so the two cannot disagree

`499:986` used to read *"Below 50, the page count outgrows the pager's seven fixed slots."* That was
only true at ~20,400 records; at 226, 25-per-page is 10 pages and fits the run comfortably.

Rewritten from the measured corpus alongside the Pagination doc `395:85` — **one pass, both nodes**,
because rewriting the caption alone would have left Settings and the component's own page telling
different stories about the same rule. The honest version, which both now carry: **226 at 50 per page
is five pages**, so the ellipsis and the first/last jumps are **dormant, not wrong**; at 25 per page
it is ten pages, and `1 2 3 4 5 … 10` exercises the seven-slot run exactly. The run's justification
is that it never reflows under the pointer — which holds at any size — not a page count that does not
exist.

**Do not reintroduce a page-size floor argued from library size.** The 50-minimum survives as a
default, not as arithmetic.

#### W6 ✅ RESOLVED 2026-08-22 — it was the Stores card footer

The node was re-derived rather than trusted, as this item instructed. It turned out to be the same
defect as W2: `I496:526;152:10` read "Across 1 connected store" beneath an Epic card **on a screen
about stores** — a footer explaining the number with the number. Now **"Across 2 connected accounts"**,
which is the split that actually produces 226 (A 51 + B 175). Verified by screenshot: one line, no
wrap.

The rest of the screen was already correct, including annotation `496:537` citing 226.

#### W7 ✅ FALSE ALARM — closed 2026-08-22, Settings carries **zero** raw spacing values

The claim of 8 raw values on `499:867` does not survive a live sweep: **16 auto-layout frames visited,
11 `INSTANCE` nodes skipped, 30 bound values, 0 unbound.**

**The 30 is what makes the 0 trustworthy.** A zero-defect result must be paired with a non-zero
positive count proving the walk reached real nodes — otherwise a broken walk and a clean file are
indistinguishable. This is the audit-trust corollary to `CLAUDE.md` recurring shape #16: *when an
audit says everything is fine, suspect the audit.*

The sweep method stands for any future use: **by value, not by name.** The Spacing collection uses
**bare** names (`L`, not `spacing/L`), so `V['spacing/L']` is `undefined` and `setBoundVariable` then
fails **silently**. Build `SP[resolvedNumber] = variable` and rebind matching raw numbers on
`itemSpacing` / `padding*`. **Skip nodes with an INSTANCE *ancestor*, not merely nodes of type
INSTANCE** — a nested frame inside an instance is not itself an INSTANCE and will be visited by a
naive type check, then flagged for values it inherits and cannot own.

**The two values that looked raw are inherited, and that is the whole finding.** Switch `106:123`'s
`Track` carries `pad [2,2,2,2]`, and that padding lives on the **main component**, not on the
Settings instances — the 2 px thumb inset is intrinsic component geometry, which stays raw under the
Avatar precedent (the no-raw-numbers rule governs colour, spacing rhythm and radius, not a control's
own construction). Whether it should be tokenised anyway is a question for **B9**, alongside the
`Show label` decision, not a defect here.

#### W8 ✅ RESOLVED 2026-08-22 — annotation lifted to a layer, eight nodes

**The original claim overstated the gap**, and the re-scope is what made the fix correct rather than
duplicative. Verified before building: `10:32`'s children were exactly the seven frames, so there was
no page-level layer — but annotation prose in designer voice already existed **inside** three frames
(Stores `496:537`, Search `499:866`, Settings `499:986`, the last of which is W5's own note). The work
was therefore to **make the existing annotation consistent and lift it**, not to invent one.

Built: a page note **`549:938`** stating what the page is and what is settled, plus a caption per
screen — **`549:943`** Library, **`549:946`** Collections, **`549:949`** Stores, **`549:951`**
Accounts, **`549:954`** Analytics, **`549:957`** Search, **`549:960`** Settings. They sit in the 240 px
`ROWGAP` the earlier relayout had reserved, which is why no frame moved.

**The convention, now set and to be held at P6:** annotation lives **beside** the frame, never inside
a user-facing surface. Stores' existing note sat inside the product panel "Add store" `496:536` —
designer commentary rendered as if it were product copy. The new caption carries the rationale
outside the frame; the in-panel prose is a P6 cleanup item, not a wireframe defect.

Library's caption carries the **fold** explicitly: it is 1576 tall against a 1080 viewport, and that
difference is a finding, not a mistake — **Library is the only screen that scrolls**, and the caption
says where 1080 lands so the extra height cannot be read as overflow.

All eight nodes verified in Dark and Light with the rest of the page.

#### Two findings that are not defects — and matter more than the defects

- **There is no Dashboard, and that is correct.** The shipped Sidebar's destinations are Library,
  Collections, Stores, Accounts, Analytics, Search, then Settings — **seven, exactly the seven
  wireframes that exist.** The set is not missing a screen. **Page `10:35` "Dashboard" is an orphan
  name predating the rail design.** Do not invent a destination the shipped Sidebar does not have —
  that would be reinventing settled architecture. ~~**User decision:** rename `10:35`, leave it empty,
  or drop it from the P6 list. Until decided, P6 is eight pages for seven screens.~~
  **✅ DECIDED 2026-08-09 — drop `10:35` from the P6 list. P6 is seven screens, not eight.** The rail
  is unchanged and gains no Dashboard destination. Removing the page itself is optional cleanup, but
  it must not appear in the P6 scope; a named page for a destination that does not exist is an
  invitation for someone to build one later.
- **B6 is closeable, and was closed 2026-08-22** — see B6. Settings `499:963` renders `Dark` / `Grid` /
  `50 per page` through Select's real `State=Filled`.

#### Sequence, as it actually ran

1. **W1** ✅ 2. **W2 / W3 / W4** ✅ (instance-copy fixes) 3. **W6** ✅ 4. **W9** ✅ (found during the
sweep) 5. **W7** ✅ false alarm 6. **W5** ✅ with B10 7. **W8** ✅ annotation layer + fold marker
8. **All 15 top-level nodes verified in Light**, pins on the FRAMEs only — 15 set, 15 cleared
9. Six-check close-out audit re-run clean. **P4 closed.**

~~**W5 stays blocked on B2. B1 and B2 remain the user's decision and were not touched.**~~
**Superseded: B2 was decided 2026-08-09 (226 everywhere), B10 route 1 approved 2026-08-22, and
`10:35` dropped from P6.** W5 and B1 are both closed. B1's closure and the one label departure from
its literal wording are recorded under B1.

---

### A4 🟠 Build page templates on `10:33` · P5 · **UNBLOCKED 2026-08-23 — in progress**

**This is the next build step and it is now executable.** The tool that was missing is bound into the
session; see the cleared blocker at the top of this file.

**The pre-flight gate is satisfied on a live reading, not on a remembered marker.** `10:33` was
re-read **2026-08-23** and returned `{name: "Page Templates", count: 0, children: []}`. The
2026-08-22 reading was deliberately not treated as standing permission — **an "empty" page marker in
this project's documents has been wrong twice**, on Metric Card `10:19` and Wireframes `10:32`, and
both times acting on it would have rebuilt over finished work. The gate now rests on a reading taken
in the session that builds.

**Step 2 is complete — the templates were derived from the live wireframes, not assumed.** A depth-4
structural walk of all seven frames on `10:32` confirms the shell and settles the two questions
`HANDOFF.md` §9 says no shipped page answers:

- **Every screen is one shell.** Root 1560 HORIZONTAL → `Rail` 280 → `Content column` **1280** →
  `Top Bar` 1280×48 + `Page` (pad 32, gap 24) → every child **1216**. `layout/page-max` 1560
  **includes the rail** — that is the root of the whole arithmetic and no page states it.
- **The column arithmetic, derived at both target widths.** Grid area = page − rail − 2 × 32; *n*
  cards of 240 at gutter 24 need 264*n* − 24.

  | page | rail | content col | grid area | columns | used | trailing |
  |---|---|---|---|---|---|---|
  | 1920 → capped **1560** | 280 | 1280 | 1216 | **4** | 1032 | 184 |
  | 1560 | 48 | 1512 | 1448 | **5** | 1296 | 152 |
  | **1440** | 280 | 1160 | 1096 | **4** | 1032 | 64 |
  | 1440 | 48 | 1392 | 1328 | **5** | 1296 | 32 |

  Three consequences: **1920 and 1560 are the same layout** because `page-max` caps and centres, so
  the primary target is not a distinct case; the grid is **4 columns at both target widths and does
  not reflow between them**; and collapsing the rail buys **exactly one** column — 232 px freed plus
  184 trailing is 416, one column costs 264, so never two.
- **When the rail collapses: the floor is 1376, and it is never reached.** The narrowest page that
  still holds four columns with the rail expanded needs grid ≥ 1032 → content ≥ 1096 → page ≥ **1376**.
  The declared minimum 1440 clears it by 64 px, so **collapse is never forced at any supported width**
  — it is a reader preference that buys a fifth column, not a responsive breakpoint.
- **The shipped grid confirms the arithmetic exactly.** Library's rows hold 4 cards at x = 0/264/528/792
  plus a named `Slack` frame 160 wide at FILL: 4 × 240 + 4 × 24 + 160 = **1216, overflow 0**. Trailing
  space is an explicit node, matching the Filter bar's named `Spacer` — a convention worth stating as a
  rule.
- **Collections `496:329` is not a sixth template.** Its `Page` holds a Header plus an `Empty region`
  `496:415` containing one Empty State `496:416` (Type=Empty collection, Size=Page). It is the **empty
  form of the Grid page**, which is the shipped Empty State rule applied literally — the content region
  is replaced, never the page. Five templates, as `HANDOFF.md` §9 recommended, now on evidence.
- **Search `499:731` has no filter bar and no pager.** §9's "header → filters → rows → pager" reading
  over-describes it: the live frame is Header → `Results` (VERTICAL, **gap 0**) → four 1216×56
  Game Card / Row instances at y 0/56/112/168. The divider is each row's own bottom stroke, which is
  why the gap is zero. The List page template must say so rather than inherit the recommendation.
- **Library's 1576 is the one scrolling screen, and the fold is now exact.** `Grid` runs
  absolute y 192→1488 in three rows (192→608, 632→1048, 1072→1488) with the pager at 1512→1544. At
  1080 the fold shows **two complete rows — eight cards — and breaks the third row's top edge by 8 px**,
  which is a scroll affordance rather than a defect. The pager is always below the fold on a full page.

**Entry plan:** `HANDOFF.md` §9. **Constraints that apply and are not P5's to revisit:** the layout
on `10:32` is settled architecture — P5 refines it and does not reinvent it; **no frame is
hand-placed**, the 3-column grid is extended; and **B13 is explicitly out of P5 scope** — a
Grid/Row view switch is chrome, and chrome is settled.

**Do not substitute other work for it.** P5 is the only remaining build step before P6, and the
four user decisions (B9, B11, B12, the "Records owned" label) do not block it — they were confirmed
non-blocking on 2026-08-22 and that has not changed.

---

## B. Defects — ranked

### B1 ✅ RESOLVED 2026-08-22 — Metric Card no longer ships fabricated data · `10:19`, set `154:23`, doc `169:23`

**Found 2026-08-05, and it was the most serious item in the file. Closed on both layers — the
rendered text *and* the property defaults.**

The Metric Card variants used to read:

```
Games owned            1,247
                       584 high · 118 medium · 22 low · 523 none
                       724 of 1,247 games enriched
```

Every one of those figures was invented. Measured reality (`DATA_PIPELINE.md` §7):

| shipped | actual |
|---|---|
| 1,247 games | **226** records (A 51 + B 175) |
| 584 high · 118 medium · 22 low · 523 none | **High 63 · Medium 161 · Low 2** |
| a "none" confidence bucket of 523 | **there is no "none" bucket** — confidence is on 100% of rows |
| 724 of 1,247 enriched (58%) | 132 of 226 enriched (58.4%) — the *ratio* is coincidentally close, the numbers are not |

Two things were wrong, and the second was worse than the first. The counts were fabricated, **and
the confidence breakdown showed a four-way split whose fourth bucket does not exist in the
schema.** A reader would have designed a legend, a filter and a chart segment for a state that can
never occur.

**Now reads, on both the set and the doc page:**

```
Records owned          226
                       63 high · 161 medium · 2 low        ← three buckets
                       132 of 226 records enriched         (58.4%)
```

The fourth bucket was **deleted, not zeroed** — a `0 none` legend still teaches a reader that the
state exists and can be filtered for.

**⚠ One departure from this item's literal wording, and it needs a user confirmation.** B1 specified
the label *"Games owned"*. It ships as **"Records owned"**, on the file's own authority: Data &
Provenance `10:10` `27:372` states the rule *"No bare '226 games' anywhere in the UI"*, because
**226 is ledger rows, 220 is unique titles, 208 is actual games** — and `27:378` requires that every
count name its unit. "226 games" would have violated a shipped rule on the same day it was written.
`226 records` satisfies it. **Confirm or overrule the label; the figures are not in question.**

**Two lessons, both now in `CLAUDE.md`:**

- **A dormant property override is invisible to a text sweep *and* to the render.** This item looked
  closed for a whole session while the property layer still held both fabrications. Nine of the
  twelve variants reference `Detail#156:26` on no text node, so a stored value renders nothing,
  never appears in a `characters` sweep, and surfaces the instant someone switches variant. Root
  cause is **B15**; the decision about the property is **B11**.
- **The fix was to *align* `Detail#156:26`, not to clear it.** Clearing falls back to the new default
  ("+18 vs. 2025"), which is wrong for a Progress or Breakdown card. A default change reaches every
  variant sharing the default but cannot reach an instance holding its own override — and the
  converse. The two are not substitutes.

Text nodes that carried the fabricated strings, kept for the record:

```
set  154:23   152:8  152:17  152:29  152:34  152:41  152:48
              152:489  152:497  152:507  152:510  152:516
              153:21  153:30  153:41  153:44  153:51
doc  169:23   170:147  170:155      (Rules column copy)
```

**Figma auto-names TEXT nodes by content**, so a fabricated figure survives in `node.name` after
`characters` is fixed — the node names were swept too.

---

### B2 ✅ DECIDED 2026-08-09 — use **226 everywhere**

**User decision: option 1.** 226 is the only library size in the file. **20,400 is retired
entirely** — not relabelled, not kept as an illustrative scale figure, not preserved for
scale-behaviour copy. 1,247 was never one of the options.

**This unblocks B1 and W5, and creates B10.** Choosing 226 is not a recaptioning job: it removes
the premise the Pagination rationale was *argued from*. That argument must be rebuilt from the
measured corpus, not patched — see **B10** (**route 1 approved 2026-08-22**), which is a direct
consequence of this decision and must not be skipped when the doc pages are rewritten.

**✅ THE SWEEP IS DONE — landed 2026-08-22.** Five source components and eight doc pages, plus the
wireframes page. **Fixed at the source first, then the residue**, which is the only order that works:
the hits were mostly not page text but **Count Badge instances nested inside component variants**,
which every consumer inherits.

- Section Header set `286:82` — `I286:6;55:54`, `I286:13;55:54`, `I286:30;55:54`
- Nav Item set `301:44` — `I301:6;55:56` … `I301:25;55:56`

Top Bar, Modal and the wireframes inherited from those two. Editing the doc pages first would have
left the source still producing the retired figure into every future instance — which is how 20,400
spread in the first place.

**A shape sweep beats a needle sweep, and this is the evidence.** A literal scan for
`20,400` / `20400` / `1,247` / `8,200` came back clean, and the file still held **`8,540`**,
**`4,102`**, **`20,412`** and **`311`**. A class pattern `/\d,\d{3}/` caught the first three; `311`
has no comma and was found only by reading full text. **Sweep for the shape of a fabricated figure,
never for the specific one you remember.** Final page-`10:32` sweep: `commaCount 4` (all legitimate
non-counts) · `unitCount 2` · `bareCount 0`.

Original analysis retained below, because it records what each figure was load-bearing for.

| figure | where | origin |
|---|---|---|
| **226** | Data & Provenance `10:10` | measured — correct |
| **1,247** | Metric Card `10:19` | fabricated (B1) |
| **20,400** | Divider & Progress `191:45` onward — Section Header `292:2`, Sidebar `304:2`, Top Bar `333:1645`, Modal `373:37`, Pagination `395:85`, Game Card / Row `274:2`, Empty State `419:34` | originated in `CLAUDE.md` prose alone; never measured |

`20,400` is load-bearing in more places than it looks. Pagination's whole argument depends on it
— *"20,400 at 50 per page is already 408 pages"* is what justifies the seven-slot fixed run and
the no-page-size-below-50 rule. Section Header's count rule, Top Bar's `Syncing 8,200 of 20,400`,
and Empty State's `0 of 20,400` all cite it too.

**This is a user decision, not a unilateral fix.** Three defensible conventions:

1. **Use 226 everywhere.** Honest, but a 226-record library makes pagination look like
   over-engineering and the seven-slot argument collapses (226 at 50 = 5 pages).
2. **Keep 20,400 but relabel it as an explicitly illustrative scale figure**, stated once on the
   Cover or Getting Started page, with Data & Provenance keeping the real 226. This preserves the
   pagination rationale (the design must survive a large library even if today's is small).
3. **Use 226 for anything describing *this* corpus and 20,400 only where the point is scale
   behaviour**, labelled as such inline.

~~Recommendation if no direction is given: **option 2**~~ — **superseded. The user chose option 1
on 2026-08-09.** The recommendation is recorded only so the tradeoff that was accepted is legible:
option 1 was chosen knowing it collapses the seven-slot pagination argument, which is why **B10**
exists.

Whatever is chosen, **B1 must be fixed regardless** — 1,247 is not one of the three options.

---

### B10 ✅ Pagination's rationale is orphaned by the 226 decision · **created 2026-08-09 · route 1 approved 2026-08-22**

**A direct consequence of B2. Do not rewrite the eight doc pages without resolving this.**

Pagination `10:27` is argued from a library size that no longer exists in the file. The claims
that depended on 20,400, all on doc `395:85` unless noted:

| shipped claim | status at 226 records |
|---|---|
| *"20,400 at 50 per page is already 408 pages"* | **false** — 226 at 50 is 5 pages |
| the **seven-slot fixed run**, justified by needing first/last/ellipses at 408 pages | **premise gone** — 5 pages fit a run with slots to spare, so ellipses never render |
| **no page size below 50**, justified by a 3-digit slot capping the control at 999 pages | **premise gone** — 226 at 25 is 10 pages, at 10 is 23 |
| Top Bar `333:1645` `Syncing 8,200 of 20,400` | needs a real in-flight figure against 226 |
| Empty State `419:34` `0 of 20,400` | needs 226 |
| Section Header `292:2` count rule citing 20,400 | needs 226 |
| W5, Settings `499:986` — *"Below 50, the page count outgrows the pager's seven fixed slots"* | **false at 226** — this is why W5 was blocked |

**The design itself is very likely still right — the *argument* is what broke.** A fixed-width run
that never reflows under the pointer is defensible at any size (that reasoning is independent of
page count), and `CLAUDE.md` records it as the primary motivation. What cannot survive is citing
408 pages as the reason.

**Two honest routes, and this is a design call rather than a copy edit:**

1. **Re-derive the run from 226.** Accept that ellipses are dead code today, and say so: the run is
   sized for the library to grow into. Keeps the component untouched; rewrites the *why*.
2. **Re-scope the component to the corpus.** A 5-page set does not need a seven-slot run, first/last
   jumps, or a 50-minimum page size. Smaller and more honest, but it **reinvents a shipped,
   verified component** — which the standing "refine, do not reinvent" constraint forbids without
   explicit approval.

**✅ ROUTE 1 APPROVED by the user 2026-08-22, and LANDED the same day.** Pagination is untouched as a
component; the rationale is rewritten. **The component was not re-scoped** — the user was explicit
about that, on the grounds that route 2 reinvents verified work.

**What landed, in one pass so the two nodes cannot disagree:**

- **`395:85`** — the Pagination doc page. The seven-slot argument is now derived from the real corpus:
  a run that never reflows under the pointer is defensible at *any* size, and the fixed width is sized
  for the library to grow into. **Re-derived, not recaptioned** — the 408-page claim is gone rather
  than renumbered.
- **`499:986`** — W5's Settings caption, which made the same claim in miniature. Rewritten in the same
  pass.
- Both now state what is measured: **226 records at 50 per page is five pages**, so the ellipsis and
  the first/last jumps are **dormant, not wrong**. At 25 per page it is ten pages, and `1 2 3 4 5 … 10`
  exercises the run exactly — kept in the copy as a worked example, explicitly *not* as an argument
  for changing the page-size floor. The 50-minimum survives as a default, not as arithmetic.

**Confirmed against the live file 2026-08-22** while fixing W9: the Library pager at 226 renders
`‹ 1 2 3 4 5 ›` with no gap to elide, and the ellipsis had to be hidden on the instance. That is the
behaviour the rewritten rationale explains.

---

### B3 🟠 Primary and Danger Disabled buttons carry no stroke

Six variants: `93:22`, `93:52`, `93:82`, `93:382`, `93:412`, `93:442`.

In Light, `bg/disabled` resolves to `#f0f0f0`, identical to `bg/canvas` — so a Primary Disabled
button sitting on a page surface **has no edge whatsoever**. Secondary Disabled already carries
`stroke/subtle` and reads correctly.

**Fix:** apply `stroke/subtle` to the six variants, matching Secondary Disabled.

**Do not** solve this by moving `bg/disabled`. Flat-on-the-page is the intended semantic for a
disabled control, and `bg/disabled = bg/canvas` in Light is a documented non-defect.

---

### B4 🟡 `fg/quaternary` fails on a selected surface

Measures **3.95 Light / 4.17 Dark** on `bg/layer-selected`. It backs ~342 text nodes across the
file, so the token cannot move.

**Fix:** it is a usage rule, not a token change. Use `fg/tertiary` (4.60 Light) or stronger for
any text on `bg/layer-selected`. Worth an audit sweep for existing violations — Game Card / Row's
Selected variant and the Sidebar's Selected nav item are the two places to check first.

---

### B5 🟡 Form Controls `10:15` has no overview doc page

Every other completed component page has one. `10:15` has component sets and a doc frame at
`111:45` covering individual controls, but no page-level overview consistent with peers.

**Decide:** add the overview, or fold the guidance into the individual control sections and note
the deliberate departure. Either is fine; the current state is just unexplained.

---

### ~~B6 🟡 Select has no "value shown" state~~ ✅ **CLOSED 2026-08-22 — the item was false**

Set `109:114`, 21 variants. **Probed live against the set, not inferred from an instance:**

```
Select 109:114   Size  [Small, Medium, Large]
                 State [Rest, Hover, Focus, Open, Filled, Error, Disabled]
```

**`Filled` exists, on all three sizes** — 3 × 7 = 21, which accounts for every variant. The state was
never missing. Settings `499:963` was right, and so was the wireframe audit that flagged this.

This is the same shape as B7: **a document asserted something was absent and nobody grepped the live
source.** It is the third time. The rule earned twice over now: *read the collection or the set before
writing down that something does not exist.*

Same probe, for the record — every text-bearing control already has `Filled`:

```
Text Input 107:140   State [Rest, Hover, Focus, Filled, Error, Disabled, Read-only]
Textarea   109:131   State [Rest, Hover, Focus, Filled, Error, Disabled, Read-only]
```

**One consequence, and it is a real cleanup item.** Pagination's `50 per page` Select uses `State=Rest`
with an **instance-level rebind** of the placeholder to `fg/primary`, because the item said no `Filled`
state existed. It does. Swap the instance to `State=Filled` and drop the rebind — an override that
duplicates a shipped variant is exactly the kind of workaround that outlives the reason for it.
**Low priority, cosmetically identical today**, but it removes a divergence between two components
that should render the same way. Node is inside Pagination set `392:186`; find it before changing it.

### B9 🟡 Should Switch — **and Checkbox, and Radio** — gain a `Show label` boolean? · **user decision**

Raised by wireframe defect W4 on 2026-08-06. **Probed live 2026-08-22, and the gap is wider than the
item recorded.** All three binary controls carry the same two variant axes and *nothing else*:

```
Checkbox 106:53    State [Unchecked, Checked, Indeterminate] × Interaction [Rest, Hover, Focus, Disabled]
Radio    106:86    State [Unselected, Selected]              × Interaction [Rest, Hover, Focus, Disabled]
Switch   106:123   State [Off, On]                           × Interaction [Rest, Hover, Focus, Disabled]
```

**No `Show label` on any of the three**, so every one renders its nested `Label` text unconditionally.
B9 previously said Checkbox and Radio "should be checked for the same gap" — they have been, and they
have it.

**The file already owns a labelling mechanism, and that is the argument.** `Field` `107:141` is a
standalone wrapper whose whole job is labelling:

```
Field 107:141   Label#107:0     TEXT     "Label"
                Hint#107:1      TEXT     "Helper text that explains the constraint."
                Required#107:2  BOOLEAN  true
                Show hint#107:3 BOOLEAN  true
```

So a control's own nested label is a **second** labelling path, and the two can disagree. That is what
W4 actually rendered: a Settings row that named the setting, plus a switch repeating the word "Label"
beside it.

**Recommendation — add `Show label` to all three, defaulting to `true`** so no existing instance
changes, and use it wherever the host already names the control. A set-level BOOLEAN is cheap here
because it toggles *visibility*, not content — unlike a set-level TEXT property, which forces one
shared default across every variant and is what broke Section Header (see B11). **Do not** solve it by
deleting the nested label: a bare control with no label is the worse default, and Field is not always
the host.

**Two per-instance workarounds already exist**, both from W4 — `I499:995;106:108` and
`I499:1011;106:108`, two instances on one screen hiding the same nested node. That is the cost of not
having the boolean, and it will recur in every P6 screen with a settings row.

**Decide when Form Controls is next revisited, alongside B5.** Not blocking P5.

**Second, smaller question in the same visit, sent here by W7.** Switch `106:123`'s `Track` carries
`pad [2, 2, 2, 2]` raw on the **main component** — the 2 px thumb inset. W7 flagged it as unbound
spacing on the Settings instances, which was a false alarm: the instances inherit it and cannot own it.
Under the Avatar precedent, intrinsic component geometry stays raw, so **this is not a defect today**.
The question is only whether a thumb inset is "intrinsic geometry" (like Avatar's box sizes) or
"spacing" (like a gap) — `XXS` is 2, so a token exists if the answer is spacing. Checkbox and Radio
should be checked for the same inset at the same time. **Lowest priority of anything in this file.**

---

### B11 🟠 `Detail#156:26` on Metric Card is wired to 3 of 12 variants — **user decision**

Found 2026-08-22 while fixing W2, whose six wrong footers looked like a property fix and were not.

Metric Card `154:23` exposes a TEXT property `Detail#156:26`, but only **3 of its 12 variants**
reference it. On the other nine `setProperties({'Detail#156:26': …})` is a **silent no-op** — no
throw, no warning, no change. W2 was fixed by editing each instance's `Caption` text node directly,
which is why it landed at all.

**Do not "fix" this by wiring the property across all twelve.** The Section Header precedent is
explicit: a set-level TEXT property forces **one shared default across every variant**, and adding
`Title`/`Description` there silently collapsed all six variants to the same copy. Wiring
`Detail#156:26` would do the same to all twelve Metric Card detail lines — a worse defect than the
one it fixes, and it would destroy per-variant copy that is currently correct.

**Two routes, both defensible:**

1. **Delete the property.** Per-variant copy plus editable instance text is what the file already
   relies on everywhere else, and it is what actually worked for W2. Costs nothing at the instance
   layer; removes a property that reads as available and is not.
2. **Keep it and document it as scoped.** Record on the doc page `169:23` which variants honour it,
   so the next consumer does not discover the no-op the way I did.

**Recommendation: route 1**, on the grounds that a property present on a quarter of a set is a trap
rather than an affordance. **User decision — do not act unilaterally.** Clear
`componentPropertyReferences` on the consuming nodes before `deleteComponentProperty`, or deletion is
refused.

---

### B12 🟠 Is a month-granularity trend defensible on this corpus? · **created 2026-08-22 · user decision**

Metric Card `154:23` has a Trend variant. Its delta was fabricated along with everything else B1 fixed,
and it now reads **`+18 vs. 2025`** on both layers — the rendered text and the property default, aligned
in the same pass so they cannot drift. **That figure is measured**: 208 records owned through 2025, +18
in 2026. So the *number* is not in question. Two things about the *metric* are.

**First — the corpus has almost no trend in it.** `2024-03` alone accounts for **109 of 226 records**,
48% of the library, because that is when the receipt backfill lands. The trailing two months are empty.
A month-granularity chart of this data is one spike and a flat line, and the spike is an artefact of
when the data was *imported*, not when anything was *acquired*. This is the "data decides the hierarchy"
rule pointed at a metric rather than a sort: **a field whose shape is an import artefact should not
drive a headline.** Year granularity (`+18 vs. 2025`) survives that objection, which is why the card
ships it. Month does not, and nothing should introduce it later without re-reading this.

**Second — the delta is bound to `status/success-fg` (`VariableID:5:30`), unconditionally.** Green is
correct for `+18`. It is wrong for any negative delta, which would render *failure-coloured* for what is
usually a neutral fact — a library shrinking because rows were deduplicated is not a failure. Either the
binding becomes conditional on sign (which a static component cannot do, so it becomes two variants), or
the delta drops the semantic colour and takes `fg/secondary`, or the component documents that it is
**only** for non-negative deltas.

**Recommendation: document the constraint rather than build the variant.** On this corpus a negative
delta cannot occur — records are never removed — so a second variant would be speculative work for a
state the data forbids, which is exactly how the fourth "none" confidence bucket got built. State the
rule on `169:23` and revisit if deletion ever exists. **Not blocking P5.**

---

### B13 🟡 Nothing switches between Grid and Row · `44:118 list-view` has zero consumers

Found 2026-08-22 by an icon-consumer sweep. **Game Card / Grid `221:141` and Game Card / Row `272:144`
are both built, documented and verified in both modes — and no component switches between them.** The
icon that would sit in that control, `Icon / list-view` `44:118`, has **zero instances anywhere in the
file**; `44:106 grid-view` has one, inside Empty State's "Empty collection" type.

So the two most-built components in the library have no affordance that chooses between them. Settings
`499:963` renders a `Grid` value through a Select, which means the preference exists as a *setting* — but
a view density toggle belongs in the view, next to Sort, not three clicks away in Settings.

**What it probably is:** a two-state segmented control, `icon/sm` marks, `control/height-md`, living in
Section Header's trailing slot. **What blocks it:** Section Header's rule that *"the trailing slot holds
at most one control"* — Library's Page header already spends that slot on Sort. So this is not purely a
new component; it is a question about whether Section Header grows a toolbar affordance, which the
shipped doc page explicitly says means "you want a toolbar, which is a different component".

**Do not build it inside P5.** It is a component-library item that surfaced during layout work; P5 is
templates. Flag it as the first candidate for any P3.6, and note it in the P5 template annotation so a
reviewer knows the omission is known rather than missed. Compare `129:16 person`, the other unconsumed
icon — that one is correctly unconsumed, this one is a gap.

---

### B14 🟢 "1,299 INR" is fabricated · `17:21`, `17:13`, `16:108` · **measured 2026-08-23, edit blocked on Figma**

Surfaced by the B2 shape sweep, and deliberately **not** changed by it. Three nodes on the early doc
pages carry a price of `1,299 INR`.

**It does not violate the unit rule** — Data & Provenance `27:378` requires every *count* to name its
unit, and this names its currency. It is also not one of the retired figures; `20,400`, `1,247` and
`8,200` are all gone. So there is no defect here that the sweep should have caught.

The only open question is whether the price is **measured or illustrative**. The corpus does carry price
data, so it is checkable. Either confirm it against a real record and leave it, or relabel it as an
example. **Lowest-consequence item in section B** — a wrong example price misleads nobody about the
product's shape, unlike a wrong record count. Listed only so the sweep's decision not to touch it is on
the record rather than looking like an oversight.

**✅ MEASURED 2026-08-23 — the answer is illustrative, and it has no source at all.** `pricing.msrp`
is populated on **226 of 226** records, so this was fully checkable, and the value **`1299` occurs
zero times** in the corpus. The 51 distinct MSRP values include `1149.0`, `1300.0` and `1350.0` but
never `1299.0`; `pricing.current` was checked too, same result. `ownership.purchasePrice`, the
price-actually-paid field, is populated on only 32 records and does not carry it either.

So `1,299 INR` is a **fabricated figure of the same class as `20,400` and `1,247`** — a
plausible-looking number with no live source, landing within one rupee of the real `1300.0`. It is
still the lowest-consequence instance of that class, for the reason already given: it misstates an
example price, not the shape of the library.

**Remaining work is a Figma text edit on `17:21`, `17:13`, `16:108` and is now UNBLOCKED** (2026-08-23,
see the cleared blocker at the top of this file). Two routes, and the second is preferred:
1. Retarget onto a real corpus value — `1,300 INR` is the nearest true MSRP.
2. **Relabel as an example** (`e.g. 1,299 INR`, or a title-less specimen price), which is the
   honest fix: these are early doc pages demonstrating a *format*, and no single record's price
   belongs there. This keeps the figure from being read as measurement, which is exactly the failure
   mode `20,400` demonstrated.

Do **not** simply delete it — the nodes exist to show that a price names its currency, which is the
unit rule `27:378` requires.

---

### ~~B7 🟢 `brand/tint` does not exist~~ ✅ ANSWERED 2026-08-05 — nothing to create

**`brand/subtle` `VariableID:5:16` already exists**, scoped `FRAME_FILL`/`SHAPE_FILL`, with full
code syntax on all three platforms. It *is* the soft-brand-background token. `brand/tint` does not
exist and should not be created — a second token for the same role is worse than none.

Verified live while auditing the Color collection for `bg/skeleton`. The same pass found
**`bg/subtle-hover` `VariableID:5:7`**, also absent from `CLAUDE.md`'s ladder table. Both are now
recorded there.

**The lesson is the reusable part:** this item existed because a document asserted a token was
missing and nobody grepped the live collection. Same shape as the "no person icon" claim. **Grep the
live collection before concluding a token is absent** — the Color collection has 59 variables and no
document lists them all.

### B8 🟠 Audit every container set for baked-in child states · recurring shape #15

**Sidebar `302:96` shipped with `Stores` baked as `State=Hover` on both variants** (`302:23`
Expanded, `302:74` Collapsed), so every Sidebar instance in the file rendered a phantom hover.
**Fixed 2026-08-05** — both set to `State=Rest`, after verifying against the Sidebar doc `304:2` that
no instance was using it as a hover demo (`308:5`, `308:93`, `305:86` sit in "Cell — Expanded",
"Cell — Collapsed" and "In use / Shell").

**This is the second occurrence.** Context Menu `354:1629` had exactly the same defect on its Compact
variant. Two out of two container sets built so far shipped it, which makes it systematic rather than
incidental.

Still to audit — every set holding nested instances that carry a State axis: **Top Bar `321:35`**,
**Modal `370:112`**, **Pagination `392:186`**, **Empty State `417:128`**, **Metric Card `154:23`**,
**Game Card / Grid `221:141`** and **/ Row `272:144`**, **Section Header `286:82`**, and the new
**Loading Skeleton `451:2`** (no State axis on its children, so low risk).

**Charts `474:104` and `475:38` are audited and clean** — checked 2026-08-05 by a page-wide walk
flagging any nested `INSTANCE` whose `State` or `Interaction` variant is not Rest/Default/None.
Neither set contains a nested instance at all, so they cannot carry the defect. That walk is the
reusable check; run it per page rather than eyeballing each set.

A structural read-back cannot see this — the geometry is valid and only a nested instance's variant
*value* is wrong. Read `child.componentProperties` on every nested instance, or screenshot the set
and look. **A container variant must ship every child at rest.**

---

## C. Documentation and pipeline

### ~~C1 🟡 `data/analytics/` is promised but absent~~ ✅ CLOSED 2026-08-23

`tools/build_app_data.py`'s docstring said it emits `data/analytics/*.json`. Verified live: the
directory does not exist, and `grep -n analytics tools/build_app_data.py` returns **only the
docstring line** — there is no emit code path anywhere in the file, so it was never removed and it
never silently no-opped. The claim was simply false. The script's real outputs are
`data/account{A,B}.json` (line 216), `data/genres.json` (224) and `data/config.json` (226), and all
three exist on disk.

**Fixed by correcting the docstring, not by restoring the emit** — nothing consumes analytics, and
at 226 records precomputing it buys nothing. The replacement text says so explicitly and dates
itself, so the next reader does not re-open this.

### ~~C2 🟡 Receipt `.eml` sources live in a Windows temp directory~~ ✅ CLOSED 2026-08-23 — **the sweep already happened**

**The premise expired before the fix ran.** `C:/Users/Sufiyan/AppData/Local/Temp/gid_extract` no
longer exists, and `find . -iname "*.eml"` returns nothing anywhere in the project. The temp sweep
this item warned about has already occurred, so the stated fix — move the files into
`data/source/receipts/` — was **no longer executable**. Stage 2 is not re-runnable from source.

**Nothing downstream is lost.** `data/raw/receipts.json` preserves all **14 orders and all 32 line
items**. That is more consequential than it looks: re-measured 2026-08-23, those receipts are the
**sole** source of `ownership.purchasePrice`, which is populated on exactly **32 of 226 records
(14.2%)** — and the correspondence is 1:1 in both directions. Every record citing a
`Receipt email` provenance source has a price; no record without one does. Nothing else in the
pipeline can supply it.

**🔴 And the investigation surfaced a live data-destruction bug, now fixed.** `Path.glob()` on a
missing directory yields zero matches and **raises nothing** (verified). The script globbed, got
zero, and then unconditionally wrote its output — so running
`python tools/parse_receipts.py` at any point after the temp sweep would have overwritten
`data/raw/receipts.json` with `[]`, destroying the only surviving copy of the 32 price line items
with no way to recover them. This is the audit-trust corollary applied to code: **a zero from a
glob that reached nothing is not a measurement.**

**Landed:**
- `--eml-dir` default repointed to `data/source/receipts/`, matching the convention
  `data/source/account{A,B}.transactions.txt` already sets, so a re-export lands somewhere durable
  and in-project.
- The script now **refuses to run** and exits non-zero if `--eml-dir` is missing or holds no `.eml`
  files, leaving the existing output untouched. Verified: the artifact's md5 is unchanged after a
  default-args run, and it still reads 14 orders / 32 items.
- All 14 lost filenames, with the order id and item count each produced, are recorded in the
  script's docstring so a mailbox re-export is possible.
- The empty `data/source/receipts/` directory is **deliberately not created** — an empty receipts
  dir would make the script report "0 orders" as though that were a finding.

`parse_receipts.py` was the only tool with this shape; `parse_transactions.py` already guards with
`if not path.exists()`.

---

## D. Roadmap after P3.5

Detail in `HANDOFF.md` §7. Sequence, with the one hard constraint each carries:

| Phase | Scope | Constraint to carry in |
|---|---|---|
| ~~**P3.5**~~ | ~~Charts `10:30`~~ | ✅ **DONE 2026-08-05.** Consumed the pre-existing `viz/*` tokens; no chart palette invented. Two components only, because the corpus supports two. |
| ~~**P4**~~ | ~~Wireframes `10:32`~~ | ✅ **DONE 2026-08-22.** 7 screens · 8-node annotation layer · all 9 defects closed · all 15 top-level nodes verified in Dark **and** Light · six-check audit clean. See A3. Layout is now settled architecture — P5 and P6 refine it, they do not reinvent it. |
| **P5** | Page Templates `10:33` | 1560 page max, 32 gutter, 24 grid gutter, 280 rail, 48 top bar. **Derive the column arithmetic at 1920 *and* 1440, and the rail-collapse threshold, live** — no page states either. `10:33` read empty on 2026-08-06; **re-audit before building**, because this file has been wrong about an empty page twice and both times it was about to destroy finished work. |
| **P6** | Screens `10:36`–`10:42` + Changelog `10:44` | Every screen must be fillable by the measured corpus. No completion, no playtime hierarchy, no multi-store comparison. **P6 is SEVEN screens.** `10:35` "Dashboard" was **dropped 2026-08-09** — the rail has 7 destinations and gains no Dashboard. See A3. |
| **P7** | Cross-screen consistency validation | |
| **P8** | **Present for approval — this unlocks the implementation gate** | Until sign-off: no HTML, CSS, JS, React or Vue. The legacy `app/` is not an exception. |

---

## E. Closed — do not re-open

Recorded because each of these was investigated, resolved, and would otherwise look like a bug
to a fresh reader.

| Item | Resolution |
|---|---|
| Light surface three-way `#f0f0f0` collision | Fixed 2026-08-02. `bg/layer-selected` → `#d6d6d6`; both Light strokes made alpha. |
| Chip plate vanishing on hover | Fixed 2026-08-02. New alpha `bg/chip`; 25 variants bound. |
| `confidence/*` failing 4.5:1 as 12 px Semi Bold | Fixed 2026-08-02. `red/140` created; Light rungs deepened. **Never cite a large-text exemption for the level word.** |
| 89 mode pins freezing instances to Dark | Swept 2026-08-03. **110 remain and must stay** — they are documentation FRAMEs. |
| Three (actually ten) Color variables with wrong `codeSyntax` | Fixed 2026-08-03, re-verified 58/58 on 2026-08-04. |
| Cover `35:17` stale variable counts | Fixed again 2026-08-05 (fourth time). **Two nodes carry counts, not one** — `35:17` Color and `35:21` Motion. The 2026-08-04 pass missed `35:21`. Any collection change implies rewriting **both**, from a live count, in the same session. |
| `brand/tint` "does not exist, create it" | **`brand/subtle` `5:16` already existed.** Answered 2026-08-05 without creating anything. Grep the live collection before concluding a token is absent. |
| Loading & Skeleton block token | `bg/subtle` looked right on the meter-track precedent and was wrong — 1.00:1 on a `bg/subtle` doc panel. New alpha `bg/skeleton` at 12%. **Sixth consumer of the alpha rule.** |
| Metric Card `10:19` "verify ids before trusting" | Resolved 2026-08-05 — set `154:23`, doc `169:23`, both live. |
| `CLAUDE.md` claiming there is no person icon | False. `Icon / person` `129:16` exists, zero instances. Icon count is **43**, not 42. |
| `bg/overlay` tying to `bg/layer` in Light | **Non-defect.** An overlay is separated by its shadow, not its surface value. Every attempt to break the tie created a worse collision. |
| Avatar's 1×35 single-column variant strip | **Non-defect** — matches seven other sets. File convention beats the skill's grid preference. |
| Fixed component geometry left as raw numbers | **User decision.** The no-raw-numbers rule governs colour, spacing and radius — not intrinsic geometry. Avatar is the precedent. |
| Component set screenshots rendering washed out | **Non-defect** (recurring shape #11). A set frame carries no fill, so alpha plates composite against nothing. Verify alpha components in real usage. |
| "Select has no value-shown state" (B6) | **False.** `State=Filled` ships on all three sizes of `109:114`. Probed live 2026-08-22 — third time a document asserted an absence nobody had grepped. |
| Settings carrying 8 raw spacing values (W7) | **False alarm.** 16 frames visited, 11 instances skipped, **30 bound, 0 unbound.** The two suspects are inherited from Switch's main component and cannot be owned by the instance. Skip nodes with an INSTANCE *ancestor*, not merely nodes of type INSTANCE. |
| Metric Card shipping `1,247` and a fourth "none" confidence bucket (B1) | Fixed 2026-08-22 on **both** layers — the rendered text and the property defaults. The fourth bucket was **deleted, not zeroed.** A dormant property override is invisible to a text sweep *and* to the render, and surfaces the moment a variant is switched. |
| Three library sizes in circulation (B2) | Decided 2026-08-09 (**226 everywhere**), swept 2026-08-22 across five components, eight doc pages and the wireframes page. `20,400` is retired — do not cite it. A **shape** sweep (`/\d,\d{3}/`) found what a needle sweep for the four known figures missed. |
| Pagination's rationale orphaned by 226 (B10) | Route 1 approved 2026-08-22 — component untouched, rationale re-derived. A run that never reflows under the pointer is defensible at any size; 408 pages was never the reason. |
