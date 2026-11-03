import { requireSession, validateCsrfRequest } from "./auth/google-auth.js";

const CATEGORIES = new Set([
  "AI & Analisis", "Dokumen & Produktivitas", "Riset & Knowledge Base",
  "Voice & Multimodal", "Business & Strategi", "IoT & Konektivitas",
  "Keamanan & Admin", "UI/UX & Aksesibilitas", "Lainnya"
]);

function reply(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
      ...headers
    }
  });
}

export async function submitFeatureRequest(request, env, corsHeaders = {}) {
  if (request.method !== "POST") {
    return reply({ error: "METHOD_NOT_ALLOWED" }, 405, { ...corsHeaders, allow: "POST" });
  }
  if (!validateCsrfRequest(request)) {
    return reply({ error: "CSRF_VALIDATION_FAILED" }, 403, corsHeaders);
  }
  const session = await requireSession(request, env);
  if (!session.ok) {
    return reply({ error: "AUTH_REQUIRED", message: "Silakan masuk terlebih dahulu." }, 401, corsHeaders);
  }
  if (!env.DB) {
    return reply({ error: "FEATURE_REQUESTS_UNAVAILABLE" }, 503, corsHeaders);
  }
  if (!env.CHAT_RATE_LIMITER || typeof env.CHAT_RATE_LIMITER.limit !== "function") {
    return reply({ error: "FEATURE_REQUESTS_UNAVAILABLE" }, 503, corsHeaders);
  }
  const ip = request.headers.get("CF-Connecting-IP");
  if (!ip) return reply({ error: "FEATURE_REQUESTS_UNAVAILABLE" }, 503, corsHeaders);
  try {
    const limited = await env.CHAT_RATE_LIMITER.limit({ key: "feature-request:" + session.subject + ":" + ip });
    if (!limited.success) return reply({ error: "RATE_LIMIT_EXCEEDED" }, 429, { ...corsHeaders, "retry-after": "60" });
  } catch {
    return reply({ error: "FEATURE_REQUESTS_UNAVAILABLE" }, 503, corsHeaders);
  }
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("Content-Type") || "")) {
    return reply({ error: "UNSUPPORTED_MEDIA_TYPE" }, 415, corsHeaders);
  }
  let body;
  try {
    const raw = await request.text();
    if (raw.length > 6000) return reply({ error: "REQUEST_TOO_LARGE" }, 413, corsHeaders);
    body = JSON.parse(raw);
  } catch {
    return reply({ error: "INVALID_JSON" }, 400, corsHeaders);
  }
  const fields = {
    category: typeof body?.category === "string" ? body.category.trim() : "",
    name: typeof body?.name === "string" ? body.name.trim() : "",
    description: typeof body?.description === "string" ? body.description.trim() : "",
    problem: typeof body?.problem === "string" ? body.problem.trim() : "",
    benefit: typeof body?.benefit === "string" ? body.benefit.trim() : ""
  };
  if (!CATEGORIES.has(fields.category) || !fields.name || fields.name.length > 100 ||
      !fields.description || fields.description.length > 1200 ||
      !fields.problem || fields.problem.length > 800 ||
      !fields.benefit || fields.benefit.length > 800) {
    return reply({ error: "VALIDATION_FAILED", message: "Periksa kembali kelengkapan dan batas karakter formulir." }, 400, corsHeaders);
  }
  const requestId = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);
  try {
    await env.DB.prepare(
      "INSERT INTO feature_requests (request_id, user_google_sub, user_email, category, feature_name, description, problem, expected_benefit, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'submitted', ?, ?)"
    ).bind(requestId, session.subject, session.email, fields.category, fields.name, fields.description, fields.problem, fields.benefit, now, now).run();
  } catch {
    return reply({ error: "FEATURE_REQUESTS_UNAVAILABLE", message: "Penyimpanan usulan belum tersedia. Silakan coba kembali nanti." }, 503, corsHeaders);
  }
  return reply({ accepted: true, requestId, status: "submitted" }, 201, corsHeaders);
}
