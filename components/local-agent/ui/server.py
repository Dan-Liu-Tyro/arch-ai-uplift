#!/usr/bin/env python3
"""Local-only HTML relay for Arc Lite. Stdlib only, no deps, no deployment.

Serves index.html and relays POST /ask to a headless `claude -p --agent
arc-lite` invocation, mirroring exactly how a Claude Code session already
invokes the subagent (.claude/agents/arc-lite.md) -- this just automates
that same call instead of adding a second, parallel way to talk to it.
"""

import http.server
import json
import re
import subprocess
import sys
from datetime import date
from pathlib import Path
from typing import Optional

REPO_ROOT = Path(__file__).resolve().parents[3]
UI_DIR = Path(__file__).resolve().parent
LOCAL_AGENT_DIR = UI_DIR.parent
CONSTITUTION_DIR = LOCAL_AGENT_DIR / "constitution"
KG_CONTENT_ENTITIES = REPO_ROOT / "components" / "kg-content" / "entities"
SKILLS_DIR = REPO_ROOT / ".claude" / "skills"
IGNORE_LIST = CONSTITUTION_DIR / "05-ignore-list.md"
GAP_LOG = LOCAL_AGENT_DIR / "gap-log.md"
HOST = "127.0.0.1"
PORT = 8765

JSON_BLOCK_RE = re.compile(r"```json\s*(\{.*?\})\s*```", re.DOTALL)
FRONTMATTER_ID_RE = re.compile(r"^id:\s*(\S+)", re.MULTILINE)
FRONTMATTER_STATUS_RE = re.compile(r"^status:\s*(\S+)", re.MULTILINE)


def ask_arc_lite(question: str) -> str:
    """The one seam to change if this ever moves off a local subprocess call
    onto a deployed API -- everything else in this file is transport."""
    result = subprocess.run(
        [
            "claude", "-p", question,
            "--agent", "arc-lite",
            "--output-format", "json",
            "--permission-prompts", "none",
        ],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        timeout=180,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or "claude CLI exited non-zero")
    try:
        payload = json.loads(result.stdout)
    except json.JSONDecodeError:
        return result.stdout.strip()
    if payload.get("is_error"):
        raise RuntimeError(payload.get("result") or "Arc Lite returned an error")
    return payload.get("result", "").strip()


def _parse_table(path: Path, key_col: int, value_col: int) -> dict:
    """Parse a `| a | b | ... |` markdown table's data rows into a dict,
    skipping the header and separator rows. Used for 05-ignore-list.md
    (id -> source)."""
    table = {}
    if not path.exists():
        return table
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line.startswith("|") or not line.endswith("|"):
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        if len(cells) <= max(key_col, value_col):
            continue
        if cells[0].lower() == "id" or set(cells[0]) <= {"-"}:
            continue
        table[cells[key_col]] = cells[value_col]
    return table


def _log_gap(question: str, trigger: str, detail: str) -> None:
    safe_q = question.replace("|", "/").replace("\n", " ").strip()
    safe_d = detail.replace("|", "/").replace("\n", " ").strip()
    row = f"| {date.today().isoformat()} | {trigger} | {safe_q} | {safe_d} |\n"
    with GAP_LOG.open("a", encoding="utf-8") as f:
        f.write(row)


def _load_kg_content_statuses() -> dict:
    """Map every kg-content entity id to its recorded status, by scanning
    frontmatter directly (stdlib only, no YAML dependency) -- this is the
    grounding set decision 21 replaced 02-canonical-sources.md with."""
    statuses = {}
    if not KG_CONTENT_ENTITIES.exists():
        return statuses
    for path in KG_CONTENT_ENTITIES.glob("*/*.md"):
        text = path.read_text(encoding="utf-8")
        if not text.startswith("---"):
            continue
        end = text.find("\n---", 3)
        frontmatter = text[3:end] if end != -1 else text
        id_m = FRONTMATTER_ID_RE.search(frontmatter)
        status_m = FRONTMATTER_STATUS_RE.search(frontmatter)
        if id_m and status_m:
            statuses[id_m.group(1)] = status_m.group(1)
    return statuses


def _extract_citation_block(answer: str) -> tuple[Optional[dict], str]:
    """Pull the last fenced ```json block out of the answer per
    .claude/agents/arc-lite.md's answer-format contract, parse it, and
    return (payload_or_None, clean_answer_with_block_removed)."""
    last = None
    for m in JSON_BLOCK_RE.finditer(answer):
        last = m
    if last is None:
        return None, answer.strip()
    clean_answer = (answer[: last.start()] + answer[last.end():]).strip()
    try:
        return json.loads(last.group(1)), clean_answer
    except json.JSONDecodeError:
        return None, clean_answer


def check_compliance(question: str, answer: str) -> tuple[str, bool]:
    """Validate the trailing citation block against .claude/agents/
    arc-lite.md's answer-format contract, log every refusal and every
    non-active kg-content citation to gap-log.md, and report whether the
    answer honored the contract. Returns (clean_answer, compliant)."""
    payload, clean_answer = _extract_citation_block(answer)
    if payload is None:
        _log_gap(question, "compliance-failure", "no valid citation JSON block found")
        return clean_answer, False

    citations = payload.get("citations")
    refusal = payload.get("refusal")
    if not isinstance(citations, list) or not isinstance(refusal, bool):
        _log_gap(question, "compliance-failure", f"malformed citation block: {payload}")
        return clean_answer, False

    if refusal:
        if citations:
            _log_gap(question, "compliance-failure", "refusal true but citations present")
            return clean_answer, False
        _log_gap(question, "refusal", "no kg-content entity or live search covered the question")
        return clean_answer, True

    if not citations:
        _log_gap(question, "compliance-failure", "no citations and no refusal")
        return clean_answer, False

    kg_statuses = _load_kg_content_statuses()
    ignored_sources = set(_parse_table(IGNORE_LIST, key_col=0, value_col=2).values())
    compliant = True

    for citation in citations:
        source = citation.get("source")
        if source == "kg-content":
            cid, status = citation.get("id"), citation.get("status")
            recorded = kg_statuses.get(cid)
            if recorded is None:
                _log_gap(question, "compliance-failure", f"cited unknown kg-content id {cid}")
                compliant = False
            elif recorded != status:
                _log_gap(
                    question, "compliance-failure",
                    f"status mismatch for {cid}: claimed {status}, recorded {recorded}",
                )
                compliant = False
            elif status != "active":
                _log_gap(question, status, f"cited {cid} at non-active status")
        elif source == "live-unverified":
            url = citation.get("url")
            if url in ignored_sources:
                _log_gap(question, "compliance-failure", f"cited ignore-listed url {url}")
                compliant = False
            else:
                _log_gap(question, "live-unverified", f"cited live-unverified url {url}")
        elif source == "skill":
            name = citation.get("name")
            if not (SKILLS_DIR / str(name) / "SKILL.md").exists():
                _log_gap(question, "compliance-failure", f"cited unknown skill {name}")
                compliant = False
            # Skill-sourced answers aren't a knowledge gap -- nothing to log.
        else:
            _log_gap(question, "compliance-failure", f"unrecognized citation source: {source}")
            compliant = False

    return clean_answer, compliant


class Handler(http.server.BaseHTTPRequestHandler):
    def _send_json(self, status: int, body: dict) -> None:
        data = json.dumps(body).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if self.path != "/":
            self.send_response(404)
            self.end_headers()
            return
        html = (UI_DIR / "index.html").read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(html)))
        self.end_headers()
        self.wfile.write(html)

    def do_POST(self):
        if self.path != "/ask":
            self.send_response(404)
            self.end_headers()
            return
        length = int(self.headers.get("Content-Length", 0))
        try:
            body = json.loads(self.rfile.read(length))
            question = body["question"].strip()
            if not question:
                raise ValueError("empty question")
        except (json.JSONDecodeError, KeyError, ValueError):
            self._send_json(400, {"error": "expected JSON body {\"question\": \"...\"}"})
            return
        try:
            answer = ask_arc_lite(question)
        except (RuntimeError, subprocess.TimeoutExpired) as exc:
            self._send_json(502, {"error": str(exc)})
            return
        clean_answer, compliant = check_compliance(question, answer)
        self._send_json(200, {"answer": clean_answer, "compliant": compliant})

    def log_message(self, fmt, *args):
        pass


def main():
    server = http.server.HTTPServer((HOST, PORT), Handler)
    print(f"Arc Lite UI: http://{HOST}:{PORT}  (Ctrl+C to stop)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.shutdown()


if __name__ == "__main__":
    sys.exit(main())
