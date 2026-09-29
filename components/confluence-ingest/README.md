# confluence-ingest

Inbound migration aid. Reads the existing 100+ architecture pages from Confluence
and helps turn them into candidate entities for `kg-content`.

## Boundary

**In scope**

- Reading source pages via the Atlassian MCP connector (Confluence read and CQL
  search are available).
- Extracting candidate entities and proposing a type, title, and relationships.
- Emitting drafts with `status: draft` and a `source` URL for provenance.

**Out of scope**

- Writing anything to Confluence — that is `confluence-publish`.
- Deciding what is canonical. This component proposes; a human curates and reviews.

## Depends on

`kg-core` for the schema contract. Never on `confluence-publish`, even though both
talk to Confluence — they move in opposite directions and share nothing but the
schema.

## Status

Not started as tooling, but holds its first real artifact:
`sources/reference-domain-model-domain-definitions.md`, a verbatim cache of
the Confluence page behind the domain-model ingestion experiment (see
[`../../docs/domain-model-experiment.md`](../../docs/domain-model-experiment.md)),
saved manually rather than through any extraction tooling. Otherwise still
blocked on the schema stabilising: extracting entities against a shape that
is still moving means re-extracting.

## Design note

The output must land as `status: draft` rather than `active`. The problem being
solved is that the source pages are inconsistent, so anything derived from them
automatically is a candidate, not canonical knowledge. Ingesting straight to
`active` would reproduce the noise this project exists to remove, just in a tidier
file format.

Provenance matters for the same reason — `source` lets a reviewer check a curated
entity against the page it came from.

## Extraction notes

The most disposable component here. It is throwaway-shaped: heavy use during
migration, near-zero afterwards. Worth resisting the urge to make it elegant, and a
reasonable candidate for deletion rather than promotion once migration is done.
