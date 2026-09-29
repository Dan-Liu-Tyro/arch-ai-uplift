#!/usr/bin/env python3
"""Generate payments.json from kg-content, for kg-viz's browser UI to render.

Stdlib only, no deps. Emits one view: `payments-target-state`, the overlay
graph in kg-content/entities/graphs/payments-target-state.json. Sparse,
directed and typed, with a real predicate and payload on every edge. Nodes
that are domains are declared as a `domain_ref` and have their
title/category/scope resolved from domains.json here, so domain facts are
never duplicated.

There used to be a second view, `domain-authority` -- all 39 domains linked
by `not_authoritative_for` edges. Removed: that relationship type never had
a consumer beyond this view, and the view itself was a dense,
mostly-non-mutual, single-predicate graph that read as noise rather than
structure. Non-authority is domain-level text only now
(`authority.not_authoritative_for` in domains.json); see
`kg-core/SCHEMA.md`'s Open items and `docs/decision-log.md` for the record.
One side effect worth naming: the removed view was also the only place any
file-per-entity node (principle/pattern/guardrail/reference-architecture/
system/decision) appeared in kg-viz at all. Today that is exactly one
entity (a single `principle`) -- not a meaningful loss in practice, but a
real gap if that count grows before a replacement view exists.

`domain` entities live in one consolidated file (kg-content/entities/
domains.json, a scoped exception to kg-core's usual one-file-per-entity
convention -- see SCHEMA.md's `domain` section). Every other entity type is
still one file per entity; nothing here reads them any more (see above).

Run directly to regenerate payments.json from whatever is currently in
kg-content: `python3 components/kg-viz/generate.py`
"""

from __future__ import annotations

import datetime
import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
KG_CONTENT_ENTITIES = REPO_ROOT / "components" / "kg-content" / "entities"
DOMAINS_JSON = KG_CONTENT_ENTITIES / "domains.json"
GRAPHS_DIR = KG_CONTENT_ENTITIES / "graphs"
# The only output. knowledge-visualizer.html starts empty and loads whatever
# file the user opens, so there is no bundled-data variant of this to keep in
# step -- an earlier `graph-data.js` wrapper existed to let the page auto-load
# from file://, and was dropped when the viewer became explicitly file-driven.
#
# Named `payments.json`, deliberately distinct from GRAPHS_DIR's
# `payments-target-state.json` above: this file was briefly named identically
# to that source overlay (decision 39), and picking the wrong one of two
# same-named files in different directories produced a real "not a Knowledge
# Visualizer graph file" error the same session it shipped (decision 40).
OUTPUT = Path(__file__).resolve().parent / "payments.json"


def _load_domains() -> dict:
    return json.loads(DOMAINS_JSON.read_text(encoding="utf-8"))


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


def _titled_naf(domain: dict, by_id: dict) -> list:
    """A domain's `{content, ref, unresolved?}` items (decision 49), each
    resolvable ref gaining a derived `ref_title`: most owners are domains
    outside the flow view, so the viewer has no node to read a title from."""
    return [
        {**item, "ref_title": by_id[item["ref"]]["title"]}
        if item.get("ref") in by_id else dict(item)
        for item in domain["authority"]["not_authoritative_for"]
    ]


def _domain_index(by_id: dict) -> dict:
    """Every domain's pane-level facts, keyed by id, so clicking an owner in
    the "Not authoritative for" section can show that domain even when it
    has no node in this flow. Derived from domains.json like everything
    else here -- the viewer still derives nothing itself."""
    return {
        d_id: {
            "title": d["title"],
            "category": d.get("category"),
            "scope": d.get("scope"),
            "scope_note": d.get("scope_note"),
            "status": d.get("status"),
            "purpose": d.get("purpose", ""),
            "not_authoritative_for": _titled_naf(d, by_id),
        }
        for d_id, d in by_id.items()
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
                # Carried through, not interpreted: the overlay declares an
                # actor's role and the viewer decides how a role looks. Whether
                # a role counts as internal or external to Tyro is presentation
                # grouping, so it is deliberately not derived here -- storing it
                # would create a second field that can contradict this one.
                "actor_type": n.get("actor_type"),
                "category": domain["category"] if domain else None,
                "scope": domain["scope"] if domain else None,
                "scope_note": domain.get("scope_note") if domain else None,
                "status": domain["status"] if domain else data["status"],
                "purpose": domain["purpose"] if domain else "",
                "authority": n.get("responsibility", ""),
                "responsibility": n.get("responsibility", ""),
                # Explicit non-authority, node-level text only -- see the
                # module docstring for why this is no longer a graph edge.
                # Each `{content, ref, unresolved?}` item (decision 49) gains
                # a derived `ref_title`, resolved here like every other
                # domain fact: most owners are domains outside this flow, so
                # the viewer has no node to read a title from.
                "not_authoritative_for": _titled_naf(domain, by_id) if domain else [],
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
        # Absent means `derived`, per graph.schema.json (decision 61).
        "provenance": data.get("provenance", "derived"),
        "nodes": nodes,
        "links": links,
        "domain_index": _domain_index(by_id),
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
    payments = _payments_target_state_view(domains_data)
    if not payments:
        # There is exactly one view now (see module docstring for why the
        # other one was removed) -- with nothing to fall back to, a missing
        # overlay graph is a hard failure, not a silently empty output.
        raise RuntimeError(
            f"{GRAPHS_DIR / 'payments-target-state.json'} not found -- "
            "there is no other view left to fall back to."
        )
    graph = {
        "generated_from": "components/kg-content",
        # Surfaced in the UI so "am I looking at current data?" is answerable
        # by reading the screen rather than by trusting a reload.
        "generated_at": datetime.datetime.now().replace(microsecond=0).isoformat(),
        "default_view": "payments-target-state",
        "views": [payments],
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
