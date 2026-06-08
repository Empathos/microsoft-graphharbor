# Setup Guide

This is the reproducible public setup shape for GraphHarbor. Keep tenant-specific values, credential-store locations, and proof transcripts in a private downstream repository or operator notes.

## 1. Create the Graph bridge app

Create an Entra application for the bridge:

```text
displayName: YOUR_BRIDGE_APP_NAME
clientId: YOUR_CLIENT_ID
tenantId: YOUR_TENANT_ID
```

Configure it as a public client if using device-code flow.

## 2. Add delegated Graph permissions

Minimum send proof scopes:

```text
ChatMessage.Send
User.Read
offline_access
```

Use an app registration you control. Do not rely on a Microsoft-owned CLI client for arbitrary delegated Graph scopes.

## 3. Grant admin consent

Grant tenant admin consent for the required bridge app permissions where appropriate. This reduces user-consent friction while keeping tokens delegated to the signed-in user.

## 4. Device-code login

Request a device code from:

```text
https://login.microsoftonline.com/YOUR_TENANT_ID/oauth2/v2.0/devicecode
```

Use scopes similar to:

```text
ChatMessage.Send User.Read offline_access
```

The user opens:

```text
https://login.microsoft.com/device
```

and enters the generated short-lived code.

Token polling uses:

```text
https://login.microsoftonline.com/YOUR_TENANT_ID/oauth2/v2.0/token
```

with grant type:

```text
urn:ietf:params:oauth:grant-type:device_code
```

## 5. Store token material

Store token material outside the repository.

Example environment value:

```text
TOKEN_FILE=path/to/graphharbor-token-store
```

The public repository should never contain refresh tokens, access tokens, client secrets, or environment-specific credential-store paths.

## 6. Send a Teams chat message

Endpoint:

```http
POST https://graph.microsoft.com/v1.0/chats/YOUR_CHAT_ID/messages
```

Headers:

```http
Authorization: Bearer YOUR_DELEGATED_ACCESS_TOKEN
Content-Type: application/json
```

Body:

```json
{
  "body": {
    "contentType": "text",
    "content": "GraphHarbor proof message."
  }
}
```

Expected successful response:

```text
201 Created
```

## 7. Read messages

Preferred durable read strategy:

1. Declare Teams RSC permissions in the Teams app.
2. Reinstall or reconsent the app in the target chat.
3. Use app-scoped or where-installed Graph permissions to read only where the app is installed.

Avoid broad tenant-wide chat read in the durable design unless a specific operational need is approved.
