import test from "node:test";
import assert from "node:assert/strict";
import worker from "../worker.js";

function env(overrides = {}) { return { ...overrides }; }

test("Admin session fails closed when D1 is not configured", async () => {
  const response = await worker.fetch(new Request("https://cerdikchat.test/api/admin/session", {
    headers: { origin: "https://cerdikchat.test" }
  }), env());
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error, "AUTH_UNAVAILABLE");
});

test("Admin queue fails closed when session storage is unavailable", async () => {
  const response = await worker.fetch(new Request("https://cerdikchat.test/api/admin/users/pending", {
    headers: { origin: "https://cerdikchat.test" }
  }), env());
  assert.equal(response.status, 503);
});

test("Admin Console document is not served without a verified server-side session", async () => {
  const response = await worker.fetch(new Request("https://cerdikchat.test/admin", {
    headers: { origin: "https://cerdikchat.test" }
  }), env({ ASSETS: { fetch: async () => new Response("SHOULD_NOT_BE_SERVED") } }));
  assert.equal(response.status, 503);
  assert.notEqual(await response.text(), "SHOULD_NOT_BE_SERVED");
});

test("Admin Console document rejects non-GET methods", async () => {
  const response = await worker.fetch(new Request("https://cerdikchat.test/admin", {
    method: "POST",
    headers: { origin: "https://cerdikchat.test" }
  }), env());
  assert.equal(response.status, 405);
});
