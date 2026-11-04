# ATLAS-9 Testing & QA Register

Append every test execution. Never mark a test passed without its exact run and evidence.

## Initial QA baseline — 2026-11-05
| Check | Candidate | Result | Evidence / next action |
|---|---|---|---|
| PR #57 installation/regression | `570471a9303cda3beb110d04c80445a4db104039` | NOT TESTED here | Inspect workflow run and job logs |
| PR #58 TypeScript/regression | `5b482b05e832ed342791763eba7a84d4c9951c34` | NOT TESTED here | Inspect workflow run and job logs |
| PR #59 Auto Pilot readiness | `de11d34257005ba72a621312230489a7d161ff53` | BLOCKED / QUEUED at snapshot | Runs #41877325687 and #41877325709 were queued |
| Seven-dimension benchmark | scorecard branch | NOT TESTED | Build and execute fixed benchmark suite |
| Android acceptance | Preview candidate | NOT TESTED | Start only after exact-commit Auto Pilot gate passes |
| Production readiness | none | NOT TESTED | Separate approval and release process required |

## Required evidence per run
Record UTC timestamp, branch, full commit SHA, workflow/run/job IDs, environment, tool/model versions, commands, expected and actual results, logs/artifact links, defect IDs, reviewer, and retest outcome.

## Human Verification rule
Human Verification must not begin until the Auto Pilot readiness gate passes for the exact candidate commit. CI success does not prove Preview runtime health, Android acceptance, or Production readiness.
