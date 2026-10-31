# ATLAS-9 Administrator and User Portal RBAC

## Security model

- Google ID tokens are verified server-side (RS256, issuer, audience, nonce, expiry, and verified email).
- The immutable Google `sub` is the account key. Email is used only for the initial, exact-match bootstrap allowlist check.
- `users.role` is read from D1 for each authenticated request. A browser-selected portal is intent only and never grants a role.
- Existing users receive `role='user'` through the migration default.
- Only the two explicitly provisioned verified Google identities can be bootstrapped as administrators. If an email is already attached to a different Google `sub`, bootstrap is denied.
- The administrator API gate fails closed for missing or unknown roles.
- The current Administrator Control Center is deliberately a verified-access placeholder; it does not expose simulated or unimplemented administrative controls.

## Migration

Migration `0003_roles_admin_bootstrap.sql` must be applied to the isolated Preview D1 database only after code review and approval.

Before applying, verify the target database ID against `wrangler.toml` and confirm it is the staging binding. Do not run against Production.

After application, verify:

```sql
PRAGMA table_info(users);
SELECT email FROM admin_bootstrap_allowlist ORDER BY email;
SELECT google_sub, email, role, status FROM users;
```

The allowlist contains the two administrator email addresses approved in the project conversation. The first successful sign-in with each verified identity creates its admin row. No account is activated merely by adding an email to the allowlist.

## Preview verification checklist

1. Sign in through User Portal with an approved standard-user identity; verify the returned session role is `user`.
2. Sign in through Administrator Portal with each approved Google identity; verify `/api/admin/session` returns 200 and role `admin`.
3. Try the wrong portal for each role; verify `ROLE_MISMATCH` and no session is issued.
4. Try `/api/admin/session` as a standard user; verify 403 `ADMIN_REQUIRED`.
5. Change a test account role in staging and repeat the request; verify authorization reflects the current D1 role, not stale client state.
6. Verify logout revokes the opaque session and both portals return to the sign-in gate.
7. Re-run the complete Node test suite and Android browser smoke tests.

## Change-control boundary

This branch and its PR are code-only until explicitly approved. Do not apply D1 migrations, deploy to Preview or Production, merge, alter secrets, enable billing, or copy user data without separate authorization.
