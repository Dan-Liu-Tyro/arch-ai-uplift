  // There used to be a second view (`domain-authority`) that grouped and
  // coloured by category instead of stage, since it had no stages of its
  // own -- removed along with `not_authoritative_for` as a relationship
  // type (see kg-core/SCHEMA.md's Open items). Only one view left, so these
  // no longer branch on which one it is.
  function groupKeyOf(node) {
    return node.stage;
  }

  function groupsForView() {
    return view.stages.map(function (s, i) {
      return { key: s.id, label: s.ordinal + ". " + s.title, color: T("stages")[i % T("stages").length] };
    });
  }

  // Node colour means *what a node is*, and nothing else. It used to mean
  // two things at once: a domain took its stage's colour while a non-domain
  // took its kind's, so green meant "stage-3 domain" and gold meant "an
  // actor, any stage" -- a reader could not tell whether a colour was
  // telling them what something is or where it sits. Stage is already
  // carried twice over by the bands (tint plus caption), so colour is a
  // single, honest encoding of kind instead.
  function colorFor(node) {
    return colorForKey(presentationKey(node), presentationFor(node).color);
  }

  function hiddenSet() {
    if (!hiddenGroups[view.id]) hiddenGroups[view.id] = {};
    return hiddenGroups[view.id];
  }

  function isHidden(node) { return !!hiddenSet()[groupKeyOf(node)]; }

  // Scope never hides -- it dims. Asked for explicitly: a domain filtered out
  // of an "acquirer" view is often exactly the boundary you are trying to see.
  function isDimmedByScope(node) {
    if (scopeMode === "all") return false;
    if (!node.scope) return true;
    return node.scope !== scopeMode;
  }

  // ---- What a selection highlights (decision 58) --------------------------
  //
  // Off (the default): the selected node's direct edges and neighbours.
  // "Next-level edges" on (N): one level further in the same direction --
  // the upstream neighbours' own upstream edges, and the downstream
  // neighbours' own downstream edges -- tinted orange (feeds this) and
  // green (fed by this), the Inbound/Outbound colours the detail pane
  // already uses. Measured on the payments flow: a median of 7 nodes lit,
  // against 4 with it off. The first version followed the chain to the end
  // (median 19 of 26) and the user found it too much.
  //
  // The extra level never follows a feedback arc (back_edge): it loops to
  // an earlier stage. A feedback arc touching the selected node itself is
  // still a direct edge, as it is with the option off.
  var chainCache = { key: null };

  function chainState() {
    var vis = visibleData();
    var key = (selected ? selected.id : "") + "|" + nextLevel + "|" + vis.links.length + "|" +
      Object.keys(hiddenSet()).join(",");
    if (chainCache.key === key) return chainCache;
    var roles = {}, nodes = {};
    if (selected) {
      var sel = selected.id;
      var upN = {}, downN = {};
      nodes[sel] = true;
      vis.links.forEach(function (l) {
        var s = srcId(l), t = tgtId(l);
        if (s === sel) { roles[linkKey(l)] = "down"; nodes[t] = true; downN[t] = true; }
        else if (t === sel) { roles[linkKey(l)] = "up"; nodes[s] = true; upN[s] = true; }
      });
      if (nextLevel) {
        vis.links.forEach(function (l) {
          if (l.back_edge || roles[linkKey(l)]) return;
          var s = srcId(l), t = tgtId(l);
          if (downN[s]) { roles[linkKey(l)] = "down"; nodes[t] = true; }
          else if (upN[t]) { roles[linkKey(l)] = "up"; nodes[s] = true; }
        });
      }
    }
    chainCache = { key: key, roles: roles, nodes: nodes };
    return chainCache;
  }

  // "up", "down", or null: whether a link is part of the current selection's
  // highlight, and on which side of the selected node.
  function chainRole(l) {
    return selected ? (chainState().roles[linkKey(l)] || null) : null;
  }

  function highlightIds() {
    return chainState().nodes;
  }

  // Selected-state edge colour: tinted by side with next-level edges on,
  // the long-standing single green (feedback arcs pink) with it off.
  function chainEdgeColor(l, role) {
    if (l.back_edge) return T("backSel");
    if (!nextLevel) return T("down");
    return role === "up" ? T("up") : T("down");
  }

  // The single source of truth for "what colour is this edge right now",
  // shared by the canvas line and its flat arrowhead (labels.js) so the two
  // can never disagree about highlighting or dimming.
  function edgeDisplayColor(l) {
    if (selected) {
      var role = chainRole(l);
      if (!role) return T("dimEdge");
      return chainEdgeColor(l, role);
    }
    if (l.back_edge) return T("back");
    return T("flow");
  }

  // The single source of truth for "what colour is this node right now",
  // selection and scope dimming included -- shared by the 3D mesh's
  // nodeColor() accessor and the 2D actor icon overlay, so the two never
  // drift into disagreeing about which nodes are highlighted or dimmed.
  function nodeDisplayColor(node) {
    var base = colorFor(node);
    if (selected) {
      var keep = highlightIds();
      if (node.id === selected.id) return T("selNode");
      if (!keep[node.id]) return T("dimNode");
      return base;
    }
    if (isDimmedByScope(node)) return T("scopeDim");
    return base;
  }

  function visibleData() {
    var nodes = view.nodes.filter(function (n) { return !isHidden(n); });
    var ids = {};
    nodes.forEach(function (n) { ids[n.id] = true; });
    var links = view.links.filter(function (l) {
      return ids[srcId(l)] && ids[tgtId(l)];
    });
    return { nodes: nodes, links: links };
  }

  // After the force engine runs, link.source/target are node objects, not ids.
  function srcId(l) { return typeof l.source === "object" ? l.source.id : l.source; }
  function tgtId(l) { return typeof l.target === "object" ? l.target.id : l.target; }

  function buildAdjacency() {
    adjacency = {};
    view.nodes.forEach(function (n) { adjacency[n.id] = { out: [], in: [] }; });
    view.links.forEach(function (l) {
      var s = srcId(l), t = tgtId(l);
      if (adjacency[s]) adjacency[s].out.push(l);
      if (adjacency[t]) adjacency[t].in.push(l);
    });
  }

  function applyLayout() {
    view.nodes.forEach(function (n) {
      n.fx = n.col * COL_SPACING;
      n.fy = (n.lane - 1) * LANE_HEIGHT + n.row * ROW_SPACING - LANE_HEIGHT;
      n.fz = 0;
      // Seed x/y/z as well, not just the fx/fy/fz pins. zoomToFit() reads
      // x/y/z to compute bounds, and a node whose x is still undefined
      // yields NaN bounds and a camera that points nowhere -- which looks
      // exactly like an empty canvas. The force engine would normally copy
      // fx->x on init, but seeding directly removes the dependency on that
      // having happened before the first fit.
      n.x = n.fx; n.y = n.fy; n.z = 0;
    });
  }
