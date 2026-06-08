# Prompt: Roll Back Temporary Permissions

## Goal

Remove temporary broad Microsoft Graph or Teams permissions used during proof work.

## Inputs

- Tenant ID
- Target app/client ID or service principal ID
- Permission names to remove
- Operator credential path or credential provider

## Preconditions

- Operator has authority to update app registrations and grants.
- The permissions to remove are explicitly listed.
- The desired final state is known.

## Safety Boundaries

- Remove only the permissions named in the request.
- Do not delete unrelated app registrations or service principals.
- Print IDs, scopes, and statuses only.
- Verify final state after mutation.

## Steps

1. Resolve target app and service principal.
2. Resolve Microsoft Graph service principal and permission IDs.
3. Remove named permissions from required resource access.
4. Remove or patch matching OAuth2 permission grants/app role assignments.
5. Re-read the app and grants.
6. Print final non-secret state.

## Expected Output

- Removed permission names
- Removed or patched grant IDs
- HTTP statuses
- Final remaining scopes/roles

## Verification

- Removed permissions no longer appear in app required resource access.
- Removed grants no longer appear on service principal.
- No unrelated permissions were removed.

## Rollback

Re-add the removed permission and admin consent only if explicitly requested and justified.

## Do Not Do

- Do not remove `ChatMessage.Send` from GraphHarbor unless the send lane is intentionally being disabled.
- Do not leave broad tenant-wide chat read in place after a proof.

