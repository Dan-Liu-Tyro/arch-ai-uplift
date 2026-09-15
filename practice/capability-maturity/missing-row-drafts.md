# Drafts for Process Map rows with no maturity descriptions

**Provenance: authored here.** Proposed text for rows on the [Architecture
Capability & Process
Map](https://tyropaymentsltd.atlassian.net/wiki/spaces/AE/pages/2280227087/Architecture+Capability+Process+Map)
that currently have empty maturity-level cells, and therefore cannot be rated
at CP2. Nothing here has been written to the page — the connector only does
full-body replacement (see the constraint in `../../docs/decision-log.md`), so
these are paste-ready drafts for the page owner.

Three rows need this: **Architecture Governance**, **Architecture Debt
Management**, and **Post Implementation Conformance Check**.

---

## Architecture Governance

**Grounded in:** the row's own linked output, [Architecture Sparring –
Governance Scorecard
RAG](https://tyropaymentsltd.atlassian.net/wiki/spaces/ARCH/pages/2237661267/Architecture+Sparring+-+Governance+Scorecard+RAG)
(ARCH `2237661267`, owned by the Head of Architecture, last modified 13 Aug
2026). That page defines five metrics across two themes — *review coverage*
and *cadence adherence* under review adoption; *compliance rate*, *rework
rate* and *exception rate* under decisions compliance & quality — each with a
formula and RAG bands, resolved weakest-link per theme.

### A scoping question to settle first

The row is named **Architecture Governance**, but its output artefact is
explicitly a *sparring* scorecard, and its input is *Architecture Sparring –
Endorsement of Key Decisions*. So the row as evidenced is narrower than its
name: it measures the health of the sparring forum, not architecture
governance across the practice. The draft below is written to the **narrower,
evidenced reading**. If the intent is broader, the levels need rewriting and
the output needs a second artefact beyond the scorecard. Worth resolving at
CP1 alongside the other four comments.

### Description

> Measuring and reporting the health of architecture governance — review
> coverage, cadence, compliance, rework and exceptions — so the forum's
> effectiveness is visible, trended, and correctable rather than anecdotal.

### Maturity levels

| Level | Proposed text |
|---|---|
| **Partial** | Governance health is anecdotal. Whether the right solutions reached the forum before delivery is unknown, because the in-scope denominator was never established. |
| **Manually managed** | A scorecard exists with defined metrics, formulas and RAG bands, compiled by hand from forum records on a regular cadence, with the in-scope population assembled manually. |
| **AI-assisted** (human in the loop) | AI classifies decision outcomes from sparring records, computes the metrics, drafts the scorecard and its trend commentary, and proposes the in-scope population by scanning the portfolio for work that looks like it needed review; an architect validates the numbers and the narrative. |
| **AI-driven** (human on the loop) | AI maintains governance metrics continuously and detects coverage gaps *as they form* — in-scope work heading to delivery without endorsement — routing them before delivery rather than reporting them after; it also recommends threshold recalibration against the accumulated baseline, with architects deciding. |
| **Fully autonomous** (with human value) | Governance health is continuously reasoned from delivery, decision and portfolio evidence with self-calibrating thresholds; humans set risk appetite, define what "in scope" means, and hold accountability for governance outcomes. |

### Why the ladder is shaped this way

Two things in the scorecard drive it, and both are worth stating because they
are not obvious from the row title:

1. **The denominator is the hard part, and it is what AI actually unlocks.**
   *Review coverage* needs "total in-scope solutions requiring review" — which
   means knowing what *should* have come to the forum and didn't. Everything
   else on the scorecard can be counted from forum records; this one cannot be
   counted at all from inside the forum. That is why level 3 introduces
   proposing the in-scope population, and why level 4's step change is
   detecting the gap *before* delivery rather than measuring it after. The
   metric's value inverts at that point: it stops being a report and becomes a
   control.
2. **The thresholds are explicitly provisional.** The scorecard page states the
   RAG bands are "internal starting points" to be recalibrated against Tyro's
   own baseline at the next review cycle. Self-calibration is therefore a
   genuine maturity axis here, not an invented one — which is why it appears at
   levels 4 and 5 rather than being assumed fixed throughout.

---

## Architecture Debt Management

Not yet drafted. The row has a description on the page ("Process for
registering, prioritising, and resolving architecture debt. Maintains a
reservations & debt register with its own lifecycle") but no maturity levels.
Its inputs — *Reservations & Architecture Debt*, *Business & Technology Risks*
— are outputs of the *Architecture Sparring* row, so the two should be drafted
consistently.

## Post Implementation Conformance Check

Not yet drafted. The row has a description ("Validate that **what was built
matches what was designed**. This closes the governance loop and feeds back
into debt and baseline refresh") but no maturity levels. It is the only row
whose inputs include *As-Built Delivery*, which means its level ladder depends
on what as-built evidence is actually available — worth checking before
drafting, rather than assuming.
