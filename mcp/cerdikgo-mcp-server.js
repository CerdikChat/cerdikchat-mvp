import { McpServer } from "@modelcontextprotocol/server";
import { createMcpHandler } from "agents/mcp/server";
import { z } from "zod";
import { AGENT_REGISTRY, listAgentCapabilities, buildAgentPlan } from "../integrations/agent-gateway.js";

const agentIds = AGENT_REGISTRY.map((agent) => agent.id);

function createCerdikGoMcpServer() {
  const server = new McpServer({ name: "cerdikgo-atlas9", version: "0.1.0" });

  server.registerTool("cerdikgo.get_capabilities", {
    title: "Get CerdikGo capabilities",
    description: "Returns implemented integration capabilities and explicit provider readiness labels. Does not contact external providers.",
  }, async () => ({
    content: [{ type: "text", text: JSON.stringify(listAgentCapabilities(), null, 2) }],
  }));

  server.registerTool("cerdikgo.get_agent_registry", {
    title: "Get ATLAS-9 agent registry",
    description: "Returns the nine specialist roles and their current read-only, non-executing permissions.",
  }, async () => ({
    content: [{ type: "text", text: JSON.stringify({ version: "1.0.0", execution_mode: "plan_only", agents: AGENT_REGISTRY }, null, 2) }],
  }));

  server.registerTool("cerdikgo.create_task_plan", {
    title: "Create a non-executing ATLAS-9 task plan",
    description: "Creates a bounded plan only. It does not call AI providers, execute agents, access external services, or write databases. controlled_action plans remain awaiting human approval.",
    inputSchema: {
      intent: z.string().trim().min(1).max(4000),
      agents: z.array(z.enum(agentIds)).min(1).max(3).optional(),
      action_class: z.enum(["read_only", "controlled_action"]).optional(),
    },
  }, async (input) => {
    try {
      const plan = buildAgentPlan(input, crypto.randomUUID());
      return { content: [{ type: "text", text: JSON.stringify(plan, null, 2) }] };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: "text", text: "PLAN_REJECTED: " + (typeof error?.message === "string" ? error.message : "INVALID_INPUT") }],
      };
    }
  });

  return server;
}

export const cerdikgoMcpHandler = createMcpHandler(createCerdikGoMcpServer, {
  route: "/mcp",
  corsOptions: false,
  legacy: "stateless",
  responseMode: "auto",
});
