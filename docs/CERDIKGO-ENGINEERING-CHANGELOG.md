# CerdikGo Engineering Changelog

Append dated entries. Link every change to its branch, commit SHA, PR, tests, and risk.

## 2026-11-05 — PR #61 auth-log privacy remediation
- Removed email and request identifiers from the access-request authentication log; only a fixed non-identifying event code remains.
- Extended the unlisted-account test to capture logs and assert that email, Google subject and ID token are absent.
- Added isolated push CI workflow `.github/workflows/admin-governance-security-ci.yml`.
- Branch: `atlas9/cerdikgo-admin-governance-security-hardening`; PR #61.
- Head: `17760f85b01e0db2e7a09679324d55adfe1fcf95`.
- Security regression run `41917776597`: success, 99/99 tests and log-redaction source check passed. Regression run `41917776653`: success.
- Scope: does not alter 76-hour session lifetime, Preview workflow, D1 migration, OAuth, secrets, DNS, billing or Production.

## 2026-11-05 — Seven-dimension readiness scorecard and benchmark pilot (PR #60)
- Added `docs/CERDIKGO-SEVEN-DIMENSION-BENCHMARK.md` with explicit KPI thresholds, sample sizes, scoring rules and evidence protocol.
- Added `benchmarks/seven-dimension/tasks.v0.1.json`: 35 fixed smoke tasks, five per dimension.
- Added `tests/benchmark-manifest.test.mjs` to validate manifest dimensions, task count, uniqueness and rubric structure.
- Added/updated ATLAS-9 master ledger, QA register, security/governance register, decision/approval register and open-issues/handover register.
- Branch: `atlas9/cerdikgo-100-percent-scorecard`; PR #60.
- Head: `6b24a410de3925f649189fba6450265be7318236`; tested merge candidate: `26cd4038e4d9ef79bbe1320dc1b8fb3b290687b0`.
- Readiness `41917922881`, regression/install `41917922855`, Phase 3 `41917922823`, hybrid gateway `41917922865`: all success; 129/129 tests passed.
- The manifest test checks structure only; no model inference benchmark was executed.
- Risk: KPI thresholds are acceptance targets, not evidence of current model quality or Gemini parity.

## 2026-11-05 — Auto Pilot readiness scan correction (PR #59)
- Updated `.github/workflows/autopilot-readiness.yml` on `atlas9/cerdikgo-autopilot-readiness`.
- Root cause: workflow grep matched its own literal regex. Split the regex fragments so the scan checks commands without matching its own source.
- Added exact tested checkout and PR-ref recording to the workflow step summary.
- Head: `637ff536011ed25fc598888f62f520b4cfdccd3c`; tested merge candidate: `25f416f68c9db0d2ce5a9a22ad38a003e2e36939`.
- Readiness `41917635551`: success; regression/install `41917635482`: success; 127/127 tests passed.
- No deployment, remote D1 operation, OAuth/secrets, DNS or billing change.

## Prior scorecard documentation commits
- Initial scorecard charter: `ce08d5faa7591774f11c0b2266fcaa85ddaa6e38`.
- Benchmark manifest: `5185b6263cea02efb7eec73fb9e8f29b9d4bab0e`.
- Manifest test: `241b28d02bfe6bcff7add5782612d6b71c84f514`.

## 2026-11-05 — Final PR #60 candidate re-verification
- PR #60 head `a32a800f19ad57a40f2e48f7e71e622070a21c8b`; tested merge candidate `a6215155fe39d37f44ecf468bdee944ba4a852dc`.
- Auto Pilot readiness `41918309854`, regression/install `41918309389`, Phase 3 `41918309358`, and hybrid gateway `41918309299`: all passed; 129/129 tests passed.
- Branch-push readiness `41918299433` and regression/install `41918299401`: passed.
- This run confirms CI and benchmark-manifest structure only; it does not measure model reasoning, research quality or Gemini parity.

## 2026-11-05 — PR #60 final candidate CI re-run
- Head `f36cafa56f2d2b99e88eecf88a2c615859f839fe`; tested merge candidate `b46485d`.
- Readiness `41918584320`, regression/install `41918584510`, Phase 3 `41918584336`, hybrid gateway `41918584290`, and branch-push readiness `41918571778`: all passed.
- 129/129 tests passed; model inference benchmark remains NOT TESTED.

## 2026-11-05 — PR #60 current branch final gate
- Head `84c2d48857436519a9d712e8d3f7987c01397e0f`; tested merge candidate `2629ad5b03bd85a5229ebd88f003a281a63a6206`.
- Readiness `41918816079`, regression/install `41918816057`, Phase 3 `41918816053`, hybrid `41918816105`, push readiness `41918810790`, and push regression `41918810833`: all passed, 129/129 tests.

## 2026-11-05 — MCP authentication regression fix (PR #63)
- Corrected the Bearer authorization parser in worker.js: the whitespace expression is now interpreted as whitespace rather than a literal escaped sequence.
- Added malformed-Bearer regression coverage in tests/mcp-security.test.mjs; retained fail-closed rate-limit behavior, pre-auth IP throttling, credential-fingerprint throttling, and POST-only MCP.
- Added security scope and residual limitations in docs/MCP-SECURITY-HARDENING.md.
- Branch: atlas9/cerdikgo-mcp-security-hardening; head: 4c5276f2ff5307949f912451d554d9be879223b6; PR: https://github.com/CerdikChat/cerdikchat-mvp/pull/63 .
- Exact-head CI: 41945833238, 41945833224, 41945833375, 41945833236 — all success; Auto Pilot log: 139/139 tests passed, 0 failed.
- Risk/status: MCP remains disabled unless CERDIKGO_MCP_ENABLED is explicitly enabled in an environment; this PR does not activate it or add executing tools. Draft/open/unmerged.

## 2026-11-05 — Connectors navigation and Preview workflow (PR #64)
- Added desktop/mobile Connectors entry points, accessible dialog/panel, honest non-connected status copy, and scalable icon.
- Changed files: src/index.html, src/connector-hub.svg, tests/connectors-menu.test.mjs, .github/workflows/preview-pr64.yml.
- Branch: atlas9/cerdikgo-connectors-menu; head: 929e5bcf9d2be683c94b9cd882209ce194fc9119; PR: https://github.com/CerdikChat/cerdikchat-mvp/pull/64 .
- Exact-head CI: 41944458563, 41944458347, 41944458558, 41944458354 — all success; Auto Pilot log: 134/134 tests passed, 0 failed.
- Preview workflow is manual-dispatch only. It was not dispatched and no Preview URL was generated. UI does not activate connectors or prove runtime connectivity.
- Risk/status: Android visual acceptance and Preview runtime remain NOT TESTED. Draft/open/unmerged.

## 2026-11-05 — ATLAS-9 identity and specialist registry verification (PR #62)
- Canonical nine-role identity fix is present at head 1fa32453e9569b136ec890b7c32562dda510612f on atlas9/cerdikgo-atlas9-identity-fix.
- Preserves ATLAS-01 through ATLAS-09 exactly; Optimus Prime remains coordinator outside the nine specialist seats; legacy TITAN/GENESIS/TERRA are not active specialist IDs.
- Exact-head runs 41921781529, 41921781474, 41921781561, 41921781630 all passed. Registry contract tests do not establish nine independent model workers; gateway remains plan_only.
- PR: https://github.com/CerdikChat/cerdikchat-mvp/pull/62 .

## 2026-11-05 — Documentation evidence reconciliation
- Append-only records updated on atlas9/cerdikgo-100-percent-scorecard from parent d90c492116729f886a9adca329c581151e1884f5.
- Files: docs/ATLAS9-MASTER-DEVELOPMENT-LEDGER.md; docs/CERDIKGO-ENGINEERING-CHANGELOG.md; docs/ATLAS9-TESTING-AND-QA-REGISTER.md; docs/ATLAS9-SECURITY-GOVERNANCE-REGISTER.md; docs/ATLAS9-DECISION-AND-APPROVAL-REGISTER.md; docs/CERDIKGO-OPEN-ISSUES-AND-HANDOVER.md; docs/CERDIKGO-SEVEN-DIMENSION-BENCHMARK.md.
- Scope is documentation-only; no application code, runtime configuration, secrets, database, or deployment changed.
- CI for the resulting documentation commit must be checked on its exact SHA before treating that candidate as Auto Pilot ready.

## 2026-11-05 — Document evidence integrity hardening (PR #65)
- Branch/head: atlas9/cerdikgo-document-evidence-integrity / 2529b05efa4fd02883eb493a2683218a7be2e83f; base PR #35 branch.
- Changed files: multimodal/file-analysis.js; tests/worker.test.mjs; docs/RESEARCH-EVIDENCE-VALIDATION.md.
- Supported findings now require a normalized-verbatim excerpt from extracted text; unsupported findings must be explicitly marked insufficient_evidence with no fabricated excerpt or reference.
- Regression runs 41949338154 and 41949364570 passed; 95/95 tests. Draft/open/unmerged; no Auto Pilot readiness run for this head.

## 2026-11-05 — Observability query-string redaction (PR #66)
- Branch/head: atlas9/cerdikgo-observability-redaction / 1efff727f6c208d3c030b1162f2065abad5bdf7a; base PR #52 branch.
- Changed files: wrangler.toml; tests/observability-config.test.mjs; docs/CERDIKGO-OBSERVABILITY-PRIVACY-HARDENING.md; .github/workflows/observability-config-validation.yml.
- Enables redact_query_string for top-level and Preview observability, keeps current sampling/persistence, and tests Preview D1 staging isolation.
- Regression 41949598277 passed 102/102 tests; Wrangler config dry-run 41949598379 and 41949605643 passed. No deployment performed. Draft/open/unmerged; no Auto Pilot readiness run for this head.

## 2026-11-05 — Existing Preview deployment evidence correction (PR #52)
- PR #52 exact head 9be9a8c3f6df416d66452c3d8c69c5112c853207 was Preview-deployed successfully by run 41825376685 on 2026-11-04.
- Stable URL: https://atlas9-prompt-intelligence-mvp-cerdikchat-mvp.ngyoonseong.workers.dev ; immutable URL: https://29f5c85f-cerdikchat-mvp.ngyoonseong.workers.dev .
- Deployment used cerdikchat-staging D1 ID 79267e63-e57f-4237-8b88-f1e477397771. No health probe or Android acceptance was performed. This is not the PR #64 Connectors candidate.
- Deployment logs exposed query-string redaction disabled. PR #66 proposes the config fix; it has passed dry-run only and has not been deployed.

## 2026-11-05 — Exact-candidate readiness gates for legacy JavaScript branches
- PR #65 final head 154301128cc8824b76969b5da603807f5125b414 adds .github/workflows/autopilot-readiness-legacy.yml. Exact-head readiness runs 41949995940 and 41949989419 passed; 95/95 tests. It runs safe dependency installation, repository preflight, npm test, Wrangler dry-run, and workflow safety scan. TypeScript is not configured and is explicitly not counted as passed.
- PR #66 final head 721ef9a7eb7068dcbe40ccad9df0d5b188e6e3a1 adds the same legacy readiness gate. Runs 41950007358 and 41950001066 passed; 102/102 tests. Wrangler dry-run run 41950007360 also passed. No deployment occurred.
- Both PRs remain draft/open/unmerged. Their exact candidates are eligible for Human Verification, but no Human Verification was initiated.

## 2026-11-05 — Correction to Preview voice binding analysis
- Exact PR #52 deployed source commit 9be9a8c3f6df416d66452c3d8c69c5112c853207 uses CHAT_RATE_LIMITER in multimodal/voice-assistance.js, with a voice:user key prefix. The Preview contains CHAT_RATE_LIMITER.
- The earlier note that the deployed Preview lacked VOICE_RATE_LIMITER was incorrect for this source version; PR #41's branch uses a newer, different binding contract and is not the deployed code.
- Voice runtime and Android acceptance remain NOT TESTED. The FILE_SCANNER binding remains absent and file analysis remains fail-closed.

## 2026-11-05 — PR #65 intermediate CI failure and correction
- Commit 0be3cfeaa52dcd639bf62f62bba13fb53825b66c failed run 41949291912: 35/36 tests passed; a literal escaped newline in tests/worker.test.mjs caused a SyntaxError at line 587. Code review also found an over-escaped whitespace regex in the evidence validator.
- Follow-up commit 2529b05efa4fd02883eb493a2683218a7be2e83f corrected the source regex and test formatting. Runs 41949338154 and 41949364570 then passed 95/95.
- Final PR #65 head 154301128cc8824b76969b5da603807f5125b414 passed readiness runs 41949989419 and 41949995940, 95/95. The failed intermediate commit remains in history and is not treated as verified.

## 2026-11-05 — Preview identity parity audit
- Inspected worker.js at deployed PR #52 source head 9be9a8c3f6df416d66452c3d8c69c5112c853207. Its prompt still describes ATLAS plus seven specialist labels (NEXUS, TITAN, SENTINEL, GENESIS, TERRA, AEGIS, ORACLE), not the canonical nine specialist IDs and Optimus Prime coordinator.
- PR #62 provides the canonical identity fix at 1fa32453e9569b136ec890b7c32562dda510612f with 4/4 CI success, but it has not been integrated into the deployed PR #52 Preview.
- No runtime identity change or deployment was made. Current Preview identity parity remains FAILED pending approved integration.
