#!/usr/bin/env bash
set -euo pipefail

repo_dir="/home/alice/.openclaw/workspace/projects/alice-teams-graph-bridge"
cd "$repo_dir"

if [[ -f .env.private ]]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env.private
  set +a
fi

log_dir="${GRAPHHARBOR_LOG_DIR:-$repo_dir/logs/graphharbor}"
mkdir -p "$log_dir"

{
  printf '{"startedAt":"%s","event":"graphharbor-poll-start"}\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  node dist/index.js poll-once
  printf '{"finishedAt":"%s","event":"graphharbor-poll-finish"}\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
} >> "$log_dir/cron.log" 2>&1
