# Prompt: Send Proof Message

## Goal

Send a single proof message to a Microsoft Teams chat through Microsoft Graph, without using a public bot endpoint.

## Inputs

- Chat ID
- Token file path
- Message text

## Preconditions

- Token file exists and contains a delegated token for the GraphHarbor app.
- Token scopes include `ChatMessage.Send`.
- The target chat ID is known.

## Safety Boundaries

- Send exactly one message unless explicitly asked otherwise.
- Do not print token values.
- Do not send test spam into a production chat.
- Include enough output to prove the Graph call worked.

## Steps

1. Load the local token.
2. Refresh it if expired.
3. POST to `/v1.0/chats/{chat-id}/messages`.
4. Print status, message ID, and created timestamp.

## Expected Output

- HTTP status
- Teams message ID
- Created timestamp
- Sender/user metadata if available

## Verification

- Graph returns `201 Created`.
- Message appears in the Teams chat.
- No `/api/messages` endpoint or tunnel is involved.

## Rollback

Usually none. For accidental proof messages, delete manually in Teams if appropriate.

## Do Not Do

- Do not use broad app-only permissions for sending normal chat messages.
- Do not create a dev tunnel for this proof.

