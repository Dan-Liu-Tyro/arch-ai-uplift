#!/usr/bin/env bash
# Start/stop/restart the local Arc Lite UI server (server.py).
# Usage: ./arc.sh {start|stop|restart|status}

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUN_DIR="$SCRIPT_DIR/.run"
PID_FILE="$RUN_DIR/arc.pid"
LOG_FILE="$RUN_DIR/arc.log"
PORT=8765  # must match PORT in server.py

is_running() {
  [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null
}

start() {
  mkdir -p "$RUN_DIR"
  if is_running; then
    echo "Arc Lite UI already running (pid $(cat "$PID_FILE")) at http://127.0.0.1:$PORT"
    return 0
  fi
  nohup python3 "$SCRIPT_DIR/server.py" >>"$LOG_FILE" 2>&1 &
  echo $! >"$PID_FILE"
  sleep 1
  if is_running; then
    echo "Arc Lite UI started (pid $(cat "$PID_FILE")) at http://127.0.0.1:$PORT"
    echo "Logs: $LOG_FILE"
  else
    echo "Failed to start — check $LOG_FILE" >&2
    rm -f "$PID_FILE"
    exit 1
  fi
}

stop() {
  if ! is_running; then
    echo "Arc Lite UI is not running."
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
  echo "Arc Lite UI stopped."
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
