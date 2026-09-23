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
// So this file executes index.html's own JavaScript against the real
// graph.json under a stubbed DOM, and asserts what can be asserted without
// pixels. It is not a substitute for looking at the page; it is the floor
// below which things cannot silently break. Scenarios C and C2 in particular
// are what make decision 38's offline guarantee enforced rather than merely
// intended.
//
// Requires only `node` (no npm install, nothing to fetch), consistent with
// the repo's stdlib-only convention. Exits non-zero on any failure.

const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const js = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const data = JSON.parse(fs.readFileSync('graph.json', 'utf8'));

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
  const G = new Proxy({}, { get: (_t, prop) => {
    if (prop === 'camera') return () => ({ fov: 75 });
    if (prop === 'cameraPosition') return (pos, look, ms) => { calls.__cam = { pos, look, ms }; return G; };
    if (prop === 'graph2ScreenCoords') {
      return (x, y, z) => (opts.badProjection ? { x: NaN, y: NaN } : { x: x / 2 + 500, y: y / 2 + 400 });
    }
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
  vm.runInContext(js + '\n;globalThis.__probe = { view: () => view, visible: () => (typeof view === "undefined" || !view) ? null : visibleData(), labelEls: () => labelEls, edgeEls: () => edgeEls, setEdgeLabels: v => { showEdgeLabels = v; rebuildLabels(); }, hidden: () => hiddenSet(), switchView: id => switchView(id), edgeLabelsOn: () => showEdgeLabels, setEdgeStyle: v => { edgeLabelStyle = v; rebuildLabels(); }, bands: () => bandEls, setBands: v => { showBands = v; rebuildBands(); }, positionBands: () => positionBands(), positionLabels: () => positionLabels(), rebuild: () => rebuildLabels(), };', ctx);

  return { els, calls, loaded, loadedAll: () => attempted, errs, probe: sandbox.__probe, listeners, fgCount: () => sandbox.__fgCount || 0, cam: () => calls.__cam };
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
  inp.files = [{ name: 'graph.json', _text: JSON.stringify(data) }];
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
  bi.files = [{ name: 'graph.json', _text: JSON.stringify(data) }];
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
  const src = fs.readFileSync('index.html', 'utf8');
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
  console.log('D: wrong-shape file rejected =', /not a kg-viz graph file/.test(notes),
    '| rendered it anyway =', renderedWrong);
  if (!/not a kg-viz graph file/.test(notes)) results.push('D: wrong-shape JSON not reported clearly');
  if (renderedWrong) results.push('D: rendered a file with no views array');

  // malformed JSON
  input.files = [{ name: 'broken.json', _text: '{oops' }];
  input.onchange(); await tick();
  notes = el(r,'notes-body').children.map(c => c._html).join(' ');
  if (!/not valid JSON/.test(notes)) results.push('D: malformed JSON not reported');

  // now the real thing
  input.files = [{ name: 'graph.json', _text: JSON.stringify(data) }];
  input.onchange(); await tick();
  const gd = r.calls['__last_graphData'];
  console.log('D: after loading graph.json -> nodes =', gd && gd.nodes.length,
    '| picker dismissed =', !el(r,'picker').classList._on);
  if (!gd || gd.nodes.length !== 26) results.push('D: picking graph.json did not render 26 nodes');
  if (el(r,'picker').classList._on) results.push('D: picker still open after a successful load');
  const stats = el(r,'stats')._html;
  if (!/graph\.json/.test(stats)) results.push('D: stats box does not name the file the data came from');
}

// E: opening a second file must reuse the renderer and reset per-graph state
{
  const r = run('E', { cdnBlocked: false }); await tick();
  const inp = el(r,'file-input');
  inp.files = [{ name: 'graph.json', _text: JSON.stringify(data) }];
  inp.onchange(); await tick();
  const afterFirst = r.fgCount();

  // hide a stage, then open a different file
  r.probe.hidden()['design-a-product'] = true;
  const shrunk = r.probe.visible().nodes.length;
  inp.files = [{ name: 'other-graph.json', _text: JSON.stringify(data) }];
  inp.onchange(); await tick();
  const afterSecond = r.fgCount();
  const nodesNow = r.probe.visible().nodes.length;
  const stats = el(r,'stats')._html;
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
  inp.files = [{ name: 'graph.json', _text: JSON.stringify(data) }];
  inp.onchange(); await tick();

  const flow = data.views.find(v => v.layout === 'layered');
  const authority = data.views.find(v => v.layout === 'force');

  // fill: padding must be small, and a fit must have happened
  const framed = !!r.cam() || !!r.calls['zoomToFit'];
  console.log('F: camera framed =', framed, '| via computed fit =', !!r.cam());
  if (!framed) results.push('F: the view was never framed');

  // edge labels are on by default -- assert that, do not enable them first
  if (!r.probe.edgeLabelsOn()) results.push('F: edge labels are not on by default');
  const eEls = r.probe.edgeEls();
  const nEdge = Object.keys(eEls).length;
  const sample = el(r,'labels').children.filter(c => c.className === 'elabel')[0];
  console.log('F: edge label elements =', nEdge, 'of', flow.links.length,
    '| sample text =', JSON.stringify(sample && sample.textContent));
  if (nEdge !== flow.links.length) results.push('F: expected ' + flow.links.length + ' edge labels, got ' + nEdge);
  if (!sample || !sample.textContent) results.push('F: edge label has no text');
  if (sample && /_/.test(sample.textContent)) results.push('F: edge label still shows raw SCREAMING_SNAKE: ' + sample.textContent);

  // particles: on for the flow view, off for the dense authority view
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

  // switching view must NOT silently override the user's edge-label choice,
  // but must still drop particles on the 296-edge graph
  r.probe.switchView(authority.id); await tick();
  const authParts = r.calls['__last_linkDirectionalParticles'](authority.links[0]);
  console.log('F: after switch to authority -> edge labels still on =', r.probe.edgeLabelsOn(),
    '| particles =', authParts);
  if (!r.probe.edgeLabelsOn()) results.push('F: view switch silently turned the edge-label toggle off');
  if (authParts) results.push('F: particles left on for the 296-edge view');
}

// G: the computed camera fit actually fills the available region
{
  const r = run('G', { cdnBlocked: false }); await tick();
  const inp = el(r,'file-input');
  inp.files = [{ name: 'graph.json', _text: JSON.stringify(data) }];
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
    const availW = W - LEFT, availH = H;
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
  inp.files = [{ name: 'graph.json', _text: JSON.stringify(data) }];
  inp.onchange(); await tick();
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
  inp.files = [{ name: 'graph.json', _text: JSON.stringify(data) }];
  inp.onchange(); await tick();

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
  console.log('I: flat style has rotate =', flatHasRotate,
    '| along style: rotated', rotated, 'of', along.length,
    '| missing angle', missing, '| outside +/-90deg', upsideDown.length,
    '| classed .along =', along.every(c => /along/.test(c.className)));
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
  inp.files = [{ name: 'graph.json', _text: JSON.stringify(data) }];
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

  // hiding a stage must empty its band, not leave one around nothing
  r.probe.hidden()['design-a-product'] = true;
  r.probe.positionBands();
  const empties = r.probe.bands().filter(b => !(b.poly.getAttribute('points') || '').trim()).length;
  console.log('J: after hiding stage 1 -> bands with no geometry =', empties);
  if (empties !== 1) results.push('J: hiding a stage left ' + empties + ' empty bands, expected 1');
  delete r.probe.hidden()['design-a-product'];

  // the force view has no stages, so it must draw no bands at all
  const authority = data.views.find(v => v.layout === 'force');
  r.probe.switchView(authority.id); await tick();
  console.log('J: bands on the force view =', r.probe.bands().length);
  if (r.probe.bands().length) results.push('J: bands drawn on a view with no stages');
}

console.log(results.length ? '\nFAILURES:\n' + results.join('\n') : '\nALL SCENARIOS PASSED');
process.exitCode = results.length ? 1 : 0;
}
main();
