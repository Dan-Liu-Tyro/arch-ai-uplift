# IN-563 — validation checkpoints

**Provenance: derived.** The checkpoint *questions* come from the Head of
Architecture: four as unresolved inline comments on the Process Map page
(quoted below, fetched 2026-09-14), two relayed by the user in conversation.
The sequencing, entry conditions and status tracking are authored here.

## Why checkpoints rather than a linear plan

IN-563's deliverable is an assessment, and an assessment's only real quality
gate is whether the practice's own architects recognise it as true. So the work
is planned *around* the review points rather than presented at the end.

Each checkpoint is a question with a yes/no-with-corrections answer, not a
document review. A gate that asks the Head of Architecture to read a 21-row
table and react gets a rubber stamp or a delay.

## CP1 — Completeness, and the inputs/outputs

**Asks:** did we capture everything the practice does, and are each row's
inputs and outputs correct?

The Process Map already carries Inputs, Process/Activity and Outputs columns,
so this is a **validation** pass, not a modelling one. Four questions are
already open on the page as inline comments from the Head of Architecture,
dated 2026-09-08, none resolved:

| Row | Comment | What it decides |
|---|---|---|
| Technology Radar | "Suggest to remove this – should be driven by PE practice." | Scope boundary: is this Architecture's process at all? |
| Technical Excellence / Knowledge Sharing | "Suggest to remove this – should be driven by PE practice." | Same boundary question. |
| Architecture baseline refresh | "Should this be a separate process or covered by capability modelling, strategic planning, etc.?" | Granularity: distinct row, or folded into an existing one? |
| Diagram asset management? | "Should this be a separate item or part of impact analysis or solution architecture?" | Same granularity question. |

**Two of the four suggest deletion, which would take the map from 21 rows to
19.** That matters beyond tidiness: both deletions are in *Execution
Guardrails*, the theme with no program initiative against it, so resolving them
changes what "breadth" means at CP2.

Structural gaps found by reading the page, independent of the comments:

- **Four rows have empty Inputs *and* Outputs** — and they are exactly the four
  commented rows above. The correlation is the finding: rows whose place in the
  process is unsettled are also the rows nobody could name a flow for.
- **Three rows have empty maturity-level descriptions** — Architecture
  Governance (also missing its Description), Architecture Debt Management, and
  Post Implementation Conformance Check. These cannot be rated at CP2 until the
  five level descriptions exist for them.
- **One row has empty Inputs** — Sensible Defaults Maintenance.

**Entry condition:** met. The page is reviewable as-is; the four comments are
the agenda.

**Blocks:** CP2 (rating rows that may be deleted or merged is wasted) and CP3
(the flow diagram is a rendering of the inputs/outputs columns, so it inherits
their errors).

**Status:** ready to run — this is the next action.

## CP2 — Maturity levels, current and target state

**Asks:** are the maturity levels the right ones, and for each row, which cell
is current state and which is target state for this program?

The scale is settled and stays as-is — the Process Map's own five
**Organisational Maturity Level** columns, from `Partial` through `Fully
autonomous`. See [`README.md`](README.md) for the table and for the two
vocabularies this corrects.

The rating is derived, not invented: each Architecture-stream initiative
(IN-562…IN-571) maps to a row, and its description implies that row's target
level. [`initiative-row-mapping.md`](initiative-row-mapping.md) holds the
proposed mapping and the two gaps it exposes — one initiative whose row is not
marked as prioritised, and two placeholder initiatives with no row at all.

Also in scope here, because the program has stated flexibility in FY27 Q3–Q4:
**which additional rows should the program take on**, to fill IN-570 and
IN-571.

**Entry condition:** CP1 passed, and the three rows missing level descriptions
have them — drafts are accumulating in
[`missing-row-drafts.md`](missing-row-drafts.md) (Architecture Governance
done; Architecture Debt Management and Post Implementation Conformance Check
outstanding), but they are drafts here, not text on the page.

**Blocks:** closing IN-563.

**Status:** blocked on CP1. Mapping drafted.

## CP3 — Visualise the processes as a flow diagram

**Asks:** can the process model be rendered as a flow diagram, so it is easier
to consume and socialise than a wide table?

Relayed by the user in conversation; not present as a comment on either page.

This is a genuine deliverable, not a presentation nicety. The Process Map is
ten columns wide and reads as a list of independent rows, which hides the thing
that makes it a *process* model: outputs of one row are inputs to the next
(`Solution (or Data) Architecture` is produced by one row and consumed by three
others). A flow view makes those chains legible and makes a missing link
obvious.

It also has a dependency worth stating plainly: **the diagram is a rendering of
the inputs/outputs columns.** Drawing it before CP1 would produce a confident
picture of an unvalidated flow — and four rows currently have no inputs or
outputs at all, so they would appear as disconnected islands.

**Entry condition:** CP1 passed, so the columns the diagram renders are
trusted.

**Status:** blocked on CP1.

## CP4 — Carve out what the AI SDLC program already covers

**Asks:** which items in the practice transformation roadmap are already
covered by the AI SDLC program, so the two don't duplicate each other?

From the Head of Architecture, relayed by the user:

> I am also drafting an architecture practice transformation roadmap, this
> should link back to the process map [...] just need to carve out the items
> that are already covered by the AI SDLC program so we don't duplicate.

The direction matters: the roadmap links *back to* the process map, which makes
the process map the shared spine and the roadmap a consumer of it. So this is
not a merge of two models — it is an overlap report produced from the process
map, naming which rows the AI SDLC program owns so the roadmap can exclude
them.

This is what the Practice Evolution Roadmap page is for in this work, and the
only thing it is for. It is not the scale to assess against.

**Entry condition:** CP2 passed, since "what the program covers" is exactly the
set of starred rows with agreed targets.

**Status:** blocked on CP2.

## Tracking

| CP | Asks | Status | Gated on |
|---|---|---|---|
| CP1 | Completeness; are inputs/outputs right | **Ready to run** | — |
| CP2 | Maturity levels; current + target per row | Blocked | CP1 |
| CP3 | Flow-diagram visualisation | Blocked | CP1 |
| CP4 | Roadmap de-duplication / carve-out | Blocked | CP2 |

CP3 is gated on CP1 rather than CP2 — a flow diagram needs correct inputs and
outputs, but not maturity ratings — so CP2 and CP3 can run in parallel once
CP1 passes.

Update this table when a checkpoint's status changes, and record what came back
from each one. A checkpoint that passed without leaving a record of what was
corrected is indistinguishable from one that was never run.
