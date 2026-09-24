# AI-DLC solution architecture

**Provenance: authored here.** This folder is the source of truth for the
AI-DLC solution architecture and the presentation generated from it.

## The ask

**Requested by leadership in the TLT huddle, 2026-09-24.** The CTO asked the
Architecture team to come back to the next huddle with a high-level view.
Three items were named; **two of them are this folder's scope**, co-assigned
to the user and a second architect:

1. **AI-DLC Solution Architecture — a high-level view of the different
   layers**, e.g. the knowledge layer.
2. **Architecture knowledge as part of the knowledge layer** — how we could
   set up architecture knowledge for use across Tyro. Again, high-level
   thinking.

The third item, a **Reference Domain Model** for testing-automation
dependencies, is owned by another architect and is *not* in this folder's
scope — but see `review-notes.md` for the one place it intersects this deck.

**"High level" was stated twice and is the binding constraint on depth.** The
deliverable is breadth and framing, not a detailed design.

### Dates

| When | What |
|---|---|
| Thu 2026-09-24 | Ask received; per-slide narration captured |
| Mon 2026-09-28 | Regroup with the co-assigned architect, who is back that day |
| Tue 2026-09-29 | TLT huddle — deliverable due |

The Monday regroup means the draft has to be **co-workable by another
architect**, not just presentable — which is a point in favour of generating
the Confluence page earlier than decision 46 assumed.

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

Audience is the CTO and the TLT huddle. Deliverable 1 is drafted and under
review. **Deliverable 2 is not yet drafted** — see `review-notes.md` item 1,
which proposes it as the worked example inside deliverable 1 rather than as a
second deck. The rendering step remains open per decision 46.

## Related, not depended on

- [`../capability-maturity/`](../capability-maturity/) — holds the
  *Architecture Capability & Process Map*'s five-level Organisational Maturity
  ladder, which `review-notes.md` item C proposes anchoring this deck's
  current/tactical/target stages to. Referenced, not a dependency.
