#!/usr/bin/env python3
"""Compile src/ into knowledge-visualizer.html.

Stdlib only, no deps -- same convention as generate.py. This is the only
build step in the repo (CLAUDE.md's "no build system" line is about the repo
at large; this script exists because the *source* for kg-viz's single page is
now split by concern under src/, while the *shipped* artifact must stay one
self-contained file that opens from file:// with no server, per decision 36).

knowledge-visualizer.html is GENERATED and must never be hand-edited -- the
same rule payments-target-state.json already follows for the same reason:
edits to a generated file are silently overwritten and never reviewed as
source. Edit src/shell.html (markup + CSS) or src/*.js (behaviour) instead,
then run this script.

MODULE_ORDER is the only thing that encodes structure here: everything is
concatenated into one <script> tag, so function declarations are hoisted
regardless of file order. Order is chosen for readability (state first,
bootstrap last, since it is the one file with a top-level side-effecting call
that must run after every function above it is defined) rather than because
runtime correctness depends on it.

Run: `python3 build.py`
"""

from pathlib import Path

HERE = Path(__file__).resolve().parent
SRC = HERE / "src"
OUTPUT = HERE / "knowledge-visualizer.html"

MODULE_ORDER = [
    "state.js",
    "graph-model.js",
    "controls-panel.js",
    "labels.js",
    "bands.js",
    "camera.js",
    "data-loading.js",
    "renderer.js",
    "bootstrap.js",
]


def build() -> None:
    shell = (SRC / "shell.html").read_text(encoding="utf-8")
    if not shell.endswith("<script>\n"):
        raise SystemExit("src/shell.html must end with the <script> opening tag")

    modules = [(SRC / name).read_text(encoding="utf-8").rstrip("\n") for name in MODULE_ORDER]
    body = "\n\n".join(modules)

    OUTPUT.write_text(shell + body + "\n</script>\n</body>\n</html>\n", encoding="utf-8")


if __name__ == "__main__":
    build()
    print(f"-> {OUTPUT}")
