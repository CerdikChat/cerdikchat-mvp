import test from "node:test";
import assert from "node:assert/strict";
import worker from "../worker.js";

const ORIGIN = "https://cerdikchat.test";
const csrf = "C".repeat(43);

function baseHeaders(extra = {}) {
  return {
    origin: ORIGIN,
    cookie: `__Host-cerdikchat_csrf=${csrf}`,
    "x-csrf-token": csrf,
    ...extra,
  };
}

function env(overrides = {}) {
  return {
    DB: {
      prepare: () => ({
        bind: () => ({
          first: async () => ({
            google_sub: "12345678901234567890",
            email: "pilot@example.test",
          }),
        }),
      }),
    },
    CHAT_RATE_LIMITER: { limit: async () => ({ success: true }) },
    AI: {
      run: async () => ({ response: "Transkripsi uji" }),
      toMarkdown: async () => [{ data: "Isi dokumen uji" }],
    },
    ...overrides,
  };
}

test("multimodal endpoints reject unsupported methods", async () => {
  for (const path of ["/api/analyze", "/api/voice/transcribe"]) {
    const response = await worker.fetch(new Request(ORIGIN + path), env());
    assert.equal(response.status, 405);
    assert.equal((await response.json()).error, "METHOD_NOT_ALLOWED");
  }
});

test("multimodal preflight rejects foreign origins", async () => {
  for (const path of ["/api/analyze", "/api/voice/transcribe"]) {
    const response = await worker.fetch(new Request(ORIGIN + path, {
      method: "OPTIONS",
      headers: { origin: "https://attacker.example" },
    }), env());
    assert.equal(response.status, 403);
  }
});

test("multimodal endpoints enforce same-origin CSRF before session access", async () => {
  for (const path of ["/api/analyze", "/api/voice/transcribe"]) {
    const response = await worker.fetch(new Request(ORIGIN + path, {
      method: "POST",
      headers: { origin: ORIGIN, "content-type": "multipart/form-data; boundary=unused" },
      body: "",
    }), env());
    assert.equal(response.status, 403);
    assert.equal((await response.json()).error, "CSRF_VALIDATION_FAILED");
  }
});

test("file analysis fails closed when private malware scanner binding is absent", async () => {
  const data = new FormData();
  data.append("file", new Blob(["%PDF-1.7\nfixture"], { type: "application/pdf" }), "fixture.pdf");
  data.append("prompt", "Summarize");
  const response = await worker.fetch(new Request(ORIGIN + "/api/analyze", {
    method: "POST",
    headers: baseHeaders(),
    body: data,
  }), env());
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error, "FILE_SCAN_UNAVAILABLE");
});

test("voice transcription requires an authenticated session", async () => {
  const data = new FormData();
  data.append("audio", new Blob(["not-real-audio"], { type: "audio/webm" }), "recording.webm");
  data.append("durationMs", "1200");
  const response = await worker.fetch(new Request(ORIGIN + "/api/voice/transcribe", {
    method: "POST",
    headers: baseHeaders(),
    body: data,
  }), env({
    DB: { prepare: () => ({ bind: () => ({ first: async () => null }) }) },
  }));
  assert.equal(response.status, 401);
  assert.equal((await response.json()).error, "AUTH_REQUIRED");
});

test("voice transcription validates audio signature after session and CSRF checks", async () => {
  const data = new FormData();
  data.append("audio", new Blob(["not-real-audio"], { type: "audio/webm" }), "recording.webm");
  data.append("durationMs", "1200");
  const response = await worker.fetch(new Request(ORIGIN + "/api/voice/transcribe", {
    method: "POST",
    headers: baseHeaders(),
    body: data,
  }), env());
  assert.equal(response.status, 415);
  assert.equal((await response.json()).error, "AUDIO_SIGNATURE_MISMATCH");
});

test("multimodal routes keep responses private and non-cacheable", async () => {
  const data = new FormData();
  data.append("audio", new Blob(["not-real-audio"], { type: "audio/webm" }), "recording.webm");
  data.append("durationMs", "1200");
  const response = await worker.fetch(new Request(ORIGIN + "/api/voice/transcribe", {
    method: "POST",
    headers: baseHeaders(),
    body: data,
  }), env());
  assert.equal(response.headers.get("cache-control"), "no-store");
});
