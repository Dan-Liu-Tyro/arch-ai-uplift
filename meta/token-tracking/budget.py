#!/usr/bin/env python3
"""Report usage-credit position against the monthly pool, and advise on pace.

Two data sources, deliberately kept distinct because they mean different
things:

1. **Authoritative** — Claude Code caches the account's real usage-credit
   position in `~/.claude.json` under `cachedUsageUtilization`. This is the
   number that can actually stop work when it runs out. It is a *cache*, so
   it is only as fresh as the last `/usage` call; staleness is reported.
2. **Estimated** — list-price cost derived from transcripts across *every*
   project on this machine, via the sibling `summarize.py` cost model. Used
   to fill the gap between the cached fetch and now, and to attribute spend
   to days, models, and projects.

Only numeric spend fields are read from the config. No auth material is
touched, and no message content is read (see `summarize.py`).
"""

import argparse
import collections
import datetime as dt
import glob
import json
import os
import sys

import summarize

CLAUDE_CONFIG = "~/.claude.json"
PROJECTS_DIR = "~/.claude/projects"

# Usage credits accrue only after plan limits are hit, so list price and
# credits are not 1:1. Calibrating one against the other over the cycle so
# far is crude but beats assuming parity.
MIN_CALIBRATION_BASE = 1.00


def read_pool(config_path=None):
    """Authoritative usage-credit pool, or (None, reason)."""
    path = os.path.expanduser(config_path or CLAUDE_CONFIG)
    try:
        with open(path) as handle:
            blob = json.load(handle)
    except (OSError, ValueError) as exc:
        return None, f"could not read {path}: {exc}"

    cached = blob.get("cachedUsageUtilization") or {}
    util = cached.get("utilization") or {}
    extra = util.get("extra_usage") or {}
    spend = util.get("spend") or {}
    if not extra and not spend:
        return None, (
            "no cachedUsageUtilization in the config — open Claude Code and "
            "run /usage once to populate it"
        )

    exponent = extra.get("decimal_places")
    if exponent is None:
        exponent = (spend.get("limit") or {}).get("exponent", 2)
    scale = 10 ** int(exponent)

    limit = extra.get("monthly_limit")
    used = extra.get("used_credits")
    if limit is None:
        limit = (spend.get("limit") or {}).get("amount_minor")
    if used is None:
        used = (spend.get("used") or {}).get("amount_minor")
    if limit is None or used is None:
        return None, "cachedUsageUtilization present but has no limit/used figures"

    fetched_ms = cached.get("fetchedAtMs")
    fetched = dt.datetime.fromtimestamp(fetched_ms / 1000) if fetched_ms else None

    return {
        "limit": limit / scale,
        "used": used / scale,
        "currency": extra.get("currency") or "USD",
        "utilization": extra.get("utilization"),
        "enabled": extra.get("is_enabled", spend.get("enabled")),
        "limit_reached": extra.get("spend_limit_reached"),
        "can_purchase": spend.get("can_purchase_credits"),
        "can_toggle": spend.get("can_toggle"),
        "fetched": fetched,
    }, None


def all_records(projects_dir=None):
    """Every usage-bearing record across every project on this machine."""
    base = os.path.expanduser(projects_dir or PROJECTS_DIR)
    for directory in sorted(glob.glob(os.path.join(base, "*/"))):
        project = os.path.basename(directory.rstrip("/"))
        for record in summarize.read_records(directory):
            record["project"] = project
            yield record


def cycle_bounds(today, start_day):
    """Inclusive [start, end] of the billing cycle containing `today`."""
    start_day = max(1, min(28, start_day))
    if today.day >= start_day:
        start = today.replace(day=start_day)
    else:
        first = today.replace(day=1)
        prev_month_end = first - dt.timedelta(days=1)
        start = prev_month_end.replace(day=start_day)
    if start.month == 12:
        nxt = start.replace(year=start.year + 1, month=1)
    else:
        nxt = start.replace(month=start.month + 1)
    return start, nxt - dt.timedelta(days=1)


def collect(cache_ttl):
    """Per-day, per-model and per-project list-price cost."""
    by_day = collections.Counter()
    by_model = collections.Counter()
    by_project = collections.Counter()
    tokens_by_day = collections.defaultdict(collections.Counter)
    for record in all_records():
        day = record["timestamp"][:10]
        if not day:
            continue
        amount = summarize.cost(record["model"], record["usage"], cache_ttl)
        by_day[day] += amount
        by_model[record["model"]] += amount
        by_project[record["project"]] += amount
        bucket = tokens_by_day[day]
        bucket["messages"] += 1
        for field in summarize.FIELDS:
            value = record["usage"].get(field)
            if isinstance(value, int):
                bucket[field] += value
    return by_day, by_model, by_project, tokens_by_day


def window(by_day, start, end):
    """Total list-price cost for days in [start, end] inclusive."""
    lo, hi = start.isoformat(), end.isoformat()
    return sum(v for k, v in by_day.items() if lo <= k <= hi)


def money(value, currency="USD"):
    sign = "$" if currency == "USD" else f"{currency} "
    return f"{sign}{value:,.2f}"


def bar(fraction, width=28):
    filled = max(0, min(width, round(fraction * width)))
    return "[" + "#" * filled + "." * (width - filled) + "]"


def main():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--limit", type=float,
                        help="override the monthly pool (default: read from config)")
    parser.add_argument("--cycle-start", type=int, default=1,
                        help="day of month the cycle resets (default 1)")
    parser.add_argument("--target", type=float, default=90.0,
                        help="percent of pool to aim for by cycle end (default 90)")
    parser.add_argument("--cache-ttl", default="1h", choices=["1h", "5m"],
                        help="cache write tier for the estimate (default 1h)")
    parser.add_argument("--recent", type=int, default=7,
                        help="days of history for the burn-rate figure (default 7)")
    parser.add_argument("--today", help="override today's date (YYYY-MM-DD), for testing")
    parser.add_argument("--json", action="store_true", help="machine-readable")
    args = parser.parse_args()

    today = (dt.date.fromisoformat(args.today) if args.today else dt.date.today())
    start, end = cycle_bounds(today, args.cycle_start)
    total_days = (end - start).days + 1
    elapsed_days = (today - start).days + 1
    remaining_days = total_days - elapsed_days
    cycle_fraction = elapsed_days / total_days

    pool, pool_error = read_pool()
    by_day, by_model, by_project, tokens_by_day = collect(args.cache_ttl)

    est_cycle = window(by_day, start, end)
    est_to_date = window(by_day, start, today)

    limit = args.limit if args.limit is not None else (pool or {}).get("limit")
    currency = (pool or {}).get("currency", "USD")

    # Bridge the cache's staleness with the list-price estimate, calibrated on
    # the part of the cycle the cache already covers.
    authoritative = (pool or {}).get("used")
    fetched = (pool or {}).get("fetched")
    calibration = None
    estimated_now = authoritative
    if authoritative is not None and fetched is not None:
        fetch_day = fetched.date()
        covered_end = min(fetch_day, today)
        covered = window(by_day, start, covered_end)
        after = window(by_day, covered_end + dt.timedelta(days=1), today)
        if covered >= MIN_CALIBRATION_BASE:
            calibration = authoritative / covered
            estimated_now = authoritative + calibration * after
        elif after > 0:
            estimated_now = authoritative + after  # no basis; assume parity

    result = {
        "cycle": {"start": start.isoformat(), "end": end.isoformat(),
                  "elapsed_days": elapsed_days, "total_days": total_days,
                  "fraction_elapsed": round(cycle_fraction, 4)},
        "pool": {"limit": limit, "currency": currency,
                 "authoritative_used": authoritative,
                 "authoritative_as_of": fetched.isoformat() if fetched else None,
                 "estimated_used_now": estimated_now,
                 "calibration_credits_per_listprice": calibration,
                 "error": pool_error},
        "estimate": {"list_price_cycle_to_date": round(est_to_date, 2),
                     "list_price_full_cycle": round(est_cycle, 2)},
    }

    if args.json:
        recent_start = today - dt.timedelta(days=args.recent - 1)
        result["recent_days"] = {
            k: round(v, 2) for k, v in sorted(by_day.items())
            if recent_start.isoformat() <= k <= today.isoformat()
        }
        result["by_model"] = {k: round(v, 2) for k, v in by_model.most_common()}
        result["by_project"] = {k: round(v, 2) for k, v in by_project.most_common()}
        json.dump(result, sys.stdout, indent=2)
        print()
        return

    # ---- human brief ----
    print(f"CYCLE  {start} -> {end}   day {elapsed_days}/{total_days} "
          f"({cycle_fraction*100:.0f}% elapsed, {remaining_days} left)")
    print()

    if pool_error:
        print(f"POOL   unavailable: {pool_error}")
    else:
        stale = ""
        if fetched:
            age = dt.datetime.now() - fetched
            hours = age.total_seconds() / 3600
            stale = f"as of {fetched:%Y-%m-%d %H:%M} ({age.days}d {int(hours % 24)}h ago)"
            if age.days >= 1:
                stale += "  <- STALE, run /usage to refresh"
        print(f"POOL   {money(limit, currency)}/cycle   "
              f"confirmed spend {money(authoritative, currency)}  {stale}")
        if estimated_now is not None and estimated_now != authoritative:
            note = (f"calibrated {calibration:.2f} credits per $1 list price"
                    if calibration else "assuming parity, uncalibrated")
            print(f"       estimated now {money(estimated_now, currency)}  ({note})")

    if limit:
        position = estimated_now if estimated_now is not None else est_to_date
        used_fraction = position / limit
        print()
        print(f"SPEND  {bar(used_fraction)} {used_fraction*100:5.1f}% of pool")
        print(f"CYCLE  {bar(cycle_fraction)} {cycle_fraction*100:5.1f}% of time")
        pace = used_fraction / cycle_fraction if cycle_fraction else 0
        verdict = ("ON PACE" if 0.85 <= pace <= 1.15
                   else "AHEAD OF PACE" if pace > 1.15 else "BEHIND PACE")
        print(f"PACE   {pace:.2f}x  -> {verdict}")
        if cycle_fraction:
            projected = position / cycle_fraction
            print(f"       linear projection for full cycle: "
                  f"{money(projected, currency)} "
                  f"({projected/limit*100:.0f}% of pool)")
        target_amount = limit * args.target / 100
        headroom = target_amount - position
        print()
        print(f"TARGET {args.target:.0f}% = {money(target_amount, currency)}   "
              f"headroom {money(headroom, currency)}")
        if remaining_days > 0:
            print(f"       sustainable daily spend to land on target: "
                  f"{money(headroom / remaining_days, currency)}/day")
            cap_headroom = limit - position
            print(f"       hard-stop daily ceiling (100% of pool):       "
                  f"{money(cap_headroom / remaining_days, currency)}/day")
        else:
            print("       final day of cycle")

    recent_start = today - dt.timedelta(days=args.recent - 1)
    recent = {k: v for k, v in by_day.items()
              if recent_start.isoformat() <= k <= today.isoformat()}
    print()
    print(f"RECENT {args.recent} days (list-price estimate, all projects)")
    for day in sorted(recent):
        tok = tokens_by_day[day]
        print(f"  {day}  {money(recent[day]):>9}   "
              f"out {tok['output_tokens']:>8,}  "
              f"cache_wr {tok['cache_creation_input_tokens']:>10,}  "
              f"msgs {tok['messages']:>4}")
    active = [v for v in recent.values() if v > 0]
    if active:
        print(f"  mean over {len(active)} active day(s): "
              f"{money(sum(active)/len(active))}  "
              f"| mean over all {args.recent}: {money(sum(recent.values())/args.recent)}")

    print()
    print("MODEL MIX (list-price share, all time)")
    model_total = sum(by_model.values()) or 1
    for model, amount in by_model.most_common(6):
        print(f"  {model:<28} {money(amount):>9}  {amount/model_total*100:5.1f}%")

    print()
    print("PROJECTS (list-price, all time)")
    project_total = sum(by_project.values()) or 1
    for project, amount in by_project.most_common(6):
        print(f"  {project:<52} {money(amount):>9}  "
              f"{amount/project_total*100:5.1f}%")

    print()
    print("Confirmed spend is authoritative but cached; the estimate is list price and")
    print("not what is billed. Usage credits accrue only after plan limits are hit, so")
    print("the calibration ratio is an approximation, not a conversion rate.")


if __name__ == "__main__":
    main()
