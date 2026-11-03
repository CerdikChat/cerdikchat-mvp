-- CerdikGo access governance foundation.
-- Schema only: do NOT apply automatically. Apply to isolated Preview D1
-- only after the migration is reviewed and explicitly authorized.
-- Existing active accounts retain their current access until explicitly
-- migrated to an approval expiry; newly approved accounts receive 76 hours.

ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin', 'super_admin'));
ALTER TABLE users ADD COLUMN approved_at INTEGER;
ALTER TABLE users ADD COLUMN access_expires_at INTEGER;

CREATE INDEX IF NOT EXISTS idx_users_role_status
  ON users(role, status);
CREATE INDEX IF NOT EXISTS idx_users_access_expiry
  ON users(access_expires_at);

CREATE TABLE IF NOT EXISTS access_requests (
  request_id TEXT PRIMARY KEY,
  email TEXT NOT NULL COLLATE NOCASE,
  display_name TEXT NOT NULL DEFAULT '',
  google_sub TEXT,
  reason TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  requested_at INTEGER NOT NULL,
  decided_at INTEGER,
  decided_by TEXT,
  approval_expires_at INTEGER,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_access_requests_status_requested
  ON access_requests(status, requested_at);
CREATE INDEX IF NOT EXISTS idx_access_requests_email
  ON access_requests(email);

CREATE TABLE IF NOT EXISTS admin_audit_log (
  audit_id TEXT PRIMARY KEY,
  actor_google_sub TEXT NOT NULL,
  actor_email TEXT NOT NULL COLLATE NOCASE,
  actor_role TEXT NOT NULL
    CHECK (actor_role IN ('admin', 'super_admin')),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  occurred_at INTEGER NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_admin_audit_actor_time
  ON admin_audit_log(actor_google_sub, occurred_at);
CREATE INDEX IF NOT EXISTS idx_admin_audit_target_time
  ON admin_audit_log(target_type, target_id, occurred_at);
