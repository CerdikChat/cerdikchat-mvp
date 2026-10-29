/**
 * CerdikChat — Cloudflare Workers AI
 * ATLAS-9 Strategic Intelligence System
 * Primary model: @cf/zai-org/glm-4.7-flash
 *
 * Provider: Cloudflare Workers AI binding (env.AI)
 * No Gemini/OpenAI API keys required by this Worker.
 *
 * Security:
 * - Never put secrets in source code.
 * - No external tools or actions are executed.
 * - This Worker only generates chat responses.
 */

const CONFIG = Object.freeze({
  MODEL: "@cf/zai-org/glm-4.7-flash",
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

PENTING:
Nama-nama tersebut merupakan peran analitis dalam satu model AI.
Jangan mengklaim bahwa sembilan agen atau model independen sedang
berjalan, atau bahwa spesialis benar-benar dipanggil.

Jangan mengklaim telah melakukan riset web, menjalankan kode,
mengubah repository, menguji sistem, atau melakukan deployment
kecuali tersedia bukti bahwa tindakan tersebut benar-benar dilakukan.

PRINSIP KERJA:
1. Jawab dalam bahasa pengguna. Gunakan bahasa Indonesia secara default.
2. Utamakan akurasi, struktur jelas, dan rekomendasi yang praktis.
3. Bedakan fakta terverifikasi, asumsi, estimasi, dan opini.
4. Jangan mengarang sumber, data, harga, hasil pengujian, atau kemampuan.
5. Untuk coding, prioritaskan solusi aman, sederhana, dan mudah diuji.
6. Jelaskan perubahan kode dan cara memverifikasi hasilnya.
7. Untuk riset, jelaskan keterbatasan sumber dan data jika relevan.
8. Utamakan solusi gratis atau berbiaya rendah.
9. Jangan mengaktifkan billing, melakukan pembelian, deployment,
   menghapus data, atau mengubah sistem eksternal tanpa persetujuan
   eksplisit pengguna.
10. Jangan meminta atau menampilkan API key, token, kata sandi,
    atau informasi rahasia.
11. Simpan rahasia dalam secret manager, bukan source code.
12. Untuk kesehatan, keselamatan, hukum, dan keuangan, jelaskan
    risiko dan perlunya verifikasi profesional bila diperlukan.
13. Jika informasi penting tidak tersedia, nyatakan asumsi atau
    ajukan pertanyaan klarifikasi yang paling menentukan.

FORMAT JAWABAN:
- Ringkasan atau diagnosis
- Rekomendasi utama
- Langkah implementasi atau contoh
- Risiko, batasan, dan verifikasi bila relevan
`.trim();

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
};

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

  // Allow same-origin browser requests only.
  // Do not reflect arbitrary origins.
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

function normalizeHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter((item) => isPlainObject(item))
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

async function handleChat(request, env) {
  const corsHeaders = getCorsHeaders(request);

  if (request.method !== "POST") {
    return jsonResponse(
      {
        error: "METHOD_NOT_ALLOWED",
        message: "Gunakan metode POST untuk endpoint ini.",
      },
      405,
      corsHeaders
    );
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return jsonResponse(
      {
        error: "INVALID_JSON",
        message: "Body harus berupa JSON yang valid.",
      },
      400,
      corsHeaders
    );
  }

  if (!isPlainObject(body)) {
    return jsonResponse(
      {
        error: "INVALID_BODY",
        message: "Body JSON harus berupa objek.",
      },
      400,
      corsHeaders
    );
  }

  const message =
    typeof body.message === "string"
      ? body.message.trim()
      : "";

  if (!message) {
    return jsonResponse(
      {
        error: "MESSAGE_REQUIRED",
        message: "Kolom message wajib diisi.",
      },
      400,
      corsHeaders
    );
  }

  if (message.length > CONFIG.MAX_MESSAGE_CHARS) {
    return jsonResponse(
      {
        error: "MESSAGE_TOO_LONG",
        message:
          `Pesan melebihi batas ` +
          `${CONFIG.MAX_MESSAGE_CHARS} karakter.`,
      },
      413,
      corsHeaders
    );
  }

  if (!env.AI || typeof env.AI.run !== "function") {
    console.error(
      "CerdikChat configuration error: AI binding is missing."
    );

    return jsonResponse(
      {
        error: "AI_BINDING_MISSING",
        message:
          "Binding Workers AI belum tersedia. " +
          "Periksa konfigurasi Cloudflare.",
      },
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
      console.error(
        "CerdikChat model returned an empty/unrecognized response."
      );

      return jsonResponse(
        {
          error: "EMPTY_MODEL_RESPONSE",
          message:
            "Model tidak mengembalikan jawaban yang dapat dibaca. " +
            "Silakan coba lagi.",
        },
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
    // Do not log prompts, message content, API keys,
    // or full provider responses.
    const code = safeErrorCode(error);

    console.error(
      "CerdikChat Workers AI request failed:",
      code
    );

    const status =
      code === "AI_QUOTA_EXCEEDED" ? 429 : 502;

    const messagesByCode = {
      AI_QUOTA_EXCEEDED:
        "Kuota harian Workers AI mungkin telah tercapai. " +
        "Coba lagi setelah kuota tersedia.",

      AI_MODEL_UNAVAILABLE:
        "Model AI tidak tersedia atau ID model tidak dikenali. " +
        "Periksa ID model di konfigurasi.",

      AI_TIMEOUT:
        "Permintaan ke model melewati batas waktu. " +
        "Silakan coba lagi.",

      AI_REQUEST_FAILED:
        "Permintaan ke model gagal. " +
        "Periksa Cloudflare Logs untuk diagnosis lanjutan.",
    };

    return jsonResponse(
      {
        error: code,
        message: messagesByCode[code],
      },
      status,
      corsHeaders
    );
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = getCorsHeaders(request);

    if (url.pathname === "/api/chat") {
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: corsHeaders,
        });
      }

      return handleChat(request, env);
    }

    // Serve frontend and static assets through Cloudflare Assets.
    if (
      env.ASSETS &&
      typeof env.ASSETS.fetch === "function"
    ) {
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

