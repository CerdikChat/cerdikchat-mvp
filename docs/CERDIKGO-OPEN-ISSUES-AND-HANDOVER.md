# CerdikGo Open Issues & Handover

## Active priority — 2026-11-05

### A. Readiness chain
1. **PR #57** `atlas9/cerdikgo-installation-hardening` — head `570471a9303cda3beb110d04c80445a4db104039`; draft/open/unmerged. Known regression, Phase 3 and hybrid gateway workflows passed.
2. **PR #58** `atlas9/cerdikgo-typescript-foundation` — head `5b482b05e832ed342791763eba7a84d4c9951c34`; draft/open/unmerged. Regression, Phase 3, hybrid gateway and TypeScript workflows passed.
3. **PR #59** `atlas9/cerdikgo-autopilot-readiness` — head `637ff536011ed25fc598888f62f520b4cfdccd3c`; draft/open/unmerged. Readiness `41917635551` and regression/install `41917635482` passed on merge candidate `25f416f68c9db0d2ce5a9a22ad38a003e2e36939`. Eligible for subsequent human/Preview validation; no deployment was performed.
4. **PR #60** `atlas9/cerdikgo-100-percent-scorecard` — latest tested head `84c2d48857436519a9d712e8d3f7987c01397e0f`; draft/open/unmerged. Readiness `41918816079`, regression/install `41918816057`, Phase 3 `41918816053`, and hybrid gateway `41918816105` passed on merge candidate `2629ad5b03bd85a5229ebd88f003a281a63a6206`; 129/129 tests passed. Eligible for subsequent human/Preview validation; no deployment was performed.
5. **PR #61** `atlas9/cerdikgo-admin-governance-security-hardening` — head `17760f85b01e0db2e7a09679324d55adfe1fcf95`; draft/open/unmerged. Isolated security CI `41917776597` passed 99/99 tests and redaction check; regression `41917776653` passed. It is stacked on PR #52 and has not been integrated.

### B. Feature integration dependency map
- UX/product chain: PR #47 (Android UX) → #48 (workspace redesign) → #49 (feature-preserving migration) → #50 (multilingual UI) → #51 (Prompt Intelligence) → #52 (Admin governance). All remain open/unmerged; PR #52 is non-draft and needs security review before acceptance.
- PR #61 is a follow-up security fix stacked on PR #52. Review it with #52 before integration.
- Independent/parallel beta work: PR #53 (backup reconciliation) and #54 (product identity/system unification), both based on the beta-pilot branch.
- Research/document/voice work: PR #34 (research architecture), #35 (document research/access policy), #41 (Voice-to-AI), all based on the PDF/image integration branch. PR #35 was reported non-mergeable at last metadata check.
- Additional parallel controls: PR #42 (agent contracts), #43 (controlled beta fallback), #44 (fail-closed auth default), #45 (mobile protection/connectivity), #46 (controlled autopilot). Review each branch's base and workflow before integration; do not merge a divergent stack by title alone.

## Open technical issues
1. **Benchmark execution:** pilot manifest v0.1 has 35 smoke tasks; full acceptance suites require 100 reasoning, 50 coding, 50 research, 50 governance, 30 workflow, 90 specialist-routing/quality tasks and ecosystem SLO/restore/load evidence. Model scores remain NOT MEASURED.
2. **PR #52 security:** PR #61 proposes tested removal of PII from auth logs, but is not merged. Review 76-hour session lifetime; test revocation/rotation, atomic approval/audit writes, role escalation and concurrent decisions. Preview workflow requires scoped Cloudflare authorization. Migration 0007 needs human-reviewed duplicate preflight and separate Preview D1 authorization.
3. **PR #53 backup:** review Drive OAuth scope, secret access, full-history archive exposure and retention; perform a real restore/checksum drill only in an authorized isolated environment. No upload performed.
4. **Live Web Research:** PR #34 documents provider abstraction but states provider selection/configuration is required. No active provider health or source-retrieval test is evidenced.
5. **Document research:** PR #35 is uploaded-document research; do not label it live web search. Validate source/claim traceability and parser resource limits.
6. **Voice:** PR #41 Preview capability requires Android microphone permission, speech recognition/playback, interruption, network-loss and accessibility tests on actual devices.
7. **Runtime & scale:** Preview health, real Google OAuth, D1 bindings, model availability, load, SLO, backup restore and disaster recovery are not proven by local CI.
8. **Observability:** review 100% head sampling for privacy, retention and operational impact.
9. **Agent architecture:** nine role profiles exist; gateway remains `plan_only`. Independent agents/tools are not enabled.

## Handover format
- Current branch and full SHA:
- Last successful Auto Pilot gate and exact tested checkout/merge SHA:
- Current blockers:
- Changes made and links:
- Tests run/results:
- Security/governance risks:
- Decisions/approvals required:
- Next safe actions:
- Explicitly prohibited actions still on hold:

## Standing controls
No merge, Production deployment, remote D1 write/migration, OAuth/secrets change, DNS change, billing activation, or privileged external operation without separate explicit authorization. Human Verification starts only after the Auto Pilot gate passes for the exact candidate being verified.

## Additional technical findings — 2026-11-05
10. **Document-research evidence integrity (REVIEW REQUIRED).** PR #35 `multimodal/file-analysis.js` validates that a non-null `reference` string occurs in extracted text, but does not independently validate the returned `evidence` text against that source. Add an explicit verbatim excerpt/quote field or a stronger claim-to-excerpt contract and negative tests before assigning full research-quality credit.
11. **Central model routing (REVIEW REQUIRED).** PR #35 document analysis hardcodes the Gemma model and PR #41 voice assistance hardcodes Whisper. Confirm that these routes remain consistent with the central free-only model policy and add tests to prevent silent model-policy drift.
12. **Hybrid connectivity scope (NOT TESTED beyond shell fallback).** PR #45 service worker caches only the static app shell and offline page; it bypasses `/api/` and authorization-bearing requests. This is a safe offline-shell fallback, not offline chat, peer-to-peer connectivity, radio mesh, or 3-mile offshore communications. No radio hardware/mesh transport or coverage test is evidenced.
13. **Voice device acceptance (NOT TESTED).** PR #41 limits audio uploads to 3 MB and 60 seconds and a fixed MIME/signature allowlist, then uses Workers AI Whisper. Android recorder MIME compatibility, microphone permissions, playback, interruption, network-loss recovery and accessibility still require real-device tests.

## Handover update — 2026-11-05: PR #62–#64 verification

### Current verified candidate heads
- PR #60 scorecard/records: atlas9/cerdikgo-100-percent-scorecard, head d90c492116729f886a9adca329c581151e1884f5; readiness 41919509283; companion runs 41919509234, 41919509532, 41919509348; 129/129 tests.
- PR #62 identity: atlas9/cerdikgo-atlas9-identity-fix, head 1fa32453e9569b136ec890b7c32562dda510612f; four exact-head workflows passed: 41921781529, 41921781474, 41921781561, 41921781630.
- PR #63 MCP hardening: atlas9/cerdikgo-mcp-security-hardening, head 4c5276f2ff5307949f912451d554d9be879223b6; four exact-head workflows passed: 41945833238, 41945833224, 41945833375, 41945833236; 139/139 tests.
- PR #64 Connectors UI: atlas9/cerdikgo-connectors-menu, head 929e5bcf9d2be683c94b9cd882209ce194fc9119; four exact-head workflows passed: 41944458563, 41944458347, 41944458558, 41944458354; 134/134 tests.
- PR #61 auth-log privacy: head 17760f85b01e0db2e7a09679324d55adfe1fcf95; push-triggered security/regression runs 41917776597 and 41917776653 passed; 99/99 security tests.

### Blockers and NOT TESTED items
1. PR #64 Preview runtime: BLOCKED because no workflow_dispatch action is available through the connected GitHub tools. No Preview URL was generated; secrets were not inspected. A maintainer can manually dispatch “CerdikGo PR #64 Isolated Preview” on branch atlas9/cerdikgo-connectors-menu after checking the configured Cloudflare token's least-privilege scope and Preview D1 isolation.
2. Android acceptance: NOT TESTED; requires the Preview URL and device testing for menu visibility, dialog, keyboard, focus, touch targets and theme behavior.
3. Model benchmark: NOT TESTED. Seven measured scores remain unmeasured; the 35-task v0.1 manifest is structural smoke coverage only.
4. Live Web Research: NOT TESTED until a provider is selected/configured and source freshness, citation precision and failure modes are tested.
5. Document evidence integrity: REVIEW REQUIRED; require verbatim source excerpts and claim-to-source checks, not only a reference string present in extracted text.
6. Backup/recovery: NOT TESTED for restore; PR #53 bundle verification and SHA-256 generation do not prove a restore works. Google Drive upload remains opt-in.
7. Voice: NOT TESTED on real Android devices, including recorder MIME, permissions, playback, interruption and network-loss handling.
8. Scale/SLO: NOT TESTED; no 100-concurrent-user 30-minute load report, 7-day Preview availability, p95/p99 latency, or restore RPO/RTO evidence.
9. PR #52 governance: review 76-hour session TTL, approval atomicity, role escalation and D1 migration 0007; do not perform remote migration without explicit authorization.
10. Maintenance: resolve Node.js 20 action deprecation and punycode warning in a separate tested maintenance change.

### Next safe actions
- Implement a deterministic benchmark runner that consumes the fixed task manifest, invokes only the approved Workers AI binding in an authorized test environment, records raw outputs and rubric decisions, and produces per-dimension scores. Do not claim Gemini comparison until equivalent access/configuration is available.
- Add evidence excerpt/quote validation and negative tests to document research.
- Complete read-only review and isolated CI for RBAC/session expiry/approval atomicity.
- Dispatch the isolated Preview only through an authorized maintainer workflow after credential scope review; then run Android acceptance.
- Run an isolated backup restore drill and controlled load/SLO tests.
- Re-run Auto Pilot for every exact candidate before Human Verification.

### Explicitly unchanged controls
No merge, Production deployment, remote D1 write/migration, OAuth/secrets/DNS change, billing, MCP activation, or independent agent execution. Gateway remains plan_only; exactly nine specialist profiles remain.
