-- ATLAS-9 RBAC reconciliation migration.
-- PR #21's 0003_user_roles_and_admin_audit.sql is already applied in staging.
-- Add only the bootstrap allowlist required by the PR #23 authentication flow.
-- Do not re-add users.role or recreate admin_audit_log here.

CREATE TABLE IF NOT EXISTS admin_bootstrap_allowlist (
  email TEXT PRIMARY KEY COLLATE NOCASE,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

INSERT OR IGNORE INTO admin_bootstrap_allowlist (email) VALUES
  ('dr.ngyoonseong@gmail.com'),
  ('dr.amikarmila@gmail.com');
