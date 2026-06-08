# Security Notes

## Security goal

Avoid exposing a private agent runtime through a public inbound Teams bot endpoint. GraphHarbor uses Microsoft Graph as the already-public API boundary and keeps the agent runtime behind outbound-only calls.

## Credential rules

- Never commit refresh tokens.
- Never commit Microsoft client secrets.
- Never print tokens in logs.
- Store token material outside the repository.
- Keep state files separate from token material.
- Redact Graph error payloads before sharing if they contain tenant, user, app, or chat details.

## Permission rules

Use the least permission that matches the lane:

- Sending normal Teams chat messages: delegated `ChatMessage.Send`.
- Reading chat messages: prefer RSC or where-installed app permissions.
- Avoid broad `Chat.Read.All` or `ChatMessage.Read.All` for production.

Temporary broad grants are acceptable only for bounded proof work when:

1. The purpose is explicit.
2. The exact grant is recorded privately.
3. The grant is removed immediately after the proof.
4. Removal is verified.

## Endpoint rules

This project is specifically for the no-public-endpoint path.

Non-goals:

- Long-lived dev tunnel.
- Public `/api/messages` exposure.
- Broad Teams message ingestion across a tenant.
- Unreviewed posting outside explicitly configured bridge contexts.

## Operational guardrails

The bridge loop must:

- Deduplicate message IDs before responding.
- Avoid responding to its own messages unless explicitly configured.
- Preserve raw Graph payloads only if needed, and only in a protected local store.
- Log IDs and statuses rather than message bodies by default.
- Fail closed if token refresh fails.
- Back off on Graph throttling.
- Keep a manual kill switch.
