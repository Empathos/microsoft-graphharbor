# graphharbor-poll-cron

## Goal

Run one scheduled GraphHarbor poll safely from cron, systemd, or another local scheduler.

## Inputs

- Built JavaScript output under `dist/`.
- Environment variables from the private deployment environment.
- `TOKEN_FILE` pointing to delegated token material outside the repository.
- `STATE_FILE` pointing to bridge state outside the repository.
- Optional `GRAPHHARBOR_LOG_DIR`, `GRAPHHARBOR_LOCK_FILE`, and `GRAPHHARBOR_POLL_TIMEOUT_SECONDS`.

## Preconditions

- `npm run build` has completed.
- The token file exists and contains refresh-capable delegated token material.
- The configured chat has approved read and send permissions.
- The interpreter command is configured if replies should be generated.

## Safety boundaries

- Do not print token values.
- Do not commit logs, token files, state files, or private `.env` files.
- Do not run overlapping pollers against the same chat and state file.
- Do not use broad tenant-wide read grants unless a private operational note explicitly approves them.

## Steps

1. Load the private environment.
2. Acquire the poll lock.
3. Run `node dist/index.js poll-once` with a bounded timeout.
4. Write start, finish, or skip status events to the configured local log.
5. Exit non-zero if the poll command fails.

## Expected output

The wrapper writes JSONL-style local log events. A successful run includes
`graphharbor-poll-start` and `graphharbor-poll-finish` with status `0`.

## Verification

- Confirm the log records a completed poll.
- Confirm the state file `lastPollAt` advanced.
- Confirm no duplicate replies were sent for already-seen messages.

## Rollback or cleanup

- Disable the scheduler entry.
- Remove or rotate local logs if they contain private identifiers.
- Keep token and state files protected unless deliberately resetting the bridge.

## What not to do

- Do not paste private chat IDs, tenant IDs, or token paths into public docs.
- Do not bypass the lock file for scheduled operation.
- Do not turn failures into silent success unless the poll was skipped because another poll is already running.
