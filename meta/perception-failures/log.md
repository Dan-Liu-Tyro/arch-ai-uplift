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
