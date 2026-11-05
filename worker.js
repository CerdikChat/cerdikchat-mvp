/**
 * CerdikChat — ATLAS-9
 * Cloudflare Workers AI
 *
 * Model: @cf/google/gemma-4-26b-a4b-it
 *
 * Required bindings:
 *   env.AI
 *   env.ASSETS
 *   env.CHAT_RATE_LIMITER
 *
 * Features:
 * - Real-time date, year and timezone context
 * - Deterministic calculator routing
 * - Safe local arithmetic parser
 * - Input validation and bounded request body
 * - Per-IP rate limiting
 * - Minimal, privacy-conscious observability
 *
 * Limitations:
 * - Optional Google authentication (enforced when GOOGLE_AUTH_REQUIRED=true)
 * - No persistent conversation storage
 * - No external live-news or financial-data retrieval
 */

"use strict";

import { authConfig, googleLogin, currentSession, logout, requireSession } from "./auth/google-auth.js";
import { handleFileAnalysis } from "./multimodal/file-analysis.js";
import { handleVoiceTranscription } from "./multimodal/voice-assistance.js";
import { submitFeatureRequest } from "./feature-requests.js";
import { adminSession, pendingAdminUsers, decideAccessRequest, adminFeatureRequests, archiveFeatureRequest } from "./admin-portal.js";

/* =========================================================
   1. CONFIGURATION
========================================================= */

const CONFIG = Object.freeze({
  MODEL: "@cf/google/gemma-4-26b-a4b-it",
  API_PATH: "/api/chat",

  // Default timezone when Cloudflare does not provide one.
  DEFAULT_TIME_ZONE: "Asia/Makassar",

  MAX_BODY_BYTES: 40 * 1024,
  MAX_MESSAGE_CHARS: 8000,
  MAX_HISTORY_MESSAGES: 12,
  MAX_HISTORY_ITEM_CHARS: 2000,
  MAX_OUTPUT_TOKENS: 1024,

  MAX_TOOL_CALLS: 1,
  MAX_CALC_EXPRESSION_CHARS: 120,
});

/* =========================================================
   2. ATLAS-9 SYSTEM INSTRUCTION
========================================================= */

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

TRANSPARANSI:
Semua peran merupakan pendekatan analitis dalam satu model AI.
Jangan mengklaim sembilan agen independen sedang berjalan.

REAL-TIME DATE AND TIME:
- Gunakan tanggal dan waktu runtime yang diberikan sistem.
- Jangan mengarang tanggal, hari, bulan, tahun, atau zona waktu.
- Jika pengguna bertanya tanggal atau tahun sekarang,
  prioritaskan runtime context.
- Jangan menggunakan tanggal dari percakapan lama sebagai tanggal sekarang.
- Jika timezone tidak tersedia, jelaskan zona waktu fallback.
- Timestamp runtime bukan bukti bahwa berita, harga, kurs,
  atau informasi internet lainnya sudah diperbarui.
- Bedakan waktu sekarang dengan tanggal peristiwa historis
  atau tanggal yang diberikan pengguna.

PRINSIP KERJA:
1. Jawab dalam bahasa pengguna; bahasa Indonesia sebagai default.
2. Utamakan akurasi dan struktur yang jelas.
3. Bedakan fakta, asumsi, estimasi, dan opini.
4. Jangan mengarang sumber, data, harga, atau hasil pengujian.
5. Untuk coding, prioritaskan solusi aman dan mudah diuji.
6. Jelaskan perubahan dan cara memverifikasinya.
7. Utamakan solusi gratis atau berbiaya rendah.
8. Jangan mengaktifkan billing atau melakukan pembelian
   tanpa persetujuan eksplisit.
9. Jangan meminta atau mengungkap API key, token, atau password.
10. Untuk topik berisiko tinggi, jelaskan batasan dan perlunya verifikasi.
11. Jika informasi tidak tersedia, nyatakan keterbatasannya.
12. Untuk perhitungan aritmetika, gunakan kalkulator Worker
    jika permintaan telah diarahkan ke kalkulator.
13. Jangan mengklaim tool dijalankan jika tidak dieksekusi.

FORMAT JAWABAN:
- Ringkasan atau diagnosis
- Rekomendasi utama
- Langkah implementasi
- Risiko dan verifikasi bila relevan
`.trim();

/* =========================================================
   3. REAL-TIME DATE AND TIME ENGINE
========================================================= */

/**
 * Resolve a valid timezone.
 * Cloudflare may provide request.cf.timezone.
 * Use configured fallback if unavailable or invalid.
 */
function resolveTimeZone(request) {
  const supplied =
    typeof request?.cf?.timezone === "string"
      ? request.cf.timezone
      : "";

  if (supplied) {
    try {
      new Intl.DateTimeFormat("en-US", {
        timeZone: supplied,
      });

      return {
        timeZone: supplied,
        source: "cloudflare",
      };
    } catch {
      // Continue to configured fallback.
    }
  }

  return {
    timeZone: CONFIG.DEFAULT_TIME_ZONE,
    source: "configured_fallback",
  };
}

/**
 * Build fresh date/time context for every request.
 *
 * Date is generated at runtime.
 * It is never hardcoded to a particular year.
 */
function getRuntimeDateContext(request) {
  const now = new Date();
  const resolved = resolveTimeZone(request);
  const timeZone = resolved.timeZone;

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const values = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] = part.value;
    }
  }

  const dateISO =
    `${values.year}-${values.month}-${values.day}`;

  const localTime =
    `${values.hour}:${values.minute}:${values.second}`;

  const localDateTime =
    `${dateISO} ${localTime}`;

  const displayDate = new Intl.DateTimeFormat("id-ID", {
    timeZone,
    dateStyle: "full",
  }).format(now);

  return {
    currentDate: dateISO,
    currentYear: Number(values.year),
    currentWeekday: values.weekday,
    currentTime: localTime,
    localDateTime,
    displayDate,
    timeZone,
    timeZoneSource: resolved.source,
    utcTimestamp: now.toISOString(),
  };
}

/**
 * Append runtime date context to the system instruction.
 * Rebuilt for every incoming request.
 */
function buildSystemInstruction(runtime) {
  return `${SYSTEM_INSTRUCTION}

=================================================
CERDIKCHAT RUNTIME CLOCK — AUTOMATICALLY UPDATED
=================================================

Current date: ${runtime.currentDate}
Current year: ${runtime.currentYear}
Current weekday: ${runtime.currentWeekday}
Current local date and time: ${runtime.localDateTime}
Formatted date: ${runtime.displayDate}
Timezone: ${runtime.timeZone}
Timezone source: ${runtime.timeZoneSource}
UTC timestamp: ${runtime.utcTimestamp}

This information was generated by the Worker runtime
for this request. Treat it as the authoritative clock
context for questions about the present date and time.
`;
}

/* =========================================================
   4. STANDARD RESPONSE AND SECURITY HEADERS
========================================================= */

const JSON_HEADERS = Object.freeze({
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
  "x-frame-options": "DENY",
  "strict-transport-security": "max-age=31536000; includeSubDomains",
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
    vary: "Origin",
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
  const fetchSite = request.headers.get("Sec-Fetch-Site");

  // This public web UI is browser-origin scoped. Reject requests
  // without Origin rather than treating missing Origin as trusted.
  // Origin checks are CSRF hardening, NOT user authentication.
  if (!origin || origin !== new URL(request.url).origin) {
    return false;
  }

  // Browser fetch metadata provides a second, independent CSRF signal.
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") {
    return false;
  }

  return true;
}

function errorResponse(
  code,
  message,
  status,
  corsHeaders = {},
  extraHeaders = {}
) {
  return jsonResponse(
    {
      error: code,
      message,
    },
    status,
    {
      ...corsHeaders,
      ...extraHeaders,
    }
  );
}

/* =========================================================
   5. BOUNDED REQUEST BODY READER
========================================================= */

async function readBodyLimited(request, maxBytes) {
  const contentLength =
    request.headers.get("Content-Length");

  if (contentLength !== null) {
    const declaredLength = Number(contentLength);

    if (
      !Number.isSafeInteger(declaredLength) ||
      declaredLength < 0
    ) {
      return {
        ok: false,
        reason: "INVALID_LENGTH",
      };
    }

    if (declaredLength > maxBytes) {
      return {
        ok: false,
        reason: "TOO_LARGE",
      };
    }
  }

  if (!request.body) {
    return {
      ok: false,
      reason: "EMPTY_BODY",
    };
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

        return {
          ok: false,
          reason: "INVALID_BODY",
        };
      }

      totalBytes += value.byteLength;

      if (totalBytes > maxBytes) {
        await reader.cancel();

        return {
          ok: false,
          reason: "TOO_LARGE",
        };
      }

      chunks.push(value);
    }
  } catch {
    try {
      await reader.cancel();
    } catch {
      // Ignore cancellation errors.
    }

    return {
      ok: false,
      reason: "READ_FAILED",
    };
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // Stream may already be closed.
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

    return {
      ok: true,
      text,
    };
  } catch {
    return {
      ok: false,
      reason: "INVALID_ENCODING",
    };
  }
}

/* =========================================================
   6. HISTORY VALIDATION
========================================================= */

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .filter(isPlainObject)
    .filter(
      (item) =>
        item.role === "user" ||
        item.role === "assistant"
    )
    .filter(
      (item) => typeof item.content === "string"
    )
    .map((item) => ({
      role: item.role,
      content: item.content
        .trim()
        .slice(0, CONFIG.MAX_HISTORY_ITEM_CHARS),
    }))
    .filter((item) => item.content.length > 0)
    .slice(-CONFIG.MAX_HISTORY_MESSAGES);
}

/* =========================================================
   7. MODEL RESPONSE EXTRACTION
========================================================= */

function extractReply(result) {
  if (typeof result === "string") {
    return result.trim();
  }

  if (typeof result?.response === "string") {
    return result.response.trim();
  }

  const content =
    result?.choices?.[0]?.message?.content;

  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) =>
        typeof part?.text === "string"
          ? part.text
          : ""
      )
      .join("")
      .trim();
  }

  if (typeof result?.output_text === "string") {
    return result.output_text.trim();
  }

  return "";
}
/* =========================================================
   8. ERROR CLASSIFICATION
========================================================= */

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

/* =========================================================
   9. CALCULATOR TOOL DEFINITION
========================================================= */

const CALCULATOR_TOOLS = [
  {
    name: "calculate_expression",
    description:
      "Menghitung ekspresi aritmetika dengan operator +, -, *, / dan tanda kurung. Gunakan untuk perhitungan numerik.",
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

/* =========================================================
   10. SAFE ARITHMETIC PARSER
========================================================= */

/**
 * Supports:
 * - Addition (+)
 * - Subtraction (-)
 * - Multiplication (*)
 * - Division (/)
 * - Parentheses
 * - Unary plus/minus
 *
 * Does not use eval() or Function().
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

      if (
        !Number.isFinite(value) ||
        Math.abs(value) > 1e12
      ) {
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

  if (
    !Number.isFinite(result) ||
    Math.abs(result) > 1e18
  ) {
    throw new Error("RESULT_OUT_OF_RANGE");
  }

  return Number(result.toFixed(10));
}

/* =========================================================
   11. DETERMINISTIC EXPRESSION EXTRACTION
========================================================= */

/**
 * Only route messages with explicit calculation intent.
 *
 * Dates, years, phone numbers and ordinary numeric references
 * must not be interpreted as arithmetic automatically.
 */
function extractDeterministicExpression(message) {
  if (typeof message !== "string") return null;

  const intentPattern =
    /\b(hitung|perhitung(?:an)?|kalkulasi|kalkulator|calculate|calculation|compute|berapa\s+hasil|hasil\s+dari|jumlahkan|kurangkan|kalikan|bagikan)\b/i;

  if (!intentPattern.test(message)) {
    return null;
  }

  const candidates =
    message.match(/[0-9eE.+\-*/()\s]+/g) || [];

  const valid = [];

  for (const candidate of candidates) {
    const expression = candidate.trim();

    if (
      !expression ||
      !/[+\-*/]/.test(expression)
    ) {
      continue;
    }

    // Protect ISO-style dates such as 2026-10-30.
    if (
      /^\d{4}-\d{1,2}-\d{1,2}\.?$/.test(expression)
    ) {
      continue;
    }

    // Protect ordinary date-like slash notation.
    if (
      /^\d{1,2}\/\d{1,2}\/\d{2,4}\.?$/.test(expression)
    ) {
      continue;
    }

    try {
      const result = calculateExpression(expression);

      valid.push({
        expression,
        result,
      });
    } catch (error) {
      // Division by zero must be routed to the calculator
      // so the Worker can explicitly reject it.
      if (error?.message === "DIVISION_BY_ZERO") {
        valid.push({
          expression,
          error: "DIVISION_BY_ZERO",
        });
      }
    }
  }

  if (valid.length === 0) {
    return null;
  }

  // Prefer the longest complete valid expression.
  valid.sort(
    (a, b) =>
      b.expression.length - a.expression.length
  );

  return valid[0];
}

/* =========================================================
   12. DETERMINISTIC CALCULATOR EXECUTION
========================================================= */

function executeDeterministicCalculation(calculation) {
  if (
    !calculation ||
    typeof calculation !== "object"
  ) {
    throw new Error("INVALID_CALCULATION");
  }

  if (calculation.error === "DIVISION_BY_ZERO") {
    throw new Error("DIVISION_BY_ZERO");
  }

  if (
    typeof calculation.result !== "number" ||
    !Number.isFinite(calculation.result)
  ) {
    throw new Error("INVALID_CALCULATION_RESULT");
  }

  return {
    name: "calculate_expression",
    executed: true,
    result: calculation.result,
    route: "deterministic",
  };
}

/* =========================================================
   13. MODEL-DIRECTED TOOL CALL EXTRACTION
========================================================= */

function extractToolCalls(result) {
  const calls =
    Array.isArray(result?.tool_calls)
      ? result.tool_calls
      : Array.isArray(
          result?.choices?.[0]?.message?.tool_calls
        )
        ? result.choices[0].message.tool_calls
        : [];

  return calls.slice(0, CONFIG.MAX_TOOL_CALLS + 1);
}

/* =========================================================
   14. ALLOWLISTED TOOL EXECUTION
========================================================= */

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
    route: "model_directed",
  };
}

/* =========================================================
   15. CALCULATOR RESULT FORMATTING
========================================================= */

function formatCalculatorResult(result) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 10,
  }).format(result);
}
/* =========================================================
   16. RATE LIMITER
========================================================= */

async function applyRateLimit(request, env, corsHeaders, identityEmail = null) {
  if (
    !env.CHAT_RATE_LIMITER ||
    typeof env.CHAT_RATE_LIMITER.limit !== "function"
  ) {
    console.error("CERDIKCHAT_CONFIG_ERROR", {
      reason: "RATE_LIMITER_MISSING",
    });

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
      key: identityEmail ? `chat:user:${identityEmail.toLowerCase()}` : `chat:ip:${ip}`,
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
    console.error("CERDIKCHAT_RATE_LIMIT_ERROR");

    return errorResponse(
      "RATE_LIMIT_UNAVAILABLE",
      "Perlindungan permintaan sementara tidak tersedia.",
      503,
      corsHeaders
    );
  }
}

/* =========================================================
   17. DETERMINISTIC CALCULATOR RESPONSE
========================================================= */

function buildCalculatorResponse(calculation, corsHeaders) {
  try {
    const result =
      executeDeterministicCalculation(calculation);

    console.log("CERDIKCHAT_TOOL_EXECUTION", {
      tool: result.name,
      executed: true,
      route: result.route,
    });

    return jsonResponse(
      {
        reply: `Hasil perhitungan: ${formatCalculatorResult(
          result.result
        )}`,
        model: CONFIG.MODEL,
        tool: result,
      },
      200,
      corsHeaders
    );
  } catch (error) {
    const errorCode =
      error?.message === "DIVISION_BY_ZERO"
        ? "DIVISION_BY_ZERO"
        : "CALCULATOR_EXECUTION_FAILED";

    console.warn("CERDIKCHAT_TOOL_EXECUTION_FAILED", {
      tool: "calculate_expression",
      error: errorCode,
      route: "deterministic",
    });

    const errorMessage =
      errorCode === "DIVISION_BY_ZERO"
        ? "Perhitungan tidak valid: pembagian dengan nol tidak diperbolehkan."
        : "Kalkulator gagal menjalankan perhitungan.";

    return errorResponse(
      "CALCULATOR_ERROR",
      errorMessage,
      400,
      corsHeaders
    );
  }
}

/* =========================================================
   18. MAIN CHAT HANDLER
========================================================= */

async function handleChat(request, env, ctx) {
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

  // Private-pilot mode is opt-in. Enable only after Worker-level
  // Cloudflare Access is configured for every production hostname.
  let authenticatedSubject = null;
  let pilotEmail = null;
  if (env.GOOGLE_AUTH_REQUIRED === "true") {
    const session = await requireSession(request, env);
    if (!session.ok) {
      return errorResponse("AUTH_REQUIRED", "Silakan masuk menggunakan akun Google yang diizinkan.", 401, corsHeaders);
    }
    authenticatedSubject = session.subject;
  }
  if (env.PILOT_ACCESS_REQUIRED === "true") {
    if (!ctx?.access || typeof ctx.access.getIdentity !== "function") {
      return errorResponse(
        "PILOT_AUTH_REQUIRED",
        "Akses pilot memerlukan autentikasi Cloudflare Access.",
        401,
        corsHeaders
      );
    }

    try {
      const identity = await ctx.access.getIdentity();
      pilotEmail = typeof identity?.email === "string"
        ? identity.email.trim().toLowerCase()
        : null;
    } catch {
      pilotEmail = null;
    }

    if (!pilotEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pilotEmail)) {
      return errorResponse(
        "PILOT_IDENTITY_INVALID",
        "Identitas pengguna pilot tidak valid.",
        403,
        corsHeaders
      );
    }
  }

  const contentType =
    request.headers.get("Content-Type") || "";

  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
    return errorResponse(
      "UNSUPPORTED_MEDIA_TYPE",
      "Content-Type harus application/json.",
      415,
      corsHeaders
    );
  }

  /* -----------------------------------------------
     RATE LIMIT
  ----------------------------------------------- */

  const rateLimitError = await applyRateLimit(
    request,
    env,
    corsHeaders,
    authenticatedSubject || pilotEmail
  );

  if (rateLimitError) return rateLimitError;

  /* -----------------------------------------------
     REQUEST BODY
  ----------------------------------------------- */

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

  /* -----------------------------------------------
     MESSAGE VALIDATION
  ----------------------------------------------- */

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

  /* -----------------------------------------------
     REAL-TIME DATE AND TIME
  ----------------------------------------------- */

  const runtime = getRuntimeDateContext(request);

  console.log("CERDIKCHAT_RUNTIME_CLOCK", {
    currentDate: runtime.currentDate,
    currentYear: runtime.currentYear,
    timeZone: runtime.timeZone,
    timeZoneSource: runtime.timeZoneSource,
  });

  /* -----------------------------------------------
     DETERMINISTIC CALCULATOR ROUTING
  ----------------------------------------------- */

  const deterministicCalculation =
    extractDeterministicExpression(message);

  if (deterministicCalculation) {
    console.log("CERDIKCHAT_TOOL_ROUTED", {
      tool: "calculate_expression",
      route: "deterministic",
      executed: true,
    });

    return buildCalculatorResponse(
      deterministicCalculation,
      corsHeaders
    );
  }

  /* -----------------------------------------------
     AI BINDING VALIDATION
  ----------------------------------------------- */

  if (!env.AI || typeof env.AI.run !== "function") {
    console.error("CERDIKCHAT_CONFIG_ERROR", {
      reason: "AI_BINDING_MISSING",
    });

    return errorResponse(
      "AI_BINDING_MISSING",
      "Binding Workers AI belum tersedia. Periksa konfigurasi.",
      503,
      corsHeaders
    );
  }

  /* -----------------------------------------------
     BUILD MODEL MESSAGES
  ----------------------------------------------- */

  const history = normalizeHistory(body.history);

  const messages = [
    {
      role: "system",
      content: buildSystemInstruction(runtime),
    },
    ...history,
    {
      role: "user",
      content: message,
    },
  ];

  /* -----------------------------------------------
     MODEL INFERENCE
  ----------------------------------------------- */

  try {
    const result = await env.AI.run(CONFIG.MODEL, {
      messages,
      tools: CALCULATOR_TOOLS,
      max_tokens: CONFIG.MAX_OUTPUT_TOKENS,
      chat_template_kwargs: {
        enable_thinking: false,
      },
    });

    const toolCalls = extractToolCalls(result);

    console.log("CERDIKCHAT_TOOL_DECISION", {
      model: CONFIG.MODEL,
      toolCallDetected: toolCalls.length > 0,
      toolCallCount: toolCalls.length,
    });

    /* ---------------------------------------------
       MODEL-DIRECTED TOOL EXECUTION
    --------------------------------------------- */

    if (toolCalls.length > 0) {
      if (toolCalls.length > CONFIG.MAX_TOOL_CALLS) {
        console.warn("CERDIKCHAT_TOOL_REJECTED", {
          reason: "TOO_MANY_TOOL_CALLS",
          count: toolCalls.length,
        });

        return errorResponse(
          "TOO_MANY_TOOL_CALLS",
          "Jumlah pemanggilan tool melebihi batas yang diizinkan.",
          400,
          corsHeaders
        );
      }

      let toolResult;

      try {
        toolResult = executeAllowedTool(toolCalls[0]);

        console.log("CERDIKCHAT_TOOL_EXECUTION", {
          tool: toolResult.name,
          executed: true,
          route: "model_directed",
        });
      } catch (toolError) {
        const knownErrors = [
          "DIVISION_BY_ZERO",
          "INVALID_EXPRESSION",
          "INVALID_EXPRESSION_LENGTH",
          "INVALID_EXPRESSION_TOKEN",
          "INVALID_EXPRESSION_SYNTAX",
          "INVALID_TOOL_ARGUMENTS",
          "NUMBER_OUT_OF_RANGE",
          "RESULT_OUT_OF_RANGE",
          "TOO_MANY_TOKENS",
          "TOOL_NOT_ALLOWED",
        ];

        const errorCode =
          typeof toolError?.message === "string" &&
          knownErrors.includes(toolError.message)
            ? toolError.message
            : "CALCULATOR_EXECUTION_FAILED";

        console.warn("CERDIKCHAT_TOOL_EXECUTION_FAILED", {
          tool: "calculate_expression",
          error: errorCode,
          route: "model_directed",
        });

        const errorMessages = {
          DIVISION_BY_ZERO:
            "Perhitungan tidak valid: pembagian dengan nol tidak diperbolehkan.",
          INVALID_EXPRESSION:
            "Ekspresi matematika tidak valid.",
          INVALID_EXPRESSION_LENGTH:
            "Ekspresi matematika kosong atau terlalu panjang.",
          INVALID_EXPRESSION_TOKEN:
            "Ekspresi mengandung karakter yang tidak didukung.",
          INVALID_EXPRESSION_SYNTAX:
            "Format ekspresi matematika tidak valid.",
          INVALID_TOOL_ARGUMENTS:
            "Parameter kalkulator tidak valid.",
          NUMBER_OUT_OF_RANGE:
            "Angka melebihi batas kalkulator.",
          RESULT_OUT_OF_RANGE:
            "Hasil perhitungan melebihi batas kalkulator.",
          TOO_MANY_TOKENS:
            "Ekspresi terlalu kompleks untuk kalkulator.",
          TOOL_NOT_ALLOWED:
            "Pemanggilan tool tidak diizinkan.",
          CALCULATOR_EXECUTION_FAILED:
            "Kalkulator gagal menjalankan perhitungan.",
        };

        return errorResponse(
          "CALCULATOR_ERROR",
          errorMessages[errorCode],
          400,
          corsHeaders
        );
      }

      return jsonResponse(
        {
          reply: `Hasil perhitungan: ${formatCalculatorResult(
            toolResult.result
          )}`,
          model: CONFIG.MODEL,
          tool: toolResult,
        },
        200,
        corsHeaders
      );
    }

    /* ---------------------------------------------
       NORMAL MODEL RESPONSE
    --------------------------------------------- */

    console.log("CERDIKCHAT_TOOL_NOT_CALLED", {
      model: CONFIG.MODEL,
    });

    const reply = extractReply(result);

    if (!reply) {
      console.error("CERDIKCHAT_MODEL_EMPTY_RESPONSE");

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

    console.error("CERDIKCHAT_AI_REQUEST_FAILED", {
      error: code,
    });

    const status =
      code === "AI_QUOTA_EXCEEDED" ? 429 : 502;

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

/* =========================================================
   19. CLOUDFLARE WORKER ENTRY POINT
========================================================= */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const corsHeaders = getCorsHeaders(request);

    if (url.pathname === "/api/feature-requests") return submitFeatureRequest(request, env, corsHeaders);
    if (url.pathname === "/api/admin/session") return adminSession(request, env);
    if (url.pathname === "/api/admin/users/pending") return pendingAdminUsers(request, env);
    if (url.pathname === "/api/admin/feature-requests") return adminFeatureRequests(request, env);
    if (url.pathname === "/api/admin/feature-requests/archive") return archiveFeatureRequest(request, env);
    if (url.pathname === "/api/admin/users/decide") return decideAccessRequest(request, env);

    // The Admin Console is a distinct document and is served only after a server-side role check.
    if (url.pathname === "/admin") {
      if (request.method !== "GET") return new Response("Method Not Allowed", { status: 405, headers: { allow: "GET", "cache-control": "no-store" } });
      if (!env.ASSETS || typeof env.ASSETS.fetch !== "function") return new Response("Admin Console asset unavailable.", { status: 503, headers: { "cache-control": "no-store" } });
      const gate = await adminSession(new Request(new URL("/api/admin/session", url), { headers: request.headers }), env);
      if (gate.status !== 200) {
        const payload = await gate.clone().json().catch(() => ({}));
        const message = payload.error === "ADMIN_REQUIRED" ? "403 — Admin access required." : "Admin Console is not available until governance access is verified.";
        return new Response(message, { status: gate.status, headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
      }
      const asset = await env.ASSETS.fetch(new Request(new URL("/admin.html", url), request));
      return new Response(asset.body, { status: asset.status, headers: { ...Object.fromEntries(asset.headers), "cache-control": "no-store" } });
    }
    if (url.pathname === "/api/auth/config" && request.method === "GET") return authConfig(request, env);
    if (url.pathname === "/api/auth/google") return googleLogin(request, env);
    if (url.pathname === "/api/auth/me" && request.method === "GET") return currentSession(request, env);
    if (url.pathname === "/api/auth/logout") return logout(request, env);

    if (url.pathname === "/api/analyze" || url.pathname === "/api/voice/transcribe") {
      const methods = "POST, OPTIONS";
      if (request.method === "OPTIONS") {
        if (!isSameOriginOrNoOrigin(request)) {
          return errorResponse("ORIGIN_NOT_ALLOWED", "Origin permintaan tidak diizinkan.", 403, corsHeaders);
        }
        return new Response(null, { status: 204, headers: { ...corsHeaders, "access-control-allow-methods": methods, "access-control-allow-headers": "Content-Type, X-CSRF-Token" } });
      }
      if (url.pathname === "/api/analyze") return handleFileAnalysis(request, env, corsHeaders);
      return handleVoiceTranscription(request, env, corsHeaders);
    }

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

      return handleChat(request, env, ctx);
    }

    if (
      env.ASSETS &&
      typeof env.ASSETS.fetch === "function"
    ) {
      const assetResponse = await env.ASSETS.fetch(request);
      const headers = new Headers(assetResponse.headers);

      headers.set("x-content-type-options", "nosniff");
      headers.set("referrer-policy", "no-referrer");
      headers.set("x-frame-options", "DENY");
      headers.set("strict-transport-security", "max-age=31536000; includeSubDomains");
      headers.set("permissions-policy", "camera=(), microphone=(self), geolocation=()");
      headers.set("cross-origin-opener-policy", "same-origin-allow-popups");
      headers.set("cross-origin-resource-policy", "same-origin");
      headers.set(
        "content-security-policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/client; style-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/style; img-src 'self' data: https://*.googleusercontent.com; font-src 'self' data:; connect-src 'self' https://accounts.google.com/gsi/; frame-src https://accounts.google.com/gsi/; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
      );

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
