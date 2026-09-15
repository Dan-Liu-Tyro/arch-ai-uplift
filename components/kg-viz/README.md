# kg-viz

A read-only, browser-based 3D visualization of the knowledge graph in
`kg-content`, for human inspection — not a consumer that reasons about the
graph, just a way to look at it.

## Boundary

**In scope**

- Generating `graph.json` from whatever currently exists in `kg-content`
  (`generate.py`).
- Serving that JSON plus a static, self-contained HTML page that renders it
  as an interactive 3D force-directed graph (`serve.py`, `index.html`).
- Reading `domain`'s structured `not_authoritative_for` relationships
  directly from `kg-content/entities/domains.json` and rendering them as
  edges. (First pass derived edges by fuzzy-matching prose; retired once
  `domain` got real relationships — see "How the edges are derived", below,
  and `docs/domain-model-experiment.md`'s "Pivot" section for why.)

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

## Status

Second pass, built directly (no build system — plain stdlib Python + a
CDN-loaded `3d-force-graph` script tag, consistent with this repo's "zero new
infra" stance, decision 1). `generate.py` now reads `domain`'s structured
`not_authoritative_for` relationships straight out of
`kg-content/entities/domains.json` — no prose parsing or fuzzy matching left
in this component at all, that logic was retired in the pivot (see "How the
edges are derived" above). Current graph: 40 nodes (39 domains + the one
`principle` entity, unconnected), 296 resolved edges out of 338 total
cross-domain references extracted at ingestion time, 42 left as
`target_unresolved` in `domains.json` rather than guessed. See
`docs/domain-model-experiment.md`'s "Pivot" section for what the unresolved
42 actually are (mostly four single-word abbreviations deliberately never
auto-resolved, plus generic collective phrases, plus one domain name
referenced in the source but never defined as its own section) — a named,
considered set, not parsing failures.

**Not verified in a real browser.** The sandboxed environment this was built
in cannot bind a listening socket (`serve.py` fails with `PermissionError:
[Errno 1] Operation not permitted` when run through it — unrelated to the
code itself, `generate.py`'s own logic ran and produced valid output in the
same sandbox). Run `python3 components/kg-viz/serve.py` from a normal
terminal (outside any sandboxed tool call) and open the printed URL to get
the first real look at this.

## Extraction notes

Disposable and regenerable by construction: `graph.json` is a build artifact,
and the whole component can be deleted and rebuilt from `kg-content` alone.
Not a candidate for promotion out of this repo — its only reason to exist is
to look at *this* graph.
