# Domain-model ingestion experiment

The first attempt at turning a real Confluence document into `kg-content`
entities at scale, rather than one hand-authored entity at a time. **Not yet
a decision** — this is the experiment log; fold the outcome into
`docs/decision-log.md` once the downstream use below has actually happened
and there's real evidence to fold in. Two passes so far: an initial lean,
file-per-domain ingestion, and a same-day pivot to a consolidated,
relationship-first file once building `kg-viz` exposed exactly the gap the
first pass predicted it might. See "Pivot", below, for the second pass —
the sections before it describe the first pass as it actually happened,
not retroactively cleaned up.

## Why

Architecture reasoning — and the review/sparring work the KG is meant to
ground — leans heavily on the org's actual domain boundaries: who owns what,
what's out of scope for a given domain, how work crosses domain lines. That
knowledge already exists, curated by the Architecture team, as "TS -
Reference Domain Model - Domain Definitions" on Confluence. It had never
been pulled into this repo. The immediate driver was concrete rather than
speculative: an upcoming task needs to evaluate a reward initiative against
the full domain set, which requires all 39 domains to exist as queryable
entities, not a representative slice.

## Source

Confluence page "TS - Reference Domain Model - Domain Definitions", ARCH
space (Architecture), page ID 1633976330, authored by the Architecture team.
<https://tyropaymentsltd.atlassian.net/wiki/spaces/ARCH/pages/1633976330/TS+-+Reference+Domain+Model+-+Domain+Definitions>.
Defines 39 domains across 6 top-level categories (Support & Experience
Channels; Core Customer & Product Domains; Business Operations Domains;
Partner Integrations & Value-Add Services Domains; Data & Intelligence
Domains; Cross-Domain Orchestrators), each with purpose, consumer
personas/JTBD, core data, invariants, capability authority, data authority,
and explicit non-authority.

## Method: lean graph first, expand on demand

The original plan (see `components/kg-content/README.md`'s prior Status
note) was to pressure-test the schema against a small, hand-picked, fully
interconnected set of entities before any bulk authoring. This experiment
deliberately departs from that plan in **breadth** — all 39 domains, not a
slice, because the downstream reward-initiative task needs the complete set
— but compensates by cutting **depth** instead: rather than transcribing all
seven of the source page's fields into every entity, each domain entity
holds only:

- a one/two-sentence **Purpose**,
- its top-level **Category**,
- a one-line **Authority** summary (what it owns, what it explicitly
  doesn't), and
- a **Source** pointer to both the live Confluence page and a local cache.

The full per-domain detail (JTBD, core data, invariants, the complete
capability/data authority and non-authority lists) is **not** duplicated
into 39 entity files. It's cached once, verbatim, at
`components/confluence-ingest/sources/reference-domain-model-domain-definitions.md`
— `confluence-ingest`'s first real artifact, matching its stated boundary
("reads existing Confluence pages... into candidate entities"). The bet
being tested: that a lean graph is enough to reason with day to day, and
that when real use exposes a gap, going back to that cache (or, if it's
stale, the live page) to pull in only what's needed beats front-loading
completeness that may never get queried. This is the same posture
`meta/CDCD` documents this project using elsewhere — incremental structure
driven by an actual next use, not upfront completeness.

## What was produced (first pass — see Pivot below for what replaced this)

- `components/kg-core/SCHEMA.md` — `domain` added as a seventh entity type,
  explicitly marked provisional; a lean body template (Purpose · Category ·
  Authority · Source · Status note); an Open items entry on the unresolved
  relationship-vocabulary gap (see below).
- `components/kg-content/entities/domains/` — 39 entities, one per domain,
  `status: draft`, `owner: architecture-practice`. **Deleted in the pivot**,
  replaced by `components/kg-content/entities/domains.json`.
- `components/confluence-ingest/sources/reference-domain-model-domain-definitions.md`
  — verbatim cache of the source page body. Still current; the pivot reads
  from this same cache rather than superseding it.
- This doc.

## Explicit deviations from the original schema plan

- **Category is a plain frontmatter field, not a relationship or a second
  entity type.** The 6 top-level groupings are stored as `category:
  <slug>` on each domain. Simpler than modelling category as its own node;
  revisit only if a real query needs to traverse categories as first-class
  entities.
- **No typed relationships yet — true of the first pass only.** Every
  cross-domain reference ("Transfer execution on rails → Funds Movement
  Domain") lived as prose inside the cached source, not as a `kg-core`
  relationship key, so nothing about `domain` was graph-traversable. The
  Pivot section below replaces this: `not_authoritative_for` is now a real,
  structured relationship type.
- **Full per-domain detail lives in the cache, not the entity.** A
  deliberate bet, not yet validated — see Evaluation below.

## Pivot: from lean prose to a consolidated, relationship-first file

This is the CDCD loop this experiment was framed around actually completing
a cycle, not just being cited as inspiration: the first pass built the
minimum needed for the immediate use, real use (building `kg-viz`, below)
exposed a concrete gap, and that evidence — not a re-plan from first
principles — is what drove the next structural change.

**What the first pass's evidence showed.** Turning `kg-viz`'s prose
cross-references into edges surfaced two things plainly: the resolution
required lossy fuzzy-matching (string similarity against domain titles,
with an explicit ambiguity floor) rather than anything queryable, and a
recurring naming mismatch — "Customer & Identity" — that no amount of better
matching could resolve on its own, because the source uses one legacy name
for what this ingestion split into two domains.

**What changed.** The user's own reasoning, stated directly: the
Architecture team owns these definitions as one coherent, singularly-owned
artifact — unlike a guardrail or pattern, independently edited by different
reviewers over time — so for `domain` specifically, one consolidated file
beats one-file-per-entity, for portability (hand it to a UI or another tool
with zero directory-walking) and maintainability (the source changes as a
whole, so review-as-a-whole is the more meaningful diff unit). This is a
scoped, stated exception to decision 1's general "one file per entity"
convention, applying only to `domain` — the other six `kg-core` entity types
keep their existing shape.

**Concretely:**

- `components/kg-content/entities/domains/*.md` (39 files) deleted, replaced
  by one file: `components/kg-content/entities/domains.json`.
- `components/kg-core/schemas/domain.schema.json` — `kg-core`'s first real
  artifact (everything else there is still prose in `SCHEMA.md`).
- Prose cross-references re-extracted from the raw cache (not the lean
  markdown this time — going back to the full source gave enough context to
  resolve properly) into a real relationship type, `not_authoritative_for`.
  The negation problem `SCHEMA.md`'s Open items previously left open is
  resolved by naming the relationship type itself after the negative claim,
  rather than adding a true/false flag to a positive-only vocabulary.
- **Real resolution result: 338 total relationships extracted, 296 resolved
  (87.6%), 42 left as `target_unresolved` rather than guessed.** Getting from
  the first pass's 62% to this required real disambiguation work, not just a
  better string-matching threshold:
  - **"Customer & Identity" (24 occurrences in the raw cache) resolves to
    *both* `customer` and `user-and-identity`.** Every single occurrence,
    checked individually, bundles customer-master content (legal entity,
    party, group hierarchy) and identity content (user identity, RBAC,
    authentication) together — strong, consistent evidence this is the
    source's own legacy combined name for what got split into two domains,
    not an ambiguity to leave unresolved. Same treatment applied to two
    other recurring bundled names once the evidence was equally clear:
    "Disputes & Chargebacks" → `disputes-and-recovery` (that domain's own
    purpose text explicitly names "chargebacks, retrieval requests,
    representment"), and "Data, Intelligence & AI" → all three domains in
    the Data & Intelligence category (the phrase names all three concepts
    explicitly).
  - **A handful of aliases resolved by direct textual evidence**, not
    guessing: "Partner Ecosystem" → `partnerships` (that domain's purpose is
    "all third-party organisations Tyro engages with as partners");
    "Payments Channel & Acceptance Runtime" / "Acceptance Runtime" →
    `payments-channels` (its own tagline is "Acceptance Runtime & Channel
    Execution Authority"); "POS Integration & Partner Connectivity" →
    `pos-integration`; "Financial Management & Accounting" →
    `accounting-product`; "AI" / "ML Platform" / "AI/ML Operations" →
    `ai-and-ml` (the domain's own section describes itself in exactly these
    terms); "Data Platform(s)" → `data-analytics-and-intelligence`
    (content match: pipelines and dashboards, not governance); "Payment
    Accounting" → `payments-accounting` and "Billing & AR" →
    `billing-and-accounts-receivable` (near-identical names, not content
    guesses).
  - **A deliberate, considered limitation: single-word abbreviations
    ("Banking", "Settlement", "Lending", "Credit") are left unresolved on
    purpose**, not by oversight. "Settlement", "Lending", and "Credit" would
    resolve safely via a token-subset rule (each is a distinctive word
    unique to one domain's title), but "Banking" would not: it would
    wrongly match `banking-vas-integrations` (a partner-integration layer,
    not the core ledger/balances concept "Banking" actually refers to in
    every occurrence). Since one word in the same class produces a wrong
    match, the rule was not applied to any of them — a rule that resolves
    three correctly and one incorrectly is worse than one that honestly
    reports four gaps.
  - **"Banking Domain" itself is confirmed absent from the source, not
    missed by extraction.** The raw cache has exactly 39 `## ` domain
    headers, matching the 39 ingested — "Banking Domain" is referenced 11
    times across the page but never defined as its own section. This is a
    real gap in the source document, not this ingestion's error.
- `components/kg-viz/generate.py` simplified accordingly: it now reads
  `domains.json`'s structured relationships directly and no longer does any
  string-similarity matching at all.

## Evaluation

**First pass (superseded).** Building `kg-viz`'s prose-inference edges
found 68 arrow references, 42 resolved (62%), 26 unresolved — see the Pivot
section above for what this evidence actually drove: not a bigger regex, but
the move to a consolidated, relationship-first file. Recorded here for the
history, not as the current state.

**Second pass, after the pivot: 338 relationships extracted directly from
the raw cache, 296 resolved (87.6%), 42 left as `target_unresolved`.** The
jump from 62% to 87.6% came from real disambiguation work against the full
source (the aliasing described in the Pivot section), not from a looser
match threshold — the threshold that produced the first pass's 62% is
unchanged; what changed is that "Customer & Identity" and similar bundled
legacy names are now resolved by direct textual evidence instead of being
left as an unresolved near-tie. The remaining 42 are a considered, named
set (single-word abbreviations deliberately left unresolved for the
"Banking" ambiguity reason above; generic collective phrases; "Banking
Domain" itself, confirmed absent from the source) — not unexamined noise.

**Still open: the reward-initiative evaluation task hasn't run yet.** That
was always this experiment's real test — whether the lean split (`purpose`
+ short `authority` phrases, not the full JTBD/core-data/invariants lists)
holds up once something actually queries this data for a real architecture
decision. Nothing in the pivot changes that; it only fixed a problem the
pivot's own trigger (`kg-viz`) exposed before that task got to run.

## Open questions

- Whether the lean `purpose`/`authority.owns` compression lost anything a
  real query will need — only observable once the reward-initiative task
  runs.
- Whether `owner: architecture-practice` is the right long-term owner for
  39 entities nobody has individually reviewed yet, versus `status: draft`
  being the honest signal that no promotion to `active` has happened.
- Whether the 4 single-word abbreviations left unresolved on purpose
  (Banking, Settlement, Lending, Credit) are worth resolving by hand now
  that they're a small, fully-enumerated set (11 + 2 + 2 + 2 occurrences),
  rather than leaving the policy as "never auto-resolve this class."
- Whether `domain`'s scoped one-file exception (see `SCHEMA.md`) should
  generalize to a rule about `kg-core` in general, or stay a fact about
  this one type — not yet tested against a second type with the same
  singular-ownership shape.
- Whether cross-domain references should *also* be expressed as `system
  implements domain` / `pattern uses domain` links from the six
  file-per-entity types inward, once any of them actually reference a
  `domain` by id. Not yet exercised by real content.
