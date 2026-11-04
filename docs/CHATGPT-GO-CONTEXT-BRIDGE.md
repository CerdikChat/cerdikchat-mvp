# CerdikGo ChatGPT Go Context Bridge (Preview)

## Purpose

Manual, user-initiated context exchange between ChatGPT Go and CerdikGo. ChatGPT Go remains the selected plan. This bridge does not connect ChatGPT directly to CerdikGo MCP, use a ChatGPT API key, create shared memory, or require a paid upgrade.

## User flow

1. Open `/bridge.html` from the CerdikGo workspace.
2. Paste an instruction or analysis from ChatGPT Go, choose up to three ATLAS roles, and create a `cerdikgo.task.v1` JSON envelope.
3. Copy, share, or download the envelope. The user explicitly chooses when to transfer it.
4. Import the JSON envelope into CerdikGo. Validation rejects unknown fields, invalid IDs, unsupported sources, invalid/duplicate agents, and invalid action classes.
5. A validated task enters a browser-session inbox. It is not persisted to D1.
6. The user may request a plan from `POST /api/agents/plan`. The Preview endpoint must be enabled and the user must have a valid CerdikGo session.

## Governance contract

- Only `read_only` and `controlled_action` task classes are accepted.
- Selected agents must be ATLAS-01 through ATLAS-09; maximum three per task.
- A plan response is accepted only when `execution_mode=plan_only`, `permission=read_only`, `external_calls_made=false`, `database_writes=false`, and `tools_invoked=[]`.
- No agent execution, provider calls, D1 writes, Production access, or deployment is implemented by this bridge.
- Controlled actions remain `awaiting_human_approval`; this UI does not implement an approval executor.
- Inbox uses `sessionStorage` and is temporary to the browser session. Export is user initiated.
- Never put passwords, API keys, bearer tokens, or sensitive customer data in task envelopes.

## Preview verification

Run `npm test` on Node.js 22, then verify on an authenticated Preview session:
- Workspace header link opens `/bridge.html` on mobile and desktop.
- Create, copy, share, and download a task JSON.
- Import valid JSON and reject invalid schema, unknown fields, invalid agent, oversized intent, and duplicate task ID.
- With the agent gateway disabled, plan request fails closed and displays a useful message.
- With the Preview gateway enabled and a valid session, plan response satisfies the governance contract.
- Confirm no Production deployment, D1 mutation, or billing action occurs.

CI green is not runtime acceptance. Android Human Verification remains required.
