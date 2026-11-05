# Workspace tools order regression lock — 2026-11-06

## Finding and existing source correction

The prior workspace regression placed `status-deck` inside the collapsed `workspaceTools` details element. The long-lived base branch corrected the markup at commit `41d7f30d7a1bedbd763504970ad059050f9f2188` by moving the status deck before the drawer. That source fix passed 90/90 tests in regression run `42077076800` and Legacy Auto Pilot run `42077076781`.

## Change in this PR

- This PR does not change `src/index.html` or runtime code.
- Adds `tests/workspace-tools-order.test.mjs` to lock the visible-status/outside-drawer contract and prevent a literal escaped newline from reappearing.
- Adds this concise audit note.

## Traceability

- Base branch: `atlas9/prompt-intelligence-mvp` at `41d7f30d7a1bedbd763504970ad059050f9f2188`.
- Feature branch: `atlas9/workspace-tools-order-regression-20261106`.
- Test commit: `9f2e712efb1e7dafbd060d18e06e349861758c1b`.
- Changed files: `tests/workspace-tools-order.test.mjs`, this document.
- Prior failing evidence: `42054908998` and `42054909323` (88/89); later intermediate failures `42076965379` and `42076965432` on the same status-deck ordering contract.
- This PR's exact-head CI: pending.

## Safety

Test/documentation only. No API, D1, OAuth, secret, DNS, billing, deployment or agent-execution changes. Gateway remains `plan_only`.