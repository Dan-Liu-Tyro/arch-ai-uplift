# meta

Components that sit *above* the project rather than inside it.

Everything under `components/` ships as part of the architecture agent product
itself — the agent, its skills, the knowledge graph — delivered for the
Architecture stream's mission. Everything here does not ship as part of that
product: either it observes the process of building this project, accumulating
knowledge about *how we work* rather than about Tyro's architecture, or it's a
capability useful along the journey of building and operating the product, which
could potentially be abstracted into a general-purpose capability beyond this
project, but is explicitly not part of the product's own delivery — widened to
include the latter by decision 22 in `docs/decision-log.md`. Either way, these are
in this repo because they are worth versioning and reviewing, but none of it ships
with the product.

| Meta component | Purpose |
|---|---|
| [`procedural-memory`](procedural-memory) | Operational lessons — mistakes made here and the rules that prevent repeating them. Intended to change behaviour immediately, via a pointer from `CLAUDE.md`. |
| [`architecture-learning`](architecture-learning) | A slow-curated model of how this architect reasons. Deprioritised: no consumer wired up, revisited later. |
| [`token-tracking`](token-tracking) | Token consumption and cost by day, five-hour window, branch, effort, and model, so strategy can be adjusted from evidence. |
| [`perception-failures`](perception-failures) | A catalogue of instances where Claude asserted an incorrect belief as settled fact. Research-shaped: accumulates toward a possible paper on how an agent's incorrect perceptions form and get caught, not a fix applied today. |
| [`idea-to-presentation`](idea-to-presentation) | An agent-driven capability to cut the time from a raw idea to a presentable deck/page (PowerPoint, Confluence). Useful along the journey, not part of the agent/skills/KG product's own delivery — the first capability under the widened charter (decision 22). |
| [`CDCD`](CDCD) | Working title ("Conversation-Driven Co-Design"). Evidences the collaboration pattern this project itself uses — no upfront spec, structure emerging through dialogue, the agent expected to counter-argue — distinct from `architecture-learning` because its subject is the methodology, not the user's reasoning. |

The first four are self-observation: `procedural-memory` is about **my** errors and
takes effect now; `architecture-learning` models **the user's** reasoning and is
curation without a consumer; `token-tracking` derives cost data from real usage;
`perception-failures` catalogues a specific way **my own** reasoning goes wrong.
`idea-to-presentation` and `CDCD` are a different kind of thing each: the former a
capability rather than a record, the latter a record whose subject is the
collaboration pattern itself rather than either party's reasoning — all kept here
anyway because, like the first four, none of it ships as part of the architecture
agent product.

## The one hard rule

**Nothing under `components/` may depend on anything under `meta/`.**

The dependency rules in `docs/component-model.md` describe a graph pointing inward
to `kg-core`. `meta/` sits outside that graph entirely: nothing in it ships as part
of the product. The reason differs by kind of meta component, but the rule doesn't:
a self-observation component (the original three) is tied to *this* project's
history and would be meaningless elsewhere; a general-purpose capability
(`idea-to-presentation`) has its own independent incubation lifecycle, moving at its
own pace for its own audience, that the shipped product shouldn't be coupled to.
Either way, if a component ever needs something from a meta component, the thing it
needs is not meta and belongs in the core.

This matters for the promotion story. Components are built to be extracted into
their own projects. A dependency from a component to a meta component would quietly
make that component non-extractable, which is the exact property the component
model exists to protect — regardless of which of the two reasons above applies to
the meta component in question.

## Why the self-observation components are not just notes

The self-observation components produce *data*, not opinions:

- `architecture-learning` records observations with citations to where they were
  demonstrated, so entries can be checked and corrected rather than accumulating as
  unverifiable assertions.
- `token-tracking` derives from local session transcripts, which carry real
  per-message usage figures.
- `perception-failures` records each instance with the specific belief, the narrow
  evidence it over-generalized from, and how it was caught — the same
  checkable-citation discipline, applied to Claude's own reasoning rather than the
  user's.

The failure mode for all three is confabulation — plausible-sounding records
nobody can verify. All are therefore built around evidence and provenance, which
is the same discipline the KG itself applies to architecture knowledge, and which
`CDCD` (below) also adopts for its own subject. This discipline is specific to
*records* of what happened; `idea-to-presentation` is a capability, not a record,
so it earns its keep the way a `components/` piece would — a stated purpose and
boundary in its own README — rather than through evidence/provenance.
