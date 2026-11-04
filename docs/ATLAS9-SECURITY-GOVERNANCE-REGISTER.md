# ATLAS-9 Security & Governance Register

Append findings with exact branch/commit and reproducible evidence. Never copy secrets, tokens, cookies, personal data, or sensitive log payloads into this register.

## Initial repository review — 2026-11-05

### Current baseline
- PR #59 candidate keeps the agent gateway `plan_only`; specialist definitions remain read-only and non-executing.
- PR #59 CI candidate passed installation preflight, strict TypeScript contracts, 127 automated tests, and the workflow safety scan.
- This is not a complete penetration test or a remote-runtime security certification.
- `wrangler.toml` declares observability with `head_sampling_rate = 1` (100% sampling). Review log content, retention, access controls and data minimization before treating this as privacy-cleared.
- Preserve exactly nine specialist roles; Optimus Prime is coordinator, not a tenth specialist.

### Findings requiring review — PR #52 `atlas9/admin-governance-control-center` head `9be9a8c3f6df416d66452c3d8c69c5112c853207`
1. **MEDIUM — PII in authentication logs (FAILED / remediation required).** The branch's `auth/google-auth.js` logs `ACCESS_REQUEST_SUBMITTED` with both `requestId` and `email`. This conflicts with the privacy-oriented logging approach elsewhere in the repository. Replace with a fixed non-identifying event code; keep request details in access-controlled D1 only.
2. **REVIEW REQUIRED — Session lifetime change.** The branch changes `SESSION_TTL_SECONDS` from 8 hours to 76 hours and grants access-request approvals for 76 hours. Require a documented threat/risk rationale, session revocation/rotation tests, and explicit expiry policy before acceptance.
3. **BLOCKED — Preview workflow side effect.** `.github/workflows/preview-upload.yml` invokes `wrangler preview` on pushes to the governance branch using `CLOUDFLARE_API_TOKEN`. This creates/updates a remote Preview resource. Do not trigger or rely on it until the token's least-privilege scope, target Worker, Preview D1 isolation, and explicit Preview authorization are verified.
4. **BLOCKED — D1 migration 0007.** The migration adds governance columns/tables and a unique partial index for one pending request per email. The PR includes a read-only duplicate preflight; do not execute remote D1 reads/writes or apply the migration in this automation. A human must review duplicate results and explicitly authorize any Preview migration.
5. **REVIEW REQUIRED — Admin approval path.** Inspect atomicity of account upsert, request status update and audit event, plus role-escalation, CSRF, same-origin, concurrent decision and audit-failure negative tests. Do not infer full RBAC assurance from UI visibility or happy-path tests.

### Findings requiring review — PR #53 `atlas9/branch-reconciliation` head `142f4d8a893ba81d5f926da65f53b9e077ad1cad`
- **REVIEW REQUIRED — Backup secret scope.** Google Drive upload is optional and requires a manual dispatch input set to true, but it depends on OAuth client secret, refresh token and Drive folder ID. Verify least-privilege OAuth scope, secret access policy, destination ownership and revocation plan before enabling upload.
- **REVIEW REQUIRED — Backup content sensitivity.** The workflow builds a full Git bundle across refs/history. Gitleaks runs before archive creation, but a clean scan is not proof that historical credentials or private data are absent. Review history and artifact access/retention before external upload.
- **PARTIALLY VERIFIED — Backup integrity.** Git bundle verification and SHA-256 manifest creation are present; Drive upload checks returned file ID and byte size. A restore drill with checksum verification after download is still required.
- The workflow's default manual input leaves Drive upload off. No backup workflow was triggered by this audit.

### Research and multimodal boundaries
- PR #34 describes a bounded live-search provider adapter but states that a production search provider must be selected/configured separately. Live Web Research is therefore NOT TESTED / NOT VERIFIED as an active provider.
- PR #35 adds structured research on user-supplied documents. This is not evidence of live web retrieval or independent source verification.
- File-analysis code has negative tests for authentication, CSRF, MIME/signature mismatch, size, encrypted PDFs, scanner unavailability and non-persistence. These tests are useful evidence, but parser hardening, polyglot files, extraction resource limits, scanner runtime and retention still need review.
- Voice capability in PR #41 is described as Preview capability; real-device microphone/speech playback acceptance remains NOT TESTED.

## Finding template
- ID / date / severity:
- Component and affected branch/commit:
- Reproduction and evidence:
- Impact and likelihood:
- Mitigation / owner:
- Verification test and result:
- Residual risk / approval:
- Status: VERIFIED / FAILED / BLOCKED / NOT TESTED / PLANNED.
