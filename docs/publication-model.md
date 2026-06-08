# Publication Model

GraphHarbor follows the repository pattern:

```text
Public generalized repo -> Private operational fork
```

## Current Repository Status

This repository began as a private operational proof record. It currently contains environment-specific proof details that are useful for internal continuity but are not suitable for a public repo as-is.

Before publication, create a generalized public version.

## Public Version Requirements

The public version must not contain:

- Personal names or private assistant identity context
- Real tenant IDs, app IDs, chat IDs, object IDs, user IDs, or service principal IDs
- Local filesystem paths
- Credential paths
- Private network names or URLs
- Internal proof transcripts
- Any secret-shaped values

The public version should use:

- Placeholder identifiers such as `YOUR_TENANT_ID`
- `.env.example` configuration
- Generalized setup instructions
- Script/prompt pairs
- Redaction-safe logs and examples
- Tests that do not require private infrastructure

## Private Fork Requirements

The private fork may contain operational deployment material:

- Tenant-specific setup notes
- Private app IDs and object IDs
- Internal proof records
- Local credential path references
- Deployment scripts for a specific environment

Secret values still must not be committed.

## Public Release Gate

Before making any GraphHarbor repository public:

1. Run a name/path/ID scan.
2. Remove private proof records or move them to the private fork.
3. Replace real IDs with placeholders.
4. Verify script/prompt pairs remain coherent.
5. Run a secret scan.
6. Run tests.
7. Review README and docs for generalized language.

