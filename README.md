# CerdikChat / CerdikGo — Cloudflare Workers AI MVP

This repository contains the shared CerdikChat Worker core and CerdikGo Preview workspace. The active Worker source uses Cloudflare Workers AI; the README must not be followed as a Gemini API setup guide.

## Current architecture (source-verified)

- Worker entry point: `worker.js`.
- Static workspace assets: `src/`.
- Inference binding: `env.AI` (Cloudflare Workers AI).
- Current default model in `worker.js`: `@cf/google/gemma-4-26b-a4b-it`.
- Other declared bindings: `ASSETS`, `CHAT_RATE_LIMITER`, and `DB`.
- Core chat history is held in browser memory; do not assume persistent conversation storage.
- `wrangler.toml` defines a top-level D1 binding and a separate Preview D1 override. Confirm the actual environment-specific binding before any Preview acceptance; do not run remote migrations as part of this guide.

**No Gemini API key is required by the current Worker source.** Do not create or add `GEMINI_API_KEY` or `GEMINI_MODEL` for this code path.

## Requirements

- Node.js 20 or newer (see `package.json`).
- npm.
- Cloudflare Wrangler CLI 4.153.0 for configuration validation and local development.
- A Cloudflare account is needed only for authenticated remote Preview access; do not assume that a local unit test proves remote bindings or model quota.

## Safe local checks

From the repository root:

```bash
npm install --ignore-scripts --no-audit --no-fund
npm test
npx --yes wrangler@4.153.0 deploy --dry-run --outdir /tmp/cerdikchat-worker-build
```

The Wrangler command above is a build/configuration dry-run only. It does not deploy the Worker. Do not replace it with `wrangler deploy` unless a separate deployment approval is granted.

To run the local development server, use:

```bash
npx --yes wrangler@4.153.0 dev
```

Local development does not prove that remote Workers AI, D1, rate-limit, OAuth, or scanner bindings are correctly provisioned. Use synthetic data only and verify each binding in the intended isolated Preview before a human acceptance test.

## Authentication and environment boundaries

- The Preview variables in `wrangler.toml` set `GOOGLE_AUTH_REQUIRED=true` and `ENVIRONMENT=preview`.
- Google sign-in requires correctly provisioned OAuth client configuration and the applicable D1 schema. Do not place client secrets, tokens, or credentials in source control.
- The current `main` Worker still has an opt-in authentication default; fail-closed Production hardening remains a separate Draft PR and must not be inferred from local tests.
- Do not run D1 migrations, change OAuth/secrets/DNS, enable billing, or deploy Production from this setup guide.

## Capability boundaries

Verified source/configuration is not the same as runtime acceptance. The following are not established by `npm test` alone:

- Live Web Research or current external-source retrieval.
- Malware-scanned document upload; the upload path requires a real fail-closed scanner binding.
- Android microphone recording, voice playback, or device acceptance.
- Persistent chat history, autonomous multi-agent execution, or offline radio/mesh connectivity.
- Production availability, scale, backup restoration, or disaster recovery.

ATLAS-9 remains exactly nine specialist profiles (ATLAS-01 through ATLAS-09). Optimus Prime is coordinator, not a tenth specialist. The gateway remains `plan_only`; no independent agent execution is implied by role profiles.

## Release discipline

Keep changes on isolated `atlas9/*` feature branches and Draft PRs. Require exact-commit CI, a separately authorized Preview review, Android acceptance where applicable, and an explicit Production approval. A green unit-test run is not Production approval.

Do not commit `.dev.vars`, API keys, OAuth secrets, bearer tokens, personal data, or real customer documents.