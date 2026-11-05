# ATLAS-9 Decision & Approval Register

Append decisions. General permission to improve code does not authorize privileged external operations.

## Decisions — 2026-11-05
1. Target 100% VERIFIED acceptance across seven competitive dimensions. This is an acceptance target, not a current score or guarantee of superiority over Gemini.
2. Prior percentage ranges remain historical qualitative estimates only; do not report them as measured benchmark scores.
3. Adopt benchmark pilot manifest v0.1 with 35 fixed smoke tasks. It validates coverage and task-rubric structure only; it is not statistically sufficient for final comparative scoring.
4. Preserve exactly nine specialist roles. Optimus Prime remains coordinator, not a tenth specialist.
5. Keep agent gateway `plan_only` until separately approved.
6. Human Verification may begin only after Auto Pilot passes for the exact candidate commit. PR #59 and PR #60 gates passed for their recorded merge candidates.
7. No merge, Production deployment, remote D1 write/migration, OAuth/secrets change, DNS change, billing activation, or destructive privileged action without separate explicit approval.
8. Prefer free-tier resources and do not introduce paid dependencies.
9. PR #52 auth-log privacy issue has a tested remediation proposal in PR #61. Do not treat it as integrated until PR #61 is reviewed and merged through the approved dependency process.
10. PR #52 Preview upload and D1 migration 0007 remain blocked pending separate explicit scoped authorization and review. PR #53 Google Drive upload remains opt-in/manual; no upload authorization granted in this run.

## Approval record template
- Decision/request:
- Requesting authority and exact scope:
- Environment and resource:
- Date/time:
- Explicit approval evidence:
- Implemented by / commit:
- Verification and rollback:
- Status: PLANNED / APPROVED / REJECTED / EXPIRED.

## Current approval state
- PR #59 head `637ff536011ed25fc598888f62f520b4cfdccd3c`: Auto Pilot VERIFIED on merge candidate `25f416f68c9db0d2ce5a9a22ad38a003e2e36939`; eligible for subsequent Preview/human validation, not itself approval to deploy.
- PR #60 head `f36cafa56f2d2b99e88eecf88a2c615859f839fe`: Auto Pilot VERIFIED on merge candidate `b46485d`; readiness `41918584320` and companion checks passed; eligible for subsequent Preview/human validation, not itself approval to deploy.
- PR #61 auth-log privacy remediation: isolated CI VERIFIED; draft/open/unmerged, not yet integrated into PR #52.
- PR #52 Preview upload and D1 migration 0007: BLOCKED pending separate explicit scoped authorization and review.
- PR #53 external Google Drive upload: remains opt-in/manual; no upload authorization granted in this run.

## Decision and approval reconciliation — 2026-11-05

1. Exact-head CI status is VERIFIED for PR #62 head 1fa32453e9569b136ec890b7c32562dda510612f (runs 41921781529, 41921781474, 41921781561, 41921781630), PR #63 head 4c5276f2ff5307949f912451d554d9be879223b6 (runs 41945833238, 41945833224, 41945833375, 41945833236), and PR #64 head 929e5bcf9d2be683c94b9cd882209ce194fc9119 (runs 41944458563, 41944458347, 41944458558, 41944458354).
2. Human Verification is eligible only for those exact candidates whose Auto Pilot readiness run passed; it has not been started in this audit. A later commit changes the candidate and requires a new exact-SHA gate.
3. PR #64 Preview workflow is manual-dispatch only. The connected GitHub capability set does not expose workflow_dispatch; no Preview deploy was initiated. The workflow's secret checks have not been evaluated.
4. Keep exactly nine specialist roles; Optimus Prime is coordinator, not a tenth agent. Keep Agent Gateway plan_only.
5. No merge, Production deployment, remote D1 write/migration, OAuth/secrets change, DNS change, billing activation, MCP activation, or privileged external action is approved by this audit.
6. Free-tier/Workers AI-only policy remains in force. Do not add paid dependencies or enable external providers without a separate decision.
7. The 100% VERIFIED goal remains a per-dimension acceptance threshold, not a measured score or claim of superiority over Gemini.

## Decision update — 2026-11-05: Preview evidence and new draft PRs

1. PR #52 Preview creation is VERIFIED for source commit 9be9a8c3f6df416d66452c3d8c69c5112c853207 via run 41825376685. It uses cerdikchat-staging D1 ID 79267e63-e57f-4237-8b88-f1e477397771. This is not Production and is not PR #64's Connectors candidate. Runtime health and Android acceptance remain unverified.
2. PR #65 document evidence hardening is regression-verified (95/95; runs 41949338154 and 41949364570), but no exact-head Auto Pilot readiness gate has run. Human Verification is not authorized to start.
3. PR #66 observability query redaction is regression-verified (102/102; run 41949598277) and Wrangler dry-run verified (41949598379, 41949605643), but no Preview deployment or exact-head Auto Pilot readiness gate has run. Human Verification is not authorized to start.
4. PR #66 preserves 100% log sampling and persistence while enabling query-string redaction. Do not silently change sampling/retention policy without a separate decision.
5. No additional Preview deployment was initiated by this audit. No merge, Production deploy, remote D1 write/migration, OAuth/secrets/DNS change, billing, or other privileged action was performed.

## Readiness decision — 2026-11-05: PR #65/#66 exact candidates

- PR #65 final head 154301128cc8824b76969b5da603807f5125b414 passed exact-head readiness runs 41949995940 and 41949989419 (95/95). It is eligible for Human Verification; Human Verification has not started.
- PR #66 final head 721ef9a7eb7068dcbe40ccad9df0d5b188e6e3a1 passed exact-head readiness runs 41950007358 and 41950001066 (102/102); config dry-run 41950007360 passed. It is eligible for Human Verification; Human Verification has not started.
- These legacy JS gates explicitly mark TypeScript NOT CONFIGURED. They do not prove Preview runtime or Android acceptance.
- Existing PR #52 Preview lacks FILE_SCANNER and VOICE_RATE_LIMITER bindings; document and voice routes must remain fail-closed until approved service/binding configuration exists.

## Correction — 2026-11-05: Preview voice binding
For the PR #52 deployed commit, voice transcription uses the existing CHAT_RATE_LIMITER binding, so no separate VOICE_RATE_LIMITER provisioning is required for that source version. Do not provision a new limiter based solely on the PR #41 branch contract. Voice runtime/Android acceptance remains NOT TESTED; FILE_SCANNER remains a confirmed missing binding and must not be bypassed.

## Evidence integrity decision record — 2026-11-05
The first PR #65 implementation commit 0be3cfeaa52dcd639bf62f62bba13fb53825b66c failed regression due to a literal escaped newline in the test source (run 41949291912; 35 pass, 1 fail). The implementation was corrected in commit 2529b05efa4fd02883eb493a2683218a7be2e83f and re-tested at 95/95. Final candidate 154301128cc8824b76969b5da603807f5125b414 passed exact-head readiness. The failed attempt remains visible in Git history and the QA register.

## Identity parity decision — 2026-11-05
Keep the canonical nine specialist IDs and Optimus Prime coordinator as the required identity contract. The current PR #52 Preview is not compliant: its deployed prompt enumerates only seven specialist labels plus ATLAS coordinator. PR #62 is the approved candidate fix with 4/4 CI success, but no merge or Preview deployment is authorized by this audit. Do not claim current Preview identity parity until the exact canonical candidate is integrated and revalidated.

## MCP parser failure decision record — 2026-11-05
The initial PR #63 candidate was FAILED due to Bearer parser whitespace escaping (401 on valid token). The parser was corrected and malformed-token coverage added; final exact head 4c5276f2ff5307949f912451d554d9be879223b6 passed all four required workflows. Preserve this failure history; do not count the initial candidate as verified. MCP remains opt-in and execution remains disabled.


## Decision and approval update — 2026-11-05: archive controls and exact-head CI

1. Continue the 100% VERIFIED objective as a per-dimension acceptance target only. Current measured competitive scores remain NOT MEASURED.
2. PR #70 archive implementation may proceed on its isolated draft branch. Its six new regression cases are NOT TESTED by CI at head `d546c121c9d95f6568eb4c7d728655d72fd2fcd1`; do not start Human Verification until an exact-head Auto Pilot gate passes.
3. PR #70 migration `0008_feature_request_archive.sql` remains unapplied. Applying it to Preview requires separate explicit, environment-scoped approval. No Production migration is permitted by this mandate.
4. A legacy JavaScript Auto Pilot workflow was added to PR #52 branch at `4114cfa5ca082dfb8736d9d7aa68bb297087d8c0`. No workflow result is visible for that exact SHA; GitHub reports PR #52 mergeable=false. Status: BLOCKED pending exact CI and mergeability diagnosis.
5. PR #60 head `ad3cbd61b6467675e71e8445f113635c45beb8c9` passed exact-head workflows 41950862476, 41950862498, 41950862526 and 41950862654 (129/129 tests; no failures). This validates code/test readiness for that candidate, not Preview or Production.
6. Preserve exactly nine specialist IDs; Optimus Prime remains coordinator. Keep gateway `plan_only`. No merge, deployment, remote D1 write/migration, OAuth/secrets/DNS change, billing activation or destructive action was performed.
7. The CI evidence for PR #61/#62–#69 applies only to their exact recorded SHAs and named workflow scopes. It does not transfer to later commits or another branch.


## Decision correction — 2026-11-05: no inherited CI approval

The PR #60 129/129 result and Auto Pilot pass apply only to parent head `ad3cbd61b6467675e71e8445f113635c45beb8c9`. The later observed scorecard head `d8fd4d04b119f4e8a63bffa6624396ead9f723f3` has no exact-head workflow/status and PR metadata reports mergeable=false, with the branch 2 commits behind its base. No merge, rebase, or force update is authorized or performed here. Current status: **BLOCKED** pending reconciliation and exact-head rerun.


## Decision update — 2026-11-05: verified head tests, base drift and approval boundaries

1. PR #70 exact head `d546c121c9d95f6568eb4c7d728655d72fd2fcd1` passed Auto Pilot run `41952747628` (108/108, zero failures). The run used base snapshot `9be9a8c3f6df416d66452c3d8c69c5112c853207`; current base has advanced by two commits. Human Verification has not started; rerun the current merge candidate first.
2. PR #60 exact head `62e36278386e37a47b91c4e246ac7ccb6ba9decf` passed four workflows (129/129). Readiness used base snapshot `de11d34257005ba72a621312230489a7d161ff53`; current base has advanced by two commits. Revalidate before integration.
3. PR #52 head `3653fa27ce9cbd01849b6f8a5478e7c335eb2465` has a readiness workflow, but no exact-head PR run/status is visible. Do not claim readiness.
4. PR #61/#66/#68/#69 branches are 2 commits behind their current admin-governance base and GitHub reports mergeable=false. No merge/rebase is authorized in this run.
5. Migration #0008 remains unapplied. No remote D1 write/migration, Preview or Production deployment, OAuth/secrets/DNS change, billing activation or destructive action is approved/performed.


## Final CI decision update — 2026-11-05

1. PR #52 exact head `3653fa27ce9cbd01849b6f8a5478e7c335eb2465` passed legacy Auto Pilot `41953302757` (99/99). TypeScript is NOT CONFIGURED; no Preview runtime or migration #0007 verification.
2. PR #70 exact head `0aae5032f2d6521255aefea172a27552ea3053a8` passed legacy Auto Pilot `41953678319` (108/108). TypeScript is NOT CONFIGURED; no live D1 archive test. Migration #0008 remains unapplied.
3. PR #60 exact head `465f8c5a6dc2f65c59537078fa98759c73299181` passed four workflows (129/129), but the run's base snapshot is two commits behind current base.
4. Do not treat CI as runtime acceptance. Human Verification for #70 remains pending current-base revalidation and explicit Preview migration approval. No merge, deployment, remote D1 mutation, secret/OAuth/DNS change, billing activation or deletion occurred.

## Final scorecard candidate gate — 2026-11-05

PR #60 exact head `53989231850f5f1628bf5b10203cc5e81ca9bb97` passed all four workflows:
- Auto Pilot readiness `41953817591` — 129/129, zero failures: https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41953817591
- Regression/install `41953817553` — 129/129, zero failures: https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41953817553
- Phase 3 regression `41953817606` — 129/129, zero failures: https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41953817606
- Hybrid Gateway `41953817569` — 129/129, zero failures; Wrangler 4.153.0 dry-run exited normally: https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41953817569

Readiness log identifies PR head `53989231850f5f1628bf5b10203cc5e81ca9bb97` and base snapshot `de11d34257005ba72a621312230489a7d161ff53`. The current base branch is two commits ahead. Do not treat this as Preview/Android/Production acceptance or as a model capability score. All seven model scores remain NOT MEASURED.


## Decision checkpoint — 2026-11-05

1. **Competitive target:** retain 100% VERIFIED as an acceptance target only. All seven capability scores remain NOT MEASURED; no Gemini superiority/parity claim is authorized.
2. **Specialist identity:** exactly ATLAS-01…ATLAS-09. Optimus Prime remains coordinator outside the nine seats. Legacy labels TITAN, GENESIS and TERRA are not additional specialists.
3. **Gateway:** retain `plan_only`; no agent execution, external calls, provider invocation or database writes.
4. **Branch integration:** PR #60 is 2 commits behind its current base; PR #70 is 3 commits behind Primary governance. No rebase, merge or force update without a safe reconciliation and exact-head retest.
5. **Privacy fix:** PR #73 may proceed as a Draft review candidate. Its exact head `98423d8aa14317052511cc69e98a8341713a3381` passed Auto Pilot `41974840542` (104/104). This is not authorization to deploy or begin human testing.
6. **Backup scan fix:** PR #74 remains Draft until both push and PR-event Gitleaks scans pass on the latest exact head. The allowlist must continue to require both exact path and exact literal; no broad rule or path suppression is accepted.
7. **Human Verification:** not started. Auto Pilot must pass for the exact candidate first; Preview runtime, Android acceptance and Production readiness remain separate gates.
8. **Privileged operations:** no merge, Production deployment, remote D1 write/migration, OAuth/secrets/DNS change, billing activation, permanent deletion, or Google Drive upload is authorized by this audit.


## Final exact-head reconciliation — 2026-11-05

- PR #60 current documentation candidate `a2373adafa711307e842f2df7f45c0434e61d540` passed all four PR-triggered workflows:
  - Auto Pilot `41975437972` — SUCCESS; 129/129, strict TypeScript, `npm run doctor`, installation/preflight, full regression and Wrangler dry-run.
  - Regression/install `41975437993` — SUCCESS.
  - Phase 3 regression `41975438059` — SUCCESS.
  - Hybrid Gateway `41975438104` — SUCCESS; unit tests and Worker bundle validation without deployment.
- Auto Pilot log records exact PR head `a2373adafa711307e842f2df7f45c0434e61d540` and base snapshot `de11d34257005ba72a621312230489a7d161ff53`. The current base branch head remains `637ff536011ed25fc598888f62f520b4cfdccd3c`, two commits ahead of the tested base. GitHub currently reports mergeable=true, but branch synchronization and integration remain a separate review decision. No merge/rebase was performed.
- PR #74 current head `61735292750540afe2bbfb61fb69b252dee3fb6f`: full-history push Gitleaks `41975248939`, PR Gitleaks `41975255549`, and PR regression `41975255582` all SUCCESS. The PR scan log confirms Gitleaks 8.24.3 loaded `.gitleaks.toml`, scanned the three PR commits, and reported `no leaks found`. The push scan fetched all remote branches/tags and passed. The narrow allowlist requires both the exact file path and exact literal; default rules remain enabled.
- PR #73 current head `98423d8aa14317052511cc69e98a8341713a3381`: Auto Pilot `41974840542` and regression `41974833367` SUCCESS; 104/104 tests.
- PR #70 current head `0aae5032f2d6521255aefea172a27552ea3053a8`: Auto Pilot `41953678319` SUCCESS; 108/108 tests. Migration #0008 remains unapplied; branch is three commits behind current base.
- Main scheduled backup run `41890146458` remains FAILED as a historical run. The corrected scanner config is only in Draft PR #74; a future approved backup run is required to demonstrate successful archive creation, followed by a restore drill.
- All seven competitive capability scores remain NOT MEASURED. Evidence-credit score remains 0/100 in each dimension until the mandatory task sets and thresholds are executed; this is not a zero-quality score.
- Human Verification has not started. CI readiness, Preview runtime, Android acceptance and Production readiness remain distinct.

Run links:
- https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41975437972
- https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41975437993
- https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41975438059
- https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41975438104
- https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41975248939
- https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41975255549
- https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41975255582


## Audit correction — PR #74 full-history scan evidence — 2026-11-05

An earlier entry described Gitleaks runs `41975248939` and `41975255549` as full-history evidence. Review of their command lines showed those Action runs were event-scoped (`--log-opts=-1` on push and a three-commit PR range). They passed, but did not prove all-ref history coverage. This earlier wording is superseded.

PR #74 current head `abeca194672349e799bcfdd9d8f9c9dc82675947` adds a separate explicit all-ref scan after fetching every remote branch and tag:
- Push workflow `41975711475`: SUCCESS; event scan and explicit all-ref scan passed.
- PR workflow `41975715983`: SUCCESS; event scan and explicit all-ref scan passed.
- Explicit command: `gitleaks detect --source . --log-opts="--all" --redact --exit-code 2 --no-banner`.
- PR log: 816 commits scanned, approximately 1.84 MB, `no leaks found`.
- PR regression `41975716157`: SUCCESS.
- The allowlist remains AND-constrained to `src/prompt-intelligence.js` and the exact localStorage namespace `cerdikgo-prompt-vault-v1`; default Gitleaks rules remain enabled.

This verifies the scanner configuration on PR #74's exact head. It does not rerun the scheduled backup job or prove backup archive creation, Drive upload, or restore. Scheduled backup run `41890146458` remains a historical FAILED run until a later authorized backup and restore drill pass.

## Exact scorecard documentation candidate — 2026-11-05

- PR #60 head `02218e5b079830b1c07c5ca0b68fd40c2dc244c0` passed Auto Pilot `41975609763`, regression/install `41975609893`, Phase 3 `41975609751`, and Hybrid Gateway `41975609793`; all four PR-triggered workflows SUCCESS.
- Auto Pilot is the exact candidate gate; the prior log for `a2373adafa711307e842f2df7f45c0434e61d540` confirms 129/129 tests, strict TypeScript, doctor and Wrangler dry-run. The `02218e5b...` follow-up is documentation-only; its four exact-head workflows all passed.
- PR #60 base snapshot remains `de11d34257005ba72a621312230489a7d161ff53`; current base branch head `637ff536011ed25fc598888f62f520b4cfdccd3c` is two commits ahead. No merge/rebase was performed.
- All seven capability scores remain NOT MEASURED; evidence-credit remains 0/100 until the full mandatory task sets are executed.
- Human Verification remains NOT STARTED. CI, Preview runtime, Android and Production remain separate gates.

Run links:
- https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41975609763
- https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41975609893
- https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41975609751
- https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41975609793
- https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41975711475
- https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41975715983
- https://github.com/CerdikChat/cerdikchat-mvp/actions/runs/41975716157


## Decision and approval continuation — 2026-11-05 16:25 WIB

1. **Seven-dimension target remains an acceptance target, not a claim.** Each dimension must reach 100/100 only after its full KPI thresholds are met with reproducible evidence. Current capability scores are NOT MEASURED; evidence-credit 0/100 is not a capability rating.
2. **Exactly nine specialists.** Registry seats remain ATLAS-01 through ATLAS-09. Optimus Prime is coordinator outside the registry; never count as specialist ten. PR #62 provides a canonical prompt candidate with four passing workflows, but its integration into the active Primary path is not established.
3. **Gateway remains `plan_only`.** No agent execution, privileged tool execution, remote write, or autonomous external side effect is authorized by this audit.
4. **No privileged operations.** No merge, Production deployment, remote D1 write/migration, OAuth/secret/DNS change, billing activation, or other privileged action was performed or approved.
5. **Human Verification gate.** PR #60 exact candidate `a2b10c42f4925164b59d48c499ac44265c48daed` passed Auto Pilot run 41975851719 and 129/129 tests; PR #80 exact candidate `724fdb092d584cead6f34612693de8cb9336c7eb` passed Auto Pilot run 42002523884 and 113/113 tests. These are branch-specific CI results only. Human Verification was NOT STARTED; no Android, live Preview, or Production acceptance is inferred.
6. **Free-tier policy.** Do not enable Cloudflare Workers Paid/Containers or any external paid scanner. PR #76 remains BLOCKED on the current account entitlement. PR #78 is design-only and cannot be treated as an implemented free alternative.
7. **Document privacy.** WPS AI remains manual and user-authorized only; no confidential file transfer or API integration is approved by PR #77.

These decisions preserve the existing safety boundary and do not authorize integration or deployment. Any later change to execution mode, billing, external document transfer, or Production access requires separate explicit approval and a traceable decision entry.


## Final control decision — 2026-11-05

- Current open PR count is 57 after creation of PR #80; earlier 56 count remains the pre-#80 snapshot.
- PR #60's final exact candidate passed its Auto Pilot readiness gate (8ed0be04b883e8f1639728290528de87cc16fe6b; run 42002779910), but the PR is non-mergeable because its branch diverged 79 commits ahead / 2 behind its base. A green gate does not authorize merge or integration.
- PR #80 exact candidate passed its own gate (724fdb092d584cead6f34612693de8cb9336c7eb; run 42002523884), but it remains a Draft child of PR #75. This is not system-wide Preview or Android acceptance.
- Keep gateway plan_only; preserve exactly nine specialists; Optimus Prime remains coordinator only.
- No Human Verification was started. It remains a separate activity requiring a green gate on the exact candidate selected for that verification and a separate deliberate decision to begin.
- No merge, Production deploy, remote D1 migration/write, OAuth/secret/DNS change, billing activation, external document transfer, or privileged operation was performed or approved.
- Free-tier scanner route remains unresolved: Cloudflare Containers require Workers Paid in the connected account response; no upgrade is approved. GitHub Actions scanner is only a design proposal and cannot be represented as a live service.
