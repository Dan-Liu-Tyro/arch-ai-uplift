# 05 - Ignore List

Pages to exclude from any live Confluence search, even if they look
topically relevant to the question asked — a different judgment from
`kg-content`'s status vocabulary (`draft`/`active`/`deprecated`/
`superseded`, see `components/kg-core/SCHEMA.md`), and deliberately kept
as its own file rather than a value in that vocabulary. Being ignored
says nothing about whether a page's content is right or wrong; it says
the page itself is not a fit source (stale draft, scratch note, personal
working page, etc.).

Checked by `.claude/agents/arc-lite.md`'s working protocol, step 3, after
a live search and before any citation.

| id | title | source | reason |
|---|---|---|---|

None yet. Add entries only for real, verified pages, with a concrete
reason — this file grows by evidence of an actual bad result, not by
anticipation, the same discipline `kg-content` entities are curated
under.
