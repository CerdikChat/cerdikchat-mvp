# Primary ATLAS-9 Identity Correction

## Finding — 2026-11-05
The Primary branch `atlas9/admin-governance-control-center` system instruction still described ATLAS as coordinator and listed legacy analytical labels (including TITAN, GENESIS and TERRA) rather than the canonical nine specialist IDs. The separate PR #62 candidate contains the correct roster, but its changes are not inherited by the Primary branch.

## Change
- Set Optimus Prime as coordinator outside the nine specialist seats.
- Declare the exact ordered registry ATLAS-01 through ATLAS-09.
- Mark TITAN, GENESIS and TERRA as legacy labels, not active specialist IDs.
- Preserve truthfulness: the nine profiles are analytical roles in one model; no independent agent execution is claimed.

## Validation
- Added `tests/atlas9-primary-identity.test.mjs` for exact role order, coordinator separation, and single-model truthfulness.
- Auto Pilot, regression, and Preview runtime checks must pass on the exact PR candidate before human verification.
- This is a code/documentation change only; no deployment, D1, secrets, OAuth, DNS, billing, or agent execution is authorized.
