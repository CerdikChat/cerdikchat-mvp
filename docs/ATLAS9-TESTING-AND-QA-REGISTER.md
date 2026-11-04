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
