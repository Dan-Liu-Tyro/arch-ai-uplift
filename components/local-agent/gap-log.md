# Gap Log

Append-only record of every lived gap surfaced while answering a real
question through `ui/server.py`: a refusal
(`constitution/01-working-protocol.md` step 4), a citation below
`canonical` status, or a failure of the mechanical check defined in
`constitution/06-answer-format.md`. This is the knowledge-lifecycle
feedback loop decision 12 assumed but didn't yet build: a knowledge
owner reviews this file and either adds or updates a
`constitution/02-canonical-sources.md` entry, or accepts the row as a
genuinely open question for now.

Written automatically by `ui/server.py`'s `_log_gap()` as Arc Lite is
actually used through the UI — not by hand, and not by direct
Claude-Code-subagent invocation, which bypasses this file entirely (see
`06-answer-format.md`). Reviewing a row and then deleting or annotating
it once addressed is a human step.

| date | trigger | question | detail |
|---|---|---|---|
