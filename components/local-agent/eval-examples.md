# Eval Examples

Real question/answer/quality-assessment records used for comparing Arc
Lite's grounded-vs-ungrounded behavior against the real Arc's own answer
quality — evidence *about* answer quality, not architecture guidance
itself, which is why these don't live in `components/kg-content/` (see
`docs/decision-log.md` decision 21). Migrated here from Arc Lite's
retired `constitution/02-canonical-sources.md`, where they were tagged
`reference-example` / `insufficient-evidence` — explicitly *not* facts to
ground an answer on.

`docs/program-roadmap.md` flags these same three experiments (this file
holds two of the three; the third became `kg-content`'s first entity) as
a promising, uninvestigated lead toward the AKB's 50+-question Golden
Evaluation Set — real, Tyro-specific architecture Q&A with a quality
assessment attached, rather than something that has to be authored from
scratch. Treat additions here as candidate material toward that set.

| id | title | status | source | note |
|---|---|---|---|---|
| sparring-experiment-2026-08-04 | Does this design need sparring? | reference-example | https://tyropaymentsltd.atlassian.net/wiki/spaces/AE/pages/2210988256 | Arc identified real architectural shifts (SDD, AuthN changes) and gave a 7/10 answer, but misidentified the submission role — a real example of partial-quality Arc output, not a fact to ground on. |
| prd-readiness-2026-07-31 | PRD Readiness Analysis (Experiment 1) | insufficient-evidence | https://tyropaymentsltd.atlassian.net/wiki/spaces/AE/pages/2201649268 | Strong on strategic context, but missing specific business-rule detail (e.g. auto-write-off thresholds) — the PRD itself flags this gap; not a clean answer to ground on. |

Add entries here only for real, verifiable references — the same
discipline `kg-content` entities are curated under.
