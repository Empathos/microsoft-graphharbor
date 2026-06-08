# Roadmap

## Phase 0: Public scaffold

Current state:

- Endpoint-free Teams/Graph bridge architecture documented.
- Public/private repository model documented.
- Prompt pairing convention established.
- TypeScript scaffold compiles.
- Public safety audit passes.

## Phase 1: Local CLI

Build a simple CLI that can:

- Load config from environment variables.
- Refresh the delegated token.
- Send a message to a configured chat.
- List recent messages from a configured chat once read permissions are finalized.
- Persist last-seen message ID in a non-secret state file.
- Pair every operational script with a prompt file in `prompts/`.

## Phase 2: Bridge loop

Build a local daemon that:

- Polls Graph.
- Filters and deduplicates messages.
- Routes inbound messages into a configured agent adapter.
- Posts the agent reply through Graph.
- Logs structured events.
- Exposes local health status only on localhost.

## Phase 3: Runtime integration

Integrate as either:

- a dedicated channel adapter, or
- a sidecar bridge that talks to an existing agent runtime API.

Preferred first implementation is a sidecar. It is easier to reason about and safer to replace.

## Phase 4: Production hardening

- Secret-store integration.
- RSC reinstall/reconsent automation.
- Permission auditor.
- Tenant rollback script.
- Throttling and backoff.
- Service manager configuration.
- Health checks and alerting.

## Phase 5: Prompt-native operations

- Treat prompts as maintained operational artifacts, not ad hoc chat text.
- Add prompt files for setup, auth, audit, send proof, bridge loop, and rollback.
- Keep prompt files redaction-safe and specific enough for future agents to run without reconstructing private context.
- Add CI checks that fail when a script lacks a paired prompt.
