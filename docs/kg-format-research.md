# KG representation format research

Research input to `docs/decision-log.md`'s open "Define the KG schema" next
step, prompted by the Mermaid discussion below. **Not a decision** — this
compares candidate formats for the *typed, queryable* graph layer (entity +
relationship storage), now that Mermaid has been separated out as a
presentation layer generated from that data, not the data itself. Fold the
outcome into `docs/decision-log.md` and `components/kg-core/SCHEMA.md`'s
open items once the user actually chooses.

## Evaluation criteria, in the same priority order `SCHEMA.md` already uses

Taken directly from this project's own stated goals, not from general
"which KG format is best" advice, since the right answer depends entirely on
what the graph is for here:

1. Supports typed relationships with source→target constraints, and makes
   contradiction detection and dependency tracing possible.
2. Readable and reviewable as plain text — PR review is the only quality
   gate (decision 1), and there is realistically one primary author.
3. Mechanically generatable into Confluence pages and Mermaid views.
4. Low authoring friction for both a human architect and an LLM agent
   (Claude Code, Arc) writing or editing an entity.
5. Fits the org's language standards if `kg-core` ever needs real code
   (Kotlin preferred — `docs/component-model.md`), and has a credible,
   *currently maintained* upgrade path to a real query engine if traversal
   needs outgrow flat files (decision 1's own stated revisit trigger) —
   without betting on tooling that is not actively maintained today.
6. Zero new infrastructure now (decision 1's "zero extra infra" rationale);
   hundreds of nodes is the expected scale for the foreseeable future.

## Candidates surveyed

### 1. RDF (Turtle) + OWL + SPARQL + SHACL — the W3C semantic-web stack

Triples (`subject predicate object`), with OWL layering a formal ontology
(class hierarchies, property constraints) on top, SPARQL as the query
language, and **SHACL** (a W3C Recommendation) as a declarative
constraint/validation layer — shapes that state cardinality (`sh:minCount`),
allowed types (`sh:class`), enumerated values (`sh:in`), and even arbitrary
custom logic (`sh:sparql`), validated against a data graph mechanically.
([W3C SHACL spec](https://www.w3.org/TR/shacl/); background on validate vs.
inference use cases via
[Ontotext](https://www.ontotext.com/knowledgehub/fundamentals/what-is-shacl/) and
[Fluree](https://medium.com/fluree/what-is-shacl-with-examples-2697f659d465))

- **Strong, and worth taking seriously**: SHACL is close to a ready-made
  answer to `SCHEMA.md`'s own "Validation rules" section. "Every `guardrail`
  needs at least one `derives_from`" is `sh:minCount 1`; "relationship keys
  respect source→target types" is a `sh:class` constraint on the property's
  range. OWL reasoners (Protégé, Apache Jena) can also *infer* some
  contradictions automatically rather than relying on a hand-written
  traversal rule — genuinely differentiated capability, not just a nicer
  syntax.
- **Against the fit criteria**: Turtle is verbose and unfamiliar to
  architects who aren't semantic-web specialists; authoring it by hand in a
  PR is a real adoption barrier for a one-person-team project (criterion 4).
  There is no standard mapping from "one entity, one file, filename = id"
  (load-bearing for `SCHEMA.md`'s id-uniqueness guarantee) onto a triple
  store, which is normally one graph, not one file per subject. Tooling is
  JVM-heavy (Apache Jena fits Kotlin reasonably well) but the ecosystem
  outside Java/Python is thin, and the ceremony (ontology + shapes + triples
  as three separate artifacts) is disproportionate to hundreds of nodes with
  one author.

### 2. Property graph + Cypher / openCypher / **GQL**

Nodes carry labels + properties; relationships carry a type + properties.
This is structurally almost identical to what `SCHEMA.md` already drew
informally (six typed node kinds, nine typed relationship keys). Querying
was historically Neo4j-proprietary Cypher, but **GQL (ISO/IEC 39075:2024)**
was published in April 2024 as a vendor-neutral ISO standard — the first new
ISO database-language standard since SQL in 1987 — specifically to make
property-graph querying portable across implementations rather than tied to
one vendor.
([ISO/IEC 39075:2024](https://www.iso.org/standard/76120.html);
[Neo4j's own account of GQL's creation](https://neo4j.com/blog/cypher-and-gql/gql-database-language-standard/))

- **Strong**: the mental model is the one this project already independently
  arrived at, and it is now backed by an actual ISO standard, not just one
  vendor's product — undercuts any "Mermaid is standard, this would be
  invented" framing, since GQL is the more directly relevant standard for
  *this* problem (typed graphs) than a diagramming DSL is.
  Query ergonomics for exactly the traversal this project wants
  (`MATCH (p:Pattern)-[:REQUIRES]->(g:Guardrail)`) are better than
  hand-rolled traversal over parsed YAML.
- **Against the fit criteria**: property graphs are a *database* model —
  there is no standard flat-text serialization analogous to Turtle for RDF.
  Storing "the data" would still mean YAML/JSON/CSV files, with GQL/Cypher
  only entering at *query* time via an embedded or deployed engine — which
  is a `kg-core` implementation detail, not an authoring-format choice, and
  doesn't replace the need to decide the file format at all.
  Practically important: property graphs also **lack built-in semantic
  rigor** — no standard subclass hierarchy, no inference engine — so
  contradiction detection has to be hand-written either way, same as the
  current YAML approach; GQL doesn't buy back what SHACL/OWL offers on that
  front.
  ([RDF vs. property graph tradeoffs, TigerGraph](https://www.tigergraph.com/blog/rdf-vs-property-graph-choosing-the-right-foundation-for-knowledge-graphs/);
  [Neo4j's own comparison](https://neo4j.com/blog/knowledge-graph/rdf-vs-property-graphs-knowledge-graphs/))
- **Caution surfaced by this research, relevant to any future v2 plan**:
  the embeddable property-graph databases that would let `kg-core` use
  Cypher/GQL locally without deploying a server are in a shakier state than
  expected. **Kuzu**, the most-cited embeddable Cypher-speaking option with
  Java/JVM bindings, was archived in October 2025 after its team was
  acquired by Apple; maintenance has passed to unofficial community forks.
  [ArcadeDB](https://arcadedb.com/embedded.html) is reportedly the
  remaining actively-maintained open-source embeddable option with Cypher
  support, but that wasn't independently verified beyond this search pass.
  This doesn't block anything now (decision 1 already defers a real graph
  engine), but it's a concrete reason not to pre-commit to a specific
  embeddable engine today — the ecosystem moved meaningfully in the last
  year and could move again.

### 3. JSON-LD

JSON with an `@context` block that maps keys to RDF-compatible IRIs, giving
JSON documents web-scale linked-data semantics.
([JSON-LD 1.1 spec](https://w3c.github.io/json-ld-syntax/))

- **Strong**: plain JSON is maximally LLM- and tool-friendly; `@context`
  gives a controlled vocabulary similar in spirit to `SCHEMA.md`'s
  relationship-type table, and it's a real W3C-track standard.
- **Against the fit criteria**: the `@context` layer is real, reported
  authoring overhead — nested objects, arrays-of-objects, and context
  resolution add ceremony disproportionate to the benefit when nothing else
  in this project's stack consumes linked data today (no SPARQL endpoint, no
  external semantic-web integration). Industry commentary bears this out
  directly: most teams "choose convenience over the grand vision of the
  semantic web, opting for JSON document data stores," precisely because
  JSON-LD's interoperability promise costs more in authoring complexity than
  it returns for teams that aren't already federating across external linked
  datasets.
  ([Fluree's account of JSON-LD adoption](https://flur.ee/fluree-blog/what-is-json-ld/))
  Nothing in this project's stated goals asks for that kind of external
  interop — Confluence output is generated, not linked-data-consumed.

### 4. Plain structured YAML/JSON with typed keys (current `SCHEMA.md` direction)

Frontmatter with explicit relationship keys (`derives_from`, `requires`,
`conflicts_with`, ...), one entity per file, filename as id.

- **Strong on every fit criterion that isn't "built-in reasoning"**: diffs
  are small and semantic (a one-line addition), directly reviewable in a PR;
  every language including Kotlin has mature YAML/JSON parsing; LLMs are
  extremely reliable at reading and writing YAML frontmatter; zero new
  infrastructure; and there's real precedent for exactly this pattern —
  Obsidian, Dendron, and Foam all use markdown + YAML frontmatter as a
  git-friendly, human-and-tool-readable graph substrate, and the recommended
  practice in that community is the same split this project already has:
  "structured frontmatter for typed relationships, inline links for richer
  context, giving AI reliable typed relationships for navigation."
  ([Building a knowledge graph in Markdown](https://www.jamescroft.co.uk/building-out-your-knowledge-graph-in-markdown/);
  [Dendron frontmatter](https://wiki.dendron.so/notes/ffec2853-c0e0-4165-a368-339db12c8e4b/))
- **Honest weakness**: no free reasoner. Contradiction detection and
  validation-rule checking (`SCHEMA.md`'s "Validation rules" section) are
  imperative code someone writes and maintains, not a declarative shape a
  standard engine executes. At hundreds of nodes with one primary author,
  this is a real but bounded cost, not a blocker.

### Dismissed without a full write-up

- **GraphQL SDL** — a common confusion given the name, but it's an API
  *query-shape* language over existing data sources, not a knowledge-graph
  storage or representation format. Doesn't compete in this comparison.
- **Mermaid, PlantUML, Structurizr DSL** — already settled as generated
  *views*, not storage, in the preceding discussion. Not re-litigated here.

## Comparison at a glance

| | RDF/OWL/SHACL | Property graph (GQL) | JSON-LD | YAML/MD frontmatter (current) |
|---|---|---|---|---|
| Typed relationships, source→target constraints | Yes, plus free inference | Yes, model matches `SCHEMA.md` directly | Partial, via `@context` | Yes, by convention + a validator script |
| Contradiction detection mechanism | Declarative, reasoner-backed (real differentiator) | Hand-written traversal | Hand-written traversal | Hand-written traversal |
| Declarative validation available off the shelf | Yes — SHACL | No standard equivalent | JSON Schema, bolted on | No — would be bespoke, SHACL-inspired at best |
| Git diff / PR review fit | Poor (verbose, no natural one-file-per-entity mapping) | N/A (no standard flat serialization) | Fair (nested, but JSON) | Excellent (small, semantic diffs) |
| LLM authoring reliability | Moderate (unfamiliar syntax) | N/A (query language, not authoring format) | Moderate (context ceremony) | High |
| Zero new infra today | No | No (needs an engine even embedded) | Yes | Yes |
| Industry-standard status | W3C Recommendation | ISO/IEC 39075:2024 | W3C, in progress | No formal standard, but real prior art (Obsidian/Dendron/Foam) |
| Credible today, low-risk upgrade path if traversal outgrows flat files | Apache Jena (JVM) is mature | GQL is now vendor-neutral, but the embeddable-engine landscape just lost its leading option (Kuzu archived Oct 2025) | N/A | N/A — this is the question the upgrade path answers |

## Recommendation

**Keep authoring in Markdown + YAML frontmatter** — this isn't a
re-affirmation for its own sake; the research changes *why* it's the right
call, not the call itself:

- On every criterion this project actually ranked highest — PR-diff
  quality, LLM authoring reliability, zero infra, one-file-per-entity id
  uniqueness — it wins outright, and has real non-Tyro-specific prior art
  (Obsidian/Dendron/Foam) rather than being a bespoke invention.
- The one thing it genuinely gives up — declarative, reasoner-backed
  contradiction detection — is real and worth naming plainly rather than
  glossing over. Property graphs don't buy that back either (they share
  YAML's "hand-written traversal" row in the table above); only the RDF/OWL
  stack has it, at a syntax and tooling cost this project's scale doesn't
  justify.

Two concrete things worth doing *because* of this research, short of
switching formats:

1. **When `SCHEMA.md`'s "Validation rules... checkable by script later"
   actually gets built, design it as declarative per-type shape rules
   (required keys, cardinality, allowed relationship-target types,
   symmetric-conflict checking) rather than ad hoc imperative code** —
   borrowing SHACL's *idea*, not its syntax or tooling. That keeps the
   validator itself reviewable and makes it double as schema documentation,
   which is the actual benefit SHACL offers, decoupled from RDF/Turtle.
2. **If flat-file traversal ever does outgrow what this project needs**
   (decision 1's own stated revisit trigger), prefer a GQL-compliant engine
   over vendor-specific Cypher when that day comes, since GQL is now the
   vendor-neutral standard — but re-verify the embeddable-engine landscape
   at that time rather than assuming today's options (Kuzu is archived as
   of this research) are still current. This is a note for that future
   decision, not an action now.

## What this doesn't decide

This is input to `docs/decision-log.md`'s still-open "Define the KG schema"
next step and `SCHEMA.md`'s own open items, not a decision itself. If the
recommendation above holds after review, the concrete next action is folding
it into a `docs/decision-log.md` entry (formalizing why YAML/frontmatter was
chosen over the alternatives, now with evidence rather than just "it's what
we started with") and updating `SCHEMA.md`'s "Validation rules" section to
point at the declarative-shape approach once it's actually designed.
