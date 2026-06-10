# Roadmap

## Phase 0: Public scaffold

Current state:

- Endpoint-free Teams/Graph bridge architecture documented.
- Public/private repository model documented.
- Prompt pairing convention established.
- TypeScript scaffold compiles.
- Refresh-capable token loader exists.
- State-file message deduplication exists.
- One-pass poll loop exists.
- Generic interpreter command boundary exists.
- Cron-safe wrapper exists for scheduled polling.
- Public safety audit passes.

## Phase 1: Local CLI

Build out the simple CLI. Current pieces can:

- Load config from environment variables.
- Refresh the delegated token.
- Send a message to a configured chat through the bridge loop.
- List recent messages from a configured chat once read permissions are finalized.
- Persist last-seen message ID in a non-secret state file.

Still needed:

- Device-code token acquisition script.
- Direct send-proof command.
- Pair every future operational script with a prompt file in `prompts/`.

## Phase 2: Bridge loop

Harden the one-pass bridge loop into a durable service shape:

- Polls Graph.
- Filters and deduplicates messages.
- Routes inbound messages into a configured agent adapter.
- Posts the agent reply through Graph.
- Logs structured events.
- Exposes local health status only on localhost.
- Provides a service-manager unit example in the private downstream.

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
- Service manager configuration in the private downstream.
- Health checks and alerting.

## Phase 5: Prompt-native operations

- Treat prompts as maintained operational artifacts, not ad hoc chat text.
- Add prompt files for setup, auth, audit, send proof, bridge loop, and rollback.
- Keep prompt files redaction-safe and specific enough for future agents to run without reconstructing private context.
- Add CI checks that fail when a script lacks a paired prompt.
