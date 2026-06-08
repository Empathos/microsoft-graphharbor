# Reproducibility Status

This document separates what is already reproducible from what is merely documented.

## Summary

The proof is fully documented as an operational record. It is partially reproducible today because the main Microsoft Graph calls, app shape, permissions, token path, and successful message response are captured. It is not yet fully reproducible from a clean checkout because several steps still require scripted tenant automation and an interactive Microsoft device-code approval.

## Reproducibility Matrix

| Step | Current State | Scriptable | Manual Part | Target Artifact |
| --- | --- | --- | --- | --- |
| Create bridge Entra app | Documented from proof | Yes | None if operator credential exists | `scripts/create-entra-app.ts` + `prompts/create-entra-app.prompt.md` |
| Configure delegated permissions | Documented from proof | Yes | Admin authority must exist | `scripts/create-entra-app.ts` |
| Grant admin consent | Documented from proof | Yes | Admin authority must exist | `scripts/create-entra-app.ts` |
| Start device-code login | Documented from proof | Yes | User enters code in browser | `scripts/device-code-login.ts` + prompt |
| Poll device-code token | Documented from proof | Yes | User approval timing | `scripts/device-code-login.ts` |
| Store token securely | Documented from proof | Yes | Secret-store choice | `scripts/device-code-login.ts` |
| Send proof message | Documented and scaffolded | Yes | None with valid token | `scripts/send-proof-message.ts` + prompt |
| Audit permissions | Documented conceptually | Yes | None with operator credential | `scripts/audit-permissions.ts` + prompt |
| Roll back temporary grants | Documented from proof | Yes | None with operator credential | `scripts/rollback-permissions.ts` + prompt |
| Read lane via RSC | Partially documented | Yes | Teams app reinstall/reconsent may be manual | `scripts/reconcile-rsc.ts` + prompt |
| Bridge loop | Scaffolded | Yes | OpenClaw integration decision | `src/bridgeLoop.ts` + prompt |

## Definition of Done for Reproducibility

A step is reproducible when:

1. The command/script exists.
2. The required inputs are listed.
3. The command does not print secrets.
4. The success output is deterministic enough to verify.
5. Failure modes are explicit.
6. Rollback exists for tenant mutations.
7. A paired prompt explains how an agent/operator should run it.

## Prompt Pairing Rule

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

## Current Gaps

The biggest remaining gap is the read lane. The send proof is solid. The read path needs a clean RSC reinstall/reconsent flow so GraphHarbor can read only where the Teams app is installed, without broad tenant-wide chat read.

The second gap is token refresh. The scaffold can load a token, but refresh logic is not implemented yet.

