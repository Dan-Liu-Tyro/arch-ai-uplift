  // ---- Getting the data in -------------------------------------------------
  //
  // The viewer starts empty and always loads by explicit choice: click Load
  // default, pick a file, or drop one. There is no *auto*-load -- nothing
  // renders before a click -- so this page stays a *viewer for any
  // compatible graph file* rather than a hard-wired display of one.
  // `payments.json` is the expected default and is what the picker names,
  // but nothing is special-cased to it for the browse/drop paths.
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
          "different JSON file. Use the <code>payments.json</code> next to this page.");
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

  // The one exception to "loads by explicit choice, never by fetch": the
  // default graph is embedded in this page at build time (decision 40,
  // build.py's DEFAULT_GRAPH), specifically so picking the wrong one of two
  // same-named files in different directories -- which happened the same
  // session payments.json was renamed to dodge that exact collision -- is no
  // longer possible for the common case. Still explicit: nothing loads until
  // this or another loader is clicked.
  function loadDefault() {
    if (typeof DEFAULT_GRAPH === "undefined" || !DEFAULT_GRAPH) {
      note("<b>No default graph is embedded in this page.</b> Run " +
        "<code>python3 generate.py</code> then <code>python3 build.py</code>, " +
        "then reload.");
      return;
    }
    LOADED_FROM = "payments.json (embedded at build time)";
    document.getElementById("picker").classList.remove("open");
    // Cloned so every click starts from the same pristine object, matching
    // readFile()'s fresh JSON.parse() per load -- start()/applyLayout()
    // mutate node objects in place (fx/fy/fz/x/y/z), and DEFAULT_GRAPH is
    // one shared reference that would otherwise carry those across reloads.
    start(JSON.parse(JSON.stringify(DEFAULT_GRAPH)));
  }

  function showPicker() {
    document.getElementById("picker").classList.add("open");
    document.getElementById("load-default-btn").onclick = loadDefault;
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
    applyControlMode();

    document.getElementById("controls").classList.add("ready");
    document.getElementById("stats").classList.add("ready");
    buildControls();
    renderStats();
    // Labels first: a band is sized to enclose its stage's labels, so it has
    // to measure elements that already exist. The rAF loop would correct the
    // order within a frame, but a first paint with under-sized bands is a
    // visible flash, and it hid the bug from verify.js's single-frame stub.
    rebuildLabels();
    rebuildBands();
    setTimeout(frameGraph, 400);
  }
