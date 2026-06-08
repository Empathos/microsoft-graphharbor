# Prompt: Create GraphHarbor Entra App

## Goal

Create or reconcile the Microsoft GraphHarbor Entra application used for endpoint-free Teams agent messaging over Microsoft Graph.

## Inputs

- Tenant ID
- Desired app display name
- Desired delegated Graph scopes
- Operator credential path or credential provider

## Preconditions

- Operator has tenant authority to create/update app registrations and service principals.
- Operator credential is available locally and must not be printed.
- The script is run from a clean working tree or changes are intentionally staged.

## Safety Boundaries

- Do not print client secrets or tokens.
- Do not add broad chat-read permissions unless explicitly requested for a bounded proof.
- Prefer delegated `ChatMessage.Send` and `User.Read` for the send lane.
- Record every tenant mutation in the command output using IDs and scope names only.

## Steps

1. Get an app-only Graph token using the operator credential.
2. Find an existing GraphHarbor app by display name or app ID.
3. Create the app if missing.
4. Ensure public-client/device-code support is enabled.
5. Ensure required delegated Graph scopes are present.
6. Ensure the service principal exists.
7. Ensure admin consent exists for the required scopes.
8. Print non-secret metadata.

## Expected Output

- Tenant ID
- Application/client ID
- Application object ID
- Service principal object ID
- Delegated scope list
- Whether each item was created, updated, or already correct

## Verification

- Graph app exists.
- Service principal exists.
- Required scopes are present.
- Admin consent grant exists.
- No secret material was printed.

## Rollback

If this was a test app, delete the app registration and service principal. If this was an existing app, remove only the scopes or grants added by this run.

## Do Not Do

- Do not reuse the Microsoft Teams CLI app for arbitrary Graph scopes.
- Do not grant tenant-wide message read as part of this setup.

