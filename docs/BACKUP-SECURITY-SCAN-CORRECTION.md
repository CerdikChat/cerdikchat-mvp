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


## Additional full-history finding — 2026-11-06

### Latest scheduled backup failure
- Main scheduled backup run `42086628529` (2026-11-05 18:41:17 UTC) FAILED at the Gitleaks step. Archive creation, artifact publication and Google Drive upload were skipped.
- Gitleaks 8.24.3 reported three `generic-api-key` findings across fetched refs: two instances of the already-reviewed localStorage namespace `cerdikgo-prompt-vault-v1` in historical `src/prompt-intelligence.js` revisions, and one 40-character value in `docs/PRIMARY-AUTH-FAIL-CLOSED-MAIN-CANDIDATE.md:16`.
- The latter value `693bbd632480b760fff5ecab11be355d9288773c` was verified through GitHub as an actual commit object ID titled `security(auth): fail closed for production and D1 deployments`, not a credential. It is referenced as provenance in the audit note.
- The main scheduled run did not load this PR's `.gitleaks.toml` because PR #74 is not integrated; its log explicitly said no Gitleaks config was found and default rules were used.

### Narrow correction
- Add a second `condition = "AND"` allowlist requiring both the exact audit-note path and exact verified commit SHA.
- Keep the original localStorage exception limited to its exact file and literal.
- Extend the workflow assertion and add a Node regression test that requires exactly these two narrow path+literal exceptions, each line-targeted; no global allowlist is permitted.
- Re-run the explicit all-ref scan after fetching every branch/tag. Keep backup status BLOCKED until the new PR scan passes and a subsequent scheduled/manual archive plus isolated restore succeeds.

No secret values were accessed or exposed. No secret rotation, Drive upload, backup artifact publication, deployment, D1 operation or billing action was performed.
