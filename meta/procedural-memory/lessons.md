# Procedural Lessons (project-specific)

Mistakes made on this project whose rule is tied to something specific about
it — this repo's own documents, components, or tooling — rather than a rule
that would hold in any project. See [`README.md`](README.md) for what earns
an entry, and [`universal.md`](universal.md) for the sibling file holding
lessons whose rule turned out to generalize. Most of what was originally
recorded in this file moved there on 2026-08-26; see that file's header for
why.

Seeded 2026-08-17.

---

## Append architecture-learning observations as they happen, not on request

**What happened.** `architecture-learning/README.md` specifies that observations get
appended to `observations.md` during the conversation, at near-zero cost, without
stopping to decide whether they matter. Across a session containing several
qualifying moments (a dashboard deferred to backlog with a named trigger, a request
that project decisions live in the repo rather than in memory), none were captured
until the user pointed out the component should be "conversationally aware" — at
which point I had to reconstruct them from earlier turns instead of catching them
live.

**Cost.** None yet, since reconstruction from the same session was still possible.
The cost would be real in a longer session, or once memory of the conversation
fades.

**Rule.** When a conversation touches this project, treat a one-line
`observations.md` append as part of finishing that turn — the same way a decision
gets written to `decision-log.md` in the turn it's made — not a step that waits for
a reminder.

---

## Two documents can number "decisions" differently — check before citing by number

**What happened.** An earlier session cited "decision 3" to mean the
Confluence-as-output decision. That number came from `CLAUDE.md`'s informal
four-item summary, not from `docs/decision-log.md`'s actual numbered list, where
the same decision is **5** (decision 3 there is the components-not-one-application
one). I copied "decision 3" into two freshly-written files this session, right
after having read the existing "cite by name, never by number" rule (see
`universal.md`) — the general rule was in view and I still applied a number from
the wrong document.

**Cost.** Two files committed with a wrong cross-reference, caught only because
the user asked what "decision 3" actually was.

**Rule.** When a decision appears in both `CLAUDE.md`'s prose summary and
`decision-log.md`'s numbered list, the two numbers are not guaranteed to match —
they're independently maintained. Quote the decision's name, not a number, from
either document. If a number is unavoidable, verify it against
`docs/decision-log.md` specifically, since that is the canonical numbered list.

---

## `PAGE_REVISION` only works as a staleness signal if it is actually bumped every time

**What happened.** `components/kg-viz/src/state.js` carries a comment stating
its own convention plainly: "Bump this on any edit to this file" — `PAGE_REVISION`
exists specifically so a stale browser-cached `file://` page is distinguishable
from a genuine fix that did not work, a problem this component had already hit
more than once. Across a session that shipped a real feature (a "Load default"
button) and several file renames touching `state.js`'s own file and its
neighbours, `PAGE_REVISION` was bumped once early on and then left unchanged for
every subsequent edit. When the user later reported a rendering symptom (missing
stage bands) and I checked the screenshot's revision string against the repo, it
matched — but that match was meaningless: it would have matched an old cached
page just as well as the current one, since the string had not changed either
way. The one signal built to make that distinction stayed silent through the
exact situation it exists for.

**Cost.** Lost the ability to use the component's own designed diagnostic at the
moment it was needed; had to reason about cache-vs-bug from code inspection alone
instead of a five-second string comparison.

**Rule.** Treat `PAGE_REVISION` as part of the diff for *any* change under
`components/kg-viz/src/`, not just the one that happens to prompt a rebuild —
bump it in the same edit, every time, even for a change that feels unrelated to
rendering. A convention stated once in a comment does not enforce itself; only
actually following it on every edit does.
