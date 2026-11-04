# CerdikGo AI Provider Routing — Free-first Preview

## Decision

CerdikGo uses a provider abstraction with a strict `free_only` policy.

- **Workers AI** remains the only enabled runtime provider.
- **DeepSeek** is an optional future adapter, disabled by policy. The hosted DeepSeek API and Cloudflare-hosted DeepSeek inference must not be assumed free.
- **GitHub Copilot** is a development-time coding assistant, not a CerdikGo runtime inference provider.
- No provider may be activated merely because a UI option or adapter exists.

## Current implementation

`integrations/model-router.js` exposes:

- `resolveModelRoute(env)`: selects the existing Workers AI binding and model.
- `getProviderAvailability(provider)`: reports policy eligibility.
- `MODEL_POLICY`: records the current free-only allowlist.

The Worker uses the resolved route for its existing inference call. There is no DeepSeek HTTP request, no external fetch, no API-key lookup, and no new secret requirement.

The optional Workers AI model override is `CERDIKGO_WORKERS_AI_MODEL`. If unset, the existing Gemma 4 model remains the default.

## DeepSeek activation gate

A future DeepSeek adapter requires all of the following before implementation or activation:

1. A documented provider endpoint and model identifier.
2. A verifiable free entitlement or free quota that does not require billing activation.
3. Published rate, data-retention, and privacy terms acceptable for the application.
4. Server-side secret handling and redacted logs.
5. Explicit provider allowlisting and bounded timeout/output limits.
6. Unit, integration, negative, and Preview runtime tests.

If any condition is not met, DeepSeek remains disabled and Workers AI continues as the primary provider.

## GitHub integration boundary

GitHub Copilot/Codespaces may support developer workflows depending on account plan, quota, and client support. This does not make Copilot a backend provider and does not authorize paid Codespaces usage. Keep development credentials in GitHub/Codespaces secrets; never commit them.

## Security and release controls

- Preview feature branch only.
- No billing, paid plan, prepaid credits, or paid API activation.
- No Production Worker, D1, OAuth, DNS, or secret changes.
- No external provider calls under the current free-only policy.
- A passing unit test is not proof of deployed Preview behavior.
