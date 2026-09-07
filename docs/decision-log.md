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
3. **Repo is structured as loosely coupled components, not one application.**
   Six components under `components/`, each with a README stating its purpose,
   boundary, dependencies, and extraction notes. Rationale: some of these will
   outgrow this repo and be promoted into their own project or handed to another
   team — most likely `query-service`, which is the only one needing its own
   deployment lifecycle — so extraction should be a move operation rather than an
   untangling exercise. Dependencies point inward to `kg-core`; integration
   components never import each other. This is the structural expression of
   decision 2. Full rules in `docs/component-model.md`.
4. **A `meta/` tier for components that observe the project.** Separate from
   `components/`, holding work that accumulates knowledge about *how we work*
   rather than about Tyro's architecture: `architecture-learning` (an
   evidence-based record of demonstrated architectural style, so later work can
   apply it deliberately instead of guessing) and `token-tracking` (granular token
   consumption, so task cost can be reasoned about from data). Hard rule:
   `components/` must never depend on `meta/`, since that would tie an otherwise
   extractable component to this project's history. Both meta components are built
   around evidence and provenance — cited observations, derived metrics — because
   the failure mode for both is plausible-sounding records nobody can verify.
   - `architecture-learning`'s goal is a **"digital architect"** that grows more
     aligned with use, consumer-agnostic so the consumer can be chosen later
     (session memory, `CLAUDE.md`, or the architecture agent this project is
     building). Export is one-way — curate here, copy outward — so there is one
     reviewable source. It records *how* decisions get made and which
     counter-arguments were accepted, not only conclusions, because a profile
     optimised for agreement cannot challenge its subject, and being challenged is
     an explicit requirement.
   - `procedural-memory` holds operational lessons — mistakes made here and the
     rules that prevent them — and is separate from `architecture-learning` because
     the two differ in subject and urgency: the former records the agent's own
     errors and must take effect immediately, the latter models the user's reasoning
     and has no consumer yet. The load-bearing part is the pointer from `CLAUDE.md`,
     since a repo file changes nothing by existing; rules whose violation is
     expensive are stated inline in `CLAUDE.md` rather than only in the component.
     `architecture-learning` is explicitly deprioritised behind the
     challenging-thinking-partner behaviour.
   - Refined `architecture-learning` again: every entry is a tracked hypothesis or
     preference, never a settled conclusion. Rationale stated directly — "it's
     unclear whether we can see [best practice] clearly beforehand", so decisions
     should be tracked individually over time and marked as supported or
     contradicted as new evidence arrives, building intuition from a track record
     rather than asserting one. `form` (`hypothesis`/`preference`) is tracked
     separately from `kind` (subject matter), and `status`
     (`active`/`reinforced`/`contested`/`revised`/`abandoned`) replaces a
     hand-set confidence level. The index generator enforces the one invariant that
     matters: contradicting evidence can never sit under an unacknowledged status.
   - `token-tracking` reports cost by day, rolling five-hour window (matching how
     usage limits are enforced), git branch, effort level, and model. Plan
     allowance is **not** available locally — verified against the transcripts — so
     the budget figure has to be supplied by the user. Attribution to features is
     solved by the `gitBranch` field already present in the data.
   - Added `docs/backlog.md` for feature ideas that are deferred, not decided
     against — a dashboard for component/feature status was the first entry, parked
     because at six components and no code the existing docs already answer "where
     are we." Made explicit in `CLAUDE.md` that project state (decisions, backlog
     items, component contracts) must be written into the repo, never left only in
     Claude's cross-session memory, since the repo is what a future session or a
     teammate can actually read.
   - Split `architecture-learning` capture into two mechanisms with deliberately
     different costs: live, near-zero-cost append to `observations.md` during
     conversation (the default — a lapse in following this during one session is
     what prompted the split), and a separate, occasional audit/backfill pass over
     stored session transcripts (`~/.claude/projects/<slug>/*.jsonl`, the same
     source `token-tracking` already reads, via the new
     `architecture-learning/extract_transcript.py`) for whatever live capture
     missed. Transcript retention is unverified beyond "present today back to
     project start" — no rotation/cleanup policy is known — so backfill is
     best-effort recovery, not a substitute for live capture.
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

10. **Added a local-only HTML relay UI for Arc Lite (`components/local-agent/ui/`),
    for the user's own single-person use, not a multi-user or production
    surface.** A stdlib-only Python server relays `POST /ask` to the same
    headless `claude -p --agent arc-lite` invocation a Claude Code session
    already makes; a plain HTML/JS chatbox is the frontend. No new
    dependency to install, no deployment, binds to localhost only.
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
    - **Where 1.3 goes is undecided.** Q3's "human in the loop" headline is
      the natural home for the first build-learn-adjust loop, but that was not
      settled in this conversation and should not be assumed.

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

## Constraints identified

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

- **Whether to adopt an MVP-first reframing of decision 5 (Confluence flow) and the schema itself**
  — see [`docs/mvp-proposal.md`](mvp-proposal.md), recovered from a lapsed
  session where it was assessed but never decided. Blocks on a real question
  set and known-canonical/superseded Confluence pages, which only a human
  architect can supply. Now confirmed by the program roadmap: milestone 2.1
  ("active Knowledge Graph") is Phase 2, not the current phase, and the AKB's
  50+-question Golden Evaluation Set is the same ask as the MVP proposal's
  question set, at program scale.
- **Claude Cowork's role is undefined here.** The program roadmap's milestone
  1.1 asks explicitly for defining how Rovo, Claude Code, *and* Claude Cowork
  collaborate; this repo's design (`claude-code-access`) only accounts for
  Rovo and Claude Code.
- **Whether milestone 1.1's "in progress" status matches this repo's actual
  state.** `kg-content` has zero entities. Either curation progress is
  happening outside this repo (workflow/tagging/tooling decisions could count
  before any entity exists) or the tracker is ahead of reality — worth
  confirming which rather than assuming either.
- **The Architecture stream plan's capability names diverge from the Jira
  initiatives they cite, in two cases substantively.** IN-562 is
  "Foundation - Environment & Tooling" in Jira but "PoC of Architecture agent"
  on the slide; IN-563 is "Business process definition for Architecture" but
  "Architecture capability maturity assessment"; IN-564 is "AI-Assisted
  Architecture Design validation & Alignment MVP" but "AI-Validated Solution
  Architecture – Maturity 1". Reframing for a leadership audience is what the
  pack's own guidance asks for, so wording alone is fine — but the M1/M2/M3
  maturity ladder introduced by IN-564's rename has become the stream's
  operating model and drives the whole tagging sequence. Unresolved: whether
  the ladder is the real framing (in which case Jira, slide 17 and the
  Confluence roadmap should follow) or slide-local shorthand.
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
