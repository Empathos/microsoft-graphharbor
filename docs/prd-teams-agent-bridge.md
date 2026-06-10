# PRD and Technical Spec: Teams Agent Bridge

Date: 2026-06-09
Status: Public draft
Owner: Project maintainer

## BLUF

GraphHarbor should provide a tight, outbound-only Microsoft Teams bridge for
private agent runtimes. The current proof shows Graph can read a Teams message,
invoke an interpreter, and send a natural reply back through Graph. The next
product question is whether the loop can reliably notice fresh Teams messages,
pass enough context to an agent to interpret them correctly, avoid duplicate or
self replies, and fail quietly with inspectable evidence.

## Problem

Private agent runtimes should not expose public Bot Framework, dev tunnel, or
webhook ingress just to participate in Microsoft Teams. Humans should keep using
Teams, while the agent runtime stays private and communicates through Microsoft
Graph APIs.

The first live test produced a generic proof reply, then a corrected natural
reply through the interpreter path. That means transport is plausible, but the
bridge is not yet product-complete. The key risk is not "can Graph send a
message"; it is whether the system can consistently map Teams input into an
agent turn with the right instruction, context, state, and reply behavior.

## Goals

- Poll an explicitly configured Teams chat on a tight test cadence.
- Detect only fresh human messages that have not already been processed.
- Send each eligible message to a configured interpreter command.
- Preserve the sender, clean text, message ID, chat ID, and raw Graph timestamp.
- Post the interpreter's reply through Microsoft Graph delegated send.
- Add sent reply IDs to seen state to prevent self-reply loops.
- Keep credential material outside the repository.
- Produce redaction-safe proof logs for each poll and reply decision.
- Provide an obvious kill switch for the test loop.

## Non-Goals

- Public Bot Framework endpoint exposure.
- Tenant-wide Teams ingestion.
- Broad production Graph grants as a default.
- Browser automation for normal Teams messaging.
- Multi-chat routing before the single-chat loop is reliable.
- Rich attachments, cards, reactions, edits, deletes, or channel-thread behavior
  in the first bridge loop.

## Current Public Evidence

- Repository: `microsoft-graphharbor`
- Current scaffold includes a TypeScript Graph client, token loader, state store,
  one-pass bridge loop, interpreter command boundary, and cron-safe poll wrapper.
- TypeScript check: `npm run check` passes.
- Implemented CLI commands:
  - `node dist/index.js prime`
  - `node dist/index.js read-smoke`
  - `node dist/index.js poll-once`
  - `npm run cron-poll`
- Implemented flow:
  - `loadConfig()`
  - `getAccessToken()`
  - `listRecentMessages()`
  - `unseenMessages()`
  - `runInterpreterCommand()`
  - `sendChatMessage()`
  - `writeState()`
- Public-safe verification should use synthetic fixtures or placeholder tenant
  values. Private proof logs belong in a private downstream repository.

## User Stories

1. As a human operator, I can send an agent a Teams message and receive a
   concise natural reply without exposing the private runtime through public
   ingress.
2. As an agent operator, I can inspect whether a Teams message was seen, skipped, replied
   to, or failed without reading secrets or raw tokens.
3. As an operator, I can stop the loop quickly if it starts duplicating replies
   or interpreting the wrong context.
4. As a future agent, I can reproduce setup, proof, rollback, and audit from
   maintained docs and prompt files.

## Functional Spec

### Polling

- The bridge polls one configured `CHAT_ID`.
- Test cadence target: 5 seconds while actively supervised.
- Production cadence target: 15-60 seconds unless Graph throttling, cost, or
  tenant policy pushes higher.
- Each poll fetches recent messages from `/chats/{chatId}/messages`.
- The bridge sorts unseen messages by `createdDateTime` before processing.

### Eligibility

A message is eligible when:

- it has a stable Graph message ID,
- the ID is not in `seenMessageIds`,
- cleaned text is non-empty,
- text does not start with `REPLY_PREFIX`,
- sender is not the bridge identity, if identity detection is available.

### Interpretation

For each eligible message, the bridge sends JSON to `INTERPRETER_COMMAND`:

```json
{
  "message": "<raw selected Graph message fields>",
  "text": "<HTML-stripped message text>",
  "from": "<display name or application name>"
}
```

The first interpreter adapter invokes OpenClaw with:

- a persistent GraphHarbor Teams session key,
- low thinking for fast chat replies,
- an instruction to reply naturally and avoid transport details unless asked,
- the sender and cleaned message text.

### Reply

- Empty interpreter stdout means no reply.
- Non-empty interpreter stdout is posted as a plain text Graph chat message.
- The sent reply ID is added to `seenMessageIds`.
- The loop reports `messagesSeen` and `repliesSent`.

### State

State file stores:

- last 500 seen message IDs,
- last poll timestamp.

Next revision should also store:

- last processed inbound message ID,
- last sent reply ID,
- last error class,
- loop version,
- bridge instance ID.

### Proof Logs

Add structured local logs with no tokens and no raw private chat dumps by
default:

```json
{
  "time": "2026-06-09T00:00:00.000Z",
  "event": "reply_sent",
  "chatIdHash": "...",
  "inboundMessageId": "...",
  "replyMessageId": "...",
  "from": "Example User",
  "textChars": 21,
  "replyChars": 13,
  "durationMs": 2400
}
```

## Failure Modes

- Token expired or missing: fail closed, no reply attempt.
- Graph read denied: log permission failure, do not mutate state.
- Graph send denied: keep inbound message marked with a retry-needed status
  rather than silently losing it.
- Interpreter timeout: log timeout and skip send.
- Interpreter returns generic transport text to a semantic message: log as
  reply-quality failure.
- Duplicate inbound after Graph ordering changes: dedupe by message ID.
- Self-reply loop: block by sent IDs and sender/application identity.

## Acceptance Tests

### Transport

- `prime` writes state without sending a reply.
- `poll-once` with no new messages sends zero replies.
- `poll-once` with one fresh message sends exactly one reply.
- Running `poll-once` again sends zero additional replies.
- Sent reply ID appears in state.

### Interpretation

- Input "do you see my message?" returns a natural acknowledgement.
- Input asking about transport can mention GraphHarbor.
- Input not asking about transport does not mention GraphHarbor, Graph, tokens,
  cron, or internal session keys.

### Safety

- Missing `INTERPRETER_COMMAND` skips rather than sending a canned reply.
- Missing token file exits non-zero.
- Failed Graph send does not claim success.
- Kill switch disables the loop before the next poll.

## Implementation Plan

1. Add structured proof logging to `pollOnce`.
2. Add a bounded loop runner command, e.g. `bridge-loop`, with interval,
   max-iteration, and kill-file support.
3. Add self-identity detection so replies are skipped by sender identity as well
   as by prefix and seen ID.
4. Add retry status for messages whose reply failed after interpretation.
5. Add a test harness using fixture Graph messages and a fake interpreter.
6. Add operator runbook commands for prime, poll once, run supervised loop,
   inspect state, inspect logs, and stop.
7. Promote only after repeated supervised Teams tests show no duplicate or
   generic replies.

## Open Questions

- Should the tight supervised test cadence be a local loop runner, OpenClaw
  cron, systemd timer, or shell-supervised process?
- Should the interpreter reuse one persistent OpenClaw Teams session or create a
  session per Teams chat?
- What exact Graph permission lane should be kept after proof: delegated chat
  read, RSC where-installed read, or app permission with narrower policy?
- What is the minimum context package an agent needs for high-quality replies:
  current message only, last N Teams messages, or merged Teams plus OpenClaw
  memory context?
- Where should private proof logs live so they are inspectable but never pushed
  to the public repo?

## Immediate Next Step

Run a supervised two-message test:

1. Confirm no bridge loop is already running.
2. Prime state.
3. Start a tight supervised loop or manually run `poll-once` every few seconds.
4. Send one Teams message that asks a semantic question.
5. Confirm the reply is natural, non-generic, and logged.
6. Repeat `poll-once` and confirm no duplicate reply.
7. Stop the loop and record the state/log evidence.
