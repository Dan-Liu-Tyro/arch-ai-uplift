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
    """Static file handler that refuses to let the browser cache anything.

    This is a local inspection tool whose two served files change constantly:
    `index.html` every time the UI is edited, `graph.json` on every start.
    Browser caching bought nothing and cost a full debugging round trip --
    a fix was reported as "same thing", with the user quoting a diagnostic
    message that had already been deleted from disk, because the page in the
    browser was the previous version. Expecting a human to remember a
    cache-bypassing reload is not a design; sending the headers is.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(UI_DIR), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def do_GET(self):
        # SimpleHTTPRequestHandler answers 304 Not Modified from
        # If-Modified-Since on its own, which would hand back a cached page
        # regardless of the headers above. Drop the conditional headers so
        # every request is served in full.
        for conditional in ("If-Modified-Since", "If-None-Match"):
            if conditional in self.headers:
                del self.headers[conditional]
        super().do_GET()

    def log_message(self, fmt, *args):
        pass


def summarize(result) -> str:
    """Kept separate from main() so the regenerate-and-report path is testable
    without binding a socket. It was not, and that cost a broken start: when
    graph.json grew from {nodes, links, stats} to {categories, views[]}, this
    summary still indexed result['nodes'] and raised KeyError before bind, so
    the server died on startup with a traceback that looked like a port
    problem.
    """
    parts = []
    for view in result["views"]:
        stats = view["stats"]
        detail = ""
        if "unresolved_references" in stats:
            detail = f", {len(stats['unresolved_references'])} unresolved refs"
        elif "columns" in stats:
            detail = f", {stats['columns']} flow columns"
        parts.append(
            f"{view['id']} ({len(view['nodes'])} nodes, "
            f"{len(view['links'])} edges{detail})"
        )
    return "kg-viz: regenerated graph.json — " + "; ".join(parts)


def main():
    print(summarize(generate.generate()))
    server = http.server.HTTPServer((HOST, PORT), Handler)
    print(f"kg-viz UI: http://{HOST}:{PORT}  (Ctrl+C to stop)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.shutdown()


if __name__ == "__main__":
    sys.exit(main())
