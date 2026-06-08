# AGENTS.md

This repository is a public, generalized upstream for Microsoft GraphHarbor.

## Operating rules

- Keep this repository public-safe.
- Use placeholders for tenant IDs, client IDs, chat IDs, object IDs, user IDs, and credential locations.
- Do not commit tokens, secrets, private proof logs, or local deployment paths.
- Keep environment-specific configuration in a private downstream repository or branch.
- Prefer Microsoft Graph APIs over browser or desktop automation for Teams messaging.
- Treat UI automation as a fallback, not the source of truth.

## Script and prompt pairing

Every operational script should have a paired prompt file with the same base
name:

```text
scripts/send-proof-message.ts
prompts/send-proof-message.prompt.md
```

The script performs deterministic work. The prompt records the goal, inputs,
preconditions, safety boundaries, verification steps, rollback behavior, and
what not to do.

## Public release gate

Before public release or sync:

1. Run the TypeScript check.
2. Run the public repository audit.
3. Run a secret scan if one is available.
4. Review README and docs for private identity, path, ID, or proof-log leakage.
5. Confirm that live deployment details remain in a private downstream surface.
