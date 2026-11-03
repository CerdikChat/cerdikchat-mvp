import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const migration = await readFile(
  new URL("../migrations/0004_admin_bootstrap_allowlist.sql", import.meta.url),
  "utf8"
);
const roleMigration = await readFile(
  new URL("../migrations/0003_user_roles_and_admin_audit.sql", import.meta.url),
  "utf8"
);

test("RBAC reconciliation migration creates only the missing bootstrap allowlist", () => {
  assert.match(migration, /CREATE TABLE IF NOT EXISTS admin_bootstrap_allowlist/i);
  assert.match(migration, /INSERT OR IGNORE INTO admin_bootstrap_allowlist/i);
  assert.match(migration, /dr\.ngyoonseong@gmail\.com/i);
  assert.match(migration, /dr\.amikarmila@gmail\.com/i);
  assert.doesNotMatch(migration, /ALTER\s+TABLE\s+users/i);
  assert.doesNotMatch(migration, /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?admin_audit_log/i);
  assert.doesNotMatch(migration, /DROP\s+TABLE|DELETE\s+FROM|UPDATE\s+users/i);
});

test("RBAC reconciliation migration is safe to reapply at the SQL statement level", () => {
  assert.match(migration, /CREATE TABLE IF NOT EXISTS/i);
  assert.match(migration, /INSERT OR IGNORE INTO/i);
});


test("RBAC schema migration matches the applied staging migration identity", () => {
  assert.match(roleMigration, /ALTER TABLE users ADD COLUMN role/i);
  assert.match(roleMigration, /CREATE TABLE IF NOT EXISTS admin_audit_log/i);
  assert.doesNotMatch(migration, /ALTER\s+TABLE\s+users/i);
  assert.doesNotMatch(migration, /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?admin_audit_log/i);
});
