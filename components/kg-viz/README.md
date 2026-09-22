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

6 files, 5 of them tracked. Nothing else belongs in this directory.

| File | Tracked | Responsibility | Who writes it |
| --- | --- | --- | --- |
| `generate.py` | yes | **The only executable.** Reads `kg-content`, resolves the overlay's `domain_ref`s against `domains.json`, computes the swimlane layout (feedback-arc detection, then longest-path depth within each stage), and writes the two output files below. The single place any derivation happens. | a human, by hand |
| `index.html` | yes | **The entire UI**, in one self-contained file: markup, CSS, and all view/filter/label/selection behaviour. Reads the generated data; derives nothing from `kg-content` itself. Opened directly from disk. | a human, by hand |
| `graph.json` | yes | **The canonical generated artifact.** Both views, their nodes, typed edges, computed layout coordinates, and per-view stats. Portable and readable on its own, which is why it stays tracked — a future `kg-core` or publish step can consume it. **Never hand-edit; it is overwritten on every run.** | `generate.py` |
| `graph-data.js` | **no** (gitignored) | **Byte-for-byte the same payload as `graph.json`**, wrapped as `window.KG_GRAPH = {...};`. Exists for exactly one reason: a page opened as `file://` has origin `null`, so `fetch("graph.json")` is blocked, while a `<script src>` is not. Its presence is what makes the page work with no server and no file picker. Untracked because duplicating 238KB in git on every regeneration buys nothing a reviewer can use. | `generate.py` |
| `README.md` | yes | This file: the component's contract. | a human, by hand |
| `vendor/README.md` | yes | How and why to place a local copy of `3d-force-graph` here when the CDN is unreachable. The `.js` file it describes is gitignored. | a human, by hand |

**There is no `graph.js`.** If you are looking for one, the file meant is
`graph-data.js` — the `file://` loading wrapper described above. The two
generated files are deliberately named for what they are: `graph.json` is the
data, `graph-data.js` is the same data in a form a browser will load from
disk.

Deleted by decision 36 and not coming back: `serve.py` and `graph.sh`. This
component has no server and needs no process — see "Opening it".

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
- **Feedback arcs** drawn dashed/curved and counted in the stats box.
- **Fit to view** — re-frames the camera. Framing also happens automatically
  on `onEngineStop`, but a manual control matters because a camera pointed
  somewhere empty is indistinguishable from a graph that failed to draw.

## Status

Third pass. No build system — plain stdlib Python plus a single CDN script
tag (`3d-force-graph`), consistent with this repo's "zero new infra" stance
(decision 1). Node labels are plain HTML positioned over the canvas with
`graph2ScreenCoords()`; see `vendor/README.md` for why the `three-spritetext`
dependency was removed rather than vendored.

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

**There is no server.** Open `index.html` directly — double-click it, or
`open components/kg-viz/index.html`. That is the whole procedure.

```bash
python3 components/kg-viz/generate.py   # after any kg-content change
open components/kg-viz/index.html
```

`generate.py` writes two files with identical content: `graph.json`, the
canonical portable artifact, and `graph-data.js`, the same payload wrapped as
`window.KG_GRAPH = {...};`. The wrapper exists for one reason: a page opened
as `file://` has origin `null`, so `fetch("graph.json")` is blocked outright,
while a `<script src>` is not — script tags predate CORS and were never
retrofitted with it. With `graph-data.js` present the page loads its data with
no server and no interaction.

If `graph-data.js` is missing (it is gitignored — see below), the page says so
and offers to load `graph.json` by **drag-and-drop or a file picker**. A file
chosen through an `<input>` is readable by explicit user grant, which is why
that path works under `file://` where `fetch` does not. A dropped file that is
not a kg-viz graph is rejected with a specific message rather than rendering
as an empty canvas.

### Why the server was removed (decision 36)

`serve.py` and `graph.sh` are deleted. Nothing about this component ever
needed a process: it serves two static files to one local reader. What the
server did contribute was failure modes, and they cost several rounds of
debugging between them — a startup crash when `generate.generate()`'s return
shape changed and `serve.py` was the one consumer not updated; HTTP caching
that served a two-commit-old page while a fix was reported as "same thing";
and a stale-log problem where a failure pointed at an append-only file whose
most obvious traceback belonged to an earlier run. None of those are possible
without a server. `file://` reloads read from disk.

### Freshness is still shown, because a picker is a cache by another name

The page shows whatever was last loaded, so the stats box (bottom left)
always prints three things: `PAGE_REVISION` (a constant in `index.html` —
bump it when editing that file), which file the data came from, and
`graph.json`'s `generated_at`. Without those, stale data looks exactly like
current data, which is the trap the removed HTTP cache already demonstrated.

### `graph-data.js` is gitignored

It is a byte-for-byte duplicate of `graph.json` (~238KB each), and tracking
both would double the diff churn on every regeneration for no review value.
`graph.json` stays tracked. The cost is that a fresh clone shows the picker
until `generate.py` is run once — which the picker says, in those words.

## Extraction notes

Disposable and regenerable by construction: `graph.json` is a build artifact,
and the whole component can be deleted and rebuilt from `kg-content` alone.
Not a candidate for promotion out of this repo — its only reason to exist is
to look at *this* graph.
