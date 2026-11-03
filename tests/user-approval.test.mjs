import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { requestUserAccess, listPendingUserAccess, decideUserAccess, requireSession } from "../auth/google-auth.js";

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


function b64url(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

async function signedGoogleFixture() {
  const clientId = "atlas9-test.apps.googleusercontent.com";
  const nonce = "N".repeat(43);
  const now = Math.floor(Date.now() / 1000);
  const pair = await crypto.subtle.generateKey(
    { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true,
    ["sign", "verify"]
  );
  const jwk = await crypto.subtle.exportKey("jwk", pair.publicKey);
  jwk.kid = "atlas9-user-request-test";
  jwk.alg = "RS256";
  jwk.use = "sig";
  const claims = {
    iss: "https://accounts.google.com",
    aud: clientId,
    azp: clientId,
    exp: now + 300,
    iat: now,
    sub: "12345678901234567890",
    email_verified: true,
    email: "new.user@example.com",
    name: "New User",
    nonce,
  };
  const unsigned = `${b64url({ alg: "RS256", kid: jwk.kid })}.${b64url(claims)}`;
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    pair.privateKey,
    new TextEncoder().encode(unsigned)
  );
  return {
    clientId,
    nonce,
    token: `${unsigned}.${Buffer.from(signature).toString("base64url")}`,
    fetchJwks: async () => new Response(JSON.stringify({ keys: [jwk] }), {
      headers: { "cache-control": "max-age=300" },
    }),
  };
}

function adminDb({ role = "admin", pending = [], target = null, targetUser = null, activeCount = 0, batchResults = null } = {}) {
  const calls = [];
  const db = {
    prepare(sql) {
      return {
        sql,
        first: async () => sql.includes("SELECT COUNT(*) AS active_count FROM users") ? { active_count: activeCount } : null,
        all: async () => ({ results: pending }),
        bind(...values) {
          return {
            sql,
            first: async () => {
              if (sql.includes("FROM sessions s JOIN users u")) {
                return { google_sub: "admin-sub", email: "admin@example.com", role };
              }
              if (sql.includes("FROM user_access_requests WHERE status = 'pending'")) return target;
              if (sql.includes("FROM user_access_requests WHERE email")) return target;
              if (sql.includes("SELECT COUNT(*) AS active_count FROM users")) return { active_count: activeCount };
              if (sql.includes("FROM users WHERE email")) return targetUser;
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
      return batchResults || [{ meta: { changes: 1 } }, { meta: { changes: 1 } }, { meta: { changes: 1 } }];
    },
    calls,
  };
  return db;
}

test("verified User access request enters pending queue without creating a session", async () => {
  const fixture = await signedGoogleFixture();
  const csrfToken = "C".repeat(43);
  let insertedSql = "";
  const db = {
    prepare(sql) {
      return {
        bind() {
          return {
            first: async () => null,
            run: async () => { insertedSql = sql; return { meta: { changes: 1 } }; },
          };
        },
      };
    },
  };
  const response = await requestUserAccess(
    new Request("https://cerdikchat.test/api/auth/request-access", {
      method: "POST",
      headers: {
        origin: "https://cerdikchat.test",
        "content-type": "application/json",
        "cf-connecting-ip": "203.0.113.21",
        cookie: `__Host-cerdikchat_csrf=${csrfToken}`,
        "x-csrf-token": csrfToken,
      },
      body: JSON.stringify({ credential: fixture.token, nonce: fixture.nonce }),
    }),
    {
      GOOGLE_CLIENT_ID: fixture.clientId,
      CHAT_RATE_LIMITER: { limit: async () => ({ success: true }) },
      DB: db,
    },
    { fetch: fixture.fetchJwks }
  );
  assert.equal(response.status, 202);
  assert.equal((await response.json()).status, "pending");
  assert.equal(response.headers.get("set-cookie"), null);
  assert.match(insertedSql, /INSERT INTO user_access_requests/);
});

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

test("ordinary administrator cannot approve, reject, or suspend users", async () => {
  for (const decision of ["approve", "reject", "suspend"]) {
    const db = adminDb({ role: "admin" });
    const response = await decideUserAccess(
      request("/api/admin/users/decision", {
        method: "POST",
        body: { email: "pilot@example.com", decision },
        withSession: true,
        withCsrf: true,
      }),
      { DB: db }
    );
    assert.equal(response.status, 403, decision);
    assert.equal((await response.json()).error, "SUPER_ADMIN_REQUIRED", decision);
    assert.equal(db.calls.length, 0, decision);
  }
});

test("approval batches standard-user creation, queue update, and audit record", async () => {
  const db = adminDb({ role: "super_admin",
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
  assert.match(db.calls[0][0].sql, /COUNT\(\*\).*status = 'active' AND role = 'user'.*< 30/s);
  assert.match(db.calls[0][0].sql, /INSERT INTO users.*SELECT/s);
  assert.match(db.calls[0][1].sql, /EXISTS \(SELECT 1 FROM users/s);
});


test("Super Admin can suspend a standard user and batch-revoke every active session", async () => {
  const db = adminDb({
    role: "super_admin",
    targetUser: {
      google_sub: "pilot-google-sub",
      email: "pilot@example.com",
      status: "active",
      role: "user",
    },
  });
  const response = await decideUserAccess(
    request("/api/admin/users/decision", {
      method: "POST",
      body: { email: "pilot@example.com", decision: "suspend" },
      withSession: true,
      withCsrf: true,
    }),
    { DB: db }
  );
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { updated: true, status: "disabled", role: "user" });
  assert.equal(db.calls.length, 1);
  assert.equal(db.calls[0].length, 3);
  assert.match(db.calls[0][0].sql, /UPDATE users SET status = 'disabled'.*role = 'user'/s);
  assert.match(db.calls[0][1].sql, /UPDATE sessions SET revoked_at = \? WHERE google_sub = \? AND revoked_at IS NULL/);
  assert.match(db.calls[0][2].sql, /INSERT INTO admin_audit_log/);
});

test("approval refuses the 31st active standard user and does not allocate a seat", async () => {
  const db = adminDb({
    role: "super_admin",
    activeCount: 30,
    target: {
      google_sub: "verified-google-sub-31",
      email: "pilot31@example.com",
      display_name: "Pilot 31",
      status: "pending",
    },
    batchResults: [
      { meta: { changes: 0 } },
      { meta: { changes: 0 } },
      { meta: { changes: 0 } },
    ],
  });
  const response = await decideUserAccess(
    request("/api/admin/users/decision", {
      method: "POST",
      body: { email: "pilot31@example.com", decision: "approve" },
      withSession: true,
      withCsrf: true,
    }),
    { DB: db }
  );
  assert.equal(response.status, 409);
  assert.equal((await response.json()).error, "PILOT_CAP_REACHED");
  assert.match(db.calls[0][0].sql, /status = 'active' AND role = 'user'.*< 30/s);
});


test("pending identity without an active users row cannot obtain an authenticated session", async () => {
  const db = {
    prepare(sql) {
      return {
        bind() {
          return { first: async () => null };
        },
      };
    },
  };
  const result = await requireSession(
    request("/api/auth/me", { withSession: true }),
    { DB: db }
  );
  assert.equal(result.ok, false);
  assert.equal(result.response.status, 401);
  assert.equal((await result.response.json()).error, "AUTH_REQUIRED");
});


test("concurrent approvals with one seat remaining allocate exactly one pilot seat", async () => {
  let activeCount = 29;
  let batchTail = Promise.resolve();
  const pending = new Map([
    ["pilot-a@example.com", { google_sub: "pilot-sub-a", email: "pilot-a@example.com", display_name: "Pilot A", status: "pending" }],
    ["pilot-b@example.com", { google_sub: "pilot-sub-b", email: "pilot-b@example.com", display_name: "Pilot B", status: "pending" }],
  ]);
  const db = {
    prepare(sql) {
      return {
        first: async () => sql.includes("SELECT COUNT(*) AS active_count FROM users")
          ? { active_count: activeCount }
          : null,
        bind(...values) {
          return {
            first: async () => {
              if (sql.includes("FROM sessions s JOIN users u")) {
                return { google_sub: "super-admin-sub", email: "super-admin@example.com", role: "super_admin" };
              }
              if (sql.includes("FROM user_access_requests WHERE email")) return pending.get(values[0]) || null;
              if (sql.includes("FROM users WHERE email")) return null;
              return null;
            },
          };
        },
      };
    },
    batch: async (statements) => {
      const current = batchTail.then(async () => {
        assert.match(statements[0].sql, /status = 'active' AND role = 'user'.*< 30/s);
        if (activeCount < 30) {
          activeCount += 1;
          return [{ meta: { changes: 1 } }, { meta: { changes: 1 } }, { meta: { changes: 1 } }];
        }
        return [{ meta: { changes: 0 } }, { meta: { changes: 0 } }, { meta: { changes: 0 } }];
      });
      batchTail = current.then(() => undefined);
      return current;
    },
  };

  const makeApproval = (email) => decideUserAccess(
    request("/api/admin/users/decision", {
      method: "POST",
      body: { email, decision: "approve" },
      withSession: true,
      withCsrf: true,
    }),
    { DB: db }
  );
  const responses = await Promise.all([
    makeApproval("pilot-a@example.com"),
    makeApproval("pilot-b@example.com"),
  ]);
  const outcomes = await Promise.all(responses.map(async response => ({
    status: response.status,
    error: (await response.json()).error,
  })));
  assert.deepEqual(outcomes.map(x => x.status).sort(), [200, 409]);
  assert.equal(outcomes.filter(x => x.error === "PILOT_CAP_REACHED").length, 1);
  assert.equal(activeCount, 30);
});
