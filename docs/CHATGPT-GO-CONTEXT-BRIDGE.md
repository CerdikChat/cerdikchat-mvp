# CerdikGo ChatGPT Go Context Bridge (Preview)

## Purpose
Manual, user-initiated context exchange between ChatGPT Go and CerdikGo. This does not connect ChatGPT directly to CerdikGo, use Custom MCP, or require a ChatGPT API key.

## User flow
1. Open `/bridge.html` from the CerdikGo workspace.
2. Paste an instruction/analysis from ChatGPT Go, choose up to three ATLAS roles, and create a `cerdikgo.task.v1` JSON envelope.
3. Copy, share, or download the envelope. The user explicitly chooses when to transfer it to another app.
4. Import a JSON envelope or paste its content. Validation rejects unknown fields, invalid IDs, unsupported sources, invalid agents, duplicate agents, and invalid action classes.
5. A validated task enters a browser-session inbox. It is not persisted to D1.
6. The user can request a plan from `POST /api/agents/plan`. The endpoint must already be enabled for the Preview environment and the user must have a valid CerdikGo session.

## Governance contract
- Only `read_only` and `controlled_action` task classes are accepted.
- All selected agents must be from ATLAS-01 through ATLAS-09; maximum three per task.
- Plan response is accepted only when `execution_mode=plan_only`, `permission=read_only`, `external_calls_made=false`, `database_writes=false`, and `tools_invoked=[]`.
- No tool execution, provider calls, D1 writes, Production access, or deployment is implemented by this bridge.
- Controlled actions remain `awaiting_human_approval`; this UI does not implement an approval executor.
- Inbox uses `sessionStorage` and is temporary to the browser tab/session. Export is user initiated.
- Do not put passwords, API keys, bearer tokens, or sensitive customer data in task envelopes.

## Preview verification
Run `npm test` on Node.js 22. Then verify on an authenticated Preview session:
- Workspace header link opens `/bridge.html` on mobile and desktop.
- Create -> copy/share/download JSON.
- Import valid JSON and reject invalid schema, unknown fields, invalid agent, oversized intent, and duplicate task ID.
- With agent gateway disabled, plan request fails closed and shows a useful message.
- With the Preview gateway enabled and a valid session, plan response satisfies the governance contract.
- Confirm no Production deployment, D1 mutation, or billing action is performed.

CI green is not runtime acceptance. Android Human Verification remains required.
