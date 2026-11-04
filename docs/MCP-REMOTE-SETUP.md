# CerdikGo Remote MCP — Preview Integration

## Canonical implementation

- Canonical Worker source: `mcp-preview-worker.js`.
- Compatibility entrypoint: `mcp-preview/worker.js` re-exports the canonical module; do not maintain a second implementation.
- Endpoint path: `/mcp`.
- Transport: stateless Streamable HTTP JSON-RPC subset.
- Server identity: `cerdikgo-atlas9`.
- Tools: `cerdikgo.get_capabilities`, `cerdikgo.get_agent_registry`, `cerdikgo.create_task_plan`.
- All tools are read-only / plan-only. No model-provider calls, arbitrary fetch, database writes, or agent execution.

## Gemini CLI — supported client configuration

Gemini CLI supports remote MCP over Streamable HTTP using `httpUrl`, custom `headers`, `includeTools`, and `trust`. Configure only after Preview has been deliberately activated and the token is stored locally in the operator's environment. Never commit a real token.

Example addition to Gemini CLI `settings.json`:

```json
{
  "mcpServers": {
    "cerdikgo-preview": {
      "httpUrl": "https://cerdikgo-mcp-preview.ngyoonseong.workers.dev/mcp",
      "headers": {
        "Authorization": "Bearer $CERDIKGO_MCP_TOKEN"
      },
      "timeout": 30000,
      "trust": false,
      "includeTools": [
        "cerdikgo.get_capabilities",
        "cerdikgo.get_agent_registry",
        "cerdikgo.create_task_plan"
      ]
    }
  }
}
```

The environment variable must be defined in the shell/session that launches Gemini CLI. Do not put the token literal in this file, source code, screenshots, chat, or logs. Keep `trust:false` so Gemini CLI retains per-tool confirmation behavior. The endpoint URL above is the known Preview endpoint; this documentation does not assert that it is currently enabled or reachable.

Useful checks in Gemini CLI:
- `gemini mcp list` — inspect connection status.
- `/mcp` — inspect discovered tools in an interactive session.
- Invoke `cerdikgo.get_capabilities` and `cerdikgo.get_agent_registry` first.
- Use `cerdikgo.create_task_plan` only for non-executing planning.

Gemini CLI Google sign-in and the CerdikGo MCP Bearer token are separate credentials. Do not use a Google account password as an MCP token.

## ChatGPT Go — Context Bridge

ChatGPT Go remains on the manual Context Bridge path. Open `/bridge.html` from the CerdikGo workspace, export a task envelope from ChatGPT Go, and import it into CerdikGo. This is not direct MCP connectivity, shared memory, or an OpenAI API integration.

## Preview security and activation

- Closed by default: `CERDIKGO_MCP_ENABLED=false`.
- Requires Preview secret `CERDIKGO_MCP_BEARER_TOKEN` with at least 32 characters.
- Configure the secret through Cloudflare's secure secret interface only.
- Set the Preview flag to `true` only after confirming secret presence and passing source/CI checks.
- Do not change Production settings, secrets, bindings, routes, or deployments.
- Never disclose the token or include it in logs.

## Verification gates

1. Source review and canonical-entrypoint test.
2. Node.js regression suite and Wrangler dry-run.
3. Human-approved Preview secret and flag configuration.
4. Authenticated MCP initialize, initialized notification, tools/list, and tools/call.
5. Gemini CLI `gemini mcp list` and real tool invocation.
6. ChatGPT Go Context Bridge import/export and Android verification.
7. Production release — separate approval only.

## Explicit non-goals

No ChatGPT Go custom MCP connector, OAuth authorization server, OpenAI API adapter, Gemini model inference adapter, cross-provider conversation sync, autonomous agent execution, task persistence, or billing is enabled by this work.
