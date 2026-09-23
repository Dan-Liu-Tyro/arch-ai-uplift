#!/usr/bin/env python3
"""Compile src/ (and payments.json) into knowledge-visualizer.html.

Stdlib only, no deps -- same convention as generate.py. This is the only
build step in the repo (CLAUDE.md's "no build system" line is about the repo
at large; this script exists because the *source* for kg-viz's single page is
now split by concern under src/, while the *shipped* artifact must stay one
self-contained file that opens from file:// with no server, per decision 36).

knowledge-visualizer.html is GENERATED and must never be hand-edited -- the
same rule payments.json already follows for the same reason:
edits to a generated file are silently overwritten and never reviewed as
source. Edit src/shell.html (markup + CSS) or src/*.js (behaviour) instead,
then run this script.

MODULE_ORDER is the only thing that encodes structure here: everything is
concatenated into one <script> tag, so function declarations are hoisted
regardless of file order. Order is chosen for readability (state first,
bootstrap last, since it is the one file with a top-level side-effecting call
that must run after every function above it is defined) rather than because
runtime correctness depends on it.

Since decision 40, this script also embeds payments.json's current content as
a DEFAULT_GRAPH global, so the page's "Load default" button can work with no
fetch() (blocked on file://) and no file picker. This is the one place
build.py's output depends on something other than src/ -- run generate.py
before this script if kg-content changed, or the embedded copy is stale
against disk (README's "Freshness is shown" covers what catches that).

Run: `python3 build.py`
"""

import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
SRC = HERE / "src"
DATA_FILE = HERE / "payments.json"
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

# verify.js strips exactly this span (markers inclusive) to check
# knowledge-visualizer.html's *structure* against src/ without needing to
# reproduce this script's JSON formatting in node -- keep both scripts' copy
# of these two lines identical if either changes.
DEFAULT_GRAPH_BEGIN = "// BEGIN GENERATED DEFAULT GRAPH -- do not hand-edit, see build.py"
DEFAULT_GRAPH_END = "// END GENERATED DEFAULT GRAPH"


def _default_graph_block() -> str:
    data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    # ensure_ascii escapes every non-ASCII character as \uXXXX, which also
    # neutralises the U+2028/U+2029 line separators that are valid inside a
    # JSON string but -- unescaped -- terminate a line in JS source outside
    # a template literal, silently truncating this statement.
    packed = json.dumps(data, ensure_ascii=True)
    # A literal `</script` substring inside any string value would truncate
    # the surrounding <script> tag: the HTML tokenizer scans raw text for
    # that sequence with no awareness of JS string context. `<\/` is a valid
    # escape in both JSON and JS strings and decodes back to `</` at parse
    # time, so this is invisible at runtime.
    packed = packed.replace("</", "<\\/")
    return (
        f"  {DEFAULT_GRAPH_BEGIN}\n"
        "  // Embedded from payments.json at build time, so the 'Load default'\n"
        "  // button (decision 40) needs no fetch() or file picker -- both are\n"
        "  // unavailable/undesired respectively on file://. Can go stale\n"
        "  // relative to disk if payments.json changes without a rebuild;\n"
        "  // PAGE_REVISION and the loaded data's generated_at catch that.\n"
        f"  var DEFAULT_GRAPH = {packed};\n"
        f"  {DEFAULT_GRAPH_END}"
    )


def build() -> None:
    shell = (SRC / "shell.html").read_text(encoding="utf-8")
    if not shell.endswith("<script>\n"):
        raise SystemExit("src/shell.html must end with the <script> opening tag")

    modules = [(SRC / name).read_text(encoding="utf-8").rstrip("\n") for name in MODULE_ORDER]
    modules.insert(1, _default_graph_block())  # after state.js, before graph-model.js
    body = "\n\n".join(modules)

    OUTPUT.write_text(shell + body + "\n</script>\n</body>\n</html>\n", encoding="utf-8")


if __name__ == "__main__":
    build()
    print(f"-> {OUTPUT}")
