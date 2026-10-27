
const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff"
};

const corsHeaders = {
  "access-control-allow-origin": "same-origin",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "Content-Type"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, ...corsHeaders }
  });
}

function validHistory(value) {
  if (!Array.isArray(value)) return [];

  return value
    .slice(-12)
    .filter(m =>
      m &&
      ["user", "assistant"].includes(m.role) &&
      typeof m.content === "string"
    )
    .map(m => ({
      role: m.role,
      content: m.content.slice(0, 8000)
    }));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    if (url.pathname !== "/api/chat") {
      return new Response("Not found", {
        status: 404,
        headers: {
          "content-type": "text/plain; charset=utf-8"
        }
      });
    }

    if (request.method !== "POST") {
      return json({ error: "Metode tidak diizinkan." }, 405);
    }

    if (!env.GEMINI_API_KEY) {
      return json({
        error: "Backend belum dikonfigurasi: GEMINI_API_KEY belum tersedia."
      }, 503);
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return json({ error: "Format permintaan tidak valid." }, 400);
    }

    if (!body || typeof body.message !== "string") {
      return json({ error: "Pesan harus berupa teks." }, 400);
    }

    const message = body.message.trim();

    if (!message) {
      return json({ error: "Pesan tidak boleh kosong." }, 400);
    }

    if (message.length > 8000) {
      return json({
        error: "Pesan terlalu panjang (maksimal 8.000 karakter)."
      }, 413);
    }

    const history = validHistory(body.history);

    const contents = [
      ...history.map(item => ({
        role: item.role === "assistant" ? "model" : "user",
        parts: [{ text: item.content }]
      })),
      {
        role: "user",
        parts: [{ text: message }]
      }
    ];

    const model = env.GEMINI_MODEL || "gemini-3.8-flash";

    let upstream;

    try {
      upstream = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-goog-api-key": env.GEMINI_API_KEY
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{
                text: "Anda adalah CerdikChat, asisten AI untuk riset, analisis, penulisan, dan perencanaan. Jawab dalam bahasa pengguna. Utamakan kejelasan, ketepatan, dan sumber yang dapat diverifikasi. Jangan mengarang fakta atau sumber. Nyatakan ketidakpastian bila perlu dan sarankan verifikasi untuk keputusan berisiko tinggi."
              }]
            },
            contents,
            generationConfig: {
              maxOutputTokens: 2048
            }
          })
        }
      );
    } catch (error) {
      console.error("Gemini network error", {
        message: String(error?.message || "Network error").slice(0, 200)
      });

      return json({
        error: "Tidak dapat terhubung ke layanan AI. Coba lagi nanti."
      }, 502);
    }

    let result;

    try {
      result = await upstream.json();
    } catch {
      return json({
        error: "Respons layanan AI tidak dapat dibaca."
      }, 502);
    }

    if (!upstream.ok) {
      const apiError = result?.error || {};
      const safeMessage = String(
        apiError.message || "Tidak ada pesan error dari layanan AI"
      )
        .replace(/AIza[0-9A-Za-z_-]+/g, "[REDACTED_API_KEY]")
        .replace(/key=[^&\s]+/gi, "key=[REDACTED]")
        .slice(0, 500);

      console.error("Gemini API error", {
        status: upstream.status,
        message: safeMessage,
        apiStatus: apiError.status || "UNKNOWN"
      });

      if (upstream.status === 429) {
        return json({
          error: "Batas permintaan atau kuota Gemini tercapai."
        }, 429);
      }

      if (upstream.status === 400) {
        return json({
          error: "Permintaan ditolak Gemini. Periksa Workers Logs."
        }, 400);
      }

      if (upstream.status === 403) {
        return json({
          error: "Akses ditolak. Periksa API key dan izin proyek."
        }, 403);
      }

      return json({
        error: "Gemini API gagal merespons. Periksa Workers Logs."
      }, 502);
    }

    const reply = (
      result.candidates?.[0]?.content?.parts || []
    )
      .map(part => part.text || "")
      .join("\n")
      .trim();

    if (!reply) {
      return json({
        error: "Model tidak menghasilkan teks. Coba ubah pertanyaan."
      }, 502);
    }

    return json({ reply, model });
  }
};
