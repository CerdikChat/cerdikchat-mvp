/**
 * CerdikGo model routing policy.
 *
 * Free-first policy: Cloudflare Workers AI is the only enabled runtime.
 * DeepSeek is deliberately gated because its hosted API and Cloudflare-hosted
 * DeepSeek inference are not treated as free services by this project policy.
 * No external network call or secret lookup is performed in this module.
 */
export const MODEL_POLICY = Object.freeze({
  mode: "free_only",
  primaryProvider: "workers_ai",
  optionalProviders: Object.freeze(["deepseek", "github_copilot"]),
  enabledProviders: Object.freeze(["workers_ai"]),
});

export function resolveModelRoute(env = {}) {
  const configuredModel =
    typeof env.CERDIKGO_WORKERS_AI_MODEL === "string" &&
    env.CERDIKGO_WORKERS_AI_MODEL.trim()
      ? env.CERDIKGO_WORKERS_AI_MODEL.trim()
      : "@cf/google/gemma-4-26b-a4b-it";

  if (!env.AI || typeof env.AI.run !== "function") {
    return {
      provider: "unavailable",
      model: null,
      policy: MODEL_POLICY.mode,
      reason: "WORKERS_AI_BINDING_MISSING",
    };
  }

  return {
    provider: "workers_ai",
    model: configuredModel,
    policy: MODEL_POLICY.mode,
    fallback: false,
  };
}

/**
 * Explicitly report why DeepSeek is not selected under the current policy.
 * This is a policy decision, not a claim that DeepSeek itself is unavailable.
 */
export function getProviderAvailability(provider) {
  if (provider === "workers_ai") {
    return { provider, enabled: true, reason: "FREE_FIRST_PRIMARY" };
  }
  if (provider === "deepseek") {
    return {
      provider,
      enabled: false,
      reason: "PAID_API_OR_PAID_HOSTED_INFERENCE_NOT_ALLOWED",
    };
  }
  if (provider === "github_copilot") {
    return {
      provider,
      enabled: false,
      reason: "DEVELOPMENT_ASSISTANT_NOT_A_CERDIKGO_RUNTIME_PROVIDER",
    };
  }
  return { provider, enabled: false, reason: "UNKNOWN_PROVIDER" };
}
