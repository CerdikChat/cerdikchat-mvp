# ATLAS-9 Secure User Approval & Onboarding (PR #30)

## Scope
- A Google-verified identity can submit a standard-user access request.
- Pending identities are stored in a separate `user_access_requests` table.
- The existing `users.status` constraint remains unchanged: `active` or `disabled`.
- A pending request does not create a `users` row or a login session.
- Only an authenticated administrator can list pending requests and approve, reject, or suspend a standard-user account.
- Approval creates a `users` row with `status='active'` and `role='user'`.
- Suspension changes only `users.status` from `active` to `disabled`; session validation already requires active status.
- Every administrator decision is recorded in `admin_audit_log`.
- Google `sub` remains the immutable identity key; email is used only to locate a request for an administrator's decision.

## API
- `POST /api/auth/request-access`: same-origin + CSRF protected; accepts a Google GIS credential and nonce; returns HTTP 202 with `status: pending`; no session cookie is issued.
- `GET /api/admin/users/pending`: requires an active admin/super_admin session; returns at most 100 pending standard-user requests.
- `POST /api/admin/users/decision`: requires an active admin/super_admin session and CSRF; body `{"email":"user@example.com","decision":"approve"}`, `reject`, or `suspend`.
- Approval/rejection updates the request queue and audit log in one D1 batch. Approval creates only a standard-user account.

## Preview-only migration
Migration `0005_user_approval_index.sql` creates the isolated access-request queue and lookup indexes. Review the active D1 binding before applying; do not run against Production. No migration is automatically applied by this PR.

## Human test checklist
1. Use a dedicated Google account that is not in the administrator allowlist.
2. Choose User Portal and complete Google verification; expect HTTP 202 and a pending message.
3. Confirm no session cookie is issued and the account cannot access the chat or Admin endpoints while pending.
4. Sign in as an approved administrator; retrieve pending requests in Administrator Dashboard.
5. Approve the dedicated test account.
6. Sign in through User Portal; verify `/api/auth/me` reports role `user`.
7. Verify `/api/admin/session` returns HTTP 403 `ADMIN_REQUIRED` for that user.
8. Verify Administrator Portal selection returns `ROLE_MISMATCH` and no session.
9. Suspend the test user and verify existing sessions stop working because session validation requires `users.status='active'`.
10. Verify audit log entries for approval, rejection, and suspension; never expose Google subject/session identifiers in UI or logs.

## Safety boundaries
- This PR is code-only until separately approved for Preview migration and deployment.
- No Production D1, Production deployment, OAuth configuration, secrets, billing, or merge changes.
- Do not use the project owner's real identity as a standard-user test account.
- The dashboard approval panel consumes real APIs; it must display API errors and must not show mock records or simulated success.
