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

Arc's real implementation already has a defined five-part "Constitution" —
Soul, Working Protocol, Canonical Sources, Skills, Procedure Memory —
loaded dynamically from Confluence pages, built and governed by a separate
agent, ArchWorker (read from Confluence 2026-08-19, see
[`docs/decision-log.md`](../../docs/decision-log.md) decision 6). This
component mirrors that same shape locally, grounded first on this repo's
own tagged references, so the hypothesis — does structured grounding
change answer quality — could be tested cheaply and with zero production
access at the outset. Decision 11 opened live Confluence **read** access
on top of that local grounding once Arc Lite's trajectory changed from a
disposable comparison tool to a candidate for a real local agent; see
`constitution/01-working-protocol.md` for exactly how the two combine
(local first, live search only when local doesn't cover the question,
`constitution/05-ignore-list.md` checked before any live citation).

## Boundary

**In scope**
- A minimal local grounding format: a handful of tagged references (id,
  title, status, source link, note) — deliberately not `kg-core`'s full
  schema.
- A local persona ("Arc Lite") mirroring Arc's Constitution shape,
  grounded first on the files in `constitution/`, and allowed to search
  and read live Confluence when local grounding doesn't cover a question.
- An ignore list (`constitution/05-ignore-list.md`) of specific pages to
  exclude from any live search regardless of topical relevance.
- A machine-checkable answer-format contract
  (`constitution/06-answer-format.md`): every answer must end with a
  parseable citation/refusal marker, which `ui/server.py` validates
  against the constitution before the consumer sees the answer, rather
  than only trusting the model to have followed
  `01-working-protocol.md`'s instructions.
- `gap-log.md`: every refusal and every below-`canonical` citation is
  logged there automatically, as the knowledge-lifecycle feedback loop —
  a knowledge owner reviews it and updates `02-canonical-sources.md`
  from real usage, closing the loop decision 12 assumed but hadn't
  built.
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
arc-lite --output-format json` call, the same subagent invocation a Claude
Code session already makes, just automated instead of typed.
`ui/arc-lite.sh {start|stop|restart|status}` runs it as a background
process (pid + log under `ui/.run/`, gitignored) so it doesn't tie up a
terminal; open `http://127.0.0.1:8765` once it's started. Binds to
localhost only; nothing is exposed beyond the machine it runs on.

The one seam is `ask_arc_lite()` in `server.py` — swapping the local
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
Atlassian MCP connector being enabled for the `arc-lite` subagent's own
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

Invoke the `arc-lite` subagent (`.claude/agents/arc-lite.md`) in a Claude
Code session in this repo, or ask a session to act as Arc Lite directly.
Either way the mechanism is the same: read `constitution/00-soul.md`
through `06-answer-format.md` fresh each time and follow
`01-working-protocol.md` and `06-answer-format.md` exactly — the subagent
file only points at those seven files, it does not duplicate their
content, so editing the constitution is enough to change Arc Lite's
behavior without touching the subagent definition, with one exception:
the subagent's *tool grant* (which MCP tools it's allowed to call) lives
in `arc-lite.md` itself, not the constitution, and `.claude/agents/` is
sandbox-write-protected from Claude Code — see
`meta/procedural-memory/universal.md`. Decision 11's live-Confluence-read
access needed a human hand to add the Atlassian MCP tools to that file's
`tools:` line and extend its file-pointer list; Claude could only prepare
the constitution-file side of the change.

**Known drift, discovered 2026-09-08, not yet fixed:** `arc-lite.md`'s
file-pointer list currently stops at
`constitution/04-procedure-memory.md` — it never actually gained
`05-ignore-list.md` despite decision 11 and the paragraph above assuming
it had. Arc Lite has been running without ever being told to read the
ignore list. Adding `06-answer-format.md` needs the same human hand as
decision 11 (see `docs/decision-log.md`, decision 17), so both entries
should be added to `arc-lite.md`'s numbered list in the same edit:
`components/local-agent/constitution/05-ignore-list.md` and
`components/local-agent/constitution/06-answer-format.md`.

The subagent file was created ahead of this component's original
guidance to wait until the Constitution content had been used and
adjusted "a few times" first — a deliberate, explicit choice made when
asked, not a default. That means the Constitution content is less
battle-tested than the original sequencing intended; treat early answers
from it with correspondingly more scrutiny until real questions have
exercised `02-canonical-sources.md` a few times.

## Status

MVP, trajectory under active reconsideration per decision 11 — no longer
committed to staying a disposable comparison tool. Seeded with three real
reference points from
[`docs/program-roadmap.md`](../../docs/program-roadmap.md)'s activity
log — linked back to their source, not duplicated. See
`constitution/02-canonical-sources.md`. `constitution/05-ignore-list.md`
is seeded with nothing yet, and `gap-log.md` starts empty by design — it
only fills from real usage through `ui/server.py`.

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
