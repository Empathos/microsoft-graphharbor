# Alice Teams Graph Bridge

Endpoint-free Microsoft Teams chat bridge using Microsoft Graph.

This project captures the proof completed on 2026-06-08: Alice posted into a Teams one-on-one bot chat through Microsoft Graph with no public `/api/messages` bot endpoint involved.

Verified proof message:

> Replying from Alice through Microsoft Graph. No public bot endpoint involved.

## Why This Exists

The normal Teams bot path requires a public HTTPS endpoint so Bot Framework can deliver activity payloads to `/api/messages`. That is useful for conventional bots, but it creates an inbound surface. For Alice/OpenClaw, the preferred shape is:

1. Teams remains the human chat UI.
2. Alice reads relevant chat state through Microsoft Graph.
3. Alice replies through Microsoft Graph.
4. No public bot webhook or dev tunnel is required for the durable path.

## Current Proof State

Tenant/app facts from the working proof:

- Tenant ID: `f37cc18c-218a-4d7e-ae6d-e8e7e376e50e`
- Teams app/bot app ID: `2e61f715-19c0-48b3-9fd1-c835c3fc151f`
- Graph bridge app ID: `354a638e-982f-4c98-bfee-df6066a945ad`
- Target chat ID: `19:f225fc6e-b30f-4ad7-9728-812ecbde60b6_2e61f715-19c0-48b3-9fd1-c835c3fc151f@unq.gbl.spaces`
- Local token file: `/home/alice/.openclaw/credentials/teams-graph-bridge-token.json`
- Token scopes observed locally: `ChatMessage.Send User.Read profile openid email`
- Successful send status: `201 Created`
- Successful Teams message ID: `1780947260890`
- Successful created time: `2026-06-08T19:34:20.89Z`

Do not commit the token file or any Microsoft client secrets.

## Architecture

The bridge is split into two lanes:

- **Read lane:** Prefer Teams Resource-Specific Consent (RSC) or installed-app scoped Graph permissions, so Alice can read only chats where the Teams app is installed.
- **Send lane:** Use delegated Microsoft Graph auth with `ChatMessage.Send`, because normal chat posting is performed on behalf of a signed-in user.

Microsoft currently documents `ChatMessage.Send` as a delegated permission that lets an app send one-on-one or group chat messages on behalf of the signed-in user. Microsoft also documents Teams RSC as a way to grant app access to a specific resource instance instead of the whole tenant.

## Repository Contents

- `docs/process.md` records the careful proof procedure and decision log.
- `docs/setup.md` describes how to recreate the Entra app and device-code login.
- `docs/security.md` records guardrails and non-goals.
- `docs/roadmap.md` turns the proof into a GitHub-ready implementation plan.
- `src/` contains a minimal TypeScript scaffold for token loading, Graph calls, polling, and replies.

## Local Development

```bash
npm install
npm run check
```

The scaffold is intentionally not wired to production OpenClaw yet. It is the starting point for a GitHub project, not the final bridge daemon.

## References

- Microsoft Graph send chatMessage: https://learn.microsoft.com/en-us/graph/api/chatmessage-post
- Microsoft Graph permissions reference: https://learn.microsoft.com/en-us/graph/permissions-reference
- Teams Resource-Specific Consent: https://learn.microsoft.com/en-us/microsoftteams/platform/graph-api/rsc/resource-specific-consent
- Teams bots/agents RSC message access: https://learn.microsoft.com/en-us/microsoftteams/platform/bots/how-to/conversations/channel-messages-for-bots-and-agents

