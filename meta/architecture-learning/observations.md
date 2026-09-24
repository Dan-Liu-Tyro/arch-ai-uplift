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
- 2026-09-15 · Chose to rename the repo so the name matches what it now
  holds, rather than keeping the name and treating the added tiers as
  lodgers: "I think we should rename the repo to match arch-ai-uplift is
  more appropriate for this" — offered unprompted when asked how the README
  should declare the repo's identity · this conversation · stated ·
  unpromoted — the option chosen was the one I described as costliest
  (breaking clones, remotes and links), and I had marked a *different*
  option "(Recommended)", so this is unconfounded by deference. Paired with
  choosing the ~55-line router over a comprehensive README, the consistent
  preference is for an artefact that states what is actually true over one
  that preserves an earlier framing or front-loads convenience. Worth
  watching against the reverse case: whether a *stale but widely-cited*
  artefact would also get renamed/corrected, or whether cross-reference
  cost wins there — `docs/program-roadmap.md`'s pending relocation (next
  step 12) is the natural test, since it is cited by path from many log
  entries.
- 2026-09-18 · Rejected a three-valued scope tag in favour of a binary tag
  whose UI switch *dims* rather than filters, when offered
  `acquirer-specific | tyro-wide | both` as the "recommended" option against
  binary-plus-dimming and strict-binary-filter · this conversation · stated ·
  unpromoted — I had argued that a strict binary forces a false choice on
  shared domains (Customer, Funds Movement, Billing) and recommended adding
  `both`. The choice made was neither of my framings' conclusions: keep the
  model binary and coarse, but fix the *view* so coarseness costs nothing,
  because "a domain filtered out of an acquiring view is often exactly the
  boundary you are trying to see." Pattern to watch: when a modelling
  objection is raised, the preferred resolution may be to absorb it in
  presentation rather than to add a category to the model — which is the same
  instinct as the earlier lean-domain-modelling choice (add fields only when
  real use exposes a gap), applied to enums. Would be contradicted by a future
  case where a middle category is added to the data rather than handled in a
  view.
- 2026-09-18 · Stated the standard the visualization had to meet as fitness
  for a task, not richness: "3D should fit the purpose of usefulness. Not just
  fancy" — then specified usefulness concretely as group show/hide, a laid-out
  2D plane as the default, ordering that follows the real payment flow, and
  selecting a node revealing its neighbours *with the relationship described* ·
  this conversation · stated · unpromoted — note the requested features are all
  about *reading* the graph (filter, order, label, explain), none about visual
  richness, and the one explicitly 3D thing already built was demoted to a
  toggle. Consistent with the preference for artefacts that state what is
  actually true (the unresolved-reference count kept visible on screen) over
  ones that look finished. Related principle already recorded:
  `principles/generated-outputs-are-not-sources.md`.
- 2026-09-23 · Repeatedly resolved a problem by *removing* machinery rather
  than adding to it, across three separate decisions in one session: dropped
  the local HTTP server entirely ("if we completely drop the idea of having
  server at all... Any problem with that?"), dropped the auto-loaded data
  blob in favour of an explicit file picker ("make the vis graph viewer start
  with empty, allow to open and browse for any compatible graph"), and
  required the last remote dependency be vendored locally ("I want this graph
  viewer is offline completely") · this conversation · stated · unpromoted —
  worth recording because in each case my own instinct had been to *add*: a
  cache-busting URL scheme for the server, a generated JS wrapper so the page
  could auto-load, a three-CDN fallback so one blocked host would not be
  fatal. All three additions were superseded by a removal that made the
  problem not exist. The pattern predicts a preference for deleting a
  component over hardening it whenever the component's job can be done by
  something already present (here: the filesystem, and a file dialog). Would
  be contradicted by a case where they choose resilience machinery over
  removing the thing that needs it.
- 2026-09-23 · Chose pragmatic sequencing over architectural purity when
  offered both, picking "vendor now, SVG renderer later" over dropping the
  third-party renderer immediately · this conversation · stated · unpromoted
  — I had recommended the dependency-free option and named a strong argument
  for it (an SVG renderer emits inspectable text, so its output could be
  verified without a human looking at a screen, which is the constraint that
  had cost six browser round trips). The reply took the working-today path
  and parked the better end state in the backlog. Read alongside the
  removal-over-addition pattern above, the ordering seems to be: get it
  working, keep the cleaner design as a named follow-up rather than a
  blocker. Tension worth watching — the same person who removes machinery on
  principle also declines to remove it when doing so would delay a working
  artefact.
- 2026-09-24 · Separated "the data layout is right" from "the framing around
  it is wrong," and constrained the fix to the framing · this conversation ·
  stated · unpromoted — asked for stage band boundaries to be left-aligned,
  and pre-empted the obvious alternative in the same breath: "I still like
  the entire nodes distribution, so may just need to expand other boundaries
  to align with longest on left." Moving nodes would also have squared the
  edges up, and would have been the easier change; it was ruled out because
  the node positions carry meaning the chrome does not. Fits the
  earn-its-form pattern — the diagnosis was that ragged edges make three
  lanes of one process read as three unrelated stacked regions, i.e. a
  correctness claim about what the picture says, not a taste preference.
  Would be contradicted by a case where they accept relayouting the data to
  satisfy a purely presentational constraint.
- 2026-09-24 · Second instance of ship-now-park-the-cleaner-design: accepted a
  known-unstable layout tie-break rather than fix it while it was cheap ·
  this conversation · stated · unpromoted — told that `row` in the generated
  layout derives from entity enumeration order rather than from meaning, so
  regenerating after an unrelated `kg-content` edit can reshuffle nodes, the
  reply was "It's good enough for now, and we can add manual adjustment
  later." Notable because the cost of fixing it rises with time and that was
  said explicitly in the offer — the reshuffle-once price is lower today than
  after the layout carries more expectations — and the answer was still to
  defer. Reinforces the 2026-09-23 vendor-now-SVG-later entry above; the
  pattern now has two independent instances and a consistent shape (take the
  working artefact, name the better end state as a follow-up rather than a
  blocker). Worth watching for the case that would contradict it: a
  correctness or data-integrity risk, rather than a structural-cleanliness
  one, where deferring may not be acceptable.
- 2026-09-24 · Source-of-truth-first: chose a durable document as the artefact
  and treated every presentable format as a generated view of it · this
  conversation · stated · unpromoted — asked for a CTO presentation on AI-DLC,
  and when offered a choice of output format answered "we can work on markdown
  as the source of truth for this solution architecture, later it can output as
  confluence page, in the meantime, the pressing need to base on this md to
  generate a presentation slide by slide." Notable for two reasons. First, the
  same instinct as decision 5 (curate in git, generate Confluence outward) and
  as `kg-viz`'s regenerable `payments.json` / `knowledge-visualizer.html`,
  now applied to a non-software deliverable — so the pattern looks like a
  general preference rather than a KG-specific one. Second, they declined
  rendering effort until the narrative stops moving, which is the same
  defer-the-polish shape as the two ship-now entries above but inverted in
  effect: here deferring *protects* the artefact rather than accepting debt in
  it. Would be contradicted by a case where they author directly in a
  presentation tool and treat the deck as the thing to keep.
- 2026-09-24 · When new scope arrived for an existing deliverable, extended the
  one artefact rather than forking a second one · this conversation · stated ·
  unpromoted — told that the leadership ask had a second, undrafted deliverable
  and offered it as either a section inside the existing document or a separate
  deck, answered "I think we can add another slide near the end talking about
  deliverable 2." Distinct from the source-of-truth-first entry above even
  though it is the same conversation: that one was about *where* content lives,
  this is about *what happens when scope grows* — the default is one artefact
  absorbing it, not a matching set of artefacts mirroring the request's
  structure. Consistent with `least-infrastructure-first`, applied to documents
  instead of systems. Would be contradicted by splitting a deliverable into
  parallel artefacts because the request naming two things was itself treated as
  the reason to produce two.
