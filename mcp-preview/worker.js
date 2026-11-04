import { AGENT_REGISTRY, listAgentCapabilities, buildAgentPlan } from "../integrations/agent-gateway.js";

const MAX_BODY_BYTES = 16 * 1024;
const MAX_REQUESTS_PER_MINUTE = 60;
const WINDOW_MS = 60_000;
const requestWindows = new Map();

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });
}

function rpcError(id, code, message) {
  return { jsonrpc: "2.0", id: id ?? null, error: { code, message } };
}

async function tokenMatches(provided, expected) {
  if (typeof provided !== "string" || typeof expected !== "string" || provided.length < 32 || expected.length < 32) return false;
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(provided)),
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(expected)),
  ]);
  const aa = new Uint8Array(a);
  const bb = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < aa.length; i++) diff |= aa[i] ^ bb[i];
  return diff === 0 && provided.length === expected.length;
}

function rateAllowed(key) {
  const now = Date.now();
  const current = requestWindows.get(key);
  if (!current || now - current.start >= WINDOW_MS) {
    requestWindows.set(key, { start: now, count: 1 });
    if (requestWindows.size > 5000) {
      for (const [k, v] of requestWindows) if (now - v.start >= WINDOW_MS) requestWindows.delete(k);
    }
    return true;
  }
  current.count += 1;
  return current.count <= MAX_REQUESTS_PER_MINUTE;
}

function toolDefinitions() {
  return [
    {
      name: "cerdikgo.get_capabilities",
      description: "Returns CerdikGo integration capabilities and provider readiness. Does not contact external providers.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
    },
    {
      name: "cerdikgo.get_agent_registry",
      description: "Returns the nine ATLAS-9 specialist roles and their read-only, non-executing permissions.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
    },
    {
      name: "cerdikgo.create_task_plan",
      description: "Creates a bounded task plan only. Does not execute agents, call providers, access external services, or write databases. Controlled actions remain awaiting human approval.",
      inputSchema: {
        type: "object",
        properties: {
          intent: { type: "string", minLength: 1, maxLength: 4000 },
          agents: { type: "array", minItems: 1, maxItems: 3, uniqueItems: true, items: { type: "string", enum: AGENT_REGISTRY.map((a) => a.id) } },
          action_class: { type: "string", enum: ["read_only", "controlled_action"] },
        },
        required: ["intent"],
        additionalProperties: false,
      },
    },
  ];
}

export function executeTool(name, args = {}) {
  if (!args || typeof args !== "object" || Array.isArray(args)) throw new Error("INVALID_TOOL_ARGUMENTS");
  if (name === "cerdikgo.get_capabilities") {
    if (Object.keys(args).length) throw new Error("UNKNOWN_TOOL_ARGUMENT");
    return listAgentCapabilities();
  }
  if (name === "cerdikgo.get_agent_registry") {
    if (Object.keys(args).length) throw new Error("UNKNOWN_TOOL_ARGUMENT");
    return { version: "1.0.0", execution_mode: "plan_only", agents: AGENT_REGISTRY };
  }
  if (name === "cerdikgo.create_task_plan") {
    return buildAgentPlan(args, crypto.randomUUID());
  }
  throw new Error("UNKNOWN_TOOL");
}

export async function handleMcpRequest(request, env) {
  if (env.CERDIKGO_MCP_ENABLED !== "true") return json({ error: "MCP_DISABLED" }, 404);
  const expected = env.CERDIKGO_MCP_BEARER_TOKEN;
  if (typeof expected !== "string" || expected.length < 32) return json({ error: "MCP_AUTH_NOT_CONFIGURED" }, 503);
  const authorization = request.headers.get("authorization") || "";
  const provided = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!(await tokenMatches(provided, expected))) {
    return json({ error: "UNAUTHORIZED", message: "A valid bearer token is required." }, 401, { "www-authenticate": 'Bearer realm="CerdikGo MCP"' });
  }
  if (request.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405, { allow: "POST" });
  const clientKey = request.headers.get("cf-connecting-ip") || "unknown";
  if (!rateAllowed(clientKey)) return json({ error: "RATE_LIMITED" }, 429, { "retry-after": "60" });
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) return json({ error: "UNSUPPORTED_MEDIA_TYPE" }, 415);
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > MAX_BODY_BYTES) return json({ error: "REQUEST_TOO_LARGE" }, 413);
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return json({ error: "REQUEST_TOO_LARGE" }, 413);
  let message;
  try { message = JSON.parse(raw); } catch { return json(rpcError(null, -32700, "Parse error"), 400); }
  if (!message || typeof message !== "object" || Array.isArray(message) || message.jsonrpc !== "2.0" || typeof message.method !== "string") {
    return json(rpcError(message?.id, -32600, "Invalid Request"), 400);
  }
  const hasId = Object.prototype.hasOwnProperty.call(message, "id");
  if (!hasId && message.method.startsWith("notifications/")) return new Response(null, { status: 202 });
  const id = hasId ? message.id : null;
  try {
    let result;
    if (message.method === "initialize") {
      result = {
        protocolVersion: typeof message.params?.protocolVersion === "string" ? message.params.protocolVersion : "2025-03-26",
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "cerdikgo-atlas9", version: "0.1.1" },
        instructions: "CerdikGo MCP is read-only and plan-only. No tool executes an agent or writes data.",
      };
    } else if (message.method === "ping") {
      result = {};
    } else if (message.method === "tools/list") {
      result = { tools: toolDefinitions() };
    } else if (message.method === "tools/call") {
      const name = message.params?.name;
      try {
        const data = executeTool(name, message.params?.arguments || {});
        result = { content: [{ type: "text", text: JSON.stringify(data, null, 2) }], isError: false };
      } catch (error) {
        result = { content: [{ type: "text", text: String(error?.message || "TOOL_EXECUTION_FAILED") }], isError: true };
      }
    } else if (message.method === "resources/list" || message.method === "prompts/list") {
      result = message.method === "resources/list" ? { resources: [] } : { prompts: [] };
    } else {
      return json(rpcError(id, -32601, "Method not found"), 200);
    }
    if (!hasId) return new Response(null, { status: 202 });
    return json({ jsonrpc: "2.0", id, result });
  } catch {
    return json(rpcError(id, -32603, "Internal error"), 200);
  }
}

export default {
  fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/mcp") return json({ error: "NOT_FOUND" }, 404);
    return handleMcpRequest(request, env);
  },
};
