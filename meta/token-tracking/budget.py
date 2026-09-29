#!/usr/bin/env python3
"""Track usage-credit consumption against three ranked goals.

Goals, in the user's stated priority order (decision 25 in
`docs/decision-log.md`):

1. **Never exceed the ceiling.** A hard constraint, not a target. Default
   90% of the pool, leaving 10% as margin against the real hard stop.
2. **Land in the band, don't waste headroom.** Unspent allocation is
   waste, not saving. Default band 85-90%.
3. **Maximise output per credit.** Of two ways to reach the same
   position, prefer the one that produced more.

Two data sources, kept distinct because they mean different things:

- **Authoritative** — `~/.claude.json`'s `cachedUsageUtilization` holds
  the real credit position. It is a *cache*, refreshed when `/usage`
  runs, so staleness is always reported. A staleness warning is not a
  mitigation: if it is stale, refresh before believing a pace figure.
- **Estimated** — list-price cost from transcripts across *every*
  project on this machine, via `summarize.py`'s cost model. Used to
  attribute spend to days, models, and branches, and to bridge the gap
  between the cache's fetch time and now.

Only numeric spend fields are read from the config; no auth material is
touched, and no message content is read.
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

# Below this much list-price cost there is no basis for calibrating the
# list-price-to-credits ratio, so parity is assumed and labelled as such.
MIN_CALIBRATION_BASE = 1.00


# --------------------------------------------------------------------------
# data
# --------------------------------------------------------------------------

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
        return None, ("no cachedUsageUtilization — open Claude Code and run "
                      "/usage once to populate it")

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
        return None, "cachedUsageUtilization has no limit/used figures"

    fetched_ms = cached.get("fetchedAtMs")
    return {
        "limit": limit / scale,
        "used": used / scale,
        "currency": extra.get("currency") or "USD",
        "limit_reached": extra.get("spend_limit_reached"),
        "can_purchase": spend.get("can_purchase_credits"),
        # Rolling plan limits: these are what actually cause credits to be
        # spent at all. Usually null locally, which is worth saying out loud.
        "five_hour": util.get("five_hour"),
        "seven_day": util.get("seven_day"),
        "fetched": (dt.datetime.fromtimestamp(fetched_ms / 1000)
                    if fetched_ms else None),
    }, None


def all_records(projects_dir=None):
    """Every usage-bearing record across every project on this machine."""
    base = os.path.expanduser(projects_dir or PROJECTS_DIR)
    for directory in sorted(glob.glob(os.path.join(base, "*/"))):
        project = os.path.basename(directory.rstrip("/"))
        for record in summarize.read_records(directory):
            record["project"] = project
            yield record


def split_cost(model, usage, cache_ttl):
    """Cost split into (output, cache_read, other) — the shares that matter.

    Cache-read cost is pure overhead: context re-read on every turn,
    producing nothing new. Its share of total cost is the cleanest
    available signal of session-length waste.
    """
    price = summarize.price_for(model)
    if not price:
        return 0.0, 0.0, 0.0
    per_token = price["input"] / 1_000_000
    get = lambda f: usage.get(f) or 0  # noqa: E731
    output = get("output_tokens") * price["output"] / 1_000_000
    reads = get("cache_read_input_tokens") * per_token * summarize.CACHE_READ_MULTIPLIER
    other = (get("input_tokens") * per_token
             + get("cache_creation_input_tokens") * per_token
             * summarize.CACHE_WRITE_MULTIPLIER[cache_ttl])
    return output, reads, other


def empty_bucket():
    return {"cost": 0.0, "output_cost": 0.0, "read_cost": 0.0,
            "output_tokens": 0, "messages": 0, "sidechain": 0}


def collect(cache_ttl):
    """Roll records up by day, model, project and branch."""
    dims = {k: collections.defaultdict(empty_bucket)
            for k in ("day", "model", "project", "branch")}
    for record in all_records():
        day = record["timestamp"][:10]
        if not day:
            continue
        output, reads, other = split_cost(record["model"], record["usage"], cache_ttl)
        total = output + reads + other
        keys = {"day": day, "model": record["model"],
                "project": record["project"], "branch": record["branch"]}
        for dim, key in keys.items():
            b = dims[dim][key]
            b["cost"] += total
            b["output_cost"] += output
            b["read_cost"] += reads
            b["output_tokens"] += record["usage"].get("output_tokens") or 0
            b["messages"] += 1
            b["sidechain"] += 1 if record["sidechain"] else 0
        dims["day"][day]["_date"] = day
    return dims


def window(by_day, start, end):
    lo, hi = start.isoformat(), end.isoformat()
    return {k: v for k, v in by_day.items() if lo <= k <= hi}


def total(buckets, field="cost"):
    return sum(b[field] for b in buckets.values())


# --------------------------------------------------------------------------
# cycle
# --------------------------------------------------------------------------

def cycle_bounds(today, start_day):
    """Inclusive [start, end] of the billing cycle containing `today`."""
    start_day = max(1, min(28, start_day))
    if today.day >= start_day:
        start = today.replace(day=start_day)
    else:
        prev_month_end = today.replace(day=1) - dt.timedelta(days=1)
        start = prev_month_end.replace(day=start_day)
    if start.month == 12:
        nxt = start.replace(year=start.year + 1, month=1)
    else:
        nxt = start.replace(month=start.month + 1)
    return start, nxt - dt.timedelta(days=1)


# --------------------------------------------------------------------------
# formatting
# --------------------------------------------------------------------------

def money(value, currency="USD"):
    return f"{'$' if currency == 'USD' else currency + ' '}{value:,.2f}"


def bar(fraction, width=26, marks=()):
    """Progress bar with optional '|' markers at given fractions."""
    cells = ["." for _ in range(width)]
    filled = max(0, min(width, round(fraction * width)))
    for i in range(filled):
        cells[i] = "#"
    for m in marks:
        pos = max(0, min(width - 1, round(m * width) - 1))
        cells[pos] = "|"
    return "[" + "".join(cells) + "]"


def per_dollar(output_tokens, cost):
    return output_tokens / cost if cost > 0 else 0.0


# --------------------------------------------------------------------------
# main
# --------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--limit", type=float,
                        help="override pool size (default: read from config)")
    parser.add_argument("--cycle-start", type=int, default=1,
                        help="day of month the cycle resets (default 1)")
    parser.add_argument("--ceiling", type=float, default=90.0,
                        help="goal 1: percent of pool never to exceed (default 90)")
    parser.add_argument("--floor", type=float, default=85.0,
                        help="goal 2: percent below which headroom is wasted (default 85)")
    parser.add_argument("--cache-ttl", default="1h", choices=["1h", "5m"])
    parser.add_argument("--recent", type=int, default=7,
                        help="days in the history table (default 7)")
    parser.add_argument("--today", help="override today's date, for testing")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    today = dt.date.fromisoformat(args.today) if args.today else dt.date.today()
    start, end = cycle_bounds(today, args.cycle_start)
    total_days = (end - start).days + 1
    elapsed = (today - start).days + 1
    left = total_days - elapsed
    time_frac = elapsed / total_days

    pool, pool_error = read_pool()
    dims = collect(args.cache_ttl)
    by_day = dims["day"]

    cycle_days = window(by_day, start, today)
    list_to_date = total(cycle_days)

    limit = args.limit if args.limit is not None else (pool or {}).get("limit")
    currency = (pool or {}).get("currency", "USD")
    confirmed = (pool or {}).get("used")
    fetched = (pool or {}).get("fetched")

    # Credits are the pool's unit, so convert list price into credits using
    # the ratio observed this cycle. Non-linear in truth (credits accrue only
    # past plan limits), so this is an approximation, labelled as one.
    ratio = None
    if confirmed is not None and list_to_date >= MIN_CALIBRATION_BASE:
        ratio = confirmed / list_to_date
    credits = (lambda x: x * ratio) if ratio else (lambda x: x)

    # Position now: confirmed, plus a bridge over the cache's stale window.
    position = confirmed
    bridged = 0.0
    backdated = False
    if confirmed is not None and fetched is not None:
        if today < fetched.date():
            # Asked about a past date: the confirmed figure is as-of-now and
            # says nothing about where the pool stood then. Fall back to the
            # list-price estimate rather than projecting from a later total.
            position = credits(list_to_date)
            backdated = True
        else:
            after = window(by_day, today.replace() + dt.timedelta(days=0), today)
            after = window(by_day, fetched.date() + dt.timedelta(days=1), today)
            bridged = credits(total(after))
            position = confirmed + bridged
    if position is None:
        position = credits(list_to_date)

    ceiling_amt = limit * args.ceiling / 100 if limit else None
    floor_amt = limit * args.floor / 100 if limit else None

    # Projections. Linear uses the whole cycle to date; trailing uses the
    # last `recent` calendar days, which reacts faster to a change in habit.
    linear = position / time_frac if time_frac else position
    trail_start = today - dt.timedelta(days=args.recent - 1)
    trail_rate = credits(total(window(by_day, trail_start, today))) / args.recent
    trailing = position + trail_rate * left

    if args.json:
        json.dump({
            "cycle": {"start": start.isoformat(), "end": end.isoformat(),
                      "elapsed_days": elapsed, "total_days": total_days,
                      "days_left": left},
            "pool": {"limit": limit, "currency": currency,
                     "confirmed": confirmed,
                     "confirmed_as_of": fetched.isoformat() if fetched else None,
                     "bridged_estimate": round(bridged, 2),
                     "position": round(position, 2),
                     "credits_per_listprice": ratio, "error": pool_error},
            "goals": {"ceiling_pct": args.ceiling, "ceiling": ceiling_amt,
                      "floor_pct": args.floor, "floor": floor_amt,
                      "projection_linear": round(linear, 2),
                      "projection_trailing": round(trailing, 2)},
            "efficiency": {
                "output_tokens": sum(b["output_tokens"] for b in cycle_days.values()),
                "tokens_per_credit": round(per_dollar(
                    sum(b["output_tokens"] for b in cycle_days.values()),
                    position), 1),
                "cache_read_share": round(
                    total(cycle_days, "read_cost") / list_to_date, 4)
                if list_to_date else None,
            },
            "by_day": {k: round(v["cost"], 2) for k, v in sorted(cycle_days.items())},
            "by_branch": {k: round(v["cost"], 2)
                          for k, v in sorted(dims["branch"].items(),
                                             key=lambda x: -x[1]["cost"])},
            "by_model": {k: round(v["cost"], 2)
                         for k, v in sorted(dims["model"].items(),
                                            key=lambda x: -x[1]["cost"])},
        }, sys.stdout, indent=2)
        print()
        return

    # ---------------- human brief ----------------
    print(f"CYCLE  {start} -> {end}   day {elapsed}/{total_days} "
          f"({time_frac*100:.0f}% elapsed, {left} left)")

    if pool_error:
        print(f"POOL   unavailable: {pool_error}")
        print("       every figure below is list-price estimate only")
    else:
        age = dt.datetime.now() - fetched if fetched else None
        stamp = "unknown age"
        if age is not None:
            stamp = (f"{fetched:%m-%d %H:%M}, "
                     f"{age.days}d {int(age.total_seconds()/3600 % 24)}h ago")
            if age.days >= 1:
                stamp += "  <- STALE: run /usage, do not trust pace below"
        print(f"POOL   {money(limit, currency)}   confirmed {money(confirmed, currency)}"
              f"   ({stamp})")
        if bridged > 0.01:
            print(f"       + {money(bridged, currency)} estimated since that fetch"
                  f"   -> position {money(position, currency)}")

    if not limit:
        return

    used_frac = position / limit
    print()
    print(f"--- GOAL 1: never exceed {args.ceiling:.0f}% "
          f"({money(ceiling_amt, currency)}) ------------------")
    print(f"  spend  {bar(used_frac, marks=(args.floor/100, args.ceiling/100))} "
          f"{used_frac*100:5.1f}%")
    print(f"  time   {bar(time_frac)} {time_frac*100:5.1f}%")
    if backdated:
        print("  (backdated run: position is list-price estimate, not confirmed)")
    if left > 0:
        headroom = ceiling_amt - position
        if headroom <= 0:
            print(f"  budget none — already {money(-headroom, currency)} past the "
                  f"ceiling; stop or raise --ceiling")
        else:
            print(f"  budget {money(headroom / left, currency)}/day for {left} "
                  f"days keeps you exactly at the ceiling")
    breach = max(linear, trailing)
    if breach > ceiling_amt:
        over = "linear" if linear > trailing else "trailing"
        print(f"  STATUS BREACH RISK — {over} projection "
              f"{money(breach, currency)} is over the ceiling. Slow down.")
    else:
        print(f"  STATUS safe — both projections land under the ceiling "
              f"(worst {money(breach, currency)})")

    print()
    print(f"--- GOAL 2: land in the {args.floor:.0f}-{args.ceiling:.0f}% band "
          f"({money(floor_amt, currency)}-{money(ceiling_amt, currency)}) ---")
    for label, value in (("linear   (whole cycle)", linear),
                         (f"trailing ({args.recent}d rate)", trailing)):
        pct = value / limit * 100
        verdict = ("OVER" if value > ceiling_amt
                   else "IN BAND" if value >= floor_amt else "UNDER — wasting headroom")
        print(f"  {label:<22} {money(value, currency):>9}  {pct:5.1f}%  {verdict}")
    if left > 0:
        need = max((floor_amt - position) / left, 0.0)
        now_rate = position / elapsed
        line = (f"  to reach the floor: {money(need, currency)}/day"
                f"   current rate {money(now_rate, currency)}/day")
        if now_rate > 0 and need > 0:
            line += f"   lift {need/now_rate:.1f}x"
        print(line)

    out_tokens = sum(b["output_tokens"] for b in cycle_days.values())
    read_share = total(cycle_days, "read_cost") / list_to_date if list_to_date else 0
    print()
    print("--- GOAL 3: output per credit -----------------------------------")
    print(f"  cycle output {out_tokens:,} tokens on {money(position, currency)}"
          f"  =  {per_dollar(out_tokens, position)/1000:.1f}k tokens/credit-$")
    print(f"  context re-read is {read_share*100:.0f}% of list cost"
          f"  ({'high — sessions running long' if read_share > 0.45 else 'reasonable'})")
    print("  NB tokens/credit-$ is throughput, not value. A pricier model")
    print("     scores lower by construction; read it within a model, or")
    print("     alongside re-read %, never as a reason to downgrade.")
    if ratio:
        print(f"  calibration {ratio:.2f} credits per $1 list price this cycle"
              f"  (approximation, not a rate)")

    print()
    print(f"--- RECENT {args.recent} DAYS (list-price estimate, all projects) ----")
    recent = window(by_day, trail_start, today)
    for day in sorted(recent):
        b = recent[day]
        print(f"  {day}  {money(b['cost']):>8}  out {b['output_tokens']:>8,}"
              f"  {per_dollar(b['output_tokens'], b['cost'])/1000:5.1f}k tok/$"
              f"  reread {b['read_cost']/b['cost']*100 if b['cost'] else 0:3.0f}%"
              f"  msgs {b['messages']:>4}")

    print()
    print("--- WHERE IT WENT (by branch = per-task, all time) --------------")
    branches = sorted(dims["branch"].items(), key=lambda x: -x[1]["cost"])[:8]
    grand = total(dims["branch"]) or 1
    for name, b in branches:
        print(f"  {name:<22} {money(b['cost']):>9} {b['cost']/grand*100:5.1f}%"
              f"  {per_dollar(b['output_tokens'], b['cost'])/1000:5.1f}k tok/$"
              f"  reread {b['read_cost']/b['cost']*100 if b['cost'] else 0:3.0f}%")

    print()
    print("--- MODEL MIX (all time) ----------------------------------------")
    mgrand = total(dims["model"]) or 1
    for name, b in sorted(dims["model"].items(), key=lambda x: -x[1]["cost"])[:5]:
        print(f"  {name:<22} {money(b['cost']):>9} {b['cost']/mgrand*100:5.1f}%"
              f"  {per_dollar(b['output_tokens'], b['cost'])/1000:5.1f}k tok/$")

    if pool and pool.get("five_hour") is None:
        print()
        print("NOTE   rolling five_hour / seven_day plan limits read null locally.")
        print("       Those limits are what cause credits to be spent at all, so")
        print("       the real driver of this pool is not visible here.")


if __name__ == "__main__":
    main()
