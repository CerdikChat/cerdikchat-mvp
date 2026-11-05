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

## Handover correction — 2026-11-05: primary Preview and new hardening PRs

### Existing primary Preview
- PR #52 source head 9be9a8c3f6df416d66452c3d8c69c5112c853207 was deployed as Preview by workflow 41825376685.
- Stable URL: https://atlas9-prompt-intelligence-mvp-cerdikchat-mvp.ngyoonseong.workers.dev .
- Immutable deployment URL: https://29f5c85f-cerdikchat-mvp.ngyoonseong.workers.dev .
- D1 is isolated cerdikchat-staging ID 79267e63-e57f-4237-8b88-f1e477397771. No HTTP health or Android acceptance is evidenced.
- This deployed Preview does not include PR #64 Connectors UI or PR #65/66 changes.

### New open draft PRs
- PR #65: https://github.com/CerdikChat/cerdikchat-mvp/pull/65 — branch atlas9/cerdikgo-document-evidence-integrity, head 2529b05efa4fd02883eb493a2683218a7be2e83f. Regression 95/95 (runs 41949338154, 41949364570). No Auto Pilot gate; Human Verification BLOCKED. Base is PR #35 branch; PR #35 remains dirty against PR #32.
- PR #66: https://github.com/CerdikChat/cerdikchat-mvp/pull/66 — branch atlas9/cerdikgo-observability-redaction, head 1efff727f6c208d3c030b1162f2065abad5bdf7a. Regression 102/102 (41949598277); Wrangler config dry-run passed twice (41949598379, 41949605643). No Preview deploy and no Auto Pilot gate; Human Verification BLOCKED.

### Updated blockers
1. Existing Preview reports redact_query_string=false; PR #66 proposes the correction but it is not deployed.
2. PR #52 session TTL remains 76 hours and requires explicit policy review.
3. PR #52 stress campaign is local in-process simulation, not real edge load.
4. PR #53 backup/restore remains NOT TESTED; no current-head backup workflow run or restore drill.
5. PR #64 Connectors menu remains unverified on the deployed primary Preview; its own workflow has not been dispatched.
6. Live Web Research provider remains unconfigured; document evidence hardening does not enable web search.
7. Android Voice, document scanning UX, offline chat/radio mesh, load/SLO and disaster recovery remain NOT TESTED.

Next actions: obtain exact-head Auto Pilot gates for PR #65/#66; resolve PR #35 base conflict; after approval, deploy only the isolated Preview for PR #64/PR #66; run health and Android tests; verify log redaction; perform isolated restore and edge load testing.

## Final readiness update — 2026-11-05: PR #65/#66

- PR #65 final head 154301128cc8824b76969b5da603807f5125b414: Auto Pilot legacy readiness passed on push run 41949989419 and PR run 41949995940; regression runs 41949989433 and 41949995918 passed. 95/95 tests. Eligible for Human Verification; not started.
- PR #66 final head 721ef9a7eb7068dcbe40ccad9df0d5b188e6e3a1: Auto Pilot legacy readiness passed on push run 41950001066 and PR run 41950007358; regression 41950000882 and Wrangler dry-run 41950007360 passed. 102/102 tests. Eligible for Human Verification; not started.
- Both legacy gates record TypeScript NOT CONFIGURED and do not claim it passed. They are JavaScript branches with repository preflight, regression, Wrangler dry-run and safety scan.

### Primary Preview binding blocker
- Preview from PR #52 commit 9be9a8c3f6df416d66452c3d8c69c5112c853207 is available at https://atlas9-prompt-intelligence-mvp-cerdikchat-mvp.ngyoonseong.workers.dev .
- Its deployment metadata does not list FILE_SCANNER or VOICE_RATE_LIMITER. Document analysis and voice transcription are expected to fail closed. No fake scanner or rate-limit bypass should be used.
- PR #66 redaction change is not deployed to this Preview. PR #64 Connectors UI is also not deployed to this Preview.

Next actions: start Human Verification only for the exact PR #65/#66 candidates if desired; first resolve Preview bindings and run isolated Preview/Android checks. Continue to keep all Production and privileged operations blocked.

## Correction — 2026-11-05: Preview voice dependency
The primary PR #52 Preview uses multimodal/voice-assistance.js that calls CHAT_RATE_LIMITER, and CHAT_RATE_LIMITER is present in the deployment metadata. The earlier note that VOICE_RATE_LIMITER was missing and blocks this deployed voice route was incorrect; that binding belongs to a different PR #41 branch version. Voice runtime and Android acceptance remain NOT TESTED. FILE_SCANNER is still missing and document analysis remains fail-closed until a private scanner Service Binding is provisioned and verified.

## Transparent remediation history — 2026-11-05
PR #65 first implementation commit 0be3cfeaa52dcd639bf62f62bba13fb53825b66c failed run 41949291912 (35 pass, 1 fail) due to a literal escaped newline in tests/worker.test.mjs:587; an over-escaped evidence whitespace regex was also corrected. Commit 2529b05efa4fd02883eb493a2683218a7be2e83f passed 95/95 in runs 41949338154 and 41949364570. Final head 154301128cc8824b76969b5da603807f5125b414 passed readiness runs 41949989419 and 41949995940. Keep this failed intermediate commit in the audit trail.

## Identity parity blocker — 2026-11-05
The primary Preview at PR #52 head 9be9a8c3f6df416d66452c3d8c69c5112c853207 still has the legacy worker.js prompt: ATLAS coordinator plus seven specialist labels. It does not implement the canonical nine specialist registry or Optimus Prime coordinator identity. PR #62 has the fix and passed 4/4 CI but is not merged/deployed. Keep this as FAILED for current Preview identity parity. Next action: integrate PR #62 through the approved branch chain, then run exact-head Auto Pilot and isolated Preview validation; do not deploy or merge as part of this audit.
