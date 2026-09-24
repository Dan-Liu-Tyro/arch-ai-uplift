# Review notes — AI-DLC Solution Architecture draft

**Provenance: authored here.** Reviewer commentary on
[`solution-architecture.md`](solution-architecture.md). **Not part of the
architecture.** Nothing here has been accepted by the author yet; each item is
open until applied or rejected. Kept separate so the source of truth stays the
author's own.

**Revised 2026-09-24**, when the actual leadership ask arrived (see
[`README.md`](README.md)). The first version of this file was written before
the ask was known and got its two highest-priority items wrong — see
*Withdrawn* at the end, which is kept rather than deleted because the reason
they were wrong is the useful part.

## What is strong, and should not be diluted

- **The gradual-versus-step-change distinction in section 5** is the sharpest
  idea in the deck. Accuracy improving smoothly while token cost collapses
  only at the structured tier is a genuine economic argument, and it is the
  one claim that says *where to spend*. It should survive any edit.
- **Section 2's lineage test is decidable.** "Is there a tight, traceable
  lineage back to an external source we must keep in sync?" produces an answer
  rather than a debate. Most first-party/third-party splits do not.
- **Section 7's federated caveat is honest.** Volunteering that the tactical
  stage trades organizational consistency for speed, before anyone asks, buys
  credibility for the rest of the deck.
- **The layer structure is exactly what was asked for.** Sections 1–5 build a
  layered view of the knowledge layer, and the ask names "the different layers
  e.g. Knowledge layer" specifically. This is on target, not over-weight.

## 1. ~~The ask has two deliverables and the second is absent~~ — APPLIED

**Resolved 2026-09-24.** Deliverable 2 is now **section 9, "Architecture
Knowledge, Set Up for Use Across Tyro"** — written inside deliverable 1 as the
one stream taken all the way down, exactly as recommended below, rather than
as a second deck. The recommendation and its reasoning are kept because the
section still has to be defended at the huddle on the grounds given here.

Two things changed in the drafting that this note did not anticipate, both
from checking the repo rather than assuming it:

- **The honest inventory is thinner than "a curated graph".** What exists is
  the seven-type schema, 39 `domain` entities, *one* hand-authored principle,
  the local agent and the viewer — and nothing yet in guardrails, patterns,
  decisions, systems or reference-architectures. Section 9 therefore claims "a
  proof of concept with a working local path", explicitly not a populated
  knowledge base. This is the caution at the end of this item, applied with
  numbers.
- **Item 3's collision is now concrete, not hypothetical.** Those 39 domains
  were ingested *from* the Reference Domain Model, which is the third item in
  the same ask. Section 9 states the relationship — same source, two uses —
  rather than leaving it to surface in the room.

The original note follows.

---

The leadership ask is two things:

1. The AI-DLC layer view — **substantially covered** by the current eight
   sections.
2. **How we could set up architecture knowledge for use across Tyro** —
   **not present at all.**

Architecture appeared only as one row of section 3's eight-stream table.
Nothing in the draft answered how architecture knowledge specifically gets set
up, curated, owned, or reached by the rest of Tyro.

### The recommendation: make deliverable 2 the worked example, not a second deck

Deliverable 2 should sit *inside* deliverable 1 as the one stream taken all
the way down, for three reasons:

- It gives the deck a spine. Right now sections 6–8 assert a target state
  without demonstrating that any stream can reach it. One stream shown
  concretely makes the model credible.
- **It is the only part that is already real.** `IN-562` ("Foundation – PoC of
  Architecture agent") is in progress, and this repo *is* the PoC. Every other
  stream's path is a proposal; Architecture's is running code.
- It answers the nesting in the ask itself — point 2 is phrased as *part of*
  the knowledge layer, not as a parallel topic.

### Proposed content, high level only

Drawn from this repo's own baseline decisions, so nothing here needs inventing:

- **Where architecture knowledge sits today:** the deliberate-unstructured
  tier of section 4 — Confluence pages, authored and durable but not
  queryable. This is the honest current-state read and it sets up the move.
- **What structuring it actually means:** typed entities (principles,
  patterns, guardrails, decisions, systems, domains, reference architectures)
  connected by typed relationships — `pattern REQUIRES guardrail`, `principle
  CONFLICTS_WITH pattern`, `decision SUPERSEDES decision`, `system USES
  pattern`. The graph shape is the point, because it enables contradiction
  detection and dependency tracing that flat document retrieval cannot do.
  This is the concrete, high-level answer to "how".
- **Curate in git, publish outward** (decision 5): architects edit git, where
  pull-request review is the quality gate; one structured page per entity is
  generated into a dedicated clean Confluence space; Rovo indexes that space.
  Confluence is an output, never the source of truth.
- **How the rest of Tyro reaches it** — and this is the honest constraint:
  architects reach it locally today through Claude Code, while org-wide access
  goes through Rovo indexing the published space. Rovo is cloud and the graph
  is local, so anything Rovo queries has to go through the org deployment path
  (TAP/CTAP, promoted development → staging → production). That is deliberately
  deferred and should be *stated* as deferred rather than glossed.
- **Ownership:** one owner per entity, which is section 8's own rule applied
  to the stream that is furthest along. Consistency with section 8 is worth
  making explicit.

### One caution on saying "this is already running"

The PoC is real but early. Claiming more than a curated graph with a local
agent and a viewer over it would be over-claiming to an audience that can ask
to see it. Naming it a proof of concept with a working local path is both true
and sufficient.

## 2. Anchor sections 6, 7 and 8 to Tyro's own maturity ladder

The *Architecture Capability & Process Map* (Confluence space `AE`, "AI
Powered Delivery", page `2280227087`) already defines a five-level
Organisational Maturity scale, referenced in
[`../capability-maturity/README.md`](../capability-maturity/README.md):

| L | Level | Definition |
|---|---|---|
| 1 | Partial | — |
| 2 | Manually managed | — |
| 3 | **AI-assisted** (human in the loop) | AI drafts and checks; a human reviews every output |
| 4 | **AI-driven** (human on the loop) | AI acts continuously; humans handle exceptions |
| 5 | Fully autonomous (with human value) | Self-maintaining; humans govern direction and trade-offs |

The draft's three stages map onto it almost verbatim:

- **Section 6, current state** — AI as an ad hoc side tool, humans the
  mandatory intermediary → **L2, manually managed**, with sporadic individual
  L3 use.
- **Section 7, tactical** — agents standing in each stream with "a human check
  or review gate" → **L3, AI-assisted, human in the loop** ("AI drafts and
  checks; a human reviews every output").
- **Section 8, target** — humans "handling exceptions… edge cases and judgment
  calls" → **L4, AI-driven, human on the loop** ("AI acts continuously; humans
  handle exceptions").

Why it is worth the three labels it costs:

1. The deck stops being a new framework the audience has to accept and becomes
   **our own published ladder applied to the whole delivery lifecycle** rather
   than to the Architecture stream alone.
2. **The target is L4, not L5** — saying so out loud pre-empts the "are you
   trying to remove people" reading.
3. It lands inside already-funded work: the Architecture stream's initiatives
   are already named by maturity level (`IN-564` Maturity 1, `IN-566` Maturity
   2, `IN-568` Maturity 3, per
   [`../capability-maturity/initiative-row-mapping.md`](../capability-maturity/initiative-row-mapping.md)).

**Caveat.** These level reads are the reviewer's, derived from the ladder's
published definitions against the draft's wording. They have not been
validated with the process map's owner, and `initiative-row-mapping.md`
already records that target-level assignment is ambiguous in places. A
proposal to check, not an assessment.

## 3. The Reference Domain Model intersects the third item in the ask

Section 3 lists **the reference domain model** among Architecture's owned
artefacts. The third item in the same leadership ask is a Reference Domain
Model brought by another architect, for testing-automation dependencies.

Both may be right — Architecture owning the model while another architect
authors the instance — but two answers arriving at one huddle from one team
without a stated relationship is an avoidable own goal. Worth settling at the
Monday regroup: is it the same artefact, and if so, does the deck claim
ownership of something someone else is presenting?

## 4. Section 5's claims are unsourced but sound quantitative

"Near deterministic", "drops sharply to near zero", "most expensive" — stated
as findings, with no axis values and no cited basis. At high-level framing
this is survivable, but section 5 is the most likely slide to draw a "measured
on what?" and it is a poor one to be caught on because it is otherwise the
strongest.

Two ways out, not exclusive:

- **Cite real evidence.** `meta/token-tracking/` holds per-task token data with
  a summarizer, and `arch-ai-uplift` *is* an instance of moving architecture
  knowledge from the deliberate-unstructured tier to the structured tier. That
  makes section 5 a claim with a live experiment behind it. Compare on output
  and cache-write tokens, never on cache reads — those scale with conversation
  length, not with work done.
- **Label it as a hypothesis.** If it is not measured, say the shape is
  expected rather than observed, and say what would change the reading.

## 5. ~~Section 8 switches the unit of decomposition~~ — APPLIED

**Resolved 2026-09-24.** The author chose *stream*, and section 8 now reads
"AI agents, one per stream", "its own stream's knowledge", and "queryable
across streams". Domains and streams were the same thing; only the wording
moved.

The original note, kept for the reasoning: sections 3, 6 and 7 are organized
around **eight streams**, while section 8 said "AI agents, one per
**domain**, each owning its own domain knowledge" — then gave stream examples
(Architecture's agent, Engineering's agent). Either domains *were* the
streams, in which case say stream and stay consistent, or a second
decomposition axis had appeared on the final slide undefined. The second
reading was the dangerous one: a payments organization has obvious business
domains (acquiring, settlement, disputes, terminals) that are not streams at
all, and a listener may have heard "one agent per business domain" — a
materially different and much larger architecture.

Note that "domain" survives elsewhere in the document deliberately and
correctly: *industry and domain standards* in section 1's world-knowledge
taxonomy, and *the reference domain model* as a named Architecture-owned
artefact in section 3. Those are not the same usage and were left alone.

## 6. ~~"AI-DLC" is never defined~~ — REJECTED, replaced by 6a

**Rejected by the author, 2026-09-24**, on the grounds that the deck should
not define the term: *"why do I need to define that?"* The original note asked
for the term to be defined once, or else attributed to AWS's AI-Driven
Development Lifecycle with the adaptations stated.

That was wrong, and wrong in the same way as the two items in *Withdrawn*
below. **The term came from the CTO** — the ask itself was phrased as "AI-DLC
Solution Architecture" (see [`README.md`](README.md)). Defining a term back to
the person who used it to commission the work is off-brief, and the reviewer's
instinct behind it ("is every term defined?") is audience-independent by
construction, which is exactly why it misfires on a deliverable whose audience
set the vocabulary.

### 6a. The term is never tied to the deck's own model — one clause, still open

What survives is smaller and is not a definition. "AI-DLC" appears five times
in the document and **all four body mentions are in sections 6–8**; sections
1–5 never use it. Section 3 says "Eight streams, in delivery order" — that
phrase *is* the lifecycle, but the deck never connects the two, so a reader who
follows sections 1–5 meets a term in section 6 that the deck's own framework
has not been tied to.

The fix is one clause in section 3, stating that the eight streams in delivery
order are the lifecycle this deck calls the AI-DLC. It strengthens section 3
rather than adding content, and it is not a definition of a term the audience
supplied.

Also: section 8 says "the primary driver of the **DLC**" where every other
mention says "AI-DLC". Trivial, worth aligning.

### 6b. AWS's AI-DLC is a question for the regroup, not deck content

AWS publishes a methodology by this name, with its own phases and ceremonies.
If Tyro's term arrived from there, part of the audience may be importing AWS's
meaning — a materially different thing from this deck's three-stage model. That
is worth the author *knowing* before the huddle and worth one question at the
Monday regroup; it is not something the deck should explain. **Flagged from the
reviewer's recall, which has not been verified against AWS's published
material** — check it rather than repeat it.

## 7. Lower priority at this depth

These were weighted higher before the ask was known. At explicitly high-level
framing they are worth a line each at most, and are listed so they are not
lost rather than because they should be added now.

- **Where the governance gates live.** Section 8 makes agent-to-agent
  communication the primary driver, while Tyro requires every change to land
  via reviewed pull request, promote development → staging → production through
  Drydock, and carry a Change Request endorsed by both platform and capability
  owners — with AI tools barred from production entirely. The likely answer is
  that agents compress everything *up to* the pull request and the human gates
  are precisely section 8's exception-and-direction layer. One sentence
  pre-empts a reading of section 8 as removing humans from governance. A full
  treatment is a later deliverable, not this one.
- **The bridge from section 1 disappears** from sections 6–8, and under
  section 8's one-owner rule nobody owns a contextualized card scheme ruling
  or keeps it in sync on a scheme revision. Highest-risk knowledge in the
  model; currently unassigned. A placeholder in the target state is enough for
  now.
- **No failure-mode content.** Agent-to-agent handoff means an error in
  Architecture's agent propagates into Engineering's with no human reading it
  — the design's point and its main risk. Section 7's validation gates are the
  start of an answer but are not stated as a risk position.

## Withdrawn — and why they were wrong

Kept deliberately. Both were stated confidently as blocking, and both came
from assuming a purpose the deck was never given.

- **"The deck has no ask"** — withdrawn. It was judged as a pitch seeking a
  decision, and criticized for having no funding request, sequencing or
  success measure. It is the opposite: a deliverable *requested by* leadership,
  answering a question the CTO asked. The spine is the question, not an ask.
  A funding request would have been off-brief.
- **"Five of eight sections are taxonomy"** — withdrawn, and inverted. The ask
  is explicitly for "a high level view of the different layers", so the
  layered classification *is* the requested content. The suggestion to
  compress sections 1–2 and demote section 3 to an appendix would have cut the
  deliverable.

The common error: judging an artefact against an assumed purpose before
establishing who asked for it and why. The generalizable rule is in
[`../../meta/procedural-memory/universal.md`](../../meta/procedural-memory/universal.md).
