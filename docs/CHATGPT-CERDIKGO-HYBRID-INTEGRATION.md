# ChatGPT ↔ CerdikGo Hybrid Integration

**Decision:** Hybrid Intelligence  
**Initial permission mode:** Controlled, with read-only execution baseline  
**Implementation branch:** `atlas9/cerdikgo-multi-agent-evolution`

## Target model

CerdikGo is the system of record and orchestration hub. ChatGPT is an external user interface and optional reasoning provider. Cloudflare Workers AI remains the existing inference provider. OpenAI API is a future provider adapter; it is not configured by this change.

The systems do not share ChatGPT's private conversation history or consumer subscription memory automatically. Only explicitly authorized data is exchanged through documented APIs.

## Integration layers

1. **CerdikGo Worker API:** authenticated application boundary.
2. **Agent registry:** versioned ATLAS-01…ATLAS-09 role metadata and permission scopes.
3. **Task planner:** validates selected agents and produces a request-correlated plan.
4. **MCP adapter (future):** expose narrowly scoped CerdikGo tools to ChatGPT through a supported remote MCP transport, with OAuth/authorization designed and reviewed separately.
5. **OpenAI provider adapter (future):** server-to-server Responses API integration, configured through a secret only after separate approval.
6. **Workers AI adapter:** retain existing AI binding and fallback policy.

## Current endpoints in the feature branch

Both endpoints are disabled unless the environment flag `CERDIKGO_AGENT_GATEWAY_ENABLED=true` is explicitly configured.

### GET /api/agents/registry

- Requires an authenticated CerdikGo session.
- Returns the nine specialist descriptions, read-only permission labels, and provider integration status.
- Does not invoke a model or external service.

### POST /api/agents/plan

- Requires an authenticated CerdikGo session.
- Requires same-origin request and JSON content type.
- Uses the existing Worker rate limiter.
- Limits request body to 8 KiB, intent to 4,000 characters, and selected agents to three.
- Accepts only registered agent IDs.
- Supports `read_only` and `controlled_action` plan classes.
- `controlled_action` returns `awaiting_human_approval`; it does not execute the action.
- No tool, model, provider, external network, or database write is invoked.

Example request:

```json
{
  "intent": "Review the proposed CerdikGo integration",
  "agents": ["ATLAS-04", "ATLAS-05", "ATLAS-09"],
  "action_class": "controlled_action"
}
```

## ChatGPT connection: intended MCP tool surface

Start with read-only tools:
- `cerdikgo.get_capabilities`
- `cerdikgo.get_task_status` (only after task storage exists)
- `cerdikgo.search_knowledge` (only over approved, access-controlled sources)
- `cerdikgo.create_task_plan` (plan creation only)

Controlled tools can be added later, each with server-side authorization and an approval record bound to the exact action payload, user, expiry, and one-time execution nonce. Never trust an approval boolean supplied by the model or browser.

## Security requirements before exposing MCP

- Select supported ChatGPT plan/workspace and remote MCP authentication mode.
- Use OAuth or another supported strong identity mechanism; do not place long-lived API keys in prompts or frontend code.
- Enforce user identity, tenant scope, RBAC, rate limits, input schemas, and tool allowlists at the server.
- Keep MCP tools read-only until security review and human approval workflow are implemented.
- Protect against prompt injection in retrieved documents and tool results.
- Do not expose arbitrary URL fetch, shell, SQL, filesystem, secrets, admin, or deployment tools.
- Log request IDs and sanitized audit events, never tokens, cookies, or raw sensitive content.
- Validate exact payload hash at approval and re-check authorization immediately before execution.

## Provider and cost policy

- Existing Workers AI remains available through the existing binding.
- OpenAI API integration is not configured by this feature branch. A separate server-side adapter, quota controls, model allowlist, timeout, fallback, and cost guardrails are required.
- ChatGPT subscription does not automatically include API credits; ChatGPT and API billing are separate.
- Do not enable billing or paid services as part of this work.

## Rollout gates

1. Unit tests and CI on exact feature-branch SHA.
2. Security review of session enforcement, CSRF/origin controls, rate limits, and schemas.
3. Preview environment configuration review; no remote D1 writes required for the current plan-only scaffold.
4. Manual authenticated Preview verification after separate approval to configure the feature flag.
5. MCP server implementation and authentication review.
6. OpenAI provider adapter review and explicit secret/billing authorization if required.
7. Human acceptance before any merge or deployment.

## Explicitly out of scope

Production deployment, Production traffic cutover, remote D1 migrations/writes, secrets, OAuth client/origin changes, DNS, billing, external beta invitations, and public release.
