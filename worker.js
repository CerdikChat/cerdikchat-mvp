const CONFIG = Object.freeze({
  MODEL: "@cf/zai-org/glm-4.7-flash",
  MAX_MESSAGE_LENGTH: 8000,
  MAX_HISTORY_MESSAGES: 12,
  MAX_HISTORY_ITEM_LENGTH: 2000,
  MAX_OUTPUT_TOKENS: 1024
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

function logError(event, details = {}) {
  console.error(event, details);
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
      role: item.role,
      content: item.content.slice(
        0,
        CONFIG.MAX_HISTORY_ITEM_LENGTH
      )
    }));
}

function extractReply(result) {
  if (typeof result?.response === "string") {
    return result.response.trim();
  }

  if (typeof result?.choices?.[0]?.message?.content === "string") {
    return result.choices[0].message.content.trim();
  }

  return "";
}

async function requestAI(env, history, message) {
  if (!env.AI || typeof env.AI.run !== "function") {
    const error = new Error("Binding Workers AI belum tersedia.");
    error.code = "AI_BINDING_MISSING";
    throw error;
  }

  const messages = [
    { role: "system", content: SYSTEM_INSTRUCTION },
    ...history,
    { role: "user", content: message }
  ];

  let result;

  try {
    result = await env.AI.run(CONFIG.MODEL, {
      messages,
      max_tokens: CONFIG.MAX_OUTPUT_TOKENS
    });
  } catch (cause) {
    // Catat hanya jenis error; jangan mencatat isi percakapan.
    logError("Workers AI inference failed", {
      model: CONFIG.MODEL,
      errorName: cause?.name || "UnknownError"
    });

    const error = new Error("Workers AI gagal memproses permintaan.");
    error.code = "AI_INFERENCE_FAILED";
    throw error;
  }

  const reply = extractReply(result);

  if (!reply) {
    const error = new Error("Respons model kosong atau tidak dikenal.");
    error.code = "AI_EMPTY_RESPONSE";
    throw error;
  }

  return {
    reply,
    model: CONFIG.MODEL,
    provider: "cloudflare-workers-ai"
  };
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

  const history = normalizeHistory(body.history);

  try {
    const result = await requestAI(
      env,
      history,
      validation.message
    );

    return json(result);
  } catch (error) {
    const code = error?.code || "INTERNAL_ERROR";

    logError("Chat request failed", { code });

    if (code === "AI_BINDING_MISSING") {
      return json({
        error: "Workers AI belum terhubung. Periksa konfigurasi binding AI."
      }, 503);
    }

    return json({
      error: "CerdikChat belum dapat memproses permintaan. Coba lagi nanti."
    }, 502);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== "/api/chat") {
      return new Response("Not found", {
        status: 404,
        headers: {
          "content-type": "text/plain; charset=utf-8"
        }
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
