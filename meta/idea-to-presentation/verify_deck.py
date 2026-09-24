#!/usr/bin/env python3
"""Check a built deck, because nothing it renders can be seen from a session.

Stdlib only. This exists for the same reason components/kg-viz/verify.js
does: the artifact is a page, sessions here cannot open one, and "it built
without error" is not the same claim as "it is correct". Everything checked
below is a failure that has a silent visual symptom rather than a crash.

Usage:
    python3 verify_deck.py <deck.html> <source.md> [--diagrams DIR]

Exit code 0 if every check passes, 1 otherwise.
"""

import argparse
import re
import sys
from pathlib import Path

SVG_NAMESPACE = "http://www.w3.org/2000/svg"


def check(results, name, ok, detail=""):
    results.append((ok, name, detail))


# Average glyph advance as a fraction of font size, for mixed-case English in
# a sans-serif face. Bold runs marginally wider.
GLYPH_ADVANCE = 0.52
BOLD_EXTRA = 0.03
CLASS_SIZES = {"d-label": 15, "d-sub": 12.5, "d-small": 11.5, "d-onfill": 15}
SVG_NS = "{http://www.w3.org/2000/svg}"


def _inherited(element, parents, attribute):
    """Resolve an inherited SVG presentation attribute up the tree."""
    node = element
    while node is not None:
        value = node.get(attribute)
        if value:
            return value
        node = parents.get(id(node))
    return None


def text_overflow(diagrams):
    """Estimate whether any <text> spills outside its diagram's viewBox.

    Returns (clear_overflows, at_edge) as lists of human-readable strings.
    """
    import xml.etree.ElementTree as ET

    clear, edge = [], []
    for path in sorted(diagrams.glob("*.svg")):
        root = ET.parse(path).getroot()
        view_box = root.get("viewBox")
        if not view_box:
            clear.append(f"{path.name}: no viewBox")
            continue
        width = float(view_box.split()[2])
        parents = {id(child): parent for parent in root.iter() for child in parent}

        for element in root.iter(SVG_NS + "text"):
            text = "".join(element.itertext()).strip()
            if not text:
                continue
            classes = _inherited(element, parents, "class") or ""
            size = 11.5
            for name in classes.split():
                size = CLASS_SIZES.get(name, size)
            style = element.get("style") or ""
            explicit = re.search(r"font-size:\s*([\d.]+)", style)
            if explicit:
                size = float(explicit.group(1))
            bold = "font-weight:6" in style or "d-label" in classes
            estimate = len(text) * size * (GLYPH_ADVANCE + (BOLD_EXTRA if bold else 0))

            x = float(element.get("x", 0))
            anchor = _inherited(element, parents, "text-anchor") or "start"
            if anchor == "middle":
                left = x - estimate / 2
            elif anchor == "end":
                left = x - estimate
            else:
                left = x
            right = left + estimate

            where = f"{path.name}: {text[:40]!r}"
            if right > width or left < 0:
                clear.append(where)
            elif right > width - 6:
                edge.append(where)
    return clear, edge


def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument("deck", type=Path)
    parser.add_argument("source", type=Path)
    parser.add_argument("--diagrams", type=Path, default=None)
    args = parser.parse_args(argv)

    for path in (args.deck, args.source):
        if not path.is_file():
            print(f"FAIL  no such file: {path}")
            return 1
    diagrams = args.diagrams or args.source.resolve().parent / "diagrams"

    html = args.deck.read_text()
    source = args.source.read_text()
    results = []

    # 1. The template was actually filled.
    leftover = re.findall(r"\{\{\w+\}\}", html)
    check(results, "no unfilled template placeholders", not leftover, str(leftover))

    # 2. One slide per directive, plus the title slide.
    directives = len(re.findall(r"<!--\s*slide\b", source))
    slides = len(re.findall(r'<section class="slide', html))
    check(
        results,
        "one slide per directive, plus a title slide",
        slides == directives + 1,
        f"{directives} directives, {slides} slides",
    )

    # 3. Diagrams are INLINED, not linked. A linked <img> would break both
    #    the single-file rule and the CSS custom properties the SVGs use.
    named = set(re.findall(r"^diagram:\s*(\S+)", source, flags=re.MULTILINE))
    inlined = len(re.findall(r"<svg viewBox", html))
    check(
        results,
        "every named diagram is inlined",
        inlined == len(named),
        f"{len(named)} named, {inlined} inlined",
    )
    check(results, "no <img> references", "<img" not in html)
    missing = sorted(n for n in named if not (diagrams / n).is_file())
    check(results, "every named diagram file exists", not missing, str(missing))

    # 4. Offline. The SVG namespace is an identifier, not a fetch, so it is
    #    the one permitted URL; anything else means the deck breaks on a
    #    machine with no network, which is the case that matters.
    urls = {u for u in re.findall(r"https?://[^\s\"')]+", html) if u != SVG_NAMESPACE}
    check(results, "no external URLs", not urls, str(sorted(urls)))
    check(results, "no src= attributes", "src=" not in html)
    check(results, "no @import", "@import" not in html)

    # 5. Inlining nine documents into one makes id collisions likely, and a
    #    collision is silent: the browser resolves url(#arrow) to whichever
    #    came first, so a diagram quietly borrows another's marker.
    ids = re.findall(r'\sid="([^"]+)"', html)
    dupes = sorted({i for i in ids if ids.count(i) > 1})
    check(results, "no duplicate ids", not dupes, str(dupes))

    refs = sorted(set(re.findall(r"url\(#([^)]+)\)", html)) - set(ids))
    check(results, "every url(#...) reference resolves", not refs, str(refs))

    # 6. An undeclared custom property renders as nothing -- an invisible
    #    shape, not an error. This is the single most likely silent fault.
    used = set(re.findall(r"var\((--[a-z0-9-]+)\)", html))
    declared = set(re.findall(r"^\s*(--[a-z0-9-]+):", html, flags=re.MULTILINE))
    undeclared = sorted(used - declared)
    check(results, "every CSS custom property is declared", not undeclared,
          str(undeclared))

    # 7. Staleness. The deck is generated, so a deck older than any of its
    #    inputs is showing something nobody wrote.
    deck_mtime = args.deck.stat().st_mtime
    newer = [
        str(p)
        for p in [args.source, *sorted(diagrams.glob("*.svg")),
                  Path(__file__).resolve().parent / "deck-shell.html"]
        if p.is_file() and p.stat().st_mtime > deck_mtime
    ]
    check(results, "deck is not stale against its sources", not newer, str(newer))

    # 8. An XML comment containing a double hyphen is invalid and takes the
    #    whole diagram down. Cheap to check, and it has already happened
    #    twice while authoring these.
    offenders = []
    for svg in sorted(diagrams.glob("*.svg")):
        for comment in re.findall(r"<!--(.*?)-->", svg.read_text(), re.DOTALL):
            if "--" in comment:
                offenders.append(svg.name)
    check(results, "no '--' inside an SVG comment", not offenders,
          str(sorted(set(offenders))))

    # 9. Estimated text overflow. The only class of *visual* fault that is
    #    mechanically detectable: a label wider than its viewBox is clipped
    #    or spills, and neither shows up as an error.
    #
    #    This is an ESTIMATE, not a measurement -- there is no font metric
    #    available here, so it assumes an average glyph advance. It
    #    therefore only fails on clear overflow past the viewBox and merely
    #    notes anything landing within a hair of the edge. Treat a note as
    #    "go look at that one", not as a defect.
    #
    #    text-anchor, class and fill are INHERITED, so an ancestor <g>'s
    #    value applies. Reading only the element's own attribute produced
    #    four false positives the first time this was written, which is why
    #    the walk up the tree exists.
    overflow, at_edge = text_overflow(diagrams)
    check(results, "no estimated text overflow in any diagram", not overflow,
          "; ".join(overflow))

    failed = 0
    for ok, name, detail in results:
        if ok:
            print(f"  ok    {name}")
        else:
            failed += 1
            print(f"  FAIL  {name}" + (f" -- {detail}" if detail else ""))

    if at_edge:
        print("\n  note  text landing within a hair of the viewBox edge,")
        print("        worth an eyeball but not a failure:")
        for item in at_edge:
            print(f"          {item}")

    print(f"\n{len(results) - failed}/{len(results)} checks passed")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
