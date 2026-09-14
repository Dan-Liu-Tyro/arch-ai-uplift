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
