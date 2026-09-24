# Review notes — AI-DLC Solution Architecture draft

**Provenance: authored here.** Reviewer commentary on
[`solution-architecture.md`](solution-architecture.md), written against the
first captured draft (2026-09-24). **Not part of the architecture.** Nothing
here has been accepted by the author yet; each item is either applied,
rejected, or still open. Kept as a separate file so the source of truth stays
the author's own.

## What is strong, and should not be diluted

- **The gradual-versus-step-change distinction in section 5** is the sharpest
  idea in the deck. Accuracy improving smoothly while token cost collapses
  only at the structured tier is a genuine economic argument, and it is the
  one claim that tells a CTO *where to spend*. It should survive any edit.
- **Section 2's lineage test is decidable.** "Is there a tight, traceable
  lineage back to an external source we must keep in sync?" produces an answer
  rather than a debate. Most first-party/third-party splits do not.
- **Section 7's federated caveat is honest.** Volunteering that the tactical
  stage trades organizational consistency for speed, before anyone asks, buys
  credibility for the rest of the deck.

## Blocking for a CTO audience

### A. The deck has no ask

Eight sections of architecture and taxonomy, ending on a takeaway. There is no
decision requested, no investment named, no sequencing, no success measure,
and no "why now". A CTO session that ends on a taxonomy conclusion produces
agreement and no action.

The target state — agent-mediated delivery across eight streams — is a
multi-year organizational change. Presented without a sequence or a cost, it
reads as a vision rather than a proposal.

**What is needed:** name the ask on the first slide and close on it. Whether
that ask is funding, a pilot stream, a decision to standardise a schema, or
explicit endorsement to proceed is the author's call, not the reviewer's.

### B. The target state collides with Tyro's change-management standards, and the draft is silent on it

Section 8 makes agent-to-agent communication "the primary driver of the DLC",
with humans reduced to direction and exceptions. Tyro's standards require
that every change land via a reviewed pull request, that promotion run
development → staging → production through Drydock, that a production deploy
carry an approved Change Request endorsed by *both* platform and capability
owners, and that AI tools not access production environments at all.

So the most predictable question in the room is: **where do the gates live in
the target state?** An answer almost certainly exists — agents compress
everything up to the pull request, and the human gates are not an exception to
the model but precisely the "exception and direction layer" section 8 already
describes. But while it is unstated, section 8 reads as proposing to remove
humans from governance, which is the one reading that loses a payments CTO.

This is not a small addition. It is arguably the actual solution-architecture
content of an AI-DLC at Tyro: the interesting engineering is in how a fast
generative lifecycle meets a deliberately slow, human-endorsed release path.

## High value

### C. Anchor sections 6, 7 and 8 to Tyro's own maturity ladder

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
- **Section 7, tactical** — agents standing in each stream, with "a human
  check or review gate" → **L3, AI-assisted, human in the loop**. The
  ladder's own definition is "AI drafts and checks; a human reviews every
  output".
- **Section 8, target** — humans "handling exceptions… edge cases and
  judgment calls" → **L4, AI-driven, human on the loop**. The ladder's own
  definition is "AI acts continuously; humans handle exceptions".

Three reasons this is worth doing:

1. It stops the deck being a new framework the CTO has to accept, and makes it
   **our own published ladder applied to the whole delivery lifecycle** rather
   than to the Architecture stream alone.
2. **The target is L4, not L5** — and saying so out loud pre-empts the "are
   you trying to remove people" reading that item B also creates. Declining to
   propose full autonomy is a credibility asset; leaving it ambiguous is a
   liability.
3. It connects the deck to work already funded and in flight — the Architecture
   stream's own initiatives are already named by maturity level (`IN-564`
   AI-Validated / Maturity 1, `IN-566` AI-Augmented / Maturity 2, `IN-568`
   AI-Driven / Maturity 3, per
   [`../capability-maturity/initiative-row-mapping.md`](../capability-maturity/initiative-row-mapping.md)).
   A deck that lands inside existing program structure is far cheaper to say
   yes to than one that sits beside it.

**Caveat on that mapping.** The level reads above are this reviewer's, derived
from the ladder's published definitions against the draft's own wording. They
have not been validated with the process map's owner, and
`initiative-row-mapping.md` already records that target-level assignment is
ambiguous in places. Treat them as a proposal to check, not as an assessment.

### D. Section 5's claims are unsourced but sound quantitative

"Near deterministic", "drops sharply to near zero", "most expensive" — stated
as findings, with no axis values and no cited basis. If the CTO asks "measured
on what?", the strongest slide in the deck becomes the weakest moment in the
room.

Two ways out, and they are not exclusive:

- **Cite real evidence.** This repo has been measuring exactly this:
  `meta/token-tracking/` holds per-task token data with a summarizer, and the
  whole `arch-ai-uplift` project *is* an instance of moving architecture
  knowledge from the deliberate-unstructured tier into the structured tier.
  That makes section 5 a claim with a live experiment behind it rather than an
  assertion. Compare on output and cache-write tokens, never on cache reads —
  those scale with conversation length, not with work done.
- **Label it as a hypothesis.** If the numbers are not measured, say the shape
  is expected rather than observed, and say what would change the reading.
  A curve presented as measured and then challenged costs more than one
  presented as a hypothesis and then confirmed.

## Worth fixing

### E. Section 8 switches the unit of decomposition without defining it

Sections 3, 6 and 7 are organized around **eight streams**. Section 8 says
"AI agents, one per **domain**, each owning its own domain knowledge" — and
then gives stream examples (Architecture's agent, Engineering's agent).

Either domains *are* the streams, in which case the draft should say stream
and stay consistent, or a second decomposition axis has been introduced on the
final slide without being defined. The second reading is the dangerous one: a
payments organization has obvious business domains (acquiring, settlement,
disputes, terminals) that are not streams at all, and a listener may hear
"one agent per business domain", which is a materially different and much
larger architecture.

### F. The bridge from section 1 disappears from the architecture

Section 1 establishes the bridge as the place where "both the value and the
risk concentrate", and requires translated knowledge to carry lineage back to
its source so it can be kept fresh. Sections 6, 7 and 8 then show only
first-party knowledge layers. The bridge is never staffed, owned, or placed.

The same gap reaches section 2's third-party knowledge. Under section 8's rule
that each piece of knowledge is owned by exactly one agent, **who owns a
contextualized card scheme ruling** — Security's agent, or the agent of
whichever stream interpreted it? And what keeps it in sync when the scheme
publishes a revision? In a payments organization this is the highest-risk
knowledge in the whole model, and it is the one piece the ownership rule does
not yet resolve.

If the bridge is load-bearing in the framing, it needs a place in the target
state. If it is not, section 1 is overselling it.

### G. There is no failure-mode content

Agent-to-agent handoff as the primary driver means an error in Architecture's
agent propagates into Engineering's agent **with no human reading it in
between** — which is the deliberate point of the design and also its main
risk. The draft does not address it, nor stale knowledge, ownership decay when
a domain has no active owner, or hallucination in the streams section 7
explicitly allows to keep running on unstructured input.

For a regulated payments audience, the absence of this content is conspicuous
rather than neutral. Note that section 7's validation gates are the beginning
of an answer; it just is not stated as a risk position.

## Minor

### H. "AI-DLC" is never defined

The title uses the term and no section explains it. If it is adopted from
AWS's AI-Driven Development Lifecycle, say so and say what has been adapted —
borrowing a vendor's lifecycle naming without acknowledgement invites "why are
we adopting someone else's framing of how we build software", and
acknowledging it costs one line. If the term is our own, define it once.

### I. The weight sits on taxonomy

Five of eight sections are classification before any architecture appears, and
sections 1, 2 and 3 are three successive layers of one tree. Section 3 in
particular is a reference table of roughly forty artefacts — useful as a
handout, hard to present.

Two options, in preference order:

1. **Make section 3 do work instead of shortening it.** Show, per stream,
   whether its knowledge is tacit, unstructured, semi-structured or structured
   *today*. That converts a taxonomy into a coverage gap analysis, which is
   both more presentable and directly sets up the ask in item A — the gaps are
   the argument for the investment.
2. Compress sections 1 and 2 into one slide and move the full stream table to
   an appendix.
