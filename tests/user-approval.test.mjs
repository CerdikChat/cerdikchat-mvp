import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { requestUserAccess, listPendingUserAccess, decideUserAccess } from "../auth/google-auth.js";

const sessionId = "atlas9-test-session";
const sessionHash = createHash("sha256").update(sessionId).digest("hex");
const csrf = "C".repeat(43);

function request(path, { method = "GET", body, withSession = false, withCsrf = false } = {}) {
  const headers = { origin: "https://cerdikchat.test" };
  if (withSession) headers.cookie = `__Host-cerdikchat_session=${sessionId}`;
  if (withCsrf) {
    headers.cookie = [headers.cookie, `__Host-cerdikchat_csrf=${csrf}`].filter(Boolean).join("; ");
    headers["x-csrf-token"] = csrf;
  }
  if (body !== undefined) {
    headers["content-type"] = "application/json";
  }
  return new Request(`https://cerdikchat.test${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function adminDb({ role = "admin", pending = [], target = null } = {}) {
  const calls = [];
  const db = {
    prepare(sql) {
      return {
        bind(...values) {
          return {
            first: async () => {
              if (sql.includes("FROM sessions s JOIN users u")) {
                return { google_sub: "admin-sub", email: "admin@example.com", role };
              }
              if (sql.includes("FROM user_access_requests WHERE status = 'pending'")) return target;
              if (sql.includes("FROM user_access_requests WHERE email")) return target;
              if (sql.includes("FROM users WHERE email")) return null;
              return null;
            },
            all: async () => ({ results: pending }),
            run: async () => ({ meta: { changes: 1 } }),
          };
        },
      };
    },
    batch: async (statements) => {
      calls.push(statements);
      return [{ meta: { changes: 1 } }, { meta: { changes: 1 } }, { meta: { changes: 1 } }];
    },
    calls,
  };
  return db;
}

test("access request is rejected without same-origin CSRF proof", async () => {
  const response = await requestUserAccess(
    new Request("https://cerdikchat.test/api/auth/request-access", { method: "POST" }),
    { GOOGLE_CLIENT_ID: "test", DB: {} }
  );
  assert.equal(response.status, 403);
  assert.equal((await response.json()).error, "ORIGIN_NOT_ALLOWED");
});

test("pending-user list is administrator-only", async () => {
  const db = adminDb({ role: "user" });
  const response = await listPendingUserAccess(
    request("/api/admin/users/pending", { withSession: true }),
    { DB: db }
  );
  assert.equal(response.status, 403);
  assert.equal((await response.json()).error, "ADMIN_REQUIRED");
});

test("administrator can retrieve only pending access requests", async () => {
  const db = adminDb({ pending: [{ email: "pilot@example.com", display_name: "Pilot", status: "pending" }] });
  const response = await listPendingUserAccess(
    request("/api/admin/users/pending", { withSession: true }),
    { DB: db }
  );
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).users, [
    { email: "pilot@example.com", displayName: "Pilot", status: "pending" },
  ]);
});

test("user approval requires CSRF and an administrator session", async () => {
  const db = adminDb();
  const response = await decideUserAccess(
    request("/api/admin/users/decision", {
      method: "POST",
      body: { email: "pilot@example.com", decision: "approve" },
      withSession: true,
    }),
    { DB: db }
  );
  assert.equal(response.status, 403);
  assert.equal((await response.json()).error, "CSRF_VALIDATION_FAILED");
});

test("approval batches standard-user creation, queue update, and audit record", async () => {
  const db = adminDb({
    target: {
      google_sub: "verified-google-sub",
      email: "pilot@example.com",
      display_name: "Pilot User",
      status: "pending",
    },
  });
  const response = await decideUserAccess(
    request("/api/admin/users/decision", {
      method: "POST",
      body: { email: "pilot@example.com", decision: "approve" },
      withSession: true,
      withCsrf: true,
    }),
    { DB: db }
  );
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { updated: true, status: "approved", role: "user" });
  assert.equal(db.calls.length, 1);
  assert.equal(db.calls[0].length, 3);
});
