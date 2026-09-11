# meta

Components that sit *above* the project rather than inside it.

Everything under `components/` builds the knowledge graph — pieces that serve this
project's own mission, curating Tyro's architecture knowledge for the Architecture
stream's AI SDLC outcome. Everything here is not a step in that pipeline: either it
observes the process of building this project, accumulating knowledge about *how we
work* rather than about Tyro's architecture, or it's a capability incubated along
the way that isn't specific to architecture-knowledge curation and might have value
beyond this project — widened to include the latter by decision 22 in
`docs/decision-log.md`. Either way, these are in this repo because they are worth
versioning and reviewing, but they are not part of the KG pipeline and would not
ship as part of *it*.

| Meta component | Purpose |
|---|---|
| [`procedural-memory`](procedural-memory) | Operational lessons — mistakes made here and the rules that prevent repeating them. Intended to change behaviour immediately, via a pointer from `CLAUDE.md`. |
| [`architecture-learning`](architecture-learning) | A slow-curated model of how this architect reasons. Deprioritised: no consumer wired up, revisited later. |
| [`token-tracking`](token-tracking) | Token consumption and cost by day, five-hour window, branch, effort, and model, so strategy can be adjusted from evidence. |
| [`idea-to-presentation`](idea-to-presentation) | An agent-driven capability to cut the time from a raw idea to a presentable deck/page (PowerPoint, Confluence). General-purpose, not specific to architecture-knowledge curation — the first capability under the widened charter (decision 22). |

The first three are self-observation: `procedural-memory` is about **my** errors and
takes effect now; `architecture-learning` models **the user's** reasoning and is
curation without a consumer; `token-tracking` derives cost data from real usage.
`idea-to-presentation` is a different kind of thing — a capability rather than a
record — kept here anyway because it isn't a KG-pipeline step and the mission-
specificity test below still says `components/` isn't the right home for it either.

## The one hard rule

**Nothing under `components/` may depend on anything under `meta/`.**

The dependency rules in `docs/component-model.md` describe a graph pointing inward
to `kg-core`. `meta/` sits outside that graph entirely. The reason differs by kind
of meta component, but the rule doesn't: a self-observation component (the original
three) is tied to *this* project's history and would be meaningless elsewhere; a
general-purpose capability (`idea-to-presentation`) has its own independent
incubation lifecycle, moving at its own pace for its own audience, that a
KG-pipeline component shouldn't be coupled to. Either way, if a component ever needs
something from a meta component, the thing it needs is not meta and belongs in the
core.

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

The failure mode for both is confabulation — plausible-sounding records nobody can
verify. Both are therefore built around evidence and provenance, which is the same
discipline the KG itself applies to architecture knowledge. This discipline is
specific to *records* of what happened; `idea-to-presentation` is a capability, not
a record, so it earns its keep the way a `components/` piece would — a stated
purpose and boundary in its own README — rather than through evidence/provenance.
