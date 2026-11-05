# CerdikGo — New Cloudflare Worker Isolation Readiness

Status: **READINESS PACKAGE — NOT DEPLOYED**

Target Worker name:
`atlas9-prompt-intelligence-mvp-cerdikchat-mvp`

Expected workers.dev hostname:
`https://atlas9-prompt-intelligence-mvp-cerdikchat-mvp.ngyoonseong.workers.dev`

## Product boundaries

- CerdikChat remains `cerdikchat-mvp`.
- CerdikGo Primary is a separate Worker target.
- `cerdikgo-mcp-preview` remains a separate MCP service; it is not the CerdikGo app.
- The existing `wrangler.toml` is not changed by this package.

## Included in this readiness package

- Dedicated `wrangler.cerdikgo.toml` with a unique Worker name.
- Workers AI binding `AI`.
- Static asset binding `ASSETS`.
- Product identity variables for CerdikGo.
- GitHub Actions workflow for regression tests and Wrangler dry-run only.
- No deploy command without `--dry-run`.

## Deliberately not provisioned

The new config does not bind CerdikChat Production D1 or reuse Preview D1. It also does not invent or reuse rate-limit namespace IDs. These resources must be independently provisioned and tested before the full authenticated application can be considered deployable.

Required before a functional Primary release:

1. Dedicated CerdikGo D1 database and reviewed migration plan.
2. Dedicated rate-limit namespace.
3. Google OAuth Client ID and authorized origin for the exact CerdikGo hostname.
4. Required Worker secrets, checked by name/presence only; never print values.
5. Private `FILE_SCANNER` Service Binding and verified ClamAV service, or keep document scanning unavailable/fail-closed.
6. Confirmed Workers AI model availability and live inference test after deployment.
7. Deployment rollback procedure and exact-SHA release record.
8. Android Human Verification of login, chat, voice, document workflows, and navigation.

## Important runtime limitation

The current shared `worker.js` contains authenticated and database-backed routes. Because this readiness config intentionally has no D1 binding, it is a configuration/build candidate, not a functional authenticated deployment. Do not deploy it as a user-facing Primary Worker until the dedicated data/auth prerequisites are complete.

## Safety controls

- No Production deployment.
- No D1 writes or migrations.
- No OAuth, secrets, DNS, billing, or scanner-service changes.
- No changes to the existing CerdikChat Worker configuration.
- No automatic Preview deployment.
