# CerdikGo Auto Pilot Readiness Gate

This workflow enforces the project rule:

**Human verification may begin only after automated validation passes for the exact candidate commit.**

## Automated gate sequence

1. Install dependencies without lifecycle scripts.
2. Run `npm run doctor`.
3. Run `npm run typecheck`.
4. Run the complete `npm test` suite.
5. Scan workflow files for direct remote Worker deployment or remote D1 migration commands.
6. Publish **READY FOR HUMAN VERIFICATION** only if every preceding step succeeds.

A failed step blocks the readiness result. Fix the cause and rerun the gate; do not waive a failure by manually declaring readiness.

## Meaning and limits

A green gate is a code/CI readiness signal for the exact commit. It does **not** prove:
- Cloudflare Preview deployment health or binding correctness;
- real Google OAuth provider behavior;
- Android device usability, voice hardware, or radio connectivity;
- Production readiness or human acceptance.

Preview verification is a separate automated deployment/runtime stage and must report the exact commit SHA and Preview URL. Human verification follows only after the automated stages pass.

## Safety boundaries

This workflow does not deploy Workers, run remote D1 migrations, write remote databases, change OAuth or secrets, change DNS, or enable billing. Those actions require separate authorization.

## Required status for handoff

The candidate must have successful results for the Auto Pilot Readiness Gate and all required regression/typecheck workflows. A skipped, cancelled, pending, or failed job is not a pass.
