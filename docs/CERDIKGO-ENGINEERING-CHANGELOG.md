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

### Changes in this audit append
- Appended current exact-head CI, branch provenance, warnings and operational limitations to the six mandatory registers and benchmark record; no application source, model routing, runtime binding, or UI code changed in this append.
- PR #95's 11-file candidate comprises `.github/workflows/atlas9-legacy-autopilot-readiness.yml`, `benchmarks/seven-dimension/tasks.v0.1.json`, the six required registers, `docs/CERDIKGO-SEVEN-DIMENSION-BENCHMARK.md`, `tests/atlas9-autopilot-workflow.test.mjs`, and `tests/atlas9-governance-registers.test.mjs`.
- Main `package.json` exposes only `npm test` and requires Node >=20; no build, lint, typecheck or TypeScript script is configured on main.
- Main workflow inventory includes `regression.yml` and `google-drive-backup.yml`; the exact-head Auto Pilot gate is introduced by PR #95 and is not yet on main.


## 2026-11-06 — Backup security follow-up

- Status: VERIFIED for the cited PR #74 candidate; main scheduled backup remains FAILED. This is a new append-only record; no earlier failure is removed.
- Main backup workflow run `42086628529` (2026-11-05 18:41:17 UTC) FAILED at Gitleaks 8.24.3. Three findings were reported; archive creation, artifact publication and Google Drive upload were skipped. The main branch did not load PR #74's unmerged `.gitleaks.toml`.
- PR #74 exact candidate: `9f3940efeeea0a7d6ea85f6e48969d7120d84644`, branch `atlas9/backup-gitleaks-allowlist-20261105`, Draft, base main `bc6545d6d19fd4b749d0b65fefba3d74775e0221`, 9 commits ahead / 0 behind.
- PR #74 full-history scan run `42148160740`: SUCCESS; Gitleaks 8.24.3 scanned 1,093 commits / approximately 2.55 MB across fetched refs; no leaks found. PR regression run `42148160744`: SUCCESS, 38/38 passed. Event-scoped PR scan examined 9 commits / approximately 12.97 KB and also found no leaks.
- Evidence: https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/42148160740 and https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/42148160744. PR link: https://github.com/CerdikChat/cerdikchat-mvp/pull/74.
- Three narrow, line-targeted allowlists require exact file path AND exact literal; default Gitleaks rules remain enabled. Two Git commit SHA findings in the master ledger were verified through GitHub as commit objects, not credentials. No global allowlist was added.
- PR #95 pre-append exact candidate `e6972d5e96d99920adc8996ad55ac83deb5fc325` had Auto Pilot run `42147411322` and regression run `42147410943`, both SUCCESS (41/41). This register append creates a new PR #95 head; its exact-head gate must run again before readiness can be carried forward.
- No backup archive, Drive upload, restore drill, merge, deployment, D1 operation, credential change or billing action occurred.

### PR #74 files changed in the latest candidate
- `.gitleaks.toml`: retain default rules and add only exact path+literal exceptions for reviewed localStorage metadata, one verified auth commit SHA, and two verified master-ledger commit SHAs.
- `.github/workflows/gitleaks-full-history.yml`: assert the narrow allowlist contract and scan every fetched ref with Gitleaks 8.24.3 using redacted verbose diagnostics.
- `tests/gitleaks-allowlist.test.mjs`: verify exactly three narrow allowlist blocks, line-targeting, exact paths and exact literals.
- `docs/BACKUP-SECURITY-SCAN-CORRECTION.md`: append failure/correction history and final verification evidence.
