# Primary authentication fail-closed correction — main-based candidate

## Finding
The main Worker enforced Google authentication only when `GOOGLE_AUTH_REQUIRED=true`. The top-level configuration did not make this a safe default. A D1-backed deployment with an omitted or false flag could therefore expose chat without a verified session.

## Change
- Require a valid session when `ENVIRONMENT=production`, when a D1 binding exists, or when `GOOGLE_AUTH_REQUIRED=true`.
- Apply the identical rule to `GET /api/auth/config`.
- Preserve explicit false only for isolated development without D1.
- Reject unauthenticated requests before rate limiting and AI inference.
- Add focused tests for Production, D1-backed configuration, explicit false and the auth configuration endpoint.

## Traceability
- Base: `main` at `bc6545d6d19fd4b749d0b65fefba3d74775e0221`.
- Branch: `atlas9/cerdikgo-main-auth-fail-closed-20261106`.
- Worker auth change: `693bbd632480b760fff5ecab11be355d9288773c`.
- Auth configuration change: `5c488321f4e407fc2ce0c44f98ead90122ae7d9f`.
- Changed files: `worker.js`, `auth/google-auth.js`, two auth regression tests, this note, and two read-only Auto Pilot workflows.
- TypeScript is NOT CONFIGURED on this legacy JavaScript branch.

## Safety
Draft-only. No merge, deployment, D1 read/write/migration, OAuth/secret/DNS change, billing action or session mutation. The existing eight-hour session lifetime is unchanged. Human Verification remains blocked until exact-head Auto Pilot succeeds.
