# CerdikGo system-wide identity and architecture baseline

**Purpose:** keep product naming, technical architecture, release controls, and feature claims consistent across the CerdikGo workspace.

## Naming contract

| Layer | Canonical name |
|---|---|
| User-facing product | CerdikGo |
| Shared application core / repository lineage | CerdikChat |
| Engineering and quality program | ATLAS-9 |
| Frontend static assets | `src/` |
| Worker entry point | `worker.js` |

Use **CerdikGo** in user-facing headings, navigation, app metadata, and product documentation. Retain **CerdikChat** only when it identifies the shared core, repository/resource names, existing technical identifiers, or historical work. Renaming Cloudflare resources, OAuth origins, repository names, database names, or secrets is a separate controlled operation and is not part of a visual rebrand.

## Architecture baseline

1. The static workspace is served from `src/` by the Cloudflare Worker asset binding.
2. `worker.js` is the backend entry point.
3. AI inference is routed through the Cloudflare Workers AI `AI` binding. The source configuration currently names `@cf/google/gemma-4-26b-a4b-it`.
4. `CHAT_RATE_LIMITER` provides the configured request limiter.
5. `DB` binds to environment-specific D1 resources. Preview uses `cerdikchat-staging`; the Production binding is a separate database.
6. Google authentication and server-side session behavior are implemented in `auth/google-auth.js`; the Preview Wrangler variables set `GOOGLE_AUTH_REQUIRED=true`.
7. The PWA manifest is `src/manifest.webmanifest`; its presence alone does not prove offline caching or installability on every Android browser.

## Feature truthfulness rules

- Prompt Intelligence UI and local Prompt Vault do not imply server-side prompt persistence.
- Document analysis is not operational unless the private scanner service is configured and its runtime behavior is validated.
- Live Web Research is not operational without an approved search provider and safe fetch controls.
- Hybrid Connectivity/LoRa UI is a simulator, not live radio connectivity.
- A role-gated Admin UI is not proof that every administrative mutation is enabled or audited in the target database.
- CI success, Preview deployment, runtime smoke test, Android Human Verification, and Production release are distinct acceptance stages.

## Release and data protection

- Feature work remains on an isolated branch until reviewed.
- Never treat committed migration SQL as an applied migration.
- Before a Preview D1 migration: verify the exact D1 ID, inspect preflight output, confirm dependency order, and obtain separate explicit authorization for the write.
- Production deployment, Production D1 writes/migrations, OAuth/secrets changes, DNS changes, paid services, and billing require separate explicit authorization.
- Preserve existing Human Verified behavior; rerun only when the changed code creates a material regression risk.
- Do not log credentials, tokens, session identifiers, CSRF values, or unnecessary personal data.

## Acceptance checklist for a system-wide CerdikGo release

- [ ] User-facing product name and assets consistently identify CerdikGo.
- [ ] Shared-core identifiers remain accurate and are not blindly renamed.
- [ ] Worker, AI binding/model, D1 environment mapping, and rate limiter are documented against source.
- [ ] Authentication, session, CSRF, and server-side role checks pass regression tests.
- [ ] Every visible module has a verified backend/provider or is clearly marked unavailable/simulated.
- [ ] PWA manifest, icon paths, install prompt, and offline behavior are tested on Android.
- [ ] Exact commit SHA passes CI.
- [ ] Exact Preview deployment SHA is confirmed and runtime smoke-tested.
- [ ] Android Human Verification covers changed flows and preserves previously verified journeys.
- [ ] Migration and release approvals are recorded separately from code review.

This document records the engineering contract; it does not certify that every checkbox has passed.
