const GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
const GOOGLE_JWKS = "https://www.googleapis.com/oauth2/v3/certs";
const ISSUERS = new Set(["https://accounts.google.com", "accounts.google.com"]);
const COOKIE = "__Host-cerdikchat_session";
const STATE_TTL = 600;
const SESSION_TTL = 60 * 60 * 24 * 7;
let jwksCache = { keys: null, expiresAt: 0 };

function b64url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function fromB64url(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - value.length % 4) % 4);
  return Uint8Array.from(atob(padded), c => c.charCodeAt(0));
}
function randomToken(size = 32) {
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  return b64url(bytes);
}
async function sha256(value) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
}
async function hashToken(value) {
  return b64url(await sha256(value));
}
function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: {
    "content-type": "application/json; charset=utf-8", "cache-control": "no-store",
    "x-content-type-options": "nosniff", "referrer-policy": "no-referrer", ...headers
  }});
}
function cookie(value, maxAge) {
  return `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}
function clearCookie() { return cookie("", 0); }
function validEmail(value) {
  return typeof value === "string" && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
async function loadGoogleKeys() {
  if (jwksCache.keys && jwksCache.expiresAt > Date.now()) return jwksCache.keys;
  const response = await fetch(GOOGLE_JWKS, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error("GOOGLE_JWKS_UNAVAILABLE");
  const data = await response.json();
  const cacheControl = response.headers.get("cache-control") || "";
  const match = cacheControl.match(/max-age=(\d+)/);
  jwksCache = { keys: data.keys, expiresAt: Date.now() + Math.min(Number(match?.[1] || 300), 3600) * 1000 };
  return jwksCache.keys;
}
async function verifyIdToken(token, expectedAudience, expectedNonce) {
  if (typeof token !== "string" || token.length > 12000) throw new Error("INVALID_ID_TOKEN");
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("INVALID_ID_TOKEN");
  const header = JSON.parse(new TextDecoder().decode(fromB64url(parts[0])));
  const claims = JSON.parse(new TextDecoder().decode(fromB64url(parts[1])));
  if (header.alg !== "RS256" || typeof header.kid !== "string") throw new Error("INVALID_ID_TOKEN_ALGORITHM");
  const keyData = (await loadGoogleKeys()).find(key => key.kid === header.kid && key.kty === "RSA" && key.use === "sig");
  if (!keyData) { jwksCache.expiresAt = 0; throw new Error("GOOGLE_SIGNING_KEY_NOT_FOUND"); }
  const key = await crypto.subtle.importKey("jwk", keyData, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, fromB64url(parts[2]), new TextEncoder().encode(parts[0] + "." + parts[1]));
  const now = Math.floor(Date.now() / 1000);
  if (!valid || !ISSUERS.has(claims.iss) || claims.aud !== expectedAudience ||
      (claims.exp || 0) <= now || (claims.iat || 0) > now + 60 ||
      claims.nonce !== expectedNonce || claims.email_verified !== true ||
      !validEmail(claims.email) || typeof claims.sub !== "string" || claims.sub.length > 255) {
    throw new Error("ID_TOKEN_CLAIMS_INVALID");
  }
  return { sub: claims.sub, email: claims.email.trim().toLowerCase(), name: typeof claims.name === "string" ? claims.name.slice(0, 160) : "" };
}
async function handleGoogleAuth(request, env) {
  const url = new URL(request.url);
  if (!env.DB || !env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_REDIRECT_URI) {
    return json({ error: "AUTH_NOT_CONFIGURED", message: "Google OIDC belum dikonfigurasi." }, 503);
  }
  if (url.pathname === "/auth/google/start" && request.method === "GET") {
    const state = randomToken(), nonce = randomToken(), verifier = randomToken(48);
    const challenge = b64url(await sha256(verifier));
    await env.DB.prepare("INSERT INTO oauth_states (state_hash, nonce, verifier, expires_at) VALUES (?, ?, ?, ?)")
      .bind(await hashToken(state), nonce, verifier, Math.floor(Date.now()/1000) + STATE_TTL).run();
    const target = new URL(GOOGLE_AUTH);
    target.search = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID, redirect_uri: env.GOOGLE_REDIRECT_URI,
      response_type: "code", scope: "openid email profile", state, nonce,
      code_challenge: challenge, code_challenge_method: "S256", prompt: "select_account"
    }).toString();
    return Response.redirect(target.toString(), 302);
  }
  if (url.pathname === "/auth/google/callback" && request.method === "GET") {
    const code = url.searchParams.get("code"), state = url.searchParams.get("state");
    if (!code || !state || code.length > 4096 || state.length > 256) return json({error:"OAUTH_RESPONSE_INVALID"},400);
    const pending = await env.DB.prepare("SELECT nonce, verifier FROM oauth_states WHERE state_hash = ? AND expires_at > ?")
      .bind(await hashToken(state), Math.floor(Date.now()/1000)).first();
    await env.DB.prepare("DELETE FROM oauth_states WHERE state_hash = ?").bind(await hashToken(state)).run();
    if (!pending) return json({error:"OAUTH_STATE_INVALID"},400);
    const body = new URLSearchParams({
      code, client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: env.GOOGLE_REDIRECT_URI, grant_type: "authorization_code", code_verifier: pending.verifier
    });
    const tokenResponse = await fetch(GOOGLE_TOKEN, { method:"POST", headers:{"content-type":"application/x-www-form-urlencoded"}, body });
    if (!tokenResponse.ok) return json({error:"OAUTH_EXCHANGE_FAILED"},502);
    const tokenPayload = await tokenResponse.json();
    const identity = await verifyIdToken(tokenPayload.id_token, env.GOOGLE_CLIENT_ID, pending.nonce);
    const allowed = await env.DB.prepare("SELECT email, google_sub, active FROM pilot_users WHERE email = ?")
      .bind(identity.email).first();
    if (!allowed || allowed.active !== 1 || (allowed.google_sub && allowed.google_sub !== identity.sub)) {
      await env.DB.prepare("INSERT INTO auth_audit_logs (event, email, created_at) VALUES ('DENIED', ?, ?)")
        .bind(identity.email, Math.floor(Date.now()/1000)).run();
      return new Response("Akun ini belum diizinkan mengikuti pilot CerdikChat.", {status:403, headers:{"content-type":"text/plain; charset=utf-8","cache-control":"no-store"}});
    }
    await env.DB.prepare("UPDATE pilot_users SET google_sub = ?, last_login_at = ? WHERE email = ?")
      .bind(identity.sub, Math.floor(Date.now()/1000), identity.email).run();
    const session = randomToken(), sessionHash = await hashToken(session), now = Math.floor(Date.now()/1000);
    await env.DB.prepare("INSERT INTO pilot_sessions (session_hash, email, google_sub, expires_at, created_at) VALUES (?, ?, ?, ?, ?)")
      .bind(sessionHash, identity.email, identity.sub, now + SESSION_TTL, now).run();
    await env.DB.prepare("INSERT INTO auth_audit_logs (event, email, created_at) VALUES ('LOGIN', ?, ?)")
      .bind(identity.email, now).run();
    return new Response(null, {status:302, headers:{location:"/", "set-cookie":cookie(session,SESSION_TTL), "cache-control":"no-store"}});
  }
  if (url.pathname === "/auth/logout" && request.method === "POST") {
    const origin = request.headers.get("Origin");
    if (origin !== url.origin) return json({error:"ORIGIN_NOT_ALLOWED"},403,{"set-cookie":clearCookie()});
    const token = (request.headers.get("Cookie") || "").split(";").map(v=>v.trim()).find(v=>v.startsWith(COOKIE+"="))?.slice(COOKIE.length+1);
    if (token) await env.DB.prepare("DELETE FROM pilot_sessions WHERE session_hash = ?").bind(await hashToken(token)).run();
    return new Response(null,{status:204,headers:{"set-cookie":clearCookie(),"cache-control":"no-store"}});
  }
  if (url.pathname === "/auth/session" && request.method === "GET") {
    const session = await getSession(request, env);
    if (!session) return json({ authenticated: false }, 401);
    const admin = await env.DB.prepare("SELECT role FROM admin_users WHERE email = ? AND active = 1")
      .bind(session.email).first();
    return json({
      authenticated: true,
      displayName: admin?.role === "super_admin"
        ? "CerdikChat Super Administrator"
        : "Pengguna CerdikChat",
      isAdministrator: !!admin
    });
  }
  return null;
}
async function getSession(request, env) {
  if (!env.DB) return null;
  const token = (request.headers.get("Cookie") || "").split(";").map(v=>v.trim()).find(v=>v.startsWith(COOKIE+"="))?.slice(COOKIE.length+1);
  if (!token || token.length > 128) return null;
  const row = await env.DB.prepare("SELECT email, google_sub, expires_at FROM pilot_sessions WHERE session_hash = ? AND expires_at > ?")
    .bind(await hashToken(token), Math.floor(Date.now()/1000)).first();
  if (!row) return null;
  const user = await env.DB.prepare("SELECT active FROM pilot_users WHERE email = ? AND google_sub = ?").bind(row.email,row.google_sub).first();
  return user?.active === 1 ? {email:row.email, googleSub:row.google_sub} : null;
}
export { handleGoogleAuth, getSession };
