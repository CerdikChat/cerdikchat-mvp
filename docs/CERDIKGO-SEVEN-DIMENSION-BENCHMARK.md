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
- PR #60 head `6b24a410de3925f649189fba6450265be7318236`: Auto Pilot gate `41917922881`, regression/install `41917922855`, Phase 3 `41917922823`, and hybrid gateway `41917922865` completed successfully. The gate tested merge candidate `26cd4038e4d9ef79bbe1320dc1b8fb3b290687b0`; all 129 automated tests passed, including the manifest-structure test.
- PR #61 head `17760f85b01e0db2e7a09679324d55adfe1fcf95`: security regression `41917776597` and regression `41917776653` passed; 99 tests passed and the auth-log redaction check passed.
- Earlier readiness runs `41877325709`, `41879349586`, and `41917595755` failed because the workflow safety grep matched its own literal pattern or a stale inherited workflow. The corrected workflow and PR #60 branch synchronization resolved the issue; current PR #59 and PR #60 merge-candidate gates pass.

## 5. Release and verification gate

A dimension is 100% VERIFIED only when every mandatory KPI reaches its threshold with reproducible evidence and no unresolved critical/high-severity defect relevant to that dimension. Any exception requires an explicit, recorded risk acceptance and must be shown as an exception—not silently counted as a pass.

CI success is not Preview runtime health, Android human acceptance, or Production readiness. Human Verification may begin only after Auto Pilot passes for the exact candidate being verified.
