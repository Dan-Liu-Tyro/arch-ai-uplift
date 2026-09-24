  var CATEGORY_COLORS = {
    "support-and-experience-channels": "#3fd0ff",
    "core-customer-and-product-domains": "#ff5f7e",
    "business-operations-domains": "#ffb454",
    "partner-integrations-and-value-add-services-domains": "#8b7bff",
    "data-and-intelligence-domains": "#4dff9e",
    "cross-domain-orchestrators": "#ff8ad8",
    "_uncategorized": "#8a93ab"
  };
  var KIND_COLORS = {
    "domain": "#3fd0ff", "actor": "#ffd479", "external": "#ff7e8f",
    "artefact": "#b79cff", "principle": "#4dff9e"
  };
  var STAGE_COLORS = ["#8b7bff", "#3fd0ff", "#4dff9e"];

  var COL_SPACING = 230, LANE_HEIGHT = 300, ROW_SPACING = 62;

  // Shown bottom-left. Bump this on any edit to this file. It exists because
  // a stale cached page is indistinguishable from a fix that did not work:
  // one round trip was spent on a report quoting a diagnostic string that had
  // already been deleted from disk. There is no server or HTTP cache in the
  // way any more, but a file:// page can still be reloaded from a browser's
  // memory cache -- if the revision on screen is not the one you expect, you
  // are not looking at the current page.
  var PAGE_REVISION = "2026-09-24b — stage bands and fit enclose node labels";
  var LOADED_FROM = "(nothing loaded)";
  var LIB_LOADED_FROM = null;

  var DATA = null, view = null, Graph = null;
  var dims = 2, scopeMode = "all", showLabels = true, showEdgeLabels = true, edgeLabelStyle = "flat";
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
