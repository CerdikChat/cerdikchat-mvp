# Backup security-scan correction — 2026-11-05

## Finding
Scheduled backup run 41890146458 on `main` stopped at Gitleaks 8.24.3. The scanner identified one `generic-api-key` finding at `src/prompt-intelligence.js:18`. Source review confirmed the value is the literal `cerdikgo-prompt-vault-v1`, a browser localStorage namespace, not a credential.

## Proposed correction
- Add a Gitleaks configuration that extends the default rules.
- Allowlist only when both the exact source path and exact literal match (`condition = "AND"`).
- Add a full-history CI scan for the branch/PR, fetching all remote branches and tags.
- Keep all other default secret rules enabled.

## Safety
No secret was disclosed in this document. No secret rotation, OAuth, repository secret, backup upload, Drive upload, deployment, D1 operation, or billing change was performed. The scheduled backup failure remains unresolved until the new scan passes and the configuration is reviewed/integrated.
