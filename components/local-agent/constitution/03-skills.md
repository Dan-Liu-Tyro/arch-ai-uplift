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
  answers identity questions about Arc Lite itself ("what's your name,"
  "who are you"), grounded on `00-soul.md`. Added first and deliberately
  minimal, to prove native-skill wiring end to end before adding a skill
  with real architecture-grounding stakes.
  - **Not yet invokable.** `.claude/agents/arc-lite.md`'s `tools:` line
    does not grant `Skill` yet — that grant is left to a human hand
    deliberately (see that file's own note on why), so this skill exists
    but Arc Lite cannot call it until a human adds `Skill` to the tools
    list.

Add a skill here only once a repeated task pattern actually justifies
one, per `least-infrastructure-first` in `meta/architecture-learning`.
