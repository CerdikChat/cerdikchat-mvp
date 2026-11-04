/**
 * CerdikGo Hybrid Intelligence Gateway — safe Phase 1 scaffold.
 *
 * This module describes specialist capabilities and produces bounded,
 * non-executing task plans. It deliberately has no provider calls,
 * database writes, external fetches, or privileged tools.
 */

export const AGENT_REGISTRY_VERSION = "1.0.0";

export const AGENT_REGISTRY = Object.freeze([
  { id: "ATLAS-01", name: "Research Intelligence", purpose: "Evidence discovery, source review, and research synthesis.", tools: [] },
  { id: "ATLAS-02", name: "Engineering", purpose: "Code review, debugging, and implementation planning.", tools: [] },
  { id: "ATLAS-03", name: "AI & Prompt Intelligence", purpose: "Prompt design, model evaluation, and provider-routing design.", tools: [] },
  { id: "ATLAS-04", name: "Cybersecurity", purpose: "Threat modeling, security review, and abuse-case analysis.", tools: [] },
  { id: "ATLAS-05", name: "Governance & Compliance", purpose: "Policy, approvals, auditability, and compliance review.", tools: [] },
  { id: "ATLAS-06", name: "Data Intelligence", purpose: "Data quality, metrics, and analytical validation.", tools: [] },
  { id: "ATLAS-07", name: "Business Strategy", purpose: "Commercial, economic, and operating-model analysis.", tools: [] },
  { id: "ATLAS-08", name: "Product & UX", purpose: "Product requirements, usability, and accessibility review.", tools: [] },
  { id: "ATLAS-09", name: "Quality Assurance", purpose: "Test design, regression planning, and evidence assessment.", tools: [] },
].map((agent) => Object.freeze({
  ...agent,
  permission: "read_only",
  execution: "not_enabled",
})));

const AGENT_IDS = new Set(AGENT_REGISTRY.map((agent) => agent.id));
const MAX_INTENT_CHARS = 4000;
const MAX_AGENTS_PER_PLAN = 3;

export function listAgentCapabilities() {
  return {
    product: "CerdikGo",
    architecture: "hybrid",
    coordinator: "Optimus Prime",
    registry_version: AGENT_REGISTRY_VERSION,
    execution_mode: "plan_only",
    agents: AGENT_REGISTRY,
    providers: {
      cloudflare_workers_ai: "existing_provider_not_invoked_by_this_gateway",
      openai_api: "adapter_not_configured",
      mcp_preview_worker: "separate_stateless_plan_only_endpoint",
    },
  };
}

export function buildAgentPlan(input, requestId) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("INVALID_PLAN_INPUT");
  }

  const allowedKeys = new Set(["intent", "agents", "action_class"]);
  if (Object.keys(input).some((key) => !allowedKeys.has(key))) {
    throw new Error("UNKNOWN_PLAN_FIELD");
  }

  const intent = typeof input.intent === "string" ? input.intent.trim() : "";
  if (!intent || intent.length > MAX_INTENT_CHARS) {
    throw new Error("INVALID_INTENT");
  }

  const requested = input.agents === undefined ? ["ATLAS-01", "ATLAS-02", "ATLAS-09"] : input.agents;
  if (!Array.isArray(requested) || requested.length < 1 || requested.length > MAX_AGENTS_PER_PLAN) {
    throw new Error("INVALID_AGENT_SELECTION");
  }

  const unique = [...new Set(requested)];
  if (unique.length !== requested.length || unique.some((id) => typeof id !== "string" || !AGENT_IDS.has(id))) {
    throw new Error("AGENT_NOT_ALLOWED");
  }

  const actionClass = input.action_class === undefined ? "read_only" : input.action_class;
  if (!["read_only", "controlled_action"].includes(actionClass)) {
    throw new Error("ACTION_CLASS_NOT_ALLOWED");
  }

  return {
    request_id: requestId,
    status: actionClass === "controlled_action" ? "awaiting_human_approval" : "planned",
    intent,
    coordinator: "Optimus Prime",
    execution_mode: "plan_only",
    selected_agents: unique,
    action_class: actionClass,
    permission: "read_only",
    tools_invoked: [],
    external_calls_made: false,
    database_writes: false,
    approval_required: actionClass === "controlled_action",
    approval_binding: actionClass === "controlled_action" ? "exact_action_payload_required_before_execution" : null,
    note: "This endpoint creates a plan only. It does not execute agents, call model providers, modify data, or perform external actions.",
  };
}
