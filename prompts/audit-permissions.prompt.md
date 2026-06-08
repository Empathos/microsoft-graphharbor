# Prompt: Audit GraphHarbor Permissions

## Goal

Audit Microsoft GraphHarbor app permissions, grants, and installed Teams/RSC state without changing the tenant.

## Inputs

- Tenant ID
- GraphHarbor app/client ID
- Teams app/bot app ID
- Optional target chat ID
- Operator credential path or credential provider

## Preconditions

- Operator credential can read app registrations and service principals.
- If checking chat-specific install state, the operator has the necessary Graph/Teams read scopes.

## Safety Boundaries

- Read-only operation.
- Do not mutate app registrations, service principals, grants, or Teams installs.
- Do not print secrets.

## Steps

1. Resolve the GraphHarbor app registration.
2. Resolve the GraphHarbor service principal.
3. List required resource access.
4. List OAuth2 permission grants.
5. Resolve Microsoft Graph permission IDs to names.
6. Inspect Teams app RSC declarations if available.
7. Inspect chat install/permission state if available.

## Expected Output

- App registration status
- Service principal status
- Delegated Graph scopes
- Application Graph roles, if any
- Admin consent grants
- RSC grant/install status
- Warnings for broad permissions

## Verification

- Audit completes without mutation.
- Broad permissions are called out explicitly.
- Missing reinstall/reconsent state is called out explicitly.

## Rollback

None. This prompt is read-only.

## Do Not Do

- Do not add permissions during audit.
- Do not use audit output as proof that message bodies are readable unless a live read probe succeeds.

