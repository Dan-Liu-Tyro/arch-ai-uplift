#!/usr/bin/env python3
"""Generate graph.json from kg-content, for kg-viz's browser UI to render.

Stdlib only, no deps. `domain` entities live in one consolidated file
(kg-content/entities/domains.json, a scoped exception to kg-core's usual
one-file-per-entity convention -- see SCHEMA.md's `domain` section) with
real, structured `not_authoritative_for` relationships already resolved at
ingestion time. This script no longer infers edges from prose -- that fuzzy-
matching pass was retired once relationships became first-class data; see
docs/domain-model-experiment.md for why. Every other entity type is still one
file per entity, parsed by regex the same way
components/local-agent/ui/server.py already does, to avoid a YAML
dependency.

Run directly to regenerate graph.json from whatever is currently in
kg-content: `python3 components/kg-viz/generate.py`
"""

from __future__ import annotations

import json
import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
KG_CONTENT_ENTITIES = REPO_ROOT / "components" / "kg-content" / "entities"
DOMAINS_JSON = KG_CONTENT_ENTITIES / "domains.json"
OUTPUT = Path(__file__).resolve().parent / "graph.json"

FRONTMATTER_KV_RE = re.compile(r"^([a-z_]+):\s*(.+?)\s*$", re.MULTILINE)


def _parse_frontmatter(text: str) -> dict:
    if not text.startswith("---"):
        return {}
    end = text.find("\n---", 3)
    block = text[3:end] if end != -1 else text[3:]
    return {m.group(1): m.group(2) for m in FRONTMATTER_KV_RE.finditer(block)}


def _extract_section(body: str, name: str) -> str:
    m = re.search(rf"##\s*{re.escape(name)}\s*\n+(.*?)(?=\n##\s|\Z)", body, re.DOTALL)
    return m.group(1).strip() if m else ""


def _load_file_per_entity_nodes() -> list[dict]:
    """Every entity type except `domain` -- still one markdown file each."""
    nodes = []
    for path in sorted(KG_CONTENT_ENTITIES.glob("*/*.md")):
        text = path.read_text(encoding="utf-8")
        fm = _parse_frontmatter(text)
        if "id" not in fm or "type" not in fm:
            continue
        body = text[text.find("\n---", 3) + 4 :] if text.startswith("---") else text
        purpose = _extract_section(body, "Purpose") or _extract_section(body, "Statement")
        nodes.append(
            {
                "id": fm["id"],
                "title": fm.get("title", fm["id"]),
                "type": fm["type"],
                "category": fm.get("category"),
                "status": fm.get("status", "unknown"),
                "purpose": purpose,
                "authority": "",
            }
        )
    return nodes


def _load_domain_nodes_and_links() -> tuple[list[dict], list[dict], list[dict]]:
    data = json.loads(DOMAINS_JSON.read_text(encoding="utf-8"))
    nodes = []
    links = []
    unresolved = []
    for d in data["domains"]:
        owns = "; ".join(d["authority"]["owns"])
        not_auth = "; ".join(d["authority"]["not_authoritative_for"])
        authority_text = f"Owns: {owns}. Not authoritative for: {not_auth}."
        nodes.append(
            {
                "id": d["id"],
                "title": d["title"],
                "type": "domain",
                "category": d["category"],
                "status": d["status"],
                "purpose": d["purpose"],
                "authority": authority_text,
            }
        )
        for rel in d["relationships"]:
            if "target" in rel:
                links.append({"source": d["id"], "target": rel["target"]})
            else:
                unresolved.append({"source": d["id"], "phrase": rel["target_unresolved"]})
    return nodes, links, unresolved


def generate() -> dict:
    domain_nodes, links, unresolved = _load_domain_nodes_and_links()
    nodes = _load_file_per_entity_nodes() + domain_nodes
    graph = {"nodes": nodes, "links": links, "stats": {"unresolved_references": unresolved}}
    OUTPUT.write_text(json.dumps(graph, indent=2), encoding="utf-8")
    return graph


if __name__ == "__main__":
    result = generate()
    total_refs = len(result["links"]) + len(result["stats"]["unresolved_references"])
    print(
        f"{len(result['nodes'])} nodes, {len(result['links'])} resolved edges, "
        f"{len(result['stats']['unresolved_references'])} unresolved references "
        f"out of {total_refs} total cross-domain references -> {OUTPUT}"
    )
