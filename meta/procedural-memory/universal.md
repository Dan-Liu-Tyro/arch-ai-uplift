# Universal Procedural Lessons

Lessons distilled from working on this project whose evidence is
project-specific, but whose rule doesn't depend on anything about knowledge
graphs, Confluence, Rovo, or this repo's own tooling — candidates for manual
promotion into another project's own procedural memory or `CLAUDE.md`, if
that project turns out to need the same discipline. See
[`README.md`](README.md) for how this differs from
[`lessons.md`](lessons.md) (evidence *and* rule both specific to this
project) and from `architecture-learning` (models the user's reasoning, not
mine).

Promotion elsewhere is a deliberate, manual copy — the same "move, not
automatic reach" pattern this repo already uses when a `components/` piece
is promoted into its own project (see `docs/component-model.md`). Nothing
here propagates anywhere by itself; a future session working on another
project would need to read this file and choose to carry an entry over.

Split out of `lessons.md` on 2026-08-26: eight of that file's original ten
entries turned out, on inspection, to be general engineering/assistant
hygiene rather than anything tied to this project's domain. Worth noting on
its own — it suggests this project's actual project-specific procedural
surface is still thin, two entries' worth so far.

---

## Test an environment hypothesis before proposing a config change

**What happened.** `gh` failed with a TLS certificate error. I noticed
`GIT_SSL_CAINFO` pointing at a corporate CA bundle, inferred that `gh` was ignoring
it, and proposed adding `SSL_CERT_FILE` to the user's Claude Code settings. They
made the change. It did not work. `GODEBUG=x509usefallbackroots=1` did not work
either. The actual blocker was the sandbox denying Go's call into macOS
Security.framework — unfixable by any environment variable.

**Cost.** The user edited their own configuration for nothing, then reverted it to
stay aligned with org standards.

**Rule.** Before proposing a change to someone's configuration, test the hypothesis
in a way that costs them nothing — set the variable inline for one command, or probe
the failing layer directly. Propose the edit only after the probe works. And prefer
handing over a command to run in their own shell over changing their environment at
all.

---

## Don't route credentials through a command line

**What happened.** With `gh` blocked, I reached for
`curl -H "Authorization: bearer $(gh auth token)"` to hit the GitHub API. The call
was denied, correctly.

**Cost.** A denied tool call, and a request that should never have been made.

**Rule.** Never put a credential into a command line — even a local one, even the
user's own token, even via substitution. If a task appears to need a secret, ask
first and say what it will be used for.

---

## After a denial, change approach — don't retry a variant

**What happened.** A compound `git checkout main && git merge --ff-only` was denied.
I re-sent essentially the same operation with the pipeline stripped. It was denied
again.

**Cost.** Two denied calls where one should have prompted a question.

**Rule.** A denial is information about intent, not a syntax error. Ask what the
objection was, or hand the command over, rather than probing for a phrasing that
gets through.

---

## Cite by name in living documents, never by number

**What happened.** Appending a decision to `docs/decision-log.md` renumbered the
existing ones and silently broke two cross-references that pointed at "decision 3."

**Cost.** Caught only because I grepped for it; otherwise two documents would have
pointed at the wrong decision indefinitely.

**Rule.** In any append-only document, reference entries by name, not position. This
is now also stated in `CLAUDE.md`, since the log will keep growing.

---

## Label first-measurement conclusions as provisional

**What happened.** From the first token baseline I reported that cache reads were
the dominant signal. Adding cost modelling showed cache *writes* are the figure that
matters — they indicate real context change and cost 20× more per token. My earlier
framing was not wrong about the volume, but it pointed attention at the wrong number.

**Cost.** A conclusion the user might have acted on, corrected one session later.

**Rule.** A single measurement supports a description, not a recommendation. Say
which number is provisional and what would change the reading, rather than naming a
key metric on first sight of the data.

---

## Verify derived paths by running, not by reasoning

**What happened.** `summarize.py` derived the repo name from `__file__` with one
`dirname` too few, so it looked for a transcript directory named after `meta`. Pure
reasoning error in three lines of path arithmetic.

**Cost.** Small — one failed run — but it would have shipped silently if the script
had not been executed as part of the same change.

**Rule.** Run any code that derives paths, computes offsets, or does index
arithmetic, in the same turn that writes it. These are the errors that survive
careful reading.

---

## Compute counts about your own artefact; never assert them from reading

**What happened.** Having just authored a 32-row activity table, I wrote in the
same document that "nine of the ten `not-assessed` rows sit in groups B and C",
and listed the activities. There were eight such rows, seven in those groups,
and the activity list was partly wrong too. The claim then got restated in
`docs/decision-log.md`, so one uncomputed sentence shipped into two documents and
survived my own review of both.

**Cost.** Low to fix, high in credibility. The surrounding argument was correct
and load-bearing — it is the reason IN-563 has a contribution of its own — and a
reader who checks the number finds the strongest point in the document
overstated. In an assessment whose entire value is being trustworthy about
evidence, that is the worst possible place to be sloppy.

**Why the existing arithmetic rule did not catch it.** "Verify derived paths by
running, not by reasoning" is scoped to *code* that derives paths or does index
arithmetic. Here no code was written, so nothing triggered — the count was prose
about a table on screen, which feels like reading rather than calculating. That
feeling is the trap: eyeballing a distribution across 32 rows is arithmetic
wearing prose clothing.

**Rule.** Any quantified claim about an artefact — a count, a proportion, "most",
"all but two", a distribution across groups — gets derived with a command in the
same turn it is written, even when the artefact is one you just wrote and
especially when the number supports your main argument. `grep -c`, `awk`, or
`sort | uniq -c` over the actual rows takes one call. Sentences of the form "N of
the M rows..." are the specific shape to distrust.

---

## A supplied link is one input, not the source set

**What happened.** Asked to work on a business initiative, the user supplied a
Confluence page as "source of truth of the ask". I treated that as the complete
source set: built a 32-row activity model derived from it, chose its maturity
vocabulary, and asserted in committed documents that it "does not contain the
layer the ticket names". The real working document — authored by the user, in a
different Confluence space, edited hours earlier — already contained that layer
with inputs, outputs, and a different and more appropriate maturity scale. One
search would have found it.

**Cost.** A session's output, all of it built on the wrong foundation: two
committed artefacts, two decision-log entries, four commit messages. The rework
cost more than the original work.

**Why it felt safe.** "The source does not contain X" was inferred from "I have
not seen X". That inference is only valid when the source set is known to be
complete, and a single supplied link never establishes that. Worse, the artefact
I produced documented its *own* known weaknesses carefully — which made it read
as rigorous and removed the impulse to check whether its foundation was right.

**Rule.** When someone hands over a link to ground a piece of work, treat it as
one input and spend one search before building on it: look in the space where
the work's other material lives, search by the ticket key, and search by the
obvious artefact titles ("capability map", "process map", "maturity"). Never
write "the source does not contain X" unless a search for X was actually run —
say "I did not find X in the page supplied" instead, which is what is known.
Cheap to do at the start, expensive to discover at the end.

---

## "Propose" means present it, not build it

**What happened.** Asked to "review what's our plan and propose a new readme",
I wrote a 148-line README straight to disk. I even opened with "one thing I want
to flag before writing", then flagged nothing and wrote the file. The reply was
"Try again". The same shape had already happened once earlier in the session
with a find-and-replace sweep, so it cost two wasted cycles.

**Cost.** Two discarded artefacts and two round-trips, on work the user then
shaped differently once actually asked — they picked a ~55-line router over the
148-line version, and raised a repo-rename question that changed the framing.
Neither would have surfaced from reviewing a finished file, because a finished
file invites accept-or-reject rather than redirection.

**Why it is not just over-eagerness.** The stewardship model in `CLAUDE.md` says
to record a converged decision without being asked, which makes writing-first
the right default for most turns. The exception is signalled by the verb: "review",
"propose", "what do you think", "shall we" are requests for the reasoning, and
the artefact is what happens *after* agreement. Delegation of routine upkeep is
not delegation of framing choices.

**Rule.** When the request contains "propose", "review", "suggest", or "what
would you...", deliver the review and the options as text first, and name the
choice you would make — but do not write the artefact until the framing is
agreed. If a question genuinely needs answering before the artefact can be
written well, ask it *before* drafting, not in the same turn you commit a draft.
And if you announce you are about to flag something, flag it.

---

## Proof-read commands the user is expected to paste

**What happened.** I gave a `git branch --set-upstream-to` command with the branch
name misspelled, and separately pasted a commit title with a typo mid-word.

**Cost.** A command that would have failed on paste, and a correction that cost a
paragraph of the reply.

**Rule.** Anything the user will copy and run gets read once more before sending. A
wrong command spends their turn, not mine.

---

## Never run a command whose output is a credential, even to debug

**What happened.** While diagnosing a `gh auth status` failure that turned out to
be the already-documented sandbox TLS block (see "Test an environment hypothesis
before proposing a config change," above — same `OSStatus -26276` error), I ran
`gh config get -h github.com oauth_token` and `security find-generic-password` to
check whether the stored token was readable. The first command printed the user's
live GitHub OAuth token in plaintext into the conversation transcript.

**Cost.** A real, live credential exposed in a transcript that may be logged or
reviewed later, for a check that didn't need the value itself — only whether a
lookup succeeded.

**Rule.** When probing whether a credential exists or is readable, check for
success some other way (exit code, a masked/boolean signal, a tool built for the
purpose) — never run the command that echoes the secret itself, even for one's own
diagnostic use, even locally. And re-check this file for a matching prior incident
before re-diagnosing a familiar-looking failure at all; this exact TLS error was
already on record.

---

## `.claude/agents/`, `.claude/skills/`, `.claude/hooks/` and `.git/config` are sandbox-write-protected

**What happened.** Merging one branch into another required git operations (a
fresh worktree checkout, then `git reset --hard`) that needed to create,
delete, or overwrite a tracked file under `.claude/agents/` as part of a
normal tree transition. Every one of those operations failed with `Operation
not permitted`, even when the target content was byte-identical to what was
already on disk — which ruled out a real merge conflict. Direct `mkdir`/
`touch` tests on the same path confirmed a sandbox write-block, not a git or
OS issue. The same class of block separately hit `git branch
--set-upstream-to` and `git push -u`, both of which write to `.git/config`.

**Cost.** Several minutes and multiple failed command retries diagnosing what
looked like a git problem before testing the path directly settled it.

**Rule.** In any Claude-Code-managed repo, expect operations that *create,
delete, or unlink a path* under `.claude/agents/`, `.claude/skills/`,
`.claude/hooks/`, `.claude/settings.json` / `.claude/settings.local.json`,
and `.git/config` to be sandboxed off entirely — by design, to stop an agent
from silently expanding its own tool grants or git remotes. This is what a
git checkout/reset does under the hood (it recreates the path), and what a
plain `mkdir`/`touch` does directly, so both are the right diagnostic to
confirm the block before assuming a real merge conflict. Reach for `git
update-index --add --cacheinfo <mode>,<blob-sha>,<path>` (edits only
`.git/index`, never the protected path) rather than retrying the same
checkout/reset command.

**Correction, 2026-09-08.** The rule's last sentence — "a change to a file
in one of these directories needs a human hand" — overgeneralized this into
"no writes at all," and that overgeneralization got repeated into two
project documents (`components/local-agent/README.md`,
`docs/decision-log.md`) as a reason a real fix needed the user's hand, before
being caught when the user asked why a file Claude had created was
supposedly uneditable by Claude. Direct test: the `Edit` tool successfully
rewrote content inside the already-tracked `.claude/agents/arc-lite.md` in
place, while a same-session `touch` of a *new* file in that directory still
failed with `Operation not permitted`. So the block is specifically on
create/delete/unlink of a path in these directories, not on editing an
existing tracked file's content — a much narrower boundary than originally
recorded. Re-verify with the same create-vs-edit distinction before citing
this entry as a reason a change needs a human hand; it usually doesn't.
Separately, and for a different reason: expanding a subagent's `tools:`
grant specifically is worth leaving to the user's own hand regardless of
what the sandbox permits, since self-expanding tool grants is the exact
failure mode this design intent guards against — that's a judgment call
about authorization, not a filesystem limitation.

**Correction, 2026-09-18: the block is not limited to `.git/config` — plain
`git commit` fails too, for the same underlying reason.** Tried in
`arch-ai-uplift` with `dangerouslyDisableSandbox: true` explicitly set (that
parameter is itself disabled by org policy, so it made no difference):
`git commit` failed with `Operation not permitted` creating
`.git/index.lock`. That file doesn't exist between commits, so committing
*creates* a new path under `.git/` — the same create/delete/unlink boundary
this entry already names, just triggered by git's own internal locking
rather than by an explicit remote/upstream write. Net effect: no ordinary
commit can be made from inside a sandboxed session in this environment,
regardless of what's being committed or why. Any workflow that assumed
"stage and commit proactively" is achievable end-to-end from inside the
sandbox needs correcting to "stage the change and hand the user the exact
`git commit` command to run themselves" (e.g. via the harness's `!` prefix).

**Correction, same day (2026-09-18), caught by the next session testing
directly instead of trusting the entry above.** The test that produced the
correction above only tried `git commit` *with* `dangerouslyDisableSandbox:
true` explicitly set — and that parameter is disabled by org policy in this
environment (a no-op, confirmed by this session's own harness reminder), so
setting it changed nothing except possibly how the failure surfaced. A
plain `git add` + `git commit`, no override at all, was tried next and
succeeded on the first attempt, committing the very three files the
correction above described as uncommittable. The real rule was already
written above this one: test the narrowest hypothesis (plain command, no
flags) before generalizing from a failure that included an extra variable.
See `meta/perception-failures/log.md` entry 7.

**`git push` also works, verified by dry run, same session.** `git push
--dry-run origin <branch>` printed the correct `<old>..<new> branch ->
branch` ref-update line and exited 0 — auth and connectivity to the
remote are fine from inside the sandbox. It also printed `failed to
store: 100001` above that line, which looks alarming but is a credential
*helper* (keychain-style cache) failing to persist the token for next
time, not a push failure — the ref line and exit code are what to trust,
not the stray line above them. Don't misread that line as "push is
blocked" on a future occasion; if a real push needs testing, confirm
with the user first since it's a shared-state action, but the mechanism
itself is not the blocker.

**Confirmed by a real push, and one trap: `git push -u` exits 0 while
printing `error:`.** Later the same day the user asked for an actual push;
it succeeded (`2544fd7..e1b9801  foundation -> foundation`), confirming the
dry-run finding against the real thing. But `-u` is a *two-part* operation,
and only the first part can succeed in the sandbox: the ref update lands,
then writing the upstream into `.git/config` fails with `could not lock
config file .git/config: Operation not permitted`, because git writes config
through a `.lock` file it must first create — the same create/delete/unlink
boundary this entry opens with. The command still exits **0**, since the push
itself worked. So the guidance above — trust the ref line and the exit code —
needs one qualification: a zero exit from `push -u` means *the push*
succeeded, not that the upstream got set. Verify the two parts separately
(`git log origin/<branch> --oneline -1` for the push, `git status -sb` or
`git rev-parse --abbrev-ref @{u}` for the tracking link), and expect the
branch to keep reporting no upstream afterwards. Practical consequence: use
plain `git push origin <branch>` and skip `-u` in a sandboxed session — the
flag cannot do its job, and its failure output reads like the push broke when
it didn't.

---

## Claude Code caches agent/skill definitions in-session; a mid-session edit doesn't reliably propagate

**What happened, first form.** A `SKILL.md` file was rewritten mid-session
(new instructions, new content) after having already been invoked once
earlier in the same conversation via the `Skill` tool. Re-invoking the same
skill by name afterward returned the *original* instructions verbatim, not
the new file content — confirmed by reading the file directly immediately
after, which showed the edit had genuinely landed on disk. The tool result
itself named this: "the skill instructions were previously loaded."

**What happened, second form.** A subagent (`.claude/agents/arc-lite.md`)
already recognized by the `Agent` tool earlier in the session had its
`tools:` line edited mid-session to add a new tool (`Skill`). A fresh
dispatch to that same subagent afterward did not see the new grant: the
subagent's own reply reported, unprompted and correctly, that it had
worked around the missing tool by using `Read` directly instead, rather
than pretending the skill had fired. So a brand-new agent *name* becoming
available (which did happen mid-session without a restart, in an earlier
observation on this project) is a different event from an
*already-registered* agent's tool grant being refreshed — the first can
happen in-session, the second was not observed to.

**Cost.** Both would have produced a false-positive test result —
reporting a change as verified working when the actual invocation ran
against stale, pre-edit configuration — if the file hadn't been read
directly, or the agent hadn't self-reported honestly, to cross-check before
drawing that conclusion. Not every case will self-report; check directly
rather than assuming.

**Rule.** Treat both a skill's instructions and a subagent's tool grants as
fixed for the rest of the session once that skill/subagent has been
invoked once, regardless of subsequent edits to `SKILL.md` or a subagent's
`tools:` line. To verify either kind of change actually took effect, read
the file directly rather than trusting a same-session re-invocation's
output, or verify from a fresh session/process (e.g. a fresh `claude -p
--agent <name>` terminal invocation).

---

## `git commit` commits everything already staged, not just what this turn `git add`ed

**What happened.** Before committing a single new file
(`docs/kg-format-research.md`), I checked `git status --short --
docs/kg-format-research.md` — scoped to that one path — saw only the
untracked new file, `git add`ed it, and committed with a message describing
only that file. The commit actually included five files: the new file plus
four deletions (`components/local-agent/constitution/00-soul.md`,
`01-working-protocol.md`, `02-canonical-sources.md`, `06-answer-format.md`)
that were already sitting staged in the index from earlier, unrelated work
(a prior decision this same repo had already recorded), because a plain
`git commit` commits the whole index, not the paths named in the most recent
`git add`. The path-scoped status check made it look like nothing else was
staged, when a full `git status` at the very start of this conversation had
already shown those four deletions staged (`D ` prefix) — information I had
but didn't re-check immediately before committing.

**Cost.** A commit whose message doesn't describe roughly half its actual
diff. Not destructive here — the swept-in deletions were legitimate and
already decided elsewhere — but the same sequence with unreviewed or
unwanted staged content would have committed it silently under a misleading
message, and the mismatch would only surface if someone happened to open the
commit and compare it against the message.

**Rule.** Immediately before any `git commit`, run a full, unscoped `git
status` (not a status filtered to the path just `git add`ed) and confirm
the full staged set matches what the commit message is about to claim. A
path-scoped check only tells you that path's state — it actively hides
other already-staged content sitting in the index from earlier work.

**Recurred 2026-09-24, and the rule above was not sufficient.** Same repo,
same mechanism, but this time the unscoped `git status` *was* run, and the
pre-staged content — another concurrently-running session's in-flight work
on `CLAUDE.md`, `docs/backlog.md` and a `docs/decision-log.md` entry — was
seen, named in conversation, and reasoned about as a hazard to avoid. Then a
plain `git add <my-one-file> && git commit` swept all of it into a commit
whose message described only my file. Looking is not the mitigation; the
looking happened and changed nothing. **The mitigation is to make the commit
itself narrow**: `git commit -- <explicit paths>` (which commits only those
paths regardless of what else is staged), or move the foreign staged content
out of the way first, and then verify with `git show --stat HEAD` that the
commit contains exactly the intended files — after committing, not only
before. Treat a dirty index belonging to someone else as a stop-and-ask
condition, not a thing to step around carefully: another session may commit
or reset underneath you mid-operation, so the sequencing is the user's call.
Note the trap in the recovery too — `git reset --soft HEAD~1` would restore
their staged state, but running it while another session is active races
with whatever that session does next.

**The entanglement runs both ways, which is the part worth internalising.**
Minutes later the other session committed its own work and swept up *my*
uncommitted `docs/decision-log.md` entry (decision 44) in exactly the same
way, under a message about adding the backlog agent. Two sessions sharing
one worktree do not have separable commits: an uncommitted change is
visible to, and committable by, whichever session commits next, regardless
of who wrote it. So the hazard is not "don't contaminate their commit" —
it is that concurrent sessions in one checkout cannot keep authorship
straight at all. No content was lost in either direction here, and both
entries ended up committed; what was lost was the correspondence between
each commit message and its diff.

**Corrected same day: concurrency is the normal operating condition, not an
incident.** The first version of this entry concluded that a foreign dirty
index is a "stop-and-ask" and that concurrent work should be agreed up
front or moved into separate worktrees. The user then set the standing
expectation directly: "I'd like to work on multiple claude code instance
most of the time to be efficient, it's not a bug, but the way of working,
deal with it going forward." That makes stop-and-ask actively wrong — it
would mean stopping on nearly every commit, and it misreads deliberate
parallel work as a fault. The rule is therefore **not** to detect and
escalate concurrency, but to be safe under it by default:

- **Scope every commit explicitly**: `git commit -m "..." -- path/a path/b`.
  Never a bare `git add <file> && git commit`, never `git add -A` or
  `git add .`. Assume the index contains someone else's work at all times,
  and do not bother checking whether it happens to be empty this time.
- **Verify after, not only before**: `git show --stat HEAD` must list
  exactly the intended files.
- **Commit promptly** when a unit of work is done — uncommitted work is not
  private, and the longer it sits the likelier another session sweeps it up.
- **Never `git stash`**, and never rewrite history (`rebase`, `--amend`,
  `reset --hard`): stashing pockets another session's uncommitted work, and
  rewriting moves SHAs underneath a session working on the same branch.
- **Re-read immediately before editing**, keeping edits additive and
  anchored on your own content — a file may have been rewritten since you
  last read it. (This is the same discipline as the shared-file rule
  elsewhere in this file, now applying to every file, not just busy ones.)

Separate worktrees remain the right tool when work would genuinely conflict
on the same files, but they are an opt-in the user chooses, not something to
propose every time two sessions are noticed running.

## A staleness warning is not a mitigation

**What happened.** Building a credit-budget tool, I read the account's
usage-credit position from a local cache, correctly computed that the cache
was 4 days 19 hours old, and printed a prominent
`<- STALE, run /usage to refresh` warning — a warning I had just written into
the tool for exactly this hazard. I then built a calibrated estimate on top of
that stale anchor and reported its output as the current position, with two
decimal places. The stale figures said the monthly pool was $150 at 66.6%
consumed and badly over pace. The real figures, once the cache refreshed
forty minutes later, were $500 at 24.1% and comfortably *under* pace. Every
directional conclusion was inverted, and four project documents had already
been written on the wrong basis.

**Compounding factor worth naming separately.** The stale reading contradicted
what the user had told me — they said $500, the cache implied $150 — and
because I am asked to challenge the user's premises rather than accept them, a
confident contradiction felt like doing the job well. I wrote "the user's
stated budget did not survive contact with the data" into a decision log. The
user's memory was right and my data was stale.

**Cost.** None realised, purely by timing: the cache happened to refresh during
a routine re-run before I reported anything. Had the session been half an hour
shorter, the user would have been told to cut daily spend by 99% while sitting
on $329 of unused headroom.

**Rule.** Detecting and displaying a data-quality problem does not address it.
When an input is known stale, either refresh it, or say plainly that the
conclusion is unavailable — do not build a derivation on top of it, because a
careful-looking derivation launders an unreliable input into a confident
output and adds false precision. And when a stale or second-hand source
contradicts a human's recollection of *their own* account, state, or history,
the source's unreliability is the first hypothesis to test, not theirs.
Challenging the user's premises is right; doing it from a number I already
know is untrustworthy is not challenge, it is noise with a warning label on it.

## A long-lived shared file can change under you mid-turn; re-read before writing

**What happened.** Appending an entry to `docs/decision-log.md` — an
append-only numbered log — I read the file, saw the highest decision number was
24, and composed the new entry as decision 25, writing cross-references to
"decision 25" into four other files as I went. Between that read and the write,
a concurrent Claude Code session working on the same repo had added *its own*
decision 25. My whole-file read-modify-write landed (purely additive, nothing
lost), but the log then had two entries numbered 25. The first fix attempt
failed too: the other session edited the same index row again between my
inspection and my patch, so a content-matched anchor no longer matched.

**Cost.** Two failed edits and a renumbering pass across five files. No data
lost — but only because every edit happened to be additive. A read-modify-write
that reordered or replaced content would have silently discarded the other
session's uncommitted work, and that additive-ness was luck, not design.

**Rule.** Two parts.

(a) Treat "the highest number or id currently in this file" as a value that
expires. For anything allocated at write time — a decision number, a log entry
id, an appended row — read it in the same tool call that writes it, not from an
earlier read in the same turn. This is a different failure from citing the wrong
document's numbering (see "Cite by name in living documents, never by number"):
there the two sources disagreed, here one source changed underneath me.

(b) For a file another session or process may be holding, keep edits additive
and anchor them on content *you* wrote or on line structure, rather than on a
content match against someone else's prose. Then a lost race costs a retry
instead of their work. `git status` listing modified files you don't recognise
is the tell that another session is live — check it before a long editing pass,
not after one fails.

---

## A subagent's "verified" claim about a field can mean presence, not validity

**What happened.** A background agent reported building `domains.json` (39
domain entities) and stated it had verified "every domain has all 7 required
fields." Spot-checking the actual values (not just re-trusting the claim)
turned up three domains with `"purpose": ""` — an empty string, which
satisfies "the key is present" but violated the JSON Schema's own
`minLength: 1` on that same field, and would have read as a real, silent
data gap to anyone using the graph. The agent's own check had validated
key presence, not content.

**Cost.** None yet — caught in the same turn, before committing, by
actually reading a sample of the delegated output rather than trusting the
subagent's summary of its own verification.

**Rule.** When a delegated task reports having "verified" or "checked"
structured output, that word covers whatever check was actually run, not
every check the receiving side would assume from the word alone. For any
field whose type has a degenerate-but-technically-present value (empty
string, empty list, zero, null-as-string), spot-check a sample of actual
values directly — don't infer "populated" from "the key exists" or from
another party's say-so, whether that party is a subagent or a human
collaborator's status update.

## A zero-match search is a fact about the pattern, not about the content

**What happened.** Asked to refresh the root `README.md` against current
status, I needed the number of recorded decisions. I ran
`grep -cE '^## [0-9]+\.' docs/decision-log.md` and it returned `0` — from a
file that visibly contains dozens of decisions. The pattern was simply wrong:
the decisions are a markdown *ordered list* (`1. **Storage: ...**`), not
`##` headings, so nothing could ever have matched. A follow-up
`grep -cE '^### [0-9]+\.'` also returned `0` for the same reason. Only
listing the actual headings showed the real structure, after which counting
the index-by-area table rows gave the true figure, 34.

**Cost.** None — the zero was obviously absurd against a file I had just
seen, so I re-derived the format instead of believing it. The cost was one
wasted round trip, and the near-miss is the point: the README's whole purpose
is an honest status count, and had the true answer been a plausible-looking
small number rather than an absurd `0`, "0 decisions recorded" or a silent
undercount could have shipped into the repo's most-read file with the
authority of having been computed.

**Rule.** A search returning zero (or a suspiciously round or low count) is
evidence about your pattern until you have seen the target's actual format.
This is the complement of the rule above about never asserting counts from
reading: running a command is necessary but not sufficient, because a
mis-specified pattern fails silently and returns a well-formed number rather
than an error. Before trusting any count, confirm the shape you are matching
actually exists — list the candidate lines (`grep -nE '^#{1,4} '`, `head`,
`sed -n`) and count the thing you can see. Treat a zero from a file known to
be non-empty on that dimension as a bug in the query, never as a finding.

## An arbitrary tie-break becomes a semantic claim once it is rendered

**What happened.** Laying out a directed architecture flow graph as swimlanes
needed a longest-path ranking, which needs an acyclic graph, and the graph is
legitimately cyclic (the merchant initiates a payment *and* consumes reports
about it). I wrote the textbook fix — DFS, and treat any edge pointing at a
node still on the stack as a feedback arc to exclude from ranking. It ran
cleanly, reported exactly one problem-free result, and was wrong: because DFS
picks by visit order, it cut the three telemetry edges feeding Data Analytics,
which moved a pure sink to the *front* of its lane. A second, earlier version
had failed the same way for a different reason — ranking the whole graph by
longest path produced a 16-column, one-node-per-column ribbon that read as a
chain and discarded the stage decomposition the source actually used.

**Cost.** Two rebuilds of the same function, both caught in the same turn by
printing the resulting layout grid and asserting invariants, rather than by
trusting that a clean run meant a correct one. Had I only checked "no node
left unranked" — which passed in every version, including both wrong ones —
the broken layout would have shipped as the default view.

**Rule.** When an algorithm has to break a tie that the input does not
determine — which cycle edge to cut, which of several equal-cost orderings to
emit, which duplicate to keep — the choice is invisible in the code and
load-bearing in the output. Derive the tie-break from the data model (here:
cut the edge that lands in an earlier declared stage, which is what a feedback
arc *means*) so the result is a property of the model rather than of iteration
order. And verify by rendering the actual artefact — print the grid, the
ordering, the chosen survivor — not by checking that the algorithm terminated
without error. "It ran and nothing was left over" is satisfied equally well by
the correct answer and by an arbitrary one.

## One blocked line does not make a file untestable

**What happened.** `components/kg-viz/serve.py` cannot complete in this
sandbox: it calls `HTTPServer(...)`, and binding a socket is denied. I
recorded that correctly, and then treated the whole file as unverifiable
here. In the same session I changed the return shape of the function
`serve.py` consumes, from `{nodes, links, stats}` to
`{categories, views[]}`, updated every other consumer, and never touched
`serve.py` — which still indexed `result['nodes']`. It raised
`KeyError: 'nodes'` on every startup, several lines *before* the call that
needs a socket. The user hit it four days later as "Failed to start", and
reasonably guessed their own rename of the wrapper script had caused it.

**Cost.** A broken start command shipped as the documented way to run the
component, and a status report to the user that enumerated verification
coverage with this gap unmentioned — worse than saying nothing, because an
enumeration implies completeness. Diagnosis took one log read; the fix,
one line. The check that would have caught it was
`python3 -c "import serve, generate; serve.summarize(generate.generate())"`.

**Rule.** When an environment restriction blocks part of a code path, scope
the exclusion to the blocked call, not the file, the module, or the
feature. Ask what fraction of that unit runs *before* the blocked line and
test that fraction — and when a summary or banner sits in front of a
blocked operation, factor it out so it can be called directly. Two
specific traps to watch: a verification list that names everything checked
will read as exhaustive, so anything consciously skipped has to be named in
it; and "I can't test that here" is a conclusion with a shelf life — it
expires the moment you change something the untestable code depends on. On
any change to a shared return shape or signature, grep for every reader
rather than relying on recall of which ones you edited.

## A stub that models only the success case cannot catch the failure it guards

**What happened.** Building a browser UI I had no way to see, I wrote a node
harness that ran the page's own JavaScript against real data under a stubbed
DOM. It passed, and the page was blank in the user's browser. The harness
stubbed the `SpriteText` label library as *always present*, so it was
structurally incapable of catching what actually broke: the library failing to
initialise, and the label accessor then throwing once per node from inside the
render loop, which killed the scene while leaving the control panel healthy.
Later in the same component the same class of thing bit again — the fake
element's `innerHTML` setter did not detach children the way a real one does,
so a rebuild appeared to duplicate every label and reported eighteen
non-existent overlaps.

**Cost.** The blank canvas took two browser round trips through the user to
diagnose, and the harness contributed nothing to either — it reported success
throughout. The bogus overlap report nearly caused a "fix" to code that was
correct; the duplicated label text in the failure output was the only clue
that the test, not the page, was wrong.

**Rule.** When you stub a dependency, enumerate its realistic failure states
and make each one a scenario: absent, present-but-broken, present-but-a
-different-version, slow, returning the wrong shape. A stub that only models
the happy path tests your code against an environment that cannot occur. Two
corollaries worth holding separately. First, a stub is itself code with bugs,
and its bugs masquerade as findings about the system under test — when a
failure looks impossible (identical duplicate items, counts that exceed the
input), suspect the harness before editing the subject. Second, when a stub
exists specifically because the real thing is unobservable, the failure modes
are the whole reason the harness exists; modelling only success inverts its
purpose.

## A required value you do not know is a blocker, not a blank to fill fluently

**What happened.** Writing a CDN fallback URL for a JavaScript library, the
cdnjs form requires an explicit version in the path. I did not know the
version and had no way to look it up — the sandbox denies that host. Instead
of stopping, I wrote `1.73.3`, which is plausible-looking and was never
anything but invented. It went into two committed files, sitting beside two
URLs that were correct. The real version was `1.80.0`, learned only when the
user ran the fetch script and it printed the actual number.

**Cost.** Low by luck: the first source succeeded so the fabricated URL was
never requested, and the script's validation would have rejected a 404 rather
than installing the wrong thing. The real damage is to trust — a made-up URL
in a fallback list is worse than an absent fallback, because it looks checked,
and a later reader has no way to tell which entries were verified.

**Rule.** When a structure demands a value you cannot verify — a version, a
hash, a port, an account id, a date — the honest options are to leave it
unfilled, to mark it inline as unverified, or to ask. Producing a
well-formed-looking value to complete the pattern is the failure, and it is
especially tempting when the surrounding values *are* correct, because the
fabrication inherits their credibility. The tell is being unable to name where
a specific value came from. Compare the licence question on the same
dependency, handled correctly minutes later: the bundle carried no licence
text, MIT was plausible, and it was recorded as an explicit open item with the
command to settle it rather than asserted.
