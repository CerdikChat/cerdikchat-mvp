/**
 * CerdikChat ATLAS-9 — Google Identity Services authentication.
 * Server-side JWT signature verification, D1 allowlist and opaque sessions.
 * No client secret is used by this GIS ID-token flow.
 */

const GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const GOOGLE_ISSUERS = new Set([
  "https://accounts.google.com",
  "accounts.google.com",
]);
const SESSION_COOKIE = "__Host-cerdikchat_session";
const CSRF_COOKIE = "__Host-cerdikchat_csrf";
const CSRF_TTL_SECONDS = 8 * 60 * 60;
const SESSION_TTL_SECONDS = 8 * 60 * 60;
const MAX_TOKEN_LENGTH = 12_000;
let jwksCache = { keys: null, expiresAt: 0 };

function base64UrlToBytes(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function decodeJsonSegment(segment) {
  return JSON.parse(new TextDecoder().decode(base64UrlToBytes(segment)));
}

async function getGoogleJwks(fetchImpl = fetch, forceRefresh = false) {
  if (!forceRefresh && jwksCache.keys && Date.now() < jwksCache.expiresAt) {
    return jwksCache.keys;
  }
  const response = await fetchImpl(GOOGLE_JWKS_URL, {
    headers: { accept: "application/json" },
    cf: { cacheTtl: 300, cacheEverything: true },
  });
  if (!response.ok) throw new Error("GOOGLE_JWKS_UNAVAILABLE");
  const body = await response.json();
  if (!Array.isArray(body.keys) || body.keys.length === 0) {
    throw new Error("GOOGLE_JWKS_INVALID");
  }
  const cacheControl = response.headers.get("cache-control") || "";
  const maxAge = Number(cacheControl.match(/max-age=(\d+)/i)?.[1] || 300);
  jwksCache = {
    keys: body.keys,
    expiresAt: Date.now() + Math.max(60, Math.min(maxAge, 3600)) * 1000,
  };
  return jwksCache.keys;
}

export async function verifyGoogleIdToken(token, clientId, options = {}) {
  if (typeof token !== "string" || token.length > MAX_TOKEN_LENGTH) {
    throw new Error("GOOGLE_TOKEN_INVALID");
  }
  if (!clientId) throw new Error("GOOGLE_CLIENT_ID_MISSING");
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("GOOGLE_TOKEN_INVALID");

  const header = decodeJsonSegment(parts[0]);
  const claims = decodeJsonSegment(parts[1]);
  if (header.alg !== "RS256" || typeof header.kid !== "string") {
    throw new Error("GOOGLE_TOKEN_ALGORITHM_INVALID");
  }

  const fetchImpl = options.fetch || fetch;
  let keys = await getGoogleJwks(fetchImpl);
  let jwk = keys.find((key) => key.kid === header.kid && key.kty === "RSA");
  if (!jwk) {
    keys = await getGoogleJwks(fetchImpl, true);
    jwk = keys.find((key) => key.kid === header.kid && key.kty === "RSA");
  }
  if (!jwk) throw new Error("GOOGLE_SIGNING_KEY_UNKNOWN");

  const publicKey = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const signed = new TextEncoder().encode(parts[0] + "." + parts[1]);
  const signature = base64UrlToBytes(parts[2]);
  const validSignature = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    publicKey,
    signature,
    signed
  );
  if (!validSignature) throw new Error("GOOGLE_SIGNATURE_INVALID");

  const now = Math.floor(Date.now() / 1000);
  if (!GOOGLE_ISSUERS.has(claims.iss)) throw new Error("GOOGLE_ISSUER_INVALID");
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!audiences.includes(clientId)) throw new Error("GOOGLE_AUDIENCE_INVALID");
  if (audiences.length > 1 && claims.azp !== clientId) {
    throw new Error("GOOGLE_AUTHORIZED_PARTY_INVALID");
  }
  if (claims.azp && claims.azp !== clientId) throw new Error("GOOGLE_AUTHORIZED_PARTY_INVALID");
  if (options.nonce && claims.nonce !== options.nonce) throw new Error("GOOGLE_NONCE_INVALID");
  if (!Number.isFinite(claims.exp) || claims.exp <= now) throw new Error("GOOGLE_TOKEN_EXPIRED");
  if (!Number.isFinite(claims.iat) || claims.iat > now + 60 || claims.iat < now - 3600) {
    throw new Error("GOOGLE_TOKEN_TIME_INVALID");
  }
  if (typeof claims.sub !== "string" || !/^\d{5,30}$/.test(claims.sub)) {
    throw new Error("GOOGLE_SUBJECT_INVALID");
  }
  if (claims.email_verified !== true) throw new Error("GOOGLE_EMAIL_UNVERIFIED");
  if (typeof claims.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(claims.email)) {
    throw new Error("GOOGLE_EMAIL_INVALID");
  }
  return {
    sub: claims.sub,
    email: claims.email.toLowerCase(),
    name: typeof claims.name === "string" ? claims.name.slice(0, 160) : "",
    picture: typeof claims.picture === "string" ? claims.picture.slice(0, 1000) : "",
  };
}

function toBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sha256Hex(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function csrfCookieHeader(value, maxAge = CSRF_TTL_SECONDS) {
  return `${CSRF_COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

function constantTimeEqual(left, right) {
  if (typeof left !== "string" || typeof right !== "string") return false;
  if (left.length > 128 || right.length > 128) return false;
  let difference = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index++) {
    difference |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }
  return difference === 0;
}

function validCsrf(request) {
  const cookieToken = getCookie(request, CSRF_COOKIE);
  const headerToken = request.headers.get("X-CSRF-Token");
  return constantTimeEqual(cookieToken, headerToken);
}

// Shared CSRF guard for authenticated JSON and multipart endpoints.
export function validateCsrfRequest(request) {
  return sameOrigin(request) && validCsrf(request);
}

function cookieHeader(value, maxAge) {
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

function clearCookieHeader() {
  return cookieHeader("", 0);
}

function getCookie(request, name) {
  const cookie = request.headers.get("Cookie") || "";
  for (const part of cookie.split(";")) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    if (part.slice(0, index).trim() === name) return part.slice(index + 1).trim();
  }
  return null;
}

function sameOrigin(request) {
  return request.headers.get("Origin") === new URL(request.url).origin;
}

function authJson(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
      ...headers,
    },
  });
}

function unavailable() {
  return authJson({ error: "AUTH_UNAVAILABLE", message: "Autentikasi belum dikonfigurasi." }, 503);
}

export function authConfig(request, env) {
  const existingToken = getCookie(request, CSRF_COOKIE);
  const csrfToken = /^[A-Za-z0-9_-]{43}$/.test(existingToken || "")
    ? existingToken
    : toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
  return authJson(
    {
      clientId: env.GOOGLE_CLIENT_ID || null,
      required: env.GOOGLE_AUTH_REQUIRED === "true",
      configured: Boolean(env.GOOGLE_CLIENT_ID),
      csrfToken,
    },
    200,
    { "set-cookie": csrfCookieHeader(csrfToken) }
  );
}

export async function googleLogin(request, env, options = {}) {
  if (request.method !== "POST") return authJson({ error: "METHOD_NOT_ALLOWED" }, 405, { allow: "POST" });
  if (!sameOrigin(request)) return authJson({ error: "ORIGIN_NOT_ALLOWED" }, 403);
  if (!validCsrf(request)) return authJson({ error: "CSRF_VALIDATION_FAILED" }, 403);
  if (!/^application\/json(?:;|$)/i.test(request.headers.get("Content-Type") || "")) {
    return authJson({ error: "UNSUPPORTED_MEDIA_TYPE" }, 415);
  }
  if (!env.GOOGLE_CLIENT_ID || !env.DB) return unavailable();

  const clientIp = request.headers.get("CF-Connecting-IP");
  if (!clientIp) return authJson({ error: "CLIENT_ID_UNAVAILABLE" }, 403);
  if (!env.CHAT_RATE_LIMITER || typeof env.CHAT_RATE_LIMITER.limit !== "function") {
    return authJson({ error: "RATE_LIMIT_UNAVAILABLE" }, 503);
  }
  try {
    const { success } = await env.CHAT_RATE_LIMITER.limit({ key: `auth:ip:${clientIp}` });
    if (!success) return authJson({ error: "RATE_LIMIT_EXCEEDED" }, 429, { "retry-after": "60" });
  } catch {
    return authJson({ error: "RATE_LIMIT_UNAVAILABLE" }, 503);
  }

  let body;
  try {
    const text = await request.text();
    if (text.length > 16_000) return authJson({ error: "REQUEST_TOO_LARGE" }, 413);
    body = JSON.parse(text);
  } catch {
    return authJson({ error: "INVALID_JSON" }, 400);
  }
  const credential = body && typeof body.credential === "string" ? body.credential : "";
  const portal = body && (body.portal === "admin" || body.portal === "user") ? body.portal : "user";
  const nonce = body && typeof body.nonce === "string" ? body.nonce : "";
  if (!credential) return authJson({ error: "GOOGLE_CREDENTIAL_REQUIRED" }, 400);
  if (!/^[A-Za-z0-9_-]{32,128}$/.test(nonce)) {
    return authJson({ error: "GOOGLE_NONCE_REQUIRED" }, 400);
  }

  let identity;
  try {
    identity = await verifyGoogleIdToken(credential, env.GOOGLE_CLIENT_ID, { nonce, fetch: options.fetch || fetch });
  } catch (error) {
    const code = typeof error?.message === "string" ? error.message : "GOOGLE_TOKEN_INVALID";
    const status = code === "GOOGLE_JWKS_UNAVAILABLE" || code === "GOOGLE_CLIENT_ID_MISSING" ? 503 : 401;
    return authJson({ error: status === 503 ? "GOOGLE_VERIFICATION_UNAVAILABLE" : "GOOGLE_TOKEN_INVALID" }, status);
  }

  let user;
  try {
    user = await env.DB.prepare(
      "SELECT google_sub, email, display_name, status, role FROM users WHERE google_sub = ? LIMIT 1"
    ).bind(identity.sub).first();
  } catch {
    return authJson({ error: "AUTH_DATABASE_UNAVAILABLE" }, 503);
  }
  if (!user) {
    try {
      const allowlisted = await env.DB.prepare(
        "SELECT email FROM admin_bootstrap_allowlist WHERE email = ? COLLATE NOCASE LIMIT 1"
      ).bind(identity.email).first();
      if (allowlisted) {
        const emailOwner = await env.DB.prepare(
          "SELECT google_sub, email, display_name, status, role FROM users WHERE email = ? COLLATE NOCASE LIMIT 1"
        ).bind(identity.email).first();
        if (emailOwner && emailOwner.google_sub !== identity.sub) {
          return authJson({ error: "IDENTITY_CONFLICT", message: "Email ini telah terikat ke identitas Google lain. Hubungi administrator." }, 403);
        }
        if (!emailOwner) {
          await env.DB.prepare(
            "INSERT INTO users (google_sub, email, display_name, status, role) VALUES (?, ?, ?, 'active', 'admin')"
          ).bind(identity.sub, identity.email, identity.name).run();
        }
        user = await env.DB.prepare(
          "SELECT google_sub, email, display_name, status, role FROM users WHERE google_sub = ? LIMIT 1"
        ).bind(identity.sub).first();
      }
    } catch {
      return authJson({ error: "AUTH_DATABASE_UNAVAILABLE" }, 503);
    }
  }
  if (!user || user.status !== "active") {
    return authJson({
      error: "USER_NOT_ALLOWLISTED",
      message: "Akun ini belum diizinkan mengakses CerdikChat.",
      googleSub: identity.sub,
      email: identity.email,
    }, 403);
  }
  const role = user.role === "admin" || user.role === "super_admin" ? user.role : "user";
  const requiredPortal = role === "user" ? "user" : "admin";
  if (portal !== requiredPortal) {
    return authJson({ error: "ROLE_MISMATCH", requiredPortal, message: requiredPortal === "admin" ? "Akun ini harus masuk melalui Administrator Portal." : "Akun ini harus masuk melalui User Portal." }, 403);
  }

  const random = crypto.getRandomValues(new Uint8Array(32));
  const sessionId = toBase64Url(random);
  const sessionHash = await sha256Hex(sessionId);
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + SESSION_TTL_SECONDS;

  try {
    await env.DB.prepare(
      "INSERT INTO sessions (session_hash, google_sub, created_at, expires_at, revoked_at) VALUES (?, ?, ?, ?, NULL)"
    ).bind(sessionHash, identity.sub, now, expiresAt).run();
  } catch {
    return authJson({ error: "SESSION_CREATE_FAILED" }, 503);
  }

  return authJson(
    { authenticated: true, user: { email: user.email, displayName: user.display_name || identity.name, role } },
    200,
    { "set-cookie": cookieHeader(sessionId, SESSION_TTL_SECONDS) }
  );
}

export async function currentSession(request, env) {
  if (!env.DB) return unavailable();
  const sessionId = getCookie(request, SESSION_COOKIE);
  if (!sessionId || sessionId.length > 100) return authJson({ authenticated: false }, 401);
  const hash = await sha256Hex(sessionId);
  const now = Math.floor(Date.now() / 1000);
  try {
    const row = await env.DB.prepare(
      "SELECT s.google_sub, u.email, u.display_name, u.role FROM sessions s JOIN users u ON u.google_sub = s.google_sub WHERE s.session_hash = ? AND s.revoked_at IS NULL AND s.expires_at > ? AND u.status = 'active' LIMIT 1"
    ).bind(hash, now).first();
    if (!row) return authJson({ authenticated: false }, 401, { "set-cookie": clearCookieHeader() });
    return authJson({ authenticated: true, user: { email: row.email, displayName: row.display_name || "", role: row.role === "admin" || row.role === "super_admin" ? row.role : "user" } });
  } catch {
    return authJson({ error: "AUTH_DATABASE_UNAVAILABLE" }, 503);
  }
}

export async function requireSession(request, env) {
  if (!env.DB) return { ok: false, response: unavailable() };
  const sessionId = getCookie(request, SESSION_COOKIE);
  if (!sessionId || sessionId.length > 100) {
    return { ok: false, response: authJson({ error: "AUTH_REQUIRED" }, 401) };
  }
  const hash = await sha256Hex(sessionId);
  const now = Math.floor(Date.now() / 1000);
  try {
    const row = await env.DB.prepare(
      "SELECT s.google_sub, u.email, u.role FROM sessions s JOIN users u ON u.google_sub = s.google_sub WHERE s.session_hash = ? AND s.revoked_at IS NULL AND s.expires_at > ? AND u.status = 'active' LIMIT 1"
    ).bind(hash, now).first();
    if (!row) return { ok: false, response: authJson({ error: "AUTH_REQUIRED" }, 401, { "set-cookie": clearCookieHeader() }) };
    return { ok: true, subject: row.google_sub, email: row.email, role: row.role === "admin" || row.role === "super_admin" ? row.role : "user" };
  } catch {
    return { ok: false, response: authJson({ error: "AUTH_DATABASE_UNAVAILABLE" }, 503) };
  }
}

export async function requireAdminSession(request, env) {
  const session = await requireSession(request, env);
  if (!session.ok) return session;
  if (session.role !== "admin" && session.role !== "super_admin") {
    return { ok: false, response: authJson({ error: "ADMIN_REQUIRED" }, 403) };
  }
  return session;
}

export async function logout(request, env) {
  if (request.method !== "POST") return authJson({ error: "METHOD_NOT_ALLOWED" }, 405, { allow: "POST" });
  if (!sameOrigin(request)) return authJson({ error: "ORIGIN_NOT_ALLOWED" }, 403);
  if (!validCsrf(request)) return authJson({ error: "CSRF_VALIDATION_FAILED" }, 403);
  const sessionId = getCookie(request, SESSION_COOKIE);
  if (sessionId && env.DB) {
    try {
      const hash = await sha256Hex(sessionId);
      await env.DB.prepare(
        "UPDATE sessions SET revoked_at = ? WHERE session_hash = ? AND revoked_at IS NULL"
      ).bind(Math.floor(Date.now() / 1000), hash).run();
    } catch {
      return authJson({ error: "LOGOUT_FAILED" }, 503);
    }
  }
  return authJson({ authenticated: false }, 200, { "set-cookie": clearCookieHeader() });
}
