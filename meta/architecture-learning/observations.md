# Observations

Append-only raw capture. One entry per observation, newest at the bottom, never
edited in place. Cheap to add: a shell append needs no read of this file, so
capturing costs effectively nothing.

An observation is promoted to `principles/` the first time it looks worth tracking
as a hypothesis or preference — even from one instance, since the point of tracking
is watching whether *later* evidence supports or contradicts it. Promotion sets
`status: active`; it does not require repetition first. Repetition is what moves an
entry from `active` to `reinforced` — see `INDEX.md` for the status vocabulary.

Format, one line each:

```
- YYYY-MM-DD · what was observed · evidence in brief · → supports:<id> | contradicts:<id> | unpromoted
```

`supports:<id>` and `contradicts:<id>` both mean "add this to the named principle's
evidence list" — the direction matters, because a contradiction changes that
principle's `status` and must not be silently absorbed as if it agreed.

## Log

- 2026-08-17 · Chose flat files over a graph DB with a named revisit condition · decision log, decision 1 · → supports:least-infrastructure-first
- 2026-08-17 · Framed the whole project as replacing noisy pages with a curated, gated corpus · decision log problem/goal · → supports:curation-over-accumulation
- 2026-08-17 · Asked for components sized for later promotion out of the repo · "so that later... promoted to other projects" · → supports:structure-for-extraction
- 2026-08-17 · Asked for a meta tier above the core project · same session, one level up · → supports:structure-for-extraction
- 2026-08-17 · Reverted a settings workaround to stay aligned with org config · "I've reverted the settings to align with org" · → supports:org-alignment-over-convenience
- 2026-08-17 · Pressed three times for a demonstration rather than an explanation of git state · sync / local-sync / git-pull exchange · → supports:verify-state-claims
- 2026-08-17 · Delegated commit mechanics standing, kept branch naming and merges · "manage git for me... when you see fit" · → supports:delegate-mechanics-retain-judgement
- 2026-08-17 · Asked for instrumentation with no present question, for later strategy · "so we have data to reason about... later" · → supports:instrument-before-the-question
- 2026-08-17 · Accepted the PR gate after an internal-consistency argument, having explored bypassing it · main-branch exchange · → supports:curation-over-accumulation
- 2026-08-17 · Accepted a name-based referencing fix after positional references broke · decision-log renumbering · unpromoted — one instance, plausibly just agreeing with a fix
- 2026-08-18 · Ranked foundation work above starting the visible project work, when pushed twice to start · "It's ok to get foundation right before rushing into working on the project itself" · → supports:foundation-before-features
- 2026-08-18 · Treated token efficiency as a design constraint on a meta component, not an afterthought · asked for the record-keeping structure to be designed "in token saving in mind" · unpromoted — overlaps instrument-before-the-question; may be its own principle about efficiency as a first-class constraint
- 2026-08-18 · Separated two record-keeping layers by how fast each changes behaviour · procedural memory "change your behaviours instantly" vs architecture learning "mostly curating" · unpromoted — one instance, but a distinctive way to cut a design; watch for repetition
- 2026-08-18 · Rejected the premise that best practice is knowable in advance; asked for decisions to be tracked as hypotheses with support/contradiction over time · "it's unclear whether we can see it clearly beforehand... make those decision as hypothesis" · → supports:evidence-over-assumed-best-practice
- 2026-08-19 · Questioned whether already-built token-tracking earns its cost against the built-in usage view, willing to let it run before judging · "we might need to keep running for a while... or simply burn token for nothing" · unpromoted — audits standing infrastructure's payoff after the fact rather than deciding whether to build it; overlaps instrument-before-the-question but tests it in reverse
- 2026-08-19 · Deferred the dashboard idea to a backlog file with a named revisit trigger rather than building it now · "put it as a feature item in backlog for later inspection" · → supports:least-infrastructure-first
- 2026-08-19 · Required project decisions to be written into repo docs rather than left in Claude's own memory · "it needs to be remembered at project level, not just in your memory" · → supports:decisions-are-artifacts
- 2026-08-17 · Backfilled from transcript audit: parked GitHub-connector availability as an open decision-log question rather than resolving or dropping it · "forget about github connector for now, mark it as a task later to figure out" · → supports:decisions-are-artifacts
- 2026-08-17 · Backfilled from transcript audit: proposed a long-lived milestone-gated branch instead of a PR per change, naming the milestone as the revisit trigger · "create branch called plan just so we can keep working on this... until we reach a milestone" · → supports:least-infrastructure-first
- 2026-08-17 · Backfilled from transcript audit: left architecture-learning's consumer undecided by design, the same decouple-now/choose-later instinct as the core/integration split · "the consumer could later be decided, for example... memory, claude.md... or... architecture agent" · → supports:structure-for-extraction
- 2026-08-19 · Backfilled from transcript audit: brought an independent AI-generated critique of the project plan for review and held off any implementation until it was assessed · pasted a structured outside plan, asked to "let me know what you think... before actually doing any changes" · unpromoted — single instance; distinct from evidence-over-assumed-best-practice (hypothesis-tracking, not seeking outside cross-checks) and verify-state-claims (system state, not design validation)
- 2026-08-19 · Returned to and asked to close out a previously-dropped analysis thread (the external critique) once flagged, rather than letting a completed assessment go stale unread · "yes, good catch, where do we start?" · unpromoted — single instance, plausibly just good hygiene rather than a distinct pattern; watch for repetition
- 2026-08-19 · Pushed back on fetching full Confluence page content, preferring a thin structural layer referencing existing pages over duplicating their information · "shouldn't we build another layer of data structure on top of it instead of duplicating information?" · unpromoted — single instance; may overlap with the provenance-vs-integration-state split already in SCHEMA.md rather than being new
- 2026-08-19 · Asked to read and understand Arc's actual Rovo implementation before documenting or building a local counterpart, rather than designing from assumption · "ask me any questions before documenting it" · → supports:verify-state-claims

- 2026-09-07 — **stated** — Given a leadership slide to "work on," the user
  accepted a critique-first pass and then chose the *harder* option on the one
  question where a roadmap milestone was at stake: asked whether to restore
  program milestone 1.3 in Q2 (the low-friction, no-re-baseline path) or keep a
  net-new capability and re-baseline the roadmap, they chose to re-baseline
  ("Keep Vendor DD in Q2, re-baseline roadmap"). On the same turn they took the
  *conservative* option on Jira IDs — no placeholder IDs on a leadership slide,
  mark capabilities indicative instead. Evidence: AskUserQuestion responses,
  session 2026-09-07. The pattern worth tracking: willingness to pay
  coordination cost to keep a plan honest about scope, paired with unwillingness
  to let a slide imply commitments that don't exist in the tracker. Both point
  the same way — the artifact should not overstate certainty — but they trade
  off differently against effort, so this is two data points, not one.
- 2026-09-11 · Asked for a new general-purpose capability
  (`idea-to-presentation`) to live under `meta/`, and when challenged twice
  that this conflicted with `meta/`'s documented "observes, never
  participates" charter, chose to amend the charter itself rather than
  relocate the capability to `components/` · "I want this new capability
  live within meta folder just like other capability with meta" · unpromoted
  — single instance; distinct from other structure-for-extraction evidence
  because it's the user redrawing the categorization boundary itself, not
  just accepting or rejecting a placement within an existing one. Decision
  22, `docs/decision-log.md`.
- 2026-09-11 · Immediately after that same decision was accepted, corrected
  the model's own restatement of the boundary from mission-specificity to
  product-delivery · "those components are becoming the building blocks to
  ship the architecture agent product... meta capabilities... could
  potentially be abstracted as general purpose capabilities beyond this
  project but not as part of the delivery" · unpromoted — single instance;
  shows the precision-correction habit continuing past the point the
  substantive decision was already settled, not just at the decision point
  itself.
- 2026-09-11 · Proposed a new meta component (CDCD) for the collaboration
  methodology itself, then, when challenged that it might just revive the
  deprioritised architecture-learning, drew a precise subject-matter line
  rather than conceding or blurring it: "architecture learning can make you
  a better architect next time, but CDCD talks about... how we co-create
  the system together" · this conversation · unpromoted — single instance,
  but the same "defend the boundary with a sharper distinction rather than
  abandon it" move as the mission-specificity/product-delivery correction
  above; watch for repetition across different boundary disputes.

- 2026-09-14 · Framed cost control as a utilisation target rather than a
  minimisation one — "max out the credit use about 90% on cycle end while not
  exceed the limit," with the explicit goal to "improve the overall effective
  output on a cycle while keep it under control" · this conversation ·
  stated · unpromoted — single instance, but a notably different instinct
  from the usual engineering reflex to minimise spend: treats an unspent
  allocation as waste rather than as saving, which is the same
  capacity-utilisation reasoning an architect applies to provisioned
  infrastructure. Watch whether it recurs when the resource is something
  other than credits (headcount, compute, a review budget).

- 2026-09-14 · Chose a new top-level `practice/` tier over three cheaper
  existing homes (`docs/`, `meta/`, `kg-content` entities), and chose the
  deeper of three deliverable scopings for IN-563 — building an activity
  layer beneath the practice roadmap rather than contributing to the
  existing page or scoping to the AI-opportunity half · this conversation ·
  inferred · unpromoted — **weak evidence, flagged as such**: both were
  selected from a menu where I had marked those same options
  "(Recommended)", so the choice is confounded with deference and says
  less about taste than an unprompted preference would. Worth re-testing
  the same trade-off (pay structural cost to keep a categorisation test
  clean, vs. reuse an imperfect existing home) in a case where I recommend
  the *cheaper* option, which would separate the two readings.
- 2026-09-14 · Reframed an authority question into a governance one: asked
  whether to replace our maturity ratings with the Head of Architecture's, then — before I
  answered — redirected to "treat what's [the Head of Architecture]'s comments as validation
  checkpoints to plan and track the progress of this piece of the work",
  with completeness and maturity-scale as the worked examples · this
  conversation · stated · unpromoted — **unconfounded evidence**, unlike the
  2026-09-14 entry above it: this was volunteered against the direction I
  was visibly heading (I was preparing to argue for authoring our own
  ratings with the Head of Architecture's as a cross-check), so it reflects the user's own frame
  rather than deference to a menu I wrote. The move is the interesting part:
  where the question was "whose content wins", the answer supplied was "at
  which gate does the stakeholder decide", which turns a one-off
  authority contest into a repeatable process with tracking. Worth watching
  whether this generalises — a preference for converting content disputes
  into review-point design — because it would predict how they want other
  externally-owned dependencies handled (`docs/program-roadmap.md`, the
  slide-26 pack, IN-562…IN-570).
- 2026-09-14 · Treated "visualise our processes as a flow diagram - so its
  easier to consume and socialise" as a first-class deliverable of the
  capability assessment, not a presentation nicety, and named it as a
  validation checkpoint alongside completeness and maturity-scale · this
  conversation · stated · unpromoted — pairs with the same turn's insistence
  that the process map's Inputs/Outputs columns be *validated* rather than
  rebuilt. Both point the same way: an artefact's value is in being
  consumable and agreed by others, so the work is making an existing shared
  artefact correct and legible rather than authoring a parallel one. Watch
  whether this recurs, because it cuts against the instinct to model
  something afresh in the repo where a Confluence page already carries it —
  and it would predict a preference for generated views over new sources.
