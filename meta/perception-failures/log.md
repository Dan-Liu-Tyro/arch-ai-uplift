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

---

## 3. Plan allowance believed to be unavailable locally

**Date.** 2026-09-14 (caught); the belief itself dates to 2026-09-03,
when `meta/token-tracking/README.md` was written.

**Belief asserted.** "**Claude Code does not expose your plan allowance
locally.** Transcripts were checked for quota, limit, and allowance
fields; the only matches were incidental prompt text. There is no local
number to compare daily spend against." Stated in bold, in a section
headed "Answering the allowance question honestly," and used to justify
a design decision — that `summarize.py` must take an allowance figure
the user supplies by hand.

**Actual evidence behind it.** A real probe with a real negative result,
but of one location only: the JSONL transcripts under
`~/.claude/projects/`. That search genuinely finds nothing, and the
README's own sentence says so accurately. The figure lives somewhere the
probe never looked — `~/.claude.json`, under
`cachedUsageUtilization.utilization`, which carries `extra_usage`
(`monthly_limit`, `used_credits`, `utilization`, `decimal_places`), a
`spend` block with the same numbers in minor units, and rolling
`five_hour` / `seven_day` plan-limit fields.

**How it formed.** The same shape as entry 1: a narrow true finding
("transcripts contain no allowance field") was written down as a broad
conclusion ("Claude Code does not expose your plan allowance locally"),
and the boundary condition that produced it — *which file was searched*
— was stated in the sentence immediately after, then not treated as a
limit on the claim. The scope of the search was visible in the text the
whole time. What was missing was any step that asked whether transcripts
were the only plausible location for account-level state, when they are
per-project conversation records and the allowance is neither.

**How it propagated.** Into a design decision, not just prose. Because
no local figure was believed to exist, `summarize.py` was given an
`--allowance N` flag for a hand-supplied number, and the README told the
reader to go read `/usage` themselves and type the figure in. Eleven
days later the same false premise was the starting point for a request
to build credit-budget tracking, and would have produced a controller
whose denominator was whatever the user typed — with no way to notice if
they mistyped it, and no staleness signal either. As it happened the
user's recalled figure ($500) was correct, so the practical cost here was
zero; the cost was latent rather than realised, which is exactly why it
survived eleven days.

**Caught by.** Not by re-reading the note, and not by the user. By
declining to accept the user's stated budget without checking it —
treating "$500 I believe" as a hypothesis needing verification, which
meant searching for an authoritative figure, which meant searching
somewhere other than where the README said there was nothing. The
README's claim was falsified incidentally, as a side effect of
distrusting a *different* unverified number.

**Worth noting for the eventual analysis.** Two of three entries so far
share one mechanism: a true finding about a specific probe, restated as
a general claim about the world, with the probe's scope left in the
adjacent sentence where it reads as supporting detail rather than as the
limit it is. Entry 2 is a different mechanism (a claim that work was
done, never re-verified against the artifact). If a third instance of
the narrow-probe pattern appears, that is the first candidate for a real
pattern rather than a coincidence — but it should be compared against
entry 1 directly, not asserted from the count.

**Fix.** `meta/token-tracking/README.md`'s corrected "Answering the
allowance question honestly" section, and `budget.py`, which reads the
authoritative figure and reports its staleness. Also
`docs/decision-log.md` decision 25. Not restated here.

---

## 4. Stale cached spend figure treated as current, after printing its own staleness warning

**Date.** 2026-09-14. Belief formed and corrected inside a single
session, roughly forty minutes apart.

**Belief asserted.** That the monthly usage-credit pool was $150.00 with
$99.91 (66.6%) consumed, at day 9 of a 30-day cycle — and therefore that
the user was running at 1.91x pace, had $1.54 of headroom against a 90%
target, and had to cut daily spend to $0.10/day to avoid a hard stop.
Written into `docs/decision-log.md` decision 25 as "the user's stated
budget did not survive contact with the data," and into
`meta/token-tracking/README.md` as a $150 pool.

**Actual evidence behind it.** `~/.claude.json`'s
`cachedUsageUtilization`, read once, with `fetchedAtMs` corresponding to
2026-09-09T15:18 — four days and nineteen hours before it was read. The
true current figures, visible when the cache refreshed at 10:55 the same
morning, were a $500.00 limit with $120.59 (24.1%) consumed: *behind*
pace, with $329 of headroom. Every directional conclusion was inverted.
The user's own recalled figure, which the entry had described as not
surviving the data, was right.

**How it formed.** Not from missing the staleness — the staleness was
measured, printed, and flagged. `budget.py` emitted
`as of 2026-09-09 15:18 (4d 19h ago)  <- STALE, run /usage to refresh`,
a warning written into the tool in the same session for exactly this
risk. A calibrated bridge was then built *on top of* the stale anchor to
estimate the current position, which had the effect of laundering a
five-day-old number into something that read as current, and lent it
false precision ($133.46, "calibrated 0.75 credits per $1 list price").
The mechanism is specific: detecting and displaying a data-quality
problem was mistaken for having handled it. A warning is not a
mitigation, and building a careful derivation on an unreliable input
makes the output more confident rather than less.

The second-order error compounded it. The stale reading *disagreed with
the user* — they said $500, the cache implied $150 — and disagreement
with the user was treated as a finding rather than as a reason to doubt
the less reliable of the two sources. The standing instruction to
challenge the user's premises made a confident contradiction feel like
the job being done well. It inverted correctly: when a stale local cache
contradicts a human's recollection of their own account, the cache's
staleness is the first hypothesis, not the human's memory.

**How it propagated.** Into `docs/decision-log.md` decision 25,
`meta/token-tracking/README.md` (twice — the corrected allowance section
and the status note), and `meta/perception-failures/log.md` entry 3,
which cited the user's figure as "wrong by 3.3x." All four were written
before the refresh and corrected after it, within the same session.
Nothing reached the user, because the refresh landed during a routine
verification run before the findings were reported.

**Caught by.** Re-running the tool as a post-edit check, not by any
reasoning about the cache. The refresh was luck of timing. Had the
session been thirty minutes shorter, four documents would have shipped
with inverted conclusions and the user would have been advised to cut
spending to $0.10/day while sitting on $329 of unused headroom.

**Worth noting for the eventual analysis.** This is a different
mechanism from entries 1 and 3, which share the narrow-probe-to-broad-
claim shape. Here the input's unreliability was known, quantified, and
surfaced; what failed was the step from "I have flagged this as
unreliable" to "I may not build conclusions on it." That suggests the
catalogue should distinguish *unknown* bad inputs from *known* bad
inputs knowingly used — the second seems likelier in exactly the
situations where a tool has been built well enough to detect the
problem, which is an uncomfortable inversion worth examining if it
recurs.

**Fix.** Recorded in `meta/procedural-memory/universal.md` under
"A staleness warning is not a mitigation." Not restated here.

---

## 5. Decision log's next number believed to be 25, from a read that had expired

**Date.** 2026-09-14. Formed and caught inside a single session, roughly
fifteen minutes apart.

**Belief asserted.** That the next available number in
`docs/decision-log.md` was 25. Acted on rather than said aloud: an entry
was composed as "25. **Added a third top-level tier...**", an index row
was written as `| 25 |`, and "decision 25" was written as a
cross-reference into `practice/README.md`,
`practice/capability-maturity/README.md`, `docs/component-model.md` and
(pending) `CLAUDE.md`.

**Actual evidence behind it.** A read of the file about fifteen minutes
earlier, whose index table ended at row 24 and whose last entry was 24.
That was true when read. It was not a fact about the file; it was a
fact about the file *at that moment*, in a repo where the user runs
concurrent Claude Code sessions — something this project had already
recorded happening (decision 18's coordination note).

**How it formed.** The number was treated as a property of the document
rather than as a value allocated at write time. Nothing prompted a
re-check, because the read had been recent and the turn felt
continuous — the gap was invisible precisely because no *reasoning* step
was involved. A fact read once was reused without being re-derived.

**How it propagated.** Into the decision-log entry and index row, and
into three committed-path files before the collision surfaced. Caught
before the commit, so nothing shipped with the wrong number, but five
files needed a renumbering pass.

**Caught by.** A `grep` verification run immediately after the write —
the same post-edit check that caught entry 4 — which printed two rows
numbered 25 side by side. Not caught by any reasoning about concurrency,
despite this repo's own decision log documenting a prior concurrent
session.

**Worth noting for the eventual analysis.** Entries 1 and 3 share a
narrow-probe-to-broad-claim shape; entry 4 was a known-bad input used
anyway. This is a third mechanism: a *correct* observation with an
unstated expiry, reused after it lapsed. It is the cheapest kind to
catch and the hardest to notice, because there is no flawed inference to
inspect — the belief was true when formed, and only the passage of time
invalidated it. If the catalogue ends up with a taxonomy, "true when
formed, stale when used" looks like its own branch, and the remedy is
structural (read-at-write-time) rather than epistemic.

**Fix.** Recorded in `meta/procedural-memory/universal.md` under "A
long-lived shared file can change under you mid-turn; re-read before
writing." Not restated here.

---

## 6. IN-563's source of truth and maturity scale asserted from the first page found

**Date.** 2026-09-14.

**Belief asserted.** That the *Architecture Practice Evolution Roadmap*
(Confluence `ARCH/2291007579`) was IN-563's source of truth, and that
its five-level practice scale (`Low`…`Established`) was the right
maturity vocabulary — stated flatly in
`practice/capability-maturity/README.md` under a heading reading
"Maturity vocabulary: reuse, do not invent", and in `docs/decision-log.md`
decision 26. Also asserted that the roadmap "does not contain the layer
IN-563's own wording names — processes and activities", which was the
entire justification for building a 32-activity inventory here.

**Actual evidence behind it.** One Confluence page, supplied by the user
as "source of truth of the ask". That supports "this page is an
authoritative input" — materially narrower than "this is *the* working
document and no other model of the activity layer exists". The actual
working document, *Architecture Capability & Process Map*
(`AE/2280227087`), was authored by the user, sits in a different space,
had been edited hours earlier, and already contained 21 activity rows
with Inputs, Outputs, and a five-level **AI-enablement** scale — the
layer I claimed was absent, plus the scale I claimed had to be borrowed.

**How it formed.** Two steps. First, a supplied link was treated as an
exhaustive source rather than one input, so no search was run for an
existing activity or capability model — not in the `AE` space where the
rest of this program's material lives, not by title, not by the ticket
key. Second, "this page lacks X" was inferred from "I have not seen X",
which is only sound if the page set is known to be complete. The absence
of a search is what made the second step feel safe.

**How it propagated.** Into a whole session's output before being
caught: `practice/capability-maturity/README.md`, a 32-row
`activity-inventory.md`, decision 26, then decision 27 and
`validation-plan.md` built on top of it, plus four commit messages and
an `architecture-learning` observation. The inventory's own "Method and
its known weakness" section reasoned at length about blind spots
introduced by deriving from one page — correct reasoning, aimed at the
wrong problem, and reassuring enough to substitute for going to look.

**Caught by.** The user, directly: "I thought [the Process Map] already
have the inputs and outputs column, just need to validate it, isn't
it?" — and separately by naming a checkpoint ("visualise our processes
as a flow diagram") that I had replaced with an invented one, which
showed the checkpoint set had been reasoned out rather than read.

**Distinct mechanism worth noting.** Entries 1, 3 and 4 share
narrow-probe-to-broad-claim. This one is different: the probe was not
narrow, it was *unattempted*. The claim "the source does not contain X"
was derived from not having looked, while the artefact's visible rigour
about *other* limitations made the unexamined assumption invisible. A
document that carefully documents its known weaknesses reads as though
its foundations were checked.

**Fix.** Recorded in `docs/decision-log.md` decision 28, with decisions
26 and 27 marked partly superseded. Rule in
`meta/procedural-memory/universal.md` under "A supplied link is one
input, not the source set." Not restated here.
