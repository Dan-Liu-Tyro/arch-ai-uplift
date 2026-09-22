# vendor/ — optional local copies of the two browser libraries

`index.html` loads its two dependencies from here **first**, and falls back to
`unpkg.com` only if these files are absent:

| Expected filename | Upstream |
| --- | --- |
| `3d-force-graph.min.js` | `https://unpkg.com/3d-force-graph` |
| `three-spritetext.min.js` | `https://unpkg.com/three-spritetext` |

## Why this exists

The CDN is the component's only external dependency and its only real single
point of failure — on a network that blocks `unpkg.com`, nothing renders. The
page now says so on screen instead of showing a blank canvas, and this
directory is the fix it points at.

Load order matters and is enforced by the loader in `index.html`:
`3d-force-graph` bundles its own copy of THREE, and `three-spritetext` has to
attach to *that* instance. If `three-spritetext` ends up bound to a different
THREE — or fails to initialise because it expected a global one — then
`SpriteText` is either missing or produces objects the graph's scene rejects.
That is the most likely cause of a graph that does not draw while the control
panel works perfectly, so `index.html` treats labels as optional and degrades
to unlabelled spheres rather than throwing once per node inside the render
loop.

## Populating it

```bash
cd components/kg-viz/vendor
curl -Lo 3d-force-graph.min.js   https://unpkg.com/3d-force-graph
curl -Lo three-spritetext.min.js https://unpkg.com/three-spritetext
```

Then `../graph.sh restart` and reload. The page prefers these automatically;
there is nothing to configure.

## Why the `.js` files are gitignored

They are third-party minified builds. Tyro's code-search standard is not to
pull copyrighted public source into our repositories, and a vendored blob also
has no review value in a diff — a reviewer cannot judge a change to a
minified bundle. Keeping them local preserves the offline escape hatch without
committing someone else's distribution. Only this README is tracked, so the
mechanism stays discoverable when the directory is empty.
