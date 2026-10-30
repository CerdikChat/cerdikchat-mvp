import test from "node:test";
import assert from "node:assert/strict";
import { handleAdminRoutes } from "../admin-control.js";

function request(path, method = "GET", body, origin = "https://cerdikchat.test") {
  return new Request("https://cerdikchat.test" + path, {
    method,
    headers: {
      ...(method === "POST" ? { "content-type": "application/json" } : {}),
      ...(origin ? { Origin: origin } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
}

const emptyDb = {
  prepare() {
    return {
      bind() { return this; },
      async first() { return null; },
      async all() { return { results: [] }; },
      async run() { return { meta: { changes: 0 } }; }
    };
  }
};

test("admin summary rejects unauthenticated callers", async () => {
  const response = await handleAdminRoutes(request("/admin/summary"), { DB: emptyDb }, null);
  assert.equal(response.status, 401);
  assert.equal((await response.json()).error, "AUTHENTICATION_REQUIRED");
});

test("admin summary rejects authenticated non-admin users", async () => {
  const response = await handleAdminRoutes(
    request("/admin/summary"),
    { DB: emptyDb },
    { email: "pilot.user@example.com" }
  );
  assert.equal(response.status, 403);
  assert.equal((await response.json()).error, "ADMIN_REQUIRED");
});

test("access request rejects cross-origin submissions", async () => {
  const response = await handleAdminRoutes(
    request("/auth/request-access", "POST", { email: "pilot.user@example.com" }, "https://attacker.example"),
    { DB: emptyDb },
    null
  );
  assert.equal(response.status, 403);
  assert.equal((await response.json()).error, "ORIGIN_NOT_ALLOWED");
});

test("access request validates email before database writes", async () => {
  const response = await handleAdminRoutes(
    request("/auth/request-access", "POST", { email: "not-an-email" }),
    { DB: emptyDb },
    null
  );
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error, "VALID_EMAIL_REQUIRED");
});

test("unknown admin endpoint is not exposed to non-admin users", async () => {
  const response = await handleAdminRoutes(
    request("/admin/unknown"),
    { DB: emptyDb },
    { email: "pilot.user@example.com" }
  );
  assert.equal(response.status, 403);
});
