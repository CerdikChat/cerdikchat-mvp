-- ATLAS-9 user approval queue lookup optimization.
-- Existing users.status and users.role columns are established by prior auth/RBAC migrations.
-- This migration adds no account rows, grants, or status changes.
CREATE INDEX IF NOT EXISTS idx_users_role_status_email
  ON users(role, status, email COLLATE NOCASE);
