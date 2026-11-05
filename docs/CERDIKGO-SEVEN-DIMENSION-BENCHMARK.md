# CerdikGo — Seven-Dimension Competitive Benchmark

**Target:** 100% VERIFIED acceptance in all seven dimensions. This is an internal readiness target, not a claim of parity with or superiority over Gemini or any other model.

## 1. Reproducible protocol

- Benchmark ID: `cerdikgo-atlas9-seven-dimension`.
- Pilot dataset: `benchmarks/seven-dimension/tasks.v0.1.json` (35 smoke tasks; five per dimension).
- Dataset v0.1 is a smoke-test manifest, not a statistically sufficient comparative benchmark and not a model score.
- Keep prompt text, dataset version, system prompt, model identifier/version, tools, context, token/time limits, temperature, and scoring rubric fixed for each comparison.
- Run the same tasks against CerdikGo and comparator models. Randomize run order where feasible and run at least three repetitions for stochastic tasks.
- Score only evidence-backed results. Record raw outputs, rubric decisions, timestamps, exact candidate SHA, model/provider version, environment, and run links. Redact credentials and personal data.
- Untested criteria earn no points. Do not infer a score from feature presence, qualitative estimates, CI green, or product claims.
- Publish each dimension score separately, the mean, and the weakest dimension. A 100% overall mean is insufficient if any single dimension is below 100%.
- Do not compare models with unequal tools, context, retrieval access, or token/time budgets without explicitly labeling the comparison as non-equivalent.

## 2. KPI weights and pass thresholds

Each dimension has 100 points. A dimension earns 100/100 only when every mandatory KPI below meets its threshold and every required test has reproducible evidence.

| Dimension | KPI allocation | Mandatory 100% acceptance thresholds |
|---|---|---|
| General AI reasoning | Correctness 40; instruction adherence 15; factuality/abstention 20; calibration 15; repeatability 10 | At least 100 tasks; rubric correctness ≥90%; instruction adherence ≥98%; unsupported high-confidence factual claims ≤1%; expected calibration error ≤0.08; repeatability agreement ≥95%. |
| Coding & engineering | Functional correctness 35; security 25; build/typecheck 15; regression 15; maintainability 10 | At least 50 tasks; acceptance tests pass ≥95%; security-critical tests 100%; build/typecheck 100%; introduced critical/high defects 0; regression suite 100% green. |
| Specialized research & analysis | Claim/source support 35; claim coverage 20; source quality 15; uncertainty 15; freshness 15 | At least 50 tasks; citation precision ≥98%; material-claim citation coverage ≥95%; unsupported material claims ≤1%; source-quality rubric ≥90%; freshness-window compliance ≥95%; conflicting evidence disclosed 100%. |
| Governance, audit & control | RBAC 25; approval gates 20; auditability 20; data protection 20; negative tests 15 | At least 50 scenarios; all allow/deny authorization cases 100%; prohibited actions blocked 100%; approval bypasses 0; required audit events complete 100%; secret/PII leakage in logs or responses 0. |
| Organizational workflow integration | End-to-end completion 30; idempotency 20; recovery 20; permissions 20; handoff 10 | At least 30 end-to-end scenarios; valid task completion ≥95%; idempotency 100%; safe retry/recovery ≥95%; unauthorized side effects 0; handoff record completeness 100%. |
| Product identity & specialization | Registry integrity 20; routing 25; specialist quality 30; boundaries/truthfulness 15; UX consistency 10 | Exactly nine unique specialist IDs (ATLAS-01…ATLAS-09); at least 10 tasks per specialist; routing accuracy ≥95%; each specialist score ≥90%; cross-role permission violations 0; false independent-agent/capability claims 0. Optimus Prime is coordinator, not a tenth specialist. |
| Ecosystem maturity & scale | Reliability 20; performance 20; scale 15; backup/restore 20; install/accessibility 15; operations 10 | At least 7 days of Preview SLO evidence; availability ≥99.5%; non-inference API p95 ≤2 s under stated load; inference p95 ≤12 s only where model/task budget permits and is separately reported; 100 concurrent synthetic users for 30 min with error rate <1%; restore success 100%, RPO ≤24 h, RTO ≤4 h; supported Android/browser installation checks pass; critical WCAG 2.2 AA checks pass. |

**Interpretation:** thresholds are acceptance targets to be validated against the actual product and its free-tier limits. If a threshold proves unsuitable, change it through a recorded decision before benchmark execution; never lower it retrospectively to make a failed run green.

## 3. Pilot smoke tasks

The v0.1 manifest contains 35 fixed tasks:
- `GR-001…GR-005`: arithmetic, logic, uncertainty and unsupported-claim abstention.
- `CE-001…CE-005`: safe code, parameterized SQL, async correctness, negative tests and CI design.
- `SR-001…SR-005`: conflicting evidence, source freshness, claim mapping, fact/inference separation and citation sufficiency.
- `GV-001…GV-005`: Production approval, RBAC, audit completeness, log privacy and privilege escalation.
- `WF-001…WF-005`: idempotency, partial failure, approval gates, rate-limit recovery and human handoff.
- `PI-001…PI-005`: nine-role registry, specialist routing, truthful agent status, product naming and plan-only boundaries.
- `EC-001…EC-005`: doctor limits, missing binding, backup integrity, load-test reporting and Android accessibility.

The automated manifest test validates task count, uniqueness, dimension coverage and rubric presence only. It does not execute model inference or assign performance scores.

## 4. Current evidence snapshot — 2026-11-05

Historical percentage ranges previously discussed (reasoning 15–25%, coding 20–30%, research 30–40%, governance 55–65%, workflow 45–55%, identity 50–60%, ecosystem 10–20%) are **qualitative estimates only**, not measured benchmark scores.

| Dimension | Measured score | Evidence-backed status | Remaining evidence gap |
|---|---:|---|---|
| General AI reasoning | Not measured | NOT TESTED | Full 100-task run and scoring |
| Coding & engineering | Not measured | PARTIALLY VERIFIED | CI/typecheck/regression passed on PR #59 candidate; 50-task model benchmark and deeper security/quality scoring remain |
| Specialized research & analysis | Not measured | NOT TESTED | 50-task source-grounded benchmark; live search provider is not yet evidenced as configured |
| Governance, audit & control | Not measured | PARTIALLY VERIFIED | Automated auth/file negative tests passed in CI; full 50-scenario security, audit and privacy review remains |
| Organizational workflow integration | Not measured | NOT TESTED | 30 end-to-end integration/recovery scenarios |
| Product identity & specialization | Not measured | PARTIALLY VERIFIED | PR #59 registry contract tests cover nine immutable, read-only, non-executing roles; per-specialist quality/routing benchmark remains |
| Ecosystem maturity & scale | Not measured | PARTIALLY VERIFIED | Local doctor/install preflight passed; Preview runtime, Android acceptance, load, SLO, backup restore and DR evidence remain |

### CI evidence relevant to the baseline

- PR #57 head `570471a9303cda3beb110d04c80445a4db104039`: regression/install run `41875508518`, Phase 3 run `41875508872`, and hybrid gateway run `41875508705` completed successfully.
- PR #58 head `5b482b05e832ed342791763eba7a84d4c9951c34`: regression/install `41876151107`, Phase 3 `41876151036`, hybrid gateway `41876151233`, and TypeScript foundation `41876151056` completed successfully.
- PR #59 head `637ff536011ed25fc598888f62f520b4cfdccd3c`: Auto Pilot gate `41917635551` and regression/install `41917635482` completed successfully. The gate tested merge candidate `25f416f68c9db0d2ce5a9a22ad38a003e2e36939`; all 127 automated tests passed, and installation preflight, TypeScript, regression and workflow safety scan passed.
- PR #60 latest head `f36cafa56f2d2b99e88eecf88a2c615859f839fe`: Auto Pilot gate `41918584320`, regression/install `41918584510`, Phase 3 `41918584336`, and hybrid gateway `41918584290` completed successfully. The gate tested merge candidate `b46485d`; all 129 automated tests passed, including the manifest-structure test. Branch-push gate `41918571778` and regression/install `41918571397` also passed.
- PR #61 head `17760f85b01e0db2e7a09679324d55adfe1fcf95`: security regression `41917776597` and regression `41917776653` passed; 99 tests passed and the auth-log redaction check passed.
- Earlier readiness runs `41877325709`, `41879349586`, and `41917595755` failed because the workflow safety grep matched its own literal pattern or a stale inherited workflow. The corrected workflow and PR #60 branch synchronization resolved the issue; current PR #59 and PR #60 merge-candidate gates pass.

## 5. Release and verification gate

A dimension is 100% VERIFIED only when every mandatory KPI reaches its threshold with reproducible evidence and no unresolved critical/high-severity defect relevant to that dimension. Any exception requires an explicit, recorded risk acceptance and must be shown as an exception—not silently counted as a pass.

CI success is not Preview runtime health, Android human acceptance, or Production readiness. Human Verification may begin only after Auto Pilot passes for the exact candidate being verified.

## Evidence reconciliation — 2026-11-05: current PR #60–#64 heads

This section supersedes earlier head references for the PRs listed below without deleting the historical snapshots above.

| Dimension | Current measured score | Evidence status as of this update | 100% acceptance target |
|---|---:|---|---:|
| General AI reasoning | NOT MEASURED | NOT TESTED; no 100-task model run | 100/100 |
| Coding & engineering | NOT MEASURED | PARTIALLY VERIFIED; CI/typecheck/regression and dry-run build pass, but no 50-task model engineering benchmark | 100/100 |
| Specialized research & analysis | NOT MEASURED | NOT TESTED; no 50-task source-grounded run; live provider not evidenced as configured | 100/100 |
| Governance, audit & control | NOT MEASURED | PARTIALLY VERIFIED; auth/file/MCP negative tests and log-redaction CI pass, but no 50-scenario full governance suite | 100/100 |
| Organizational workflow integration | NOT MEASURED | NOT TESTED; no 30-scenario end-to-end integration run | 100/100 |
| Product identity & specialization | NOT MEASURED | PARTIALLY VERIFIED; exact nine-role registry contract and plan_only boundaries have passing CI; per-specialist 10-task quality/routing benchmark not run | 100/100 |
| Ecosystem maturity & scale | NOT MEASURED | PARTIALLY VERIFIED; local preflight and Wrangler dry-run pass; Preview runtime, 7-day SLO, Android, 100-user load, restore and DR not tested | 100/100 |

### Current exact-head CI evidence
- PR #60 head d90c492116729f886a9adca329c581151e1884f5: runs 41919509234, 41919509283, 41919509532, 41919509348 all success; 129/129 tests.
- PR #62 head 1fa32453e9569b136ec890b7c32562dda510612f: runs 41921781529, 41921781474, 41921781561, 41921781630 all success.
- PR #63 head 4c5276f2ff5307949f912451d554d9be879223b6: runs 41945833238, 41945833224, 41945833375, 41945833236 all success; 139/139 tests.
- PR #64 head 929e5bcf9d2be683c94b9cd882209ce194fc9119: runs 41944458563, 41944458347, 41944458558, 41944458354 all success; 134/134 tests.
- PR #61 head 17760f85b01e0db2e7a09679324d55adfe1fcf95: push security/regression runs 41917776597 and 41917776653 success; 99/99 security tests. Remediation remains unmerged into PR #52.

The 35-task v0.1 manifest is a structural smoke-test fixture only. It does not execute model inference, assign model scores, establish statistical confidence, or demonstrate parity/superiority over Gemini. Untested criteria earn no points. A 100% dimension requires every mandatory KPI, sample-size requirement and evidence condition in Section 2 to pass.

## Additional evidence boundaries — 2026-11-05

- PR #52 Preview deployment success (run 41825376685) proves a Preview was created with staging D1, not that the application passed HTTP health, authenticated user journeys, Android usability, or SLO checks.
- PR #52's 99,990-request campaign calls worker.fetch() in-process using synthetic requests and no external network, D1 writes, Google calls, AI inference, or Production traffic. It is not the 100-concurrent-user Cloudflare edge benchmark required by the ecosystem dimension.
- PR #65 regression (95/95) validates source-span checks, not model research quality or semantic entailment.
- PR #66 regression (102/102) and Wrangler dry-run validate configuration and tests, not deployed observability behavior.
- The current measured score for every competitive dimension remains NOT MEASURED. No score is awarded for feature presence, local synthetic stress, CI pass, Preview creation alone, or smoke-manifest completeness.

## Exact-head readiness does not change competitive scores — 2026-11-05

- PR #65 passed 95/95 tests and its exact-head legacy readiness gate; this validates document evidence-source-span handling and branch installation/config safety only.
- PR #66 passed 102/102 tests and its exact-head legacy readiness gate plus Wrangler dry-run; this validates query-string redaction configuration, not actual deployed telemetry behavior.
- The PR #52 primary Preview lacks FILE_SCANNER and VOICE_RATE_LIMITER bindings, so document scanning and voice transcription are NOT VERIFIED at runtime.
- All seven competitive model scores remain NOT MEASURED. CI, readiness gates, source-span checks and configuration dry-runs earn no AI capability score.

## Correction — 2026-11-05: Preview voice capability status
The PR #52 deployed source uses CHAT_RATE_LIMITER for voice transcription, and that binding is present. The earlier claim of a missing VOICE_RATE_LIMITER binding on that Preview was incorrect for the deployed commit. This does not establish voice runtime success: model invocation, browser microphone support, playback, interruption and Android acceptance remain NOT TESTED. FILE_SCANNER is absent and document scanning is blocked by fail-closed behavior.

## Benchmark integrity note — 2026-11-05
The PR #65 evidence validator's first implementation candidate failed its regression workflow (run 41949291912: 35 passed, 1 failed due to malformed test-source escaping). The corrected implementation passed 95/95 on commit 2529b05efa4fd02883eb493a2683218a7be2e83f and the final readiness gate passed on 154301128cc8824b76969b5da603807f5125b414. This is software-regression evidence only; it does not add points to specialized research or AI capability scores.

## Product identity evidence boundary — 2026-11-05
The canonical nine-role identity contract is CI-verified on PR #62, but the current primary Preview from PR #52 still contains the legacy ATLAS-plus-seven-role prompt. Therefore product identity/specialization is PARTIALLY VERIFIED in the development candidate and FAILED for parity in the deployed Preview. No independent nine-agent execution is evidenced, and the seven-dimension score remains NOT MEASURED.

## Engineering evidence correction — 2026-11-05
The first PR #63 MCP hardening candidate failed because valid Bearer tokens were rejected (401). The corrected final candidate passed 139/139 tests and all four exact-head workflows. This validates a security parser fix only; it does not produce coding, reasoning, or competitive AI benchmark scores.


## Exact-head reconciliation — 2026-11-05 (latest audit)

The latest scorecard candidate is PR #60 head `ad3cbd61b6467675e71e8445f113635c45beb8c9` on `atlas9/cerdikgo-100-percent-scorecard`. Its exact-head runs all completed successfully:
- Auto Pilot readiness: 41950862476 — https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41950862476
- Regression/installation: 41950862498 — https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41950862498
- Phase 3 regression: 41950862526 — https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41950862526
- Hybrid Gateway: 41950862654 — https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41950862654
The readiness, regression and Phase 3 logs each report 129 tests, 129 passed, 0 failed. Hybrid Gateway also completed Wrangler 4.153.0 `--dry-run`; no deployment occurred.

Other exact-head evidence confirmed during this audit:
- PR #68 head `973ea276a93bc8d47419d11b29be3259190cbe97`, readiness 41951461346 (104/104): https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41951461346
- PR #69 head `cb5264803ca3efad03a8d168592c0b02d395354e`, readiness 41951721640 (102/102): https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41951721640
- PR #63 head `4c5276f2ff5307949f912451d554d9be879223b6`, runs 41945833238, 41945833224, 41945833375, 41945833236 (139/139): https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41945833238 ; https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41945833224 ; https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41945833375 ; https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41945833236
- PR #65 head `154301128cc8824b76969b5da603807f5125b414`, readiness/regression 41949995940 and 41949995918 (95/95): https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41949995940 ; https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41949995918
- PR #66 head `721ef9a7eb7068dcbe40ccad9df0d5b188e6e3a1`, readiness/regression/config dry-run 41950007358, 41950000882, 41950007360 (102/102): https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41950007358 ; https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41950000882 ; https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41950007360
- PR #61 head `17760f85b01e0db2e7a09679324d55adfe1fcf95`, security/regression 41917776597 and 41917776653 (99/99): https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41917776597 ; https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41917776653

PR #70 head `d546c121c9d95f6568eb4c7d728655d72fd2fcd1` and PR #52 head `4114cfa5ca082dfb8736d9d7aa68bb297087d8c0` have no exact-head workflow run or combined status returned at this checkpoint. They are BLOCKED/NOT VERIFIED for Auto Pilot. No benchmark inference run was executed; all seven measured dimension scores remain NOT MEASURED.


## Exact-head evidence correction — 2026-11-05

The 129/129 CI evidence previously recorded for PR #60 applies to head `ad3cbd61b6467675e71e8445f113635c45beb8c9` only. The scorecard branch was later advanced by append-only audit updates; the pre-correction observed head `d8fd4d04b119f4e8a63bffa6624396ead9f723f3` has no exact-head workflow run or combined status. PR #60 reports mergeable=false and compare shows it is 2 commits behind base. The current documentation branch is therefore **BLOCKED** for Auto Pilot/integration until reconciled and retested. All seven competitive model scores remain NOT MEASURED; no model inference benchmark has been executed.


## Current CI evidence correction — 2026-11-05

- PR #60 head `62e36278386e37a47b91c4e246ac7ccb6ba9decf`: readiness `41953152984`, regression/install `41953152983`, Phase 3 `41953153084`, Hybrid Gateway `41953152956` all passed; 129/129 tests, 0 failures. The readiness log records PR base snapshot `de11d34257005ba72a621312230489a7d161ff53`; current base branch head is `637ff536011ed25fc598888f62f520b4cfdccd3c`, two commits ahead. This is engineering CI evidence, not a model benchmark.
- PR #70 archive candidate head `d546c121c9d95f6568eb4c7d728655d72fd2fcd1`: legacy readiness `41952747628` passed 108/108 tests; install, preflight, Wrangler dry-run and safety scan passed. The run records base snapshot `9be9a8c3f6df416d66452c3d8c69c5112c853207`; current admin-governance base is two commits ahead.
- PR #52 head `3653fa27ce9cbd01849b6f8a5478e7c335eb2465` has no exact-head PR workflow result.
- All seven competitive model scores remain NOT MEASURED. No Workers AI or Gemini inference tasks were executed. Green CI does not award AI capability points.


## Latest CI evidence — 2026-11-05

- PR #52 `3653fa27ce9cbd01849b6f8a5478e7c335eb2465`: legacy readiness `41953302757` passed 99/99; TypeScript NOT CONFIGURED.
- PR #70 `0aae5032f2d6521255aefea172a27552ea3053a8`: legacy readiness `41953678319` passed 108/108; TypeScript NOT CONFIGURED.
- PR #60 `465f8c5a6dc2f65c59537078fa98759c73299181`: four workflows passed 129/129, including strict TypeScript and Wrangler dry-run; tested base snapshot is two commits behind current base.
- These results validate bounded CI tasks only. The 35-task manifest has not been executed against any model. All seven model scores remain NOT MEASURED.

## Final scorecard candidate gate — 2026-11-05

PR #60 exact head `53989231850f5f1628bf5b10203cc5e81ca9bb97` passed all four workflows:
- Auto Pilot readiness `41953817591` — 129/129, zero failures: https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41953817591
- Regression/install `41953817553` — 129/129, zero failures: https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41953817553
- Phase 3 regression `41953817606` — 129/129, zero failures: https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41953817606
- Hybrid Gateway `41953817569` — 129/129, zero failures; Wrangler 4.153.0 dry-run exited normally: https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41953817569

Readiness log identifies PR head `53989231850f5f1628bf5b10203cc5e81ca9bb97` and base snapshot `de11d34257005ba72a621312230489a7d161ff53`. The current base branch is two commits ahead. Do not treat this as Preview/Android/Production acceptance or as a model capability score. All seven model scores remain NOT MEASURED.


## Current measured evidence snapshot — 2026-11-05 audit

**Reviewed candidate:** `c38274f200e3762db242bd5642cc783a2dfa5de5` on `atlas9/cerdikgo-100-percent-scorecard`. The PR #60 base branch currently points to `637ff536011ed25fc598888f62f520b4cfdccd3c`; comparison is 69 commits ahead / 2 behind, so integration is **BLOCKED** pending safe synchronization and a new exact-head gate.

| Competitive dimension | Evidence-credit score | Capability score | Current status |
|---|---:|---|---|
| General AI reasoning | 0/100 | NOT MEASURED | NOT TESTED — no 100-task inference run |
| Coding & engineering | 0/100 | NOT MEASURED | CI evidence exists, but no 50-task model engineering benchmark |
| Specialized research & analysis | 0/100 | NOT MEASURED | NOT TESTED — no 50-task source-grounded run; Live Web Research provider not configured |
| Governance, audit & control | 0/100 | NOT MEASURED | PARTIALLY VERIFIED controls only; no 50-scenario benchmark |
| Organizational workflow integration | 0/100 | NOT MEASURED | NOT TESTED — no 30 end-to-end workflow run |
| Product identity & specialization | 0/100 | NOT MEASURED | Gateway registry contract exists; Primary Preview identity parity is FAILED until canonical prompt is integrated |
| Ecosystem maturity & scale | 0/100 | NOT MEASURED | CI/preflight evidence only; Preview SLO, Android, edge load and restore are NOT TESTED |

**Scoring clarification:** 0/100 is the evidence-credit score because no competitive benchmark task has been executed and scored. It is not a measured model-quality result and does not mean the model has zero capability. The capability score remains **NOT MEASURED** for all seven dimensions. The 35-task v0.1 file is a structural smoke manifest only; it is not a statistically adequate evaluation and has not been run against a model.

### Verified engineering evidence — separate from competitive scores

- PR #60 exact head `c38274f200e3762db242bd5642cc783a2dfa5de5`: Auto Pilot `41954020365`, regression/install `41954020357`, Phase 3 `41954020411`, Hybrid Gateway `41954020566`; all four SUCCESS, 129/129 tests, zero failures. The readiness log confirms `npm run doctor`, strict TypeScript, full regression, and Wrangler dry-run. Base snapshot in the run was `de11d34257005ba72a621312230489a7d161ff53`.
- PR #73 exact head `98423d8aa14317052511cc69e98a8341713a3381`: Auto Pilot `41974840542` SUCCESS, 104/104 tests; push regression `41974833367` SUCCESS. Wrangler 4.153.0 dry-run and workflow safety scan passed. TypeScript is NOT CONFIGURED on this JavaScript branch.
- PR #70 exact head `0aae5032f2d6521255aefea172a27552ea3053a8`: Auto Pilot `41953678319` SUCCESS, 108/108 tests. This uses mocked/isolated D1 behavior; migration `0008_feature_request_archive.sql` remains unapplied.
- PR #52 exact head `679a6719fcfa1492f984c094adbcaa1dad2ddff3`: regression `41973472009`, Auto Pilot `41973478257`, and isolated Preview workflow `41973472047` all SUCCESS. This is CI/Preview deployment evidence, not human runtime or Android acceptance.

### Architecture and runtime boundaries

- Current scorecard-branch model router is free-only Workers AI, defaulting to `@cf/google/gemma-4-26b-a4b-it`; DeepSeek and GitHub Copilot are disabled and no fallback is configured. No live inference or model comparison has been run.
- The gateway declares exactly ATLAS-01 through ATLAS-09; Optimus Prime is coordinator outside the nine seats. Every registry entry is read-only, has no tools, and has execution disabled. Gateway output is `plan_only`; no provider calls, external fetches, or database writes occur.
- The primary PR #52 Worker prompt still contains the legacy seven-role labels (including TITAN, GENESIS and TERRA) rather than the canonical nine IDs. PR #69/PR #62 identity corrections are not integrated into the Primary Preview. Product identity parity is therefore FAILED for that Preview.
- Document analysis requires the private `FILE_SCANNER` Service Binding and fails closed when it is absent. The PR #52 Preview metadata does not include that binding. Voice code uses `CHAT_RATE_LIMITER`; its runtime and Android acceptance remain NOT TESTED.
- Live Web Research is not implemented/configured. PR #34 is an architecture foundation; PR #35 is single-file/stateless document research, not persistent RAG or web search.
- The 99,990-request script is synthetic in-process `worker.fetch()` testing, not Cloudflare edge load. No 100-concurrent-user/30-minute edge test or seven-day SLO evidence exists.
- Scheduled backup run `41890146458` failed at Gitleaks before archive creation. PR #74 is correcting one reviewed localStorage false positive; backup restore remains NOT TESTED.

The 100% thresholds and minimum sample sizes in Section 2 remain unchanged. No threshold was lowered and no score was inferred from feature presence or green CI.
