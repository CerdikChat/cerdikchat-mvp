# Workspace tools order correction — 2026-11-06

## Finding

The `atlas9/prompt-intelligence-mvp` branch placed the system `status-deck` inside the collapsed `workspaceTools` `<details>` element. The existing regression test requires the status deck to remain visible on the main page while only secondary tools are collapsed. The markup also contained a literal escaped `\n` immediately after the tools summary.

## Change

- Moved the complete status deck before the collapsed tools drawer.
- Kept the tool controls inside the closed-by-default `<details>` element.
- Replaced the literal escaped newline after the summary with a real newline.
- Added a focused regression test for status visibility and drawer containment.

## Traceability

- Base branch: `atlas9/prompt-intelligence-mvp` at `199b4029eaed982462f105664475f1bf810d44b1`.
- Feature branch: `atlas9/fix-workspace-tools-order-20261106-v2`.
- HTML fix commit: `35329e9fca6671424458931e97efc43b16183325`.
- Regression-test commit: `039fb5fa9d499c6802a740368f1b34e4f286a74f`.
- Changed files: `src/index.html`, `tests/workspace-tools-order.test.mjs`, this document.
- Existing failing evidence: regression run `42054908998` (89 tests, 88 passed, 1 failed); Auto Pilot run `42054909323` failed on the same assertion.
- Failure: `workspace tools are available from the main page in a collapsed expandable panel` at `tests/worker.test.mjs:669`.
- New candidate CI: pending exact-head run.

## Safety

UI/markup and tests only. No API, D1, OAuth, secrets, DNS, billing, deployment or agent-execution changes. Gateway remains `plan_only`.