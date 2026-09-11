# idea-to-presentation

An agent-driven capability aimed at dramatically reducing the time between
having an idea and having it in a presentable format — a PowerPoint deck or
a Confluence page — using Claude as the agent that does the drafting.

**General-purpose, not architecture-specific.** Unlike the rest of this
project, this capability isn't scoped to Tyro's architecture knowledge or
grounded on `kg-content` — it's meant to work for any idea, on any topic.
That's exactly why it lives under `meta/` rather than `components/`: see
decision 22 in `docs/decision-log.md`, which widened `meta/`'s charter for
this reason. `components/` is for pieces that serve this project's own
KG-curation mission; this doesn't, even though it was incubated here.

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

**Not yet designed — see decision-log Next steps:**
- The actual mechanism: how an idea (as typed, pasted, or dictated) becomes
  a deck/page. Whether this needs generation tooling (e.g. producing a real
  `.pptx` file) or works by drafting content Claude Code then pushes through
  existing channels (e.g. `createConfluencePage` via the Atlassian MCP
  connector, already used by `components/confluence-publish`'s intended
  design).
- Whether it's invoked as a Claude Code Skill, an Agent (mirroring
  `arc-lite`), or something else.
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

Just scaffolded. Purpose and boundary are set; mechanism is not designed yet.

## Extraction notes

Explicitly the kind of thing decision 22 anticipates could outgrow this
repo — it has no tie to architecture-knowledge curation, so if it becomes
genuinely useful beyond this project there's no KG-specific content to
untangle it from. Not a candidate to assess for promotion until the
mechanism exists and has been used for real.
