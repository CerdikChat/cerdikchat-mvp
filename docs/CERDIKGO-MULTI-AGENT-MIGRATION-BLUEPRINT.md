# CerdikGo Multi-Agent Evolution — Migration Blueprint

**Status:** Feature-branch planning baseline; not deployed  
**Product:** CerdikGo  
**Core:** CerdikChat / Cloudflare Workers  
**Coordinator concept:** Optimus Prime  
**Specialists:** ATLAS-01 through ATLAS-09

## 1. Objective

Evolve the existing CerdikGo workspace from a single-model request flow into a governed multi-agent orchestration system while preserving existing authentication, chat behavior, mobile UX, themes, language support, request IDs, and auditability.

This migration ports role instructions, task contracts, orchestration logic, tools, and durable workflow state. It does not move or clone ChatGPT models, identities, or this conversation into Cloudflare.

## 2. Nine specialist domains

| ID | Specialist | Responsibility |
|---|---|---|
| ATLAS-01 | Research Intelligence | Source discovery, evidence extraction, citations, research synthesis |
| ATLAS-02 | Engineering | Application code, integrations, debugging, implementation plans |
| ATLAS-03 | AI & Prompt Intelligence | Model routing, prompt registry, evaluation, context assembly |
| ATLAS-04 | Cybersecurity | Threat modeling, input/output controls, SSRF and secret-safety review |
| ATLAS-05 | Governance & Compliance | Policy checks, approvals, audit requirements, data governance |
| ATLAS-06 | Data Intelligence | Data validation, analytics, anomaly detection, metrics |
| ATLAS-07 | Business Strategy | Economics, commercial strategy, market and operating models |
| ATLAS-08 | Product & UX | User journeys, accessibility, mobile UX, product requirements |
| ATLAS-09 | Quality Assurance | Test planning, regression, evidence review, release gates |

Optimus Prime is the central orchestrator, not a tenth specialist.

## 3. Proposed runtime architecture

1. **API boundary:** existing authenticated Worker routes remain the public entry point.
2. **Orchestrator:** validates request, creates correlation/request ID, classifies task, selects permitted specialists, and sets a bounded execution plan.
3. **Agent registry:** versioned specialist definitions with role prompt, input/output schema, allowed tools, timeout, retry policy, and permission scope.
4. **Execution:** use Cloudflare Agents / Durable Objects or Workflows only after platform compatibility, quota, and cost review. Do not assume they are currently bound or enabled.
5. **Model adapter:** begin with the existing Workers AI binding and configured model; model/provider selection is explicit, bounded, and observable.
6. **State:** persist only the minimum task state needed. Use D1 for durable records only after schema review and separately approved migrations; do not store secrets or unnecessary personal data.
7. **Approval gate:** privileged actions, external data transfer, database writes, production changes, and consequential actions require explicit human approval.
8. **Response composer:** synthesizes specialist outputs, preserves source provenance, marks uncertainty, and returns a single user-facing answer.

## 4. Agent execution contract

Every specialist task must include:
- `request_id`, `task_id`, `agent_id`, `agent_version`
- user intent and bounded context
- allowed tool list and permission scope
- deadline / token budget / retry limit
- structured result: `status`, `summary`, `evidence`, `risks`, `artifacts`, `needs_human_approval`

Statuses: `queued`, `running`, `completed`, `failed`, `blocked`, `awaiting_approval`.

Treat model output and retrieved content as untrusted input. Validate all tool arguments server-side. Do not allow an agent to expand its own permissions or invoke tools outside its registry contract.

## 5. Security and governance requirements

- Preserve existing authentication and session enforcement.
- Enforce authorization on the server for every agent and tool; UI visibility is not authorization.
- Deny by default; per-agent least privilege.
- Apply request size, output size, concurrency, timeout, and rate limits.
- Prevent prompt injection from retrieved documents/web content from changing system policy or tool permissions.
- For web research, use an approved provider and a hardened fetch adapter with SSRF protections; no arbitrary URL fetch.
- Redact credentials, cookies, tokens, and sensitive payloads from logs.
- Record audit events for task creation, agent dispatch, tool invocation, approval decisions, failures, and completion.
- Human approval must be bound to the exact action payload and expire; no approval-by-UI-state alone.
- No autonomous production deployment, remote D1 mutation, OAuth/secrets change, DNS change, billing activation, or external data transfer.

## 6. Phased implementation

### Phase 0 — Baseline and contracts
- Preserve the system-unification branch as the integration baseline.
- Inventory routes, auth, AI binding, D1 schemas, migrations, tests, and current feature branches.
- Define agent registry and JSON schemas; add unit tests for validation and permission denial.
- No remote writes or deployment.

### Phase 1 — Orchestrator foundation
- Add a feature-flagged orchestrator behind the existing authenticated API.
- Implement one coordinator plus three pilot specialists: Research (01), Engineering (02), QA (09).
- Use bounded sequential execution initially; do not introduce parallel execution until concurrency, ordering, cancellation, and audit behavior are tested.
- Preserve the single-agent chat fallback.

### Phase 2 — Nine-agent registry
- Add remaining specialist definitions one by one.
- Require tests for schema validity, tool allowlists, timeout, retry, failure isolation, and prompt-injection resistance.
- Add observability and deterministic task replay using sanitized fixtures.

### Phase 3 — Durable workflows
- Evaluate Workflows / Durable Objects for long-running jobs and checkpointing.
- Add persistence only with reviewed schema and explicit Preview migration approval.
- Verify idempotency, duplicate submission handling, retention, and recovery.

### Phase 4 — Multimodal and external capabilities
- Integrate voice, document scanning, and live web research only after each provider/service and security boundary is verified.
- Hybrid radio remains simulation-only until physical hardware, protocol, encryption, range, and field tests exist.

## 7. Acceptance gates

- Existing chat and authentication regression tests pass.
- Feature flag off preserves current behavior.
- Feature flag on dispatches only registered agents.
- Each specialist rejects unauthorized tool calls.
- Prompt injection fixtures cannot escalate permissions.
- Every request has traceable request/task IDs and sanitized audit events.
- Partial failure and timeout do not corrupt user-visible state.
- Human approval is required for protected actions.
- No unapproved Production or remote database changes.
- Exact commit SHA, CI result, and Preview runtime evidence are recorded separately.

## 8. Known constraints and unresolved items

- The target URL supplied by the product owner is not yet verified against the connected Cloudflare account's Worker inventory. The earlier read-only lookup of the assumed script name returned Worker-not-found; this may indicate a different account/script mapping and must be reconciled before deployment.
- The current inspected Worker source uses one Workers AI model. Independent agents are not yet established by that fact.
- Preview D1 and Production D1 are configured as separate resources in the reviewed branch, but runtime binding parity must be checked before any Preview write.
- No billing activation is in scope. Prefer existing free quotas and degrade gracefully when unavailable.
- This blueprint is not evidence of implementation, deployment, or runtime operation.

## 9. Protected operations

This feature branch may contain source and tests. Separate explicit approval remains required for:
- merge to integration/default branch;
- Production deployment or traffic cutover;
- any remote D1 migration or data write, including Preview;
- OAuth client/origin changes or secrets creation/rotation;
- DNS/domain changes;
- paid provider/service activation or billing;
- external beta invitations or public release.
