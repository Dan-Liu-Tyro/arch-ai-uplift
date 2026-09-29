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
    "actor:InternalStaff": { color: "#ffffff", label: "Internal user (Tyro staff)", shape: "person" },
    "actor:Customer":      { color: "#ffd479", label: "External user (merchant)", shape: "person" },
    "actor:Partner":       { color: "#ffd479", label: "External user (partner)", shape: "person" },
    "actor:Regulator":     { color: "#ffd479", label: "External user (regulator)", shape: "person" },
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
  var STAGE_COLORS = ["#8b7bff", "#3fd0ff", "#4dff9e"];

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
  var PAGE_REVISION = "2026-09-29k — E toggles edge labels";
  var LOADED_FROM = "(nothing loaded)";
  var LIB_LOADED_FROM = null;

  var DATA = null, view = null, Graph = null;
  var dims = 2, scopeMode = "all", focusMode = false, showLabels = true, showEdgeLabels = false, edgeLabelStyle = "along";
  var statsCollapsed = false;
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
