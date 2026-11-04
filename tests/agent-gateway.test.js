import test from "node:test";
import assert from "node:assert/strict";
import { AGENT_REGISTRY, listAgentCapabilities, buildAgentPlan } from "../integrations/agent-gateway.js";

test("registry exposes nine read-only specialists and no enabled execution tools", () => {
  const capabilities = listAgentCapabilities();
  assert.equal(capabilities.agents.length, 9);
  assert.equal(AGENT_REGISTRY.length, 9);
  assert.ok(AGENT_REGISTRY.every((agent) => agent.permission === "read_only"));
  assert.ok(AGENT_REGISTRY.every((agent) => agent.execution === "not_enabled"));
  assert.ok(AGENT_REGISTRY.every((agent) => agent.tools.length === 0));
});

test("default plan is bounded and non-executing", () => {
  const plan = buildAgentPlan({ intent: "Audit a proposed feature" }, "req-test-1");
  assert.deepEqual(plan.selected_agents, ["ATLAS-01", "ATLAS-02", "ATLAS-09"]);
  assert.equal(plan.status, "planned");
  assert.deepEqual(plan.tools_invoked, []);
  assert.equal(plan.external_calls_made, false);
  assert.equal(plan.database_writes, false);
});

test("controlled actions require human approval and remain non-executing", () => {
  const plan = buildAgentPlan({
    intent: "Prepare a controlled change",
    agents: ["ATLAS-04", "ATLAS-05", "ATLAS-09"],
    action_class: "controlled_action",
  }, "req-test-2");
  assert.equal(plan.status, "awaiting_human_approval");
  assert.equal(plan.approval_required, true);
  assert.equal(plan.permission, "read_only");
  assert.equal(plan.execution_mode, "plan_only");
  assert.equal(plan.external_calls_made, false);
});

test("unknown, duplicate, or excessive agents are rejected", () => {
  assert.throws(() => buildAgentPlan({ intent: "x", agents: ["ATLAS-10"] }, "r"), /AGENT_NOT_ALLOWED/);
  assert.throws(() => buildAgentPlan({ intent: "x", agents: ["ATLAS-01", "ATLAS-01"] }, "r"), /AGENT_NOT_ALLOWED/);
  assert.throws(() => buildAgentPlan({ intent: "x", agents: ["ATLAS-01", "ATLAS-02", "ATLAS-03", "ATLAS-04"] }, "r"), /INVALID_AGENT_SELECTION/);
});

test("invalid intent and action class fail closed", () => {
  assert.throws(() => buildAgentPlan({ intent: "" }, "r"), /INVALID_INTENT/);
  assert.throws(() => buildAgentPlan({ intent: "x".repeat(4001) }, "r"), /INVALID_INTENT/);
  assert.throws(() => buildAgentPlan({ intent: "x", action_class: "production_write" }, "r"), /ACTION_CLASS_NOT_ALLOWED/);
});
