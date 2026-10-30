-- Apply only to the isolated cerdikchat-staging D1 database.
-- Requires migrations/0001_google_oidc.sql to have been applied first.

CREATE TABLE IF NOT EXISTS admin_users (
  email TEXT PRIMARY KEY COLLATE NOCASE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Initial Super Administrator designated by the project owner.
INSERT INTO admin_users (email, role, active)
VALUES ('dr.ngyoonseong@gmail.com', 'super_admin', 1)
ON CONFLICT(email) DO UPDATE SET role = 'super_admin', active = 1;

CREATE TABLE IF NOT EXISTS access_requests (
  email TEXT PRIMARY KEY COLLATE NOCASE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  decided_by TEXT
);
CREATE INDEX IF NOT EXISTS idx_access_requests_status_time
  ON access_requests(status, requested_at);

CREATE TABLE IF NOT EXISTS admin_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  subject_email TEXT,
  message TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  read_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created
  ON admin_notifications(created_at);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event TEXT NOT NULL,
  actor_email TEXT NOT NULL,
  subject_email TEXT,
  detail TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created
  ON admin_audit_logs(created_at);
