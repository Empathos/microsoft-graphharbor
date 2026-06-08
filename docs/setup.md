# Setup Notes

This is the reproducible shape of the proof. Commands here are intentionally descriptive rather than copy/paste complete because tenant credentials and token material must stay outside the repository.

## 1. Create the Graph Bridge App

Create an Entra application named:

```text
Alice Teams Graph Bridge
```

Configure it as a public client so it can use device-code flow.

Known proof app:

```text
clientId: 354a638e-982f-4c98-bfee-df6066a945ad
tenantId: f37cc18c-218a-4d7e-ae6d-e8e7e376e50e
```

## 2. Add Delegated Graph Permissions

Minimum send proof scopes:

```text
ChatMessage.Send
User.Read
```

Do not use the Microsoft-owned Teams CLI app for this. It is not ours to preauthorize for arbitrary Graph delegated scopes.

## 3. Grant Admin Consent

Grant tenant admin consent for the bridge app permissions.

This avoids per-user consent friction during the device-code approval flow, while still keeping the token delegated to the signed-in user.

## 4. Device Code Login

Start device-code flow against:

```text
https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/devicecode
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
https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token
```

with grant type:

```text
urn:ietf:params:oauth:grant-type:device_code
```

## 5. Store Token Locally

Store token material outside the repository.

Current local proof path:

```text
/home/alice/.openclaw/credentials/teams-graph-bridge-token.json
```

The repository `.gitignore` blocks token-shaped files and credential directories. Keep the real token file in the OpenClaw credentials area or another secret store.

## 6. Send a Teams Chat Message

Endpoint:

```http
POST https://graph.microsoft.com/v1.0/chats/{chat-id}/messages
```

Headers:

```http
Authorization: Bearer {delegated_access_token}
Content-Type: application/json
```

Body:

```json
{
  "body": {
    "contentType": "text",
    "content": "Replying from Alice through Microsoft Graph. No public bot endpoint involved."
  }
}
```

Expected successful response:

```text
201 Created
```

## 7. Read Messages

Preferred durable read strategy:

1. Declare Teams RSC permissions in the Teams app.
2. Reinstall or reconsent the app in the target chat.
3. Use app/RSC or where-installed Graph permissions to read only where the app is installed.

Avoid broad tenant-wide chat read in the durable design unless a specific operational need is approved.

