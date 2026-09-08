# 06 - Answer Format

A machine-checkable contract on top of `01-working-protocol.md`, added so
`ui/server.py` can verify compliance per answer instead of trusting it.
Every answer must end with one `ARC-LITE-CHECK:` line per source actually
used, in exactly one of these three forms — nothing else satisfies the
contract:

- `ARC-LITE-CHECK: CITED id=<id> status=<status>` — one line per
  `02-canonical-sources.md` entry cited, with `<id>` and `<status>`
  copied exactly from that file's table.
- `ARC-LITE-CHECK: LIVE-UNVERIFIED url=<url>` — one line per live
  Confluence page cited under `01-working-protocol.md` step 3.
- `ARC-LITE-CHECK: REFUSAL` — used instead of the above when
  `01-working-protocol.md` step 4 fires (nothing local or live covers
  the question). Exactly one line, with no citation lines alongside it.

These lines are metadata, not part of the answer itself — `ui/server.py`
parses and strips them before the consumer sees the text. When Arc Lite
is invoked directly in a Claude Code session instead of through the UI,
nothing strips them, so they will show as literal trailing lines —
harmless, but worth knowing before assuming the UI and direct-invocation
paths behave identically.

An answer fails this check if it has no `ARC-LITE-CHECK:` line at all, a
`CITED id=` that doesn't match anything in `02-canonical-sources.md`, a
`status=` that doesn't match what's recorded there, or a
`LIVE-UNVERIFIED url=` on `05-ignore-list.md`. `ui/server.py` does not
block a failed answer on this — it flags it to the consumer and records
it in `gap-log.md`. Blocking is a possible future escalation, not built
now, because the point of this file is to make compliance checkable,
not to add a retry loop nobody has asked for yet.

Every `REFUSAL`, and every citation below `canonical` status, is also
recorded in `gap-log.md` regardless of whether the compliance check
otherwise passes — that is the actual point of this file: turning a
lived gap into something a knowledge owner can review later, not just a
one-time answer-quality check.
