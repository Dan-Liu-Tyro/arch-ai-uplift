# Control layers: what actually drives Claude's behaviour here

Factual reference, not evidence or hypothesis — this describes the mechanism
that makes the CDCD pattern possible, the way a definition of "conversation"
would need to name the channel before `definition.md` can claim something
about it. Written 2026-09-14, prompted by the user asking directly what made
a specific pushback happen and where the "insight" formatting comes from —
tracing the answer required naming layers that had never been written down
together before, even though each one individually was already in use.

## The four layers, highest precedence first

1. **Org-level instructions.** Set by the org admin, injected into every
   session regardless of which repo is open, and not visible in any file in
   this repo — there is nothing to `grep` for. Always overrides everything
   below it when the two conflict. Covers things like "AI tools must not
   access production environments" and language/tooling standards.
2. **Project `CLAUDE.md`.** Committed and versioned in this repo, loaded for
   anyone (or any session) working in it. Governs working conventions
   specific to this project — e.g. "Challenge ideas rather than agreeing,
   especially at planning stage," the stewardship model, the `meta`/
   `components`/`practice` split. Visible to a teammate who clones the repo;
   changes here are reviewable the same way any other doc change is.
3. **Personal cross-session memory.** Files under
   `~/.claude/projects/<slugified-repo-path>/memory/`, written by Claude and
   read back into every future session for this user. Not git-versioned, not
   visible to a teammate, and — despite the per-repo directory name — meant
   to carry preferences that apply across *any* project this user works on
   with Claude, not just this one (e.g. `be-a-challenging-thinking-partner.md`,
   `git-management-delegated.md`). A "pinned" memory (up to four) is injected
   into every conversation; others are retrieved when relevant.
4. **Output style / local CLI settings.** e.g. `.claude/settings.local.json`
   in this repo currently sets `{"outputStyle": "Explanatory"}`, which is what
   produces the `★ Insight` boxes. This layer shapes *presentation* —
   formatting, verbosity, explanatory asides — never substance or decisions.
   It is a Claude Code CLI feature, orthogonal to the other three; a repo
   with no `CLAUDE.md` at all would still show insight boxes if this setting
   were on.

## Why this matters for CDCD specifically

CDCD's subject is the collaboration pattern's mechanics — how the agent comes
to push back, defer rigor, or co-design rather than execute a spec. This is
the substrate that pattern actually runs on: layer 2 is where "challenge
ideas rather than agreeing" is stated as a working convention *for this
project*, and layer 3 restates the same rule as a *personal* standing
preference of this user's, independent of project. The pushback observed in
this project's history so far has always had both active at once; no
instance yet isolates which one alone would have been sufficient.

## Open question, not resolved here

The user has floated generalizing these layers — today scattered across
per-repo `CLAUDE.md`, per-user `~/.claude/` memory, and per-repo CLI settings
— into something explicitly reusable across other projects, sessions, or
users, if this project's experience shows that's worth doing. That is a
capability question, not a record of what happened, so it's tracked in
`docs/backlog.md` rather than here — this file only names the current,
un-generalized state as it exists today.
