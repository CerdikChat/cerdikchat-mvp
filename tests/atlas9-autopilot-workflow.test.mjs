import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const workflow = await readFile(
  new URL("../.github/workflows/atlas9-legacy-autopilot-readiness.yml", import.meta.url),
  "utf8"
);

test("legacy readiness workflow is scoped to ATLAS-9 feature branches", () => {
  assert.match(workflow, /branches:\s*\n\s*- 'atlas9\/\*\*'/);
  assert.match(workflow, /contents:\s*read/);
  assert.match(workflow, /candidate.*atlas9\/\*/s);
});

test("readiness gate installs, syntax-checks, tests and dry-runs the Worker", () => {
  assert.match(workflow, /npm install --ignore-scripts/);
  assert.match(workflow, /node --check worker\.js/);
  assert.match(workflow, /node --check auth\/google-auth\.js/);
  assert.match(workflow, /npm test/);
  assert.match(workflow, /wrangler@4\.153\.0 deploy --dry-run/);
});

test("readiness gate detects versioned Wrangler deploy and remote D1 commands", () => {
  const commandLines = workflow.split("\n").filter(line => /^\s*run:\s*npx\s+--yes\s+wrangler/.test(line));
  assert.equal(commandLines.length, 1);
  assert.match(commandLines[0], /wrangler@4\.153\.0 deploy --dry-run/);
  assert.doesNotMatch(commandLines[0], /--remote/);
  assert.match(workflow, /wrangler\(@\[\^\[:space:\]\]\+\)\?\[\[:space:\]\]\+deploy/);
  assert.match(workflow, /wrangler\(@\[\^\[:space:\]\]\+\)\?\[\[:space:\]\]\+d1/);
});

test("workflow explicitly separates CI from human, Preview, Android and Production gates", () => {
  assert.match(workflow, /Human Verification: NOT STARTED/);
  assert.match(workflow, /Preview runtime \/ Android acceptance \/ Production readiness: NOT TESTED/);
  assert.match(workflow, /TypeScript: NOT CONFIGURED/);
});
