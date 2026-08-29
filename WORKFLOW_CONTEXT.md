# Game ID — Workflow Context

**Owner of:** design rationale, settled architecture decisions and their derivations, the build
conventions (focus rings, specimen strips, doc pages), and the Figma Plugin API / MCP quirk tables.

**Not the owner of:** current state (`HANDOFF.md`), token values, node ids and the page map
(`CLAUDE.md`), the backlog (`TODO.md`), the dated record (`CHANGELOG.md`), or the corpus
(`DATA_PIPELINE.md`).

Last rewritten **2026-08-05**.

---

## Authority order

| # | Source | Owns |
|---|---|---|
| 0 | **The Figma file `00QEeirxnqT4Zg829aeDVZ`** | Everything visual. If a document disagrees with the file, **the file wins** — and the document is the defect. |
| 1 | `CLAUDE.md` | Token values, node ids, the page map, the components table, hard-won API knowledge, per-component closeouts. |
| 2 | `HANDOFF.md` | Current state and the exact next steps. **The zero-context entry point — read it first.** |
| 3 | `TODO.md` | The ranked backlog and every open defect. |
| 4 | **this file** | Why things are the way they are. Immutable reasoning, not countable state. |
| 5 | `CHANGELOG.md` | The dated session record. |
| — | `DATA_PIPELINE.md` | The `tools/` chain, the `data/` tree, and every measured corpus figure. |

---

## Why this file is scoped the way it is

The 2026-08-01 version of this document carried a 44-row page map, a full component table and a
complete variable inventory — all of which `CLAUDE.md` also carried. It went **four days stale**
and became actively dangerous: it still said *Phase 3.1*, *204 variables*, Avatar `127:26` with 12
variants, and listed pages `10:20`–`10:29` as **"Not Started"** when eight of them were finished,
documented and verified in both modes. A fresh session reading it would have rebuilt finished work.

**The fix is scope, not diligence. Two documents cannot both own mutable state.** This file now
holds only what does not change when a component ships: the philosophy, the derivations, the
conventions, and the API traps. Everything countable lives in `CLAUDE.md` and `HANDOFF.md`.

If you find yourself about to paste a count into this file, put it in `CLAUDE.md` instead.

---

## Project overview

| Field | Value |
|---|---|
| **Project name** | Game ID |
| **Project root** | `D:\work\Game ID` |
| **Type** | Desktop application — *game ownership intelligence dashboard* |
| **Not** | A game launcher, a storefront, an Xbox/Steam UI clone |
| **Repo** | Not a git repository. |
| **Application code** | **None written.** A partial legacy frontend exists at `app/` — do not extend it, do not prototype against it, do not scaffold. |
| **Current phase** | P3.5 — Charts `10:30` is the next build. P3.4 closed 2026-08-05. See `HANDOFF.md` §9. |

### Purpose

Game ID answers questions about a library a person **already owns** — what is in it, where it came
from, how trustworthy the metadata is, and what has never been touched. It is an analysis surface,
not a play surface.

### High-level goals

1. Make a messy, partially-enriched ownership dataset legible.
2. Be honest about data quality rather than papering over it — surface confidence, not fabricated
   completeness.
3. Ship a complete Figma design system before any application code is written.
4. Support Dark (primary) and Light modes from one token set.
5. Target desktop: 1920×1080 primary, 1440 minimum supported.

---

## Design philosophy

**Design language: Microsoft Fluent 2.** Neutral greys, restrained accent use, functional depth,
4 px spacing grid, circular radii reserved for pills and avatars.

Core principles, in priority order:

1. **The data decides the hierarchy.** A field present on ~5% of rows never drives a sort, a chart
   axis, or a headline number. Sparse data appears as detail, never as structure.
2. **Honest emptiness.** Missing data is shown as missing — with a confidence indicator or an
   explicit empty state — never as a zero, a dash pretending to be a value, or a hidden row.
3. **Never invent a token.** A value gets a named, scoped variable in Figma *first*, then is
   consumed. No raw hex, no magic numbers.
   **Exception, a user decision (the Avatar precedent):** intrinsic fixed component geometry stays
   raw. The rule governs *visual style* — colour, spacing, radius — not a component's own box size.
   Avatar's 20/24/32/40/48, Progress Ring's diameters and Checkbox's 16 are all plain numbers by
   design.
4. **Refine, do not reinvent.** Once layout architecture is settled it is settled. Later passes
   adjust spacing, wording and states — never navigation structure, card dimensions, or working
   components.
5. **Contrast is measured, not eyeballed.** Every foreground/background pair is computed against
   WCAG. Text targets 4.5:1, graphic boundaries target 3:1. Documented values must be **measured in
   the same call that writes them**, never recalled.
   **WCAG's large-text exemption begins at 18.66 px bold / 24 px regular.** A 12 px Semi Bold word
   needs the full 4.5:1. Citing the exemption for a small bold label is how five confidence pairs
   shipped failing — see `CHANGELOG.md` 2026-08-02.
6. **Density with air.** Desktop-first means information density is a feature, but rows breathe
   (56 px) and cards are generous (240 × 320 cover).
7. **One component, many states.** Every interactive component ships Rest / Hover / Focus /
   Disabled, and **a state change must never change a control's footprint.**

### Explicit non-goals

No gradients. No glassmorphism. No blur-behind surfaces. No decorative illustration. No custom
brand typeface. No animation beyond functional motion tokens. No mobile or tablet layouts in v1.

---

## Architecture decisions — process

Each of these is settled. **Do not reinvent, re-litigate, or "improve" any of them** without an
explicit user instruction.

| Decision | Why |
|---|---|
| **Design system first, application screens second** | Screens assembled from unvalidated components produce inconsistency that is expensive to unwind. Tokens → components → templates → screens. |
| **Component-first architecture** | Every screen is composed of published components. A screen never contains bespoke geometry. |
| **Figma is the source of truth** | When application code eventually exists and disagrees with Figma, Figma wins. This prevents drift during implementation. |
| **Implementation gate** | **No HTML, CSS, JavaScript, React or Vue is written for Game ID until the design is explicitly approved by the user.** A hard gate, still in force. The legacy `app/` is not an exception. |
| **One `use_figma` call per component family, strictly sequential** | Figma mutations are not transactional across calls. Batching or parallelising produces unrecoverable partial state. **This is also why no Workflow / subagent fan-out is used on this project** — a fan-out would violate the exact constraint it was meant to serve, and for documentation work it would additionally risk fabrication, because the measurements have to come from the one context that holds the actual readings. Stay solo unless the user asks otherwise. |
| **Measure-and-write in one call** | Any documented contrast ratio or measurement is computed and written to the canvas in the *same* script, so documentation cannot drift from reality. |
| **Verify by screenshot, never by structural read-back** | Properties prove what you *set*. Only pixels prove what *renders*. See the Verification loop below. |

---

## Architecture decisions — visual and structural, with derivations

The derivations are the load-bearing part. A number without its reason gets "tidied" by the next
session.

| Decision | Value | Why |
|---|---|---|
| **Design language** | Microsoft Fluent 2 | Native-feeling on Windows, the primary platform. Mature, documented, has a real dark mode. |
| **Platform target** | Desktop-first, 1920×1080 primary, 1440 minimum | The dataset is wide-table and multi-panel. Mobile would force a different product. |
| **Page content width** | **1560** (`layout/page-max`) | 1920 − 2 × 32 gutter − 280 sidebar ≈ 1576; 1560 is the nearest clean 4 px value and holds **6 × 240 cards + 5 × 24 gutters exactly**. |
| **Sidebar width** | **280** expanded, **48** collapsed | 280 fits the longest nav label + icon + count badge without truncation. 48 = one icon target, matching the top bar height for a **square** collapse. |
| **Top bar height** | **48** (`layout/topbar-height`) | Fluent's command-bar height; fits a 32 px control with 8 px above and below. |
| **Top bar width** | **1280, not 1560** | It spans the content column only — 1560 page max minus the 280 rail. It never runs over the rail. |
| **Page gutter / grid gutter** | 32 / 24 | Gutter > grid gutter keeps the content block visually inset from the chrome. |
| **Card dimensions** | 240 wide, 320 cover | 2:3 box-art aspect at a size where six fit across 1560. |
| **Row height** | 56 (`layout/row-height`) | Fits a 40 px thumb + 8 px padding. ~15 rows above the fold at 1080 against the grid's ~10 — that density difference is *why* Row is the working view and Grid is not. The thumb keeps the card's 3:4 poster ratio and is **never square-cropped**. |
| **Typeface** | **Inter** | Segoe UI is unavailable in this Figma environment. Inter is the closest metric-compatible substitute and is present. **Do not attempt Segoe UI.** |
| **Icons** | **Hand-drawn vectors on page `10:12`** | No Fluent or third-party icon library is reachable from this file. **Do not attempt to import one.** Page `10:9` (Iconography) is documentation and contains zero components. |
| **Radii** | 0 / 2 / 4 / 6 / 8 / 9999 | Fluent scale. `circular` reserved for chips, avatars, progress tracks. |
| **Spacing** | 2/4/6/8/10/12/16/20/24/32/40/48/64 | Fluent's named ramp (XXS…6XL), 4 px grid with 2 px and 6 px "nudge" steps for optical corrections. |
| **Two-tone focus ring, drawn outside the control** | inner 1 px + outer 2 px, offset −1 / −3 | Guarantees visibility on both light and dark surfaces, and **focusing never shifts layout** because the ring is absolutely positioned outside with `clipsContent = false`. |
| **A state change never resizes a control** | enforced per component | Prevents chip bars, toolbars, menus and pagination runs from reflowing on hover / select / disable. Verified by measuring variant widths. Pagination is the sharpest case: a run that grows and shrinks moves the arrows under a pointer that is already there. |
| **Selection is always two cues** | fill **plus** a 2 px `brand/selected` bar | The selected fill reaches only 1.28:1 against the page and 1.39:1 against hover in Light. **Use `brand/selected`, never `brand/rest`** — `brand/rest` is deliberately dark in Dark mode and measured **1.90:1** there, which would have made the second cue the invisible one. |
| **Dual-role tokens are split, not compromised** | e.g. `confidence/empty` | A token backing both text and shapes cannot satisfy 4.5:1 and "quieter than filled" simultaneously. Split the shape role into its own `SHAPE_FILL`-scoped token. Audit usage — text consumers vs shape consumers — *before* retargeting anything. |
| **`stroke/control` exists separately from `stroke/strong`** | `#767676` both modes | `stroke/strong` measured **2.87:1** on `bg/layer` in Dark, below the 3:1 graphic floor — and a border is the only thing signalling an unchecked control exists. |
| **Progress fills are proportional, not fixed-pixel** | `layoutGrow` ratio | A fixed 144 px fill inside a 240 px track silently displayed **30%** when the track stretched to 480. Check anything that claims a proportion. |
| **0% progress renders the track, not a sliver** | fill node hidden | A 1 px sliver reads as "barely started" rather than "not started". |
| **Overlays are separated by elevation, not by surface value** | `elevation/8` menu, `elevation/16` modal | `bg/overlay` ties to `bg/layer` in Light and to `bg/layer-selected` in Dark. **This is a non-defect — never "fix" it.** Every attempt to break the tie by moving the token created a worse collision elsewhere. A menu without its shadow is a bug; a menu whose surface equals the layer beneath it is not. |
| **Width is part of a modal's type, not a grid decision** | 400 / 560 / 720 | 400 for a question; 560 because 400 truncates a 40-character collection name; 720 because a list must show a collection name *and* its record count. Widening a Confirm to match a Choose only pads the question with air. |

---

## The alpha rule

**Any fill that must stay visible on a surface it does not control is alpha, not an opaque rung.**

This started as three anecdotes and is now a settled rule with five consumers. Each one was created
only after an opaque value had already been measured and failed:

| Token | Modes | The failure that created it |
|---|---|---|
| `bg/chip` | Dark `alpha/white-08` · Light `alpha/black-06` | `bg/subtle` and `bg/layer-hover` are both `#292929` in Dark, so a chip plate on a hovered card measured **1.00:1** and vanished. Worse — every badge specimen on the Badges page sits on a `bg/subtle` host, so **the plates had never rendered at all, in either mode, on the shipped documentation.** |
| `stroke/divider` Light | `alpha/black-06` | Had been flattened to opaque `#f0f0f0` = `bg/canvas`. Card hairlines had never rendered on the page surface in Light. |
| `stroke/subtle` Light | `alpha/black-08` | Same collision, same mode. |
| `bg/nav-hover` | Dark `alpha/white-08` · Light `alpha/black-06` | An opaque hover fill measured **1.00:1** against `bg/nav` in Light — the hovered nav item was completely invisible. **`bg/layer-hover` must never be used on the rail**; it is the same hex as `bg/nav` in Light. |
| `bg/overlay-hover` | Dark `alpha/white-08` · Light `alpha/black-06` | **`bg/layer-hover` is *darker* than `bg/overlay` in Dark** (`#292929` on `#333333`), so reusing it would have made the hovered menu item go backwards. |

**Root cause of all five: the Light neutral ramp has six usable rungs for twelve surface-and-stroke
roles.** Shuffling opaque values only moves the collision — that was confirmed the hard way by
trying it twice, each retarget fixing one pair and creating another. Dark had already solved the
problem: its strokes are alpha. Light had flattened them to opaque grey, and *that* was the defect.

An opaque plate can always collide with some future surface. An alpha plate composites off whatever
it lands on and structurally cannot.

**Ask it of every hover, plate and divider before picking a value:** what surfaces will this land
on, and does it survive all of them?

**And measure a new rung against its host before creating it.** A `grey/92` `#ebebeb` was created
for the Light selected surface, then measured **1.05:1 against canvas** — the narrowest gap on the
ramp, effectively invisible — and deleted.

---

## Surfaces that tie — verified non-defects

Recorded because each looks like a bug to a fresh reader. **Do not re-open any of these.**

| Mode | Tie | Why it is fine |
|---|---|---|
| both | `bg/overlay` = `bg/layer-selected` / `bg/layer` | A shadow separates an overlay, not a surface value. |
| Light | `bg/canvas` = `bg/disabled` | A disabled control being flat on the page is the correct semantic. |
| both | `stroke/focus-inner` = `bg/canvas` / `bg/layer` | That *is* its job — it is the gap in a two-tone ring. |
| both | `stroke/control` = `bg/media` | Different roles; they are never adjacent. |
| Light | `bg/layer-hover` = `bg/nav` | A nav rail and a hovered card never touch. |
| Dark | `bg/layer-hover` = `bg/subtle` | The original bug that `bg/chip` already solved. |

---

## Data findings

Measured from the real corpus. Full detail and re-run instructions in `DATA_PIPELINE.md`. These
findings are **the reason** for several UI decisions and must not be designed around optimistically.

| Finding | Measured | UI consequence |
|---|---|---|
| **Storefront distribution** | **Epic Games Store, 100%** | The Stores page must be honest about being single-source. Thirteen store marks exist structurally so a second store is a *data* change, not a design change. Do not design multi-store comparison as a headline. |
| **Playtime** | nonzero on **4 of 226** — 98.2% zero or null | Playtime can never be a primary sort, a chart axis, or a dashboard headline. "Never played" is the dominant state and gets its own icon (`45:82`) and empty-state treatment. |
| **Enrichment** | **94 unenriched (41.6%)** | Every card and row needs a designed *unenriched* state. Grid views must not assume box art exists. |
| **Completion** | **No completion field exists at all.** | Never design achievement rings, completion percentages, or "% finished". |
| **Confidence** | present on **100%** of rows — Medium 161 · High 63 · Low 2 | Drives the `confidence/*` family, the 3-pip indicator and the Data & Provenance page. **There is no "none" bucket** — do not design a legend, filter or chart segment for one. |
| **Accounts** | A 51 · B 175 | **NO MERGING.** Two accounts are never one list. 6 titles appear on both. |
| **Sparse fields** | `tags` / `themes` / `franchise` / `steamDeck` all **0%** | There is nothing to segment by. Detail panels are progressive — present fields render, absent fields are omitted rather than shown empty. |
| **Ownership model** | the only universally reliable fact | Ownership — not engagement — is the spine of the information architecture. |

**Design rule derived from the above:** the Dashboard's headline metrics must be ownership- and
enrichment-derived (total owned, unenriched count, confidence distribution, never-played count).
They must **not** be playtime- or completion-derived.

> ⚠ **Three different library sizes are currently shipped in one file** — 226 (measured), 1,247
> (fabricated, Metric Card) and 20,400 (originated in prose, never measured). This is `TODO.md`
> **B1** and **B2**. B2 is a **user decision** because it changes copy on seven shipped, verified
> doc pages. B1 is a defect regardless of how B2 lands.

---

## Foundations — pointers, not copies

| What | Where it lives |
|---|---|
| Every token name, value and measured contrast ratio | `CLAUDE.md` → *Variables* |
| Collection counts and modes | `CLAUDE.md` → *Variables* |
| Dimension / spacing values | `CLAUDE.md` → *Dimension & spacing* |
| Text styles | `CLAUDE.md` → *Text styles* |
| Page map and node ids | `CLAUDE.md` → *Page map* |
| Component sets, variants and properties | `CLAUDE.md` → *Components built* |
| Icon component ids | `CLAUDE.md` → *Icon component ids* |

Two token *rules* that are reasoning rather than data, so they live here:

- **Primitives carry `scopes = []` deliberately.** They are hidden from the property picker so that
  a designer consuming the library can only reach semantics. This is not a bug and must not be
  "fixed". Semantics carry real scopes — `FRAME_FILL` / `SHAPE_FILL`, `TEXT_FILL`, `STROKE_COLOR`,
  `GAP`, `CORNER_RADIUS`.
- **Every variable carries code syntax on all three platforms, and the three treat `/` differently.**
  This keeps biting. Derived from the file's own majority, not assumed:

  | Platform | Rule | `bg/canvas` | `status/danger-fg-strong` |
  |---|---|---|---|
  | WEB | every separator → `-` | `var(--color-bg-canvas)` | `var(--color-status-danger-fg-strong)` |
  | ANDROID | `color` + camel on **both** `/` and `-` | `colorbgCanvas` | `colorstatusDangerFgStrong` |
  | iOS | `Color.` + camel on **`-` only**; `/` joins flat | `Color.bgcanvas` | `Color.statusdangerFgStrong` |

  ANDROID capitalizes across `/`; iOS does **not**. Both look like typos and neither is. A "correct"
  generator written from intuition produced a wall of false positives twice — 58/58 the second time.
  **The file is the spec. Re-derive from it before flagging anything.**

### Effect styles

Five, and they are the only elevation vocabulary: `elevation/2` `elevation/4` `elevation/8`
`elevation/16` `elevation/28`. Each is a **two-layer drop shadow** — an ambient layer
(`shadow/ambient`, α .30) plus a key layer (`shadow/key`, α .50) whose blur and y-offset scale with
the name: **2/1, 4/2, 8/4, 16/8, 28/14**. Both layers' colours are variable-bound.

`elevation/8` is the floating-surface step (Context Menu). `elevation/16` is the highest step used
anywhere and belongs to Modal alone — a modal outranks every other floating surface because nothing
above it may be interacted with.

> ⚠ **`viz/rank-1..6` and `viz/track` already exist and have never been consumed.** Charts `10:30`
> must use them rather than inventing a palette.

---

## Build conventions

### Documentation page pattern

Read from the Buttons doc (`98:2`) and reused verbatim by every subsequent doc page. **Read it off
the live file rather than from memory — this block is a summary, `98:2` is the spec.**

```
Root  VERTICAL, 1560 wide, fills bg/canvas, pad 32, gap 32
├── Header          gap 8  → page-title + body description
├── Section — X     gap 16
│   ├── Head        gap 4  → title (fg/primary) + body (fg/secondary)
│   └── Body        pad 24, gap 16, fills bg/subtle, radius/large
├── Section — In use        a realistic composition, not a swatch grid
└── Section — Rules        two columns: Always / Never
```

Doc pages are rebuilt **idempotently** — find the previous root by name and `.remove()` it first.

**Rules columns use ellipse bullets. There are no icons.** An earlier revision of this file claimed
Always used icon `45:46` and Never used `45:35`; that was wrong and every shipped page disproves it.
The real pattern: `status/success-bg` + `status/success-fg` for Always, `status/danger-bg` +
`status/danger-fg` for Never; the column heading is `body-strong` in the tone's `-fg`; each rule is
an Item row with a 6 × 20 FIXED Bullet frame (HORIZONTAL, CENTER/CENTER) holding a 4 × 4 ELLIPSE
filled with the tone's `-fg`, then `caption` text at FILL.

**Rule text is `fg/secondary`, not the tone colour.** Measured: `fg/secondary` reaches
11.35 / 11.93 Dark and 9.42 / 9.24 Light on the two tinted panels, where the tone `-fg` on its own
tint only reaches 7.70 / 6.20 Dark and 5.03 / 4.53 Light.

### Focus ring convention — TWO rings, not one

**Read this before building any focusable component.** It was never recorded once and got rebuilt
wrong. Verified live across Checkbox, Radio, Select, Text Input and Filter Chip — all agree.

```
Two absolutely-positioned RECTANGLE siblings, no fills, inside the Focus variant.
Child order: inner first (beneath), outer last (on top).

Focus ring inner:  x/y = -1    size = body + 2   strokeWeight 1  →  stroke/focus-inner
Focus ring outer:  x/y = -3    size = body + 6   strokeWeight 2  →  stroke/focus-outer
both:              strokeAlign        = 'INSIDE'
                   layoutPositioning  = 'ABSOLUTE'   ← set BEFORE resize()
                   cornerRadius: inner = body + 1, outer = body + 3   (UNBOUND — plain numbers)
```

- `stroke/focus-outer` is white in Dark / near-black in Light; `stroke/focus-inner` is the inverse.
  The pair reads on any surface — that is the whole point of the two-ring design.
- **Radii are deliberately unbound.** They are body-radius ± a fixed offset, not a semantic step on
  the radius ladder. **Do not create a radius token to hold a ring radius** — a `radius/xxlarge`
  (10 px) was created for exactly that and had to be deleted.
- The rings extend outside the variant bounds, so the **component set must have
  `clipsContent = false`** or they render as nothing while every property check passes.
- Set the paint's literal colour **and** bind the variable. Binding alone leaves a black literal
  that renders wherever the binding is dropped.

**Draw the ring `OUTSIDE` for anything that sits in a stack** — rows, menu items, page buttons. With
`INSIDE` on a 960 px row the ring landed exactly on the row edge and was indistinguishable from the
divider, so Focus rendered as if it were Rest. **Verify a focus ring in a stack, never against a
single specimen.**

### Specimen strips

Captions must share a baseline across cells whose specimens differ in height. This was a real bug
twice. The pattern:

```js
cell   VERTICAL, FIXED width, HUG height, gap 8, clipsContent = false
├── Holder  FIXED w × FIXED h, counterAxisAlignItems CENTER, clipsContent = false
│   └── instance
└── Caption micro / fg/quaternary, FILL
```

**Size the Holder to the specimen's real measured height.** A specimen taller than its holder does
not clip — with `clipsContent = false` it centres at a negative `y`, gets cut at the top *and*
overlaps the next cell, while the neighbouring caption truncates. A 720 px Sidebar in a 420 px
holder took two screenshots to read correctly.

### Component sets

- **A set frame does not re-fit when a variant's height changes.** Audit
  `max(child.y + child.height)` against `frame.height` after any variant resize. The Empty State set
  silently overflowed itself by 20 px this way.
- Absolute-grid padding convention: **24** for badge-scale sets, **32** for mid sets, **48** for
  large ones. Relay out on explicit PAD/GAP with per-row height = `max(rowVariants)`, then
  `resizeWithoutConstraints`.
- **A single-column VERTICAL variant strip is normal here.** Checkbox, Radio, Switch, Select, Filter
  Chip, Progress Bar, Progress Ring and Avatar are all single-column. Only Badge, Confidence Badge
  and Button are absolute-positioned grids. The skill prefers grids; **the file convention wins.**
- **A container variant must ship every child at rest.** The Context Menu's Compact variant shipped
  with its second item baked as `State=Hover`, so every instance would have shown a phantom hover
  plate. A geometry read-back cannot see this — the structure is valid, only a nested instance's
  variant *value* is wrong.

### Variable mode pins

**A pin belongs on a documentation FRAME, never on a component, a variant, or an instance.**

`createInstance()` copies the source component's `explicitVariableModes`, so a pinned component
permanently freezes every instance it ever produces, regardless of the page it lands on. 89 such
pins were swept on 2026-08-03; **110 remain and must stay** — they are doc frames, and the Color and
Elevation pages need theirs to show both modes side by side.

Always `clearExplicitVariableModeForCollection` after a Light screenshot. Audit before trusting any
Light render:

```js
const color = (await figma.variables.getLocalVariableCollectionsAsync()).find(c => c.name === 'Color');
// walk every page; flag any COMPONENT / COMPONENT_SET / INSTANCE carrying explicitVariableModes[color.id]
```

### Node tagging

Every created scene node is tagged. `getPluginData` / `setPluginData` are **not supported** — shared
plugin data only.

```js
node.setSharedPluginData('dsb', 'run_id', RUN_ID);   // 'gameid-ds-2026-07-31'
node.setSharedPluginData('dsb', 'phase', 'phase3');
node.setSharedPluginData('dsb', 'key', 'component/loading-skeleton');
```

### Copy voice

Documentation prose is **declarative and reason-giving, never marketing.** It states what a thing
is, what decides which variant to use, and what the tradeoff was. Where a choice was contested, the
doc says so and cites the measurement.

Rules are written to be **enforceable in review** — "One Primary per view", not "use Primary
sparingly". Every page ends with Always / Never columns in that register.

**Never let copy over-promise what the measurement supports.** A Confidence Badge note once claimed
the badge "still reads in a greyscale export" while the tightest filled-vs-unfilled pip pair
measured **1.34:1** — in greyscale the pips are one tone. Scope the claim to what actually survives
(the level *word*) and state the dependency as a rule (never ship the pips without the word).
**If copy makes a claim, measure that exact claim.**

---

## The recurring defect shapes

Worth knowing because they recur in every component still to build.

1. **Dual-role tokens.** A token backing both text and shapes is constrained from both sides. Audit
   usage — separating text consumers from shape consumers — *before* retargeting.
2. **A surface ladder that collapses in one mode.** Fix the surface first, then the text.
3. **A plate that is the same colour as a state it has to survive.** The fix is an *alpha* plate,
   not a different opaque rung.
4. **A caption documenting a measurement goes stale when the token moves.** Compute the ratio in the
   *same script* that writes the sentence. Never hardcode a number into copy.
5. **Copy that over-promises what the measurement supports.** Measure the exact claim.
6. **Fixed pixels where a ratio belongs.** Check anything that claims a proportion.
7. **A state change that resizes the control.** The bar, menu, chip row or pagination run reflows.
8. **Alpha-bearing tokens break naive contrast maths.** `stroke/divider` resolves to `#ffffff` but
   is 6% white. A resolver that ignores alpha reports a blazing white line that isn't there.
9. **Ragged caption baselines** whenever specimens of differing heights sit in a top-aligned strip.
10. **Icons live on `10:12`, not on the Iconography page `10:9`.** A page-level scan of `10:9`
    returns zero components and looks alarming.
11. **A component set's own frame is not a host surface.** A set carries no fill, so alpha plates
    composite against nothing and the screenshot renders washed out. Verify alpha-bearing components
    in **real usage** — a card, a doc panel, an `In use` stage — never against the set.
12. **A specimen taller than its holder bleeds instead of clipping**, overrunning its neighbours.
13. ~~**Downscaled screenshots make small dark text look like a contrast failure.**~~ **Retracted —
    see #14.** It claimed a Sort button only *looked* washed out in Light and measured a safe 8.82:1.
    The button was genuinely broken at **1.28:1**; 8.82 is what you get resolving the *token* instead
    of the *node*. The salvageable half: downscaling is real, so raise `maxDimension` rather than
    squinting. But **never let "it's probably the render" close an observation.**
14. **An explicit variable-mode pin on a component silently freezes every instance ever made from
    it.** See *Variable mode pins* above.
15. **A state baked into a container variant.** Check nested instance *variant values*, not just the
    container's own props.
16. **A convention re-derived from intuition instead of from the file.** Twice a "correct" generator
    produced a wall of false positives. **When an audit says everything is wrong, suspect the audit.**
    Derive the rule from the file's own majority first, then flag the minority.
17. **An instance carries its origin's content, and the origin was written for somewhere else.** The
    Modal's Form variant shipped with the Top Bar's placeholder — a "new collection" dialog asking
    the reader to search. Game Card / Row inherited a `Show icon` boolean that widened its chip
    80 → 96. **Retarget every string and every boolean on a reused instance, not just the ones the
    variant adds.**

---

## Figma Plugin API quirks

| Quirk | Handling |
|---|---|
| `console.log()` is invisible | `return` is the **only** output channel. |
| `figma.notify()` throws | Never use it. |
| `getPluginData` / `setPluginData` unsupported | Use `getSharedPluginData` / `setSharedPluginData`. |
| Colours are 0–1, not 0–255 | Always normalise. |
| Font style is `"Semi Bold"` | `"SemiBold"` fails to load. |
| Existing text may have `figma.mixed` fonts | Iterate `getRangeFontName(i, i+1)` per character before mutating. |
| `figma.currentPage = page` throws | `await figma.setCurrentPageAsync(page)`, **at most once per script**. |
| Page context resets between calls | `figma.currentPage` starts on the first page every time. |
| Failed scripts are **atomic** | Nothing mutates on a throw, so a retry after a fix is safe. |
| `swapComponentAsync` does not exist | Use synchronous `instance.swapComponent(target)`. |
| **`INSTANCE_SWAP` values are node ids** | `comp.id`, never `comp.key`. Confirmed three times. But `preferredValues` entries *do* use `{type:'COMPONENT', key: comp.key}`. |
| **Applying an `INSTANCE_SWAP` resets every nested override in that slot** | Including variable bindings — the slot's subtree is re-instantiated from the new main. **Re-bind the slot's children after every swap.** And do not audit the *component* to conclude the *instances* are fine. |
| An `INSTANCE_SWAP` property on a set carries **one shared default across all variants** | Per-variant icon defaults are impossible. |
| A set-level **TEXT** property forces one shared default too | Adding `Title` / `Description` to Section Header silently collapsed all six variants to the same copy. Per-variant copy is the right model; instance text stays editable. Clear `componentPropertyReferences` on consuming nodes before `deleteComponentProperty`, or deletion is refused. |
| **Component property keys carry a live id suffix** | `Show count#287:14`, not `#287:15`. Read `inst.componentProperties` (or the set's `componentPropertyDefinitions`) and use the keys **verbatim**. A wrong key is a **silent no-op** — it does not throw. |
| **The Spacing collection uses BARE names** | `XXS`…`6XL`. There is no `spacing/` prefix; Dimension *is* prefixed, which is what makes the mistake easy. `V['spacing/L']` is `undefined` and `setBoundVariable` then **fails silently**. Repair by sweeping on **value**: build `SP[resolvedNumber] = variable`, rebind matching raw numbers on `itemSpacing` / `padding*` / `counterAxisSpacing`. Skip `INSTANCE` nodes. |
| `setBoundVariableForPaint` returns a **NEW** paint | Capture and reassign — mutating in place silently does nothing. |
| A bound paint still carries a literal colour | Set the literal to the token's real value **as well as** binding it, or the node reads black wherever the binding is dropped. |
| **Append the child before setting HUG/FILL or resizing** | Order matters. `HUG`/`FILL` are rejected on unparented nodes. |
| `layoutSizing*` vs `*AxisSizingMode` | Child: `FIXED|HUG|FILL`. Frame: `FIXED|AUTO`. Never cross them. |
| `layoutSizingVertical = 'HUG'` must be explicit | Otherwise a frame keeps its default height — this put Buttons appearance rows at 100 px instead of 32. Any `section()` helper must set it or content clips. |
| **`figma.createAutoLayout()` ships a white fill** | Every container needs `fills = []` or an explicit token, or you get a white sheet over the page. |
| `combineAsVariants` stacks variants at (0,0) | Set `layoutMode`, spacing, padding and sizing modes on the set afterwards. |
| **A set clips overflowing children by default** | `clipsContent` defaults to `true`. Focus rings are the usual casualty. |
| **Never assume node type before a type-specific call** | `findAll` exists on containers, not on TEXT. Use a recursive `walk` inspecting `n.type` / `n.children`. |
| **Read `boundVariables` array-aware on TEXT nodes** | `boundVariables.fontSize` is `[{type:'VARIABLE_ALIAS', id}]`, not a bare object. A naive `bv.fontSize.id` check reports every correctly-bound node as `RAW`. Same trap as `fontFamily`. |
| Alias resolvers must be null-guarded | `return (val && val.r !== undefined) ? val : null;` or luminance throws. |
| **Alias resolvers must capture alpha** | Reading only `{r,g,b}` makes `alpha/white-06` look like opaque `#ffffff` at 16.48:1. Capture `val.a`; report `opaque: (val.a === undefined || val.a === 1)`. |
| Cross-collection aliasing | A 2-mode semantic can alias a 1-mode primitive. Fall back to `col.modes[0].modeId` when `valuesByMode[modeId]` is undefined. |
| `setVariableCodeSyntax(platform, value)` works | Platforms `'WEB' | 'ANDROID' | 'iOS'`. `variable.codeSyntax` reads back as a plain object. Building a sibling's syntax by string replacement is fragile — `'high'`→`'empty'` mangled `colorConfidenceHigh` into `colorconfidenceEmpty`. Verify casing after. |
| `Variable.remove()` is the deletion API | There is no `figma.variables.removeVariable()`. Verify the new total in the same script. |
| `node.setExplicitVariableModeForCollection(collection, modeId)` | Takes the **collection object** (the id-string overload also works). Always clear it afterwards. |
| **New icon glyphs default to `constraints: MIN/MIN`** | Every existing icon uses `SCALE/SCALE`. A `MIN` glyph does not resize with its instance. Copy a peer's constraints, then re-`resize()` existing instances to force re-evaluation. |
| **`outlineStroke()` inserts a sibling; the source survives** | Append the result and `remove()` the source, or you ship two overlapping shapes. |
| **A component can end up structurally empty after cell surgery** | `findOne(n => n.type === 'VECTOR')` returning `null` is the tell. **Assert `comp.children.length` after any move/clone/remove on component internals.** |
| Mutation ordering matters | Clone a node *before* syncing the source's text, or the clone inherits the new string and the subsequent `find(oldString)` misses. |

---

## MCP quirks

| Quirk | Handling |
|---|---|
| **`fileKey` is required on every call** | Omitting it → `MCP error -32602: Tool argument fileKey is required`. |
| **`skillNames` must carry both skills** | Pass `"figma-use,figma-generate-library"` on every `use_figma` call. |
| Correct tool namespace | `mcp__plugin_figma_figma__use_figma`. |
| **Never parallelise `use_figma` writes** | Mutations are strictly sequential even when the harness supports concurrency. Read-only calls can safely run alongside screenshots. |
| Screenshot asset URLs are short-lived secrets | Use once for `curl`; never persist or publish them. |
| **`/tmp/x.png` is not readable directly on this machine** | `curl -sL -o /tmp/x.png "<url>"` then `Read` at `C:\Users\Sufiyan\AppData\Local\Temp\x.png`. |
| Screenshots can be stale | After a fix, re-render before judging. A stale read once produced a false bug report. |
| Downscaling is real | Raise `maxDimension` rather than squinting — but see recurring shape #13: never let "it's probably the render" close an observation. |
| **A lost tool result ≠ a failed write** | `[Tool result missing due to internal error]` is a **transport** failure; the mutation may well have landed. It did, on page `10:17`. **Read state back before retrying — a blind retry can double-apply.** |

---

## Verification loop — do not skip this

```
get_screenshot(nodeId) → curl -sL -o /tmp/<n>.png "<url>" → Read the PNG and actually look
```

**A structural read-back is not verification.** A geometry check once reported the Badges footer
notes as "no clipping — pass" while they were rendering at **1.97:1** and were effectively
illegible. Properties prove what you *set*; only measured contrast plus looking at the image proves
what *renders*.

**Corollary — identical contrast ratios against two different surfaces is a collision tell.** When
all seven `fg/*` tokens returned the same number on canvas and on subtle in Light, that meant the
two surfaces resolved to the same hex, not that the maths was wrong.

**Resolve the node, not the token.** A token resolves to what it *should* be. A node renders what it
*is*, and a mode pin or a dropped binding can make those differ by an order of magnitude.

---

## Resume instructions

### 0. Preconditions

- Read **`HANDOFF.md` first** — it is the zero-context entry point and holds the exact next steps.
- Confirm the `plugin:figma:figma` MCP server is connected and the file key
  **`00QEeirxnqT4Zg829aeDVZ`** opens.
- Every `use_figma` call needs `fileKey` **and** `skillNames: "figma-use,figma-generate-library"`.
- `RUN_ID = 'gameid-ds-2026-07-31'` — tag every created scene node (see *Node tagging*).
- **There is no on-disk state ledger.** The `figma-generate-library` skill recommends
  `/tmp/dsb-state-{RUN_ID}.json`; it was never written. State is reconstructed each session by a
  read-only Figma audit, which has worked reliably. `CLAUDE.md` plus `HANDOFF.md` are the substitute.

### 1. Audit before building

**Read the target page before building on it.** The page map has been wrong twice — it listed the
Rules columns as using icons when every shipped page uses ellipse bullets, and it listed Metric Card
`10:19` as empty when the page already held a component set and a full doc page.

**An "empty" marker is the dangerous one:** acting on it means rebuilding over finished work.

The audit pattern that works: list pages, then walk the target page collecting `type`, `name`, `id`,
size, layout mode and bound variables, and return a compact summary.

### 2. What NOT to redo

Do not rebuild, re-audit or "improve" any of these. They are complete and verified in both modes:

- All 7 variable collections, every variable, every scope and every code syntax entry.
- All 10 text styles and all 5 effect styles.
- Every foundations page (`10:4`–`10:10`) and the Cover / Getting Started pages.
- Every icon component on `10:12`.
- Every component listed as done in `CLAUDE.md`'s page map and components table.
- The doc-page layout convention. **Read it from `98:2` and match it — do not design a new one.**
- Every architecture decision in this document.
- Every colour value in the ladder. These were **measured**, not chosen.
- Everything in `TODO.md` §E — *Closed, do not re-open*.

### 3. Where to resume

`HANDOFF.md` §9 and `TODO.md` §A2. At the time of writing: **build Charts on `10:30`**, which
closes P3.5. It must consume the existing `viz/rank-1..6` and `viz/track` tokens, and the corpus
decides what is chartable — read `DATA_PIPELINE.md` first.

### 4. Unsafe assumptions — verify before relying on

- **Any node id not read from a live query.** Never reconstruct an id from memory.
- **That a component's variant count matches a document** if the file was edited outside these
  sessions. Spot-check before extending a set.
- **That a token you want does not already exist.** The record has drifted before. Enumerate first —
  and confirm `viz/rank-1..6` / `viz/track` before designing any chart.
- **That a Light screenshot is trustworthy** until the mode-pin audit has run.
- **That a page marked empty is empty.**

### 5. Working rules in force

- **Implementation gate:** no HTML / CSS / JS / React / Vue for Game ID until the user explicitly
  approves the design. The legacy `app/` is not an exception.
- **Never invent a token.** Create the named, scoped variable first, then consume it. Fixed
  component geometry is the one exception.
- **Refine, do not reinvent.** Layout is settled architecture.
- **The data decides the hierarchy.** No playtime or completion metrics as structure.
- **Measure and write in one call.** Never document a ratio you did not compute in the same script.
- **Fix at the token layer, not the page** — everything built afterwards inherits the fix.
- **Verify visually before claiming done.**
- **Before building any state that already exists elsewhere, probe two or three shipped components
  for the convention.** The two-ring focus treatment was on five components and in none of the notes.
- **Keep the documents in sync in the same session as the change.** Any variable-collection change
  implies a Cover `35:17` rewrite. Any component closeout implies a `CLAUDE.md` page-map row, a
  components-table row, a closeout section, a `TODO.md` update and a `CHANGELOG.md` entry.

---

## Session-start verification sweep

Run this **read-only** before mutating anything.

```
[ ] MCP server plugin:figma:figma connected; file 00QEeirxnqT4Zg829aeDVZ opens
[ ] HANDOFF.md read; TODO.md §A read

[ ] Collections: 7 — Primitives, Color, Spacing, Dimension, Type Primitives, Type, Motion
    Counts match CLAUDE.md → Variables. If they do not, CLAUDE.md is the defect — fix it,
    and rewrite Cover 35:17 in the same session.
[ ] Color collection has 2 modes: Dark 2:1, Light 2:7
[ ] ENUMERATE the live token list before creating any token
[ ] Spot-check scopes: primitives [] (deliberate), semantics real
[ ] Spot-check codeSyntax against the three-platform rule above — derive from the file's majority

[ ] Text styles 10 · effect styles 5 (elevation/2 /4 /8 /16 /28) · paint styles 0
[ ] Pages 44; ids match CLAUDE.md → Page map

[ ] Mode-pin audit: zero explicitVariableModes on any COMPONENT / COMPONENT_SET / INSTANCE.
    Doc FRAMEs may and should carry them.
[ ] Target page walked and confirmed to match its page-map row BEFORE building

[ ] Doc-page convention re-read from 98:2, not from memory
```
