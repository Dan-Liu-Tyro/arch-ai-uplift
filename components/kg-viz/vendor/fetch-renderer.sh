#!/usr/bin/env bash
# Fetch the one vendored dependency: 3d-force-graph.min.js
#
# Run this once, while you have a connection. After the result is committed,
# nobody needs to run it again -- the whole point of decision 38 is that a
# clone works with no network. Re-run it only to update the renderer version.
#
#   ./fetch-renderer.sh            fetch if missing
#   ./fetch-renderer.sh --force    re-fetch even if a good copy exists
#
# It tries several sources because corporate and home networks block
# different ones, validates what came back rather than trusting a 200, and
# records the version in README.md's provenance table -- a minified bundle
# carries no provenance in a diff, so if it is not written down it is lost.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="$SCRIPT_DIR/3d-force-graph.min.js"
README="$SCRIPT_DIR/README.md"
MIN_BYTES=100000          # the real bundle is ~1MB; anything tiny is an error page
FORCE=0

[[ "${1:-}" == "--force" ]] && FORCE=1

SOURCES=(
  "https://unpkg.com/3d-force-graph"
  "https://cdn.jsdelivr.net/npm/3d-force-graph/dist/3d-force-graph.min.js"
  "https://cdnjs.cloudflare.com/ajax/libs/3d-force-graph/1.80.0/3d-force-graph.min.js"
)

say() { printf '%s\n' "$*"; }
fail() { printf 'Error: %s\n' "$*" >&2; exit 1; }

# A 200 response is not proof of the right content: a captive portal or a
# proxy error page arrives as a cheerful 200 full of HTML.
validate() {
  local f="$1" size
  [[ -s "$f" ]] || { say "  rejected: empty file"; return 1; }
  size=$(wc -c <"$f" | tr -d ' ')
  if [[ "$size" -lt "$MIN_BYTES" ]]; then
    say "  rejected: only $size bytes, expected >= $MIN_BYTES (probably an error page)"
    return 1
  fi
  if head -c 200 "$f" | grep -qiE '<!doctype|<html'; then
    say "  rejected: looks like an HTML page, not JavaScript"
    return 1
  fi
  if ! grep -q "ForceGraph3D" "$f"; then
    say "  rejected: no ForceGraph3D symbol found; wrong package?"
    return 1
  fi
  say "  looks good: $size bytes, ForceGraph3D present"
  return 0
}

if [[ -f "$TARGET" && "$FORCE" -eq 0 ]]; then
  say "Already present: $TARGET"
  if validate "$TARGET"; then
    say "Nothing to do. Use --force to re-fetch."
    exit 0
  fi
  say "Existing copy failed validation; re-fetching."
fi

TMP="$(mktemp "${TMPDIR:-/tmp}/3dfg.XXXXXX")"
trap 'rm -f "$TMP"' EXIT

GOT_FROM=""
for url in "${SOURCES[@]}"; do
  say "Trying $url"
  if curl -fsSL --max-time 60 -o "$TMP" "$url" 2>/dev/null && validate "$TMP"; then
    GOT_FROM="$url"
    break
  fi
  say "  no luck, next source"
done

# Last resort: the npm registry, which on a corporate network is often
# reachable through an internal mirror when public CDNs are not.
if [[ -z "$GOT_FROM" ]] && command -v npm >/dev/null 2>&1; then
  say "Trying npm pack 3d-force-graph (internal registry mirror, if configured)"
  PACKDIR="$(mktemp -d "${TMPDIR:-/tmp}/3dfgpack.XXXXXX")"
  if (cd "$PACKDIR" && npm pack 3d-force-graph >/dev/null 2>&1); then
    TARBALL="$(find "$PACKDIR" -name '*.tgz' -maxdepth 1 | head -1)"
    if [[ -n "$TARBALL" ]] && tar -xzf "$TARBALL" -C "$PACKDIR" 2>/dev/null; then
      CAND="$PACKDIR/package/dist/3d-force-graph.min.js"
      if [[ -f "$CAND" ]]; then
        cp "$CAND" "$TMP"
        if validate "$TMP"; then GOT_FROM="npm pack 3d-force-graph"; fi
      fi
    fi
  fi
  rm -rf "$PACKDIR"
  [[ -n "$GOT_FROM" ]] || say "  no luck via npm either"
fi

if [[ -z "$GOT_FROM" ]]; then
  cat >&2 <<'MSG'

Every source failed. Nothing was written, so the previous state is intact.

The most likely causes, in order:
  1. No connection at all. This script needs one; the viewer does not.
  2. Your network blocks public CDNs and npm has no internal mirror set up.

Either way, the file can be placed by hand. On any machine that can reach it,
download https://unpkg.com/3d-force-graph and copy the result to:
  components/kg-viz/vendor/3d-force-graph.min.js
It is a plain static file; how it arrives does not matter.
MSG
  exit 1
fi

mv "$TMP" "$TARGET"
trap - EXIT
say ""
say "Wrote $TARGET"
say "Source: $GOT_FROM"

# Best effort only -- the minified bundle itself does not reliably state a
# version, so ask the registry. Never fatal: an unknown version is worth less
# than a working renderer, not more.
VERSION="unknown"
if [[ "$GOT_FROM" == https://* ]]; then
  VERSION="$(curl -fsSL --max-time 20 "https://unpkg.com/3d-force-graph/package.json" 2>/dev/null \
    | tr ',' '\n' | grep -m1 '"version"' | sed -E 's/.*"version" *: *"([^"]+)".*/\1/' || true)"
  [[ -n "$VERSION" ]] || VERSION="unknown"
fi
say "Version: $VERSION"

python3 - "$README" "$VERSION" "$GOT_FROM" <<'PY'
import datetime, pathlib, sys
readme, version, source = pathlib.Path(sys.argv[1]), sys.argv[2], sys.argv[3]
row = f"| {datetime.date.today().isoformat()} | {version} | {source} |"
text = readme.read_text()
placeholder = "| _(not yet populated)_ | | |"
if placeholder in text:
    text = text.replace(placeholder, row)
else:
    lines = text.split("\n")
    last = max(i for i, l in enumerate(lines) if l.startswith("| 20"))
    lines.insert(last + 1, row)
    text = "\n".join(lines)
readme.write_text(text)
print(f"Recorded provenance in {readme.name}: {row}")
PY

if command -v node >/dev/null 2>&1; then
  say ""
  say "Running the component's checks..."
  (cd "$SCRIPT_DIR/.." && node verify.js | tail -3)
fi

cat <<'MSG'

Done. Two things left:
  1. Open components/kg-viz/index.html and choose graph.json.
  2. Commit the new file -- that is what makes every clone work offline:
       git add components/kg-viz/vendor/
       git commit -m "vendor: add 3d-force-graph renderer for offline use"
MSG
