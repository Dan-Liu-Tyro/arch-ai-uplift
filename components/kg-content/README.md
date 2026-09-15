# kg-content

The curated graph itself: one Markdown file per entity, conforming to
[`../kg-core/SCHEMA.md`](../kg-core/SCHEMA.md) — except `domain`, a scoped,
named exception to that convention (see `SCHEMA.md`'s `domain` section and
the Layout below).

This component is data, not code. It is also the actual asset — every other
component is replaceable tooling, whereas the curated knowledge here is the thing
that took human judgement to produce.

## Layout

```
entities/
  principles/               <slug>.md
  guardrails/               <slug>.md
  patterns/                 <slug>.md
  reference-architectures/  <slug>.md
  decisions/                <slug>.md
  systems/                  <slug>.md
  domains.json              -- all 39 domains, one file (see below)
```

Filename stem is the entity id, for every type except `domain`. The
containing directory carries the type, so ids are unprefixed.

`domains.json` replaces what was briefly an `entities/domains/<slug>.md`
directory of 39 lean files — the second refinement of this content in one
day. The user's own reasoning: the Architecture team owns these definitions
as one coherent, singularly-authored artifact, unlike a guardrail or pattern
that different reviewers edit independently over time — so for `domain`
specifically, one consolidated file beats one-file-per-entity, for
portability (no directory-walking needed to hand this to a UI or another
tool) and maintainability (the source changes as a whole). See
`kg-core/SCHEMA.md`'s `domain` section for the full statement of this
exception, and `kg-core/schemas/domain.schema.json` for the file's shape.

## Boundary

**In scope** — entity files, and nothing else.

**Out of scope** — scripts, templates, generated output, or Confluence artefacts.
If something here is not a curated entity, it belongs in a tooling component.

## Depends on

The schema contract only. Deliberately readable without any tooling present: a
human should be able to open a file and understand it, and a reviewer should be
able to judge a change from the diff alone. That property is what makes PR review
viable as the quality gate.

The one concession to tooling is `confluence_page_id` in frontmatter, written by
`confluence-publish` so the git → Confluence mapping travels with the entity.
Never hand-edit it.

## Depended on by

`local-agent`, as of 2026-09-08 (decision 21 in `docs/decision-log.md`) — reads
entities directly for Arc Lite's grounding, ending that component's prior
exception to reading through `kg-core`'s schema.

## Status

One `principle` entity
(`entities/principles/nfr-priority-third-party-financial-integration.md`,
status `draft`), migrated from `local-agent`'s retired grounding table rather than
authored fresh. The originally planned next step — pressure-testing the schema
against a small, hand-picked set of interconnected entities (a principle, a
guardrail deriving from it, a pattern requiring that guardrail) before bulk
authoring — was superseded rather than completed: `entities/domains.json` now
holds all 39 `domain` entities, ingested in one pass because a concrete
downstream consumer needed the full domain set. See
[`../../docs/domain-model-experiment.md`](../../docs/domain-model-experiment.md)
for why breadth was chosen over the planned slice.

This is the second refinement of that domain content in one day, not the
first: it started as `entities/domains/<slug>.md` (39 lean markdown files,
authority summarized in prose, no typed relationships), then was
consolidated into the single `domains.json` seen now — one-file-per-entity
dropped as a deliberate, scoped exception for this type only (see
`kg-core/SCHEMA.md`), and the prose cross-references replaced with real
`not_authoritative_for` relationships resolved against the raw cache. The
entities are still lean relative to the source (`purpose` and short
`authority` phrases, not the full JTBD/core-data/invariants lists) — depth
didn't change in this second pass, only file count and relationship
structure did.

## Extraction notes

Unlikely to move, but if it does it moves cleanly, because it has no code
dependencies by construction. The realistic scenario is the opposite direction:
this repo becomes the canonical content home and tooling gets promoted out around
it.
