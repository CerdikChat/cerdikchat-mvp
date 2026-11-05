# ATLAS-9 Testing and QA Register

Append-only register. Results are commit-scoped. A successful CI workflow is not Preview, Android or Production acceptance.

## 2026-11-06 — Exact-head verification and blocker review

### Main-based candidates

| PR | Candidate SHA | Workflow run IDs | Result | Scope |
|---|---|---|---|---|
| #89 identity | `3fd1fc2d01a67eef8053ba64fcd9a9f59b1ed3f7` | 42078347572, 42078347480, 42078347610 | VERIFIED | 37/37, identity contract and install/preflight checks |
| #90 installation | `4c2ef0438be4e8f85225c059887d078be44826e2` | 42078357659, 42078357621, 42078357598 | VERIFIED | 37/37; Wrangler dry-run and workflow safety scan |
| #91 workspace order | `023db6f9b8f1b8078cdf6e7d154316e78b774d5e` | 42079473235 | VERIFIED | 91/91; test/docs-only candidate on non-main base |
| #92 auth fail-closed | `0a5fdea7f1c1c4091ff5fb674a1bac6bbb6ce8fb` | 42081225451, 42081225364, 42081225068 | VERIFIED | 41/41; Wrangler dry-run and safety scan |
| #93 query redaction | `276430ca45b91c6bfe418c712555427c83f35624` | 42081620404, 42081620294, 42081620327 | VERIFIED | 37/37; Wrangler dry-run and safety scan |

### Scorecard candidate PR #60

- Exact candidate: `85234b10d0c304d41c8e56b1a9d898742a8a7d49`.
- Auto Pilot: 42082182759 — SUCCESS.
- Regression/install: 42082182845 — SUCCESS.
- Phase 3: 42082183084 — SUCCESS.
- Hybrid Gateway: 42082183236 — SUCCESS.
- Regression count: 129 passed, 0 failed.
- `npm run doctor`: PASS.
- Strict TypeScript contracts: PASS.
- Wrangler 4.153.0 dry-run: PASS.
- Workflow deployment safety scan: PASS.
- Links: https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/42082182759 ; https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/42082182845 ; https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/42082183084 ; https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/42082183236.
- PR: https://github.com/CerdikChat/cerdikchat-mvp/pull/60.
- Limitation: PR #60 targets `atlas9/cerdikgo-autopilot-readiness`; independent compare to main is DIVERGED, 370 ahead / 3 behind, merge base `8eac9730c601f95892549d20f4e8245874556492`. Keep Draft and do not auto-rebase/merge.

### Backup scan PR #74

- Candidate: `abeca194672349e799bcfdd9d8f9c9dc82675947`.
- Full-history Gitleaks run 41975715983: SUCCESS; 816 commits scanned; no leaks.
- Regression run 41975716157: SUCCESS.
- PR: https://github.com/CerdikChat/cerdikchat-mvp/pull/74.
- Earlier scheduled backup runs 41695574776 and 41890146458 were FAILED. The Gitleaks correction does not prove a new scheduled archive or restore.

### Blocked / untested QA

| Item | Status | Required evidence |
|---|---|---|
| PR #88 v2.0 workspace | BLOCKED | Clean base reconciliation, UI regression, screenshot review, Android acceptance |
| PR #68 connector integration | BLOCKED | Resolve non-mergeable branch and verify connector permission boundaries |
| PR #81 WPS bridge | BLOCKED | Resolve non-mergeable branch; Android and real file round-trip |
| Document scanner runtime | BLOCKED | Private scanner binding, EICAR/infected/clean file tests; no bypass |
| Voice Android | NOT TESTED | Android Chrome microphone, playback, permission and transcription test |
| Live Web Research | NOT TESTED | Actual retrieval, freshness, citation precision and claim entailment |
| Backup restore | NOT TESTED | Restore drill, SHA-256, RPO/RTO evidence |
| Preview end-to-end | NOT TESTED | Authenticated user journeys on isolated Preview |
| Edge scale | NOT TESTED | 100 concurrent users for 30 minutes; p95/p99 and error rate |
| Seven-day SLO | NOT TESTED | Time-series availability and error budget |
| Seven-dimension model benchmark | NOT TESTED | Complete benchmark sample and scored outputs |

### Warning and failure handling

- A workflow that has no exact-head run is NOT TESTED, not implicitly passed.
- A PR with `mergeable=false` is BLOCKED even if an older workflow passed.
- Node.js 20 action deprecation and Node `punycode` deprecation are warnings, not test failures; track dependency/action upgrades separately.
- TypeScript is NOT CONFIGURED on legacy JavaScript-only candidates and must not be reported as passed.

### Human Verification gate

Do not start Human Verification unless the exact candidate commit has a successful Auto Pilot readiness gate and all required dependent checks are green. Even then, record Preview runtime, Android acceptance and Production readiness separately.
