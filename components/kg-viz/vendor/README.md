# vendor/ — the renderer, committed on purpose

`index.html` loads exactly one script, from here, with **no remote
fallback**:

| Expected filename | Upstream |
| --- | --- |
| `3d-force-graph.min.js` | `https://unpkg.com/3d-force-graph` |

## Why this is committed rather than gitignored

This viewer displays internal architecture content, and the requirement
(decision 38) is that it loads nothing online and sends nothing out. A CDN
`<script src>` discloses the requesting IP and the fact that this library was
loaded — a disclosure with no upside once a local copy exists. It also made
the viewer unusable with the connection down, which is how the requirement
surfaced: `ERR_NAME_NOT_RESOLVED` on a home network that was simply offline.

So the `.js` file is tracked. That is a deliberate reversal of the earlier
decision to ignore it: an ignored file makes a fresh clone depend on the
network, which is exactly what we are removing. The cost is a minified
third-party bundle in git that no reviewer can meaningfully diff — accepted,
because the alternative fails the requirement.

**What was never happening, so the risk is not overstated:** the page has no
`fetch`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`, `<form>`, `<img>` or
`postMessage` path at all, and `graph.json` is read from disk. No graph
content has ever left the machine. The library download was the only outbound
request. Both the loader and the absence of egress paths are asserted by the
test harness (scenarios C and C2), so a regression fails a test rather than
going unnoticed.

## Populating it (one time, needs a connection once)

```bash
cd components/kg-viz/vendor
./fetch-renderer.sh            # or --force to re-fetch / update
```

The script tries unpkg, jsdelivr and cdnjs in turn, then `npm pack
3d-force-graph` — which often works through an internal registry mirror on a
network that blocks public CDNs. **It validates what came back instead of
trusting a 200 response**: a captive portal or proxy error page arrives as a
cheerful 200 full of HTML, so the result is checked for plausible size, for
not being HTML, and for actually containing the `ForceGraph3D` symbol. On
success it records the version in the table below and runs `../verify.js`; on
total failure it writes nothing and leaves the previous state intact.

If every source is blocked, the file can simply be placed by hand — download
`https://unpkg.com/3d-force-graph` on any machine that can reach it and copy
the result to `3d-force-graph.min.js` here. It is a plain static file; how it
arrives does not matter.

Either way, **commit the result** — after that every clone works offline with
no further setup.

Record the version below when you update it, since a minified bundle carries
no useful provenance in a diff:

| Date | Version | Obtained via |
| --- | --- | --- |
| 2026-09-23 | 1.80.0 | https://unpkg.com/3d-force-graph |

## Licence — OPEN, needs confirming before this leaves the branch

The committed bundle contains **no licence text**: its only header is
`// Version 1.80.0 3d-force-graph - https://github.com/vasturiano/3d-force-graph`.
Upstream is believed to be MIT, which is usual for that author's packages,
but **that has not been verified** — it could not be checked from the
environment this was committed in, which has no network access.

This matters because Tyro's code standards call out not taking copyrighted
public source into our repositories, and this commit does exactly that
deliberately, to satisfy the offline requirement. The trade is defensible for
a permissively licensed library and indefensible otherwise, so the licence is
a real open item rather than a formality.

To settle it, from a machine with a connection:

```bash
curl -sL https://raw.githubusercontent.com/vasturiano/3d-force-graph/master/LICENSE | head -3
```

Then record the result here and, if MIT or similar, commit the licence text
alongside the bundle as that licence generally requires the notice to travel
with the copy. If the licence turns out to be unsuitable, the escape route is
already planned: `docs/backlog.md`'s hand-written SVG renderer removes this
dependency entirely.

## This dependency is scheduled for removal

`docs/backlog.md` carries the follow-up: replace `3d-force-graph` with a
hand-written SVG renderer for the flow view. That removes the last third-party
code, removes WebGL, produces crisper text and real arrowheads, and — the
decisive reason — makes the rendering *inspectable as text*, which is the one
thing that would let the output be verified without a human looking at a
screen. The library is kept for now because it also provides the
force-directed layout the 296-edge authority view uses.

## There used to be a second library

Node labels were `SpriteText` objects from `three-spritetext`. In a real
browser it failed with an opaque cross-origin `"Script error."` while
`3d-force-graph` loaded normally — it expects a global `THREE`, and
`3d-force-graph` bundles its own copy without exposing it. Because the label
accessor ran inside the render loop, *every* node threw, so the canvas stayed
empty next to a fully working control panel. Labels are now plain HTML
positioned with `graph2ScreenCoords()`. **Do not reintroduce a
THREE-dependent text library.**
