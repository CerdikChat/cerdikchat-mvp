import test from "node:test";
import assert from "node:assert/strict";
import { executeTool, handleMcpRequest } from "../mcp-preview-worker.js";

const token = "test-only-preview-token-0123456789abcdef";

function request(body, headers = {}, method = "POST") {
  return new Request("https://preview.example/mcp", {
    method,
    headers: { "content-type": "application/json", ...headers },
    body: method === "POST" ? JSON.stringify(body) : undefined,
  });
}
const env = { CERDIKGO_MCP_ENABLED: "true", CERDIKGO_MCP_BEARER_TOKEN: token };
const auth = { authorization: `Bearer ${token}` };

test("disabled MCP endpoint is closed", async () => {
  const response = await handleMcpRequest(request({ jsonrpc: "2.0", id: 1, method: "ping" }), { ...env, CERDIKGO_MCP_ENABLED: "false" });
  assert.equal(response.status, 404);
});

test("rejects missing or invalid bearer token", async () => {
  const response = await handleMcpRequest(request({ jsonrpc: "2.0", id: 1, method: "ping" }), env);
  assert.equal(response.status, 401);
});

test("initialize returns Streamable HTTP MCP metadata", async () => {
  const response = await handleMcpRequest(request({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "test", version: "1" } } }, auth), env);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.result.serverInfo.name, "cerdikgo-atlas9");
  assert.ok(body.result.capabilities.tools);
});

test("tools/list exposes exactly three read-only planning tools", async () => {
  const response = await handleMcpRequest(request({ jsonrpc: "2.0", id: 2, method: "tools/list" }, auth), env);
  const body = await response.json();
  assert.deepEqual(body.result.tools.map((tool) => tool.name), ["cerdikgo.get_capabilities", "cerdikgo.get_agent_registry", "cerdikgo.create_task_plan"]);
});

test("registry contains exactly nine ATLAS agents", () => {
  const result = executeTool("cerdikgo.get_agent_registry");
  assert.equal(result.agents.length, 9);
  assert.deepEqual(result.agents.map((agent) => agent.id), Array.from({ length: 9 }, (_, i) => `ATLAS-${String(i + 1).padStart(2, "0")}`));
});

test("create_task_plan does not execute actions", () => {
  const result = executeTool("cerdikgo.create_task_plan", { intent: "Audit MCP connectivity", action_class: "controlled_action" });
  assert.equal(result.status, "awaiting_human_approval");
  assert.equal(result.execution_mode, "plan_only");
  assert.deepEqual(result.tools_invoked, []);
  assert.equal(result.external_calls_made, false);
  assert.equal(result.database_writes, false);
});

test("rejects unsupported tool names", () => {
  assert.throws(() => executeTool("cerdikgo.run_shell", {}), /UNKNOWN_TOOL/);
});
