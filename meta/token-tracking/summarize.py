#!/usr/bin/env python3
"""Summarise token usage and cost for this project from Claude Code transcripts.

Reads only the `usage`, `model`, `timestamp`, `gitBranch`, `effort`, and
`isSidechain` fields of each record. Never reads message content, so output is
safe to commit.

See README.md for why cache reads must not be summed with other token types,
and for the limits of the cost model.
"""

import argparse
import collections
import datetime as dt
import glob
import json
import os
import sys

FIELDS = (
    "input_tokens",
    "cache_creation_input_tokens",
    "cache_read_input_tokens",
    "output_tokens",
)

# USD per million tokens, Anthropic first-party list prices.
# Sonnet 5 has an introductory rate of $2.00/$10.00 through 2026-08-31.
PRICING = {
    "claude-opus-5": {"input": 5.00, "output": 25.00},
    "claude-sonnet-5": {"input": 3.00, "output": 15.00},
    "claude-haiku-4-5": {"input": 1.00, "output": 5.00},
}

# Cache writes cost more than base input; reads cost far less.
# Claude Code uses a 1-hour cache TTL, which is the 2x write tier.
CACHE_WRITE_MULTIPLIER = {"1h": 2.00, "5m": 1.25}
CACHE_READ_MULTIPLIER = 0.10

# Claude Code usage limits are enforced over rolling five-hour windows, so this
# is the bucket that corresponds to how allowance is actually consumed.
WINDOW_HOURS = 5


def transcript_dir(explicit=None):
    """Locate the transcript directory for this project."""
    if explicit:
        return explicit
    base = os.path.expanduser("~/.claude/projects")
    # this file is <repo>/meta/token-tracking/summarize.py
    repo = os.path.basename(
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    )
    matches = sorted(glob.glob(os.path.join(base, f"*{repo}")))
    if not matches:
        sys.exit(f"no transcript directory matching *{repo} under {base}")
    return matches[-1]


def read_records(path):
    """Yield one dict per assistant message that reported usage."""
    for filename in sorted(glob.glob(os.path.join(path, "*.jsonl"))):
        session = os.path.basename(filename)[:8]
        with open(filename, errors="replace") as handle:
            for line in handle:
                try:
                    record = json.loads(line)
                except ValueError:
                    continue  # partial final line while a session is live
                message = record.get("message") or {}
                usage = message.get("usage")
                if not usage:
                    continue
                yield {
                    "session": session,
                    "timestamp": record.get("timestamp") or "",
                    "model": message.get("model", "unknown"),
                    "branch": record.get("gitBranch") or "-",
                    "effort": record.get("effort") or "-",
                    "sidechain": bool(record.get("isSidechain")),
                    "usage": usage,
                }


def price_for(model):
    """Price entry for a model id, tolerating a trailing date suffix.

    Claude Code reports some models with a dated id (`claude-haiku-4-5-20251001`)
    and others without. Keying PRICING on the undated name and stripping the
    suffix here avoids silently pricing a real model at zero.
    """
    if model in PRICING:
        return PRICING[model]
    for name, price in PRICING.items():
        if model.startswith(name + "-"):
            return price
    return None


def cost(model, usage, cache_ttl):
    """Cost in USD for one message. Returns 0.0 for models with no known price."""
    price = price_for(model)
    if not price:
        return 0.0
    per_token = price["input"] / 1_000_000
    write = per_token * CACHE_WRITE_MULTIPLIER[cache_ttl]
    read = per_token * CACHE_READ_MULTIPLIER
    get = lambda f: usage.get(f) or 0  # noqa: E731
    return (
        get("input_tokens") * per_token
        + get("cache_creation_input_tokens") * write
        + get("cache_read_input_tokens") * read
        + get("output_tokens") * price["output"] / 1_000_000
    )


def bucket_key(record, group):
    """Compute the grouping key for one record."""
    if group == "session":
        return record["session"]
    if group == "day":
        return record["timestamp"][:10] or "unknown"
    if group == "branch":
        return record["branch"]
    if group == "effort":
        return record["effort"]
    if group == "model":
        return record["model"]
    if group == "window":
        stamp = record["timestamp"]
        if not stamp:
            return "unknown"
        try:
            when = dt.datetime.fromisoformat(stamp.replace("Z", "+00:00"))
        except ValueError:
            return "unknown"
        floored = when.replace(
            hour=(when.hour // WINDOW_HOURS) * WINDOW_HOURS,
            minute=0,
            second=0,
            microsecond=0,
        )
        return floored.strftime("%Y-%m-%d %H:%M")
    raise ValueError(group)


def accumulate(records, group, cache_ttl):
    """Group token totals, cost, model split, and message counts."""
    empty = lambda: {  # noqa: E731
        "messages": 0,
        "cost": 0.0,
        "models": collections.Counter(),
        "sidechain": 0,
        **{f: 0 for f in FIELDS},
    }
    groups = collections.defaultdict(empty)
    for record in records:
        b = groups[bucket_key(record, group)]
        b["messages"] += 1
        b["models"][record["model"]] += 1
        b["sidechain"] += 1 if record["sidechain"] else 0
        b["cost"] += cost(record["model"], record["usage"], cache_ttl)
        for field in FIELDS:
            value = record["usage"].get(field)
            if isinstance(value, int):
                b[field] += value
    return groups


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--by",
        default="session",
        choices=["session", "day", "window", "branch", "effort", "model"],
        help="grouping key (default: session). 'window' uses rolling "
        "five-hour buckets, matching how usage limits are enforced.",
    )
    parser.add_argument(
        "--allowance",
        type=float,
        metavar="USD",
        help="your own per-bucket budget, to show spend as a percentage of it. "
        "Claude Code does not expose plan allowance locally, so this figure "
        "has to come from you.",
    )
    parser.add_argument(
        "--cache-ttl",
        default="1h",
        choices=["1h", "5m"],
        help="cache TTL for the write-cost multiplier (default: 1h, which is "
        "what Claude Code uses)",
    )
    parser.add_argument("--json", action="store_true", help="machine-readable")
    parser.add_argument("--dir", help="override transcript directory")
    args = parser.parse_args()

    path = transcript_dir(args.dir)
    groups = accumulate(read_records(path), args.by, args.cache_ttl)
    if not groups:
        sys.exit(f"no usage records found in {path}")

    if args.json:
        print(json.dumps({
            key: {
                **{f: v[f] for f in FIELDS},
                "messages": v["messages"],
                "sidechain_messages": v["sidechain"],
                "cost_usd": round(v["cost"], 4),
                "models": dict(v["models"]),
            }
            for key, v in sorted(groups.items())
        }, indent=2))
        return

    width = max(len(str(k)) for k in groups) + 1
    header = (f"{args.by:<{width}} {'msgs':>5} {'input':>8} {'cache_wr':>10} "
              f"{'cache_rd':>12} {'output':>9} {'cost':>9}")
    if args.allowance:
        header += f" {'% budget':>9}"
    print(header)
    print("-" * len(header))

    totals = collections.Counter()
    total_cost = 0.0
    for key, v in sorted(groups.items()):
        row = (f"{str(key):<{width}} {v['messages']:>5} {v['input_tokens']:>8,} "
               f"{v['cache_creation_input_tokens']:>10,} "
               f"{v['cache_read_input_tokens']:>12,} "
               f"{v['output_tokens']:>9,} {v['cost']:>8.2f} ")
        if args.allowance:
            row += f" {v['cost'] / args.allowance * 100:>8.1f}%"
        print(row)
        totals["messages"] += v["messages"]
        total_cost += v["cost"]
        for field in FIELDS:
            totals[field] += v[field]

    print("-" * len(header))
    print(f"{'TOTAL':<{width}} {totals['messages']:>5} "
          f"{totals['input_tokens']:>8,} "
          f"{totals['cache_creation_input_tokens']:>10,} "
          f"{totals['cache_read_input_tokens']:>12,} "
          f"{totals['output_tokens']:>9,} {total_cost:>8.2f}")

    unpriced = {m for v in groups.values() for m in v["models"]} - set(PRICING)
    if unpriced:
        print(f"\nNote: no price for {', '.join(sorted(unpriced))} — "
              "those messages count as $0.00.")
    print("\nCost is list-price estimate, not billed spend. Cache reads scale "
          "with session length,\nnot task difficulty — compare tasks on output "
          "and cache_wr.")


if __name__ == "__main__":
    main()
