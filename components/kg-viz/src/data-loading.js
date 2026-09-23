  // ---- Getting the data in -------------------------------------------------
  //
  // The viewer starts empty and always loads by explicit choice: pick or drop
  // a file. There is deliberately no auto-load -- no fetch, no bundled data
  // blob -- so this page is a *viewer for any compatible graph file* rather
  // than a hard-wired display of one. `payments-target-state.json` is the
  // expected default and is what the picker names, but nothing is
  // special-cased to it.
  //
  // A file chosen through an <input> or dropped is readable by explicit user
  // grant, which is why this works from file:// where fetch() is blocked
  // outright (the page's origin is `null`).
  function readFile(file) {
    var reader = new FileReader();
    reader.onload = function () {
      var parsed;
      try {
        parsed = JSON.parse(reader.result);
      } catch (e) {
        note("<b>" + escapeHtml(file.name) + " is not valid JSON:</b> " +
          escapeHtml(e.message));
        return;
      }
      if (!parsed.views) {
        note("<b>" + escapeHtml(file.name) + " is not a Knowledge Visualizer graph file.</b> " +
          "Expected a top-level <code>views</code> array — this looks like a " +
          "different JSON file. Use the <code>payments-target-state.json</code> next to this page.");
        return;
      }
      LOADED_FROM = file.name;
      document.getElementById("picker").classList.remove("open");
      start(parsed);
    };
    reader.onerror = function () {
      note("<b>Could not read " + escapeHtml(file.name) + ".</b>");
    };
    reader.readAsText(file);
  }

  function showPicker() {
    document.getElementById("picker").classList.add("open");
    var input = document.getElementById("file-input");
    input.onchange = function () { if (input.files[0]) readFile(input.files[0]); };
    document.getElementById("pick-btn").onclick = function () { input.click(); };
    ["dragenter", "dragover"].forEach(function (evt) {
      document.body.addEventListener(evt, function (e) {
        e.preventDefault();
        document.getElementById("picker").classList.add("hot");
      });
    });
    document.body.addEventListener("dragleave", function () {
      document.getElementById("picker").classList.remove("hot");
    });
    document.body.addEventListener("drop", function (e) {
      e.preventDefault();
      document.getElementById("picker").classList.remove("hot");
      if (e.dataTransfer.files[0]) readFile(e.dataTransfer.files[0]);
    });
  }

  function boot() {
    if (typeof ForceGraph3D !== "function") {
      note("<b><code>" + escapeHtml(LIB_SOURCE) + "</code> is missing, so " +
        "nothing can be drawn.</b> This viewer is deliberately offline-only " +
        "and has no CDN fallback, so the renderer has to be present on disk.");
      note("<b>To populate it</b> (one time, needs a connection once — see " +
        "<code>vendor/README.md</code>):<br/>" +
        "&nbsp;&nbsp;<code>cd components/kg-viz/vendor</code><br/>" +
        "&nbsp;&nbsp;<code>curl -Lo 3d-force-graph.min.js " +
        "https://unpkg.com/3d-force-graph</code><br/>" +
        "Behind a network that blocks public CDNs, <code>npm pack " +
        "3d-force-graph</code> usually works through an internal registry " +
        "mirror. Once the file is committed, every clone works offline.");
      return;
    }
    showPicker();
  }

  // Called once per opened file. The renderer and its one-time wiring live in
  // ensureGraph() below, so opening a second graph re-points the existing
  // canvas instead of stacking another WebGL context on the same div.
  function start(data) {
    DATA = data;
    view = DATA.views.find(function (v) { return v.id === DATA.default_view; }) || DATA.views[0];

    // Per-graph state must not survive a file switch: a hidden group or a
    // selected node from the previous graph would silently filter this one.
    hiddenGroups = {};
    selected = null;
    document.getElementById("detail").classList.remove("open");

    buildAdjacency();
    applyLayout();
    ensureGraph();
    Graph.numDimensions(dims).graphData(visibleData());

    document.getElementById("controls").classList.add("ready");
    document.getElementById("stats").classList.add("ready");
    buildControls();
    renderStats();
    rebuildBands();
    rebuildLabels();
    setTimeout(frameGraph, 400);
  }
