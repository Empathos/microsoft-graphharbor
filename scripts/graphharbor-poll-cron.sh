#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
repo_dir="${GRAPHHARBOR_REPO_DIR:-$(cd -- "$script_dir/.." && pwd)}"
cd "$repo_dir"

if [[ -f .env.private ]]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env.private
  set +a
fi

log_dir="${GRAPHHARBOR_LOG_DIR:-$repo_dir/logs/graphharbor}"
mkdir -p "$log_dir"
lock_file="${GRAPHHARBOR_LOCK_FILE:-$log_dir/poll.lock}"
timeout_seconds="${GRAPHHARBOR_POLL_TIMEOUT_SECONDS:-45}"

{
  if ! flock -n 9; then
    printf '{"skippedAt":"%s","event":"graphharbor-poll-skip","reason":"poll-already-running"}\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    exit 0
  fi

  printf '{"startedAt":"%s","event":"graphharbor-poll-start"}\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  set +e
  timeout "${timeout_seconds}s" node dist/index.js poll-once
  status=$?
  set -e
  printf '{"finishedAt":"%s","event":"graphharbor-poll-finish","status":%s}\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$status"
  exit "$status"
} 9>"$lock_file" >> "$log_dir/cron.log" 2>&1
