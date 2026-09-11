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
