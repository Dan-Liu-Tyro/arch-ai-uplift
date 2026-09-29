  // ---- Presentation, keyed off the model's strict types -------------------
  //
  // The model says what a thing *is* -- `kind`, plus `actor_type` for an
  // actor (see kg-core/SCHEMA.md). This table is the only place that decides
  // how it looks, and the split is deliberate: affiliation is deliberately
  // not stored on an actor, so "internal vs external user" is a grouping
  // made here, at read time, rather than a fact the graph carries. Adding a
  // presentation channel (a shape, a border) means extending this table, not
  // touching kg-content.
  //
  // Keys are `kind` or, for actors, `kind:actor_type`. The bare `actor` key
  // is the fallback for an actor whose role the overlay left unstated, which
  // the schema permits but the viewer should not render as if it knew.
  var NODE_PRESENTATION = {
    "domain":              { color: "#3fd0ff", label: "Domain" },
    "external":            { color: "#ffd479", label: "External system", shape: "server" },
    "artefact":            { color: "#b79cff", label: "Artefact" },
    "principle":           { color: "#4dff9e", label: "Principle" },
    // `legend` groups rows in the legend: the key explains what a colour
    // and glyph mean, and white vs light yellow means internal vs external
    // -- the role (merchant, regulator) is the node's own label (decision 62).
    "actor:InternalStaff": { color: "#ffffff", label: "Internal user (Tyro staff)", legend: "Internal user", shape: "person" },
    "actor:Customer":      { color: "#ffd479", label: "External user (merchant)", legend: "External user", shape: "person" },
    "actor:Partner":       { color: "#ffd479", label: "External user (partner)", legend: "External user", shape: "person" },
    "actor:Regulator":     { color: "#ffd479", label: "External user (regulator)", legend: "External user", shape: "person" },
    "actor":               { color: "#8a93ab", label: "Actor (role unstated)", shape: "person" }
  };

  // Light yellow means "outside Tyro": every external actor (merchant,
  // partner, regulator) and every external system share it, and Tyro staff
  // are white. The question the flow view gets asked is "what outside Tyro
  // touches this step", so all outsiders read as one class at a glance.
  // Shape still separates a person from a system, and the role still shows
  // in the legend label and the detail pane. Set by the user 2026-09-29
  // (decision 52).
  function presentationKey(node) {
    var kind = node.kind || node.type || "domain";
    if (kind !== "actor") return kind;
    return node.actor_type ? "actor:" + node.actor_type : "actor";
  }

  function presentationFor(node) {
    return NODE_PRESENTATION[presentationKey(node)] ||
      NODE_PRESENTATION[node.kind || node.type] ||
      { color: "#8a93ab", label: "Unknown" };
  }
  // ---- Themes (decision 63) -------------------------------------------------
  //
  // Every colour the canvas and its overlays draw with, per theme. The
  // encoding is the same in both -- what a colour *means* doesn't change --
  // only the values, so each stays readable against its background. Light
  // exists to print or screenshot into a document. Icon-drawn nodes keep
  // their dark-theme colours in light too -- white internal users, one light
  // yellow for every outsider -- and get a dark outline instead (body.light
  // CSS on the glyph), which is what makes white and light yellow visible on
  // a white page (the user's call, revising the first version's charcoal
  // and amber). NODE_PRESENTATION's `color` is the dark value; `nodes` below
  // overrides it per presentation key for light.
  var THEME = {
    // Edge alphas here are the *real* on-screen opacity (decision 65): the
    // library's linkOpacity is pinned to 1 in renderer.js. It used to be
    // left at its 0.2 default, which silently multiplied every edge -- the
    // "0.85" flow colour really drew at 0.17, and a solid selected edge at
    // 0.2. The unselected values below are those old effective values, so
    // unselected edges look exactly as before; selected ones are now solid.
    dark: {
      bg: "#05070d", flow: "rgba(196,212,240,0.17)", back: "rgba(255,140,155,0.18)",
      backSel: "#ff7e8f", dimEdge: "rgba(110,120,140,0.03)", dimNode: "rgba(110,120,140,0.18)",
      scopeDim: "rgba(110,120,140,0.22)", selNode: "#ffffff",
      particle: "#7ff0c0", particleBack: "#ff9fae", up: "#ffb454", down: "#6fe3a8",
      selEdge: "#6fe3a8",
      arrow: "rgba(196,212,240,0.8)", backArrow: "rgba(255,140,155,0.85)", dimArrow: "rgba(110,120,140,0.15)",
      stages: ["#8b7bff", "#3fd0ff", "#4dff9e"], nodes: {}
    },
    light: {
      bg: "#ffffff", flow: "rgba(55,65,90,0.14)", back: "rgba(200,55,80,0.17)",
      backSel: "#c8374f", dimEdge: "rgba(120,130,150,0.04)", dimNode: "rgba(150,160,175,0.3)",
      scopeDim: "rgba(150,160,175,0.35)", selNode: "#0b0f19",
      particle: "#1f9d5c", particleBack: "#c8374f", up: "#d9822b", down: "#1f9d5c",
      // A selected node's own edges (Next-level off): black on white, the
      // user's call -- green read as just another colour on a white page.
      selEdge: "#111722",
      arrow: "rgba(55,65,90,0.75)", backArrow: "rgba(200,55,80,0.8)", dimArrow: "rgba(120,130,150,0.2)",
      stages: ["#6a5ae0", "#1a8fc4", "#1f9d5c"],
      nodes: {
        "domain": "#1a8fc4", "artefact": "#7a5cd6", "principle": "#1f9d5c", "actor": "#6b7488"
        // external, actor:InternalStaff, actor:Customer/Partner/Regulator:
        // unchanged from dark (white, light yellow), outlined in CSS.
      }
    }
  };
  var theme = "dark";
  try { if (window.localStorage && localStorage.getItem("kgviz-theme") === "light") theme = "light"; } catch (e) {}
  function T(k) { return THEME[theme][k]; }
  function colorForKey(key, fallback) { return THEME[theme].nodes[key] || fallback; }

  // The mesh colour key for every icon-drawn node (actors, external systems)
  // -- a value no sphere's colour can ever take, so their transparent mesh
  // material is never shared with a sphere. See the nodeColor accessor in
  // renderer.js.
  var ICON_MESH_COLOR = "rgba(0,0,0,0)";

  var COL_SPACING = 230, LANE_HEIGHT = 300, ROW_SPACING = 62;

  // Shown bottom-left. Bump this on any edit to this file. It exists because
  // a stale cached page is indistinguishable from a fix that did not work:
  // one round trip was spent on a report quoting a diagnostic string that had
  // already been deleted from disk. There is no server or HTTP cache in the
  // way any more, but a file:// page can still be reloaded from a browser's
  // memory cache -- if the revision on screen is not the one you expect, you
  // are not looking at the current page.
  var PAGE_REVISION = "2026-09-30a — highlighted edges 0.7; opaque spheres hide inner line";
  var LOADED_FROM = "(nothing loaded)";
  var LIB_LOADED_FROM = null;

  var DATA = null, view = null, Graph = null;
  var dims = 2, scopeMode = "all", focusMode = false, nextLevel = false, showLabels = true, showEdgeLabels = false, edgeLabelStyle = "along";
  var statsCollapsed = true;
  var showBands = true;
  // Anything that prevents the graph drawing goes on screen. Errors thrown
  // inside the render loop never reach the fetch().catch() below, which is
  // why a broken node accessor previously produced a blank canvas next to a
  // perfectly healthy control panel.
  function note(html) {
    var body = document.getElementById("notes-body");
    var line = document.createElement("div");
    line.innerHTML = html;
    body.appendChild(line);
    document.getElementById("notes").classList.add("open");
  }

  function escapeHtml(s) {
    return String(s === null || s === undefined ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  window.addEventListener("error", function (e) {
    note("<b>JavaScript error:</b> " + escapeHtml(e.message) +
      (e.filename ? " <code>" + escapeHtml(String(e.filename).split("/").pop()) +
        ":" + e.lineno + "</code>" : ""));
  });
  window.addEventListener("unhandledrejection", function (e) {
    note("<b>Unhandled promise rejection:</b> " +
      escapeHtml((e.reason && e.reason.message) || String(e.reason)));
  });
  var hiddenGroups = {};     // keyed per view id -> Set of hidden group keys
  var selected = null;
  var adjacency = {};
