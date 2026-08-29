# Game ID — Changelog

**Owner of:** the dated record of what happened, session by session.

**Not the owner of:** current state (`HANDOFF.md`), constraints and node ids (`CLAUDE.md`),
the backlog (`TODO.md`), or the corpus (`DATA_PIPELINE.md`).

Newest first. Dates are the dates the work was recorded in the file, taken from `CLAUDE.md`'s
own closeout headers rather than reconstructed.

---

## 2026-08-23 — data layer, tooling and document reconciliation · **no Figma mutations**

**The Figma MCP server was not registered in this session.** Not failing — *absent*. There was no
`use_figma`, no `get_screenshot`, no `get_metadata` and no `ToolSearch` in the tool list, so there was
nothing to retry. `C:\Users\Sufiyan\.claude.json` shows `mcpServers: []` globally and for both project
keys (`D:\work\Game ID` and `D:/work/Game ID`); the figma **skills** are installed and resolved fine
(`claude-plugins-official/figma/2.2.96`), only the `plugin:figma:figma` server is unconnected. The
blocker is recorded in full in `HANDOFF.md` §5, with what it blocks and how to clear it.

So the session did every remaining item that does not need the file, and did not fake the ones that
do. **No design work was attempted blind, and no Figma-dependent defect was closed on a structural
read-back** — the standing instruction from the 2026-08-22 outage, which applies doubly here because
there was no read-back available at all.

### Closed

- **`TODO.md` C1 ✅ — and it closed as *false*, not as *fixed*.** `tools/build_app_data.py`'s docstring
  promised `data/analytics/*.json`. `grep -n analytics` on the file hits **only that line**: no emit
  code path has ever existed, and nothing reads such a directory. The real emits are
  `data/account{A,B}.json`, `data/genres.json` and `data/config.json`, all three present on disk.
  **Corrected the claim rather than manufacturing an output no consumer wants** — the corpus is 226
  records, small enough that precomputing analytics buys nothing.
- **`TODO.md` C2 ✅ — its premise had already expired.** The item warned that the receipt `.eml`
  sources sat in `C:/Users/Sufiyan/AppData/Local/Temp/gid_extract` and would not survive a temp sweep.
  **The sweep already happened.** No `.eml` survives anywhere, so the recommended file-move was never
  executable. What that costs, measured: those 14 orders / 32 line items are the **sole source of
  `ownership.purchasePrice`**, populated on exactly **32 of 226** records (14.2%) and **1:1 in both
  directions** with the `Receipt email` provenance source. `data/raw/receipts.json` is the only
  surviving copy. The 14 filenames, with their order ids and item counts, are now preserved in the
  script's docstring so a mailbox re-export is possible.
- **🔴 A live data-destruction bug, found while closing C2 and one command from being
  unrecoverable.** `Path.glob()` on a **non-existent** directory yields zero matches and **raises
  nothing** — verified directly. Plain `python tools/parse_receipts.py` would therefore have parsed
  zero receipts and then overwritten `data/raw/receipts.json` with `[]`, destroying the only copy of
  the 32 price line items. Fixed: the script now **refuses to run** on a missing *or* empty source
  directory, exits non-zero and leaves the output untouched. Verified by md5 —
  `613fe65087c1edf66a74f2e2dca5d9d4` before and after a default-args run, `exit=1`, still 14 orders /
  32 items. Also: the default `--eml-dir` was repointed to `data/source/receipts` (matching the
  convention `data/source/account{A,B}.transactions.txt` already sets), and **the directory was
  deliberately not created empty** — an empty receipts dir would make the script report "0 orders" as
  though that were a measurement. The other five tools were swept; only this one used a directory
  glob, and `parse_transactions.py` already guarded.
- **`DATA_PIPELINE.md` §7 independently re-verified in full.** 20+ figures re-measured against the
  live JSON; **all matched**, including the ones easiest to get wrong — playtime present on 177 /
  nonzero on exactly 4, the six `steamStatus` buckets, `INR 222 / USD 4`. Two traps recorded for the
  next reader: `confidence` is nested at **`provenance.confidence`**, so a top-level probe returns
  `MISSING` on all 226 rows and looks catastrophic when nothing is wrong; and a naive duplicate-title
  count returns **8** where the documented **6** is correct.

### Measured

- **🔴 `title` is not a unique identifier.** 226 records → **218 distinct title strings**, through
  three different collision kinds: **6** cross-account (same game owned twice), **1** intra-account
  duplicate purchase (`Discord Nitro` twice in account A, two different transaction ids
  `F2412111815280195` / `F2512172110114389`), and **1 placeholder collision** — two different games
  both rendering `Needs Manual Verification` (order `F2403301554153074`, items `_1` and `_2`). `id`
  *is* safe: **226 distinct of 226, zero nulls, zero cross-account overlap**, formed
  `<transactionId>_<slug>_<n>`. Consequence for the design, not just the data: Game Card / Row's
  shipped rationale says *"the title is the identifier"* — true for the reader, false for the data
  layer. **Never dedupe by title**, and two identical placeholder rows side by side is a **correct**
  render. Recorded in `DATA_PIPELINE.md` §7 and `CLAUDE.md` § Data reality.

  **Corrected within the session: the first publication of this said 224.** Eight titles appear twice,
  so 226 − 8 = **218**. `224` is a real measurement of a different question — rows whose title is not
  the placeholder — and `217` is a third (distinct real titles). Three adjacent quantities, and the
  wrong one shipped for a few hours. Caught by the close-out audit rather than by the measurement, so
  it also confirms the audit earns its keep: **a figure being freshly measured is not the same as it
  being freshly measured for the question you are answering.**
- **⚠ `220 unique titles` could not be reconciled, and could not be checked.** `HANDOFF.md` §8 and
  `TODO.md` B1 quote Data & Provenance `27:372` — *"226 is ledger rows, 220 is unique titles and 208
  is actual games"*. **226 ✅ and 208 ✅ both reconcile exactly** (208 is `classification: "game"`; the
  other 18 are 7 demos, 5 apps, 2 DLC, 2 add-ons, 2 subscriptions). **220 matches nothing** — not 218,
  not 217, not 224. Reading `27:372` needs Figma, so this is recorded rather than resolved. The rule
  it supports (*no bare "226 games" in the UI*) is correct on any of these numbers.
- **🟢 "1,299 INR" is fabricated — `TODO.md` B14, measurement done, edit blocked on Figma.**
  `pricing.msrp` is populated on **226/226** records and `1299` occurs **zero times**; the 51 distinct
  values include `1149.0`, `1300.0` and `1350.0` but never `1299.0`. Same class as `20,400` and
  `1,247`, and it lands **within one rupee of a real value**, which is precisely what makes it read as
  measured. Two routes recorded, **relabel-as-example preferred** — the three nodes `17:21`, `17:13`
  and `16:108` demonstrate the unit rule on `27:378`, so deleting them costs something.
- **Playtime, precisely: 173 explicit `0` + 49 `null` + 4 nonzero** (`123`, `1707`, `59`, `208707`
  seconds). "98% zero" appeared in four places in `CLAUDE.md` and is the wrong phrasing — the 49
  nulls are records **no source could measure**, and per the pipeline's NO FABRICATION rule they are
  never backfilled to 0. Any UI reading the field must render *unknown* distinctly from *0 hours*.

### Reconciled

`CLAUDE.md` had drifted from the file in four ways, all of the same kind this project keeps
recording — a claim that outlived its live source:

- **Three places still described the `20,400` component-layer sweep as pending** (`§ Data reality`
  twice, `§ Known loose ends` once) after it closed on 2026-08-22 with `bareCount 0`. The imperative
  *"fix the components first, re-scan, then clean residual overrides"* is kept as the **method worth
  reusing**, now stated in the past tense.
- **The page-map row for Metric Card `10:19` still read "Ships fabricated data — `TODO.md` B1"**
  after B1 closed.
- **The playtime figure**, above.
- The **title-is-not-unique** finding was added to `§ Data reality`, where a P6 session building a
  list will actually read it.

`HANDOFF.md` gained the §5 blocker block, four new §8 items (9–12), a corrected §9 opener — it had
said *"Nothing is blocked"* — and this session in §10. **Its pipeline command dropped stage 2**, which
would now abort the whole chain under the new guard; stage 4 `build_catalog.py:169` reads
`receipts.json` from disk, so the chain still completes without it.

**The blocker then had to be propagated into the three places a reader actually decides from**, which
the first pass had missed — the same shape as everything else in this section:

- **`HANDOFF.md` §1 still said "Nothing is blocked."** in the file's most-read block. Replaced with a
  🔴 P5-BLOCKED bullet that explicitly distinguishes this blocker from the **cleared** 2026-08-22
  outage, so the two are not read as one recurring problem. §7's roadmap row moved from
  `🔵 next` to `🔴 next, blocked — no Figma MCP (§5)`.
- **`TODO.md` had no A-section entry for P5 at all**, so the blocked item was invisible in the ranked
  backlog. Added **A4**, plus a blockquoted blocker block in the header naming the missing tools, the
  `mcpServers: []` evidence, and both lists — blocked and closed-instead. A4 records that the
  pre-flight gate on `10:33` **must still be re-run live** despite being satisfied on 2026-08-22,
  because an "empty" marker has been wrong twice in this project.
- **`CLAUDE.md`:1378 presented P5 as plainly next.** Amended in place.

**Five `§11` cross-references in `HANDOFF.md` pointed at the wrong section** — §11 is *Repository
layout*; the intended target is §12 *If something looks wrong*. Four were retargeted to §12; the
fifth ("both listed in §11") went to `CLAUDE.md § Notes for whoever picks this up`, because that list
does not live in HANDOFF at all. **§12 then grew from 5 failure modes to 10**, adding the ones this
session produced or hardened: a clean audit from a walk that reached nothing (with the `Path.glob()`
vector as its concrete case), asserted absences, a number that lost its live source, work described as
outstanding after it closed, and the 224→218 error.

### Not done, and why

Everything remaining is Figma-dependent or a user decision. Blocked on the server: **P5** on `10:33`
including its read-only pre-flight, **B3** (six Disabled button variants), **B4**
(`fg/quaternary` on `bg/layer-selected`), **B5** (Form Controls overview doc), **B8** (nested-variant
audit of nine container sets), **B14**'s edit, and the redundant Pagination `50 per page` rebind
cleanup. Waiting on the user: **B9**, **B11**, **B12**, and the "Records owned" label confirmation.
**B13** is explicitly out of P5 scope.

---

## 2026-08-22 (second session) — **P4 CLOSED** · Wireframes `10:32` complete, verified in both modes

The blockers that ended the previous session cleared — the Figma MCP reconnected and the screenshot
loop came back. Everything below was verified by downloading the render and looking at it, per the
standing rule that a structural read-back is not verification.

**No token was created.** Variable counts stand at **215** and no Cover rewrite is implied.

**A note on numbering.** Items tracked as W10–W13 in the working session are recorded here by name.
The numbered ledger in `TODO.md` and `HANDOFF.md` ends at **W9**, which is the last number that ever
had a live source; propagating half-remembered numbers into the rank-2 and rank-3 documents is the
exact failure this project has now recorded six times.

### Closed

- **W5 — the false size-dependent claim.** Settings `499:986` argued a page-size floor from a figure
  that no longer exists. Rewritten with B10's route-1 rationale. Blocked on B2 for two sessions;
  B2 decided it, and this closes it.
- **B10 ✅ route 1, as approved — Pagination keeps its component and gains a real rationale.**
  `395:85` and `499:986` rewritten in one pass. The seven-slot run is now argued from **what a run
  that never reflows under the pointer is worth at any size**, not from a page count. The worked
  example is honest about the corpus: **226 at 50 per page is five pages, so the ellipsis is dormant
  today**; at 25 per page it is ten pages, which exercises the run exactly — `1 2 3 4 5 … 10` is
  seven slots. Confirmed in Light: five pages, ellipsis correctly absent.
- **W8 — the annotation layer, built.** One page note `549:938` (1560×220) plus seven per-screen
  notes: `549:943` Library, `549:946` Collections, `549:949` Stores, `549:951` Accounts, `549:954`
  Analytics, `549:957` Search, `549:960` Settings. The 240 px `ROWGAP` left in the 2026-08-06
  relayout is what they occupy. Every other page in this file states its own rationale; the
  wireframes now do too, so a reviewer can tell which decisions are settled.
- **The Search paragraph was orphaned prose, and is now annotation.** `499:866` ("Rows, not cards…")
  sat loose inside the Search wireframe rather than in a note. Reparented into `549:957`, which grew
  **118 → 166** to hold it. This is the W8 re-scope carried out as stated — *make the existing
  annotation consistent and lift it to a layer*, not *create one from nothing*.
- **The retired figure is gone file-wide, and it was a component-layer fix as predicted.**
  26 text nodes in three shapes, fixed at **five source components**. Top Bar `Sync=Syncing` now
  reads **"Syncing 91 of 226"** (was `Syncing 8,200 of 20,400`), and its action `320:35` correctly
  carries `State=Disabled` — the shipped rule that the action stays in place across all three sync
  states, never resized and never removed.
- **Light-mode verification of all seven wireframes plus the annotation layer.** Nothing on this page
  had ever been seen in Light. **15 Light pins were cleared; zero remain** on `10:32` — confirmed
  live, and confirmed again after the fact. A pin belongs on a documentation FRAME, never on a
  COMPONENT, a variant or an INSTANCE.
- **B1 🔴 is now closed on *both* layers.** The previous session reported it closed on the strength
  of rendered text. That was true and insufficient: the property layer still held both fabrications,
  including the schema-forbidden fourth "none" bucket. See *Found* below — this is the most important
  thing this session learned.
- **B6 — closed as already shipped.** Select's "value shown" state is not missing. `State=Filled`
  exists on set `109:114` across all three sizes, and `109:42` / `109:72` / `109:102` render
  "Epic Games" bound to `VariableID:5:17` (`fg/primary`). `TODO.md`, `CLAUDE.md` and `HANDOFF.md` §8
  all asserted the opposite. Corrected in all three.
- **B13 — three more retired figures, none of them on the list anyone was sweeping for.**
  Modal `370:112`: `370:9` "8,540 unenriched records" → **94**, `370:93` "Never launched" 4,102 →
  **222**, `370:98` "Bought in a bundle" 311 → **109**. Avatar `210:88` "Connected · 20,412 titles" →
  **"Connected · 226 records"**. Heights unchanged, set `816×1280`, `maxExtent 1232`, overflow −48.
- **B14 — a shipped rule was being violated by the Metric Card's own label.** Data & Provenance
  `27:372` states *"No bare '226 games' anywhere in the UI"*, because 226 is ledger rows, 220 is
  unique titles and 208 is actual games. `Label#156:0` read "Games owned". Now **"Records owned"**,
  set at the **default** so all twelve variants follow, plus a `setProperties` on `169:33`, the one
  doc instance holding its own override.

### Fixed — Metric Card, the property layer

- `154:23` — `set.editComponentProperty('Label#156:0', { defaultValue: 'Records owned' })`.
- `169:62` → **"132 of 226 records enriched"** (was "724 of 1,247 games enriched").
- `169:78` → **"63 high · 161 medium · 2 low"** (was "584 high · 118 medium · 22 low · 523 none").
  The fourth bucket is **deleted, not zeroed**, as B1 required — the schema has no "none" state and a
  reader would otherwise design a legend, a filter and a chart segment for something that cannot occur.
- `169:33` — `inst.setProperties({ 'Label#156:0': 'Records owned' })`.

### Found — and this is the session's real lesson

- **🔴 A dormant property override is invisible to a text sweep *and* to the render, and surfaces the
  moment the variant is switched.** Nine of Metric Card's twelve variants reference `Detail#156:26`
  on no text node — their footer carries only `{visible: "…"}` in `componentPropertyReferences` and no
  `characters` reference. So a `Detail` value stored on such an instance is **wired to nothing**: it
  does not render, and it does not appear in a `characters` sweep. It is still there, and it appears
  as soon as the instance is switched to a variant that *does* reference the property. **This is why
  B1 looked closed for a whole session while still holding the fabrication.** Filed as **B15**.
  Aligning the value was the right fix, not clearing it — clearing falls back to the new default
  ("+18 vs. 2025"), which is wrong for a Progress or Breakdown card.
- **A shape sweep beats a needle sweep.** `/\d,\d{3}/` across all 44 pages caught `8,540`, `4,102`
  and `20,412` — every one of which survived a needle sweep for `20,400 / 1,247 / 8,200`. On a
  226-record corpus almost no comma-grouped number is legitimate, which makes the shape itself the
  better query. `311` has no comma and was found only by reading the Modal's full text: a needle
  sweep only ever proves something about its needle list.
- **Figma auto-names TEXT nodes by their content**, so a fabricated figure survives in `node.name`
  after `characters` is corrected. `370:9` was still named for its old string. Sweep names as well as
  characters, or rename to a role name — it is now `Body`.
- **B12, filed.** The Trend card's delta was fabricated at both the instance and the set default;
  both are now `+18 vs. 2025`. Two questions come with it and go to the user, not to me: whether a
  month-granularity trend is defensible at all when 48% of the library arrived in a single month
  (2024-03, 109 records) and the trailing two months are empty, and whether binding the delta to
  success green (`VariableID:5:30`) is right when "fewer games added" carries no bad valence.

### Final sweep — clean

44 pages, 3716 TEXT nodes, `loadErr: null`.

```
commaCount 4   all legitimate — 36:117 is a CSS literal rgba(255,255,255,0.08);
               17:21 / 17:13 / 16:108 are "1,299 INR", a price, not a count
unitCount  2   both legitimate — 27:357 "184 titles" = 226 − 42 metacritic rows;
               396:260 "500 records" = the specimen basis route 1 explicitly declares
bareCount  0   no unqualified "games owned" anywhere in the file
```

### P4 close-out audit — six checks, all clean

```
modePins           0
rawFills           0
rawSpacing         0
nestedNonRest     18   every one legitimate
untaggedTopLevel   0
setOverflow        0
topLevelCount     15   = 7 wireframes + 8 annotation nodes
```

**P4 is closed.** Next is **P5 — page templates and layout rules `10:33`**, which is empty.

---

## 2026-08-22 (first session) — P4 defect sweep · **seven of eight wireframe defects closed**

Instance-copy and geometry fixes on `10:32`, all five of this session's edits verified by screenshot
rather than by read-back. **No token was created and no component was modified** — every fix landed on
an instance, so the component library is untouched and its variable counts stand at 215.

### Fixed

- **W9 — the Library pager reported a retired total.** Readout `I494:305;392:3` read `1–50 of 20,400`.
  Now `1–50 of 226`, and because 226 at 50 per page is **five pages**, the ellipsis `I494:305;392:44`
  and the `408` slot `I494:305;392:46` are **hidden**. The run closes up cleanly — verified by
  screenshot: `‹ 1 2 3 4 5 ›` with page 1 on the brand plate, no gap where the two slots were.
  Library holds at h 1576, contentBottom 1576, **overflow 0**.
- **W2 / W6 — the Stores card explained itself with itself.** `I496:526;152:10` read "Across 1
  connected store" beneath an Epic card on a screen about stores. Now **"Across 2 connected
  accounts"** — the split that actually produces 226 (A 51 + B 175). One line, no wrap.
- **W3 — Search rendered an empty search box.** `I499:787;320:3` showed the placeholder "Search your
  library" while the page below read *Results for "control"*. Swapped the nested input to
  `State=Filled` and set the value to `control`. The `Filled` variant shipped the string
  **"Half-Life 2"** — the inherited-content trap again, caught only because the re-derived subtree was
  read before being overwritten.
- **W4 — both Settings switches rendered a stray literal "Label"**, so a row read "Show unmatched
  records … Label". `Switch 106:123` has no `Show label` boolean, so both were hidden on the instance
  (`I499:995;106:108`, `I499:1011;106:108`). Verified: switch flush right, no gap left behind.

### Verified resolved — not fixed here

- **W1 🔴 is closed.** Analytics `I497:724;152:34` reads **"132 of 226 records enriched"** under a
  `58%` value (132/226 = 58.4%), beside a card reading `226`. Measured live, not remembered.
- **W7 is a false alarm.** `TODO.md` claims 8 raw spacing values on Settings `499:867`. A live sweep
  visited 16 auto-layout frames, skipped 11 instances, and returned **30 bound values, 0 unbound.**
  The 30 is what makes the zero trustworthy — a zero-defect result needs a non-zero positive count
  proving the walk reached real nodes.
- **W2 is fully closed, page-wide.** All seven Metric Cards carry bespoke footers; **zero** retain the
  boilerplate. And every figure now reconciles to the corpus: 34+98 = **132 enriched**,
  17+77 = **94 unenriched**, 51+175 = **226**, and "Needs manual review 2" = confidence Low 2.
  `Owned on both = 6` reads **"Counted twice, on purpose"**, which is the explanation W2 said was
  missing.
- **Zero residual retired figures on `10:32`.** A literal scan of all seven frames for `1,247`,
  `20,400` and `724 of` returns **no hits**.

### Found

- **The 20,400 sweep is a component-layer fix, not eight pages of copy edits.** Many hits are Count
  Badge instances *inside* component variants — `I286:6;55:54`, `I286:13;55:54`, `I286:30;55:54` in
  Section Header set `286:82`, and `I301:6;55:56` … `I301:25;55:56` in Nav Item set `301:44`. Top Bar,
  Modal and the wireframes inherit from these. Fix the components, re-scan, then fix residual
  overrides — the same cascade shape as B1 → W1.
- **The "seven vs eight doc pages" flag is retired: it is eight.** A literal-string scan of all 44
  pages hit **9**; excluding Wireframes `10:32` that is exactly the eight ids `CLAUDE.md` already
  lists. The id list was right and the word "seven" was the typo.
- **W8 overstates the gap.** There is no page-level annotation layer (`pageLevel` is empty, and the
  240 px `ROWGAP` is still unused), but annotation prose in designer voice already exists inside three
  frames — Stores `496:537`, Search `499:866`, and Settings `499:986` (W5's own note *is* annotation).
  Re-scope W8 to "make the existing annotation consistent and lift it to a layer", not "create one".
- **B11, new and a user decision.** `Detail#156:26` on Metric Card `154:23` is wired to only **3 of 12**
  variants, so `setProperties` is a silent no-op on nine — which is why correct footer strings never
  rendered through the property. **Wiring it would be actively harmful:** per the Section Header
  precedent a set-level TEXT property forces one shared default across every variant, collapsing all
  twelve detail lines to one string. Options are (a) delete the property and rely on per-variant copy
  plus editable instance text, or (b) keep it and document it as Trend-only.
- **An input to B10.** At 226 records with the 50-per-page floor the seven-slot run is **never
  exercised** — five pages. At 25 per page it would be exercised exactly: ten pages renders
  `1 2 3 4 5 … 10`, which is seven slots. Left at 50; the page-size floor is the user's call.

### API knowledge added

Two failures, both atomic, both now in `CLAUDE.md`:

- **Mutating an instance sub-node makes its JS handle stale.** `ellipsis.name` read one line after
  `ellipsis.visible = false` threw `The node with id "526:902" does not exist` — the subtree is
  re-derived and the internal node behind the path id is replaced. **Capture metadata as plain data
  before any mutation.**
- **Hiding an instance sub-node prunes it from the derived tree**, so its `I…;…` path id then returns
  `null` from `getNodeByIdAsync` outright — `cannot read property 'parent' of null`. **Verify by
  walking from stable real node ids, never by re-resolving a mutated path id.**

### Still open on P4

**W5** (unblocked — B2 is decided and B10 route 1 is approved), **W8** as re-scoped, **Light-mode
verification of all seven frames** (nothing on this page has ever been seen in Light), and the
six-check close-out audit. P4 is **not** closed.

**The session ended on an environmental block, not on a decision.** The **Figma MCP disconnected**
mid-session — confirmed down in the user's session too, so environmental — and **disk space stopped the
workspace from starting**, which kills the screenshot verification loop. Every remaining P4 item needs
one or both. Per the user, **neither blocker was worked around**: no blind mutations, and no defect
closed without looking at the render.

What was done instead, and what closes this session: **the documentation sweep.** `TODO.md` gained the
real **B11** item (an invented "B12" was retired in favour of the existing **B9**, which already asks
the Switch `Show label` question) and B10 now records route 1 as approved with what is owed on `395:85`
and `499:986`. `CLAUDE.md` § Wireframes was rewritten from an eight-defects-open handover to the current
state, its "wrong five times" list became **six** — the new entry is W7, whose "8 raw spacing values"
had no live source, exactly like 20,400 — and the **"seven vs eight doc pages"** flag was retired as
eight. `HANDOFF.md`, the zero-context entry point, was four sessions stale on P4 and now carries the
closures, the W8 re-scope, the route-1 approval and this block.

---

## 2026-08-09 — B2 and the Dashboard decided · **no Figma mutations**

A decision session. **Nothing in the Figma file was created or modified.** The output is three
resolved questions and one new backlog item.

### B2 ✅ — use **226** everywhere; `20,400` is retired entirely

`~20,400` originated as prose in `CLAUDE.md` under a heading called "Data reality", where it read as
measured. **It was never measured.** It then propagated into eight shipped doc pages, where it is
load-bearing — Pagination's seven-slot fixed run and its no-page-size-below-50 rule are both argued
from "20,400 at 50 is 408 pages".

The decision is **226 everywhere**, which is the measured corpus and what the Data & Provenance page
`10:10` has carried correctly all along. `20,400` is **retired outright** — not relabelled as
illustrative, not kept for scale-behaviour copy. Do not cite it anywhere.

Live measurement, confirmed: **226 records · 132 enriched (58.4%) · 94 unenriched · confidence
Medium 161 · High 63 · Low 2.**

### B1 ✅ unblocked — Metric Card's fabricated data

With the convention chosen, `154:23`'s targets are fixed: "Games owned" reads **226**, the breakdown
is **63 high · 161 medium · 2 low**, and enrichment reads **132 of 226**. The fourth **"none" bucket
is deleted, not zeroed** — there is no such state in the schema, and a zeroed bucket still teaches a
reader to design a legend, a filter and a chart segment for a state that can never occur.

### `10:35` "Dashboard" ✅ — dropped from P6

The shipped Sidebar's destinations are Library, Collections, Stores, Accounts, Analytics, Search,
Settings — **seven, and exactly the seven wireframes that exist.** `10:35` is an orphan name predating
the rail design. **P6 is seven screens.** Never add a Dashboard destination to the rail. Deleting the
page is optional cleanup.

### B10 🟠 created — Pagination's rationale is orphaned

This is the consequence of B2 that is **not** a copy edit. 226 removes the premise the seven-slot run
and the 50-minimum page size were *argued from*: 226 at 50 is five pages, so the ellipses never
render. The component is very likely still right — a run that never reflows under the pointer is
defensible at any size — but **the stated reason is not.** Re-derive it; do not recaption it.

**Route 1 approved** (2026-08-22): keep the verified component and rewrite the rationale as sized for
the library to grow into. Route 2 — shrinking the component to fit 226 — is more honest but reinvents
shipped, verified work, which the standing "refine, do not reinvent" constraint forbids.

### Propagation

The decision reached `TODO.md`, `CLAUDE.md` and `HANDOFF.md` the same night. **`CHANGELOG.md` was the
one gap** and is filled by this entry, written 2026-08-22. The stamp was also wrong: the session ran
at 01:13 on **2026-08-09** and had been recorded as 2026-08-08 in 16 places across the three files.
All corrected.

---

## 2026-08-06 — Wireframes audited and partly repaired · **P4 in progress, handed over mid-phase**

A short session that ended by request so the work could resume in a fresh context. **One structural
fix landed; eight defects were found and left open.** P4 is not closed.

### The finding that mattered most

**Page `10:32` was documented as empty and held seven finished wireframes.**

`CLAUDE.md`'s page map, `HANDOFF.md` §6, and `TODO.md` A3 all said "empty". The read-only pre-flight
audit is the only reason a session did not start building over completed work. This is the **second**
time an "empty" marker has been wrong — Metric Card `10:19` was the first, on 2026-08-05 — and it is
the fifth documented instance of `CLAUDE.md` shipping a wrong claim.

The rule added as a result: **an "empty" page marker is the one to distrust.** Every other
documentation error misinforms; this one destroys.

Found already built: Library `494:2`, Collections `496:329`, Stores `496:432`, Accounts `497:491`,
Analytics `497:630`, Search `499:731`, Settings `499:867`.

### Fixed — Library overflow

`494:2` held **1544 px of content inside a 1080 px frame**. `Grid` `494:168` ran y=192→1488 and
`Pagination` `494:305` sat at y=1512, so two of three card rows and **the entire pager rendered
nowhere** — a shipped component that the screen uses, invisible.

**Root cause was `layoutGrow = 1` on `Page` `494:119`.** It pins a child to FILL and **silently
rejects** `primaryAxisSizingMode = 'AUTO'` and `layoutSizingVertical = 'HUG'` — no throw, no warning,
the height simply does not move. Two calls were spent setting sizing modes that could never apply
before a read-back showed the write being rejected. Now recorded in `CLAUDE.md` § Hard-won API
knowledge, with the diagnostic: **a sizing write that reports back the old value is a constraint
problem, not a syntax one.**

Fixed by clearing the grow, then letting `Page` → `Content column` `494:84` → root hug, with `Rail`
`494:3` set to FILL. Library is now **1576 tall, overflow 0, pagination visible.**

### Fixed — page relayout

The taller Library would have overlapped Accounts at y=1240 by 336 px. All seven frames were relaid
onto a deliberate 3-column grid — `x` = 0 / 1680 / 3360, rows at y = 0 / 1816 / 3136, `ROWGAP` 240 to
leave room for the caption layer that does not yet exist. **Zero pairwise overlaps, verified.**

**Neither fix was re-screenshotted before handover.** Both are structural read-backs only, and a
structural read-back is not verification — re-verify both first thing.

### Found and left open — eight defects

Full detail with node ids in `TODO.md` A3. The serious one:

- **W1 🔴 Analytics ships the fabricated `1,247`.** Card `497:724` renders **58%** — correct — above
  a footer reading **"724 of 1,247 games enriched"**, while the card immediately to its left reads
  **226**. One screen contradicting itself by a factor of five. This is `TODO.md` B1's fabricated
  figure leaking into new work. **It is not blocked on B2**: B2 chooses a convention across seven
  *doc* pages, whereas this is a screen disagreeing with itself where 226 is already established on
  the same screen. Correct figures are 132 of 226.

The rest: six Metric Cards sharing one inherited footer (W2), Search's Top Bar rendering a
placeholder while the page shows results for "control" (W3), both Settings switches rendering a
literal "Label" (W4), a page-size claim false at 226 records (W5, **blocked on B2**), an unpinned
Stores observation (W6), 8 raw spacing values on Settings (W7), and no annotation layer anywhere on
the page (W8).

**W2, W3 and W4 are one shape** — an instance carrying its origin's content, written for somewhere
else. That has now bitten five times across the build.

### Two findings that are not defects

- **There is no Dashboard, and that is correct.** The shipped Sidebar's destinations are Library,
  Collections, Stores, Accounts, Analytics, Search, then Settings — **seven, and exactly the seven
  wireframes that exist.** The set is not missing a screen; **page `10:35` "Dashboard" is an orphan
  name predating the rail design.** Recorded as a user decision rather than resolved, because adding
  a Dashboard destination would reinvent settled architecture.
- **`TODO.md` B6 looks closeable.** Settings `499:963` reads `State=Filled` and the Selects render
  `Dark` / `Grid` / `50 per page`, so Select's value-shown state appears to exist and be in use —
  contradicting B6's claim that it is absent. Left open pending a check against set `109:114`,
  because the observation came from instances rather than from the set.

### Audit results

Page-wide, all six checks: **zero mode pins**, **zero raw fills**, **zero illegitimate nested
non-rest states** — every one found is legitimate (the rail's Selected item is the destination you
are on, `Unselected` is a Filter Chip at rest, Pagination correctly ships `Previous=Disabled` +
`Page 1=Current`, and Settings' `Filled`/`On` controls are a settings screen showing current values).
Raw spacing failed on Settings alone.

All seven wireframes were screenshotted and inspected in **Dark**. **Nothing was verified in Light.**

### Not done

- Eight defects, unfixed.
- No Light verification anywhere on `10:32`.
- No annotation layer.
- **`TODO.md` B1 and B2 untouched** — B2 is the user's decision and B1 depends on it.
- **No token created**, so counts stand at 215 and no Cover rewrite is implied.
- **Stayed solo** — no Workflow, no subagents, despite a standing ultracode notice, because Figma
  mutations must be strictly sequential and a fan-out would violate the constraint it serves.

### New API knowledge

**`layoutGrow = 1` silently defeats HUG.** Clear it to `0` before setting
`primaryAxisSizingMode = 'AUTO'` or `layoutSizingVertical = 'HUG'`, and read back
`layoutGrow` / `layoutAlign` / `layoutSizingVertical` together when a sizing write appears to no-op.

Also probed live and worth keeping: Metric Card exposes `Detail#156:26`, `Value#156:13`,
`Label#156:0` and `Show detail#156:39`. Text Input `107:140` has
`State ∈ {Rest, Hover, Focus, Filled, Error, Disabled, Read-only}`. Switch `106:123` has **no**
`Show label` boolean — only `State` (Off/On) and `Interaction`.

---


Built, documented and verified **Charts** on page `10:30`, which closes Phase 3.5. **No new token
was created** — the whole point of the phase was to consume the seven `viz/*` tokens that had sat
in the Color collection unconsumed since P1. Variable counts are therefore unchanged at **215**,
and no Cover rewrite is implied.

### Built

| Thing | Id | Notes |
|---|---|---|
| Bar Chart set | `474:104` | 4 variants, 1152×476, PAD 32 / GAP 48, overflow 0/0 |
| — Size=Full, Bars=4 | `474:2` | 720×204 |
| — Size=Compact, Bars=4 | `474:31` | 320×204 |
| — Size=Full, Bars=3 | `474:60` | 720×160 |
| — Size=Compact, Bars=3 | `474:82` | 320×160 |
| Distribution Bar set | `475:38` | 2 variants, 1152×192, PAD 32 / GAP 48, overflow 0/0 |
| — Size=Full | `475:2` | 720×80, inline legend |
| — Size=Compact | `475:20` | 320×128, stacked legend |
| Documentation | `478:2` | 1560×3026, six sections |
| — Palette | `478:6` | all seven `viz/*` tokens, ratios and deltaE computed live |
| — Bar chart | `480:2` | three specimens, captions measured off the instances |
| — Distribution | `480:99` | two specimens + the neighbour-separation note |
| — In use | `481:113` | Analytics band: Section Header + two `bg/layer` chart cards |
| — Rules | `481:185` | Always 8 / Never 9 |

### Tokens — none added

`viz/rank-1` … `viz/rank-6` and `viz/track` already existed (`VariableID:5:41`–`5:47`), scoped
`FRAME_FILL`/`SHAPE_FILL` with full three-platform code syntax, and **had never been consumed by
any component** — their only 52 consumers were the Color documentation page's paired swatches.
Charts is the first real consumer.

### Measured before designing — this set the scope

Measuring the palette first is what kept the phase honest, and **contrast ratio alone would have
hidden the problem**. CIE76 deltaE is the right metric for categorical separation; two colours of
equal luminance return 1.00 contrast while being plainly distinct.

- **The ramp is sequential, not categorical.** Adjacent deltaE: 1v2 9.2 Dark / 8.5 Light, 2v3
  **7.4 / 8.6**, 3v4 **38.2 / 39.7**, 4v5 21.1 / 21.1, 5v6 10.6 / 14.9. Ranks 1–3 read as one blue.
  The single real step is rank-3 → rank-4 — blue to grey, an emphasis boundary, not an identity one.
- **Only ranks 1–4 clear 3:1 on `bg/layer` in both modes.** rank-5 is 3.63 Dark but **2.24 Light**;
  rank-6 is **2.46 / 1.45**. Four data marks is the working ceiling.
- **`viz/track` = `bg/canvas` = `#f0f0f0` at exactly 1.00:1 in Light** — recurring shape #3 again.
  This is why each chart owns a `bg/layer` surface and is never drawn onto the page.

### Decided — two components, not a chart library

No pie, no donut, no line, no multi-series anything. A multi-series chart needs colour to identify
a series, and at deltaE 7.4 this palette cannot. Values and legend are **structural, not
properties**, so "never ship it without its numbers" is impossible to violate rather than a rule
someone must remember.

### Fixed — five defects in this session's own work, four caught by looking

- **`Segments=4` on Distribution Bar was identical to `Segments=3`.** I built the 4-segment data as
  confidence plus a duplicated `Low`, then sliced to 3 — so the axis was meaningless *and* the array
  I fed it was a fabricated fourth confidence level, the exact defect `TODO.md` B1 flags in Metric
  Card. **Dropped the axis**: the set now has one `Size` axis. The corpus has exactly one good 4-way
  split (`steamStatus`) and Bar Chart already spends it; inventing a variant for axis symmetry is
  how B1 happened.
- **Percent-scale `layoutGrow` overstated the smallest segment by 2×.** `Math.round` took Low's
  0.88% to 1%, then a 2 px floor drew it at **13.5 px**. Rebuilt on **per-mille weights with no
  floor**: Low lands at 6.1 px on a 680 track and 2.5 px on a 280 track unaided. Bar Chart largest
  error is now **0.31 px at 720 / 0.13 px at 320**.
- **The Full legend grouped each value with the wrong label.** Items were `layoutGrow = 1` with
  right-aligned values, so `63` sat nearer `Medium` than `High`. Items now hug: 8 px inside an item,
  20 px between.
- **The `In use` Section Header shipped the `Library` copy it was authored with** — same
  inherited-content trap as Modal's placeholder. Retargeted to Analytics, and `Show count` turned
  **off**: a chart band renders no record list, so there is no rendered number for a count to match.
- **The two `In use` cards top-aligned at 134 and 258** with a ragged bottom edge. Both now FILL to
  258.

### Fixed — a defect Light mode caught in my own copy

**The Distribution Bar's segment note cited the wrong quantity.** I published
`confidence/*` against `bg/layer` (7.70 / 10.22 / 8.21 Dark, 8.01 / 11.44 / 10.75 Light) as
evidence the segments were legible. In a stacked bar the segments **tile the whole track — nothing
is behind them**, so the governing measurement is segment against *neighbour*:

| pair | Dark deltaE | Light deltaE | Dark ratio | Light ratio |
|---|---|---|---|---|
| high \| medium | 58.1 | 45.3 | 1.33 | 1.43 |
| medium \| low | 52.1 | 36.1 | 1.25 | **1.06** |

Well separated **by hue**, and at `medium|low` **1.06:1 in Light** essentially not separated by
luminance at all — so that boundary dies in a greyscale export or for a reader with a colour vision
deficiency. Fixed structurally rather than at the token layer: a **2 px `bg/layer` rule** between
segments, achromatic and therefore mode- and export-independent. Proportions held exactly through
the change (27.9 / 71.2 / 0.9 against a true 27.88 / 71.24 / 0.88). Two rules added to the columns.

This is recurring shape #5 — copy that over-promises what the measurement supports — and the
Confidence Badge pip note is its precedent.

### Fixed — recurring shape #4, in work I had just written

I computed the Palette and section notes live but **hardcoded the measured figures into the Rules
columns and the specimen captions**. Every figure on the page is now derived in the script that
writes it: ratios and deltaE from the tokens, bar and segment widths read off the live instances.

### Verified

Dark and Light on the set frames and every doc section, downloaded and looked at. Close-out audit
returned clean on all six checks: **zero mode pins remaining** on the page, zero raw fills, zero
raw spacing, **zero nested non-rest states**, every top-level node tagged, neither set frame
overflowing.

### New API knowledge

**`layoutGrow` must be an integer** — `Expected integer, received float`. Any proportional ratio
must be rounded before assignment, which is what forced the per-mille scale rather than percent.

---

## 2026-08-05 (second session) — Loading & Skeleton · **P3.4 closed**

Built, documented and verified **Loading & Skeleton** on page `10:29`, which closes Phase 3.4.
Three new tokens, one shipped defect fixed, two Cover texts corrected.

### Built

| Thing | Id | Notes |
|---|---|---|
| Loading Skeleton set | `451:2` | 4 variants, 1024×652, PAD 32 / GAP 48, overflow 0/0 |
| — Type=Grid card | `449:2` | 240×416, cover 320 |
| — Type=Metric card | `450:10` | 356×148, top block 64 |
| — Type=Row | `450:2` | 960×56, text block 36 |
| — Type=Text line | `450:20` | 320×20 |
| Documentation | `454:2` | 1560×2986, six sections |
| — Variants | `455:2` | four specimens with measured captions |
| — Anatomy | `456:30` | three columns, per-block geometry |
| — Motion | `456:79` | `duration/pulse`, `easing/standard`, opacity range |
| — In use | `457:30` | Library first paint: rail + bar + header render, only the region waiting is skeletonised |
| — Rules | `458:233` | Always / Never |

### Tokens added — three

- **`alpha/black-12`** (Primitives 54 → **55**). `alpha/white-12` already existed, so only the
  black side was needed.
- **`bg/skeleton`** (Color 58 → **59**), Dark `alpha/white-12` / Light `alpha/black-12`, scopes
  `FRAME_FILL`/`SHAPE_FILL`. Measured 1.40 canvas / 1.45 layer / 1.46 subtle / 1.46 layer-hover in
  Dark and 1.31 / 1.32 / 1.31 / 1.31 in Light. **Sixth consumer of the alpha rule.** 12% rather
  than the 8% used for plates, because a skeleton block *is* the content and has nothing in front
  of it.
- **`duration/pulse`** (Motion 10 → **11**), **1200 ms, derived as 3 × `duration/slower` read
  live**, `scopes = []`. The Motion ramp topped out at 400 ms, which is a *transition* ceiling; a
  loop period is a different quantity. Derivation recorded in the variable description so it
  survives a change to the base.

Cover **`35:17`** rewritten to "Color — 55 primitives, 59 semantic" and **`35:21`** to
"Motion — 7 durations, 4 curves", both from live counts. `35:21` had been missed by the 2026-08-04
pass — **two Cover nodes carry variable counts, not one.**

### Fixed — a shipped defect in another component

**🔴 Sidebar `302:96` baked `Stores` as `State=Hover` on both variants** (`302:23` Expanded,
`302:74` Collapsed), so every Sidebar instance in the file rendered a phantom hover. Set both to
`State=Rest` after confirming against the Sidebar doc `304:2` that no instance depended on it.
**Second occurrence of recurring shape #15** — Context Menu's Compact variant had the same defect.
Logged as `TODO.md` B8 with the remaining sets to audit.

### Fixed — three defects in this session's own work, all caught by looking

- **The `In use` rail rendered a `20,400` count badge on Library**, violating the shipped Section
  Header rule and putting B2's disputed number into new work. Hidden.
- **The `In use` copy claimed a Sort control the header did not render** — `Actions` defaulted to
  `None`. Fixed using the property key read live off `componentProperties` (`Show count#287:14`).
- **Five Grid cards overflowed the content column** — 5 × 240 + 4 × 24 = 1296 in a 1152 grid, and
  the stage clipped the card row. Now four cards, stage 700 → 780.

None of the four was visible to a structural read-back.

### Corrected

- **`HANDOFF.md` §9 says Game Card / Grid is 240 × 320. The live set `221:141` is 240 × 416** —
  320 is `layout/card-cover-height`, not the card. Caught by measuring the counterpart rather than
  quoting the doc, which is exactly what the skeleton's geometry depended on.
- **`brand/subtle` `VariableID:5:16` already exists**, answering `TODO.md` B7 without creating
  anything. **`bg/subtle-hover` `VariableID:5:7`** also exists. Neither was in `CLAUDE.md`'s ladder.
- **The Motion collection's code syntax is not Color's.** For Motion, ANDROID and iOS are
  **identical** (`tSlower`, `easeStandard`, `tPulse`); only WEB differs. Derived from the
  collection's own majority before adding `duration/pulse`.

### Verified

Screenshotted and looked at the set and the full doc page in **both modes**. Light pin cleared;
**zero variable-mode pins on page `10:29`** of any kind. Set frame overflow 0/0.

### Left alone deliberately

`TODO.md` **B1** (Metric Card fabricated data) and **B2** (three library sizes) — B2 is a user
decision and B1 depends on it. No doc page copy was touched.

Stayed solo: no Workflow, no subagents. Figma mutations must be strictly sequential.

---

## 2026-08-05 — Handoff reconstruction · no Figma mutations

**Every `use_figma` call this session was read-only.** No component, variable, style or page was
created or modified. The session's entire output is documentation.

### Audited

Full read-only sweep of the live file, replacing figures that had been carried forward in prose:

```
pages          44
variables     212     Primitives 54 · Color 58 · Spacing 13 · Dimension 26
                      Type Primitives 22 · Type 29 · Motion 10
text styles    10
effect styles   5     elevation/2 /4 /8 /16 /28
paint styles    0
components    422     = 378 variants across 30 sets + 43 icons + 1 standalone (Field)
```

Also measured the live dataset from `data/account{A,B}.json` — 226 records, re-verified field by
field with the correct nested paths after a first pass using wrong ones returned 0.0% across the
board.

### Found

- **🔴 Metric Card `154:23` ships fabricated data.** Variants read `1,247` games and a confidence
  breakdown `584 high · 118 medium · 22 low · 523 none`. The corpus is 226 records with
  confidence on 100% of rows (Medium 161 / High 63 / Low 2) — **the "none" bucket does not exist
  in the schema.** Contradicts the Data & Provenance page `10:10` in the same file. Logged as
  `TODO.md` B1.
- **🟠 Three different library sizes are shipped** — 226 (Data & Provenance), 1,247 (Metric Card),
  20,400 (seven doc pages from Divider & Progress onward). `20,400` originated in `CLAUDE.md`
  prose and was never measured. Choosing a convention is a user decision; logged as `TODO.md` B2
  with three options and a recommendation.
- **`Icon / person` `129:16` exists.** `CLAUDE.md` stated *"There is no person/user/avatar icon"*
  — false. It is real, 16 × 16, one VECTOR glyph, cell `Cell / person 131:18`, glyph `137:17`,
  and has **zero instances**. The icon count is **43**, not 42. This also undercuts the Sidebar's
  recorded rationale that Accounts uses `Icon / link` because "the file has no person glyph" —
  the *conclusion* still stands (an account here is a store connection, not a profile), but the
  stated reason was wrong.
- **Metric Card ids resolved** — set `154:23` (12 variants, 1592 × 572), doc `169:23`
  (1560 × 1964). `CLAUDE.md` had flagged the page "verify ids before trusting" and carried **no
  Metric Card row in the components table at all**.
- Exact ids recovered for components `CLAUDE.md` listed only as "on page X": Store Badge `54:22`
  (2 variants), Count Badge `55:61` (4), Text Input `107:140` (42), Field `107:141`.
- `data/analytics/` does not exist despite `build_app_data.py`'s docstring claiming it is emitted.
- Receipt `.eml` sources live in a Windows temp directory and would not survive a temp sweep.

### Measured — the corpus, N = 226

Full detail in `DATA_PIPELINE.md`. The figures that constrain design:

```
accounts             A 51 · B 175              (NO MERGING — never one list)
marketplace          Epic Games Store 226      100%
confidence           Medium 161 · High 63 · Low 2   — present on 100%, no "none" bucket
enrichment           132 enriched (58.4%) · 94 unenriched (41.6%)
playtime             nonzero on 4 of 226       — 98.2% zero or null
purchasePrice        32 (14.2%)
pricing.current      226 present, 84 nonzero   — INR 222 / USD 4, sums kept separate
tags/themes/franchise/steamDeck                0%
duplicate titles across accounts               6
```

Two figures in the `game-id-data-reality` memory were stale and are corrected:
`ownership.purchasePrice` is **32 (14.2%)**, not 12 (5%); `pricing.current` is present on
**226 (100%)** with 84 nonzero, not 84 (37%).

### Wrote

| File | State |
|---|---|
| `HANDOFF.md` | **new** — zero-context entry point, 12 sections, sets the authority order |
| `DATA_PIPELINE.md` | **new** — the six-stage `tools/` chain, the `data/` tree, the two hard rules, the confidence definition, and every measured figure |
| `TODO.md` | **new** — ranked backlog, seven open defects with node ids, plus a closed-do-not-reopen table |
| `CHANGELOG.md` | **new** — this file |
| `WORKFLOW_CONTEXT.md` | **rewritten** — was 4 days stale and actively dangerous |
| `CLAUDE.md` | corrections applied (see below) |
| memory files | reconciled (see below) |

**`WORKFLOW_CONTEXT.md` was the urgent one.** It still said *Phase 3.1*, *204 variables*
(Primitives 51 / Color 53), Avatar `127:26` with 12 variants, and listed pages `10:20`–`10:29`
as **"Not Started"** when eight of them are finished, documented and verified. A fresh chat
reading it would have rebuilt finished work. Its unique material was preserved verbatim in the
rewrite — the two-ring focus convention, the specimen-holder pattern, the five effect-style
definitions, the `viz/rank-1..6` warning, the explicit non-goals, the layout derivations, and
both quirk tables.

`CLAUDE.md` corrections: the false "no person icon" claim, the Metric Card ids plus a
components-table row, the four missing exact ids, store-icon naming, and `~20,400` relabelled as
illustrative rather than measured.

### Decided

- **Stayed solo — no Workflow, no subagents.** An ultracode notice instructed otherwise, but
  `CLAUDE.md` records that Figma mutations must be strictly sequential and that Workflow /
  deep-research are not to be used unless asked. A fan-out would have violated the constraint it
  was meant to serve. For the documentation work specifically, fanning out would also have risked
  fabrication — the measurements had to come from one context that held the actual readings.
- **Did not unilaterally resolve the 20,400 / 1,247 / 226 inconsistency.** Choosing a convention
  changes copy on seven shipped, verified doc pages. Documented as a decision to make, with a
  recommendation, rather than made.

---

## 2026-08-04 — Context Menu, Modal, Pagination, Empty State

Four components closed out. **P3.4 is now one component from complete.**

### Context Menu `10:25`

Menu Item `353:18` (12 variants), Context Menu `354:1629` (Compact 240 × 115 / Full 240 × 224),
doc `357:47`.

First component to sit on `bg/overlay`, which changed the contrast problem — every token had to
be measured against the overlay, not the canvas. **Two new tokens:**

- **`bg/overlay-hover`** — Dark `alpha/white-08`, Light `alpha/black-06`. Necessary because
  `bg/layer-hover` is *darker* than `bg/overlay` in Dark (`#292929` on `#333333`); reusing it
  would have made the hovered item go backwards. **Fourth token to hit the alpha rule.**
- **`status/danger-fg-strong`** — Dark `red/140` `#efa3a6`, Light `red/60` `#a4262c`. Measuring
  the whole red ramp showed **no single rung clears both modes**, which is why it is
  mode-dependent. Same shape as the `confidence/*` fix.

Defect the render caught: **the Compact variant shipped with its second item baked as
`State=Hover`**, so every Compact instance in the file would have shown a phantom hover plate.
Invisible to a geometry read-back. Recorded as recurring shape #15 — *a container variant must
ship every child at rest.*

### Modal `10:26`

Set `370:112` (Confirm 400 / Destructive 400 / Form 560 / Choose 720), doc `373:37`. Built
entirely from shipped components. **No new component and no new token** — `bg/scrim` already
existed and had never been consumed.

Width is part of the type, not a grid decision. `elevation/16`, the highest step in the file.
Footer order fixed forever: Cancel left, action right. The action names itself — never OK.

Defect: the Form variant's Text Input shipped carrying **the Top Bar's placeholder,
"Search your library"** — a "new collection" dialog asking the reader to search. *Retarget every
string on a reused instance, not just the ones the variant adds.*

### Pagination `10:27`

Page Button `391:39` (5 variants), Pagination `392:186` (Full 960 / Compact 320 × Start / Middle
/ End), doc `395:85`. No new token.

**The slot run is fixed at seven slots, 248 px, in every position.** A run that grows and shrinks
moves the arrows under a pointer that is already there.

Three defects the render caught:

- **Every gap and padding written that session was unbound** — the Spacing collection uses **bare
  names**, so `V['spacing/L']` was `undefined` and `setBoundVariable` failed **silently**. Swept
  by value, not name: `{rawCount: 0, boundCount: 62}`.
- **All 12 arrow glyphs reverted to `fg/primary`** after the `INSTANCE_SWAP` was applied —
  applying an instance-swap property **resets every nested override in that slot, including
  variable bindings.** A Disabled arrow rendered identically to a Rest one. The *component* was
  correct; the defect lived only in the *instances*.
- **The Hover specimen was invisible at 1.00:1** — specimens sat on `bg/subtle`, which equals
  `bg/layer-hover` in Dark. Fixed by changing the **host**, not the token.

### Empty State `10:28`

Set `417:128` (8 variants, 976 × 948), doc `419:34`. Built from shipped components. No new
component, no new token — `bg/chip` already does the icon plate, its **fifth** consumer.

Four types because there are four *reasons* a region comes back empty, each with a different way
out. Page 560 / Panel 320 is scope, not scale — **never a Primary action in a Panel.**

Two defects:

- **The `In use` header rendered 20,400 under a filter matching nothing** — a violation of the
  file's own Section Header rule. The suppression had used `Show count#287:15`; the real key is
  **`#287:14`**, and a wrong component-property key is a **silent no-op**.
- **The set frame overflowed itself by 20 px** after a 400 px measure cap grew the Page variants
  174 → 194. A component set frame does **not** re-fit when a variant's height changes.

### Also

- **Cover `35:17` rewritten** from a live count to "Color — 54 primitives, 58 semantic". This
  node has now gone stale three times: **any variable-collection change implies a Cover rewrite
  in the same session.**
- Color `codeSyntax` re-verified **58/58**.

---

## 2026-08-03 — Top Bar, and the mode-pin sweep

### Top Bar `10:24`

Set `321:35` (Synced / Syncing / Failed, 1280 × 48), doc `333:1645`. Built entirely from shipped
components — **no new component was needed.** A planned "Sync Status" chip was deleted once it
was clear Badge already does it with a tone swap.

The bar is **1280, not 1560** — it spans the content column only. Sync is a status readout, not a
progress bar. The action stays in place across all three states.

### The mode-pin sweep — the session's real finding

**`createInstance()` copies the source component's `explicitVariableModes`.** The Button set, 74
of its variants and the Badge set were pinned to **Dark**, so every instance ever created from
them was frozen Dark regardless of the page it sat on. In Light that renders `fg/secondary`
`#d6d6d6` on `#f0f0f0` — **1.28:1**.

Found by accident: the Top Bar's *Rest* buttons rendered paler than its *Disabled* one, which is
backwards.

**This retracted a recurring shape.** Three times across earlier sessions the Section Header Sort
button had looked washed out in Light, been "verified" at 8.82:1, and the discrepancy blamed on
downscaling. 8.82 is what you get resolving the **token** in Light. The **node** was rendering at
1.28. Recurring shape #13 was rewritten from "downscaling makes small dark text look broken" to
**"resolve the node, not the token."**

Swept **89 pins** off components, variants and instances across `10:13`, `10:14`, `10:22`,
`10:23`, `10:24`. **110 remain and must stay** — they are documentation FRAMEs, and the Color and
Elevation pages need theirs to show both modes side by side.

**The rule: a pin belongs on a doc frame, never on a component, a variant, or an instance.**

### Also

- **Color `codeSyntax` normalized.** Auditing all 57 Color variables found **10** deviations, not
  the three previously recorded. The three platforms treat `/` differently and it keeps biting —
  ANDROID capitalizes across `/`, iOS does **not**. Both look like typos; neither is. A "correct"
  generator written from intuition produced a wall of false positives, twice. **The file is the
  spec.**

---

## 2026-08-02 — Avatar, Section Header, Game Card / Row, Sidebar, and two systemic token fixes

The heaviest session of the build. Four components plus the two collisions that had been silently
breaking rendering across the whole file.

### The chip plate collision — systemic

Opened by a screenshot: the Low-confidence **Hover** card rendered `Low` bare while Rest and Focus
showed a plated `••• Low`. A structural audit proved the three variants byte-identical, so it was
a fill collision.

**Root cause:** `bg/subtle` and `bg/layer-hover` are both `#292929` in Dark. 38 components use
`bg/subtle` as a root plate. And **every badge specimen on the Badges page sits on a `bg/subtle`
host while the chip was itself `bg/subtle` — 1.00:1. The plates had never rendered at all, in
either mode, on the shipped documentation.**

**Fix: new `bg/chip`, alpha-based** — Dark `alpha/white-08`, Light `alpha/black-06` (created).
It composites off whatever it lands on and holds 1.23–1.28 Dark / 1.14 Light across canvas,
layer, subtle, layer-hover and layer-selected. **25 variants bound.** 13 of the 38 at-risk were
deliberately left on `bg/subtle` — they are control states on a *known* surface, not plates on an
unknown one.

### The Light surface collision — systemic

The documented three-way `#f0f0f0` pile-up was real and **worse than recorded** — `stroke/subtle`
and `stroke/divider` were *also* `#f0f0f0` in Light, making it a five-way. Card hairlines had
never rendered on the page surface in Light at all.

**Root cause: the Light neutral ramp has six usable rungs for twelve surface-and-stroke roles.**
Shuffling opaque values only moves the collision — confirmed the hard way by trying it twice.
Dark had already solved it: its strokes are alpha. Light had flattened both to opaque grey.

Fix, mirroring Dark: `stroke/divider` Light → `alpha/black-06`, `stroke/subtle` Light → new
`alpha/black-08`, `bg/layer-selected` Light → `grey/84` `#d6d6d6`. `bg/disabled` deliberately
**left** at canvas — flat-on-the-page is the correct semantic.

Two mistakes recorded so they are not repeated: moving `bg/overlay` off `grey/20` created a *new*
collision (**reverted** — overlay ties are non-defects), and a `grey/92` rung created first
measured **1.05 against canvas** and was deleted. **Measure a new rung against its host before
creating it.**

### The confidence contrast fix

An earlier note claimed 4.06:1 "clears AA for the 12 px Semi Bold level word (the 3:1 large-text
threshold with margin)". **Wrong.** WCAG's large-text exemption begins at 18.66 px bold / 24 px
regular; a 12 px Semi Bold word needs the full **4.5:1**. Under the correct reading **five pairs
were failing, not zero.**

Fixed at the token layer: `confidence/low` Dark → new **`red/140` `#efa3a6`**, `confidence/low`
Light → `red/40`, `confidence/medium` Light → `marigold/20`. The rungs are deliberately **uneven
across the three levels** — do not tidy them onto one number. **Never cite a large-text exemption
for the level word.**

### Avatar `10:18`

Doc `207:24`, six sections. Two defects fixed at the token layer: all 10 `Content=Image` variants
carried a **raw, unbound, mode-blind `#596b80`** (new token `bg/media`), and store mark sizes were
12/15/20/25/30 with three raw (retargeted onto the `icon/*` scale).

**Established the fixed-geometry precedent** — a *user decision*: the no-raw-numbers rule governs
colour, spacing and radius, not intrinsic component geometry.

### Section Header `10:22`

Set `286:82`, doc `292:2`. **A set-level TEXT property forces one shared default across every
variant** — adding `Title` and `Description` silently collapsed all six variants to the same copy.
Deleted; per-variant copy is the right model.

**Read `boundVariables` array-aware on TEXT nodes** — `boundVariables.fontSize` comes back as
`[{type:'VARIABLE_ALIAS', id}]`. A naive check reports every correctly-bound node as `RAW`.

### Game Card / Row `10:21`

Set `272:144`, doc `274:2`. First consumer of `bg/layer-selected`. **Row has Selected; Grid
deliberately does not.** Selection is two cues — the fill reaches only 1.28:1, so a 2 px
**`brand/selected`** bar carries it. `brand/rest` was tried first and measured **1.90:1 in Dark**.

**Focus ring drawn `OUTSIDE`** — with `INSIDE` on a 960 px row the ring landed on the row edge and
was indistinguishable from the divider. *Verify a focus ring in a stack, never against a single
specimen.*

### Sidebar & Nav Item `10:23`

Nav Item `301:44`, Sidebar `302:96`, doc `304:2`. **New token `bg/nav-hover`** — an opaque hover
fill measured **1.00:1** against `bg/nav` in Light. **Third token to hit the alpha wall**, which
promoted it from three anecdotes to a general rule: *any fill that has to stay visible on a
surface it does not control should be alpha, not an opaque rung.*

The Collapsed rail keeps state and the accent bar, dropping only labels and counts. Stores uses
`Icon / store-generic`, not the Epic mark — branding the section for the one connected store would
make adding a second store a redesign.

---

## 2026-08-01 — Phase 3.1 primitives

Icon (page `10:12`), Badges `10:13`, Buttons `10:14`, Form Controls `10:15`, Filter Chip `10:16`,
Divider & Progress `10:17` built and documented. `WORKFLOW_CONTEXT.md` written at the end of this
session — and not updated again until 2026-08-05, which is why it went four days stale.

Established this session and still in force:

- **The two-ring focus convention** — inner rect at −1 / body + 2 / 1 px → `stroke/focus-inner`;
  outer at −3 / body + 6 / 2 px → `stroke/focus-outer`. Both `strokeAlign='INSIDE'`,
  `layoutPositioning='ABSOLUTE'` set **before** `resize()`. Radii deliberately unbound. The set
  must have `clipsContent = false`.
- **The specimen-strip holder pattern** — `counterAxisAlignItems='MIN'` plus a fixed-height
  `Holder` frame per instance, so captions share one baseline across cells of differing height.
- A `radius/xxlarge` (10 px) token was created to hold a ring radius and had to be **deleted**.

Defect fixed: **Progress Bar's fill was a fixed 144 px inside a 240 px track**, so a 60% bar
stretched to 480 px silently displayed 30%. Now a `layoutGrow` ratio. *Check anything that claims
a proportion.*

---

## 2026-07-31 — Foundations

RUN_ID `gameid-ds-2026-07-31`. File `00QEeirxnqT4Zg829aeDVZ`.

- Seven variable collections, ten text styles, five effect styles (`elevation/2` … `/28`, each a
  two-layer drop shadow — ambient α .30 + key α .50, both layers variable-bound).
- 44-page file skeleton; all foundations doc pages (Color, Typography, Spacing & Layout,
  Elevation & Radius, Motion, Iconography, Data & Provenance).
- 43 icon components drawn as vectors in-file — **no Fluent or third-party icon library.**
- Every created scene node tagged via `setSharedPluginData('dsb', …)`. `getPluginData` /
  `setPluginData` are **not supported**.
- The data pipeline had already been run: `data/account{A,B}.json` generated
  `2026-07-31T14:00:27+00:00`, 226 records.
- `viz/rank-1..6` and `viz/track` created — **still unconsumed.** Charts `10:30` must use them
  rather than inventing a palette.

Governing constraints set at the start and never relitigated: the implementation gate, Figma as
source of truth, never invent a token, refine don't reinvent, the data decides the hierarchy,
Fluent 2, Dark primary with Light fully supported, Inter only, icons drawn in-file.
