# openclaw-interpreter

## Goal

Use OpenClaw as one possible GraphHarbor interpreter behind the generic stdin/stdout command boundary.

## Inputs

- One JSON object on stdin containing `message`, `text`, and `from`.
- `OPENCLAW_BIN`, defaulting to `openclaw`.
- `OPENCLAW_SESSION_KEY`, defaulting to `agent:main:graphharbor-teams`.
- `OPENCLAW_TIMEOUT_SECONDS`, defaulting to `180`.
- `OPENCLAW_THINKING`, defaulting to `low`.

## Preconditions

- The OpenClaw CLI is installed and available to the private deployment environment.
- The selected OpenClaw session key is appropriate for the bridge context.
- The Teams message has already passed GraphHarbor deduplication and filtering.

## Safety boundaries

- Do not hard-code local executable paths in the public repository.
- Do not include token values, local credential paths, or private proof logs in the prompt.
- Do not mention GraphHarbor transport internals unless the human asks about them.
- Keep replies concise enough for chat.

## Steps

1. Read the GraphHarbor interpreter input from stdin.
2. Build a compact prompt containing the sender display name and message text.
3. Invoke the configured OpenClaw CLI command.
4. Parse the JSON response for assistant-visible text.
5. Write only the final reply text to stdout.

## Expected output

One plain-text reply on stdout. Empty output means no reply should be sent.

## Verification

- Run the interpreter with synthetic stdin before connecting it to a live chat.
- Confirm stdout contains only the intended reply text.
- Confirm stderr does not contain token material or private paths.

## Rollback or cleanup

- Unset `INTERPRETER_COMMAND` to make the bridge read and deduplicate without replying.
- Reset `OPENCLAW_SESSION_KEY` in the private environment if the wrong context was used.

## What not to do

- Do not put private runtime paths into this public script.
- Do not parse arbitrary internal OpenClaw logs as the reply source.
- Do not generate replies for messages GraphHarbor has already filtered out.
