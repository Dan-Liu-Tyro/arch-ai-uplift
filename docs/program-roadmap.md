# Program roadmap (source: Confluence, not owned here)

Snapshot of the Architecture AI Uplift stream's official milestone tracker.
Confluence is the source of truth for this page's content — re-fetch rather
than hand-edit if it drifts. Fetched 2026-08-19 from
[Architecture AI Uplift - Activity & Evidence Home](https://tyropaymentsltd.atlassian.net/wiki/spaces/AE/pages/2212429894/Architecture+AI+Uplift+-+Activity+Evidence+Home).

> **Not current — do not cite as status (2026-09-29).** Jira is the plan of
> record (decision 50 in `docs/decision-log.md`), and the user doubts these
> milestones are still valid. This snapshot is also stale against decision
> 34's FY27 re-baseline. Kept until the Jira re-map decides whether to
> refresh or retire it.

**Vision:** clarity and coherence at AI speed — trusted guidance at the point
of decision, reduced design friction, an architectural intelligence layer that
compounds through real delivery experience.

**Current phase:** Phase 1: The Foundation. Current focus: canonical knowledge
curation, architecture workflow baselining, AI-assisted design validation, and
establishing the Architecture Knowledge Benchmark (AKB).

## Milestones

| Phase | Milestone | Target | Status |
|---|---|---|---|
| 1: Foundation | 1.1 Canonical content / workflow / tech-stack baseline established | Dec 2026 | In progress |
| 1: Foundation | 1.2 AI-assisted design validation & alignment | Dec 2026 | In progress |
| 1: Foundation | 1.3 First build-learn-adjust loop closure | Dec 2026 | Not started |
| 2: Human-in-the-Loop | 2.1 Augmented architectural reasoning & decision support (active Knowledge Graph: sparring, dependency analysis, contradiction detection, trade-off analysis) | Apr 2027 | Not started |
| 2: Human-in-the-Loop | 2.2 Feedback infrastructure | Apr 2027 | Not started |
| 2: Human-in-the-Loop | 2.3 Practice & AI workflow evolution | Apr 2027 | Not started |
| 3: Human-on-the-Loop | 3.1 Autonomous architectural memory & integrity management | Aug 2027 | Not started |
| 3: Human-on-the-Loop | 3.2 AI-augmented architectural insights | Aug 2027 | Not started |
| 3: Human-on-the-Loop | 3.3 Autonomous strategic steering & adaptive guardrails | Aug 2027 | Not started |

## Success metric: the Architecture Knowledge Benchmark (AKB)

The program's own evaluation plan — not something this project needs to invent:

| Metric | Description | Current value |
|---|---|---|
| Golden Evaluation Set | 50+ complex, high-value architecture Q&A pairs | To establish |
| Baseline Score | Ungrounded AI answer quality, before uplift | Not measured |
| Grounding Lift | Delta between baseline and grounded performance | Not measured |
| No Regression Trend | Confirms grounding changes don't reduce quality over time | Not started |

## What this changes for this repo

- **The full typed-relationship graph (`kg-core`/`kg-content` as designed in
  `SCHEMA.md`) is explicitly milestone 2.1 — "active Knowledge Graph," target
  Apr 2027, not the current phase.** Phase 1 asks for canonical content
  curation and a *baseline*, not graph sophistication. This independently
  confirms the MVP-first direction in `docs/mvp-proposal.md` — not just this
  project's judgment call, but the program's own sequencing.
- **The AKB Golden Evaluation Set *is* the "8–15 real questions" ask from the
  MVP proposal, at official scale (50+) and with an owner (this stream, not an
  ad-hoc experiment).** These aren't two separate asks — building toward the
  AKB set satisfies both. Worth building the smaller MVP set as a first slice
  toward the same 50+ target rather than as a disposable one-off.
- **Milestone 1.1 claims "in progress" for canonical content curation; this
  repo's `kg-content` has zero entities.** Either the "in progress" work is
  happening outside this repo (plausible — the workflow/tagging/tooling
  decisions could count as progress before any entity exists), or the tracker
  is ahead of the actual repo state. Worth confirming which, rather than
  assuming either.
- **A real gap this repo's decision log doesn't cover: Claude Cowork.**
  Milestone 1.1 explicitly calls for defining how Rovo, Claude Code, *and*
  Claude Cowork collaborate. This repo's design (`claude-code-access`) only
  accounts for Claude Code and Rovo. Claude Cowork's role is currently
  undefined here.
- **A promising, uninvestigated lead for the AKB question set:** the Activity
  & Learning Log on the source page references three prior experiments —
  "Does this design need sparring?", an NFR Enrichment Analysis, and a PRD
  Readiness Analysis/Framework — which may already contain real,
  Tyro-specific architecture Q&A usable toward the golden set, rather than
  needing to be authored from scratch.
