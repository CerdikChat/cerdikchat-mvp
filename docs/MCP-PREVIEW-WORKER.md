# CerdikGo MCP Preview Worker

## Canonical source

- Source: `mcp-preview/worker.js`
- Runtime: Cloudflare Workers Module Worker
- Endpoint: `POST /mcp` (Streamable HTTP JSON-RPC subset)
- Server identity: `cerdikgo-atlas9` version `0.1.1`
- Registry: imported from `integrations/agent-gateway.js` (single source of truth)
- Tools: `cerdikgo.get_capabilities`, `cerdikgo.get_agent_registry`, `cerdikgo.create_task_plan`

## Security controls

- Closed by default: `CERDIKGO_MCP_ENABLED=false`.
- Requires `CERDIKGO_MCP_BEARER_TOKEN` with at least 32 characters.
- Authentication is checked before parsing or processing tool requests.
- JSON request body is limited to 16 KiB.
- Per-isolate rate guard: 60 requests/minute/IP. This is a best-effort guard, not a substitute for a Cloudflare Rate Limiting binding or gateway-level enforcement.
- Responses use `Cache-Control: no-store`.
- No D1, Workers AI, OAuth, Production bindings, arbitrary fetch, shell, SQL, filesystem, deployment, or privileged tools.
- Task planning is non-executing. Controlled actions return `awaiting_human_approval`.

## Preview configuration

Keep the current Preview environment disabled until a secret is provisioned through Cloudflare's secure secret interface. Never put bearer values in Git, chat, client bundles, logs, or test fixtures.

Required Preview-only configuration:
1. Set secret `CERDIKGO_MCP_BEARER_TOKEN` (random, at least 32 characters).
2. Set variable `CERDIKGO_MCP_ENABLED=true` only after secret presence is verified.
3. Do not add Production bindings or change Production Worker settings.

## Protocol verification

The automated tests cover disabled mode, authentication rejection, initialize, tools/list, nine-agent registry, plan-only behavior, and unknown tool rejection. These tests do not replace a real external client handshake.

## Known limitations

- Stateless JSON-RPC Streamable HTTP subset; no server-initiated notifications, resources, prompts, or long-lived session state.
- In-memory rate guard is per isolate and may reset or vary across isolates.
- ChatGPT client compatibility and Gemini client compatibility must be verified independently. A static bearer token may not meet ChatGPT's required authentication mode for some plans or surfaces.
- No provider model inference or cross-provider conversation transfer is implemented.
