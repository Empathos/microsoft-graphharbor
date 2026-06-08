# Reproducibility Status

This document separates what is already reproducible in the public scaffold from what still needs deterministic implementation.

## Summary

GraphHarbor is public-safe and partially reproducible today. The architecture, setup flow, permission model, and script/prompt convention are documented. It is not yet fully reproducible from a clean checkout because tenant automation, token refresh, read-lane reconciliation, and live bridge-loop operation still need scripts.

## Reproducibility matrix

| Step | Current state | Scriptable | Manual part | Target artifact |
| --- | --- | --- | --- | --- |
| Create bridge Entra app | Documented | Yes | None if operator credential exists | `scripts/create-entra-app.ts` + prompt |
| Configure delegated permissions | Documented | Yes | Admin authority must exist | `scripts/create-entra-app.ts` |
| Grant admin consent | Documented | Yes | Admin authority must exist | `scripts/create-entra-app.ts` |
| Start device-code login | Documented | Yes | User enters code in browser | `scripts/device-code-login.ts` + prompt |
| Poll device-code token | Documented | Yes | User approval timing | `scripts/device-code-login.ts` |
| Store token securely | Documented | Yes | Secret-store choice | `scripts/device-code-login.ts` |
| Send proof message | Scaffolded | Yes | None with valid token | `scripts/send-proof-message.ts` + prompt |
| Audit permissions | Documented conceptually | Yes | None with operator credential | `scripts/audit-permissions.ts` + prompt |
| Roll back temporary grants | Documented conceptually | Yes | None with operator credential | `scripts/rollback-permissions.ts` + prompt |
| Read lane via RSC | Partially documented | Yes | Teams app reinstall/reconsent may be manual | `scripts/reconcile-rsc.ts` + prompt |
| Bridge loop | Scaffolded | Yes | Runtime adapter decision | `src/bridgeLoop.ts` + prompt |

## Definition of done for reproducibility

A step is reproducible when:

1. The command or script exists.
2. The required inputs are listed.
3. The command does not print secrets.
4. The success output is deterministic enough to verify.
5. Failure modes are explicit.
6. Rollback exists for tenant mutations.
7. A paired prompt explains how an agent or operator should run it.

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

## Current gaps

The biggest remaining gap is the read lane. The send path is straightforward, but the read path needs a clean RSC reinstall/reconsent flow so GraphHarbor can read only approved Teams resources without broad tenant-wide chat read.

The second gap is token refresh. The scaffold can load token material, but refresh logic is not implemented yet.
