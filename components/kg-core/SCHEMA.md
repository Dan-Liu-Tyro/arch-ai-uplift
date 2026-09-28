# KG Schema v0 (draft)

Draft proposal for the entity types, relationship types, file layout, and
frontmatter contract of the architecture knowledge graph. Nothing here is
settled; this exists to be argued with. Decisions that survive review get
promoted into `docs/decision-log.md`.

Note: an MVP path (`docs/mvp-proposal.md`) may test the underlying hypothesis
before this schema is built against. If so, this stays the reference model for
later, not the first thing implemented.

Design goals, in priority order:

1. **Typed relationships must support contradiction detection and dependency
   tracing.** This is the whole reason for a graph rather than tidier pages, so
   any simplification that erases relationship *types* is a bad trade.
2. **Readable and reviewable as plain text.** PR review is the only quality gate,
   so a reviewer must be able to judge an entity from its diff alone.
3. **Mechanically generatable into one Confluence page per entity.** Structure
   has to be predictable enough to template.

## Entity types

Seven types. The first six splits are deliberately about *how a statement
behaves*, not about subject matter; `domain` is the exception — see below.

| Type | What it is | Changes | Example |
|---|---|---|---|
| `principle` | Durable belief that justifies other things. Not directly checkable. | Rarely | "Prefer managed services over self-hosted" |
| `guardrail` | Enforceable rule with a clear pass/fail reading. | Occasionally | "Manage AWS resources through Jetstream CRDs" |
| `pattern` | Reusable solution shape with a stated problem and tradeoffs. | Occasionally | "Event-driven integration via SNS/SQS" |
| `reference-architecture` | Named composition of patterns for a recurring domain. | Occasionally | "Standard CTAP web service" |
| `decision` | Dated, specific choice with context. Immutable once made; superseded rather than edited. | Never (append) | "Adopt Schooner for deployment CRDs" |
| `system` | A real Tyro system, so patterns and guardrails have observable subjects. | Continuously | "Payments gateway" |
| `domain` | A bounded business domain — purpose, authority, and explicit non-authority over some slice of Tyro's operations. **Provisional.** | Occasionally | "Payments Processing" |

### `domain` is a first real-world pressure test, not a settled type

`kg-content/README.md` originally called for pressure-testing the schema
against a small, hand-picked set of interconnected entities (a principle, a
guardrail deriving from it, a pattern requiring that guardrail) before bulk
authoring. `domain` skipped that gate deliberately: a concrete downstream
consumer (evaluating a reward initiative against Tyro's actual domain
boundaries) needed the full domain set now, not a slice, so all 39 domains
from "TS - Reference Domain Model - Domain Definitions" (Confluence, ARCH
space) were ingested in one pass rather than pressure-tested incrementally.
See [`docs/domain-model-experiment.md`](../../docs/domain-model-experiment.md)
for the full rationale, method, and deviations. Treat everything below about
`domain` — its storage shape and its relationship to the rest of the schema —
as a first approximation, expected to be reviewed and reshaped once the
downstream use actually exercises it, not as an argued-and-settled type the
way the other six are.

### `domain` is a scoped exception to one-file-per-entity

Every other entity type is one file per entity (see File layout, below).
`domain` deliberately is not: all 39 domains live in one consolidated file,
[`kg-content/entities/domains.json`](../kg-content/entities/domains.json),
shaped by [`schemas/domain.schema.json`](schemas/domain.schema.json) — this
is `kg-core`'s first real artifact; everything else here is still prose.

The reason is specific to `domain` and doesn't generalize to the other six
types: the Architecture team owns the domain definitions as one coherent,
singularly-authored artifact — unlike a guardrail or pattern, which different
reviewers add and edit independently over time, where file-per-entity keeps
each change's diff scoped to the one thing it touched. For `domain`, that
same split works against the content: the source changes as a whole (a
re-drawn boundary between two domains touches both), so review-as-a-whole is
the more meaningful diff unit, and a single file is what makes the data
portable to a UI or another tool with zero directory-walking. If a seventh
type is ever added that shares `domain`'s ownership shape, this exception
should be generalized rather than repeated ad hoc; it is not yet a rule about
`kg-core` in general, only a stated fact about this one type.

The 39 ingested domains group into 6 categories (Support & Experience
Channels, Core Customer & Product Domains, Business Operations Domains,
Partner Integrations & Value-Add Services Domains, Data & Intelligence
Domains, Cross-Domain Orchestrators), listed in `domains.json`'s own
top-level `categories` array. Category is stored as a plain `category`
string on each domain, not a relationship or a second entity type — the
simpler option, chosen deliberately over modelling category as its own node
until there's a real reason (a query, a second grouping dimension) that a
string can't serve.

`domain` has no relationship type. It briefly had one, `not_authoritative_for`
(domain → domain) — see the Open items entry below for why it was reversed.
Non-authority is captured only as `authority.not_authoritative_for`, a list on
the node itself of `{content, ref}` objects (plus an `unresolved` flag on the
minority `ref` can't resolve to a real id — see the item description in
`domain.schema.json`), with no expectation `ref` resolves back the other way.
`content` exists because the plain-string version (and the graph-edge version
before it) both kept only `ref`, discarding exactly the text a solution-phase
reader needs to know *what* is excluded, not just *who* owns it instead — see
the Open items entry below for how that gap was found and closed.

The `principle` / `guardrail` distinction is the load-bearing one. A principle
explains *why* and cannot be violated in a checkable sense; a guardrail can be
concretely complied with or not. Design-doc review needs the checkable layer, and
grounding answers need the justifying layer. Collapsing them produces rules
nobody can trace and aspirations nobody can enforce.

`system` is included because contradiction detection is far more useful against
real deployments than against abstractions alone — it lets the agent answer "what
breaks if this guardrail changes."

## Relationship types

Each relationship is stored **once, on the source entity**, as a frontmatter key
holding a list of target ids. Inverses are derived at query time, never written
down. Storing both directions would mean two files to keep in sync and, in
practice, silent drift.

| Key | Source → Target | Meaning |
|---|---|---|
| `derives_from` | guardrail → principle | This rule exists because of that belief. |
| `requires` | pattern → guardrail | Adopting the pattern obliges these rules. |
| `composes` | reference-architecture → pattern | Blueprint is built from these patterns. |
| `implements` | system → reference-architecture | System claims to follow this blueprint. |
| `uses` | system → pattern | System applies this pattern directly. |
| `conflicts_with` | any → any | These cannot both hold; at least one must lose. |
| `alternative_to` | pattern → pattern | Solves the same problem differently. Not a conflict. |
| `supersedes` | decision → decision | Replaces an earlier decision. |
| `governed_by` | pattern, system → guardrail | Subject to the rule without the rule being intrinsic. |

Three rules that matter more than the list:

- **`conflicts_with` is queried symmetrically.** Written on whichever side was
  authored second; any traversal must check both directions or contradiction
  detection quietly misses half its cases.
- **Every `guardrail` should have at least one `derives_from`.** An unjustified
  rule is the exact Confluence failure mode being replaced. Treat a missing one
  as a review finding, not a schema error.
- **`alternative_to` is not `conflicts_with`.** Conflating them turns healthy
  choice into false alarms and trains people to ignore the contradiction report.

## File layout

```
entities/
  principles/            <slug>.md
  guardrails/            <slug>.md
  patterns/              <slug>.md
  reference-architectures/  <slug>.md
  decisions/             <slug>.md
  systems/               <slug>.md
  domains.json           -- exception: all 39 domains in one file, not a directory
```

One entity per file, for every type except `domain` (see the exception
above). **Filename stem is the id**, so the filesystem enforces uniqueness
for free and a reviewer can resolve any reference by path. Ids are kebab-case
and unprefixed — the directory already carries the type, and
`guardrails/aws-via-jetstream.md` reads better than `guardrail-aws-via-jetstream`.
`domain` ids follow the same kebab-case, unprefixed convention even though
they're no longer separate filenames — `domains.json`'s own `id` field is
what a relationship target resolves against.

Ids are permanent. Renaming breaks every inbound reference, so a retitled entity
keeps its id; `title` carries the human-facing name.

## Frontmatter contract

```yaml
---
id: aws-via-jetstream
type: guardrail
title: Manage AWS resources through Jetstream CRDs
status: active            # draft | active | deprecated | superseded
owner: platform-architecture
created: 2026-08-17
updated: 2026-08-17
tags: [aws, infrastructure, ctap]

derives_from: [secure-by-default]
conflicts_with: []

source: https://confluence.../pages/12345    # provenance, if migrated
confluence_page_id: null                      # set by the publisher, not by hand
---
```

Required on every entity: `id`, `type`, `title`, `status`, `owner`, `created`,
`updated`. Relationship keys are omitted entirely when empty rather than written
as `[]`, to keep diffs about content.

This YAML-frontmatter contract is for the six file-per-entity types.
`domain` doesn't have per-entity frontmatter at all — `owner`, `updated`, and
`source` are stated once at `domains.json`'s top level for all 39 rather than
repeated 39 times, and `type` is implicit (every item in the `domains` array
is one) rather than a field. See `schemas/domain.schema.json` for `domain`'s
actual required fields (`id`, `title`, `category`, `status`, `purpose`,
`authority`) — a JSON Schema, not YAML frontmatter, doing the same job this
section does for the other six types.

`owner` is required because unowned architecture knowledge is how the current
Confluence sprawl happened. `source` preserves provenance during migration so a
reviewer can check a curated entity against what it came from.

`confluence_page_id` is written by the publish tooling. It lives in frontmatter
rather than a side file so the git → Confluence mapping travels with the entity,
but it should never be hand-edited.

## Body templates

Fixed section headings per type — this is what makes generation templatable and
review consistent.

- **principle** — Statement · Rationale · Implications
- **guardrail** — Statement · Rationale · How to comply · How it is checked ·
  Exceptions
- **pattern** — Problem · Solution · When to use · When not to use · Tradeoffs
- **reference-architecture** — Context · Composition · Constraints
- **decision** — Context · Decision · Consequences · Status
- **system** — Purpose · Architecture summary · Known deviations

`domain` has no body template in this sense — it isn't a markdown file, so
there are no section headings to fix. Its equivalent structure is
`schemas/domain.schema.json`'s `domain` definition: `purpose` (a string,
lean by design — not a transcription of the source's full JTBD/core-data/
invariants lists), `authority.owns` / `authority.not_authoritative_for`
(short phrases, same leanness), and `scope` (below). See
`docs/domain-model-experiment.md` for why lean-first was chosen over
front-loading every one of the source page's per-domain fields.

### `scope` on `domain` (decision 35)

Every domain carries `scope`, one of `acquirer-specific` or `tyro-wide`, plus
an optional `scope_note`. The value is a **judgement made in this repo**, not
a fact taken from the source page, and the note exists to say so wherever the
call is arguable — eight of the 39 carry one today.

Two design points worth keeping:

- **It is binary on purpose, and consumers must not filter on it
  destructively.** A three-valued version (`both`) was proposed and
  rejected by the user in favour of binary-plus-dimming, because a domain
  excluded from an "acquiring" view is frequently the boundary being
  investigated. A consumer that *hides* out-of-scope domains is misusing this
  field; `kg-viz` dims them.
- **An absent `scope_note` is not a claim of certainty**, only that nobody
  has recorded a reason to doubt the call yet.

### Overlay graphs (`entities/graphs/<slug>.json`, decision 35)

A named set of typed, directed relationships over entities that already exist
elsewhere in `kg-content`. This is how the repo gets edge types without
`domain` (or any other entity type) having to grow a relationship block of
its own first — the original motivation was `not_authoritative_for`, since
reversed (see Open items).

The governing rule is **reference, never restate**: a node either declares a
`domain_ref` (title, category, purpose and scope are resolved from
`domains.json` at read time) or declares its own `kind` for something the
domain model does not model at all — `actor`, `external`, `artefact`. An
overlay may add relationships and non-domain nodes; it may never hold a copy
of a domain fact. Without that rule an overlay silently becomes a second,
diverging domain model, and the two drift with no signal that they have.

A node of `kind: actor` also declares an **`actor_type`**, naming the role
the actor plays. It is a controlled set: `InternalStaff`, `Customer`,
`Partner`, `Regulator`. Two things about it are deliberate.

It names a **role, not an affiliation.** Whether a role sits inside or
outside Tyro is not stored, because it is derivable — staff are internal,
the rest are not — and a stored `affiliation` beside `actor_type` is two
fields that can contradict each other, which curated data eventually will.
Anything that wants an internal/external split (a viewer colouring actors,
a reader grouping them) derives it at read time. This keeps the model
holding strict types and leaves every presentation choice keyed off them,
rather than baked into them.

`kind: external` is a **different axis and easy to confuse with it**: that
is an external *organisation or system* the flow depends on (a card scheme,
a settlement rail), whereas an external *party* is `kind: actor` with a
non-staff `actor_type`. Both read as "external" in plain English, so any
consumer showing these to a person should label the former "external
system" rather than just "external".

Each edge carries `source`, `target`, `predicate`, `payload` (what data
crosses the edge) and `stage`. Predicates are **free text today and
deliberately uncontrolled** — `payments-target-state.json` alone uses 36
distinct ones. That is a known open item, not a settled decision: a
controlled vocabulary is what would let contradiction detection work across
two overlays, and there is currently only one overlay, so there is no
evidence yet about which predicates recur. Revisit when a second lands.

Overlay graphs are also where **cycles are legitimate** — the merchant
initiates a payment *and* consumes reports about it — so a consumer that
needs a ranking must choose which arc to treat as feedback and should say so
rather than assume acyclicity.

`Exceptions` on guardrails and `Known deviations` on systems exist so reality can
be recorded instead of hidden. A KG that only holds the ideal state will be
contradicted by the first real design doc it reviews, and lose the reader.

## Validation rules

Checkable by script later; a PR review checklist until then.

1. Every id referenced by a relationship key resolves to an existing file.
2. `type` matches the containing directory.
3. Relationship keys respect the source→target types in the table above.
4. No `conflicts_with` cycles left unresolved without an explanatory
   `decision` — a recorded conflict with no adjudication is a bug.
5. Every `guardrail` has at least one `derives_from`.
6. A `superseded` entity has an inbound `supersedes` from something `active`.
7. No orphans except `principle` and `decision`, which may legitimately stand
   alone.

## Open items

- Whether `system` belongs in this repo at all, or should be read from Compass,
  which already tracks Tyro components and is reachable over the Atlassian MCP
  connector. Duplicating a system inventory that already exists is a maintenance
  trap; the counter-argument is that Compass lacks the typed edges into patterns.
- Whether `technology` (approved languages, datastores) is a seventh type or just
  guardrails with tags.
- How granular guardrails should be — one per rule, or grouped by domain. Affects
  contradiction precision directly.
- Whether `tags` need a controlled vocabulary. Free-text tags degrade into the
  same inconsistency the KG is meant to fix.
- ~~Resolved: `domain` now has a real relationship type,
  `not_authoritative_for`.~~ **Reversed** — see `docs/decision-log.md`. The
  relationship never earned a consumer beyond its own visualization, which
  then struggled to render it honestly: a single-predicate, average-degree
  -15 graph, only 38% of it mutual, easy to misread as symmetric where it
  wasn't. Non-authority is domain-level text only now
  (`authority.not_authoritative_for`), not a graph edge. The reasoning below
  is kept for the record, not because it still holds.

  The earlier open question here was whether the schema needed a genuinely new
  primitive to express a *negative* claim ("this domain does NOT own X"), since
  every other relationship type (`derives_from`, `requires`, `uses`,
  `conflicts_with`) asserts something is true. The answer that shipped: name
  the relationship *type itself* after the negative claim rather than adding a
  separate true/false flag to a positive-only vocabulary — `{"type":
  "not_authoritative_for", "target": "..."}` is itself the negative assertion,
  structurally no different from any other typed edge. This avoided needing a
  schema-level negation primitive, at the cost above. Extracting these from
  the source's prose ("→ Other Domain") required real disambiguation work
  (some phrases bundle two domains under one legacy name, some are generic
  collective phrases with no single target) — see
  `docs/domain-model-experiment.md` for that extraction method, kept as a
  historical record of the work even though its output is no longer live.
- Still open: whether cross-domain references should *also* be expressed as
  `system implements domain` / `pattern uses domain` links from the existing
  file-per-entity types inward, once any of those six types actually
  reference a `domain` by id. Not yet exercised by real content.
