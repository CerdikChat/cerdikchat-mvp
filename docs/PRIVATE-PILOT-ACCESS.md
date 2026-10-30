# Stage 3 — Private Pilot Access

## Architecture

CerdikChat uses Cloudflare Access as the identity and authentication front door. The Worker consumes the authenticated identity through Cloudflare's `ctx.access.getIdentity()` API; it does not trust a user-supplied email header.

The Worker has an opt-in enforcement switch:

- `PILOT_ACCESS_REQUIRED=false` or unset: existing access behavior remains unchanged.
- `PILOT_ACCESS_REQUIRED=true`: chat requests require an authenticated Cloudflare Access identity with a valid email claim. Missing or malformed identity is denied.
- When pilot identity is present, the existing rate limiter key is scoped to the normalized user email rather than the source IP. The configured threshold remains 20 requests per 60 seconds.

Cloudflare Access must protect the Worker itself (not only one hostname) so the `workers.dev` hostname and any future custom domains are covered. Configure the Access allow policy with the exact email addresses approved for the pilot cohort (target: approximately 30 users).

## Safe activation sequence

1. In Cloudflare Dashboard, open **Workers & Pages → cerdikchat-mvp → Settings → Domains & Routes**.
2. Enable **Cloudflare Access** for the Worker, selecting **All traffic** rather than previews only.
3. In **Manage Cloudflare Access**, configure an allow policy for the pilot users' exact email addresses. Do not use a broad email-domain rule unless that is an intentional pilot decision.
4. Test the Access login and confirm an approved user can load the application. Confirm a non-approved user is denied at the Access layer.
5. Only after those checks, set the Worker variable `PILOT_ACCESS_REQUIRED=true` in **Settings → Variables and Secrets**.
6. Deploy the reviewed release, then test both the web page and `POST /api/chat` using an approved account. Test an unapproved account and a direct unauthenticated API request; both must be denied.
7. Keep a documented break-glass administrator account and verify the account can still manage the Worker before ending the change window.

**Important:** Do not set `PILOT_ACCESS_REQUIRED=true` before Cloudflare Access is active and tested. Doing so intentionally blocks chat API requests that do not carry an authenticated Access identity. Do not disable the Access policy as a troubleshooting shortcut.

## Scope and limitations

- This change does not configure Cloudflare Access in the account and does not deploy the Worker.
- The current rate limiter remains 20 requests per 60 seconds; it is now keyed by authenticated user in pilot mode. This is a request-frequency control, not a monthly usage quota or billing cap.
- This does not add per-user conversation storage, roles, admin UI, or account provisioning.
- Cloudflare Access manages sign-in and the allowlist. Add/remove pilot participants through the Access policy.
- Keep Access enabled for every hostname that serves this Worker. Protecting only a custom domain while leaving the `workers.dev` hostname public would create a bypass path.
- The feature flag is intentionally not enabled in `wrangler.toml`; production activation is a separate, explicit dashboard change.

## Verification

Automated tests cover missing identity denial, malformed identity denial, successful authenticated access, and per-user rate-limit key selection. Cloudflare Access login and account policy still require an end-to-end dashboard test after the PR is reviewed and deployed.

## Official Cloudflare references

- [Cloudflare Access for Workers](https://developers.cloudflare.com/workers/configuration/cloudflare-access/)
- [Cloudflare Access JWT validation](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/)
