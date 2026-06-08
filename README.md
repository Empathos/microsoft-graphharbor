# Microsoft GraphHarbor

Microsoft GraphHarbor is an endpoint-free bridge pattern for Microsoft Teams agent messaging over Microsoft Graph.

The goal is simple: keep Teams as the human chat surface while routing agent read/send work through Microsoft Graph, without exposing a public Bot Framework `/api/messages` endpoint for the durable path.

## Why it exists

Conventional Teams bots require an externally reachable HTTPS endpoint so Bot Framework can deliver activity payloads. That is the right architecture for many public bots, but it is a poor default for local or private agent runtimes that should stay behind outbound-only network boundaries.

GraphHarbor treats Microsoft Graph as the public API boundary. The agent runtime polls or receives authorized Graph state, routes eligible messages into an agent adapter, and sends replies through Graph.

## Core idea

```text
Teams chat UI
      |
      v
Microsoft Graph
      |
      v
GraphHarbor bridge
      |
      v
Local or private agent runtime
```

The bridge separates two permission lanes:

- Read lane: prefer Teams Resource-Specific Consent or where-installed access so the app reads only approved chats.
- Send lane: use delegated Microsoft Graph authorization for normal chat posting on behalf of an approved signed-in user.

## What GraphHarbor manages

- Microsoft Graph configuration for Teams chat read/send workflows.
- Device-code delegated login for endpoint-free message sending.
- Token loading and future refresh handling.
- Chat polling, message deduplication, and reply posting.
- Script/prompt pairs for repeatable agent-operated setup and audits.
- Public-safe documentation for separating reusable code from private deployment details.

## Design principles

- No long-lived public bot endpoint for the durable path.
- Least-privilege read access, scoped to installed or explicitly approved Teams resources.
- Delegated send access for normal Teams chat messages.
- Prompt-native operations: each operational script gets a paired prompt file.
- Redaction-safe logs by default.
- Public upstream, private operational downstream.

## Repository layout

```text
.
├── README.md
├── docs/
│   ├── process.md
│   ├── publication-model.md
│   ├── reproducibility.md
│   ├── roadmap.md
│   ├── security.md
│   └── setup.md
├── prompts/
├── scripts/
├── src/
├── .env.example
├── package.json
└── tsconfig.json
```

## Current status

GraphHarbor is an early public scaffold. The architecture and operator prompts are documented, and the TypeScript scaffold can compile.

Run the public-safe checks:

```bash
npm install
npm run check
python3 path/to/audit_public_repo.py .
```

The read lane still needs a finished Resource-Specific Consent reconciliation flow. Token refresh is also scaffolded but not implemented.

## Public/private model

Use this repository as the generic upstream. Keep environment-specific setup, live IDs, proof records, private logs, and credential-store references in a private downstream repository or private branch.

```text
public microsoft-graphharbor      generic framework, docs, scripts, prompts
private downstream deployment     tenant values, app IDs, chat IDs, local state
```

This keeps the public framework reusable while preserving operational privacy.

## References

- Microsoft Graph send chatMessage: https://learn.microsoft.com/en-us/graph/api/chatmessage-post
- Microsoft Graph permissions reference: https://learn.microsoft.com/en-us/graph/permissions-reference
- Teams Resource-Specific Consent: https://learn.microsoft.com/en-us/microsoftteams/platform/graph-api/rsc/resource-specific-consent
- Teams bots and agents message access: https://learn.microsoft.com/en-us/microsoftteams/platform/bots/how-to/conversations/channel-messages-for-bots-and-agents
