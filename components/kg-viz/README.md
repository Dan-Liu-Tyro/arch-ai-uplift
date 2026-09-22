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

## Boundary

**In scope**

- Generating `graph.json` from whatever currently exists in `kg-content`
  (`generate.py`), as one file containing both views.
- Serving that JSON plus a static, self-contained HTML page (`serve.py`,
  `index.html`).
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

  The sandbox this is built in cannot bind a listening socket (`serve.py`'s
  `HTTPServer(...)` call fails with `PermissionError: [Errno 1] Operation not
  permitted`), so none of that can be checked from here. What *is* verified
  mechanically:
  `generate.py`'s output and layout invariants (every forward edge runs
  left-to-right within its lane, no two nodes share a position, no node
  unranked); both data files against their schemas and for referential
  integrity; `serve.summarize(generate.generate())`, which is the whole of
  `serve.py` that runs before the blocked bind; and the page's own JavaScript
  executed against the real `graph.json` under a stubbed DOM in node —
  covering init, view switching, group hide (26→21 nodes and 43→32 edges with
  no dangling links), and scope dimming (0/7 in-scope dimmed, 10/10
  out-of-scope dimmed). What none of that covers is anything three.js
  actually draws: label legibility, arrowheads, camera framing, colour
  contrast. **Treat the visual design as unreviewed.**

  An earlier version of this list omitted `serve.py` entirely, on the
  reasoning that the socket restriction made it untestable here. That was
  wrong in a way worth keeping written down: the restriction applies to one
  call, and a later change to `generate.generate()`'s return shape broke
  `serve.py` several lines *earlier*, shipping a start command that always
  failed. `summarize()` exists as a separate function specifically so the
  pre-bind path can be exercised without a socket. See
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

## Running it

`graph.sh {start|stop|restart|status}` runs the server as a background
process (pid + log under `.run/`, gitignored) so it doesn't tie up a
terminal; open `http://127.0.0.1:8766` once it's started. Port 8766 is
deliberately distinct from the local-agent UI's 8765 so both can run at
once. Binds to localhost only; nothing is exposed beyond the machine it
runs on. `serve.py` regenerates `graph.json` from `kg-content` on every
startup, so `restart` is also how you pick up entity changes — `start`
echoes the resulting per-view counts as confirmation the data is current.
Mirrors `components/local-agent/ui/arc-lite.sh` rather than introducing a
second convention for local UIs.

The script is named `graph.sh` and the pid/log inside `.run/` are named
after the *component* (`kg-viz.log`), so renaming the script does not move
them. `.run/kg-viz.log` is append-only across runs, and both the success
banner and the failure output read only the bytes appended by the current
attempt — an earlier version used `grep -m1` over the whole file and
reported the *oldest* run's counts as if they were current. On failure the
script now prints that attempt's error inline rather than only naming the
log file, because the log's most eye-catching traceback frequently belongs
to some previous run.

`python3 serve.py` still works directly if you want it in the foreground.

Run `./graph.sh start` from a normal terminal (outside any sandboxed tool
call) and open the URL. Nobody has seen this in a browser yet — see "Known
gaps" above for exactly what is and is not verified.

## Extraction notes

Disposable and regenerable by construction: `graph.json` is a build artifact,
and the whole component can be deleted and rebuilt from `kg-content` alone.
Not a candidate for promotion out of this repo — its only reason to exist is
to look at *this* graph.
