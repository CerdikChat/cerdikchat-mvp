function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer"
    }
  });
}

function normalizeEmail(value) {
  if (typeof value !== "string") return "";
  const email = value.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

async function recordAudit(db, event, actor, subject, detail = "") {
  await db.prepare(
    "INSERT INTO admin_audit_logs (event, actor_email, subject_email, detail, created_at) VALUES (?, ?, ?, ?, ?)"
  ).bind(event, actor, subject || null, detail.slice(0, 300), Math.floor(Date.now() / 1000)).run();
}

async function notifyAdmins(db, type, subject, message) {
  await db.prepare(
    "INSERT INTO admin_notifications (type, subject_email, message, created_at) VALUES (?, ?, ?, ?)"
  ).bind(type, subject || null, message.slice(0, 300), Math.floor(Date.now() / 1000)).run();
}

async function getAdmin(db, email) {
  return db.prepare("SELECT email, role FROM admin_users WHERE email = ? AND active = 1")
    .bind(email).first();
}

async function readJson(request) {
  const length = Number(request.headers.get("Content-Length") || 0);
  if (length > 4096) return null;
  try {
    const value = await request.json();
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  } catch { return null; }
}

export async function handleAdminRoutes(request, env, session) {
  const url = new URL(request.url);
  if (!env.DB) return json({ error: "DATABASE_UNAVAILABLE" }, 503);

  if (url.pathname === "/auth/request-access" && request.method === "POST") {
    const origin = request.headers.get("Origin");
    if (origin !== url.origin) return json({ error: "ORIGIN_NOT_ALLOWED" }, 403);
    if (env.CHAT_RATE_LIMITER?.limit) {
      const ip = request.headers.get("CF-Connecting-IP") || "unknown";
      const limit = await env.CHAT_RATE_LIMITER.limit({ key: `access-request:${ip}` });
      if (!limit.success) return json({ error: "RATE_LIMIT_EXCEEDED" }, 429);
    }
    const body = await readJson(request);
    const email = normalizeEmail(body?.email);
    if (!email) return json({ error: "VALID_EMAIL_REQUIRED" }, 400);
    if (await getAdmin(env.DB, email)) return json({ status: "administrator_identity_reserved" }, 200);

    const existing = await env.DB.prepare(
      "SELECT status FROM access_requests WHERE email = ?"
    ).bind(email).first();
    if (existing?.status === "pending") return json({ status: "already_pending" }, 200);

    await env.DB.prepare(
      "INSERT INTO access_requests (email, status, requested_at, updated_at) VALUES (?, 'pending', ?, ?) " +
      "ON CONFLICT(email) DO UPDATE SET status = 'pending', requested_at = excluded.requested_at, updated_at = excluded.updated_at"
    ).bind(email, Math.floor(Date.now()/1000), Math.floor(Date.now()/1000)).run();

    await notifyAdmins(env.DB, "ACCESS_REQUEST", email, "Permintaan akses baru menunggu keputusan administrator.");
    await recordAudit(env.DB, "ACCESS_REQUESTED", email, email);
    return json({ status: "pending_approval", message: "Permintaan dicatat dan menunggu persetujuan administrator." }, 202);
  }

  if (!url.pathname.startsWith("/admin/")) return null;
  if (!session?.email) return json({ error: "AUTHENTICATION_REQUIRED" }, 401);
  const actorAdmin = await getAdmin(env.DB, session.email);\n  if (!actorAdmin) return json({ error: "ADMIN_REQUIRED" }, 403);

  if (request.method === "GET" && url.pathname === "/admin/summary") {
    const [pending, users, notifications, audit] = await Promise.all([
      env.DB.prepare("SELECT email, requested_at FROM access_requests WHERE status = 'pending' ORDER BY requested_at DESC LIMIT 50").all(),
      env.DB.prepare("SELECT email, active, created_at, last_login_at FROM pilot_users ORDER BY created_at DESC LIMIT 100").all(),
      env.DB.prepare("SELECT id, type, subject_email, message, created_at, read_at FROM admin_notifications ORDER BY created_at DESC LIMIT 50").all(),
      env.DB.prepare("SELECT id, event, actor_email, subject_email, detail, created_at FROM admin_audit_logs ORDER BY created_at DESC LIMIT 100").all()
    ]);
    return json({
      administrator: actorAdmin.role === "super_admin" ? "CerdikChat Super Administrator" : "CerdikChat Administrator",
      pendingRequests: pending.results || [],
      users: (users.results || []).map((user) => ({\n        ...user,\n        email: user.email === session.email ? (actorAdmin.role === "super_admin" ? "CerdikChat Super Administrator" : "CerdikChat Administrator") : user.email\n      })),
      notifications: notifications.results || [],
      auditLog: (audit.results || []).map((entry) => ({\n        ...entry,\n        actor_email: entry.actor_email === session.email ? (actorAdmin.role === "super_admin" ? "CerdikChat Super Administrator" : "CerdikChat Administrator") : "CerdikChat Administrator"\n      }))
    });
  }

  if (request.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405);
  if (request.headers.get("Origin") !== url.origin) return json({ error: "ORIGIN_NOT_ALLOWED" }, 403);
  const body = await readJson(request);
  const email = normalizeEmail(body?.email);
  if (!email) return json({ error: "VALID_EMAIL_REQUIRED" }, 400);
  const actor = session.email;

  if (url.pathname === "/admin/approve") {
    const requestRow = await env.DB.prepare("SELECT status FROM access_requests WHERE email = ?").bind(email).first();
    if (!requestRow || requestRow.status !== "pending") return json({ error: "PENDING_REQUEST_NOT_FOUND" }, 404);
    const count = await env.DB.prepare("SELECT COUNT(*) AS total FROM pilot_users WHERE active = 1").first();
    if ((count?.total || 0) >= 30) return json({ error: "PILOT_CAPACITY_REACHED" }, 409);
    await env.DB.prepare("INSERT INTO pilot_users (email, active) VALUES (?, 1) ON CONFLICT(email) DO UPDATE SET active = 1")
      .bind(email).run();
    await env.DB.prepare("UPDATE access_requests SET status = 'approved', decided_by = ?, updated_at = ? WHERE email = ?")
      .bind(actor, Math.floor(Date.now()/1000), email).run();
    await notifyAdmins(env.DB, "ACCESS_APPROVED", email, "Permintaan akses disetujui.");
    await recordAudit(env.DB, "USER_APPROVED", actor, email);
    return json({ status: "approved", email });
  }

  if (url.pathname === "/admin/reject") {
    const result = await env.DB.prepare("UPDATE access_requests SET status = 'rejected', decided_by = ?, updated_at = ? WHERE email = ? AND status = 'pending'")
      .bind(actor, Math.floor(Date.now()/1000), email).run();
    if (!result.meta?.changes) return json({ error: "PENDING_REQUEST_NOT_FOUND" }, 404);
    await notifyAdmins(env.DB, "ACCESS_REJECTED", email, "Permintaan akses ditolak.");
    await recordAudit(env.DB, "USER_REJECTED", actor, email);
    return json({ status: "rejected", email });
  }

  if (url.pathname === "/admin/disable" || url.pathname === "/admin/enable") {
    if (email === ADMIN_EMAIL) return json({ error: "SUPER_ADMIN_PROTECTED" }, 403);
    if (email === actor) return json({ error: "SELF_MODIFICATION_BLOCKED" }, 403);
    if (await isAdmin(env.DB, email)) return json({ error: "ADMIN_ACCOUNT_PROTECTED" }, 403);

    const active = url.pathname === "/admin/enable" ? 1 : 0;
    const result = await env.DB.prepare("UPDATE pilot_users SET active = ? WHERE email = ?")
      .bind(active, email).run();
    if (!result.meta?.changes) return json({ error: "USER_NOT_FOUND" }, 404);
    if (!active) {
      await env.DB.prepare("DELETE FROM pilot_sessions WHERE email = ?").bind(email).run();
    }
    const event = active ? "USER_ENABLED" : "USER_DISABLED";
    await notifyAdmins(env.DB, event, email, active ? "Akun pengguna diaktifkan kembali." : "Akun dinonaktifkan dan seluruh sesi dicabut.");
    await recordAudit(env.DB, event, actor, email);
    return json({ status: active ? "enabled" : "disabled", sessionsRevoked: !active });
  }

  if (url.pathname === "/admin/notifications/read") {
    const id = Number(body?.id);
    if (!Number.isSafeInteger(id) || id < 1) return json({ error: "VALID_NOTIFICATION_ID_REQUIRED" }, 400);
    await env.DB.prepare("UPDATE admin_notifications SET read_at = ? WHERE id = ?")
      .bind(Math.floor(Date.now()/1000), id).run();
    await recordAudit(env.DB, "NOTIFICATION_READ", actor, null, String(id));
    return json({ status: "read" });
  }

  return json({ error: "NOT_FOUND" }, 404);
}
