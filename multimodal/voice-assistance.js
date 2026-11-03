import { requireSession, validateCsrfRequest } from "../auth/google-auth.js";

const MODEL = "@cf/openai/whisper";
const MAX_AUDIO_BYTES = 3 * 1024 * 1024;
const MAX_MULTIPART_BYTES = MAX_AUDIO_BYTES + 64 * 1024;
const MAX_DURATION_MS = 60_000;
const MAX_TRANSCRIPT_CHARS = 12_000;

const AUDIO_TYPES = Object.freeze({
  "audio/webm": { extension: ".webm", signature: "webm" },
  "audio/ogg": { extension: ".ogg", signature: "ogg" },
  "audio/wav": { extension: ".wav", signature: "wav" },
  "audio/x-wav": { extension: ".wav", signature: "wav" },
});

function json(data, status = 200, corsHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
      ...corsHeaders,
    },
  });
}

async function readBounded(request) {
  const declared = request.headers.get("content-length");
  if (declared !== null) {
    const length = Number(declared);
    if (!Number.isSafeInteger(length) || length < 0) {
      return { ok: false, status: 400, code: "INVALID_CONTENT_LENGTH" };
    }
    if (length > MAX_MULTIPART_BYTES) {
      return { ok: false, status: 413, code: "AUDIO_TOO_LARGE" };
    }
  }
  if (!request.body) return { ok: false, status: 400, code: "EMPTY_BODY" };

  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!(value instanceof Uint8Array)) {
        await reader.cancel();
        return { ok: false, status: 400, code: "INVALID_BODY" };
      }
      total += value.byteLength;
      if (total > MAX_MULTIPART_BYTES) {
        await reader.cancel();
        return { ok: false, status: 413, code: "AUDIO_TOO_LARGE" };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, status: 400, code: "BODY_READ_FAILED" };
  } finally {
    try { reader.releaseLock(); } catch {}
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { ok: true, bytes };
}

function extensionOf(name) {
  const match = typeof name === "string" ? name.toLowerCase().match(/\.[a-z0-9]{1,8}$/) : null;
  return match ? match[0] : "";
}

function hasSignature(bytes, kind) {
  if (kind === "webm") {
    return bytes.length >= 4 && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3;
  }
  if (kind === "ogg") return bytes.length >= 4 && new TextDecoder().decode(bytes.subarray(0, 4)) === "OggS";
  if (kind === "wav") {
    return bytes.length >= 12 &&
      new TextDecoder().decode(bytes.subarray(0, 4)) === "RIFF" &&
      new TextDecoder().decode(bytes.subarray(8, 12)) === "WAVE";
  }
  return false;
}

function transcriptText(result) {
  const text = typeof result?.text === "string" ? result.text.trim() : "";
  return text.slice(0, MAX_TRANSCRIPT_CHARS);
}

export async function handleVoiceTranscription(request, env, corsHeaders = {}) {
  if (request.method !== "POST") {
    return json({ error: "METHOD_NOT_ALLOWED" }, 405, { ...corsHeaders, allow: "POST, OPTIONS" });
  }
  const origin = request.headers.get("Origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return json({ error: "ORIGIN_NOT_ALLOWED" }, 403, corsHeaders);
  }
  if (!validateCsrfRequest(request)) {
    return json({ error: "CSRF_VALIDATION_FAILED" }, 403, corsHeaders);
  }

  const session = await requireSession(request, env);
  if (!session.ok) {
    const status = session.response?.status || 401;
    return json({ error: status === 503 ? "AUTH_UNAVAILABLE" : "AUTH_REQUIRED" }, status, corsHeaders);
  }

  if (!/^multipart\/form-data\s*;/i.test(request.headers.get("content-type") || "")) {
    return json({ error: "UNSUPPORTED_MEDIA_TYPE" }, 415, corsHeaders);
  }
  if (!env.CHAT_RATE_LIMITER || typeof env.CHAT_RATE_LIMITER.limit !== "function") {
    return json({ error: "RATE_LIMIT_UNAVAILABLE" }, 503, corsHeaders);
  }
  try {
    const limited = await env.CHAT_RATE_LIMITER.limit({ key: `voice:user:${session.subject}` });
    if (!limited.success) return json({ error: "RATE_LIMIT_EXCEEDED" }, 429, { ...corsHeaders, "retry-after": "60" });
  } catch {
    return json({ error: "RATE_LIMIT_UNAVAILABLE" }, 503, corsHeaders);
  }

  const body = await readBounded(request);
  if (!body.ok) return json({ error: body.code }, body.status, corsHeaders);

  let form;
  try {
    const headers = new Headers(request.headers);
    headers.delete("content-length");
    form = await new Request(request.url, { method: "POST", headers, body: body.bytes }).formData();
  } catch {
    return json({ error: "INVALID_MULTIPART" }, 400, corsHeaders);
  }

  const recordings = form.getAll("audio");
  if (recordings.length !== 1) return json({ error: "ONE_AUDIO_REQUIRED" }, 400, corsHeaders);
  const audio = recordings[0];
  if (!audio || typeof audio.arrayBuffer !== "function" || typeof audio.name !== "string") {
    return json({ error: "AUDIO_REQUIRED" }, 400, corsHeaders);
  }
  if (audio.size <= 0) return json({ error: "EMPTY_AUDIO" }, 400, corsHeaders);
  if (audio.size > MAX_AUDIO_BYTES) return json({ error: "AUDIO_TOO_LARGE" }, 413, corsHeaders);

  const mime = String(audio.type || "").toLowerCase().split(";")[0].trim();
  const spec = AUDIO_TYPES[mime];
  if (!spec || extensionOf(audio.name) !== spec.extension) {
    return json({ error: "UNSUPPORTED_AUDIO_TYPE" }, 415, corsHeaders);
  }

  const durationValue = form.get("durationMs");
  const durationMs = Number(durationValue);
  if (!Number.isFinite(durationMs) || durationMs <= 0 || durationMs > MAX_DURATION_MS) {
    return json({ error: "INVALID_AUDIO_DURATION" }, 400, corsHeaders);
  }

  let bytes;
  try { bytes = new Uint8Array(await audio.arrayBuffer()); }
  catch { return json({ error: "AUDIO_READ_FAILED" }, 400, corsHeaders); }
  if (!hasSignature(bytes, spec.signature)) {
    return json({ error: "AUDIO_SIGNATURE_MISMATCH" }, 415, corsHeaders);
  }
  if (!env.AI || typeof env.AI.run !== "function") {
    return json({ error: "AI_BINDING_UNAVAILABLE" }, 503, corsHeaders);
  }

  try {
    const result = await env.AI.run(MODEL, { audio: Array.from(bytes) });
    const text = transcriptText(result);
    if (!text) return json({ error: "EMPTY_TRANSCRIPT" }, 502, corsHeaders);
    return json({
      text,
      model: MODEL,
      durationMs,
      persisted: false,
      reviewRequired: true,
    }, 200, corsHeaders);
  } catch (error) {
    const message = typeof error?.message === "string" ? error.message : "";
    const quota = /quota|allocation|neurons.*limit/i.test(message);
    return json({ error: quota ? "AI_QUOTA_EXCEEDED" : "TRANSCRIPTION_FAILED" }, quota ? 429 : 502, corsHeaders);
  }
}
