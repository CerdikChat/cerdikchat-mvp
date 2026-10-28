
const CONFIG = Object.freeze({
  MODEL: "@cf/zai-org/glm-4.7-flash",
  MAX_MESSAGE_LENGTH: 8000,
  MAX_HISTORY_MESSAGES: 12,
  MAX_HISTORY_ITEM_LENGTH: 2000,
  MAX_OUTPUT_TOKENS: 1024
});

const SYSTEM_INSTRUCTION = [
  "Anda adalah CerdikChat, asisten AI untuk riset, analisis, penulisan, dan perencanaan.",
  "Jawab menggunakan bahasa pengguna dengan jelas, akurat, dan terstruktur.",
  "Jangan mengarang fakta, data, kutipan, sumber, atau hasil penelitian.",
  "Bedakan fakta terverifikasi, estimasi, asumsi, dan opini.",
  "Jika informasi terkini diperlukan, nyatakan keterbatasan akses dan sarankan verifikasi.",
  "Untuk pertanyaan ambigu, mintalah klarifikasi yang diperlukan.",
  "Untuk keputusan berisiko tinggi, jelaskan ketidakpastian dan perlunya verifikasi."
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
  // Jangan pernah mencatat pesan, riwayat, atau kredensial pengguna.
  console.error(event, details);
}

function makeError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function validateMessage(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Format permintaan tidak valid.", status: 400 };
  }

  if (typeof body.message !== "string") {
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
      typeof item === "object" &&
      ["user", "assistant"].includes(item.role) &&
      typeof item.content === "string" &&
      item.content.trim().length > 0
    )
    .slice(-CONFIG.MAX_HISTORY_MESSAGES)
    .map(item => ({
      role: item.role,
      content: item.content
        .trim()
        .slice(0, CONFIG.MAX_HISTORY_ITEM_LENGTH)
    }));
}

function contentToText(content) {
  if (typeof content === "string") {
    return content.trim();
  }

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map(part => {
      if (typeof part === "string") return part;
      if (typeof part?.text === "string") return part.text;
      if (typeof part?.content === "string") return part.content;
      return "";
    })
    .filter(Boolean)
    .join("\n")
    .trim();
}

function extractReply(result) {
  if (!result || typeof result !== "object") {
    return "";
  }

  // Format Workers AI yang umum.
  if (typeof result.response === "string") {
    return result.response.trim();
  }

  // Format chat-completions.
  const choice = result.choices?.[0];

  if (typeof choice?.message?.content === "string") {
    return choice.message.content.trim();
  }

  const choiceContent = contentToText(choice?.message?.content);
  if (choiceContent) return choiceContent;

  if (typeof choice?.text === "string") {
    return choice.text.trim();
  }

  // Beberapa API mengembalikan output_text.
  if (typeof result.output_text === "string") {
    return result.output_text.trim();
  }

  // Format output terstruktur.
  if (Array.isArray(result.output)) {
    const text = result.output
      .flatMap(item => Array.isArray(item?.content) ? item.content : [])
      .filter(item =>
        item?.type === "output_text" ||
        item?.type === "text" ||
        typeof item?.text === "string"
      )
      .map(item => typeof item.text === "string" ? item.text : "")
      .filter(Boolean)
      .join("\n")
      .trim();

    if (text) return text;
  }

  return "";
}

async function requestAI(env, history, message) {
  if (!env.AI || typeof env.AI.run !== "function") {
    throw makeError(
      "AI_BINDING_MISSING",
      "Workers AI binding belum tersedia."
    );
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
      max_tokens: CONFIG.MAX_OUTPUT_TOKENS,
      chat_template_kwargs: {
        enable_thinking: false
      }
    });
  } catch (cause) {
    logError("Workers AI inference failed", {
      model: CONFIG.MODEL,
      errorName: cause?.name || "UnknownError"
    });

    throw makeError(
      "AI_INFERENCE_FAILED",
      "Workers AI gagal memproses permintaan."
    );
  }

  const reply = extractReply(result);

  if (!reply) {
    // Catat struktur umum saja, bukan isi respons model.
    logError("Workers AI returned no extractable text", {
      model: CONFIG.MODEL,
      resultType: typeof result,
      resultKeys:
        result && typeof result === "object"
          ? Object.keys(result).slice(0, 20)
          : []
    });

    throw makeError(
      "AI_EMPTY_RESPONSE",
      "Respons model kosong atau formatnya belum dikenali."
    );
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
    return json({ error: "Format JSON tidak valid." }, 400);
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
        error: "Workers AI belum terhubung. Periksa binding AI."
      }, 503);
    }

    if (code === "AI_EMPTY_RESPONSE") {
      return json({
        error: "Model belum menghasilkan teks yang dapat dibaca. Silakan coba lagi nanti."
      }, 502);
    }

    if (code === "AI_INFERENCE_FAILED") {
      return json({
        error: "Layanan AI gagal memproses permintaan. Silakan coba lagi nanti."
      }, 502);
    }

    return json({
      error: "Terjadi kesalahan internal. Silakan coba lagi nanti."
    }, 500);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== "/api/chat") {
      return new Response("Not found", {
        status: 404,
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "x-content-type-options": "nosniff"
        }
      });
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-methods": "POST, OPTIONS",
          "access-control-allow-headers": "Content-Type",
          "access-control-max-age": "86400"
        }
      });
    }

    if (request.method !== "POST") {
      return json(
        { error: "Metode tidak diizinkan." },
        405
      );
    }

    return handleChat(request, env);
  }
};
