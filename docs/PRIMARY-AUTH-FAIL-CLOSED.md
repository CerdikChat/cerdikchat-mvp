# Primary authentication fail-closed correction

## Finding — 2026-11-05
The Primary governance branch enforces chat authentication only when GOOGLE_AUTH_REQUIRED=true. Its top-level production configuration does not declare that flag, while the deployed cerdikchat-mvp script settings expose a DB binding to cerdikchat-db. This is a fail-open configuration risk if the flag is omitted.

## Change
- Require authentication when ENVIRONMENT=production, when a D1 binding is present, or when GOOGLE_AUTH_REQUIRED=true.
- Apply the same rule to the auth configuration endpoint so the UI cannot report authentication as optional when chat enforces it.
- Keep explicit false available only for isolated development without D1.
- Add regression tests proving unauthenticated Production/D1-backed chat returns 401 before rate limiting or AI inference.

## Validation and safety
- Draft-only code change on a branch stacked on the clean Primary identity candidate.
- Exact-head Auto Pilot and regression must pass before Human Verification.
- No D1 read/write/migration, deployment, OAuth/secret/DNS change, billing action or user-session mutation is included.
- The 76-hour session TTL remains a separate risk requiring policy review; this change does not shorten or revoke existing sessions.
