# CerdikGo Engineering Changelog

Append-only engineering history. A CI pass applies only to the exact branch and SHA listed.

## 2026-11-06 — Main-based candidate review

### PR #89 — canonical ATLAS-9 identity

- Status: VERIFIED on isolated Draft candidate; NOT INTEGRATED.
- Branch: `atlas9/cerdikgo-main-identity-correction-20261106`.
- Commit: `3fd1fc2d01a67eef8053ba64fcd9a9f59b1ed3f7`.
- Changed files: `worker.js`, `tests/atlas9-main-identity.test.mjs`, `docs/ATLAS9-MAIN-IDENTITY-CORRECTION.md`, `.github/workflows/atlas9-controlled-autopilot.yml`, `.github/workflows/autopilot-readiness-legacy.yml`.
- Tests/workflows: Auto Pilot 42078347572, Controlled Guardrails 42078347480, regression 42078347610 — SUCCESS; 37/37.
- PR: https://github.com/CerdikChat/cerdikchat-mvp/pull/89.
- Change: replace legacy role list with ordered ATLAS-01…ATLAS-09; Optimus Prime remains coordinator. Prompt explicitly states the profiles are roles within one model, not nine independent runtime models.

### PR #90 — Workers AI installation documentation

- Status: VERIFIED on isolated Draft candidate; NOT INTEGRATED.
- Branch: `atlas9/cerdikgo-install-docs-correction-20261106`.
- Commit: `4c2ef0438be4e8f85225c059887d078be44826e2`.
- Changed files: `README.md`, `tests/readme-installation-docs.test.mjs`, `.github/workflows/atlas9-controlled-autopilot.yml`, `.github/workflows/autopilot-readiness-legacy.yml`, `docs/CERDIKGO-INSTALLATION-DOCS-CORRECTION.md`.
- Tests/workflows: regression 42078357598, Controlled Guardrails 42078357621, Auto Pilot 42078357659 — SUCCESS; 37/37; Wrangler 4.153.0 dry-run PASS.
- PR: https://github.com/CerdikChat/cerdikchat-mvp/pull/90.
- Change: remove obsolete Gemini API-key setup requirement; document `env.AI` and `@cf/google/gemma-4-26b-a4b-it`, safe local preflight and limitations.

### PR #91 — workspace status visibility regression lock

- Status: VERIFIED on isolated test/docs candidate; source already exists on its non-main base.
- Branch: `atlas9/workspace-tools-order-regression-20261106`.
- Commit: `023db6f9b8f1b8078cdf6e7d154316e78b774d5e`.
- Base: `atlas9/prompt-intelligence-mvp` at `41d7f30d7a1bedbd763504970ad059050f9f2188`.
- Changed files: `tests/workspace-tools-order.test.mjs`, `docs/WORKSPACE-TOOLS-ORDER-REGRESSION-LOCK.md`.
- Auto Pilot 42079473235 — SUCCESS; 91/91.
- PR: https://github.com/CerdikChat/cerdikchat-mvp/pull/91.
- Limitation: test/documentation lock only; do not infer integration into main.

### PR #92 — fail-closed Production/D1 authentication

- Status: VERIFIED on isolated Draft candidate; NOT INTEGRATED.
- Branch: `atlas9/cerdikgo-main-auth-fail-closed-20261106`.
- Commit: `0a5fdea7f1c1c4091ff5fb674a1bac6bbb6ce8fb`.
- Changed files: `worker.js`, `auth/google-auth.js`, `tests/production-auth-default.test.mjs`, `tests/production-d1-auth-default.test.mjs`, `docs/PRIMARY-AUTH-FAIL-CLOSED-MAIN-CANDIDATE.md`, `.github/workflows/atlas9-controlled-autopilot.yml`, `.github/workflows/autopilot-readiness-legacy.yml`.
- Tests/workflows: regression 42081225364, Controlled Guardrails 42081225068, Auto Pilot 42081225451 — SUCCESS; 41/41; Wrangler dry-run PASS.
- PR: https://github.com/CerdikChat/cerdikchat-mvp/pull/92.
- Change: require authentication for Production, any D1-backed Worker, or explicit `GOOGLE_AUTH_REQUIRED=true`; apply the same policy to `/api/auth/config`.
- Limitation: no live OAuth or D1 runtime test; eight-hour session lifetime unchanged.

### PR #93 — observability query-string redaction

- Status: VERIFIED in source/configuration tests on isolated Draft candidate; NOT LIVE-APPLIED.
- Branch: `atlas9/cerdikgo-main-observability-redaction-20261106`.
- Commit: `276430ca45b91c6bfe418c712555427c83f35624`.
- Changed files: `wrangler.toml`, `tests/observability-config.test.mjs`, `docs/CERDIKGO-OBSERVABILITY-PRIVACY-HARDENING-MAIN.md`, `.github/workflows/atlas9-controlled-autopilot.yml`, `.github/workflows/autopilot-readiness-legacy.yml`.
- Tests/workflows: regression 42081620294, Controlled Guardrails 42081620327, Auto Pilot 42081620404 — SUCCESS; 37/37; Wrangler dry-run PASS.
- PR: https://github.com/CerdikChat/cerdikchat-mvp/pull/93.
- Change: enable query-string redaction in top-level and Preview observability config; preserve existing sampling and Preview staging binding.
- Limitation: does not redact bodies, headers or application log messages; does not change live Cloudflare settings or the separate MCP Worker.

### PR #74 — full-history Gitleaks correction

- Status: VERIFIED for secret scanning only; backup restore NOT TESTED.
- Branch: `atlas9/backup-gitleaks-allowlist-20261105`.
- Commit: `abeca194672349e799bcfdd9d8f9c9dc82675947`.
- Workflows: full-history scan 41975715983 and regression 41975716157 — SUCCESS.
- PR: https://github.com/CerdikChat/cerdikchat-mvp/pull/74.
- Result: 816 commits scanned; no leaks reported. The narrow exception is for the reviewed localStorage namespace only.
- Limitation: scheduled archive generation, off-site backup and restore are separate acceptance tests.

### PR #88 — light workspace redesign

- Status: BLOCKED.
- Branch: `atlas9/cerdikgo-v2-light-preview-20261105`.
- Commit: `8bdef7d20431eb08c9b36f414ffa5221e2ddae90`.
- Base: `atlas9/cerdikgo-workspace-redesign` at `e72ce40170eab4282e1536ed1447467326e1c935`.
- Comparison: 1 ahead / 4 behind; mergeable=false; no exact-head workflow run returned.
- PR: https://github.com/CerdikChat/cerdikchat-mvp/pull/88.
- Risk: patch removes a later reference CSS block. Reconcile on a clean branch and obtain visual regression evidence before any Preview consideration.

### Commands evidenced in successful CI

- `npm test` — candidate-specific Node test suites; counts above.
- `npm run doctor` — PASS on PR #60 scorecard candidate.
- `npx --yes wrangler@4.153.0 deploy --dry-run --outdir /tmp/cerdikgo-legacy-readiness` — PASS on legacy JavaScript candidates; dry-run only.
- `npm run typecheck` / strict TypeScript workflow — PASS on PR #60 scorecard branch only; TypeScript NOT CONFIGURED on the JavaScript-only PRs.

No merge, deployment, remote D1 write/migration, credential change, DNS change or billing activation occurred.


## 2026-11-06 — PR #94 first CI failure and transparent correction

- Candidate initially tested: `005402e41eb807c0ec44e2629fef1c7d16325341`, branch `atlas9/cerdikgo-main-governance-registers-20261106`, PR #94.
- Regression run `42114199024`: FAILED; 36 passed / 1 failed. The single failure was the new structural test requiring a dated entry in `docs/CERDIKGO-SEVEN-DIMENSION-BENCHMARK.md`; the benchmark specification lacked that date marker. This was a documentation/test-fixture mismatch. No product runtime test failed.
- Exact failure log: https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/42114199024.
- Correction: appended a dated baseline and transparent failure note to the benchmark document; correction commit `68db999e24f854aa9137904054f53433a865b8a1`.
- Status: correction commit recorded; retest on the final exact branch head is PENDING. Do not report PR #94 as green until that exact-head run succeeds.
- No prior failure was removed or overwritten. No merge, deployment, D1 operation, credential change, DNS change or billing action occurred.


## 2026-11-06 — Corrected register candidate regression evidence

- PR #95 exact tested snapshot: `518c580894cab90d99c4f129bb7f207e8973532a`, branch `atlas9/cerdikgo-main-governance-registers-rerun-20261106`, base main `bc6545d6d19fd4b749d0b65fefba3d74775e0221`.
- Regression workflow `42114354000`: SUCCESS; `npm test` 37/37 passed, 0 failed. All three new structural tests passed.
- Evidence: https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/42114354000.
- PR #94 initial candidate `005402e41eb807c0ec44e2629fef1c7d16325341` failed run `42114199024` at 36/37 because the benchmark spec lacked a dated entry. Correction commit: `68db999e24f854aa9137904054f53433a865b8a1`. The failed run is preserved.
- Subsequent register-only appends on this branch are documentation changes; exact-head CI for the resulting updated branch remains PENDING. The 37/37 result above must not be generalized to a later SHA until retested.
- Auto Pilot readiness, live inference, Preview runtime, Android, backup restore and Production readiness remain NOT TESTED. Human Verification has not started.
