  // ---- Stage bands ---------------------------------------------------------
  //
  // One translucent region per stage, so the three lanes read as lanes rather
  // than as an accident of where nodes happen to sit. Each band is a polygon
  // rather than a rectangle because the camera can be orbited: four projected
  // corners stay correct under rotation, where a screen-space rect would not.
  // Bands are a layered-view feature -- the force view has no stages.
  var SVG_NS = "http://www.w3.org/2000/svg";
  var BAND_PAD = 46;        // world units of margin around a stage's nodes
  var bandEls = [];

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
    bandEls.forEach(function (band) {
      var members = nodes.filter(function (n) {
        return n.stage === band.stage && isFinite(n.x) && isFinite(n.y);
      });
      // A stage whose group is toggled off has no members: hide it rather
      // than drawing a band around nothing.
      if (!members.length) {
        band.poly.setAttribute("points", "");
        band.caption.textContent = "";
        return;
      }
      var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      members.forEach(function (n) {
        if (n.x < minX) minX = n.x;
        if (n.x > maxX) maxX = n.x;
        if (n.y < minY) minY = n.y;
        if (n.y > maxY) maxY = n.y;
      });
      minX -= BAND_PAD; maxX += BAND_PAD; minY -= BAND_PAD; maxY += BAND_PAD;

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
