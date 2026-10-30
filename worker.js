/**
 * CerdikChat — Cloudflare Workers AI
 * ATLAS-9 Strategic Intelligence System
 *
 * Model: @cf/google/gemma-4-26b-a4b-it
 * Bindings:
 *   env.AI
 *   env.ASSETS
 *   env.CHAT_RATE_LIMITER
 *
 * Security:
 * - Bounded request-body streaming
 * - JSON, HTTP method, origin, and message validation
 * - Approximate per-IP rate limiting
 * - Sanitized errors and minimal logging
 * - No provider API keys or external network/API tool execution
 * - One local allowlisted calculator tool with strict validation
 *
 * Limitations:
 * - No user authentication or persistent conversation storage
 * - Rate limits are approximate and location-local
 * - ATLAS-9 roles are logical roles in one model, not independent agents
 */

"use strict";

const CONFIG = Object.freeze({
  MODEL: "@cf/google/gemma-4-26b-a4b-it",
  API_PATH: "/api/chat",
  MAX_BODY_BYTES: 40 * 1024,
  MAX_MESSAGE_CHARS: 8000,
  MAX_HISTORY_MESSAGES: 12,
  MAX_HISTORY_ITEM_CHARS: 2000,
  MAX_OUTPUT_TOKENS: 1024,
  MAX_TOOL_CALLS: 1,
  MAX_CALC_EXPRESSION_CHARS: 120,
});

const SYSTEM_INSTRUCTION = `
Anda adalah ATLAS, koordinator kecerdasan CerdikChat
dan konsep tim strategis ATLAS-9.

Bantu pengguna dalam riset, analisis, coding, strategi,
ekonomi, sains, dan penulisan profesional.

PERAN ANALITIS:
- ATLAS: koordinasi, sintesis, perencanaan, riset, validasi.
- NEXUS: AI, software engineering, debugging, coding.
- TITAN: rekayasa, robotika, sistem fisik, otomasi.
- SENTINEL: data, statistik, anomali, evaluasi bukti.
- GENESIS: ilmu hayati dan sains.
- TERRA: perikanan, pertanian, pangan, keamanan pangan.
- AEGIS: hukum, keamanan, risiko, kepatuhan, quality assurance.
- ORACLE: ekonomi, keuangan, bisnis, strategi.

Transparansi:
Semua peran di atas merupakan pendekatan analitis dalam satu
model AI. Jangan mengklaim sembilan agen independen sedang berjalan
atau bahwa alat, riset web, pengujian, maupun deployment telah
dilakukan jika tidak ada bukti nyata.

PRINSIP KERJA:
1. Jawab dalam bahasa pengguna; gunakan bahasa Indonesia secara default.
2. Utamakan akurasi, struktur jelas, dan rekomendasi praktis.
3. Bedakan fakta terverifikasi, asumsi, estimasi, dan opini.
4. Jangan mengarang sumber, data, harga, hasil pengujian, atau kemampuan.
5. Untuk coding, prioritaskan solusi aman, sederhana, dan mudah diuji.
6. Jelaskan perubahan dan cara memverifikasi hasilnya.
7. Utamakan solusi gratis atau berbiaya rendah.
8. Jangan melakukan pembelian, mengaktifkan billing, menghapus data,
   atau mengubah sistem eksternal tanpa persetujuan eksplisit.
9. Jangan meminta atau mengungkap API key, token, atau kata sandi.
10. Untuk topik berisiko tinggi, jelaskan batasan dan perlunya verifikasi.
11. Jika informasi penting tidak tersedia, nyatakan keterbatasannya.
12. Untuk perhitungan aritmetika, gunakan tool calculate_expression bila tersedia.
13. Untuk permintaan hitung aritmetika, panggil calculate_expression dan jangan menebak hasilnya.
14. Jangan mengklaim kalkulator dijalankan jika Worker tidak mengembalikan hasil eksekusi.

Format jawaban:
- Ringkasan atau diagnosis
- Rekomendasi utama
- Langkah implementasi
- Risiko dan verifikasi bila relevan
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
  const requestOrigin = new URL(request.url).origin;

  const headers = {
    "vary": "Origin",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "Content-Type",
    "access-control-max-age": "86400",
  };

  if (origin && origin === requestOrigin) {
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

function isSameOriginOrNoOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  return origin === new URL(request.url).origin;
}

function errorResponse(
  code,
  message,
  status,
  corsHeaders = {},
  extraHeaders = {}
) {
  return jsonResponse(
    { error: code, message },
    status,
    { ...corsHeaders, ...extraHeaders }
  );
}

/**
 * Read the body incrementally and stop as soon as the byte limit
 * is exceeded. Content-Length is only an early rejection hint.
 */
async function readBodyLimited(request, maxBytes) {
  const contentLength = request.headers.get("Content-Length");

  if (contentLength !== null) {
    const declaredLength = Number(contentLength);

    if (
      !Number.isSafeInteger(declaredLength) ||
      declaredLength < 0
    ) {
      return { ok: false, reason: "INVALID_LENGTH" };
    }

    if (declaredLength > maxBytes) {
      return { ok: false, reason: "TOO_LARGE" };
    }
  }

  if (!request.body) {
    return { ok: false, reason: "EMPTY_BODY" };
  }

  const reader = request.body.getReader();
  const chunks = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      if (!(value instanceof Uint8Array)) {
        await reader.cancel();
        return { ok: false, reason: "INVALID_BODY" };
      }

      totalBytes += value.byteLength;

      if (totalBytes > maxBytes) {
        await reader.cancel();
        return { ok: false, reason: "TOO_LARGE" };
      }

      chunks.push(value);
    }
  } catch {
    try {
      await reader.cancel();
    } catch {
      // Ignore cancellation errors.
    }

    return { ok: false, reason: "READ_FAILED" };
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // The stream may already be closed.
    }
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;

  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    const text = new TextDecoder("utf-8", {
      fatal: true,
    }).decode(bytes);

    return { ok: true, text };
  } catch {
    return { ok: false, reason: "INVALID_ENCODING" };
  }
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];

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
    typeof error?.message === "string"
      ? error.message
      : "";

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

/**
 * Calculator Tool definition.
 * The model may request this tool, but the Worker validates
 * and executes the function locally.
 */
const CALCULATOR_TOOLS = [
  {
    name: "calculate_expression",
    description:
      "Menghitung ekspresi aritmetika. Mendukung angka, +, -, *, /, dan tanda kurung. Gunakan untuk perhitungan numerik.",
    parameters: {
      type: "object",
      properties: {
        expression: {
          type: "string",
          description:
            "Ekspresi matematika, misalnya (125 * 85000) + 250000",
        },
      },
      required: ["expression"],
    },
  },
];

/**
 * Safe arithmetic parser.
 * Supports:
 * - Addition (+)
 * - Subtraction (-)
 * - Multiplication (*)
 * - Division (/)
 * - Parentheses
 * - Unary plus/minus
 *
 * No eval(), Function(), or dynamic code execution.
 */
function calculateExpression(expression) {
  if (typeof expression !== "string") {
    throw new Error("INVALID_EXPRESSION");
  }

  const source = expression.trim();

  if (
    !source ||
    source.length > CONFIG.MAX_CALC_EXPRESSION_CHARS
  ) {
    throw new Error("INVALID_EXPRESSION_LENGTH");
  }

  const tokens = [];
  let index = 0;

  while (index < source.length) {
    const char = source[index];

    if (/\s/.test(char)) {
      index++;
      continue;
    }

    if ("+-*/()".includes(char)) {
      tokens.push(char);
      index++;
    } else {
      const match = source.slice(index).match(
        /^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/
      );

      if (!match) {
        throw new Error("INVALID_EXPRESSION_TOKEN");
      }

      const value = Number(match[0]);

      if (!Number.isFinite(value) || Math.abs(value) > 1e12) {
        throw new Error("NUMBER_OUT_OF_RANGE");
      }

      tokens.push(value);
      index += match[0].length;
    }

    if (tokens.length > 64) {
      throw new Error("TOO_MANY_TOKENS");
    }
  }

  let position = 0;

  function peek() {
    return tokens[position];
  }

  function consume(expected) {
    if (peek() !== expected) {
      throw new Error("INVALID_EXPRESSION_SYNTAX");
    }

    position++;
  }

  function parsePrimary() {
    const token = peek();

    if (token === "+") {
      position++;
      return parsePrimary();
    }

    if (token === "-") {
      position++;
      return -parsePrimary();
    }

    if (token === "(") {
      position++;

      const value = parseExpression();

      consume(")");
      return value;
    }

    if (typeof token === "number") {
      position++;
      return token;
    }

    throw new Error("INVALID_EXPRESSION_SYNTAX");
  }

  function parseTerm() {
    let value = parsePrimary();

    while (peek() === "*" || peek() === "/") {
      const operator = peek();
      position++;

      const right = parsePrimary();

      if (operator === "*") {
        value *= right;
      } else {
        if (right === 0) {
          throw new Error("DIVISION_BY_ZERO");
        }

        value /= right;
      }

      if (!Number.isFinite(value)) {
        throw new Error("RESULT_OUT_OF_RANGE");
      }
    }

    return value;
  }

  function parseExpression() {
    let value = parseTerm();

    while (peek() === "+" || peek() === "-") {
      const operator = peek();
      position++;

      const right = parseTerm();

      if (operator === "+") {
        value += right;
      } else {
        value -= right;
      }

      if (!Number.isFinite(value)) {
        throw new Error("RESULT_OUT_OF_RANGE");
      }
    }

    return value;
  }

  const result = parseExpression();

  if (position !== tokens.length) {
    throw new Error("INVALID_EXPRESSION_SYNTAX");
  }

  if (!Number.isFinite(result) || Math.abs(result) > 1e18) {
    throw new Error("RESULT_OUT_OF_RANGE");
  }

  return Number(result.toFixed(10));
}

/**
 * Extract tool calls from supported Workers AI response shapes.
 */
function extractToolCalls(result) {
  const calls =
    Array.isArray(result?.tool_calls)
      ? result.tool_calls
      : Array.isArray(result?.choices?.[0]?.message?.tool_calls)
        ? result.choices[0].message.tool_calls
        : [];

  return calls.slice(0, CONFIG.MAX_TOOL_CALLS + 1);
}

/**
 * Validate and execute only explicitly allowlisted tools.
 */
function executeAllowedTool(call) {
  const functionData = call?.function || call;

  const name =
    typeof functionData?.name === "string"
      ? functionData.name
      : "";

  if (name !== "calculate_expression") {
    throw new Error("TOOL_NOT_ALLOWED");
  }

  let args = functionData.arguments;

  if (typeof args === "string") {
    try {
      args = JSON.parse(args);
    } catch {
      throw new Error("INVALID_TOOL_ARGUMENTS");
    }
  }

  if (!isPlainObject(args)) {
    throw new Error("INVALID_TOOL_ARGUMENTS");
  }

  const keys = Object.keys(args);

  if (
    keys.length !== 1 ||
    keys[0] !== "expression" ||
    typeof args.expression !== "string"
  ) {
    throw new Error("INVALID_TOOL_ARGUMENTS");
  }

  const result = calculateExpression(args.expression);

  return {
    name: "calculate_expression",
    executed: true,
    result,
  };
}

/**
 * Format calculator output for the chatbot response.
 */
function formatCalculatorResult(result) {
  const formatted = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 10,
  }).format(result);

  return `Hasil perhitungan: ${formatted}`;
}
async function applyRateLimit(request, env, corsHeaders) {
  if (
    !env.CHAT_RATE_LIMITER ||
    typeof env.CHAT_RATE_LIMITER.limit !== "function"
  ) {
    console.error("CerdikChat configuration error: rate limiter missing.");

    return errorResponse(
      "RATE_LIMITER_MISSING",
      "Perlindungan permintaan belum dikonfigurasi. Silakan coba lagi nanti.",
      503,
      corsHeaders
    );
  }

  const ip = request.headers.get("CF-Connecting-IP");

  if (!ip) {
    return errorResponse(
      "CLIENT_ID_UNAVAILABLE",
      "Identitas jaringan tidak tersedia. Permintaan ditolak.",
      403,
      corsHeaders
    );
  }

  try {
    const { success } = await env.CHAT_RATE_LIMITER.limit({
      key: `chat:${ip}`,
    });

    if (!success) {
      return errorResponse(
        "RATE_LIMIT_EXCEEDED",
        "Terlalu banyak permintaan. Tunggu sebentar sebelum mencoba lagi.",
        429,
        corsHeaders,
        { "retry-after": "60" }
      );
    }

    return null;
  } catch {
    console.error("CerdikChat rate-limit check failed.");

    return errorResponse(
      "RATE_LIMIT_UNAVAILABLE",
      "Perlindungan permintaan sementara tidak tersedia.",
      503,
      corsHeaders
    );
  }
}

async function handleChat(request, env) {
  const corsHeaders = getCorsHeaders(request);

  if (request.method !== "POST") {
    return errorResponse(
      "METHOD_NOT_ALLOWED",
      "Gunakan metode POST untuk endpoint ini.",
      405,
      corsHeaders,
      { allow: "POST, OPTIONS" }
    );
  }

  if (!isSameOriginOrNoOrigin(request)) {
    return errorResponse(
      "ORIGIN_NOT_ALLOWED",
      "Origin permintaan tidak diizinkan.",
      403,
      corsHeaders
    );
  }

  const contentType = request.headers.get("Content-Type") || "";

  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
    return errorResponse(
      "UNSUPPORTED_MEDIA_TYPE",
      "Content-Type harus application/json.",
      415,
      corsHeaders
    );
  }

  const rateLimitError = await applyRateLimit(
    request,
    env,
    corsHeaders
  );

  if (rateLimitError) return rateLimitError;

  const bodyResult = await readBodyLimited(
    request,
    CONFIG.MAX_BODY_BYTES
  );

  if (!bodyResult.ok) {
    if (bodyResult.reason === "TOO_LARGE") {
      return errorResponse(
        "REQUEST_TOO_LARGE",
        "Ukuran permintaan melebihi batas 40 KiB.",
        413,
        corsHeaders
      );
    }

    if (bodyResult.reason === "INVALID_LENGTH") {
      return errorResponse(
        "INVALID_CONTENT_LENGTH",
        "Header Content-Length tidak valid.",
        400,
        corsHeaders
      );
    }

    if (bodyResult.reason === "INVALID_ENCODING") {
      return errorResponse(
        "INVALID_ENCODING",
        "Body harus menggunakan encoding UTF-8 yang valid.",
        400,
        corsHeaders
      );
    }

    return errorResponse(
      "INVALID_BODY",
      "Body permintaan tidak dapat dibaca.",
      400,
      corsHeaders
    );
  }

  let body;

  try {
    body = JSON.parse(bodyResult.text);
  } catch {
    return errorResponse(
      "INVALID_JSON",
      "Body harus berupa JSON yang valid.",
      400,
      corsHeaders
    );
  }

  if (!isPlainObject(body)) {
    return errorResponse(
      "INVALID_BODY",
      "Body JSON harus berupa objek.",
      400,
      corsHeaders
    );
  }

  const message =
    typeof body.message === "string"
      ? body.message.trim()
      : "";

  if (!message) {
    return errorResponse(
      "MESSAGE_REQUIRED",
      "Kolom message wajib diisi.",
      400,
      corsHeaders
    );
  }

  if (message.length > CONFIG.MAX_MESSAGE_CHARS) {
    return errorResponse(
      "MESSAGE_TOO_LONG",
      "Pesan melebihi batas 8.000 karakter.",
      413,
      corsHeaders
    );
  }

  if (!env.AI || typeof env.AI.run !== "function") {
    console.error("CerdikChat configuration error: AI binding missing.");

    return errorResponse(
      "AI_BINDING_MISSING",
      "Binding Workers AI belum tersedia. Periksa konfigurasi.",
      503,
      corsHeaders
    );
  }

  const history = normalizeHistory(body.history);

  const messages = [
    { role: "system", content: SYSTEM_INSTRUCTION },
    ...history,
    { role: "user", content: message },
  ];

  try {
    const result = await env.AI.run(CONFIG.MODEL, {
      messages,
      tools: CALCULATOR_TOOLS,
      tool_choice: "auto",
      parallel_tool_calls: false,
      max_tokens: CONFIG.MAX_OUTPUT_TOKENS,
      chat_template_kwargs: {
        enable_thinking: false,
      },
    });

    const toolCalls = extractToolCalls(result);

    if (toolCalls.length > 0) {
      if (toolCalls.length > CONFIG.MAX_TOOL_CALLS) {
        return errorResponse(
          "TOO_MANY_TOOL_CALLS",
          "Jumlah pemanggilan tool melebihi batas yang diizinkan.",
          400,
          corsHeaders
        );
      }

      const toolResult = executeAllowedTool(toolCalls[0]);

      return jsonResponse(
        {
          reply: formatCalculatorResult(toolResult.result),
          model: CONFIG.MODEL,
          tool: toolResult,
        },
        200,
        corsHeaders
      );
    }

    const reply = extractReply(result);

    if (!reply) {
      console.error("CerdikChat model returned an empty response.");

      return errorResponse(
        "EMPTY_MODEL_RESPONSE",
        "Model tidak mengembalikan jawaban yang dapat dibaca. Silakan coba lagi.",
        502,
        corsHeaders
      );
    }

    return jsonResponse(
      {
        reply,
        model: CONFIG.MODEL,
        tool: {
          name: "calculate_expression",
          executed: false,
        },
      },
      200,
      corsHeaders
    );
  } catch (error) {
    const code = safeErrorCode(error);

    console.error("CerdikChat AI request failed:", code);

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
      messagesByCode[code] || messagesByCode.AI_REQUEST_FAILED,
      status,
      corsHeaders
    );
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = getCorsHeaders(request);

    if (url.pathname === CONFIG.API_PATH) {
      if (request.method === "OPTIONS") {
        if (!isSameOriginOrNoOrigin(request)) {
          return errorResponse(
            "ORIGIN_NOT_ALLOWED",
            "Origin permintaan tidak diizinkan.",
            403,
            corsHeaders
          );
        }

        return new Response(null, {
          status: 204,
          headers: corsHeaders,
        });
      }

      return handleChat(request, env);
    }

    if (env.ASSETS && typeof env.ASSETS.fetch === "function") {
      const assetResponse = await env.ASSETS.fetch(request);

      const headers = new Headers(assetResponse.headers);
      headers.set("x-content-type-options", "nosniff");
      headers.set("referrer-policy", "no-referrer");
      headers.set("x-frame-options", "DENY");

      return new Response(assetResponse.body, {
        status: assetResponse.status,
        statusText: assetResponse.statusText,
        headers,
      });
    }

    return errorResponse(
      "NOT_FOUND",
      "Endpoint tidak ditemukan.",
      404
    );
  },
};
