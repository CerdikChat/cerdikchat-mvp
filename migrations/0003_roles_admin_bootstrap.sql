-- ATLAS-9 RBAC foundation: every existing account remains a standard user.
-- Administrator promotion is possible only for explicitly provisioned, verified Google identities.
ALTER TABLE users
  ADD COLUMN role TEXT NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin', 'super_admin'));

CREATE TABLE IF NOT EXISTS admin_bootstrap_allowlist (
  email TEXT PRIMARY KEY COLLATE NOCASE,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

INSERT OR IGNORE INTO admin_bootstrap_allowlist (email) VALUES
  ('dr.ngyoonseong@gmail.com'),
  ('dr.amikarmila@gmail.com');

-- Administrative actions must be attributable and reviewable.
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
