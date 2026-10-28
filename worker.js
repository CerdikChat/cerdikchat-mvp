
const CONFIG = Object.freeze({
  GEMINI_MODEL: "gemini-3.1-flash-lite",

  MAX_MESSAGE_LENGTH: 8000,
  MAX_HISTORY_MESSAGES: 12,
  MAX_HISTORY_ITEM_LENGTH: 2000,
  MAX_OUTPUT_TOKENS: 1024,

  // Dua percobaan maksimum, hanya untuk error sementara.
  MAX_ATTEMPTS: 2,
  REQUEST_TIMEOUT_MS: 15000,
  RETRY_DELAY_MS: 1000
});

const SYSTEM_INSTRUCTION = [
  "Anda adalah CerdikChat, asisten AI untuk riset, analisis, penulisan, dan perencanaan.",
  "Jawab dalam bahasa pengguna dengan jelas, akurat, dan terstruktur.",
  "Jangan mengarang fakta, data, kutipan, atau sumber.",
  "Bedakan fakta, estimasi, dan asumsi.",
  "Nyatakan ketidakpastian dan sarankan verifikasi untuk keputusan berisiko tinggi."
].join(" ");

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS
  });
}

function createError(message, status, code) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function logError(event, details = {}) {
  // Jangan log API key, request body, atau percakapan pengguna.
  console.error(event, details);
}

function safeMessage(value) {
  return String(value || "")
    .replace(/AIza[0-9A-Za-z_-]+/g, "[REDACTED]")
    .replace(/sk-[0-9A-Za-z_-]+/g, "[REDACTED]")
    .replace(/Bearer\s+\S+/gi, "Bearer [REDACTED]")
    .slice(0, 200);
}

function validateMessage(body) {
  if (!body || typeof body.message !== "string") {
    return { error: "Pesan harus berupa teks.", status: 400 };
  }

  const message = body.message.trim();

  if (!message) {
    return { error: "Pesan tidak boleh kosong.", status: 400 };
  }

  if (message.length > CONFIG.MAX_MESSAGE_LENGTH) {
    return {
      error: "Pesan terlalu panjang. Maksimal 8.000 karakter.",
      status: 413
    };
  }

  return { message };
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .filter(item =>
      item &&
      ["user", "assistant"].includes(item.role) &&
      typeof item.content === "string" &&
      item.content.trim()
    )
    .slice(-CONFIG.MAX_HISTORY_MESSAGES)
    .map(item => ({
      role: item.role === "assistant" ? "model" : "user",
      parts: [{
        text: item.content.slice(0, CONFIG.MAX_HISTORY_ITEM_LENGTH)
      }]
    }));
}

function getGeminiError(status, apiError = {}) {
  const reason = String(
    apiError.status || apiError.reason || apiError.code || ""
  ).toUpperCase();

  const message = String(apiError.message || "").toLowerCase();

  if (status === 400) {
    return createError(
      "Permintaan tidak valid. Periksa format pesan atau konfigurasi model.",
      400,
      "BAD_REQUEST"
    );
  }

  if (status === 401 || status === 403) {
    return createError(
      "Akses Gemini ditolak. Periksa secret dan izin proyek.",
      502,
      "GEMINI_ACCESS_ERROR"
    );
  }

  if (status === 404) {
    return createError(
      "Model tidak ditemukan atau tidak tersedia untuk API ini.",
      502,
      "GEMINI_MODEL_NOT_FOUND"
    );
  }

  if (status === 429) {
    const quotaError =
      reason.includes("QUOTA") ||
      reason.includes("RESOURCE_EXHAUSTED") ||
      message.includes("quota") ||
      message.includes("billing") ||
      message.includes("limit: 0");

    if (quotaError) {
      return createError(
        "Kuota Gemini saat ini tidak tersedia atau telah tercapai. Coba lagi setelah kuota pulih atau periksa batas penggunaan proyek.",
        429,
        "GEMINI_QUOTA_EXHAUSTED"
      );
    }

    return createError(
      "Batas permintaan Gemini tercapai. Tunggu sebentar sebelum mencoba kembali.",
      429,
      "GEMINI_RATE_LIMIT"
    );
  }

  if (status === 500 || status === 502 || status === 503 || status === 504) {
    return createError(
      "Layanan Gemini sedang mengalami gangguan sementara.",
      503,
      "GEMINI_TEMPORARY_ERROR"
    );
  }

  return createError(
    "Gemini gagal memproses permintaan.",
    502,
    "GEMINI_PROVIDER_ERROR"
  );
}

function shouldRetry(status) {
  // Jangan retry 400, 401, 403, 404, atau 429.
  // Retry hanya gangguan server sementara.
  return [500, 502, 503, 504].includes(status);
}

async function requestGemini(env, contents) {
  if (!env.GEMINI_API_KEY) {
    throw createError(
      "Secret GEMINI_API_KEY belum dikonfigurasi.",
      503,
      "MISSING_GEMINI_KEY"
    );
  }

  const model = env.GEMINI_MODEL || CONFIG.GEMINI_MODEL;

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/" +
    encodeURIComponent(model) +
    ":generateContent";

  const payload = {
    systemInstruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }]
    },
    contents,
    generationConfig: {
      maxOutputTokens: CONFIG.MAX_OUTPUT_TOKENS
    }
  };

  let lastError;

  for (let attempt = 0; attempt < CONFIG.MAX_ATTEMPTS; attempt++) {
    let response;

    try {
      response = await fetch(url, {
        method: "POST",
        signal: AbortSignal.timeout(CONFIG.REQUEST_TIMEOUT_MS),
        headers: {
          "content-type": "application/json",
          "x-goog-api-key": env.GEMINI_API_KEY
        },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      const timeout =
        error?.name === "TimeoutError" ||
        error?.name === "AbortError";

      lastError = createError(
        timeout
          ? "Permintaan Gemini melewati batas waktu."
          : "Tidak dapat terhubung ke Gemini.",
        timeout ? 504 : 502,
        timeout ? "REQUEST_TIMEOUT" : "NETWORK_ERROR"
      );

      logError("Gemini network failure", {
        attempt: attempt + 1,
        errorName: error?.name || "UnknownError"
      });

      if (attempt < CONFIG.MAX_ATTEMPTS - 1) {
        await new Promise(resolve =>
          setTimeout(resolve, CONFIG.RETRY_DELAY_MS)
        );
        continue;
      }

      throw lastError;
    }

    if (response.ok) {
      let data;

      try {
        data = await response.json();
      } catch {
        throw createError(
          "Respons Gemini tidak dapat dibaca.",
          502,
          "INVALID_PROVIDER_RESPONSE"
        );
      }

      const reply = (data?.candidates?.[0]?.content?.parts || [])
        .map(part => part.text || "")
        .join("\n")
        .trim();

      if (!reply) {
        throw createError(
          "Gemini tidak menghasilkan teks. Coba kirim ulang pesan.",
          502,
          "EMPTY_RESPONSE"
        );
      }

      return { reply, model, provider: "gemini" };
    }

    let errorData = {};

    try {
      errorData = await response.json();
    } catch {
      // Respons error mungkin bukan JSON.
    }

    const apiError = errorData?.error || {};
    const mappedError = getGeminiError(response.status, apiError);

    logError("Gemini API failure", {
      status: response.status,
      code: mappedError.code,
      model,
      message: safeMessage(apiError.message)
    });

    if (
      !shouldRetry(response.status) ||
      attempt >= CONFIG.MAX_ATTEMPTS - 1
    ) {
      throw mappedError;
    }

    lastError = mappedError;

    await new Promise(resolve =>
      setTimeout(resolve, CONFIG.RETRY_DELAY_MS)
    );
  }

  throw lastError || createError(
    "Permintaan Gemini gagal.",
    502,
    "GEMINI_FAILURE"
  );
}

async function handleChat(request, env) {
  let body;

  try {
    body = await request.json();
  } catch {
    return json({ error: "Format permintaan tidak valid." }, 400);
  }

  const validation = validateMessage(body);

  if (validation.error) {
    return json(
      { error: validation.error },
      validation.status
    );
  }

  const contents = [
    ...normalizeHistory(body.history),
    {
      role: "user",
      parts: [{ text: validation.message }]
    }
  ];

  try {
    const result = await requestGemini(env, contents);
    return json(result);
  } catch (error) {
    const status = error?.status || 502;
    const code = error?.code || "INTERNAL_ERROR";

    logError("Chat request failed", { status, code });

    // Pesan aman untuk frontend; detail internal tidak dibocorkan.
    if (code === "GEMINI_QUOTA_EXHAUSTED") {
      return json({
        error: "Kuota Gemini gratis telah tercapai atau belum tersedia. Coba lagi nanti."
      }, 429);
    }

    if (code === "GEMINI_RATE_LIMIT") {
      return json({
        error: "Terlalu banyak permintaan. Tunggu sebentar lalu coba kembali."
      }, 429);
    }

    if (code === "GEMINI_MODEL_NOT_FOUND") {
      return json({
        error: "Model Gemini tidak tersedia. Periksa konfigurasi model."
      }, 502);
    }

    if (code === "GEMINI_ACCESS_ERROR" || code === "MISSING_GEMINI_KEY") {
      return json({
        error: "Akses Gemini belum terkonfigurasi dengan benar."
      }, 503);
    }

    if (status === 400 || status === 413) {
      return json({ error: error.message }, status);
    }

    return json({
      error: "CerdikChat belum dapat memproses permintaan. Coba lagi nanti."
    }, status >= 500 ? status : 502);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== "/api/chat") {
      return new Response("Not found", {
        status: 404,
        headers: { "content-type": "text/plain; charset=utf-8" }
      });
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204 });
    }

    if (request.method !== "POST") {
      return json({ error: "Metode tidak diizinkan." }, 405);
    }

    return handleChat(request, env);
  }
};
