import test from "node:test";
import assert from "node:assert/strict";
import worker from "../worker.js";

const ORIGIN = "https://cerdikchat.test";
const CSRF = "C".repeat(43);

function env(overrides = {}) {
  return {
    DB: {
      prepare: () => ({
        bind: () => ({
          first: async () => ({
            google_sub: "12345678901234567890",
            email: "pilot@example.com",
            role: "user",
          }),
        }),
      }),
    },
    VOICE_RATE_LIMITER: { limit: async () => ({ success: true }) },
    AI: { run: async () => ({ text: "Halo, ini transkrip uji." }) },
    ...overrides,
  };
}

function makeRequest(options = {}) {
  const form = new FormData();
  if (options.audio !== false) {
    const bytes = options.bytes || new Uint8Array([0x1a, 0x45, 0xdf, 0xa3, 0x01, 0x02]);
    form.set("audio", new File([bytes], options.filename || "voice.webm", {
      type: options.type || "audio/webm",
    }));
  }
  form.set("durationMs", String(options.durationMs ?? 2500));
  return new Request(`${ORIGIN}/api/voice/transcribe`, {
    method: "POST",
    headers: {
      origin: options.origin || ORIGIN,
      cookie: `__Host-cerdikchat_session=session-token; __Host-cerdikchat_csrf=${CSRF}`,
      "x-csrf-token": options.csrf || CSRF,
    },
    body: form,
  });
}

async function call(options = {}, overrides = {}) {
  const response = await worker.fetch(makeRequest(options), env(overrides));
  return { response, payload: await response.json() };
}

test("voice transcription accepts authenticated User Portal audio and returns review-only text", async () => {
  let model = "";
  const { response, payload } = await call({}, {
    AI: { run: async (name, input) => {
      model = name;
      assert.deepEqual(input.audio.slice(0, 4), [0x1a, 0x45, 0xdf, 0xa3]);
      return { text: "  Halo, ini transkrip uji.  " };
    } },
  });
  assert.equal(response.status, 200);
  assert.equal(payload.text, "Halo, ini transkrip uji.");
  assert.equal(payload.reviewRequired, true);
  assert.equal(payload.persisted, false);
  assert.equal(model, "@cf/openai/whisper");
});

test("voice endpoint rejects missing session", async () => {
  const form = new FormData();
  form.set("audio", new File([new Uint8Array([0x1a,0x45,0xdf,0xa3])], "voice.webm", { type: "audio/webm" }));
  form.set("durationMs", "1000");
  const response = await worker.fetch(new Request(`${ORIGIN}/api/voice/transcribe`, {
    method: "POST",
    headers: { origin: ORIGIN, cookie: `__Host-cerdikchat_csrf=${CSRF}`, "x-csrf-token": CSRF },
    body: form,
  }), env());
  assert.equal(response.status, 401);
  assert.equal((await response.json()).error, "AUTH_REQUIRED");
});

test("voice endpoint rejects Administrator Portal sessions", async () => {
  const { response, payload } = await call({}, {
    DB: { prepare: () => ({ bind: () => ({ first: async () => ({
      google_sub: "12345678901234567890", email: "admin@example.com", role: "admin",
    }) }) }) },
  });
  assert.equal(response.status, 403);
  assert.equal(payload.error, "USER_PORTAL_REQUIRED");
});

test("voice endpoint rejects missing or mismatched CSRF token", async () => {
  const { response, payload } = await call({ csrf: "X".repeat(43) });
  assert.equal(response.status, 403);
  assert.equal(payload.error, "CSRF_VALIDATION_FAILED");
});

test("voice endpoint rejects foreign origins", async () => {
  const { response, payload } = await call({ origin: "https://attacker.example" });
  assert.equal(response.status, 403);
  assert.equal(payload.error, "ORIGIN_NOT_ALLOWED");
});

test("voice endpoint rejects unsupported audio MIME and signature mismatch", async () => {
  const unsupported = await call({ type: "audio/mpeg", filename: "voice.mp3" });
  assert.equal(unsupported.response.status, 415);
  const mismatch = await call({ bytes: new Uint8Array([0,1,2,3]) });
  assert.equal(mismatch.response.status, 415);
  assert.equal(mismatch.payload.error, "AUDIO_SIGNATURE_MISMATCH");
});

test("voice endpoint rejects empty and overlong duration declarations", async () => {
  const empty = await call({ audio: false });
  assert.equal(empty.response.status, 400);
  const long = await call({ durationMs: 60_001 });
  assert.equal(long.response.status, 400);
  assert.equal(long.payload.error, "INVALID_AUDIO_DURATION");
});

test("voice endpoint fails closed without dedicated limiter", async () => {
  const { response, payload } = await call({}, { VOICE_RATE_LIMITER: undefined });
  assert.equal(response.status, 503);
  assert.equal(payload.error, "VOICE_RATE_LIMIT_UNAVAILABLE");
});

test("voice endpoint enforces dedicated rate limit", async () => {
  const { response, payload } = await call({}, {
    VOICE_RATE_LIMITER: { limit: async () => ({ success: false }) },
  });
  assert.equal(response.status, 429);
  assert.equal(payload.error, "RATE_LIMIT_EXCEEDED");
});
