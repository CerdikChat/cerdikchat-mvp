# CerdikGo MCP Security Hardening

## Scope
This change hardens the existing stateless `POST /mcp` endpoint only. It does not enable MCP in any environment, configure or rotate secrets, deploy a Worker, add privileged tools, or activate agent execution.

## Controls implemented
- Retain the explicit `CERDIKGO_MCP_ENABLED=true` feature gate.
- Apply an IP-scoped rate limit before bearer-token validation, so failed authentication attempts are also throttled.
- Fail closed when the rate-limiter binding or client IP is unavailable.
- Apply a second rate-limit bucket after authentication using a SHA-256 fingerprint of the supplied credential; the raw bearer token is never used as a rate-limit key or logged.
- Compare bearer credentials using SHA-256 digests and a constant-time byte comparison.
- Accept the HTTP Bearer scheme case-insensitively.
- Restrict the configured stateless endpoint to POST.
- Preserve the minimum configured-secret length check.

## Tests
`tests/mcp-security.test.mjs` covers feature gating, missing rate limiter, pre-authentication IP throttling, missing client IP, rate-limit denial, missing/short secret, case-insensitive Bearer parsing, authenticated fingerprint bucketing, method restrictions, and the nine-agent plan-only invariant.

## Architecture invariants
- Exactly nine specialist IDs: ATLAS-01 through ATLAS-09.
- Optimus Prime remains coordinator, not an additional specialist.
- Agent Gateway remains `plan_only`.
- No MCP tool executes an agent, calls an external provider, or writes a database.

## Remaining hardening work
- Per-client credential provisioning, rotation and revocation lifecycle.
- Dedicated MCP protocol conformance tests against the selected SDK version and supported transport behavior.
- Request body/response size budgets and timeout policy.
- Structured audit events with privacy review and retention policy.
- Preview-only runtime verification after a separately approved deployment.

## Verification boundaries
Automated CI proves the tested source commit only. It does not prove a deployed Preview endpoint, client interoperability in production-like conditions, Android acceptance, or Production readiness.
