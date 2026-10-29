/**
 * CerdikChat — Cloudflare Workers AI
 * ATLAS-9 Strategic Intelligence System
 *
 * Primary model: @cf/zai-org/glm-4.7-flash
 * Binding: env.AI
 * Assets: env.ASSETS
 *
 * Security objectives:
 * - No provider API keys in source code.
 * - Bounded request body and message/history sizes.
 * - Validate JSON, roles, and message content.
 * - Same-origin browser requests only when Origin is present.
 * - No prompt or response content in error logs.
 *
 * Important:
 * - CORS is not authentication.
 * - Rate limiting and user authentication are not implemented here.
 * - This Worker does not execute external tools or actions.
 */

const CONFIG = Object.freeze({
  MODEL: "@cf/zai-org/glm-4.7-flash",

  MAX_BODY_BYTES: 40 * 1024,
  MAX_MESSAGE_CHARS: 8000,
  MAX_HISTORY_MESSAGES: 12,
  MAX_HISTORY_ITEM_CHARS: 2000,
  MAX_OUTPUT_TOKENS: 1024,

  API_PATH: "/api/chat",
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

BATASAN IDENTITAS:
Nama tersebut adalah peran analitis dalam satu model AI.
Jangan mengklaim bahwa sembilan agen independen sedang berjalan
atau bahwa spesialis benar-benar dipanggil.

BATASAN TINDAKAN:
Jangan mengklaim telah melakukan riset web, menjalankan kode,
mengubah repository, menguji sistem, atau melakukan deployment
kecuali tersedia bukti bahwa tindakan itu benar-benar dilakukan.
Jangan mengklaim memiliki database internal, autentikasi,
pemantauan keamanan, atau penguncian sistem yang belum terbukti.

PRINSIP KERJA:
1. Jawab dalam bahasa pengguna; gunakan bahasa Indonesia secara default.
2. Utamakan akurasi, struktur jelas, dan rekomendasi praktis.
3. Bedakan fakta, asumsi, estimasi, dan opini.
4. Jangan mengarang sumber, data, harga, hasil tes, atau kemampuan.
5. Untuk coding, prioritaskan solusi aman dan mudah diuji.
6. Jelaskan perubahan kode dan cara memverifikasi hasilnya.
7. Untuk riset, jelaskan keterbatasan sumber dan data bila relevan.
8. Utamakan solusi gratis atau berbiaya rendah.
9. Jangan mengaktifkan billing, membeli, menghapus data, atau
   mengubah sistem eksternal tanpa persetujuan eksplisit pengguna.
10. Jangan meminta atau menampilkan API key, token, atau kata sandi.
11. Jangan menyebut klaim keamanan sebagai fakta tanpa bukti.
12. Untuk topik kesehatan, keselamatan, hukum, dan keuangan,
    jelaskan risiko dan perlunya verifikasi profesional bila perlu.
13. Jika informasi penting tidak tersedia, nyatakan keterbatasan
    atau ajukan pertanyaan klarifikasi yang paling menentukan.

FORMAT JAWABAN:
- Ringkasan atau diagnosis.
- Rekomendasi utama.
- Langkah implementasi atau contoh.
- Risiko, batasan, dan verifikasi bila relevan.
`.trim();

const JSON_HEADERS = Object.freeze({
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
  "x-frame-options": "DENY",
});

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...JSON_HEADERS,
      ...extraHeaders,
    },
  });
}

function getCorsHeaders(request) {
  const origin = request.headers.get("Origin");
  const requestUrl = new URL(request.url);

  const headers = {
    "vary": "Origin",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "Content-Type",
    "access-control-max-age": "86400",
  };

  if (origin && origin === requestUrl.origin) {
    headers["access-control-allow-origin"] = origin;
  }

  return headers;
}

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function makeInputError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

async function readJsonBody(request) {
  const contentType = request.headers.get("Content-Type") || "";

  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
    throw makeInputError("UNSUPPORTED_MEDIA_TYPE");
  }

  const declaredLength = Number(
    request.headers.get("Content-Length")
  );

  if (
    Number.isFinite(declaredLength) &&
    declaredLength > CONFIG.MAX_BODY_BYTES
  ) {
    throw makeInputError("BODY_TOO_LARGE");
  }

  if (!request.body) {
    throw makeInputError("INVALID_JSON");
  }

  const reader = request.body.getReader();
  const chunks = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      totalBytes += value.byteLength;

      if (totalBytes > CONFIG.MAX_BODY_BYTES) {
        await reader.cancel();
        throw makeInputError("BODY_TOO_LARGE");
      }

      chunks.push(value);
    }
  } catch (error) {
    if (
      error &&
      typeof error.code === "string" &&
      error.code.startsWith("BODY_")
    ) {
      throw error;
    }

    throw makeInputError("INVALID_JSON");
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;

  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  let text;

  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw makeInputError("INVALID_JSON");
  }

  try {
    return JSON.parse(text);
  } catch {
    throw makeInputError("INVALID_JSON");
  }
}

/**
 * Accept only complete user/assistant pairs.
 * Client-supplied history is untrusted and is never treated as system input.
 */
function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];

  const pairs = [];
  let pendingUser = null;

  for (const item of history) {
    if (!isPlainObject(item)) continue;
    if (typeof item.content !== "string") continue;

    const content = item.content
      .trim()
      .slice(0, CONFIG.MAX_HISTORY_ITEM_CHARS);

    if (!content) continue;

    if (item.role === "user") {
      // A new user message discards an incomplete earlier turn.
      pendingUser = { role: "user", content };
      continue;
    }

    if (item.role === "assistant" && pendingUser) {
      pairs.push([
        pendingUser,
        { role: "assistant", content },
      ]);

      pendingUser = null;
    }
  }

  return pairs
    .slice(-Math.floor(CONFIG.MAX_HISTORY_MESSAGES / 2))
    .flat();
}

function extractReply(result) {
  if (typeof result === "string") {
    return result.trim();
  }

  if (typeof result?.response === "string") {
    return result.response.trim();
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

  if (typeof result?.output_text === "string") {
    return result.output_text.trim();
  }

  return "";
}

function safeErrorCode(error) {
  const message =
    typeof error?.message === "string" ? error.message : "";

  if (/daily.*allocation|neurons.*limit|quota/i.test(message)) {
    return "AI_QUOTA_EXCEEDED";
  }

  if (/model.*not found|unknown model|does not exist/i.test(message)) {
    return "AI_MODEL_UNAVAILABLE";
  }

  if (/timeout|timed out|abort/i.test(message)) {
    return "AI_TIMEOUT";
  }

  return "AI_REQUEST_FAILED";
}

function errorResponse(code, status, corsHeaders, message) {
  return jsonResponse(
    { error: code, message },
    status,
    corsHeaders
  );
}

async function handleChat(request, env) {
  const corsHeaders = getCorsHeaders(request);
  const origin = request.headers.get("Origin");
  const requestUrl = new URL(request.url);

  // Reject explicitly foreign browser origins.
  // Requests without Origin are not authenticated by this check.
  if (origin && origin !== requestUrl.origin) {
    return errorResponse(
      "ORIGIN_NOT_ALLOWED",
      403,
      corsHeaders,
      "Origin permintaan tidak diizinkan."
    );
  }

  if (request.method !== "POST") {
    return errorResponse(
      "METHOD_NOT_ALLOWED",
      405,
      corsHeaders,
      "Gunakan metode POST untuk endpoint ini."
    );
  }

  let body;

  try {
    body = await readJsonBody(request);
  } catch (error) {
    const code =
      typeof error?.code === "string"
        ? error.code
        : "INVALID_JSON";

    const inputErrors = {
      UNSUPPORTED_MEDIA_TYPE: {
        status: 415,
        message: "Content-Type harus application/json.",
      },
      BODY_TOO_LARGE: {
        status: 413,
        message: "Ukuran request melebihi batas yang diizinkan.",
      },
      INVALID_JSON: {
        status: 400,
        message: "Body harus berupa JSON UTF-8 yang valid.",
      },
    };

    const details = inputErrors[code] || inputErrors.INVALID_JSON;

    return errorResponse(
      code,
      details.status,
      corsHeaders,
      details.message
    );
  }

  if (!isPlainObject(body)) {
    return errorResponse(
      "INVALID_BODY",
      400,
      corsHeaders,
      "Body JSON harus berupa objek."
    );
  }

  const message =
    typeof body.message === "string"
      ? body.message.trim()
      : "";

  if (!message) {
    return errorResponse(
      "MESSAGE_REQUIRED",
      400,
      corsHeaders,
      "Kolom message wajib diisi."
    );
  }

  if (message.length > CONFIG.MAX_MESSAGE_CHARS) {
    return errorResponse(
      "MESSAGE_TOO_LONG",
      413,
      corsHeaders,
      `Pesan melebihi batas ${CONFIG.MAX_MESSAGE_CHARS} karakter.`
    );
  }

  if (!env.AI || typeof env.AI.run !== "function") {
    console.error("CerdikChat configuration error: AI binding missing.");

    return errorResponse(
      "AI_BINDING_MISSING",
      500,
      corsHeaders,
      "Binding Workers AI belum tersedia. Periksa konfigurasi Worker."
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
      console.error("CerdikChat model response empty or unrecognized.");

      return errorResponse(
        "EMPTY_MODEL_RESPONSE",
        502,
        corsHeaders,
        "Model tidak mengembalikan jawaban yang dapat dibaca. Coba lagi."
      );
    }

    return jsonResponse(
      {
        reply,
        // Retained for compatibility with clients using either field.
        response: reply,
        model: CONFIG.MODEL,
      },
      200,
      corsHeaders
    );
  } catch (error) {
    // Never log prompts, message content, API keys, or full provider errors.
    const code = safeErrorCode(error);

    console.error("CerdikChat Workers AI request failed:", code);

    const status = code === "AI_QUOTA_EXCEEDED" ? 429 : 502;

    const messagesByCode = {
      AI_QUOTA_EXCEEDED:
        "Kuota harian Workers AI mungkin telah tercapai. Coba lagi nanti.",
      AI_MODEL_UNAVAILABLE:
        "Model AI tidak tersedia atau ID model tidak dikenali.",
      AI_TIMEOUT:
        "Permintaan ke model melewati batas waktu. Silakan coba lagi.",
      AI_REQUEST_FAILED:
        "Permintaan ke model gagal. Periksa Cloudflare Logs.",
    };

    return errorResponse(
      code,
      status,
      corsHeaders,
      messagesByCode[code] || messagesByCode.AI_REQUEST_FAILED
    );
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === CONFIG.API_PATH) {
      const corsHeaders = getCorsHeaders(request);
      const origin = request.headers.get("Origin");

      if (origin && origin !== url.origin) {
        return errorResponse(
          "ORIGIN_NOT_ALLOWED",
          403,
          corsHeaders,
          "Origin permintaan tidak diizinkan."
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

    // Serve frontend and static assets through Cloudflare Assets.
    if (env.ASSETS && typeof env.ASSETS.fetch === "function") {
      return env.ASSETS.fetch(request);
    }

    return jsonResponse(
      {
        error: "NOT_FOUND",
        message: "Endpoint tidak ditemukan.",
      },
      404
    );
  },
};
