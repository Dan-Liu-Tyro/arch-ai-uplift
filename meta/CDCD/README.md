# CDCD (working title — "Conversation-Driven Co-Design")

Studies and records evidence for the collaboration pattern this project has
actually used since its first commit: architecture, spec, component
boundaries, and documentation aren't planned upfront, but crystallize
progressively through conversation between an architect (the user) and an AI
agent expected to co-design, not just implement — pushing back with
counter-argument grounded in this project's own documented decisions and in
industry/world knowledge, and only then writing the settled shape down.

**Working title, not finalized.** "Conversation-driven" names the channel,
not the actual differentiator. What's genuinely distinguishing, by the
user's own description, is that rigor (spec, modularity, documentation,
maintainability) is mandatory as an outcome but deferred in *when* it's
produced, and that the agent is expected to argue back rather than execute a
given definition. Revisit the name once there's enough written material to
judge whether it holds up for a reader who wasn't in the founding
conversation — see `definition.md`.

## Why this is separate from `architecture-learning`

Different subject, same split this project already used to keep
`perception-failures` separate from `architecture-learning` (decision 4 in
`docs/decision-log.md`). `architecture-learning`'s subject is the user's own
reasoning and taste — the payoff is a better Claude next time.
CDCD's subject is the collaboration pattern itself — how a human architect
and an AI agent co-create a system together — which is worth studying even
holding the agent's current capability fixed. A CDCD entry may cite the same
underlying conversation an `architecture-learning` entry cites without being
the same observation: `architecture-learning` asks what it shows about the
user; CDCD asks what it shows about the methodology.

## Purpose

The concrete target, stated directly by the user: when someone later asks
"isn't that just vibe coding?", be able to give a clear, evidence-grounded
answer drawn from this project's own documented history — not from an
asserted definition. `definition.md` is the current answer;
`observations.md` is what it's grounded in.

## Boundary

**In scope**
- Raw evidence capture (`observations.md`) of moments in this project's own
  history that bear on the CDCD hypothesis — supporting *or* contradicting.
- A curated, evidence-cited comparison against vibe coding, domain-driven
  design, and spec-driven design (`definition.md`).
- A factual (not evidence-tagged, not hypothesis-tagged) reference of the
  mechanism itself — the control layers (`CLAUDE.md`, personal memory,
  output style, org instructions) that the pattern actually runs on
  (`control-layers.md`, added 2026-09-14). Distinct from the other two: it
  describes what currently exists, not what was observed or concluded.

**Out of scope**
- Anything that ships as part of the architecture agent product itself —
  this observes the process, per `meta/`'s original charter (decision 4),
  and is not a capability like `idea-to-presentation` (decision 22).
- Treating the hypothesis as settled. Per `architecture-learning`'s own
  prior correction (`evidence-over-assumed-best-practice.md`), a claim
  evidenced only by supporting anecdotes from one project is advocacy, not
  a finding — `definition.md`'s Status section says so plainly, and stays
  honest about it until contradicting evidence has actually been sought.

## Depends on

Nothing in this repo. Cites `docs/decision-log.md` entries as evidence, the
same way `architecture-learning` does, but doesn't depend on their content
changing correctly.

## Depended on by

Nothing. Per `docs/component-model.md`'s hard rule, `components/` may never
depend on `meta/` regardless.

## Status

Just scaffolded, seeded with the founding conversation (2026-09-11) as its
first evidence. No contradicting evidence collected yet — see
`definition.md`'s Status section and next step 10 in `docs/decision-log.md`.

## Extraction notes

Not assessed. If this becomes a paper, the paper is the extraction — this
component stays the evidence base behind it, not something promoted out of
this repo the way a `components/` piece would be.
