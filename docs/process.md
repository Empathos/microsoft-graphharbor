# Process Record: Microsoft Graph Teams Chat Proof

Date: 2026-06-08

Outcome: Alice successfully replied into a Microsoft Teams chat through Microsoft Graph without exposing a public Bot Framework endpoint.

## Initial Problem

The existing Teams bot route depended on Bot Framework delivering inbound activities to an endpoint like:

```text
/api/messages
```

When running locally, that requires an externally reachable HTTPS ingress such as a dev tunnel. The concern was not whether a tunnel could work; it could. The concern was whether Alice could use Teams as a chat UI without permanently exposing an inbound endpoint.

The target durable design became:

```text
Teams UI <-> Microsoft Graph <-> Alice/OpenClaw
```

instead of:

```text
Teams UI -> Bot Framework -> public /api/messages endpoint -> Alice/OpenClaw
```

## Discovery Phase

We first confirmed that the existing Teams/Bot Framework path was alive but not ideal:

- OpenClaw had an `msteams` channel configured.
- The local `/api/messages` listener existed.
- A public-ish Tailscale/Burrow endpoint returned `401 Unauthorized`, which proved the endpoint was reachable.
- Delivery still depended on Teams/Bot Framework sending activities to that endpoint.

We then investigated Graph as the alternate control plane.

Important distinction found:

- Graph could discover the installed Teams app/chat relationship.
- Graph could not read chat message bodies with the current delegated token.
- App-only broad read permissions worked temporarily, but were too broad for the durable design.

## Read Path Findings

The Teams app/bot app ID was:

```text
2e61f715-19c0-48b3-9fd1-c835c3fc151f
```

Graph could resolve the bot chat object for the installed Teams app. The target chat ID was:

```text
19:f225fc6e-b30f-4ad7-9728-812ecbde60b6_2e61f715-19c0-48b3-9fd1-c835c3fc151f@unq.gbl.spaces
```

Attempts to read messages through:

```http
GET /v1.0/chats/{chat-id}/messages
GET /beta/chats/{chat-id}/messages
```

returned permission failures until broader Graph permission was temporarily added.

Temporary broad grants were used only to prove the path and were then removed:

- Bot app: `Chat.Read.All`
- Operator app: `TeamsAppInstallation.ReadWriteAndConsentForChat.All`

With the temporary grant, Graph read the latest relevant chat content:

```text
Alice is awesome.
```

Sender: Mitchell Rogers

Timestamp: `2026-06-08T17:43:32Z`

After the proof, the broad grants were removed. The desired durable read path remains RSC/app-scoped access where installed.

## RSC Findings

The Teams app manifest/catalog was updated toward RSC-style chat message access.

The app was granted:

```text
ChatMessage.Read.Chat
```

as an application RSC permission through Teams tooling.

The CLI reported:

```text
needsReinstall: true
```

That matters. The app catalog or installed copy can be stale after manifest/RSC changes. The Teams app must be reinstalled or reconsented in the target chat before newly declared RSC permissions are effective.

Important final read-lane state:

- The broad read grants were removed.
- The intended durable read lane is narrow RSC, not tenant-wide message read.
- Reinstall/reconsent remains part of the production checklist.

## Send Path Findings

Normal Teams chat posting through Microsoft Graph is not the same permission model as app-only reading.

Graph send endpoint:

```http
POST /v1.0/chats/{chat-id}/messages
```

Body:

```json
{
  "body": {
    "contentType": "text",
    "content": "Replying from Alice through Microsoft Graph. No public bot endpoint involved."
  }
}
```

The Teams CLI refresh token was not enough. Requesting Graph delegated scopes from the Microsoft-owned Teams CLI client failed with a Microsoft preauthorization constraint. Tenant admin consent cannot make Microsoft's Teams CLI app request arbitrary scopes it is not preauthorized for.

Conclusion:

```text
Do not try to fix the Teams CLI client. Create our own Entra app for the Graph bridge.
```

## Bridge App Creation

Created Entra app:

```text
Alice Teams Graph Bridge
```

App/client ID:

```text
354a638e-982f-4c98-bfee-df6066a945ad
```

Application object ID:

```text
6f7901d2-9cb5-4732-8fae-8ff1316f85ee
```

Service principal object ID:

```text
5951e57b-133e-4c19-bc2f-2d32f5b4a4bd
```

Configured as a public client suitable for device-code login.

Delegated scopes:

```text
ChatMessage.Send
User.Read
```

Admin consent was created for the tenant.

## Device Code Login

A fresh device-code flow was started for the bridge app.

Mitchell opened:

```text
https://login.microsoft.com/device
```

and entered the short-lived code shown by the flow.

The first code expired before approval. A second code was approved successfully as:

```text
mitchell@empathos.ai
```

The resulting refresh token was stored locally at:

```text
/home/alice/.openclaw/credentials/teams-graph-bridge-token.json
```

The stored token file is credential material and must never be committed.

Observed non-secret token metadata:

```text
tenantId: f37cc18c-218a-4d7e-ae6d-e8e7e376e50e
clientId: 354a638e-982f-4c98-bfee-df6066a945ad
scopes: ChatMessage.Send User.Read profile openid email
```

## Successful Graph Reply

Using the delegated bridge token, Alice posted:

```text
Replying from Alice through Microsoft Graph. No public bot endpoint involved.
```

Graph response:

```text
HTTP status: 201 Created
Teams message ID: 1780947260890
Created: 2026-06-08T19:34:20.89Z
```

Mitchell confirmed from Teams:

```text
It Worked!
```

## Final Decision

The proof validates the durable architecture:

- Teams remains the front-end chat surface.
- Microsoft Graph is the remote API boundary.
- Alice/OpenClaw does not need to expose a public inbound bot endpoint for this path.
- Sending works through delegated Graph auth.
- Reading should be narrowed through RSC/where-installed permissions instead of broad tenant-wide chat read.

## Production Requirements

Before this becomes a durable service:

1. Reinstall/reconsent the Teams app so RSC grants are effective.
2. Implement token refresh with secure local storage.
3. Poll the target chat through the narrowest viable read permission.
4. Deduplicate messages by chat ID and message ID.
5. Ignore messages authored by the bridge user when appropriate.
6. Route inbound message text into OpenClaw session handling.
7. Send replies through Graph.
8. Persist bridge state separately from credentials.
9. Add health checks and structured logs.
10. Keep a clean rollback path for all tenant permission changes.

