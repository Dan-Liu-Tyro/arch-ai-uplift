  // Sized against the layout's own coordinate space: columns are 230 apart,
  // so a radius in single digits renders as an almost invisible speck once
  // the whole graph is framed.
  var NODE_REL_SIZE = 9;

  function nodeVal(n) { return (n.kind === "domain" || n.type === "domain") ? 5 : 3; }

  function ensureGraph() {
    if (Graph) return;
    // preserveDrawingBuffer keeps the last frame readable, so printing the
    // page (decision 63) and "Save image" capture the canvas instead of a
    // blank rectangle -- WebGL clears its buffer after compositing otherwise.
    Graph = ForceGraph3D({ rendererConfig: { antialias: true, alpha: false, preserveDrawingBuffer: true } })(document.getElementById("graph"))
      .backgroundColor(T("bg"))
      .numDimensions(dims)
      .graphData(visibleData())
      .nodeLabel(function (n) { return n.title; })
      // Sized against the layout's own coordinate space: columns are 230
      // apart, so a radius in single digits renders as an almost invisible
      // speck once the whole graph is framed.
      .nodeRelSize(NODE_REL_SIZE)
      .nodeVal(nodeVal)
      // Icon-drawn nodes (actors, and external systems since decision 54)
      // get their own mesh colour key, never their display colour. The
      // library caches one material per colour string, and an icon node's
      // mesh material is made fully transparent (decorateShapes) so its
      // icon overlay shows through. A shared key would share that invisible
      // material: external systems vanished once they shared external
      // actors' light yellow, and a selected node (#ffffff) would vanish
      // alongside white staff (decision 52). The icon overlay still takes
      // nodeDisplayColor, so what the user sees is unchanged.
      .nodeColor(function (n) {
        return hasIcon(n) ? ICON_MESH_COLOR : nodeDisplayColor(n);
      })
      // Still no nodeThreeObject, deliberately. Actors' meshes do get
      // touched (made transparent, in decorateShapes() below), but that
      // happens *after* the library has built its own mesh, from the
      // per-frame loop, not by an accessor running inside node construction
      // -- see that function for why that distinction matters here.
      // No library arrowheads: they are 3D cones sized in world units, so
      // they shrink on zoom-out and read as a blob. Arrowheads are flat
      // screen-space triangles in the #arrows overlay instead (labels.js,
      // decision 64).
      .linkDirectionalArrowLength(0)
      // Direction as motion, not just as an arrowhead: a slow stream of
      // particles running source -> target.
      .linkDirectionalParticles(function (l) { return 3; })
      .linkDirectionalParticleSpeed(0.0035)
      .linkDirectionalParticleWidth(function (l) {
        if (!selected) return 2.6;
        return chainRole(l) ? 4 : 1.4;
      })
      .linkDirectionalParticleColor(function (l) {
        return l.back_edge ? T("particleBack") : T("particle");
      })
      .linkCurvature(function (l) { return l.back_edge ? 0.45 : 0; })
      .linkLabel(function (l) {
        return "<b>" + (l.label || l.predicate) + "</b>" + (l.payload ? "<br/>" + l.payload : "");
      })
      // Edges were too faint to read against the near-black background --
      // 43 of them are the content, so they are nearly opaque.
      .linkColor(function (l) { return edgeDisplayColor(l); })
      .linkWidth(function (l) {
        if (!selected) return 1.6;
        return chainRole(l) ? 3 : 0.4;
      })
      .onNodeClick(function (n) {
        selected = (selected && selected.id === n.id) ? null : n;
        if (selected) openFromGraph(selected);
        else closeDetail();
        repaint();
      })
      .onBackgroundClick(closeDetail);

    // Every node is pinned via fx/fy/fz (see applyLayout()), so d3-force's
    // charge/link/center forces have nothing left to act on -- no tuning
    // needed or applied. This mattered when a second, force-directed view
    // existed (removed; see kg-core/SCHEMA.md's Open items and
    // docs/decision-log.md), which is also why there is no forceCollide-
    // style minimum-separation force here any more.
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

    // Sync from state, not the other way: a browser can restore a checkbox's
    // old checked state on reload, which would silently disagree with the
    // default above.
    document.getElementById("edge-labels-cb").checked = showEdgeLabels;
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
    // Starts collapsed (decision 59): the legend above it is what a reader
    // needs first, and the info panel's provenance text is one click away.
    applyStatsCollapsed();
    document.getElementById("stats-toggle").onclick = function () {
      statsCollapsed = !statsCollapsed;
      applyStatsCollapsed();
    };

    function applyStatsCollapsed() {
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
    }

    // 3d-force-graph sizes its renderer from the container once, at
    // construction, and does not follow the window. Without this, resizing
    // leaves the canvas at its original size and the label overlay -- which
    // reprojects against the live camera -- drifts out of alignment with it.
    window.addEventListener("resize", function () {
      var host = document.getElementById("graph");
      Graph.width(host.clientWidth).height(host.clientHeight);
    });

    // Synced from state for the same reason as the edge-labels checkbox.
    document.getElementById("next-level-cb").checked = nextLevel;
    document.getElementById("next-level-cb").onchange = function (e) {
      nextLevel = e.target.checked;
      buildEdgeLegend();
      repaint();
    };

    document.getElementById("theme-seg").querySelectorAll("button").forEach(function (b) {
      b.onclick = function () { setTheme(b.dataset.theme); };
    });
    // Apply the remembered theme's CSS and button state now that the page
    // exists; the canvas already started in it via T("bg").
    applyThemeChrome(theme);

    document.getElementById("focus-btn").onclick = function () { setFocusMode(true); };
    document.getElementById("focus-exit").onclick = function () { setFocusMode(false); };
    // Single-key shortcuts: "f" toggles focus mode (decision 56), "e" edge
    // labels (decision 57), "n" next-level edges (decision 58), "t" light/dark
    // theme (decision 63), left arrow
    // goes back along followed owner links. Never while typing into a field, and never with
    // a modifier -- Cmd/Ctrl+F is the browser's find, and the same rule
    // keeps every future shortcut clear of browser chords.
    var SHORTCUTS = {
      f: function () { setFocusMode(!focusMode); },
      e: function () {
        showEdgeLabels = !showEdgeLabels;
        // The checkbox mirrors state, so the panel never disagrees with it.
        document.getElementById("edge-labels-cb").checked = showEdgeLabels;
        rebuildLabels();
      },
      n: function () {
        nextLevel = !nextLevel;
        document.getElementById("next-level-cb").checked = nextLevel;
        buildEdgeLegend();
        repaint();
      },
      t: function () { setTheme(theme === "light" ? "dark" : "light"); },
      // The pane's back (←) button, from the keyboard (decision 51).
      arrowleft: function () { goBack(); }
    };
    window.addEventListener("keydown", function (e) {
      var action = SHORTCUTS[String(e.key || "").toLowerCase()];
      if (!action) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var t = e.target;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName || "")) return;
      if (!DATA) return;
      if (e.preventDefault) e.preventDefault();
      action();
    });
    if (document.addEventListener) {
      document.addEventListener("fullscreenchange", function () {
        // Esc (or any browser-initiated exit) leaves focus mode with it.
        if (!document.fullscreenElement && focusMode) setFocusMode(false);
        // The window has changed size; refit once it has settled.
        else setTimeout(frameGraph, 150);
      });
    }

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
      if (!hasIcon(n)) continue;
      var obj = n.__threeObj;
      if (!obj || !obj.material) continue;
      obj.material.transparent = true;
      obj.material.opacity = 0;
    }
  }
