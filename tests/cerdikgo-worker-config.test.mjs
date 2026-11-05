import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("isolated CerdikGo Worker requires Google authentication by default", async () => {
  const config = await readFile(new URL("../wrangler.cerdikgo.toml", import.meta.url), "utf8");
  assert.match(config, /^GOOGLE_AUTH_REQUIRED\s*=\s*"true"\s*$/m);
});

test("isolated CerdikGo Worker does not reuse shared D1 or rate-limit resources", async () => {
  const config = await readFile(new URL("../wrangler.cerdikgo.toml", import.meta.url), "utf8");
  assert.doesNotMatch(config, /^\s*\[\[d1_databases\]\]/m);
  assert.doesNotMatch(config, /^\s*\[\[ratelimits\]\]/m);
});
