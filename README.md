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

## Honest status (2026-09-18)

Read this before trusting anything else here: the design record runs well ahead
of what is actually built.

- **34 decisions recorded; the graph holds one hand-authored entity.** The
  design conversation is the mature artefact. Beyond that single `principle`,
  `kg-content` holds a 39-domain layer mirrored from Confluence as an
  ingestion experiment — logged in
  [`docs/domain-model-experiment.md`](docs/domain-model-experiment.md) and
  deliberately *not yet* folded into the decision log, pending real downstream
  use. Five of the seven entity directories are still empty.
- **No product code.** `components/` is contracts and scaffolding. The code
  that runs is `components/local-agent/ui/server.py` (fronted by a `*.sh`
  start/stop wrapper), `components/kg-viz/generate.py`, and four stdlib
  scripts under `meta/`. `kg-viz` has no server at all — its
  `knowledge-visualizer.html` is opened straight from disk. There is no
  build system or test suite for the repo at large — don't infer commands
  that don't exist — except within `kg-viz` itself: `build.py` compiles
  `src/*.js` into `knowledge-visualizer.html`, and `verify.js` is the one
  test command (`node components/kg-viz/verify.js`).
- **Arc Lite is the only usable thing.** A local, deliberately non-production
  mirror of Arc, invokable as an agent from Claude Code. It has never been
  driven through real usage, so its gap log is still empty.
- **Program position:** Phase 1 (Foundation), milestones 1.1–1.3, targeting
  Dec 2026 — canonical content and workflow baseline. The active typed graph
  is milestone 2.1, Apr 2027, so it is deliberately *not* the current job.
- **The work with a real deadline is in `practice/`, not `components/`.**
  IN-563 is the one piece with a live ticket; its first validation checkpoint
  (CP1) is ready to run, and CP2/CP3 are blocked behind it.

## Where to start

| If you want to… | Read |
|---|---|
| Understand why anything is the way it is | [`docs/decision-log.md`](docs/decision-log.md) — the primary artefact |
| See where the program is heading | [`docs/program-roadmap.md`](docs/program-roadmap.md) — snapshot; Confluence owns it, re-fetch rather than edit |
| Work on the graph itself | [`components/kg-core/SCHEMA.md`](components/kg-core/SCHEMA.md) — the critical path |
| Look at what the graph currently contains | [`components/kg-viz/`](components/kg-viz) — open `knowledge-visualizer.html` directly, no server; read-only, `payments.json` is regenerable |
| Work on IN-563 | [`practice/capability-maturity/`](practice/capability-maturity) — start at `validation-plan.md` |
| Avoid repeating a known mistake | [`meta/procedural-memory/INDEX.md`](meta/procedural-memory/INDEX.md) |

The four baseline decisions, the working conventions, and the constraints that
shape the design live in [`CLAUDE.md`](CLAUDE.md) and the decision log. They are
deliberately not restated here — a second copy drifts, which this repo treats as
a defect rather than a convenience.
