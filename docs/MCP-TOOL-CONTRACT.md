# ChatGPT / MCP tool contract — design-only, not a live MCP server

This manifest is a contract for a future authenticated MCP adapter. It is intentionally not exposed as an endpoint until a supported ChatGPT connection method and authorization model are approved.

## Initial read-only tools

### cerdikgo.get_capabilities
- Purpose: return the public-safe ATLAS registry and provider availability labels.
- Authorization: authenticated user; read-only.
- Side effects: none.

### cerdikgo.create_task_plan
- Purpose: create a bounded, non-executing specialist plan.
- Input: `intent`, optional registered `agents` (maximum three), optional `action_class`.
- Authorization: authenticated user; read-only planning.
- Side effects: no provider calls, external requests, or database writes.

## Not available in the initial MCP surface
- Arbitrary web fetch / URL access.
- Shell, filesystem, SQL, database mutation.
- Admin, secrets, OAuth, DNS, billing, deployment.
- Email sending, external messaging, or third-party data transfer.
- Any tool that executes a controlled action.

## Security contract for later MCP exposure
- Use a supported remote MCP transport and strong authentication (OAuth or approved equivalent).
- Bind each tool call to authenticated user and tenant context.
- Server-side allowlist, schema validation, quotas, and audit correlation IDs.
- Treat tool results and retrieved content as untrusted.
- Controlled actions require a separate approval service that signs/binds the exact payload, user, expiry, and one-time execution nonce.
- No model-generated approval flag can authorize an action.
- Never store credentials in source, prompts, logs, or browser code.

**Current state:** design contract only. No MCP protocol endpoint or ChatGPT connection is active.
