# CerdikChat MVP — Cloudflare Workers AI

CerdikChat is a responsive, Indonesian-first AI chat web application. The current repository implementation uses **Cloudflare Workers** for the backend and **Cloudflare Workers AI** through the `AI` binding.

> **Repository status:** MVP / closed-beta foundation. This project is not production-hardened. Do not expose the endpoint publicly until the access-control and security items in this document have been addressed.

## Current architecture

```text
Browser
  |
  | HTTPS
  v
Cloudflare Worker
  |-- GET/static assets ------> ASSETS binding (./src)
  |
  |-- POST /api/chat
        |-- request and message validation
        |-- per-IP rate-limit check
        |-- runtime date/time context
        |-- deterministic local calculator
        |-- Workers AI inference
        |      Model: @cf/google/gemma-4-26b-a4b-it
        |      Tool: calculate_expression
        |
        |-- JSON response: { reply, ... }
```

### Runtime configuration

The current `wrangler.toml` declares:

| Setting | Current repository configuration |
|---|---|
| Worker name | `cerdikchat-mvp` |
| Entry point | `worker.js` |
| Compatibility date | `2026-10-27` |
| Static assets | `./src`, binding `ASSETS` |
| Workers AI | Binding `AI` |
| Rate limiter | Binding `CHAT_RATE_LIMITER`, configured for 20 requests per 60 seconds |
| D1 | Binding `DB` to `cerdikchat-db` |
| Observability | Enabled; `head_sampling_rate = 1` |

The Worker currently uses `AI`, `ASSETS`, and `CHAT_RATE_LIMITER`. Although the D1 binding is configured, **the current application code does not query or write to D1**.

## AI model and credentials

The Worker calls this Cloudflare-hosted model:

```text
@cf/google/gemma-4-26b-a4b-it
```

The model is invoked through `env.AI.run()`. The current implementation does **not** require a Gemini API key, Google AI Studio key, OpenAI key, or a provider API secret for its Workers AI inference path.

Do not add API keys to `src/index.html`, commit secrets to Git, or paste credentials into issues or chat messages. Cloudflare bindings provide the Worker with access to configured platform resources.

Model availability, input/output limits, account entitlements, and Workers AI usage allowances can change. Check the Cloudflare dashboard and current model documentation before planning usage or inviting more users. Do not assume that a consumer AI subscription includes API access or that Workers AI usage is unlimited/free.

## Features currently present in the code

The following are confirmed by inspection of the current repository source. They are not all independently certified by production runtime tests.

- Responsive static web chat UI.
- Starter prompt buttons.
- `POST /api/chat` request and JSON response handling.
- Multi-turn context passed from browser memory to the Worker.
- Basic Markdown rendering using DOM text nodes rather than interpreting model output as raw HTML.
- Request-body size limit (40 KiB).
- Message length limit (8,000 characters).
- Up to 12 history messages; each history item is truncated to 2,000 characters in the Worker.
- Runtime date/time context, using Cloudflare's request timezone when available and `Asia/Makassar` as the configured fallback.
- Local arithmetic parser that does not use `eval()` or `Function()`.
- One allowlisted calculator tool: `calculate_expression`.
- Basic error classification and rate-limit handling.
- Web app manifest and icon assets.

### Important implementation limits

- **Conversation history is temporary.** The browser keeps it in JavaScript memory while the page remains open. Refreshing or closing the page loses the conversation. It is not saved to D1.
- **D1 persistence is not implemented.** A binding in Wrangler configuration does not itself create tables or save data.
- **Authentication is not implemented in the application.** The Worker does not identify or authorize individual users.
- **CORS is not authentication.** The current origin check permits requests with no `Origin` header. Non-browser clients can call the endpoint directly unless another access-control layer protects it.
- **Rate limiting is approximate and keyed by client IP.** The configured 20 requests / 60 seconds is not a strict global quota or per-user allowance. Users sharing a mobile carrier or public IP may share a limit.
- **Function calling is limited.** The code exposes one calculator tool and handles at most one model-directed tool call. It is not yet a general-purpose multi-tool agent or a multi-step tool-execution loop.
- **Calculator input currently uses a basic numeric grammar.** Indonesian thousands separators and decimal-comma normalization are not implemented. For example, do not assume that `1.000 + 2.000` is interpreted as 1,000 + 2,000. Validate numeric formatting before using it for financial or operational decisions.
- **PDF, image upload/analysis, OCR, voice input, and voice output are not integrated into the current frontend/API flow.** A model's possible modality support does not mean these application features are implemented.
- **No external web search or live financial/news data retrieval is implemented.**
- **The web manifest exists, but an offline service-worker/cache implementation was not found in the current source.** Do not describe the app as offline-capable on that basis alone.
- **No production uptime, security certification, or load-test result is claimed by this repository.**

## Prerequisites

For the command-line development/deployment path:

- A Cloudflare account with access to the `cerdikchat-mvp` Worker and its configured bindings.
- Node.js and npm compatible with the current Wrangler release.
- Access to this repository.
- Wrangler CLI (the commands below use `npx`).

No Gemini API key is required for the current Workers AI binding implementation.

## Local development

Run these commands from the repository root, where `wrangler.toml` is located:

```bash
npx wrangler@latest login
npx wrangler@latest dev
```

Follow the local URL printed by Wrangler and test the chat UI.

Local development can behave differently from the deployed Worker depending on available bindings and local/remote resource configuration. Confirm that the `AI` and `CHAT_RATE_LIMITER` bindings are available in the chosen development mode. Do not assume a local test proves the deployed production configuration.

## Deploying

**Do not deploy an unreviewed change to production.** First review the diff, test the candidate, and obtain project-owner approval.

When an approved change is ready, run from the repository root:

```bash
npx wrangler@latest deploy
```

The Wrangler configuration points to `worker.js` and uploads static assets from `src/`. Confirm the target environment, bindings, and deployment output before considering the release complete.

This repository does not document or assume an automated GitHub Actions deployment pipeline. Use only the deployment workflow actually configured for the Cloudflare Worker.

## API contract

The current frontend sends:

```json
{
  "message": "Hello CerdikChat",
  "history": [
    { "role": "user", "content": "Previous question" },
    { "role": "assistant", "content": "Previous answer" }
  ]
}
```

Endpoint:

```text
POST /api/chat
Content-Type: application/json
```

A successful response includes:

```json
{
  "reply": "Assistant response"
}
```

Calculator responses may also include `model` and `tool` metadata. Error responses include an `error` code and a user-facing `message`.

## Manual smoke-test checklist

Run these checks against a non-production candidate first:

1. Open the web UI on Android and desktop.
2. Send a normal text prompt and confirm a non-empty `reply`.
3. Send a follow-up prompt and confirm that recent context is included.
4. Ask for the current date/time and check the reported timezone.
5. Test arithmetic precedence, parentheses, negative numbers, decimals, and large values.
6. Test division by zero and confirm a clear error.
7. Test malformed JSON, missing message, unsupported content type, and an oversized request.
8. Test rate-limit behavior without assuming the limit is globally strict.
9. Inspect Worker logs for tool-decision and execution events; a successful HTTP 200 alone does not prove that a tool was called.
10. Confirm that refreshing the page clears the in-memory conversation; this is the current expected behavior.

Record the test input, expected result, actual result, environment, timestamp, and relevant log evidence. Do not mark a test passed based only on code inspection.

## Security and closed-beta guidance

Before inviting external pilot users:

1. Put the Worker behind an access-control layer such as an appropriately configured Cloudflare Access policy, or implement application-level authentication and session validation.
2. Verify that both the web UI and `/api/chat` are protected, while legitimate browser requests continue to work.
3. Keep all credentials and secrets server-side.
4. Define acceptable-use, privacy, retention, and deletion policies.
5. Use synthetic or non-sensitive test data until data handling is reviewed.
6. Monitor model usage, rate-limit responses, errors, and account quotas.
7. Test direct requests without an `Origin` header; same-origin checks alone do not prevent them.

Cloudflare's Workers Rate Limiting API is approximate, uses location-local counters, and can allow requests beyond the configured threshold while counters synchronize. IP-based keys can also group multiple users behind shared networks. Treat the current limiter as an abuse-friction mechanism, not authentication or a strict billing guard.

## Known work remaining

The next engineering priorities are:

- Add and verify closed-beta authentication/access control.
- Fix Indonesian number normalization and add regression tests.
- Verify the Workers AI function-calling response shape against the deployed model/runtime.
- Decide whether to implement D1 conversation persistence; if approved, add schema, ownership checks, retention, and deletion behavior.
- Update product scope only after PDF/image/voice integrations are implemented and tested.
- Add automated regression tests and a documented release process.

## Documentation and source of truth

- Worker implementation: `worker.js`
- Frontend and static assets: `src/`
- Cloudflare configuration: `wrangler.toml`
- This README describes the code inspected in the repository. If the code changes, update this document in the same change.

## Official references

- [Cloudflare Workers AI bindings](https://developers.cloudflare.com/workers-ai/configuration/bindings/)
- [Cloudflare Workers Rate Limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
- [Cloudflare Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [Gemma 4 26B A4B model documentation](https://developers.cloudflare.com/ai/models/%40cf/google/gemma-4-26b-a4b-it/)
