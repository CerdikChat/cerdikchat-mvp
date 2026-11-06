# CerdikGo Open Issues and Handover

Append-only handover. Status applies to the exact evidence and scope named.

## 2026-11-06 — Current engineering handover

### P0 — Main-based security candidates require review

1. **Production/D1 authentication**
   - Status: VERIFIED in isolated tests; NOT INTEGRATED.
   - PR #92, branch `atlas9/cerdikgo-main-auth-fail-closed-20261106`, SHA `0a5fdea7f1c1c4091ff5fb674a1bac6bbb6ce8fb`.
   - 41/41 tests; runs 42081225451, 42081225364, 42081225068 all SUCCESS.
   - Next: review diff, then test authenticated and unauthenticated flows in isolated Preview with approved OAuth setup. No credential changes in this handover.

2. **Observability query redaction**
   - Status: VERIFIED in source/config tests; NOT LIVE-APPLIED.
   - PR #93, branch `atlas9/cerdikgo-main-observability-redaction-20261106`, SHA `276430ca45b91c6bfe418c712555427c83f35624`.
   - 37/37 tests; runs 42081620404, 42081620294, 42081620327 all SUCCESS.
   - Next: review and separately cover the MCP Worker; verify actual runtime redaction without exposing sensitive query values.

3. **D1 environment mapping**
   - Status: BLOCKED.
   - Main Wrangler file defines top-level production D1 and Preview staging D1, but live environment-specific binding resolution was not confirmed in this run.
   - Next: read-only inspect exact deployed environment metadata; do not read or mutate D1 records.

### P1 — Product identity and workspace

4. **Canonical nine-seat identity**
   - Status: VERIFIED on PR #89 candidate; NOT INTEGRATED.
   - SHA `3fd1fc2d01a67eef8053ba64fcd9a9f59b1ed3f7`; 37/37; runs 42078347572, 42078347480, 42078347610 all SUCCESS.
   - Next: review and integrate only through explicit approval; confirm Primary prompt and registry parity.

5. **Workspace redesign**
   - Status: BLOCKED.
   - PR #88 head `8bdef7d20431eb08c9b36f414ffa5221e2ddae90`; base `atlas9/cerdikgo-workspace-redesign` at `e72ce40170eab4282e1536ed1447467326e1c935`.
   - 1 ahead / 4 behind; mergeable=false; no exact-head workflow.
   - Next: clean feature branch from current approved design base, restore any later reference CSS contract, add responsive/keyboard/focus/accessibility tests, then Preview screenshots and Android acceptance.

6. **Workspace status visibility**
   - Status: VERIFIED as test/docs candidate on non-main base.
   - PR #91 SHA `023db6f9b8f1b8078cdf6e7d154316e78b774d5e`; run 42079473235 SUCCESS, 91/91.
   - Next: do not infer main integration; reconcile source base and test lock.

### P1 — Backup, files and multimodal

7. **Backup pipeline**
   - Status: FAILED historically for scheduled archive runs; scanner correction VERIFIED; restore NOT TESTED.
   - Failed runs: 41695574776, 41890146458.
   - PR #74 SHA `abeca194672349e799bcfdd9d8f9c9dc82675947`; Gitleaks 41975715983 and regression 41975716157 SUCCESS; 816 commits scanned, no leaks.
   - Next: verify successful scheduled archive, off-site destination, checksum and restore; measure RPO/RTO. Do not upload private data without approval.

8. **Document scanner**
   - Status: BLOCKED for runtime.
   - PR #76 mocked contract tests do not prove a real scanner. PR #78 is architecture proposal only.
   - Next: evaluate a genuinely free, isolated scanner architecture with signed callbacks, queue expiry, replay protection, retention and fail-closed semantics. No paid Cloudflare Containers upgrade.

9. **Voice**
   - Status: NOT TESTED on Android.
   - PR #41 regression passed historically; Production rate-limit binding not evidenced.
   - Next: verify microphone permission, transcription, playback, rate limiting and failure states on Android Chrome.

10. **Live Web Research**
    - Status: NOT TESTED.
    - Existing structured document research is not live web retrieval or persistent RAG.
    - Next: design source allowlist, freshness, citation capture, claim-level entailment and prompt-injection isolation; run 50-task benchmark.

### P2 — Capability and ecosystem

11. **Seven-dimension benchmarks**
    - Status: NOT TESTED.
    - Pilot manifest: 35 tasks; not the full acceptance sample.
    - Next: build the full task set and evaluator, pin model/prompt/version, run blinded scoring and publish raw evidence.

12. **Scale and reliability**
    - Status: NOT TESTED.
    - Synthetic in-process load is not edge load.
    - Next: approved Preview campaign, 100 concurrent users for 30 minutes, seven-day SLO, p95/p99, error rate, recovery and restore.

### Branch and PR management

- PR #60 is Draft and has a diverged history relative to main; do not force-push/rebase automatically.
- PR #68 and #81 report mergeable=false despite historical successful CI.
- PR #88 is blocked as detailed above.
- PR #91 targets a non-main base.
- PR #85/#87 and #86 are older stacked candidates; prefer review of clean main-based PRs #89/#92/#93, but do not merge automatically.
- PR #90 installation guide candidate passed; documentation is not integrated until approved.

### Handover safety

- Exactly nine specialist profiles; Optimus Prime is coordinator.
- Gateway remains `plan_only`.
- No merge, Production deployment, D1 write/migration, OAuth/secret/DNS modification, billing or autonomous specialist execution.
- Human Verification has not started.


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

### Priority handover
- P0: retest the post-append PR #95 head; add/validate a main-based readiness workflow without broadening permissions; review PR #92 authentication and PR #93 observability before any integration.
- P0: confirm actual live Preview/Production D1 bindings through a read-only environment-specific configuration source. Current settings response was insufficient; do not write or migrate D1.
- P1: PR #88 remains BLOCKED/non-mergeable (base `atlas9/cerdikgo-workspace-redesign`, head `atlas9/cerdikgo-v2-light-preview-20261105`); reconcile only after fresh diff and visual regression evidence.
- P1: PR #74 full-history secret scan passed, but scheduled backup runs `41695574776` and `41890146458` remain historical FAILED; archive, off-site copy and restore drill remain NOT TESTED.
- P1: scanner runtime remains BLOCKED; preserve fail-closed behavior. Voice Android, live web research, persistent RAG, edge-scale and seven-day SLO remain NOT TESTED.
- P2: run complete 100/50/50/50/30/90 task suites and seven-day reliability/scale campaign; report per-dimension scores only from raw reproducible outputs.


## 2026-11-06 — Backup security follow-up

- Status: VERIFIED for the cited PR #74 candidate; main scheduled backup remains FAILED. This is a new append-only record; no earlier failure is removed.
- Main backup workflow run `42086628529` (2026-11-05 18:41:17 UTC) FAILED at Gitleaks 8.24.3. Three findings were reported; archive creation, artifact publication and Google Drive upload were skipped. The main branch did not load PR #74's unmerged `.gitleaks.toml`.
- PR #74 exact candidate: `9f3940efeeea0a7d6ea85f6e48969d7120d84644`, branch `atlas9/backup-gitleaks-allowlist-20261105`, Draft, base main `bc6545d6d19fd4b749d0b65fefba3d74775e0221`, 9 commits ahead / 0 behind.
- PR #74 full-history scan run `42148160740`: SUCCESS; Gitleaks 8.24.3 scanned 1,093 commits / approximately 2.55 MB across fetched refs; no leaks found. PR regression run `42148160744`: SUCCESS, 38/38 passed. Event-scoped PR scan examined 9 commits / approximately 12.97 KB and also found no leaks.
- Evidence: https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/42148160740 and https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/42148160744. PR link: https://github.com/CerdikChat/cerdikchat-mvp/pull/74.
- Three narrow, line-targeted allowlists require exact file path AND exact literal; default Gitleaks rules remain enabled. Two Git commit SHA findings in the master ledger were verified through GitHub as commit objects, not credentials. No global allowlist was added.
- PR #95 pre-append exact candidate `e6972d5e96d99920adc8996ad55ac83deb5fc325` had Auto Pilot run `42147411322` and regression run `42147410943`, both SUCCESS (41/41). This register append creates a new PR #95 head; its exact-head gate must run again before readiness can be carried forward.
- No backup archive, Drive upload, restore drill, merge, deployment, D1 operation, credential change or billing action occurred.

### Current backup handover
- Main scheduled backup run `42086628529` is FAILED at Gitleaks; archive/artifact steps were skipped. This is the latest observed main backup failure.
- PR #74 head `9f3940efeeea0a7d6ea85f6e48969d7120d84644` now passes full-history scanning and 38/38 regression, but remains Draft and unmerged.
- Outstanding after approved integration: successful main backup generation, SHA-256 verification, off-site copy policy/approval, and isolated restore with measured RPO/RTO. Do not claim backup/recovery readiness yet.
