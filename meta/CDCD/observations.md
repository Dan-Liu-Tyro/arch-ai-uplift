# Observations

Append-only raw evidence log for the Conversation-Driven Co-Design (CDCD,
working title) hypothesis — see `definition.md` for the current working
definition and comparison against vibe coding, domain-driven design, and
spec-driven design. Mirrors the raw/curated split `meta/architecture-learning`
already uses, reused as a pattern rather than merged into that component's
directory or tooling (no `reindex.py` yet — two files are enough at this
volume, revisit if that stops being true).

Format, one line each:

```
- YYYY-MM-DD · what was observed · evidence in brief · supports|contradicts:<claim>
```

Claims aren't (yet) linked to separate principle files the way
`architecture-learning`'s are — there's no index-generation tooling here yet,
so a claim tag is currently just a grouping label, not a link. Revisit if
volume ever justifies building that.

## Log

- 2026-09-11 · Widened `meta/`'s charter (decision 22) with no upfront spec
  for what `meta/` should mean — the boundary was worked out live, corrected
  once mid-conversation after being challenged, and only then written into
  `CLAUDE.md`/`component-model.md`/`meta/README.md` as a stated rule ·
  `docs/decision-log.md` decision 22 · supports:rigor-can-be-deferred-not-skipped
- 2026-09-11 · `query-service`'s wire protocol was left explicitly undecided
  rather than forced to closure, and recorded as a tracked open question
  instead · `docs/decision-log.md` open questions,
  `components/query-service/README.md` ·
  supports:rigor-can-be-deferred-not-skipped (the discipline includes
  marking what's still open, not just what's decided, as part of the
  rigor rather than a gap in it)
- 2026-09-11 · `idea-to-presentation`'s placement under `meta/` vs
  `components/` went through two rounds of challenge before landing on a
  stated, documented rule, with no prior spec dictating where it should go ·
  `docs/decision-log.md` decision 22 · supports:agent-expected-to-counter-argue
- 2026-09-11 · CDCD's own definition was worked out through several rounds of
  correction within a single conversation (mission-specificity →
  product-delivery; "isn't this vibe coding?" → "rigor mandatory, timing
  deferred") without either party stating a target definition upfront · this
  conversation · supports:shape-emerges-through-dialogue
- 2026-09-11 · Flagged, not yet resolved: this log currently contains only
  supporting evidence, gathered retrospectively from a single project's
  single session, immediately after the same session recalled
  `architecture-learning`'s own principle
  (`evidence-over-assumed-best-practice`) warning against exactly that
  pattern · this conversation · unpromoted — meta-observation about the
  log's own one-sidedness so far, not evidence for or against the CDCD
  hypothesis itself; see decision-log next step 10
- 2026-09-14 · User misread `.claude/agents/` and `.claude/skills/` as an
  unowned sibling structure at repo root; instead of confirming that
  reading, pushed back with the project's own decision history (decisions
  9/18/20/21, `components/local-agent/README.md`) showing both are
  already-decided local-agent artifacts placed at repo root only because
  that's where Claude Code's harness scans for them — then closed the
  actual gap found in passing (CLAUDE.md's `Layout` section never listed
  either path) · this conversation, `CLAUDE.md` Layout section ·
  supports:agent-expected-to-counter-argue
- 2026-09-14 · Asked to record a note in `architecture-learning`, declined
  that literal placement because it contradicts that component's own
  twice-stated charter ("models the user's reasoning," not mine), proposed
  `CDCD` instead with reasoning, then asked rather than deciding
  unilaterally which of three options to use given it also required
  widening CDCD's own stated in-scope list · this conversation,
  `meta/CDCD/README.md`, `meta/CDCD/control-layers.md` ·
  supports:agent-expected-to-counter-argue
- 2026-09-15 · First time the user invoked CDCD by name themselves to justify
  a live method choice, rather than the agent naming an already-observed
  pattern after the fact: told, mid-ingestion of a 39-domain Confluence page
  into `kg-content`, to drop full field-by-field transcription for "the
  essence of CDCD" — a first lean pass sized to the immediate use case,
  reviewed/expanded/refactored later — after the agent had already pushed
  back once on ingesting the full domain set (arguing for a small
  pressure-test slice) and been overridden with a concrete downstream
  reason (a reward-initiative evaluation needing the complete set) ·
  this conversation, `docs/domain-model-experiment.md`,
  `components/kg-core/SCHEMA.md` `domain` entry · supports:rigor-can-be-deferred-not-skipped
  (the deferred parts — relationship keys, full field transcription — were
  written down as open questions, not silently dropped)
