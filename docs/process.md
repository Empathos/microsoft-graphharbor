# Process Guide: Microsoft Graph Teams Chat Bridge

This document describes the generalized GraphHarbor process for building an endpoint-free Teams agent bridge. It intentionally omits tenant-specific IDs, real chat IDs, proof transcripts, local paths, and credential-store details.

## Initial problem

The conventional Teams bot route depends on Bot Framework delivering inbound activities to an endpoint like:

```text
/api/messages
```

When the agent runtime is local or private, that usually requires an externally reachable HTTPS ingress such as a dev tunnel or hosted webhook. GraphHarbor uses a different durable shape:

```text
Teams UI <-> Microsoft Graph <-> GraphHarbor <-> private agent runtime
```

## Discovery phase

A useful proof should establish four facts:

- The Teams app or chat relationship can be discovered through Microsoft Graph or Teams tooling.
- Chat message reading is possible only with an explicitly approved read lane.
- Normal chat message sending works through delegated Microsoft Graph auth.
- No public `/api/messages` endpoint or long-lived dev tunnel is needed for the Graph-first path.

## Read path

Use the narrowest viable read permission. The preferred design is Teams Resource-Specific Consent or where-installed access, so the bridge reads only chats where the app is installed or specifically approved.

Useful probe:

```http
GET /v1.0/chats/{chat-id}/messages
```

Public documentation and examples should use placeholders:

```text
YOUR_TEAMS_APP_ID
YOUR_CHAT_ID
```

Avoid broad tenant-wide chat read in production unless a bounded, documented operational need is approved.

## Resource-Specific Consent

Teams app manifests and installed app records can drift during development. After changing RSC declarations, reinstall or reconsent the app in the target resource before treating the permission as live.

The production checklist should verify:

- Required RSC permission is declared.
- The app is installed in the target chat or team.
- The installed app permission grant is effective.
- A live read probe succeeds without broad tenant-wide read grants.

## Send path

Normal Teams chat posting through Microsoft Graph uses delegated authorization.

Endpoint:

```http
POST /v1.0/chats/{chat-id}/messages
```

Body:

```json
{
  "body": {
    "contentType": "text",
    "content": "GraphHarbor proof message."
  }
}
```

Use an application you control for delegated Graph scopes. Do not depend on a Microsoft-owned CLI client being preauthorized for arbitrary scopes.

Minimum send proof scopes:

```text
ChatMessage.Send
User.Read
offline_access
```

## Bridge app creation

Create an Entra application for the bridge:

```text
displayName: YOUR_BRIDGE_APP_NAME
clientId: YOUR_CLIENT_ID
tenantId: YOUR_TENANT_ID
```

Configure it as a public client if using device-code login. Grant the minimum delegated scopes needed for the send lane.

## Device-code login

Device-code login is useful when the bridge needs delegated Graph authorization and an operator can approve the login in a browser.

Flow:

1. Request a device code from the Microsoft identity platform.
2. Show the verification URL and short-lived user code.
3. Poll until the user approves, denies, or the code expires.
4. Store token material outside the repository.
5. Print only non-secret metadata.

## Successful proof criteria

A proof is complete when:

- Graph returns `201 Created` for a chat message send.
- The message appears in the target Teams chat.
- The bridge records the returned message ID for follow-up verification.
- No public bot webhook or tunnel is involved.
- Token values are never printed or committed.
- Any temporary broad grants are removed and verified.

## Production requirements

Before using GraphHarbor as a durable service:

1. Reconcile and verify the narrow read lane.
2. Implement token refresh with secure local storage.
3. Poll or subscribe to the target chat through approved permissions.
4. Deduplicate by chat ID and message ID.
5. Ignore self-authored messages unless configured otherwise.
6. Route inbound text into the chosen agent adapter.
7. Send replies through Graph.
8. Persist bridge state separately from token material.
9. Add health checks and structured logs.
10. Keep rollback scripts for tenant permission changes.

## Current bridge loop

The current scaffold includes a single-pass loop rather than a resident daemon.
That is intentional for the public baseline: one pass is easier to audit,
schedule, retry, and roll back.

The loop currently:

- Loads configuration from environment variables.
- Loads or refreshes delegated token material from a token file outside the repo.
- Reads recent chat messages through Microsoft Graph.
- Tracks seen message IDs in a separate state file.
- Ignores empty messages and replies that already start with the configured reply prefix.
- Sends new message context to an operator-configured interpreter command over stdin.
- Posts any non-empty interpreter stdout back to the same chat through Graph.
- Adds the sent reply ID to state when Graph returns one.

The cron wrapper adds:

- A non-blocking file lock to prevent overlapping polls.
- A bounded timeout for each poll attempt.
- Start, finish, and skip events in a local log directory.

This keeps the first durable operating mode close to the transport facts:
poll, deduplicate, interpret, send, persist.
