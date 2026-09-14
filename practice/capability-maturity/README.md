# Architecture capability maturity assessment (IN-563)

**Provenance: derived.** Built here from Naz Chan's Architecture Practice
Evolution roadmap (cited below), which this repo does not own. What is authored
here is the activity layer beneath that roadmap and the AI-opportunity mapping
onto it; the framework pillars, initiative set and maturity vocabulary are the
roadmap's and are quoted, not re-decided.

## The ask

[IN-563](https://tyropaymentsltd.atlassian.net/browse/IN-563) — *"Foundation –
Architecture capability maturity assessment"*. Initiative under
[IN-277](https://tyropaymentsltd.atlassian.net/browse/IN-277) ("Uplift tools,
automation, resilience & guardrails for 5 areas"), in the AI SDLC program's
Architecture stream. Reported by Erini Sadek, assigned to Dan Liu, In Progress
since 2026-09-03.

Ticket description, verbatim:

> Mapped Architecture's capabilities — processes and activities — to produce an
> assessment of current maturity and identify opportunities for AI-enabled
> evolution.

## Source of truth

[Architecture Practice Evolution -
Roadmap](https://tyropaymentsltd.atlassian.net/wiki/spaces/ARCH/pages/2291007579/Architecture+Practice+Evolution+-+Roadmap)
— Confluence ARCH space, page `2291007579`, authored by Naz Chan (Head of
Architecture), last modified 27 Aug 2026. Fetched live via the Atlassian MCP
connector 2026-09-14.

That page is the authority for anything it covers. It is **not** mirrored in
full here on purpose — a second copy would drift, which is the failure decisions
12–16 already document. What is recorded here is only what this work adds, plus
the minimum quotation needed to make the additions readable.

## What the roadmap already covers, and what it doesn't

Naz's page already does a substantial part of what IN-563 asks for, at the
**framework-pillar and initiative** altitude:

- Two categories — *Architecture Practice Maturity (The Framework)* and *Team
  Operations Uplifts (The Engine)* — with 15 initiatives between them.
- A maturity rating, priority action, business value, rank and
  rationale/evidence per initiative.
- A five-level maturity vocabulary (below), explicitly framed as guiding
  prioritisation, "not to judge team performance".
- A six-item *AI-Assisted Architecture Operations Sub-Goals* table: drive
  discovery, draft solution design, draft sparring submissions, completeness
  checks, sparring action summaries, foster architecture discipline.

What it does not contain is the layer IN-563's own wording names —
**processes and activities**. The page rates *initiatives* ("Sensible Defaults
and Default Patterns", "AT Jira Project as Front Door"), which are uplift
programmes, not the things architects actually do day to day. There is no model
of the work itself: intake a request, run discovery, author a solution
architecture, prepare and run sparring, record a decision, chase a reservation
to closure.

**That activity layer is what this area produces**, rolling up to Naz's pillars
rather than competing with them. It matters beyond the ticket because it is also
the missing input to this repo's own longest-open question — decision 6's step 1,
*"what can Claude Code add on top of what Arc already provides?"*, which is
currently answered by guesswork. An activity model carrying a maturity read and
an AI-opportunity read per activity answers it from evidence.

## Maturity vocabulary: reuse, do not invent

Two maturity vocabularies are already in play in this stream, and a third would
make that worse rather than better:

1. **Naz's five-level practice scale** — `Low`, `Emerging`, `Partial`,
   `In flight`, `Established`. Assesses how well a *practice element* is
   understood, adopted, evidenced and operationalised.
2. **The M1/M2/M3 solution-architecture maturity ladder** — from slide 26 of
   the CTB pack and IN-564/AIDLC-117. A capability *delivery ladder* for one
   specific capability, not a practice-wide assessment scale. Decision 15 in
   `../../docs/decision-log.md` already flags that it does not appear in
   `docs/program-roadmap.md`'s own milestone language.

**This work uses vocabulary 1**, because IN-563 is a practice-wide assessment
and that is what scale 1 measures. M1/M2/M3 stays scoped to the
solution-architecture capability it was defined for.

That reasoning was made here and has **not** been confirmed with Naz, so the
choice is provisional pending checkpoint CP1 in
[`validation-plan.md`](validation-plan.md) — "are these the right maturity
levels?" is one of the two questions that checkpoint exists to ask, precisely
because rating 32 activities on the wrong scale is the most expensive mistake
available here.

## Boundary

- **Assesses the Architecture practice's own processes.** Not Tyro's technical
  architecture — that is `components/kg-content/`'s subject. A capability here
  ("run a sparring forum") is not an entity type in `kg-core`'s schema and
  deliberately does not become one; mixing practice-maturity content into the
  grounding set Arc Lite searches for solution-design questions would dilute it.
- **Derives, does not re-decide.** Where Naz's page has rated something, that
  rating is inherited and cited, never silently re-rated here.
- **No maturity rating is invented.** An activity with no defensible evidence
  is marked `not-assessed`. A plausible-looking rating with nothing behind it is
  worse than a visible gap, because it reads as authoritative — the same
  discipline `meta/architecture-learning` enforces for its own entries.
- **Publishing back to Confluence is not in scope yet.** Decision 5's pattern
  (curate in git, generate outward) is the obvious eventual shape, but Naz owns
  the target page, so that is a conversation, not a mechanism to build
  unilaterally.

## Contents

| File | What it is |
|---|---|
| [`validation-plan.md`](validation-plan.md) | The three validation checkpoints Naz's review forms, what each asks, what must be true to run it, and current status. **Read this first — it is the plan of record for this area.** |
| [`activity-inventory.md`](activity-inventory.md) | First-cut activity model. Every row marked `cited` or `inferred` against the roadmap page; maturity inherited where an activity maps to a rated initiative, `not-assessed` otherwise. |

## Status

**Draft activity inventory, awaiting checkpoint CP1** (2026-09-14).

`activity-inventory.md` exists and is structurally complete — 32 activities in
five groups — but it is a *proposal for correction*, not an assessment. Most
rows carry inherited `(uplift)` maturity or `not-assessed`, and the activity set
itself is derived from one Confluence page plus this repo, not from observing
the practice or talking to the other architects.

Progress is tracked against the checkpoints in
[`validation-plan.md`](validation-plan.md), not against a percentage of rows
filled in. CP1 is **not ready**: it needs inputs and outputs modelled per
activity first, because "are the inputs/outputs correct?" is half of what it
asks, and because the structural checks that narrow the completeness question
are impossible without them.

## Open questions

Three of the questions this area started with are now *checkpoint questions*
rather than open questions — they have an owner (Naz), a gate they are asked
at, and a place their answer gets recorded. See
[`validation-plan.md`](validation-plan.md): "is the activity set complete, and
are the inputs/outputs right" and "is the maturity scale right" are CP1; "how
does this land relative to Naz's page" is CP3.

What remains genuinely open, because no checkpoint resolves it:

- **Who else rates maturity?** A single-assessor rating is an opinion. The
  roadmap page's own framing ("guide prioritisation, not judge team
  performance") suggests this wants more than one architect's input, but the
  capacity constraint recorded in `../../docs/decision-log.md` — the user is
  likely the sole person on this stream — cuts against that. Naz validating a
  rating is not the same as a second architect producing one independently, so
  CP2 narrows this but does not close it.
- **How are inputs and outputs modelled?** Adding two columns to a 32-row table
  makes it very wide, and most cells would be `inferred`, which inflates the
  artefact's apparent authority — the failure the inventory already warns
  about. A separate activity-flow view is the alternative. Undecided; it gates
  CP1.
