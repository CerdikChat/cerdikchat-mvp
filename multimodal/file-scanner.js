const SCANNER_URL = "https://file-scanner.internal/v1/scan";
const SCAN_TIMEOUT_MS = 8_000;
const MAX_SCANNER_RESPONSE_BYTES = 2_048;

async function readBoundedResponse(response, maxBytes) {
  if (!response?.body || typeof response.body.getReader !== "function") {
    return null;
  }

  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!(value instanceof Uint8Array)) {
        await reader.cancel();
        return null;
      }
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } catch {
    try { await reader.cancel(); } catch {}
    return null;
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

/**
 * Mandatory malware-scanning boundary.
 *
 * FILE_SCANNER must be a private Cloudflare Service Binding to a separately
 * operated ClamAV-backed scanner. Never replace this with a public URL or a
 * browser-supplied verdict. Missing, unavailable, malformed, timed-out, or
 * unknown scanner results fail closed.
 *
 * Scanner response contract:
 *   { "engine": "clamav", "status": "clean", "signatureVersion": "<version>" }
 *   { "engine": "clamav", "status": "infected", "signatureVersion": "<version>" }
 */
export async function scanUploadedFile(env, bytes, mimeType) {
  if (
    !env?.FILE_SCANNER ||
    typeof env.FILE_SCANNER.fetch !== "function" ||
    !(bytes instanceof Uint8Array) ||
    !bytes.byteLength ||
    typeof mimeType !== "string" ||
    !mimeType.trim()
  ) {
    return { ok: false, status: 503, code: "FILE_SCAN_UNAVAILABLE" };
  }

  let response;
  try {
    response = await env.FILE_SCANNER.fetch(new Request(SCANNER_URL, {
      method: "POST",
      headers: {
        "content-type": "application/octet-stream",
        "x-file-mime-type": mimeType,
        "cache-control": "no-store",
      },
      body: bytes,
      signal: AbortSignal.timeout(SCAN_TIMEOUT_MS),
    }));
  } catch {
    return { ok: false, status: 503, code: "FILE_SCAN_UNAVAILABLE" };
  }

  if (!response?.ok) {
    try { await response?.body?.cancel(); } catch {}
    return { ok: false, status: 503, code: "FILE_SCAN_UNAVAILABLE" };
  }

  const contentType = response.headers.get("content-type") || "";
  if (!/^application\\/json(?:\\s*;|$)/i.test(contentType)) {
    try { await response.body?.cancel(); } catch {}
    return { ok: false, status: 503, code: "FILE_SCAN_INVALID_RESPONSE" };
  }

  const declaredLength = response.headers.get("content-length");
  if (declaredLength !== null && (!/^\\d+$/.test(declaredLength) || Number(declaredLength) > MAX_SCANNER_RESPONSE_BYTES)) {
    try { await response.body?.cancel(); } catch {}
    return { ok: false, status: 503, code: "FILE_SCAN_INVALID_RESPONSE" };
  }

  const responseBytes = await readBoundedResponse(response, MAX_SCANNER_RESPONSE_BYTES);
  if (!responseBytes) {
    return { ok: false, status: 503, code: "FILE_SCAN_INVALID_RESPONSE" };
  }

  let verdict;
  try {
    verdict = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(responseBytes));
  } catch {
    return { ok: false, status: 503, code: "FILE_SCAN_INVALID_RESPONSE" };
  }

  if (
    !verdict ||
    typeof verdict !== "object" ||
    Array.isArray(verdict) ||
    verdict.engine !== "clamav" ||
    typeof verdict.signatureVersion !== "string" ||
    !verdict.signatureVersion.trim() ||
    verdict.signatureVersion.length > 128
  ) {
    return { ok: false, status: 503, code: "FILE_SCAN_INVALID_RESPONSE" };
  }

  if (verdict.status === "infected") {
    return { ok: false, status: 422, code: "MALWARE_DETECTED" };
  }
  if (verdict.status !== "clean") {
    return { ok: false, status: 503, code: "FILE_SCAN_INDETERMINATE" };
  }

  return { ok: true };
}
