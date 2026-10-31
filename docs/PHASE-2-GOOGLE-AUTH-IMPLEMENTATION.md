# Phase 2 — Google Authentication Implementation

## Current state
This branch contains the initial server-side authentication module and isolated D1 migration. It is not production-ready and is not wired into the Worker until integration and tests are completed.

## Required configuration
- `GOOGLE_CLIENT_ID`: public OAuth Web Client ID.
- D1 binding `DB`.
- Existing `users` allowlist rows must have the verified immutable Google `sub` and `status='active'`.
- Migration: `migrations/0002_sessions.sql`.

No Google client secret is used. Never place credentials in source control.

## Security design
- Verify Google JWT RS256 signature against Google JWKS.
- Validate issuer, audience, authorized party (when present), expiry, issue time, subject and verified email.
- Match immutable Google subject against active D1 allowlist.
- Generate opaque 256-bit session ID; store only SHA-256 hash.
- HttpOnly, Secure, SameSite=Lax, host-only cookie with 8-hour expiry.
- Session lookup rechecks active user status; logout revokes the server-side session.
- Fail closed on missing configuration or D1 errors.

## Critical remaining work
1. Wire routes into `worker.js` and require session before chat rate limiting and inference.
2. Use verified Google subject as the rate-limit key.
3. Add GIS frontend login/logout/current-session UX and CSP allowances for Google Identity Services.
4. Add isolated tests with mocked Google JWKS and D1; verify no unauthenticated AI invocation.
5. Run the full regression suite and inspect CI.
6. Provision pilot users securely using verified `sub` values; do not enable self-registration.
7. Only after review and explicit approval, plan production D1 migration and Worker configuration.

Do not deploy or run this migration against production as part of this branch work.
