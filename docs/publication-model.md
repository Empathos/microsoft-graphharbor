# Publication Model

GraphHarbor follows the repository pattern:

```text
Public generalized repo -> Private operational fork
```

## Public repository

The public repository is the reusable upstream. It contains:

- General architecture and threat model.
- Placeholder-based setup instructions.
- Public-safe examples.
- Deterministic scripts as they are added.
- Paired prompts for agent-operated scripts.
- Tests and audits that do not require private infrastructure.

The public repository must not contain:

- Personal names or private assistant identity context.
- Real tenant IDs, app IDs, chat IDs, object IDs, user IDs, or service principal IDs.
- Local filesystem paths.
- Credential-store paths.
- Private network names or URLs.
- Internal proof transcripts.
- Secret-shaped values.

## Private downstream

The private downstream repository or branch may contain operational deployment material:

- Tenant-specific setup notes.
- Private app IDs and object IDs.
- Internal proof records.
- Local credential-store references.
- Deployment scripts for a specific environment.

Secret values still must not be committed.

## Public release gate

Before making a GraphHarbor repository public:

1. Run a name, path, and ID scan.
2. Remove private proof records or move them to the private downstream.
3. Replace real IDs with placeholders.
4. Verify script/prompt pairs remain coherent.
5. Run a secret scan.
6. Run tests.
7. Review README and docs for generalized language.
