# procedural-memory index

The cheap, mandatory-read layer. One line per lesson — the rule only, no
"what happened," no cost, no evidence. This is what `CLAUDE.md` points at
before substantial work, precisely so that reading it stays affordable no
matter how many entries accumulate below.

Open `lessons.md` or `universal.md` (both organized in the same order as
here) only when:
- a current situation looks like it matches a rule and the one-liner isn't
  enough to apply it correctly, or
- you're about to record a new entry and need to check it isn't a
  restatement of one that already exists.

Hand-maintained, not generated — add a line here in the same edit that adds
or retires an entry in the detail file. See `README.md` for the growth
policy this exists to serve.

## Project-specific (`lessons.md`)

- Append `architecture-learning` observations as they happen, not on
  request — capture is near-zero-cost and is lost if deferred.
- Cite decisions by name, not number — `CLAUDE.md`'s summary and
  `docs/decision-log.md`'s own numbering aren't guaranteed to agree.
- Bump `kg-viz`'s `PAGE_REVISION` in the same edit as any change under
  `src/`, every time — it only catches a stale cached page if it actually
  changes.
- "The boundary" names at least three geometries in `kg-viz` (camera fit,
  stage band, label collision box) — on a visual report, check the
  screenshot or ask before picking one, then encode the fix as a
  `verify.js` assertion rather than declaring it fixed.

## Universal (`universal.md`)

- Test an environment hypothesis before proposing a config change — probe
  the failing layer directly, at no cost to the user, before asking them to
  edit anything.
- Never put a credential into a command line, even a local one, even the
  user's own token.
- After a denial, change approach — ask what the objection was, don't retry
  a rephrased variant.
- Cite by name in living documents, never by number — append-only logs
  renumber.
- Label first-measurement conclusions as provisional — say what would
  change the reading, don't name a key metric from one data point.
- Verify derived paths, offsets, and index arithmetic by running the code
  in the same turn you write it.
- Compute counts about your own artefact with a command (`grep -c`, `awk`,
  `sort | uniq -c`); never assert a count, proportion, or "N of M" from
  reading.
- A supplied link is one input, not the source set — search the space it
  lives in before asserting "the source does not contain X."
- "Propose"/"review"/"suggest" asks for the reasoning first — present
  options and a recommendation as text, and don't write the artefact until
  the framing is agreed.
- Proof-read any command or commit message the user is expected to paste
  or run, once more, before sending it.
- Never run a command whose output is a credential, even to debug whether
  it exists — check success some other way.
- `.claude/agents/`, `.claude/skills/`, `.claude/hooks/`, `.claude/settings*.json`,
  and `.git/config` block *creating, deleting, or unlinking* a path
  (including via `git checkout`/`reset`), not editing an already-tracked
  file's content in place.
- A skill's instructions and a subagent's tool grants are fixed for the
  rest of the session once invoked once — a mid-session edit doesn't
  reliably propagate; verify via a direct file read or a fresh session,
  not a same-session re-invocation.
- Several Claude sessions run on this repo at once by design — assume the
  index holds someone else's work always, scope every commit with
  `git commit -m ... -- <paths>`, verify with `git show --stat HEAD` after,
  commit promptly, and never `git stash` or rewrite history. Looking at a
  dirty index is not a mitigation for it, and concurrency is not an
  incident to escalate.
- A staleness warning is not a mitigation — refresh a known-stale input or
  say the conclusion is unavailable; don't derive on top of it. And if a
  stale source contradicts the user's own recollection, doubt the source
  first.
- A long-lived shared file can change under you mid-turn — re-read
  immediately before writing, and keep edits additive and anchored on your
  own content, not a content match against someone else's prose.
- A subagent's "verified" claim about a field can mean presence, not
  validity — spot-check actual values yourself, don't infer "populated"
  from "the key exists" or from another party's say-so.
- A zero-match search is a fact about your pattern, not about the content —
  confirm the shape you're matching exists before trusting any count; a
  mis-specified pattern returns a well-formed number, not an error.
- An algorithm's arbitrary tie-break becomes a semantic claim in its output —
  derive it from the data model, not from iteration order, and verify by
  rendering the artefact, not by checking the run completed.
- One blocked line does not make a file untestable — scope "can't test that
  here" to the blocked call, name skipped checks in any verification list,
  and re-grep every reader when a shared return shape changes.
- A stub that models only the success case cannot catch the failure it
  guards — enumerate a dependency's failure states as scenarios, and suspect
  the harness when a result looks impossible.
- A required value you cannot verify is a blocker, not a blank to fill
  fluently — leave it out, mark it unverified inline, or ask; never emit a
  plausible-looking version/hash/id to complete a structure.
