# ATLAS-9 Testing & QA Register

Append every test execution. Never mark a test passed without its exact candidate SHA, run ID and evidence.

## Evidence update — 2026-11-05

| PR / candidate | Workflow run | Result | Evidence / interpretation |
|---|---:|---|---|
| PR #57 head `570471a9303cda3beb110d04c80445a4db104039` | `41875508518` | VERIFIED / success | Regression and installation checks completed successfully |
| PR #57 same head | `41875508872` | VERIFIED / success | ATLAS-9 Phase 3 regression completed successfully |
| PR #57 same head | `41875508705` | VERIFIED / success | Hybrid gateway tests completed successfully |
| PR #58 head `5b482b05e832ed342791763eba7a84d4c9951c34` | `41876151107` | VERIFIED / success | Regression and installation checks completed successfully |
| PR #58 same head | `41876151036` | VERIFIED / success | ATLAS-9 Phase 3 regression completed successfully |
| PR #58 same head | `41876151233` | VERIFIED / success | Hybrid gateway tests completed successfully |
| PR #58 same head | `41876151056` | VERIFIED / success | TypeScript foundation workflow completed successfully |
| PR #59 corrected head `637ff536011ed25fc598888f62f520b4cfdccd3c` | `41917635551` | VERIFIED / success | Readiness gate; exact tested merge candidate `25f416f68c9db0d2ce5a9a22ad38a003e2e36939`; all steps passed |
| PR #59 corrected head, same candidate | `41917635482` | VERIFIED / success | Regression/install workflow completed successfully |
| PR #59 earlier head `de11d34257005ba72a621312230489a7d161ff53` | `41877325709` | FAILED / superseded | False-positive safety scan; install, typecheck and 127 tests passed |
| PR #60 head `6b24a410de3925f649189fba6450265be7318236` | `41917922881` | VERIFIED / success | Readiness gate; exact tested merge candidate `26cd4038e4d9ef79bbe1320dc1b8fb3b290687b0`; all steps passed |
| PR #60 same candidate | `41917922855` | VERIFIED / success | Regression/install workflow completed successfully |
| PR #60 same candidate | `41917922823` | VERIFIED / success | ATLAS-9 Phase 3 regression completed successfully |
| PR #60 same candidate | `41917922865` | VERIFIED / success | Hybrid gateway tests completed successfully |
| PR #60 earlier branch state | `41917595755` | FAILED / superseded | Branch push used stale inherited readiness workflow; PR #60 branch was synced to corrected PR #59 workflow before successful runs |
| PR #60 benchmark additions | `41917922881` | VERIFIED / structural only | 129/129 tests passed, including 35-task manifest structure tests; no model inference benchmark executed |
| PR #61 head `17760f85b01e0db2e7a09679324d55adfe1fcf95` | `41917776597` | VERIFIED / success | 99/99 auth/governance tests passed and auth log redaction source check passed |
| PR #61 same head | `41917776653` | VERIFIED / success | Existing regression workflow completed successfully |

## Root cause and corrective actions
1. PR #59 readiness grep originally matched its own literal command pattern. The regex fragments were split; PR #59 head `637ff536011ed25fc598888f62f520b4cfdccd3c` now passes on merge candidate `25f416f68c9db0d2ce5a9a22ad38a003e2e36939`.
2. PR #60 initially carried the stale parent workflow. Its readiness workflow file was synchronized to the corrected PR #59 version in commit `6b24a410de3925f649189fba6450265be7318236`; both branch-push and PR-merge readiness checks then passed.
3. PR #61 removes email/request identifiers from access-request auth logs and adds a regression assertion. Its isolated CI passes; it remains a draft PR and is not merged into PR #52.

## Remaining verification
- Execute the fixed model benchmark against actual models; the 35-task manifest test validates structure only.
- Full seven-dimension suites, Preview runtime, real Google OAuth, Android acceptance, voice hardware, live research, load, backup restore and DR remain NOT TESTED unless separately recorded with evidence.
- PR #52 governance integration still needs security review; PR #61's remediation is proposed but not yet integrated.
- Human Verification is eligible only for the exact PR #59 and PR #60 candidates whose readiness gates passed. No Preview deployment or Android human acceptance was performed by this run.

## Required evidence per run
Record UTC timestamp, branch, full head and tested checkout SHA (including PR merge SHA where applicable), workflow/run/job IDs, environment, tool/model versions, commands, expected and actual results, logs/artifact links, defect IDs, reviewer, and retest outcome.

CI success does not prove Preview runtime health, Android acceptance, or Production readiness.

## Final PR #60 candidate — 2026-11-05
- PR #60 head: `a32a800f19ad57a40f2e48f7e71e622070a21c8b`.
- Tested merge candidate: `a6215155fe39d37f44ecf468bdee944ba4a852dc` (PR head merged into corrected PR #59 head `637ff536011ed25fc598888f62f520b4cfdccd3c`).
- Auto Pilot readiness `41918309854`: VERIFIED / success; exact merge candidate checked out; all gate steps passed.
- Regression/install `41918309389`, Phase 3 `41918309358`, hybrid gateway `41918309299`: VERIFIED / success.
- Readiness output: 129 tests, 129 passed, 0 failed. The new 35-task manifest structural test is included; model outputs were not benchmarked.
- Branch-push gate `41918299433` and regression/install `41918299401`: VERIFIED / success.
- Later documentation-only register commits are not application-code changes; do not relabel them as a new model benchmark.

## Latest PR #60 verification — 2026-11-05
- PR #60 head: `f36cafa56f2d2b99e88eecf88a2c615859f839fe`.
- Exact tested merge candidate: `b46485d` (merge of PR #60 head into PR #59 head `637ff536011ed25fc598888f62f520b4cfdccd3c`).
- Auto Pilot readiness `41918584320`: VERIFIED / success; all gate steps passed.
- Regression/install `41918584510`, Phase 3 `41918584336`, hybrid gateway `41918584290`, and branch-push readiness `41918571778`: VERIFIED / success.
- Readiness output: 129 tests, 129 passed, 0 failed. This includes manifest-structure tests only; no model inference or comparative model score was produced.

## Current branch final gate — 2026-11-05
- PR #60 head: `84c2d48857436519a9d712e8d3f7987c01397e0f`.
- Tested PR merge candidate: `2629ad5b03bd85a5229ebd88f003a281a63a6206`.
- Auto Pilot readiness `41918816079`: VERIFIED / success; doctor, TypeScript, 129/129 tests, safety scan and machine gate passed.
- Regression/install `41918816057`, Phase 3 `41918816053`, hybrid gateway `41918816105`, branch-push readiness `41918810790`, and branch-push regression `41918810833`: VERIFIED / success.
- The current head is documentation/record updates only relative to the previously tested application code. No model inference benchmark was executed.

## Latest PR #60 candidate — 2026-11-05
- Head: `a78a460c20245590b29d6bc2e0abd68b7117cf31`; exact tested merge candidate: `66b1c84950516479b8fd4cd115742e55fc306cbe`.
- Auto Pilot readiness `41919279174`, regression/install `41919279316`, Phase 3 `41919279181`, hybrid gateway `41919279202`, branch-push readiness `41919271022`, and branch-push regression `41919271037`: all VERIFIED / success.
- Readiness output: 129/129 tests passed, 0 failed. This includes manifest-structure tests only; no model inference benchmark was run.

## Exact-head verification update — 2026-11-05

| PR / exact head | Workflow run | Result | Evidence |
|---|---:|---|---|
| #60 d90c492116729f886a9adca329c581151e1884f5 | 41919509283 | VERIFIED / success | Auto Pilot readiness; 129/129 tests |
| #60 same head | 41919509234 | VERIFIED / success | Regression and installation checks |
| #60 same head | 41919509532 | VERIFIED / success | ATLAS-9 Phase 3 regression |
| #60 same head | 41919509348 | VERIFIED / success | Hybrid Gateway tests |
| #62 1fa32453e9569b136ec890b7c32562dda510612f | 41921781561 | VERIFIED / success | Auto Pilot readiness |
| #62 same head | 41921781474 | VERIFIED / success | Regression and installation checks |
| #62 same head | 41921781529 | VERIFIED / success | ATLAS-9 Phase 3 regression |
| #62 same head | 41921781630 | VERIFIED / success | Hybrid Gateway tests |
| #63 4c5276f2ff5307949f912451d554d9be879223b6 | 41945833375 | VERIFIED / success | Auto Pilot readiness; exact-head log confirms 139/139 tests, 0 failed |
| #63 same head | 41945833224 | VERIFIED / success | Regression and installation checks; 139/139 tests |
| #63 same head | 41945833236 | VERIFIED / success | ATLAS-9 Phase 3 regression; 139/139 tests |
| #63 same head | 41945833238 | VERIFIED / success | Hybrid Gateway tests; 139/139 tests and Wrangler dry-run build |
| #64 929e5bcf9d2be683c94b9cd882209ce194fc9119 | 41944458347 | VERIFIED / success | Auto Pilot readiness; exact-head log confirms 134/134 tests, 0 failed |
| #64 same head | 41944458563 | VERIFIED / success | Regression and installation checks |
| #64 same head | 41944458558 | VERIFIED / success | ATLAS-9 Phase 3 regression |
| #64 same head | 41944458354 | VERIFIED / success | Hybrid Gateway tests |
| #61 17760f85b01e0db2e7a09679324d55adfe1fcf95 | 41917776597 | VERIFIED / success | Push-triggered security regression; 99/99 tests and log-redaction check |
| #61 same head | 41917776653 | VERIFIED / success | Push-triggered regression workflow |

Workflow URLs:
- #60: https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41919509283 ; https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41919509234 ; https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41919509532 ; https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41919509348 .
- #62: https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41921781561 ; https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41921781474 ; https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41921781529 ; https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41921781630 .
- #63: https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41945833375 ; https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41945833224 ; https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41945833236 ; https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41945833238 .
- #64: https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41944458347 ; https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41944458563 ; https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41944458558 ; https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41944458354 .
- #61: https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41917776597 ; https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41917776653 .

## Verification boundaries
- PR #64 workflow-dispatch Preview was not run. Its 4/4 CI success is not Preview runtime verification or Android acceptance.
- PR #63 MCP hardening is CI-verified only; MCP remains opt-in and agent execution remains disabled.
- The current documentation branch commit is a separate candidate; run its own Auto Pilot gate against the exact resulting SHA before Human Verification.
- CI logs emitted non-blocking Node.js 20 action deprecation and punycode deprecation warnings; no failure resulted.

## Additional exact-head and runtime evidence — 2026-11-05

| PR / candidate | Run ID | Status | Result |
|---|---:|---|---|
| #52 9be9a8c3f6df416d66452c3d8c69c5112c853207 | 41825376685 | VERIFIED | Wrangler Preview deployment completed; stable and immutable URLs returned; staging D1 binding reported. No health probe. |
| #65 2529b05efa4fd02883eb493a2683218a7be2e83f | 41949338154 | VERIFIED | Push regression, 95/95 tests |
| #65 same head | 41949364570 | VERIFIED | Pull-request regression, 95/95 tests |
| #66 1efff727f6c208d3c030b1162f2065abad5bdf7a | 41949598277 | VERIFIED | Regression, 102/102 tests |
| #66 same head | 41949598379 | VERIFIED | Wrangler 4.153.0 config dry-run, no deployment |
| #66 same head | 41949605643 | VERIFIED | Wrangler 4.153.0 config dry-run, no deployment |
| #34 4e0a695c7c1aa8aed362f842772cabe00f5ec769 | 41262519352 | VERIFIED | Regression |
| #34 same head | 41262511152 | VERIFIED | Push regression |
| #35 2fc68d4660d0a1562c7ad78428d6b7c8d26d8953 | 41268353266 | VERIFIED | Pull-request regression |
| #35 same head | 41268349267 | VERIFIED | Push regression |
| #35 same head | 41949231803 | VERIFIED | Push regression |
| #41 e07d18c59f28247e18ebd2018931aaf289e7d214 | 41327582399 | VERIFIED | Pull-request regression |
| #41 same head | 41327577104 | VERIFIED | Push regression |
| #45 5207d5ef23f0f10563f9b8ea38ffbc621f17104b | 41582157556 | VERIFIED | UI protection regression |
| #45 same head | 41582157563 | VERIFIED | Pull-request regression |
| #45 same head | 41582153906 | VERIFIED | Push regression |

Key links:
- #52 Preview: https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41825376685 .
- #65: https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41949338154 ; https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41949364570 .
- #66: https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41949598277 ; https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41949598379 ; https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41949605643 .

## Interpretation and test gaps
- PR #52 Preview creation is VERIFIED, but HTTP health, authenticated end-to-end flow, Android acceptance, and SLO are NOT TESTED.
- PR #52 99,990-request stress script is in-process Worker simulation, not edge load; no scale KPI is earned from it.
- PR #53 backup workflow was not run on the current PR head; restore remains NOT TESTED.
- PR #65/66 have regression/config dry-run evidence but no Auto Pilot readiness workflow on their exact heads. Human Verification remains BLOCKED until an exact-head gate exists and passes.
- PR #66 Wrangler dry-run is explicitly local validation only; no deployment occurred.

## Final exact-head readiness results — 2026-11-05

| PR / final SHA | Run ID | Event | Status | Evidence |
|---|---:|---|---|---|
| #65 154301128cc8824b76969b5da603807f5125b414 | 41949995940 | pull_request | VERIFIED | Legacy Auto Pilot readiness; 95/95 tests, install/preflight/dry-run/safety pass |
| #65 same SHA | 41949989419 | push | VERIFIED | Legacy Auto Pilot readiness; 95/95 tests |
| #65 same SHA | 41949995918 | pull_request | VERIFIED | Regression |
| #65 same SHA | 41949989433 | push | VERIFIED | Regression |
| #66 721ef9a7eb7068dcbe40ccad9df0d5b188e6e3a1 | 41950007358 | pull_request | VERIFIED | Legacy Auto Pilot readiness; 102/102 tests, install/preflight/dry-run/safety pass |
| #66 same SHA | 41950001066 | push | VERIFIED | Legacy Auto Pilot readiness; 102/102 tests |
| #66 same SHA | 41950000882 | push | VERIFIED | Regression |
| #66 same SHA | 41950007360 | pull_request | VERIFIED | Wrangler 4.153.0 config dry-run; no deployment |
| #60 06d45e7ddb2588bf5ca529f55e25a4fe2f498069 | 41949807568 | pull_request | VERIFIED | Auto Pilot readiness; 129/129 tests |
| #60 same SHA | 41949807519 | pull_request | VERIFIED | Regression/install; 129/129 tests |
| #60 same SHA | 41949807537 | pull_request | VERIFIED | Phase 3; 129/129 tests |
| #60 same SHA | 41949807546 | pull_request | VERIFIED | Hybrid Gateway; 129/129 tests |

Links:
- #65: https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41949995940 ; https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41949989419 ; https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41949995918 ; https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41949989433 .
- #66: https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41950007358 ; https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41950001066 ; https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41950000882 ; https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41950007360 .
- #60: https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41949807568 ; https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41949807519 ; https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41949807537 ; https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41949807546 .

## Gate interpretation
- PR #65 and #66 exact heads published READY FOR HUMAN VERIFICATION. Human Verification has not been started.
- The legacy gate transparently records TypeScript as NOT CONFIGURED and does not count it as passed. No doctor script exists on those branches; repository preflight ran instead.
- Neither gate proves Preview runtime, Android, backup restore, model benchmark performance, scale, or Production readiness.

## Correction — 2026-11-05: Voice limiter status
The PR #52 deployed source uses CHAT_RATE_LIMITER for voice transcription, and the Preview deployment metadata confirms CHAT_RATE_LIMITER exists. The earlier statement that the PR #52 Preview lacks VOICE_RATE_LIMITER and therefore cannot run voice transcription was incorrect for this deployed source version. No runtime or Android voice acceptance test was performed; status remains NOT TESTED. FILE_SCANNER remains absent and the file-analysis route is expected to return FILE_SCAN_UNAVAILABLE after authorization succeeds.
