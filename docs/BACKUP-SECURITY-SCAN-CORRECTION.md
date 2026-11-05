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


## Full-history coverage correction — 2026-11-05

The first passing Gitleaks Action push run used its event default `--log-opts=-1`, so it scanned only the pushed commit. The PR-event run scanned the PR commit range. Those results are retained but are not a full-history proof. The workflow now adds a second explicit command after the Action: `gitleaks detect --source . --log-opts="--all" --redact --exit-code 2 --no-banner`. Because the job fetches every remote branch and tag first, this command scans all fetched refs and their Git history using the repository allowlist. The exact new head must pass both the event-scoped Action scan and the explicit all-ref scan before this issue is considered VERIFIED.
