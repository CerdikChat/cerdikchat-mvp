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


test("access request rejects oversized JSON bodies even without Content-Length", async () => {
  const response = await handleAdminRoutes(
    request("/auth/request-access", "POST", { email: "a".repeat(5000) }),
    { DB: emptyDb },
    null
  );
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error, "VALID_EMAIL_REQUIRED");
});

test("admin approval enforces the 30-user cap atomically", async () => {
  const statements = [];
  const db = {
    prepare(sql) {
      statements.push(sql);
      return {
        bind() { return this; },
        async first() {
          if (sql.includes("FROM admin_users")) return { email: "admin@example.com", role: "super_admin" };
          if (sql.includes("FROM access_requests")) return { status: "pending" };
          throw new Error("Unexpected first() query: " + sql);
        },
        async run() {
          if (sql.includes("INSERT INTO pilot_users")) return { meta: { changes: 0 } };
          throw new Error("Unexpected run() query: " + sql);
        }
      };
    }
  };

  const response = await handleAdminRoutes(
    request("/admin/approve", "POST", { email: "new.user@example.com" }),
    { DB: db },
    { email: "admin@example.com" }
  );
  assert.equal(response.status, 409);
  assert.equal((await response.json()).error, "PILOT_CAPACITY_REACHED");
  assert.equal(statements.some(sql => /SELECT COUNT\\(\\*\\) FROM pilot_users WHERE active = 1/.test(sql)), true);
  assert.equal(statements.some(sql => sql.includes("SELECT COUNT(*) AS total")), false);
});
