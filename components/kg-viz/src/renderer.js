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
      .nodeColor(function (n) {
        var base = colorFor(n);
        if (selected) {
          var keep = neighbourIds(selected);
          if (n.id === selected.id) return "#ffffff";
          if (!keep[n.id]) return "rgba(110,120,140,0.18)";
          return base;
        }
        if (isDimmedByScope(n)) return "rgba(110,120,140,0.22)";
        return base;
      })
      // Still no nodeThreeObject, deliberately. Actors do get a person
      // silhouette, but it is applied by decorateShapes() *after* the
      // library has built its own mesh, not by an accessor running inside
      // node construction -- see that function for why that distinction
      // matters here.
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
      if (statsCollapsed) panel.classList.add("collapsed");
      else panel.classList.remove("collapsed");
      document.getElementById("stats-toggle").title = statsCollapsed ? "Expand" : "Collapse";
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
  // "work with the live object, not a constructor" approach personify() uses
  // above and for the same reason -- there is still no reachable THREE.MOUSE
  // enum to build a value from. What *is* reachable is the controls
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

  // ---- Shapes: a person silhouette for actors ------------------------------
  //
  // Why this is done by mutating the library's own meshes rather than by a
  // `nodeThreeObject` accessor: the vendored bundle reads `window.THREE` if
  // the host provides one and otherwise falls back to its own minified
  // classes, which it never exports. So there is no THREE constructor
  // reachable from here -- the same wall that made `three-spritetext` throw
  // on every node and leave the canvas blank while the panel looked healthy.
  // What *is* reachable is any live object's instance methods, so a head is
  // a `clone()` of the body the library already built, shrunk and raised.
  // No constructors, no new dependency, and nothing running inside node
  // construction that can take the scene down.
  //
  // Fidelity is set by the size on screen, not by ambition: an actor renders
  // at nodeRelSize 9 x nodeVal 3, roughly a 10px dot at the default framing,
  // where arms and legs would be pixel mud. Head-plus-body is what actually
  // reads, and the task is "which steps involve people", not portraiture.
  var shapeWarned = false;

  function personify(obj) {
    var geo = obj.geometry;
    var r = (geo && geo.parameters && geo.parameters.radius) || 10;
    // Clone before adding anything, or the head gets a head.
    var head = obj.clone();
    head.scale.set(0.58, 0.58, 0.58);
    // Sits just clear of the body, so the pair reads as one figure rather
    // than two stacked dots. The body is left unscaled on purpose: scaling
    // the parent would multiply this offset and the two would drift apart.
    head.position.set(0, r * 1.3, 0);
    obj.add(head);
    // clone() copies the material *reference*, not the material itself
    // (three.js's Mesh.copy does `this.material = source.material`) -- so
    // head and body start out sharing one object. That snapshot goes stale
    // the moment selection or scope dimming changes: the library reacts to
    // a new nodeColor() result by looking up a *different* cached material
    // and reassigning it onto the body's mesh, never onto the head, which
    // is a separate object nobody told about the swap. Keep a direct
    // reference so decorateShapes() can re-sync it every frame instead.
    obj.__head = head;
  }

  // Idempotent and self-healing: a view switch or a filter change makes the
  // library build fresh meshes, which arrive without the marker and get
  // decorated on the next frame.
  function decorateShapes() {
    if (!Graph || !DATA) return;
    var nodes = visibleData().nodes;
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (presentationFor(n).shape !== "person") continue;
      var obj = n.__threeObj;
      if (!obj) continue;
      if (obj.__personified) {
        // The recolour this keeps up with runs every frame too (selection,
        // scope dimming), so the sync has to be per-frame, not one-shot.
        if (obj.__head && obj.__head.material !== obj.material) {
          obj.__head.material = obj.material;
        }
        continue;
      }
      if (!obj.clone || !obj.add) continue;
      try {
        personify(obj);
        obj.__personified = true;
      } catch (e) {
        // Never let a cosmetic flourish cost the graph. Degrade to the
        // default sphere, and say so once -- an unexplained shape change is
        // the kind of silent difference this component keeps getting caught
        // by, so it announces itself rather than just looking wrong.
        obj.__personified = true;
        if (!shapeWarned) {
          shapeWarned = true;
          note("<b>Actor shapes unavailable</b> — falling back to plain " +
            "spheres. Colour still distinguishes actors; only the silhouette " +
            "is missing. (" + escapeHtml(String(e && e.message || e)) + ")");
        }
      }
    }
  }
