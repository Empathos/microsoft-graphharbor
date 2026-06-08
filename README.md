**Use your agents with Microsoft Teams and Microsoft 365 natively and securely
with Microsoft Graph APIs.**

# Microsoft GraphHarbor

Microsoft GraphHarbor is an early-stage framework that lets Hermes, OpenClaw,
and other agent runtimes interact with Microsoft Teams and Microsoft 365 through
Microsoft Graph without exposing an external bot endpoint.

The goal is simple: keep Teams lightweight for humans while giving agent systems
a versioned, inspectable communication surface that does not require a public
Bot Framework webhook, ngrok tunnel, Microsoft Dev Tunnel, or other inbound
public ingress.

GraphHarbor starts with Microsoft Teams chat and Microsoft Graph, but the larger
direction is a reusable pattern for agent communication surfaces that can run
behind outbound-only boundaries. It turns Teams into a human-facing chat UI while
Graph becomes the API-backed control surface for reading approved context,
sending replies, preserving proof logs, and keeping private runtimes off the
public internet.

## Why it exists

**Do not expose Hermes, OpenClaw, PiAgent, bot frameworks, or private agent
runtimes to untrusted internet endpoints just to make Teams messaging work.
GraphHarbor uses native Microsoft Graph APIs instead: polling can run on a
schedule, run frequently, and evolve toward event-triggered communication while
keeping the private runtime behind outbound-only boundaries.**

Microsoft Teams is good at human communication. Microsoft Graph is good at
structured identity, permissions, chat APIs, auditability, and tenant-governed
access. Private agent runtimes need both.

The conventional Teams bot route asks the agent operator to expose an HTTPS
endpoint so Bot Framework can deliver activities to `/api/messages`. That is the
right architecture for many public bots, but it is a poor default for private
agent systems that should stay behind outbound-only network boundaries.

GraphHarbor treats Teams as the human-facing communication surface and Microsoft
Graph as the durable technical substrate. Agents then reconcile the chat surface
through explicit permissions, Graph reads, delegated sends, message identifiers,
state files, and redaction-safe proof logs.

The deeper need is agent communication without fragile ingress. Ngrok tunnels,
Microsoft Dev Tunnels, public webhooks, and browser-use fallbacks are useful
during exploration, but durable agent messaging needs authoritative APIs,
repeatable authorization, auditable state, and narrow permission boundaries.
Graph makes that possible.

GraphHarbor is intentionally API-first. It is not a desktop automation layer,
and it is not a browser-use agent that clicks through Teams. Browser and
computer control remain useful fallbacks for interfaces that do not expose enough
structure, but Teams messaging should use tenant-governed Graph APIs whenever
possible.

## Core idea

```text
Teams chat UI
        |
        | Microsoft Graph chat APIs
        v
GraphHarbor bridge
        |
        | local adapter / runtime API
        v
Private agent runtime
        |
        v
Graph reply through delegated send
```

The bridge does not depend on one agent runtime. Local scripts, sidecars, CI
jobs, and hosted agent systems can all participate as long as they follow the
same configuration, permission, state, and verification rules.

GraphHarbor combines deterministic and probabilistic workflows. The deterministic
side owns configuration, token handling, message IDs, deduplication, mutation
gates, permission audits, and proof logs. The probabilistic side interprets chat
context, chooses replies, summarizes state, and coordinates with humans. The
agent can reason about the conversation, but the bridge verifies the transport.

## What GraphHarbor manages

- Microsoft Graph configuration for Teams chat read and send workflows.
- A delegated send lane for normal Teams chat messages.
- A narrow read lane using Resource-Specific Consent or where-installed access.
- Device-code authorization for human-approved delegated tokens.
- Token loading and refresh posture for local or private deployments.
- Chat polling through approved Graph permissions.
- Message deduplication by chat ID and message ID.
- Reply posting through Graph instead of public bot ingress.
- State files kept separate from credential material.
- Permission audits for broad, stale, or missing grants.
- Rollback prompts for temporary tenant mutations.
- Script/prompt pairs for repeatable agent-operated workflows.
- Redaction-safe documentation for public/private repository separation.

## Design principles

- Humans keep the familiar Teams chat surface.
- Microsoft Graph keeps the durable API substrate.
- Agents read only approved resources.
- Delegated send is explicit and auditable.
- No long-lived public bot endpoint is required for the durable path.
- APIs are the authority; UI automation is a fallback.
- Every message mutation is narrow, logged, and read back.
- Probabilistic judgment proposes; deterministic checks verify.
- Message identifiers matter more than message text.
- No-op runs stay quiet.
- Configuration is explicit and branchable.
- Public repos stay generalized; private forks hold deployment reality.

## Repository layout

```text
.
├── AGENTS.md
├── README.md
├── docs/
│   ├── process.md
│   ├── publication-model.md
│   ├── reproducibility.md
│   ├── roadmap.md
│   ├── security.md
│   └── setup.md
├── prompts/
│   ├── audit-permissions.prompt.md
│   ├── bridge-loop.prompt.md
│   ├── create-entra-app.prompt.md
│   ├── device-code-login.prompt.md
│   ├── rollback-permissions.prompt.md
│   └── send-proof-message.prompt.md
├── scripts/
│   └── README.md
├── src/
│   ├── bridgeLoop.ts
│   ├── config.ts
│   ├── graphClient.ts
│   ├── index.ts
│   └── tokenStore.ts
├── .env.example
├── package.json
└── tsconfig.json
```

## Current status

GraphHarbor is early, but the public scaffold is no longer only a proof note. It
has a documented architecture, a public/private publication model, a TypeScript
transport scaffold, and prompt files for the main operator workflows.

Run the public-safe checks:

```bash
npm install
npm run check
python3 path/to/audit_public_repo.py .
```

The current scaffold can compile, load configuration, load stored token metadata,
list recent messages when read permission exists, send chat messages when a
delegated token is available, and perform one in-memory polling pass with
deduplication.

The read provider is intentionally unfinished. Real deployments should supply
their Teams app manifest, Resource-Specific Consent reconciliation, tenant app
setup, credential storage, runtime adapter, and proof logs in a private
downstream repository.

Live credentials, private tenant IDs, private chat IDs, private app IDs, private
agent configuration, and environment-specific paths do not belong in this public
repository.

## Public/private model

Use this repository as the generic upstream. Keep environment-specific
customizations in private downstream repositories or private branches.

```text
Empathos/microsoft-graphharbor    public generic framework
private downstream fork           local credentials, IDs, deployment, logs
```

This keeps the public framework reusable while preserving operational privacy.

## References

- Microsoft Graph send chatMessage: https://learn.microsoft.com/en-us/graph/api/chatmessage-post
- Microsoft Graph permissions reference: https://learn.microsoft.com/en-us/graph/permissions-reference
- Teams Resource-Specific Consent: https://learn.microsoft.com/en-us/microsoftteams/platform/graph-api/rsc/resource-specific-consent
- Teams bots and agents message access: https://learn.microsoft.com/en-us/microsoftteams/platform/bots/how-to/conversations/channel-messages-for-bots-and-agents
