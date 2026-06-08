# Security Notes

## Security Goal

Avoid exposing Alice/OpenClaw through a public inbound Teams bot endpoint.

The bridge should use Microsoft Graph as the already-public, Microsoft-controlled API boundary and keep Alice's local runtime behind outbound-only calls.

## Credential Rules

- Never commit refresh tokens.
- Never commit Microsoft client secrets.
- Never print tokens in logs.
- Store token material under a local credentials directory or secret manager.
- Keep state files separate from credential files.
- Redact Graph error payloads before sharing if they contain tenant or user details beyond ordinary IDs.

## Permission Rules

Use the least permission that matches the lane:

- Sending normal Teams chat messages: delegated `ChatMessage.Send`.
- Reading chat messages: prefer RSC or where-installed app permissions.
- Avoid broad `Chat.Read.All` / `ChatMessage.Read.All` for production.

Temporary broad grants are acceptable only for bounded proof work when:

1. The purpose is explicit.
2. The exact grant is recorded.
3. The grant is removed immediately after the proof.
4. Removal is verified.

## Endpoint Rules

This project is specifically for the no-public-endpoint path.

Non-goals:

- Long-lived dev tunnel.
- Public `/api/messages` exposure.
- Broad Teams message ingestion across the tenant.
- Acting as Mitchell's voice outside the explicit bridge context.

## Operational Guardrails

The bridge loop must:

- Deduplicate message IDs before responding.
- Avoid responding to its own messages unless explicitly configured.
- Preserve raw Graph payloads only if needed, and only in a protected local store.
- Log IDs and statuses rather than message bodies by default.
- Fail closed if token refresh fails.
- Back off on Graph throttling.
- Keep a manual kill switch.

