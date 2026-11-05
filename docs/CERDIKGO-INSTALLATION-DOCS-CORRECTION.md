# Installation documentation correction — 2026-11-06

## Finding

The default-branch README still instructed users to create `GEMINI_API_KEY`, set `GEMINI_MODEL=gemini-2.5-flash`, and run a Gemini secret command. The current `worker.js` instead uses the Cloudflare Workers AI binding `env.AI` with model `@cf/google/gemma-4-26b-a4b-it`.

## Change

- Replaced obsolete Gemini setup instructions with source-verified Workers AI configuration.
- Added safe local commands and a Wrangler dry-run; explicitly prohibited treating the dry-run as a deployment.
- Documented Preview D1/authentication and unverified runtime boundaries without requesting credentials or performing remote operations.
- Added regression tests that detect reintroduction of the obsolete Gemini setup commands.

## Traceability

- Base: `bc6545d6d19fd4b749d0b65fefba3d74775e0221` (`main`).
- Branch: `atlas9/cerdikgo-install-docs-correction-20261106`.
- README commit: `3b0c2d5bd7d5030576e669788596623a702f695a`.
- Test commit: `101a1980da5057b01f49ef91ae72305e5242e840`.
- Guardrail workflow commit: `0b4e82fd5ac31cd9c4b2aeda3eb8065fa765dcb5`.
- Changed files: `README.md`, `tests/readme-installation-docs.test.mjs`, `.github/workflows/atlas9-controlled-autopilot.yml`, this document.
- CI command: `npm test`.
- Live Cloudflare binding verification and Android acceptance: NOT TESTED by this PR.

## Safety

No deploy, D1 write/migration, OAuth/secret/DNS change, billing activation, or Production operation was performed.