// verify.js — the checks behind this component's claims. Run: node verify.js
//
// Why this exists, and why it is plain node with no dependencies:
//
// Nothing this component renders can be observed from the environment it is
// built in. The sandbox denies socket operations, so a local server cannot
// bind and curl cannot reach localhost; headless Chrome aborts at startup
// creating its process-singleton socket; and browser automation is prohibited
// by organisational policy. See docs/decision-log.md's "Constraints
// identified". The only human who can see the output is the user, and every
// defect in this component's history -- blank canvas, a quarter-screen
// camera, labels covering nodes, a start command that always failed -- cost a
// round trip through them to find.
//
// So this file executes knowledge-visualizer.html's own JavaScript against
// the real payments.json under a stubbed DOM, and asserts what
// can be asserted without pixels. It is not a substitute for looking at the
// page; it is the floor
// below which things cannot silently break. Scenarios C and C2 in particular
// are what make decision 38's offline guarantee enforced rather than merely
// intended.
//
// Requires only `node` (no npm install, nothing to fetch), consistent with
// the repo's stdlib-only convention. Exits non-zero on any failure.

const fs = require('fs');
const html = fs.readFileSync('knowledge-visualizer.html', 'utf8');
const js = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const data = JSON.parse(fs.readFileSync('payments.json', 'utf8'));

function run(scenario, opts) {
  const els = {};
  const mkEl = () => ({
    _html: '', children: [], className: '', dataset: {}, style: {}, textContent: '',
    checked: true, type: '', src: '',
    classList: { _on: false, add(){ this._on = true; }, remove(){ this._on = false; } },
    appendChild(c){ this.children.push(c); return c; },
    removeChild(c){ this.children = this.children.filter(x => x !== c); return c; },
    get firstChild(){ return this.children[0] || null; },
    attrs: {},
    setAttribute(k, v){ this.attrs[k] = String(v); },
    getAttribute(k){ return this.attrs[k]; },
    querySelectorAll(){ return []; },
    addEventListener(k, fn){ (this._ev = this._ev || {})[k] = fn; },
    click(){ this.onclick && this.onclick(); },
    files: [], clientWidth: 3270, clientHeight: 1730,
    set innerHTML(v){ this._html = v; if (v === '') this.children = []; }, get innerHTML(){ return this._html; },
  });

  const loaded = [];
  const attempted = [];
  const bodyEl = mkEl();
  const doc = {
    body: bodyEl,
    getElementById(id){ return (els[id] = els[id] || mkEl()); },
    createElement(){ return mkEl(); },
    createElementNS(ns, tag){ const e = mkEl(); e.ns = ns; e.tag = tag; return e; },
    head: { appendChild(s){
      attempted.push(s.src);
      // vendor/ files are absent on disk here; CDN availability is the knob.
      if (/^vendor\//.test(s.src)) { s.onerror(); return; }
      if (opts.cdnBlocked) { s.onerror(); return; }
      loaded.push(s.src); s.onload();
    }},
  };

  const listeners = {};
  const calls = {};
  // A fake trackball controls instance -- real button-assignment values are
  // opaque library-internal sentinels (see renderer.js's applyControlMode
  // comment), so any two distinct markers exercise the same swap logic.
  const fakeControls = { mouseButtons: { LEFT: 'ROTATE', MIDDLE: 'ZOOM', RIGHT: 'PAN' }, noRotate: false };
  // A stable instance (not a fresh object per call) so a test can perturb
  // .up the way orbiting does, then check that a reset levels it back.
  const fakeCamera = { fov: 75, up: { x: 0, y: 1, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; } } };
  const G = new Proxy({}, { get: (_t, prop) => {
    if (prop === 'camera') return () => fakeCamera;
    if (prop === 'cameraPosition') return (pos, look, ms) => { calls.__cam = { pos, look, ms }; return G; };
    if (prop === 'graph2ScreenCoords') {
      return (x, y, z) => (opts.badProjection ? { x: NaN, y: NaN } : { x: x / 2 + 500, y: y / 2 + 400 });
    }
    if (prop === 'controls') return () => fakeControls;
    return (...args) => {
      calls[prop] = (calls[prop] || 0) + 1;
      if (args.length === 0) return calls['__last_' + prop];
      calls['__last_' + prop] = args[0];
      return G;
    };
  }});

  const sandbox = {
    document: doc,
    ForceGraph3D: opts.cdnBlocked ? undefined : () => { sandbox.__fgCount = (sandbox.__fgCount || 0) + 1; return () => G; },
    SpriteText: opts.spriteText ? class { constructor(t){ this.text = t; this.position = {}; } } : undefined,
    fetch: () => Promise.resolve({ json: () => Promise.resolve(JSON.parse(JSON.stringify(data))) }),
    location: { protocol: opts.protocol || 'file:' },

    FileReader: class {
      readAsText(file) {
        this.result = file._text;
        if (file._fail) { this.onerror && this.onerror(); return; }
        this.onload && this.onload();
      }
    },
    setTimeout: (fn) => { try { fn(); } catch (e) { errs.push('setTimeout threw: ' + e.message); } },
    addEventListener: (k, fn) => { listeners[k] = fn; },
    requestAnimationFrame: (fn) => { if (!sandbox.__rafDone) { sandbox.__rafDone = true; fn(); } },
    console,
  };
  sandbox.window = sandbox;
  const errs = [];

  const vm = require('vm');
  const ctx = vm.createContext(sandbox);
  vm.runInContext(js + '\n;globalThis.__probe = { view: () => view, visible: () => (typeof view === "undefined" || !view) ? null : visibleData(), labelEls: () => labelEls, edgeEls: () => edgeEls, setEdgeLabels: v => { showEdgeLabels = v; rebuildLabels(); }, hidden: () => hiddenSet(), edgeLabelsOn: () => showEdgeLabels, setEdgeStyle: v => { edgeLabelStyle = v; rebuildLabels(); }, edgeStyle: () => edgeLabelStyle, colorFor: n => colorFor(n), presentationKey: n => presentationKey(n), presentation: () => NODE_PRESENTATION, decorateShapes: () => decorateShapes(), bands: () => bandEls, setBands: v => { showBands = v; rebuildBands(); }, positionBands: () => positionBands(), positionLabels: () => positionLabels(), rebuild: () => rebuildLabels(), defaultGraph: () => (typeof DEFAULT_GRAPH === "undefined" ? null : DEFAULT_GRAPH), loadDefault: () => loadDefault(), setDims: v => { dims = v; applyControlMode(); }, resetLayout: () => resetLayout(), statsCollapsed: () => statsCollapsed, iconEls: () => iconEls, positionIcons: () => positionIcons(), select: n => { selected = n; positionIcons(); }, renderDetail: n => renderDetail(n), openDomainRef: ref => openDomainRef(ref), selectedNode: () => selected, openFromGraph: n => openFromGraph(n), goBack: () => goBack(), closeDetail: () => closeDetail(), };', ctx);

  return { els, calls, loaded, loadedAll: () => attempted, errs, probe: sandbox.__probe, listeners, fgCount: () => sandbox.__fgCount || 0, cam: () => calls.__cam, controls: () => fakeControls, camera: () => fakeCamera };
}

const results = [];
const tick = () => new Promise(r => setImmediate(r));
async function main() {
const EMPTY = { _html: '', children: [], classList: { _on: false }, textContent: '' };
const el = (r, id) => r.els[id] || EMPTY;

// A: starts empty, then a chosen file renders
{
  const r = run('A', { cdnBlocked: false }); await tick();
  if (r.calls['__last_graphData']) results.push('A: rendered something before any file was opened');
  if (!el(r,'picker').classList._on) results.push('A: picker not shown on an empty start');
  if (el(r,'controls').classList._on) results.push('A: controls panel visible before a graph was opened');
  const inp = el(r,'file-input');
  inp.files = [{ name: 'payments.json', _text: JSON.stringify(data) }];
  inp.onchange(); await tick();
  const gd = r.calls['__last_graphData'];
  const vis = r.probe.visible();
  const nonFinite = vis.nodes.filter(n => !Number.isFinite(n.x) || !Number.isFinite(n.y));
  const labels = Object.keys(r.probe.labelEls());
  const shown = el(r,'notes').classList._on;
  const hostChildren = el(r,'labels').children.filter(c => /^nlabel/.test(c.className)).length;
  console.log('A: nodes =', gd && gd.nodes.length, '| non-finite coords =', nonFinite.length,
    '| label elements =', labels.length, '| in overlay =', hostChildren,
    '| diagnostics shown =', shown);
  if (!gd || gd.nodes.length !== 26) results.push('A: graphData did not get 26 nodes');
  if (nonFinite.length) results.push('A: non-finite coords: ' + nonFinite.length);
  if (labels.length !== 26) results.push('A: expected 26 label elements, got ' + labels.length);
  if (hostChildren !== 26) results.push('A: overlay holds ' + hostChildren + ' node labels, expected 26');
  if (shown) results.push('A: diagnostics shown on a healthy load');
  if (!r.calls['onEngineStop']) results.push('A: onEngineStop not registered');
  // The whole point of dropping SpriteText: no app code in the render loop.
  if (r.calls['nodeThreeObject']) results.push('A: nodeThreeObject is set again — render-loop risk reintroduced');
  const t = el(r,'labels').children[0].textContent;
  if (!t || /Domain$/.test(t)) results.push('A: label text not shortened: ' + t);
}

// B: projection returns NaN (camera not ready / node off-frustum)
{
  const r = run('B', { cdnBlocked: false, badProjection: true }); await tick();
  const bi = el(r,'file-input');
  bi.files = [{ name: 'payments.json', _text: JSON.stringify(data) }];
  bi.onchange(); await tick();
  const nl = el(r,'labels').children.filter(c => /^nlabel/.test(c.className));
  const hidden = nl.filter(c => c.style.display === 'none').length;
  console.log('B: node labels hidden on NaN projection =', hidden, 'of', nl.length);
  if (hidden !== nl.length || !nl.length) results.push('B: NaN projection did not hide all node labels (' + hidden + '/' + nl.length + ')');
}

// C: renderer missing -- must explain, never fall back to the network
{
  const r = run('C', { cdnBlocked: true }); await tick();
  const notes = el(r,'notes-body').children.map(c => c._html).join(' ');
  console.log('C: diagnostics shown =', el(r,'notes').classList._on,
    '| scripts attempted =', r.loadedAll().length,
    '| all relative =', r.loadedAll().every(u => !/^https?:/.test(u)),
    '| offers curl+npm =', /curl -Lo/.test(notes) && /npm pack/.test(notes));
  if (!el(r,'notes').classList._on) results.push('C: silent failure when the renderer is missing');
  if (!/vendor/.test(notes)) results.push('C: no actionable fix in the message');
  if (r.calls['__last_graphData']) results.push('C: tried to render without the library');
  if (r.loadedAll().some(u => /^https?:/.test(u))) {
    results.push('C: OFFLINE VIOLATION - attempted a remote script: ' + r.loadedAll().filter(u => /^https?:/.test(u)));
  }
  if (r.loadedAll().length !== 1) results.push('C: expected exactly one local source, attempted ' + r.loadedAll().length);
  if (!/npm pack/.test(notes)) results.push('C: no offline acquisition route offered');
}

// C2: static audit -- the shipped file must not reference a remote resource
{
  const src = fs.readFileSync('knowledge-visualizer.html', 'utf8');
  const loaders = [...src.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/g)].map(m => m[1]);
  const remoteLoaders = loaders.filter(u => /^(https?:)?\/\//.test(u));
  const assigned = [...src.matchAll(/\.src\s*=\s*([A-Za-z_$][\w$]*)/g)].map(m => m[1]);
  console.log('C2: markup src/href =', loaders.length ? loaders : 'none',
    '| remote =', remoteLoaders.length, '| js-assigned src vars =', assigned);
  if (remoteLoaders.length) results.push('C2: OFFLINE VIOLATION - remote src/href in markup: ' + remoteLoaders);
  const egress = /\bfetch\s*\(|XMLHttpRequest|sendBeacon|new WebSocket|<img|<form/.exec(
    src.replace(/\/\/[^\n]*/g, '').replace(/<!--[\s\S]*?-->/g, '')
  );
  console.log('C2: data-egress constructs outside comments =', egress ? egress[0] : 'none');
  if (egress) results.push('C2: OFFLINE VIOLATION - possible data egress: ' + egress[0]);
}

// D: no graph-data.js under file:// -> picker, then load by file
{
  const r = run('D', { cdnBlocked: false, protocol: 'file:' }); await tick();
  const pickerOpen = el(r,'picker').classList._on;
  const renderedEarly = !!r.calls['__last_graphData'];
  console.log('D: picker shown =', pickerOpen, '| rendered before a file was given =', renderedEarly);
  if (!pickerOpen) results.push('D: no picker on an empty start');
  if (renderedEarly) results.push('D: rendered before any data was supplied');

  // a wrong JSON file must be rejected with a useful message, not rendered
  const input = el(r,'file-input');
  input.files = [{ name: 'package.json', _text: '{"name":"something-else"}' }];
  input.onchange(); await tick();
  let notes = el(r,'notes-body').children.map(c => c._html).join(' ');
  const renderedWrong = !!r.calls['__last_graphData'];
  console.log('D: wrong-shape file rejected =', /not a Knowledge Visualizer graph file/.test(notes),
    '| rendered it anyway =', renderedWrong);
  if (!/not a Knowledge Visualizer graph file/.test(notes)) results.push('D: wrong-shape JSON not reported clearly');
  if (renderedWrong) results.push('D: rendered a file with no views array');

  // malformed JSON
  input.files = [{ name: 'broken.json', _text: '{oops' }];
  input.onchange(); await tick();
  notes = el(r,'notes-body').children.map(c => c._html).join(' ');
  if (!/not valid JSON/.test(notes)) results.push('D: malformed JSON not reported');

  // now the real thing
  input.files = [{ name: 'payments.json', _text: JSON.stringify(data) }];
  input.onchange(); await tick();
  const gd = r.calls['__last_graphData'];
  console.log('D: after loading payments.json -> nodes =', gd && gd.nodes.length,
    '| picker dismissed =', !el(r,'picker').classList._on);
  if (!gd || gd.nodes.length !== 26) results.push('D: picking payments.json did not render 26 nodes');
  if (el(r,'picker').classList._on) results.push('D: picker still open after a successful load');
  const stats = el(r,'stats-body')._html;
  if (!/payments\.json/.test(stats)) results.push('D: stats box does not name the file the data came from');
}

// E: opening a second file must reuse the renderer and reset per-graph state
{
  const r = run('E', { cdnBlocked: false }); await tick();
  const inp = el(r,'file-input');
  inp.files = [{ name: 'payments.json', _text: JSON.stringify(data) }];
  inp.onchange(); await tick();
  const afterFirst = r.fgCount();

  // hide a stage, then open a different file
  r.probe.hidden()['design-a-product'] = true;
  const shrunk = r.probe.visible().nodes.length;
  inp.files = [{ name: 'other-graph.json', _text: JSON.stringify(data) }];
  inp.onchange(); await tick();
  const afterSecond = r.fgCount();
  const nodesNow = r.probe.visible().nodes.length;
  const stats = el(r,'stats-body')._html;
  console.log('E: renderers constructed =', afterFirst, '->', afterSecond,
    '| nodes after reopen =', shrunk, '->', nodesNow,
    '| stats names new file =', /other-graph\.json/.test(stats));
  if (afterSecond !== afterFirst) results.push('E: a second WebGL renderer was constructed on reopen');
  if (nodesNow !== 26) results.push('E: stale group filter survived the file switch (' + nodesNow + ' nodes)');
  if (!/other-graph\.json/.test(stats)) results.push('E: stats box still names the previous file');
}

// F: the four visual complaints -- fill, edge weight, edge labels, particles
{
  const r = run('F', { cdnBlocked: false }); await tick();
  const inp = el(r,'file-input');
  inp.files = [{ name: 'payments.json', _text: JSON.stringify(data) }];
  inp.onchange(); await tick();

  const flow = data.views.find(v => v.layout === 'layered');

  // fill: padding must be small, and a fit must have happened
  const framed = !!r.cam() || !!r.calls['zoomToFit'];
  console.log('F: camera framed =', framed, '| via computed fit =', !!r.cam());
  if (!framed) results.push('F: the view was never framed');

  // edge labels are OFF by default (decision 53) -- assert that before
  // enabling them to check their text
  const offByDefault = !r.probe.edgeLabelsOn();
  const cbUnchecked = !el(r,'edge-labels-cb').checked;
  console.log('F: edge labels off by default =', offByDefault, '| checkbox unchecked =', cbUnchecked);
  if (!offByDefault) results.push('F: edge labels are on by default');
  if (!cbUnchecked) results.push('F: edge-labels checkbox starts checked, disagreeing with the default');
  r.probe.setEdgeLabels(true);
  const eEls = r.probe.edgeEls();
  const nEdge = Object.keys(eEls).length;
  // Prefix match, not an exact class: the active style appends its own class
  // ("elabel along"), and whether an edge label has text is independent of it.
  const sample = el(r,'labels').children.filter(c => /^elabel/.test(c.className))[0];
  console.log('F: edge label elements =', nEdge, 'of', flow.links.length,
    '| sample text =', JSON.stringify(sample && sample.textContent));
  if (nEdge !== flow.links.length) results.push('F: expected ' + flow.links.length + ' edge labels, got ' + nEdge);
  if (!sample || !sample.textContent) results.push('F: edge label has no text');
  if (sample && /_/.test(sample.textContent)) results.push('F: edge label still shows raw SCREAMING_SNAKE: ' + sample.textContent);

  // particles: direction as motion on every edge
  const parts = r.calls['__last_linkDirectionalParticles'];
  const flowParts = parts(flow.links[0]);
  const width = r.calls['__last_linkDirectionalParticleWidth'](flow.links[0]);
  const speed = r.calls['__last_linkDirectionalParticleSpeed'];
  console.log('F: particles per flow edge =', flowParts, '| width =', width, '| speed =', speed);
  if (!flowParts) results.push('F: no directional particles on the flow view');
  if (!(speed > 0 && speed < 0.02)) results.push('F: particle speed not a slow drift: ' + speed);

  // edge weight: flow edges must be far more opaque than before (was 0.42)
  const colFn = r.calls['__last_linkColor'];
  const wFn = r.calls['__last_linkWidth'];
  const col = colFn(flow.links[0]);
  const wid = wFn(flow.links[0]);
  const alpha = parseFloat((String(col).match(/[\d.]+\)$/) || ['1)'])[0]);
  console.log('F: flow edge colour =', col, '| alpha =', alpha, '| width =', wid);
  if (!(alpha >= 0.8)) results.push('F: flow edge still faint, alpha ' + alpha);
  if (!(wid >= 1.5)) results.push('F: flow edge still thin, width ' + wid);
}

// G: the computed camera fit actually fills the available region
{
  const r = run('G', { cdnBlocked: false }); await tick();
  const inp = el(r,'file-input');
  inp.files = [{ name: 'payments.json', _text: JSON.stringify(data) }];
  inp.onchange(); await tick();

  const cam = r.cam();
  if (!cam) { results.push('G: cameraPosition never called - computed fit did not run'); }
  else {
    const flow = r.probe.visible().nodes;
    const xs = flow.map(n => n.x), ys = flow.map(n => n.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const w = maxX - minX, h = maxY - minY;
    const W = 3270, H = 1730, PAD = 48, LEFT = 372;
    // Mirrors labelPixelMargins() in camera.js: label overlays are a fixed
    // number of screen pixels regardless of the zoom the fit picks, so the
    // expected fit here must reserve the same pixel margin, not just PAD.
    const halfW = Math.max(...flow.map(n =>
      String(n.title).replace(/ Domain$/, '').length * 5.6)) / 2;
    const marginX = halfW + 4, marginY = 11 + 14 + 4;
    const availW = W - LEFT - 2*marginX, availH = H - 2*marginY;
    const scale = Math.min(availW / (w + 2*PAD), availH / (h + 2*PAD));
    const fov = 75 * Math.PI / 180;
    const expectDist = (H / scale) / (2 * Math.tan(fov/2));
    const onScreenW = w * scale, onScreenH = h * scale;
    const fill = Math.max(onScreenW / availW, onScreenH / availH);
    console.log('G: world box =', Math.round(w) + 'x' + Math.round(h),
      '| scale =', scale.toFixed(3),
      '| on-screen =', Math.round(onScreenW) + 'x' + Math.round(onScreenH),
      '| fills', (fill*100).toFixed(0) + '% of the usable region',
      '| dist =', Math.round(cam.pos.z), '(expected', Math.round(expectDist) + ')');
    if (Math.abs(cam.pos.z - expectDist) > 1) results.push('G: camera distance is not the computed fit distance');
    if (!(fill > 0.8)) results.push('G: box fills only ' + (fill*100).toFixed(0) + '% of the usable region');
    // look-at must be shifted left of the box centre to clear the control panel
    const boxCx = (minX + maxX) / 2;
    if (!(cam.look.x < boxCx)) results.push('G: look-at not offset for the control panel keep-out');
    if (Math.abs(cam.look.y - (minY + maxY) / 2) > 0.51) results.push('G: look-at not vertically centred');
    if (!isFinite(cam.pos.z) || cam.pos.z <= 0) results.push('G: nonsensical camera distance ' + cam.pos.z);
  }
}

// H: node labels suppressed on collision; edge labels NEVER suppressed
{
  const r = run('H', { cdnBlocked: false }); await tick();
  const inp = el(r,'file-input');
  inp.files = [{ name: 'payments.json', _text: JSON.stringify(data) }];
  inp.onchange(); await tick();
  // Edge labels are off by default (decision 53); this scenario is about
  // how they behave when on, so turn them on rather than assume it.
  r.probe.setEdgeLabels(true);
  r.probe.positionLabels();

  const boxOf = (c) => {
    const m = /translate\((-?[\d.]+)px,(-?[\d.]+)px\)/.exec(c.style.transform || '');
    if (!m) return null;
    const x = parseFloat(m[1]), y = parseFloat(m[2]);
    const w = c.textContent.length * 5.6, h = 12;
    return { l: x - w/2 - 2, r: x + w/2 + 2, t: y - 1, b: y + h + 1, txt: c.textContent };
  };
  const overlaps = (list) => {
    let n = 0, ex = null;
    for (let i = 0; i < list.length; i++) for (let j = i+1; j < list.length; j++) {
      const a = list[i], b = list[j];
      if (a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t) { n++; if (!ex) ex = a.txt + ' / ' + b.txt; }
    }
    return { n, ex };
  };

  const kids = el(r,'labels').children;
  const nodeLabels = kids.filter(c => /^nlabel/.test(c.className));
  const edgeLabels = kids.filter(c => /^elabel/.test(c.className));
  const edgeHidden = edgeLabels.filter(c => c.style.display === 'none');
  const nodeClash = overlaps(nodeLabels.filter(c => c.style.display === 'block').map(boxOf).filter(Boolean));

  const flow = data.views.find(v => v.layout === 'layered');
  console.log('H: node labels', nodeLabels.length, '-> overlapping pairs', nodeClash.n,
    nodeClash.ex ? '(' + nodeClash.ex + ')' : '',
    '| edge labels', edgeLabels.length, 'of', flow.links.length, '-> suppressed', edgeHidden.length);

  if (nodeClash.n) results.push('H: ' + nodeClash.n + ' overlapping node-label pairs, e.g. ' + nodeClash.ex);
  if (edgeLabels.length !== flow.links.length) {
    results.push('H: expected an element for all ' + flow.links.length + ' edges, got ' + edgeLabels.length);
  }
  // The point of this scenario: no edge label may ever be hidden. Suppression
  // dropped the longest predicates first, which are the most informative.
  if (edgeHidden.length) {
    results.push('H: ' + edgeHidden.length + ' edge labels suppressed; edge labels must always show');
  }
  const longest = edgeLabels.reduce((a, c) => c.textContent.length > a.textContent.length ? c : a, edgeLabels[0]);
  console.log('H: longest predicate =', JSON.stringify(longest.textContent), '-> display', longest.style.display);
  if (longest.style.display !== 'block') results.push('H: the longest edge label is hidden');
}

// I: along-line style rotates each label to its edge, never upside down
{
  const r = run('I', { cdnBlocked: false }); await tick();
  const inp = el(r,'file-input');
  inp.files = [{ name: 'payments.json', _text: JSON.stringify(data) }];
  inp.onchange(); await tick();

  // Along-line is the default, so the default state is what gets checked for
  // rotation; flat has to be selected explicitly to sample it. Edge labels
  // themselves are off by default (decision 53), so turn them on first.
  r.probe.setEdgeLabels(true);
  const defaultStyle = r.probe.edgeStyle();
  r.probe.setEdgeStyle('flat'); await tick();
  r.probe.positionLabels();
  const flatSample = el(r,'labels').children.filter(c => /^elabel/.test(c.className))[0];
  const flatHasRotate = /rotate\(/.test(flatSample.style.transform || '');

  r.probe.setEdgeStyle('along'); await tick();
  r.probe.positionLabels();
  const along = el(r,'labels').children.filter(c => /^elabel/.test(c.className));
  const angles = along.map(c => {
    const m = /rotate\((-?[\d.]+)deg\)/.exec(c.style.transform || '');
    return m ? parseFloat(m[1]) : null;
  });
  const missing = angles.filter(a => a === null).length;
  const upsideDown = angles.filter(a => a !== null && (a > 90.001 || a < -90.001));
  const rotated = angles.filter(a => a !== null && Math.abs(a) > 0.001).length;
  console.log('I: default style =', defaultStyle,
    '| flat style has rotate =', flatHasRotate,
    '| along style: rotated', rotated, 'of', along.length,
    '| missing angle', missing, '| outside +/-90deg', upsideDown.length,
    '| classed .along =', along.every(c => /along/.test(c.className)));
  // Not asserted here: that shell.html's `class="on"` marks the same button
  // as this default. The two live in different files and can drift, but the
  // stub does not parse markup (querySelectorAll returns []), so it cannot
  // be checked from a session. Noted as a gap in README instead.
  if (defaultStyle !== 'along') results.push('I: default edge-label style is ' + defaultStyle + ', expected along');
  if (flatHasRotate) results.push('I: flat style should not rotate labels');
  if (missing) results.push('I: ' + missing + ' along-line labels have no rotation');
  if (upsideDown.length) results.push('I: angles outside +/-90deg would read upside down: ' + upsideDown);
  if (!rotated) results.push('I: along-line style rotated nothing');
  if (!along.every(c => /along/.test(c.className))) results.push('I: .along class not applied');
}

// J: stage bands -- one region per stage, four projected corners, captioned
{
  const r = run('J', { cdnBlocked: false }); await tick();
  const inp = el(r,'file-input');
  inp.files = [{ name: 'payments.json', _text: JSON.stringify(data) }];
  inp.onchange(); await tick();

  const flow = data.views.find(v => v.layout === 'layered');
  const bands = r.probe.bands();
  const boxes = bands.map(b => {
    const pts = (b.poly.getAttribute('points') || '').trim();
    if (!pts) return null;
    const pairs = pts.split(' ').map(q => q.split(',').map(Number));
    const xs = pairs.map(q => q[0]), ys = pairs.map(q => q[1]);
    return { n: pairs.length, l: Math.min(...xs), r: Math.max(...xs),
             t: Math.min(...ys), b: Math.max(...ys), cap: b.caption.textContent };
  });
  const drawn = boxes.filter(Boolean);
  console.log('J: bands =', bands.length, 'of', flow.stages.length,
    '| drawn =', drawn.length,
    '| corners each =', [...new Set(drawn.map(b => b.n))],
    '| captions =', drawn.map(b => b.cap));

  if (bands.length !== flow.stages.length) results.push('J: expected one band per stage, got ' + bands.length);
  if (drawn.length !== flow.stages.length) results.push('J: ' + (bands.length - drawn.length) + ' bands have no geometry');
  if (drawn.some(b => b.n !== 4)) results.push('J: a band is not a four-corner polygon');
  flow.stages.forEach(st => {
    if (!drawn.some(b => b.cap.includes(st.title))) results.push('J: no band captioned for stage ' + st.title);
  });

  // The whole point is visual separation, so the regions must not overlap.
  let clash = 0;
  for (let i = 0; i < drawn.length; i++) for (let j = i+1; j < drawn.length; j++) {
    const a = drawn[i], b = drawn[j];
    if (a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t) clash++;
  }
  console.log('J: overlapping band pairs =', clash);
  if (clash) results.push('J: ' + clash + ' stage bands overlap, defeating the separation');

  // Left edges are aligned across bands: ragged lefts read as three unrelated
  // regions stacked up rather than three lanes of one process. Right edges
  // are deliberately NOT aligned -- the stages differ in real width.
  const lefts = drawn.map(b => b.l);
  const spread = Math.max(...lefts) - Math.min(...lefts);
  console.log('J: band left edges =', lefts.map(v => v.toFixed(1)).join(', '),
    '| spread =', spread.toFixed(2) + 'px',
    '| right edges =', drawn.map(b => b.r.toFixed(0)).join(', '));
  if (spread > 0.2) results.push('J: band left edges not aligned, spread ' + spread.toFixed(1) + 'px');
  if (new Set(drawn.map(b => b.r.toFixed(1))).size < 2) {
    results.push('J: every band has the same right edge -- stages differ in width, so this is over-alignment');
  }

  // A band must enclose its stage's *labels*, not just its nodes. Boxing the
  // node coordinates alone left dashed edges cutting through the wider names
  // ("Terminal Fleet & Device Management", "Product Bundling & Eligibility"),
  // which reads as the band being wrong rather than the label overflowing.
  // Checked per stage, since each label belongs to exactly one band.
  r.probe.positionLabels();
  const lbl = r.probe.labelEls();
  const bandFor = {};
  bands.forEach((b, i) => { if (boxes[i]) bandFor[b.stage] = boxes[i]; });
  const escaped = [];
  let worst = 0;
  r.probe.visible().nodes.forEach(n => {
    const box = bandFor[n.stage], c = lbl[n.id];
    if (!box || !c) return;
    const m = /translate\((-?[\d.]+)px,(-?[\d.]+)px\)/.exec(c.style.transform || '');
    if (!m) return;
    const x = parseFloat(m[1]), y = parseFloat(m[2]);
    const w = c.textContent.length * 5.6, h = 14;
    const over = Math.max(box.l - (x - w/2), (x + w/2) - box.r, box.t - y, (y + h) - box.b);
    if (over > 0) { escaped.push(c.textContent); worst = Math.max(worst, over); }
  });
  console.log('J: node labels escaping their stage band =', escaped.length,
    escaped.length ? '| worst = ' + worst.toFixed(0) + 'px | e.g. ' + escaped.slice(0,3).join(' / ') : '');
  if (escaped.length) {
    results.push('J: ' + escaped.length + ' node labels fall outside their stage band, e.g. ' +
      escaped.slice(0,3).join(' / ') + ' (worst ' + worst.toFixed(0) + 'px)');
  }

  // hiding a stage must empty its band, not leave one around nothing
  r.probe.hidden()['design-a-product'] = true;
  r.probe.positionBands();
  const empties = r.probe.bands().filter(b => !(b.poly.getAttribute('points') || '').trim()).length;
  console.log('J: after hiding stage 1 -> bands with no geometry =', empties);
  if (empties !== 1) results.push('J: hiding a stage left ' + empties + ' empty bands, expected 1');
  delete r.probe.hidden()['design-a-product'];

  // a view with no stages must draw no bands at all -- there is only one
  // view now (it has stages), so exercise the guard directly rather than
  // switching to a removed second view that used to lack them.
  const v = r.probe.view();
  const savedStages = v.stages;
  delete v.stages;
  r.probe.setBands(true);
  console.log('J: bands with no stages data =', r.probe.bands().length);
  if (r.probe.bands().length) results.push('J: bands drawn on a view with no stages');
  v.stages = savedStages;
  r.probe.setBands(true);
}

// K: knowledge-visualizer.html's *structure* is generated from src/ by
// build.py and must never be hand-edited -- a forgotten rebuild after
// touching a src/*.js file would otherwise mean every scenario above is
// exercising stale code without anyone noticing. Reconstructs build.py's own
// concatenation in plain node rather than shelling out to python3, so this
// file's "requires only node" claim stays true. MODULE_ORDER is kept in sync
// with build.py by hand; both lists are short and rarely change.
//
// The generated default-graph block (decision 40) is stripped out on both
// sides before comparing, down to a marker string: reproducing build.py's
// Python json.dumps formatting byte-for-byte in node would be a fragile,
// pointless cross-language match, and structure and data are two genuinely
// separate freshness questions -- see scenario L for the data half.
{
  const BEGIN = '// BEGIN GENERATED DEFAULT GRAPH -- do not hand-edit, see build.py';
  const END = '// END GENERATED DEFAULT GRAPH';
  const stripBlock = (text) => {
    const i = text.indexOf(BEGIN), j = text.indexOf(END);
    if (i === -1 || j === -1) return null;
    return text.slice(0, i) + '<GENERATED>' + text.slice(j + END.length);
  };

  const MODULE_ORDER = [
    'state.js', 'graph-model.js', 'controls-panel.js', 'labels.js',
    'bands.js', 'camera.js', 'data-loading.js', 'renderer.js', 'bootstrap.js',
  ];
  const shell = fs.readFileSync('src/shell.html', 'utf8');
  const modules = MODULE_ORDER.map(name => fs.readFileSync('src/' + name, 'utf8').replace(/\n+$/, ''));
  // Stand-in for build.py's generated block: content doesn't matter here,
  // only that it sits between the same markers at the same position, so
  // stripBlock collapses both sides to the identical placeholder below.
  modules.splice(1, 0, `  ${BEGIN}\n  var DEFAULT_GRAPH = {};\n  ${END}`);
  const reconstructed = shell + modules.join('\n\n') + '\n</script>\n</body>\n</html>\n';

  const actual = stripBlock(html);
  const expected = stripBlock(reconstructed);
  const fresh = actual !== null && expected !== null && actual === expected;
  console.log('K: knowledge-visualizer.html structure matches build.py(src/) =', fresh);
  if (actual === null) results.push('K: could not find the generated default-graph markers -- run `python3 build.py`');
  else if (!fresh) results.push('K: knowledge-visualizer.html is stale against src/ -- run `python3 build.py`');
}

// L: the embedded default graph (decision 40) must match payments.json's
// current content -- a forgotten rebuild after regenerating payments.json is
// a distinct staleness risk from K's, since generate.py and build.py are two
// separate commands. Compared as parsed objects via JSON.stringify on both
// sides (both produced by this same node process), never as raw bytes
// against Python's own serialization, so no cross-language format concern.
{
  const r = run('L', {}); await tick();
  const embedded = r.probe.defaultGraph();
  const fresh = embedded !== null && JSON.stringify(embedded) === JSON.stringify(data);
  console.log('L: embedded DEFAULT_GRAPH matches payments.json =', fresh);
  if (embedded === null) results.push('L: DEFAULT_GRAPH not found in knowledge-visualizer.html -- run `python3 build.py`');
  else if (!fresh) results.push('L: embedded DEFAULT_GRAPH is stale against payments.json -- run `python3 generate.py` then `python3 build.py`');
}

// M: the Load default button/flow, in both places it appears
{
  const r = run('M', {}); await tick();
  if (!el(r,'picker').classList._on) results.push('M: picker not shown on an empty start');
  r.probe.loadDefault(); await tick();
  const gd = r.calls['__last_graphData'];
  console.log('M: Load default -> nodes =', gd && gd.nodes.length,
    '| picker dismissed =', !el(r,'picker').classList._on);
  if (!gd || gd.nodes.length !== 26) results.push('M: Load default did not render 26 nodes');
  if (el(r,'picker').classList._on) results.push('M: picker still open after Load default');
  const stats = el(r,'stats-body')._html;
  if (!/payments\.json/.test(stats)) results.push('M: stats box does not name payments.json after Load default');

  // Two clicks must not accumulate mutation on the shared DEFAULT_GRAPH
  // object -- applyLayout() writes fx/fy/fz/x/y/z onto node objects in
  // place, so a second load reusing the same reference should reproduce
  // identical coordinates, not drift.
  const firstX = r.probe.visible().nodes[0].x;
  r.probe.loadDefault(); await tick();
  const secondX = r.probe.visible().nodes[0].x;
  console.log('M: coordinate stable across two Load default clicks =', firstX === secondX);
  if (firstX !== secondX) results.push('M: repeated Load default drifted a node coordinate: ' + firstX + ' -> ' + secondX);
}

// N: node colour encodes kind (and an actor's role), and the legend agrees
{
  const r = run('N', { cdnBlocked: false }); await tick();
  const inp = el(r,'file-input');
  inp.files = [{ name: 'payments.json', _text: JSON.stringify(data) }];
  inp.onchange(); await tick();

  const nodes = r.probe.visible().nodes;
  const keys = [...new Set(nodes.map(n => r.probe.presentationKey(n)))].sort();
  console.log('N: presentation keys in view =', keys.join(', '));

  // Every key present must exist in the table -- an unmapped kind silently
  // falls back to grey, which looks deliberate and is not.
  const table = r.probe.presentation();
  const unmapped = keys.filter(k => !table[k]);
  if (unmapped.length) results.push('N: no presentation entry for ' + unmapped.join(', '));

  // Internal and external users must not render identically: that is the
  // whole distinction the model carries actor_type for.
  const staff = nodes.find(n => n.actor_type === 'InternalStaff');
  const cust = nodes.find(n => n.actor_type === 'Customer');
  const sameColor = staff && cust && r.probe.colorFor(staff) === r.probe.colorFor(cust);
  console.log('N: internal staff =', staff && r.probe.colorFor(staff),
    '| customer =', cust && r.probe.colorFor(cust), '| distinct =', !sameColor);
  if (!staff || !cust) results.push('N: expected both an InternalStaff and a Customer actor in the flow view');
  if (sameColor) results.push('N: internal and external users render the same colour');

  // Decision 52: staff white; every external actor type and external
  // systems one light yellow.
  const staffWhite = r.probe.colorFor({ kind: 'actor', actor_type: 'InternalStaff' }) === '#ffffff';
  const extColors = [...new Set(['Customer', 'Partner', 'Regulator'].map(
    t => r.probe.colorFor({ kind: 'actor', actor_type: t })).concat(r.probe.colorFor({ kind: 'external' })))];
  const extYellow = extColors.length === 1 && extColors[0] === '#ffd479';
  console.log('N: staff white =', staffWhite, '| external actors + systems one light yellow =', extYellow, extColors);
  if (!staffWhite) results.push('N: Tyro staff actors are not white');
  if (!extYellow) results.push('N: external actors and systems are not all light yellow (' + extColors.join(', ') + ')');

  // The library caches one mesh material per colour string, and actors'
  // material is made transparent -- so no non-actor may ever get a mesh
  // colour string an actor gets, in any selection state. This is how
  // external systems went invisible once they shared actors' yellow, and
  // why a selected node (#ffffff) would vanish alongside white staff.
  const meshColor = r.calls['__last_nodeColor'];
  // "Actor" here means any icon-drawn node -- external systems too, since
  // decision 54 -- because that is what gets the transparent material.
  const isActor = n => r.probe.presentation()[r.probe.presentationKey(n)] &&
    !!r.probe.presentation()[r.probe.presentationKey(n)].shape;
  const actorKeys = new Set(), otherKeys = new Set();
  for (const sel of [null, ...nodes]) {
    r.probe.select(sel);
    nodes.forEach(n => (isActor(n) ? actorKeys : otherKeys).add(meshColor(n)));
  }
  r.probe.select(null);
  const shared = [...actorKeys].filter(k => otherKeys.has(k));
  console.log('N: actor mesh colour keys =', [...actorKeys], '| shared with a non-actor mesh =', shared);
  if (shared.length) results.push('N: actor mesh colour ' + shared.join(', ') + ' is shared with a non-actor, which then inherits the transparent material');

  // Colour must mean exactly one thing now: two domains in different stages
  // used to differ, which made colour ambiguous between kind and stage.
  const doms = nodes.filter(n => n.kind === 'domain');
  const domStages = [...new Set(doms.map(n => n.stage))];
  const domColors = [...new Set(doms.map(n => r.probe.colorFor(n)))];
  console.log('N: domains span', domStages.length, 'stages ->', domColors.length, 'colour(s)');
  if (domStages.length > 1 && domColors.length !== 1) {
    results.push('N: domain colour still varies by stage (' + domColors.length + ' colours), so colour encodes two things');
  }

  // The legend must list exactly the kinds on screen, no more and no fewer.
  const legendRows = el(r,'kind-legend').children.length;
  console.log('N: legend rows =', legendRows, 'for', keys.length, 'kinds present');
  if (legendRows !== keys.length) {
    results.push('N: legend shows ' + legendRows + ' rows but ' + keys.length + ' kinds are present');
  }
}

// O: actors' 3D mesh is made fully transparent, in every view, never rebuilt
{
  const r = run('O', { cdnBlocked: false }); await tick();
  const inp = el(r,'file-input');
  inp.files = [{ name: 'payments.json', _text: JSON.stringify(data) }];
  inp.onchange(); await tick();

  // The stub has no three.js, so stand in for the mesh the library binds to
  // each node. decorateShapes() now only ever reads/writes .material.
  const mkObj = (material) => ({ material: material || { color: 'initial' } });

  const nodes = r.probe.visible().nodes;
  nodes.forEach(n => { n.__threeObj = mkObj(); });
  r.probe.decorateShapes();

  // "Actors" here means every icon-drawn node: external systems joined the
  // icon overlay in decision 54, so their sphere must be hidden the same way.
  const iconDrawn = n => n.kind === 'actor' || n.kind === 'external';
  const actors = nodes.filter(iconDrawn);
  const others = nodes.filter(n => !iconDrawn(n));
  const actorsHidden = actors.every(n => n.__threeObj.material.opacity === 0 &&
    n.__threeObj.material.transparent === true);
  const othersUntouched = others.every(n => n.__threeObj.material.opacity === undefined);
  console.log('O: actors =', actors.length, '-> all made transparent =', actorsHidden,
    '| non-actor materials untouched =', othersUntouched);
  if (!actors.length) results.push('O: no actors in the flow view to hide');
  if (!actorsHidden) results.push('O: not every actor mesh was made transparent');
  if (!othersUntouched) results.push('O: decorateShapes touched a non-actor node\'s material');

  // Still hidden in 3D -- there is no 3D-only silhouette to fall back to
  // any more, so leaving an actor visible there would be the regression.
  r.probe.setDims(3);
  actors.forEach(n => { n.__threeObj = mkObj(); });
  r.probe.decorateShapes();
  const hiddenIn3D = actors.every(n => n.__threeObj.material.opacity === 0 &&
    n.__threeObj.material.transparent === true);
  console.log('O: also hidden in 3D =', hiddenIn3D);
  if (!hiddenIn3D) results.push('O: an actor mesh was left visible in 3D');
  r.probe.setDims(2);

  // Re-asserted every frame, not set once: a recolour (selection, scope
  // dimming) can swap in a *different* cached material at any time, and a
  // one-time set on the old object would not follow it.
  const body0 = actors[0].__threeObj;
  const freshMaterial = { color: 'reselected' };
  body0.material = freshMaterial;
  r.probe.decorateShapes();
  console.log('O: a freshly swapped-in material is re-hidden =',
    freshMaterial.opacity === 0 && freshMaterial.transparent === true);
  if (freshMaterial.opacity !== 0 || !freshMaterial.transparent) {
    results.push('O: decorateShapes did not re-hide a freshly swapped-in material');
  }
}

// P: dragging pans the plane in 2D, orbits freely in 3D
{
  const r = run('P', { cdnBlocked: false }); await tick();
  // Captured before any file loads, and thus before ensureGraph() ever calls
  // applyControlMode() -- dims defaults to 2, so grabbing these afterwards
  // would read back already-swapped values instead of the true defaults.
  const controls = r.controls();
  const rotateDefault = controls.mouseButtons.LEFT;
  const panDefault = controls.mouseButtons.RIGHT;

  const inp = el(r,'file-input');
  inp.files = [{ name: 'payments.json', _text: JSON.stringify(data) }];
  inp.onchange(); await tick();

  r.probe.setDims(2);
  const twoD = { noRotate: controls.noRotate, leftIsPan: controls.mouseButtons.LEFT === panDefault };
  console.log('P: 2D -> noRotate =', twoD.noRotate, '| left-drag mapped to pan =', twoD.leftIsPan);
  if (!twoD.noRotate) results.push('P: 2D mode still allows the camera to orbit off the plane');
  if (!twoD.leftIsPan) results.push('P: 2D mode left-drag is not mapped to pan');

  r.probe.setDims(3);
  const threeD = { noRotate: controls.noRotate, leftIsRotate: controls.mouseButtons.LEFT === rotateDefault };
  console.log('P: 3D -> noRotate =', threeD.noRotate, '| left-drag restored to rotate =', threeD.leftIsRotate);
  if (threeD.noRotate) results.push('P: 3D mode lost its orbit rotation');
  if (!threeD.leftIsRotate) results.push('P: 3D mode left-drag was not restored to rotate');
}

// Q: "Reset positions" undoes a dragged node
{
  const r = run('Q', { cdnBlocked: false }); await tick();
  const inp = el(r,'file-input');
  inp.files = [{ name: 'payments.json', _text: JSON.stringify(data) }];
  inp.onchange(); await tick();

  // 3d-force-graph's own drag controls overwrite fx/fy/x/y directly, and
  // nothing else ever recomputes them -- resetLayout() must reproduce the
  // same values applyLayout() set on first load, derived fresh from the
  // node's untouched col/lane/row.
  const target = r.probe.visible().nodes[0];
  const original = { fx: target.fx, fy: target.fy, x: target.x, y: target.y };
  target.fx = 9999; target.fy = 9999; target.x = 9999; target.y = 9999;
  r.probe.resetLayout(); await tick();
  const restored = { fx: target.fx, fy: target.fy, x: target.x, y: target.y };
  const layeredOk = JSON.stringify(restored) === JSON.stringify(original);
  console.log('Q: dragged node restored =', layeredOk);
  if (!layeredOk) results.push('Q: reset did not restore the computed position: ' + JSON.stringify(restored));
}

// R: Fit to view and Reset positions level a camera drifted by 3D orbiting
{
  const r = run('R', { cdnBlocked: false }); await tick();
  const inp = el(r,'file-input');
  inp.files = [{ name: 'payments.json', _text: JSON.stringify(data) }];
  inp.onchange(); await tick();

  const isLevel = () => r.camera().up.x === 0 && r.camera().up.y === 1 && r.camera().up.z === 0;

  // TrackballControls rotates the camera's own `up` vector while orbiting in
  // 3D, and nothing else ever resets it -- simulate that drift directly.
  r.camera().up.set(0.3, 0.9, 0.1);
  el(r,'fit-btn').click(); await tick();
  console.log('R: Fit to view levels a drifted up vector =', isLevel());
  if (!isLevel()) results.push('R: Fit to view left the camera up vector drifted: ' + JSON.stringify(r.camera().up));

  r.camera().up.set(0.3, 0.9, 0.1);
  r.probe.resetLayout(); await tick();
  console.log('R: Reset positions levels a drifted up vector =', isLevel());
  if (!isLevel()) results.push('R: Reset positions left the camera up vector drifted: ' + JSON.stringify(r.camera().up));
}

// S: the info panel collapses to a small icon on click and expands back
{
  const r = run('S', { cdnBlocked: false }); await tick();
  const inp = el(r,'file-input');
  inp.files = [{ name: 'payments.json', _text: JSON.stringify(data) }];
  inp.onchange(); await tick();

  const before = r.probe.statsCollapsed();
  el(r,'stats-toggle').click();
  const afterFirstClick = r.probe.statsCollapsed();
  const titleAfterCollapse = el(r,'stats-toggle').title;
  const iconAfterCollapse = el(r,'stats-toggle')._html;
  el(r,'stats-toggle').click();
  const afterSecondClick = r.probe.statsCollapsed();
  const titleAfterExpand = el(r,'stats-toggle').title;
  const iconAfterExpand = el(r,'stats-toggle')._html;
  console.log('S: starts expanded =', !before, '| collapses on click =', afterFirstClick,
    '| expands on a second click =', !afterSecondClick,
    '| title tracks state =', titleAfterCollapse === 'Expand' && titleAfterExpand === 'Collapse',
    '| icon tracks state =', iconAfterCollapse === '&#9432;' && iconAfterExpand === '&#8722;');
  if (before) results.push('S: stats panel starts collapsed, expected expanded by default');
  if (!afterFirstClick) results.push('S: clicking the toggle did not collapse the stats panel');
  if (afterSecondClick) results.push('S: clicking the toggle again did not expand the stats panel back');
  // A minimize glyph while expanded ("click to shrink me"), an info glyph
  // once collapsed ("this is the info panel") -- not the same icon twice,
  // which never signalled which action a click would take.
  if (iconAfterCollapse !== '&#9432;' || iconAfterExpand !== '&#8722;') {
    results.push('S: toggle icon did not swap between expanded and collapsed: ' +
      iconAfterCollapse + ' / ' + iconAfterExpand);
  }
  if (titleAfterCollapse !== 'Expand' || titleAfterExpand !== 'Collapse') {
    results.push('S: toggle title did not track collapsed state: ' + titleAfterCollapse + ' / ' + titleAfterExpand);
  }
}

// T: actor icon overlay, coloured like the mesh, shown in every view
{
  const r = run('T', { cdnBlocked: false }); await tick();
  const inp = el(r,'file-input');
  inp.files = [{ name: 'payments.json', _text: JSON.stringify(data) }];
  inp.onchange(); await tick();

  const actors = r.probe.visible().nodes.filter(n => n.kind === 'actor');
  const iconEls = r.probe.iconEls();
  const built = actors.every(n => !!iconEls[n.id]);
  const iconKinds = r.probe.visible().nodes.filter(n => n.kind === 'actor' || n.kind === 'external');
  const noExtra = Object.keys(iconEls).length === iconKinds.length;
  console.log('T: actor icons built =', built, '| one per actor/external system, no extra =', noExtra,
    '(', Object.keys(iconEls).length, 'of', iconKinds.length, ')');
  if (!built) results.push('T: not every actor got an icon element');
  if (!noExtra) results.push('T: icon count does not match actor + external system count: ' + Object.keys(iconEls).length + ' vs ' + iconKinds.length);

  // Decision 54: external systems are drawn as a server icon, not a sphere,
  // and actors keep the person glyph.
  const externals = r.probe.visible().nodes.filter(n => n.kind === 'external');
  const serverIcons = externals.filter(n => iconEls[n.id] && iconEls[n.id].getAttribute('data-shape') === 'server');
  const personIcons = actors.filter(n => iconEls[n.id] && iconEls[n.id].getAttribute('data-shape') === 'person');
  console.log('T: external systems as server icon =', serverIcons.length, 'of', externals.length,
    '| actors as person icon =', personIcons.length, 'of', actors.length);
  if (!externals.length) results.push('T: no external system in the flow view to test the server icon against');
  if (serverIcons.length !== externals.length) results.push('T: not every external system is drawn as a server icon');
  if (personIcons.length !== actors.length) results.push('T: not every actor is drawn as a person icon');

  // 2D is the default: visible, positioned, and coloured per role.
  const sample = actors[0];
  const el0 = iconEls[sample.id];
  console.log('T: 2D -> display =', el0.style.display, '| transform set =', !!el0.style.transform,
    '| colour =', el0.style.color);
  if (el0.style.display === 'none') results.push('T: actor icon hidden in 2D, the default');
  if (!el0.style.transform) results.push('T: actor icon has no screen position in 2D');
  if (!el0.style.color) results.push('T: actor icon has no colour in 2D');

  // 3D: graph2ScreenCoords() reprojects correctly under any camera
  // transform, orbiting included, so the icon has no reason to hide there --
  // it is the only representation of an actor in every view now.
  r.probe.setDims(3);
  r.probe.positionIcons();
  console.log('T: 3D -> display =', el0.style.display, '| transform set =', !!el0.style.transform,
    '| colour =', el0.style.color);
  if (el0.style.display === 'none') results.push('T: actor icon hidden in 3D -- there is no silhouette left to fall back to');
  if (!el0.style.transform) results.push('T: actor icon has no screen position in 3D');
  if (!el0.style.color) results.push('T: actor icon has no colour in 3D');

  r.probe.setDims(2);
  r.probe.positionIcons();

  // Glow is selection-only: unselected is a plain className, selecting this
  // actor adds "sel" (which carries the glow in CSS), deselecting removes it.
  const classUnselected = el0.className;
  r.probe.select(sample);
  const classSelected = el0.className;
  r.probe.select(null);
  const classDeselected = el0.className;
  console.log('T: glow class -> unselected =', JSON.stringify(classUnselected),
    '| selected =', JSON.stringify(classSelected), '| deselected =', JSON.stringify(classDeselected));
  if (/\bsel\b/.test(classUnselected)) results.push('T: actor icon glows before anything is selected');
  if (!/\bsel\b/.test(classSelected)) results.push('T: actor icon did not glow when selected');
  if (/\bsel\b/.test(classDeselected)) results.push('T: actor icon kept glowing after deselecting');
}

// U: decision 53's rule -- an edge label shows iff
// (a node is selected) ? (the edge touches it) : (the global toggle is on).
{
  const r = run('U', { cdnBlocked: false }); await tick();
  const inp = el(r,'file-input');
  inp.files = [{ name: 'payments.json', _text: JSON.stringify(data) }];
  inp.onchange(); await tick();

  const vis = r.probe.visible();
  const n = vis.nodes.find(x => vis.links.filter(l => [l.source.id || l.source, l.target.id || l.target].includes(x.id)).length >= 2);
  const touching = vis.links.filter(l => [l.source.id || l.source, l.target.id || l.target].includes(n.id)).length;
  const shown = () => Object.values(r.probe.edgeEls()).filter(e => e.style.display !== 'none').length;
  const at = (sel, on) => { r.probe.setEdgeLabels(on); r.probe.select(sel); r.probe.rebuild(); return shown(); };

  const cases = [
    ['toggle off, nothing selected -> 0', at(null, false), 0],
    ['toggle off, node selected -> its edges', at(n, false), touching],
    ['toggle off, deselected -> 0', at(null, false), 0],
    ['toggle on, nothing selected -> all', at(null, true), vis.links.length],
    ['toggle on, node selected -> its edges', at(n, true), touching],
  ];
  console.log('U: ' + cases.map(([k, got, want]) => k + ' = ' + got + (got === want ? '' : ' (want ' + want + ')')).join(' | '));
  cases.filter(([, got, want]) => got !== want).forEach(([k, got]) => results.push('U: ' + k + ', got ' + got));
  r.probe.select(null);
}

// W: a domain's explicit non-authority renders as node-level text, not edges
{
  const r = run('W', { cdnBlocked: false }); await tick();
  const inp = el(r,'file-input');
  inp.files = [{ name: 'payments.json', _text: JSON.stringify(data) }];
  inp.onchange(); await tick();

  // not_authoritative_for briefly existed as a `domain -> domain` relationship
  // type and was reversed (kg-core/SCHEMA.md's Open items): the source of
  // truth is domain-level text only now, surfaced in that domain's own
  // detail panel rather than as a graph edge to jump to.
  //
  // Since decision 49 each item is `{content, ref, unresolved?}`. The old
  // check here did `html.includes(item)`, which still passed once items were
  // objects -- both sides coerce to "[object Object]" -- so it could not see
  // that the renderer was never updated. Every assertion below names a
  // string field explicitly for that reason.
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const withNaf = r.probe.visible().nodes.filter(
    n => n.kind === 'domain' && n.not_authoritative_for && n.not_authoritative_for.length);
  const domainNode = withNaf[0];
  if (!domainNode) {
    results.push('W: no domain node in the flow view carries not_authoritative_for text to test against');
  } else {
    const first = domainNode.not_authoritative_for[0];
    const isObject = first && typeof first === 'object' && typeof first.content === 'string';
    r.probe.renderDetail(domainNode);
    const html = el(r,'detail-body')._html;
    const hasSection = /Not authoritative for/.test(html);
    const hasContent = isObject && html.includes(esc(first.content));
    const resolved = domainNode.not_authoritative_for.find(i => i.ref && !i.unresolved);
    const hasOwner = !!resolved && html.includes(esc(resolved.ref_title || resolved.ref));
    const noCoercion = !html.includes('[object Object]');
    console.log('W: object shape =', isObject, '| section =', hasSection,
      '| shows content =', hasContent, '| shows owner =', hasOwner, '| no [object Object] =', noCoercion);
    if (!isObject) results.push('W: not_authoritative_for items are not {content, ref} objects -- payments.json predates decision 49, run `python3 generate.py`');
    if (!hasSection) results.push('W: domain detail panel has no "Not authoritative for" section');
    if (isObject && !hasContent) results.push('W: "Not authoritative for" is missing its excluded content: ' + first.content);
    if (!hasOwner) results.push('W: "Not authoritative for" does not name a resolved owner domain');
    if (!noCoercion) results.push('W: detail panel renders "[object Object]" -- an item was stringified, not read');

    // Owner titles resolve at generation time: most owners are outside the
    // flow view, so a bare id would otherwise be all the panel could show.
    const titled = resolved && typeof resolved.ref_title === 'string' && resolved.ref_title !== resolved.ref;
    console.log('W: resolved owner carries a derived ref_title =', !!titled);
    if (!titled) results.push('W: resolved not_authoritative_for owner has no ref_title from generate.py');

    // An unresolved ref is a gap and must look like one, not like an owner.
    const gapNode = withNaf.find(n => n.not_authoritative_for.some(i => i.unresolved));
    if (!gapNode) {
      results.push('W: no flow-view domain has an unresolved not_authoritative_for ref to test against');
    } else {
      r.probe.renderDetail(gapNode);
      const gapHtml = el(r,'detail-body')._html;
      const gap = gapNode.not_authoritative_for.find(i => i.unresolved);
      const flagged = /class="pill gap"/.test(gapHtml) && gapHtml.includes(esc(gap.ref));
      console.log('W: unresolved ref rendered as a gap pill =', flagged);
      if (!flagged) results.push('W: unresolved ref "' + gap.ref + '" is not rendered as a gap pill');
    }
  }
}

// Y: an owner pill in "Not authoritative for" is a link. An owner on the
// graph is selected (its stage un-hidden if filtered out); an owner with no
// node in this flow is shown from the view's domain_index; a gap is never a
// link. Clicks go through the pane's one delegated handler, so that is what
// is driven here, not openDomainRef directly.
{
  const r = run('Y', { cdnBlocked: false }); await tick();
  const inp = el(r,'file-input');
  inp.files = [{ name: 'payments.json', _text: JSON.stringify(data) }];
  inp.onchange(); await tick();

  const v = r.probe.view();
  const onGraph = new Set(v.nodes.map(n => n.domain_ref).filter(Boolean));
  const idx = v.domain_index || {};
  const resolvedRefs = v.nodes.flatMap(n => (n.not_authoritative_for || []))
    .filter(i => i.ref && !i.unresolved).map(i => i.ref);
  const dead = [...new Set(resolvedRefs)].filter(ref => !onGraph.has(ref) && !idx[ref]);
  console.log('Y: domain_index entries =', Object.keys(idx).length, '| dead owner links =', dead.length);
  if (!Object.keys(idx).length) results.push('Y: view has no domain_index -- run `python3 generate.py`');
  if (dead.length) results.push('Y: owner link(s) resolve to nothing: ' + dead.join(', '));

  const click = ref => {
    const h = el(r,'detail-body').onclick;
    if (typeof h !== 'function') { results.push('Y: detail pane has no click handler for owner links'); return; }
    h({ target: { getAttribute: a => a === 'data-ref' ? ref : null, parentNode: null } });
  };
  const from = v.nodes.find(n => (n.not_authoritative_for || []).some(i => onGraph.has(i.ref)) &&
    (n.not_authoritative_for || []).some(i => i.ref && !i.unresolved && !onGraph.has(i.ref)));
  if (!from) {
    results.push('Y: no flow domain has both an on-graph and an off-graph owner to test against');
  } else {
    const inRef = from.not_authoritative_for.find(i => onGraph.has(i.ref)).ref;
    const offRef = from.not_authoritative_for.find(i => i.ref && !i.unresolved && !onGraph.has(i.ref)).ref;
    const target = v.nodes.find(n => n.domain_ref === inRef);

    r.probe.renderDetail(from);
    const linked = el(r,'detail-body')._html.includes('data-ref="' + inRef + '"');

    // On-graph owner, with its stage filtered out first.
    r.probe.hidden()[target.stage] = true;
    click(inRef);
    const sel = r.probe.selectedNode();
    const selectedIt = !!sel && sel.domain_ref === inRef;
    const unhidden = r.probe.visible().nodes.some(n => n.id === target.id);
    const paneIt = el(r,'detail-body')._html.includes('<h2>' + target.title.replace(/&/g, '&amp;') + '</h2>');
    console.log('Y: on-graph owner -> linked =', linked, '| selected =', selectedIt,
      '| un-hidden =', unhidden, '| pane shows it =', paneIt);
    if (!linked) results.push('Y: resolved owner "' + inRef + '" is not rendered as a data-ref link');
    if (!selectedIt) results.push('Y: clicking on-graph owner "' + inRef + '" did not select its node');
    if (!unhidden) results.push('Y: clicking an owner whose stage is filtered out left it hidden');
    if (!paneIt) results.push('Y: pane does not show "' + target.title + '" after clicking its owner link');

    // Off-graph owner: pane shows it from domain_index, graph selects nothing.
    click(offRef);
    const offHtml = el(r,'detail-body')._html;
    const offShown = !!idx[offRef] && offHtml.includes(idx[offRef].title.replace(/&/g, '&amp;')) &&
      /not in this flow/.test(offHtml);
    const nothingSelected = r.probe.selectedNode() === null;
    const chains = !(idx[offRef] && idx[offRef].not_authoritative_for.length) || /Not authoritative for/.test(offHtml);
    console.log('Y: off-graph owner -> pane shows it =', offShown, '| graph selection cleared =',
      nothingSelected, '| its own owners listed =', chains);
    if (!offShown) results.push('Y: clicking off-graph owner "' + offRef + '" did not show it from domain_index');
    if (!nothingSelected) results.push('Y: an off-graph owner left a graph node selected');
    if (!chains) results.push('Y: off-graph domain pane omits its own "Not authoritative for" links');
  }

  // A gap is never a link.
  const gapNode = v.nodes.find(n => (n.not_authoritative_for || []).some(i => i.unresolved));
  if (gapNode) {
    r.probe.renderDetail(gapNode);
    const gap = gapNode.not_authoritative_for.find(i => i.unresolved);
    const gapLinked = el(r,'detail-body')._html.includes('data-ref="' + gap.ref.replace(/&/g, '&amp;') + '"');
    console.log('Y: unresolved ref rendered as a link =', gapLinked);
    if (gapLinked) results.push('Y: unresolved ref "' + gap.ref + '" is rendered as a clickable link');
  }
}

// Z: the pane's back (←) button retraces followed owner links, across both
// on-graph nodes and off-graph domains, and a graph pick or close starts a
// fresh trail. Hidden whenever there is nothing to go back to.
{
  const r = run('Z', { cdnBlocked: false }); await tick();
  const inp = el(r,'file-input');
  inp.files = [{ name: 'payments.json', _text: JSON.stringify(data) }];
  inp.onchange(); await tick();

  const v = r.probe.view();
  const onGraph = new Set(v.nodes.map(n => n.domain_ref).filter(Boolean));
  const A = v.nodes.find(n => (n.not_authoritative_for || []).some(i => onGraph.has(i.ref)) &&
    (n.not_authoritative_for || []).some(i => i.ref && !i.unresolved && !onGraph.has(i.ref)));
  if (!A) {
    results.push('Z: no flow domain has both an on-graph and an off-graph owner to test against');
  } else {
    const bRef = A.not_authoritative_for.find(i => onGraph.has(i.ref)).ref;
    const cRef = A.not_authoritative_for.find(i => i.ref && !i.unresolved && !onGraph.has(i.ref)).ref;
    const B = v.nodes.find(n => n.domain_ref === bRef);
    const backShown = () => el(r,'detail-back').style.display !== 'none';
    const sel = () => r.probe.selectedNode();
    const steps = [];

    r.probe.openFromGraph(A);           steps.push(['start hidden', !backShown()]);
    r.probe.openDomainRef(bRef);        steps.push(['after link, shown', backShown() && sel() && sel().id === B.id]);
    r.probe.openDomainRef(cRef);        steps.push(['off-graph, nothing selected', backShown() && sel() === null]);
    r.probe.goBack();                   steps.push(['back to B', !!sel() && sel().id === B.id && backShown()]);
    r.probe.goBack();                   steps.push(['back to A, hidden again', !!sel() && sel().id === A.id && !backShown()]);
    r.probe.goBack();                   steps.push(['back at trail start is a no-op', !!sel() && sel().id === A.id]);
    r.probe.openDomainRef(bRef);
    r.probe.openFromGraph(A);           steps.push(['graph pick resets trail', !backShown()]);
    r.probe.openDomainRef(bRef);
    r.probe.closeDetail();
    r.probe.openFromGraph(B);           steps.push(['close resets trail', !backShown()]);

    console.log('Z: ' + steps.map(([k, ok]) => k + ' = ' + !!ok).join(' | '));
    steps.filter(([, ok]) => !ok).forEach(([k]) => results.push('Z: back navigation failed at "' + k + '"'));
  }
}

// X: payments.json's not_authoritative_for matches kg-content's domains.json.
// L and K catch a stale page against payments.json and src/; nothing caught
// payments.json itself going stale against kg-content -- which is exactly
// how decision 49's data change went unrendered: the renderer check passed
// against a payments.json generated before it. ref_title is derived by
// generate.py, so it is stripped before comparing.
{
  const domains = JSON.parse(fs.readFileSync('../kg-content/entities/domains.json', 'utf8')).domains;
  const byId = Object.fromEntries(domains.map(d => [d.id, d]));
  const stale = data.views.flatMap(v => v.nodes).filter(n => n.domain_ref && byId[n.domain_ref]).filter(n => {
    const got = (n.not_authoritative_for || []).map(i => {
      if (typeof i !== 'object') return i;
      const { ref_title, ...rest } = i; return rest;
    });
    return JSON.stringify(got) !== JSON.stringify(byId[n.domain_ref].authority.not_authoritative_for);
  });
  console.log('X: payments.json not_authoritative_for matches domains.json =', stale.length === 0,
    '(' + stale.length + ' stale domain nodes)');
  if (stale.length) results.push('X: payments.json is stale against domains.json for ' + stale.length +
    ' domain node(s), e.g. ' + stale[0].id + ' -- run `python3 generate.py` then `python3 build.py`');

  // domain_index (scenario Y's off-graph panes) is derived from the same
  // file, so it goes stale the same way.
  const strip = l => (l || []).map(i => { const { ref_title, ...rest } = i; return rest; });
  const staleIdx = data.views.filter(v => v.domain_index).flatMap(v =>
    domains.filter(d => !v.domain_index[d.id] || v.domain_index[d.id].title !== d.title ||
      JSON.stringify(strip(v.domain_index[d.id].not_authoritative_for)) !==
        JSON.stringify(d.authority.not_authoritative_for)).map(d => d.id));
  console.log('X: domain_index matches domains.json =', staleIdx.length === 0,
    '(' + staleIdx.length + ' stale entries)');
  if (staleIdx.length) results.push('X: domain_index is stale against domains.json, e.g. ' + staleIdx[0] +
    ' -- run `python3 generate.py` then `python3 build.py`');
}

console.log(results.length ? '\nFAILURES:\n' + results.join('\n') : '\nALL SCENARIOS PASSED');
process.exitCode = results.length ? 1 : 0;
}
main();
