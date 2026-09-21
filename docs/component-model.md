# Component Model

How this repo is carved up, and the rules that keep each piece extractable.

The repo is deliberately structured as a set of loosely coupled components rather
than one application. Not every component will survive, and some will outgrow this
repo and be promoted into their own project or handed to another team. That is an
expected outcome, not a failure — so the layout is designed to make extraction a
move operation rather than an untangling exercise.

This is the structural expression of decision 2 in `docs/decision-log.md`
("decouple KG core from the integration layer"). That decision said the core must
not know about its consumers; this document is how the filesystem enforces it.

## Components

| Component | Responsibility | Status | Likely language |
|---|---|---|---|
| `kg-core` | Schema contract, validation, query/traversal logic. Knows nothing about Confluence, Rovo, or Claude. | Schema drafted | Kotlin if it grows into a service; scripts fine while exploring |
| `kg-content` | The curated graph itself — entity files conforming to the schema. Data, not code. | 1 `principle`, 39 `domain`, 1 overlay graph (all draft) | n/a (Markdown + YAML + JSON) |
| `confluence-ingest` | Inbound. Reads existing Confluence pages and helps turn them into candidate entities. One-off-ish migration aid. | Not started | Whatever is fastest; this is throwaway-shaped |
| `confluence-publish` | Outbound. Generates one structured page per entity and publishes to the dedicated space. | Not started | Kotlin or scripts |
| `query-service` | v2. Network-reachable query interface so cloud-hosted Rovo can reach the graph. Deployed via TAP/CTAP. | Deferred | Kotlin |
| `claude-code-access` | Local access glue so Claude Code can read and traverse the graph from the filesystem. | Not started | Scripts |
| `local-agent` | MVP. A local mirror of Arc's advisory role, with zero production access. No longer outside the dependency graph below — see decision 21 in `docs/decision-log.md`. | MVP | Markdown, no code |
| `kg-viz` | Read-only visualization for human inspection — two purpose-built views (2D payments flow by default, dense authority graph second). Not a consumer that reasons about the graph. | Third pass; never opened in a browser | Scripts + static HTML/JS |

## Dependency rules

The only rule that really matters: **dependencies point inward, toward
`kg-core`.**

```
confluence-ingest ─┐
confluence-publish ─┼─→ kg-core ←─ (reads) ─ kg-content
query-service     ─┤                            ↑
claude-code-access ┘                            │
local-agent ─────────────── (reads entities) ───┤
kg-viz ──────────────────── (reads entities) ───┘
```

- `kg-core` depends on nothing in this repo. If it ever needs to import from a
  component that talks to Confluence, the abstraction is wrong.
- `kg-content` is data. It conforms to the schema but does not depend on code, and
  nothing should require code to be readable.
- **Integration components never import each other.** `confluence-publish` and
  `query-service` both need to read the graph; both go through `kg-core`, not
  through each other. This is the rule most likely to be broken under time
  pressure, and the one whose violation costs the most later.
- Shared behaviour that two integrations need belongs in `kg-core`, or it is not
  shared behaviour.
- **`local-agent`'s exception to "dependencies point inward to `kg-core`" ended
  2026-09-08 (decision 21 in `docs/decision-log.md`).** It had used its own
  minimal grounding format, deliberately outside this diagram, to test whether
  structured grounding was valuable at all before committing to `kg-core`'s full
  schema. `kg-content` was still empty when that question was answered, so the
  exception was retired rather than left to accumulate a second, permanently
  diverging schema: `local-agent` now reads `kg-content` entities directly, per
  `kg-core`'s status vocabulary, like any other consumer.

### The `meta/` tier

`meta/` holds work that doesn't ship as part of the architecture agent product
(the agent, its skills, the knowledge graph) — see
[`../meta/README.md`](../meta/README.md) for the full definition. Originally scoped
to components that observe the *process* of building this project rather than
participating in it; widened by decision 22 in `docs/decision-log.md` to also cover
general-purpose capabilities that are useful along the journey of building and
operating the product without being part of its own delivery (the first is
`meta/idea-to-presentation`). It sits outside the dependency graph above, with one
hard rule:

**Nothing under `components/` may depend on anything under `meta/`.**

The rationale differs by kind, but the rule doesn't. A self-observation meta
component is tied to this project's own history and would be meaningless elsewhere.
A general-purpose meta capability has its own independent incubation lifecycle,
moving at its own pace for its own audience. Either way, a dependency from a
component to a meta component would tie the shipped product's fate to something
outside its own delivery — quietly making that component non-extractable, which is the
property this whole model exists to protect.

### The `practice/` tier

`practice/` holds the Architecture practice's own business work — Jira
initiatives, practice roadmaps, capability and maturity assessments, process
models — see [`../practice/README.md`](../practice/README.md) for the full
definition. Added by decision 26 in `docs/decision-log.md`, because the two
tiers above are both about *building a product*, and a deliverable owed to the
org with a Jira ticket and no code in it is neither the product nor a capability
incubated beside it. It sits outside the dependency graph above, with the same
hard rule in a stronger form:

**Nothing under `components/` or `meta/` may depend on anything under
`practice/`.**

Stronger because `practice/` content is partly owned *outside this repo
entirely* — the roadmap page that grounds `practice/capability-maturity/` is
The Head of Architecture's, and can be superseded in a meeting this repo never sees. Code
depending on it would break for reasons invisible from the codebase. There is
no executable code under `practice/` today, so the rule currently governs
citations and generated content rather than imports; it is stated now rather
than after the first violation.

The three tiers form one test on *what a thing is*, not what it is about — all
three are about architecture:

| Tier | Test |
|---|---|
| `components/` | Does it ship as part of the architecture agent product? |
| `meta/` | Is it useful while building the product, without shipping with it? |
| `practice/` | Is it work owed to the org, that happens not to be software? |

## Contracts

Each component owns a `README.md` stating its purpose, its boundary, what it
depends on, and what would be involved in extracting it. That README is the
contract; if a change makes the README wrong, the change needs to update it.

Cross-component communication happens through the schema and the filesystem, not
through internal function calls. Concretely: a component reads entity files (or
calls `kg-core`), and never reaches into another component's internals. This keeps
the eventual transport swap — local file reads becoming HTTP calls to
`query-service` — a change in one place.

**The Status column above is a one-line mirror of each component's own
`README.md` "Status" section, not a second source of truth.** Any change
that updates a component's Status section updates this row in the same
change — this table existing at all is exactly the kind of second copy
`docs/backlog.md`'s "Project dashboard" idea was deferred over, so the one
already here doesn't get to drift the way the deferred one would have.
(Caught drifting once already, 2026-09-11: this row said `kg-content` was
`Empty` after decision 21 had already given it its first entity.)

**A document that applies specifically to one component — a research
report, a design note, an eval set — gets a pointer from that component's
own `README.md` in the same change that produces it**, so a fresh session
asking "what's the state of X" finds it by reading X's contract rather
than by knowing to search `docs/` separately. `docs/kg-format-research.md`
is the first case of this; see `kg-core/README.md`'s "Related work".

## Promotion criteria

A component is ready to be promoted out of this repo when all of these hold:

1. It has a stated, stable contract that consumers rely on.
2. It depends only on `kg-core`'s contract, not on its internals.
3. It has its own tests, and they pass without the rest of the repo present.
4. It needs its own release cadence, deployment lifecycle, or ownership — this is
   the actual trigger; the first three are readiness, not motivation.

`query-service` is the most likely first candidate, because it is the only
component that must be deployed and promoted through
`development → staging → production` on the org path. Deployment lifecycle is
exactly the kind of pressure that justifies a separate project.

`kg-content` is the least likely to move but the most valuable to keep clean — it
is the asset. Tooling is replaceable; the curated graph is not.

## Anti-patterns to avoid

- **A shared `utils` or `common` component.** It becomes the coupling everything
  routes through, and it is never extractable. Duplicate a little instead.
- **Integration logic leaking into `kg-content`.** Confluence page ids in
  frontmatter are the deliberate exception, and even that is written by tooling
  rather than by hand.
- **Building `query-service` early.** It is deferred for good reasons; a
  network-reachable service with no stable schema behind it is churn with
  deployment ceremony attached.
- **Splitting a component before it has a second consumer.** Boundaries drawn
  from speculation are usually wrong. The six here are drawn from decision 2's
  distinctions, which are grounded in real differences of direction and
  lifecycle — not from guessing.
