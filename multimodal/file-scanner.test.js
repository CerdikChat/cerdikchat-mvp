import test from "node:test";
import assert from "node:assert/strict";
import { scanUploadedFile } from "./file-scanner.js";

const sample = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31]);
const cleanVerdict = {
  engine: "clamav",
  status: "clean",
  signatureVersion: "test-db-2026-11-05",
};

function bindingWith(responseOrFactory) {
  return {
    FILE_SCANNER: {
      async fetch(request) {
        assert.equal(request.method, "POST");
        assert.equal(request.headers.get("content-type"), "application/octet-stream");
        assert.equal(request.headers.get("x-file-mime-type"), "application/pdf");
        assert.equal(request.headers.get("cache-control"), "no-store");
        assert.deepEqual(new Uint8Array(await request.arrayBuffer()), sample);
        return typeof responseOrFactory === "function"
          ? responseOrFactory(request)
          : responseOrFactory;
      },
    },
  };
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

test("missing scanner binding rejects the file (fail closed)", async () => {
  const result = await scanUploadedFile({}, sample, "application/pdf");
  assert.deepEqual(result, {
    ok: false,
    status: 503,
    code: "FILE_SCAN_UNAVAILABLE",
  });
});

test("valid ClamAV clean verdict allows the scan gate", async () => {
  const result = await scanUploadedFile(
    bindingWith(jsonResponse(cleanVerdict)),
    sample,
    "application/pdf",
  );
  assert.deepEqual(result, { ok: true });
});

test("infected verdict rejects the file", async () => {
  const result = await scanUploadedFile(
    bindingWith(jsonResponse({
      engine: "clamav",
      status: "infected",
      signatureVersion: "test-db-2026-11-05",
    })),
    sample,
    "application/pdf",
  );
  assert.deepEqual(result, {
    ok: false,
    status: 422,
    code: "MALWARE_DETECTED",
  });
});

test("scanner HTTP failure rejects the file", async () => {
  const result = await scanUploadedFile(
    bindingWith(new Response("unavailable", { status: 503 })),
    sample,
    "application/pdf",
  );
  assert.equal(result.ok, false);
  assert.equal(result.status, 503);
});

test("malformed JSON and non-JSON response reject the file", async () => {
  for (const response of [
    new Response("{not-json", {
      status: 200,
      headers: { "content-type": "application/json" },
    }),
    new Response("clean", { status: 200, headers: { "content-type": "text/plain" } }),
  ]) {
    const result = await scanUploadedFile(
      bindingWith(response),
      sample,
      "application/pdf",
    );
    assert.equal(result.ok, false);
    assert.equal(result.status, 503);
  }
});

test("unknown verdict, wrong engine, or missing signature version never passes", async () => {
  const verdicts = [
    { ...cleanVerdict, status: "unknown" },
    { ...cleanVerdict, engine: "other" },
    { engine: "clamav", status: "clean" },
  ];
  for (const verdict of verdicts) {
    const result = await scanUploadedFile(
      bindingWith(jsonResponse(verdict)),
      sample,
      "application/pdf",
    );
    assert.equal(result.ok, false);
  }
});

test("oversized scanner response is rejected", async () => {
  const result = await scanUploadedFile(
    bindingWith(new Response("x".repeat(4096), {
      status: 200,
      headers: { "content-type": "application/json" },
    })),
    sample,
    "application/pdf",
  );
  assert.deepEqual(result, {
    ok: false,
    status: 503,
    code: "FILE_SCAN_INVALID_RESPONSE",
  });
});

test("scanner transport exception rejects the file", async () => {
  const env = {
    FILE_SCANNER: {
      async fetch() {
        throw new Error("scanner offline");
      },
    },
  };
  const result = await scanUploadedFile(env, sample, "application/pdf");
  assert.deepEqual(result, {
    ok: false,
    status: 503,
    code: "FILE_SCAN_UNAVAILABLE",
  });
});

test("invalid input never reaches scanner", async () => {
  let called = false;
  const env = {
    FILE_SCANNER: {
      async fetch() {
        called = true;
        return jsonResponse(cleanVerdict);
      },
    },
  };
  const result = await scanUploadedFile(env, new Uint8Array(), "application/pdf");
  assert.equal(result.ok, false);
  assert.equal(called, false);
});
