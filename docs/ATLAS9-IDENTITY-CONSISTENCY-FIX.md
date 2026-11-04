# ATLAS-9 Identity Consistency Fix

## Finding
The supplied CerdikGo Preview screenshot showed a generated team description with eight displayed names, including the coordinator, and legacy role names that did not match the canonical nine-specialist registry.

## Canonical structure
The nine specialist seats are ATLAS-01 Research Intelligence; ATLAS-02 Engineering (NEXUS); ATLAS-03 AI & Prompt Intelligence; ATLAS-04 Cybersecurity; ATLAS-05 Governance & Compliance (AEGIS); ATLAS-06 Data Intelligence (SENTINEL); ATLAS-07 Business Strategy (ORACLE); ATLAS-08 Product & UX; and ATLAS-09 Quality Assurance. Optimus Prime is coordinator outside the nine seats.

## Change
- Strengthened the Core AI system instruction with an exact nine-role response format.
- Explicitly disallowed presenting TITAN, GENESIS, or TERRA as active registry specialists; legacy references must be labeled as legacy.
- Added a regression test that checks the canonical ordered roster and coordinator separation.

## Status
- Implementation committed on `atlas9/cerdikgo-atlas9-identity-fix`.
- Automated CI and Preview runtime validation: pending.
- No deployment, merge, database, OAuth, secrets, DNS, or billing action performed.
