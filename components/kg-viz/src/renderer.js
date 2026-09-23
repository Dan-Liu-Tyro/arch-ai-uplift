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
      // No nodeThreeObject: default spheres only. Labels are HTML, positioned
      // over the canvas -- see rebuildLabels(). Keeping this accessor unset
      // means there is no application code running inside the render loop
      // that can take the scene down.
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

    document.getElementById("dim-seg").querySelectorAll("button").forEach(function (b) {
      b.onclick = function () {
        dims = parseInt(b.dataset.dim, 10);
        document.getElementById("dim-seg").querySelectorAll("button").forEach(function (x) {
          x.className = x === b ? "on" : "";
        });
        Graph.numDimensions(dims);
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
