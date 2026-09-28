  // Built from NODE_PRESENTATION, and listing only the kinds actually in the
  // current view -- a legend naming things that are not on screen is noise,
  // and one that can disagree with the rendering is worse than none. Both
  // are avoided by reading the same table `colorFor` reads.
  function buildLegend() {
    var host = document.getElementById("kind-legend");
    host.innerHTML = "";
    var counts = {}, order = [];
    view.nodes.forEach(function (n) {
      var k = presentationKey(n);
      if (!counts[k]) { counts[k] = 0; order.push(k); }
      counts[k]++;
    });
    order.sort(function (a, b) { return counts[b] - counts[a]; });
    order.forEach(function (k) {
      var p = NODE_PRESENTATION[k] || { color: "#8a93ab", label: k };
      var row = document.createElement("div");
      row.className = "row";
      var sw = document.createElement("span");
      sw.className = "swatch";
      sw.style.background = p.color;
      var txt = document.createElement("span");
      txt.textContent = p.label + " (" + counts[k] + ")";
      row.appendChild(sw);
      row.appendChild(txt);
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
    if (view.source_notes) {
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

  function renderDetail(node) {
    var adj = adjacency[node.id] || { out: [], in: [] };
    var scopePill = node.scope
      ? '<span class="pill ' + (node.scope === "acquirer-specific" ? "acq" : "wide") + '">' +
        escapeHtml(node.scope) + "</span>"
      : "";
    var html =
      "<h2>" + escapeHtml(node.title) + "</h2>" +
      '<div class="meta">' + escapeHtml(node.kind || node.type) +
        (node.boundary ? " &middot; " + escapeHtml(node.boundary) : "") +
        (node.status ? " &middot; " + escapeHtml(node.status) : "") + "</div>" +
      scopePill +
      (node.scope_note ? '<div class="payload" style="margin:6px 0 2px">' +
        escapeHtml(node.scope_note) + "</div>" : "");

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
    // Explicit non-authority lives on the node itself as plain text, not as
    // a graph edge -- `not_authoritative_for` briefly existed as a
    // relationship type and was reversed (kg-core/SCHEMA.md's Open items):
    // it never had a consumer beyond its own visualization, and the source
    // domain model is itself the citation, not another node to jump to.
    // Each item is `{content, ref, unresolved?}` (decision 49): *what* is
    // excluded, and *who* owns it instead. Grouped by content, because the
    // source routinely splits one exclusion across several owners, and a
    // flat pill per item repeated the same text once per owner. An
    // `unresolved` ref is prose that matched no modelled domain -- shown as
    // a gap, not dressed up as a resolved owner.
    if (node.not_authoritative_for && node.not_authoritative_for.length) {
      var groups = [], byContent = {};
      node.not_authoritative_for.forEach(function (item) {
        // A graph file generated before decision 49 carries plain strings.
        if (typeof item === "string") item = { content: item };
        var g = byContent[item.content];
        if (!g) { g = byContent[item.content] = { content: item.content, refs: [] }; groups.push(g); }
        if (item.ref) g.refs.push(item);
      });
      html += '<div class="section-label">Not authoritative for</div>' +
        groups.map(function (g) {
          return '<div class="rel"><div class="who">' + escapeHtml(g.content) + "</div>" +
            (g.refs.length ? '<div class="payload">owned by ' + g.refs.map(function (r) {
              return r.unresolved
                ? '<span class="pill gap" title="No modelled domain matches this reference">' +
                  "unresolved: " + escapeHtml(r.ref) + "</span>"
                : '<span class="pill">' + escapeHtml(r.ref_title || titleOf(r.ref)) + "</span>";
            }).join("") + "</div>" : "") + "</div>";
        }).join("");
    }
    document.getElementById("detail-body").innerHTML = html;
    document.getElementById("detail").classList.add("open");
  }

  function closeDetail() {
    selected = null;
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

  function refresh() {
    buildControls();
    Graph.graphData(visibleData());
    renderStats();
    repaint();
  }
