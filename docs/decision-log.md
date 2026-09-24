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
| 34 | Programme Stream page re-baselined to FY27 Q2/Q3/Q4; new IN-564 epics cited | Confluence, Jira, program roadmap |
| 35 | `kg-viz` split into two purpose-built views; first typed directed graph; `scope` tag on `domain` | `kg-viz`, `kg-content/entities/graphs/`, `kg-core/SCHEMA.md` |
| 36 | `kg-viz` de-serverised: `serve.py`/`graph.sh` deleted, `index.html` opened from disk | `kg-viz`, `CLAUDE.md`, component-model |
| 37 | `kg-viz` starts empty and opens any compatible graph file; `graph-data.js` dropped | `kg-viz` |
| 38 | `kg-viz` offline-only: renderer vendored and committed, no remote loads | `kg-viz`, `.gitignore`, backlog |
| 39 | `kg-viz` UI renamed "Knowledge Visualizer"; `index.html`→`knowledge-visualizer.html`, `graph.json`→`payments-target-state.json`; source split under `src/`, compiled by `build.py` | `kg-viz`, `CLAUDE.md`, `README.md` |
| 40 | `payments-target-state.json`→`payments.json` after the same-named source overlay caused a real mis-pick; `build.py` embeds it, adding a "Load default" button | `kg-viz` |
| 41 | Stage bands invisible in Safari only: `#bands` `<svg>` needs explicit `width`/`height`, `inset:0` alone doesn't stretch a replaced element | `kg-viz` |
| 42 | Agent's invocation handle renamed `arc-lite` → `arc` for easier `@`-mention; persona identity and disclaimer unchanged | `local-agent` |
| 43 | New pattern: dedicated agents own one artifact's source of truth and lifecycle; `backlog` agent is the pilot, owning `docs/backlog.md` | `docs/backlog.md`, `CLAUDE.md`, new `.claude/agents/backlog.md` |
| 45 | `arc`'s missing live-Confluence access (open since decision 17) made an explicit decision: stay local-only for now, for testing | `.claude/agents/arc-lite.md` |
| 48 | `not_authoritative_for` reversed to node-level text only; `kg-viz`'s `domain-authority`/"Ref Domains" view removed entirely | `kg-core/SCHEMA.md`, `kg-core/schemas/domain.schema.json`, `kg-content/entities/domains.json`, `kg-viz` |

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

    **The relationship-type half of this is reversed by decision 48** — the
    file-consolidation half (one JSON-Schema-backed file for `domain`)
    stands unaffected. `not_authoritative_for` never had a consumer beyond
    its own visualization in `kg-viz`, which is removed; explicit
    non-authority is text-only on the node again, as it already was in
    `authority.not_authoritative_for` before this decision made it also a
    structured edge.
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
    first). See Next steps' item 13. **A third manual step, found only by
    trying:** copying Claude Code's per-project memory (session transcripts
    and this session's own accumulated cross-session memory files) to the
    new project-path slug — the risk decision 29 and
    `meta/architecture-learning/README.md` both already named — turned out
    to be blocked the same way: `~/.claude/projects/` is explicitly denied
    to sandboxed writes, so this could not be prepared in advance either.
    All three manual steps in Next steps' item 13.

34. **Confluence "Architecture AI Uplift Programme Stream" page (2121630616)
    milestones re-baselined to FY27 quarter language, and the two new
    Foundation milestones reflected in Jira.** Requested directly by the
    user, not inferred. Tyro's FY27 runs Jul 2026–Jun 2027 (Q1 Jul–Sep, Q2
    Oct–Dec, Q3 Jan–Mar, Q4 Apr–Jun) — derived from, not assumed on top of,
    decision 13's own claim that Dec 2026 is "Q2 FY27" and confirmed against
    IN-562/IN-563's live 2026-09-30 (end of Q1 FY27) due dates. Net effect:
    - **Phase 1 (Foundation):** Dec 2026 → **FY27 Q2 (Dec 2026)** — no date
      change, just the quarter label decision 15 asked for and
      `docs/program-roadmap.md` still lacks.
    - **Phase 2 (Human-in-the-Loop):** Apr 2027 → **FY27 Q3 (~Mar 2027)** —
      pulled in about a month.
    - **Phase 3 (Human-on-the-Loop):** Aug 2027 → **FY27 Q4 (~Jun 2027)** —
      pulled in about two months.
    - Milestones 1.1 and 1.2 now cite the Jira initiative/epics actually
      carrying the work: 1.1 → IN-564 plus epics AIDLC-166 (canonical
      knowledge base), AIDLC-167 (agent-readable doc standard), AIDLC-170
      (knowledge lifecycle & hygiene), AIDLC-171 (knowledge/context graph);
      1.2 → AIDLC-117 (architecture-agent build) and AIDLC-168 (grounded
      retrieval with citations). These five epics under IN-564 are new since
      decision 16 last checked Jira (which only knew of AIDLC-117) and are
      independent confirmation this repo's own shape — canonical curation,
      a documentation standard, grounding-with-citations, a lifecycle/gap
      log, and a graph — is the same shape Jira has separately arrived at.
    - **Pushback made and stood, not silently executed:** compressing Phase
      2/3 adds schedule pressure on top of the "Constraints identified"
      section's standing note that the user is likely the sole person
      carrying this stream against eight FY27 capabilities. Recorded here so
      the compression isn't read as risk-free just because it was actioned.
    - **Deliberately not done, on the user's explicit choice over the
      alternative:** the identical milestone table on
      ["Activity & Evidence Home"](https://tyropaymentsltd.atlassian.net/wiki/spaces/AE/pages/2212429894)
      (the page `docs/program-roadmap.md` snapshots) was **not** updated —
      the user chose "just the linked page" when asked whether to update
      both. The two Confluence pages now disagree with each other on Phase
      2/3 dates and initiative detail, the exact "pack disagreeing with
      itself" failure decision 13 flagged. This is a known, chosen, open gap
      — see Next steps — not an oversight.
    - Edited via full-body HTML replacement (the only viable path per the
      "Constraints identified" entry on `updateConfluencePage`), executed by
      a forked subagent to keep the ~59KB verbatim payload out of the main
      session's context; the agent diffed its upload against the original
      fetch before writing and confirmed only the five intended spots
      changed. Page version 32 after the edit.
35. **`kg-viz` reworked from one 3D force graph into two purpose-built
    views; first typed, directed graph in `kg-content`; `scope` tag on
    `domain`.** Triggered by the user's verdict on the first pass: *"3D
    should fit the purpose of usefulness. Not just fancy."* Four changes,
    all revisable:
    - **Two views, not one canvas.** `payments-target-state` (26 nodes, 43
      directed typed edges) is now the **default** view; `domain-authority`
      (40 nodes, 296 `not_authoritative_for` edges) is the second. They are
      deliberately not merged: the authority graph averages degree ~15 and
      renders as a hairball, while the flow graph is sparse and readable.
      `graph.json`'s shape changed from `{nodes, links, stats}` to
      `{categories, default_view, views[]}` — it remains a disposable build
      artifact, so this is not a migration.

      **`domain-authority` is removed by decision 48** — the tension this
      bullet already named (a single-predicate graph that "renders as a
      hairball") was never resolved for that view, only worked around, and
      it never gained a consumer beyond its own rendering. One view now;
      `payments.json`'s shape has one fewer level of nesting in practice
      (`views[]` still exists structurally, just holds one entry) than
      described here.
    - **First typed, directed relationships in the graph.** Until now every
      edge in `kg-content` was a single predicate (`not_authoritative_for`),
      which meant the graph could not do the contradiction detection or
      dependency tracing that `CLAUDE.md` names as the reason to be a graph
      at all. `entities/graphs/payments-target-state.json` adds 43 edges
      across 36 distinct predicates, each with a `payload` and a stage.
      Nodes that are domains are declared as a `domain_ref` and resolved
      against `domains.json` at generation time, so **domain facts are
      referenced, never duplicated** — the overlay can go stale only by
      pointing at an id that no longer exists, which `generate.py` reports
      as `unresolved_domain_refs` (currently zero of 17).
    - **`scope` on every domain, binary, and the UI dims rather than
      hides.** 12 domains `acquirer-specific`, 27 `tyro-wide`. The user was
      offered a three-valued tag (`both`) and a strict binary filter, and
      chose binary-plus-dimming explicitly: a domain filtered *out* of an
      acquiring view is often the boundary you are trying to see, so
      removing it defeats the purpose. Eight domains carry a `scope_note`
      recording that the call was arguable and why (`funds-movement`,
      `billing-and-accounts-receivable`, `fraud-and-risk-decisioning`,
      `product-quoting-and-pricing`, `hardware-and-asset-management`,
      `integration-enablement-and-certification`, `disputes-and-recovery`,
      `payments-accounting`) rather than presenting 39 confident
      classifications.
    - **Swimlane layout, and one honest feedback arc.** Layout is
      lane = stage, column = longest-path depth *within* that stage. Two
      earlier attempts were wrong and are recorded because the reason
      generalises: ranking the whole graph by longest path produced a
      16-column, one-node-per-column ribbon that read as a chain and threw
      away the source's own stage decomposition; and choosing back-edges by
      DFS order cut the three telemetry edges into Data Analytics, pushing a
      pure sink to the *front* of its lane. Back-edges are now chosen by the
      model (an edge landing in an earlier stage) rather than by iteration
      order, which leaves exactly one: cross-domain reports → merchant. It
      is drawn dashed and counted, not dropped.
    - **Source caveat that must not be lost.** The origin is a Confluence
      **whiteboard** (1823277126) whose body is *not* readable through the
      Atlassian connector — `getConfluencePage` 404s on it, the whiteboard
      REST endpoint returns "Could not find whiteboard", and
      `getTeamworkGraphObject` returns metadata with `bodyValue: null`. Only
      a ~260-character search-index extract is machine-readable. The data
      therefore comes from a structured text feed page (2382233611) the
      whiteboard's owner authored for this purpose. Both are WIP and the
      graph's `status` is `draft`. A separate, older page by a different
      (now deactivated) author,
      ["Payments Authorisation Target vs Current State Reference
      Architecture"](https://tyropaymentsltd.atlassian.net/wiki/spaces/~712020aff4ef8556f94e789f49c6495abd09f9/pages/1793720389),
      describes a *different* decomposition — it introduces a "Client
      Integration Domain" that does not exist in `domains.json` at all — and
      was deliberately **not** used as the source. Decision 28's lesson
      applied on purpose: it would have been the wrong page.
    - **Follow-up, 2026-09-22 — decision 35 shipped a broken start command.**
      Changing `generate.generate()`'s return shape broke `serve.py`, which
      still indexed `result['nodes']` and raised `KeyError: 'nodes'` before
      reaching its socket bind, so `./graph.sh start` failed every time. It
      was missed because `serve.py` had been filed as untestable in this
      sandbox (it cannot bind a socket) and was therefore excluded from a
      verification pass that covered everything else — the restriction
      applies to one call, not the file. Fixed by extracting
      `serve.summarize()` so the pre-bind path can be exercised without a
      socket, and the script now prints the current attempt's error inline
      instead of only naming an append-only log whose most obvious traceback
      often belongs to an earlier run. Recorded as
      `meta/perception-failures/log.md` entry 8 with its rule in
      `meta/procedural-memory/universal.md`. The wrapper was also renamed
      `kg-viz.sh` → `graph.sh` by the user; the rename was unrelated to the
      failure, though the failure message invited that diagnosis.
36. **`kg-viz` has no server: `serve.py` and `graph.sh` deleted, `index.html`
    opened directly from disk.** Proposed by the user — "if we completely drop
    the idea of having server at all, just a simple html with capability to
    load a local graph file to display it. Any problem with that?" — and
    adopted, because the answer was no.
    - **Nothing here ever needed a process.** The component serves two static
      files to one local reader. What the server contributed was failure
      modes, and they consumed most of four debugging rounds: a startup crash
      when `generate.generate()`'s return shape changed and `serve.py` was the
      one consumer not updated; HTTP caching that served a two-commit-old page
      while the fix was reported as "same thing"; and an append-only log whose
      most eye-catching traceback belonged to an earlier run. None of those
      are reachable without a server.
    - **How the data gets in, since `file://` blocks `fetch`.** A page opened
      from disk has origin `null`, so `fetch("graph.json")` is denied, but a
      `<script src>` is not — script tags predate CORS and were never
      retrofitted with it. `generate.py` therefore writes the same payload
      twice: `graph.json` (canonical, tracked) and `graph-data.js`
      (`window.KG_GRAPH = {...};`, gitignored as a byte-for-byte duplicate
      that would otherwise double diff churn). If the wrapper is missing the
      page offers drag-and-drop or a file picker, which works under `file://`
      because a file chosen through an `<input>` is read by explicit user
      grant. Wrong-shape and malformed JSON are rejected with specific
      messages rather than rendering as an empty canvas.
    - **This reverses part of the "mirror `local-agent`'s server" decision**
      that produced `serve.py` and `graph.sh` in the first place. Consistency
      with a sibling component was the wrong tie-breaker: `local-agent`'s UI
      genuinely needs a process because it shells out to `claude -p`, whereas
      this one only ever needed a file. Copying a neighbour's shape is not the
      same as needing its machinery.
    - **A picker is a cache by another name**, so the stats box now always
      prints three things: `PAGE_REVISION`, which file the data came from, and
      `graph.json`'s `generated_at`. Without that, stale data looks exactly
      like current data — the trap the removed HTTP cache had already sprung.
    - **Context that made this the right call: nobody but the user can see
      this page.** The sandbox denies socket operations broadly, so the server
      could not bind, `curl http://127.0.0.1` fails with "Operation not
      permitted", and headless Chrome aborts at startup creating its
      process-singleton socket. Browser automation is separately prohibited by
      organisational policy. With verification impossible from inside, the
      right response is to remove machinery rather than add more of it, and to
      make the page report its own state — see the "Constraints identified"
      entry.
37. **The viewer starts empty and opens any compatible graph file by explicit
    choice.** The user's call, on seeing the auto-loading version: *"I don't
    like it, make the vis graph viewer start with empty, allow to open and
    browse for any compatible graph, I can select graph.json and then page can
    load it. Default to graph.json."* Implemented as asked.
    - **`graph-data.js` is deleted and `generate.py` writes only `graph.json`
      again.** That wrapper existed solely to let the page auto-load from
      `file://` (origin `null` blocks `fetch`; a `<script src>` is
      unaffected). With no auto-load there is nothing for it to do. It was
      costing a second 238KB artifact that had to stay in step with
      `graph.json`, plus two filenames one token apart — which had already
      produced the question "what's the purpose of graph.js?" The naming
      confusion was the tell that the mechanism was carrying its weight badly.
    - **What "compatible" means, stated once:** any JSON with a top-level
      `views` array. `graph.json` is the named default in the prompt, but
      nothing is special-cased to it — the component is now a viewer for graph
      files rather than a display of one graph. That also makes it usable for
      a second overlay without touching the page.
    - **Reopening is a first-class operation, not a reload.** An *Open another
      graph…* control sits in the left panel. Switching files clears the
      previous graph's hidden groups and selection — stale filters silently
      narrowing a newly opened graph would be a nasty, near-invisible bug —
      and reuses the existing renderer rather than constructing a second WebGL
      context on the same element. Both are asserted in the test harness
      (scenario E: one renderer across two loads, 21 visible nodes returning
      to 26).
    - **Empty means empty.** The control and stats panels stay hidden until a
      graph is open, because a viewer showing zero counts and no stages reads
      as broken rather than as waiting. Invalid input is rejected by name and
      reason instead of rendering an empty canvas.
    - **This partially reverses decision 36's loading mechanism, not its
      substance.** No server, still; only the route the data takes into the
      page has changed, from a generated blob to a user-chosen file.
38. **`kg-viz` is offline-only: the renderer is vendored and committed, and
    the page loads nothing remote.** The user's requirement, after the viewer
    failed with the home connection down: *"I want this graph viewer is
    offline completely, shouldn't load anything online or expose any data to
    outside."*
    - **What was actually wrong, and what was not.** The failure was
      `ERR_NAME_NOT_RESOLVED` fetching `3d-force-graph` from `unpkg.com` —
      DNS failing because the connection was down, not a blocked host and not
      a bug. Worth separating the two halves of the requirement, because only
      one was ever at risk: the page has **no** `fetch`, `XMLHttpRequest`,
      `sendBeacon`, `WebSocket`, `<form>`, `<img>` or `postMessage` path, and
      `graph.json` is read from disk, so **no graph content has ever left the
      machine**. The library `<script src>` was the only outbound request; it
      disclosed the requesting IP and the fact that the library was loaded,
      never any Tyro architecture content.
    - **Now: one local source, no fallback.** `index.html` loads
      `vendor/3d-force-graph.min.js` and nothing else. A CDN fallback was
      briefly added (three hosts, to survive one being blocked) and then
      removed in the same session — it is the wrong direction once the
      requirement is "loads nothing online", and a fallback that works only
      sometimes is worse than a missing file that says so clearly.
    - **The vendored `.js` is now tracked, reversing the earlier decision to
      gitignore it.** An ignored file makes a fresh clone depend on the
      network, which is what we are removing. The cost — a minified
      third-party bundle in git that no reviewer can diff — is accepted
      because the alternative fails the requirement. Version and provenance
      are recorded in `vendor/README.md`, since a minified diff carries none.
    - **Enforced by tests, not by vigilance.** Harness scenario C asserts the
      loader attempts exactly one source and that it is relative; C2
      statically scans the shipped file for remote `src`/`href` attributes and
      for data-egress constructs outside comments. An offline regression now
      fails a test rather than going unnoticed until someone is on a train.
    - **Half of this is deferred, deliberately.** The user chose "vendor now,
      SVG renderer later" over dropping the dependency immediately. See
      `docs/backlog.md`: replacing the library with a hand-written SVG
      renderer would remove the last third-party code and, more importantly,
      make the rendering verifiable as text rather than only by a human
      looking at a screen. It was not done now because the 296-edge authority
      view still needs the library's force layout.

39. **`kg-viz`'s UI is renamed "Knowledge Visualizer"; `index.html` and
    `graph.json` are renamed to match; the JS source is split under `src/`
    and compiled by a new `build.py`.** Three related requests in one
    session: rename the on-screen name (correct spelling, not the
    typo "visualizor" as typed), rename the two files to match, and
    restructure the source for maintainability given the viewer's growing
    number of dimensions (2D/3D, stages, views).
    - **UI rename.** `<title>`, the left-panel `<h1>`, the diagnostics
      heading, and the "not a ... graph file" error note all now say
      "Knowledge Visualizer". `verify.js`'s scenario D regex was updated in
      lockstep — it matches that exact error text, so the rename would
      otherwise have gone untested until someone actually hit the error.
    - **`index.html` → `knowledge-visualizer.html`.** Uncontested: a clean
      match for the UI rename, no content mismatch.
    - **`graph.json` → `payments-target-state.json`, with a known mismatch
      accepted.** Raised and flagged before doing it: the compiled output
      contains *both* views (`payments-target-state`, 26 nodes, and
      `domain-authority`, 40 nodes/296 edges), so naming it after one view
      describes only part of what it contains, and cuts against decision
      37's point that the viewer is generic rather than special-cased to one
      file. Asked twice; the user reaffirmed the rename anyway, since
      `payments-target-state` is the default and primary view. Recorded in
      `components/kg-viz/README.md`'s "Known gaps" as a deliberate,
      acknowledged tradeoff rather than an oversight.
    - **A second naming collision, surfaced by the rename.** The *source*
      overlay `kg-content/entities/graphs/payments-target-state.json` (one
      view, hand-authored) and this component's own *compiled* output
      `components/kg-viz/payments-target-state.json` (both views, generated)
      now share an identical filename in different directories. This isn't
      new confusion introduced by the rename — `generate.py`'s docstring
      already distinguished them by role — but it is now a literal filename
      match rather than a similar one, so `README.md`'s "Depends on" section
      spells out which is which.
    - **Source split under `src/`, compiled by `build.py` (the "compile-wise
      single file, source-wise structured" request).** The user's framing:
      keep the shipped artifact as one file (required by decision 36's
      file:// no-server constraint — `<script type="module">` is blocked by
      CORS when loaded from a `file://` origin, so real ES modules were never
      an option here), but stop asking one ~950-line `<script>` block to
      hold ~40 functions across every concern the viewer has accumulated.
      Split into `state.js`, `graph-model.js`, `controls-panel.js`,
      `labels.js`, `bands.js`, `camera.js`, `data-loading.js`, `renderer.js`,
      and `bootstrap.js`, plus `src/shell.html` for the static markup/CSS.
      `build.py` concatenates them (`MODULE_ORDER`, stdlib Python, mirroring
      `generate.py`'s own convention) into `knowledge-visualizer.html`, which
      is now a generated artifact and must never be hand-edited — the same
      rule `payments-target-state.json` already followed, for the same
      reason.
    - **This is the one narrow exception to "no build system."** `CLAUDE.md`
      previously stated that fact about the repo without qualification; it
      now carves out `build.py` explicitly, since it would otherwise have
      gone stale the moment this landed. The concatenation order is chosen
      for readability, not correctness — everything lands in one `<script>`
      tag, so `function` declarations hoist regardless of file order, and
      the only file whose position actually matters is `bootstrap.js`
      (its trailing `loadLibrary(...)` call is the sole top-level
      side-effecting statement, so it is concatenated last).
    - **A real bug surfaced by the split, fixed in passing.** `shortTitle`
      and `var labelEls = {}` were each declared twice, verbatim, in the
      original single file (harmless only because both copies were
      identical) — exactly the kind of duplicate an unstructured ~950-line
      script block lets slip through unnoticed. Collapsed to one each while
      moving that code into `labels.js`.
    - **`verify.js` gained an eleventh scenario (K).** Splitting the source
      creates a new failure mode that did not exist before: editing
      `src/*.js` and forgetting to run `build.py`, leaving
      `knowledge-visualizer.html` silently stale while every other scenario
      keeps testing the old compiled code. Scenario K reconstructs
      `build.py`'s own concatenation in plain node (not by shelling out to
      `python3`, so the file's "requires only node" claim stays true) and
      fails if it does not match the committed `knowledge-visualizer.html`
      byte-for-byte.

40. **`payments-target-state.json` renamed to `payments.json`, and a "Load
    default" button added, after the same-named-file collision decision 39
    flagged actually happened.** Not a hypothetical: within the same session
    decision 39 shipped, the user picked a file through the OS dialog named
    `payments-target-state.json` and got the *source* overlay at
    `kg-content/entities/graphs/payments-target-state.json` instead of this
    component's compiled output — same filename, different directory — at
    `components/kg-viz/payments-target-state.json`. The viewer correctly
    rejected it ("not a Knowledge Visualizer graph file", no top-level
    `views` array), but it was a bad experience for picking the wrong file
    with the right name. Confirmed by checking both files' actual top-level
    keys before acting on the report.
    - **The compiled output is now `payments.json`** — short, and
      deliberately unlike either the source overlay's name or either view id
      it contains, so it structurally cannot collide with anything else in
      the repo again. Cost: the name no longer hints at what's inside (it
      still carries both `payments-target-state` and `domain-authority`,
      unchanged from decision 39's accepted tradeoff).
    - **A "Load default" button, in both places a graph is opened** (the
      initial empty-state prompt, and the left panel's "Graph file" group),
      removes the OS file dialog from the common case entirely — the
      collision can only recur through the browse path, which now exists
      only for the uncommon case of opening a different file.
    - **This needed reintroducing part of the mechanism decision 37 removed,
      because `fetch()` is blocked on `file://`.** A zero-dialog load needs
      some script-loadable copy of the data; `<script src>` is the only
      thing that works from `file://`, which is exactly why the deleted
      `graph-data.js` existed in the first place. Raised explicitly before
      building anything, given decision 37 was a deliberate, reaffirmed
      choice: asked whether to (a) have `build.py` embed `payments.json`
      into `knowledge-visualizer.html` directly (one generated artifact, not
      two) or (b) something else. The user chose (a).
    - **Decision 37's substance survives; only its "no bundled blob at all"
      half is now qualified.** The page still starts empty and draws nothing
      without a click — what decision 37 actually objected to was silent
      auto-load on open, not a button. `knowledge-visualizer.html` was
      already a generated artifact (decision 39); embedding
      `payments.json`'s content in it is an extension of that, not a new
      category of thing to keep in sync.
    - **New staleness risk, and how it's caught.** The embedded copy can lag
      behind disk if `payments.json` is regenerated without rerunning
      `build.py` — `generate.py` and `build.py` are separate commands. The
      existing on-screen `generated_at` stamp (decision 37's "freshness is
      shown" mechanism) catches this the same way it already caught every
      other staleness case; no new UI was added for it.
    - **`verify.js` split scenario K into K and L, and added M.** K now
      checks `knowledge-visualizer.html`'s *structure* against `src/` only,
      with the generated default-graph block stripped to a marker on both
      sides first — reproducing Python's `json.dumps` formatting
      byte-for-byte in node would be a fragile, pointless cross-language
      match. L checks the embedded data separately, by comparing parsed
      objects via `JSON.stringify` on both sides (both produced by the same
      node process), never against Python's raw serialized bytes. M
      exercises the Load default button itself, including that two
      successive clicks don't accumulate mutation on the shared
      `DEFAULT_GRAPH` object reference (`applyLayout()` writes coordinates
      onto node objects in place) — `loadDefault()` clones via
      `JSON.parse(JSON.stringify(...))` per click specifically to prevent
      that.

41. **Stage bands computed valid geometry but never painted, in Safari
    specifically — the seventh browser round trip, and the first one this
    component has hit that turned out to be browser-specific rather than a
    plain code defect.** The user reported "I don't see the stages boundary
    and colors at all" after decision 40 shipped. Investigated methodically
    rather than guessed at: first ruled out a stale cache (bumped
    `PAGE_REVISION`, confirmed the fresh string was showing), then a data or
    logic regression (diffed the entire script body against the last
    confirmed-working commit, byte-for-byte, finding only the intended
    decision-39/40 changes; ran the real `loadDefault()` code path through
    an instrumented copy of `verify.js`'s harness and got valid, non-empty
    polygon points). Only then asked the user to check the DOM directly via
    browser devtools — which confirmed the polygons existed with correct,
    non-degenerate geometry, yet were invisible. The `[Log]` prefix on the
    console output the user pasted back was the tell: that format is
    specific to Safari's Web Inspector.
    - **Root cause: `#bands` is a bare `<svg>` sized only by
      `position: absolute; inset: 0`, with no explicit `width`/`height`.**
      An `<svg>` is a replaced element with its own intrinsic-size rules,
      unlike a `<div>` — Safari has known quirks not stretching one to fill
      an absolutely positioned box from `inset` alone the way it does an
      ordinary block element. `#graph` (a `<div>`) was never affected by
      this, which is why nodes, edges, and the HTML label overlay all
      rendered correctly while only the SVG band layer stayed invisible.
      Polygon points were computed correctly in full-viewport pixel space,
      then silently clipped by the SVG's own collapsed viewport — geometry
      correct, paint absent, no error anywhere.
    - **Fix: explicit `width: 100%; height: 100%` in CSS, and matching
      `width="100%" height="100%"` attributes directly on the `<svg>` tag.**
      Belt-and-suspenders because SVG viewport establishment doesn't defer
      identically to CSS across every engine; the attribute-level fix is the
      more universally reliable of the two, the CSS rule documents the
      reasoning where a future reader will actually see it.
    - **What this changes about "confirmed working."** That claim (Known
      gaps, this file's `README.md`) was accurate for whichever browser did
      the confirming, not for every browser — worth stating explicitly now
      that the gap has mattered once, rather than let the phrase imply more
      than it verified. The verification constraint this component operates
      under (nothing browser-facing checkable from a Claude Code session)
      extends one level further than previously written: it is not just
      "needs a human's eyes," it is "needs a human's eyes, in the specific
      browser being asked about."
42. **The subagent's invocation handle renamed `arc-lite` → `arc`, so it's
    easier to `@`-mention in a Claude Code session; the persona identity
    and non-affiliation disclaimer from decision 19 are unchanged.** The
    user asked directly for the rename. Flagged one objection before
    acting, per this repo's standing challenge-first norm: the agent's own
    Identity section calls "never imply you are the real Arc" non-
    negotiable, and an invocation string of exactly `arc` asserts that
    identity before the agent says a word. The user's answer resolved it:
    there is no agent actually named `arc` in the Claude Code namespace to
    collide with, so the concern was about a real ambiguity that turns out
    not to exist here, not one the rename creates. On that basis, only the
    technical handle changed — the frontmatter `name:` field, the `claude
    -p --agent` flag value, and every filename/path built on it. The
    persona name "Arc Lite" in prose, the Identity-section disclaimer, and
    `arc-lite-identity`'s own skill name (a separate artifact, not asked
    about) are all untouched, so the agent still answers describing
    itself as Arc Lite, not the real Arc, even though it's now invoked as
    `@arc`.
    - **Files changed:** `.claude/agents/arc-lite.md` → `arc.md`
      (frontmatter `name:` only); `components/local-agent/ui/arc-lite.sh`
      → `arc.sh` (and its internal `arc.pid`/`arc.log` names);
      `components/local-agent/ui/server.py` (`--agent` value, the
      `ask_arc_lite()` → `ask_arc()` function name, and path comments);
      `components/local-agent/constitution/03-skills.md` and
      `05-ignore-list.md`; `.claude/skills/arc-lite-identity/SKILL.md`
      (path references only, not its own `name:`);
      `components/local-agent/README.md`; `CLAUDE.md`'s Layout section;
      `meta/idea-to-presentation/README.md`'s precedent reference.
    - **Deliberately left alone:** every reference to the old
      `arc-lite.md` path inside this file's own earlier entries (9, 17–20),
      and inside `meta/procedural-memory/universal.md` and
      `meta/perception-failures/log.md` — those are historical record (one
      is a direct quote) of what was true at the time, not live pointers,
      and rewriting them would misrepresent the history rather than
      preserve it.
    - **Sandbox note:** renaming `.claude/agents/arc-lite.md` itself is a
      create+delete of a path under `.claude/agents/`, which the sandbox
      blocks outright (see `meta/procedural-memory/universal.md`'s
      create-vs-edit boundary) — Claude could edit the file's `name:`
      field in place but could not perform the rename. That one `git mv`
      needs the user's own hand.
43. **New standing pattern: a bounded artifact gets one dedicated agent
    that owns its structure and every write to it; other agents may read
    it but route changes through the owner.** Reached over several turns
    of the user proposing "single player" delegation as a way to relieve
    Claude, the orchestrator, from concrete component/meta work without
    context exploding, then generalizing from two concrete candidates
    (a `procedural-memory` bookkeeping pilot, a backlog query agent) to
    this rule once both turned out to be instances of something this
    project's own `README.md`-as-contract convention already implied.
    - **The rule has two preconditions, both argued for and accepted
      before this was applied, not assumed:** (1) **earn it, don't
      pre-allocate it** — the same `least-infrastructure-first` discipline
      `constitution/03-skills.md` already applies to skills, so not every
      component/artifact gets an owning agent on day one, only ones with
      demonstrated recurring friction; (2) **a carve-out for the most
      cross-cutting artifacts** — `docs/decision-log.md` and
      `docs/program-roadmap.md` stay with the orchestrator specifically
      *because* they require whole-project context no bounded specialist
      agent has, the opposite property that makes a component/feature a
      good candidate in the first place.
    - **Ownership is a documented convention honored by whichever agent
      touches the file, not a technical access lock** — unlike the
      `.claude/agents/` sandbox boundary (decision 42's own entry, right
      above), nothing stops any agent from `Edit`-ing an owned artifact
      directly. The guarantee is the same shape as this repo's other
      contracts (a component's `README.md`, PR review as the quality
      gate): stated, and expected to be honored, not enforced by tooling.
    - **`backlog` is the pilot** (`.claude/agents/backlog.md`), owning
      `docs/backlog.md`. Chosen over the `procedural-memory` candidate to
      go first because it is read+directed-write rather than
      write-with-independent-editorial-judgment: the agent files what
      it's told, it does not decide priority or promote an entry into
      `docs/decision-log.md` on its own initiative — both stay a
      stewardship call the orchestrator makes with the user, unchanged
      from before this agent existed.
    - **Priority scheme, decided by the user over three options
      presented** (inline tag / separate priority table / reorder by
      priority): an inline tag right after each idea's bold title —
      `[P1]` worth doing next, `[P2]` agreed but not urgent, `[P3]`
      parked. Chosen specifically to avoid the second-copy drift
      `docs/component-model.md`'s Status-column note already warns
      against; no entry is retroactively tagged, since guessing a
      priority no one gave is exactly what the agent is told never to do.
    - **What "manage its own data structure internally" does and does not
      mean**, clarified because the phrase could otherwise be read as
      moving the source of truth out of the file: the agent may evolve
      formatting/dedup conventions freely, but `docs/backlog.md` itself
      must stay plain, git-versioned Markdown, readable by a teammate who
      has never talked to the agent — CLAUDE.md's "if it isn't in one of
      these files, it didn't happen" rule applies to this file regardless
      of which agent maintains it.
    - **Sandbox note, same shape as decision 42's:** creating the new
      `.claude/agents/backlog.md` file is itself a create under
      `.claude/agents/`, which the sandbox blocks — Claude wrote every
      other file in this decision directly (`docs/backlog.md`'s header,
      `CLAUDE.md`'s Layout section, this entry) but handed the user one
      exact command to create the agent file itself.
    - **Not yet done:** verifying `@backlog` actually invokes the new
      agent (decision 42 showed the harness may pick up a new persisted
      agent from its frontmatter before any git operation on the file
      completes — worth re-checking whether that holds for a genuinely
      new file, not just a renamed one).
44. **Layout geometry stays derived, not curated — the graph data holds no
    pixels and no stored positions.** Raised by the user asking whether node
    positions are stored in the graph JSON, and whether visual data belongs
    inside core data or beside it as its own thing. Checked against the code
    rather than answered from memory: positions are not stored anywhere, and
    the separation being asked for already exists, in three tiers.
    - **The three tiers.** `components/kg-content/` holds curated truth —
      entities, typed relationships, stage membership — and carries no
      `col`/`row`/`lane` field at all. `components/kg-viz/generate.py`
      derives those ordinals from the graph's own topology and writes them
      into `payments.json`, a regenerable view artifact. Only `kg-viz`'s
      `applyLayout()` turns an ordinal into a pixel, by multiplying it by
      `COL_SPACING`/`LANE_HEIGHT`/`ROW_SPACING`. The graph JSON is therefore
      resolution-independent: changing one spacing constant rescales the
      whole picture without touching data.
    - **Affirmed as the right split, and not to be collapsed.** Moving
      positions into `kg-content` would put presentation into the curated
      source and make PR review of *meaning* harder, which is the one job
      that tier's quality gate exists to do.
    - **Known weakness, accepted: `col` and `row` are not the same kind of
      thing, but are stored as though they were.** `col` is longest-path
      depth within a stage — a fact about flow topology, and the reason the
      payment path reads left-to-right. `row` is assigned by
      `sorted(members, key=(depth, order_of))` in `generate.py`, where
      `order_of` is a node's index in the input list — so it derives from
      entity enumeration order, not from meaning. Adding or reordering an
      entity in `kg-content` can reshuffle rows and move nodes nobody
      intended to move. This is exactly the failure mode
      `meta/procedural-memory/universal.md` already names: an algorithm's
      arbitrary tie-break becoming a semantic claim in its output.
    - **Decided: leave it for now.** The user's call was "good enough for
      now, and we can add manual adjustment later." So the tie-break is
      deliberately *not* being re-derived from the data model yet, with the
      cost named: doing it later will reshuffle rows once, on a layout that
      will by then carry more expectations than it does today. Recorded as
      an accepted cost rather than an open question, because the trade was
      made explicitly and not deferred for lack of information.
    - **Parked, not built:** a manual position-override mechanism — a
      separate layout file under `kg-viz` pinning chosen nodes, leaving
      `kg-content` pure. This is the "manual adjustment later" above, and
      belongs in `docs/backlog.md`, which decision 43 hands to the
      `backlog` agent rather than to direct editing.
45. **`arc`'s missing live-Confluence access, open since decision 17 as an
    unresolved gap, is now an affirmative decision: stay local-knowledge-only
    for now, deliberately, for testing.** Surfaced when the user asked what
    `arc` actually has access to; checking the real `tools:` grant (`Read,
    Grep, Glob, Skill` — no Atlassian MCP tool) against the file's own
    description ("with live Confluence read as a fallback") showed the
    description overstated a capability that was never actually wired up.
    Offered to either grant the tool now or flag the gap in the file; the
    user chose neither — explicitly keep it ungranted, to test local-
    grounding behavior in isolation, not because the tool grant is hard to
    add.
    - **This changes the shape of the gap, not just its status.** Decisions
      17 and 20 treated the missing grant as a backlog item — something not
      yet done. It is now a deliberate scope boundary with a stated reason,
      the same distinction `docs/component-model.md`'s "purpose vs. protocol"
      pattern draws elsewhere: an open question named and reasoned about,
      not a silent gap that reads as decided by omission.
    - **`arc-lite.md` updated to match**, so the file stops promising more
      than it does: the frontmatter `description`, the Identity section, and
      working-protocol step 3 all now state plainly that live Confluence
      access is withheld right now rather than instructing a live search the
      agent has no tool to perform. The `live-unverified` citation shape and
      `05-ignore-list.md` are left in place as dormant infrastructure for
      whenever the grant is added back, not removed.
    - **Also corrected in the same pass:** the working protocol's step 1 said
      "six type directories"; `kg-content/entities/` actually holds six
      directories (`decisions/`, `guardrails/`, `patterns/`, `principles/`,
      `reference-architectures/`, `systems/`) plus `domains.json` for the
      seventh type, `domain` — checked directly against the schema and the
      real file listing rather than repeated from memory.
46. **`idea-to-presentation`'s mechanism, undesigned since decision 22
    scaffolded it, is decided by its first real use: one markdown source of
    truth, with slides and a Confluence page as generated views of it.** The
    occasion is a solution-architecture presentation to the CTO on AI-DLC.
    The user's framing: work on markdown as the source of truth for the
    solution architecture, generate the deck from it slide by slide now, and
    output the same content as a Confluence page later.
    - **The markdown is the artifact, not a staging area for a deck.** This
      is the load-bearing part. A deck built as the primary artifact cannot
      later yield a good page, because slide-shaped prose (fragments,
      build-up, reliance on a narrator) does not read as a document. Writing
      the architecture as a document first and projecting it into slides
      works in both directions; the reverse does not.
    - **Renderings are regenerable artifacts, never hand-edited** — the
      discipline `kg-viz` already applies to `payments.json` and
      `knowledge-visualizer.html` (decisions 36, 39). An edit made in
      PowerPoint or in Confluence is lost on the next generation, so the
      source is the only place to change content.
    - **Content and capability are separated across tiers.** The AI-DLC
      solution architecture is Architecture-stream business work owed to the
      org, so it belongs under `practice/` (decision 26). The idea → deck/page
      mechanism stays in `meta/idea-to-presentation/`. Keeping them apart is
      what lets the next deck reuse the mechanism without inheriting AI-DLC
      content, and it holds the tier test — what a thing *is*, not what it is
      about.
    - **Still open: the rendering step itself.** Whether slides come from a
      `.pptx` generator, a published slide artifact exported to `.pptx`, or
      something else is not settled, and the user deliberately deferred it —
      markdown only, for now — so that the narrative can stop moving before
      any rendering effort is spent. The Confluence path is less open:
      `createConfluencePage` via the Atlassian MCP connector already exists
      and needs no new infrastructure.
    - **Invocation shape also still open** (Skill vs Agent, per the README).
      This first run is being done in conversation, which is the cheapest way
      to find out what the mechanism actually needs before packaging it.
    - **The first run's content is a leadership deliverable, not a pitch**,
      established after the fact: the CTO asked the Architecture team in the
      TLT huddle of 2026-09-24 for a high-level view of the AI-DLC's layers
      and for how architecture knowledge could be set up for use across Tyro,
      due at the next huddle on 2026-09-29, co-assigned to a second
      architect. Recorded here because it shifts what the capability has to
      support: a Monday regroup with a co-author means the Confluence output
      is wanted *earlier* than "later", since a page is how two people
      co-work a draft — the deck is not the only near-term rendering. The ask
      itself lives in `practice/ai-dlc/README.md`.
    - **Both halves of that ask are now drafted in the one document, not
      two.** The second deliverable — how architecture knowledge could be set
      up for use across Tyro — is written as section 9 of
      `practice/ai-dlc/solution-architecture.md`, inside deliverable 1, as the
      single stream taken all the way down rather than as a parallel deck.
      Three reasons: the ask phrases it as *part of* the knowledge layer
      rather than a separate topic; sections 6–8 otherwise assert a target
      state without showing that any stream can reach it; and Architecture is
      the only stream with running code rather than a proposal. This is also
      the first evidence that the one-source-of-truth mechanism holds up when
      a *second* deliverable arrives mid-draft — the document absorbed it as a
      section, where two decks would have needed a shared-content decision.
    - **The drafting produced a grounding rule worth keeping.** Section 9's
      claims were written against the repo's actual inventory rather than its
      intent, which changed them: what exists is the seven-type schema, 39
      `domain` entities, one hand-authored principle, the local agent and the
      viewer — with guardrails, patterns, decisions, systems and
      reference-architectures still empty. So the deck claims "a proof of
      concept with a working local path", explicitly not a populated
      knowledge base. When a deliverable's credibility rests on something
      being real, the inventory is a thing to count rather than recall — this
      is an audience that can ask to see it.
47. **The slide rendering step, deliberately deferred by decision 46, is
    decided: a self-contained HTML deck generated by a stdlib script from the
    markdown plus SVG diagrams committed as source, with browser print-to-PDF
    as the handover format.** No PowerPoint. The occasion is the author asking
    which format gives the best presentation and modifiability, having
    proposed PPT and HTML, and stating that the deck should be *mostly visual
    — diagrams expressing the ideas rather than blocks of text*.
    - **That visual-first requirement is what forced the decision, because it
      collides with decision 46 as written.** Markdown projects cleanly into
      *text* slides, since headings and bullets genuinely are a view of prose.
      It cannot project into diagrams: no generator derives a three-layer
      stack from the paragraph describing one. So once diagrams carry the
      meaning, **the diagrams are source**, and markdown alone is no longer
      the complete source of truth. Decision 46 survives only if the source
      expands to hold them.
    - **Diagrams are therefore authored as text and committed** — SVG beside
      the markdown, under `practice/ai-dlc/diagrams/`. This is the whole
      modifiability answer: an SVG diffs in a pull request, reviews like code,
      and a label change is a one-line edit. The rejected alternative was
      drawing in a tool and embedding images, which makes a binary file a
      second source of truth that git cannot review — the exact failure
      decision 46 exists to prevent.
    - **HTML over PPTX, for two reasons beyond preference.** PowerPoint would
      need diagrams either as native shapes (impractical to generate) or as
      embedded images (unmodifiable), so the visual-first requirement is
      served worse by the more conventional format. And generating `.pptx`
      needs a third-party dependency (`python-pptx`) where every executable in
      this repo is stdlib-only; hand-building the format with `zipfile` is
      possible but fragile for a lossy result. **"Send me the deck" is HTML's
      real weakness**, and browser print-to-PDF answers it cheaply while
      preserving the visuals exactly.
    - **The pattern is `kg-viz`'s, already proven here rather than a new
      bet** (decisions 36, 39): a stdlib `build.py` concatenating text source
      into one self-contained file that opens from `file://` with no server
      and no CDN. Slide mechanics are hand-rolled (CSS scroll-snap plus
      keyboard navigation) rather than vendoring a slide framework, per
      least-infrastructure-first. The deck is offline by construction, which
      internal material requires.
    - **Only the author edits the deck; content collaboration happens in
      Confluence.** Confirmed explicitly, and it is what makes the
      never-hand-edit rule enforceable rather than aspirational — decision 46
      already noted the page is wanted early precisely because "a page is how
      two people co-work a draft". Had another architect been expected to edit
      rendered slides directly, the honest choice would have been PPTX as the
      real slide source, accepting two sources of truth; that was offered and
      declined.
    - **Still open: the text projection rule.** The document's sections are
      dense prose and cannot be dumped onto slides, but re-authoring
      slide text in a second file would recreate the two-sources problem.
      Deriving bullets mechanically from the existing `**bold**` spans was
      considered and rejected — the document bolds inline terms, not
      standalone claims, so it would produce noise. The likely answer is an
      explicit per-section slide directive inside the markdown, naming the
      diagram and the few points to surface, with the section's prose
      becoming presenter notes. To be settled by implementing it.
48. **`not_authoritative_for` is reversed from a `domain → domain`
    relationship type back to node-level text only, and `kg-viz`'s
    `domain-authority` view (shown as "Ref Domains" in the UI) is removed
    entirely, not just re-plumbed.** Raised by the user, looking at the
    domain model itself rather than its rendering: the relationship type
    "only creates confusion", and explicit non-authority should be
    "information on node only". Both `authority.owns` and
    `authority.not_authoritative_for` already existed as plain text on every
    domain (`domains.json`); the reversal is which of the two forms — that
    text, or the structured `relationships[]` array decision 32 added — is
    the source of truth. Text wins; `relationships[]` is deleted, from the
    schema (`kg-core/schemas/domain.schema.json`) and from all 39 domain
    entities.
    - **This confirms a tension decision 35 already named and did not
      resolve.** Quoting it directly: "the graph could not do the
      contradiction detection or dependency tracing that `CLAUDE.md` names
      as the reason to be a graph at all" with only this one predicate.
      Decision 35's fix was to add a second, richer view rather than touch
      this one; this decision instead removes it, once it was clear nothing
      had come to depend on the edges in the time since. Not used by Arc
      Lite's grounding, not cited in any decision or document — its only
      consumer was `kg-viz`'s own rendering of it, and that rendering was
      exactly what had been fighting the visualizer for the three prior
      sessions of layout work (charge/link tuning, then a hand-written
      collision force): a dense, single-predicate, only-38%-mutual graph
      that read as noise regardless of how the physics were tuned. Real
      data behind "confusing": 296 resolved edges across 39 domains, average
      out-degree 8.67, only 112 of them (38%) mutual pairs — genuinely
      directional, easy to misread as symmetric once drawn as an
      undirected-looking hairball.
    - **The honest cost, named rather than dropped silently: two
      machine-checkable capabilities, both speculative rather than used
      today.** Traversing "what would be affected if this domain's
      authority changed" without re-parsing prose, and the data-quality gate
      that forced every non-authority claim to resolve to a real domain id
      (42 of 338 references never did, and now never will). Judged against
      this project's own "start lean, expand on a real gap" reasoning
      (`meta/procedural-memory`) rather than kept on the chance either
      becomes useful.
    - **Removing the view has a second-order consequence beyond the
      relationship type: `kg-viz` drops back to one view.** `domain-authority`
      was also the only place any file-per-entity node
      (principle/pattern/guardrail/reference-architecture/system/decision)
      ever appeared in the visualizer — today that is exactly one entity (a
      single `principle`), so the practical loss is small, but the
      structural gap is real if that count grows before a replacement view
      exists. The frontmatter-parsing code that fed those nodes to the view
      (`generate.py`) is removed along with it, on the same "no consumer,
      no code" basis; the pattern is still there to reach for, not gone.
    - **Deliberately not bundled into this decision: the 2D/3D toggle.**
      3D's stated justification (`kg-viz/README.md`) was reducing occlusion
      on the dense force-directed authority graph specifically; with that
      view gone, 3D's practical value on the one remaining (planar-by
      -construction) view is limited. Flagged, not removed — that is a
      separate call the user has not made, and folding it into this change
      would have been scope creep past what was actually decided.
    - **What replaced the edge, completing the user's own proposed
      alternative:** the flow view's domain nodes now carry
      `not_authoritative_for` text too (`generate.py`), surfaced in that
      node's own detail panel (`controls-panel.js`) — so the information
      that used to require switching to the authority view is still
      reachable, just as text on the node rather than a jump to another
      node.

## Constraints identified

- **Nothing browser-facing can be verified from inside this session, and the
  reason is one restriction with three faces.** The sandbox denies socket
  operations broadly: a local server cannot `bind()`, `curl
  http://127.0.0.1:<port>` fails with "Immediate connect fail ... Operation
  not permitted", and headless Chrome aborts at startup because it creates a
  Unix-domain socket for its process singleton. Separately, **browser
  automation via the Claude in Chrome extension is prohibited by
  organisational policy** (stated by the user 2026-09-22), so that route is
  closed on policy grounds rather than technical ones. `jsdom` and
  `puppeteer` are not installed and there is no package manager step in this
  repo to add them.

  The practical consequence, which shaped decision 36: the user's eyes are
  the only observer of anything rendered. Two things follow. Build
  self-diagnosis into any page — render errors into the DOM rather than only
  the console, and print a visible build revision plus a data timestamp, so
  "am I looking at the current version?" is answerable without devtools. And
  prefer removing machinery over adding it, since every moving part is one
  more thing that can fail unobserved. Asking the user for a screenshot or a
  page-source paste is a legitimate and often decisive step, not a last
  resort: a source dump is what settled "stale cache or failed fix?" after
  reasoning from the filesystem could not.

- **The sandbox blocks writes anywhere under `.git/`, not just `.git/config`
  (decision 33) — `git commit` itself fails, `Operation not permitted` on
  creating `.git/index.lock`, even with the sandbox override requested.**
  Found 2026-09-18 trying to commit this session's own decision-log entry.
  The override is disabled by org policy at the harness level, so there is
  no path around this from inside a sandboxed session — routine commits in
  this repo need the user to run them (e.g. via the `!` prefix), which
  changes the "git management is delegated" arrangement from "commit
  proactively" to "stage and hand the exact command to the user."
  **Wrong — corrected same day, 2026-09-18, by the next session.** The
  attempt above set `dangerouslyDisableSandbox: true` explicitly and never
  tried a plain `git commit` without it; the `Operation not permitted` came
  from that flag (itself disabled by org policy, so it's a no-op that adds
  nothing) rather than from commits being blocked outright. A plain `git
  add` + `git commit`, no override, succeeded immediately in the very next
  session on the very same three files. "Git management is delegated"
  reverts to "commit proactively" — see `meta/perception-failures/log.md`
  entry 7 for the full trace. `git push --dry-run` was also verified in
  that same later session: correct ref-update line, exit 0, auth and
  connectivity to the remote are fine from the sandbox. (An unrelated
  `failed to store: 100001` line above it is a credential-cache warning,
  not a push failure — see `universal.md`.) Actually pushing still needs
  the user's go-ahead per se, same as any push, since it's a shared-state
  action — not because the mechanism is blocked.
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
13. ~~**Rename the repo to `arch-ai-uplift`**~~ (decision 29, executed by
    decision 33) — **complete, verified 2026-09-18.** All three
    sandbox-blocked steps the user had to run by hand are confirmed done:
    `origin` now points at `.../arch-ai-uplift.git`, the per-project memory
    directory exists at the new path, and the working directory is
    `/Users/bliu/code/claude workspace/arch-ai-uplift`. The README's "On the
    name" note — which existed only to keep the mismatch visible — was
    removed in the same pass. One harmless residue: the old
    `arch-knowledge-graph` directory still exists containing nothing but an
    empty `.claude/`, and the old memory directory under `~/.claude/projects/`
    also remains; both are local machine state, neither affects the repo, and
    deleting them is the user's call.
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
14. **Bring "Activity & Evidence Home" (2212429894) and this repo's
    `docs/program-roadmap.md` into line with decision 34's FY27 Q2/Q3/Q4
    re-baseline and new IN-564 epic references** — deliberately deferred,
    not forgotten: the user chose to update only the "Programme Stream"
    page this round. Until this happens the two Confluence pages disagree
    with each other on Phase 2/3 dates, and `program-roadmap.md`'s own
    snapshot (still Apr 2027 / Aug 2027) is stale against both the approved
    slide-26 quarters and the page it's supposed to mirror.
