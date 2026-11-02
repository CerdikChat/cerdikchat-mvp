import test from "node:test";
import assert from "node:assert/strict";
import worker from "../worker.js";

function request(path, method = "GET", body) {
  return new Request(`https://cerdikchat.test${path}`, {
    method,
    headers: {
      origin: "https://cerdikchat.test",
      "content-type": "application/json",
      "sec-fetch-site": "same-origin",
      "cf-connecting-ip": "203.0.113.90",
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

test("production chat fails closed when GOOGLE_AUTH_REQUIRED is absent", async () => {
  const response = await worker.fetch(
    request("/api/chat", "POST", { message: "Halo" }),
    { ENVIRONMENT: "production" }
  );
  assert.equal(response.status, 401);
  assert.equal((await response.json()).error, "AUTH_REQUIRED");
});

test("production auth config advertises authentication as required by default", async () => {
  const response = await worker.fetch(
    request("/api/auth/config"),
    { ENVIRONMENT: "production" }
  );
  const payload = await response.json();
  assert.equal(response.status, 200);
  assert.equal(payload.required, true);
  assert.equal(payload.configured, false);
});

test("explicit false remains available for isolated development only", async () => {
  const response = await worker.fetch(
    request("/api/auth/config"),
    { ENVIRONMENT: "production", GOOGLE_AUTH_REQUIRED: "false" }
  );
  const payload = await response.json();
  assert.equal(payload.required, false);
});
