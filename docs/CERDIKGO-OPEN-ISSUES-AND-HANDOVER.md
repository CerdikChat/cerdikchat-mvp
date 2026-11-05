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
