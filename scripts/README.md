# Scripts

Future scripts should live here:

- `create-entra-app` for idempotent bridge app setup.
- `device-code-login` for delegated token acquisition.
- `send-proof-message` for one-shot Graph send verification.
- `audit-permissions` for checking tenant/app grants.
- `rollback-permissions` for removing temporary broad grants.

Keep scripts redaction-safe by default. They should print IDs, statuses, and scope names, not token values or secrets.

## Pairing Rule

Every script must have a same-name prompt in `../prompts/`.

Examples:

```text
scripts/create-entra-app.ts
prompts/create-entra-app.prompt.md

scripts/send-proof-message.ts
prompts/send-proof-message.prompt.md
```

The script is the deterministic tool. The prompt is the agent/operator instruction packet: intent, inputs, safety boundaries, verification, and rollback.
