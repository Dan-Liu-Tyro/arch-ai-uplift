  function ensureGraph() {
    if (Graph) return;
    Graph = ForceGraph3D()(document.getElementById("graph"))
      .backgroundColor("#05070d")
      .numDimensions(dims)
      .graphData(visibleData())
      .nodeLabel(function (n) { return n.title; })
      // Sized against the layout's own coordinate space: columns are 230
      // apart, so a radius in single digits renders as an almost invisible
      // speck once the whole graph is framed.
      .nodeRelSize(9)
      .nodeVal(function (n) { return n.kind === "domain" || n.type === "domain" ? 5 : 3; })
      .nodeColor(function (n) { return nodeDisplayColor(n); })
      // Still no nodeThreeObject, deliberately. Actors' meshes do get
      // touched (made transparent, in decorateShapes() below), but that
      // happens *after* the library has built its own mesh, from the
      // per-frame loop, not by an accessor running inside node construction
      // -- see that function for why that distinction matters here.
      .linkDirectionalArrowLength(function (l) { return view.layout === "layered" ? 7 : 0; })
      .linkDirectionalArrowRelPos(0.98)
      // Direction as motion, not just as an arrowhead: a slow stream of
      // particles running source -> target. Only on the flow view -- 296
      // animated edges on the authority graph would be noise, and that graph's
      // single predicate is not directional in a way worth animating.
      .linkDirectionalParticles(function (l) { return view.layout === "layered" ? 3 : 0; })
      .linkDirectionalParticleSpeed(0.0035)
      .linkDirectionalParticleWidth(function (l) {
        if (!selected) return 2.6;
        return (srcId(l) === selected.id || tgtId(l) === selected.id) ? 4 : 1.4;
      })
      .linkDirectionalParticleColor(function (l) {
        return l.back_edge ? "#ff9fae" : "#7ff0c0";
      })
      .linkCurvature(function (l) { return l.back_edge ? 0.45 : 0; })
      .linkLabel(function (l) {
        return "<b>" + (l.label || l.predicate) + "</b>" + (l.payload ? "<br/>" + l.payload : "");
      })
      // Edges were too faint to read against the near-black background. The
      // flow view has 43 of them and they are the content, so they are now
      // nearly opaque; the authority view has 296 and stays restrained to
      // remain legible at all.
      .linkColor(function (l) {
        var s = srcId(l), t = tgtId(l);
        if (selected) {
          var on = s === selected.id || t === selected.id;
          if (!on) return "rgba(110,120,140,0.09)";
          return l.back_edge ? "#ff7e8f" : "#6fe3a8";
        }
        if (l.back_edge) return "rgba(255,140,155,0.9)";
        return view.layout === "layered" ? "rgba(196,212,240,0.85)" : "rgba(140,162,205,0.3)";
      })
      .linkWidth(function (l) {
        if (!selected) return view.layout === "layered" ? 1.6 : 0.5;
        var s = srcId(l), t = tgtId(l);
        return (s === selected.id || t === selected.id) ? 3 : 0.4;
      })
      .onNodeClick(function (n) {
        selected = (selected && selected.id === n.id) ? null : n;
        if (selected) renderDetail(selected);
        else document.getElementById("detail").classList.remove("open");
        repaint();
      })
      .onBackgroundClick(closeDetail);

    // The force view (Ref Domains) has an unforgiving failure mode with no
    // tuning at all: a node with few or no links has nothing pulling it
    // back, so pure charge repulsion pushes it arbitrarily far from
    // everything else -- the README documents exactly one such node, an
    // unconnected `principle`. zoomToFit() then has to zoom out to include
    // wherever that node drifted to, shrinking the entire connected cluster
    // to fit alongside it, which is what made every other node look like an
    // unreadable clump. distanceMax caps how far the repulsive force still
    // has effect, which bounds the drift; a longer link distance gives
    // connected nodes breathing room so individual spheres and labels stop
    // overlapping. Harmless for the layered view -- its nodes are pinned via
    // fx/fy/fz, so no force (this one included) has any visible effect
    // there regardless.
    if (Graph.d3Force) {
      var charge = Graph.d3Force("charge");
      if (charge && charge.strength) charge.strength(-120).distanceMax(260);
      var link = Graph.d3Force("link");
      if (link && link.distance) link.distance(90);
    }

    applyControlMode();

    document.getElementById("dim-seg").querySelectorAll("button").forEach(function (b) {
      b.onclick = function () {
        dims = parseInt(b.dataset.dim, 10);
        document.getElementById("dim-seg").querySelectorAll("button").forEach(function (x) {
          x.className = x === b ? "on" : "";
        });
        Graph.numDimensions(dims);
        applyControlMode();
        setTimeout(frameGraph, 350);
      };
    });

    document.getElementById("scope-seg").querySelectorAll("button").forEach(function (b) {
      b.onclick = function () {
        scopeMode = b.dataset.scope;
        document.getElementById("scope-seg").querySelectorAll("button").forEach(function (x) {
          x.className = x === b ? "on" : "";
        });
        repaint();
      };
    });

    document.getElementById("labels-cb").onchange = function (e) {
      showLabels = e.target.checked;
      rebuildLabels();
    };

    document.getElementById("edge-labels-cb").onchange = function (e) {
      showEdgeLabels = e.target.checked;
      rebuildLabels();
    };

    document.getElementById("bands-cb").onchange = function (e) {
      showBands = e.target.checked;
      rebuildBands();
    };

    document.getElementById("elabel-seg").querySelectorAll("button").forEach(function (b) {
      b.onclick = function () {
        edgeLabelStyle = b.dataset.style;
        document.getElementById("elabel-seg").querySelectorAll("button").forEach(function (x) {
          x.className = x === b ? "on" : "";
        });
        rebuildLabels();
      };
    });

    document.getElementById("fit-btn").onclick = function () { frameGraph(); };
    document.getElementById("reset-layout-btn").onclick = function () { resetLayout(); };

    // Collapsed state lives in a plain variable, not read back from the
    // element's own classList, because the CSS class is the *effect* and
    // this is the one place that decides it -- same pattern as showLabels
    // and the other toggles above, rather than treating the DOM as storage.
    document.getElementById("stats-toggle").onclick = function () {
      statsCollapsed = !statsCollapsed;
      var panel = document.getElementById("stats");
      var toggle = document.getElementById("stats-toggle");
      if (statsCollapsed) {
        panel.classList.add("collapsed");
        // Collapsed reads as "this is the info panel" -- an info glyph.
        toggle.innerHTML = "&#9432;";
        toggle.title = "Expand";
      } else {
        panel.classList.remove("collapsed");
        // Expanded reads as "click to shrink me" -- a minimize glyph, not
        // the same info icon repeated, which never signalled the action.
        toggle.innerHTML = "&#8722;";
        toggle.title = "Collapse";
      }
    };

    // 3d-force-graph sizes its renderer from the container once, at
    // construction, and does not follow the window. Without this, resizing
    // leaves the canvas at its original size and the label overlay -- which
    // reprojects against the live camera -- drifts out of alignment with it.
    window.addEventListener("resize", function () {
      var host = document.getElementById("graph");
      Graph.width(host.clientWidth).height(host.clientHeight);
    });

    document.getElementById("open-btn").onclick = function () {
      document.getElementById("file-input").click();
    };

    document.getElementById("load-default-panel-btn").onclick = loadDefault;

    labelLoop();

    Graph.onEngineStop(function () { frameGraph(); });
  }

  // ---- Controls: pan the plane in 2D, orbit freely in 3D -------------------
  //
  // numDimensions() only clamps node z to 0 inside the force layout (checked
  // against the vendored bundle's own source) -- it never touches the camera
  // or its controls. So the "2D" toggle left the camera exactly as free to
  // orbit as "3D", and a single left-drag could tip a flattened graph out of
  // the plane it was just flattened into.
  //
  // There is no controlType switch for this: the fix is remapping the mouse
  // button on the trackball controls the library already built, the same
  // "work with the live object, not a constructor" approach decorateShapes()
  // uses below and for the same reason -- there is still no reachable
  // THREE.MOUSE enum to build a value from. What *is* reachable is the controls
  // instance's own default button assignments, so the PAN sentinel it
  // already put on RIGHT gets copied onto LEFT for 2D, and LEFT's original
  // (rotate) value is restored for 3D.
  var trackballDefaults = null;

  function applyControlMode() {
    var controls = Graph && Graph.controls && Graph.controls();
    if (!controls || !controls.mouseButtons || !("noRotate" in controls)) return;
    if (!trackballDefaults) {
      trackballDefaults = { LEFT: controls.mouseButtons.LEFT, RIGHT: controls.mouseButtons.RIGHT };
    }
    if (dims === 2) {
      controls.noRotate = true;
      controls.mouseButtons.LEFT = trackballDefaults.RIGHT;
    } else {
      controls.noRotate = false;
      controls.mouseButtons.LEFT = trackballDefaults.LEFT;
    }
  }

  // ---- Shapes: actors render as a 2D icon overlay, never as a mesh --------
  //
  // Actors used to get a cloned-and-raised "head" mesh as a 3D stand-in for
  // a person, because there was (and still is) no reachable THREE.Sprite/
  // Texture to put a real icon on the mesh -- the vendored bundle reads
  // `window.THREE` when the host supplies one and otherwise falls back to
  // its own minified classes, which it never exports. That silhouette is
  // gone now that the HTML icon overlay (`#actor-icons` in labels.js) covers
  // every view, not just 2D: `graph2ScreenCoords()` reprojects correctly
  // under any camera transform, orbiting included, so the flat overlay
  // tracks the node in 3D exactly as it does in 2D -- it just doesn't
  // rotate *with* the scene, which is the point, not a limitation, now that
  // every view shows the same flat icon.
  //
  // The mesh itself is never deleted -- it is still what onNodeClick's
  // raycasting hit-tests against -- only made fully transparent, in every
  // view. Opacity, not `.visible`: the raycaster skips invisible objects
  // but not transparent ones. Re-asserted every frame because a recolour
  // (selection, scope dimming) can swap in a *different* cached material at
  // any time -- a one-time set would not survive that.
  function decorateShapes() {
    if (!Graph || !DATA) return;
    var nodes = visibleData().nodes;
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (presentationFor(n).shape !== "person") continue;
      var obj = n.__threeObj;
      if (!obj || !obj.material) continue;
      obj.material.transparent = true;
      obj.material.opacity = 0;
    }
  }
