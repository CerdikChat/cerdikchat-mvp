-- ATLAS-9 Phase 2.1: server-enforced role-based authorization.
-- Apply only to the isolated cerdikchat-staging D1 database during Preview validation.
-- Existing users remain least-privilege "user" by default; no account is promoted here.
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin', 'super_admin'));

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_google_sub TEXT NOT NULL,
  target_google_sub TEXT,
  action TEXT NOT NULL,
  previous_role TEXT,
  new_role TEXT,
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_actor_created
  ON admin_audit_log(actor_google_sub, created_at);
CREATE INDEX IF NOT EXISTS idx_admin_audit_target_created
  ON admin_audit_log(target_google_sub, created_at);
