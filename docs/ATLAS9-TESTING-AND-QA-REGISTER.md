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


## 2026-11-06 — PR #94 first CI failure and transparent correction

- Candidate initially tested: `005402e41eb807c0ec44e2629fef1c7d16325341`, branch `atlas9/cerdikgo-main-governance-registers-20261106`, PR #94.
- Regression run `42114199024`: FAILED; 36 passed / 1 failed. The single failure was the new structural test requiring a dated entry in `docs/CERDIKGO-SEVEN-DIMENSION-BENCHMARK.md`; the benchmark specification lacked that date marker. This was a documentation/test-fixture mismatch. No product runtime test failed.
- Exact failure log: https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/42114199024.
- Correction: appended a dated baseline and transparent failure note to the benchmark document; correction commit `68db999e24f854aa9137904054f53433a865b8a1`.
- Status: correction commit recorded; retest on the final exact branch head is PENDING. Do not report PR #94 as green until that exact-head run succeeds.
- No prior failure was removed or overwritten. No merge, deployment, D1 operation, credential change, DNS change or billing action occurred.


## 2026-11-06 — Auto Pilot run 6 audit append

- Status: VERIFIED for the exact pre-append candidate only; this append creates a new documentation-only commit that must receive its own exact-head CI result.
- Repository: `CerdikChat/cerdikchat-mvp`; main SHA `bc6545d6d19fd4b749d0b65fefba3d74775e0221`; branch `atlas9/cerdikgo-main-governance-registers-rerun-20261106`; PR #95 head before this append `7c3d8b19a10d2927ec546d6ec7222eb4d868aa20` (Draft, base main, 20 commits ahead, 0 behind, GitHub mergeable=true).
- Open PR inventory: 69. This is an inventory count, not a count of verified or merge-ready changes.
- Exact-head Auto Pilot workflow `42144736797`: SUCCESS. Exact-head regression workflow `42144736592`: SUCCESS. Both tested checkout SHA `7c3d8b19a10d2927ec546d6ec7222eb4d868aa20`.
- Commands verified by workflow logs: `npm install --ignore-scripts --no-audit --no-fund --package-lock=false`; `node --check worker.js`; `node --check auth/google-auth.js`; `npm test`; `npx --yes wrangler@4.153.0 deploy --dry-run --outdir /tmp/cerdikgo-autopilot`; readiness-workflow safety assertion.
- Results: 41/41 tests passed, 0 failed; dependency install PASS; JavaScript syntax checks PASS; Worker bundle dry-run PASS (44.72 KiB upload, 12.32 KiB gzip); safety assertion PASS. TypeScript is NOT CONFIGURED and is not counted as passed.
- Workflow links: https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/42144736797 and https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/42144736592.
- The safety assertion inspects the readiness workflow file itself; it is not a repository-wide proof that every workflow is free of privileged commands. It found no non-dry-run deploy or remote D1 migration in that gate.
- Non-blocking warnings: Node `punycode` deprecation; GitHub Actions checkout/setup-node v4 report Node 20 deprecation and execution under Node 24. Evaluate supported action upgrades in a separate CI-only change.
- The earlier PR #94 structural failure remains preserved: run `42114199024`, 36/37, caused by the missing benchmark date marker; correction was made and later candidates passed. Do not erase the failure.
- No merge, deployment, remote D1 read/write/migration, OAuth/secret/DNS change, billing action, or autonomous agent execution occurred. Gateway remains `plan_only`; exactly nine specialist profiles; Optimus Prime is coordinator, not a tenth specialist.
- Human Verification was not started. Preview runtime, Android acceptance, live model inference, backup restore and Production readiness remain separate and NOT TESTED/BLOCKED.

### Failure-first and regression notes
- Main regression workflow is `npm test` on PR-to-main and push events. PR #95 adds a feature-branch-only Auto Pilot workflow that installs without lifecycle scripts or lockfile mutation, syntax-checks Worker/auth modules, runs tests, performs Wrangler dry-run, and checks that its own gate file contains no non-dry-run deploy or remote D1 migration.
- Exact current PR #95 candidate test count is 41, not the earlier 37-test snapshot. Run `42144736797` and run `42144736592` both show 41 passed / 0 failed.
- Workflow output includes expected negative-test log markers such as `DIVISION_BY_ZERO`, `AI_BINDING_MISSING`, and sanitized `AI_REQUEST_FAILED`; these are test fixtures and not failed tests.
- Node deprecation warnings are non-blocking but should be tracked: `punycode` DEP0040 and actions/checkout@v4 + setup-node@v4 Node 20 runtime deprecation warning.
- Post-append exact-head CI is PENDING at the time this entry is committed. Do not transfer the pre-append run result to the new SHA.


## 2026-11-06 — Backup security follow-up

- Status: VERIFIED for the cited PR #74 candidate; main scheduled backup remains FAILED. This is a new append-only record; no earlier failure is removed.
- Main backup workflow run `42086628529` (2026-11-05 18:41:17 UTC) FAILED at Gitleaks 8.24.3. Three findings were reported; archive creation, artifact publication and Google Drive upload were skipped. The main branch did not load PR #74's unmerged `.gitleaks.toml`.
- PR #74 exact candidate: `9f3940efeeea0a7d6ea85f6e48969d7120d84644`, branch `atlas9/backup-gitleaks-allowlist-20261105`, Draft, base main `bc6545d6d19fd4b749d0b65fefba3d74775e0221`, 9 commits ahead / 0 behind.
- PR #74 full-history scan run `42148160740`: SUCCESS; Gitleaks 8.24.3 scanned 1,093 commits / approximately 2.55 MB across fetched refs; no leaks found. PR regression run `42148160744`: SUCCESS, 38/38 passed. Event-scoped PR scan examined 9 commits / approximately 12.97 KB and also found no leaks.
- Evidence: https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/42148160740 and https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/42148160744. PR link: https://github.com/CerdikChat/cerdikchat-mvp/pull/74.
- Three narrow, line-targeted allowlists require exact file path AND exact literal; default Gitleaks rules remain enabled. Two Git commit SHA findings in the master ledger were verified through GitHub as commit objects, not credentials. No global allowlist was added.
- PR #95 pre-append exact candidate `e6972d5e96d99920adc8996ad55ac83deb5fc325` had Auto Pilot run `42147411322` and regression run `42147410943`, both SUCCESS (41/41). This register append creates a new PR #95 head; its exact-head gate must run again before readiness can be carried forward.
- No backup archive, Drive upload, restore drill, merge, deployment, D1 operation, credential change or billing action occurred.

### Backup scan failure and recovery of the scan gate
- PR #74 intermediate candidate `582d126a19e7b12075725ce283666deef3d3be4f`: run `42147733761` failed at shell allowlist assertion (double-escaped path); regression `42147733732` passed.
- Candidate `7e340fe97ac63e50032ae1db101243973ba2157b`: event-scoped scan found no leaks, but all-ref scan run `42147835356` found two commit-SHA false positives after 1,090 commits. Diagnostics were initially absent because verbose output was disabled.
- Candidate `74103fb6d0b3568014f16b06121ea13168da6c37`: run `42148073057` failed before scan at another double-escaped path assertion; regression `42148073068` passed.
- Candidate `9f3940efeeea0a7d6ea85f6e48969d7120d84644`: final exact-head PR scan `42148160740` passed 1,093-commit all-ref scan; regression `42148160744` passed 38/38. All failures remain in history.
