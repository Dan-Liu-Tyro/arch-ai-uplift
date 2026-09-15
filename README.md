# Architecture AI uplift — Architecture stream

Working repo for the Architecture stream of Tyro's AI SDLC / Architecture AI
Uplift program. It holds three different kinds of work, and telling them apart
is the main thing to understand before navigating it.

| Tier | Holds | The test it passes |
|---|---|---|
| [`components/`](components) | The product — curated knowledge graph, the agent, its skills | Does it ship as part of the product? |
| [`meta/`](meta) | Capabilities and self-observation used while building | Useful on the journey, without shipping? |
| [`practice/`](practice) | The Architecture practice's own business deliverables | Work owed to the org that isn't software? |

Dependencies point inward: nothing under `components/` may depend on `meta/` or
`practice/`. [`docs/component-model.md`](docs/component-model.md) owns those
rules and the criteria for promoting a component out of this repo.

**On the name.** The directory is still `arch-knowledge-graph`, from when the
knowledge graph was the entire scope. A rename to `arch-ai-uplift` is agreed in
principle and not yet done.

## Honest status (2026-09-15)

Read this before trusting anything else here: the design record runs well ahead
of what is actually built.

- **28 decisions recorded; one entity in the knowledge graph.** The design
  conversation is the mature artefact. The graph itself is barely started.
- **No product code.** `components/` is contracts and scaffolding. The only
  code that runs is `components/local-agent/ui/server.py` and four stdlib
  scripts under `meta/`. There is no build system and no test suite — don't
  infer commands that don't exist.
- **Arc Lite is the only usable thing.** A local, deliberately non-production
  mirror of Arc, invokable as an agent from Claude Code. It has never been
  driven through real usage, so its gap log is still empty.
- **Program position:** Phase 1 (Foundation), milestones 1.1–1.3, targeting
  Dec 2026 — canonical content and workflow baseline. The active typed graph
  is milestone 2.1, Apr 2027, so it is deliberately *not* the current job.
- **The work with a real deadline is in `practice/`, not `components/`.**
  IN-563 is the one piece with a live ticket; its first validation checkpoint
  is ready to run.

## Where to start

| If you want to… | Read |
|---|---|
| Understand why anything is the way it is | [`docs/decision-log.md`](docs/decision-log.md) — the primary artefact |
| See where the program is heading | [`docs/program-roadmap.md`](docs/program-roadmap.md) — snapshot; Confluence owns it, re-fetch rather than edit |
| Work on the graph itself | [`components/kg-core/SCHEMA.md`](components/kg-core/SCHEMA.md) — the critical path |
| Work on IN-563 | [`practice/capability-maturity/`](practice/capability-maturity) — start at `validation-plan.md` |
| Avoid repeating a known mistake | [`meta/procedural-memory/INDEX.md`](meta/procedural-memory/INDEX.md) |

The four baseline decisions, the working conventions, and the constraints that
shape the design live in [`CLAUDE.md`](CLAUDE.md) and the decision log. They are
deliberately not restated here — a second copy drifts, which this repo treats as
a defect rather than a convenience.
