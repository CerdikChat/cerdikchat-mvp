import test from "node:test";
import assert from "node:assert/strict";
import { scanUploadedFile } from "../multimodal/file-scanner.js";

const bytes = new Uint8Array([1, 2, 3]);

function scannerResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

test("file scanner accepts only an explicit clean ClamAV verdict", async () => {
  let captured;
  const result = await scanUploadedFile({
    FILE_SCANNER: {
      fetch: async (request) => {
        captured = request;
        return scannerResponse({
          engine: "clamav",
          status: "clean",
          signatureVersion: "test-db-1",
        });
      },
    },
  }, bytes, "image/png");

  assert.deepEqual(result, { ok: true });
  assert.equal(captured.method, "POST");
  assert.equal(captured.headers.get("content-type"), "application/octet-stream");
  assert.equal(captured.headers.get("x-file-mime-type"), "image/png");
  assert.deepEqual(new Uint8Array(await captured.arrayBuffer()), bytes);
});

test("file scanner blocks an infected file", async () => {
  const result = await scanUploadedFile({
    FILE_SCANNER: {
      fetch: async () => scannerResponse({
        engine: "clamav",
        status: "infected",
        signatureVersion: "test-db-1",
      }),
    },
  }, bytes, "application/pdf");
  assert.deepEqual(result, { ok: false, status: 422, code: "MALWARE_DETECTED" });
});

test("file scanner fails closed when binding is missing", async () => {
  const result = await scanUploadedFile({}, bytes, "image/png");
  assert.deepEqual(result, { ok: false, status: 503, code: "FILE_SCAN_UNAVAILABLE" });
});

test("file scanner fails closed on timeout or transport error", async () => {
  const result = await scanUploadedFile({
    FILE_SCANNER: { fetch: async () => { throw new Error("private transport detail"); } },
  }, bytes, "image/png");
  assert.deepEqual(result, { ok: false, status: 503, code: "FILE_SCAN_UNAVAILABLE" });
});

test("file scanner fails closed on non-success response", async () => {
  const result = await scanUploadedFile({
    FILE_SCANNER: { fetch: async () => new Response("unavailable", { status: 503 }) },
  }, bytes, "image/png");
  assert.deepEqual(result, { ok: false, status: 503, code: "FILE_SCAN_UNAVAILABLE" });
});

test("file scanner rejects malformed or unverifiable verdicts", async () => {
  const cases = [
    { engine: "other", status: "clean", signatureVersion: "db" },
    { engine: "clamav", status: "clean" },
    { engine: "clamav", status: "unknown", signatureVersion: "db" },
    "not-json",
  ];
  for (const body of cases) {
    const result = await scanUploadedFile({
      FILE_SCANNER: {
        fetch: async () => new Response(
          typeof body === "string" ? body : JSON.stringify(body),
          { status: 200 },
        ),
      },
    }, bytes, "image/png");
    assert.equal(result.ok, false);
    assert.match(result.code, /^FILE_SCAN_/);
  }
});
