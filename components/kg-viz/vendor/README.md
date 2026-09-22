# vendor/ — optional local copy of the one browser library

`index.html` loads its single dependency from here **first**, and falls back
to `unpkg.com` only if this file is absent:

| Expected filename | Upstream |
| --- | --- |
| `3d-force-graph.min.js` | `https://unpkg.com/3d-force-graph` |

## Why this exists

The CDN is the component's only external dependency and its only real single
point of failure — on a network that blocks `unpkg.com`, nothing renders. The
page says so on screen instead of showing a blank canvas, and this directory
is the fix it points at.

```bash
cd components/kg-viz/vendor
curl -Lo 3d-force-graph.min.js https://unpkg.com/3d-force-graph
```

Then reload `index.html`. The page prefers this copy automatically; there
is nothing to configure. The path is relative to the page, so it resolves
under `file://` exactly as it did over http.

## There used to be a second library, and why there isn't now

Node labels were `SpriteText` objects from `three-spritetext`. In a real
browser that library failed with an opaque cross-origin `"Script error."`
while `3d-force-graph` loaded normally — it expects a global `THREE`, and
`3d-force-graph` bundles its own copy without exposing it. Because the label
accessor ran inside the render loop, *every* node threw, so the canvas stayed
empty next to a fully working control panel.

Vendoring it would not have helped: the script was reaching the browser and
failing during execution, not failing to download. Labels are now plain HTML
positioned with `graph2ScreenCoords()`, which removes the dependency
altogether and is better anyway — text stays crisp at any zoom instead of
being a scaled texture, it is styleable in CSS, and it cannot take the scene
down. **Do not reintroduce a THREE-dependent text library here.**

## Why the `.js` file is gitignored

It is a third-party minified build. Tyro's code-search standard is not to
pull copyrighted public source into our repositories, and a vendored bundle
also has no review value in a diff — a reviewer cannot judge a change to
minified output. Keeping it local preserves the offline escape hatch without
committing someone else's distribution. Only this README is tracked, so the
mechanism stays discoverable when the directory is empty.
