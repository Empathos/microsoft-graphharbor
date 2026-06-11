# Calling GraphHarbor

GraphHarbor exposes a narrow command interface for other tools that need to
send a Microsoft Teams message without owning Microsoft Graph authorization.

The boundary is deliberate:

- The caller owns domain semantics and message content.
- GraphHarbor owns Microsoft Graph configuration, token loading, chat IDs,
  message sending, and readback output.
- Private deployment values stay in the private downstream repository or local
  environment.

## Send a message

Build the project, load the public-safe environment variables described in
`docs/setup.md`, and run a no-network dry run:

```bash
npm run build
npm run send-message -- --dry-run "Deployment finished"
```

In a configured private deployment, omit `--dry-run` to send one message:

```bash
npm run send-message -- "Deployment finished"
```

The command can also read the message body from stdin:

```bash
printf '%s\n' "Planbridge found 3 tasks ready for review" | npm run send-message
```

On success, GraphHarbor prints a JSON readback envelope:

```json
{
  "status": "sent",
  "id": "GRAPH_MESSAGE_ID",
  "createdDateTime": "2026-01-01T00:00:00Z"
}
```

Callers should store that envelope in their own proof log if they need to tie a
domain event to a Teams notification.

## Integration pattern

```text
Domain tool
    |
    | prepared message over command/stdin
    v
GraphHarbor send-message
    |
    | Microsoft Graph delegated send
    v
Teams chat
```

Do not pass tenant IDs, client IDs, chat IDs, token paths, or operator-specific
configuration through the caller. Those values belong to GraphHarbor's runtime
environment.
