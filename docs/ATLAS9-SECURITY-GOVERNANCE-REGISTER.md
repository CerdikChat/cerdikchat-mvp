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


## Exact-head governance correction — 2026-11-05

The scorecard documentation branch received further append-only audit commits after the passing PR #60 checkpoint. The prior 129/129 CI result belongs to `ad3cbd61b6467675e71e8445f113635c45beb8c9` only. The later observed head `d8fd4d04b119f4e8a63bffa6624396ead9f723f3` has no exact-head workflow/status evidence and PR #60 reports mergeable=false (base divergence: 2 commits behind). No merge/rebase or privileged action was attempted. Treat current PR #60 integration as **BLOCKED** until the branch is reconciled and retested.


## Archive control verification — 2026-11-05

PR #70 head `d546c121c9d95f6568eb4c7d728655d72fd2fcd1` passed legacy Auto Pilot run `41952747628` with 108/108 tests and zero failures. Coverage includes super-admin-only archive authorization, same-origin/CSRF guards, request validation, atomic D1 batch/audit response behavior, active/archive filtering and UI action wiring. This is automated mock/regression evidence only; no live D1 migration or runtime archive transaction was performed. Migration `0008_feature_request_archive.sql` remains unapplied.

The run tested PR base snapshot `9be9a8c3f6df416d66452c3d8c69c5112c853207`; the admin-governance base has since advanced by two commits to `3653fa27ce9cbd01849b6f8a5478e7c335eb2465`. Revalidate the current merge candidate before Human Verification. Do not treat the run as Preview runtime acceptance.


## Final archive/admin gate evidence — 2026-11-05

- PR #52 admin governance head `3653fa27ce9cbd01849b6f8a5478e7c335eb2465` passed legacy gate `41953302757` (99/99). This does not verify Preview RBAC, live D1, or migration #0007.
- PR #70 archive head `0aae5032f2d6521255aefea172a27552ea3053a8` passed legacy gate `41953678319` (108/108). Tests use isolated/mocked D1 behavior; migration #0008 remains unapplied and no real archive transaction was executed.
- Both legacy workflows report TypeScript NOT CONFIGURED. They do not deploy or mutate remote D1.
- Human Verification remains pending current-base synchronization and explicit Preview migration approval.

## Final scorecard candidate gate — 2026-11-05

PR #60 exact head `53989231850f5f1628bf5b10203cc5e81ca9bb97` passed all four workflows:
- Auto Pilot readiness `41953817591` — 129/129, zero failures: https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41953817591
- Regression/install `41953817553` — 129/129, zero failures: https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41953817553
- Phase 3 regression `41953817606` — 129/129, zero failures: https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41953817606
- Hybrid Gateway `41953817569` — 129/129, zero failures; Wrangler 4.153.0 dry-run exited normally: https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41953817569

Readiness log identifies PR head `53989231850f5f1628bf5b10203cc5e81ca9bb97` and base snapshot `de11d34257005ba72a621312230489a7d161ff53`. The current base branch is two commits ahead. Do not treat this as Preview/Android/Production acceptance or as a model capability score. All seven model scores remain NOT MEASURED.


## 2026-11-05 — Current security/governance findings

### Authentication and log minimization
- Primary governance head `679a6719fcfa1492f984c094adbcaa1dad2ddff3` still logs the access-request ID and requester email in `auth/google-auth.js`.
- PR #73 candidate `98423d8aa14317052511cc69e98a8341713a3381` replaces that log payload with a fixed event code and tests that email, Google subject and ID token do not appear in logs. Auto Pilot `41974840542` passed 104/104. The fix is Draft and not deployed/integrated.
- Session lifetime remains `76 * 60 * 60` seconds (76 hours). Keep this as a review item; no extension was made.
- Existing code uses server-side session checks, same-origin validation, CSRF double-submit checks, and rate limiting. CI does not replace a full 50-scenario authorization/privacy audit.

### Registry and execution boundary
- Scorecard gateway registry contains exactly ATLAS-01…ATLAS-09; each is read-only, has no tools, and has execution disabled. Optimus Prime is coordinator, not a tenth specialist.
- Gateway is `plan_only`; it does not invoke model providers, fetch externally or write D1. Do not enable execution without a separate scoped approval and a tested authorization boundary.
- Primary PR #52 Worker prompt still contains legacy role labels. Canonical identity correction is not integrated into Primary Preview; identity parity remains FAILED there.

### File, voice and research boundaries
- `FILE_SCANNER` is a required private Service Binding to a ClamAV-backed scanner. Missing binding returns `FILE_SCAN_UNAVAILABLE`; the Primary Preview does not list this binding. Do not bypass or fabricate a clean verdict.
- Voice route uses `CHAT_RATE_LIMITER`; its code path is present but voice runtime and Android Chrome acceptance remain NOT TESTED.
- Live Web Research has no configured provider. PR #34 is architecture only; PR #35 is single-file/stateless document research, not open-web retrieval or persistent RAG.

### Backup and data protection
- Scheduled backup run `41890146458` failed at Gitleaks before bundle/ZIP creation and artifact publication. Source review identified the finding as the localStorage namespace `cerdikgo-prompt-vault-v1`, not a credential.
- PR #74 adds a narrow AND-matched allowlist for that exact path and literal and a full-history scan. Push scan `41975248939` passed; PR-event run `41975255549` and regression `41975255582` were still running at the time of this entry.
- No backup restore drill exists. PR #53 backup reconciliation is not equivalent to restore evidence.
- Migrations #0007 and #0008 remain unapplied; no remote D1 write/migration was performed.

No Production, OAuth/secrets, DNS, billing or privileged gateway action occurred.


## Final exact-head reconciliation — 2026-11-05

- PR #60 current documentation candidate `a2373adafa711307e842f2df7f45c0434e61d540` passed all four PR-triggered workflows:
  - Auto Pilot `41975437972` — SUCCESS; 129/129, strict TypeScript, `npm run doctor`, installation/preflight, full regression and Wrangler dry-run.
  - Regression/install `41975437993` — SUCCESS.
  - Phase 3 regression `41975438059` — SUCCESS.
  - Hybrid Gateway `41975438104` — SUCCESS; unit tests and Worker bundle validation without deployment.
- Auto Pilot log records exact PR head `a2373adafa711307e842f2df7f45c0434e61d540` and base snapshot `de11d34257005ba72a621312230489a7d161ff53`. The current base branch head remains `637ff536011ed25fc598888f62f520b4cfdccd3c`, two commits ahead of the tested base. GitHub currently reports mergeable=true, but branch synchronization and integration remain a separate review decision. No merge/rebase was performed.
- PR #74 current head `61735292750540afe2bbfb61fb69b252dee3fb6f`: full-history push Gitleaks `41975248939`, PR Gitleaks `41975255549`, and PR regression `41975255582` all SUCCESS. The PR scan log confirms Gitleaks 8.24.3 loaded `.gitleaks.toml`, scanned the three PR commits, and reported `no leaks found`. The push scan fetched all remote branches/tags and passed. The narrow allowlist requires both the exact file path and exact literal; default rules remain enabled.
- PR #73 current head `98423d8aa14317052511cc69e98a8341713a3381`: Auto Pilot `41974840542` and regression `41974833367` SUCCESS; 104/104 tests.
- PR #70 current head `0aae5032f2d6521255aefea172a27552ea3053a8`: Auto Pilot `41953678319` SUCCESS; 108/108 tests. Migration #0008 remains unapplied; branch is three commits behind current base.
- Main scheduled backup run `41890146458` remains FAILED as a historical run. The corrected scanner config is only in Draft PR #74; a future approved backup run is required to demonstrate successful archive creation, followed by a restore drill.
- All seven competitive capability scores remain NOT MEASURED. Evidence-credit score remains 0/100 in each dimension until the mandatory task sets and thresholds are executed; this is not a zero-quality score.
- Human Verification has not started. CI readiness, Preview runtime, Android acceptance and Production readiness remain distinct.

Run links:
- https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41975437972
- https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41975437993
- https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41975438059
- https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41975438104
- https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41975248939
- https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41975255549
- https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41975255582


## Audit correction — PR #74 full-history scan evidence — 2026-11-05

An earlier entry described Gitleaks runs `41975248939` and `41975255549` as full-history evidence. Review of their command lines showed those Action runs were event-scoped (`--log-opts=-1` on push and a three-commit PR range). They passed, but did not prove all-ref history coverage. This earlier wording is superseded.

PR #74 current head `abeca194672349e799bcfdd9d8f9c9dc82675947` adds a separate explicit all-ref scan after fetching every remote branch and tag:
- Push workflow `41975711475`: SUCCESS; event scan and explicit all-ref scan passed.
- PR workflow `41975715983`: SUCCESS; event scan and explicit all-ref scan passed.
- Explicit command: `gitleaks detect --source . --log-opts="--all" --redact --exit-code 2 --no-banner`.
- PR log: 816 commits scanned, approximately 1.84 MB, `no leaks found`.
- PR regression `41975716157`: SUCCESS.
- The allowlist remains AND-constrained to `src/prompt-intelligence.js` and the exact localStorage namespace `cerdikgo-prompt-vault-v1`; default Gitleaks rules remain enabled.

This verifies the scanner configuration on PR #74's exact head. It does not rerun the scheduled backup job or prove backup archive creation, Drive upload, or restore. Scheduled backup run `41890146458` remains a historical FAILED run until a later authorized backup and restore drill pass.

## Exact scorecard documentation candidate — 2026-11-05

- PR #60 head `02218e5b079830b1c07c5ca0b68fd40c2dc244c0` passed Auto Pilot `41975609763`, regression/install `41975609893`, Phase 3 `41975609751`, and Hybrid Gateway `41975609793`; all four PR-triggered workflows SUCCESS.
- Auto Pilot is the exact candidate gate; the prior log for `a2373adafa711307e842f2df7f45c0434e61d540` confirms 129/129 tests, strict TypeScript, doctor and Wrangler dry-run. The `02218e5b...` follow-up is documentation-only; its four exact-head workflows all passed.
- PR #60 base snapshot remains `de11d34257005ba72a621312230489a7d161ff53`; current base branch head `637ff536011ed25fc598888f62f520b4cfdccd3c` is two commits ahead. No merge/rebase was performed.
- All seven capability scores remain NOT MEASURED; evidence-credit remains 0/100 until the full mandatory task sets are executed.
- Human Verification remains NOT STARTED. CI, Preview runtime, Android and Production remain separate gates.

Run links:
- https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41975609763
- https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41975609893
- https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41975609751
- https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41975609793
- https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41975711475
- https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41975715983
- https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41975716157


## Security and governance continuation — 2026-11-05 16:25 WIB

- **PR #73 — access-request log minimization:** head `98423d8aa14317052511cc69e98a8341713a3381`, Auto Pilot run 41974840542 SUCCESS. The change replaces the request-ID/email log payload with a fixed event code and adds tests that email, Google subject ID, and ID token are absent from the captured log. Status: VERIFIED on isolated Draft PR; NOT INTEGRATED into Primary. Do not imply the deployed Preview is already remediated.
- **PR #74 — secret scanning:** head `abeca194672349e799bcfdd9d8f9c9dc82675947`, full-history scan run 41975715983 SUCCESS, regression run 41975716157 SUCCESS. The narrow allowlist requires both exact path `src/prompt-intelligence.js` and exact localStorage namespace literal `cerdikgo-prompt-vault-v1`; default Gitleaks rules remain enabled. Explicit all-ref scan covered 816 commits / approximately 1.84 MB and found no leaks. This does not establish backup archive integrity, Drive upload, or restore. Historical scheduled backup run 41890146458 remains FAILED.
- **PR #76 — ClamAV Preview boundary:** head `e02dd2bd186ae3651c75bf5eac4ddd60d89611cd`, run 41991775472 SUCCESS. Tests use a mock Service Binding; no actual scanner runtime or signature database exists. Provisioning is BLOCKED because the connected Cloudflare account API returned HTTP 401 indicating Workers Paid is required for Containers. No billing approval exists; do not upgrade or bypass the scanner.
- **PR #78 — on-demand Actions design:** head `5bbaaae96b2a03ac5cff5b3e93520da974014774`, run 41996461917 SUCCESS. DESIGN ONLY. GitHub Actions is asynchronous and cannot directly satisfy the existing synchronous `FILE_SCANNER` binding. Private staging, job-bound signed callback, quota hard-stop, retention, replay protection, and deletion remain PLANNED / NOT TESTED. Do not store customer files in Git, logs, cache, or Actions artifacts.
- **PR #77 — WPS AI second opinion:** head `960ca4e8536196775831a0ec13d7cfe625007c60`, run 41993439827 SUCCESS. Manual user-operated handoff only. Do not upload confidential, personal, regulated, or commercially sensitive documents to an external AI service without explicit user authorization and review of its data terms. No WPS API or technical read-only guarantee is verified.
- **PR #80 — local Context Bridge Inbox cap:** head `724fdb092d584cead6f34612693de8cb9336c7eb`, run 42002523884 SUCCESS. The 50-item cap limits local in-tab memory growth; it is not a server-side quota or cross-tab control.

No secrets, OAuth settings, DNS, Production resources, remote D1, or billing were modified during this continuation. Keep the scanner fail-closed and gateway `plan_only`.


## Security/availability audit correction — 2026-11-05

- Main scheduled backup run 41890146458 (2026-11-04) and 41695574776 (2026-11-03) both failed in the Gitleaks step before archive creation. Logs explicitly report no .gitleaks.toml and default-rule detection. PR #74's narrow reviewed exception and full-history scan pass on its branch, but remain unintegrated; therefore main backup remains FAILED. No backup archive, Drive upload, or restore is evidenced for those failed runs.
- PR #52 auth implementation uses server-side Google ID-token verification, opaque hashed sessions, HttpOnly/Secure cookies, double-submit CSRF, same-origin checks, D1 allowlist, and role/governance-tier checks. Session TTL is 76 hours; this requires an explicit risk/expiry policy review before broad deployment. Governance migration 0007 is only a Draft PR artifact and has not been applied to remote D1.
- PR #32 voice handler requires env.VOICE_RATE_LIMITER and fails closed if missing. The reviewed wrangler.toml at PR #32 head defines VOICE_RATE_LIMITER only under [previews.ratelimits], with no top-level Production ratelimit binding. If deployed unchanged to Production, the voice endpoint will return 503 rather than operate. This is a verified configuration gap, not an authorization bypass.
- PR #76 file-analysis path requires env.FILE_SCANNER before AI processing and rejects absent/unavailable scanner. The reviewed wrangler.toml does not define a FILE_SCANNER service binding. Scanner runtime is therefore NOT PROVISIONED; fail-closed upload behavior is safer than bypassing malware scanning.
- PR #35 document research and main Core currently hardcode Gemma 4 26B A4B; PR #32 voice hardcodes Workers AI Whisper. No centralized model router/fallback policy or live inference benchmark is verified.
- No OAuth, secrets, DNS, D1, billing, or Production configuration was changed during this review.


## Production authentication control — 2026-11-05

- Main worker.js currently gates Google auth on GOOGLE_AUTH_REQUIRED === "true".
- Main wrangler.toml sets that flag under Preview variables; no repository-level Production default is declared. Cloudflare environment variables configured outside the repository were not accessible, so actual Production auth state is NOT TESTED / NOT VERIFIED.
- This is a P0 configuration assurance gap: unless an out-of-band Production flag is set, repository defaults do not force authentication.
- PR #44 proposes a fail-closed rule based on ENVIRONMENT=production or presence of a D1 DB binding, and adds regression tests. Exact head 30e05c23ce56116d80c3d5b872e3f9b5c7adef91; run 41383765675 SUCCESS, 40/40.
- PR #44 remains DRAFT and unmerged. Do not represent the fix as active in Primary or Production.
- No environment variables, OAuth credentials, secrets, DNS, D1, or Production resources were inspected or changed.
