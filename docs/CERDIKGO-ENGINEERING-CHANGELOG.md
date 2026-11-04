# CerdikGo Engineering Changelog

Append dated entries. Link every change to its branch, commit SHA, PR, tests, and risk.

## 2026-11-05 — PR #61 auth-log privacy remediation
- Removed email and request identifiers from the access-request authentication log; only a fixed non-identifying event code remains.
- Extended the unlisted-account test to capture logs and assert that email, Google subject and ID token are absent.
- Added isolated push CI workflow `.github/workflows/admin-governance-security-ci.yml`.
- Branch: `atlas9/cerdikgo-admin-governance-security-hardening`; PR #61.
- Head: `17760f85b01e0db2e7a09679324d55adfe1fcf95`.
- Security regression run `41917776597`: success, 99/99 tests and log-redaction source check passed. Regression run `41917776653`: success.
- Scope: does not alter 76-hour session lifetime, Preview workflow, D1 migration, OAuth, secrets, DNS, billing or Production.

## 2026-11-05 — Seven-dimension readiness scorecard and benchmark pilot (PR #60)
- Added `docs/CERDIKGO-SEVEN-DIMENSION-BENCHMARK.md` with explicit KPI thresholds, sample sizes, scoring rules and evidence protocol.
- Added `benchmarks/seven-dimension/tasks.v0.1.json`: 35 fixed smoke tasks, five per dimension.
- Added `tests/benchmark-manifest.test.mjs` to validate manifest dimensions, task count, uniqueness and rubric structure.
- Added/updated ATLAS-9 master ledger, QA register, security/governance register, decision/approval register and open-issues/handover register.
- Branch: `atlas9/cerdikgo-100-percent-scorecard`; PR #60.
- Head: `6b24a410de3925f649189fba6450265be7318236`; tested merge candidate: `26cd4038e4d9ef79bbe1320dc1b8fb3b290687b0`.
- Readiness `41917922881`, regression/install `41917922855`, Phase 3 `41917922823`, hybrid gateway `41917922865`: all success; 129/129 tests passed.
- The manifest test checks structure only; no model inference benchmark was executed.
- Risk: KPI thresholds are acceptance targets, not evidence of current model quality or Gemini parity.

## 2026-11-05 — Auto Pilot readiness scan correction (PR #59)
- Updated `.github/workflows/autopilot-readiness.yml` on `atlas9/cerdikgo-autopilot-readiness`.
- Root cause: workflow grep matched its own literal regex. Split the regex fragments so the scan checks commands without matching its own source.
- Added exact tested checkout and PR-ref recording to the workflow step summary.
- Head: `637ff536011ed25fc598888f62f520b4cfdccd3c`; tested merge candidate: `25f416f68c9db0d2ce5a9a22ad38a003e2e36939`.
- Readiness `41917635551`: success; regression/install `41917635482`: success; 127/127 tests passed.
- No deployment, remote D1 operation, OAuth/secrets, DNS or billing change.

## Prior scorecard documentation commits
- Initial scorecard charter: `ce08d5faa7591774f11c0b2266fcaa85ddaa6e38`.
- Benchmark manifest: `5185b6263cea02efb7eec73fb9e8f29b9d4bab0e`.
- Manifest test: `241b28d02bfe6bcff7add5782612d6b71c84f514`.

## 2026-11-05 — Final PR #60 candidate re-verification
- PR #60 head `a32a800f19ad57a40f2e48f7e71e622070a21c8b`; tested merge candidate `a6215155fe39d37f44ecf468bdee944ba4a852dc`.
- Auto Pilot readiness `41918309854`, regression/install `41918309389`, Phase 3 `41918309358`, and hybrid gateway `41918309299`: all passed; 129/129 tests passed.
- Branch-push readiness `41918299433` and regression/install `41918299401`: passed.
- This run confirms CI and benchmark-manifest structure only; it does not measure model reasoning, research quality or Gemini parity.

## 2026-11-05 — PR #60 final candidate CI re-run
- Head `f36cafa56f2d2b99e88eecf88a2c615859f839fe`; tested merge candidate `b46485d`.
- Readiness `41918584320`, regression/install `41918584510`, Phase 3 `41918584336`, hybrid gateway `41918584290`, and branch-push readiness `41918571778`: all passed.
- 129/129 tests passed; model inference benchmark remains NOT TESTED.

## 2026-11-05 — PR #60 current branch final gate
- Head `84c2d48857436519a9d712e8d3f7987c01397e0f`; tested merge candidate `2629ad5b03bd85a5229ebd88f003a281a63a6206`.
- Readiness `41918816079`, regression/install `41918816057`, Phase 3 `41918816053`, hybrid `41918816105`, push readiness `41918810790`, and push regression `41918810833`: all passed, 129/129 tests.
