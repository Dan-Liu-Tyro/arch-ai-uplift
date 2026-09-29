# query-service

**Deferred to v2. Do not build this yet.**

A network-reachable query interface over the graph, so cloud-hosted Rovo (or any
other remote consumer) can traverse it directly rather than relying on indexed
Confluence pages.

## Why it is deferred

Rovo is cloud-hosted and cannot reach a local repo. Anything Rovo queries directly
has to be deployed on the org path: TAP/CTAP via Schooner and Jetstream CRDs,
GitOps through ArgoCD, promoted `development → staging → production` with Drydock,
and a Change Request for production.

That is a real deployment commitment, and it buys nothing until the schema is
stable and there is enough curated content to traverse. Until then, publishing
generated pages into a clean Confluence space gives Rovo adequate grounding with
no infrastructure at all.

## What would justify building it

- Rovo needs traversal that page-level retrieval cannot express — the honest test
  is a specific question that the published space demonstrably answers badly.
- Contradiction detection needs to run as a service rather than as a review-time
  check.
- Another consumer appears that is not Rovo and not Claude Code.

## Boundary, when it exists

**Known now — purpose.** Give a remote consumer (Rovo, or any other agent that
isn't Claude Code and can't read this repo's filesystem) access to the curated
architecture knowledge, as a thin transport over `kg-core`. Schema and traversal
logic stay in `kg-core`; if this component starts accumulating graph logic, that
logic belongs in the core instead.

**Not yet defined — the protocol.** "Network-reachable" and "thin transport" are
committed; the actual wire protocol is not. MCP is a plausible candidate — Rovo
already speaks MCP for the Atlassian connector, so it would be a familiar shape
for that side to consume — but nothing here has chosen it over a plain REST or
GraphQL API. That choice is deliberately left open until this component is
actually built; picking it now, before the schema is stable or a real consumer
need is demonstrated, would be exactly the premature-infrastructure this
project's `least-infrastructure-first` pattern argues against. See the open
question in `docs/decision-log.md`.

**In scope, once the protocol is chosen** — the query surface itself, auth,
deployment manifests, the transport.

**Out of scope regardless of protocol** — schema and traversal logic, which stay
in `kg-core`.

## Extraction notes

The most likely component to be promoted out of this repo, and the clearest case
for it: it is the only one requiring its own deployment lifecycle, environment
promotion, and CR process. Those pressures are exactly what a separate project
exists to absorb.

Design it from the start as a thin layer over `kg-core`, so that promoting it means
moving a transport and depending on the core as a library — not disentangling graph
logic from HTTP handlers.
