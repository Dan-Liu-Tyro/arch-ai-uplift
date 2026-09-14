# `practice/` — the Architecture practice's own business work

This tier holds work the Architecture stream owes the organisation: Jira
initiatives, practice roadmaps, capability and maturity assessments, process
models, and the leadership artefacts that carry them. It is the third top-level
tier in this repo, added by decision 26 in
[`../docs/decision-log.md`](../docs/decision-log.md).

## The three-tier test

Each top-level tier answers a different question about what a thing *is*, not
what it is about. Topic is not the axis — all three tiers are about
architecture.

| Tier | Holds | Test |
|---|---|---|
| `components/` | The architecture agent product — the agent, its skills, the knowledge graph | Does it ship as part of the product? |
| `meta/` | Capabilities and self-observation useful along the journey | Is it useful while building the product, without shipping with it? |
| `practice/` | The Architecture practice's business process and deliverables | Is it work owed to the org, that happens not to be software? |

`practice/` exists because the first two tiers are both about *building a
product*, and a capability maturity assessment is not a product at all. It is a
deliverable with a Jira ticket, an audience of architects and leadership, and no
code in it. Decision 22 already sharpened `meta/`'s test to **delivery** rather
than topic; on that same axis this work is neither the delivery nor a capability
incubated beside it, which is why it needed its own tier rather than a third
widening of `meta/`'s charter.

## Hard rule

**Nothing under `components/` or `meta/` may depend on anything under
`practice/`.**

Same shape as the existing rule protecting `components/` from `meta/`, and for a
stronger reason: `practice/` content is partly owned *outside this repo*
entirely, and often lives in Confluence under active manual edit. IN-563's
source of truth is a live Confluence page; the Head of Architecture owns the
practice transformation roadmap it has to reconcile with. An artefact here can
be superseded by a decision taken in a meeting this repo never sees. Code that
depended on it would break for reasons invisible from the codebase.

`practice/` contains no executable code, so the rule is currently about
citations and generated content rather than imports — but it is the rule that
keeps the product extractable, so it is stated now rather than after the first
violation.

## Provenance is part of the contract

Every artefact here states, at the top, which of these it is:

- **Snapshot** — content owned elsewhere, mirrored here for grounding.
  Re-fetch rather than hand-edit. `docs/program-roadmap.md` is the existing
  example of this shape.
- **Authored here** — this repo is the source of truth, and it is published
  outward (the decision-5 pattern: curate in git, generate outward).
- **Derived** — built here from a cited source owned elsewhere. States what it
  was derived from and what it adds, so a reader can tell which claims are the
  source's and which are ours.

This is not ceremony. `docs/program-roadmap.md` needed exactly this header to
stop it being hand-edited into divergence from the Confluence page it mirrors,
and decisions 12–16 are a record of what happens when a slide, a Jira ticket and
a roadmap page each drift into being a third source of truth. An artefact that
does not say where its content came from will be treated as authoritative
anyway.

## Contents

| Area | Purpose | Jira | Status |
|---|---|---|---|
| [`capability-maturity/`](capability-maturity/) | Maps AI SDLC initiatives onto the Architecture Capability & Process Map, with current/target AI-maturity per row | [IN-563](https://tyropaymentsltd.atlassian.net/browse/IN-563) | Mapping drafted; CP1 ready to run |

## Status

New (2026-09-14). One area, `capability-maturity/`, for IN-563.

**Existing instances of this tier's content are deliberately still outside it**,
and moving them is a separate change, not an oversight:

- `docs/program-roadmap.md` — a snapshot of the program's Confluence milestone
  tracker, structurally a `practice/` artefact. Cited by path from many
  decision-log entries, so relocating it breaks cross-references and needs its
  own pass.
- The slide-26 CTB pack (`AI SDLC/slide/`) — lives outside this repo entirely.
  Decisions 12–16 record the work; no artefact here.
- Jira initiative sync (IN-562 … IN-570) — exists as decision-log prose plus the
  deferred `jira-management` idea in `docs/backlog.md`. IN-563 is the first real
  demand for it, since this tier now needs a local work item mapped to a remote
  initiative.

See decision 26's "deliberately not done" note in `../docs/decision-log.md`.
