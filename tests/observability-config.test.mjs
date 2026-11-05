import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const config = await readFile(new URL("../wrangler.toml", import.meta.url), "utf8");
const sections = config.split(/(?=^\[)/m);
const topLevel = sections.find(section => section.startsWith("[observability]"));
const preview = sections.find(section => section.startsWith("[previews.observability]"));

test("top-level observability redacts request query strings", () => {
  assert.ok(topLevel, "missing top-level observability section");
  assert.match(topLevel, /^redact_query_string\s*=\s*true$/m);
});

test("Preview observability independently redacts request query strings", () => {
  assert.ok(preview, "missing Preview observability section");
  assert.match(preview, /^redact_query_string\s*=\s*true$/m);
  assert.match(preview, /^head_sampling_rate\s*=\s*1$/m);
});

test("Preview D1 remains bound to the isolated staging database", () => {
  assert.match(config, /database_name\s*=\s*"cerdikchat-staging"/);
  assert.match(config, /database_id\s*=\s*"79267e63-e57f-4237-8b88-f1e477397771"/);
});
