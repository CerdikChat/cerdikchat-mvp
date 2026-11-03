# CerdikChat MVP

CerdikChat is a responsive AI chat application.

- **Frontend:** HTML, CSS, and JavaScript in `src/index.html`.
- **Backend:** Cloudflare Workers, entry point `worker.js`.
- **AI runtime:** Cloudflare Workers AI through the `AI` binding.
- **Model:** `@cf/google/gemma-4-26b-a4b-it`.
- **Static assets:** `src/`, served through the `ASSETS` binding.
- **Rate limiting:** `CHAT_RATE_LIMITER` binding.
- **Database binding:** D1 `DB` is configured but is not yet used by the application code.

See [README.md](README.md) for setup, deployment, current feature status, limitations, security requirements, and the closed-beta checklist.

**Important:** the current app has no user authentication or persistent conversation storage. Do not expose it publicly until an access-control layer is configured and tested. No Gemini API key is required by the current Workers AI implementation.
