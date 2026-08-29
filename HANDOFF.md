# Game ID — HANDOFF

**Read this file first. It is written for a session with zero prior context.**

- **Last updated:** 2026-08-23
- **Project root:** `D:\work\Game ID` (Windows, Git Bash, **not** a git repository)
- **Current phase:** **P4 Wireframes — ✅ CLOSED 2026-08-22.** All of Phase 3 and Phase 4 are done.
  Seven wireframes on `10:32`, an eight-node annotation layer, **every wireframe defect closed**, all
  seven screens plus the annotation layer **verified in Dark and Light**, and the six-check close-out
  audit clean. **No token was created in P4** — 215 variables stands, no Cover rewrite implied.
- **Next action:** **P5 — page templates and layout rules, page `10:33`.** Step 1's read-only
  pre-flight is **done, live, 2026-08-23** — the page is genuinely empty — and Step 2's derivation from
  the live wireframes is complete, so the next action is **Step 3, the build**. See
  [§9 Exact next steps](#9-exact-next-steps).
- **✅ The Figma blocker CLEARED 2026-08-23, later the same day — P5 is executable and under way.**
  Verified by **execution, not configuration**: three read-only `use_figma` scripts ran against
  `00QEeirxnqT4Zg829aeDVZ` and returned data (`pageCount: 44` with the full page list, a depth-4
  structural walk of all seven wireframes on `10:32`, and a focused geometry read of Library's card
  rows). The diagnosis in **§5** — session binding, not connectivity, fixed by starting a fresh
  session — was correct. **§9 Step 1's pre-flight has been re-run live: `10:33` is
  `{name: "Page Templates", count: 0, children: []}`**, so the gate rests on a reading taken in the
  building session rather than on the 2026-08-22 marker. §5's diagnostic lesson is kept: four
  "confirmations" recorded during the outage answered the wrong question.
- **Everything not requiring Figma has been completed.** `TODO.md` **C1** and **C2** are closed
  (2026-08-23), a 🔴 data-destruction bug in `tools/parse_receipts.py` was found and fixed while
  closing C2, **B14** is measured, and four measurement drifts in `CLAUDE.md` are reconciled. See
  §8 items 9–12 and §10.
- **Four questions belong to the user, not to the next session:** `TODO.md` **B11** (delete
  `Detail#156:26` on Metric Card or document it as Trend-only), **B9** (should Switch gain a
  `Show label` boolean), **B12** (is a month-granularity trend metric defensible on this corpus at
  all, and should its delta stay bound to success green), and one confirmation — Metric Card's label
  now reads **"Records owned"** rather than B1's literal "Games owned", changed on the file's own
  authority. **None of the four blocks P5**, and nothing else does either now. Full framing in the §9
  decisions block.

> ⚠ **Verify `10:33` read-only before you build on it.** This file records it as empty. It said the
> same about Metric Card `10:19` and about Wireframes `10:32`, and **both times the page already held
> finished work** — an "empty" marker is the most dangerous error in these documents, because acting
> on it rebuilds over work that is done. **Audit read-only before you touch any page**, whatever this
> file says about it.

---

## 1. Document map and authority order

Six documents describe this project. They have **strict, non-overlapping ownership** so they cannot silently contradict each other again — which is exactly what happened between `CLAUDE.md` and `WORKFLOW_CONTEXT.md` before 2026-08-05.

| Rank | File | Owns | Do not put here |
|---|---|---|---|
| 0 | **The Figma file itself** | All design content. **Absolute authority.** | — |
| 1 | `CLAUDE.md` | Governing constraints, token ladder, node ids, per-component closeout records, hard-won API knowledge | Roadmap status, session history |
| 2 | `HANDOFF.md` *(this file)* | Orientation, current state, environment, exact next steps | Token values, per-component detail |
| 3 | `TODO.md` | Prioritised backlog and every open defect | Anything already done |
| 4 | `WORKFLOW_CONTEXT.md` | Design rationale + technical reference that `CLAUDE.md` lacks: focus-ring convention, effect styles, layout derivations, non-goals, API/MCP quirk tables | Page status, variable counts, node ids |
| 5 | `CHANGELOG.md` | Dated session record | Current state |
| — | `DATA_PIPELINE.md` | The `tools/` + `data/` provenance chain | Design decisions |

**Rule:** where any document disagrees with the Figma file, **the Figma file wins** — and the disagreement is a defect in the document, to be fixed in the same session it is found.

**Rule:** any change to a Figma variable collection implies a rewrite of **two** Cover nodes in the same session — **`35:17`** (Color counts) and **`35:21`** (Motion counts). `35:17` has gone stale four times, and `35:21` was missed entirely on 2026-08-04 because only `35:17` was named in this rule. Rewrite both from a **live** count, never from a document.

**Rule:** **never quote a document for geometry.** §9 of this file told the Loading & Skeleton build that Game Card / Grid is 240 × 320; the live set is 240 × 416 (320 is the *cover* height). Measure the node.

**Rule:** **grep the live collection before concluding a token is absent.** `TODO.md` B7 asked for a `brand/tint` that needed creating; `brand/subtle` had existed all along. So had `bg/subtle-hover`, which no document listed.

**Rule:** **an "empty" page marker is the one to distrust.** Twice now a page these documents called empty already held finished work — Metric Card `10:19` in 2026-08-05, and **Wireframes `10:32` in 2026-08-06, which held seven complete screens.** Every other kind of documentation error misinforms; this one destroys. Run the read-only page audit in §9 Step 1 before building on any page, and treat a zero-children result as a claim to verify rather than a fact.

---

## 2. What Game ID is

A desktop **game ownership intelligence dashboard**. It answers questions about a library a person *already owns* — what is in it, where it came from, how trustworthy the metadata is, and what has never been touched.

It is **not** a game launcher, **not** a storefront, **not** a cloud-gaming service, **not** an Xbox clone. The name is fixed and must never change.

- Design language: **Microsoft Fluent 2**. Dark mode primary, Light fully supported.
- Target: **1920×1080 primary, 1440 minimum.** Desktop-first; mobile does not drive layout.
- Page content max width **1560**.
- Typeface **Inter only** — Segoe UI is not installed in this Figma environment.
- **No Fluent or third-party icon library.** All icons are hand-drawn vectors in-file.

---

## 3. The hard gate — read before writing any code

> **No HTML, CSS, JavaScript, React or Vue may be written for Game ID until the user explicitly approves the design.**

This is Phase 8 of the roadmap and it has not been reached. The gate is in force right now.

A partial frontend already exists at `app/` (`index.html`, `app.js`, `index.css`, `theme.css`, `pages/`, `services/`) from before this workflow began. **Do not extend it, do not "prototype" against it, do not scaffold.** It is superseded by the Figma design; if the two disagree, Figma wins. Leave it untouched until the gate opens.

The backend, OCR pipeline, parsing, enrichment and JSON schema are already built and are **not** the open problem. The open problem is frontend quality only — the user has been burned by iterations that restyled everything each pass, so **stability and consistency matter more than speed**.

---

## 4. Standing constraints

These have held across the whole build. **Do not relitigate them.**

1. **Figma is the source of truth.**
2. **Never invent a token.** A value gets a named, scoped variable in Figma first, then is consumed. A raw colour, spacing or radius number in a component is a defect.
   - **Exception (the Avatar precedent):** intrinsic *fixed component geometry* stays raw — Avatar's 20/24/32/40/48 boxes, Progress Ring, Checkbox, Switch. The no-raw-numbers rule governs visual style, not geometry.
3. **Refine, do not reinvent.** Layout is settled architecture. Later passes adjust spacing, wording and states — never navigation, card sizes, or working components.
4. **The data decides the hierarchy.** A field present on ~5% of rows never drives a sort, a chart, or a headline.
5. **Contrast is measured, never eyeballed** — and computed in the *same script that writes the copy*, so a caption can never drift from the token it describes.
6. **A state change must never resize a control**, or filter bars and toolbars reflow.
7. **A mode pin belongs on a documentation FRAME — never on a component, a variant, or an instance.**
8. **Keep all mutating `use_figma` calls strictly sequential.** Never parallelise writes.
9. **Do not use the Agent tool, Workflow, or deep-research** unless the user asks for them. This was kept even when an ultracode notice said otherwise, because Figma mutations must be sequential and a fan-out workflow would violate the thing it was meant to serve.

---

## 5. Environment and access

### Figma

| Field | Value |
|---|---|
| File name | `Game ID — Design System` |
| **File key** | **`00QEeirxnqT4Zg829aeDVZ`** |
| URL | `https://www.figma.com/design/00QEeirxnqT4Zg829aeDVZ` |
| RUN_ID | `gameid-ds-2026-07-31` |
| MCP server | `plugin:figma:figma` → `https://mcp.figma.com/mcp` (HTTP, bundle `figma_prod@2_2_96`) — a **remote** endpoint, so local processes and localhost ports say nothing about its health. Must be bound into the session at launch or no design work is possible. |
| Account | handle `Sufiyan`, student tier, **View** seat — cannot edit team files but *can* own personal drafts. This file is a draft and **is writable**. |

**Every `use_figma` call needs both:**

```
fileKey:    "00QEeirxnqT4Zg829aeDVZ"
skillNames: "figma-use,figma-generate-library"
```

**If the skills had to be loaded as MCP resources rather than as `/`-commands, the names take a
`resource:` prefix** — `"resource:figma-use,resource:figma-generate-library"`. `Skill(skill:
"plugin:figma:figma-use")` returns `Unknown skill` in some sessions; the working fallback is
`ReadMcpResourceTool(server: "plugin:figma:figma", uri: "skill://figma/figma-use/SKILL.md")` and the
same for `figma-generate-library`. Both skills' own instructions require the prefix when loaded that
way, and it is a logging field, so a wrong value is silent.

Omitting `fileKey` returns `MCP error -32602`. The correct tool namespace is `mcp__plugin_figma_figma__use_figma`.

> ### ✅ RESOLVED 2026-08-23 — kept as a diagnostic record, not as a live blocker
>
> **The tools are bound and the file is reachable.** Verified by **execution**: three read-only
> `use_figma` scripts ran against `00QEeirxnqT4Zg829aeDVZ` and returned data — `pageCount: 44` with the
> full page list, a depth-4 walk of all seven wireframes on `10:32`, and a geometry read of Library's
> card rows. **The fix was the one this block predicted: a fresh session.** Everything below is the
> record of the outage, kept because the *diagnosis* is the reusable part.
>
> **The server was connected the whole time. The tools were not in that session's tool list.** Those are
> different problems, and an earlier revision of this block diagnosed the wrong one — see the correction
> below.
>
> **Measured, 2026-08-23, during the outage:**
>
> | probe | result |
> |---|---|
> | `claude mcp list` | `plugin:figma:figma: https://mcp.figma.com/mcp (HTTP)` — **✔ Connected** |
> | `claude mcp get plugin:figma:figma` | Scope **Dynamic config (from command line)**, type `http`, header `X-Figma-Plugin-Bundle: figma_prod@2_2_96` |
> | `use_figma` called directly, after loading the `figma-use` skill | **`Error: No such tool available: use_figma`** |
> | `get_screenshot` / `get_metadata` / `ToolSearch` in the tool list | absent |
>
> So the failure is **session binding, not connectivity**: the server is live and healthy, this
> session simply never had its tools bound. A call errors with *no such tool* rather than a transport
> error, which is the tell. **Retried twice, the second time with the skill freshly loaded in the same
> turn** — that rules out the tool being merely *deferred*, and the skill's own fallback for deferred
> tools (`ToolSearch`) is absent too, so that route does not exist here either.
>
> **⚠ Correction — three earlier "confirmations" in this block were measuring the wrong question.**
> They are recorded here rather than deleted, because the mistake is the reusable part:
>
> - **`~/.claude.json` is the wrong file to read.** Its `mcpServers` is absent globally and `{}` for
>   `D:/work/Game ID`, and that proves **nothing** — the server's scope is *dynamic config*, injected
>   at launch, so it was never going to appear there. The earlier conclusion "the server is not in the
>   config at all" was a bad inference from a true reading. **Ask `claude mcp list`, not the config.**
> - **The process and port checks were irrelevant.** No Figma process on the machine, nothing LISTENING
>   on 3845/3846/8765, `curl 127.0.0.1:3845/mcp` → `000`. All true, all beside the point: this server
>   is a **remote HTTPS endpoint at `mcp.figma.com`**, which needs no local process and no local port.
>   Both zeros were dutifully proven non-vacuous per § 12 item 6 — and a non-vacuous zero to the wrong
>   question is still the wrong answer.
> - **"A browser tab gives the session nothing" was wrong.** With a hosted server the desktop app is
>   not required at all. What matters is whether the *session* carries the server, not whether the app
>   is running.
>
> This is § 12 item 11 exactly — a freshly-taken measurement, honestly reported, answering a
> neighbouring question. **State what a probe would prove before running it.**
>
> **One trap that survives the correction — and it is the only part still live:** the desktop app's
> **Dev Mode** MCP server (localhost 3845) is *not* a substitute for this one. It exposes read-only
> code/image/variable tools and cannot execute Plugin API scripts; P5 has to *create* nodes on `10:33`.
> Do not spend a session enabling it.
>
> **The fix that worked: start a fresh session from the launcher whose `claude mcp list` shows the
> server connected.** Tools are enumerated at session start, so a session that launched without them
> never gains them retroactively — nothing about the server needed changing, and nothing in the repo did.
> Apply this the next time a Figma tool reads as absent rather than failing.
>
> **What it blocked while it lasted:** every item that mutates or reads the file — P5's build on `10:33`
> *including its read-only pre-flight*, `TODO.md` **B3** (six Disabled button variants), **B4**
> (`fg/quaternary` on `bg/layer-selected` sweep), **B5** (Form Controls overview doc), **B8**
> (nested-variant audit of nine container sets), **B14**'s text edit on `17:21` / `17:13` / `16:108`,
> and the redundant Pagination `50 per page` rebind cleanup. **All of those are unblocked now.**
>
> **What it did not block, and what was therefore completed instead on 2026-08-23:** the whole of
> §C (`C1`, `C2`), B14's *measurement*, an independent re-verification of every figure in
> `DATA_PIPELINE.md` §7, and the document reconciliation across `CLAUDE.md` / `TODO.md` /
> `DATA_PIPELINE.md`. See § 10.
>
> **The standing instruction from both outages — "do not work around it" — was honoured in each**:
> nothing was mutated blind and no defect was closed on a structural read-back alone. That discipline
> still governs now that the tools are back; a read-back is still not verification.

Tag every scene node you create:

```js
node.setSharedPluginData('dsb', 'run_id', 'gameid-ds-2026-07-31');
node.setSharedPluginData('dsb', 'phase',  'phase3');
node.setSharedPluginData('dsb', 'key',    'component/loading-skeleton');
```

`getPluginData` / `setPluginData` are **not supported** — shared plugin data only.

### The verification loop — do not skip it

```
get_screenshot(nodeId) → curl -sL -o /tmp/<n>.png "<url>" → Read the PNG and actually look
```

On this machine `/tmp/x.png` is read back at `C:\Users\Sufiyan\AppData\Local\Temp\x.png`. Screenshot asset URLs are **short-lived and should be treated like a secret** — download once, never persist or publish them.

**A structural read-back is not verification.** A geometry check once reported footer notes as "no clipping — pass" while they rendered at 1.97:1 and were illegible. Properties prove what you *set*; only pixels prove what *renders*.

### Verifying Light mode

```js
node.setExplicitVariableModeForCollection(colorCollection, lightModeId);   // Dark 2:1, Light 2:7
// screenshot
node.clearExplicitVariableModeForCollection(colorCollection);              // ALWAYS clean up
```

**Never leave a pin on a COMPONENT, a variant, or an INSTANCE.** `createInstance()` copies `explicitVariableModes`, so a pinned component permanently freezes every instance it ever produces. 89 such pins were swept on 2026-08-03; **110 remain and must stay** — all on documentation FRAMEs, where the Color and Elevation pages need them to show both modes side by side.

### Shell / data commands

Git Bash on Windows. There is no build, no test suite, no package manager — the repo is data + Python tools + a legacy static frontend.

Re-run the data pipeline (only if source data changes — see `DATA_PIPELINE.md`). **Stage 2
(`parse_receipts.py`) is deliberately omitted**: its `.eml` sources were lost from a Windows temp
directory, so the script now refuses to run rather than overwriting `data/raw/receipts.json` with an
empty list. That file is the sole surviving copy of all 14 orders / 32 line items and the sole source
of `ownership.purchasePrice`. Stage 4 reads it from disk, so the chain still completes without it.

```bash
cd "D:/work/Game ID" && python tools/parse_transactions.py && python tools/match_screenshots.py && python tools/build_catalog.py && python tools/enrich.py && python tools/build_app_data.py
```

Re-measure the dataset (read-only, safe, ~1s):

```bash
cd "D:/work/Game ID" && python -c "import json;rows=[g for a in 'AB' for g in json.load(open('data/account%s.json'%a,encoding='utf-8'))['games']];print(len(rows),'records')"
```

---

## 6. Current state — every figure re-counted live 2026-08-22

Everything in this section was read from the file, not recalled. **P4 created no token and modified
no component** — every fix landed on an instance or on a component *property default* — so the
variable count is unchanged from 2026-08-05 and **no Cover rewrite is implied.**

### Totals

```
pages          44          (ids match the CLAUDE.md page map exactly)
variables     215          Primitives 55 · Color 59 · Spacing 13 · Dimension 26
                           Type Primitives 22 · Type 29 · Motion 11
text styles    10
effect styles   5          elevation/2 /4 /8 /16 /28
paint styles    0          (deliberate — colour lives in variables, not paint styles)
components    432          = 388 variants in 33 sets + 43 icons + 1 standalone (Field)
```

**Re-counted live 2026-08-22** by walking all 44 pages with `page.loadAsync()` and counting
`COMPONENT_SET` / `COMPONENT` nodes directly.

**This block used to read `426 = 382 variants in 31 sets` and contradicted the note under the
inventory table below, which said 432 / 388 / 33.** The note was right: the totals were counted on
2026-08-05, *before* Charts `10:30` shipped later the same day, and were never re-run. Both figures
now come from one live count. Sets by page are listed in the inventory table — its per-page variant
counts sum to exactly 33 / 388, which is the arithmetic that caught the staleness.

**Anything countable in this document is a liability** — see §12. Re-measure; do not quote.

### Variable collections

| Collection | Vars | Modes |
|---|---|---|
| Primitives | 55 | Value |
| **Color** | **59** | **Dark `2:1`, Light `2:7`** |
| Spacing | 13 | Value |
| Dimension | 26 | Value |
| Type Primitives | 22 | Value |
| Type | 29 | Value |
| Motion | 11 | Value |

**215 variables total**, re-audited live 2026-08-05 after Loading & Skeleton added `alpha/black-12`,
`bg/skeleton` and `duration/pulse`.

**Motion does not follow Color's code-syntax scheme** — for Motion, ANDROID and iOS are *identical*
(`tSlower`, `easeStandard`, `tPulse`); only WEB differs. Do not "correct" it onto Color's rules.

Full ladder with measured contrast for both modes: **`CLAUDE.md` → Variables**.

### Component inventory

| Page | Sets / components | Doc frame |
|---|---|---|
| `10:12` Icon | 43 icon components | `42:2` |
| `10:13` Badges | Badge `53:50` (12) · Store Badge `54:22` (2) · Confidence Badge `55:52` (6) · Count Badge `55:61` (4) | `52:2` |
| `10:14` Buttons | Button `93:454` (75) | `98:2` ← **canonical doc layout reference** |
| `10:15` Form Controls | Checkbox `106:53` (12) · Radio `106:86` (8) · Switch `106:123` (8) · Text Input `107:140` (42) · Field `107:141` (component) · Select `109:114` (21) · Textarea `109:131` (7) | `111:45` |
| `10:16` Filter Chip | Filter Chip `115:74` (20) | `118:14` |
| `10:17` Divider & Progress | Divider `119:14` (4) · Progress Bar `119:66` (17) · Progress Ring `119:103` (12) | `191:45` |
| `10:18` Avatar | Avatar `193:108` (35) · Avatar Group `193:144` (4) | `207:24` |
| `10:19` Metric Card | Metric Card `154:23` (12) | `169:23` |
| `10:20` Game Card / Grid | `221:141` (9) | `249:2` |
| `10:21` Game Card / Row | `272:144` (12) | `274:2` |
| `10:22` Section Header | `286:82` (6) | `292:2` |
| `10:23` Sidebar & Nav Item | Nav Item `301:44` (8) · Sidebar `302:96` (2) | `304:2` |
| `10:24` Top Bar | `321:35` (3) | `333:1645` |
| `10:25` Context Menu | Menu Item `353:18` (12) · Context Menu `354:1629` (2) | `357:47` |
| `10:26` Modal | `370:112` (4) | `373:37` |
| `10:27` Pagination | Page Button `391:39` (5) · Pagination `392:186` (6) | `395:85` |
| `10:28` Empty State | `417:128` (8) | `419:34` |
| `10:29` Loading & Skeleton | Loading Skeleton `451:2` (4) | `454:2` |
| `10:30` Charts | Bar Chart `474:104` (4) · Distribution Bar `475:38` (2) | `478:2` |

**Every id, name and variant count in the table above was verified live on 2026-08-05 and the totals
re-counted 2026-08-22.** The count stands at **33 sets summing to 388 variants**, plus 43 icons and
1 standalone (`Field` `107:141`) = **432 components**. The two Charts sets took it from 31/382.

**Note the Grid card is 240 × 416**, not 240 × 320 as an earlier revision of §9 stated — 320 is
`layout/card-cover-height`. Measure any counterpart you build against.

**Empty and awaiting work — re-verified live 2026-08-06:** `10:33` Page Templates · `10:35`–`10:42` the screen pages · `10:44` Changelog.

**`10:32` Wireframes is NOT empty** — it holds **seven built screens**, listed in §6a below. Earlier revisions of this section said it was empty. That was wrong.

Foundations pages `10:4`–`10:10`, plus Cover `0:1` and Getting Started `10:2`, are complete.

### 6a. Wireframes `10:32` — the live state · **P4 CLOSED 2026-08-22**

**7 screens · 8-node annotation layer · every wireframe defect closed · all 15 top-level nodes
verified in Dark *and* Light · six-check close-out audit clean.** Re-measured live 2026-08-22.

| Wireframe | Id | Size | Note frame | Verified |
|---|---|---|---|---|
| Library | `494:2` | 1560×**1576** | `549:943` | Dark ✅ Light ✅ |
| Collections | `496:329` | 1560×1080 | `549:946` | Dark ✅ Light ✅ |
| Stores | `496:432` | 1560×1080 | `549:949` | Dark ✅ Light ✅ |
| Accounts | `497:491` | 1560×1080 | `549:951` | Dark ✅ Light ✅ |
| Analytics | `497:630` | 1560×1080 | `549:954` | Dark ✅ Light ✅ |
| Search | `499:731` | 1560×1080 | `549:957` | Dark ✅ Light ✅ |
| Settings | `499:867` | 1560×1080 | `549:960` | Dark ✅ Light ✅ |
| — page note | `549:938` | 1560×220 | — | Dark ✅ Light ✅ |

**Every defect is closed.** W1–W4, W6, W7, W9 closed in the first 2026-08-22 session; **W5** and
**W8** closed in the second. W5 was blocked on B2 and is now resolved as part of **B10 route 1** —
Pagination's rationale re-derived from 226 rather than recaptioned, landed on doc page `395:85` and
on the Settings note `499:986` in one pass so the two cannot disagree. W8 is the annotation layer
above. Full per-defect detail: **`TODO.md` A3**.

**The numbered ledger ends at W9.** Items closed in the second session are recorded **by name** in
`CHANGELOG.md`, not as W10+ — those numbers never had a live source, and inventing them is the exact
failure mode §12 lists.

**Layout — extend the grid, never hand-place.** Screens sit at `x` = 0 / 1680 / 3360, rows at
y = 0 / 1816 / 3136, `ROWGAP` 240. Each note sits directly beneath its own screen **inside that
gap** — Library's at y=1608 because Library is 1576 tall, the row-2 notes at 2928, Settings' at
4248 — and the page note sits *above* the grid at y=−316. **The 240 gap was reserved for exactly
this and is now occupied.** Re-verified live 2026-08-22: **zero pairwise overlaps across all 15
nodes**, notes included.

**`549:957` "Note — Search" is the one irregular node** — 166 tall with **3** children where every
other note has 2, because the pre-existing standalone caption `499:866` was reparented into it
rather than duplicated. It grew 118 → 166 to absorb it. That is intended; do not "tidy" it back.

**Light verification carries a hard rule.** All seven screens plus the annotation layer were checked
in Light by pinning the Color collection on the **documentation frames only**, then clearing every
pin: **15 pins set, 15 cleared, 0 remaining.** A pin left on a component, variant or instance
freezes every instance made from it — see §5. Confirm `modePins: 0` before trusting any Light
screenshot on this page.

**Six-check close-out audit, run live 2026-08-22 — all clean:**

```
modePins          0    on every COMPONENT / COMPONENT_SET / INSTANCE
rawFills          0
rawSpacing        0    30 bound / 0 unbound across 16 auto-layout frames
nestedNonRest    18    all legitimate (see below)
untaggedTopLevel  0    every top-level node carries its dsb run_id / phase / key
setOverflow       0
topLevelCount    15    = 7 wireframes + 8 annotation nodes
```

The 18 nested non-rest states are correct, not defects: the rail's Selected item is the destination
you are on, a Filter Chip's `Unselected` is its rest state, Pagination legitimately ships
`Previous=Disabled` + `Page 1=Current`, Top Bar's Syncing variant ships its action at
`State=Disabled`, and Settings' `Filled` / `On` controls are a settings screen showing current
values. **The 30 is what makes `rawSpacing: 0` trustworthy** — a broken walk and a clean file both
report zero, so never accept a clean audit that does not also prove the walk reached real nodes.

**The rail has seven destinations, not eight.** Library, Collections, Stores, Accounts, Analytics,
Search, then Settings — exactly the seven wireframes that exist. **`10:35` "Dashboard" is an orphan
page name predating the rail design.** The set is not missing a screen. Do not invent a destination
the shipped Sidebar does not have; **P6 is seven screens, decided 2026-08-09.**

### What is verified

Every component page from `10:12` through `10:30` is **built, documented, and visually verified in
both Dark and Light** — Phase 3 complete. Wireframes `10:32` likewise, in both modes — **Phase 4
complete.**

---

## 7. Roadmap

| Phase | Scope | State |
|---|---|---|
| P1 Foundations | 7 collections, **215** variables, 10 text styles, 5 effect styles | ✅ done |
| P2 File structure | 44-page skeleton, all foundations doc pages | ✅ done |
| P3.1 Primitives | Icon, Badges, Buttons, Form Controls, Filter Chip, Divider & Progress, Avatar | ✅ done |
| P3.2 Content | Metric Card, Game Card Grid, Game Card Row, Section Header | ✅ done |
| P3.3 Navigation | Sidebar & Nav Item, Top Bar, Context Menu | ✅ done |
| P3.4 Overlay / utility | Modal ✅, Pagination ✅, Empty State ✅, Loading & Skeleton ✅ | ✅ done |
| P3.5 Data visualisation | Charts `10:30` — Bar Chart ✅, Distribution Bar ✅ | ✅ done |
| **P4 Patterns** | **Wireframes `10:32`** — 7 screens + 8-node annotation layer, **every defect closed**, verified in Dark **and** Light, six-check audit clean. No token created. | ✅ **done 2026-08-22** |
| **P5 Templates** | **Page Templates `10:33`** — pre-flight re-run live 2026-08-23, page genuinely empty (`count: 0`); shell, column arithmetic and the five templates derived from the live wireframes | 🟠 **in progress** — §9 Step 3, the build |
| P6 Screens | **Seven** screens — Library, Collections, Stores, Accounts, Analytics, Search, Settings (`10:36`–`10:42`), plus Changelog `10:44`. **`10:35` "Dashboard" dropped 2026-08-09.** | not started |
| P7 QA | Cross-screen consistency validation | not started |
| **P8 Approval** | **Present the design for sign-off — this unlocks the implementation gate** | not started |

---

## 8. Open issues — summary

Full detail, with node ids and proposed fixes, lives in **`TODO.md`**. Ranked here by severity:

1. **✅ Metric Card's fabricated data — CLOSED 2026-08-22, on both layers.** `154:23` shipped `1,247` games and a breakdown `584 high · 118 medium · 22 low · 523 none`, against a real corpus of **226 records** with confidence on **100%** of rows (High 63 / Medium 161 / Low 2) — **the "none" bucket does not exist in the schema.** Now: `169:62` reads *"132 of 226 records enriched"*, `169:78` reads *"63 high · 161 medium · 2 low"* with **the fourth bucket deleted, not zeroed** (a zeroed bucket still teaches a reader to build a legend and a filter for a state that cannot occur), and the set-level default `Label#156:0` moved **"Games owned" → "Records owned"**. **The label wording departs from B1's literal text on the file's own authority** — Data & Provenance `10:10` `27:372` rules *"No bare '226 games' anywhere in the UI"*, because 226 is ledger rows, 220 is unique titles and 208 is actual games. **Two layers had to be fixed, not one:** `set.editComponentProperty(key, {defaultValue})` corrects every variant sharing the default but **cannot reach an instance carrying its own override**, so `169:33` needed a separate `setProperties`. A default fix and an instance fix are not substitutes — see §12.
2. **✅ Three different library sizes — DECIDED 2026-08-09, SWEPT 2026-08-22.** 226 (Data & Provenance) was already correct; 1,247 was fabricated (item 1); **20,400 is retired entirely.** The sweep corrected **26 text nodes in three shapes at five source components** across the eight doc pages — Divider & Progress `191:45`, Section Header `292:2`, Sidebar `304:2`, Top Bar `333:1645`, Modal `373:37`, Pagination `395:85`, Game Card / Row `274:2`, Empty State `419:34` — plus Wireframes `10:32`. **Most of it was component-layer work, not copy edits:** the figure lived in Count Badge instances *inside* Section Header set `286:82` (`I286:6;55:54`, `I286:13;55:54`, `I286:30;55:54`) and Nav Item set `301:44` (`I301:6;55:56` … `I301:25;55:56`), which Top Bar, Modal and the wireframes all inherited — fixing the sets first, then re-scanning, is what stopped it regrowing. **B10 closed by route 1** (approved 2026-08-22): Pagination kept, its rationale **re-derived** from 226 rather than recaptioned — the seven-slot run is argued from *a run that never reflows under the pointer*, with the worked example 226 at 50 = five pages (ellipsis dormant) and at 25 = ten pages = `1 2 3 4 5 … 10` = seven slots. Final file-wide sweep: **`bareCount 0`** — no unqualified "games owned" anywhere. The four surviving comma-grouped figures and two unit figures are all legitimate and named in `CHANGELOG.md`.
2a. **🟠 `Detail#156:26` on Metric Card is wired to 3 of 12 variants — `TODO.md` B11, a user decision.** On the other nine `setProperties({'Detail#156:26': …})` is a **silent no-op**, which is why W2 had to be fixed on each instance's `Caption` node instead. **Do not "fix" this by wiring the property across all twelve** — per the Section Header precedent a set-level TEXT property forces one shared default across every variant, collapsing all twelve detail lines to one string. Recommendation is to delete the property; per-variant copy plus editable instance text already does the job. **`TODO.md` B15 records the mechanism** that made this dangerous: a stored value on a variant whose footer references the property for `visible` but not for `characters` is a **dormant override** — it renders nothing, is invisible to a `characters` sweep, and appears the instant someone switches the variant. **That is why B1 looked closed for a whole session while still holding the fabrication.**
3. **🟠 Primary and Danger Disabled buttons carry no stroke** (`93:22`, `93:52`, `93:82`, `93:382`, `93:412`, `93:442`). In Light their `bg/disabled` fill equals `bg/canvas`, so the button has no edge at all. Do **not** fix by moving `bg/disabled` — flat-on-the-page is the intended semantic.
4. **🟡 `fg/quaternary` fails on a selected surface** — 3.95 Light / 4.17 Dark. It backs ~342 text nodes so it cannot move. Use `fg/tertiary` or stronger on `bg/layer-selected`.
5. **🟡 Form Controls `10:15` has no overview doc section** consistent with peers.
6. **✅ "Select has no value-shown state" was FALSE — closed 2026-08-22 as already shipped (`TODO.md` B6).** Select `109:114` has a real **`State=Filled`** variant and it is in use: Settings `499:963` renders `Dark` / `Grid` / `50 per page` through it. The claim had been carried in this document as prose with no live source — **the sixth instance of §12's failure mode, and the only one found by simply looking at a render.** One consequence stands: Pagination's `50 per page` still uses Rest **plus an instance-level rebind to `fg/primary`** rather than the `Filled` variant. That is redundant, not broken — low-priority cleanup, not a defect.
7. **🟠 Every remaining container set needs its nested instance variant *values* audited.** Sidebar `302:96` shipped with `Stores` baked as `State=Hover` on both variants; Context Menu `354:1629` had the identical defect. Both fixed, but two out of two makes it systematic. `TODO.md` B8 lists the sets still to check.
8. **🟠 The Trend metric's delta is a design question, not a bug — `TODO.md` B12, two user decisions.** Both layers now read **`+18 vs. 2025`**, which is measured (208 records owned through 2025, +18 in 2026). But (a) **is a trend metric defensible at this granularity at all**, when 48% of the library arrived in a single month — the 2024-03 backfill, 109 records — and the trailing two months are empty? A sparkline over this corpus draws one spike and a flat line. And (b) the delta is bound to **success green** (`VariableID:5:30`), which makes any *negative* delta render as failure — but a library shrinking is a refund or a delisting, not a failure. Recommendation: keep the figure, drop the year-on-year framing until there is more than one full year of data, and bind the delta to a neutral token with tone reserved for cases where direction genuinely carries valence.
9. **✅ Both data-layer items — CLOSED 2026-08-23. Neither closed the way `TODO.md` proposed.**
   **C1** (`data/analytics/` promised but absent): the docstring was simply **false** — `grep -n
   analytics tools/build_app_data.py` hits only that one line and **no emit code path has ever
   existed**. Fixed by correcting the claim, *not* by manufacturing an output nothing consumes.
   **C2** (receipt `.eml` sources in a Windows temp dir): its premise had **expired** — the temp
   sweep already happened, so the recommended file-move was never executable. The 14 orders / 32
   line items survive only in `data/raw/receipts.json`, and they are the **sole source of
   `ownership.purchasePrice`** — populated on exactly **32 of 226** records (14.2%), 1:1 with the
   `Receipt email` provenance source in both directions.
10. **🔴 A live data-destruction bug was found and fixed while closing C2 — not a design defect,
    and it was one command away from being unrecoverable.** `Path.glob()` on a **non-existent**
    directory yields zero matches and **raises nothing** (verified). So plain
    `python tools/parse_receipts.py` would have parsed zero receipts and then overwritten
    `data/raw/receipts.json` with `[]`, destroying the only copy of the 32 price line items. The
    script now **refuses to run** on a missing *or* empty source dir, exits non-zero, and leaves the
    output untouched — verified by md5 (`613fe65087c1edf66a74f2e2dca5d9d4` before and after a
    default-args run, `exit=1`, still 14 orders / 32 items). The default `--eml-dir` was repointed to
    `data/source/receipts`, the 14 lost filenames are preserved in the docstring for a mailbox
    re-export, and **the directory was deliberately not created empty** — an empty receipts dir would
    make the script report "0 orders" as though that were a measurement. The other five tools were
    swept; only this one used a directory glob, and `parse_transactions.py` already guarded.
    **`§5`'s pipeline command now omits stage 2** — stage 4 `build_catalog.py:169` reads
    `receipts.json` from disk, so the chain still completes.
11. **🔴 `title` is not a unique identifier — measured 2026-08-23, and it touches P6 directly.**
    226 records resolve to **218 distinct title strings** (226 − 8 titles that each appear twice),
    via three different collision kinds:
    6 cross-account (the same game owned twice), 1 intra-account duplicate purchase
    (`Discord Nitro` twice in account A, two different transaction ids), and 1 **placeholder
    collision** — two different games both rendering `Needs Manual Verification`. Game Card / Row's
    shipped rationale says *"the title is the identifier"*, which is true for the reader and false
    for the data layer. **Key every row on `id`** — verified **226 distinct of 226, zero nulls, zero
    cross-account overlap**, formed `<transactionId>_<slug>_<n>`. **Never dedupe by title**, and treat
    two identical placeholder rows side by side as a *correct* render (both from order
    `F2403301554153074`, items `_1` / `_2`). Full measurement in `DATA_PIPELINE.md` §7.
    **This item published `224` first, which is a real figure for a different question** — rows whose
    title is not the placeholder. Distinct strings **218**, rows with a real title **224**, distinct
    real titles **217**. Corrected in the same session; see §12 item 8.
    **And one figure this file quotes could not be checked:** §8 item 1 and `TODO.md` B1 cite Data &
    Provenance `27:372` as saying *"220 is unique titles"*. **226 and 208 both reconcile** (208 is
    exactly `classification: "game"`); **220 reconciles with nothing** — re-read `27:372` when Figma
    is reachable. The rule it supports stands either way.
12. **🟢 "1,299 INR" on `17:21`, `17:13`, `16:108` is fabricated — measured 2026-08-23, edit blocked
    on Figma (`TODO.md` B14).** `pricing.msrp` is populated on **226/226** records and `1299` occurs
    **zero times**; the 51 distinct values include `1149.0`, `1300.0` and `1350.0` but never
    `1299.0`. Same class as `20,400` and `1,247` — and it lands *within one rupee* of a real value,
    which is exactly what makes it read as measured. **Do not simply delete the nodes**: they
    demonstrate the unit rule on `27:378`. Preferred route is to relabel as an explicit example;
    second choice is to substitute a measured value. Unblocked 2026-08-23.

---

## 9. Exact next steps

**P4 is closed. P5 — Page Templates `10:33` — is the next design step, and as of 2026-08-23 it is
✅ EXECUTABLE: the Figma tools are bound and the file is reachable.** §5 records the outage that
preceded this and the diagnostic lesson from it; read it for the four wrong-question
"confirmations", not for a live blocker. **Step 1's pre-flight has been re-run live in the building
session** — `10:33` returned `{count: 0, children: []}` — so start at Step 2. The steps below are
correct and unchanged.

The screenshot verification loop is sound and was used on every fix in the 2026-08-22 session. Note
that `await node.screenshot({scale, contentsOnly})` inside `use_figma` returns the PNG inline, which
is shorter than the `get_screenshot` → `curl` → `Read` loop; either is acceptable, but something must
be **looked at**, because a structural read-back is not verification.

### Step 1 — Pre-flight (read-only, mandatory)

**Do not skip this, and do not trust §6's "empty" marker.** This document has called a page empty
twice while it held finished work — Metric Card `10:19` and Wireframes `10:32`, both listed in `CLAUDE.md` § Notes for whoever picks this up.
An "empty" marker is the most dangerous error in this file because acting on it *destroys* finished
work rather than merely misinforming.

```js
const p = figma.root.children.find(x => x.id === '10:33');
await figma.setCurrentPageAsync(p);
return { name: p.name, count: p.children.length,
         children: p.children.map(c => ({id:c.id, name:c.name, type:c.type,
           w:Math.round(c.width), h:Math.round(c.height), x:Math.round(c.x), y:Math.round(c.y)})) };
```

**If `count` is not 0, stop and read what is there before building anything.**

While you are read-only, re-measure the layout tokens you are about to consume rather than quoting
them from `CLAUDE.md` — `layout/page-max`, `page-gutter`, `grid-gutter`, `sidebar-expanded`,
`sidebar-collapsed`, `topbar-height`, `card-width`, `card-cover-height`, `row-height`.

### Step 2 — Scope P5 from the wireframes, not from imagination

**The seven wireframes are the input.** They are verified in both modes and their annotation layer
states which decisions they encode — that was the whole reason W8 was worth doing, and it is why
this step is possible at all. P5's job is to lift the *repeated* structure out of those seven
screens and name it, then state the layout rules that govern it.

**Recommended template inventory, derived from what the seven screens actually share.** Confirm it
against the frames before building — this is a reading of them, not a measurement:

| Template | Derived from | Distinguishing structure |
|---|---|---|
| **App shell** | all seven | rail + bar + content column. The only template every screen uses. |
| **Grid page** | Library `494:2` | header → filters → card grid → pager. **The one scrolling screen.** |
| **List page** | Search `499:731` | header → filters → rows → pager. Same chrome, `row-height` rhythm. |
| **Band page** | Stores `496:432`, Accounts `497:491`, Settings `499:867` | stacked labelled bands of cards or rows; no pager. |
| **Metrics page** | Analytics `497:630` | metric card row → chart bands. |

Collections `496:329` is deliberately not its own template — check whether it is a Grid page or a
Band page and fold it into whichever it is. **Do not mint a template for a screen that fits one.**

**Two things P5 must settle that no shipped page states:**

1. **The column arithmetic, at both target widths.** 1920 primary and **1440 minimum** are declared
   constraints with no recorded consequence: nobody has written down how many 240 px cards fit the
   content column at either width, or what reflows at 1440. Derive it in the script that writes the
   copy — `layout/page-max`, `page-gutter`, `grid-gutter`, `card-width` and
   `sidebar-expanded`/`-collapsed` read live — and never hardcode the result into a caption.
   Recurring shape #4 is exactly this.
2. **When the rail collapses.** Sidebar `302:96` ships Expanded 280 and Collapsed 48, and no page
   in the file says which width triggers which. A template that cannot answer that is not a
   template.

**Library's 1576 height is a finding, not a defect** — it is the only screen that scrolls, the fold
marker on `10:32` says where 1080 lands, and a Grid page template has to state what sits above the
fold.

### Step 3 — Build, in the file's own shape

Page templates are documentation, so they follow the documentation page pattern (`CLAUDE.md`
§ Documentation page pattern; `10:14` root `98:2` is the reference): root VERTICAL 1560 on
`bg/canvas`, pad 32, gap 32 → Header → one section per template → **In use** → **Rules** as two
Always / Never columns with the 4×4 ellipse bullet. Read the conventions off `98:2`; do not
reproduce them from this table.

- **Build from shipped components.** Every one of the five templates is assembled from things that
  already exist — Sidebar, Top Bar, Section Header, Filter Chip, the two Game Cards, Pagination,
  Metric Card, the two Charts, Empty State, Loading Skeleton. **If a template needs something new,
  that is a finding to surface, not a component to invent mid-phase.**
- **Every spacing and radius value comes from a token.** Sweep by **value**, not by name — the
  Spacing collection uses bare names (`L`, not `spacing/L`) and `setBoundVariable` fails *silently*
  on an `undefined` variable. Skip nodes with an INSTANCE **ancestor**, not merely nodes of type
  INSTANCE.
- **Intrinsic geometry stays raw** per the Avatar precedent — a rail is 280 because it is 280.
- **Tag every top-level node** with the `dsb` shared plugin data (`run_id` / `phase` / `key`).
  `setPluginData` is unsupported; `setSharedPluginData` is what works.
- **Rebuild idempotently** — find the previous root by name and `.remove()` it first.

### Step 4 — Verify

The loop, per `CLAUDE.md`: `get_screenshot(nodeId)` → `curl -sL -o /tmp/<n>.png "<url>"` → **Read
the PNG and look at it.** On this machine `/tmp/x.png` reads back at
`C:\Users\Sufiyan\AppData\Local\Temp\x.png`. Asset URLs are short-lived — download once, and treat
them like a secret.

**Both modes.** Pin the Color collection on the **documentation FRAME only** — never on a
component, a variant or an instance, because `createInstance()` copies
`explicitVariableModes` and freezes every instance ever made from it — and
`clearExplicitVariableModeForCollection` afterwards. Count pins set against pins cleared and report
both numbers.

Then the six-check close-out audit: zero mode pins on any COMPONENT / COMPONENT_SET / INSTANCE ·
zero raw fills · zero raw spacing · zero nested non-rest states · every top-level node tagged · no
frame overflowing itself. **Pair every zero with the positive count that proves the walk reached
real nodes** — a zero from a selector that never matched anything is not a pass. `query()`
attribute selectors break silently on unquoted spaces.

Two checks this phase needs specifically:

- **Every string on every reused instance retargeted**, including strings the *variant* brought with
  it. This trap has now hit at the instance layer four times and at the variant layer once (W3's
  "Half-Life 2").
- **A shape sweep for stale figures, not a needle sweep.** `/\d,\d{3}/` across the page catches what
  a search for known-bad numbers misses — that is how `8,540`, `4,102` and `20,412` were found after
  a needle sweep came back clean.

### Step 5 — Record it

- `CLAUDE.md` — page-map row `10:33`, a § Page Templates closeout, and any new API lesson.
- `TODO.md` — anything the build surfaced, filed with node ids.
- `CHANGELOG.md` — a dated entry.
- Cover `35:17` / `35:21` — **only if a variable collection changed.** Both carry counts; a
  collection change implies rewriting **both**, in the same session, from a live count. `35:17` has
  gone stale four times.

Closing `10:33` closes P5. Next is **P6 — seven high-fidelity screens** on `10:36`–`10:42`
(`10:35` "Dashboard" is dropped — see the decisions block), then P7 consistency, then **P8, the
approval gate that unlocks implementation.**

### Decisions — three made, four waiting

**Made — do not relitigate:**

- **`TODO.md` B2 — decided 2026-08-09: use 226 everywhere.** 20,400 is **retired entirely**, not
  relabelled and not kept for scale-behaviour copy. **Swept and closed 2026-08-22** across five
  source components, eight doc pages and `10:32`. It created **B10**, because choosing 226 removed
  the premise Pagination's rationale was *argued from*.
- **`TODO.md` B10 — route 1 approved 2026-08-22 by the user, and landed the same day.** The verified
  component stays; the rationale is now *sized for the library to grow into*, written onto Pagination
  `395:85` **and** Settings `499:986` in one pass so the two cannot disagree. **Route 2 — shrinking
  Pagination to fit 226 — is rejected: do not re-scope the component.**
- **Page `10:35` "Dashboard" — decided 2026-08-09: dropped from the P6 list.** P6 is **seven**
  screens, not eight, matching the shipped rail's seven destinations. The rail gains **no** Dashboard
  destination. Deleting the page is optional cleanup; keeping it in P6 scope is not.

**Waiting on the user. None of these block P5.**

- **`TODO.md` B11 — `Detail#156:26` on Metric Card, wired to 3 of 12 variants.** Delete the property,
  or keep it and document it as Trend-only. Recommendation: **delete.** Wiring it across all twelve
  would be actively harmful — see §8 item 2a. The *mechanism* behind it is **B15**, filed separately
  because a dormant override is invisible to a text sweep *and* to the render, and surfaces only when
  a variant is switched. B15 is why B1 looked closed for a whole session while still holding the
  fabrication.
- **`TODO.md` B9 — should Switch `106:123` gain a `Show label` boolean?** W4 was its second consumer.
  A set-level *boolean* is cheap here because it toggles visibility, not content — unlike a set-level
  TEXT property, which is what makes B11 hazardous. Related: whether Switch `Track`'s 2 px insets
  should be tokenised at all, or stay raw under the Avatar intrinsic-geometry precedent
  (recommendation: stay raw — they are inherited, and a thumb inset is geometry).
- **`TODO.md` B12 — is a month-granularity trend metric defensible on this corpus?** Both layers now
  read `+18 vs. 2025`, which is measured and true. But **48% of the library arrived in a single
  month (2024-03 backfill, 109 records)** and the trailing two months are empty, so a monthly trend
  describes an import, not a habit. Recommendation: keep the figure, **drop the year-on-year
  framing**. Second part: the delta is bound to success green (`VariableID:5:30`), which makes any
  negative delta read as *failure* rather than as *fewer purchases* — recommendation: bind it to a
  neutral token.
- **One confirmation, not a decision.** B1's literal wording was *"'Games owned' reads 226"*. It now
  reads **"Records owned"**, changed on the file's own authority: Data & Provenance `10:10` `27:372`
  ships the rule *"No bare '226 games' anywhere in the UI"*, because 226 is ledger rows, 220 is
  unique titles and 208 is actual games. `226` beside the word *games* would have violated a shipped
  rule while closing a defect. Confirm the departure or name the label you want.

---

## 10. What changed recently

`CHANGELOG.md` owns the full dated record. The most recent sessions in brief:

### 2026-08-23 — data layer and documents · **no Figma mutations (server unreachable)**

**Every Figma tool was absent from the session** — see the 🔴 blocker in §5. So the session did the
work that does not need the file, and did not fake the work that does.

- **`TODO.md` §C closed entirely.** C1's docstring claim was false and was corrected rather than
  satisfied; C2's premise had expired (the temp sweep already happened). §8 items 9–10.
- **Found and fixed a live data-destruction bug** in `tools/parse_receipts.py` — one default-args run
  from unrecoverably overwriting the only copy of the 32 purchase-price line items. §8 item 10.
- **`DATA_PIPELINE.md` §7 independently re-verified in full** — 20+ figures, all matched, including
  the subtle ones (playtime present on 177 / nonzero on exactly 4; the six `steamStatus` buckets;
  `INR 222 / USD 4`). Two traps recorded for the next reader: `confidence` is nested at
  `provenance.confidence`, and a naive duplicate-title count returns 8 where the documented 6 is right.
- **Two new measured findings**, both consequential rather than cosmetic: `title` is not a unique
  identifier (§8 item 11) and `1,299 INR` is fabricated (§8 item 12).
- **Documents reconciled.** `CLAUDE.md` still described the `20,400` component sweep as pending in
  three places after it had closed; the Metric Card page-map row still said "ships fabricated data";
  and "98% zero playtime" was imprecise in four places — the real shape is **173 explicit `0` + 49
  `null` + 4 nonzero**, and conflating null with zero is exactly what the pipeline's NO FABRICATION
  rule exists to prevent.

### 2026-08-22 (second session) — **P4 CLOSED**

- **W5 and W8 closed, which closes every wireframe defect.** W5 landed as B10 route 1 on Pagination
  `395:85` and Settings `499:986` in one pass. W8 became an **8-node annotation layer** — one page
  note `549:938` plus a caption for each of the seven screens.
- **All 15 top-level nodes on `10:32` verified in Dark *and* Light** — the page had never been seen
  in Light. 15 pins set on FRAMEs, **15 cleared**, zero remaining.
- **The 20,400 sweep finished at the component layer**, not as copy edits — five source components,
  eight doc pages and `10:32`. Final shape sweep: `commaCount 4 / unitCount 2 / bareCount 0`, every
  survivor legitimate.
- **B1 closed on both layers.** The rendered text was corrected in the first session; the *property
  defaults* still held both fabrications, including the schema-forbidden fourth "none" bucket. See
  §8 item 1 and B15 — a dormant override is invisible to a text sweep and to the render alike.
- **The §6 totals were self-contradicting and are now re-counted live: 215 variables, 432
  components** = 388 variants in 33 sets + 43 icons + 1 standalone. The old `426 / 382 / 31` was
  counted on 2026-08-05 *before* Charts shipped later the same day.
- **Six-check close-out audit clean**, every zero paired with the positive count that proves the walk
  reached real nodes.

### 2026-08-22 (first session) — P4 defect sweep · **7 of 9 wireframe defects closed**

- **W1, W2 (page-wide), W3, W4, W6, W9 fixed on instances; W7 was a false alarm** — 30 bound / 0
  unbound, so the "8 raw spacing values" had no live source, exactly like 20,400 itself.
- **Zero residual retired figures on `10:32`** by literal scan for `1,247`, `20,400` and `724 of`.
- **Two new API failures recorded in `CLAUDE.md`**, both about instance sub-node handles going stale
  or being pruned the moment you mutate or hide one. Capture metadata as plain data *before*
  mutating, and verify by walking from stable real node ids.

### 2026-08-09 — decisions only · **no Figma mutations**

B2 (226 everywhere, 20,400 retired) and the `10:35` Dashboard drop. See the decisions block in §9.

### 2026-08-05 — three sessions

**Three sessions ran on this date.**

### Third session — Charts built · **P3.5 closed, and with it all of Phase 3**

- Built **Bar Chart `474:104`** (4 variants — Size Full 720 / Compact 320 × Bars 4 / 3) and **Distribution Bar `475:38`** (2 variants — Size Full 720 / Compact 320), plus doc `478:2` (1560×3026, six sections), verified in both modes. Overflow 0/0 on both sets, zero stray pins, and the close-out audit clean on all six checks.
- **No token created.** The seven `viz/*` tokens had existed since P1 with **zero component consumers** — Charts is the first. Variable counts stand at **215**, so no Cover rewrite was implied.
- **Measured the palette before designing against it, with deltaE and not just contrast ratio.** That is what set the scope: the viz ramp is **sequential, not categorical** (adjacent deltaE as low as **7.4**, so ranks 1–3 read as one blue), only **ranks 1–4** clear 3:1 on `bg/layer` in both modes, and `viz/track` = `bg/canvas` at exactly **1.00:1 in Light**. Hence two components rather than a chart library, four data marks as the ceiling, and every chart owning its own `bg/layer` surface.
- **Deleted a `Segments=4` axis I had built**, because the array feeding it was confidence plus a duplicated `Low` — a fabricated fourth confidence level, the exact defect `TODO.md` B1 flags in Metric Card. Inventing a variant for axis symmetry is how B1 happened.
- **Rebuilt both charts on per-mille weights.** `layoutGrow` must be an integer, and at percent scale rounding drew a 0.88% segment at **13.5 px instead of 6.1** — over double its true size, on the segment a reader is most likely to misread.
- **Light mode caught a defect in my own copy:** I had cited `confidence/*` against `bg/layer` as proof the stacked segments were legible, but in a stacked bar the segments tile the track and nothing is behind them. Measured against each other, `medium|low` is **1.06:1 by luminance in Light** — separated by hue only, so it dies in greyscale. Fixed **structurally**, with a 2 px achromatic `bg/layer` rule between segments, not by moving a token.
- **Recurring shape #4 recurred in work minutes old** — the Rules columns and specimen captions shipped hardcoded figures while the Palette notes were live. Every number on the page now derives in the script that writes it.

### Second session — Loading & Skeleton built · **P3.4 closed**

- Built **Loading Skeleton `451:2`** (4 variants — Grid card 240×416 / Row 960×56 / Metric card 356×148 / Text line 320×20) and doc `454:2`, verified in both modes. Overflow 0/0, zero stray pins.
- **Three new tokens:** `alpha/black-12`, **`bg/skeleton`** (alpha at 12%, the **sixth** consumer of the alpha rule), and **`duration/pulse`** — 1200 ms, **derived as 3 × `duration/slower` read live**, because the Motion ramp's 400 ms ceiling is a *transition* bound and a loop period is a different quantity.
- **Fixed a shipped defect in Sidebar `302:96`** — both variants baked `Stores` as `State=Hover`, so every Sidebar instance in the file rendered a phantom hover. Second occurrence of this shape.
- **Corrected three claims in the documents:** §9 said Game Card / Grid is 240 × 320 (it is 240 × 416); `TODO.md` B7 said `brand/tint` needed creating (**`brand/subtle` already existed**); no document listed **`bg/subtle-hover`**.
- **Cover `35:17` and `35:21` rewritten** from live counts. `35:21` had been stale since `duration/pulse`— and the rule in §1 only named `35:17`, which is why it was missed. Rule now names both.
- Three defects in this session's own work were caught **by looking, not by structure**: a `20,400` count badge in the In use rail, copy claiming a Sort control that was not rendered, and five grid cards overflowing a 1152 column.
- **`TODO.md` B1 and B2 deliberately untouched** — B2 is a user decision and B1 depends on it.

### First session — handoff reconstruction · no Figma mutations

**Every `use_figma` call in that session was read-only.** Empty State
`10:28` was closed out on **2026-08-04**, not on the 5th; the first session's entire output is documentation.

- Ran a **full read-only audit** of the live file: 212 variables, 10 text styles, 5 effect styles, 0 paint styles, 44 pages, 422 components across 30 sets.
- **Found `Icon / person` `129:16` exists** — `CLAUDE.md` claimed there was no person icon. It is real, sits in the Icon docs, and has **zero instances**. Corrected.
- **Resolved the Metric Card id question** — `154:23` / `169:23` confirmed live; `CLAUDE.md` had flagged them "verify before trusting" and had no components-table row at all.
- **Found the fabricated Metric Card data defect** (issue #1 above) and the three-way library-size inconsistency (issue #2).
- **Measured the real dataset**: 226 records, Epic-only, 98.2% zero playtime, 58.4% enriched, confidence on 100% of rows.
- **Rewrote `WORKFLOW_CONTEXT.md`**, which was 4 days stale and actively dangerous — it listed pages `10:20`–`10:29` as "Not Started" when eight of them are finished.
- Created `HANDOFF.md`, `TODO.md`, `CHANGELOG.md`, `DATA_PIPELINE.md` and set the authority order in §1.

Full detail: `CHANGELOG.md`.

---

## 11. Repository layout

```
D:\work\Game ID\
├── CLAUDE.md              # constraints, tokens, node ids, API knowledge  (AUTHORITY 1)
├── HANDOFF.md             # this file                                     (AUTHORITY 2)
├── TODO.md                # backlog + open defects                        (AUTHORITY 3)
├── WORKFLOW_CONTEXT.md    # design rationale + technical reference        (AUTHORITY 4)
├── CHANGELOG.md           # dated session record                          (AUTHORITY 5)
├── DATA_PIPELINE.md       # tools/ + data/ provenance
├── Claude chat .txt       # raw transcript of an early session; historical only
├── app/                   # LEGACY static frontend — DO NOT EXTEND (gate, §3)
│   ├── index.html  app.js  index.css  theme.css
│   └── pages/  services/
├── assets/placeholders/   # cover + background placeholder SVGs
├── data/                  # see DATA_PIPELINE.md
│   ├── config.json  genres.json
│   ├── accountA.json  accountB.json      ← the app-facing output (226 records)
│   ├── source/  raw/  catalogs/  enriched/
├── tools/                 # 6 Python pipeline stages
├── .cache/                # Steam API cache — do not commit, do not clear casually
└── .claude/launch.json
```

Not a git repository. No `package.json`, no build step, no tests.

---

## 12. If something looks wrong

The recurring failure modes in this project, in the order they actually happened:

1. **Trusting a document over the file.** Audit read-only first. The page map's **"empty" marker** has
   been wrong twice — Metric Card `10:19` and Wireframes `10:32` — and it is the most dangerous kind of
   error here, because acting on it rebuilds over finished work rather than merely misinforming.
2. **Believing a structural read-back.** It passes while the pixels are broken. Look at the image.
3. **Resolving the token instead of the node.** A Light screenshot looked washed out three times; the *token* measured 8.82:1, the *node* was rendering at 1.28:1 because of a mode pin. Resolve what the node actually renders.
4. **Suspecting the file when an audit reports mass failure.** Twice a "correct" generator produced walls of false positives — the ANDROID/iOS code-syntax rules, and array-shaped `boundVariables` on TEXT nodes. **When an audit says everything is wrong, suspect the audit.** Derive the rule from the file's own majority first, then flag the minority.
5. **A silent no-op.** `V['spacing/L']` is `undefined` (Spacing uses **bare** names — `L`, not `spacing/L`) and `setBoundVariable` then fails silently. Same with an unknown component-property key. Neither throws. Verify by reading back *and* by looking.
6. **A clean audit result from a walk that reached nothing.** A zero is only trustworthy from a
   selector proven able to find non-zero. W7 was recorded as "8 raw spacing values, unbound" and
   measured **30 bound / 0 unbound** — the audit was only believable because it returned the 30
   alongside the 0. This is the corollary to #4, and it has a code form: **`Path.glob()` on a
   directory that does not exist yields zero matches and raises nothing.** That is how a
   re-run of `parse_receipts.py` would have overwritten the only surviving copy of all 14 orders
   with `[]`. `tools/parse_receipts.py` now refuses to run rather than write a zero it did not
   measure. Never let a zero stand unless the same run also produced a non-zero.
7. **Writing down that something does not exist.** Four times now, and every one was disproved by a
   single read: `brand/tint` (where `brand/subtle` `VariableID:5:16` already existed), `Icon / person`
   `129:16`, Select's `State=Filled`, and "no corpus field carries a price" (`pricing.msrp` is
   populated 226/226). **An absence is a claim about the whole file or the whole corpus, and it is the
   one kind of claim that cannot be verified by remembering.** It also hides the sharper true claim
   underneath it — the real finding about `1,299 INR` is not that no price field exists, it is that a
   *fabricated* price sits on three nodes while a real one sits on every record. Read the set, the
   collection, or the schema.
8. **A number that lost its live source and got carried forward as prose.** `~20,400` originated as a
   sentence in `CLAUDE.md`, propagated into eight shipped doc pages, and was read as measurement for
   four days; the corpus is **226**. W7's "8" had no source either. And "98% of records have zero
   playtime" quietly absorbed a schema distinction the pipeline works hard to preserve — the real
   split is **173 explicit `0`, 49 `null`, 4 nonzero**, so *unmeasured* had been rounded into *idle*.
   Re-measure anything countable; never quote a document for it.
9. **Describing work as outstanding after it closed.** The `20,400` component-layer sweep ran on
   2026-08-22 and three separate `CLAUDE.md` sites still called it pending on 2026-08-23. Same shape
   as #8 running backwards. **When you close something, grep the whole document set for every place
   that described it as open** — the close-out note is not the only copy of the claim.
10. **A number that *was* freshly measured, answering a neighbouring question.** The sharpest version
    of #8, and the only one where the source was live. "226 records → **224** distinct title strings"
    was published on 2026-08-23; the answer is **218** (eight titles appear twice: 226 − 8). `224` is
    the honest count of rows whose title is not the `Needs Manual Verification` placeholder, and `217`
    is distinct real titles — three adjacent quantities, one label. The collision table printed
    directly beneath it summed to 8 pairs and therefore contradicted its own headline, which is how the
    close-out audit caught it. **State the arithmetic next to the figure** — `226 − 8 = 218` cannot go
    wrong quietly, and "I measured it" is not the same as "I measured what I then wrote down."
