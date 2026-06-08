# Roadmap

## Phase 0: Proof Captured

Done.

- Graph bridge Entra app created.
- Delegated device-code login completed.
- Refresh token stored locally.
- Message posted to Teams through Graph.
- No public bot endpoint involved.
- Process written into this local repo.

## Phase 1: Local CLI

Build a simple CLI that can:

- Load config from env.
- Refresh the delegated token.
- Send a message to a configured chat.
- List recent messages from a configured chat once read permissions are finalized.
- Persist last-seen message ID in a non-secret state file.

## Phase 2: Bridge Loop

Build a local daemon that:

- Polls Graph.
- Filters/deduplicates messages.
- Routes inbound messages into an OpenClaw session.
- Posts the assistant reply through Graph.
- Logs structured events.
- Exposes local health status only on localhost.

## Phase 3: OpenClaw Integration

Integrate as either:

- a dedicated OpenClaw channel adapter, or
- a sidecar bridge that talks to OpenClaw's existing session APIs.

Preferred first implementation is a sidecar. It is easier to reason about and safer to replace.

## Phase 4: Production Hardening

- Secret store integration.
- RSC reinstall/reconsent automation.
- Permission auditor.
- Tenant rollback script.
- Throttling/backoff.
- Systemd user service or OpenClaw-managed process.
- Health checks and alerting.

