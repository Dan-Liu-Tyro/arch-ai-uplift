  // ---- Strictly offline -----------------------------------------------------
  //
  // One local source, and no remote fallback of any kind. This viewer displays
  // internal architecture content, so the requirement is that it loads nothing
  // online and sends nothing out: a CDN <script src> leaks the requesting IP
  // and the fact that this library was loaded, which is a disclosure with no
  // upside once a local copy exists.
  //
  // Note what was *never* happening, so the risk is not overstated: the page
  // has no fetch, XHR, sendBeacon, WebSocket, form, img or postMessage path at
  // all, and payments-target-state.json is read from disk. No graph content
  // has ever left the machine. The library download was the only outbound
  // request, and it is now gone.
  //
  // Auditable claim: this file should contain no "http" URL outside comments.
  // See vendor/README.md for how to populate the one local file, and
  // docs/backlog.md for the plan to drop this dependency entirely in favour of
  // a hand-written SVG renderer.
  var LIB_SOURCE = "vendor/3d-force-graph.min.js";

  function loadLibrary(done) {
    var el = document.createElement("script");
    el.src = LIB_SOURCE;
    el.onload = function () { done(true); };
    el.onerror = function () { done(false); };
    document.head.appendChild(el);
  }

  loadLibrary(function (ok) {
    LIB_LOADED_FROM = ok ? LIB_SOURCE : null;
    boot();
  });
