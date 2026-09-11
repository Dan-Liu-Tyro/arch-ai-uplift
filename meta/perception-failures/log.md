# Perception Failures Log

One entry per instance. See `README.md` for what earns an entry and why
this is tracked separately from `meta/procedural-memory/`. Each entry
uses the same fields so instances can eventually be compared against
each other, not just read individually:

- **Belief asserted** — what was stated as settled fact.
- **Actual evidence behind it** — what was really shown, and how much
  narrower that is than the belief.
- **How it formed** — the reasoning step where the gap opened.
- **How it propagated** — where it got repeated before being caught.
- **Caught by** — who or what stopped it, and how.
- **Fix** — pointer to where the correction actually lives (not
  restated here).

---

## 1. `.claude/agents/` assumed blanket write-protected

**Date.** 2026-09-08.

**Belief asserted.** "`.claude/agents/` is sandbox-write-protected from
Claude Code" — stated as a flat, unqualified fact in
`components/local-agent/README.md`, in `docs/decision-log.md` (decision
11 and, initially, decision 17), and directly to the user as the reason
a needed fix to `.claude/agents/arc-lite.md` required their hand.

**Actual evidence behind it.** A prior session's real finding, recorded
in `meta/procedural-memory/universal.md`: a git `checkout`/`reset` that
*recreates* a tracked path under `.claude/agents/` (as part of a branch
merge) failed with `Operation not permitted`, confirmed with a direct
`mkdir`/`touch` test at the time. That evidence supports "creating or
deleting a path under `.claude/agents/` is blocked" — a materially
narrower claim than "any write is blocked."

**How it formed.** The original `universal.md` entry's own **Rule**
paragraph closed with "a change to a file in one of these directories
needs a human hand" — a conclusion that read as general-purpose, once
separated from the specific create/delete operation that had actually
been tested. Nothing in the entry's phrasing marked the boundary between
"tested" (recreate-the-path operations) and "assumed" (everything else).

**How it propagated.** Cited as-is, without re-testing, across at least
three further points: `components/local-agent/README.md`'s "How to use
it" section, `docs/decision-log.md` decision 11's description of how a
prior fix was applied, and this session's own decision 17 entry and
reply to the user, which planned a "hand-edit" step that turned out to
be unnecessary.

**Caught by.** The user, directly: "why you created arc-lite.md in
.claude/agents and yet don't have control to modify it? Doesn't make
sense to me." Not caught by any check Claude ran unprompted — the
inconsistency (having created the file, per decision 9, but claiming
inability to edit it) was visible in the record already and had not
been noticed. The catch was a logical-consistency challenge, not a new
piece of evidence.

**Fix.** Recorded in `meta/procedural-memory/universal.md`'s
correction to the sandbox-write-protection entry (2026-09-08), and in
`components/local-agent/README.md`'s and `docs/decision-log.md`'s own
correction notes for the same date. Not restated here.

---

## 2. `components/local-agent/README.md` believed updated by decision 21

**Date.** 2026-09-11 (caught); the belief itself dates to 2026-09-08.

**Belief asserted.** `docs/decision-log.md` decision 21 states, as
settled fact, that "documentation updated in the same change" includes
`components/local-agent/README.md` ("boundary, depends-on, how-to-use").

**Actual evidence behind it.** None re-checked at the time this session
read it. The file's actual content — `Why this exists`, `Boundary`,
`How to use it`, and `Status` — still described the pre-decision-21
seven-file Constitution mechanism in full detail (naming
`constitution/00-soul.md`, `01-working-protocol.md`,
`02-canonical-sources.md`, `06-answer-format.md` as current), even
though decision 21 deleted all four of those files. The deletions
themselves were real and on disk; only the claim that the README had
been brought in line with them was false.

**How it formed.** Unresolved, and stated as such rather than guessed at.
Two candidate explanations, either possible: the README edit decision 21
describes was never actually written despite the log entry saying it
was, or it was written and then lost — the git log shows a later commit
titled "sync: commit decision 21's local-agent restructuring, previously
undone," which restored the four file deletions but may not have carried
a matching README edit if one existed only outside git history at the
time. Not investigated further; the practical fix (correct the README
now) doesn't depend on which explanation is right.

**How it propagated.** Silently, for three days and multiple further
decisions (22) touching adjacent files, because nothing in this project
re-verifies a "documentation updated" claim against the actual file
content after the fact — the same gap decision 23 (below) now closes for
component *status* specifically, though not for every claim a decision
entry might make about what else it changed.

**Caught by.** The user asking, in a different session, for component
status and related work to be answerable "driven from conversation"
without reconstructing context — which prompted re-reading every
component README against current reality rather than trusting its own
prose, surfacing the mismatch as a side effect of that check, not as a
targeted audit for this specific failure mode.

**Fix.** `components/local-agent/README.md`'s own 2026-09-11 correction
note, and `docs/decision-log.md` decision 23. Not restated here.
