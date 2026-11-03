# ATLAS-9 Secure User Approval & Onboarding (PR #30)

## Scope
- A Google-verified identity can submit a standard-user access request.
- Pending identities are stored in a separate `user_access_requests` table.
- The existing `users.status` constraint remains unchanged: `active` or `disabled`.
- A pending request does not create a `users` row or a login session.
- An authenticated `admin` or `super_admin` can list pending requests.
- Only an authenticated `super_admin` can approve, reject, or suspend a standard-user account; ordinary `admin` receives HTTP 403 `SUPER_ADMIN_REQUIRED`.
- Approval creates a `users` row with `status='active'` and `role='user'`.
- Suspension changes `users.status` from `active` to `disabled` and revokes all sessions for that Google subject in the same D1 batch.
- Every administrator decision is recorded in `admin_audit_log`.
- Google `sub` remains the immutable identity key; email is used only to locate a request for an administrator's decision.

## API
- `POST /api/auth/request-access`: same-origin + CSRF protected; accepts a Google GIS credential and nonce; returns HTTP 202 with `status: pending`; no session cookie is issued.
- `GET /api/admin/users/pending`: requires an active admin/super_admin session; returns at most 100 pending standard-user requests.
- `POST /api/admin/users/decision`: requires an active `super_admin` session and CSRF; body `{"email":"user@example.com","decision":"approve"}`, `reject`, or `suspend`.
- The approval INSERT enforces the 30-active-standard-user ceiling (`role='user'`) inside the write statement. Administrator and Super Administrator accounts do not consume pilot seats. A full pilot returns HTTP 409 `PILOT_CAP_REACHED`; a prior count/read is not used to allocate the final seat.
- Approval/rejection updates the request queue and audit log in one D1 batch. Approval creates only a standard-user account.

## Super Administrator bootstrap (Preview only)

The role schema supports `user`, `admin`, and `super_admin`. The existing bootstrap allowlist creates ordinary `admin` accounts; it does not automatically designate a Super Administrator.

After a specifically authorized operator has identified the intended, verified administrator account, promote exactly that account in the isolated Preview D1 database. Do not place the email or Google subject in source code, PR text, screenshots, or public logs. Confirm the target is already an active `admin` and that exactly one row is affected. The product owner must explicitly identify which allowlisted identity receives this authority before this step.

```sql
UPDATE users
SET role = 'super_admin', updated_at = unixepoch()
WHERE email = '<APPROVED_SUPER_ADMIN_EMAIL>'
  AND status = 'active'
  AND role = 'admin';
```

Verify the result privately:

```sql
SELECT role, status FROM users
WHERE email = '<APPROVED_SUPER_ADMIN_EMAIL>';
```

Do not run this against Production. This is a controlled Preview bootstrap step, not an application self-service feature.

## Preview-only migration
The canonical migration sequence is `0003_user_roles_and_admin_audit.sql` (role and audit-log schema), `0004_admin_bootstrap_allowlist.sql` (administrator allowlist), then `0005_user_approval_index.sql` (access-request queue and lookup indexes). The PR #30 feature branch is aligned to these exact migration filenames because the `cerdikchat-staging` D1 ledger records all three as applied. The staging database was inspected read-only on 3 November 2026: migrations `0001` through `0005` are recorded as applied, `users.role` exists, and `sessions.revoked_at` exists. No migration needs to be rerun on this staging database. Never apply the alternate `0003_roles_admin_bootstrap.sql` migration identity to this database; it attempts to add the same role/audit schema under a different filename and could fail with a duplicate-column error. For any new isolated database, apply only the canonical sequence after reviewing its own ledger. Never run against Production.

## Human test checklist
1. Use a dedicated Google account that is not in the administrator allowlist.
2. Choose User Portal and complete Google verification; expect HTTP 202 and a pending message.
3. Confirm no session cookie is issued and the account cannot access the chat or Admin endpoints while pending.
4. Sign in as an approved administrator; retrieve pending requests in Administrator Dashboard.
5. Verify an ordinary `admin` receives HTTP 403 `SUPER_ADMIN_REQUIRED` when attempting approve, reject, or suspend.
6. Verify a designated `super_admin` can approve the dedicated test account.
7. Sign in through User Portal; verify `/api/auth/me` reports role `user`.
8. Verify `/api/admin/session` returns HTTP 403 `ADMIN_REQUIRED` for that user.
9. Verify Administrator Portal selection returns `ROLE_MISMATCH` and no session.
10. Suspend the test user and verify all session rows are revoked and existing sessions stop working.
11. Verify audit log entries for approval, rejection, and suspension; never expose Google subject/session identifiers in UI or logs.

## Safety boundaries
- This PR is code-only until separately approved for Preview migration and deployment.
- No Production D1, Production deployment, OAuth configuration, secrets, billing, or merge changes.
- Do not use the project owner's real identity as a standard-user test account.
- The dashboard approval panel consumes real APIs; it must display API errors and must not show mock records or simulated success.
