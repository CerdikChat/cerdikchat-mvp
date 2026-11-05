# ATLAS-9 Decision & Approval Register

Append decisions. General permission to improve code does not authorize privileged external operations.

## Decisions — 2026-11-05
1. Target 100% VERIFIED acceptance across seven competitive dimensions. This is an acceptance target, not a current score or guarantee of superiority over Gemini.
2. Prior percentage ranges remain historical qualitative estimates only; do not report them as measured benchmark scores.
3. Adopt benchmark pilot manifest v0.1 with 35 fixed smoke tasks. It validates coverage and task-rubric structure only; it is not statistically sufficient for final comparative scoring.
4. Preserve exactly nine specialist roles. Optimus Prime remains coordinator, not a tenth specialist.
5. Keep agent gateway `plan_only` until separately approved.
6. Human Verification may begin only after Auto Pilot passes for the exact candidate commit. PR #59 and PR #60 gates passed for their recorded merge candidates.
7. No merge, Production deployment, remote D1 write/migration, OAuth/secrets change, DNS change, billing activation, or destructive privileged action without separate explicit approval.
8. Prefer free-tier resources and do not introduce paid dependencies.
9. PR #52 auth-log privacy issue has a tested remediation proposal in PR #61. Do not treat it as integrated until PR #61 is reviewed and merged through the approved dependency process.
10. PR #52 Preview upload and D1 migration 0007 remain blocked pending separate explicit scoped authorization and review. PR #53 Google Drive upload remains opt-in/manual; no upload authorization granted in this run.

## Approval record template
- Decision/request:
- Requesting authority and exact scope:
- Environment and resource:
- Date/time:
- Explicit approval evidence:
- Implemented by / commit:
- Verification and rollback:
- Status: PLANNED / APPROVED / REJECTED / EXPIRED.

## Current approval state
- PR #59 head `637ff536011ed25fc598888f62f520b4cfdccd3c`: Auto Pilot VERIFIED on merge candidate `25f416f68c9db0d2ce5a9a22ad38a003e2e36939`; eligible for subsequent Preview/human validation, not itself approval to deploy.
- PR #60 head `f36cafa56f2d2b99e88eecf88a2c615859f839fe`: Auto Pilot VERIFIED on merge candidate `b46485d`; readiness `41918584320` and companion checks passed; eligible for subsequent Preview/human validation, not itself approval to deploy.
- PR #61 auth-log privacy remediation: isolated CI VERIFIED; draft/open/unmerged, not yet integrated into PR #52.
- PR #52 Preview upload and D1 migration 0007: BLOCKED pending separate explicit scoped authorization and review.
- PR #53 external Google Drive upload: remains opt-in/manual; no upload authorization granted in this run.

## Decision and approval reconciliation — 2026-11-05

1. Exact-head CI status is VERIFIED for PR #62 head 1fa32453e9569b136ec890b7c32562dda510612f (runs 41921781529, 41921781474, 41921781561, 41921781630), PR #63 head 4c5276f2ff5307949f912451d554d9be879223b6 (runs 41945833238, 41945833224, 41945833375, 41945833236), and PR #64 head 929e5bcf9d2be683c94b9cd882209ce194fc9119 (runs 41944458563, 41944458347, 41944458558, 41944458354).
2. Human Verification is eligible only for those exact candidates whose Auto Pilot readiness run passed; it has not been started in this audit. A later commit changes the candidate and requires a new exact-SHA gate.
3. PR #64 Preview workflow is manual-dispatch only. The connected GitHub capability set does not expose workflow_dispatch; no Preview deploy was initiated. The workflow's secret checks have not been evaluated.
4. Keep exactly nine specialist roles; Optimus Prime is coordinator, not a tenth agent. Keep Agent Gateway plan_only.
5. No merge, Production deployment, remote D1 write/migration, OAuth/secrets change, DNS change, billing activation, MCP activation, or privileged external action is approved by this audit.
6. Free-tier/Workers AI-only policy remains in force. Do not add paid dependencies or enable external providers without a separate decision.
7. The 100% VERIFIED goal remains a per-dimension acceptance threshold, not a measured score or claim of superiority over Gemini.

## Decision update — 2026-11-05: Preview evidence and new draft PRs

1. PR #52 Preview creation is VERIFIED for source commit 9be9a8c3f6df416d66452c3d8c69c5112c853207 via run 41825376685. It uses cerdikchat-staging D1 ID 79267e63-e57f-4237-8b88-f1e477397771. This is not Production and is not PR #64's Connectors candidate. Runtime health and Android acceptance remain unverified.
2. PR #65 document evidence hardening is regression-verified (95/95; runs 41949338154 and 41949364570), but no exact-head Auto Pilot readiness gate has run. Human Verification is not authorized to start.
3. PR #66 observability query redaction is regression-verified (102/102; run 41949598277) and Wrangler dry-run verified (41949598379, 41949605643), but no Preview deployment or exact-head Auto Pilot readiness gate has run. Human Verification is not authorized to start.
4. PR #66 preserves 100% log sampling and persistence while enabling query-string redaction. Do not silently change sampling/retention policy without a separate decision.
5. No additional Preview deployment was initiated by this audit. No merge, Production deploy, remote D1 write/migration, OAuth/secrets/DNS change, billing, or other privileged action was performed.

## Readiness decision — 2026-11-05: PR #65/#66 exact candidates

- PR #65 final head 154301128cc8824b76969b5da603807f5125b414 passed exact-head readiness runs 41949995940 and 41949989419 (95/95). It is eligible for Human Verification; Human Verification has not started.
- PR #66 final head 721ef9a7eb7068dcbe40ccad9df0d5b188e6e3a1 passed exact-head readiness runs 41950007358 and 41950001066 (102/102); config dry-run 41950007360 passed. It is eligible for Human Verification; Human Verification has not started.
- These legacy JS gates explicitly mark TypeScript NOT CONFIGURED. They do not prove Preview runtime or Android acceptance.
- Existing PR #52 Preview lacks FILE_SCANNER and VOICE_RATE_LIMITER bindings; document and voice routes must remain fail-closed until approved service/binding configuration exists.

## Correction — 2026-11-05: Preview voice binding
For the PR #52 deployed commit, voice transcription uses the existing CHAT_RATE_LIMITER binding, so no separate VOICE_RATE_LIMITER provisioning is required for that source version. Do not provision a new limiter based solely on the PR #41 branch contract. Voice runtime/Android acceptance remains NOT TESTED; FILE_SCANNER remains a confirmed missing binding and must not be bypassed.

## Evidence integrity decision record — 2026-11-05
The first PR #65 implementation commit 0be3cfeaa52dcd639bf62f62bba13fb53825b66c failed regression due to a literal escaped newline in the test source (run 41949291912; 35 pass, 1 fail). The implementation was corrected in commit 2529b05efa4fd02883eb493a2683218a7be2e83f and re-tested at 95/95. Final candidate 154301128cc8824b76969b5da603807f5125b414 passed exact-head readiness. The failed attempt remains visible in Git history and the QA register.
