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
      return { key: s.id, label: s.ordinal + ". " + s.title, color: STAGE_COLORS[i % STAGE_COLORS.length] };
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
    return presentationFor(node).color;
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

  // The single source of truth for "what colour is this node right now",
  // selection and scope dimming included -- shared by the 3D mesh's
  // nodeColor() accessor and the 2D actor icon overlay, so the two never
  // drift into disagreeing about which nodes are highlighted or dimmed.
  function nodeDisplayColor(node) {
    var base = colorFor(node);
    if (selected) {
      var keep = neighbourIds(selected);
      if (node.id === selected.id) return "#ffffff";
      if (!keep[node.id]) return "rgba(110,120,140,0.18)";
      return base;
    }
    if (isDimmedByScope(node)) return "rgba(110,120,140,0.22)";
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
