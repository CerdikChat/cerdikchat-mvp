# ATLAS-9 Decision & Approval Register

Append decisions. General permission to improve code does not authorize privileged external operations.

## Decisions — 2026-11-05
1. Target 100% VERIFIED acceptance across seven competitive dimensions. This is an acceptance target, not a current score or guarantee of superiority over Gemini.
2. Prior percentage ranges remain historical qualitative estimates only; do not report them as measured benchmark scores.
3. Adopt benchmark pilot manifest v0.1 with 35 fixed smoke tasks. It validates coverage and task-rubric structure only; it is not statistically sufficient for final comparative scoring.
4. Preserve exactly nine specialist roles. Optimus Prime remains coordinator, not a tenth specialist.
5. Keep agent gateway `plan_only` until separately approved.
6. Human Verification may begin only after Auto Pilot passes for the exact candidate commit. PR #59 candidate passed; PR #60 candidate still requires its own current gate.
7. No merge, Production deployment, remote D1 write/migration, OAuth/secrets change, DNS change, billing activation, or destructive privileged action without separate explicit approval.
8. Prefer free-tier resources and do not introduce paid dependencies.
9. Security observations in PR #52 and PR #53 are recorded for review; no remote Preview workflow, migration, Google Drive upload, or backup job was triggered by this audit.

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
- PR #59 Auto Pilot candidate: CI VERIFIED; eligible for subsequent human/Preview validation, not itself approval to deploy.
- PR #60 scorecard: draft PR; no merge or deployment approval.
- PR #52 Preview upload and D1 migration 0007: BLOCKED pending separate explicit scoped authorization and review.
- PR #53 external Google Drive upload: remains opt-in/manual; no upload authorization granted in this run.
