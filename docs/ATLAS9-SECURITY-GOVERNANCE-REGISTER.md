# ATLAS-9 Security & Governance Register

Append findings with exact branch/commit and reproducible evidence. Never copy secrets, tokens, cookies, personal data, or sensitive log payloads into this register.

## Initial repository review — 2026-11-05

### Current baseline
- PR #59 and PR #60 Auto Pilot gates pass on their respective exact merge candidates; this is CI evidence, not a penetration test or remote-runtime certification.
- PR #61 adds an auth-log privacy remediation and its isolated security/regression CI passes.
- PR #59/#60 keep the agent gateway `plan_only`; specialist definitions remain read-only and non-executing.
- `wrangler.toml` declares observability with `head_sampling_rate = 1` (100% sampling). Review log content, retention, access controls and data minimization before treating this as privacy-cleared.
- Preserve exactly nine specialist roles; Optimus Prime is coordinator, not a tenth specialist.

### PR #52 — `atlas9/admin-governance-control-center` head `9be9a8c3f6df416d66452c3d8c69c5112c853207`
1. **MEDIUM — PII in authentication logs (REMEDIATION PROPOSED; NOT MERGED).** PR #52's `auth/google-auth.js` logged `ACCESS_REQUEST_SUBMITTED` with request ID and email. Follow-up PR #61 changes this to a fixed non-identifying event code and tests that email, Google subject and ID token are absent from captured logs. PR #61 head `17760f85b01e0db2e7a09679324d55adfe1fcf95`; security CI `41917776597` passed 99/99 tests and the log-redaction source check. Integrate only after review; PR #52 remains unchanged until then.
2. **REVIEW REQUIRED — Session lifetime change.** PR #52 changes `SESSION_TTL_SECONDS` from 8 hours to 76 hours and grants access-request approvals for 76 hours. Require a documented threat/risk rationale, session revocation/rotation tests, and explicit expiry policy before acceptance.
3. **BLOCKED — Preview workflow side effect.** `.github/workflows/preview-upload.yml` invokes `wrangler preview` on pushes to the governance branch using `CLOUDFLARE_API_TOKEN`. Do not trigger or rely on it until token least-privilege scope, target Worker, Preview D1 isolation, and explicit Preview authorization are verified.
4. **BLOCKED — D1 migration 0007.** The migration adds governance columns/tables and a unique partial index for one pending request per email. The PR includes a read-only duplicate preflight; do not execute remote D1 reads/writes or apply the migration in this automation. A human must review duplicate results and explicitly authorize any Preview migration.
5. **REVIEW REQUIRED — Admin approval path.** Inspect atomicity of account upsert, request status update and audit event, plus role-escalation, CSRF, same-origin, concurrent decision and audit-failure negative tests. Do not infer full RBAC assurance from UI visibility or happy-path tests.
6. **CI COVERAGE GAP.** No PR-triggered workflow run was surfaced for PR #52 because the base branch's regression trigger is limited to `main`. PR #61 adds push-triggered isolated security CI on its own branch; this does not replace a complete PR-level integration check on the eventual merged candidate.

### PR #53 — `atlas9/branch-reconciliation` head `142f4d8a893ba81d5f926da65f53b9e077ad1cad`
- **REVIEW REQUIRED — Backup secret scope.** Google Drive upload is optional and requires a manual dispatch input set to true, but depends on OAuth client secret, refresh token and Drive folder ID. Verify least-privilege OAuth scope, secret access policy, destination ownership and revocation plan before enabling upload.
- **REVIEW REQUIRED — Backup content sensitivity.** The workflow builds a full Git bundle across refs/history. Gitleaks runs before archive creation, but a clean scan is not proof that historical credentials or private data are absent. Review history and artifact access/retention before external upload.
- **PARTIALLY VERIFIED — Backup integrity.** Git bundle verification and SHA-256 manifest creation are present; Drive upload checks returned file ID and byte size. A restore drill with checksum verification after download is still required.
- The workflow's default manual input leaves Drive upload off. No backup workflow was triggered by this audit.

### Research and multimodal boundaries
- PR #34 describes a bounded live-search provider adapter but states that a production search provider must be selected/configured separately. Live Web Research is NOT TESTED / NOT VERIFIED as an active provider.
- PR #35 adds structured research on user-supplied documents. This is not evidence of live web retrieval or independent source verification. Its parser validates that a non-null reference string occurs in extracted text but does not independently validate the returned evidence text; require a verbatim excerpt/quote contract and negative tests before claiming claim-level traceability.
- File-analysis code has negative tests for authentication, CSRF, MIME/signature mismatch, size, encrypted PDFs, scanner unavailability and non-persistence. Parser hardening, polyglot files, extraction resource limits, scanner runtime and retention still need review.
- Voice capability in PR #41 is described as Preview capability; real-device microphone/speech playback acceptance remains NOT TESTED. The route hardcodes the Whisper model and accepts a bounded audio MIME/signature set; verify compatibility with Android recorder formats and central free-only model policy.

## Finding template
- ID / date / severity:
- Component and affected branch/commit:
- Reproduction and evidence:
- Impact and likelihood:
- Mitigation / owner:
- Verification test and result:
- Residual risk / approval:
- Status: VERIFIED / FAILED / BLOCKED / NOT TESTED / PLANNED.

## Security review update — 2026-11-05: PR #62–#64

### PR #63 — MCP authentication and rate limiting
- Branch/head: atlas9/cerdikgo-mcp-security-hardening / 4c5276f2ff5307949f912451d554d9be879223b6; PR https://github.com/CerdikChat/cerdikchat-mvp/pull/63 .
- Changed files: worker.js, tests/mcp-security.test.mjs, docs/MCP-SECURITY-HARDENING.md.
- Controls: pre-auth IP rate limit, fail-closed missing limiter/client IP, SHA-256 credential fingerprint bucket, constant-time digest comparison, case-insensitive Bearer parsing, POST-only endpoint, malformed-token regression coverage.
- Runs 41945833375, 41945833224, 41945833236, 41945833238 all VERIFIED / success; 139/139 tests passed in the readiness job.
- Residual risk: MCP remains opt-in; no runtime token rotation, external MCP client penetration test, or live rate-limit capacity test is evidenced. Do not infer endpoint activation from merged code or UI.
- Status: VERIFIED for exact-head CI controls; NOT TESTED for deployed runtime and external security testing.

### PR #64 — Connectors menu
- Branch/head: atlas9/cerdikgo-connectors-menu / 929e5bcf9d2be683c94b9cd882209ce194fc9119; PR https://github.com/CerdikChat/cerdikchat-mvp/pull/64 .
- UI explicitly states connector runtime connectivity is not verified and does not activate MCP, Workers AI, D1, or Context Bridge.
- Runs 41944458347, 41944458563, 41944458558, 41944458354 all VERIFIED / success; 134/134 tests passed in readiness.
- Preview workflow .github/workflows/preview-pr64.yml is manual only and was not dispatched. Preview credentials/secret scope were not inspected. Status: BLOCKED for Preview runtime validation by unavailable workflow-dispatch action in the connected GitHub tool; NOT TESTED for Android acceptance.

### Related open security and governance issues
- PR #61 head 17760f85b01e0db2e7a09679324d55adfe1fcf95 has push-triggered security/regression success (41917776597, 41917776653; 99/99 security tests). Its PII-log remediation remains proposed and unmerged into PR #52.
- PR #52 head 9be9a8c3f6df416d66452c3d8c69c5112c853207 still requires review of 76-hour session lifetime, atomic account/request/audit writes, role escalation, CSRF and concurrent decisions. Preview workflow side effect and D1 migration 0007 remain blocked pending separate scoped authorization.
- PR #53 head 142f4d8a893ba81d5f926da65f53b9e077ad1cad includes full Git bundle, source archive and SHA-256 manifest. Bundle creation/verification is not a restore drill. Google Drive upload remains opt-in/manual; OAuth scope, historical archive sensitivity, retention and restore checksum require review. No upload or restore was run.
- PR #34 live research architecture still requires a configured provider and end-to-end source freshness/citation tests. Live Web Research remains NOT TESTED.
- PR #35 document research is not live web research. Existing validation checks reference presence but does not fully prove returned evidence text is a verbatim source excerpt; claim-level evidence integrity remains REVIEW REQUIRED.
- PR #41 Voice-to-AI is a Preview capability. Android microphone, playback, interruption, recorder MIME compatibility and network-loss behavior remain NOT TESTED.
- PR #45 service worker caches static app shell only. It is not offline chat, peer-to-peer transport, or radio mesh.
- Model routing policy is free_only and Workers AI only; document analysis and voice routes still contain hardcoded model choices. Add policy-drift tests and centralize routes before expanding providers.
- Wrangler observability head_sampling_rate=1 (100%) requires privacy, retention and access-control review.
- CI warnings: checkout/setup-node v4 Node.js 20 deprecation and Node punycode deprecation are non-blocking but should be addressed in dependency/workflow maintenance.

### Standing controls
- Exactly nine specialist profiles; Optimus Prime remains coordinator; gateway remains plan_only.
- No Production deploy, remote D1 write/migration, OAuth/secrets/DNS changes, billing, MCP activation or independent agent execution.
