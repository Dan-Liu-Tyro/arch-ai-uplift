#!/usr/bin/env python3
"""Project a markdown document into a self-contained HTML slide deck.

Decision 47 in docs/decision-log.md. Stdlib only, no deps -- the same
convention as every other executable in this repo. The output is ONE file
that opens from file:// with no server and no CDN, so it works offline and
on a machine that has never seen this repo.

WHAT THIS IS NOT
----------------
It is not a markdown-to-slides converter. Dumping prose onto slides produces
an unreadable deck, and re-authoring slide text in a second file would
recreate the two-sources-of-truth problem the whole mechanism exists to
avoid. Instead the source document carries an explicit *slide directive* per
section -- an HTML comment, so it stays invisible when the same document is
read as a document or published to Confluence -- naming the diagram and the
few points to surface. The section's prose becomes presenter notes.

That makes the projection explicit and reviewable rather than guessed. The
rejected alternative was deriving bullets from the document's `**bold**`
spans: documents bold inline terms, not standalone claims, so it reads as
noise.

DIRECTIVE FORMAT
----------------
Anywhere inside a `## ` section:

    <!-- slide
    diagram: 05-economics.svg
    layout: full
    point: Accuracy improves gradually across all four tiers
    point: Token efficiency is a step change, not a slope
    -->

  diagram  optional; a filename inside the diagrams directory. Inlined, not
           linked -- required both for the single-file rule and so the deck's
           CSS custom properties cascade into the SVG (see PALETTE below).
  layout   `split` (default; diagram beside the points) or `full` (diagram
           spans the slide, points beneath it). Wide diagrams need `full`.
  point    repeatable; one bullet. Keep these short -- they are captions for
           the diagram, not the argument itself.
  title    optional; overrides the section heading as the slide title.

A section with no directive is skipped, so a document can be projected
partially while it is still being written.

PALETTE
-------
Colours live once, in deck-shell.html, as CSS custom properties validated
with the dataviz skill's checker (three categorical hues for the layer
diagrams; a four-step single-hue ordinal ramp for the knowledge tiers). The
SVG sources reference them as `var(--tier-3)` and so on rather than carrying
hex, which is why inlining matters: a linked <img> would not inherit them,
and every diagram would need its own copy of the palette to drift out of.

WHY IT TAKES PATHS RATHER THAN KNOWING THEM
-------------------------------------------
CLAUDE.md's hardest layering rule is that nothing under meta/ may depend on
anything under practice/. This script lives in meta/ and the AI-DLC content
lives in practice/, so it must not name that content. It takes the source
path as an argument and knows nothing about any particular deck -- which is
also exactly what this component's README already claims it is for.

Run: `python3 build_deck.py <source.md> [--diagrams DIR] [--out FILE]`
Defaults: --diagrams <source's dir>/diagrams, --out <source's dir>/deck.html
"""

import argparse
import html
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SHELL = HERE / "deck-shell.html"


# --------------------------------------------------------------------------
# Parsing the source document
# --------------------------------------------------------------------------

DIRECTIVE_RE = re.compile(r"<!--\s*slide\b(.*?)-->", re.DOTALL)


def parse_directive(block):
    """Read a slide directive body into a dict. `point` accumulates."""
    spec = {"points": []}
    for raw in block.splitlines():
        line = raw.strip()
        if not line or ":" not in line:
            continue
        key, _, value = line.partition(":")
        key, value = key.strip().lower(), value.strip()
        if key == "point":
            if value:
                spec["points"].append(value)
        elif key in ("diagram", "layout", "title"):
            spec[key] = value
    return spec


def split_sections(text):
    """Yield (heading, body) for each `## ` section, in document order.

    Everything before the first `## ` is the preamble and is returned first
    with a heading of None, because the H1 and the status block live there.
    """
    parts = re.split(r"^## ", text, flags=re.MULTILINE)
    yield None, parts[0]
    for part in parts[1:]:
        heading, _, body = part.partition("\n")
        yield heading.strip(), body


def document_title(preamble):
    match = re.search(r"^#\s+(.+)$", preamble, flags=re.MULTILINE)
    return match.group(1).strip() if match else "Untitled"


# --------------------------------------------------------------------------
# Presenter notes: a deliberately small markdown subset
# --------------------------------------------------------------------------

def strip_directives(body):
    return DIRECTIVE_RE.sub("", body)


def notes_html(body):
    """Render a section body as presenter notes.

    Only the constructs the source actually uses are handled: `###`
    sub-headings, bullet lists, bold, italic, inline code, and links reduced
    to their text. Notes are read by one person standing up, so fidelity
    matters less than not crashing on an unexpected construct.
    """
    body = strip_directives(body)
    body = re.sub(r"^\s*---\s*$", "", body, flags=re.MULTILINE)

    out, in_list = [], False

    def inline(s):
        s = html.escape(s)
        s = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", s)
        s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
        s = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", s)
        s = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<em>\1</em>", s)
        return s

    paragraph = []

    def flush_paragraph():
        if paragraph:
            out.append(f"<p>{inline(' '.join(paragraph))}</p>")
            paragraph.clear()

    def close_list():
        nonlocal in_list
        if in_list:
            out.append("</ul>")
            in_list = False

    for raw in body.splitlines():
        line = raw.rstrip()
        stripped = line.strip()
        if not stripped:
            flush_paragraph()
            close_list()
            continue
        if stripped.startswith("### "):
            flush_paragraph()
            close_list()
            out.append(f"<h4>{inline(stripped[4:])}</h4>")
            continue
        bullet = re.match(r"^[-*]\s+(.*)$|^\d+\.\s+(.*)$", stripped)
        if bullet:
            flush_paragraph()
            if not in_list:
                out.append("<ul>")
                in_list = True
            out.append(f"<li>{inline(bullet.group(1) or bullet.group(2))}</li>")
            continue
        if stripped.startswith("|"):
            # Tables are reference material, not speaking material -- the
            # slide carries the shape and the document carries the detail.
            continue
        paragraph.append(stripped)

    flush_paragraph()
    close_list()
    return "\n".join(out)


# --------------------------------------------------------------------------
# Emitting slides
# --------------------------------------------------------------------------

def inline_svg(diagrams_dir, name, problems):
    path = diagrams_dir / name
    if not path.is_file():
        problems.append(f"missing diagram: {path}")
        return '<p class="diagram-missing">diagram not found</p>'
    svg = path.read_text()
    # Drop an XML prolog if one is present; an inlined fragment must not have
    # one, and hand-authored files sometimes do.
    svg = re.sub(r"^\s*<\?xml[^>]*\?>\s*", "", svg)
    return svg


BOLD_RE = re.compile(r"\*\*([^*]+)\*\*")


def render_points(points):
    """Bullets, with `**emphasis**` honoured -- a point often has one phrase
    carrying the weight, and losing it flattens the slide."""
    if not points:
        return ""
    rendered = [BOLD_RE.sub(r"<strong>\1</strong>", html.escape(p)) for p in points]
    items = "\n".join(f"<li>{p}</li>" for p in rendered)
    return f'<ul class="points">\n{items}\n</ul>'


def build_slides(text, diagrams_dir, problems):
    slides = []
    for index, (heading, body) in enumerate(split_sections(text)):
        if heading is None:
            continue
        match = DIRECTIVE_RE.search(body)
        if not match:
            continue
        spec = parse_directive(match.group(1))
        layout = spec.get("layout", "split")
        if layout not in ("split", "full"):
            problems.append(f"unknown layout {layout!r} in section {heading!r}")
            layout = "split"

        title = spec.get("title") or heading
        # The document numbers its sections ("3. First-Party Knowledge by
        # Stream"); the number is scaffolding for the document, not for a
        # slide, so it becomes a small eyebrow rather than part of the title.
        eyebrow, _, rest = title.partition(". ")
        if eyebrow.isdigit() and rest:
            number, title = eyebrow, rest
        else:
            number = str(index)

        diagram = ""
        if spec.get("diagram"):
            diagram = (
                '<figure class="diagram">'
                + inline_svg(diagrams_dir, spec["diagram"], problems)
                + "</figure>"
            )
        elif not spec["points"]:
            problems.append(f"section {heading!r} has neither diagram nor points")

        slides.append(
            f'<section class="slide layout-{layout}" data-slide="{len(slides) + 1}">\n'
            f'  <div class="canvas">\n'
            f'    <header><span class="eyebrow">{html.escape(number)}</span>'
            f'<h2>{html.escape(title)}</h2></header>\n'
            f'    <div class="content">\n'
            f"      {diagram}\n"
            f"      {render_points(spec['points'])}\n"
            f"    </div>\n"
            f'    <aside class="notes">{notes_html(body)}</aside>\n'
            f"  </div>\n"
            f"</section>"
        )
    return slides


def title_slide(title, subtitle):
    """The title slide is the title, and a subtitle only if one is given.

    An empty <p> is not harmless here: the canvas is a flex column with a
    gap, so a blank element still pushes the title off centre.
    """
    caption = (
        f'\n    <p class="subtitle">{html.escape(subtitle)}</p>' if subtitle.strip()
        else ""
    )
    return (
        '<section class="slide slide-title" data-slide="0">\n'
        '  <div class="canvas">\n'
        f"    <h1>{html.escape(title)}</h1>"
        f"{caption}\n"
        "  </div>\n"
        "</section>"
    )


# --------------------------------------------------------------------------

def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("source", type=Path, help="the markdown document")
    parser.add_argument("--diagrams", type=Path, default=None)
    parser.add_argument("--out", type=Path, default=None)
    parser.add_argument(
        "--subtitle", default="", help="deck subtitle, e.g. the audience and date"
    )
    args = parser.parse_args(argv)

    if not args.source.is_file():
        parser.error(f"no such file: {args.source}")
    base = args.source.resolve().parent
    diagrams_dir = args.diagrams or base / "diagrams"
    out = args.out or base / "deck.html"

    if not SHELL.is_file():
        parser.error(f"missing shell template: {SHELL}")

    text = args.source.read_text()
    problems = []
    slides = build_slides(text, diagrams_dir, problems)
    if not slides:
        parser.error(
            "no slide directives found -- add a <!-- slide ... --> block to "
            "at least one '## ' section"
        )

    preamble = next(iter(split_sections(text)))[1]
    title = document_title(preamble)
    body = "\n".join([title_slide(title, args.subtitle)] + slides)

    shell = SHELL.read_text()
    for token, value in (("{{TITLE}}", html.escape(title)), ("{{SLIDES}}", body)):
        if token not in shell:
            parser.error(f"shell template has no {token} placeholder")
        shell = shell.replace(token, value)

    out.write_text(shell)

    print(f"wrote {out.relative_to(Path.cwd()) if out.is_relative_to(Path.cwd()) else out}"
          f" -- {len(slides)} content slides + title")
    for problem in problems:
        print(f"  WARNING: {problem}", file=sys.stderr)
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
