#!/usr/bin/env python3
"""Generate graph.json from kg-content, for kg-viz's browser UI to render.

Stdlib only, no deps. Emits *two views* over the same content, because they
answer different questions and drawing them on one canvas is unreadable:

- `domain-authority` -- all 39 domains plus any file-per-entity entities,
  linked by `not_authoritative_for`. A dense negative-assertion graph
  (average degree ~15), so it is only legible with the category toggles the
  UI provides.
- `payments-target-state` -- the overlay graph in
  kg-content/entities/graphs/payments-target-state.json. Sparse, directed and
  typed, with a real predicate and payload on every edge. Nodes that are
  domains are declared as a `domain_ref` and have their title/category/scope
  resolved from domains.json here, so domain facts are never duplicated.

`domain` entities live in one consolidated file (kg-content/entities/
domains.json, a scoped exception to kg-core's usual one-file-per-entity
convention -- see SCHEMA.md's `domain` section) with real, structured
`not_authoritative_for` relationships already resolved at ingestion time.
This script no longer infers edges from prose -- that fuzzy-matching pass was
retired once relationships became first-class data; see
docs/domain-model-experiment.md for why. Every other entity type is still one
file per entity, parsed by regex the same way
components/local-agent/ui/server.py already does, to avoid a YAML dependency.

Run directly to regenerate graph.json from whatever is currently in
kg-content: `python3 components/kg-viz/generate.py`
"""

from __future__ import annotations

import datetime
import json
import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
KG_CONTENT_ENTITIES = REPO_ROOT / "components" / "kg-content" / "entities"
DOMAINS_JSON = KG_CONTENT_ENTITIES / "domains.json"
GRAPHS_DIR = KG_CONTENT_ENTITIES / "graphs"
OUTPUT = Path(__file__).resolve().parent / "graph.json"

FRONTMATTER_KV_RE = re.compile(r"^([a-z_]+):\s*(.+?)\s*$", re.MULTILINE)

# `not_authoritative_for` is a negative, directional assertion, and the source
# prose that produced each edge was not carried through ingestion (only the
# resolved target id was). So the per-edge description is derived from the
# predicate rather than quoted -- see README's "Known gaps".
AUTHORITY_PREDICATE = "not_authoritative_for"
AUTHORITY_DESCRIPTION = (
    "{source} is explicitly NOT authoritative for a concern that {target} owns. "
    "Directional: it does not imply {target} defers to {source}."
)


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
                "kind": fm["type"],
                "category": fm.get("category"),
                "scope": fm.get("scope"),
                "status": fm.get("status", "unknown"),
                "purpose": purpose,
                "authority": "",
            }
        )
    return nodes


def _load_domains() -> dict:
    return json.loads(DOMAINS_JSON.read_text(encoding="utf-8"))


def _domain_authority_view(domains_data: dict) -> dict:
    nodes = []
    links = []
    unresolved = []
    titles = {d["id"]: d["title"] for d in domains_data["domains"]}

    for d in domains_data["domains"]:
        owns = "; ".join(d["authority"]["owns"])
        not_auth = "; ".join(d["authority"]["not_authoritative_for"])
        nodes.append(
            {
                "id": d["id"],
                "title": d["title"],
                "type": "domain",
                "kind": "domain",
                "category": d["category"],
                "scope": d["scope"],
                "scope_note": d.get("scope_note"),
                "status": d["status"],
                "purpose": d["purpose"],
                "authority": f"Owns: {owns}. Not authoritative for: {not_auth}.",
            }
        )
        for rel in d["relationships"]:
            if "target" in rel:
                links.append(
                    {
                        "source": d["id"],
                        "target": rel["target"],
                        "predicate": rel["type"],
                        "label": "not authoritative for",
                        "description": AUTHORITY_DESCRIPTION.format(
                            source=d["title"],
                            target=titles.get(rel["target"], rel["target"]),
                        ),
                    }
                )
            else:
                unresolved.append({"source": d["id"], "phrase": rel["target_unresolved"]})

    nodes.extend(_load_file_per_entity_nodes())
    return {
        "id": "domain-authority",
        "title": "Domain Authority Boundaries",
        "description": (
            "Every domain, linked by its own `not_authoritative_for` assertions. "
            "Dense by nature -- use the category toggles to read it."
        ),
        "layout": "force",
        "nodes": nodes,
        "links": links,
        "stats": {"unresolved_references": unresolved},
    }


def _find_back_edges(
    node_ids: list[str], links: list[dict], stage_ordinal: dict
) -> set[tuple[str, str]]:
    """Identify which edges to ignore when ranking, so layering can proceed.

    The flow graph is legitimately cyclic -- the merchant initiates via Digital
    Channels *and* consumes cross-domain reports, which closes a loop -- so a
    plain topological layering would leave most nodes unranked.

    Which edge gets cut matters semantically, and a bare DFS decides it by
    visit order: the first version of this cut the three telemetry edges into
    Data Analytics, which pushed a pure sink to the *front* of its lane. So cut
    stage-backward edges first (an edge landing in an earlier stage is the
    honest feedback arc), then DFS the remainder for any intra-stage cycle.
    That makes the choice a property of the model rather than of iteration
    order. Back-edges are reported, not silently dropped, and the UI draws them
    dashed.
    """
    back: set[tuple[str, str]] = {
        (l["source"], l["target"])
        for l in links
        if stage_ordinal[l["target"]] < stage_ordinal[l["source"]]
    }

    outgoing: dict[str, list[str]] = {n: [] for n in node_ids}
    for link in links:
        if (link["source"], link["target"]) not in back:
            outgoing[link["source"]].append(link["target"])

    state = {n: "new" for n in node_ids}

    def visit(start: str) -> None:
        # Explicit stack: recursion depth is fine today but this keeps the
        # function safe on a much larger graph.
        stack = [(start, iter(outgoing[start]))]
        state[start] = "open"
        while stack:
            node, children = stack[-1]
            advanced = False
            for child in children:
                if state[child] == "open":
                    back.add((node, child))
                elif state[child] == "new":
                    state[child] = "open"
                    stack.append((child, iter(outgoing[child])))
                    advanced = True
                    break
            if not advanced:
                state[node] = "done"
                stack.pop()

    for node in node_ids:
        if state[node] == "new":
            visit(node)
    return back


def _longest_path_depth(node_ids: list[str], links: list[dict]) -> tuple[dict, list[str]]:
    outgoing: dict[str, list[str]] = {n: [] for n in node_ids}
    indegree = {n: 0 for n in node_ids}
    for link in links:
        outgoing[link["source"]].append(link["target"])
        indegree[link["target"]] += 1

    depth = {n: 0 for n in node_ids}
    queue = [n for n in node_ids if indegree[n] == 0]
    remaining = dict(indegree)
    ranked = []
    while queue:
        node = queue.pop(0)
        ranked.append(node)
        for nxt in outgoing[node]:
            depth[nxt] = max(depth[nxt], depth[node] + 1)
            remaining[nxt] -= 1
            if remaining[nxt] == 0:
                queue.append(nxt)
    return depth, [n for n in node_ids if n not in ranked]


def _layer_positions(nodes: list[dict], links: list[dict]) -> dict:
    """Lay the flow out as swimlanes: one lane per stage, flow depth across.

    Ranking the whole graph by longest path alone produced a 16-column,
    one-node-per-column ribbon that read as a chain and threw away the stage
    decomposition the source actually uses. Instead each stage becomes a lane
    (`lane` = stage ordinal) and depth is computed *within* that stage, so the
    payment path still reads left-to-right but the three stages stay legible as
    bands -- which is also how the source whiteboard is drawn. Cross-stage
    edges then read as hops between lanes, which is the interesting part.
    """
    node_ids = [n["id"] for n in nodes]
    back = _find_back_edges(
        node_ids, links, {n["id"]: n["stage_ordinal"] for n in nodes}
    )
    forward = [l for l in links if (l["source"], l["target"]) not in back]

    stage_of = {n["id"]: n["stage"] for n in nodes}
    lane_of = {n["id"]: n["stage_ordinal"] for n in nodes}
    order_of = {n["id"]: i for i, n in enumerate(nodes)}

    positions: dict[str, dict] = {}
    unranked: list[str] = []
    widest = 0
    for stage in dict.fromkeys(stage_of[n] for n in node_ids):
        members = [n for n in node_ids if stage_of[n] == stage]
        internal = [
            l
            for l in forward
            if stage_of[l["source"]] == stage and stage_of[l["target"]] == stage
        ]
        depth, stuck = _longest_path_depth(members, internal)
        unranked.extend(stuck)
        widest = max(widest, max(depth.values()) + 1)
        cells: dict[int, int] = {}
        for node in sorted(members, key=lambda n: (depth[n], order_of[n])):
            col = depth[node]
            row = cells.get(col, 0)
            cells[col] = row + 1
            positions[node] = {"col": col, "row": row, "lane": lane_of[node]}

    return {
        "positions": positions,
        "back_edges": sorted(back),
        "unranked": unranked,
        "columns": widest,
        "lanes": len({lane_of[n] for n in node_ids}),
    }


def _payments_target_state_view(domains_data: dict) -> dict | None:
    path = GRAPHS_DIR / "payments-target-state.json"
    if not path.exists():
        return None
    data = json.loads(path.read_text(encoding="utf-8"))
    by_id = {d["id"]: d for d in domains_data["domains"]}
    stage_ordinal = {s["id"]: s["ordinal"] for s in data["stages"]}

    nodes = []
    missing_refs = []
    for n in data["nodes"]:
        ref = n.get("domain_ref")
        domain = by_id.get(ref) if ref else None
        if ref and domain is None:
            missing_refs.append(ref)
        nodes.append(
            {
                "id": n["id"],
                "title": domain["title"] if domain else n["title"],
                "type": "domain" if domain else n.get("kind", "node"),
                "kind": n.get("kind", "domain"),
                "category": domain["category"] if domain else None,
                "scope": domain["scope"] if domain else None,
                "scope_note": domain.get("scope_note") if domain else None,
                "status": domain["status"] if domain else data["status"],
                "purpose": domain["purpose"] if domain else "",
                "authority": n.get("responsibility", ""),
                "responsibility": n.get("responsibility", ""),
                "touchpoints": n.get("touchpoints", []),
                "stage": n["stage"],
                "stage_ordinal": stage_ordinal[n["stage"]],
                "boundary": n["boundary"],
                "domain_ref": ref,
            }
        )

    links = [
        {
            "source": e["source"],
            "target": e["target"],
            "predicate": e["predicate"],
            "label": e["predicate"].replace("_", " ").lower(),
            "payload": e["payload"],
            "stage": e["stage"],
            "description": f"{e['predicate'].replace('_', ' ').lower()} — carries: {e['payload']}",
        }
        for e in data["edges"]
    ]

    layered = _layer_positions(nodes, links)
    for node in nodes:
        node.update(layered["positions"][node["id"]])

    back = {tuple(pair) for pair in layered["back_edges"]}
    for link in links:
        link["back_edge"] = (link["source"], link["target"]) in back

    return {
        "id": "payments-target-state",
        "title": data["title"],
        "description": (
            "Directed flow overlay: every edge has a predicate and a payload. "
            "Laid out left-to-right by flow depth, so the payment path reads in order."
        ),
        "layout": "layered",
        "stages": data["stages"],
        "source": data["source"],
        "source_notes": data["source_notes"],
        "nodes": nodes,
        "links": links,
        "stats": {
            "unresolved_domain_refs": missing_refs,
            "back_edges": layered["back_edges"],
            "unranked_nodes": layered["unranked"],
            "columns": layered["columns"],
            "lanes": layered["lanes"],
        },
    }


def generate() -> dict:
    domains_data = _load_domains()
    views = [_domain_authority_view(domains_data)]
    payments = _payments_target_state_view(domains_data)
    if payments:
        views.append(payments)
    graph = {
        "generated_from": "components/kg-content",
        # Surfaced in the UI so "am I looking at current data?" is answerable
        # by reading the screen rather than by trusting a reload.
        "generated_at": datetime.datetime.now().replace(microsecond=0).isoformat(),
        "categories": domains_data["categories"],
        "default_view": "payments-target-state" if payments else "domain-authority",
        "views": views,
    }
    OUTPUT.write_text(json.dumps(graph, indent=2), encoding="utf-8")
    return graph


if __name__ == "__main__":
    result = generate()
    for view in result["views"]:
        extra = ""
        if "unresolved_references" in view["stats"]:
            extra = f", {len(view['stats']['unresolved_references'])} unresolved references"
        if "columns" in view["stats"]:
            extra = f", {view['stats']['columns']} flow columns"
        print(
            f"{view['id']}: {len(view['nodes'])} nodes, "
            f"{len(view['links'])} edges{extra}"
        )
    print(f"-> {OUTPUT}")
