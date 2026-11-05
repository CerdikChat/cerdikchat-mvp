# ATLAS-9 Decision and Approval Register

Append-only decision record. An engineering candidate or CI pass is not an approval to merge, deploy, mutate data or activate a paid service.

## 2026-11-06 — Decisions and approval boundaries

### D-2026-11-06-01 — Main-based governance continuity

- Status: VERIFIED as a documentation action.
- Decision: establish a clean main-based register branch because the six required registers were not present on main at review time.
- Branch: `atlas9/cerdikgo-main-governance-registers-20261106`.
- Base SHA: `bc6545d6d19fd4b749d0b65fefba3d74775e0221`.
- Historical continuity: preserve PR #60 register history unchanged at branch `atlas9/cerdikgo-100-percent-scorecard`, head `85234b10d0c304d41c8e56b1a9d898742a8a7d49`. PR #60 remains Draft and is not merged.
- Rationale: PR #60's branch has a large diverged history relative to main; a clean main-based documentation candidate avoids automatic rebase or history rewriting.
- Approval: no merge approval implied.

### D-2026-11-06-02 — Authentication hardening candidate

- Status: VERIFIED in exact-head automated tests; approval to integrate NOT GRANTED by this automation.
- Candidate PR #92, commit `0a5fdea7f1c1c4091ff5fb674a1bac6bbb6ce8fb`.
- Tests 41/41; Auto Pilot 42081225451, regression 42081225364, Controlled Guardrails 42081225068 — SUCCESS.
- Decision: keep Draft; require human review and isolated Preview runtime test before integration.
- No OAuth credentials, D1 data, session store or Production settings changed.

### D-2026-11-06-03 — Observability redaction candidate

- Status: VERIFIED in source/configuration tests; live application NOT TESTED.
- Candidate PR #93, commit `276430ca45b91c6bfe418c712555427c83f35624`.
- Tests 37/37; Auto Pilot 42081620404, regression 42081620294, Controlled Guardrails 42081620327 — SUCCESS.
- Decision: keep Draft; require separate review of MCP Worker configuration and runtime evidence.
- No live Cloudflare setting changed.

### D-2026-11-06-04 — Canonical specialist identity

- Status: VERIFIED on candidate PR #89, commit `3fd1fc2d01a67eef8053ba64fcd9a9f59b1ed3f7`; integration NOT APPROVED.
- Decision: exactly nine profiles ATLAS-01…ATLAS-09. Optimus Prime coordinates and is not a tenth specialist.
- Do not claim nine independent AI models or autonomous execution.
- Gateway stays `plan_only`.

### D-2026-11-06-05 — Blocked workspace redesign

- Status: BLOCKED.
- PR #88 head `8bdef7d20431eb08c9b36f414ffa5221e2ddae90`, base `atlas9/cerdikgo-workspace-redesign` at `e72ce40170eab4282e1536ed1447467326e1c935`.
- Comparison: 1 ahead / 4 behind; mergeable=false; no exact-head workflow run returned.
- Decision: no rebase, design replacement or Preview operation until a clean diff and visual acceptance are available.

### D-2026-11-06-06 — Benchmark truthfulness

- Status: VERIFIED as reporting policy.
- 100% VERIFIED is a measurable acceptance target, not an assumed score.
- Capability results remain NOT MEASURED until full task samples and evaluator outputs exist.
- No claim that CerdikGo beats Gemini overall.
- The 35-task v0.1 manifest is a pilot smoke set only, not the complete competitive benchmark.

### Restricted operations — not authorized/performed

| Operation | Decision |
|---|---|
| Merge any PR | NOT AUTHORIZED |
| Deploy Production | NOT AUTHORIZED |
| Write/migrate remote D1 | NOT AUTHORIZED |
| Change OAuth or secrets | NOT AUTHORIZED |
| Change DNS | NOT AUTHORIZED |
| Activate billing or paid dependencies | NOT AUTHORIZED |
| Enable autonomous specialist execution | NOT AUTHORIZED |
| Start Human Verification before exact-head gate | PROHIBITED |
| Start Human Verification after CI alone | NOT IMPLIED; separate acceptance required |

### Approval criteria for future work

A future candidate must have:
1. An isolated branch from an identified base SHA.
2. Exact changed-file inventory and a concise changelog.
3. Reproducible tests and successful exact-head Auto Pilot readiness.
4. Security review for authentication, RBAC, logging, secrets, data and external calls.
5. Separate Preview, Android and Production gates.
6. Explicit human approval for any privileged action.

No approval is inferred from silence, CI success, a Draft PR, or an earlier unrelated decision.
