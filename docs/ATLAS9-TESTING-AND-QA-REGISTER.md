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
| PR #59 head `de11d34257005ba72a621312230489a7d161ff53` | `41877325687` | VERIFIED / success | Regression/install passed; companion readiness run failed separately |
| PR #59 same earlier head | `41877325709` | FAILED | Safety scan matched its own literal command pattern; install, doctor, typecheck and 127-test regression steps passed |
| PR #60 head `4284935e76e978f0f133216e1702d87706216529` | `41879349569` | VERIFIED / success | Regression/install completed successfully |
| PR #60 same earlier candidate | `41879349586` | FAILED | Inherited readiness scan false-positive before PR #59 correction |
| PR #59 corrected head `e6e7b17eaac1e0a94724cf9ff56b6d2a04e80ba3` | `41917081910` | VERIFIED / success | Exact PR merge candidate `96ba7681c3a0167ac2551edfa4db59b196176d3f`; doctor, typecheck, all 127 tests, safety scan and machine gate passed |
| PR #59 corrected head, same candidate | `41917081974` | VERIFIED / success | Regression/install workflow completed successfully |
| PR #60 benchmark pilot additions | commits `5185b6263cea02efb7eec73fb9e8f29b9d4bab0e`, `241b28d02bfe6bcff7add5782612d6b71c84f514` | PLANNED pending CI | Added 35-task manifest and manifest-structure tests; model benchmark has not run |

## Root cause and corrective action
The readiness workflow originally searched workflow files for a literal pattern that was also present in its own grep expression. This caused a false failure even though no remote deploy or D1 migration command was present. PR #59 commit `e6e7b17eaac1e0a94724cf9ff56b6d2a04e80ba3` split the regex fragments so the safety scan no longer matches itself. Run `41917081910` verified the correction on merge candidate `96ba7681c3a0167ac2551edfa4db59b196176d3f`.

## Remaining verification
- PR #60 must pass its own readiness gate on the updated merged candidate; its earlier green regression does not substitute for that gate.
- Execute the 35-task pilot against model(s) only after a controlled, repeatable harness exists; current manifest test checks structure, not model quality.
- Full seven-dimension suites, Preview runtime, real Google OAuth, Android acceptance, voice hardware, live research, load, backup restore and DR remain NOT TESTED unless separately recorded with evidence.
- Human Verification may begin only after Auto Pilot passes for the exact candidate commit to be verified.

## Required evidence per run
Record UTC timestamp, branch, full head and tested checkout SHA (including PR merge SHA where applicable), workflow/run/job IDs, environment, tool/model versions, commands, expected and actual results, logs/artifact links, defect IDs, reviewer, and retest outcome.

CI success does not prove Preview runtime health, Android acceptance, or Production readiness.
