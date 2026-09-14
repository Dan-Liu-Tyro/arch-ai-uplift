# IN-563 — validation checkpoints

**Provenance: authored here.** The checkpoint structure below is this repo's
plan for getting IN-563 validated and tracked. The *questions* each checkpoint
asks are owned by Naz Chan as Head of Architecture; the sequencing, the
entry conditions and the status tracking are ours.

## Why checkpoints rather than a linear plan

IN-563's deliverable is an assessment, and an assessment's only real quality
gate is whether the practice's own architects recognise it as true. That makes
Naz's review the gate, not a formality after the work — so the work is planned
*around* her review points rather than presented at the end.

This also fixes a weakness the activity inventory names about itself: it was
derived from one Confluence page plus this repo, so activities that page never
mentions are invisible to the method by construction. No amount of further
desk work closes that gap. Only someone who does the work can, which makes
"did we capture everything we do?" a checkpoint question and not a research
task.

**Each checkpoint is a question with a yes/no-with-corrections answer, not a
document review.** That is deliberate. A gate that asks the Head of
Architecture to read a 32-row table and react will get a rubber stamp or a
delay; a gate that asks three specific questions gets an answer.

## The checkpoints

### CP1 — Completeness and scale

Two questions, asked together on purpose. They are independent — the scale
answer stays valid whatever happens to the activity set — so bundling risks
nothing and costs one conversation instead of two.

| | |
|---|---|
| **Asks** | (a) Did we capture everything the practice does, and are each activity's inputs and outputs right? (b) Are the maturity levels the right ones for this assessment? |
| **Entry condition** | Activity inventory carries inputs and outputs per activity, and the structural checks below pass. |
| **Blocks** | CP2 entirely. Rating activities that are about to change, on a scale that may change, wastes the most expensive part of the work. |
| **Status** | Not ready — inputs/outputs not yet modelled. |

On (b): this area currently uses Naz's own five-level practice scale — `Low`,
`Emerging`, `Partial`, `In flight`, `Established` — on the reasoning in
[`README.md`](README.md) that IN-563 is a practice-wide assessment and that is
what the scale measures. That reasoning was made here, not confirmed with her,
and the AI SDLC program also has the M1/M2/M3 solution-architecture ladder in
play (decision 15 in `../../docs/decision-log.md`). So the scale is a
*provisional choice pending CP1*, not a settled one, and this file is the
record of that.

### CP2 — Maturity ratings

| | |
|---|---|
| **Asks** | Does the per-activity maturity read match what the practice actually looks like today? |
| **Entry condition** | CP1 passed. Every `(uplift)` placeholder replaced with a rating that cites evidence, or with `not-assessed`. |
| **Blocks** | CP3's opportunity ranking, which is only meaningful against a real maturity baseline. |
| **Status** | Blocked on CP1. |

The `(uplift)` values presently in the inventory are **not** candidate answers
for this checkpoint. They are inherited initiative ratings, and an initiative
rating measures how far an uplift programme has progressed, not how mature the
underlying activity is. Fifteen of the 24 inherited cells read `In flight`,
which would produce an assessment with almost no differentiation — and biased
upward in exactly the places an uplift exists *because* the activity is weak.

### CP3 — AI opportunity and disposition

| | |
|---|---|
| **Asks** | Is the AI-opportunity read right, including where it disagrees with the roadmap's six sub-goals? And does this land as an input to Naz's page, a separate artefact, or a replacement section? |
| **Entry condition** | CP2 passed. AI opportunity rated independently of the sub-goal list, so the group-A/group-D blind spot is tested rather than inherited. |
| **Blocks** | Closing IN-563. |
| **Status** | Blocked on CP2. |

The disposition question is bundled here rather than raised first because it is
cheap to answer once the artefact exists and expensive to answer in the
abstract. Publishing back to Confluence is out of scope until it is answered —
Naz owns the target page.

## Structural checks we run before spending Naz's time

Inputs and outputs are not documentation. They are what makes the activity set
*self-testable*, which is the same reason this repo chose a graph shape over
flat docs — typed relationships surface contradictions a list cannot.

Three checks become possible once every activity declares what it consumes and
produces:

1. **Dangling input** — an activity consumes something no activity produces
   and no external party supplies. Either an activity is missing, or the input
   is imaginary.
2. **Orphan output** — an activity produces something nothing consumes and no
   external party receives. Either a consumer activity is missing, or the work
   produces something nobody uses, which is itself a finding.
3. **Group isolation** — a whole group connects to the rest only weakly. In a
   practice this usually means the group was derived from the source's
   structure rather than observed, which is precisely the failure mode the
   inventory warns about.

Running these first converts part of "did we capture everything?" from a
question only Naz can answer into one the model answers itself, and narrows
what is left to the cases that genuinely need her.

## Tracking

| CP | Asks | Status | Gated on |
|---|---|---|---|
| CP1 | Completeness of activities + inputs/outputs; is the scale right | Not ready | Inputs/outputs pass |
| CP2 | Per-activity maturity ratings | Blocked | CP1 |
| CP3 | AI opportunity read; how this lands | Blocked | CP2 |

Update this table when a checkpoint's status changes, and record what came back
from each one — a checkpoint that passed without leaving a record of what was
corrected is indistinguishable from one that was never run.
