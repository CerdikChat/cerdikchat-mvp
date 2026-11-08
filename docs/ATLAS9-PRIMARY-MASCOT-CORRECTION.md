# CerdikGo Clean Welcome Screen

## Design decision
The primary CerdikGo website will not display a robot mascot. ATLAS-9 remains an internal team identity and is not part of the customer-facing welcome screen.

## Implementation
- Remove the mascot image element and its dedicated desktop/mobile CSS.
- Remove the unused mascot SVG asset from this branch.
- Keep the CerdikGo brand, multilingual welcome copy, workspace launcher, navigation, authentication, chat, and existing product features.
- Rebalance welcome spacing so the heading and workspace tools lead the page without an empty mascot-sized area.
- Preserve responsive desktop and Android layout behavior.

## Changed files
- `src/index.html` — clean mascot-free welcome screen and spacing.
- `tests/mascot-consistency.test.mjs` — replaced mascot tests with clean-screen regression checks.
- `src/atlas9-mascot.svg` — removed from this branch.
- `docs/ATLAS9-PRIMARY-MASCOT-CORRECTION.md` — this design decision and QA scope.

## Safety
Frontend presentation only. No Worker/API, OAuth, database, secrets, Wrangler configuration, billing, DNS, or Production deployment changes. Preview auto-build has been disabled for this branch to prevent further automatic deployments on push.

## Verification
Automated tests verify mascot absence, welcome content, clean spacing, and responsive layout. Physical Android and desktop screenshot review remains necessary before merge. The PR stays Draft and unmerged pending visual acceptance.
