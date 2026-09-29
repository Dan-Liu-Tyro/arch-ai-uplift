# architecture-learning

An accumulating, evidence-based model of how one architect reasons — built from
working on this project, and built on a specific epistemic stance: no position
recorded here is treated as settled. Each one is a hypothesis or a preference,
tracked individually over time, and revised or abandoned when evidence says so. See
[`principles/evidence-over-assumed-best-practice.md`](principles/evidence-over-assumed-best-practice.md)
for the reasoning — the position that "there is usually a best practice, but it's
unclear whether it's visible in advance" is itself the entry that governs how every
other entry is written.

**Deprioritised on the consumption side**, by explicit instruction: no consumer is
wired up, and it should not absorb a turn for its own sake. But recording continues
as conversations happen, because the evidence is only capturable while it is fresh.

## Structure

```
INDEX.md                generated routing table — the only file read on a normal session
observations.md         append-only raw capture, one line per observation
principles/             one file per principle, carrying its own evidence
reindex.py              regenerates INDEX.md from principle frontmatter
extract_transcript.py   condenses a session transcript for audit/backfill
```

## Why split, and why not for the reason you might expect

The single-file version cost ~2,200 tokens to read, which is nothing. Projected to
100 entries it would be ~22,000 — real, but a future problem. **Token cost is not
the strongest argument for splitting today.** Two structural facts are:

**Evidence accumulates far faster than principles do.** After many sessions there
may be a hundred observations behind a dozen principles. A flat file mixes the
high-volume, low-judgement stream with the low-volume, high-judgement conclusions,
so both get harder to work with: capture feels heavyweight, and the principles get
buried in their own supporting material.

**Capture and curation want different costs.** Capturing should be nearly free, or it
won't happen mid-conversation and the evidence is lost. Promotion should be
deliberate, because a principle asserted from one weak instance is exactly the
projection this component exists to avoid. One file forces both through the same
gate; two layers let each have its own.

The token saving is real and follows from getting that structure right — it is the
consequence, not the motive.

## The access pattern this is designed around

Every session asks one question: *the user just did or said X — is that new evidence
for an existing principle, a new principle, or not durable?*

Answering it needs the **statements** of existing principles and none of their
evidence. So:

| Operation | Reads | Cost today |
|---|---|---|
| Capture an observation | nothing — shell append | ~0 |
| Decide new vs. existing | `INDEX.md` only | ~550 tokens |
| Add evidence to a principle | one principle file | ~250 tokens |
| Promote an observation | `INDEX.md` + write one file | ~700 tokens |
| Export everything to a consumer | all principle files | ~2,200 tokens, and only when exporting |

Compare the flat file, where every one of those cost a full read. The index is 4×
cheaper than the old file *already*, at only ten principles.

## Hypotheses, not conclusions

Every entry is one of two **forms**:

- **`hypothesis`** — a testable belief about what will work. Can be reinforced by
  repetition, and genuinely *contradicted* by an outcome that goes the other way.
  "Curation over accumulation" predicts something checkable: does the review gate
  actually catch bad content, or get bypassed under pressure?
- **`preference`** — a stated value with no outcome to check. "Decisions are
  artifacts" isn't refuted by any future event; it can only be abandoned if the
  user later says they no longer want it. Preferences still move — `abandoned`
  replaces `refuted` for this form — but nothing "disconfirms" a preference the way
  an outcome disconfirms a hypothesis.

Conflating the two produces exactly the failure the tracking system exists to
avoid: treating a taste as if it had been tested, or treating a tested belief as if
it were merely a taste.

Every entry also carries a **status**, which is the thing that is actually allowed
to change as evidence comes in:

| status | means |
|---|---|
| `active` | One instance so far. Not yet tested again. |
| `reinforced` | Repeated supporting evidence, no contradiction. |
| `contested` | Both supporting and contradicting evidence exist. |
| `revised` | Superseded by an updated version of the same position — kept, not deleted, for the record. |
| `abandoned` | Evidence, or a later statement, undermined it enough that it's no longer held. |

**The bar for creating a principle file is low; the bar for calling it `reinforced`
is not.** Write one down the first time an observation looks worth watching, even
from a single instance — that's what `status: active` means. Repetition earns
`reinforced`. Confidence language (`strong`/`moderate`) is gone; it invited exactly
the premature certainty this redesign exists to remove.

## Working practice

1. **During a conversation**, append to `observations.md`. One line, no ceremony.
   Do not stop to decide whether it matters.
2. **When an observation looks worth tracking**, read `INDEX.md`. If it agrees with
   an existing principle, open that file, add a `- **Supports.**` bullet, and
   increment `support` in its frontmatter. If it disagrees, add a
   `- **Contradicts.**` bullet, increment `contradict`, and update `status` to
   `contested` (or `revised`/`abandoned` if the disagreement is decisive) — do not
   leave a contradicted principle at `active`/`reinforced`; `reindex.py` will refuse
   to build if you do. If it's genuinely new, write a new principle file at
   `status: active`.
3. **Append a line to that file's `## Status history`** whenever status changes,
   with the date and a one-line reason. This is the literal timeline the tracking
   exists to produce.
4. **Run `python3 meta/architecture-learning/reindex.py`** after any frontmatter or
   heading change. The index is generated so it cannot drift, and it refuses to
   build if contradicting evidence isn't acknowledged in `status` — see the module
   docstring.
5. **Mark the observation** with `supports:<id>` or `contradicts:<id>`, or leave it
   `unpromoted`. Unpromoted is the honest default.

## Audit and backfill from transcripts

Live capture (above) is the default and should stay near-zero-cost. This is the
deliberately separate, occasional counterpart: a detached pass over past session
transcripts to catch what live capture missed, run whenever, decoupled from
whatever task is active in the current session.

**Source.** Claude Code writes one `*.jsonl` transcript per session to
`~/.claude/projects/<slugified-project-path>/*.jsonl` — the same files
`meta/token-tracking/summarize.py` already reads for cost data. The slug is the
absolute repo path with `/` replaced by `-`; for this repo that directory was
`-Users-bliu-code-claude-workspace-arch-knowledge-graph` up to the
`arch-ai-uplift` rename (decision 29 and its follow-up in
`docs/decision-log.md`), and is
`-Users-bliu-code-claude-workspace-arch-ai-uplift` from that point on. Verified
present 2026-08-19, pre-rename: four files, dating back to this project's first
session on 2026-08-17.

**This rename is the concrete instance the "directory name is derived from
the repo's absolute path" caution under "Things to watch out for" below was
written in anticipation of.** Sessions and memory from before the rename are
filed under the old slug and won't show up under the new one — see that
caution for what to do about it.

**Process.**
1. List the transcripts in that directory. Each filename is a session UUID with
   no human-legible summary — use `ls -la` for dates/sizes as a first filter, and
   expect to open a few to identify which ones matter.
2. Run `python3 meta/architecture-learning/extract_transcript.py <path>` per
   transcript. This strips tool payloads, `thinking` blocks, and sidechain
   (subagent) traffic by default, leaving only the user/assistant dialogue —
   read this output, not the raw transcript.
3. Read the extract against `INDEX.md` (not the principle files) the same way a
   live observation would be checked: new evidence for an existing principle, a
   new principle, or genuinely not durable.
4. Backfill into `observations.md` and the relevant principle file(s) exactly as
   the live working-practice steps above describe, then `reindex.py`.

**Things to watch out for.**
- **Cost is real here, unlike live capture.** Reading and interpreting a
  transcript after the fact costs input and reasoning tokens; there is no free
  shell-append step. Batch this rather than running it per session.
- **Retention is unverified, not guaranteed.** All that's confirmed is that four
  files exist today going back to project start. There's no known rotation or
  cleanup policy for `~/.claude/projects/`, so an audit run today may not be able
  to reach sessions that were possible to audit last week — treat this as
  best-effort recovery of whatever still exists, not a permanent archive to rely
  on for anything durable.
- **The directory name is derived from the repo's absolute path.** If the repo is
  ever moved or renamed, its slug changes and older transcripts stay filed under
  the old slug — an audit that only looks at the current project's directory
  will silently miss them. Check for other `-Users-bliu-...` directories whose
  name is a plausible earlier path if a gap in history is suspected.
- **Sidechain (subagent) messages are excluded by default.** `extract_transcript.py`
  drops any record with `isSidechain: true` unless run with
  `--include-sidechains`. Subagent work can contain genuine evidence too, but
  mixing it into the primary dialogue by default made early testing harder to
  read.
- **Cross-check before writing.** Several existing `observations.md` entries were
  already backfilled from these same early sessions when this component was
  first built. Check an extract against existing entries before adding — the
  goal is to catch what's missing, not to duplicate what's already there.

**Findings from the first real audit (2026-08-19, three transcripts).**
- **Line count is a poor proxy for dialogue volume.** One 2.9MB/17,475-line
  extract had only 35 user turns; the rest was one long single-turn agentic
  span with no user input in between (visible as a large gap between
  `grep -n "^--- user ---$"` line numbers). In that case the bulk of it was
  reference material (Claude API/SDK docs, pulled in while pricing the
  token-tracking cost model) rather than project dialogue. Grep for the user
  markers first and read around them; don't read a large extract linearly.
- **A session's file mtime is not its conversation date, and sessions can run
  concurrently.** Two transcripts here had messages nine minutes apart asking
  Claude, in different words, to take over git operations going forward —
  they were separate Claude Code sessions (likely separate terminal tabs)
  active at the same time, not two independent occasions. Treat near-
  simultaneous echoes like this as one data point, not two reinforcing
  instances, or repetition counts get inflated by concurrency rather than by
  real repeated evidence.
- **Per-message `timestamp` (raw JSONL field) can disagree with the dates
  already recorded in `observations.md` by about a day**, even after
  adjusting for a plausible local timezone offset — the existing log appears
  to have been dated somewhat loosely during the initial backfill rather than
  from a strict per-message timestamp lookup. When backfilling further
  evidence from the same narrative stretch, matching the date already used by
  the nearest existing entry kept the log internally consistent; chasing the
  literal timestamp on its own would have introduced new inconsistency rather
  than fixing the old one.

## Frontmatter

```yaml
---
id: curation-over-accumulation      # matches filename stem
kind: architectural | working       # subject matter: substance vs. process
form: hypothesis | preference       # epistemic status — see above
status: active | reinforced | contested | revised | abandoned
type: stated | inferred             # said outright, or observed from choices
support: 2                          # count of supporting evidence items
contradict: 0                       # count of contradicting evidence items
updated: 2026-08-18
---
```

`reindex.py` fails loudly on a missing field, and on a `contradict > 0` /
`status: active` mismatch, rather than emitting a partial or dishonest index.

Deliberately **not** the KG schema from `components/kg-core/SCHEMA.md`, even though
the shapes are close. Using it here would be a cheap way to pressure-test that schema
against real content without touching org material — worth doing, but as a decision
taken on purpose, not by drifting the two formats together.

## Two things this must not become

**Do not merge into `kg-content`.** That holds Tyro's canonical architecture
knowledge and publishes to Confluence for others to rely on. This holds one person's
style. Merging would promote personal preference to organisational canon.

**Do not optimise for agreement.** A profile that only reproduces conclusions is a
cache, and a perfectly aligned model cannot challenge its subject — which is the
explicit requirement here. So principle files record *how* a decision was reached,
and status-history entries that describe a challenge-and-reaffirm episode (e.g.
`curation-over-accumulation.md`) are the highest-value content, because they show
which arguments actually land.

## Evolution is tracked twice, on purpose

`## Status history` inside each file is the curated, human-readable timeline —
short, dated, one line per status change, written to be read without opening git.
`git log --follow principles/<file>` is the complete, uncurated version of the same
thing, with full diffs and authorship, and it is free. The two are not redundant:
the status history is what you read to understand *why* a position moved; git is
what you read to see *exactly what changed* if the summary isn't enough. `updated`
in frontmatter exists only so the index can be sorted, not as a substitute for
either.

## Division from the other meta components

`procedural-memory` records **my** operational mistakes and takes effect immediately
via a `CLAUDE.md` pointer. This component models **the user's** reasoning and has no
consumer yet. `perception-failures` also records something about **my** own
failures, like `procedural-memory`, but narrower and slower: only the specific
shape where a belief was asserted as settled and was wrong, kept unpromoted
until enough instances exist to compare, in service of eventual synthesis
rather than immediate correction. Session memory holds only what the user
stated or corrected directly. Same lesson never lives in two of these four.
