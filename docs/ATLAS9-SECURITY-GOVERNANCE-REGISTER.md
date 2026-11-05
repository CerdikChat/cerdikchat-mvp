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

## Correction — 2026-11-05: PR #52 Preview observability evidence

The PR #52 Preview workflow did deploy exact source commit 9be9a8c3f6df416d66452c3d8c69c5112c853207 successfully (run 41825376685). The deployment result identifies Preview ID 72913c7e45014dcca1d5489eab6bc989, deployment ID 29f5c85f-af7c-46fa-9f0a-7f0f6587de92, stable URL https://atlas9-prompt-intelligence-mvp-cerdikchat-mvp.ngyoonseong.workers.dev and immutable URL https://29f5c85f-cerdikchat-mvp.ngyoonseong.workers.dev. Its D1 binding is cerdikchat-staging ID 79267e63-e57f-4237-8b88-f1e477397771. This confirms isolated Preview creation, not application health or user acceptance.

### Privacy finding
- Preview observability returned head_sampling_rate=1, logs.persist=true, invocation_logs=true, and redact_query_string=false.
- Cloudflare's configuration reference indicates query-string redaction defaults to false. Request URLs may therefore retain query strings in persisted invocation telemetry. This is a privacy risk where query strings contain tokens, identifiers, or sensitive search terms.
- PR #66 (head 1efff727f6c208d3c030b1162f2065abad5bdf7a) enables redact_query_string=true at top-level and Preview scope. Regression 41949598277 (102/102) and Wrangler dry-runs 41949598379/41949605643 passed. The fix has not been deployed; do not claim the existing Preview is already redacted.
- Query-string redaction does not sanitize request bodies, headers, application log strings, or personal data manually written to console logs. Data minimization remains required.

### Other corrections
- PR #52's 99,990 stress script is synthetic in-process Worker testing (worker.fetch), not a Cloudflare edge test or proof of real-user scale.
- PR #53 backup implementation has no current-head backup run and no restore evidence.
- PR #65 evidence excerpt validation checks normalized verbatim source spans; it does not prove semantic entailment or relevance. Human review remains necessary for material claims.

## Primary Preview capability gap — 2026-11-05

The PR #52 Preview deployment metadata (run 41825376685) lists AI, ASSETS, CHAT_RATE_LIMITER, DB, ENVIRONMENT, GOOGLE_AUTH_REQUIRED, and GOOGLE_CLIENT_ID. It does not list FILE_SCANNER or VOICE_RATE_LIMITER.

- multimodal/file-analysis.js imports the scanner guard and fails closed when FILE_SCANNER is absent/unavailable; therefore document scanning is not expected to succeed in this Preview.
- multimodal/voice-assistance.js returns VOICE_RATE_LIMIT_UNAVAILABLE when VOICE_RATE_LIMITER is absent; therefore voice transcription is not expected to succeed in this Preview.
- No binding was fabricated, no scanner bypass was added, and no Cloudflare resource was created. Provisioning a real scanner service and dedicated rate-limit binding requires a separate scoped implementation and Preview verification.

## Correction — 2026-11-05: deployed voice rate-limit dependency
The exact PR #52 source uses CHAT_RATE_LIMITER for the voice endpoint (key prefix voice:user:<subject>); the deployed Preview has this binding. The earlier assertion that VOICE_RATE_LIMITER was missing from the deployed PR #52 Preview was incorrect. PR #41's branch contains a separate VOICE_RATE_LIMITER variant, but it is not the deployed source. Voice runtime remains NOT TESTED. FILE_SCANNER is still absent; multimodal/file-scanner.js returns FILE_SCAN_UNAVAILABLE when the binding is missing, and file analysis fails closed.

## Evidence integrity remediation chronology — 2026-11-05
PR #65's first implementation commit failed CI because of a test-source formatting error and an over-escaped whitespace expression. The exact failure was recorded in run 41949291912 (35 passed, 1 failed). The follow-up commit 2529b05efa4fd02883eb493a2683218a7be2e83f corrected the parser and test source; 95/95 tests then passed in runs 41949338154 and 41949364570. The final candidate 154301128cc8824b76969b5da603807f5125b414 passed exact-head readiness in 41949989419 and 41949995940. No failed evidence has been removed from the audit history.

## Identity governance drift — 2026-11-05
The deployed PR #52 Preview worker.js prompt still enumerates ATLAS as coordinator and only seven specialist labels (NEXUS, TITAN, SENTINEL, GENESIS, TERRA, AEGIS, ORACLE). It does not match the canonical nine ATLAS-01..ATLAS-09 specialist roles with Optimus Prime as coordinator. The prompt itself states that roles are analytical approaches in a single model; no independent agents are evidenced. PR #62 contains the canonical correction and CI passed, but it is not in the deployed Preview. Status: FAILED for Preview identity parity; no autonomous execution enabled.

## MCP Bearer parser remediation chronology — 2026-11-05
The initial PR #63 candidate failed because a valid case-insensitive Bearer credential was parsed with an over-escaped whitespace regex and rejected with 401. Exact failed head c9a5b7f5575e4571a7fefe3f7df39827a4a76439; the failing test expected a non-401 result but received 401. Worker fix 0df022076c6bcd1ce19620470943defacce27fba corrected parsing; final head 4c5276f2ff5307949f912451d554d9be879223b6 added malformed-token regression and passed 4/4 CI, 139/139 tests. MCP remains opt-in and no executing tools were enabled.


## Security and governance audit update — 2026-11-05

### Feature-request archive controls (PR #70)

- Candidate: `d546c121c9d95f6568eb4c7d728655d72fd2fcd1`, branch `atlas9/admin-feature-request-archive`.
- Proposed control is a reversible soft archive, not permanent deletion. The endpoint requires `super_admin`, same-origin request validation, CSRF double-submit validation, a bounded JSON body, UUID request ID, and D1 batch execution.
- Audit insert is conditional on a successful active-row update; the API does not return success unless both batch result counts are confirmed.
- Six additional regression cases were added, but exact-head CI is absent. Status: **BLOCKED / NOT TESTED** pending an exact-head workflow.
- Migration `0008_feature_request_archive.sql` is not applied. No remote D1 write or migration is authorized by this review.

### Authentication and observability controls

- PR #61 auth-log redaction candidate `17760f85b01e0db2e7a09679324d55adfe1fcf95`: runs 41917776597 and 41917776653 passed 99/99. It remains unmerged into PR #52; do not treat the deployed Preview as fixed.
- PR #66 query-string redaction candidate `721ef9a7eb7068dcbe40ccad9df0d5b188e6e3a1`: exact-head tests and Wrangler dry-run passed (102/102); not deployed. Query-string redaction does not sanitize headers, request bodies or application log strings.
- PR #63 MCP security candidate `4c5276f2ff5307949f912451d554d9be879223b6`: four workflows passed, 139/139. MCP remains disabled unless explicitly enabled with required configuration; no remote execution was enabled.

### Identity and evidence integrity

- PR #62 canonical registry candidate is CI-verified, but the PR #52 Preview source still has legacy identity drift until integrated and revalidated. Exactly nine specialist IDs remain the contract; Optimus Prime is coordinator, not a tenth specialist. Gateway remains `plan_only`.
- PR #65 validates normalized verbatim source spans. It does not establish semantic entailment, claim relevance or research quality; human review remains necessary for high-impact claims.
- PR #52's 76-hour access session policy remains a security review item. No evidence in this audit justifies increasing the session lifetime.
- Status: no Production, OAuth/secrets, DNS, billing or remote database changes.
