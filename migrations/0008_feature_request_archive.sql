-- Feature request archive support. Apply to the intended environment only after approval.
-- This is a reversible soft-archive: proposal content is retained for audit/recovery.
ALTER TABLE feature_requests ADD COLUMN archived_at INTEGER;
ALTER TABLE feature_requests ADD COLUMN archived_by TEXT;
CREATE INDEX IF NOT EXISTS idx_feature_requests_archived_created
  ON feature_requests(archived_at, created_at DESC);
