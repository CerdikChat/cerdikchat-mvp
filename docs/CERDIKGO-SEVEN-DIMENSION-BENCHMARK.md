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
