-- CerdikGo Preview governance compatibility migration.
-- The existing cerdikchat-staging database already has users.role and a legacy
-- admin_audit_log table from earlier migrations. Do not add role again or
-- replace that legacy audit table here.
-- Adds only the missing expiry and read-only access-request schema expected
-- by admin-portal.js. No approval/rejection or audit-write endpoints are enabled.
ALTER TABLE users ADD COLUMN approved_at INTEGER;
ALTER TABLE users ADD COLUMN access_expires_at INTEGER;

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
