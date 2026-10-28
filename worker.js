const CONFIG = Object.freeze({
  GEMINI_MODEL: "gemini-3.8-flash",
  OPENAI_MODEL: "gpt-5.5",

  MAX_MESSAGE_LENGTH: 8000,
  MAX_HISTORY_MESSAGES: 12,
  MAX_HISTORY_ITEM_LENGTH: 2000,
  MAX_OUTPUT_TOKENS: 2048,

  MAX_ATTEMPTS: 3,
  REQUEST_TIMEOUT_MS: 20000,
  RETRY_DELAYS_MS: [800, 1800]
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

// --------------------------------------------------
// HTTP HELPERS
// --------------------------------------------------

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS
  });
}

function textResponse(message, status = 404) {
  return new Response(message, {
    status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "x-content-type-options": "nosniff"
    }
  });
}

function createError(message, status = 502, code = "PROVIDER_ERROR") {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function safeErrorMessage(message) {
  return String(message || "Unknown error")
    .replace(/AIza[0-9A-Za-z_-]+/g, "[REDACTED_API_KEY]")
    .replace(/sk-[0-9A-Za-z_-]+/g, "[REDACTED_API_KEY]")
    .replace(/Bearer\s+\S+/gi, "Bearer [REDACTED]")
    .replace(/key=[^&\s]+/gi, "key=[REDACTED]")
    .slice(0, 300);
}

function logError(event, details = {}) {
  // Jangan pernah mencatat API key, header Authorization,
  // request body lengkap, atau isi percakapan pengguna.
  console.error(event, details);
}

function isRetryableStatus(status) {
  return [429, 500, 502, 503, 504].includes(status);
}

function retryDelay(attempt, retryAfterMs = 0) {
  const configuredDelay =
    CONFIG.RETRY_DELAYS_MS[attempt] ??
    CONFIG.RETRY_DELAYS_MS.at(-1);

  // Batas retryAfter untuk mencegah menunggu terlalu lama.
  const boundedRetryAfter = Math.min(
    Math.max(0, retryAfterMs),
    5000
  );

  return Math.max(configuredDelay, boundedRetryAfter);
}

function getRetryAfterMs(response) {
  const value = response.headers.get("retry-after");

  if (!value) return 0;

  const seconds = Number(value);

  if (Number.isFinite(seconds) && seconds >= 0) {
    return seconds * 1000;
  }

  const dateMs = Date.parse(value);

  return Number.isFinite(dateMs)
    ? Math.max(0, dateMs - Date.now())
    : 0;
}

// --------------------------------------------------
// INPUT VALIDATION
// --------------------------------------------------

function validateMessage(body) {
  if (!body || typeof body.message !== "string") {
    return {
      error: "Pesan harus berupa teks.",
      status: 400
    };
  }

  const message = body.message.trim();

  if (!message) {
    return {
      error: "Pesan tidak boleh kosong.",
      status: 400
    };
  }

  if (message.length > CONFIG.MAX_MESSAGE_LENGTH) {
    return {
      error: "Pesan terlalu panjang (maksimal 8.000 karakter).",
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
      item.content.trim().length > 0
    )
    .slice(-CONFIG.MAX_HISTORY_MESSAGES)
    .map(item => ({
      role: item.role === "assistant" ? "model" : "user",
      parts: [{
        text: item.content
          .slice(0, CONFIG.MAX_HISTORY_ITEM_LENGTH)
      }]
    }));
}

function buildContents(body, message) {
  return [
    ...normalizeHistory(body.history),
    {
      role: "user",
      parts: [{ text: message }]
    }
  ];
}

// --------------------------------------------------
// PROVIDER ERROR NORMALIZATION
// --------------------------------------------------

function mapGeminiError(status) {
  if (status === 400) {
    return createError(
      "Permintaan Gemini ditolak. Periksa format permintaan dan konfigurasi model.",
      400,
      "GEMINI_BAD_REQUEST"
    );
  }

  if (status === 401 || status === 403) {
    // Kesalahan autentikasi/izin tidak boleh disamarkan
    // sebagai gangguan sementara.
    return createError(
      "Akses Gemini ditolak. Periksa secret API key dan izin proyek.",
      502,
      "GEMINI_AUTH_ERROR"
    );
  }

  if (status === 429) {
    return createError(
      "Batas permintaan atau kuota Gemini tercapai.",
      429,
      "GEMINI_RATE_LIMIT"
    );
  }

  if (status === 503) {
    return createError(
      "Gemini sedang mengalami permintaan tinggi.",
      503,
      "GEMINI_UNAVAILABLE"
    );
  }

  return createError(
    "Layanan Gemini gagal memproses permintaan.",
    502,
    "GEMINI_PROVIDER_ERROR"
  );
}

function normalizeProviderStatus(status) {
  return isRetryableStatus(status) ? status : 502;
}

// --------------------------------------------------
// SHARED FETCH WITH LIMITED RETRIES
// --------------------------------------------------

async function fetchWithRetry({
  provider,
  url,
  headers,
  payload,
  model
}) {
  let lastError;

  for (
    let attempt = 0;
    attempt < CONFIG.MAX_ATTEMPTS;
    attempt++
  ) {
    let response;

    try {
      response = await fetch(url, {
        method: "POST",
        signal: AbortSignal.timeout(
          CONFIG.REQUEST_TIMEOUT_MS
        ),
        headers,
        body: JSON.stringify(payload)
      });
    } catch (error) {
      const timedOut =
        error?.name === "TimeoutError" ||
        error?.name === "AbortError";

      lastError = createError(
        timedOut
          ? `Permintaan ${provider} melewati batas waktu.`
          : `Tidak dapat terhubung ke ${provider}.`,
        timedOut ? 504 : 502,
        timedOut ? "REQUEST_TIMEOUT" : "NETWORK_ERROR"
      );

      logError(`${provider} network error`, {
        attempt: attempt + 1,
        maxAttempts: CONFIG.MAX_ATTEMPTS,
        model,
        errorName: error?.name || "UnknownError",
        message: safeErrorMessage(error?.message)
      });

      if (attempt < CONFIG.MAX_ATTEMPTS - 1) {
        await sleep(retryDelay(attempt));
        continue;
      }

      throw lastError;
    }

    if (response.ok) {
      return response;
    }

    let errorData = {};

    try {
      errorData = await response.json();
    } catch {
      // Respons error bukan JSON; status HTTP tetap dicatat.
    }

    const apiError = errorData?.error || {};

    logError(`${provider} API error`, {
      attempt: attempt + 1,
      status: response.status,
      apiStatus: apiError.status || apiError.code || "UNKNOWN",
      model,
      message: safeErrorMessage(apiError.message)
    });

    lastError = createError(
      `${provider} mengembalikan HTTP ${response.status}.`,
      normalizeProviderStatus(response.status),
      apiError.status || apiError.code || "PROVIDER_ERROR"
    );

    if (
      !isRetryableStatus(response.status) ||
      attempt >= CONFIG.MAX_ATTEMPTS - 1
    ) {
      throw lastError;
    }

    await sleep(
      retryDelay(attempt, getRetryAfterMs(response))
    );
  }

  throw lastError || createError(
    `Permintaan ${provider} gagal.`,
    502
  );
}

// --------------------------------------------------
// GEMINI PROVIDER
// --------------------------------------------------

async function requestGemini(env, contents) {
  if (!env.GEMINI_API_KEY) {
    throw createError(
      "Secret GEMINI_API_KEY belum tersedia.",
      503,
      "MISSING_GEMINI_KEY"
    );
  }

  const model =
    env.GEMINI_MODEL || CONFIG.GEMINI_MODEL;

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/" +
    `${encodeURIComponent(model)}:generateContent`;

  const payload = {
    systemInstruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }]
    },
    contents,
    generationConfig: {
      maxOutputTokens: CONFIG.MAX_OUTPUT_TOKENS
    }
  };

  const response = await fetchWithRetry({
    provider: "Gemini",
    url,
    model,
    headers: {
      "content-type": "application/json",
      "x-goog-api-key": env.GEMINI_API_KEY
    },
    payload
  });

  let data;

  try {
    data = await response.json();
  } catch {
    throw createError(
      "Gemini mengirim respons yang tidak dapat dibaca.",
      502,
      "INVALID_PROVIDER_RESPONSE"
    );
  }

  const reply = (
    data?.candidates?.[0]?.content?.parts || []
  )
    .map(part => part.text || "")
    .join("\n")
    .trim();

  if (!reply) {
    throw createError(
      "Gemini tidak menghasilkan teks.",
      502,
      "EMPTY_PROVIDER_RESPONSE"
    );
  }

  return {
    reply,
    model,
    provider: "gemini"
  };
}

// --------------------------------------------------
// OPENAI PROVIDER
// --------------------------------------------------

async function requestOpenAI(env, contents) {
  if (!env.OPENAI_API_KEY) {
    throw createError(
      "Secret OPENAI_API_KEY belum tersedia.",
      503,
      "MISSING_OPENAI_KEY"
    );
  }

  const model =
    env.OPENAI_MODEL || CONFIG.OPENAI_MODEL;

  const input = contents.map(item => ({
    role: item.role === "model" ? "assistant" : "user",
    content: (item.parts || [])
      .map(part => part.text || "")
      .join("\n")
  }));

  const response = await fetchWithRetry({
    provider: "OpenAI",
    url: "https://api.openai.com/v1/responses",
    model,
    headers: {
      "content-type": "application/json",
      "authorization": `Bearer ${env.OPENAI_API_KEY}`
    },
    payload: {
      model,
      instructions: SYSTEM_INSTRUCTION,
      input,
      max_output_tokens: CONFIG.MAX_OUTPUT_TOKENS,
      store: false
    }
  });

  let data;

  try {
    data = await response.json();
  } catch {
    throw createError(
      "OpenAI mengirim respons yang tidak dapat dibaca.",
      502,
      "INVALID_PROVIDER_RESPONSE"
    );
  }

  const reply = (
    data?.output || []
  )
    .filter(item => item.type === "message")
    .flatMap(item => item.content || [])
    .filter(item => item.type === "output_text")
    .map(item => item.text || "")
    .join("\n")
    .trim();

  if (!reply) {
    throw createError(
      "OpenAI tidak menghasilkan teks.",
      502,
      "EMPTY_PROVIDER_RESPONSE"
    );
  }

  return {
    reply,
    model,
    provider: "openai"
  };
}

// --------------------------------------------------
// CHAT ORCHESTRATION
// --------------------------------------------------

function shouldFallback(error) {
  return [
    429, 500, 502, 503, 504
  ].includes(error?.status);
}

async function handleChat(request, env) {
  if (!env.GEMINI_API_KEY && !env.OPENAI_API_KEY) {
    return json({
      error: "Backend belum dikonfigurasi. Secret API key belum tersedia."
    }, 503);
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return json({
      error: "Format permintaan tidak valid."
    }, 400);
  }

  const validation = validateMessage(body);

  if (validation.error) {
    return json({
      error: validation.error
    }, validation.status);
  }

  const contents = buildContents(
    body,
    validation.message
  );

  // Provider utama: Gemini.
  if (env.GEMINI_API_KEY) {
    try {
      const result = await requestGemini(env, contents);
      return json(result);
    } catch (error) {
      logError("Gemini primary provider failed", {
        status: error?.status || 502,
        code: error?.code || "UNKNOWN_ERROR",
        message: safeErrorMessage(error?.message)
      });

      if (!shouldFallback(error)) {
        return json({
          error: error.message || "Gemini gagal memproses permintaan."
        }, error.status || 502);
      }

      if (!env.OPENAI_API_KEY) {
        return json({
          error: "Gemini sedang bermasalah dan OpenAI belum dikonfigurasi."
        }, 503);
      }

      logError("Switching to OpenAI fallback", {
        reason: error?.code || "GEMINI_FAILURE"
      });
    }
  }

  // Provider cadangan: OpenAI.
  try {
    const result = await requestOpenAI(env, contents);

    return json({
      ...result,
      fallback: true
    });
  } catch (error) {
    logError("OpenAI fallback failed", {
      status: error?.status || 502,
      code: error?.code || "UNKNOWN_ERROR",
      message: safeErrorMessage(error?.message)
    });

    return json({
      error: "Gemini dan OpenAI belum berhasil memproses permintaan. Silakan coba lagi nanti."
    }, 502);
  }
}

// --------------------------------------------------
// CLOUDFLARE WORKER ENTRY POINT
// --------------------------------------------------

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== "/api/chat") {
      return textResponse("Not found", 404);
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204 });
    }

    if (request.method !== "POST") {
      return json({
        error: "Metode tidak diizinkan."
      }, 405);
    }

    return handleChat(request, env);
  }
};

