  // Built from NODE_PRESENTATION, and listing only the kinds actually in the
  // current view -- a legend naming things that are not on screen is noise,
  // and one that can disagree with the rendering is worse than none. Both
  // are avoided by reading the same table `colorFor` reads. Rows group by
  // an entry's `legend` name where it has one (decision 62: every external
  // actor is one "External user" row), else its `label`.
  function buildLegend() {
    var host = document.getElementById("kind-legend");
    host.innerHTML = "";
    var counts = {}, order = [], first = {};
    view.nodes.forEach(function (n) {
      var p = NODE_PRESENTATION[presentationKey(n)] || { color: "#8a93ab", label: presentationKey(n) };
      var k = p.legend || p.label;
      if (!counts[k]) { counts[k] = 0; order.push(k); first[k] = p; }
      counts[k]++;
    });
    // A fixed reading order, not by count: people together (internal, then
    // external), then external systems below them (decision 62). A group
    // not listed here goes after, largest first.
    var LEGEND_ORDER = ["Domain", "Internal user", "External user", "External system", "Artefact"];
    var rank = function (k) { var i = LEGEND_ORDER.indexOf(k); return i < 0 ? LEGEND_ORDER.length : i; };
    order.sort(function (a, b) { return (rank(a) - rank(b)) || (counts[b] - counts[a]); });
    order.forEach(function (k) {
      var p = first[k];
      var row = document.createElement("div");
      row.className = "row";
      var sw = document.createElement("span");
      // Icon-drawn kinds show their actual glyph, so the key matches what
      // is on the canvas by shape as well as colour (decision 59).
      if (ICON_SVG[p.shape]) {
        sw.className = "swatch icon";
        sw.style.color = p.color;
        sw.innerHTML = ICON_SVG[p.shape];
      } else {
        sw.className = "swatch";
        sw.style.background = p.color;
      }
      var txt = document.createElement("span");
      txt.textContent = k + " (" + counts[k] + ")";
      row.appendChild(sw);
      row.appendChild(txt);
      host.appendChild(row);
    });
    buildEdgeLegend();
  }

  // What edge styling means. The selection rows follow the Next-level
  // edges option, because that option is what changes their meaning: off,
  // a selection's edges are one green; on, orange feeds it and green is fed
  // by it. The feedback-arc row appears only when the view has one.
  function buildEdgeLegend() {
    var host = document.getElementById("edge-legend");
    host.innerHTML = "";
    function sample(stroke, dashed) {
      return '<svg class="edge-sample" viewBox="0 0 26 10" aria-hidden="true">' +
        '<line x1="1" y1="5" x2="20" y2="5" stroke="' + stroke + '" stroke-width="2"' +
        (dashed ? ' stroke-dasharray="4 3"' : "") + "/>" +
        '<path d="M19 1.5 L25 5 L19 8.5 z" fill="' + stroke + '"/></svg>';
    }
    var rows = [[sample("rgba(196,212,240,0.85)"), "Flow; particles run source → target"]];
    if (view.links.some(function (l) { return l.back_edge; })) {
      rows.push([sample("#ff7e8f", true), "Feedback arc (loops to an earlier stage)"]);
    }
    if (nextLevel) {
      rows.push([sample(CHAIN_UP), "Feeds the selected node (upstream)"]);
      rows.push([sample(CHAIN_DOWN), "Fed by the selected node (downstream)"]);
    } else {
      rows.push([sample(CHAIN_DOWN), "Selected node's edges"]);
    }
    rows.forEach(function (r) {
      var row = document.createElement("div");
      row.className = "row";
      row.innerHTML = r[0] + "<span>" + escapeHtml(r[1]) + "</span>";
      host.appendChild(row);
    });
  }

  function buildControls() {
    document.getElementById("view-desc").textContent = view.description;

    var counts = {};
    view.nodes.forEach(function (n) {
      var k = groupKeyOf(n);
      counts[k] = (counts[k] || 0) + 1;
    });

    var rows = document.getElementById("group-rows");
    rows.innerHTML = "";
    groupsForView().forEach(function (g) {
      if (!counts[g.key]) return;
      var row = document.createElement("label");
      row.className = "row" + (hiddenSet()[g.key] ? " off" : "");
      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = !hiddenSet()[g.key];
      cb.onchange = function () {
        if (cb.checked) delete hiddenSet()[g.key];
        else hiddenSet()[g.key] = true;
        row.className = "row" + (cb.checked ? "" : " off");
        refresh();
      };
      var sw = document.createElement("span");
      sw.className = "swatch";
      sw.style.background = g.color;
      sw.style.color = g.color;
      var label = document.createElement("span");
      label.textContent = g.label;
      var count = document.createElement("span");
      count.className = "count";
      count.textContent = counts[g.key];
      row.appendChild(cb); row.appendChild(sw); row.appendChild(label); row.appendChild(count);
      rows.appendChild(row);
    });

    buildLegend();
  }

  function renderStats() {
    var vis = visibleData();
    var el = document.getElementById("stats-body");
    var lines = [
      "<b>" + vis.nodes.length + "</b> of " + view.nodes.length + " nodes &middot; " +
      "<b>" + vis.links.length + "</b> of " + view.links.length + " edges shown"
    ];
    if (view.stats.unresolved_references) {
      lines.push("<b>" + view.stats.unresolved_references.length + "</b> unresolved cross-domain " +
        "references — prose that never matched a modelled domain. A real gap, not hidden.");
    }
    if (view.stats.back_edges && view.stats.back_edges.length) {
      lines.push("<b>" + view.stats.back_edges.length + "</b> feedback arc(s), drawn dashed — " +
        "edges that loop back to an earlier stage.");
    }
    // Which copy governs (decision 61). A curated graph must not claim to
    // mirror a Confluence original it has deliberately diverged from.
    if (view.provenance === "curated-here") {
      lines.push("Curated in git: this graph is its own source of truth. It began as a " +
        "Confluence whiteboard feed, which is no longer synced.");
    } else if (view.source_notes) {
      lines.push("Source is WIP; the whiteboard body is not machine-readable, so this is built " +
        "from its owner's structured text feed.");
    }
    // Provenance and freshness, always visible. A file picker is a cache by
    // another name -- the page shows whatever was last loaded -- so which
    // file it came from and when that data was generated have to be on
    // screen, or stale data is indistinguishable from current data.
    lines.push('<span style="color:#67718a">page ' + escapeHtml(PAGE_REVISION) +
      "<br/>data from " + escapeHtml(LOADED_FROM) +
      ", generated " + escapeHtml(DATA.generated_at || "unknown") +
      "<br/>library from " + escapeHtml(
        LIB_LOADED_FROM ? LIB_LOADED_FROM.replace(/^https:\/\//, "") : "unknown"
      ) + "</span>");
    el.innerHTML = lines.join("<br/><br/>");
  }

  function titleOf(id) {
    var n = view.nodes.find(function (x) { return x.id === id; });
    return n ? n.title : id;
  }

  function relHtml(link, direction) {
    var other = direction === "out" ? tgtId(link) : srcId(link);
    var arrow = direction === "out" ? "&rarr; " : "&larr; ";
    return '<div class="rel">' +
      '<div class="pred' + (direction === "in" ? " inbound" : "") + '">' +
        escapeHtml(link.label || link.predicate) + "</div>" +
      '<div class="who">' + arrow + escapeHtml(titleOf(other)) + "</div>" +
      (link.payload ? '<div class="payload">carries: ' + escapeHtml(link.payload) + "</div>"
                    : '<div class="payload">' + escapeHtml(link.description || "") + "</div>") +
      (link.back_edge ? '<div class="backedge">feedback arc (loops to an earlier stage)</div>' : "") +
      "</div>";
  }

  function scopePillHtml(d) {
    return (d.scope
      ? '<span class="pill ' + (d.scope === "acquirer-specific" ? "acq" : "wide") + '">' +
        escapeHtml(d.scope) + "</span>"
      : "") +
      (d.scope_note ? '<div class="payload" style="margin:6px 0 2px">' +
        escapeHtml(d.scope_note) + "</div>" : "");
  }

  // Explicit non-authority lives on the node itself as plain text, not as
  // a graph edge -- `not_authoritative_for` briefly existed as a
  // relationship type and was reversed (kg-core/SCHEMA.md's Open items):
  // it never had a consumer beyond its own visualization. Each item is
  // `{content, ref, unresolved?}` (decision 49): *what* is excluded, and
  // *who* owns it instead. Grouped by content, because the source routinely
  // splits one exclusion across several owners, and a flat pill per item
  // repeated the same text once per owner. A resolved owner is a link
  // (`data-ref`, handled by openDomainRef); an `unresolved` ref is prose
  // that matched no modelled domain -- shown as a gap, never as a link.
  function nafHtml(list) {
    if (!list || !list.length) return "";
    var groups = [], byContent = {};
    list.forEach(function (item) {
      // A graph file generated before decision 49 carries plain strings.
      if (typeof item === "string") item = { content: item };
      var g = byContent[item.content];
      if (!g) { g = byContent[item.content] = { content: item.content, refs: [] }; groups.push(g); }
      if (item.ref) g.refs.push(item);
    });
    return '<div class="section-label">Not authoritative for</div>' +
      groups.map(function (g) {
        return '<div class="rel"><div class="who">' + escapeHtml(g.content) + "</div>" +
          (g.refs.length ? '<div class="payload">owned by ' + g.refs.map(function (r) {
            return r.unresolved
              ? '<span class="pill gap" title="No modelled domain matches this reference">' +
                "unresolved: " + escapeHtml(r.ref) + "</span>"
              : '<span class="pill link" data-ref="' + escapeHtml(r.ref) + '" title="Open this domain">' +
                escapeHtml(r.ref_title || titleOf(r.ref)) + "</span>";
          }).join("") + "</div>" : "") + "</div>";
      }).join("");
  }

  // Owner-link navigation history for the pane's back (←) button. Each
  // entry is what the pane showed before a link was followed: `{id}` for a
  // graph node, `{ref}` for an off-graph domain. A trail starts fresh
  // whenever the user picks a node on the graph or closes the pane --
  // "back" means back along the links followed, not through every click.
  var paneHistory = [], paneCurrent = null;

  function showDetail(html) {
    var body = document.getElementById("detail-body");
    body.innerHTML = html;
    document.getElementById("detail-back").style.display = paneHistory.length ? "" : "none";
    // One delegated handler rather than one per pill: the pane's HTML is
    // replaced wholesale on every render.
    body.onclick = function (e) {
      var t = e.target;
      while (t && t !== body && !(t.getAttribute && t.getAttribute("data-ref"))) t = t.parentNode;
      if (t && t !== body) openDomainRef(t.getAttribute("data-ref"));
    };
    document.getElementById("detail").classList.add("open");
  }

  // Follow an owner link. An owner on this graph is selected exactly as a
  // click on its node would select it -- un-hiding its stage first if a
  // filter hides it, since "switch to that domain" is the point. An owner
  // with no node in this flow is shown from the view's `domain_index`
  // (generated from domains.json), so the chain of "who owns this instead"
  // never dead-ends; nothing on the graph is selected, because nothing on
  // the graph is that domain.
  function openDomainRef(ref) {
    var n = view.nodes.find(function (x) { return x.domain_ref === ref; });
    var d = view.domain_index && view.domain_index[ref];
    if (!n && !d) return;
    if (paneCurrent) paneHistory.push(paneCurrent);
    if (n) selectNode(n);
    else showOffGraphDomain(ref);
  }
  window.openDomainRef = openDomainRef;

  function goBack() {
    var entry = paneHistory.pop();
    if (!entry) return;
    var n = entry.id && view.nodes.find(function (x) { return x.id === entry.id; });
    if (n) selectNode(n);
    else if (entry.ref) showOffGraphDomain(entry.ref);
  }
  window.goBack = goBack;

  function selectNode(n) {
    selected = n;
    if (isHidden(n)) { delete hiddenSet()[groupKeyOf(n)]; refresh(); }
    else repaint();
    renderDetail(n);
  }

  function showOffGraphDomain(ref) {
    var d = view.domain_index[ref];
    selected = null;
    repaint();
    paneCurrent = { ref: ref };
    showDetail(
      "<h2>" + escapeHtml(d.title) + "</h2>" +
      '<div class="meta">domain &middot; not in this flow' +
        (d.status ? " &middot; " + escapeHtml(d.status) : "") + "</div>" +
      scopePillHtml(d) +
      (d.purpose ? '<div class="section-label">Purpose</div><div>' + escapeHtml(d.purpose) + "</div>" : "") +
      nafHtml(d.not_authoritative_for));
  }

  // A node picked on the graph itself starts a new trail.
  function openFromGraph(node) {
    paneHistory = [];
    renderDetail(node);
  }

  function renderDetail(node) {
    var adj = adjacency[node.id] || { out: [], in: [] };
    paneCurrent = { id: node.id };
    var html =
      "<h2>" + escapeHtml(node.title) + "</h2>" +
      '<div class="meta">' + escapeHtml(node.kind || node.type) +
        (node.boundary ? " &middot; " + escapeHtml(node.boundary) : "") +
        (node.status ? " &middot; " + escapeHtml(node.status) : "") + "</div>" +
      scopePillHtml(node);

    if (node.responsibility) {
      html += '<div class="section-label">Responsibility in this flow</div><div>' +
        escapeHtml(node.responsibility) + "</div>";
    }
    if (node.purpose) {
      html += '<div class="section-label">Purpose</div><div>' + escapeHtml(node.purpose) + "</div>";
    }
    if (node.touchpoints && node.touchpoints.length) {
      html += '<div class="section-label">Touchpoints</div><div>' +
        node.touchpoints.map(function (t) { return '<span class="pill">' + escapeHtml(t) + "</span>"; }).join("") +
        "</div>";
    }
    html += '<div class="section-label">Outbound (' + adj.out.length + ")</div>" +
      (adj.out.length ? adj.out.map(function (l) { return relHtml(l, "out"); }).join("")
                      : '<div class="payload">none</div>');
    html += '<div class="section-label">Inbound (' + adj.in.length + ")</div>" +
      (adj.in.length ? adj.in.map(function (l) { return relHtml(l, "in"); }).join("")
                     : '<div class="payload">none</div>');
    html += nafHtml(node.not_authoritative_for);
    showDetail(html);
  }

  function closeDetail() {
    selected = null;
    paneHistory = [];
    paneCurrent = null;
    document.getElementById("detail").classList.remove("open");
    repaint();
  }
  window.closeDetail = closeDetail;

  function neighbourIds(node) {
    var adj = adjacency[node.id] || { out: [], in: [] };
    var set = {};
    set[node.id] = true;
    adj.out.forEach(function (l) { set[tgtId(l)] = true; });
    adj.in.forEach(function (l) { set[srcId(l)] = true; });
    return set;
  }

  function repaint() {
    // Re-assert the accessors so 3d-force-graph re-evaluates colours.
    Graph.nodeColor(Graph.nodeColor())
      .linkColor(Graph.linkColor())
      .linkWidth(Graph.linkWidth());
    // Labels before bands -- bands are sized from the label elements.
    rebuildLabels();
    rebuildBands();
  }

  // Full-screen focus mode (decision 56): every panel hidden, the browser in
  // real fullscreen where it allows it, and the camera refit to the whole
  // window -- fitLayered() drops its control-panel keep-out while this is
  // on. Selecting a node works exactly as outside it, detail pane
  // included. Browser fullscreen is best-effort: if the
  // request is refused, the panels still hide, which is the part that
  // matters. Esc leaves browser fullscreen natively, and the
  // fullscreenchange handler in renderer.js follows it out of focus mode
  // too, so the two can't disagree.
  function setFocusMode(on) {
    if (on === focusMode) return;
    focusMode = on;
    document.body.classList[on ? "add" : "remove"]("focus");
    var root = document.documentElement;
    if (on && root && root.requestFullscreen && !document.fullscreenElement) {
      var p = root.requestFullscreen();
      if (p && p.catch) p.catch(function () {});
    }
    if (!on && document.fullscreenElement && document.exitFullscreen) document.exitFullscreen();
    setTimeout(frameGraph, 350);
  }

  function refresh() {
    buildControls();
    Graph.graphData(visibleData());
    renderStats();
    repaint();
  }
