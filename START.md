# CerdikGo — Quick Installation Guide

CerdikGo is the user-facing AI workspace. CerdikChat remains the shared repository/core and existing Cloudflare resource lineage.

## Requirements

- Node.js 20 or newer (Node.js 22 LTS is the CI baseline).
- npm.
- A Cloudflare account for remote Preview use.
- GitHub Codespaces or a local terminal. Android users can use GitHub Codespaces in a browser.

## Install and validate locally

```bash
npm install --ignore-scripts --no-audit --no-fund
npm run doctor
npm test
```

The doctor checks required source files and the expected Worker, assets, Workers AI, D1, and rate-limit declarations in `wrangler.toml`. It is a local preflight only; it cannot prove that remote Cloudflare bindings, credentials, quotas, or model inference are healthy.

## Run a local Worker

```bash
npx wrangler@4 dev
```

Open the local address printed by Wrangler (normally `http://localhost:8787`). Use only approved local/test configuration. Do not point local experiments at Production D1.

## Cloudflare authentication

For an authorized Preview workflow:

```bash
npx wrangler@4 login
npx wrangler@4 whoami
```

Review `wrangler.toml` and the Preview runbook before any remote action. A successful login does not prove that every binding or secret is configured.

## AI provider

The current Worker source uses the Cloudflare Workers AI binding (`env.AI`) and the model configured in `worker.js` / `integrations/model-router.js`. It does not require a Gemini API key. Verify that the selected model is available to the account and environment before relying on inference.

## Important safety boundaries

- Never commit API keys, bearer tokens, cookies, OAuth secrets, or `.dev.vars`.
- Do not run remote D1 migrations or data writes without separate explicit approval.
- Do not deploy Production, change DNS/OAuth, create or rotate secrets, or enable paid services/billing without separate approval.
- Preview and Production resources are distinct. Verify the exact target before every remote operation.
- A green local doctor or CI run does not prove Preview runtime health or Android acceptance.
