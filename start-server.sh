#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

cleanup() {
  echo "Stopping local backend/frontend..."
  [[ -n "${API_PID:-}" ]] && kill "$API_PID" 2>/dev/null || true
  [[ -n "${WEB_PID:-}" ]] && kill "$WEB_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM


echo "Starting backend on http://localhost:8080 ..."
uv run python -m api.main &
API_PID=$!

echo "Starting frontend on http://localhost:5173 ..."
(
  cd webui
  npm run dev -- --host 0.0.0.0
) &
WEB_PID=$!

echo "All services started."
echo "Frontend:   http://localhost:5173"
echo "Backend:    http://localhost:8080"
echo "Press Ctrl+C to stop backend/frontend. Docker services remain running."

wait -n "$API_PID" "$WEB_PID"
