# Reproducibility Status

This document separates what is already reproducible in the public scaffold from what still needs deterministic implementation.

## Summary

GraphHarbor is public-safe and partially reproducible today. The architecture,
setup flow, permission model, token refresh behavior, state-file deduplication,
single-pass bridge loop, cron-safe wrapper, and script/prompt convention are
documented. It is not yet fully reproducible from a clean checkout because
tenant automation, device-code token acquisition, RSC read-lane reconciliation,
and production service-manager packaging still need deterministic scripts.

## Reproducibility matrix

| Step | Current state | Scriptable | Manual part | Target artifact |
| --- | --- | --- | --- | --- |
| Create bridge Entra app | Documented | Yes | None if operator credential exists | `scripts/create-entra-app.ts` + prompt |
| Configure delegated permissions | Documented | Yes | Admin authority must exist | `scripts/create-entra-app.ts` |
| Grant admin consent | Documented | Yes | Admin authority must exist | `scripts/create-entra-app.ts` |
| Start device-code login | Documented | Yes | User enters code in browser | `scripts/device-code-login.ts` + prompt |
| Poll device-code token | Documented | Yes | User approval timing | `scripts/device-code-login.ts` |
| Store token securely | Scaffolded | Yes | Secret-store choice | `src/tokenStore.ts` |
| Refresh delegated token | Implemented | Yes | None with refresh token | `src/tokenStore.ts` |
| Send proof message | Scaffolded in Graph client | Yes | None with valid token | `src/graphClient.ts` + prompt |
| Audit permissions | Documented conceptually | Yes | None with operator credential | `scripts/audit-permissions.ts` + prompt |
| Roll back temporary grants | Documented conceptually | Yes | None with operator credential | `scripts/rollback-permissions.ts` + prompt |
| Read lane via RSC | Partially documented | Yes | Teams app reinstall/reconsent may be manual | `scripts/reconcile-rsc.ts` + prompt |
| Bridge loop | Implemented as one-pass poll | Yes | Runtime adapter command | `src/bridgeLoop.ts` + prompt |
| Interpreter adapter | Implemented as command boundary | Yes | Runtime-specific command | `src/interpreter.ts` + `scripts/openclaw-interpreter.mjs` |
| Scheduled polling wrapper | Implemented | Yes | Service manager install | `scripts/graphharbor-poll-cron.sh` + prompt |

## Definition of done for reproducibility

A step is reproducible when:

1. The command or script exists.
2. The required inputs are listed.
3. The command does not print secrets.
4. The success output is deterministic enough to verify.
5. Failure modes are explicit.
6. Rollback exists for tenant mutations.
7. A paired prompt explains how an agent or operator should run it.
8. The public-safe artifact can be rerun from a clean checkout.

## Prompt pairing rule

Every script under `scripts/` must have a same-name prompt under `prompts/`.

Example:

```text
scripts/send-proof-message.ts
prompts/send-proof-message.prompt.md
```

The prompt is not a README duplicate. It is the operational instruction packet an agent can use when asked to run or modify that script.

Each prompt should include:

- Goal
- Inputs
- Preconditions
- Safety boundaries
- Steps
- Expected output
- Verification
- Rollback or cleanup
- What not to do

## Current public commands

```bash
npm run build
npm run prime
npm run read-smoke
npm run poll-once
npm run cron-poll
```

`prime` and `poll-once` update the state file. `read-smoke` prints only
metadata. `cron-poll` wraps `poll-once` with a lock, timeout, and local log.

## Current gaps

The biggest remaining gap is the read lane. The send path is straightforward, but the read path needs a clean RSC reinstall/reconsent flow so GraphHarbor can read only approved Teams resources without broad tenant-wide chat read.

The second gap is setup automation. The scaffold can refresh existing token
material, but the public repo still needs deterministic device-code acquisition
and Entra app setup scripts.
