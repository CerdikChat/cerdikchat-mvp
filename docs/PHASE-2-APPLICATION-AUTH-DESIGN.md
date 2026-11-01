# ATLAS-9 Phase 2 — Application Authentication Design

**Status:** Design proposal only; not implemented or deployed  
**Target:** CerdikChat closed pilot (approximately 30 invited users)  
**Cost policy:** Cloudflare Workers Free / D1 Free allowance first; no paid upgrade or billing authorization  
**Related tracking issue:** #18

## 1. Executive decision

Do not make Cloudflare Zero Trust activation a blocker for application security. Implement application-level authentication in the Worker using Google Identity Services (GIS), server-side ID-token verification, and a D1 allowlist.

Google Sign-In proves an identity; it does not by itself authorize access to CerdikChat. The D1 user record is the authorization source. Only a pre-provisioned user whose status is `active` may receive an application session.

This design is not a claim that authentication is already implemented. The current production application remains unchanged.

## 2. Verified current baseline

Repository source review of `main` found:

- `src/index.html` has no sign-in or session flow.
- `worker.js` does not require application authentication by default.
- The optional `PILOT_ACCESS_REQUIRED=true` path depends on Cloudflare Access identity via `ctx.access.getIdentity()`.
- The current request Origin / Fetch Metadata checks are browser-origin protections, not user authentication.
- The rate limiter uses the source IP unless a Cloudflare Access identity is present.
- `DB` is bound in `wrangler.toml`, but the Worker source does not currently query D1.
- The existing D1 `users` schema was previously inspected read-only and includes `google_sub`, `email`, `display_name`, `status`, `created_at`, and `updated_at`.

Consequently, the current source must not be described as having an authenticated private pilot. The actual live value of `PILOT_ACCESS_REQUIRED` must be verified independently before making claims about current runtime behavior.

## 3. Target request flow

1. Browser loads the sign-in page.
2. Google Identity Services returns an ID token to the browser.
3. Browser sends that token to a dedicated Worker sign-in endpoint over HTTPS.
4. Worker validates the token signature using Google's published public keys and validates issuer, audience, expiry, subject, and verified-email claims. Validate the nonce when the chosen GIS flow supplies one.
5. Worker looks up the immutable Google subject (`sub`) in D1.
6. Unknown users and users whose status is not `active` are denied. No public self-registration.
7. Worker creates a short-lived opaque session and stores only a cryptographic hash of its random identifier in D1.
8. Worker sets a `Secure; HttpOnly; SameSite=Lax; Path=/` session cookie.
9. Every chat request validates the session and active user before rate limiting or AI inference.
10. Rate limiting uses the verified Google subject, not a client-supplied email or identity header.
11. Logout revokes the D1 session and clears the cookie.

## 4. Required endpoints

Proposed endpoints (final names may be adjusted during implementation):

- `POST /api/auth/google`: verify GIS credential, check D1 allowlist, create session.
- `GET /api/auth/me`: return minimal authenticated user profile; never return tokens.
- `POST /api/auth/logout`: revoke current session and clear cookie.
- `POST /api/chat`: require a valid session before any model/tool execution.

All mutating endpoints must validate same-origin and Fetch Metadata controls. Cookie-authenticated POST requests must have explicit CSRF protection (strict Origin validation plus a CSRF token strategy). Do not rely on SameSite alone.

## 5. Token and session security requirements

### Google ID-token verification

- Verify the JWT signature cryptographically against Google's current published JWKS; do not merely decode the JWT.
- Cache public signing keys safely and refresh on unknown key IDs.
- Validate `iss` against Google's documented issuer values.
- Validate `aud` against the configured Web Client ID exactly.
- Validate `exp`, reasonable `iat`, non-empty `sub`, and `email_verified === true`.
- Validate nonce when used by the GIS flow.
- Reject malformed, expired, wrong-audience, wrong-issuer, unsigned, or unverifiable tokens.
- Never trust an email, Google subject, role, or status supplied separately by the browser.

### Application sessions

- Generate high-entropy opaque session identifiers using Web Crypto.
- Store only a SHA-256 hash of the session identifier in D1.
- Enforce a short, documented lifetime (initial proposal: 8 hours) and server-side expiry checks.
- Revoke sessions on logout and when a user is disabled.
- Cookie attributes: `Secure`, `HttpOnly`, `SameSite=Lax`, `Path=/`; no broad Domain attribute.
- Rotate the session identifier after authentication.
- Do not place ID tokens or session identifiers in localStorage, URLs, logs, analytics, or error messages.
- Fail closed if D1, auth configuration, or required cryptographic validation is unavailable.

## 6. D1 data model

The existing `users` table is the allowlist. Preserve its current schema unless a reviewed migration is required.

A separate `sessions` table is proposed:

- `session_hash` — primary key; SHA-256 digest of opaque session ID.
- `google_sub` — foreign key/reference to the immutable Google subject in `users`.
- `created_at` — creation timestamp.
- `expires_at` — expiry timestamp.
- `revoked_at` — nullable revocation timestamp.

Add indexes for `google_sub` and `expires_at` as appropriate. A migration must be reviewed and tested locally before any production D1 change.

Pilot user provisioning is administrator-controlled. No public registration endpoint is included. An active user must be inserted through a documented, controlled administrative process. Do not expose D1 admin credentials to the browser.

## 7. Rate limiting and abuse controls

- Apply a separate login rate limit before expensive token/JWKS/database operations.
- Apply chat rate limiting only after session validation, keyed by the verified `google_sub`.
- Retain a coarse IP-based abuse control as a secondary layer where practical.
- Treat request-frequency limits as abuse controls, not monthly spending caps.
- Continue bounded request-body parsing, message/history limits, safe error responses, and allowlisted tool execution.
- Do not log raw IPs, ID tokens, session cookies, email claims, or message content unless a justified and documented operational need exists.

## 8. Required automated tests

At minimum:

- Missing credential, malformed JWT, bad signature, unknown key ID, wrong issuer, wrong audience, expired token, future-issued token, missing subject, and unverified email.
- Missing D1 binding, D1 read/write failure, unknown Google subject, disabled user, and active user.
- Session cookie missing, malformed, tampered, expired, revoked, and valid.
- Session rotation after login; logout revocation; disabled-user denial.
- CSRF/foreign Origin and cross-site Fetch Metadata rejection.
- Unauthenticated `POST /api/chat` returns 401 before AI binding invocation.
- Authenticated chat succeeds and rate-limit key is derived from verified Google subject.
- Login rate limiting and chat rate limiting fail closed when their bindings are unavailable.
- No token, cookie, secret, or raw provider error is returned to clients or written to logs.

Use mocked Google JWKS and D1 fixtures for deterministic tests; include at least one controlled integration test against a non-production test environment before release.

## 9. Configuration and owner actions

Required configuration:

- `GOOGLE_CLIENT_ID`: public OAuth Web Client ID configured for approved CerdikChat origins.
- `SESSION_HASH_SECRET` or equivalent server-side secret only if the final session design requires signing; set through Cloudflare secret management, never commit it.
- Existing D1 binding plus a reviewed session migration.
- Explicit list of authorized web origins.
- Google OAuth consent screen and authorized JavaScript origins configured by the account owner.

No Google client secret is required in browser code. Never place a Google client secret, API key, or session secret in the frontend or Git repository.

Google Identity Services and Google Cloud project configuration must be checked for the current account and applicable policies. Do not assume a consumer Google subscription includes API entitlements; this design does not require Gemini API billing.

## 10. Safe delivery sequence

1. Review and approve this design.
2. Implement in an isolated feature branch; do not modify `main`.
3. Add unit tests and a D1 migration file; run `npm test` in CI.
4. Review the diff for auth bypasses, token leakage, CSRF gaps, and fail-open behavior.
5. Configure Google OAuth only after the owner confirms the authorized origin(s).
6. Test in a non-production environment with synthetic users and data.
7. Open a separate production change request covering D1 migration, secrets, user provisioning, and deployment.
8. Deploy only after explicit production approval and rollback planning.

## 11. Explicit non-goals

This phase does not:
- Activate Cloudflare Zero Trust or Access.
- Add a payment method or authorize overage billing.
- Upgrade Workers to a paid plan.
- Enable public self-registration.
- Add conversation persistence or a chat-history database.
- Change production Worker variables, secrets, D1 data, or deployment.
- Claim compliance certification or production readiness.

## 12. Acceptance criteria

- Every chat API request is authenticated and authorized server-side.
- Only active D1-allowlisted Google identities can obtain sessions.
- Session revocation and expiry are enforced server-side.
- No browser-supplied identity field is trusted.
- CI passes all auth, session, CSRF, and rate-limit tests.
- No paid service, payment method, or automatic billing authorization is introduced.
- Production resources remain unchanged until a separately approved release.
