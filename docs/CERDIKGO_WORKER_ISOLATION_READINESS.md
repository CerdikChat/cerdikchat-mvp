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


### Cloudflare account inventory — read-only check, 2026-11-05

The connected Cloudflare account was queried using read-only Worker inventory and settings endpoints. No Worker, secret, DNS, D1, or billing settings were changed.

- The account's Worker Script inventory returned `cerdikchat-mvp` and `cerdikgo-mcp-preview`. It did not return a script named `atlas9-prompt-intelligence-mvp-cerdikchat-mvp`.
- A direct read of settings and deployments for `atlas9-prompt-intelligence-mvp-cerdikchat-mvp` returned HTTP 404 (script not found).
- The supplied CerdikGo Primary hostname therefore must not be represented as an independently provisioned Worker on the evidence available. GitHub's Cloudflare deployment bot identifies it as the branch Preview hostname for the `cerdikchat-mvp` service. The separate `cerdikgo-mcp-preview` script is an MCP service, not the CerdikGo web application.
- The deployed `cerdikchat-mvp` Worker currently has `AI`, `ASSETS`, `CHAT_RATE_LIMITER`, and `DB` bindings. Its observed settings show invocation logs enabled and persisted at 100% sampling, while `redact_query_string` is false. Treat this as a P2 observability/privacy hardening gap; review actual logged URL patterns and enable query-string redaction through a separately approved change.
- The deployed `cerdikchat-mvp` settings also list legacy `GEMINI_API_KEY` and `OPENAI_API_KEY` secret bindings. Secret values were not read or exposed. Their necessity should be verified against the deployed code before any separately authorized cleanup.
- The five most recent deployment records returned for `cerdikchat-mvp` show the latest deployment at 2026-11-01 14:59 UTC. This inventory does not by itself establish which source commit is deployed; correlate the active version with the release record before claiming code parity.

### Consequence for product identity and release status

As of this read-only inventory, CerdikGo Primary is **not verified as a separate deployed Cloudflare Worker**. The supplied hostname is associated with a branch Preview deployment; `cerdikgo-mcp-preview` is a different service. The separate Worker name in `wrangler.cerdikgo.toml` is only a candidate target until a dedicated script exists and has been provisioned under explicit authorization.


### Authentication fail-closed gate

- In `worker.js`, Google session enforcement in `handleChat` is conditional on `GOOGLE_AUTH_REQUIRED === "true"`. The candidate `wrangler.cerdikgo.toml` does not currently set this variable.
- The existing repository's top-level `wrangler.toml` also does not declare the variable at the top level; it declares it only in the Preview vars section. The Cloudflare settings read did not expose runtime plain-text vars, so the effective Production value is **not independently verified** by this audit.
- Before any CerdikGo user-facing release, explicitly configure `GOOGLE_AUTH_REQUIRED=true`, a CerdikGo-specific Google Client ID and exact authorized origin, then prove unauthenticated chat is rejected (401) and an approved authenticated session succeeds. Do not infer authentication from the presence of a Google login button or from the D1 binding alone.


### Identity of the supplied CerdikGo Primary URL

A direct read of PR #51's Cloudflare deployment-bot comment confirms that the exact supplied hostname
`https://atlas9-prompt-intelligence-mvp-cerdikchat-mvp.ngyoonseong.workers.dev`
is the Cloudflare **Preview URL for PR #51**, branch `atlas9/prompt-intelligence-mvp`, candidate SHA `afa2ad537b3979b5e2361d0a3242059ea639f59c`. The latest reported Preview deployment for that branch was created on 2026-11-05 at 10:21:27 UTC and reported Build: Success / Deployment: Success.

PR #51 remains open and unmerged. Therefore the supplied Primary URL is not evidence of a separately provisioned CerdikGo Primary Worker or a Production release. It is an automatically generated branch Preview hosted under the `cerdikchat-mvp` Worker service. Keep the product label “CerdikGo Primary candidate / Preview” until a separate Worker is actually provisioned and its own runtime is verified.

## Fail-closed authentication default correction — 2026-11-05

**Status:** VERIFIED on isolated Draft PR #84; NOT INTEGRATED; NOT DEPLOYED.

- Branch: `atlas9/cerdikgo-worker-isolation-readiness`.
- Config change commit: `c827b1c3cc08027ee036d0f82465046521b6993e`.
- Regression guardrail test commit / exact current head: `e3c0a6295001c07476aa3900a6075b37f7bc7b6f`.
- Changed files: `wrangler.cerdikgo.toml`, `tests/cerdikgo-worker-config.test.mjs`, and this readiness document.
- `wrangler.cerdikgo.toml` now sets `GOOGLE_AUTH_REQUIRED = "true"`. The dedicated Worker remains fail-closed until its own D1, rate-limit namespace, Google OAuth client/origin, secrets and scanner binding are separately provisioned and approved.
- The new tests assert that authentication is required and that the config does not reuse shared D1 or rate-limit resources.
- Exact-head regression: run `42036859248` SUCCESS; `npm test` 97 passed / 0 failed.
- Exact-head readiness: PR run `42036859327` SUCCESS and push run `42036865561` SUCCESS; install/preflight and full regression passed; TypeScript is NOT CONFIGURED on this legacy JavaScript branch.
- Isolated Worker readiness: PR run `42036859143` SUCCESS and push run `42036865996` SUCCESS; command `npx --yes wrangler@4.153.0 deploy --dry-run --config wrangler.cerdikgo.toml` passed. Wrangler output explicitly showed `env.GOOGLE_AUTH_REQUIRED ("true")`. No deployment occurred.
- Workflow safety scan passed; no deploy job exists in the readiness workflow.

The connected Cloudflare account's read-only Worker inventory returned only `cerdikchat-mvp` and `cerdikgo-mcp-preview`; no script named `atlas9-prompt-intelligence-mvp-cerdikchat-mvp` exists in the returned inventory. This PR therefore remains a readiness package, not a separately provisioned CerdikGo Primary Worker. Do not reuse CerdikChat D1 or rate-limit resources to make it appear functional.

No Production deployment, D1 write/migration, OAuth/secret/DNS change, billing activation, scanner provisioning, or merge was performed. Human Verification remains NOT STARTED. Preview runtime, Android acceptance and Production readiness remain separate and NOT TESTED.
