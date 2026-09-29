# CDCD: working definition

Working title, not finalized — see `README.md`. This document is the
current answer to "isn't that just vibe coding?" — grounded in cited
evidence from `observations.md`, not asserted from a definition alone. It is
a hypothesis, not a settled conclusion; see Status below before quoting it
as more than that.

## Core claim

A software system's design, spec, and structure can be built with full
architectural rigor — modularity, documented contracts, maintainability —
without that rigor needing to be planned upfront. The rigor's *timing* is
deferred to the point each decision becomes concrete; it is not skipped or
made optional.

## How this differs from vibe coding

| | Vibe coding | CDCD |
|---|---|---|
| Who defines the product | A PM/user, upfront, then handed to an agent to implement | Neither party defines it upfront; goal, intent, and constraints are stated, and shape emerges through dialogue |
| Rigor (spec, modularity, docs, maintainability) | Implicit and optional — left up to the agent whether it happens at all | Mandatory as an outcome; deferred only in *when* it's produced |
| Role of the agent | Executor of a given product definition | Co-designer expected to push back with counter-argument (grounded in this project's own history and in industry/world knowledge), not just implement |
| Artifact trail | Often absent or an afterthought | A living decision log plus component contracts, updated in the same turn a decision firms up |

Evidence for each row is in `observations.md`.

## How this differs from domain-driven design / spec-driven design

Domain-driven design and spec-driven design are named for *what content
drives the design* — a domain model, a written spec. CDCD is named for
*when* that content is allowed to exist: never assumed to be needed in full
before work starts. A DDD or spec-driven project conducted entirely over
chat is still DDD or spec-driven if the domain model or spec is produced
before implementation proceeds — the channel being conversational doesn't
change that. CDCD's differentiator isn't the channel; it's that no such
artifact is required before the first real decision gets made, and the
rigor still shows up once that decision becomes concrete (see
`observations.md`'s `rigor-can-be-deferred-not-skipped` entries).

## Status

**Hypothesis, not a finding.** Evidenced so far only within this one
project, by supporting anecdotes gathered retrospectively in a single
session (2026-09-11). No contradicting evidence has been collected yet —
a real test of this hypothesis needs at least one case where deferring the
spec caused genuine rework, ambiguity, or a wrong turn, not just cases where
it worked out. Until that exists, treat the comparison table above as a
working claim, not a proven distinction — the same discipline
`architecture-learning`'s `evidence-over-assumed-best-practice` principle
already requires of itself.

## Next steps

- Find and record a contradicting instance, not just supporting ones — see
  next step 10 in `docs/decision-log.md`.
- Decide whether this needs its own index/reindex tooling once volume
  grows, mirroring `architecture-learning`, or whether two files stay
  enough (least-infrastructure-first favors the latter until proven
  otherwise).
- Decide the actual name once there's enough written material to test it
  against a reader who wasn't in the founding conversation.
