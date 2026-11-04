import test from "node:test";
import assert from "node:assert/strict";
import {
  MODEL_POLICY,
  resolveModelRoute,
  getProviderAvailability,
} from "../integrations/model-router.js";

test("free-only policy enables Workers AI and keeps optional providers gated", () => {
  assert.equal(MODEL_POLICY.mode, "free_only");
  assert.deepEqual(MODEL_POLICY.enabledProviders, ["workers_ai"]);
  assert.equal(getProviderAvailability("deepseek").enabled, false);
  assert.equal(
    getProviderAvailability("deepseek").reason,
    "PAID_API_OR_PAID_HOSTED_INFERENCE_NOT_ALLOWED",
  );
  assert.equal(getProviderAvailability("github_copilot").enabled, false);
});

test("router selects Workers AI with the existing default model", () => {
  const route = resolveModelRoute({ AI: { run() {} } });
  assert.equal(route.provider, "workers_ai");
  assert.equal(route.model, "@cf/google/gemma-4-26b-a4b-it");
  assert.equal(route.policy, "free_only");
});

test("router accepts an explicit Workers AI model override", () => {
  const route = resolveModelRoute({
    AI: { run() {} },
    CERDIKGO_WORKERS_AI_MODEL: "@cf/google/gemma-4-26b-a4b-it",
  });
  assert.equal(route.model, "@cf/google/gemma-4-26b-a4b-it");
});

test("router fails closed when Workers AI binding is missing", () => {
  const route = resolveModelRoute({});
  assert.equal(route.provider, "unavailable");
  assert.equal(route.model, null);
  assert.equal(route.reason, "WORKERS_AI_BINDING_MISSING");
});
