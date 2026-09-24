# AI-DLC solution architecture

**Provenance: authored here.** This folder is the source of truth for the
AI-DLC solution architecture and the presentation generated from it.

## What is here

| File | Role |
|---|---|
| [`solution-architecture.md`](solution-architecture.md) | **The artefact.** The solution architecture as a document, section per intended slide. Every output is generated from this file. |
| [`review-notes.md`](review-notes.md) | Reviewer commentary on the draft. Not part of the architecture; items are open until the author accepts or rejects them. |

## Why the document and not the deck

Decision 46 in [`../../docs/decision-log.md`](../../docs/decision-log.md): one
markdown source of truth, with the deck and a later Confluence page as
generated views. A deck authored first cannot later yield a good document —
slide prose is fragments that lean on a narrator — whereas a document projects
into slides cleanly. The direction is therefore document → outputs, never the
reverse.

**Consequence: generated outputs are never hand-edited.** An edit made in
PowerPoint or directly in Confluence is lost on the next generation. Content
changes go into `solution-architecture.md`.

## Why this sits in `practice/` and not `meta/`

The *capability* — how an idea becomes a deck or a page — is
`meta/idea-to-presentation/`. This folder is the *content*: a
solution architecture presented to the CTO, which is Architecture-stream work
owed to the organisation and not software. That is the tier test in
[`../README.md`](../README.md): what a thing is, not what it is about.
Separating them is what lets the next deck reuse the mechanism without
inheriting this one's material.

## Audience and status

Audience is the CTO. The draft is captured and under review; the rendering
step (how the deck is produced) is deliberately still open per decision 46, so
that the narrative settles before rendering effort is spent.

## Related, not depended on

- [`../capability-maturity/`](../capability-maturity/) — holds the
  *Architecture Capability & Process Map*'s five-level Organisational Maturity
  ladder, which `review-notes.md` item C proposes anchoring this deck's
  current/tactical/target stages to. Referenced, not a dependency.
