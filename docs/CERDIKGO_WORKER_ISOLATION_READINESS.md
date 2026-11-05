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


## ATLAS-9 Integrity Audit Addendum — 2026-11-05

This addendum records findings verified against the current candidate source at commit `78e9cc67e3222b9d3e0c6cc2551ae5f041e26048`.

### Runtime blockers confirmed from source

- `worker.js` requires `env.CHAT_RATE_LIMITER.limit()` before accepting `POST /api/chat`. If the binding is absent, the Worker returns HTTP 503 with `RATE_LIMITER_MISSING` (see `applyRateLimit`, lines 920–960).
- `auth/google-auth.js` requires `env.DB` for Google login, current-session lookup, session enforcement, and logout. Without D1, these routes return unavailable or cannot validate a session.
- `admin-portal.js` and `feature-requests.js` also require `env.DB`; feature requests additionally require `CHAT_RATE_LIMITER`.
- `multimodal/file-analysis.js` and `multimodal/voice-assistance.js` require an authenticated session and `CHAT_RATE_LIMITER`; file analysis also requires Workers AI document conversion and inference methods.
- The current `wrangler.cerdikgo.toml` binds `AI` and `ASSETS`, but deliberately does not bind D1 or `CHAT_RATE_LIMITER`. Therefore this config is not a functional user-facing Worker. A static asset response may load, but authenticated chat and dependent service routes are not runtime-ready.
- Do not work around these missing bindings by reusing CerdikChat Production or Preview resources. Provisioning or binding dedicated resources requires separate authorization.

### Preview deployment integration discrepancy

The readiness workflow in this PR contains only `npm test` and Wrangler `--dry-run`; it contains no deploy step. Nevertheless, the Cloudflare GitHub integration posted successful Preview deployment notifications for candidate commit `78e9cc6` on 2026-11-05, including the branch Preview hostname `https://atlas9-cerdikgo-worker-isolation-readiness-cerdikchat-mvp.ngyoonseong.workers.dev`. This was a Preview deployment, not evidence of Production deployment.

Accordingly, the earlier statement “No automatic Preview deployment” is not guaranteed by repository workflow code. The Cloudflare integration is independently capable of creating Preview deployments on PR updates. Any change to that account-level integration is outside this PR and requires owner authorization.

### Exact-head automated evidence

- Candidate SHA: `78e9cc67e3222b9d3e0c6cc2551ae5f041e26048`.
- CerdikGo Worker Readiness (No Deploy): run `42019315579` — SUCCESS.
- CerdikGo Legacy JavaScript Auto Pilot Readiness Gate: run `42019315595` — SUCCESS.
- Both jobs completed regression and Wrangler dry-run steps successfully. The earlier run `42018204875` failed at test 31 (92/93 tests passed); the failure was corrected in the later candidate and both exact-head runs above passed.
- CI and dry-run do not establish live Workers AI inference, D1/authentication, rate-limit operation, Android behavior, or Production readiness.

### Current decision

Keep this PR draft and unmerged. The isolated configuration remains a readiness/build candidate only until dedicated D1 and rate-limit resources, OAuth configuration, required secrets, scanner decision, live runtime tests, Android Human Verification, rollback evidence, and explicit release authorization are complete.

## Safety controls

- No Production deployment.
- No D1 writes or migrations.
- No OAuth, secrets, DNS, billing, or scanner-service changes.
- No changes to the existing CerdikChat Worker configuration.
- No deploy step exists in this PR workflow. Cloudflare's repository integration may independently trigger Preview deployments; see the audit addendum above.
