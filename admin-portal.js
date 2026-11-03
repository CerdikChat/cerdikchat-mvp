"use strict";

import { requireSession } from "./auth/google-auth.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, private",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
      "vary": "Cookie",
    },
  });
}

function sameOrigin(request) {
  const requestOrigin = request.headers.get("Origin");
  const expectedOrigin = new URL(request.url).origin;
  if (requestOrigin) return requestOrigin === expectedOrigin;

  // Browsers commonly omit Origin on safe GET navigations and same-origin fetches.
  // Accept only Fetch Metadata that proves same-origin or an address-bar navigation.
  if (request.method !== "GET") return false;
  const fetchSite = request.headers.get("Sec-Fetch-Site");
  if (fetchSite === "same-origin" || fetchSite === "none") return true;

  const referer = request.headers.get("Referer");
  try { return Boolean(referer) && new URL(referer).origin === expectedOrigin; }
  catch { return false; }
}

async function requireAdmin(request, env) {
  if (!sameOrigin(request)) return { response: json({ error: "ORIGIN_NOT_ALLOWED" }, 403) };
  const session = await requireSession(request, env);
  if (!session.ok) return { response: session.response };
  try {
    const user = await env.DB.prepare(
      "SELECT role, access_expires_at FROM users WHERE google_sub = ? AND status = 'active' LIMIT 1"
    ).bind(session.subject).first();
    if (!user) return { response: json({ error: "AUTH_REQUIRED" }, 401) };
    if (!["admin", "super_admin"].includes(user.role)) {
      return { response: json({ error: "ADMIN_REQUIRED" }, 403) };
    }
    if (user.access_expires_at != null && user.access_expires_at <= Math.floor(Date.now() / 1000)) {
      return { response: json({ error: "ADMIN_ACCESS_EXPIRED" }, 403) };
    }
    return { session, role: user.role };
  } catch {
    // Missing governance migration or unavailable D1 must never grant access.
    return { response: json({ error: "ADMIN_GOVERNANCE_UNAVAILABLE" }, 503) };
  }
}

export async function adminSession(request, env) {
  if (request.method !== "GET") return json({ error: "METHOD_NOT_ALLOWED" }, 405);
  const access = await requireAdmin(request, env);
  if (access.response) return access.response;
  return json({ authenticated: true, role: access.role, email: access.session.email });
}

export async function pendingAdminUsers(request, env) {
  if (request.method !== "GET") return json({ error: "METHOD_NOT_ALLOWED" }, 405);
  const access = await requireAdmin(request, env);
  if (access.response) return access.response;
  try {
    const result = await env.DB.prepare(
      "SELECT request_id, email, display_name, reason, status, requested_at FROM access_requests WHERE status = 'pending' ORDER BY requested_at ASC LIMIT 100"
    ).all();
    return json({ requests: Array.isArray(result.results) ? result.results : [] });
  } catch {
    return json({ error: "ADMIN_QUEUE_UNAVAILABLE" }, 503);
  }
}
