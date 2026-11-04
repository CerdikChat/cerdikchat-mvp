# CerdikGo Remote MCP — Feature-Branch Implementation

## Current implementation

- Endpoint path: `/mcp`
- Transport: Streamable HTTP through Cloudflare Agents SDK `createMcpHandler`.
- Handler lifecycle: stateless; no MCP protocol session or Durable Object is required.
- Tools:
  - `cerdikgo.get_capabilities`
  - `cerdikgo.get_agent_registry`
  - `cerdikgo.create_task_plan`
- Tool execution is read-only / plan-only. No provider calls, external data fetches, or database writes are exposed.
- MCP route is disabled unless `CERDIKGO_MCP_ENABLED=true`.
- Authentication requires a dedicated `CERDIKGO_MCP_BEARER_TOKEN` secret with at least 32 characters.
- Requests are rate-limited through the existing Worker rate-limit binding.

## Human-gated activation

Do not set the flag or secret automatically.

After explicit approval, an operator may configure the Preview Worker only:
1. Generate a random token of at least 32 characters using a trusted password manager or local cryptographic generator.
2. Store it as a Worker secret named `CERDIKGO_MCP_BEARER_TOKEN`; never place it in source, chat, CI logs, or a client-side bundle.
3. Set the Preview-only variable `CERDIKGO_MCP_ENABLED=true`.
4. Keep Production disabled.
5. Revoke and rotate the token immediately if exposed.

The current branch does not configure either value and does not activate the endpoint.

## Gemini CLI client configuration

Use the Preview MCP URL only after the endpoint is activated and a token has been provisioned through the approved secret workflow. Configure Gemini CLI's remote MCP server entry with the HTTPS URL ending in `/mcp` and an Authorization Bearer header. Exact CLI configuration keys must be checked against the installed Gemini CLI version before use.

Do not use the Google account password as an MCP token. Google OAuth for Gemini CLI login and CerdikGo MCP bearer authentication are separate credentials.

## ChatGPT compatibility

The endpoint uses standard Streamable HTTP, but successful connection depends on the ChatGPT plan, client surface, and supported authentication flow. Static bearer authentication may not satisfy a ChatGPT connector that requires OAuth. Do not claim ChatGPT connectivity until an actual authenticated handshake and tool call are verified.

## Verification gates

1. Source review.
2. Dependency installation and unit tests.
3. Wrangler dry-run bundle validation.
4. Preview secret and flag setup — Human approval required.
5. Preview MCP initialize / tools/list / tools/call.
6. Gemini CLI authenticated test — Human performs sign-in / token setup.
7. ChatGPT connection test — subject to supported account capability and OAuth requirements.
8. Production release — separate Human approval.

## Current non-goals

No OpenAI API adapter, Gemini API adapter, model inference routing, autonomous agent execution, task persistence, OAuth authorization server, or cross-provider data transfer is enabled by this implementation.
