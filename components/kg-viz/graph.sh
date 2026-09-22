#!/usr/bin/env bash
# Start/stop/restart the local kg-viz graph server (serve.py).
# Usage: ./graph.sh {start|stop|restart|status}
#
# serve.py regenerates graph.json from kg-content on every startup, so
# `restart` is also how you pick up entity changes without editing anything
# by hand. Deliberately mirrors components/local-agent/ui/arc-lite.sh rather
# than inventing a second pattern for local UIs in this repo.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUN_DIR="$SCRIPT_DIR/.run"
PID_FILE="$RUN_DIR/kg-viz.pid"
LOG_FILE="$RUN_DIR/kg-viz.log"
PORT=8766  # must match PORT in serve.py

is_running() {
  [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null
}

start() {
  mkdir -p "$RUN_DIR"
  if is_running; then
    echo "kg-viz already running (pid $(cat "$PID_FILE")) at http://127.0.0.1:$PORT"
    return 0
  fi
  # The log is append-only across runs, so note where this attempt starts and
  # only ever read forward from there. Reading the whole file instead is how
  # the previous version went wrong twice: `grep -m1` reported the *oldest*
  # run's counts as if they were current, and a failure sent you to a file
  # whose most obvious traceback belonged to some earlier run.
  : >>"$LOG_FILE"
  local offset
  offset=$(($(wc -c <"$LOG_FILE")))

  nohup python3 "$SCRIPT_DIR/serve.py" >>"$LOG_FILE" 2>&1 &
  echo $! >"$PID_FILE"
  sleep 1
  if is_running; then
    echo "kg-viz started (pid $(cat "$PID_FILE")) at http://127.0.0.1:$PORT"
    # serve.py prints the regenerated per-view counts on startup; surface them
    # so a start doubles as confirmation the data is current.
    tail -c "+$((offset + 1))" "$LOG_FILE" | grep -m1 "regenerated graph.json" || true
    echo "Logs: $LOG_FILE"
  else
    echo "Failed to start. Error from this attempt:" >&2
    tail -c "+$((offset + 1))" "$LOG_FILE" | tail -20 | sed 's/^/  /' >&2
    echo "(full log, including earlier runs: $LOG_FILE)" >&2
    rm -f "$PID_FILE"
    exit 1
  fi
}

stop() {
  if ! is_running; then
    echo "kg-viz is not running."
    rm -f "$PID_FILE"
    return 0
  fi
  local pid
  pid="$(cat "$PID_FILE")"
  kill "$pid"
  for _ in $(seq 1 10); do
    kill -0 "$pid" 2>/dev/null || break
    sleep 0.5
  done
  if kill -0 "$pid" 2>/dev/null; then
    echo "Process $pid still alive, force killing." >&2
    kill -9 "$pid"
  fi
  rm -f "$PID_FILE"
  echo "kg-viz stopped."
}

status() {
  if is_running; then
    echo "Running (pid $(cat "$PID_FILE")) at http://127.0.0.1:$PORT"
  else
    echo "Not running."
  fi
}

case "${1:-}" in
  start) start ;;
  stop) stop ;;
  restart) stop; start ;;
  status) status ;;
  *)
    echo "Usage: $0 {start|stop|restart|status}" >&2
    exit 1
    ;;
esac
