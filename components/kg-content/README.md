# kg-content

The curated graph itself: one Markdown file per entity, conforming to
[`../kg-core/SCHEMA.md`](../kg-core/SCHEMA.md).

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
  domains/                  <slug>.md
```

Filename stem is the entity id. The containing directory carries the type, so ids
are unprefixed.

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
authoring — was superseded rather than completed: `entities/domains/` now holds
39 `domain` entities, ingested in one pass because a concrete downstream
consumer needed the full domain set. See
[`../../docs/domain-model-experiment.md`](../../docs/domain-model-experiment.md)
for why breadth was chosen over the planned slice, and why the entities
themselves are deliberately lean (a summary + a pointer to cached source,
not a transcription) rather than complete.

## Extraction notes

Unlikely to move, but if it does it moves cleanly, because it has no code
dependencies by construction. The realistic scenario is the opposite direction:
this repo becomes the canonical content home and tooling gets promoted out around
it.
