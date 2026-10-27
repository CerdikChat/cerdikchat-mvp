
const DEFAULT_MODEL = "gemini-3.8-flash";
const DEFAULT_OPENAI_MODEL = "gpt-5.5";

const MAX_MESSAGE_LENGTH = 8000;
const MAX_HISTORY_MESSAGES = 12;
const MAX_OUTPUT_TOKENS = 2048;
const MAX_ATTEMPTS = 3;
const REQUEST_TIMEOUT_MS = 20000;
const RETRY_DELAYS_MS = [800, 1800];

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

function textResponse(text, status = 404) {
  return new Response(text, {
    status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "x-content-type-options": "nosniff"
    }
  });
}

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

  if (message.length > MAX_MESSAGE_LENGTH) {
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
    .slice(-MAX_HISTORY_MESSAGES)
    .filter(item =>
      item &&
      ["user", "assistant"].includes(item.role) &&
      typeof item.content === "string"
    )
    .map(item => ({
      role: item.role === "assistant" ? "model" : "user",
      parts: [{
        text: item.content.slice(0, MAX_MESSAGE_LENGTH)
      }]
    }));
}

function safeErrorMessage(message) {
  return String(message || "Unknown error")
    .replace(/AIza[0-9A-Za-z_-]+/g, "[REDACTED_API_KEY]")
    .replace(/sk-[0-9A-Za-z_-]+/g, "[REDACTED_API_KEY]")
    .replace(/key=[^&\s]+/gi, "key=[REDACTED]")
    .slice(0, 300);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function clientError(status) {
  if (status === 400) {
    return {
      status: 400,
      message: "Permintaan ditolak Gemini. Periksa format pesan dan konfigurasi model."
    };
  }

  if (status === 401 || status === 403) {
    return {
      status: 502,
      message: "Akses Gemini ditolak. Periksa API key dan izin proyek."
    };
  }

  if (status === 429) {
    return {
      status: 429,
      message: "Batas permintaan atau kuota Gemini tercapai."
    };
  }

  if (status === 503) {
    return {
      status: 503,
      message: "Gemini sedang mengalami permintaan tinggi."
    };
  }

  return {
    status: 502,
    message: "Layanan Gemini gagal merespons."
  };
}

async function requestGemini(env, contents) {
  const model = env.GEMINI_MODEL || DEFAULT_MODEL;

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/" +
    `${encodeURIComponent(model)}:generateContent`;

  const payload = {
    systemInstruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }]
    },
    contents,
    generationConfig: {
      maxOutputTokens: MAX_OUTPUT_TOKENS
    }
  };

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    let response;

    try {
      response = await fetch(url, {
        method: "POST",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        headers: {
          "content-type": "application/json",
          "x-goog-api-key": env.GEMINI_API_KEY
        },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      const timedOut =
        error?.name === "TimeoutError" ||
        error?.name === "AbortError";

      console.error("Gemini network error", {
        attempt: attempt + 1,
        maxAttempts: MAX_ATTEMPTS,
        model,
        timedOut,
        errorName: error?.name || "UnknownError",
        message: safeErrorMessage(error?.message)
      });

      const networkError = new Error(
        timedOut
          ? "Permintaan Gemini melewati batas waktu."
          : "Tidak dapat terhubung ke Gemini."
      );

      networkError.status = timedOut ? 504 : 502;
      throw networkError;
    }

    let data;

    try {
      data = await response.json();
    } catch {
      const error = new Error(
        "Gemini mengirim respons yang tidak dapat dibaca."
      );
      error.status = 502;
      throw error;
    }

    if (response.ok) {
      const reply = (
        data?.candidates?.[0]?.content?.parts || []
      )
        .map(part => part.text || "")
        .join("\n")
        .trim();

      if (!reply) {
        const error = new Error(
          "Gemini tidak menghasilkan teks."
        );
        error.status = 502;
        throw error;
      }

      return { reply, model, provider: "gemini" };
    }

    const apiError = data?.error || {};

    console.error("Gemini API error", {
      attempt: attempt + 1,
      status: response.status,
      apiStatus: apiError.status || "UNKNOWN",
      message: safeErrorMessage(apiError.message)
    });

    if (
      response.status === 503 &&
      attempt < MAX_ATTEMPTS - 1
    ) {
      await sleep(RETRY_DELAYS_MS[attempt]);
      continue;
    }

    const mapped = clientError(response.status);
    const error = new Error(mapped.message);
    error.status = mapped.status;
    throw error;
  }

  const error = new Error(
    "Gemini masih sibuk setelah beberapa percobaan."
  );
  error.status = 503;
  throw error;
}

function shouldFallback(error) {
  return [429, 500, 502, 503, 504].includes(error?.status);
}

async function requestOpenAI(env, contents) {
  if (!env.OPENAI_API_KEY) {
    const error = new Error(
      "Secret OPENAI_API_KEY belum tersedia di Cloudflare."
    );
    error.status = 503;
    throw error;
  }

  const model = env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL;

  const input = contents.map(item => ({
    role: item.role === "model" ? "assistant" : "user",
    content: (item.parts || [])
      .map(part => part.text || "")
      .join("\n")
  }));

  let response;

  try {
    response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        headers: {
          "content-type": "application/json",
          "authorization": `Bearer ${env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model,
          instructions: SYSTEM_INSTRUCTION,
          input,
          max_output_tokens: MAX_OUTPUT_TOKENS,
          store: false
        })
      }
    );
  } catch (error) {
    console.error("OpenAI network error", {
      model,
      errorName: error?.name || "UnknownError",
      message: safeErrorMessage(error?.message)
    });

    const networkError = new Error(
      "Tidak dapat terhubung ke layanan OpenAI."
    );
    networkError.status = 502;
    throw networkError;
  }

  let data;

  try {
    data = await response.json();
  } catch {
    const error = new Error(
      "OpenAI mengirim respons yang tidak dapat dibaca."
    );
    error.status = 502;
    throw error;
  }

  if (!response.ok) {
    console.error("OpenAI API error", {
      status: response.status,
      apiStatus: data?.error?.code || "UNKNOWN",
      message: safeErrorMessage(data?.error?.message)
    });

    const error = new Error(
      "Layanan OpenAI gagal memproses permintaan."
    );

    error.status = [429, 500, 502, 503, 504]
      .includes(response.status)
      ? response.status
      : 502;

    throw error;
  }

  const reply = (data?.output || [])
    .filter(item => item.type === "message")
    .flatMap(item => item.content || [])
    .filter(item => item.type === "output_text")
    .map(item => item.text || "")
    .join("\n")
    .trim();

  if (!reply) {
    const error = new Error(
      "OpenAI tidak menghasilkan teks."
    );
    error.status = 502;
    throw error;
  }

  return { reply, model, provider: "openai" };
}

async function handleChat(request, env) {
  if (!env.GEMINI_API_KEY && !env.OPENAI_API_KEY) {
    return json({
      error: "Backend belum dikonfigurasi. API key AI belum tersedia."
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

  const contents = [
    ...normalizeHistory(body.history),
    {
      role: "user",
      parts: [{ text: validation.message }]
    }
  ];

  if (env.GEMINI_API_KEY) {
    try {
      return json(await requestGemini(env, contents));
    } catch (error) {
      console.error("Gemini primary provider failed", {
        status: error?.status || 502,
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

      console.warn("Switching to OpenAI fallback");
    }
  }

  try {
    const result = await requestOpenAI(env, contents);

    return json({
      ...result,
      fallback: true
    });
  } catch (error) {
    console.error("OpenAI fallback failed", {
      status: error?.status || 502,
      message: safeErrorMessage(error?.message)
    });

    return json({
      error: "Gemini dan OpenAI belum berhasil memproses permintaan. Silakan coba lagi nanti."
    }, 502);
  }
}

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
