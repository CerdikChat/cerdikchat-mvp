import test from "node:test";
import assert from "node:assert/strict";
import { googleLogin, requireSession, requireAdminSession } from "../auth/google-auth.js";

function b64(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

async function signedToken() {
  const clientId = "atlas9-test.apps.googleusercontent.com";
  const nonce = "N".repeat(43);
  const now = Math.floor(Date.now() / 1000);
  const pair = await crypto.subtle.generateKey(
    { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true,
    ["sign", "verify"]
  );
  const jwk = await crypto.subtle.exportKey("jwk", pair.publicKey);
  jwk.kid = `atlas9-race-${crypto.randomUUID()}`;
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
    email: "admin@example.com",
    nonce,
  };
  const unsigned = `${b64({ alg: "RS256", kid: jwk.kid })}.${b64(claims)}`;
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    pair.privateKey,
    new TextEncoder().encode(unsigned)
  );
  return {
    token: `${unsigned}.${Buffer.from(signature).toString("base64url")}`,
    clientId,
    nonce,
    fetchJwks: async () => new Response(JSON.stringify({ keys: [jwk] }), {
      headers: { "cache-control": "max-age=300" },
    }),
  };
}

function loginRequest(fixture, portal = "admin") {
  const csrf = "C".repeat(43);
  return new Request("https://cerdikchat.test/api/auth/google", {
    method: "POST",
    headers: {
      origin: "https://cerdikchat.test",
      "content-type": "application/json",
      "cf-connecting-ip": "203.0.113.12",
      cookie: `__Host-cerdikchat_csrf=${csrf}`,
      "x-csrf-token": csrf,
    },
    body: JSON.stringify({
      credential: fixture.token,
      nonce: fixture.nonce,
      portal,
    }),
  });
}

test("concurrent allowlisted admin bootstrap recovers by immutable Google subject", async () => {
  const fixture = await signedToken();
  let subjectLookups = 0;
  let sessionCreated = false;
  const racedAdmin = {
    google_sub: "12345678901234567890",
    email: "admin@example.com",
    display_name: "Admin",
    status: "active",
    role: "admin",
  };
  const DB = {
    prepare(sql) {
      return {
        bind(...values) {
          return {
            first: async () => {
              if (sql.includes("admin_bootstrap_allowlist")) return { email: "admin@example.com" };
              if (sql.includes("WHERE email =")) return null;
              if (sql.includes("WHERE google_sub =")) {
                subjectLookups++;
                return subjectLookups === 1 ? null : racedAdmin;
              }
              throw new Error(`Unexpected query: ${sql}`);
            },
            run: async () => {
              if (sql.startsWith("INSERT INTO users")) {
                throw new Error("UNIQUE constraint failed: users.google_sub");
              }
              if (sql.startsWith("INSERT INTO sessions")) {
                sessionCreated = true;
                return { success: true };
              }
              throw new Error(`Unexpected mutation: ${sql}`);
            },
          };
        },
      };
    },
  };
  const env = {
    GOOGLE_CLIENT_ID: fixture.clientId,
    DB,
    CHAT_RATE_LIMITER: { limit: async () => ({ success: true }) },
  };

  const response = await googleLogin(loginRequest(fixture), env, { fetch: fixture.fetchJwks });
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.authenticated, true);
  assert.equal(payload.user.role, "admin");
  assert.equal(sessionCreated, true);
  assert.match(response.headers.get("set-cookie") || "", /__Host-cerdikchat_session=/);
});

test("bootstrap insert conflict without a matching Google subject fails closed", async () => {
  const fixture = await signedToken();
  const DB = {
    prepare(sql) {
      return {
        bind() {
          return {
            first: async () => {
              if (sql.includes("admin_bootstrap_allowlist")) return { email: "admin@example.com" };
              if (sql.includes("WHERE email =")) return null;
              if (sql.includes("WHERE google_sub =")) return null;
              throw new Error(`Unexpected query: ${sql}`);
            },
            run: async () => {
              if (sql.startsWith("INSERT INTO users")) throw new Error("unique conflict");
              throw new Error(`Unexpected mutation: ${sql}`);
            },
          };
        },
      };
    },
  };
  const env = {
    GOOGLE_CLIENT_ID: fixture.clientId,
    DB,
    CHAT_RATE_LIMITER: { limit: async () => ({ success: true }) },
  };

  const response = await googleLogin(loginRequest(fixture), env, { fetch: fixture.fetchJwks });
  const payload = await response.json();
  assert.equal(response.status, 503);
  assert.equal(payload.error, "AUTH_DATABASE_UNAVAILABLE");
  assert.equal(response.headers.get("set-cookie"), null);
});


test("allowlisted email already owned by another Google subject is rejected", async () => {
  const fixture = await signedToken();
  let sessionCreated = false;
  const DB = {
    prepare(sql) {
      return {
        bind() {
          return {
            first: async () => {
              if (sql.includes("WHERE google_sub =")) return null;
              if (sql.includes("admin_bootstrap_allowlist")) return { email: "admin@example.com" };
              if (sql.includes("WHERE email =")) return {
                google_sub: "99999999999999999999",
                email: "admin@example.com",
                role: "admin",
                status: "active",
              };
              throw new Error(`Unexpected query: ${sql}`);
            },
            run: async () => {
              if (sql.startsWith("INSERT INTO sessions")) sessionCreated = true;
              throw new Error("Unexpected mutation");
            },
          };
        },
      };
    },
  };
  const response = await googleLogin(loginRequest(fixture), {
    GOOGLE_CLIENT_ID: fixture.clientId,
    DB,
    CHAT_RATE_LIMITER: { limit: async () => ({ success: true }) },
  }, { fetch: fixture.fetchJwks });
  assert.equal(response.status, 403);
  assert.equal((await response.json()).error, "IDENTITY_CONFLICT");
  assert.equal(sessionCreated, false);
});

test("standard user cannot enter administrator portal", async () => {
  const fixture = await signedToken();
  let sessionCreated = false;
  const DB = {
    prepare(sql) {
      return {
        bind() {
          return {
            first: async () => {
              if (sql.includes("WHERE google_sub =")) return {
                google_sub: "12345678901234567890",
                email: "admin@example.com",
                display_name: "Pilot User",
                status: "active",
                role: "user",
              };
              throw new Error(`Unexpected query: ${sql}`);
            },
            run: async () => {
              sessionCreated = true;
              return { success: true };
            },
          };
        },
      };
    },
  };
  const response = await googleLogin(loginRequest(fixture, "admin"), {
    GOOGLE_CLIENT_ID: fixture.clientId,
    DB,
    CHAT_RATE_LIMITER: { limit: async () => ({ success: true }) },
  }, { fetch: fixture.fetchJwks });
  assert.equal(response.status, 403);
  assert.equal((await response.json()).error, "ROLE_MISMATCH");
  assert.equal(sessionCreated, false);
});

test("session role is re-read from D1 on every authorization check", async () => {
  const sessionId = "S".repeat(43);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(sessionId));
  const expectedHash = [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
  let role = "user";
  const DB = {
    prepare(sql) {
      assert.match(sql, /JOIN users u ON u\.google_sub = s\.google_sub/);
      return {
        bind(hash) {
          assert.equal(hash, expectedHash);
          return {
            first: async () => ({
              google_sub: "12345678901234567890",
              email: "admin@example.com",
              role,
            }),
          };
        },
      };
    },
  };
  const request = new Request("https://cerdikchat.test/api/auth/me", {
    headers: { cookie: `__Host-cerdikchat_session=${sessionId}` },
  });
  const first = await requireSession(request, { DB });
  assert.equal(first.ok, true);
  assert.equal(first.role, "user");

  role = "admin";
  const second = await requireSession(request, { DB });
  assert.equal(second.ok, true);
  assert.equal(second.role, "admin");
});

test("super_admin is accepted by server-side administrator authorization", async () => {
  const sessionId = "T".repeat(43);
  const DB = {
    prepare(sql) {
      assert.match(sql, /SELECT s\.google_sub, u\.email, u\.role/);
      return {
        bind() {
          return {
            first: async () => ({
              google_sub: "12345678901234567890",
              email: "root@example.com",
              role: "super_admin",
            }),
          };
        },
      };
    },
  };
  const request = new Request("https://cerdikchat.test/api/admin/session", {
    headers: { cookie: `__Host-cerdikchat_session=${sessionId}` },
  });
  const result = await requireAdminSession(request, { DB });
  assert.equal(result.ok, true);
  assert.equal(result.role, "super_admin");
});
