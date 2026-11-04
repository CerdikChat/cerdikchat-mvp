# CerdikGo Engineering Changelog

Append dated entries. Link every change to its branch, commit SHA, PR, tests, and risk.

## 2026-11-05 — Seven-dimension readiness scorecard and evidence records
- Added `docs/CERDIKGO-SEVEN-DIMENSION-BENCHMARK.md` with explicit KPI thresholds, sample sizes, scoring rules and measured-status distinctions.
- Added `benchmarks/seven-dimension/tasks.v0.1.json`: 35 fixed smoke tasks, five per dimension; this is not a full comparative benchmark.
- Added `tests/benchmark-manifest.test.mjs` to validate manifest dimensions, task count, uniqueness and acceptance rubric structure.
- Added/maintained the ATLAS-9 master ledger, QA register, security/governance register, decision/approval register and open-issues/handover register.
- Branch: `atlas9/cerdikgo-100-percent-scorecard`; PR #60.
- Key commits: manifest `5185b6263cea02efb7eec73fb9e8f29b9d4bab0e`; manifest test `241b28d02bfe6bcff7add5782612d6b71c84f514`; KPI benchmark `2f81a00a801a93b22a56a93724a3ff2c8358596e`; QA register `2e68cd197e931dcd286cd030b79be4f36ba3add9`; security register `dd5adbc45b8ebac4c9d5870af59a5e899a65fdaa`.
- Validation: new manifest test awaits CI. No model inference benchmark executed.
- Risk: documented KPI thresholds are acceptance targets; they are not evidence of current model quality or Gemini parity.

## 2026-11-05 — Correct Auto Pilot readiness false positive (PR #59)
- Updated `.github/workflows/autopilot-readiness.yml` on `atlas9/cerdikgo-autopilot-readiness`.
- Root cause: workflow grep matched its own literal regex. Split the regex fragments so the scan checks commands without matching its own source.
- Fix commit: `e6e7b17eaac1e0a94724cf9ff56b6d2a04e80ba3`.
- Verified merge candidate: `96ba7681c3a0167ac2551edfa4db59b196176d3f`.
- Readiness workflow `41917081910`: success; all gate steps passed, including doctor, typecheck, 127/127 tests and workflow safety scan.
- Regression/install workflow `41917081974`: success.
- No deployment, remote D1 operation, OAuth/secrets, DNS or billing change.

## Prior scorecard documentation commits
- Initial scorecard charter: `ce08d5faa7591774f11c0b2266fcaa85ddaa6e38`.
- Initial record files created across commits ending at `10863fb1578031075ec31a14b194b996b5d2d51c7`; subsequent changelog correction `4284935e76e978f0f133216e1702d87706216529`.
- PR #60 remains draft/open/unmerged; CI must validate its current candidate.
