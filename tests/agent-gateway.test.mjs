import test from "node:test";
import assert from "node:assert/strict";
import {
  AGENT_REGISTRY,
  AGENT_REGISTRY_VERSION,
  listAgentCapabilities,
  buildAgentPlan,
} from "../agent-gateway.js";

test("registry exposes nine immutable, non-executing specialist definitions", () => {
  assert.equal(AGENT_REGISTRY.length, 9);
  assert.equal(AGENT_REGISTRY_VERSION, "1.0.0");
  assert.ok(Object.isFrozen(AGENT_REGISTRY));
  for (const agent of AGENT_REGISTRY) {
    assert.equal(agent.permission, "read_only");
    assert.equal(agent.execution, "not_enabled");
    assert.deepEqual(agent.tools, []);
    assert.ok(Object.isFrozen(agent));
  }
});

test("capability registry accurately declares plan-only execution", () => {
  const registry = listAgentCapabilities();
  assert.equal(registry.product, "CerdikGo");
  assert.equal(registry.execution_mode, "plan_only");
  assert.equal(registry.agents.length, 9);
  assert.equal(registry.providers.openai_api, "adapter_not_configured");
});

test("valid plan selects only requested registered agents", () => {
  const plan = buildAgentPlan({
    intent: "Review API security and regression coverage",
    agents: ["ATLAS-04", "ATLAS-09"],
  }, "request-test-001");
  assert.equal(plan.request_id, "request-test-001");
  assert.equal(plan.status, "planned");
  assert.deepEqual(plan.selected_agents, ["ATLAS-04", "ATLAS-09"]);
  assert.equal(plan.execution_mode, "plan_only");
  assert.equal(plan.external_calls_made, false);
  assert.equal(plan.database_writes, false);
  assert.deepEqual(plan.tools_invoked, []);
});

test("default plan uses the bounded research, engineering and QA roles", () => {
  const plan = buildAgentPlan({ intent: "Inspect a release candidate" }, "request-test-002");
  assert.deepEqual(plan.selected_agents, ["ATLAS-01", "ATLAS-02", "ATLAS-09"]);
});

test("controlled action is marked for approval and remains non-executing", () => {
  const plan = buildAgentPlan({
    intent: "Prepare a privileged change for human review",
    agents: ["ATLAS-05"],
    action_class: "controlled_action",
  }, "request-test-003");
  assert.equal(plan.status, "awaiting_human_approval");
  assert.equal(plan.approval_required, true);
  assert.equal(plan.permission, "read_only");
  assert.equal(plan.execution_mode, "plan_only");
  assert.equal(plan.external_calls_made, false);
  assert.equal(plan.database_writes, false);
});

const invalidCases = [
  ["non-object input", null, "INVALID_PLAN_INPUT"],
  ["empty intent", { intent: " " }, "INVALID_INTENT"],
  ["missing intent", {}, "INVALID_INTENT"],
  ["oversized intent", { intent: "x".repeat(4001) }, "INVALID_INTENT"],
  ["unknown field", { intent: "Review", unexpected: true }, "UNKNOWN_PLAN_FIELD"],
  ["unknown agent", { intent: "Review", agents: ["ATLAS-99"] }, "AGENT_NOT_ALLOWED"],
  ["duplicate agent", { intent: "Review", agents: ["ATLAS-01", "ATLAS-01"] }, "AGENT_NOT_ALLOWED"],
  ["empty selection", { intent: "Review", agents: [] }, "INVALID_AGENT_SELECTION"],
  ["too many agents", { intent: "Review", agents: ["ATLAS-01", "ATLAS-02", "ATLAS-03", "ATLAS-04"] }, "INVALID_AGENT_SELECTION"],
  ["invalid action class", { intent: "Review", action_class: "execute_now" }, "ACTION_CLASS_NOT_ALLOWED"],
];
for (const [label, input, expected] of invalidCases) {
  test(`rejects ${label}`, () => {
    assert.throws(() => buildAgentPlan(input, "request-invalid"), new RegExp(expected));
  });
}
