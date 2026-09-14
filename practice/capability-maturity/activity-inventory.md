# Architecture practice — activity inventory (first cut)

**Provenance: derived.** Every activity below is traced to the [Architecture
Practice Evolution
Roadmap](https://tyropaymentsltd.atlassian.net/wiki/spaces/ARCH/pages/2291007579/Architecture+Practice+Evolution+-+Roadmap)
(Confluence ARCH `2291007579`, Naz Chan, last modified 27 Aug 2026, fetched
2026-09-14). This is **a proposal for correction, not an assessment** — see
"Method and its known weakness" before relying on any rating.

## How to read the columns

- **Prov** — `cited` means the roadmap page names this activity (or names it
  inside a priority action or AI sub-goal). `inferred` means the page implies it
  but never states it; those rows are the likeliest to be wrong.
- **Maturity** — `X (uplift)` means the rating is inherited from the roadmap
  initiative this activity sits under. That is a **starting point to be
  overridden, not an answer** — see below. `not-assessed` means no defensible
  evidence exists yet; deliberately left blank rather than guessed.
- **AI** — which of the roadmap's six *AI-Assisted Architecture Operations
  Sub-Goals* already targets this activity. Blank means the page names no AI
  opportunity here, which is not the same as there being none.

Roadmap references: `Fwk-1…6` are Category 1 initiatives in page order,
`Ops-1…8` are Category 2, `AI-1…6` are the sub-goals table
(AI-1 drive discovery, AI-2 draft solution design, AI-3 draft sparring
submissions, AI-4 completeness checks, AI-5 sparring action summaries,
AI-6 foster architecture discipline).

## A. Demand and intake

| ID | Activity | Prov | Maturity | AI |
|---|---|---|---|---|
| A1 | Receive an architecture request | cited `Ops-1` | In flight (uplift) | — |
| A2 | Triage and prioritise the request | cited `Ops-1` | In flight (uplift) | — |
| A3 | Decide whether sparring is required | cited `Ops-3` | In flight (uplift) | — |
| A4 | Manage team capacity against demand | cited `Ops-1` | In flight (uplift) | — |

## B. Discovery and solution shaping

| ID | Activity | Prov | Maturity | AI |
|---|---|---|---|---|
| B1 | Analyse impact across domains and platforms | cited `AI-1` | not-assessed | AI-1 |
| B2 | Evaluate third-party vendor / product options | cited `AI-1` | not-assessed | AI-1 |
| B3 | Run minimum viable discovery | cited `Fwk-4` | In flight (uplift) | AI-1 |
| B4 | Author the solution architecture | cited `Fwk-4` | In flight (uplift) | AI-2 |
| B5 | Elicit and record NFRs | cited `Fwk-4` | In flight (uplift) | AI-2 |
| B6 | Delineate solution architecture from detailed technical design | cited `Fwk-4` | In flight (uplift) | — |
| B7 | Record architecture decisions (ADRs) | cited `Fwk-4`/`Ops-5` | not-assessed | AI-2 |
| B8 | Select applicable paved-road patterns | inferred `Fwk-3` | Partial (uplift) | — |

## C. Review and endorsement (sparring)

| ID | Activity | Prov | Maturity | AI |
|---|---|---|---|---|
| C1 | Prepare the sparring submission / pre-read | cited `AI-3` | not-assessed | AI-3 |
| C2 | Check artefact completeness and readiness | cited `AI-4` | not-assessed | AI-4 |
| C3 | Run the sparring forum | inferred | not-assessed | — |
| C4 | Capture sparring outcomes and actions | cited `AI-5` | not-assessed | AI-5 |
| C5 | Record and own accepted reservations | cited `Ops-4` | In flight (uplift) | — |
| C6 | Drive reservation / debt remediation to closure | cited `Ops-4` | In flight (uplift) | — |

## D. Strategic guardrails and target state

| ID | Activity | Prov | Maturity | AI |
|---|---|---|---|---|
| D1 | Maintain the enterprise domain and data model / SoR | cited `Fwk-1` | Emerging (uplift) | — |
| D2 | Assign and hold model stewardship | cited `Fwk-1` | Emerging (uplift) | — |
| D3 | Maintain the enterprise capability map | cited `Fwk-2` | Emerging (uplift) | — |
| D4 | Publish and maintain sensible defaults / paved-road patterns | cited `Fwk-3` | Partial (uplift) | — |
| D5 | Maintain each domain's target-state roadmap | cited `Fwk-5` | Emerging (uplift) | — |
| D6 | Run the monthly target-state roll-up | cited `Fwk-5` | Emerging (uplift) | — |
| D7 | Assess platform lifecycle (strategic / current / contain / retire) | cited `Fwk-6` | Partial (uplift) | — |

## E. Knowledge, capability and influence

| ID | Activity | Prov | Maturity | AI |
|---|---|---|---|---|
| E1 | Curate the architecture knowledge base | cited `Ops-5` | In flight (uplift) | — |
| E2 | Separate draft from endorsed guidance | cited `Ops-5` | In flight (uplift) | — |
| E3 | Report practice metrics and governance | cited `Ops-2` | In flight (uplift) | — |
| E4 | Track initiative-to-sparring coverage across the portfolio | cited `Ops-3` | In flight (uplift) | — |
| E5 | Onboard the wider team onto architecture practice | cited `AI-6` | not-assessed | AI-6 |
| E6 | Develop architect capability (L&D) | cited `Ops-7` | In flight (uplift) | — |
| E7 | Communicate architecture work and outcomes | cited `Ops-8` | Emerging (uplift) | — |

32 activities. A3 and E4 deliberately overlap: A3 is the per-request judgment,
E4 is the portfolio-level coverage view. `Ops-3` funds both, but they fail
differently — A3 fails as a missed engagement on one design, E4 as an invisible
gap across the portfolio.

## Method and its known weakness

The activity set was derived by reading the roadmap page's framework pillars,
priority actions and AI sub-goals and asking, of each, "what does an architect
actually *do* here". Two consequences worth stating plainly:

**An inherited `(uplift)` rating is not an activity maturity rating, and should
not be read as one.** The roadmap rates *initiatives* — uplift programmes — on
how far that uplift has progressed. `Ops-1` ("AT Jira Project as Front Door")
being `In flight` says the front-door uplift is underway with known owners; it
says nothing about how mature the underlying activity of triaging a request is
today. The two can diverge in either direction: a mature activity can have no
uplift running against it, and an `In flight` uplift usually implies the
activity it targets is *less* mature, not more. Every `(uplift)` cell is
therefore a prompt — "what is the real rating here?" — not a value to report.

**Activities the roadmap never mentions are invisible to this method by
construction.** Only two rows are marked `inferred`, which should read as a
warning rather than reassurance: it means the method reproduced the source's
own frame almost exactly. Work the practice does that Naz's page had no reason
to cover will simply be missing.

## Two things the shape already suggests

Both are observations about the *source*, which this method can support, not
findings about the practice, which it cannot.

**The day-to-day core of the practice is the part with no rating.** Seven of
the eight `not-assessed` rows sit in groups B and C — impact analysis, vendor
evaluation, ADRs, sparring preparation, completeness checks, running the
forum, capturing outcomes. That is the work itself. It is unrated not by
oversight but because the roadmap rates uplift programmes, and there is no
uplift initiative pointed squarely at "how well do we run sparring today". If
IN-563 adds one thing of its own, this is the candidate: a first defensible
rating for the activities the practice spends most of its time on.

**The named AI opportunities cluster in exactly one place.** All six sub-goals
land in groups B, C and E — artefact-heavy work with a draftable output.
Groups A (intake, triage, capacity) and D (domain models, capability map,
target-state roadmaps, lifecycle) carry none. Two readings, not yet separable:
either artefact drafting is genuinely where AI pays off first, or it is simply
the most visible opportunity and the group-D work — synthesis across domains,
dependency tracing, contradiction detection — was not examined with the same
lens. The second reading is worth testing, because group D is precisely what
this repo's knowledge graph is designed for (`docs/decision-log.md`, "why a
graph") and what program milestone 2.1 targets.

## Next

1. **Correct the activity set** with an architect's read — add what is missing,
   merge what is really one activity, delete what is not real work.
2. **Replace `(uplift)` ratings with real assessments**, activity by activity,
   against the roadmap's own five-level scale. Evidence first; `not-assessed` is
   an acceptable answer where there is none.
3. **Rate AI opportunity independently of the roadmap's sub-goal list**, so the
   group-A/group-D blind spot above is tested rather than inherited.
4. **Then, and only then**, feed the result back to decision 6's step-1
   question ("what can Claude Code add on top of Arc") — an activity-level
   maturity and opportunity read is the evidence that question has been missing.
