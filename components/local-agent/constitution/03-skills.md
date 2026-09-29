# 03 - Skills

The real Arc's skill index matches enabled workflows to tasks, loaded
dynamically from Confluence pages by ArchWorker. Arc Lite deliberately
does not mirror that mechanism: a native Claude Code Skill
(`.claude/skills/`) is git-versioned and PR-reviewable, with no live
Confluence dependency, matching this project's own decisions 2 and 3
(git as source of truth; Confluence as output, never input) rather than
reintroducing the dependency those decisions argue against. See decision
18 in `docs/decision-log.md`.

- **`arc-lite-identity`** (`.claude/skills/arc-lite-identity/SKILL.md`) —
  answers "tell me about your name" / "why Arc?" questions. Ported
  verbatim from Arc's real "Skill - Tell Me About Your Name" (Confluence
  ARCH space, page `2005434483`, canonical source page `1998749707`'s
  "About my name" section). **Deliberate, scoped exception:** for this
  skill only, answers as Arc, in first person, with no "I'm Arc Lite, not
  the real Arc" disclaimer — every other skill and every other answer
  keeps that disclaimer per `.claude/agents/arc.md`'s Identity
  section. Recorded as decision 19 in `docs/decision-log.md`; re-check
  that scoping before adding a second skill.
  - **Invokable.** `.claude/agents/arc.md`'s `tools:` line grants
    `Skill` (decision 20). A skill-sourced answer is cited as
    `{"source": "skill", "name": "arc-lite-identity"}` per the
    answer-format contract in `arc.md` — its own dedicated citation
    shape, not a `kg-content` id/status improvised to fit.

Add a skill here only once a repeated task pattern actually justifies
one, per `least-infrastructure-first` in `meta/architecture-learning`.
