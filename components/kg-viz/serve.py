#!/usr/bin/env python3
"""Local-only static server for kg-viz. Stdlib only, no deps, no deployment.

Regenerates graph.json from the current kg-content on every startup, then
serves index.html and graph.json as plain static files. Mirrors
components/local-agent/ui/server.py's shape (module docstring, HOST/PORT
constants, stdlib http.server) rather than inventing a second pattern for
local UIs in this repo.
"""

import http.server
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import generate  # noqa: E402

UI_DIR = Path(__file__).resolve().parent
HOST = "127.0.0.1"
PORT = 8766  # local-agent's UI server uses 8765; kept distinct so both can run at once


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(UI_DIR), **kwargs)

    def log_message(self, fmt, *args):
        pass


def main():
    result = generate.generate()
    print(
        f"kg-viz: regenerated graph.json "
        f"({len(result['nodes'])} nodes, {len(result['links'])} edges, "
        f"{len(result['stats']['unresolved_references'])} unresolved references)"
    )
    server = http.server.HTTPServer((HOST, PORT), Handler)
    print(f"kg-viz UI: http://{HOST}:{PORT}  (Ctrl+C to stop)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.shutdown()


if __name__ == "__main__":
    sys.exit(main())
