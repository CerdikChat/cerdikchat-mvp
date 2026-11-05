import test from "node:test";
import assert from "node:assert/strict";
import worker from "../worker.js";

test("chat fails closed when a D1-backed deployment omits the auth flag", async () => {
  const request = new Request("https://cerdikchat.test/api/chat", {
    method: "POST",
    headers: {
      origin: "https://cerdikchat.test",
      "content-type": "application/json",
      "sec-fetch-site": "same-origin",
      "cf-connecting-ip": "203.0.113.91",
    },
    body: JSON.stringify({ message: "Halo" }),
  });
  const env = {
    DB: { prepare: () => ({ bind: () => ({ first: async () => null }) }) },
    CHAT_RATE_LIMITER: { limit: async () => ({ success: true }) },
    AI: { run: async () => ({ response: "must not run" }) },
  };
  const response = await worker.fetch(request, env);
  assert.equal(response.status, 401);
  assert.equal((await response.json()).error, "AUTH_REQUIRED");
});

test("D1-backed auth config reports required when the flag is absent", async () => {
  const request = new Request("https://cerdikchat.test/api/auth/config");
  const response = await worker.fetch(request, {
    DB: {},
  });
  const payload = await response.json();
  assert.equal(payload.required, true);
});
