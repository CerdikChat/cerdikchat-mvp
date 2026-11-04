# CerdikGo — AI Innovation Workspace

**CerdikGo** is the product experience; **CerdikChat** remains the repository and shared application-core name. This repository currently builds a Cloudflare Workers application with a static, mobile-first workspace.

## Current architecture

- **Frontend:** static assets in `src/`, served by the Cloudflare Worker.
- **Backend:** `worker.js`, with authenticated routes and request validation.
- **AI inference:** Cloudflare Workers AI through the `AI` binding. The Worker configuration currently selects `@cf/google/gemma-4-26b-a4b-it`.
- **Rate limiting:** `CHAT_RATE_LIMITER` binding; configured limits differ by environment.
- **Database:** D1 binding `DB`. Production and Preview use separately named databases in Wrangler configuration; do not assume a migration has been applied merely because a migration file exists.
- **Authentication:** Google Identity Services flow and server-side sessions in `auth/google-auth.js`. Preview configuration requires Google authentication; actual access still depends on the configured identity allowlist and required environment settings.
- **PWA metadata:** `src/manifest.webmanifest` and the CerdikGo mark asset. Installability and service-worker/offline behavior require separate browser verification.

## Local development

1. Install a supported Node.js LTS release.
2. Install dependencies with `npm install`.
3. Authenticate Wrangler with `npx wrangler login`.
4. Configure only the environment variables/secrets required by the selected local environment. Never commit credentials or paste them into source files.
5. Run the project test suite using the repository's package scripts, then start a local Worker with `npx wrangler dev`.

Check `package.json`, `wrangler.toml`, and the relevant environment documentation before running commands. Do not copy old Gemini setup instructions: the current Worker uses Cloudflare Workers AI, not a Gemini API key.

## Environment and release safety

- Treat `atlas9/beta-pilot-multimodal-workspace` and its Preview configuration as the integration baseline unless a newer approved branch is explicitly selected.
- Preview D1 is `cerdikchat-staging`; Production D1 is a different resource. Verify the binding and target before any database operation.
- A migration file in Git is **not** proof that it has been applied.
- Do not run remote D1 migrations, write data, change OAuth clients/secrets, enable paid services/billing, change DNS, or deploy Production without separate explicit authorization.
- Keep changes on feature branches and validate the exact commit SHA in CI and Preview before requesting Android Human Verification.
- A passing CI run is not equivalent to a successful Preview runtime test or Android acceptance test.

## Product capability and limitations

The workspace UI may expose modules whose backend/provider dependencies are still gated or under validation. Do not describe a feature as operational solely because its UI is visible. In particular, live web research requires an approved search provider; document scanning requires a real private scanner service; hybrid radio/connectivity concepts are simulations unless connected to actual radio hardware and independently measured. See the relevant feature PR and runbook for each acceptance gate.

## Brand and attribution

- Product: **CerdikGo**
- Shared core / repository: **CerdikChat**
- Strategic engineering program: **ATLAS-9**
- Attribution: **Developed by ATLAS-9 (Dr. Steven)**

Use CerdikGo in user-facing product identity. Retain CerdikChat only where it accurately refers to the shared core, repository, existing Worker/resource identifiers, or historical implementation names.
