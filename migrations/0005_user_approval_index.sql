-- ATLAS-9 secure User onboarding queue.
-- Keep users.status compatible with the established CHECK ('active','disabled').
-- Pending identities are held separately and cannot authenticate or obtain sessions.
CREATE TABLE IF NOT EXISTS user_access_requests (
  google_sub TEXT PRIMARY KEY,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  display_name TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at INTEGER NOT NULL DEFAULT (unixepoch()),
  reviewed_at INTEGER,
  reviewed_by TEXT
);
CREATE INDEX IF NOT EXISTS idx_user_access_requests_status_requested
  ON user_access_requests(status, requested_at);
CREATE INDEX IF NOT EXISTS idx_users_role_status_email
  ON users(role, status, email COLLATE NOCASE);
