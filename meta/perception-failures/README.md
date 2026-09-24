# perception-failures

A catalogue of instances where Claude asserted an incorrect belief as
settled fact — to itself, in a document, or to the user — and the
mechanism by which that belief was wrong. Raised by the user on
2026-09-08, in response to one live instance: a claim that
`.claude/agents/` was blanket write-protected, which turned out to be an
overgeneralization of a narrower, real finding, propagated into three
project documents before the user asked a direct question that didn't
let the premise stand.

## Why this is a third thing, not a rename of an existing component

`meta/procedural-memory/` already records mistakes and the rule that
prevents repeating them — and the fix for *this* instance is recorded
there too (see `universal.md`'s correction to the sandbox-write-protection
entry). This component does not replace that. It exists because
"incorrect perception" is a specific *failure mode* worth studying on its
own terms, distinct from the broader class of mistakes procedural-memory
covers (missed steps, syntax errors, one-off oversights that don't share
a common structure). Not every procedural-memory entry belongs here; an
entry here should always have a procedural-memory fix to point to,
recorded once, not duplicated.

`meta/architecture-learning/` is the closer relative in *shape* — an
accumulating, evidence-based log with an explicit no-overclaiming-from-
one-instance discipline — but it models the *user's* reasoning. This
models a specific way *Claude's own* reasoning goes wrong. Same
"do not duplicate a lesson across layers" rule applies across all three
`meta/` components plus session memory; see each component's own
"Division from..." section.

## The specific failure mode this instance revealed

A belief was formed from real, narrow evidence (a git `checkout`/`reset`
that recreates a path under `.claude/agents/` was blocked). The belief
that got carried forward and repeated was broader than the evidence
supported ("writes to `.claude/agents/` are blocked" rather than
"*recreating* a path under `.claude/agents/` is blocked"). Once stated
as a flat conclusion, divorced from the boundary condition that produced
it, it was cited three more times — in a README, a decision log, and
directly to the user — without being re-tested, until the user asked why
a file Claude had created would be uneditable by Claude, which doesn't
hold together on its own terms. Testing it directly (not re-reading past
notes) resolved it in under a minute.

## Purpose: accumulate toward a written analysis, not fix behaviour today

This is explicitly research-shaped rather than operational. The
aspiration, stated by the user, is that with enough instances this could
support a paper or essay on how an agent's incorrect perceptions form,
propagate, and get caught — including who or what actually catches them
(the user, a direct test, a contradiction discovered incidentally). A
single instance is a data point, not a pattern; `log.md`'s entries are
structured so a real pattern — if one exists — can be found later by
comparing entries, rather than asserted from this first one. Resist
writing a "principle" or synthesis document until there are enough
independent instances to compare, the same discipline
`architecture-learning` applies to its own hypotheses.

## Structure

Deliberately minimal for now — one flat file, no index or promotion
machinery, matching `procedural-memory`'s own reasoning for not adopting
`architecture-learning`'s heavier split at low volume. Revisit only once
`log.md` holds enough entries that comparing them by eye gets slow, or a
real cross-instance pattern emerges and deserves its own synthesis
document.

- [`log.md`](log.md) — one structured entry per instance.

## What earns an entry

The belief was stated as settled (not hedged), it was wrong, and the
wrongness came from a *perception* failure — an overgeneralization, a
stale carried-forward conclusion, an unverified inherited claim — rather
than a plain slip. If it doesn't have that shape, it belongs in
`procedural-memory` instead, not here.

## Status

Seeded 2026-09-08 with the instance that prompted this component's
creation. Twelve entries as of 2026-09-24. Still deliberately no synthesis
document: the entries are accumulating fast enough that a pattern may be
findable, but naming one is the thing this component's own purpose
section says to resist until the instances can be compared properly. The
count is worth watching rather than the individual entries — if it keeps
climbing at this rate, that is itself the finding.
