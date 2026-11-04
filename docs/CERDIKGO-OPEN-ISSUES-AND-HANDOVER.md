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
