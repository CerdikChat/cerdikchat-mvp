# ATLAS-9 Phase 1 — Security and Reliability Setup

Status: Preparation in progress  
Target environment: Cloudflare Workers Free-first  
Production changes: Not authorized by this document; require a reviewed release and explicit deployment approval.

## Verified baseline

- Worker: `cerdikchat-mvp`
- Runtime: Cloudflare Workers with Workers AI binding
- Model declared by deployed Worker source: `@cf/google/gemma-4-26b-a4b-it`
- Rate limit binding: `CHAT_RATE_LIMITER`, configured at 20 requests per 60 seconds
- D1 binding: `DB`, database `cerdikchat-db`
- Observability: enabled; invocation logs enabled and persisted; tracing disabled
- D1 currently contains `users` and `usage_daily` application tables; no conversation/message table was found.
- The deployed Worker source does not reference `env.DB`; persistent chat storage is not implemented.
- The Worker implements optional Cloudflare Access identity enforcement through `PILOT_ACCESS_REQUIRED=true`.
- Live production enforcement of that flag and Access coverage across all hostnames remain unverified.
- The README still documents a previous Gemini implementation and must be reconciled with the deployed Workers AI implementation.

## Workstream A — Access and identity

1. Inventory every production hostname and route, including the `workers.dev` hostname and any custom domains.
2. Verify a Cloudflare Access application/policy protects all production entry points.
3. Verify the allow policy uses the explicitly approved pilot identities.
4. Test approved, unapproved, and unauthenticated browser sessions.
5. Only after steps 1–4 pass, schedule activation of `PILOT_ACCESS_REQUIRED=true`.
6. Verify an approved identity is available through `ctx.access.getIdentity()` and that rate limiting keys by normalized identity.
7. Maintain a documented break-glass administrator route.

Acceptance: approved pilot user can use the application; unapproved and unauthenticated users are denied at the Access boundary; direct API bypass paths are closed.

## Workstream B — Worker reliability

1. Run the existing Node regression suite.
2. Add or verify tests for request size, history bounds, invalid tool calls, rate-limit backend failure, AI quota/model errors, and safe error responses.
3. Run one controlled end-to-end chat request only after confirming free-tier/quota impact.
4. Record status, latency, model identifier, and sanitized error code; never log prompt contents, secrets, or personal data.

Acceptance: automated tests pass and a controlled end-to-end request returns the documented API response shape.

## Workstream C — D1 readiness

1. Review existing `users` and `usage_daily` schema and ownership model.
2. Design conversation and message tables with explicit user ownership, indexes, timestamps, retention, and deletion semantics.
3. Add migrations and repository-layer tests on a development branch.
4. Do not write to production D1 until migration and rollback plans are reviewed and separately approved.

Acceptance: migration is repeatable in a non-production database; cross-user reads/writes are prevented; deletion and retention behavior are tested.

## Workstream D — Documentation and release hygiene

1. Update README to reflect Workers AI, current model identifier, actual bindings, and actual limitations.
2. Remove stale Gemini setup instructions unless Gemini is deliberately reintroduced.
3. Document deployment, rollback, Access activation, privacy, and quota monitoring.
4. Require CI regression tests and review before merge.

## Explicit non-goals for this phase

- No production deployment or traffic shifting.
- No secret value retrieval, rotation, or deletion.
- No paid plan, billing activation, or paid external API.
- No production database writes or migrations.
- No claim that PDF, image, voice, external research, or persistent history is available until implemented and tested.

## Release gates

- Security gate: Access policy coverage and identity tests pass.
- Reliability gate: regression suite and controlled E2E pass.
- Data gate: migration, ownership isolation, retention, and deletion are validated outside production.
- Documentation gate: README and operational runbook match the deployed architecture.
- Change gate: reviewed PR, explicit production deployment approval, and rollback plan.
