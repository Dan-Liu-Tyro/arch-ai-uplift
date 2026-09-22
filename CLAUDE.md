# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A repo that curates Tyro's architecture
knowledge — principles, guardrails, patterns, reference architectures, decisions —
as the grounding source for the Architecture stream's AI agent to uplift the internal 
business process as well as offer Architecture service to wider steams such as architecture sparring preparation, architecture/design review, etc.

**Status: design phase.** A schema draft and component scaffolding exist. No
product code, build system, or test suite is committed — the only code that runs
is `components/local-agent/ui/server.py`, `components/kg-viz/generate.py`,
plus the stdlib scripts under `meta/`. `kg-viz` deliberately has **no**
server any more (decision 36) -- `index.html` is opened directly from
disk; do not reintroduce one.
Do not invent or assume build/lint/test commands; there are none. If asked to
add tooling, choose per the org language standards (Kotlin preferred for
complex applications).

## Layout

```
docs/decision-log.md      running design record — the primary artifact
docs/backlog.md           parked feature ideas, not yet decided or scheduled
docs/component-model.md   component boundaries, dependency + promotion rules
components/kg-core/       schema contract (SCHEMA.md), validation, traversal
components/kg-content/    the curated graph — entity files, data only
components/kg-viz/        read-only viewer, two purpose-built views (2D
                                  flow default, 3D a toggle); no server --
                                  open index.html from disk, then open any
                                  compatible graph file (default graph.json,
                                  a regenerable artifact, never hand-edited)
components/confluence-ingest/    inbound: Confluence pages → draft entities
components/confluence-publish/   outbound: entities → generated pages
components/query-service/        v2, deferred — do not build yet
components/claude-code-access/   local query glue for Claude Code
components/local-agent/          MVP: local mirror of Arc, no production access
meta/procedural-memory/          operational lessons — read lessons.md early
meta/architecture-learning/      evidence-based record of demonstrated style
meta/perception-failures/        catalogue of Claude's own incorrect-belief incidents
meta/token-tracking/             token usage data + summarize.py
meta/idea-to-presentation/       idea -> deck/page capability, general-purpose
meta/CDCD/                       evidence log: conversation-driven co-design
practice/                        Architecture-stream business work, not software
practice/capability-maturity/    IN-563: initiative -> process-map mapping
.claude/agents/arc-lite.md       local-agent's persona; lives here (not nested
                                  under components/) because this is where
                                  Claude Code's harness scans for it
.claude/skills/arc-lite-identity/  local-agent's one native Claude Code Skill,
                                  same harness-discovery reason as above
```

## Working with the user

**Challenge ideas rather than agreeing** — especially at planning stage. The
strongest honest objection is the useful contribution; an objection grounded in the
user's own stated design lands harder than an appeal to external policy. Once a
decision is made and reaffirmed, implement it well rather than relitigating it.

**Read `meta/procedural-memory/INDEX.md` before substantial work.** It's the cheap,
rule-only summary of every entry in `lessons.md` (mistakes tied to something
specific about this project) and `universal.md` (mistakes whose rule doesn't depend
on this project at all, and so is worth checking before starting on any project) —
open either full file only when a current situation matches a rule closely enough
that the one-liner isn't enough, or before adding a new entry, to check it isn't a
restatement of one that exists. This split exists specifically so the mandatory
read doesn't grow unbounded as entries accumulate — see that component's own
Growth policy. Four of `universal.md`'s rules are short enough to state here
anyway, because violating them is expensive: never put a credential in a command
line; test an environment hypothesis before proposing a change to the user's
config; after a denied tool call, ask rather than retrying a variant; run any code
that derives paths or does index arithmetic in the same turn you write it.

`meta/` holds whatever doesn't ship as part of the architecture agent product
(agent, skills, knowledge graph): either it observes the process of building the
project, or (since decision 22 in `docs/decision-log.md`) it's a general-purpose
capability useful along the journey without being part of the product's own
delivery. **`components/` must never depend on `meta/`** — that would tie an
extractable component to something outside the KG pipeline's own trajectory. The
repo's only executables outside `components/` live here —
`token-tracking/summarize.py`, `token-tracking/budget.py`,
`architecture-learning/reindex.py`, and
`architecture-learning/extract_transcript.py`, all stdlib only.

`practice/` (decision 26) is the third tier: the Architecture practice's own
business work — Jira initiatives, practice roadmaps, capability and maturity
assessments. The three tiers are one test on what a thing *is*, not what it's
about, since all three are about architecture: does it ship with the product
(`components/`), is it useful while building the product without shipping with it
(`meta/`), or is it work owed to the org that happens not to be software
(`practice/`). **Nothing under `components/` or `meta/` may depend on anything
under `practice/`** — stronger than the `meta/` rule, because `practice/` content
is partly owned outside this repo: a roadmap page another architect owns can be
superseded in a meeting this repo never sees, so code depending on it would break
for reasons invisible from the codebase. Every artefact there declares its
provenance in its header — `snapshot`, `authored here`, or `derived` — because one
that doesn't gets read as authoritative anyway.

`meta/architecture-learning/` is two layers: append a line to `observations.md`
during a conversation (no read needed), and promote to `principles/<slug>.md` only
when a pattern repeats. Read `INDEX.md` — not the principle files — to decide
whether something is new; it is generated, so run `reindex.py` after any frontmatter
change. Every entry needs cited evidence and a `stated`/`inferred` marker; an
uncitable entry is a projection and reads as authoritative anyway. Prefer recording
*how* a decision was reached, and which counter-arguments were accepted, over
recording conclusions — a profile that only reproduces conclusions cannot push back,
and pushback is wanted.

Entries are tracked hypotheses or preferences, not settled conclusions — see
`principles/evidence-over-assumed-best-practice.md`. Tag each piece of evidence
`**Supports.**` or `**Contradicts.**`, and set `status`
(`active`/`reinforced`/`contested`/`revised`/`abandoned`) to match what the evidence
actually shows. `reindex.py` refuses to build the index if a principle has
`contradict > 0` without an acknowledging status — never leave a contradicted
principle at `active`/`reinforced`.

`meta/token-tracking/summarize.py --by branch` gives per-feature cost. Compare
tasks on `output` and `cache_wr`, never on cache reads — those scale with
conversation length, not with work done.

Each component's `README.md` states its purpose, boundary, dependencies, and
extraction notes, and is treated as its contract — if a change makes a README
wrong, update it in the same change. When part of that contract isn't decided yet
(a mechanism, a protocol), say so explicitly rather than leaving it implicit — an
unstated gap reads as decided by omission. `components/query-service/README.md`'s
purpose-vs-protocol split is the pattern: settled purpose stated plainly, the open
question named and pointed at its `docs/decision-log.md` entry, not silently
absent.

## Working conventions

- **`docs/decision-log.md` is the primary artifact and a living doc.** It records
  problem, goal, decisions, constraints, open questions, and next steps. When a
  design decision is made, changed, or reversed in conversation, append/update it
  there — decisions are explicitly marked tentative and open to revision, so
  editing existing entries is expected, not just appending.
- **This repo is run under a stewardship model, not a babysitting one.** Once
  a design conversation converges — a decision firms up, a real gap or
  insight surfaces — record it into the repo in that same turn, without
  waiting to be asked. Beyond that single act, take ongoing responsibility
  for keeping the problem/solution space well documented and organized, so
  that reflecting on the project's state or deciding what to build next never
  requires reconstructing context from a chat transcript. This does not
  change the instruction above to challenge ideas during the open-ended part
  of a conversation — only what happens once it converges.
- **Project state — and this stewardship rule itself — lives in the repo,
  not in Claude's memory.** Claude's own cross-session memory (under
  `~/.claude/`) is local application state: it is not git-versioned, does not
  survive a machine reinstall, and is invisible to a teammate who clones this
  repo. Reserve it for lessons about how Claude should work that are
  genuinely personal to this user and portable across unrelated projects
  (general tone or behavioural preferences) — never for facts about this
  project's design or status, and never as the sole copy of a rule this repo
  depends on, even a rule about how Claude should operate specifically here.
  Any change to the project or decision made in conversation must be written
  into the repo in the same turn: `docs/decision-log.md` for decisions,
  constraints, and open questions; `docs/backlog.md` for deferred feature
  ideas; a component's `README.md` when its purpose, boundary, or
  dependencies change. If it isn't in one of those files, it didn't happen,
  as far as the next session (or a teammate) is concerned.
- **Three background habits, easy to let slide in a long session.** Before
  treating a substantial turn as finished, check whether anything in it
  qualifies for `meta/architecture-learning/observations.md` (append, no
  ceremony — see that component's README), `meta/procedural-memory/lessons.md`
  (a mistake worth a rule — see that component's README), or
  `meta/perception-failures/log.md` (Claude stated something as settled fact
  that turned out to be an overgeneralization or a stale carried-forward
  belief — see that component's README for the exact shape). All three are
  described in full elsewhere in this file; this bullet exists because the
  habit has already been observed to lapse across a whole session without a
  reminder. Treat a session with no entries in the first two files as
  something to ask about, not as quiet evidence that nothing qualified.
  `perception-failures/log.md` is different: most sessions genuinely won't
  produce an entry, so its absence isn't itself a signal — the risk with
  that one is failing to notice the rare turn where it does apply, not
  under-filling it on a normal turn.
- **Roadmap and milestone scope changes need explicit approval, not just
  good reasoning.** Both the program's phase/milestone roadmap
  (`docs/program-roadmap.md`) and the local three-step integration plan
  (decision 6 in `docs/decision-log.md`) are explicitly flexible if discovery
  changes priorities — but that's a reason to propose a change and ask, never
  to edit the committed phases/milestones unilaterally on the strength of a
  good argument. Flag it, wait for a clear yes, then write it down.
- **No personal names in anything committed — use the role.** Refer to
  people by role ("the Head of Architecture", "the initiative's reporter")
  in every tracked file *and in commit messages*, which are equally
  permanent. Names are fine in conversation; the boundary is the artefact.
  Two reasons: a git history is permanent and broadly readable, and Tyro's
  review standards call out preventing PII exposure — so a name committed
  once is effectively un-removable. Role titles also age better, staying
  correct when people change jobs where a name silently misattributes
  authority. Where a name sits inside a verbatim quote, bracket the
  substitution — `[the Head of Architecture]` — rather than rewriting the
  quote silently. For provenance, cite the source page or ticket plus its
  role owner; that preserves everything provenance is for.
- **A supplied link is one input, not the source set.** Before building on
  a page someone hands over, spend one search for an existing artefact
  covering the same ground — in the space where the work's other material
  lives, by ticket key, and by obvious titles. Decision 28 exists because
  this was skipped: a 32-row activity model was derived from the wrong page
  while the real working document, with the same layer already in it, sat
  one search away. Never write "the source does not contain X" without
  having searched for X; "I did not find X in the page supplied" is what is
  actually known.
- Keep prose wrapped to ~80 columns to match the existing files.
- `.idea/` is gitignored (JetBrains); it is present locally but not tracked.

## Architecture of the intended system

Four decisions shape everything and should be treated as the current baseline
(all recorded in `docs/decision-log.md`, all revisable). Cite them by name rather
than by number — the log is appended to and renumbering silently breaks
cross-references:

1. **File-based storage, not a graph DB.** Markdown + YAML frontmatter, git
   versioned. PR review is the quality gate. Revisit a graph DB only if traversal
   needs outgrow flat-file lookup.
2. **KG core is decoupled from the integration layer.** Core = schema + storage +
   query logic. Integration layer = Confluence ingest inbound, Confluence publish
   + Rovo grounding outbound, and local access for Claude Code. Design so that
   swapping local file reads for a deployed query service is a transport change,
   not a redesign. `docs/component-model.md` is how the filesystem enforces this:
   dependencies point inward to `kg-core`, and integration components must never
   import each other — that rule is the one most likely to be broken and the most
   expensive to unpick.
3. **Confluence is an output, not the source of truth.** Curate in git → generate
   one structured page per entity → publish to a dedicated clean Confluence space
   → Rovo indexes that space. Architects edit git, never raw Confluence.
4. **Components over one application.** Eight components under `components/`,
   sized so that pieces which outgrow this repo can be promoted out as a move
   rather than an untangling. Plus a `meta/` tier for whatever doesn't ship as
   part of the product — self-observation, or (decision 22) a general-purpose
   capability useful along the journey but not part of the delivery — and a
   `practice/` tier (decision 26) for the Architecture stream's own business
   deliverables, which aren't software at all. See the Layout section above.

The graph shape is the point: typed relationships (`pattern REQUIRES guardrail`,
`principle CONFLICTS_WITH pattern`, `decision SUPERSEDES decision`,
`system USES pattern`) are what enable contradiction detection and dependency
tracing that flat RAG can't do. Preserve that capability in any schema proposal.

## Key constraint: Rovo is cloud, the KG is local

Rovo cannot reach this repo. Anything Rovo queries must be network-reachable,
which means going through the org deployment path (TAP/CTAP via Schooner/
Jetstream, GitOps/ArgoCD, promoted development → staging → production via
Drydock). This is deliberately deferred to v2 and does not block work on the KG
core.

## Atlassian MCP

`docs/decision-log.md` lists the connector's capability as an open question —
whether it can invoke the Rovo agent or only do Confluence/Jira CRUD. Verified
against the live tool list: **CRUD and search only, no Rovo agent invocation.**
The connector exposes Confluence page read/create/update/search (CQL), Jira issue
read/write/transition (JQL), Compass components, and Teamwork Graph
context/search. There is no tool that runs or directs the Rovo agent itself.

Two consequences for design work:

- The git → Confluence publish path (Confluence-as-output) can be driven from
  Claude Code via `createConfluencePage` / `updateConfluencePage`; it does not
  need a separate deployed integration to get started.
- Grounding Rovo still has to go through Rovo indexing the published Confluence
  space. There is no MCP shortcut, which reinforces the v2 deferral above.

Re-check the tool list rather than trusting this section if connector behaviour
seems to differ.
