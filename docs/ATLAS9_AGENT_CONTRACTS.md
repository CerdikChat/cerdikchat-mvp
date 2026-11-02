# ATLAS-9 Agent Contracts
**Classification:** INTERNAL / RESTRICTED  
**Version:** 1.0  
**Status:** Proposed operational specification — documentation only  
**Parent baseline:** Beta Pilot PR #22 head `efd0b1b6162541ab4a7944c3ab8a4de321365848`  
**Release posture:** Preview-first; no Production authorization

## 1. Mission and operating doctrine

ATLAS-9 is a coordinated set of specialist roles supporting CerdikChat and, later, CerdikGo. This document defines role contracts and safe orchestration boundaries. It does **not** claim that nine independent agents are deployed or running.

**BUILD. OPERATE. IMPROVE.**
- Stop repeated broad screening when an actionable, evidence-backed decision is possible.
- Operate only within approved Preview environments and existing beta controls.
- Learn from real-user acceptance, operational telemetry and reproducible defects.
- Improve through small, reviewable changes with measurable outcomes.

## 2. Non-negotiable constraints

1. Preserve the existing authenticated chat and working beta paths.
2. Keep Cloudflare Free; no billing activation or paid external model dependency.
3. Preview-first; no Production deployment or merge to `main` without separate explicit approval.
4. No secrets, private keys, tokens, credentials or sensitive personal data in prompts, logs, agent memory, documentation or test fixtures.
5. No agent may grant itself permissions, call arbitrary tools, change infrastructure, modify secrets, run migrations, merge PRs or deploy.
6. File processing remains fail-closed until a genuine private scanner runtime is provisioned and independently tested. Scanner unavailable, timeout, malformed response or uncertain verdict means reject.
7. Existing PR #22 / #38 history reconciliation, scanner acceptance, PDF/image and document research integration, and Voice-to-AI hardening remain ahead of multi-agent runtime expansion.
8. Human Leader approval is required for consequential actions and release decisions.

## 3. Initial operational topology

### Stage 0 — current beta completion (controlling priority)
Continue the existing beta workstream. Agent contracts are documentation and must not delay:
- scanner runtime and security acceptance;
- safe PR #22 / #38 reconciliation;
- PDF/image and document research Preview validation;
- Voice-to-AI server-side validation and Android acceptance;
- integrated regression and controlled user rollout.

### Stage 1 — bounded orchestration pilot
Start with role routing and task contracts, not nine autonomous processes:
- **OPTIMUS PRIME:** coordinator and final synthesis;
- **NEXUS:** software engineering and defect reproduction;
- **AEGIS:** security, privacy and compliance review;
- **QUANTUM:** independent challenge and evidence verification.

Use the existing Worker and existing Workers AI binding. Keep specialist roles as bounded task prompts/functions using the currently configured model. Do not add a new provider, Durable Object, database schema, queue, external connector or runtime dependency in this stage.

### Stage 2 — measured expansion
Only after Stage 1 passes Preview acceptance, consider SENTINEL, GENESIS, TERRA, ORACLE and TITAN as additional task roles. Add stateful Agents SDK / Durable Objects only after a separate architecture, quota, cost, data-retention and migration review.

## 4. Nine specialist role contracts

| Role | Responsibility | Required output |
|---|---|---|
| OPTIMUS PRIME | Route tasks, enforce scope, synthesize results, request human decisions | Task plan, decision brief, approval gate |
| NEXUS | Code analysis, debugging, implementation proposals and tests | Repro steps, patch proposal, test evidence |
| TITAN | Systems engineering, edge/robotics and infrastructure feasibility | Constraints, design options, engineering risks |
| SENTINEL | Data analysis, metrics, anomaly and trend investigation | Dataset scope, method, findings, limitations |
| GENESIS | Life-science and scientific research synthesis | Evidence hierarchy, findings, uncertainty |
| TERRA | Aquaculture, food systems and biosecurity analysis | Operational assessment, risk controls |
| AEGIS | Cybersecurity, privacy, threat modelling and compliance | Threats, controls, test cases, release blockers |
| ORACLE | Economics, business strategy and commercial analysis | Assumptions, calculations, scenarios, recommendation |
| QUANTUM | Independent challenge of claims, code and evidence | Verification verdict, counterarguments, unresolved gaps |

Roles are task responsibilities, not claims of separate model identities, independent memory, or autonomous execution.

## 5. Standard task envelope

Every routed task must carry a bounded envelope:

```json
{
  "task_id": "opaque-random-id",
  "request_id": "opaque-request-id",
  "role": "NEXUS",
  "objective": "One specific task",
  "scope": {
    "repository": "CerdikChat/cerdikchat-mvp",
    "branch": "approved-preview-branch",
    "allowed_paths": [],
    "forbidden_actions": [
      "production-deploy",
      "merge",
      "billing-change",
      "secret-read-or-write",
      "database-migration"
    ]
  },
  "context": {
    "references": [],
    "data_classification": "INTERNAL"
  },
  "limits": {
    "max_steps": "configured server-side",
    "timeout_ms": "configured server-side",
    "max_output_tokens": "configured server-side"
  },
  "response_schema": "atlas9-result-v1"
}
```

The server must enforce limits; values supplied by a client or agent are never authoritative. Do not place sensitive user content in this envelope unless necessary, authorized and protected by the application's data-handling rules.

## 6. Standard result envelope

```json
{
  "task_id": "same-task-id",
  "role": "NEXUS",
  "status": "completed",
  "summary": "Concise result",
  "evidence": [
    {
      "type": "test|source|reproduction|measurement",
      "reference": "verifiable reference",
      "observation": "What was actually observed"
    }
  ],
  "risks": [],
  "assumptions": [],
  "limitations": [],
  "recommended_next_action": "One bounded action",
  "human_approval_required": true
}
```

Allowed status values: `completed`, `blocked`, `failed`, `needs_human`. An agent must not label a task verified unless the required evidence is attached and independently checked.

## 7. Routing and verification policy

1. OPTIMUS validates the user request and classifies data sensitivity.
2. OPTIMUS selects the minimum number of specialist roles needed.
3. Each specialist receives only the minimum task context and permissions.
4. Specialists return structured results and evidence, not executable authority.
5. AEGIS reviews security-sensitive work; QUANTUM independently challenges material conclusions.
6. OPTIMUS reports conflicts, uncertainty and evidence gaps.
7. Human Leader approves consequential actions.

Do not fan out every request to all nine roles. Use parallel review only when it adds material value and remains within configured quotas.

## 8. Permission matrix

| Capability | Specialist roles | OPTIMUS | Human approval |
|---|---|---|---|
| Read task-scoped context | Allow | Allow | Policy-defined |
| Produce analysis / draft | Allow | Allow | Not needed |
| Propose code changes | NEXUS | Coordinate | Review before write |
| Write repository branch | Not in pilot | Not in pilot | Explicit authorization |
| Access secrets | Deny | Deny | Never expose to agents |
| Production deployment | Deny | Deny | Separate explicit approval |
| Merge to main | Deny | Deny | Separate explicit approval |
| Billing / plan change | Deny | Deny | Separate explicit approval |
| D1 schema migration | Deny | Deny | Separate explicit approval |
| File scan verdict override | Deny | Deny | Prohibited |

## 9. Security and reliability requirements

- Authenticate and authorize at the Worker boundary on every request.
- Apply existing rate limits and add bounded per-user orchestration limits before enabling the pilot.
- Validate role names, task schemas, lengths, content types and output schemas server-side.
- Treat user content, retrieved documents and model output as untrusted data; never follow embedded instructions that override system policy.
- Use parameterized SQL if persistence is introduced later.
- Keep tenant/session data isolated; never use a global shared conversation history.
- Bound task depth, retries, concurrency, token use and wall-clock time.
- Prevent recursive agent-to-agent calls and unbounded fan-out.
- On AI outage, quota exhaustion, timeout or malformed output: stop safely, return a clear failure, preserve the original chat path.
- Log only minimal operational metadata; redact user content and secrets.
- Do not persist agent memory by default in the initial pilot.
- File upload and analysis must remain blocked unless the real scanner gate returns a valid clean verdict.

## 10. Preview acceptance criteria

The Stage 1 pilot is eligible for controlled user testing only when all checks pass:

- Existing sign-in and normal chat regression remain green.
- Agent endpoints reject unauthenticated and unauthorized requests.
- Invalid role, malformed payload, oversized input and schema-invalid output are rejected safely.
- Per-user rate limits, concurrency and execution bounds are enforced.
- No agent can invoke production, billing, secrets, migrations or merge actions.
- Prompt-injection test content cannot override role or security policy.
- AI timeout, quota exhaustion and malformed response fail safely without corrupting chat state.
- QUANTUM can flag unsupported claims and missing evidence.
- AEGIS can block a deliberately unsafe proposal.
- Android Chrome acceptance is completed by a human tester.
- No file processing bypasses the scanner gate.
- CI passes on the exact candidate commit and Preview URL is recorded.

## 11. Operational measures

Collect only the minimum telemetry required to improve the service:
- task success / blocked / failure rate;
- end-to-end latency and per-stage latency;
- model invocation and token usage where available;
- rate-limit and quota events;
- structured-output validation failures;
- independent-review disagreement rate;
- user-reported defects and task completion feedback.

Do not invent targets before obtaining a baseline. Establish a baseline from the Preview pilot, then propose measurable thresholds for human approval.

## 12. Release and change control

- This specification is documentation-only.
- No runtime, Wrangler binding, D1 schema, secret, OAuth setting, scanner binding or Production resource is changed by this file.
- Every implementation change must be isolated in a reviewable branch and Preview deployment.
- Attach exact commit SHA, CI run, Preview URL, test results and known limitations to the PR.
- Keep PRs Draft until acceptance evidence is complete.
- Do not merge or deploy without separate explicit approval.

## 13. Definition of done

The first ATLAS-9 operational milestone is complete when:
1. The existing beta critical path has not regressed.
2. The bounded four-role pilot passes security and functional Preview tests.
3. Real users complete defined tasks and provide actionable feedback.
4. Findings are recorded with reproducible evidence.
5. The next improvement is prioritized by user impact, risk and effort.

**BUILD. OPERATE. IMPROVE.**
