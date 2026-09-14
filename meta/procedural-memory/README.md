# procedural-memory

Operational lessons from working on this project — mistakes made, and the rule that
prevents repeating them. Unlike `architecture-learning`, this is meant to change
behaviour immediately.

The content lives in three files:

- [`INDEX.md`](INDEX.md) — the cheap, mandatory-read layer: one line per
  entry, rule only, no evidence. This is what `CLAUDE.md` points at now.
- [`lessons.md`](lessons.md) — mistakes whose rule is tied to something specific
  about this project (its own documents, components, or tooling). Full detail.
- [`universal.md`](universal.md) — mistakes whose rule doesn't depend on anything
  about this project at all, and so is a candidate for manual promotion into
  another project's own procedural memory later. Full detail.

## Growth policy

Added 2026-09-14, once volume made the cost concrete: `universal.md` alone had
grown to 15 entries (~3,400 words) plus `lessons.md`'s 2 (~400 words) — a
mandatory-before-substantial-work read of well over 4,000 words, and growing
with every new lesson, none of which had ever been retired.

**The index exists so the mandatory read stays cheap regardless of how many
entries accumulate.** `INDEX.md` (rule only) is read every time; `lessons.md`/
`universal.md` (full "what happened, cost, rule" narrative) are read only on
demand — when a current situation matches a rule closely enough that the
one-liner isn't sufficient, or before writing a new entry, to check it isn't a
restatement of one that already exists. This is the same index/detail split
`architecture-learning` uses for the same reason, deliberately lighter: no
per-entry files and no `reindex.py`, because entries here are curated at write
time rather than starting as raw, unjudged capture, and volume doesn't yet
justify generation machinery.

**Keeping the index cheap is a discipline, not a one-time fix.** Any change to
`lessons.md` or `universal.md` — a new entry, a correction, a retirement — gets
its one line in `INDEX.md` added, edited, or removed in the same change. An
index that drifts from the files it summarizes is worse than no index, because
it would be trusted and wrong.

**Entries get retired, not just appended to forever.** When a correction fully
supersedes an entry's original framing (not just adds a caveat), or two entries
turn out to be the same lesson from two angles, merge or trim rather than
leaving both as permanent weight — the test is the same as for earning an
entry: does keeping the old text change a future decision, or just repeat one
the merged/corrected version already covers.

**Revisit this structure** if `INDEX.md` itself gets long enough that scanning
it stops being cheap (rough trigger: order 40-50 entries) — at that point the
two-scope split may need the same per-entry-file-plus-generated-index treatment
`architecture-learning` uses, rather than a hand-maintained index.

## The mechanism, stated honestly

A file in a repo does not change an agent's behaviour by existing. Three layers
exist here, and only two of them load automatically:

| Layer | Loads automatically | Versioned and reviewable | Holds |
|---|---|---|---|
| `CLAUDE.md` | **Yes** | Yes | The short, always-relevant rules |
| This component | No — only via the `CLAUDE.md` pointer | Yes | `INDEX.md`'s cheap rule-only summary by default; the full lesson set with its evidence (`lessons.md`/`universal.md`) only on demand |
| Claude Code session memory | **Yes** | No | A small set of direct, standing instructions the user has stated as applying in every session, regardless of project |

So the load-bearing part of this design is the pointer in `CLAUDE.md`, not the
existence of `lessons.md`. That pointer is what makes the lessons reachable at all,
and it is a *soft* guarantee — it depends on the file actually being read, unlike
`CLAUDE.md` content, which is always present. **Rules whose violation is expensive
belong inline in `CLAUDE.md`; this file is for the long tail** with its evidence and
reasoning attached.

That tradeoff is the reason for the split rather than putting everything in
`CLAUDE.md`: project instructions should stay short enough to be read every session,
and a growing lesson list with evidence would crowd out the architecture guidance
that matters more.

## Division from the other two layers

**Versus `architecture-learning`:** that component models how the *user* reasons
about architecture, is curated slowly, and has no wired-up consumer yet. This one
records how *I* got something wrong and what to do instead. Different subject,
different urgency.

**Versus `perception-failures`:** that component catalogues one specific *shape*
of mistake — an incorrect belief asserted as settled fact, usually an
overgeneralization or a stale carried-forward conclusion — structured for
eventual cross-instance comparison rather than for changing behaviour today.
Every entry there should point at a fix recorded here, not restate it; not
every entry here has that shape, so the relationship is one-directional.

**Versus session memory:** session memory is not a second master to keep in sync
with this component — that produced exactly the drift risk the line below warns
against. Instead, session memory is treated as disposable scratch: periodically
reflected on, with anything reusable distilled into `lessons.md` or `universal.md`
depending on scope, and otherwise left unmanaged. The one thing that stays solely
in session memory, by necessity rather than choice, is a small set of direct
standing instructions the user has stated as applying in *every* session
regardless of project (for example, "always challenge my ideas") — no file under
`meta/` can deliver that, since this repo's `meta/` only loads when this specific
project is open. Those are not lived experience I derived myself, so they are out
of scope for this component, not an exception living inside it.

**Do not maintain the same lesson in two layers.** Duplication drifts, and a rule
that disagrees with itself across files is worse than one stated once.

## What earns an entry

A lesson qualifies if it would have prevented real wasted effort and would apply
again. Each entry states the mistake, what it cost, and the rule — the rule alone
is not enough, because without the mistake it reads as arbitrary and gets dropped in
a later cleanup.

Deliberately excluded: one-off slips with no generalisable rule, restatements of
things any competent agent already does, and anything phrased as
self-criticism rather than as a decision procedure. The test is whether the entry
changes a future decision.

## Status

Seeded from the first sessions, honestly — including the mistakes that were
awkward to write down. That is the point of the component; a lesson list containing
only flattering entries would not be worth loading.
