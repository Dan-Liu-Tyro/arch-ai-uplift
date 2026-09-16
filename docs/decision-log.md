# Decision Log

Running record of the design discussion for the Architecture Knowledge Graph.
Kept as a living doc — append/update as decisions firm up or change. Not final;
explicitly open to revision as constraints become clearer.

This project is one stream's work within the org's wider Architecture AI
Uplift program. See [`docs/program-roadmap.md`](program-roadmap.md) for the
program's own milestone tracker and evaluation plan (the AKB) — read that
before assuming this repo needs to invent its own success criteria or
sequencing from scratch.

## Problem

- Architecture stream (AI uplift program) built a Rovo-based agent, **Arc**
  (Atlassian), that solution designers open from within Confluence to
  review/update design docs against org architecture principles, guardrails,
  and patterns. Arc is already built and in daily use, with observed benefit.
- Canonical architecture knowledge currently lives across 100+ Confluence pages
  of inconsistent quality. Rovo's RAG grounding inherits that noise — hard to
  control what counts as canonical.

## Goal

Build a local knowledge graph as a curated "brain" of architecture knowledge —
structured, git-reviewed, usable by both AI agents and humans — to ground
architecture Q&A and design-doc review/update, instead of relying on raw
Confluence RAG quality.

## Primary use case

Solution designer works on a Confluence design doc, opens the Rovo agent, asks
it to review or update the doc grounded in org architecture principles,
guardrails, and patterns — with answers/actions grounded in the KG rather than
noisy source pages.

## Why a graph (not just cleaner docs)

Typed relationships let us do things flat/page-level RAG can't:
- `pattern REQUIRES guardrail`
- `principle CONFLICTS_WITH pattern`
- `decision SUPERSEDES decision`
- `system USES pattern`

This enables contradiction detection (conflicting guardrails), dependency
tracing, and consistency checks across design docs — the differentiator over
plain RAG.

## Index by area

Hand-maintained, not generated — add a row when a decision is appended.
Purely a finding aid; the numbered entries below are the actual record, and
cite each other by name, not number, since this index is exactly the kind
of second copy that could drift otherwise. Mirrors the raw-entries/index
split `meta/architecture-learning` already uses for the same reason, at a
scale that doesn't yet justify that component's `reindex.py` tooling.

| # | One line | Area |
|---|---|---|
| 1 | File-based storage, not a graph DB | `kg-core` |
| 2 | Decouple KG core from integration layer | `kg-core`, component-model |
| 3 | Components over one application | component-model |
| 4 | `meta/` tier for self-observation | `meta` |
| 5 | Confluence flow: curate in git, publish out | `confluence-publish` |
| 6 | Two-agent model (Arc + Claude Code); 3-step local roadmap | `local-agent` |
| 7 | Trusted/General two-tier citation model | `local-agent` |
| 8 | `procedural-memory` splits lessons/universal | `meta/procedural-memory` |
| 9 | Arc Lite formalized as a persisted subagent | `local-agent` |
| 10 | Local-only HTML relay UI for Arc Lite | `local-agent` |
| 11 | Arc Lite reframed; live Confluence **read** access | `local-agent` |
| 12 | Knowledge-base ownership split vs. the tagging programme | program/org |
| 13 | Q2 FY27 re-baselined (Vendor DD displaces milestone 1.3) | program roadmap, Jira |
| 14 | Q2–Q4 capabilities carry no initiative IDs yet | program roadmap, Jira |
| 15 | Approved capability-stream plan becomes source of truth | program roadmap |
| 16 | IN-566–569 repurposed for slide 26's Q3/Q4 capabilities | Jira |
| 17 | Arc Lite mechanical compliance check + `gap-log.md` | `local-agent` |
| 18 | Arc Lite's first skill: native Claude Code Skill | `local-agent` |
| 19 | `arc-lite-identity` ported verbatim (disclaimer exception) | `local-agent` |
| 20 | `Skill` tool grant added to `arc-lite.md` | `local-agent` |
| 21 | Constitution collapsed into native shape; `local-agent` now depends on `kg-content` | `local-agent`, `kg-content`, component-model |
| 22 | `meta/`'s charter widened to general-purpose capabilities | `meta` |
| 23 | Status/related-work findable per component, without a new dashboard file | component-model, all READMEs |
| 24 | Scaffolded `meta/CDCD` to evidence conversation-driven co-design | `meta` |
| 25 | Credit-budget control on the authoritative pool; credits are overage, not an allowance | `meta/token-tracking` |
| 26 | New `practice/` tier; IN-563 capability maturity assessment | `practice`, component-model |
| 27 | The Head of Architecture's review modelled as validation checkpoints; they are IN-563's plan of record | `practice/capability-maturity` |
| 28 | IN-563 re-grounded on the Process Map; AI-maturity scale; four real checkpoints; no personal names | `practice/capability-maturity`, CLAUDE.md |
| 29 | Root README is a router, not a summary; repo rename agreed in principle | `README.md`, repo identity |
| 30 | First bulk-ingestion experiment: full domain set, lean entities | `kg-content/entities/domains/`, `kg-core/SCHEMA.md` |
| 31 | Added `kg-viz`, read-only 3D graph visualization | `kg-viz`, `component-model.md` |
| 32 | `domain` storage consolidated to one JSON-Schema-backed file | `kg-content/entities/domains.json`, `kg-core/schemas/` |
| 33 | Rename executed: `arch-knowledge-graph` → `arch-ai-uplift` | repo identity, `kg-core/schemas/`, `architecture-learning/README.md` |

## Decisions so far (tentative — open to change)

1. **Storage: file-based, not a graph DB (for now).** Markdown + YAML
   frontmatter, git-versioned. Rationale: hundreds of nodes is well within
   what flat files + git can handle; PR review becomes the quality gate
   (fits org change-management norms); zero extra infra. Revisit a real graph
   DB / query API only if traversal needs outgrow flat-file lookup.
2. **Decouple KG core from integration layer.** Core = schema + storage +
   query logic. Integration layer = (a) Confluence ingest/curation inbound,
   (b) Confluence publish + Rovo-facing grounding outbound, (c) local access
   for Claude Code. Goal: swapping "local file reads" for "a deployed query
   service" later is a transport change, not a redesign.
3. **Repo is structured as loosely coupled components, not one
   application.** Six components under `components/`, each with a README
   stating its purpose, boundary, dependencies, and extraction notes.
   Rationale: some of these will outgrow this repo and be promoted into their
   own project or handed to another team — most likely `query-service`, which
   is the only one needing its own deployment lifecycle — so extraction should
   be a move operation rather than an untangling exercise. Dependencies point
   inward to `kg-core`; integration components never import each other. This
   is the structural expression of decision 2. Full rules in
   `docs/component-model.md`.
4. **A `meta/` tier for components that observe the project.** Separate
   from `components/`, holding work that accumulates knowledge about *how we
   work* rather than about Tyro's architecture: `architecture-learning` (an
   evidence-based record of demonstrated architectural style, so later work
   can apply it deliberately instead of guessing) and `token-tracking`
   (granular token consumption, so task cost can be reasoned about from data).
   Hard rule: `components/` must never depend on `meta/`, since that would tie
   an otherwise extractable component to this project's history. Both meta
   components are built around evidence and provenance — cited observations,
   derived metrics — because the failure mode for both is plausible-sounding
   records nobody can verify.
   - `architecture-learning`'s goal is a **"digital architect"** that grows
     more aligned with use, consumer-agnostic so the consumer can be chosen
     later (session memory, `CLAUDE.md`, or the architecture agent this
     project is building). Export is one-way — curate here, copy outward — so
     there is one reviewable source. It records *how* decisions get made and
     which counter-arguments were accepted, not only conclusions, because a
     profile optimised for agreement cannot challenge its subject, and being
     challenged is an explicit requirement.
   - `procedural-memory` holds operational lessons — mistakes made here and
     the rules that prevent them — and is separate from
     `architecture-learning` because the two differ in subject and urgency:
     the former records the agent's own errors and must take effect
     immediately, the latter models the user's reasoning and has no consumer
     yet. The load-bearing part is the pointer from `CLAUDE.md`, since a repo
     file changes nothing by existing; rules whose violation is expensive are
     stated inline in `CLAUDE.md` rather than only in the component.
     `architecture-learning` is explicitly deprioritised behind the
     challenging-thinking-partner behaviour.
   - Refined `architecture-learning` again: every entry is a tracked
     hypothesis or preference, never a settled conclusion. Rationale stated
     directly — "it's unclear whether we can see [best practice] clearly
     beforehand", so decisions should be tracked individually over time and
     marked as supported or contradicted as new evidence arrives, building
     intuition from a track record rather than asserting one. `form`
     (`hypothesis`/`preference`) is tracked separately from `kind` (subject
     matter), and `status`
     (`active`/`reinforced`/`contested`/`revised`/`abandoned`) replaces a
     hand-set confidence level. The index generator enforces the one invariant
     that matters: contradicting evidence can never sit under an
     unacknowledged status.
   - `token-tracking` reports cost by day, rolling five-hour window
     (matching how usage limits are enforced), git branch, effort level, and
     model. Plan allowance is **not** available locally — verified against the
     transcripts — so the budget figure has to be supplied by the user.
     Attribution to features is solved by the `gitBranch` field already
     present in the data.
   - Added `docs/backlog.md` for feature ideas that are deferred, not
     decided against — a dashboard for component/feature status was the first
     entry, parked because at six components and no code the existing docs
     already answer "where are we." Made explicit in `CLAUDE.md` that project
     state (decisions, backlog items, component contracts) must be written
     into the repo, never left only in Claude's cross-session memory, since
     the repo is what a future session or a teammate can actually read.
   - Split `architecture-learning` capture into two mechanisms with
     deliberately different costs: live, near-zero-cost append to
     `observations.md` during conversation (the default — a lapse in following
     this during one session is what prompted the split), and a separate,
     occasional audit/backfill pass over stored session transcripts
     (`~/.claude/projects/<slug>/*.jsonl`, the same source `token-tracking`
     already reads, via the new `architecture-learning/extract_transcript.py`)
     for whatever live capture missed. Transcript retention is unverified
     beyond "present today back to project start" — no rotation/cleanup policy
     is known — so backfill is best-effort recovery, not a substitute for live
     capture.
   - **Added a fourth meta component, `perception-failures`, then explicitly
     decided to keep it separate from `architecture-learning` rather than
     merge them — for now.** Raised 2026-09-08 by the user after catching a
     live instance (Claude asserting `.claude/agents/` was blanket
     write-protected, an overgeneralization of a narrower real finding) and
     asking that this kind of incident be tracked toward an eventual
     paper/essay on how an agent's incorrect perceptions form and get
     caught. The user then asked directly whether it should just be folded
     into `architecture-learning`, since both are slow, evidence-based,
     no-consumer-yet trackers. Kept separate on the strength of this
     decision's own precedent, quoted back: `procedural-memory` stays out
     of `architecture-learning` because "the former records the agent's own
     errors ... the latter models the user's reasoning" — a subject-matter
     split, not a mechanism split. `perception-failures` is squarely
     agent-subject, so merging it into the user-subject component would
     cross the one axis this project had already decided was load-bearing.
     The one real point in the merge's favor — reusing
     `architecture-learning`'s observations/principles/`reindex.py`
     machinery rather than building fresh — was already handled the way
     `procedural-memory` handled the same question: reuse the *pattern* at
     low volume without merging the *directory*, revisiting only if volume
     or a real cross-instance pattern justifies it.
     - **Not a closed question.** The user asked to keep it separate "for
       now" and revisit later, not permanently. Revisit if `meta/`
       component sprawl becomes its own maintenance burden, or once
       `perception-failures/log.md` has enough entries that its shape (or
       lack of one) is actually visible — not on a fixed date.
5. **Confluence flow (planned direction, not yet designed in detail):** curate
   truth in the local git KG → generate structured pages (one per entity,
   consistent template) → publish into a dedicated Confluence space (user has
   control over creating this) → Rovo indexes that clean space for grounding.
   Architects edit the git source of truth, not raw Confluence, to preserve
   quality control.
   - Not started, not urgent — no component work has begun on this. If an MVP
     experiment happens first (see `docs/mvp-proposal.md`), it tests the
     hypothesis by annotating existing pages, not by building this pipeline.
6. **Two-agent model: Arc (Rovo) for daily retrieval, Claude Code for local
   structured grounding.** Arc already works and is used daily, but has no
   reliable local folder structure to ground its behaviour/skills, and no
   structured-information storage — that gap is what this project exists to
   fill, not a replacement for Arc. Confluence is currently the **only**
   channel between the two agents: the Atlassian MCP connector can read/write
   Confluence but cannot invoke or query Rovo/Arc directly, and a deployed
   query-service is milestone 2.1+ (`docs/program-roadmap.md`), not now. Any
   near-term exchange in either direction happens by reading or writing a
   Confluence page — there is no live channel yet. Investigating better,
   more direct communication between Claude Code and Rovo-based agents is a
   deliberately separate, deferred task — see `docs/backlog.md` — not part of
   the current MVP.
   - **Three-step local roadmap for closing the gap, each step required to add
     visible business value on its own** rather than deferring value to a
     final delivery:
     1. Claude Code reads Confluence directly (current). Open question:
        what can Claude Code add on top of what Arc already provides —
        not duplicate Arc's retrieval.
     2. Arc calls on Claude Code for a capability that facilitates Arc's own
        service. Mechanism not yet decided.
     3. Arc sends information to Claude Code for reliable local storage.
        Mechanism not yet decided.
   - **Both this local roadmap and the program's own phase/milestone roadmap
     (`docs/program-roadmap.md`) are guiding, not fixed — but changing either
     one requires the user's explicit approval before it's edited here.**
     Discovery may reveal a different priority is more valuable; that is a
     reason to propose a change, not to make one unilaterally.
7. **Grounding answers with a two-tier citation model — Trusted vs. General —
   set by source, not by the model's self-rated confidence.** Content drawn
   from the local curated Constitution/canonical sources is always labeled
   Trusted; content fetched live from Confluence/Jira via MCP is always
   labeled General and flagged as needing human validation before being
   relied on. The tier is mechanical (which store the content came from),
   never a per-answer judgment call, because an LLM's own confidence in what
   it just read is not reliably calibrated enough to gate trust on its own.
   - **Explicit tradeoff accepted:** an agent that only answers from curated
     sources would be safer but, with canonical-source coverage still thin,
     too limited to get used at all. Offering clearly-labeled General-tier
     answers alongside Trusted ones lets the agent be useful now while
     curation catches up, instead of withholding help until coverage is
     complete.
   - **Known gaps accepted for now, not solved by this decision:** staleness
     of cited Confluence pages (no version/last-modified check at fetch
     time), and coverage (only pages a canonical-source entry already links
     to are reachable this way — open-ended CQL search is still a fallback
     outside this tiering, not yet reconciled with it). Parked in
     `docs/backlog.md`.
   - Not yet implemented: no citation format, label rendering, or
     canonical-source pointer schema decided. Implementing this will expand
     `components/local-agent`'s documented boundary (currently "grounded
     only on the files in `constitution/`") to include live-fetched
     General-tier references — update that component's README boundary in
     the same change that implements it.
8. **`meta/procedural-memory` splits into `lessons.md` (project-specific) and
   `universal.md` (generalizes beyond this project) — Claude's cross-session
   memory is no longer a second master to keep in sync with it.** Mirrors
   the raw/promoted split `architecture-learning` already has, without that
   component's index-and-reindex tooling, since at ten entries a plain
   two-file split is enough and every entry here is already curated at
   write time. `universal.md` entries are candidates for manual promotion
   into another project's own procedural memory later — the same
   "move, not automatic reach" pattern already used for promoting a
   `components/` piece out of this repo (`docs/component-model.md`), never
   an automatic sync.
   - **Rejected alternative:** moving project-specific lessons into a new
     `components/procedure-memory`. `docs/component-model.md` defines
     `meta/` as holding what "observes the process of building this
     project" — project-specific lived experience is exactly that, not an
     exception to it — and procedural memory has none of what
     `components/` promotion requires (a stable contract, a real consumer
     in the dependency graph, its own deployment lifecycle).
   - Claude's own cross-session memory is now treated as disposable scratch
     rather than a parallel master: reflected on periodically, with
     anything reusable distilled into `lessons.md` or `universal.md`
     depending on scope, rather than kept in step with the repo by hand.
     This removes the drift risk of maintaining the same fact in two
     unsynced places.
   - **Carve-out, not an exception:** a small set of direct standing
     instructions the user has stated as applying in every session
     regardless of project (e.g. "always challenge my ideas") stays solely
     in pinned Claude memory. Their entire point is to auto-load without
     this repo being open, which no file under `meta/` can do. These were
     never lived experience distilled from working on this project, so
     they were never in scope for this decision.
9. **Formalized Arc Lite as a persisted subagent (`.claude/agents/arc-lite.md`)
   immediately, overriding `components/local-agent/README.md`'s original
   sequencing.** That README had said formalizing a subagent was reasonable
   "once the Constitution content has been used and adjusted a few times, not
   before" — at the point this was requested, the only uses had been two
   synthetic questions invented to demonstrate the mechanism, not real
   architecture questions. The tradeoff was surfaced explicitly and the user
   chose to formalize now anyway rather than wait. The subagent file points at
   `constitution/00-soul.md` through `04-procedure-memory.md` rather than
   duplicating their content, so this doesn't fork Arc Lite's definition —
   editing the constitution still changes its behavior with no subagent-file
   change required. Accepted consequence: the Constitution content is
   correspondingly less battle-tested than the original sequencing intended,
   so early Arc Lite answers deserve more scrutiny until real questions have
   exercised `constitution/02-canonical-sources.md` a few times.

10. **Added a local-only HTML relay UI for Arc Lite
    (`components/local-agent/ui/`), for the user's own single-person use, not
    a multi-user or production surface.** A stdlib-only Python server relays
    `POST /ask` to the same headless `claude -p --agent arc-lite` invocation a
    Claude Code session already makes; a plain HTML/JS chatbox is the
    frontend. No new dependency to install, no deployment, binds to localhost
    only.
    - The user explicitly wants the door left open to a future cloud
      deployment, but asked to seed that as an idea, not build toward it now
      — recorded in `docs/backlog.md` rather than scheduled. The one
      concession to that future made now: the relay logic is isolated
      behind a single function (`ask_arc_lite()` in `server.py`) so
      swapping the local subprocess call for a deployed API is a change to
      one function, not a redesign — mirroring decision 2's "transport
      change, not a redesign" principle for `kg-core`.
    - **Not yet live-verified end to end.** Built and syntax-checked inside
      a sandboxed Claude Code session, but that sandbox blocks both binding
      a localhost port and nested outbound calls to `api.anthropic.com` —
      properties of the sandbox, not evidence against the approach. First
      real run needs to happen outside it, on the user's own machine.
    - If this is ever actually deployed, it stops being a local-only
      concern and the org's real path applies: TAP/CTAP via
      Schooner/Jetstream, GitOps/ArgoCD, promoted dev → staging →
      production via Drydock, same as the `query-service` v2 concern
      already named in decision 2 and the constraint below.

11. **Reframed Arc Lite's trajectory from a disposable grounded-vs-ungrounded
    A/B tool to a potential longer-lived local Arc with its own skill set,
    and — as a direct consequence — gave it live Confluence **read** access,
    reversing part of the "not connected to live Confluence" boundary decision
    6 and this component's README had called non-negotiable.** Surfaced the
    tension explicitly before acting on it: that boundary existed specifically
    so the grounded/ungrounded comparison stayed clean (an "ungrounded"
    answer could otherwise come from a live Confluence search instead of
    genuinely having no source), and so Arc Lite wouldn't drift into
    duplicating Arc/Rovo's own retrieval role, which decision 6 explicitly
    rules out. The user's response resolved the tension by changing Arc
    Lite's intended lifespan, not by dismissing the concern: it's no longer
    scoped as a one-shot MVP experiment to be thrown away, but a candidate to
    grow into a real local agent, for which "local files only, forever" was
    always going to be too narrow.
    - **Scope held deliberately narrow: read, not write.** Arc Lite may now
      search and fetch live Confluence pages. It still may not write to
      Confluence (labels, status badges, or otherwise) — that remains
      gated on confirming a genuinely non-production space first, per
      `docs/mvp-proposal.md`'s existing hard constraint, which this decision
      does not relax.
    - **New concept: an ignore list, separate from `02-canonical-sources.md`'s
      trusted-source vocabulary.** Where `02-canonical-sources.md` says "these
      pages are settled/superseded/conflicting guidance," the ignore list says
      "exclude this page from consideration even if it looks topically
      relevant" (stale drafts, scratch pages, noise) — a different kind of
      judgment, kept as its own file, `constitution/05-ignore-list.md`, rather
      than a sixth status value in the existing vocabulary table.
    - **What this doesn't yet include:** the two inputs the still-`Undecided`
      MVP proposal needs (a real 8–15 question set; known canonical/superseded
      pages to bootstrap the signal) remain outstanding and unaffected by this
      decision.
    - **What needed the user's own hand, not Claude's:** `.claude/agents/`
      is sandbox-write-protected from Claude Code itself (see
      `meta/procedural-memory/universal.md` — not project-specific, so it
      lives there rather than in `lessons.md`), so the actual tool grant and
      constitution-file pointer list in `.claude/agents/arc-lite.md` had to
      be hand-edited by the user; this entry and the constitution-file
      content changes were made by Claude.

12. **Knowledge-base ownership is split by content type: Architecture curates
    its own knowledge in git; the org-wide tagging programme covers only the
    current-state landscape other streams own.** Decided while finishing the
    Architecture stream plan (slide 26 of the CTB pack, `AI SDLC/slide/`),
    which had committed to tagging the existing Confluence/Jira/asset-registry
    estate to 80% (Q3) then 95–100% (Q4) across Architecture, Security,
    Platform and Engineering. That directly contradicted decision 5
    (Confluence as an output, curated in git), and the two strategies compete
    for the same scarce resource — architect curation time.
    - **The split:** the git-curated KG owns knowledge Architecture authors
      itself (principles, patterns, prior decisions, target state) and remains
      the source of truth for it, published outward per decision 5. The
      tagging programme is scoped down to the *current-state landscape* only
      — asset registry and per-domain as-is technology landscape — which is
      inherently other streams' data and cannot be authored in this repo.
    - **Why this over the alternatives:** making the tagging programme the
      plan of record would have made 95–100% coverage of an estate
      Architecture doesn't own a hard gate on Q4, and would have required
      revising decision
      5. Dropping the tagging ladder entirely would have removed the
      current-state landscape that the solution-design capabilities need. The
      split keeps both true and shrinks the ask on other streams to what only
      they can supply.
    - **Consequence for the slide, now written in:** Q2's "Maturity 1" process
      change reads as Architecture curating its own grounding set *plus*
      tagging standards agreed with the other streams, and portfolio-team
      preparation asks Security, Platform and Engineering to nominate an owner
      for their part of the landscape rather than to curate a knowledge base
      wholesale.

13. **Q2 FY27 re-baselined: Vendor/Product Due Diligence stays, displacing
    roadmap milestone 1.3 ("first build-learn-adjust loop closure").** Chosen
    explicitly by the user over the alternative of restoring 1.3 and moving
    Vendor DD to Q3. Recorded here because it is a milestone change, not just
    a slide edit, and `CLAUDE.md` requires those to be approved rather than
    inferred — approval was given.
    - **What this obliges, and has not happened yet:** the Confluence
      milestone tracker and slide 17 (the program's now/next/later view) both
      still show 1.3 in Q2. `docs/program-roadmap.md` is a *snapshot* of the
      Confluence page and is deliberately not hand-edited (see its header), so
      the change has to be made on the Confluence page and then re-fetched.
      Until that happens the pack disagrees with itself.
    - **Resolved 2026-09-08: 1.3 becomes a story (or epic) under IN-564**,
      not a quarter-row capability of its own. Not yet created in Jira — see
      the pending action under Next steps and the preserved description
      below, since the ticket that used to carry this content (IN-565 /
      AIDLC-116) was repurposed for Vendor/Product Due Diligence before this
      was decided.
    - **Reconfirmed the same day** — "1.3 can be merged into one of the
      epic or story within Q2 initiative" — leaving open whether it lands
      as a new epic under IN-564 or a story under the epic already there
      (AIDLC-117). Still not created either way — needs the user's
      go-ahead on the actual create call, per the standing rule that
      new-issue creation is a scope decision, not routine upkeep.

14. **Q2–Q4 capabilities on the Architecture stream plan carry no initiative
    IDs, by choice.** Verified against Jira: only IN-562, IN-563 and IN-564
    exist for Architecture; the five later capabilities (Vendor/Product Due
    Diligence, Solution Architecture Maturity 2 and 3, AI-Drafted Sparring
    Submission, AI-Drafted TPP Impact Analysis) had `(IN-XXX)` placeholders
    with nothing behind them. Rather than raise five initiatives now or leave
    fake IDs on a leadership slide, the placeholders were removed and a
    footnote added: capabilities shown without an ID are indicative, and
    initiatives are raised as each quarter is planned. This is consistent with
    the slide's existing footnote that Q3/Q4 objectives will be revisited off
    Q1–Q2 learnings.

15. **Once the Architecture capability stream plan (slide 26 of the CTB pack,
    `AI SDLC/slide/`) is finished and approved by XLT, it becomes the source
    of truth for the Architecture stream's FY27 goals and milestones —
    `docs/program-roadmap.md` (the Confluence milestone tracker) then needs
    re-evaluating for alignment against it, not the other way round.** This
    reverses the direction that page's own header currently assumes ("re-fetch
    rather than hand-edit if it drifts") for anything the approved plan
    changes. Concretely in scope for that re-evaluation: milestone 1.3's
    displacement from Q2 (decision 13, still pending a Confluence-side fix);
    the M1/M2/M3 solution-architecture maturity ladder now used across the
    slide and across IN-564/AIDLC-117, which doesn't yet appear in the
    roadmap's own milestone language; and whichever other Q1–Q4 wording ends
    up diverging by the time the plan is finished. Not actioned yet — the
    plan itself isn't finished. Tracked in Next steps below.
    - **Snapshot of slide 26's FY27 vision & outcomes, as of 2026-09-08 —
      not settled, expect this to keep moving until XLT approval.** Captured
      here because the working file is being live-edited between turns and
      has already changed twice mid-conversation without notice; recorded
      so this repo's record doesn't rely on memory of an earlier read.
      Current text: *"Clarity and Coherence at AI Speed. Architecture
      guidance arrives at the point of decision, grounded in Tyro's own
      standards, patterns and technology strategy."* Outcomes: *"Faster
      design validation · quality sparring · faster vendor due diligence ·
      Architecture practice that accelerates business growth."* Overall RAG:
      **Green** (the user's own call, made after this log recommended
      Amber — recorded as a disagreement, not silently overwritten).
      - **Open tension worth surfacing again if the wording holds:**
        "technology strategy" is forward-looking (the plan/direction), not
        the current-state grounding ("what's actually built, and why") that
        motivated this rewrite in the first place. It may be answering a
        different, legitimate question — target-state alignment — rather
        than the one originally raised. Not resolved; flagged twice in
        conversation, not pushed further once the user set the direction.

16. **IN-566 through IN-569 — pre-existing placeholders explicitly labeled
    "Phase 2 - [maturity target area N]" / "Phase 3 - [maturity target area
    N]" — were repurposed for slide 26's Q3/Q4 capabilities (Solution
    Architecture Maturity 2/3, Sparring Submission, TPP Impact Analysis).**
    Chosen explicitly by the user over leaving them alone and raising fresh
    initiatives, after I flagged that the "Phase 2"/"Phase 3" labels almost
    certainly refer to `docs/program-roadmap.md`'s own Phase 2 ("Human-in-
    the-Loop," Apr 2027) and Phase 3 ("Human-on-the-Loop," Aug 2027)
    milestones, not to slide 26's FY27 quarters. All four had blank
    descriptions and no linked epics, so — unlike IN-565 — nothing existing
    was actually lost by the rename.
    - **Risk this creates, not yet checked by anyone:** these were most
      likely someone's early skeleton for Phase 2/3's own initiatives,
      created before this slide existed. A fifth placeholder, IN-570
      ("Phase 3 - [maturity target area 5]"), was deliberately left alone as
      the only remaining trace of that skeleton. If Phase 2/3 planning later
      needs its own initiatives, whoever does that planning may find part of
      the ticket range they expected to use already spent on FY27 Q3/Q4
      work, with no note anywhere except here explaining why. Worth a quick
      check with whoever originally created IN-566–570 before this surfaces
      as a surprise.

17. **Arc Lite's grounding contract gets a mechanical compliance check and
    a gap log, rather than relying on the model to follow
    `01-working-protocol.md`'s instructions on trust.** Raised 2026-09-08
    from a discussion with the principal architect about spec-driven
    bounded control for Arc Lite: the runtime should always respect the
    control described in its spec, one experiment being "answer only from
    canonical sources, refuse nicely otherwise," with every refusal
    documented as the trigger for knowledge lifecycle management. Most of
    the refusal behavior already existed (`01-working-protocol.md` steps
    1–5); what didn't exist was (a) any way to verify per-answer that the
    behavior actually happened rather than trusting the prompt, and (b)
    anywhere durable for a refusal or weak citation to land once the
    conversation ended. The user chose, over keeping the constitution
    instruction-only, to add both:
    - **New constitution file, `constitution/06-answer-format.md`:**
      every answer must end with a machine-parseable
      `ARC-LITE-CHECK:` line (`CITED id=... status=...`,
      `LIVE-UNVERIFIED url=...`, or `REFUSAL`). `ui/server.py` parses and
      validates these against `02-canonical-sources.md` and
      `05-ignore-list.md` before the consumer sees the answer, and flags
      (does not block) a failure.
    - **New file, `components/local-agent/gap-log.md`:** every
      `REFUSAL` and every citation below `canonical` status is appended
      there automatically by `ui/server.py`, closing the loop decision 12
      (knowledge-base ownership split) assumed but never built — a
      knowledge owner now has something concrete, generated from real
      usage, to review and act on.
    - **Coverage gap, accepted knowingly:** the mechanical check only
      runs in the `ui/server.py` path. Arc Lite invoked directly as a
      Claude Code subagent (no server in front of it) still relies on
      instruction-following alone, and its answers never reach
      `gap-log.md`. Not fixed now — flagged so it isn't assumed to be
      symmetric.
    - **Discovered in the same pass, unrelated to this decision but found
      while touching these files, and fixed the same day:**
      `.claude/agents/arc-lite.md`'s file-pointer list never actually
      gained `constitution/05-ignore-list.md` when decision 11 said it
      had — Arc Lite had been running without being told to read the
      ignore list. First recorded here as needing a human hand, on the
      belief (from `meta/procedural-memory/universal.md`) that
      `.claude/agents/` was blanket write-protected. The user challenged
      that belief directly — "why would you create a file you can't
      modify?" — and testing it showed the protection only covers
      creating/deleting a path there, not editing an existing tracked
      file's content. Both missing lines (`05-ignore-list.md` and
      `06-answer-format.md`) were added directly the same turn; see
      `components/local-agent/README.md`'s correction note and
      `universal.md`'s correction to the sandbox-write-protection entry
      for the corrected boundary.
    - **Deliberately not built:** blocking a non-compliant answer instead
      of flagging it, and extending the mechanical check to the direct
      subagent-invocation path. Both are named as possible escalations in
      `06-answer-format.md`/this entry, not committed to.
    - **A second, separate drift found while re-checking the first:**
      `arc-lite.md`'s `tools:` line still reads `Read, Grep, Glob` —
      decision 11's Atlassian MCP tool grant for live-Confluence-read
      access isn't actually present in the file, despite that decision
      recording it as added. Unlike the file-pointer list, this one is
      *not* fixed here: expanding a subagent's tool grant is exactly the
      kind of self-authorization this project treats as the user's call
      regardless of what the sandbox permits (see `universal.md`'s
      correction). Left for the user to confirm and apply.
18. **Arc Lite's first skill is a native Claude Code Skill
    (`.claude/skills/arc-lite-identity/SKILL.md`), not a mirror of the real
    Arc's Confluence-page-based skill index.** Raised when the user asked
    to validate whether Arc Lite's skills had been "re-constructed as
    native skills rather than a half-way compromised Confluence pages with
    skill index" — the honest answer was that no skill existed yet either
    way (`constitution/03-skills.md` said "None yet"), so this was a
    green-field choice, not a migration. Chose the native primitive because
    it is git-versioned and PR-reviewable with no live-Confluence
    dependency, consistent with decisions 2 and 3 (git as source of truth;
    Confluence as output, never input) rather than reintroducing the
    dependency those decisions argue against.
    - **`arc-lite-identity`** answers "what's your name" / "who are you"
      questions about Arc Lite itself, grounded on `constitution/00-soul.md`.
      Deliberately trivial — the point was proving the wiring, not solving
      a real need — per `least-infrastructure-first`.
    - **Resolved by decision 20, below: `Skill` was added to
      `.claude/agents/arc-lite.md`'s `tools:` line as an explicit,
      user-granted exception** to this same rule, not a user hand-edit.
      Still open and unaffected by that: decision 17's "second, separate
      drift" — the Atlassian MCP tool grant for live-Confluence read
      (decision 11) — is still missing from the same `tools:` line.
    - **Coordination note:** raised and resolved while at least one other
      Claude Code session was active on this same repo (started minutes
      earlier). The user confirmed proceeding anyway rather than checking
      with that session first; worth reconciling if that session was also
      touching `components/local-agent/` or `constitution/03-skills.md`.
19. **`arc-lite-identity` is ported verbatim from Arc's real content, as
    a deliberate, scoped exception to the non-affiliation disclaimer
    `00-soul.md`, the README, and `arc-lite.md` all currently call
    non-negotiable.** The user asked for Arc Lite's "tell me your name"
    output to exactly match what the real Arc would say, explicitly not
    differentiating Arc from Arc Lite "in this sense yet." Flagged
    directly as a conflict with language stated as absolute in three
    separate files before acting, rather than loosening it quietly. Given
    three options — a scoped exception just for this skill, dropping the
    disclaimer rule generally, or keeping the disclaimer while only
    matching tone/content — the user chose the scoped exception.
    - **Source, fetched live via the Atlassian MCP connector, not
      guessed:** Confluence ARCH space — `Arc Workspace` (page
      `1997307980`, the Constitution index) → `03 - Skills` (page
      `2005500019`, the real Skill Index) → `Skill - Tell Me About Your
      Name` (page `2005434483`, the actual skill definition) → `README`
      (page `1998749707`)'s "About my name" section, the skill's own
      mandatory canonical source. All authored by the user.
    - **What this incidentally confirmed about the real Arc's skill
      architecture** — directly relevant to decision 18's native-vs-
      Confluence-index choice: `00 - Agent Soul` (page `1996390531`)
      has a "🛡️ Execution Grounding (MANDATORY)" section requiring Arc to
      read the Skills index page, then the matched skill's own page, then
      the Procedure Memory page, live, on every triggered request, before
      acting — three live Confluence reads per skill invocation, every
      time, with no caching implied. This is the concrete shape of the
      "clunky" live-index mechanism decision 18 chose not to mirror.
    - **Scope of the exception is the skill file only.**
      `constitution/00-soul.md`, `components/local-agent/README.md`, and
      `.claude/agents/arc-lite.md` are unchanged — the disclaimer stays
      non-negotiable everywhere except inside `arc-lite-identity`'s own
      instructions. Re-confirm this scoping explicitly before adding any
      second skill; it is not a precedent for skills generally.
    - **No longer blocked — see decision 20:** the `arc-lite` subagent
      now has the `Skill` tool grant, so `arc-lite-identity` is
      invokable. This entry's own point (verbatim porting as a scoped
      disclaimer exception) is unaffected either way.
20. **Claude added `Skill` to `.claude/agents/arc-lite.md`'s `tools:` line
    directly, as a named, explicit exception to decision 17/18's rule that
    expanding a subagent's own tool grant is left to a human hand
    regardless of technical feasibility.** Asked first which of the two
    the user wanted — self-edit or an explicit exception — because "yes
    please" to "want to add that `tools:` line" didn't say which; the
    clarifying question was dismissed once, then the user confirmed
    directly: "I want you to do it as explicit exception." Unlike decision
    9 and 19, where the user chose an option from a menu Claude proposed,
    here the user named "explicit exception" themselves, unprompted by any
    option wording, after the first clarifying question went unanswered —
    the strongest form of deliberate, informed consent available for
    overriding a standing rule.
    - **Scope of the exception:** this one line, this one grant. The
      underlying rule — a subagent expanding its own tool access is a
      human decision regardless of sandbox permissions — is not repealed;
      re-ask before any future tool-grant change to any subagent, the same
      way decision 19 requires re-confirming its disclaimer exception
      before any second skill.
    - **What this unblocks:** the `arc-lite` subagent can now invoke
      `arc-lite-identity`, completing the wiring decision 18/19 left
      half-built. Real end-to-end verification (dispatching a question to
      the `arc-lite` subagent and confirming it reaches for the skill on
      its own, ideally from a fresh session or a `claude -p --agent
      arc-lite` terminal invocation rather than this one) is still
      outstanding — see `meta/procedural-memory/universal.md`'s new entry
      on why this session's own `Skill` tool calls can't be trusted to
      prove it.
    - **Verified, 2026-09-08:** the user ran `claude -p --agent arc-lite
      "tell me about your name"` from a real terminal (fresh process, no
      stale in-session cache) and confirmed it worked — the skill actually
      fires, not just the file content being correct. Decisions 18–20's
      native-skill chain is now proven end to end, not just built.

21. **Collapsed Arc Lite's mirrored five-part Constitution into its native
    Claude Code shape, and ended `local-agent`'s dependency-graph exception
    by folding its grounding into `kg-content`.** Raised when the user
    asked directly whether the multi-file constitution pattern was "still
    valid" or should be reconsidered "the Claude native way," and what a
    from-scratch native Architecture agent would look like. The honest
    answer, after reviewing all seven constitution files against
    `arc-lite.md`, `03-skills.md`, `06-answer-format.md`, `ui/server.py`,
    and `SCHEMA.md`: the constitution's shape mirrored a constraint Claude
    Code doesn't have. Arc's real five-page split exists because Rovo loads
    pages dynamically from Confluence, governed by a separate agent
    (ArchWorker), so a rule can change without redeploying the agent. A
    Claude Code subagent file is already the fresh, version-controlled,
    zero-redeploy source — splitting `00-soul.md`, `01-working-protocol.md`,
    and `06-answer-format.md` into files read via three extra tool calls on
    every invocation paid a real cost (latency, context) to preserve a
    metaphor with no matching constraint here.
    - **What moved into `.claude/agents/arc-lite.md` directly:** identity/
      tone (`00-soul.md`), the working protocol (`01-working-protocol.md`),
      and the answer-format contract (`06-answer-format.md`) — all
      behavior/prose that changes rarely and benefits from being the
      subagent's own single source, not separate files.
      `00-soul.md`, `01-working-protocol.md`, `02-canonical-sources.md`,
      and `06-answer-format.md` are deleted; `03-skills.md`,
      `04-procedure-memory.md`, and `05-ignore-list.md` keep their existing
      filenames unchanged (not renumbered), specifically so every earlier
      decision-log entry that cites them by path stays correct.
    - **What did not move, on purpose:** `04-procedure-memory.md` stays a
      separate file inside `components/local-agent/`, even though it
      mirrors `meta/procedural-memory`'s shape almost exactly, because
      `docs/component-model.md`'s one hard rule — nothing under
      `components/` may depend on `meta/` — forbids Arc Lite from pointing
      at `meta/procedural-memory/lessons.md` directly. The duplication here
      is required decoupling, not an oversight to clean up.
    - **The bigger change: `02-canonical-sources.md` is gone, and
      `local-agent`'s "deliberately outside the dependency graph" exception
      (decision 2, `docs/component-model.md`) ends.** Arc Lite now searches
      `components/kg-content/entities/` directly for grounding — the same
      thing the old file was a thinner, parallel shadow of — instead of
      maintaining a second schema. `kg-content` was still at zero entities
      when this was decided, so there was no migration cost to defer;
      continuing to grow the shadow table instead would have been exactly
      the premature-then-permanent duplication this project's own
      principles warn against, now that decision 11 already reframed Arc
      Lite from disposable comparison tool to a candidate for the real
      local agent.
      - **Not a mechanical 1:1 migration — the three rows didn't have the
        same shape.** Only one of the three, `nfr-enrichment-2026-08-02`
        (`canonical` in Arc Lite's own now-retired vocabulary), was actually
        architecture guidance; it became `kg-content`'s first-ever entity —
        `entities/principles/nfr-priority-third-party-financial-integration.md`,
        type `principle`, status `draft`. `draft` rather than a carried-over
        `canonical`, because this is the first entity to go through
        `kg-content`'s own (still entirely human-review-based) quality
        gate, and Arc Lite's retired "canonical" tier was never that gate.
        The other two rows (`sparring-experiment-2026-08-04`,
        `prd-readiness-2026-07-31`) were explicitly marked
        `reference-example` / `insufficient-evidence` in the old file — not
        architecture guidance, but examples of Arc's own answer quality for
        grounded-vs-ungrounded comparison. Moving those into `kg-content`
        would have been the wrong fit; they moved instead to the new
        `components/local-agent/eval-examples.md`, explicitly linked to
        `docs/program-roadmap.md`'s flagged lead that these same three
        experiments may already contain real material toward the AKB's
        50+-question Golden Evaluation Set.
    - **The answer-format contract is now a single fenced ```json block per
      answer** (`{"citations": [...], "refusal": bool}`), parsed by
      `ui/server.py` via `json.loads` on the extracted block rather than
      per-line regex on `ARC-LITE-CHECK:` sentinels. Citations carry a
      `source` of `kg-content` (`id` + `status`, checked against the
      entity's actual frontmatter), `live-unverified` (`url`, checked
      against `05-ignore-list.md`), or the newly added `skill` (`name`,
      checked against `.claude/skills/`) — closing the gap
      `06-answer-format.md` flagged and left open when `arc-lite-identity`
      shipped (decision 19): a skill-sourced answer now has a real slot
      instead of improvising `status=reference-example` as the closest fit.
      A skill citation is not logged to `gap-log.md` — it isn't a knowledge
      gap the way a refusal or a live citation is.
    - **Documentation updated in the same change, per this repo's own
      contract-README rule:** `docs/component-model.md` (the exception
      ending, the dependency diagram), `components/local-agent/README.md`
      (boundary, depends-on, how-to-use), `components/kg-content/README.md`
      and `components/kg-core/README.md` (`Depended on by`).
    - **Deliberately not done in this pass:** the Atlassian MCP tool grant
      decision 17 flagged as still missing from `arc-lite.md`'s `tools:`
      line stays exactly as open as before — expanding that grant is a
      separate decision the user has to make explicitly (decisions 17 and
      20), not something this restructuring pass folds in. The real
      end-to-end run decision 20 just verified went through direct CLI
      invocation, not `ui/server.py`, so it exercised the old contract and
      still left `gap-log.md` empty; that gap (and next step 7) is
      unaffected by this decision.

22. **Widened `meta/`'s charter to include general-purpose capabilities
    incubated during this project, not just self-observation.** Raised
    when the user asked to add a new capability, `idea-to-presentation`
    (agent-driven: reduce the time from a raw idea to a presentable
    PowerPoint/Confluence deck), placed directly under `meta/`. Flagged
    the conflict before acting: decision 4 and `meta/README.md` defined
    `meta/` by the *opposite* property — its components are "tied to
    *this* project's history and would be meaningless elsewhere," which is
    the stated reason `components/` must never depend on `meta/`. A
    general-purpose deck-builder is exactly what `component-model.md`'s
    promotion story already has a home for (a `components/` piece that
    outgrows this repo and gets promoted). Given that conflict, the user
    chose explicitly to redefine `meta/`'s charter rather than relocate
    the new capability.
    - **The test, sharpened once more the same day after a first pass
      used the wrong axis.** The first version of this decision drew the
      line at mission-specificity ("`components/` serves KG curation;
      `meta/` doesn't") — the user corrected this directly: the real line
      is *delivery*, not topic. `components/` holds what ships as part of
      the architecture agent product itself (the agent, its skills, the
      knowledge graph); `meta/` holds capabilities useful *along the
      journey* of building and operating that product, which could
      potentially be abstracted into general-purpose capabilities beyond
      this project, but are explicitly not part of the product's own
      delivery. This is a better test than mission-specificity because it
      doesn't collide with the promotion story: a promoted
      `components/` piece (e.g. `query-service`) can be just as
      general-purpose or extractable as a `meta/` capability — the
      difference was never generality, it's whether the thing ships with
      the product.
    - **What changes:** `meta/README.md`'s definition widens from "holds
      what observes the process of building this project" to "holds work
      that isn't part of the architecture agent product's own delivery —
      either because it observes this project's own process, or because
      it's a capability incubated along the way that isn't part of that
      delivery." The hard rule (`components/` must never depend on
      `meta/`) is unchanged; its rationale is now stated per-kind rather
      than universally — a self-observation component is tied to this
      project's history and would be meaningless elsewhere, while a
      general-purpose meta capability has its own independent incubation
      lifecycle that the shipped product shouldn't be coupled to.
    - **First capability under the widened charter:**
      `meta/idea-to-presentation`, whose own README states purpose and
      boundary; mechanism (how an idea actually becomes a deck) is not
      yet designed.
    - **Doesn't retroactively re-justify the existing three meta
      components under this new rationale.** Decision 8 already rejected
      moving project-specific lessons into a `components/procedure-memory`
      on the original, narrower ground (`meta/` = observation, not
      promotion-readiness); this widening applies going forward to new
      capabilities, not backward to re-derive why `procedural-memory`,
      `architecture-learning`, or `token-tracking` are where they are.

23. **Rejected reviving the deferred "project dashboard" backlog idea as a
    new status file; extended the two status copies already in the repo
    instead, and fixed two real drift instances found while checking
    them.** Raised when the user asked for the project to be organized so
    a conversational question like "what about the knowledge graph
    component" can be answered — component, stage, and any related work
    — without reconstructing context from a transcript, citing
    `docs/kg-format-research.md` (committed a session earlier) as a
    concrete example of exactly that failure: real, relevant work with no
    pointer to it from anywhere a fresh session would look.
    - **Why not a new dashboard file, even though the trigger is real.**
      `docs/backlog.md` had already parked and deferred this exact idea
      2026-08-19, reasoning that `decision-log.md` plus the component
      READMEs already cover it with "no extra artifact to maintain,"
      revisit only once scanning them stops answering "where are we"
      quickly. Building a third status copy now (a dashboard, alongside
      `component-model.md`'s Status column and each README's own
      `## Status` section) would be the exact anti-pattern
      `component-model.md` already names for a different case — "a
      shared component... becomes the coupling everything routes
      through" — applied to documentation instead of code, and would add
      a third place to keep in sync rather than fixing why the existing
      two had already drifted.
    - **Concrete drift found, not hypothetical, while checking whether the
      existing two copies still worked.** `component-model.md`'s table
      said `kg-content` was `Empty`, three decisions after decision 21 had
      already given it its first entity — its own README's Status section
      already said so correctly, so the two copies actively disagreed. And
      `components/local-agent/README.md`'s `Why this exists`, `Boundary`,
      `How to use it`, and `Status` sections still described the
      pre-decision-21 seven-file Constitution mechanism in detail — despite
      decision 21's own log entry recording that this README had been
      "updated in the same change." The `constitution/` files it named
      (`00-soul.md`, `01-working-protocol.md`, `02-canonical-sources.md`,
      `06-answer-format.md`) were genuinely deleted on disk, so the
      restructuring itself hadn't been reverted — only this document's
      prose had drifted back to describing it, undiscovered until now.
      Both fixed in this change.
    - **What was built instead, all reusing structure already in the
      repo rather than adding a new kind of artifact:**
      1. **A "related work" pointer convention:** a document specific to
         one component (a research report, a design note, an eval set)
         gets a pointer from that component's own README in the same
         change that produces it. Applied retroactively to
         `kg-core/README.md` → `docs/kg-format-research.md`, the case
         that prompted this.
      2. **`component-model.md`'s Status column is now explicitly stated
         as a one-line mirror of each README's own Status section, not a
         second source of truth** — the same discipline the contract rule
         already required for the rest of a README's content, just never
         said out loud for this one column, which is exactly where it had
         drifted.
      3. **A hand-maintained "Index by area" table** at the top of this
         log, grouping existing decisions by which component/area they
         touch — mirrors the raw-entries/generated-index split
         `meta/architecture-learning` already uses for the identical
         reason (a growing append-only record needs a separate finding
         aid), at a scale (23 entries) that doesn't yet justify that
         component's `reindex.py` tooling. Cites by name inside entries as
         always; the index itself is the one place allowed to cite by
         number, since it's the thing being indexed.
    - **Deliberately not done:** no change to `meta/README.md`'s own
      one-line-per-component table — checked, not found stale, so left
      alone rather than touched on principle. No automated staleness
      checker for either status copy; at this scale, catching drift by
      reading both copies when touching either (now written above as the
      rule) is proportionate, the same judgment call `kg-core`'s own
      Status section already makes about validation rules being a PR
      checklist rather than code.

24. **Scaffolded a new self-observation meta component, `meta/CDCD`
    (working title — "Conversation-Driven Co-Design"), to study and
    evidence the collaboration pattern this project already uses,
    distinct from `architecture-learning`.** Raised as a follow-on from
    decision 22's `idea-to-presentation` conversation: the user proposed
    making "conversation-driven co-design" itself — no upfront spec,
    structure emerging progressively through daily dialogue, with the
    agent expected to co-design via counter-argument rather than just
    implement — a documented, evidenced practice, potentially toward a
    paper.
    - **First objection, addressed by the user directly: isn't this
      just reviving `architecture-learning`?** Resolved by a
      subject-matter split already used once before in this project
      (decision 4's `perception-failures` precedent):
      `architecture-learning`'s subject is the user's own
      reasoning/taste, aimed at a better Claude next time; CDCD's
      subject is the human-agent collaboration pattern itself, worth
      studying even holding the agent's current capability fixed.
    - **Second objection, addressed by the user directly: is this just
      "vibe coding"?** The user's distinction, stated directly: vibe
      coding treats rigor (spec, modularity, documentation,
      maintainability) as optional and typically absent, left up to the
      agent whether it happens at all; CDCD treats that same rigor as
      mandatory, deferring only *when* it's produced — it crystallizes
      progressively as each decision becomes concrete, rather than
      being planned in full beforehand. This project's own history in
      this same session (decision 22's `meta/`-charter widening and its
      same-day correction; `query-service`'s protocol left explicitly
      open rather than forced closed) is itself the first evidence for
      that claim: rigor showed up at the point each question became
      concrete, not before.
    - **Evidence discipline required before this becomes a paper-grade
      claim:** `architecture-learning`'s own prior correction
      (`evidence-over-assumed-best-practice.md`) — a record built only
      from supporting anecdotes is advocacy, not a finding. CDCD's
      `observations.md` is seeded with this founding conversation as
      supporting evidence, but explicitly flags that no contradicting
      instance (a real cost from a deferred spec) has been sought yet,
      and names finding one as a next step, not an afterthought.
    - **What was built:** `meta/CDCD/README.md` (purpose, boundary,
      contract), `meta/CDCD/observations.md` (raw evidence, same
      supports/contradicts discipline as `architecture-learning`), and
      `meta/CDCD/definition.md` (the current working definition plus a
      cited comparison against vibe coding, domain-driven design, and
      spec-driven design — the concrete artifact meant to answer "isn't
      that just vibe coding?" from this project's own grounded history
      rather than an asserted opinion). Name is a working title,
      flagged in the component's own README as possibly underselling
      the rigor-deferred/co-design aspect in favour of "conversation" as
      the more visible word.
    - **Fits `meta/`'s existing charter without a further widening:**
      unlike `idea-to-presentation` (decision 22), CDCD doesn't ship as
      part of the architecture agent product and *is* self-observation
      of the process, so it sits under decision 4's original half of
      `meta/`'s charter, not the general-purpose-capability half
      decision 22 added.
    - **Correction to decision 23's "checked, not found stale" claim
      about `meta/README.md`'s table.** Editing that table to add
      `CDCD` surfaced that `perception-failures` — a real component on
      disk since decision 4, listed correctly in `CLAUDE.md`'s own
      Layout section — was missing from the table entirely, not merely
      out of date. Added the missing row and its own line in the
      evidence/provenance section in the same change. Not a comment on
      decision 23's broader "related work pointer" convention, which
      this doesn't touch — just this one specific check that turned out
      to be wrong.

25. **Token tracking extended into a credit-budget controller, built on
    the authoritative pool rather than the list-price estimate.** The
    user asked for daily tracking against a believed "$500 monthly
    credit," with the goal of landing at ~90% of it by cycle end without
    exceeding it. The pool exists and the user's figure was right;
    what changed is where the number comes from, what it measures, and
    whether it can be targeted at all.
    - **The pool is real, authoritative, and readable locally: $500.00
      per cycle, $120.59 (24.1%) consumed as of 2026-09-14.** Claude
      Code caches the account's position in `~/.claude.json` under
      `cachedUsageUtilization.utilization`, as `extra_usage`
      (`monthly_limit` 50000, `used_credits` 12059, USD minor units)
      and a matching `spend` block. `can_purchase_credits: false` and
      `can_toggle: false` mean the pool is org-administered and cannot
      be topped up, so exceeding it is a hard stop until reset.
    - **But `extra_usage` is overage, so 90% is the wrong target
      shape.** Usage credits accrue only *after* subscription plan
      limits are hit — the payload's own disclaimer says "Usage credits
      cover you when you hit your plan limits." Credit consumption is
      therefore a *consequence* of being rate-limited, not a budget for
      work and not a control variable. Deliberately driving it to 90%
      means deliberately spending most of the month at plan limits.
      The defensible version of the user's goal is the inverse: stop
      self-throttling, take on the work and the models the task
      actually warrants, and treat leftover headroom as evidence of
      valuable work declined rather than as money saved. `--target`
      keeps the user's framing available as a parameter; this entry
      records the objection, not a refusal.
    - **The first reading of the pool was wrong, from a stale cache,
      and was nearly written into this log as fact.** The cache read
      5 days old reported a $150 limit at 66.6%, which would have
      inverted every conclusion — "ahead of pace, nearly exhausted"
      instead of "behind pace, substantial headroom." It refreshed
      mid-session and corrected itself. Logged as
      `meta/perception-failures/log.md` entry 4, because the staleness
      had been detected and printed and the conclusion drawn anyway.
    - **`summarize.py` could only ever see this one repo.** It derives
      its transcript directory from its own `__file__`, which is correct
      for the per-feature attribution it was built for and wrong for a
      machine-wide budget — seven project directories consume the same
      pool. `budget.py` scans all of them. On current data this repo is
      97.3% of all-time list-price cost, so the correction happens to be
      small today, but it was silent and would not stay small.
    - **This repo's own `meta/token-tracking/README.md` asserted, as a
      verified finding, that no local allowance figure exists.** It was
      wrong, and the way it was wrong is logged as
      `meta/perception-failures/log.md` entry 3. The README is corrected
      in the same change.

    **What was built.** `meta/token-tracking/budget.py` — stdlib only,
    importing `summarize.py` so the cost model is not duplicated. It
    reports the authoritative pool with its staleness (the cache only
    refreshes when `/usage` runs, and was 4d 19h old when first read),
    bridges the stale window with a calibrated list-price estimate
    (credits per $1 of list price, derived over the part of the cycle
    the cache already covers), and prints pace, linear projection, the
    daily spend needed to land on target, and the daily ceiling before
    the hard stop. The calibration is explicitly an approximation, not a
    conversion rate, because credits accrue non-linearly.

    **Open, and deliberately not guessed.** The cycle reset date is
    assumed to be the 1st (`--cycle-start` overrides it); the real date
    is visible in `/usage` and has not been confirmed, and every pace
    figure depends on it. The `monthly_limit` also changed from 15000
    to 50000 between the 2026-09-09 and 2026-09-14 cache reads while
    `used_credits` kept accumulating — consistent with the org raising
    the allocation mid-cycle, but not confirmed, and it means the limit
    itself should be treated as something that can move rather than a
    constant. Whether a daily brief should be automated (a scheduled
    task) was put to the user rather than configured, since that is
    persistent configuration.

26. **[Partly superseded by decision 28 — the source of truth, the
    maturity scale, and the activity model named below were all wrong; the
    tier itself stands.]** **Added a third top-level tier, `practice/`, for
    the Architecture stream's own business work, and made IN-563's capability
    maturity assessment its first area.** Raised when the user asked where
    work on [IN-563](https://tyropaymentsltd.atlassian.net/browse/IN-563)
    ("Foundation – Architecture capability maturity assessment", grounded in
    The Head of Architecture's Confluence page *Architecture Practice
    Evolution - Roadmap*, ARCH `2291007579`) should live, how this project
    could help with it, and how to keep track of it. Both halves of this entry
    — the tier, and what the deliverable actually is — were put to the user as
    explicit choices with alternatives, and both recommendations were
    accepted.
    - **Why none of the three existing homes worked, each rejected on its
      own stated contract rather than on taste.** `docs/` holds *this
      repo's own* design record; its nearest precedent,
      `program-roadmap.md`, is explicitly marked "not owned here — re-fetch
      rather than hand-edit", which is the opposite of an artefact the user
      authors, so filing IN-563 there makes `docs/` mean two things.
      `meta/` fails decision 22's own sharpened test: the user corrected
      that test from mission-specificity to **delivery**, and a business
      deliverable is neither the product's delivery nor a capability
      incubated beside it — using `meta/` would have needed a third charter
      widening weeks after the second. `components/kg-content/entities/`
      was the most tempting, since a capability map with maturity ratings
      and typed relations is genuinely graph-shaped, but `capability` is
      not one of `SCHEMA.md`'s six entity types, and mixing
      practice-maturity content into the grounding set Arc Lite searches
      for solution-design questions dilutes exactly the signal decisions 5
      and 12 exist to protect.
    - **Why a tier now rather than deferring per
      `least-infrastructure-first` — the evidence threshold that principle
      asks for was already met, three times over, before IN-563.** The
      slide-26 CTB pack consumed multiple sessions and produced decisions
      12–16, but lives in `AI SDLC/slide/` *outside this repo* (verified,
      not assumed — it is absent from the repo and from its workspace
      siblings), leaving nothing here but log entries *about* it. Jira
      initiative management across IN-562…IN-570 exists only as
      decision-log prose plus a deferred `jira-management` idea in
      `docs/backlog.md`. `docs/program-roadmap.md` is an externally-owned
      snapshot filed among this repo's own design docs. This is decision
      23's `kg-format-research.md` failure — real work with no pointer from
      anywhere a fresh session would look — at larger scale and already
      recurring, so the argument for waiting for a second instance had
      nothing left to wait for.
    - **The test, stated as a three-way on what a thing *is*, not what it is
      about** (all three tiers are about architecture): `components/` — does
      it ship as part of the product; `meta/` — is it useful while building
      the product without shipping with it; `practice/` — is it work owed to
      the org that happens not to be software. The hard rule is inherited in a
      stronger form: **nothing under `components/` or `meta/` may depend on
      anything under `practice/`**, stronger because `practice/` content is
      partly owned outside this repo entirely — the grounding roadmap is the
      Head of Architecture's and can be superseded in a meeting this repo
      never sees, so code depending on it would break for reasons invisible
      from the codebase.
    - **Second half: what IN-563 actually owes, given its source of truth
      has already done part of it.** The Head of Architecture's page rates 15
      initiatives across two categories on a five-level scale, with priority
      action, business value, rank and rationale each, plus a six-item
      *AI-Assisted Architecture Operations Sub-Goals* table. What it does not
      contain is the layer IN-563's own description names — **"processes and
      activities"**. The page rates *initiatives*, which are uplift
      programmes, not what architects do day to day. Chosen deliverable: the
      activity layer beneath it, rolling up to the Head of Architecture's
      pillars rather than competing with them. Rejected alternatives were
      treating IN-563 as substantially delivered and merely contributing to
      the Head of Architecture's page (leaves the activity layer absent), and
      scoping to the AI-opportunity half only (leaves "mapped capabilities,
      processes and activities" unaddressed).
    - **Why this deliverable earns its keep beyond the ticket:** it is the
      missing input to this repo's longest-open question — decision 6's
      step 1, *"what can Claude Code add on top of what Arc already
      provides?"*, still answered by guesswork. An activity model carrying
      a maturity and AI-opportunity read per activity answers it from
      evidence.
    - **Maturity vocabulary: reuse, explicitly do not invent a third.** Two
      are already in play — the Head of Architecture's five-level practice
      scale (`Low`/`Emerging`/`Partial`/`In flight`/`Established`) and slide
      26 / IN-564's M1/M2/M3 solution-architecture ladder, which decision 15
      already flags as absent from `docs/program-roadmap.md`'s own milestone
      language. This work uses the five-level scale, because IN-563 is a
      practice-wide assessment and that is what that scale measures; M1/M2/M3
      stays scoped to the one capability it was defined for.
    - **What was built:** `practice/README.md` (the tier contract,
      including a provenance requirement — every artefact declares itself
      `snapshot`, `authored here`, or `derived`, generalising the header
      that stopped `program-roadmap.md` drifting),
      `practice/capability-maturity/README.md` (the ask, the source of
      truth, what the roadmap already covers and what it doesn't, boundary,
      open questions), and
      `practice/capability-maturity/activity-inventory.md` (since removed by
      decision 28) — 32 activities
      in five groups, each marked `cited` or `inferred` against the roadmap
      page. `docs/component-model.md` gained the tier and its rule.
    - **Two honest limits written into the artefact rather than discovered
      later.** First, an activity's maturity is *inherited* from the
      roadmap initiative above it and marked `(uplift)`: an initiative's
      rating describes how far that uplift has progressed, not how mature
      the underlying activity is, and an `In flight` uplift usually implies
      the activity is *less* mature, not more — so every such cell is a
      prompt, not a value to report. Second, deriving activities from the
      source page means activities that page never mentions are invisible
      by construction; only two of 32 rows are `inferred`, which reads as a
      warning that the method reproduced the source's frame, not as
      reassurance. No maturity rating was invented — `not-assessed` is used
      where there is no evidence, on the same discipline
      `meta/architecture-learning` enforces.
    - **One finding the method can support, flagged because it is
      actionable:** seven of the eight `not-assessed` activities sit in the
      discovery and sparring groups — impact analysis, vendor evaluation,
      ADRs, sparring preparation, completeness checks, running the forum,
      capturing outcomes. That is the
      practice's day-to-day core, unrated because the roadmap rates uplift
      programmes and no initiative points squarely at "how well do we run
      sparring today". A first defensible rating for those activities is
      the clearest candidate for IN-563's own contribution. Separately, all
      six named AI sub-goals fall in artefact-drafting work, with none in
      intake/triage or in the strategic-guardrail group — which may be
      where AI genuinely pays off first, or may just be the most visible
      opportunity; the second reading is worth testing because the
      guardrail group is precisely what this repo's graph is designed for.
    - **Deliberately not done, so it isn't assumed:** the three earlier
      instances that motivated the tier were *not* migrated into it.
      `docs/program-roadmap.md` is cited by path from many entries in this
      log, so relocating it breaks cross-references and needs its own pass
      (see Next steps). The slide-26 pack stays outside the repo. The
      `jira-management` component stays deferred in `docs/backlog.md`, though
      IN-563 is now its first concrete demand — a local work item that maps to
      a remote initiative is exactly what that idea was for. Publishing this
      assessment back to Confluence is also out of scope: decision 5's
      curate-in-git-publish-outward pattern is the obvious eventual shape, but
      the Head of Architecture owns the target page, so that is a conversation
      to have rather than a mechanism to build unilaterally.

27. **[Partly superseded by decision 28 — the checkpoint *model* stands,
    but the four checkpoints were invented rather than sourced, and the
    maturity- scale question was answered wrongly.]** **The Head of
    Architecture's review is modelled as validation checkpoints, and those
    checkpoints — not a row-completion percentage — are IN-563's plan of
    record.** Raised by the user: "we should treat what's [the Head of
    Architecture]'s comments as validation checkpoints to plan and track the
    progress of this piece of the work", with two examples — align on
    completeness (did we capture everything we do; are the inputs/outputs
    correct?) and whether the maturity levels are the right ones.
    - **What this replaced.** The question on the table was whether to
      replace the activity ratings with the Head of Architecture's initiative
      ratings. That would have been wrong on a units mismatch — an initiative
      rating measures how far an uplift programme has progressed, not how
      mature the underlying activity is, and 15 of the 24 inherited cells read
      `In flight`, so copying them down yields an assessment with almost no
      differentiation, biased upward in exactly the places an uplift exists
      *because* the activity is weak. The checkpoint framing is a better
      answer to the same instinct: the Head of Architecture is the
      **validator** of ratings authored here, not the **source** of them. Her
      page stays the authority on what it covers; her judgement becomes the
      gate on what it doesn't.
    - **Why checkpoints fit this deliverable specifically.** An
      assessment's only real quality gate is whether the practice's own
      architects recognise it as true, so the work is planned around the
      review points rather than presented at the end. It also closes a gap
      the inventory names about itself: activities the source page never
      mentions are invisible to the derivation method by construction, and
      no further desk work fixes that — only someone who does the work can.
      "Did we capture everything we do?" is therefore a checkpoint
      question, not a research task.
    - **Three checkpoints, not six, and completeness is bundled with the
      scale question.** CP1 asks completeness *and* whether the maturity
      levels are right; CP2 asks the per-activity ratings; CP3 asks the
      AI-opportunity read and how the artefact lands relative to the Head of
      Architecture's page. The user listed completeness and scale as separate
      concerns; they are asked together because they are independent — the
      scale answer stays valid whatever happens to the activity set — so
      bundling risks no wasted work and costs one conversation on the Head of
      Architecture's calendar instead of two. Each checkpoint is framed as a
      question with a yes/no-with-corrections answer rather than a document
      review, because a gate that asks the Head of Architecture to read a
      32-row table and react will get a rubber stamp or a delay.
    - **The maturity scale is now explicitly provisional.** Decision 26
      chose the Head of Architecture's five-level practice scale over the
      M1/M2/M3 ladder on the reasoning that IN-563 is a practice-wide
      assessment. That reasoning was made here and never confirmed with her,
      and the user's second example question puts it on the table. `README.md`
      now marks the choice provisional pending CP1 rather than settled —
      rating 32 activities on the wrong scale is the most expensive mistake
      available in this area.
    - **Inputs and outputs are promoted from documentation to a completeness
      *test*.** The user's completeness question includes "are the
      inputs/outputs correct?", which the inventory cannot answer — it has no
      such columns. Modelling them enables three structural checks runnable
      *before* spending the Head of Architecture's time: a dangling input (an
      activity consumes what nothing produces) means a missing activity or an
      imaginary input; an orphan output means a missing consumer or work
      nobody uses, itself a finding; a weakly-connected group suggests the
      group was derived from the source's structure rather than observed. This
      is the same reason the repo chose a graph shape over flat docs — typed
      relationships surface contradictions a list cannot — applied to the
      practice's own process model.
    - **What was built:** `practice/capability-maturity/validation-plan.md`
      (the three checkpoints, their entry conditions, what each blocks, the
      structural checks, and a status table), plus `README.md` updates —
      validation plan added to Contents and marked read-first, the scale
      marked provisional, Status reframed to track against checkpoints, and
      three former open questions moved into the checkpoints that now own
      them.
    - **Left open deliberately:** *how* inputs and outputs get modelled.
      Two columns on a 32-row table makes it very wide and most cells would
      be `inferred`, which inflates the artefact's apparent authority — the
      exact failure the inventory warns about. A separate activity-flow
      view is the alternative. This gates CP1, so it is the next thing to
      decide, not a parked idea.

28. **IN-563 re-grounded on the Architecture Capability & Process Map, which
    supplies the activity model, the inputs/outputs and the maturity scale;
    plus a standing convention that no personal names appear in committed
    artefacts.** Four corrections, all from the user, after decisions 26 and 27
    were built on the wrong source.
    - **No personal names in anything committed.** The user's instruction:
      "remove his name out of the project, replace with Head of architecture
      role is more appropriate to have no PII data in this project", with the
      nuance that the name is fine in conversation but "not documented formally
      in decision, or any other document in this project". A git history is
      permanent and broadly readable, and Tyro's own review standards call out
      preventing PII exposure, so a name committed once is effectively
      un-removable. Role titles also age better: they stay correct when people
      change roles, whereas a name attached to a decision misattributes
      authority later. Swept `docs/decision-log.md`,
      `docs/component-model.md`, `practice/README.md` and
      `meta/architecture-learning/observations.md`; added the rule to
      `CLAUDE.md`. Where the name sat inside a verbatim quote of the user, the
      substitution is bracketed — `[the Head of Architecture]` — rather than
      rewritten silently, so the quote stays honest. **Not fixed: four earlier
      commit messages contain the name.** Rewriting them means rewriting
      history on a shared branch, which is not a call to make unilaterally.
    - **The source of truth was wrong, and the correct source already
      contained the layer decision 26 spent a session building.** The real
      working document is the *Architecture Capability & Process Map*
      (Confluence `AE/2280227087`), authored by the user in the "AI Powered
      Delivery" space and under active edit. It already holds 21
      process/activity rows in four themes, each with **Inputs**,
      **Process/Activity**, **Outputs**, a description, and five maturity
      columns. Decision 26 instead derived a 32-activity inventory from the
      *Practice Evolution Roadmap* (`ARCH/2291007579`) and then reasoned at
      length about that method's blind spots — all of which was avoidable by
      finding this page first. `activity-inventory.md` is removed rather than
      reconciled: it duplicated a page this repo does not own, which is
      exactly the drift failure decisions 12–16 exist to prevent.
    - **The maturity scale is the Process Map's five AI-enablement levels**,
      kept as-is at the user's direction: `Limited`, `Manually managed`,
      `AI-assisted (human in the loop)`, `AI-driven (human on the loop)`,
      `Fully autonomous (with human value)`. This measures how much of an
      activity AI carries and where the human sits relative to the loop, which
      is the right question for a program whose purpose is moving rows
      rightward. Decision 26's choice of the Head of Architecture's practice
      scale (`Low`…`Established`) was wrong — that scale measures uplift-
      programme progress. `M1`/`M2`/`M3` in initiative titles are not a third
      scale either but staged increments toward a level; decision 15's open
      question about them is narrowed, not closed (see the mapping's gap 2).
    - **What "assessment" concretely means, which was not understood
      before.** The page's legend defines it: 🌟 marks rows prioritised in the
      AI SDLC program, a yellow cell marks current state and a green cell
      marks target state. The deliverable is the page colour-coded — two marks
      per row — not prose about the practice. The remaining work is to derive
      those marks from the initiative set (IN-562…IN-571) and decide which
      further rows the program takes on.
    - **The four checkpoints are now sourced, not invented.** Decision 27's
      CP1–CP3 were reasoned out rather than read off anything; the user
      identified that CP3 in particular ("AI opportunity and disposition") came
      from nowhere they recognised. The real set: **CP1** completeness and
      inputs/outputs, which has four unresolved inline comments already sitting
      on the page from the Head of Architecture — two proposing deletion of
      *Technology Radar* and *Technical Excellence / Knowledge Sharing* as
      Platform Engineering's, two questioning whether *Architecture baseline
      refresh* and *Diagram asset management* are separate processes at all;
      **CP2** formalise the levels and colour-code current/target per row,
      including which rows fill the IN-570/IN-571 placeholders; **CP3**
      visualise the processes as a flow diagram so they are easier to consume
      and socialise; **CP4** carve out the items the AI SDLC program already
      covers so the practice transformation roadmap does not duplicate them.
      CP3 is gated on CP1 rather than CP2, because a flow diagram renders the
      inputs/outputs columns and needs them correct but does not need ratings —
      so CP2 and CP3 can run in parallel.
    - **Three findings the corrected grounding supports**, recorded in
      `initiative-row-mapping.md`: (1) IN-567 targets *Architecture Sparring
      Preparation & Jamming*, but that row carries no 🌟 — the cheapest and
      clearest inconsistency in the area; (2) `AI-Validated` (IN-564) and
      `AI-Augmented` (IN-566, IN-567) are not level names, while `AI-Assisted`
      and `AI-Driven` match columns word-for-word, so M2 has no level of its
      own and the M-ladder is probably finer-grained than the scale; (3) every
      starred row plus IN-567's falls in *Discovery & Design Guardrails*, with
      Strategic (5 rows), Execution (7 rows) and Foundational (1 row) carrying
      no initiative at all — which is the real input to the IN-570/IN-571
      choice, and a sharper version of the clustering observation decision 26
      made against the wrong source.
    - **Every current-state cell is `not-rated`, deliberately.** Initiative
      titles give target state and the page defines the scale, but neither says
      where the practice sits today; that read has to come from someone who
      does the work. Inferring it from whether a row links to a Confluence page
      would conflate "an artefact exists" with "the process is documented,
      owned and repeatable", which is the actual level-2 test. Three rows are
      marked `cannot rate` instead — *Architecture Governance*, *Architecture
      Debt Management*, *Post Implementation Conformance Check* have no level
      descriptions on the page, so writing those is a prerequisite to rating.
    - **Not done, deliberately:** no Jira issue was edited, and no row was
      proposed *into* IN-570/IN-571. Filling those is a program scope decision
      and this repo's own rule requires explicit approval for roadmap changes
      rather than a good argument. Candidates are listed with their
      counter-arguments as CP2 input only.

29. **The root `README.md` is a router and a status board, not a summary of
    the project — and the repo will be renamed to match what it now holds.**
    Two related conclusions from reviewing a root README that had gone 12 days
    stale: it described `components/` as though it were the whole repo,
    omitted `practice/` and four of the six `meta/` components, and claimed
    "no code yet" when a local UI server and four scripts were running.
    - **Rejected: the comprehensive README.** The first rewrite attempted was
      148 lines with five tables, restating the four baseline decisions, the
      constraints, and the working conventions so that a newcomer could
      orient from one file. It was discarded before being committed, on an
      objection internal to this repo rather than a stylistic one:
      `docs/component-model.md` already warns that a duplicated table
      "existing at all is exactly the kind of second copy" that drifts, and
      decision 23 deliberately made component status findable *without*
      adding a dashboard file. A README that explains the baseline decisions
      is a second copy of this log; one that lists conventions is a second
      copy of `CLAUDE.md`. The comprehensive version was a dashboard.
    - **The charter, stated so future edits have a test to fail:** the README
      owns exactly the two things no other file owns — **routing** (which of
      the three tiers holds what, and where to start given an intent) and
      **honest current status** (what is actually built, as against what is
      designed). Everything else is a link. Any future addition should be
      checked against "does another file already own this?", and if so it
      belongs there instead.
    - **Honest status is load-bearing, not modesty.** The committed version
      states that 28 decisions have produced one graph entity, that there is
      no product code or test suite, that Arc Lite has never been driven
      through real usage, and that the only work with a live deadline sits in
      `practice/` rather than in the product tier. A newcomer reading the old
      README would have inferred a far more built system than exists, which
      is the specific failure a status section prevents.
    - **Rename agreed in principle: `arch-knowledge-graph` → `arch-ai-uplift`.**
      The user's reasoning was that the name reflects the original scope, when
      the knowledge graph *was* the whole project, and no longer describes a
      three-tier repo whose live delivery is a business assessment. Sequenced
      deliberately after the README rewrite at the user's direction. Not a
      doc edit — it touches the git remote, any existing clones, links that
      reference the path, and the local directory name that Claude Code's
      per-project memory path is derived from. The README records the mismatch
      explicitly in the meantime, so the gap reads as known rather than as
      neglect. See Next steps.
30. **First bulk-ingestion experiment: full domain set, lean entities, over
    the originally planned pressure-test slice.** `kg-content/README.md` had
    called for pressure-testing the schema against a small, hand-picked,
    fully interconnected set of entities before any bulk authoring. That was
    superseded rather than completed: ingested all 39 domains from
    Confluence's "TS - Reference Domain Model - Domain Definitions" (ARCH
    space) into `components/kg-content/entities/domains/` in one pass,
    because a concrete downstream consumer — an upcoming task evaluating a
    reward initiative against Tyro's actual domain boundaries — needs the
    complete set, not a slice. Breadth was widened; depth was cut to
    compensate: each entity holds only a short purpose, its category, and a
    one-line authority summary, with a pointer to a verbatim cache of the
    full source page (`components/confluence-ingest/sources/reference-domain-model-domain-definitions.md`,
    that component's first real artifact) rather than a full transcription.
    `domain` is added to `kg-core/SCHEMA.md` as a seventh, explicitly
    provisional entity type — no relationship keys yet, category stored as a
    plain frontmatter field rather than a second entity type, and the
    "explicit non-authority" field left as an open question because the
    existing relationship vocabulary has no typed way to assert a negative
    claim. Framed deliberately as a `meta/CDCD`-style first pass: build the
    minimum the immediate use needs, let real use expose gaps, and expand or
    refactor from evidence rather than settling the model now. Full
    rationale, method, and open questions in
    `docs/domain-model-experiment.md`; evaluation is explicitly pending
    until the reward-initiative task actually exercises this data.
31. **Added `kg-viz`, a read-only 3D visualization component, for human
    inspection of the graph.** New row in `docs/component-model.md`'s table
    and dependency diagram: reads `kg-content` directly (the same
    frontmatter-regex workaround `local-agent` already uses, since `kg-core`
    has no implemented query code yet), depended on by nothing. Its edges
    are derived, at generation time only, from the "→ Other Domain" prose
    already inside each domain entity's `## Authority` section — `domain`
    still has no typed relationship keys, so this is a best-effort read of
    free text, not a curated relationship, and nothing derived is ever
    written back into `kg-content`. Real evidence from running it once:
    68 arrow references found across the 39 domain entities, 42 resolved
    to an unambiguous target domain, 26 left unresolved rather than guessed
    — mostly one recurring naming ambiguity ("Customer & Identity" in
    source prose, which doesn't map cleanly onto the now-separately-modeled
    `customer` and `user-and-identity` domains) plus a handful of generic
    phrases ("Relevant business domains") and one reference to a domain
    name not present in the ingested 39 ("Banking Domain"). See
    `docs/domain-model-experiment.md` for the fuller breakdown and
    `components/kg-viz/README.md` for the resolution algorithm. Not yet
    verified rendering in an actual browser — the sandboxed environment it
    was built in cannot bind a listening socket, so `serve.py` needs to be
    run from a normal terminal to get the first real look. **Superseded by
    decision 32**: the 68/42/26 figures and the "no typed relationship
    keys" premise here describe the prose-inference approach that decision
    32 replaced, on the same day, once building this component is what
    exposed the gap. Left as written rather than rewritten, as the record
    of what was actually tried first.
32. **`domain` storage changed from one-file-per-entity to a single
    consolidated, JSON-Schema-backed file — a scoped exception to decision
    1, for `domain` only.** The other six `kg-core` entity types are
    unaffected and keep their existing one-file-per-entity shape.
    `components/kg-content/entities/domains/` (39 markdown files, from
    decision 30) deleted; replaced by
    `components/kg-content/entities/domains.json`, shaped by
    `components/kg-core/schemas/domain.schema.json` (`kg-core`'s first real
    artifact — everything else there is prose). Reasoning, stated directly:
    the Architecture team owns these definitions as one coherent,
    singularly-owned artifact, unlike a guardrail or pattern independently
    edited by different reviewers over time, so one file beats one-per-entity
    for portability (no directory-walking to hand this to a UI or another
    tool) and maintainability (the source changes as a whole). This also
    resolves the negation question decision 30/31 left open — no schema-level
    negative primitive was added; the relationship type itself
    (`not_authoritative_for`) carries the negative claim. Real evidence from
    re-extracting relationships against the full raw cache (not the lean
    markdown): 338 references, 296 resolved (87.6%), 42 left as
    `target_unresolved` — a considered, named set (four single-word
    abbreviations deliberately never auto-resolved, because "Banking" would
    wrongly match `banking-vas-integrations` while superficially similar
    cases would resolve correctly, so none of that class was resolved;
    generic collective phrases; "Banking Domain" itself, confirmed absent
    from the source's 39 `## ` headers, not missed by extraction). Full
    method, evidence, and open questions in
    `docs/domain-model-experiment.md`'s "Pivot" section;
    `components/kg-viz/generate.py` simplified to read the structured
    relationships directly, dropping the string-similarity matching decision
    31 introduced. The reward-initiative evaluation task — this experiment's
    actual test — still hasn't run.
33. **Rename executed: `arch-knowledge-graph` → `arch-ai-uplift`** (decision
    29's "agreed in principle" acted on). GitHub repo renamed via `gh repo
    rename` (GitHub redirects the old URL). The four content references to
    the old name updated: this log (this entry; decision 29's own text is
    left as written, since it correctly described the state at the time),
    `kg-core/schemas/domain.schema.json`'s `$id`, and
    `meta/architecture-learning/README.md`'s worked example of its own
    transcript-slug mechanism — deliberately not a historical record, since
    it explains a still-live mechanism using this repo as the example, so it
    was updated rather than left. `docs/decision-log.md`'s own earlier,
    genuinely historical mention (the "repo location/name" resolved item,
    describing initial `git init`) was left alone on the same
    don't-rewrite-history basis as decision 31. Two steps deliberately left
    to the user rather than attempted from inside a sandboxed tool call:
    `git remote set-url origin https://github.com/Dan-Liu-Tyro/arch-ai-uplift.git`
    (writing `.git/config` is sandboxed — confirmed by trying; `gh repo
    rename` itself succeeded, only the local remote-URL update failed) and
    `mv "/Users/bliu/code/claude workspace/arch-knowledge-graph" "/Users/bliu/code/claude workspace/arch-ai-uplift"`
    (not attempted at all — the new path isn't in the sandbox's current
    allow-list, which is scoped to the old name, and renaming the directory
    this session is running from risks breaking the session's own working
    directory mid-command with no clean way to verify the failure mode
    first). See Next steps' item 13. Claude Code's per-project memory
    (session transcripts and this session's own accumulated cross-session
    memory files) is copied to the new project-path slug as part of the
    same pass, per the risk decision 29
    and `meta/architecture-learning/README.md` both already named.

## Constraints identified

- **The user is likely to be the sole person working the Architecture
  stream for this program**, stated directly on 2026-09-08 while assessing
  slide 26's capacity against its FY27 scope. This sharpens rather than
  answers the capacity concern raised repeatedly in conversation: eight
  substantial FY27 capabilities — agent PoC, capability-maturity
  assessment, a three-stage solution-architecture maturity ladder, vendor
  due diligence, sparring-submission drafting, TPP impact analysis — against
  one person, not the two named on slide 2 of the CTB pack. Not resolved
  here; flagged as context for whoever revisits scope or sequencing later,
  including a future session of this project.
- **`updateConfluencePage` replaces the whole body, so Claude can generate a
  page but cannot safely *edit* a human-maintained one.** Found 2026-09-14
  trying to add a single emoji marker to one table cell of the Architecture
  Capability & Process Map. The MCP tool takes no patch or partial update —
  `body` is a full replacement — so a one-character change means re-emitting
  the page's entire body, 66,877 characters of HTML carrying `data-local-id`
  attributes, smartlink nodes and per-cell background colours, byte-perfect.
  Confluence version history makes a bad write revertible, but nothing makes
  a long verbatim re-emission reliable.
  **This splits decision 5's publish path in two, and only one half works.**
  Generating a page this repo owns, wholesale from entities, is exactly what
  full-body replacement is for — `confluence-publish` is unaffected. Editing
  a page a human curates by hand is not viable through this connector at
  all, regardless of how small the edit is. So any workflow that wants
  Claude to annotate, mark up, or correct an architect-maintained page needs
  a different mechanism (a generated companion page, or an inline comment
  via `createConfluenceInlineComment`, which *is* an additive call), and the
  small-edit case belongs with the human whose page it is.
- **Rovo is cloud-hosted; the KG is local.** Rovo can't reach the local repo
  directly. Any interface Rovo queries against (API/MCP/other) must be
  network-reachable, which means eventually going through the org's real
  deployment path (TAP/CTAP via Schooner/Jetstream, GitOps/ArgoCD, promoted
  dev → staging → production via Drydock) — not just running locally. Treated
  as a v2 concern; doesn't block starting the KG core now.
- **Claude → Confluence access:** the Atlassian MCP connector is installed and
  authenticated in Claude Code. Verified against the live tool list: it exposes
  Confluence page read/create/update and CQL search, Jira issue read/write/
  transition and JQL search, Compass components, and Teamwork Graph context/
  search. It does **not** expose any way to invoke or direct the Rovo agent
  itself — CRUD and search only. Two consequences:
  - The git → Confluence publish step can be driven directly from Claude Code
    (`createConfluencePage` / `updateConfluencePage`), so getting started needs
    no separately deployed integration.
  - Grounding Rovo still depends on Rovo indexing the published Confluence
    space. There is no MCP shortcut, which reinforces treating the
    network-reachable query interface as a v2 concern.

## Open questions (not yet decided)

- **Whether to adopt an MVP-first reframing of decision 5 (Confluence flow)
  and the schema itself** — see [`docs/mvp-proposal.md`](mvp-proposal.md),
  recovered from a lapsed session where it was assessed but never decided.
  Blocks on a real question set and known-canonical/superseded Confluence
  pages, which only a human architect can supply. Now confirmed by the program
  roadmap: milestone 2.1 ("active Knowledge Graph") is Phase 2, not the
  current phase, and the AKB's 50+-question Golden Evaluation Set is the same
  ask as the MVP proposal's question set, at program scale.
- **Claude Cowork's role is undefined here.** The program roadmap's milestone
  1.1 asks explicitly for defining how Rovo, Claude Code, *and* Claude Cowork
  collaborate; this repo's design (`claude-code-access`) only accounts for
  Rovo and Claude Code.
- **Whether milestone 1.1's "in progress" status matches this repo's actual
  state.** `kg-content` held zero entities from repo start until decision 21
  (2026-09-08) added its first, migrated from Arc Lite's retired grounding
  table rather than authored fresh — a real entity, but one, and not yet
  through the three-entity typed-relationship pressure test
  `kg-content/README.md`'s Status section still calls for. Either curation
  progress is happening outside this repo too, or the tracker is still ahead
  of reality — worth confirming which rather than assuming either.
- **Resolved 2026-09-08, by explicit instruction: IN-562, IN-563, IN-564 and
  their epics (AIDLC-115, AIDLC-117) have been edited to match slide 26's
  wording**, on the basis that the approved capability stream plan is the
  source of truth (decision 15). This closes the divergence noted above as
  it originally stood — Jira no longer disagrees with the slide.
  - **What it does not resolve, and decision 15 now tracks instead:** the
    M1/M2/M3 solution-architecture maturity ladder introduced by IN-564's
    rename is now in Jira as well as on the slide, but still doesn't appear
    in `docs/program-roadmap.md` or slide 17's own milestone language. Jira
    and the slide agreeing with each other doesn't mean either agrees with
    the roadmap — that's exactly the re-evaluation decision 15 defers until
    the plan is finished and XLT-approved.
  - **What was traded away, not just reworded — and which of it is fine to
    lose.** The user confirmed IN-563/AIDLC-115's business-process-contract
    scope and IN-562's environment/tooling scope are fine to drop: minor, or
    already completed. **Not fine to lose, and preserved here because it no
    longer exists anywhere in Jira:** IN-565 and its epic AIDLC-116 were
    renamed from "First Build-Lean-Adjust loop" to Vendor/Product Due
    Diligence (below) before the question of where 1.3 goes was resolved.
    AIDLC-116's original description, verbatim, so the content survives
    until a real ticket exists for it: *"Gathering the lived experience and
    technical learnings from MVP to make adjustments to the grounding logic,
    content structure, and agent behaviour — ensuring a robust foundation
    for scaling."* Per the resolution above, this becomes a story or epic
    under IN-564, not yet created — see Next steps.
- **Whether Architecture and Security are building the same thing.**
  [IN-574](https://tyropaymentsltd.atlassian.net/browse/IN-574) "AI-Assisted
  Security Architecture & Solution Design" declares a dependency on
  Architecture; Architecture's own plan builds AI-Assisted Solution
  Architecture and AI-Drafted Sparring Submissions. Security has been added to
  Architecture's dependency cells so the link is at least visible from both
  sides, but the actual split of ownership is not agreed.
- Concrete schema: entity types, relationship types, folder layout, frontmatter
  shape.
- Confluence publish/sync mechanism (git → Confluence): generation approach,
  cadence, conflict handling. The transport is settled (Atlassian MCP page
  create/update); what remains open is how pages are generated from KG entities
  and how divergence is handled if someone edits a published page by hand.
- **`query-service`'s wire protocol.** Its purpose is settled — a thin,
  network-reachable transport over `kg-core` for remote consumers (Rovo, or
  any agent that can't read this repo's filesystem) — but the protocol itself
  is not. MCP is a plausible candidate (Rovo already speaks MCP for the
  Atlassian connector), but nothing has chosen it over a plain REST/GraphQL
  API. Deliberately left open, per `least-infrastructure-first`, until the
  component is actually built — see `components/query-service/README.md`.
- **GitHub connector availability — parked, revisit later.** No GitHub MCP
  connector is enabled in the current Claude Code session (verified against the
  live tool list). Not yet established whether that is an org-level entitlement
  decision, an account-level one, or simply not added to this project's MCP
  config. Not blocking: org standards direct GitHub operations through the `gh`
  CLI, and git over HTTPS already works for branch/commit/push. Worth resolving
  eventually because PR review is the KG's designated quality gate, so smoother
  PR tooling has compounding value once schema work starts producing reviewable
  changes.

Resolved since first draft:
- Atlassian MCP connector capability — answered under Constraints above
  (Confluence/Jira CRUD and search, no Rovo agent invocation).
- Repo location/name and whether to `git init` — done. This workspace is the
  repo (`arch-knowledge-graph`), pushed to GitHub, with `main` as the default
  branch, intended per org change-management standards to move only via
  reviewed PR. **Correction, 2026-09-03:** checked GitHub branch protection
  directly (`gh api .../branches/main/protection`) rather than assuming the
  earlier note was still accurate — `main` has no branch-protection rule
  configured; nothing on GitHub currently enforces the "only via PR" intent.
  Not fixed as part of this entry; flagged so it isn't silently relied on.
- **Branching during the design phase:** day-to-day work happens on a
  long-lived `plan` branch rather than a PR per change, by explicit request —
  "create branch called plan... until we reach a milestone" — to keep pace as
  a solo effort without per-change review friction. `main` is unaffected by
  this and stays PR-gated by convention. **Resolved 2026-09-03:** the
  milestone was named as a trigger up front but left unconcretized; the user
  stated directly that the plan stage is done, which is what makes it
  concrete — not a fixed deliverable list. That call opened PR merging
  `plan` → `main`, folding in everything decided since PR #1 (the KG schema
  draft, the full `meta/` tier, `component-model.md`, `program-roadmap.md`,
  `local-agent`, and `query-service`'s README).

## Next steps

1. Define the KG schema (entity types, relation types, frontmatter shape). This
   is now the critical path — nothing downstream can be built against it until
   it exists.
2. Design the Confluence publish/sync mechanism (page generation from entities,
   cadence, handling of hand-edited pages).
3. Sample a representative slice of the 100+ existing Confluence pages to
   pressure-test the draft schema against real content before committing to it.
4. **Once the Architecture capability stream plan (slide 26) is finished and
   approved by XLT:** re-evaluate `docs/program-roadmap.md` for alignment
   against it (see decision 15), and update the Confluence milestone tracker
   to match wherever the approved plan has moved ahead of it — starting with
   the Q2 milestone 1.3 displacement (decision 13) and the M1/M2/M3 naming
   introduced on the slide and in IN-564/AIDLC-117.
5. **Create a Story (or Epic) under IN-564 / AIDLC-117 for the first
   build-learn-adjust loop** (decision 13's resolution). Use AIDLC-116's
   preserved original description (decision 13, "what was traded away") as
   the starting content: gathering lived experience and technical learnings
   from Maturity 1 to adjust grounding logic, content structure, and agent
   behaviour. Explicitly not actioned yet — the user asked to document this
   only, not touch Jira again this session.
6. ~~Hand-edit `.claude/agents/arc-lite.md`'s file-pointer list~~ —
   **done 2026-09-08.** Turned out not to need a human hand at all; see
   decision 17's correction note. Both missing entries
   (`constitution/05-ignore-list.md`, `constitution/06-answer-format.md`)
   are in the file now.
7. **Use Arc Lite for real, on real architecture questions, through
   `ui/server.py`,** so `gap-log.md` (decision 17) actually starts
   filling from lived usage rather than staying a designed-but-untested
   mechanism.
8. **Design an eval set for the local agent (Arc Lite).** Raised
   2026-09-08, right after decisions 18–20's native-skill wiring was
   verified end to end. Already has a first concrete artifact, built
   concurrently by another session the same day:
   `components/local-agent/eval-examples.md`, which migrated the two
   non-canonical rows out of the now-retired `02-canonical-sources.md`
   (see decision 21) as candidate material, and connects them explicitly
   to `docs/program-roadmap.md`'s AKB 50+-question Golden Evaluation Set
   (program milestone 2.1). Still open, beyond adding more candidates:
   whether this stays a small local rehearsal of that same program-scale
   set, or grows into something scoped to what Arc Lite alone can be
   graded on (e.g. `kg-content` citation correctness, refusal correctness
   per `.claude/agents/arc-lite.md`'s working protocol, skill-trigger
   accuracy) — worth deciding before it grows much past two entries.
9. **Design `meta/idea-to-presentation`'s actual mechanism (decision 22).**
   Placement and purpose are settled; how an idea actually becomes a
   deck/page is not — output formats beyond PowerPoint/Confluence,
   whether any generation tooling is needed (and if so, its language per
   org standards), and how it's invoked (skill, agent, or something else)
   are all still open.
11. **Run CP1 on the Architecture Capability & Process Map** (decision 28).
    IN-563's critical path. Four unresolved inline comments from the Head of
    Architecture are already on the page and are the agenda: two propose
    deleting *Technology Radar* and *Technical Excellence / Knowledge Sharing*
    as Platform Engineering's, two ask whether *Architecture baseline refresh*
    and *Diagram asset management* are separate processes. Also needing
    resolution: four rows have no Inputs or Outputs at all (the same four),
    three rows have no maturity-level descriptions so cannot be rated
    (*Architecture Governance*, *Architecture Debt Management*, *Post
    Implementation Conformance Check*), and *Sensible Defaults Maintenance* has
    no Inputs. Also on the agenda, and not fixed on the page: *Architecture
    Sparring Preparation & Jamming* carries no 🌟 although IN-567 targets it
    (the edit was deliberately not made — see the full-body-replacement
    constraint above). CP2 and CP3 are both blocked on this; until it passes,
    `practice/capability-maturity/` holds a proposal for correction, not an
    assessment, and should not be reported as one.
13. **Rename the repo to `arch-ai-uplift`** (decision 29, executed by
    decision 33). **Done:** GitHub repo renamed, the four content
    references to the old name updated, per-project memory copy to the new
    slug prepared. **Still manual, blocked on sandboxed tool access:**
    `git remote set-url origin` (writing `.git/config` is sandboxed) and
    the local directory rename itself — both need to be run outside the
    sandbox (see decision 33 for exact commands and why). The README's
    "On the name" note and this item stay as-is until both of those are
    confirmed done, not just the parts a sandboxed session could reach.
12. **Decide whether `docs/program-roadmap.md` moves into `practice/`**
    (decision 26). It is structurally a `practice/` artefact — an
    externally-owned snapshot of the program's Confluence milestone tracker —
    but it is cited by path from many entries in this log, so the move needs a
    pass that updates those citations rather than a rename. Not urgent; worth
    doing before a second snapshot-shaped artefact lands in `docs/` and makes
    the inconsistency the norm.
10. **Seed `meta/CDCD/observations.md` with a contradicting instance**
    (a real cost or rework caused by a deferred spec), not just
    supporting ones — decision 24 names this as required before
    treating the CDCD hypothesis as more than a working claim. Also
    revisit CDCD's working-title name once there's enough material to
    test it against a reader unfamiliar with the founding conversation.
