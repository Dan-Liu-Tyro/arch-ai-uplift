# kg-viz

A read-only, browser-based view of the knowledge graph in `kg-content`, for
human inspection — not a consumer that reasons about the graph, just a way to
look at it.

**The form has to earn its place.** The first pass was a single 3D
force-directed graph, and the user's verdict was that "3D should fit the
purpose of usefulness. Not just fancy." So the default is now a **2D plane**,
3D is a toggle rather than the entry point, and the component carries two
separate views because one canvas could not serve both questions (decision 35
in `docs/decision-log.md`).

## The two views

| View | Shape | Layout | What it answers |
| --- | --- | --- | --- |
| `payments-target-state` (**default**) | 26 nodes, 43 directed edges, 36 distinct predicates | Swimlanes: lane = stage, column = flow depth within the stage | How does a payment actually flow, and what does each hop carry? |
| `domain-authority` | 40 nodes, 296 edges, one predicate | 2D/3D force | Which domains disclaim authority to which others? |

They are deliberately not drawn together. `domain-authority` averages degree
~15 over 39 domains and renders as a hairball — it is only readable once you
switch groups off, which is why the group toggles exist. The flow view is
sparse and reads in order.

## Files, and what each is responsible for

5 files, 5 of them tracked. Nothing else belongs in this directory.

| File | Responsibility | Who writes it |
| --- | --- | --- |
| `generate.py` | **The only executable.** Reads `kg-content`, resolves the overlay's `domain_ref`s against `domains.json`, computes the swimlane layout (feedback-arc detection, then longest-path depth within each stage), and writes `graph.json`. The single place any derivation happens. | a human, by hand |
| `index.html` | **The entire viewer**, in one self-contained file: markup, CSS, and all loading/view/filter/label/selection behaviour. Derives nothing from `kg-content`; renders whatever graph file it is given. Opened directly from disk. | a human, by hand |
| `graph.json` | **The generated graph.** Both views, their nodes, typed edges, computed layout coordinates, and per-view stats. This is the default file to open, and the only output of `generate.py`. **Never hand-edit; it is overwritten on every run.** | `generate.py` |
| `verify.js` | **The checks behind this component's claims.** Runs `index.html`'s own JavaScript against the real `graph.json` under a stubbed DOM and asserts what can be asserted without pixels: empty start, load-by-file with validation, reopening, camera fit arithmetic, label non-overlap, and the offline invariants. Plain `node`, no dependencies. `node verify.js`. | a human, by hand |
| `vendor/3d-force-graph.min.js` | The renderer, committed so a clone works with no network (decision 38). Third-party minified build; provenance recorded in `vendor/README.md`. | fetched once, then committed |
| `README.md` | This file: the component's contract. | a human, by hand |
| `vendor/README.md` | How and why to place a local copy of `3d-force-graph` here when the CDN is unreachable. The `.js` file it describes is gitignored. | a human, by hand |

Deleted and not coming back: `serve.py` and `graph.sh` (decision 36 — this
component has no server), and `graph-data.js` (decision 37 — a bundled data
blob that existed only to let the page auto-load, which it no longer does).

### Verifying a change

```bash
cd components/kg-viz && node verify.js
```

Eight scenarios, exit non-zero on failure. This is the only automated check
in the repo, and it exists because **nothing this component renders can be
observed from a Claude Code session** — see `docs/decision-log.md`'s
"Constraints identified". It is a floor, not a substitute for opening the
page: it cannot judge legibility, colour or layout quality, only that the
things it asserts have not broken.

## Boundary

**In scope**

- Generating `graph.json` from whatever currently exists in `kg-content`
  (`generate.py`), as one file containing both views.
- A static, self-contained `index.html` that renders it, opened directly
  from disk. No server, by decision 36 — see "Opening it".
- Reading `domain`'s structured `not_authoritative_for` relationships
  directly from `kg-content/entities/domains.json` and rendering them as
  edges. (First pass derived edges by fuzzy-matching prose; retired once
  `domain` got real relationships — see "How the edges are derived", below,
  and `docs/domain-model-experiment.md`'s "Pivot" section for why.)
- Computing *layout only* — swimlane assignment and feedback-arc detection —
  from the relationships the content already declares. Layout is presentation,
  so it belongs here; the relationships themselves are content and do not.

**Out of scope**

- Writing anything back into `kg-content`. Derived edges live only in
  `graph.json`, which is a disposable, regenerable build artifact — never
  hand-edit it.
- Any real graph traversal or query logic — that belongs in `kg-core`, once
  it has one. This component does the minimum parsing needed to draw a
  picture, not a general-purpose reader.
- Confluence, Rovo, or Claude Code integration.

## Depends on

Two different ways, per entity type: `domain` reads
`kg-content/entities/domains.json` directly (structured JSON, matching
`kg-core/schemas/domain.schema.json`); every other entity type (just the one
`principle` today) is still read via frontmatter-and-body regex parsing, the
same workaround `components/local-agent/ui/server.py` already uses, because
`kg-core` has no implemented query/traversal code yet to depend on instead.
Revisit the regex path once `kg-core` has one; reading entities directly
like this is meant to be temporary for the file-per-entity types, not a
second permanently-diverging access path. `domain`'s own path doesn't have
that problem — `domains.json` already *is* the structured shape, per its
own scoped exception in `kg-core/SCHEMA.md`.

Also reads `kg-content/entities/graphs/*.json` (today just
`payments-target-state.json`) for overlay graphs. Those files reference
domains by `domain_ref` rather than restating them, so this component
resolves each ref against `domains.json` and reports any that no longer
resolve as `stats.unresolved_domain_refs` instead of silently dropping the
node.

## Depended on by

Nothing yet. Purely a human-facing inspection tool today.

## How the edges are derived

`domain`'s cross-domain relationships (`not_authoritative_for`) are read
directly from `domains.json` — no inference. A reference that couldn't be
confidently resolved to a real domain id at ingestion time (see
`docs/domain-model-experiment.md`'s "Pivot" section for the resolution
method and its evidence) carries `target_unresolved` instead of `target`;
`generate.py` surfaces those as `graph.json`'s `stats.unresolved_references`
rather than dropping them, and the UI shows that count directly rather than
hiding it — so the tool stays honest about what fraction of the graph's real
cross-domain structure the source ingestion could actually resolve.

**This changed from the first pass.** `generate.py` originally derived
edges itself, by fuzzy-matching "X → Some Other Domain" prose inside each
domain's lean `## Authority` text against known domain titles. That
approach is retired: relationships are first-class structured data in
`domains.json` now, resolved once at ingestion against the full source
rather than inferred every time this script runs — `generate.py` no longer
does any string matching at all.

### The flow view's edges are real, the authority view's descriptions are not

`payments-target-state.json` carries a `predicate` and a `payload` on every
edge, so the detail panel quotes what an edge actually means and what data
crosses it. `not_authoritative_for` edges have no such prose: ingestion kept
only the resolved target id, and the phrase that produced each edge was
dropped. Their descriptions are therefore **generated from the predicate**,
stating the direction and that it is a negative assertion, rather than quoted
from the source. Re-deriving them by matching prose is exactly the retired
fuzzy-matching pass and should not be reintroduced; carrying the phrase
through ingestion is the real fix. See "Known gaps".

## What the UI does

- **View switch** — flow (default) or authority.
- **2D / 3D** — 2D is the default. 3D is genuinely useful on the dense
  authority graph, where a third dimension reduces occlusion; it adds little
  to the flow view, which is a plane by construction.
- **Group show/hide** — checkboxes per stage (flow) or per domain category
  (authority), with live counts. Hiding a group drops its nodes *and* every
  edge touching them, so no dangling edges are drawn.
- **Scope emphasis** — All / Acquirer / Tyro-wide. **Dims, never hides**, per
  decision 35: a domain filtered out of an acquiring view is often the
  boundary you are trying to see.
- **Click a node** — highlights it and everything linked to it, dims the
  rest, and opens a panel listing every inbound and outbound relationship
  with its predicate, payload, and whether it is a feedback arc.
- **Edge labels on the lines** — the predicate at each edge midpoint, with a
  backing so it stays readable where it crosses the line. **Opt-in, off by
  default in both views**: 43 of them crowd the flow view and 296 make the
  authority view unreadable. With a node selected, only that node's edges are
  labelled.
- **No label ever overlaps another label or a node.** Placement is greedy with
  collision suppression — node markers are reserved first, then node labels,
  then edge labels fill whatever room is left; anything that would collide is
  hidden rather than drawn on top. Text that overlaps other text is worse than
  absent text, and a suppressed label is still reachable by hover or by
  selecting the node.
- **Direction as motion** — a slow stream of particles runs source → target on
  every flow edge, so direction reads without tracing an arrowhead. Flow view
  only; 296 animated edges would be visual noise and the authority predicate
  is not directional in a way worth animating.
- **Feedback arcs** drawn dashed/curved, in a contrasting colour for both the
  line and its particles, and counted in the stats box.
- **Fills the viewport.** For the layered view the camera is computed directly
  from the node bounding box, the camera's field of view and the container
  size, including a keep-out for the control panel so the graph is centred in
  the space actually visible. `zoomToFit()` was tried twice and abandoned: at
  70px padding and then at 12px it still left the graph occupying roughly a
  quarter of the window, which forced a manual zoom on every open. For a
  pinned planar layout the fit is simple trigonometry, and the arithmetic is
  asserted in the harness (currently 93% of the usable region). The force view
  keeps moving, so it still uses `zoomToFit`.
- **Fit to view** — re-frames the camera. Framing also happens automatically
  on `onEngineStop`, but a manual control matters because a camera pointed
  somewhere empty is indistinguishable from a graph that failed to draw.

## Status

Sixth pass. No build system — plain stdlib Python plus one **locally
vendored** script (`3d-force-graph`), consistent with this repo's "zero new
infra" stance (decision 1). **Offline-only by requirement (decision 38):**
the page loads nothing remote and has no data-egress path of any kind; both
properties are asserted by the harness rather than left to vigilance. The
vendored renderer is committed, which is what makes a fresh clone work with
no network — see `vendor/README.md`, and `docs/backlog.md` for the plan to
drop the dependency entirely. Node labels are plain HTML positioned over the canvas with
`graph2ScreenCoords()`; see `vendor/README.md` for why the `three-spritetext`
dependency was removed rather than vendored. **Edge** labels use the same
overlay, positioned at each edge's midpoint. The viewer is file-driven: it
holds no data of its own and starts empty.

Current content, as reported by `generate.py` rather than asserted here:

- `domain-authority` — 40 nodes (39 domains + the one unconnected `principle`
  entity), 296 resolved edges out of 338 total cross-domain references
  extracted at ingestion, 42 left as `target_unresolved` in `domains.json`
  rather than guessed. See `docs/domain-model-experiment.md`'s "Pivot"
  section for what the unresolved 42 actually are (mostly four single-word
  abbreviations deliberately never auto-resolved, plus generic collective
  phrases, plus one domain name referenced in the source but never defined as
  its own section) — a named, considered set, not parsing failures.
- `payments-target-state` — 26 nodes (17 `domain_ref`, 6 actors, 2 external
  systems, 1 artefact), 43 edges, 36 distinct predicates, 3 lanes, 7 columns
  at the widest lane, 0 unresolved `domain_ref`s, 1 feedback arc.

## Known gaps

- **Partly verified in a real browser, as of 2026-09-22.** The user ran it and
  supplied a screenshot: both control panels populate correctly, the stats box
  reports 26 of 26 nodes and 43 of 43 edges, and the graph draws. Two defects
  that only a browser could surface were found and fixed — `three-spritetext`
  throwing inside the render loop (blank canvas beside a working panel) and
  nodes rendering as near-invisible specks against a 230-unit column spacing.
  Still unconfirmed after those fixes: whether the swimlane layout reads
  correctly, whether labels collide, and camera framing.

  Nothing browser-facing can be checked from the sandbox this is built in.
  It denies socket operations broadly — which is why the server could never
  bind, why `curl http://127.0.0.1` fails with "Operation not permitted",
  and why headless Chrome aborts at startup (it creates a Unix-domain socket
  for its process singleton). Browser automation is also prohibited by
  organisational policy. So the user's eyes are the only observer, and the
  page is built to report its own state.

  What *is* verified mechanically: `generate.py`'s output and layout
  invariants (every forward edge runs left-to-right within its lane, no two
  nodes share a position, no node unranked); both data files against their
  schemas and for referential integrity; and the page's own JavaScript run
  against the real `graph.json` under a stubbed DOM in node — four scenarios
  covering a healthy auto-load, a NaN projection, a blocked library, and the
  file-picker path including malformed and wrong-shape JSON. What none of
  that covers is anything three.js actually draws: label legibility,
  arrowheads, camera framing, colour contrast. **Treat the visual design as
  unreviewed.**

  An earlier version of this list omitted the now-deleted `serve.py`
  entirely, on the reasoning that the socket restriction made it untestable
  here. That was wrong in a way worth keeping written down even though the
  file is gone: the restriction applied to one call, and a later change to
  `generate.generate()`'s return shape broke `serve.py` several lines
  *earlier*, shipping a start command that always failed. See
  `meta/perception-failures/log.md` entry 8 and the matching rule in
  `meta/procedural-memory/universal.md`.
- **Per-edge prose is missing for authority edges** — see above.
- **`scope` is a judgement, not a sourced fact.** 12/27 split, assigned here
  rather than taken from any Confluence page. Eight domains carry a
  `scope_note` marking the call as arguable; the rest are asserted. Correct
  them in `domains.json`, not in the UI.
- **The flow graph's source is WIP and partly unreadable.** Its origin is a
  Confluence whiteboard whose body the Atlassian connector cannot fetch, so
  the data comes from a structured text feed page its owner wrote for this
  purpose. Decision 35 records the exact failure modes and why a
  similar-looking older page by another author was *not* used.
- **Only one flow graph exists.** Nothing yet validates that a second
  overlay would not need schema changes.

## Opening it

**No server, and it starts empty.** Open `index.html` from disk, then open a
graph file:

```bash
python3 components/kg-viz/generate.py    # after any kg-content change
open components/kg-viz/index.html        # then choose graph.json
```

The viewer shows an **Open a graph** prompt on load. Choose the file, or drop
any `.json` file onto the window. `graph.json` in the same folder is the
expected default and is what the prompt names, but nothing is special-cased to
it — this is a viewer for any compatible graph file, meaning any JSON with a
top-level `views` array. **Open another graph…** in the left panel switches
files at any time; the previous graph's filters and selection are cleared on
each load, and the renderer is reused rather than rebuilt.

A file that is valid JSON but not a graph, or not valid JSON at all, is
rejected with a message naming the file and the reason — never by rendering an
empty canvas.

### Why it starts empty rather than auto-loading (decision 37)

An earlier version auto-loaded a generated `graph-data.js` that assigned
`window.KG_GRAPH`, because a page opened as `file://` has origin `null` and so
cannot `fetch("graph.json")`, while a `<script src>` can. That worked, and was
dropped anyway: it made the page a hard-wired display of one file, produced a
second 238KB artifact that had to stay in step with `graph.json`, and gave the
component two names one token apart (`graph.json` / `graph-data.js`) that
immediately caused confusion about which was which. Loading by explicit choice
needs no wrapper, because a file the user selects or drops is readable by
grant rather than by origin.

### Why the server was removed (decision 36)

`serve.py` and `graph.sh` are deleted. Nothing about this component ever
needed a process: it serves static files to one local reader. What the server
did contribute was failure modes, and they cost several rounds of debugging
between them — a startup crash when `generate.generate()`'s return shape
changed and `serve.py` was the one consumer not updated; HTTP caching that
served a two-commit-old page while a fix was reported as "same thing"; and a
stale-log problem where a failure pointed at an append-only file whose most
obvious traceback belonged to an earlier run. None of those are possible
without a server.

### Freshness is shown, because a picker is a cache by another name

The page displays whatever was last opened, so the stats box (bottom left)
always prints three things: `PAGE_REVISION` (a constant in `index.html` — bump
it when editing that file), **which file the data came from**, and
`graph.json`'s `generated_at`. Without those, stale data looks exactly like
current data, which is the trap the removed HTTP cache already sprang.

## Extraction notes

Disposable and regenerable by construction: `graph.json` is a build artifact,
and the whole component can be deleted and rebuilt from `kg-content` alone.
Not a candidate for promotion out of this repo — its only reason to exist is
to look at *this* graph.
