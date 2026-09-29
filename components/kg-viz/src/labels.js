  // ---- Node labels as an HTML overlay -------------------------------------
  //
  // Labels were originally SpriteText objects from `three-spritetext`. That
  // failed in the browser with an opaque cross-origin "Script error." while
  // `3d-force-graph` itself loaded fine: the sprite library expects a global
  // THREE, and 3d-force-graph bundles its own without exposing it. Because
  // the accessor ran inside the render loop, every node threw and the canvas
  // stayed empty next to a perfectly healthy control panel.
  //
  // Positioning plain HTML over the canvas via graph2ScreenCoords() removes
  // that dependency entirely, and is better on its own merits: text stays
  // crisp at any zoom instead of being a scaled texture, it is styleable in
  // CSS, and it cannot take the scene down. Cost is one rAF loop reprojecting
  // 26-40 points, which is nothing.
  var labelEls = {};
  var edgeEls = {};
  var nodeById = {};

  var LABEL_DY = 11;        // node label sits this far below the node marker
  var LABEL_LINE_H = 14;    // 11px font, one line, plus leading -- fallback only

  // ---- Actor icons: the same HTML-overlay trick, every view -----------------
  //
  // Actors have no reachable THREE.Sprite/Texture to put a real icon on
  // their mesh (the vendored bundle never exports the THREE classes it
  // falls back to), so this is the same trick #labels already relies on:
  // an HTML element reprojected via graph2ScreenCoords() every frame. That
  // works under any camera transform, orbiting included -- there is no 2D-
  // only restriction here, unlike applyControlMode()'s pan-vs-orbit split,
  // because graph2ScreenCoords() itself does not care how the camera got
  // where it is. The actor's own mesh is made fully transparent everywhere
  // (see decorateShapes() in renderer.js) so this overlay is the only thing
  // that ever represents an actor on screen, in every view.
  //
  // The glyph itself carries the actor's role colour (fill="currentColor",
  // set per node in positionIcons() from the same nodeDisplayColor() the 3D
  // mesh uses) rather than sitting on a coloured circle -- no badge, so
  // selection/scope highlighting stays visually consistent with every other
  // node kind without a separate background to keep in sync.
  var iconEls = {};
  var PERSON_ICON_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true">' +
    '<circle cx="12" cy="7.4" r="4.4" fill="currentColor"/>' +
    '<path d="M12 13c-4.6 0-8.4 3.6-8.4 8.4V22h16.8v-0.6C20.4 16.6 16.6 13 12 13z" fill="currentColor"/>' +
    '</svg>';

  function rebuildIcons() {
    var vis = visibleData();
    var host = document.getElementById("actor-icons");
    host.innerHTML = "";
    iconEls = {};
    vis.nodes.forEach(function (n) {
      if (presentationFor(n).shape !== "person") return;
      var el = document.createElement("div");
      el.className = "actor-icon";
      el.innerHTML = PERSON_ICON_SVG;
      host.appendChild(el);
      iconEls[n.id] = el;
    });
    // Matches positionLabels() being called inside rebuildLabels() rather
    // than left to the next animation frame: a freshly created div has no
    // transform yet, so without this it would flash at the CSS default of
    // (0,0) for one frame -- the same "first paint with stale geometry" flash
    // labels.js's own rebuild already avoids for the same reason.
    positionIcons();
  }

  function positionIcons() {
    if (!Graph) return;
    var ids = Object.keys(iconEls);
    if (!ids.length) return;
    for (var i = 0; i < ids.length; i++) {
      var id = ids[i];
      var n = nodeById[id];
      var el = iconEls[id];
      if (!n || !isFinite(n.x) || !isFinite(n.y)) { el.style.display = "none"; continue; }
      var p = Graph.graph2ScreenCoords(n.x, n.y, isFinite(n.z) ? n.z : 0);
      if (!p || !isFinite(p.x)) { el.style.display = "none"; continue; }
      el.style.display = "flex";
      el.style.transform = "translate(-50%, -50%) translate(" + p.x + "px," + p.y + "px)";
      // currentColor drives both the glyph's fill and, via .sel below, the
      // glow's tint -- one property, so they can't fall out of step.
      el.style.color = nodeDisplayColor(n);
      el.className = "actor-icon" + (selected && selected.id === n.id ? " sel" : "");
    }
  }

  function shortTitle(n) {
    return String(n.title).replace(/ Domain$/, "");
  }

  // A node label's footprint in screen pixels, or zeroes when labels are off.
  // Both the band fit and the camera fit have to leave room for text they do
  // not own, and neither can assume a world-space size for it: these are
  // fixed-size HTML elements, so the footprint is pixels at any zoom.
  // offsetWidth is authoritative in a browser; the character estimate is the
  // fallback under a stubbed DOM (verify.js), and matches claim() below.
  function labelBoxPx(n) {
    var el = showLabels ? labelEls[n.id] : null;
    if (!el) return { w: 0, h: 0 };
    return {
      w: el.offsetWidth || String(el.textContent).length * 5.6,
      h: el.offsetHeight || LABEL_LINE_H
    };
  }

  // Edge labels use the same overlay. The predicate is the single most
  // informative thing about an edge in this graph -- a typed relationship is
  // the reason the flow view exists at all -- so hover-only was hiding the
  // content. Drawn at the edge midpoint.
  //
  // The global toggle is off by default (decision 53): 43 predicates at once
  // crowd the flow. Selecting a node labels that node's own edges whatever
  // the toggle says, because a selection is exactly the question "what does
  // this step exchange with its neighbours". So an edge label shows iff
  // (a node is selected) ? (the edge touches it) : (the toggle is on).
  function edgeText(l) {
    return String(l.label || l.predicate || "").replace(/_/g, " ");
  }

  function linkKey(l) { return srcId(l) + "->" + tgtId(l) + ":" + (l.predicate || ""); }

  function rebuildLabels() {
    var vis = visibleData();
    nodeById = {};
    vis.nodes.forEach(function (n) { nodeById[n.id] = n; });

    var host = document.getElementById("labels");
    host.innerHTML = "";
    labelEls = {};
    edgeEls = {};

    if (showLabels) {
      vis.nodes.forEach(function (n) {
        var el = document.createElement("div");
        el.className = "nlabel";
        el.textContent = shortTitle(n);
        host.appendChild(el);
        labelEls[n.id] = el;
      });
    }
    if (showEdgeLabels || selected) {
      vis.links.forEach(function (l) {
        var el = document.createElement("div");
        el.className = "elabel";
        el.textContent = edgeText(l);
        host.appendChild(el);
        edgeEls[linkKey(l)] = el;
      });
    }
    positionLabels();
    // Same node membership as the labels just rebuilt above -- rebuilding
    // here, rather than at every rebuildLabels() call site, means a future
    // caller can't forget it.
    rebuildIcons();
  }

  // Greedy collision suppression. Text that overlaps other text -- or sits on
  // top of a node -- is worse than absent text, which is exactly what the
  // unfitted view demonstrated: every label legible individually, the whole
  // unreadable. Node labels are placed first and always win; edge labels fill
  // whatever room is left. A suppressed label is still reachable by hovering
  // the node or edge, and by selecting a node.
  var placed = [];

  function claim(el, x, y) {
    var w = el.offsetWidth || el.textContent.length * 5.6;
    var h = el.offsetHeight || 12;
    var box = { l: x - w / 2 - 2, r: x + w / 2 + 2, t: y - 1, b: y + h + 1 };
    for (var i = 0; i < placed.length; i++) {
      var o = placed[i];
      if (box.l < o.r && box.r > o.l && box.t < o.b && box.b > o.t) return false;
    }
    placed.push(box);
    return true;
  }

  // `suppress` is opt-in per layer. Node labels are suppressed on collision,
  // because a node's identity is recoverable by clicking it. Edge labels are
  // never suppressed: the predicate is the only place an edge's meaning
  // appears on the canvas, and suppression silently dropped the *longest*
  // ones first -- a bigger box collides more often -- which is exactly
  // backwards, since the longest predicates are the most informative.
  function place(el, p, dy, opts) {
    opts = opts || {};
    if (!p || !isFinite(p.x) || !isFinite(p.y)) { el.style.display = "none"; return false; }
    el.style.display = "block";
    var x = p.x, y = p.y + dy;
    if (opts.rotate !== undefined) {
      el.style.transform = "translate(-50%, -50%) translate(" + x + "px," + y + "px) " +
        "rotate(" + opts.rotate + "deg)";
    } else {
      el.style.transform = "translate(-50%, 0) translate(" + x + "px," + y + "px)";
    }
    if (opts.suppress && !claim(el, x, y)) { el.style.display = "none"; return false; }
    return true;
  }

  // Angle of the edge in screen space, normalised so text never reads upside
  // down: past vertical, flip by 180 degrees rather than mirroring it.
  function edgeAngle(a, b) {
    var deg = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
    if (deg > 90) deg -= 180;
    if (deg < -90) deg += 180;
    return deg;
  }

  function positionLabels() {
    if (!Graph) return;
    var vis = visibleData();
    var keep = selected ? neighbourIds(selected) : null;
    placed = [];

    // Reserve the node markers themselves, so no label ever covers a node.
    for (var k = 0; k < vis.nodes.length; k++) {
      var nn = vis.nodes[k];
      if (!isFinite(nn.x) || !isFinite(nn.y)) continue;
      var np = Graph.graph2ScreenCoords(nn.x, nn.y, isFinite(nn.z) ? nn.z : 0);
      if (np && isFinite(np.x)) {
        placed.push({ l: np.x - 7, r: np.x + 7, t: np.y - 7, b: np.y + 7 });
      }
    }

    if (showLabels) {
      for (var i = 0; i < vis.nodes.length; i++) {
        var n = vis.nodes[i];
        var el = labelEls[n.id];
        if (!el) continue;
        if (!isFinite(n.x) || !isFinite(n.y)) { el.style.display = "none"; continue; }
        var dim = keep ? !keep[n.id] : isDimmedByScope(n);
        el.className = "nlabel" + (dim ? " dim" : "") +
          (selected && selected.id === n.id ? " sel" : "");
        place(el, Graph.graph2ScreenCoords(n.x, n.y, isFinite(n.z) ? n.z : 0), LABEL_DY,
          { suppress: true });
      }
    }

    if (showEdgeLabels || selected) {
      for (var j = 0; j < vis.links.length; j++) {
        var l = vis.links[j];
        var el2 = edgeEls[linkKey(l)];
        if (!el2) continue;
        var on = !selected || srcId(l) === selected.id || tgtId(l) === selected.id;
        // With a node selected, only its own edges are worth labelling.
        if (selected && !on) { el2.style.display = "none"; continue; }
        var a = nodeById[srcId(l)], b = nodeById[tgtId(l)];
        if (!a || !b || !isFinite(a.x) || !isFinite(b.x)) { el2.style.display = "none"; continue; }
        var pa = Graph.graph2ScreenCoords(a.x, a.y, isFinite(a.z) ? a.z : 0);
        var pb = Graph.graph2ScreenCoords(b.x, b.y, isFinite(b.z) ? b.z : 0);
        if (!pa || !pb || !isFinite(pa.x) || !isFinite(pb.x)) { el2.style.display = "none"; continue; }
        var mid = { x: (pa.x + pb.x) / 2, y: (pa.y + pb.y) / 2 };
        el2.className = "elabel" + (l.back_edge ? " back" : "") +
          (edgeLabelStyle === "along" ? " along" : "");
        place(el2, mid, edgeLabelStyle === "along" ? 0 : -6,
          edgeLabelStyle === "along" ? { rotate: edgeAngle(pa, pb) } : {});
      }
    }
  }
