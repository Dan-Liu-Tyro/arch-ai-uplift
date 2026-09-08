# procedural-memory

Operational lessons from working on this project — mistakes made, and the rule that
prevents repeating them. Unlike `architecture-learning`, this is meant to change
behaviour immediately.

The content lives in two files, split by scope:

- [`lessons.md`](lessons.md) — mistakes whose rule is tied to something specific
  about this project (its own documents, components, or tooling).
- [`universal.md`](universal.md) — mistakes whose rule doesn't depend on anything
  about this project at all, and so is a candidate for manual promotion into
  another project's own procedural memory later.

This mirrors the raw/promoted split `architecture-learning` already uses, but
without that component's index-and-reindex machinery: at this component's current
size (ten entries total), a plain two-file split is enough, and each entry is
already curated at write time rather than starting as a raw, unjudged capture.
Revisit if either file grows enough that finding an entry gets slow.

## The mechanism, stated honestly

A file in a repo does not change an agent's behaviour by existing. Three layers
exist here, and only two of them load automatically:

| Layer | Loads automatically | Versioned and reviewable | Holds |
|---|---|---|---|
| `CLAUDE.md` | **Yes** | Yes | The short, always-relevant rules |
| This component | No — only via the `CLAUDE.md` pointer | Yes | The full lesson set with its evidence, split project-specific vs. universal |
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
