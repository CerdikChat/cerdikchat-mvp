# CerdikGo — Seven-Dimension Competitive Benchmark

**Purpose:** measure progress toward 100% VERIFIED acceptance in seven competitive dimensions. This is an internal readiness scorecard, not a claim of parity with or superiority over Gemini or any other model.

## Scoring protocol
- Each dimension has 100 weighted points, split across observable tests.
- Score only evidence-backed passing criteria. Untested = 0 points awarded, not presumed failure or success.
- A criterion passes only when its test, expected result, actual result, date, environment, model/version, and evidence link are recorded.
- Overall score = arithmetic mean of the seven dimension scores. Also publish the weakest dimension; never hide it in the average.
- Re-run on material model, prompt, code, configuration, or dataset changes. Keep benchmark set/version fixed for comparisons.
- Use identical task sets, context, tools, token/time limits, and scoring rubrics when comparing providers. Report sample size and confidence/limitations.
- No benchmark result alone establishes that CerdikGo defeats Gemini generally.

## Dimensions and acceptance evidence

| Dimension | Weight | Required evidence for 100/100 |
|---|---:|---|
| General AI reasoning | 100 | Versioned representative reasoning set; factuality, logical validity, calibration, instruction adherence, abstention, and repeatability scored against a reviewed rubric; all mandatory thresholds met. |
| Coding & engineering AI | 100 | Versioned coding tasks; build/typecheck/unit/integration/regression/security results; correctness, maintainability, patch safety, and reproducibility thresholds met. |
| Specialized research & analysis | 100 | Source-grounded research tasks; citation precision, source quality, claim traceability, synthesis accuracy, uncertainty handling, and freshness thresholds met. |
| Governance, audit & control | 100 | RBAC/authorization tests, audit-log completeness, approval gates, data handling, threat-model checks, policy enforcement, and negative tests all pass. |
| Organizational workflow integration | 100 | End-to-end workflow scenarios across supported integrations; idempotency, error recovery, permissions, observability, and human handoff verified. |
| Product identity & specialization | 100 | Exactly nine documented specialist roles, clear boundaries, routing correctness, domain-task performance, coherent product UX, and no unsupported capability claims. |
| Ecosystem maturity & scale | 100 | Reliability, latency, capacity, backup/restore, recovery, accessibility, installation, operational runbooks, and supported integration coverage meet published SLOs. |

## Current baseline — 2026-11-05
The prior conversational ranges (reasoning 15–25%, coding 20–30%, research 30–40%, governance 55–65%, workflow 45–55%, identity 50–60%, ecosystem 10–20%) were qualitative estimates, not benchmark measurements. They are **NOT TESTED / NOT VERIFIED** and must not be represented as measured scores.

| Dimension | Measured score | Status | Evidence |
|---|---:|---|---|
| General AI reasoning | Not measured | NOT TESTED | Benchmark suite not yet executed |
| Coding & engineering AI | Not measured | NOT TESTED | Benchmark suite not yet executed |
| Specialized research & analysis | Not measured | NOT TESTED | Benchmark suite not yet executed |
| Governance, audit & control | Not measured | NOT TESTED | Full acceptance suite not yet executed |
| Organizational workflow integration | Not measured | NOT TESTED | End-to-end suite not yet executed |
| Product identity & specialization | Not measured | PARTIALLY VERIFIED | PR #59 describes tests for a nine-role plan-only registry; CI queued at baseline |
| Ecosystem maturity & scale | Not measured | NOT TESTED | Reliability/load/recovery suite not yet executed |

## Release gate
A dimension is 100% VERIFIED only when every mandatory criterion passes with reproducible evidence and no unresolved critical/high-severity defect relevant to that dimension. Any exception requires a documented, authorized risk acceptance; it does not silently count as a pass.

**Initial evidence snapshot:** PR #57, #58, #59 are open draft PRs and unmerged. PR #59 head: `de11d34257005ba72a621312230489a7d161ff53`. At the recorded check, workflows `41877325687` and `41877325709` were queued. This is not a passing result.
