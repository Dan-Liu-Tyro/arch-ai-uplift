# AI-DLC Solution Architecture

**Provenance: authored here.** This repo is the source of truth for this
artefact. The content is the user's own synthesis, captured from a per-slide
narration and rewritten as a document. Two outputs are generated *from* this
file and are never edited directly: a presentation deck (needed first) and a
Confluence page (later). See decision 46 in
[`../../docs/decision-log.md`](../../docs/decision-log.md) for why the
document, not the deck, is the artefact.

**Audience:** the CTO. **Status:** draft under review — see
[`review-notes.md`](review-notes.md) for gaps identified against this draft,
which are reviewer commentary and not part of the architecture.

**Structure note.** Each numbered section below is one slide's worth of
content, in presentation order, so the projection into slides is mechanical.
Section headings are the slide titles.

---

## 1. Organizational Knowledge versus World Knowledge

At the highest level, all knowledge that can power our AI agents splits into
two categories, separated by the organizational boundary.

**World knowledge** is everything outside the organization. **Organizational
knowledge** is everything inside it — and it is both our focus and our moat.

The key principle: **world knowledge cannot be consumed directly.** It has to
cross a bridge — a translation step — before an agent can rely on it. Once
translated, it *becomes* organizational knowledge.

### World knowledge, from broad to specific

1. **The entire internet** — the broadest and least curated.
2. **The large language model's baked-in wisdom** — the general reasoning
   carried in the model's weights.
3. **Software engineering knowledge in general** — patterns and frameworks.
4. **Industry and domain standards** — payment card scheme rules, regulatory
   frameworks, reference domain models.

### Organizational knowledge, anchored in the architectural perspective

- How our own payment services are designed and how they interact.
- Our internal API contracts and data models.
- Our architecture principles and decision records.
- Our interpreted compliance rulings.

### The bridge

World knowledge flows in, gets interpreted and contextualized, and becomes
trusted organizational knowledge. **That is where both the value and the risk
concentrate.** Translated knowledge always carries lineage back to its source,
so it can be kept fresh.

---

## 2. Inside Organizational Knowledge — First-Party versus Third-Party

### First-party knowledge

*Knowledge you author yourself — born inside the organization and owned end to
end.*

- **Requirements knowledge** — requirement documents.
- **Architectural knowledge** — solution architectures, principles, decision
  records.
- **Security knowledge** — threat models, standards, controls.
- **Engineering knowledge** — code patterns, API contracts.
- **Platform knowledge** — infrastructure, deployment.
- **The current system view** — the asset registry of what is actually
  deployed.

### Third-party knowledge

*Knowledge that starts as world knowledge but gets contextualized until it
becomes yours.*

- Our organization's specific ruling on how a card scheme rule applies to our
  payment flows.
- Our interpretation of a regulatory requirement, turned into internal policy.

### The separating test

**Is there a tight, traceable lineage back to an external source we must keep
in sync?**

- **Yes** → third-party.
- **No — it is a genuine synthesis of our own** → first-party.

---

## 3. First-Party Knowledge by Stream

Eight streams, in delivery order.

| Stream | Owns | Examples |
|---|---|---|
| **Product** | The what and why | Requirement documents, product specs, user stories, roadmaps |
| **Design** | The experience and interaction | User flows, wireframes, design system components, accessibility standards |
| **Architecture** | System structure and its evolution over time | Solution architectures, architecture principles, architecture patterns, decision records, the reference domain model, the current-state view, the target-state architecture with the roadmap bridging them |
| **Engineering** | How it is actually built | Source code repository, technical detailed design including API contracts, database schemas and migrations, coding standards, documentation, dependencies |
| **Quality Engineering** | How we prove it works | Test strategies, test cases, quality gates, coverage standards |
| **Security** | How we keep it safe | Security standards and controls, threat models, interpreted compliance rulings, secure coding standards |
| **Operations** | How we run it | Runbooks, incident response playbooks, on-call procedures, service level objectives |
| **Platform** | The foundation it runs on, including the AI platform | Infrastructure as code, deployment pipelines, the asset registry, environment configuration, and AI-specific knowledge — AI resources, AI tooling, and access control for those AI resources |

---

## 4. The Form of Knowledge

### The foundational axis: tacit versus explicit

**Tacit knowledge** lives in people's heads and **cannot be consumed by an
agent in that state**. **Explicit knowledge** has been captured into an
artifact an agent can reach.

The critical first step is converting tacit into explicit. Until that happens,
a whole layer of our most valuable knowledge is invisible to agents.

### Once explicit: four categories, least to most machine-readable

1. **Noisy unstructured** — the most chaotic. Conversational records: Slack
   threads, ticket comments, meeting notes, meeting recordings.
2. **Deliberate unstructured** — the Confluence-page type. Authored, durable,
   intentional: requirement documents, architecture docs, technical designs,
   decision records.
3. **Semi-structured** — markdown and readme files; tags and metadata labels,
   such as tagged tickets or labelled pages. Some deliberate shape, but still
   not fully queryable.
4. **Structured** — the ordered end. The knowledge graph as the most
   explicitly modeled form, plus database schemas and the asset registry.

---

## 5. The Economics of Knowledge Form

*As knowledge becomes more structured, agents get more accurate — though the
cost benefit only really kicks in at the structured tier.*

### Accuracy

Agent accuracy rises steadily as knowledge becomes more structured.

- **Noisy unstructured** — lowest accuracy. The agent is inferring signal from
  messy, often contradictory chatter.
- **Deliberate unstructured** — moderate. The prose is coherent and authored,
  but accuracy still depends on the agent's reading comprehension holding up.
- **Semi-structured** — good. Metadata constrains the space for the agent to
  get things wrong.
- **Structured** — near deterministic. A query returns a correct answer or
  none at all; there is no interpretation step to fail.

### Token efficiency

- **Noisy unstructured** — most expensive. The agent has to ingest large
  volumes of raw material just to extract signal.
- **Deliberate unstructured** and **semi-structured** — roughly the same cost
  as each other. Tags help the agent find the right section, but do not reduce
  how much it has to read once it is there.
- **Structured** — drops sharply to near zero. At the limit, a query or a
  simple script answers the question with no agent inference at all.

### The upshot

**Accuracy improves gradually across all four tiers, but the token efficiency
gain is not gradual — it is a step change that only really pays off once
knowledge crosses into the structured tier.**

---

## 6. Current State Architecture

### Top layer — AI tooling, used ad hoc

Claude and Atlassian's Rovo agent, picked up occasionally by individuals for
one-off tasks: drafting something, summarizing a ticket.

### Middle layer — humans, the mandatory intermediary

Each person draws selectively and unevenly from the knowledge layer beneath
them, depending on their role and habits. One person relies mostly on their
own tacit knowledge; another is the one who actually reads the architecture
docs; another lives mostly in Slack threads.

Delivery happens through human-to-human communication across the eight streams
in order — Product, Design, Architecture, Engineering, Quality Engineering,
Security, Operations, Platform — **each stream handing context to the next
entirely through people relaying it to each other.**

### Bottom layer — the knowledge layer

The substrate everyone is drawing from unevenly. It contains:

- **Tacit knowledge**, held only in people's heads.
- **Noisy unstructured knowledge** — Slack threads, ticket comments, meeting
  notes and recordings.
- **Deliberate unstructured knowledge** — requirement documents, architecture
  docs, technical designs, decision records.

### Takeaway

Knowledge access today is fragmented and person-dependent, AI is a side tool,
and every cross-stream handoff still runs entirely through humans.

---

## 7. Tactical Solution — Stream-Level Agents

### Top layer — humans

Still steering and still making the judgment calls, but now delegating more of
the day-to-day retrieval work to the layer below them instead of doing
everything themselves.

### Middle layer — AI agents, one per stream

No longer ad hoc: a standing part of each stream's workflow.

How much each stream's agent leans on semi-structured versus unstructured
knowledge varies by that stream's technical maturity. A stream like Product,
which is not heavily technical, might still work mostly off deliberate
unstructured content — requirement docs and meeting notes — **and that is
acceptable as long as there is a validation step in place**, a human check or
review gate, rather than blind trust in the agent's read. More technical
streams can lean further into semi-structured, tagged content for more
reliable retrieval.

### Bottom layer — the knowledge layer, emphasis on unstructured and semi-structured

- A deliberate **tagging and labelling effort** layered on top of existing
  noisy and deliberate unstructured content, specifically so agents can
  consume more of it.
- Critically, this is also where the organization **starts actively converting
  tacit knowledge into explicit knowledge for the first time** — capturing
  decisions, rationale and experience that used to live only in people's
  heads, since agents cannot consume it any other way. That conversion effort
  is what grows the pool of usable knowledge over time, not just tagging what
  already existed.

### The critical caveat

**This is still not an organizational, shared knowledge layer.** It is
federated: each of the eight streams builds its own agent and tags its own
knowledge independently, with no common schema or vocabulary guaranteeing
consistency across streams yet.

### Takeaway

This step makes each stream faster on its own while also beginning to unlock
tacit knowledge for the first time — but it trades organizational consistency
for speed, and validation gates matter most wherever a stream still relies
heavily on unstructured input.

---

## 8. Target State Architecture

### Top layer — humans

Steering the overall direction and evolution of the AI-DLC, and handling
exceptions — stepping in for the edge cases and judgment calls that fall
outside what agent-to-agent communication can resolve on its own.

### Middle layer — AI agents, one per domain

Each owns its own domain knowledge. The key shift: **agent-to-agent
communication becomes the primary driver of the DLC** — Architecture's agent
talking directly to Engineering's agent, Engineering's to Quality
Engineering's, and so on across the streams, rather than every handoff routing
through a human as it did in the tactical stage.

### Bottom layer — the knowledge layer, pushed toward structured

The knowledge graph, schemas, the asset registry.

**Each piece of knowledge is owned by exactly one agent** — the single source
of truth responsible for keeping it accurate and current. Knowledge is shared
and queryable across domains, but other agents access it *through its owner*
rather than maintaining their own duplicate copy. That is what keeps
agent-to-agent communication trustworthy instead of creating conflicting
sources of truth.

### Takeaway

The target state completes the shift from human-mediated to agent-mediated
delivery. Humans move from being the relay for every handoff to being the
directional and exception-handling layer, while structured knowledge with
clear ownership is what makes machine-to-machine collaboration reliable enough
to drive the AI-DLC.
