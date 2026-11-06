# ATLAS-9 Security and Governance Register

Append-only security register. Distinguish source review, automated tests, live runtime evidence and Production assurance.

## 2026-11-06 — Main-branch security review

### Authentication and RBAC

- Main snapshot reviewed: `bc6545d6d19fd4b749d0b65fefba3d74775e0221`.
- Main `worker.js` describes Google authentication as optional and the inspected implementation requires it when `GOOGLE_AUTH_REQUIRED=true`. A Production/D1-backed deployment with the flag absent or false could fail open.
- Status on main: FAILED against the required fail-closed policy.
- Candidate PR #92: `0a5fdea7f1c1c4091ff5fb674a1bac6bbb6ce8fb`, branch `atlas9/cerdikgo-main-auth-fail-closed-20261106`; tests 41/41; Auto Pilot 42081225451, regression 42081225364, Controlled Guardrails 42081225068 — SUCCESS.
- Candidate policy: authentication required for Production, any D1-backed Worker, or explicit `GOOGLE_AUTH_REQUIRED=true`; same rule applies to `/api/auth/config`.
- PR: https://github.com/CerdikChat/cerdikchat-mvp/pull/92.
- Status: VERIFIED in isolated tests; NOT INTEGRATED; live OAuth/session acceptance NOT TESTED.
- Existing eight-hour session lifetime unchanged. No OAuth or session settings were modified.

### Observability privacy

- Main `wrangler.toml` does not explicitly enable query-string redaction.
- Candidate PR #93: `276430ca45b91c6bfe418c712555427c83f35624`, branch `atlas9/cerdikgo-main-observability-redaction-20261106`.
- Candidate enables `redact_query_string=true` at top-level and Preview scopes; tests 37/37.
- Auto Pilot 42081620404, regression 42081620294, Controlled Guardrails 42081620327 — SUCCESS.
- PR: https://github.com/CerdikChat/cerdikchat-mvp/pull/93.
- Status: VERIFIED in repository/configuration tests; NOT LIVE-APPLIED.
- Limitation: query-string redaction does not sanitize request bodies, headers or application log messages. The separate MCP Worker is not covered.

### D1 environment separation

- Main `wrangler.toml` defines top-level `DB` as `cerdikchat-db` and a Preview-specific D1 entry named `cerdikchat-staging`.
- A dry-run on a main-based candidate showed the default binding as `cerdikchat-db`; a dry-run is not proof of the actual Preview runtime binding.
- Status: BLOCKED pending read-only confirmation of environment-specific binding resolution before Preview release.
- No D1 records were read, written or migrated.

### Secrets and external providers

- Historical read-only Cloudflare inventory recorded secret binding names `GEMINI_API_KEY` and `OPENAI_API_KEY` on the existing CerdikChat Worker. Their values were not accessed.
- This run did not re-query live Cloudflare secret metadata. Treat the names as a prior finding requiring read-only reconfirmation.
- Main application code reviewed uses `env.AI`; do not infer that legacy bindings are required or safe to delete.
- Status: NOT TESTED for current live binding inventory. No secret was read, changed, rotated or deleted.

### Specialist and gateway controls

- Required registry: exactly ATLAS-01 through ATLAS-09.
- Optimus Prime is coordinator, not a tenth specialist.
- PR #89 identity candidate: `3fd1fc2d01a67eef8053ba64fcd9a9f59b1ed3f7`; tests 37/37; Auto Pilot 42078347572, Guardrails 42078347480, regression 42078347610 — SUCCESS.
- Candidate accurately states that the nine profiles are roles within one model; it does not claim nine independent runtime models.
- Gateway remains `plan_only`; autonomous specialist execution is not authorized.
- Status: VERIFIED on isolated candidate; NOT INTEGRATED on main.

### Document scanning

- PR #76 scanner contract uses fail-closed behavior and mocked contract tests.
- Actual ClamAV runtime, clean/infected/EICAR file tests and private scanner binding are NOT TESTED.
- A prior design assessment reported Cloudflare Containers capability requiring a paid plan. No paid plan or dependency was added.
- PR #78 is an asynchronous design proposal, not a deployed scanner.
- Status: BLOCKED for real runtime acceptance. Never bypass scanning to make file analysis appear available.

### Voice

- PR #41 automated regression passed historically; Android microphone, permission, transcription and playback acceptance remain NOT TESTED.
- Production `VOICE_RATE_LIMITER` binding is not evidenced in the reviewed configuration.
- Status: NOT TESTED for runtime; do not claim Production readiness.

### Backup and recovery

- Scheduled backup runs 41695574776 and 41890146458 were FAILED in prior evidence.
- PR #74 candidate `abeca194672349e799bcfdd9d8f9c9dc82675947` passed full-history Gitleaks run 41975715983 and regression 41975716157. Scan covered 816 commits; no leaks reported.
- PR: https://github.com/CerdikChat/cerdikchat-mvp/pull/74.
- Status: VERIFIED for secret scanning only; backup archive generation, off-site copy and restore remain NOT TESTED.

### Prior live observability snapshot — not revalidated in this run

The earlier PR #60 register records a read-only Cloudflare snapshot dated 2026-11-06 in which both `cerdikchat-mvp` and `cerdikgo-mcp-preview` reported query redaction disabled, persisted invocation logs and 100% sampling. This run did not repeat the Cloudflare API query. Do not describe that prior snapshot as a new live check.

## Security decisions

- Fail closed for Production authentication and scanner availability.
- Do not expose PII, session tokens, OAuth tokens or secrets in logs.
- Do not infer Preview isolation from a local dry-run.
- Do not alter OAuth, secrets, DNS, D1 or billing without separate authorization.
- Preserve gateway `plan_only`.


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

### Current source and live-configuration observations
- Main `worker.js` still documents Google authentication as optional unless `GOOGLE_AUTH_REQUIRED=true`; PR #92 is the main-based fail-closed candidate. Its exact head and three CI runs are listed in the master ledger above. It is not integrated.
- Main `wrangler.toml` does not explicitly enable `redact_query_string`; PR #93 adds top-level and Preview redaction tests/config. It is not integrated.
- Read-only Cloudflare inventory at 2026-11-06 01:56 UTC returned two scripts: `cerdikchat-mvp` and `cerdikgo-mcp-preview`; no `cerdikgo-primary-preview` script was present. Both existing script-settings responses showed observability enabled, sampling 1.0, logs enabled/persisted/invocation enabled, and `redact_query_string=false`. No live setting was changed.
- The script-settings response did not provide a usable binding inventory in this read. Repository `wrangler.toml` defines top-level D1 `cerdikchat-db` and Preview D1 `cerdikchat-staging`; actual environment-specific live D1 mapping remains NOT VERIFIED. Do not infer isolation from repository config alone.
- Legacy secret binding values were not accessed or changed. Query-string redaction does not sanitize request bodies, headers or application log messages; the separate MCP Worker requires its own reviewed config.
