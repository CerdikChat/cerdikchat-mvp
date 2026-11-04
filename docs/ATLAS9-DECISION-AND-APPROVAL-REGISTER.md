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
