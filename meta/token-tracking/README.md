# token-tracking

Granular token consumption and cost data for this project, so strategy can be
adjusted from evidence rather than intuition.

## Answering the allowance question honestly

**Correction, 2026-09-14.** This section previously stated, as a verified
finding, that "Claude Code does not expose your plan allowance locally." That
was wrong. The probe behind it only searched *transcripts*; the figure lives in
`~/.claude.json`, under `cachedUsageUtilization.utilization`. See
`meta/perception-failures/log.md` entry 3 for how a narrow probe became a flat
claim. What follows is the corrected account.

Claude Code **does** cache the account's real usage-credit position locally:

```
cachedUsageUtilization
  fetchedAtMs                              when the cache was last refreshed
  utilization.extra_usage.monthly_limit    pool size, in currency minor units
  utilization.extra_usage.used_credits     consumed, same units
  utilization.extra_usage.utilization      percent consumed
  utilization.extra_usage.decimal_places   minor-unit exponent (2 = cents)
  utilization.spend.can_purchase_credits   false when org-administered
  utilization.five_hour / .seven_day       rolling plan-limit utilization
```

Three things matter about this number more than its existence.

**It is a cache, not a live reading.** It refreshes when `/usage` runs, not on a
timer. It was 4 days 19 hours stale the first time it was read here, and both
figures in it were wrong: it reported a $150 pool at 66.6% consumed when the
true position was $500 at 24.1%. `budget.py` always prints the age and says to
refresh when it is over a day old — but note that the warning is not a
mitigation. If the cache is stale, refresh it with `/usage` before believing
any pace figure, including the calibrated bridge this tool computes. See
`meta/perception-failures/log.md` entry 4 for what happened when that advice
was not taken.

**`extra_usage` is overage, not an allowance.** Usage credits are consumed only
*after* subscription plan limits are hit — they are the buffer that keeps work
moving when you are rate-limited. They are therefore not a budget to spend down.
A deliberate push toward "90% of credits used" is a decision to spend most of the
month rate-limited, which is a throughput problem wearing a cost costume. Treat a
*low* credit burn as the healthy state, and the pool as a reserve for genuinely
urgent work.

**The rolling-window fields are the ones that bind day to day.** `five_hour` and
`seven_day` are how limits are actually enforced; they read `null` here, which
means only that they were not populated at fetch time. `summarize.py --by window`
remains the right grouping for understanding what trips a limit, and
`--allowance N` still takes a figure you supply for that purpose.

```
python3 meta/token-tracking/summarize.py --by window --allowance 15
```

## Data source

Claude Code writes a JSONL transcript per session to
`~/.claude/projects/<slugified-project-path>/*.jsonl`. Each assistant message
carries `usage` with four token categories:

| Field | Meaning |
|---|---|
| `input_tokens` | uncached prompt tokens, full price |
| `cache_creation_input_tokens` | tokens written to cache — costs *more* than base input |
| `cache_read_input_tokens` | tokens served from cache — roughly a tenth of base input |
| `output_tokens` | generated tokens, the most expensive category per token |

Records also carry `model`, `gitBranch`, `effort`, and `isSidechain` — the
attribution keys that make per-task costing possible without manual bookkeeping.

## Usage

```
--by session   per session (default)
--by day       calendar days
--by window    rolling 5-hour buckets — matches how usage limits are enforced
--by branch    per git branch — the closest thing to per-feature attribution
--by effort    per reasoning-effort level
--by model     per model, since prices differ several-fold

--allowance N  show each bucket as a percentage of a budget you supply
--cache-ttl    1h (default, what Claude Code uses) or 5m — changes write cost
--json         machine-readable
```

No dependencies, standard library only.

## `budget.py` — credit position and daily pace

`summarize.py` answers "what did this task cost, relative to that one." `budget.py`
answers "am I going to run out before the cycle ends." Built for decision 25 in
`docs/decision-log.md`.

```
python3 meta/token-tracking/budget.py
python3 meta/token-tracking/budget.py --cycle-start 16 --target 75
python3 meta/token-tracking/budget.py --json
```

| Flag | Meaning |
|---|---|
| `--limit N` | override the pool size instead of reading it from the config |
| `--cycle-start D` | day of month the cycle resets (default 1, clamped to 28) |
| `--target P` | percent of pool to aim for by cycle end (default 90) |
| `--recent N` | days of history in the burn-rate table (default 7) |
| `--cache-ttl` | passed through to the `summarize.py` cost model |
| `--today` | override today's date, for testing the cycle arithmetic |
| `--json` | machine-readable |

Two deliberate differences from `summarize.py`:

**It scans every project, not this one.** `summarize.py` derives its transcript
directory from its own `__file__`, which is right for per-feature attribution and
wrong for a budget — every project on the machine draws on the same pool.
`budget.py` walks all of `~/.claude/projects/*/` and reports the project split.

**It separates confirmed spend from estimate, and never blurs them.** The
authoritative figure comes from the config cache. The list-price estimate covers
the gap between the cache's fetch time and now, scaled by a calibration ratio
(credits per $1 of list price) derived over the part of the cycle the cache
already covers. That ratio is an approximation and is labelled as one: credits
accrue only past plan limits, so the true relationship is non-linear, and early
cycle usage costs no credits at all.

The cycle reset day is an assumption (`--cycle-start`, default the 1st). The real
date is shown by `/usage`. Every pace figure depends on it, so confirm it rather
than trusting the default.

## Cost model

List prices per million tokens, from the Claude API reference:

| Model | Input | Output |
|---|---|---|
| Opus 5 | $5.00 | $25.00 |
| Sonnet 5 | $3.00 | $15.00 |
| Haiku 4.5 | $1.00 | $5.00 |

Cache writes bill at a multiple of base input — **2× on a 1-hour TTL**, 1.25× on
5-minute. Claude Code uses the 1-hour TTL, so that is the default. Cache reads
bill at roughly 0.1× base input.

Three limits worth stating plainly:

- **This is a list-price estimate, not billed spend.** Subscription plans do not
  bill per token, so treat the figure as relative cost for comparing tasks, not as
  an invoice.
- **Sonnet 5 has an introductory rate** of $2.00/$10.00 through 2026-08-31. The
  table uses standard pricing, so Sonnet lines read high for now.
- **Unpriced models count as zero.** Synthetic entries and any model absent from
  the table contribute nothing; the tool says so in a footer rather than silently
  under-reporting.

## Reading the numbers

**Cache reads dominate volume and are the cheapest category.** In the baseline,
`cache_read_input_tokens` exceeded raw `input_tokens` by roughly four orders of
magnitude. Summing token categories unweighted therefore measures almost nothing
but cache-read volume — which is why this tool reports categories separately and
prices them separately.

**Cache reads measure session length, not task difficulty.** Every turn re-reads
the accumulated context, so the total grows with conversation length regardless of
how much work the turn did. **To compare the cost of two tasks, compare
`output_tokens` and `cache_creation_input_tokens`.**

**Model mix matters more than token totals.** Opus and Sonnet differ several-fold
in price, so a bucket's cost depends on which model served it. Every grouping
reports its model split for that reason.

## Attribution: solved well enough by `gitBranch`

The original open question — how to attribute tokens to tasks — turned out to
have a good answer already in the data. Records carry the git branch they were
produced on, so `--by branch` gives per-feature cost with no bookkeeping, provided
work is branched by feature (which this repo does anyway).

`--by effort` and the `sidechain_messages` count in JSON output add two more
dimensions: reasoning level, and how much spend went to subagents rather than the
main thread.

What remains genuinely unsolved is attribution *within* a long-lived branch — the
`plan` branch covers schema, components, and meta work, and nothing in the data
separates them. Timestamp correlation against commits would approximate it, and is
deliberately not implemented: the branch-level signal is honest, and a finer one
built on guesswork would be worse than none.

## Status

Working, both scripts. Regenerate the baseline with `--by day` and `--by branch`
after any significant stretch of work.

Two things about `budget.py` are unconfirmed rather than designed. The cycle reset
day is assumed to be the 1st (`--cycle-start` overrides it); the real date shows in
`/usage`, and every pace figure depends on it, so until it is confirmed read those
figures as directional. And `monthly_limit` is not a constant: it moved from 15000
to 50000 between two cache reads five days apart while `used_credits` kept
accumulating, consistent with the org raising the allocation mid-cycle. Don't cache
the limit anywhere else or hard-code it. Both are named as open in decision 25.
