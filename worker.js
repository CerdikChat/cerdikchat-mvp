/**
 * CerdikChat — Cloudflare Workers AI
 * ATLAS-9 Strategic Intelligence System
 *
 * Configured model: @cf/zai-org/glm-4.7-flash
 * Bindings: env.AI, env.ASSETS
 *
 * Security controls:
 * - Bounded request-body and message sizes
 * - JSON and HTTP method validation
 * - Reject mismatched browser Origin headers
 * - History normalization and role allowlist
 * - No prompt or conversation content in application logs
 * - Sanitized provider errors
 * - Security headers
 *
 * Limitations:
 * - No user authentication
 * - No persistent rate limiting
 * - No independent multi-agent execution
 * - No external tools or actions
 */

"use strict";

const CONFIG = Object.freeze({
  MODEL: "@cf/zai-org/glm-4.7-flash",

  API_PATH: "/api/chat",

  MAX_BODY_BYTES: 40 * 1024,
  MAX_MESSAGE_CHARS: 8000,

  MAX_HISTORY_MESSAGES: 12,
  MAX_HISTORY_ITEM_CHARS: 2000,

  MAX_OUTPUT_TOKENS: 1024,
});

const SYSTEM_INSTRUCTION = `
Anda adalah ATLAS, koordinator kecerdasan untuk CerdikChat
dan konsep tim strategis ATLAS-9.

Anda membantu pengguna dalam riset, analisis, coding,
strategi, ekonomi, sains, dan penulisan profesional.

KONTEKS TIM:
- Pengguna adalah Human Team Leader dan pemegang keputusan akhir.
- ATLAS: koordinasi, sintesis, perencanaan, riset, validasi.
- NEXUS: AI, software engineering, debugging, dan coding.
- TITAN: rekayasa, robotika, sistem fisik, dan otomasi.
- SENTINEL: data, statistik, anomali, dan evaluasi bukti.
- GENESIS: ilmu hayati dan sains.
- TERRA: perikanan, pertanian, pangan, dan keamanan pangan.
- AEGIS: hukum, keamanan, risiko, kepatuhan, dan quality assurance.
- ORACLE: ekonomi, keuangan, bisnis, dan strategi.

BATAS IDENTITAS:
Nama-nama tersebut merupakan peran analitis dalam satu model AI.
Jangan mengklaim bahwa sembilan agen atau model independen berjalan,
atau bahwa spesialis benar-benar dipanggil.

TRANSPARANSI MODEL:
Model yang dikonfigurasi oleh aplikasi adalah
@cf/zai-org/glm-4.7-flash.
Jika ditanya, bedakan konfigurasi aplikasi dari identitas internal,
arsitektur, versi, atau data pelatihan yang belum diverifikasi.
Jangan mengarang detail teknis atau mengklaim telah memeriksa
konfigurasi runtime jika pemeriksaan tersebut tidak dilakukan.

BATAS TINDAKAN:
Jangan mengklaim telah melakukan riset web, menjalankan kode,
mengubah repository, menguji sistem, atau melakukan deployment
kecuali tersedia bukti bahwa tindakan tersebut benar-benar dilakukan.
Jangan mengklaim memiliki database internal, autentikasi pengguna,
atau kemampuan pemantauan yang belum diterapkan.

PRINSIP KERJA:
1. Jawab dalam bahasa pengguna; bahasa Indonesia secara default.
2. Utamakan akurasi, struktur jelas, dan rekomendasi praktis.
3. Bedakan fakta, asumsi, estimasi, dan opini.
4. Jangan mengarang sumber, data, harga, hasil pengujian,
   atau kemampuan sistem.
5. Untuk coding, prioritaskan solusi aman dan mudah diuji.
6. Jelaskan perubahan kode dan cara memverifikasi hasilnya.
7. Untuk riset, jelaskan keterbatasan sumber jika relevan.
8. Utamakan solusi gratis atau berbiaya rendah.
9. Jangan mengaktifkan billing, melakukan pembelian, deployment,
   menghapus data, atau mengubah sistem eksternal tanpa
   persetujuan eksplisit pengguna.
10. Jangan meminta atau menampilkan API key, token, kata sandi,
    atau informasi rahasia.
11. Simpan rahasia di secret manager, bukan source code.
12. Untuk kesehatan, keselamatan, hukum, dan keuangan,
    jelaskan risiko dan perlunya verifikasi profesional bila relevan.
13. Jika informasi penting tidak tersedia, nyatakan keterbatasan
    atau ajukan pertanyaan klarifikasi yang paling menentukan.

FORMAT JAWABAN:
- Ringkasan atau diagnosis
- Rekomendasi utama
- Langkah implementasi atau contoh
- Risiko, batasan, dan verifikasi bila relevan
`.trim();

const JSON_HEADERS = Object.freeze({
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-frame-options": "DENY",
  "permissions-policy":
    "camera=(), microphone=(), geolocation=()",
});

function securityHeaders() {
  return {
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin",
    "x-frame-options": "DENY",
    "permissions-policy":
      "camera=(), microphone=(), geolocation=()",
  };
}

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...JSON_HEADERS,
      ...extraHeaders,
    },
  });
}

function apiError(code, message, status, headers = {}) {
  return jsonResponse(
    {
      error: code,
      message,
    },
    status,
    headers
  );
}

function getCorsHeaders(request) {
  const origin = request.headers.get("Origin");
  const requestOrigin = new URL(request.url).origin;

  const headers = {
    "vary": "Origin",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "Content-Type",
    "access-control-max-age": "86400",
  };

  // Never reflect an arbitrary Origin.
  if (origin && origin === requestOrigin) {
    headers["access-control-allow-origin"] = requestOrigin;
  }

  return headers;
}

function hasInvalidOrigin(request) {
  const origin = request.headers.get("Origin");

  // Non-browser clients may omit Origin. This check alone
  // does not authenticate or authorize those clients.
  if (!origin) {
    return false;
  }

  try {
    return origin !== new URL(request.url).origin;
  } catch {
    return true;
  }
}

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter(isPlainObject)
    .filter(
      (item) =>
        item.role === "user" ||
        item.role === "assistant"
    )
    .filter((item) => typeof item.content === "string")
    .map((item) => ({
      role: item.role,
      content: item.content
        .trim()
        .slice(0, CONFIG.MAX_HISTORY_ITEM_CHARS),
    }))
    .filter((item) => item.content.length > 0)
    .slice(-CONFIG.MAX_HISTORY_MESSAGES);
}

function extractReply(result) {
  if (typeof result === "string") {
    return result.trim();
  }

  if (typeof result?.response === "string") {
    return result.response.trim();
  }

  if (typeof result?.output_text === "string") {
    return result.output_text.trim();
  }

  const content = result?.choices?.[0]?.message?.content;

  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) =>
        typeof part?.text === "string" ? part.text : ""
      )
      .join("")
      .trim();
  }

  return "";
}

function safeErrorCode(error) {
  const message =
    typeof error?.message === "string"
      ? error.message
      : "";

  if (
    /daily.*allocation|neurons.*limit|quota exceeded|rate limit/i
      .test(message)
  ) {
    return "AI_QUOTA_EXCEEDED";
  }

  if (
    /model.*not found|unknown model|does not exist|model.*unavailable/i
      .test(message)
  ) {
    return "AI_MODEL_UNAVAILABLE";
  }

  if (/timeout|timed out|abort/i.test(message)) {
    return "AI_TIMEOUT";
  }

  return "AI_REQUEST_FAILED";
}

function publicErrorMessage(code) {
  const messages = {
    AI_QUOTA_EXCEEDED:
      "Kuota Workers AI mungkin telah tercapai. " +
      "Periksa penggunaan dan coba lagi setelah kuota tersedia.",

    AI_MODEL_UNAVAILABLE:
      "Model AI tidak tersedia atau ID model tidak dikenali. " +
      "Periksa konfigurasi model di Worker.",

    AI_TIMEOUT:
      "Permintaan AI tidak selesai tepat waktu. Silakan coba lagi.",

    AI_REQUEST_FAILED:
      "Permintaan AI gagal. Periksa log Cloudflare untuk diagnosis.",
  };

  return messages[code] || messages.AI_REQUEST_FAILED;
}

async function readJsonBody(request) {
  const contentType = request.headers.get("Content-Type") || "";

  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
    return {
      ok: false,
      status: 415,
      code: "UNSUPPORTED_MEDIA_TYPE",
      message: "Gunakan Content-Type: application/json.",
    };
  }

  const contentLength = request.headers.get("Content-Length");

  if (contentLength !== null) {
    const declaredLength = Number(contentLength);

    if (
      !Number.isFinite(declaredLength) ||
      declaredLength < 0
    ) {
      return {
        ok: false,
        status: 400,
        code: "INVALID_CONTENT_LENGTH",
        message: "Header Content-Length tidak valid.",
      };
    }

    if (declaredLength > CONFIG.MAX_BODY_BYTES) {
      return {
        ok: false,
        status: 413,
        code: "BODY_TOO_LARGE",
        message: "Ukuran request melebihi batas yang diizinkan.",
      };
    }
  }

  let rawBody;

  try {
    rawBody = await request.text();
  } catch {
    return {
      ok: false,
      status: 400,
      code: "BODY_READ_FAILED",
      message: "Body request tidak dapat dibaca.",
    };
  }

  const actualBytes = new TextEncoder().encode(rawBody).byteLength;

  if (actualBytes > CONFIG.MAX_BODY_BYTES) {
    return {
      ok: false,
      status: 413,
      code: "BODY_TOO_LARGE",
      message: "Ukuran request melebihi batas yang diizinkan.",
    };
  }

  let body;

  try {
    body = JSON.parse(rawBody);
  } catch {
    return {
      ok: false,
      status: 400,
      code: "INVALID_JSON",
      message: "Body harus berupa JSON yang valid.",
    };
  }

  if (!isPlainObject(body)) {
    return {
      ok: false,
      status: 400,
      code: "INVALID_BODY",
      message: "Body JSON harus berupa objek.",
    };
  }

  return {
    ok: true,
    body,
  };
}

async function handleChat(request, env) {
  const corsHeaders = getCorsHeaders(request);

  if (hasInvalidOrigin(request)) {
    return apiError(
      "ORIGIN_NOT_ALLOWED",
      "Origin request tidak diizinkan.",
      403,
      corsHeaders
    );
  }

  if (request.method !== "POST") {
    return apiError(
      "METHOD_NOT_ALLOWED",
      "Gunakan metode POST untuk endpoint ini.",
      405,
      {
        ...corsHeaders,
        allow: "POST, OPTIONS",
      }
    );
  }

  const parsed = await readJsonBody(request);

  if (!parsed.ok) {
    return apiError(
      parsed.code,
      parsed.message,
      parsed.status,
      corsHeaders
    );
  }

  const body = parsed.body;

  const message =
    typeof body.message === "string"
      ? body.message.trim()
      : "";

  if (!message) {
    return apiError(
      "MESSAGE_REQUIRED",
      "Kolom message wajib diisi.",
      400,
      corsHeaders
    );
  }

  if (message.length > CONFIG.MAX_MESSAGE_CHARS) {
    return apiError(
      "MESSAGE_TOO_LONG",
      `Pesan maksimal ${CONFIG.MAX_MESSAGE_CHARS} karakter.`,
      413,
      corsHeaders
    );
  }

  if (!env.AI || typeof env.AI.run !== "function") {
    console.error("CerdikChat configuration error: AI binding missing.");

    return apiError(
      "AI_BINDING_MISSING",
      "Binding Workers AI belum tersedia. Periksa konfigurasi Cloudflare.",
      500,
      corsHeaders
    );
  }

  const history = normalizeHistory(body.history);

  const messages = [
    {
      role: "system",
      content: SYSTEM_INSTRUCTION,
    },
    ...history,
    {
      role: "user",
      content: message,
    },
  ];

  try {
    const result = await env.AI.run(CONFIG.MODEL, {
      messages,
      max_tokens: CONFIG.MAX_OUTPUT_TOKENS,
      chat_template_kwargs: {
        enable_thinking: false,
      },
    });

    const reply = extractReply(result);

    if (!reply) {
      console.error("CerdikChat: empty or unrecognized model response.");

      return apiError(
        "EMPTY_MODEL_RESPONSE",
        "Model tidak mengembalikan jawaban yang dapat dibaca. Coba lagi.",
        502,
        corsHeaders
      );
    }

    return jsonResponse(
      {
        reply,
        response: reply,
        model: CONFIG.MODEL,
      },
      200,
      corsHeaders
    );
  } catch (error) {
    // Never log prompts, conversation contents, secrets,
    // or the full provider error.
    const code = safeErrorCode(error);

    console.error("CerdikChat Workers AI request failed:", code);

    const status = code === "AI_QUOTA_EXCEEDED" ? 429 : 502;

    return apiError(
      code,
      publicErrorMessage(code),
      status,
      corsHeaders
    );
  }
}

function addSecurityHeaders(response) {
  const headers = new Headers(response.headers);

  for (const [key, value] of Object.entries(securityHeaders())) {
    headers.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === CONFIG.API_PATH) {
      const corsHeaders = getCorsHeaders(request);

      if (hasInvalidOrigin(request)) {
        return apiError(
          "ORIGIN_NOT_ALLOWED",
          "Origin request tidak diizinkan.",
          403,
          corsHeaders
        );
      }

      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: corsHeaders,
        });
      }

      return handleChat(request, env);
    }

    // Never serve frontend assets for unknown API paths.
    if (url.pathname.startsWith("/api/")) {
      return jsonResponse(
        {
          error: "NOT_FOUND",
          message: "Endpoint API tidak ditemukan.",
        },
        404
      );
    }

    if (env.ASSETS && typeof env.ASSETS.fetch === "function") {
      const response = await env.ASSETS.fetch(request);
      return addSecurityHeaders(response);
    }

    return jsonResponse(
      {
        error: "NOT_FOUND",
        message: "Resource tidak ditemukan.",
      },
      404
    );
  },
};
