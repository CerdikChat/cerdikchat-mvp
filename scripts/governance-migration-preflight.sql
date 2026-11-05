-- Read-only preflight for migrations/0007_governance_control_center.sql.
-- Expected result: zero rows. Do not delete or auto-merge pending requests.
SELECT lower(trim(email)) AS normalized_email, COUNT(*) AS pending_count,
       GROUP_CONCAT(request_id) AS request_ids
FROM access_requests
WHERE status = 'pending'
GROUP BY lower(trim(email))
HAVING COUNT(*) > 1
ORDER BY pending_count DESC, normalized_email;
