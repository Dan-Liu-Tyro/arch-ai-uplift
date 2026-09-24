  function labelLoop() {
    positionBands();
    positionLabels();
    requestAnimationFrame(labelLoop);
  }

  function switchView(id) {
    view = DATA.views.find(function (v) { return v.id === id; });
    selected = null;
    // Deliberately NOT reset here: the edge-label choice is the user's and
    // survives a view switch. The authority view's 296 identical predicates
    // are genuinely noisy, but silently overriding a toggle someone just set
    // is worse than letting them turn it off.
    document.getElementById("detail").classList.remove("open");
    buildAdjacency();
    applyLayout();
    Graph.numDimensions(dims).graphData(visibleData());
    buildControls();
    renderStats();
    repaint();
    setTimeout(frameGraph, 350);
  }

  // Framing is done from a real measurement rather than a blind timeout,
  // because "camera pointed at NaN" and "nothing was drawn" look identical.
  // zoomToFit() proved unreliable for the pinned layered view -- it left the
  // graph occupying roughly a quarter of the window regardless of the padding
  // argument, which is what made every session start with a manual zoom. For
  // a fixed planar layout the fit is simple trigonometry, so compute the
  // camera distance directly and stop guessing.
  var FIT_PADDING = 48;      // world-space breathing room around outermost nodes
  var LEFT_INSET = 372;      // control panel keep-out, so the graph is not drawn under it
  // Node labels are a fixed-size HTML overlay (see labels.js), not a 3D
  // sprite that scales with zoom -- so their footprint is a constant number
  // of screen pixels no matter what scale fitLayered() lands on. FIT_PADDING
  // is world-space, so on a large graph (small scale) it shrinks to a handful
  // of screen pixels and stops covering the label at all, which is what
  // clips the outermost names. So reserve this margin in pixels instead.
  // Top and bottom get the same value, for the same reason positionBands()
  // does it: labels hang below a node on screen, and nothing here
  // establishes which world-y direction that is.
  function labelPixelMargins() {
    var halfW = 0, tallest = 0;
    visibleData().nodes.forEach(function (n) {
      var box = labelBoxPx(n);
      if (box.w / 2 > halfW) halfW = box.w / 2;
      if (box.h > tallest) tallest = box.h;
    });
    return { x: halfW + 4, y: tallest ? (LABEL_DY + tallest + 4) : 10 };
  }

  function fitLayered() {
    var pts = visibleData().nodes.filter(function (n) {
      return isFinite(n.x) && isFinite(n.y);
    });
    if (!pts.length) return false;
    var cam = Graph.camera && Graph.camera();
    if (!cam || !cam.fov) return false;

    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    pts.forEach(function (n) {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    });

    var host = document.getElementById("graph");
    var W = host.clientWidth || window.innerWidth || 1200;
    var H = host.clientHeight || window.innerHeight || 800;

    var w = (maxX - minX) || 1;
    var h = (maxY - minY) || 1;
    // Scale in screen px per world unit, honouring the panel keep-out and
    // reserving real screen-pixel room for labels so the graph *and its
    // names* are centred in the space actually visible rather than behind
    // the controls or run off the edge.
    var margin = labelPixelMargins();
    var availW = Math.max(160, W - LEFT_INSET - 2 * margin.x);
    var availH = Math.max(160, H - 2 * margin.y);
    var scale = Math.min(availW / (w + 2 * FIT_PADDING), availH / (h + 2 * FIT_PADDING));

    var fov = cam.fov * Math.PI / 180;
    var dist = (H / scale) / (2 * Math.tan(fov / 2));

    // Shift the look-at point left so the box lands centred inside the
    // available region instead of the full window.
    var cx = (minX + maxX) / 2 - (LEFT_INSET / 2) / scale;
    var cy = (minY + maxY) / 2;
    Graph.cameraPosition({ x: cx, y: cy, z: dist }, { x: cx, y: cy, z: 0 }, 400);
    return true;
  }

  function frameGraph() {
    var vis = visibleData();
    if (!vis.nodes.length) return;
    var finite = vis.nodes.filter(function (n) {
      return isFinite(n.x) && isFinite(n.y);
    });
    if (!finite.length) {
      note("<b>Nodes have no finite coordinates</b> — the camera has nothing " +
        "to frame, so the canvas is empty. This is a layout bug, not a data " +
        "problem: " + vis.nodes.length + " nodes were handed to the renderer.");
      return;
    }
    if (finite.length < vis.nodes.length) {
      note("<b>" + (vis.nodes.length - finite.length) + " of " + vis.nodes.length +
        "</b> nodes have non-finite coordinates and will not be drawn.");
    }
    // The layered view is a pinned plane, so its fit is computed exactly.
    // The force view keeps moving, so zoomToFit is the right tool there.
    if (view.layout === "layered") {
      if (fitLayered()) return;
    }
    Graph.zoomToFit(300, 30);
  }
