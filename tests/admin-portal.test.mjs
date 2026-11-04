import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import worker from "../worker.js";

function env(overrides = {}) { return { ...overrides }; }

function authenticatedAdminEnv(role = "super_admin", accessExpiresAt = null) {
  return {
    DB: {
      prepare(sql) {
        return {
          all: async () => ({ results: [] }),
          bind() {
            return {
              first: async () => {
                if (sql.includes("FROM sessions s")) {
                  return { google_sub: "test-admin-sub", email: "admin@example.test" };
                }
                if (sql.includes("SELECT role, governance_tier, access_expires_at FROM users")) {
                  return { role, access_expires_at: accessExpiresAt };
                }
                return null;
              },
              all: async () => ({ results: [] })
            };
          }
        };
      }
    },
    ASSETS: {
      fetch: async request => new Response("ADMIN_DOCUMENT:" + new URL(request.url).pathname)
    }
  };
}

function adminRequest(path, { fetchSite = "same-origin", origin, method = "GET" } = {}) {
  const headers = {
    "sec-fetch-site": fetchSite,
    cookie: "__Host-cerdikchat_session=" + "A".repeat(43)
  };
  if (origin) headers.origin = origin;
  return new Request("https://cerdikchat.test" + path, { method, headers });
}

test("Admin session fails closed when D1 is not configured", async () => {
  const response = await worker.fetch(adminRequest("/api/admin/session"), env());
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error, "AUTH_UNAVAILABLE");
});

test("Admin queue fails closed when session storage is unavailable", async () => {
  const response = await worker.fetch(adminRequest("/api/admin/users/pending"), env());
  assert.equal(response.status, 503);
});

test("same-origin Admin GET works when the browser omits the Origin header", async () => {
  const response = await worker.fetch(
    adminRequest("/api/admin/session", { fetchSite: "same-origin" }),
    authenticatedAdminEnv()
  );
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.authenticated, true);
  assert.equal(payload.role, "super_admin");
});

test("Admin Console permits an address-bar GET with Fetch Metadata none", async () => {
  let requestedAsset = "";
  const environment = authenticatedAdminEnv();
  environment.ASSETS.fetch = async request => {
    requestedAsset = new URL(request.url).pathname;
    return new Response("ADMIN_DOCUMENT");
  };
  const response = await worker.fetch(
    adminRequest("/admin", { fetchSite: "none" }),
    environment
  );
  assert.equal(response.status, 200);
  assert.equal(requestedAsset, "/admin.html");
  assert.equal(await response.text(), "ADMIN_DOCUMENT");
});

test("Admin Console asset exists in the configured src static-assets directory", async () => {
  const html = await readFile(new URL("../src/admin.html", import.meta.url), "utf8");
  assert.match(html, /CerdikGo.*Admin Console/);
  assert.match(html, /\/api\/admin\/session/);
});

test("Admin GET rejects cross-site requests even when no session is supplied", async () => {
  const response = await worker.fetch(
    adminRequest("/api/admin/session", {
      fetchSite: "cross-site",
      origin: "https://attacker.example"
    }),
    authenticatedAdminEnv()
  );
  assert.equal(response.status, 403);
  assert.equal((await response.json()).error, "ORIGIN_NOT_ALLOWED");
});

test("Admin Console rejects regular users and expired admin access", async () => {
  const regular = await worker.fetch(
    adminRequest("/api/admin/session"),
    authenticatedAdminEnv("user")
  );
  assert.equal(regular.status, 403);
  assert.equal((await regular.json()).error, "ADMIN_REQUIRED");

  const expired = await worker.fetch(
    adminRequest("/api/admin/session"),
    authenticatedAdminEnv("super_admin", Math.floor(Date.now() / 1000) - 1)
  );
  assert.equal(expired.status, 403);
  assert.equal((await expired.json()).error, "ADMIN_ACCESS_EXPIRED");
});

test("Admin queue remains read-only and returns pending rows for verified administrators", async () => {
  const response = await worker.fetch(
    adminRequest("/api/admin/users/pending"),
    authenticatedAdminEnv()
  );
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).requests, []);
});

test("Admin Console document rejects non-GET methods", async () => {
  const response = await worker.fetch(
    adminRequest("/admin", { method: "POST", fetchSite: "same-origin" }),
    env()
  );
  assert.equal(response.status, 405);
});


test("access decision batches approval, pending-state transition and audit insert atomically", async () => {
  const source = await readFile(new URL("../admin-portal.js", import.meta.url), "utf8");
  assert.ok(source.includes('typeof env.DB.batch!=="function"'));
  assert.ok(source.includes("const results=await env.DB.batch(statements)"));
  assert.ok(source.includes("WHERE changes()=1"));
  assert.ok(source.includes("REQUEST_ALREADY_DECIDED_OR_IDENTITY_CONFLICT"));
});

test("admin approval cannot rebind an existing email to a different Google subject", async () => {
  const source = await readFile(new URL("../admin-portal.js", import.meta.url), "utf8");
  assert.ok(source.includes("WHERE users.google_sub=excluded.google_sub"));
  assert.ok(source.includes("ACCOUNT_IDENTITY_CONFLICT"));
});

test("governance compatibility migration adds only missing columns and preserves existing role schema", async () => {
  const usersMigration = await readFile(new URL("../migrations/0001_users.sql", import.meta.url), "utf8");
  const governanceMigration = await readFile(new URL("../migrations/0006_access_governance_compat.sql", import.meta.url), "utf8");
  assert.match(usersMigration, /role TEXT NOT NULL DEFAULT 'user'/);
  assert.match(governanceMigration, /ADD COLUMN approved_at/);
  assert.match(governanceMigration, /ADD COLUMN access_expires_at/);
  assert.match(governanceMigration, /CREATE TABLE IF NOT EXISTS access_requests/);
  assert.doesNotMatch(governanceMigration, /ADD COLUMN role/);
  assert.doesNotMatch(governanceMigration, /CREATE TABLE IF NOT EXISTS admin_audit_log/);
  const controlMigration = await readFile(new URL("../migrations/0007_governance_control_center.sql", import.meta.url), "utf8");
  assert.match(controlMigration, /governance_tier/);
  assert.match(controlMigration, /superior_admin/);
  assert.match(controlMigration, /admin_audit_events/);
});

test("Admin feature-request queue returns stored proposals to verified administrators", async () => {
  const rows=[{request_id:"00000000-0000-4000-8000-000000000001",user_email:"pilot@example.test",feature_name:"Preview proposal",status:"submitted"}];
  let sql="";
  const environment=authenticatedAdminEnv();
  environment.DB.prepare=(query)=>{sql=query;return{bind(){return{first:async()=>query.includes("FROM sessions s")?{google_sub:"test-admin-sub",email:"admin@example.test"}:{role:"super_admin",governance_tier:"super_admin",access_expires_at:null},all:async()=>({results:rows})}}}};
  const response=await worker.fetch(adminRequest("/api/admin/feature-requests"),environment);
  assert.equal(response.status,200);
  const payload=await response.json();
  assert.equal(payload.requests.length,1);
  assert.equal(payload.requests[0].feature_name,"Preview proposal");
  assert.match(sql,/FROM feature_requests/);
});

test("Admin feature-request queue rejects regular users", async () => {
  const response=await worker.fetch(adminRequest("/api/admin/feature-requests"),authenticatedAdminEnv("user"));
  assert.equal(response.status,403);
  assert.equal((await response.json()).error,"ADMIN_REQUIRED");
});

test("Admin feature-request queue rejects cross-site requests", async () => {
  const response=await worker.fetch(adminRequest("/api/admin/feature-requests",{fetchSite:"cross-site",origin:"https://attacker.example"}),authenticatedAdminEnv());
  assert.equal(response.status,403);
  assert.equal((await response.json()).error,"ORIGIN_NOT_ALLOWED");
});

test("Admin document is denied to regular users before the asset is served", async () => {
  let assetRequested = false;
  const environment = authenticatedAdminEnv("user");
  environment.ASSETS.fetch = async () => {
    assetRequested = true;
    return new Response("SHOULD_NOT_BE_SERVED");
  };
  const response = await worker.fetch(
    adminRequest("/admin", { fetchSite: "none" }),
    environment
  );
  assert.equal(response.status, 403);
  assert.match(await response.text(), /Admin access required/);
  assert.equal(assetRequested, false);
});

test("Admin document is denied after administrator access expires", async () => {
  let assetRequested = false;
  const environment = authenticatedAdminEnv(
    "super_admin",
    Math.floor(Date.now() / 1000) - 1
  );
  environment.ASSETS.fetch = async () => {
    assetRequested = true;
    return new Response("SHOULD_NOT_BE_SERVED");
  };
  const response = await worker.fetch(
    adminRequest("/admin", { fetchSite: "none" }),
    environment
  );
  assert.equal(response.status, 403);
  assert.match(await response.text(), /governance access is verified/);
  assert.equal(assetRequested, false);
});



test("access decisions persist an explicitly identifiable audit record and return its trace ID", async () => {
  const source = await readFile(new URL("../admin-portal.js", import.meta.url), "utf8");
  assert.match(source, /const auditId=crypto\.randomUUID\(\)/);
  assert.match(source, /INSERT INTO admin_audit_events \(audit_id,actor_email,action,target_email,details,created_at\)/);
  assert.match(source, /"access_"\+status/);
  assert.match(source, /JSON\.stringify\(\{requestId,role:decision==="approve"\?requestedTier:null\}\)/);
  assert.match(source, /results\[auditIndex\]\?\.meta\?\.changes\?\?0\)!==1/);
  assert.match(source, /return json\(\{success:true,requestId,status,auditId\}\)/);
  assert.ok(
    source.indexOf("if((results[auditIndex]?.meta?.changes??0)!==1)") <
    source.indexOf("return json({success:true,requestId,status,auditId})"),
    "the API must not report success before confirming the audit insert"
  );
});


test("Admin Console exposes the server-issued audit reference after a decision", async () => {
  const html = await readFile(new URL("../src/admin.html", import.meta.url), "utf8");
  assert.match(html, /Audit ID: "\+d\.auditId/);
  assert.match(html, /await load\(\);statusEl\.textContent="Permintaan "\+d\.status\+" berhasil dicatat\. Audit ID: "\+d\.auditId/);
});

test("governance migration preflight is read-only and flags duplicate pending emails", async () => {
  const sql = await readFile(new URL("../scripts/governance-migration-preflight.sql", import.meta.url), "utf8");
  assert.match(sql, /SELECT lower\(trim\(email\)\)/);
  assert.match(sql, /WHERE status = 'pending'/);
  assert.match(sql, /HAVING COUNT\(\*\) > 1/);
  const executableSql = sql.replace(/^\s*--.*$/gm, "");
  assert.doesNotMatch(executableSql, /\b(DELETE|UPDATE|INSERT|REPLACE)\b/i);
});
