# Prompt: Device Code Login

## Goal

Acquire a delegated Microsoft Graph token for GraphHarbor using device-code auth.

## Inputs

- Tenant ID
- Client ID
- Scope list
- Token output path

## Preconditions

- The GraphHarbor Entra app exists.
- The app is configured as a public client.
- Admin consent has been granted where required.
- A human user is available to approve the device-code prompt.

## Safety Boundaries

- Print the verification URL and short-lived user code.
- Do not print access tokens or refresh tokens.
- Write token material only to the configured credentials path.
- Set restrictive file permissions on the token file.

## Steps

1. Request a device code from Microsoft identity platform.
2. Show the verification URL and user code.
3. Poll the token endpoint until approved, denied, or expired.
4. Store the resulting token payload locally.
5. Print non-secret metadata: tenant ID, client ID, scopes, expiry, user if available.

## Expected Output

- Device-code URL
- User code
- Polling status
- Final success/failure
- Token metadata without token values

## Verification

- Token file exists.
- Token file has restricted permissions.
- A Graph `/me` call succeeds with the access token.
- Scope metadata includes `ChatMessage.Send`.

## Rollback

Delete the local token file. If needed, revoke the user's refresh tokens or remove the app consent grant in Entra.

## Do Not Do

- Do not paste token values into chat.
- Do not store token files under the repository.

