# Initiative → Process Map row mapping

**Provenance: derived.** Rows are from the [Architecture Capability & Process
Map](https://tyropaymentsltd.atlassian.net/wiki/spaces/AE/pages/2280227087/Architecture+Capability+Process+Map)
(Confluence `AE/2280227087`, fetched 2026-09-14). Initiatives are from Jira
project `IN` under IN-277 (fetched 2026-09-14). **The mapping and the proposed
levels are authored here and are a proposal for correction, not an assessment**
— see "What is weak here" before relying on any cell.

Level shorthand, from the page's own columns: **L1** Partial · **L2** Manually
managed · **L3** AI-assisted (human in the loop) · **L4** AI-driven (human on
the loop) · **L5** Fully autonomous.

## The Architecture-stream initiatives

| Key | Summary | Status |
|---|---|---|
| IN-562 | Foundation – PoC of Architecture agent | In Progress |
| IN-563 | Foundation – Architecture capability maturity assessment | In Progress |
| IN-564 | Foundation – AI-Validated Solution Architecture – Maturity 1 | To Do |
| IN-565 | Foundation – AI-Assisted Vendor/Product Due Diligence | To Do |
| IN-566 | AI-Augmented Solution Architecture – Maturity 2 | To Do |
| IN-567 | AI-Augmented Architecture Sparring Submission | To Do |
| IN-568 | AI-Driven Solution Architecture – Maturity 3 | To Do |
| IN-569 | AI-Driven TPP Impact Analysis and Sizing | To Do |
| IN-570 | Phase 3 - [maturity target area 5] | To Do |
| IN-571 | Phase 3 - [maturity target area 6] | To Do |

IN-570 and IN-571 are literal placeholders — the bracketed text is the summary
as it stands in Jira. Filling them is the FY27 Q3–Q4 flexibility the program
has.

## Proposed mapping

`🌟` reproduces the page's own marker. `—` means no initiative targets this row.

### Foundational Guardrails

| Row | 🌟 | Initiative | Current | Target |
|---|---|---|---|---|
| Values Alignment | | — | not-rated | — |

### Strategic Guardrails

| Row | 🌟 | Initiative | Current | Target |
|---|---|---|---|---|
| Business Capability Modelling | | — | not-rated | — |
| Technology lifecycle assessment | | — | not-rated | — |
| Strategy & Target-State Mapping | | — | not-rated | — |
| Strategic Execution Planning | | — | not-rated | — |
| Domain Definition & Boundary Modelling | | — | not-rated | — |

### Discovery & Design Guardrails

| Row | 🌟 | Initiative | Current | Target |
|---|---|---|---|---|
| Business & Product (Strategic or Initiative) Planning | | — | not-rated | — |
| Business Change Impact Analysis & Sizing | 🌟 | IN-569 | not-rated | **L4** |
| Vendor/Product Assessment & Due Diligence | 🌟 | IN-565 | not-rated | **L3** |
| Solution (or Data) Architecture Discovery & Design | 🌟 | IN-564 → IN-566 → IN-568 | not-rated | **L4** via M1→M2→M3 |
| Solution (or Data) Architecture Review & Validation | | — | not-rated | — |
| Architecture Sparring Preparation & Jamming | 🌟 | IN-567 | not-rated | L3/L4 — see gap 2 |
| Architecture Sparring | | — | not-rated | — |
| Architecture Governance | | — | draft levels exist | — |

### Execution Guardrails

| Row | 🌟 | Initiative | Current | Target |
|---|---|---|---|---|
| Sensible Defaults Maintenance | | — | not-rated | — |
| Architecture Debt Management | | — | cannot rate | — |
| Post Implementation Conformance Check | | — | cannot rate | — |
| Technology Radar | | — | proposed for deletion | — |
| Technical Excellence / Knowledge Sharing | | — | proposed for deletion | — |
| Architecture baseline refresh | | — | granularity in question | — |
| Diagram asset management? | | — | granularity in question | — |

IN-562 (PoC of Architecture agent) and IN-563 (this assessment) are deliberately
unmapped: the first is an enabler that serves several rows rather than moving
one, the second is the assessment itself.

## Three gaps the mapping exposed (one now closed)

**1. RESOLVED 2026-09-14 — IN-567's row was unstarred; the page owner added
the star.** *Architecture Sparring Preparation & Jamming* carried no 🌟 while
IN-567 ("AI-Augmented Architecture Sparring Submission") targeted exactly that
row. Kept here rather than deleted because it is the first thing this mapping
caught and fixed, which is the evidence that mapping initiatives onto rows
finds real inconsistencies — the remaining two gaps are the same kind of check
on questions that are harder to settle.

**2. Two initiative titles use vocabulary that is not on the scale, so their
target level is genuinely ambiguous.** The page's columns include `AI-assisted`
and `AI-driven`, and four initiative titles match those words exactly —
IN-565 (AI-Assisted → L3), IN-569 (AI-Driven → L4), IN-568 (AI-Driven → L4).
But **`AI-Validated`** (IN-564) and **`AI-Augmented`** (IN-566, IN-567) are not
level names. Reading them literally, M1 "AI-Validated" sits at L3 and M3
"AI-Driven" at L4 — which leaves M2 "AI-Augmented" with no level of its own.

The likely resolution is that M1/M2/M3 are *not* three levels but three
increments toward L4: breadth of coverage and trust, not a new level each. If
so, the M-ladder is finer-grained than the five-level scale and should be
stated as such rather than implying a 1:1. This is a CP2 question and the
answer changes how three initiatives get reported.

**3. The whole program sits in one theme.** All four starred rows fall in
*Discovery & Design Guardrails* — and gap 1's fix made this *more* pronounced,
not less, since the added star landed in the same theme as the other three.
**Strategic Guardrails** (5 rows), **Execution Guardrails** (7 rows) and
**Foundational Guardrails** (1 row) have no initiative at all. Two readings, not yet separable: artefact-heavy
design work is genuinely where AI pays off first, or it is simply the most
visible opportunity and the strategic rows were not examined with the same
lens. The second is worth testing, because the strategic rows — capability
modelling, domain boundaries, target-state mapping — are precisely what this
repo's knowledge graph is designed for (`../../docs/decision-log.md`, "why a
graph").

## Candidates for IN-570 and IN-571

Offered as input to CP2, **not as a proposal to act on** — filling these is a
program scope decision and needs explicit approval, per this repo's own rule on
roadmap changes. No Jira issue has been edited.

| Candidate row | Why it is a candidate | Against |
|---|---|---|
| Sensible Defaults Maintenance | Execution Guardrails, so it adds theme breadth; and it is the row this repo's `kg-content` grounding set already feeds, so the program has a head start rather than a standing start. | Pattern curation is judgement-heavy; L3 may be the realistic ceiling. |
| Domain Definition & Boundary Modelling | Strategic Guardrails; graph-shaped work (boundaries, ownership, contracts) that matches the KG design directly. | Boundary decisions are organisational, not just technical — AI leverage is less obvious. |
| Business Capability Modelling | Strategic Guardrails; the page's own description already names AI mapping initiatives and systems to capabilities. | Depends on a maintained capability model existing first. |
| Solution (or Data) Architecture Review & Validation | Natural follow-on from IN-564/566/568; design assurance reuses the same grounding. | Same theme as everything else — adds depth, not breadth. |
| Architecture Sparring | Completes the sparring chain that IN-567 starts. | Same theme; and the row lacks agreed level descriptions. |

If the goal is to test gap 3, the first three are the ones that do it. If the
goal is to compound what IN-564–568 build, the last two are cheaper.

## What is weak here

**Every `current` cell is `not-rated`, and that is deliberate.** Current state
is the one thing that cannot be derived from either source: initiative titles
give target state, and the page's level descriptions define the scale, but
neither says where the practice sits today. That read has to come from someone
who does the work. Guessing it from whether a row links to a Confluence page
would conflate "an artefact exists" with "the process is documented, owned and
repeatable", which is the actual L2 test.

**Three rows say `cannot rate` rather than `not-rated`.** Architecture
Governance, Architecture Debt Management and Post Implementation Conformance
Check have no maturity-level descriptions on the page at all — Architecture
Governance has no Description either. There is nothing to rate against, so
writing the descriptions is a prerequisite, not part of the rating.

**Target levels are inferred from initiative titles, not from initiative
descriptions.** The titles are strong evidence and the word-for-word matches
with column names are hard to argue with, but a title is a summary. The
descriptions may narrow or contradict the reading — particularly for the three
ambiguous ones in gap 2.
