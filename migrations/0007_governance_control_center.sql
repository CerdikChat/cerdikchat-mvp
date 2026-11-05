-- Governance completion migration. Preview D1 only; requires migration 0006 first.
ALTER TABLE users ADD COLUMN governance_tier TEXT NOT NULL DEFAULT 'user'
  CHECK (governance_tier IN ('user','admin','superior_admin','super_admin'));
CREATE TABLE IF NOT EXISTS admin_audit_events (
  audit_id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  actor_email TEXT NOT NULL COLLATE NOCASE,
  action TEXT NOT NULL,
  target_email TEXT NOT NULL COLLATE NOCASE,
  details TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_admin_audit_events_created ON admin_audit_events(created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_access_requests_one_pending_email ON access_requests(email) WHERE status='pending';
