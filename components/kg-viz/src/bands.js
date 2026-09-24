  // ---- Stage bands ---------------------------------------------------------
  //
  // One translucent region per stage, so the three lanes read as lanes rather
  // than as an accident of where nodes happen to sit. Each band is a polygon
  // rather than a rectangle because the camera can be orbited: four projected
  // corners stay correct under rotation, where a screen-space rect would not.
  // Bands are a layered-view feature -- the force view has no stages.
  var SVG_NS = "http://www.w3.org/2000/svg";
  var BAND_PAD = 46;        // world units of margin around a stage's contents
  var bandEls = [];

  // Screen pixels per world unit, measured off the live projection instead of
  // assumed, so the label allowance below stays correct at every zoom level.
  // The layered view is a flat plane viewed down z, so one sample taken near
  // the band describes the whole band.
  function worldScale(x, y) {
    var a = Graph.graph2ScreenCoords(x, y, 0);
    var b = Graph.graph2ScreenCoords(x + 100, y, 0);
    if (!a || !b || !isFinite(a.x) || !isFinite(b.x)) return 0;
    return Math.abs(b.x - a.x) / 100;
  }

  function rebuildBands() {
    var svg = document.getElementById("bands");
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    bandEls = [];
    if (!showBands || !view.stages || view.layout !== "layered") return;

    view.stages.forEach(function (stage, i) {
      var colour = STAGE_COLORS[i % STAGE_COLORS.length];
      var poly = document.createElementNS(SVG_NS, "polygon");
      poly.setAttribute("fill", colour);
      poly.setAttribute("fill-opacity", "0.075");
      poly.setAttribute("stroke", colour);
      poly.setAttribute("stroke-opacity", "0.55");
      poly.setAttribute("stroke-width", "1.5");
      poly.setAttribute("stroke-dasharray", "7 5");
      var caption = document.createElementNS(SVG_NS, "text");
      caption.setAttribute("class", "band-caption");
      caption.setAttribute("fill", colour);
      caption.textContent = stage.ordinal + ". " + stage.title;
      svg.appendChild(poly);
      svg.appendChild(caption);
      bandEls.push({ stage: stage.id, poly: poly, caption: caption });
    });
    positionBands();
  }

  function positionBands() {
    if (!Graph || !showBands || !bandEls.length) return;
    var nodes = visibleData().nodes;

    // Two passes, because the left edge is shared. Each band is measured
    // independently first, then every band is squared off against the
    // leftmost edge any of them needs. Ragged left edges read as three
    // unrelated regions that happen to be stacked; a common edge reads as
    // three lanes of one process, which is what the view is for. Only the
    // left is aligned -- the stages genuinely differ in width, so forcing a
    // common right edge would draw a lot of empty box around stage 1.
    var boxes = bandEls.map(function (band) {
      var members = nodes.filter(function (n) {
        return n.stage === band.stage && isFinite(n.x) && isFinite(n.y);
      });
      // A stage whose group is toggled off has no members: hide it rather
      // than drawing a band around nothing.
      if (!members.length) return null;
      // A band has to contain the stage's *labels*, not only its nodes: a
      // dashed edge slicing through "Terminal Fleet & Device Management"
      // reads as the band being drawn wrong rather than as a label
      // overflowing it. Labels are fixed-size HTML (labels.js), so their
      // footprint is screen pixels and has to be divided back into world
      // units at the current zoom -- which also means the band tracks its
      // labels as you zoom, instead of being right at one magnification.
      // Room is reserved whether or not a label is currently
      // collision-suppressed, so the band does not twitch as labels drop in
      // and out. Vertical room goes on both edges because labels hang below
      // a node on screen and nothing here establishes which world-y
      // direction that is; the cost is a little headroom on the top edge.
      var scale = worldScale(members[0].x, members[0].y);
      var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      var drop = 0;
      members.forEach(function (n) {
        var box = scale > 0 ? labelBoxPx(n) : { w: 0, h: 0 };
        var halfW = (box.w / 2) / (scale || 1);
        if (n.x - halfW < minX) minX = n.x - halfW;
        if (n.x + halfW > maxX) maxX = n.x + halfW;
        if (n.y < minY) minY = n.y;
        if (n.y > maxY) maxY = n.y;
        if (box.h) drop = Math.max(drop, (LABEL_DY + box.h) / (scale || 1));
      });
      minY -= drop; maxY += drop;
      minX -= BAND_PAD; maxX += BAND_PAD; minY -= BAND_PAD; maxY += BAND_PAD;
      return { l: minX, r: maxX, t: minY, b: maxY };
    });

    var leftEdge = Math.min.apply(null, boxes.filter(Boolean).map(function (b) {
      return b.l;
    }));

    bandEls.forEach(function (band, bi) {
      var box = boxes[bi];
      if (!box) {
        band.poly.setAttribute("points", "");
        band.caption.textContent = "";
        return;
      }
      var minX = leftEdge, maxX = box.r, minY = box.t, maxY = box.b;

      var corners = [[minX, minY], [maxX, minY], [maxX, maxY], [minX, maxY]];
      var pts = [];
      for (var i = 0; i < corners.length; i++) {
        var p = Graph.graph2ScreenCoords(corners[i][0], corners[i][1], 0);
        if (!p || !isFinite(p.x) || !isFinite(p.y)) { pts = []; break; }
        pts.push(p.x.toFixed(1) + "," + p.y.toFixed(1));
      }
      if (!pts.length) {
        band.poly.setAttribute("points", "");
        band.caption.textContent = "";
        return;
      }
      band.poly.setAttribute("points", pts.join(" "));

      // Caption on the band's topmost-left projected corner, nudged inside.
      var xs = pts.map(function (q) { return parseFloat(q.split(",")[0]); });
      var ys = pts.map(function (q) { return parseFloat(q.split(",")[1]); });
      var stage = view.stages.filter(function (st) { return st.id === band.stage; })[0];
      band.caption.textContent = stage.ordinal + ". " + stage.title;
      band.caption.setAttribute("x", (Math.min.apply(null, xs) + 10).toFixed(1));
      band.caption.setAttribute("y", (Math.min.apply(null, ys) + 19).toFixed(1));
    });
  }
