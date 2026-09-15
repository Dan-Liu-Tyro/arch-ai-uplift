# Domain-model ingestion experiment

The first attempt at turning a real Confluence document into `kg-content`
entities at scale, rather than one hand-authored entity at a time. **Not yet
a decision** — this is the experiment log; fold the outcome into
`docs/decision-log.md` once the downstream use below has actually happened
and there's real evidence to fold in.

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

## What was produced

- `components/kg-core/SCHEMA.md` — `domain` added as a seventh entity type,
  explicitly marked provisional; a lean body template (Purpose · Category ·
  Authority · Source · Status note); an Open items entry on the unresolved
  relationship-vocabulary gap (see below).
- `components/kg-content/entities/domains/` — 39 entities, one per domain,
  `status: draft`, `owner: architecture-practice`.
- `components/confluence-ingest/sources/reference-domain-model-domain-definitions.md`
  — verbatim cache of the source page body.
- This doc.

## Explicit deviations from the original schema plan

- **Category is a plain frontmatter field, not a relationship or a second
  entity type.** The 6 top-level groupings are stored as `category:
  <slug>` on each domain. Simpler than modelling category as its own node;
  revisit only if a real query needs to traverse categories as first-class
  entities.
- **No typed relationships yet.** Every cross-domain reference ("Transfer
  execution on rails → Funds Movement Domain") lives as prose inside the
  cached source, not as a `kg-core` relationship key. Nothing about
  `domain` is graph-traversable or contradiction-checkable today — see
  `SCHEMA.md`'s Open items for why (the existing relationship vocabulary
  has no typed way to assert "explicit non-authority", a negative claim,
  the way it asserts positive ones).
- **Full per-domain detail lives in the cache, not the entity.** A
  deliberate bet, not yet validated — see Evaluation below.

## Evaluation — pending

Not filled in yet. This experiment's actual test is whether the lean
entities are sufficient once the reward-initiative evaluation task uses
them for real: does it need to go back to the cached source often, and for
what kind of gap (missing invariant, missing cross-domain reference, needs
a typed relationship to traverse)? Record that evidence here, then decide
whether to enrich the lean entities, add relationship keys, or leave the
split as-is. Don't backfill this section with a guessed outcome before that
use happens.

## Open questions

- Whether `domain` needs relationship keys at all, or whether cross-domain
  authority is better expressed via existing types pointing *at* a domain
  (`system implements domain`, `pattern uses domain`) — see `SCHEMA.md`'s
  Open items.
- Whether the lean Purpose/Authority compression lost anything a real query
  will need — only observable once the reward-initiative task runs.
- Whether `owner: architecture-practice` is the right long-term owner for
  39 entities nobody has individually reviewed yet, versus `status: draft`
  being the honest signal that no promotion to `active` has happened.
