-- ATLAS-9 RBAC foundation: every existing account remains a standard user.
-- Administrator promotion is possible only for explicitly provisioned, verified Google identities.
ALTER TABLE users
  ADD COLUMN role TEXT NOT NULL DEFAULT 'user'
  CHECK (role IN ('admin', 'user'));

CREATE TABLE IF NOT EXISTS admin_bootstrap_allowlist (
  email TEXT PRIMARY KEY COLLATE NOCASE,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

INSERT OR IGNORE INTO admin_bootstrap_allowlist (email) VALUES
  ('dr.ngyoonseong@gmail.com'),
  ('dr.amikarmila@gmail.com');
