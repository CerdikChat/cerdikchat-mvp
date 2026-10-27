const JSON_HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" };
const corsHeaders = { "access-control-allow-origin": "same-origin", "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "Content-Type" };
function json(data, status=200) { return new Response(JSON.stringify(data), {status, headers:{...JSON_HEADERS, ...corsHeaders}}); }
function validHistory(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(-12).filter(m => m && ['user','assistant'].includes(m.role) && typeof m.content === 'string').map(m => ({role:m.role, content:m.content.slice(0,8000)}));
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null,{status:204,headers:corsHeaders});
    if (url.pathname !== '/api/chat') return new Response('Not found', {status:404,headers:{'content-type':'text/plain; charset=utf-8'}});
    if (request.method !== 'POST') return json({error:'Metode tidak diizinkan.'},405);
    if (!env.GEMINI_API_KEY) return json({error:'Backend belum dikonfigurasi: GEMINI_API_KEY belum tersedia.'},503);
    let body;
    try { body = await request.json(); } catch { return json({error:'Format permintaan tidak valid.'},400); }
    if (!body || typeof body.message !== 'string') return json({error:'Pesan harus berupa teks.'},400);
    const message = body.message.trim();
    if (!message) return json({error:'Pesan tidak boleh kosong.'},400);
    if (message.length > 8000) return json({error:'Pesan terlalu panjang (maksimal 8.000 karakter).'},413);
    const history = validHistory(body.history);
    const contents = [...history, {role:'user',parts:[{text:message}]}].map((item)=> {
      if (item.parts) return item;
      return {role:item.role === 'assistant' ? 'model' : 'user', parts:[{text:item.content}]};
    });
    const model = env.GEMINI_MODEL || 'gemini-2.5-flash';
    let upstream;
    try {
      upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method:'POST', headers:{'content-type':'application/json','x-goog-api-key':env.GEMINI_API_KEY},
        body:JSON.stringify({systemInstruction:{parts:[{text:'Anda adalah CerdikChat, asisten AI yang membantu riset, analisis, penulisan, dan perencanaan. Jawab dalam bahasa pengguna, utamakan kejelasan dan ketepatan. Jangan mengarang sumber atau fakta; nyatakan ketidakpastian bila perlu. Ingatkan pengguna untuk memverifikasi keputusan berisiko tinggi.'}]},contents,
  generationConfig:{maxOutputTokens:2048}
      });
    } catch { return json({error:'Tidak dapat terhubung ke layanan AI. Coba lagi nanti.'},502); }
    let result;
    try { result = await upstream.json(); } catch { return json({error:'Layanan AI mengirim respons yang tidak dapat dibaca.'},502); }
    
if (!upstream.ok) {
  const apiError = result?.error || {};
  const safeMessage = String(apiError.message || "Tidak ada pesan error dari layanan AI")
    .replace(/AIza[0-9A-Za-z_-]+/g, "[REDACTED_API_KEY]")
    .replace(/key=[^&\s]+/gi, "key=[REDACTED]")
    .slice(0, 500);

  console.error("Gemini API error", {
    status: upstream.status,
    statusText: upstream.statusText,
    message: safeMessage,
    apiStatus: apiError.status || "UNKNOWN"
  });

  const status = upstream.status === 429 ? 429
    : upstream.status === 400 ? 400
    : upstream.status === 403 ? 403
    : 502;

  const msg = status === 429
    ? "Kuota atau batas permintaan AI tercapai. Periksa kuota Gemini API."
    : status === 400
    ? "Permintaan ditolak oleh Gemini API. Periksa pesan error di Workers Logs."
    : status === 403
    ? "Akses Gemini API ditolak. Periksa izin, status API key, dan proyek."
    : "Gemini API gagal merespons. Periksa pesan error di Workers Logs.";

  return json({ error: msg }, status);
}

    const reply = (result.candidates?.[0]?.content?.parts || []).map(p=>p.text || '').join('\n').trim();
    if (!reply) return json({error:'Model tidak menghasilkan teks. Coba ubah pertanyaan.'},502);
    return json({reply, model});
  }
};
