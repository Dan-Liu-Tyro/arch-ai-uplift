# local-agent

Started as a fully local, MVP-scale mirror of Arc's own structure, built
to test whether a structured local grounding layer actually changes
answer quality. Decision 11 in
[`docs/decision-log.md`](../../docs/decision-log.md) reframed its
trajectory: no longer strictly a disposable A/B-test artifact, but a
candidate to grow into a real local Arc with its own skill set, which is
why it's since been given live Confluence **read** access (see Boundary
below) rather than staying local-files-only forever.

**Not the real Arc. Not ArchWorker.** Everything here is a locally-invoked
persona; nothing is written to Confluence, and nothing here changes the
Arc a solution designer opens today. Decision 6 in
[`docs/decision-log.md`](../../docs/decision-log.md) is why *writing* to
Confluence stays out of scope even as read access opens up — Arc Lite must
not duplicate Arc/Rovo's own retrieval role or drift into looking like it
speaks for live Confluence.

## Why this exists

Arc's real implementation has a five-part "Constitution" — Soul, Working
Protocol, Canonical Sources, Skills, Procedure Memory — loaded dynamically
from Confluence pages, built and governed by a separate agent, ArchWorker
(read from Confluence 2026-08-19, see
[`docs/decision-log.md`](../../docs/decision-log.md) decision 6). This
component originally mirrored that same five-file shape locally so the
hypothesis — does structured grounding change answer quality — could be
tested cheaply with zero production access. **Decision 21 collapsed that
mirroring**: Arc's five-page split exists because Rovo loads pages
dynamically and a rule can change without redeploying the agent, a
constraint a Claude Code subagent file doesn't have. Identity, working
protocol, and answer-format now live directly in
[`.claude/agents/arc.md`](../../.claude/agents/arc.md) itself,
and local grounding is `components/kg-content/` entities directly — no
separate `constitution/02-canonical-sources.md` shadow schema. Only the two
things that are genuinely data that grows by entry, not behaviour, remain
as their own files under `constitution/`: the skill index
(`03-skills.md`) and the procedure-memory mirror (`04-procedure-memory.md`,
kept separate from `meta/procedural-memory/` per
`docs/component-model.md`'s hard rule that nothing under `components/` may
depend on `meta/`). `constitution/05-ignore-list.md` (checked before any
live citation) is the third file, added by decision 11 for a different
reason — see Boundary below.

## Boundary

**In scope**
- A minimal local grounding format: a handful of tagged references (id,
  title, status, source link, note) — deliberately not `kg-core`'s full
  schema.
- A local persona ("Arc Lite"), defined directly in
  `.claude/agents/arc.md`, grounded first on `components/kg-content/`
  entities, and allowed to search and read live Confluence when local
  grounding doesn't cover a question.
- An ignore list (`constitution/05-ignore-list.md`) of specific pages to
  exclude from any live search regardless of topical relevance.
- A machine-checkable answer-format contract (a single fenced ```json
  block per answer — `{"citations": [...], "refusal": bool}`, per decision
  21): every answer must end with one, which `ui/server.py` parses and
  validates rather than only trusting the model to have followed
  `arc.md`'s working protocol.
- `gap-log.md`: every refusal and every citation below `canonical` status
  is logged there automatically, as the knowledge-lifecycle feedback loop
  — a knowledge owner reviews it and curates new `kg-content` entities
  from real usage, closing the loop decision 12 assumed but hadn't built.
  A `skill` citation (decision 21) is not logged here — it isn't a
  knowledge gap the way a refusal or a live citation is.
- Skills as native Claude Code Skills (`.claude/skills/`), listed in
  `constitution/03-skills.md`, not a Confluence-page-based skill index
  like the real Arc's — see decision 18 in `docs/decision-log.md`.
- Comparing answers with and without local+live grounding present, on
  real questions.

**Out of scope**
- Anything that *writes* to Confluence, or to Arc's real Constitution
  pages — this stays true even with read access open; see decision 6.
- `kg-core`'s full schema — this uses its own minimal format on purpose,
  until there's evidence the thin version is insufficient.
- Being mistaken for the real Arc or ArchWorker. Every file here says so.

## UI

`ui/server.py` is a local-only HTML relay: a stdlib-only Python HTTP server
(no dependencies to install) that serves `ui/index.html` — a plain chatbox,
no framework — and relays `POST /ask` to a headless `claude -p --agent
arc --output-format json` call, the same subagent invocation a Claude
Code session already makes, just automated instead of typed.
`ui/arc.sh {start|stop|restart|status}` runs it as a background
process (pid + log under `ui/.run/`, gitignored) so it doesn't tie up a
terminal; open `http://127.0.0.1:8765` once it's started. Binds to
localhost only; nothing is exposed beyond the machine it runs on.

The one seam is `ask_arc()` in `server.py` — swapping the local
subprocess call for a real deployed API call later is a change to that one
function, not a redesign, mirroring decision 2's "transport change, not a
redesign" principle. Whether this UI is ever worth deploying beyond that is
explicitly deferred — see `docs/backlog.md` — this is single-user-local
only, built for one person's own use, not multi-user or production traffic.

Not yet live-verified end to end: built and syntax-checked inside a
sandboxed Claude Code session, but that same sandbox blocks both binding a
localhost port and nested outbound calls to `api.anthropic.com` — properties
of the sandbox the code was written in, not evidence against the approach.
First real run (start the server, load the page, ask a question) needs to
happen outside that sandbox, on the user's own machine.

## Depends on

Nothing in this repo, deliberately — not even `kg-core`. The UI adds a
runtime dependency on the `claude` CLI being on `PATH` and authenticated;
Arc Lite's live-Confluence-read step (decision 11) depends on the
Atlassian MCP connector being enabled for the `arc` subagent's own
tool grant, separately from whether it's enabled for a Claude Code
session generally. Still nothing on another component in this repo. This is a
temporary decoupling: `kg-core`'s schema targets the full graph (program
milestone 2.1, not now — see
[`docs/program-roadmap.md`](../../docs/program-roadmap.md)), and forcing
this MVP through that machinery would be exactly the premature
infrastructure the project's own `least-infrastructure-first` pattern
argues against. If the MVP shows grounding is valuable, migrating this
format into `kg-core`'s schema is the expected next step — this is not
meant to be a permanent second schema.

## Depended on by

Nothing yet.

## How to use it

Invoke the `arc` subagent (`.claude/agents/arc.md`) in a Claude
Code session in this repo, or ask a session to act as Arc Lite directly.
As of decision 21, identity, working protocol, and answer-format live
directly in `arc.md` — there is no "read N constitution files first"
indirection for content that small; only `components/kg-content/`
(grounding, grows by entry) and the three remaining `constitution/`
registries (`03-skills.md`, `04-procedure-memory.md`,
`05-ignore-list.md`) are read on demand, per the protocol in `arc.md`
itself. The subagent's *tool grant* (which MCP tools it's allowed to
call) also lives in `arc.md`, and is left to the user's own hand
deliberately — not because Claude is blocked from writing the file (it
isn't, for an existing tracked file's content — see
`meta/procedural-memory/universal.md`'s sandbox-write-protection entry
and its correction) but because a subagent expanding its own tool grant
is exactly the failure mode worth a human decision regardless of what's
technically possible. Decision 20 made one explicit, scoped exception to
that (adding the `Skill` tool grant); re-ask before any other tool-grant
change.

The subagent file was created ahead of this component's original
guidance to wait until the Constitution content had been used and
adjusted "a few times" first — a deliberate, explicit choice made when
asked, not a default. That means its content is less battle-tested than
the original sequencing intended; treat early answers with
correspondingly more scrutiny until real questions have exercised it a
few times.

## Status

MVP, trajectory under active reconsideration per decision 11 — no longer
committed to staying a disposable comparison tool. Grounds on
`components/kg-content/`, which holds one entity so far (see that
component's own Status). `constitution/05-ignore-list.md` is seeded with
nothing yet, and `gap-log.md` starts empty by design — it only fills from
real usage through `ui/server.py`, which hasn't happened yet (see
`docs/decision-log.md`'s Next steps).

**Correction, 2026-09-11:** this Status section and the two above it
(`Why this exists`, `How to use it`) had drifted back to describing the
pre-decision-21 seven-file constitution mechanism — despite decision 21's
own log entry recording that this README was updated in the same change.
The `constitution/` files it referenced (`00-soul.md`,
`01-working-protocol.md`, `02-canonical-sources.md`,
`06-answer-format.md`) were genuinely deleted (confirmed on disk), so the
drift was in this document's prose only, not a sign the restructuring
itself had been reverted. Caught while building a "related work"/status
convention across all component READMEs, prompted by the user asking for
`docs/decision-log.md`'s stated status to be trustworthy without
reconstructing context from a transcript — precisely the failure mode
this correction fixes an instance of.

## Cost

Track this component's cost the same way as everything else —
`python3 meta/token-tracking/summarize.py --by branch` already
attributes spend to whatever branch this work happens on. No new
tooling needed. Cost was expected to stay especially low on the premise
that nothing here made an external call — decision 11 broke that premise,
since a live Confluence search or page fetch is exactly that; watch this
component's cost line more closely than before.

## Extraction notes

Originally written off as unlikely to be promoted as-is, throwaway-shaped
by design. Decision 11 reopened that: if Arc Lite grows into a real local
agent rather than staying a one-shot comparison tool, this component
itself — not just its grounding format — becomes a plausible promotion
candidate, not only a source to migrate parts out of into `kg-core` and
`claude-code-access`. Which of those two futures actually happens is still
open; don't assume either.
