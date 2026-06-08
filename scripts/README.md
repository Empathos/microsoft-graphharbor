# Scripts

Future scripts should live here:

- `create-entra-app` for idempotent bridge app setup.
- `device-code-login` for delegated token acquisition.
- `send-proof-message` for one-shot Graph send verification.
- `audit-permissions` for checking tenant/app grants.
- `rollback-permissions` for removing temporary broad grants.

Keep scripts redaction-safe by default. They should print IDs, statuses, and scope names, not token values or secrets.

