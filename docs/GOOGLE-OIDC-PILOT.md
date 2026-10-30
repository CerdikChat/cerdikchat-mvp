# Google OIDC — 30-user private pilot

## Fixed callback
`https://cerdikchat-mvp.ngyoonseong.workers.dev/auth/google/callback`

Register this exact URI in Google Cloud Console under an OAuth Client ID of type **Web application**. Add the workers.dev origin as an Authorized JavaScript origin only if the console requests it; the server-side flow does not require browser token handling.

## Required Worker secrets / variables
Set these in Workers & Pages → cerdikchat-mvp → Settings → Variables and Secrets:
- Secret `GOOGLE_CLIENT_SECRET`: OAuth client secret (never commit it).
- Variable `GOOGLE_CLIENT_ID`: OAuth client ID.
- Variable `GOOGLE_REDIRECT_URI`: exact callback above.
- Variable `GOOGLE_OIDC_ENABLED`: set to `true` only after schema, credentials, allowlist, and end-to-end tests are complete.

## D1 migration and allowlist
Apply `migrations/0001_google_oidc.sql` to the existing `cerdikchat-db` database. Then insert no more than 30 approved accounts, one row per exact Google email:
```sql
INSERT INTO pilot_users (email, active) VALUES ('pilot.user@example.com', 1);
```
Do not add broad domain rules. Deactivate access with `UPDATE pilot_users SET active = 0 WHERE email = '...';`.

## Flow and security
- Authorization Code flow; `openid email profile` only; PKCE S256, state and nonce.
- Server-side code exchange; verify RS256 signature against Google's JWKS and validate issuer, audience, expiry, nonce, verified email, and stable Google `sub`.
- First successful allowlisted login binds the Google `sub` to the approved email; later mismatch is denied.
- Session cookie is Secure, HttpOnly, SameSite=Lax, host-only, seven-day maximum; only SHA-256 session hash is stored.
- D1 stores short-lived OAuth state, pilot allowlist, sessions, and minimal audit events.
- Logout is POST + same-origin check. No refresh tokens are requested or stored.
- Do not enable Cloudflare Access gate `PILOT_ACCESS_REQUIRED` for this OIDC path.

## No-billing boundary
This implementation uses Google's identity endpoints and the existing Cloudflare Worker + D1 binding. It does not call Gemini, Google APIs, paid APIs, or require Cloudflare Zero Trust. It does not enable billing. Cloudflare D1/Workers remain subject to the account's existing plan quotas; monitor usage.

## Deployment sequence (manual approval required)
1. Create Google OAuth Web application credentials; do not enable billing or extra APIs.
2. Apply the D1 migration and insert approved pilot emails.
3. Add the secrets/variables above.
4. Run local/preview tests; verify approved, unapproved, expired-state, invalid-nonce, logout and session revocation paths.
5. Only then enable `GOOGLE_OIDC_ENABLED=true` and deploy.
6. Test from a private browser and verify an unlisted Google account is denied.

**Important:** This PR does not create Google credentials, edit Cloudflare settings, apply migrations, enable the feature flag, or deploy production. Keep OIDC disabled until those manual prerequisites and end-to-end tests are complete.
