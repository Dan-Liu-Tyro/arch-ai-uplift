# idea-to-presentation

An agent-driven capability aimed at dramatically reducing the time between
having an idea and having it in a presentable format — a PowerPoint deck or
a Confluence page — using Claude as the agent that does the drafting.

**Useful along the journey, not part of the product's delivery.** This
capability doesn't ship as part of the architecture agent product itself
(the agent, its skills, the knowledge graph) — it's a general-purpose tool
that helps get *other* work into presentable shape, incubated while building
that product but not a piece of it. That's exactly why it lives under
`meta/` rather than `components/`: see decision 22 in
`docs/decision-log.md`, which widened `meta/`'s charter for this reason.
`components/` is for pieces that ship with the product; this doesn't, even
though it was incubated here — and it's also not scoped to Tyro's
architecture knowledge, so it isn't grounded on `kg-content` and is meant to
work for any idea, on any topic.

## Purpose

Go from a raw, unstructured idea (a few sentences, a voice note, a rough
outline) to a draft deck or page that's actually presentable — structured,
formatted, ready for a first review — with as little manual authoring effort
as possible. The value is speed and reduced friction between having a thought
and having something to share, not replacing the user's judgment about what
the idea should say.

## Boundary

**In scope**
- Turning an idea into a structured draft for at least two output shapes:
  a PowerPoint deck and a Confluence page.
- Using Claude Code as the drafting agent — this is a capability exercised
  through conversation/invocation, not a standing service.

**Out of scope, for now**
- Architecture-specific grounding or citation (that's what `local-agent` and
  `kg-content` are for, inside `components/`). This capability may be *used*
  to draft architecture-related presentations, but it doesn't depend on the
  KG to do so.
- Any specific output format beyond PowerPoint and Confluence until asked
  for.

## Mechanism

**Decided (decision 46): one markdown source of truth, with every output a
generated view of it.** The markdown is the artifact — the document itself,
not a staging area for a deck. Slides and a Confluence page are projections.

The reason this direction and not the other: slide-shaped prose (fragments,
build-up, reliance on a narrator) does not read as a document, so a deck
authored first cannot later yield a good page. A document projects into
slides; slides do not project back into a document.

Consequence: **rendered outputs are regenerable and never hand-edited**, the
same discipline `kg-viz` applies to `payments.json` and
`knowledge-visualizer.html`. An edit made in PowerPoint or directly in
Confluence is lost on the next generation. Content changes go into the
source.

**Still open:**
- **The slide rendering step.** Whether a `.pptx` is generated directly, or
  built as a published slide artifact and exported, is not settled —
  deliberately deferred so the narrative can stop moving before rendering
  effort is spent.
- **Invocation shape.** Whether this is a Claude Code Skill, an Agent
  (mirroring `arc`), or stays conversational. The first real run is being
  done in conversation on purpose, to find out what the mechanism needs
  before packaging it.

The Confluence path is the least open of the three: `createConfluencePage`
via the Atlassian MCP connector already exists and needs no new
infrastructure — the same channel `components/confluence-publish` intends to
use, arrived at independently.
- If any executable tooling is needed, its language — per org standards,
  Kotlin is preferred for complex applications; something simpler may be
  fine for a first pass, consistent with this project's
  least-infrastructure-first pattern.

## Depends on

Nothing in this repo. Deliberately not `kg-core` or `kg-content` — this
capability's whole point is being usable independent of architecture-content
curation.

## Depended on by

Nothing. Per the hard rule in `docs/component-model.md`, nothing under
`components/` may depend on this either, regardless of how general-purpose
it turns out to be.

## Status

**In first real use.** Purpose and boundary were set at scaffolding; the
source-of-truth mechanism is now decided (see Mechanism above) because a
real need arrived: a solution-architecture presentation to the CTO on
AI-DLC. That content lives under `practice/`, not here — this component
holds the capability, not any one deck's material. Rendering and invocation
remain undecided.

## Extraction notes

Explicitly the kind of thing decision 22 anticipates could outgrow this
repo — it has no tie to architecture-knowledge curation, so if it becomes
genuinely useful beyond this project there's no KG-specific content to
untangle it from. Not a candidate to assess for promotion until the
mechanism exists and has been used for real.
