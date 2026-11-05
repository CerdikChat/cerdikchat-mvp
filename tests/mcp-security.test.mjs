import test from "node:test";
import assert from "node:assert/strict";
import worker from "../worker.js";

const TOKEN = "test-only-mcp-bearer-secret-value-0123456789";
const URL = "https://cerdikgo.test/mcp";

function makeEnv(overrides = {}) {
  const rateLimitKeys = [];
  return {
    rateLimitKeys,
    CHAT_RATE_LIMITER: {
      limit: async ({ key }) => {
        rateLimitKeys.push(key);
        return { success: true };
      },
    },
    CERDIKGO_MCP_ENABLED: "true",
    CERDIKGO_MCP_BEARER_TOKEN: TOKEN,
    ...overrides,
  };
}

function request({ method = "POST", token, ip = "203.0.113.25", body } = {}) {
  const headers = { "content-type": "application/json" };
  if (token !== undefined) headers.authorization = token;
  if (ip !== null) headers["cf-connecting-ip"] = ip;
  return new Request(URL, {
    method,
    headers,
    body: method === "POST" ? JSON.stringify(body ?? {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-03-26",
        capabilities: {},
        clientInfo: { name: "cerdikgo-mcp-security-test", version: "1.0.0" },
      },
    }) : undefined,
  });
}

async function payload(response) {
  return response.json();
}

test("MCP endpoint remains disabled unless explicitly enabled", async () => {
  const env = makeEnv({ CERDIKGO_MCP_ENABLED: "false" });
  const response = await worker.fetch(request({ token: `Bearer ${TOKEN}` }), env);
  assert.equal(response.status, 404);
  assert.equal((await payload(response)).error, "MCP_DISABLED");
  assert.deepEqual(env.rateLimitKeys, []);
});

test("MCP rejects requests when rate limiting is unavailable", async () => {
  const response = await worker.fetch(
    request({ token: `Bearer ${TOKEN}` }),
    makeEnv({ CHAT_RATE_LIMITER: undefined })
  );
  assert.equal(response.status, 503);
  assert.equal((await payload(response)).error, "MCP_RATE_LIMIT_UNAVAILABLE");
});

test("MCP applies an IP rate limit before checking an invalid bearer token", async () => {
  const env = makeEnv();
  const response = await worker.fetch(request({ token: "Bearer invalid-token" }), env);
  assert.equal(response.status, 401);
  assert.equal((await payload(response)).error, "UNAUTHORIZED");
  assert.deepEqual(env.rateLimitKeys, ["mcp:preauth:ip:203.0.113.25"]);
});

test("MCP fails closed when the client IP is unavailable", async () => {
  const response = await worker.fetch(
    request({ token: `Bearer ${TOKEN}`, ip: null }),
    makeEnv()
  );
  assert.equal(response.status, 403);
  assert.equal((await payload(response)).error, "MCP_CLIENT_ID_UNAVAILABLE");
});

test("MCP rate-limits unauthenticated traffic before token validation", async () => {
  const env = makeEnv({
    CHAT_RATE_LIMITER: { limit: async ({ key }) => ({ success: key !== "mcp:preauth:ip:203.0.113.25" }) },
  });
  const response = await worker.fetch(request({ token: "Bearer wrong" }), env);
  assert.equal(response.status, 429);
  assert.equal((await payload(response)).error, "MCP_RATE_LIMITED");
});

test("MCP requires a configured high-entropy bearer secret", async () => {
  const response = await worker.fetch(
    request({ token: `Bearer ${TOKEN}` }),
    makeEnv({ CERDIKGO_MCP_BEARER_TOKEN: "short" })
  );
  assert.equal(response.status, 503);
  assert.equal((await payload(response)).error, "MCP_AUTH_NOT_CONFIGURED");
});

test("MCP accepts bearer scheme case-insensitively and rate-limits the credential fingerprint", async () => {
  const env = makeEnv();
  const response = await worker.fetch(request({ token: `bEaReR ${TOKEN}` }), env);
  assert.notEqual(response.status, 401);
  assert.deepEqual(env.rateLimitKeys.slice(0, 1), ["mcp:preauth:ip:203.0.113.25"]);
  assert.match(env.rateLimitKeys[1] || "", /^mcp:authenticated:client:[a-f0-9]{64}$/);
  assert.equal(env.rateLimitKeys.some((key) => key.includes(TOKEN)), false);
});

test("MCP rejects malformed bearer authorization without invoking credential rate limit", async () => {
  const env = makeEnv();
  const response = await worker.fetch(request({ token: `Basic ${TOKEN}` }), env);
  assert.equal(response.status, 401);
  assert.equal((await payload(response)).error, "UNAUTHORIZED");
  assert.deepEqual(env.rateLimitKeys, ["mcp:preauth:ip:203.0.113.25"]);
});

test("MCP accepts only POST on its stateless endpoint", async () => {
  const env = makeEnv();
  const response = await worker.fetch(request({ method: "GET", token: `Bearer ${TOKEN}` }), env);
  assert.equal(response.status, 405);
  assert.equal((await payload(response)).error, "MCP_METHOD_NOT_ALLOWED");
  assert.deepEqual(env.rateLimitKeys, ["mcp:preauth:ip:203.0.113.25"]);
});

test("MCP keeps ATLAS-9 planning non-executing", async () => {
  const { AGENT_REGISTRY, buildAgentPlan } = await import("../agent-gateway.js");
  assert.equal(AGENT_REGISTRY.length, 9);
  assert.deepEqual(AGENT_REGISTRY.map((agent) => agent.id), [
    "ATLAS-01", "ATLAS-02", "ATLAS-03", "ATLAS-04", "ATLAS-05",
    "ATLAS-06", "ATLAS-07", "ATLAS-08", "ATLAS-09",
  ]);
  const plan = buildAgentPlan({ intent: "MCP security review", agents: ["ATLAS-04", "ATLAS-09"] }, "mcp-test");
  assert.equal(plan.execution_mode, "plan_only");
  assert.equal(plan.external_calls_made, false);
  assert.equal(plan.database_writes, false);
  assert.deepEqual(plan.tools_invoked, []);
});
