# Architecture capability maturity assessment (IN-563)

**Provenance: derived.** The source of truth is the *Architecture Capability &
Process Map* Confluence page (below), which this repo does not own. What is
authored here is the mapping from AI SDLC program initiatives onto that page's
rows, the current/target maturity reads that mapping supports, and the
checkpoint plan for getting them validated. The process model itself, its
inputs/outputs and its maturity vocabulary are the page's and are referenced,
not re-decided.

## The ask

[IN-563](https://tyropaymentsltd.atlassian.net/browse/IN-563) — *"Foundation –
Architecture capability maturity assessment"*. Initiative under
[IN-277](https://tyropaymentsltd.atlassian.net/browse/IN-277) ("Uplift tools,
automation, resilience & guardrails for 5 areas"), in the AI SDLC program's
Architecture stream. Assigned to the user, In Progress since 2026-09-03.

Ticket description, verbatim:

> Mapped Architecture's capabilities — processes and activities — to produce an
> assessment of current maturity and identify opportunities for AI-enabled
> evolution.

## Source of truth

[Architecture Capability & Process
Map](https://tyropaymentsltd.atlassian.net/wiki/spaces/AE/pages/2280227087/Architecture+Capability+Process+Map)
— Confluence space `AE` ("AI Powered Delivery"), page `2280227087`, authored by
the user, a live page under active edit. Fetched via the Atlassian MCP
connector 2026-09-14.

That page already contains the working model: 21 process/activity rows grouped
into four themes, each with **Inputs**, **Process/Activity**, **Outputs**, a
**Description**, and five **Organisational Maturity Level** columns. It is not
mirrored here — a second copy would drift, which is the failure decisions 12–16
already document. What is recorded here is only what this work adds.

A second page is *related but not the source*: [Architecture Practice Evolution
- Roadmap](https://tyropaymentsltd.atlassian.net/wiki/spaces/ARCH/pages/2291007579/Architecture+Practice+Evolution+-+Roadmap)
(space `ARCH`, page `2291007579`), owned by the Head of Architecture. It is a
practice-wide transformation roadmap on its own five-level scale. Its
relationship to this work is a de-duplication problem, handled at checkpoint
CP4 in [`validation-plan.md`](validation-plan.md) — not a scale to assess
against.

## Maturity vocabulary: the AI SDLC scale, five levels

The Process Map's own columns are the scale, and they stay as they are:

| # | Level | Shape of the work |
|---|---|---|
| 1 | **Limited** | Implicit, inconsistent, dependent on individual judgement |
| 2 | **Manually managed** | Documented, owned, repeatable — done by people |
| 3 | **AI-assisted** (human in the loop) | AI drafts and checks; a human reviews every output |
| 4 | **AI-driven** (human on the loop) | AI acts continuously; humans handle exceptions |
| 5 | **Fully autonomous** (with human value) | Self-maintaining; humans govern direction and trade-offs |

This is an **AI-enablement** ladder — it measures how much of an activity is
carried by AI and where the human sits relative to the loop. That is the right
scale for this program, because the program's whole purpose is to move rows
rightward along it.

Two earlier readings were wrong and are corrected here:

- The Head of Architecture's practice scale (`Low`, `Emerging`, `Partial`,
  `In flight`, `Established`) is **not** the scale for this assessment. It
  measures how far a practice-uplift programme has progressed, which is a
  different question.
- `M1`/`M2`/`M3`, which appear in initiative titles IN-564 / IN-566 / IN-568,
  are **not** a third scale. They are the program's staged delivery of
  rightward movement for one row (solution architecture) along the five levels
  above. How exactly M1–M3 land on levels 3–5 is a CP2 question, not an
  assumption to carry.

## The legend, and what "assessment" concretely means here

The page defines three markers:

| Marker | Meaning |
|---|---|
| 🌟 | Prioritised in the AI SDLC program of work |
| Yellow background | Current state |
| Green background | Target state for this AI SDLC uplift program |

So the deliverable is not prose. It is the page itself, colour-coded: for every
row, one cell marked current and one marked target, with the starred rows
identifying what this program commits to moving. The remaining work is to
derive those two marks per row from the initiative set, and to decide which
additional rows the program should take on.

## Boundary

- **Assesses the Architecture practice's own processes.** Not Tyro's technical
  architecture — that is `components/kg-content/`'s subject. A row here ("run a
  sparring forum") is not an entity type in `kg-core`'s schema and deliberately
  does not become one; mixing practice-maturity content into the grounding set
  Arc Lite searches for solution-design questions would dilute it.
- **Does not restate the Process Map.** The page holds the rows, inputs,
  outputs and level descriptions. This directory holds the initiative mapping,
  the proposed ratings, and the validation state. If a fact belongs to the
  page, link to it.
- **No rating is invented.** A row with no defensible basis is left
  `not-rated`. A plausible-looking rating with nothing behind it is worse than
  a visible gap, because it reads as authoritative — the same discipline
  `meta/architecture-learning` enforces for its own entries.
- **Edits to the page itself are the user's call.** This directory proposes;
  the page is the artefact of record and the publish path is not automated.

## Contents

| File | What it is |
|---|---|
| [`validation-plan.md`](validation-plan.md) | The four validation checkpoints, what each asks, its entry condition, and current status. **Read this first — it is the plan of record.** |
| [`initiative-row-mapping.md`](initiative-row-mapping.md) | Proposed mapping of Architecture-stream initiatives (IN-562…IN-571) onto Process Map rows, with proposed current/target levels and the gaps the mapping exposes. |
| [`missing-row-drafts.md`](missing-row-drafts.md) | Paste-ready maturity-level text for the three rows that have none, so they can be rated at CP2. Architecture Governance drafted; two remaining. |

## Status

**Mapping drafted; no checkpoint passed** (2026-09-14).

The initiative-to-row mapping and its proposed current/target levels exist in
[`initiative-row-mapping.md`](initiative-row-mapping.md) and are a *proposal
for correction*. Progress is tracked against the checkpoints in
[`validation-plan.md`](validation-plan.md), not against a count of rated rows.
CP1 has four specific unresolved questions already sitting on the page as
inline comments, which is where the next conversation starts. One gap the
mapping found — an initiative whose row was not marked as prioritised — was
fixed on the page on 2026-09-14.

## Open questions

Most of what this area started with is now a checkpoint question with an owner
and a gate — see [`validation-plan.md`](validation-plan.md). What remains
genuinely open:

- **Who else rates maturity?** A single-assessor rating is an opinion. The
  capacity constraint recorded in `../../docs/decision-log.md` — the user is
  likely the sole person on this stream — means validation by the Head of
  Architecture narrows this but does not close it.
- **Does the mapping live here or on the page?** Right now it is here and the
  page carries only the markers. That split means the *reasoning* for a rating
  is invisible to a page reader. Decision 5's curate-in-git-publish-outward
  pattern is the obvious eventual shape, but the page is under active manual
  edit, so this is not yet a mechanism to build.
