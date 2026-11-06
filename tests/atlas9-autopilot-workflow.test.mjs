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

test("readiness workflow cannot deploy or migrate remote D1", () => {
  const deployLines = workflow.split("\n").filter(line => /wrangler\s+deploy/.test(line));
  assert.ok(deployLines.length > 0);
  assert.ok(deployLines.every(line => line.includes("--dry-run")));
  assert.doesNotMatch(workflow, /wrangler\s+d1\s+migrations\s+apply.*--remote/i);
});

test("workflow explicitly separates CI from human, Preview, Android and Production gates", () => {
  assert.match(workflow, /Human Verification: NOT STARTED/);
  assert.match(workflow, /Preview runtime \/ Android acceptance \/ Production readiness: NOT TESTED/);
  assert.match(workflow, /TypeScript: NOT CONFIGURED/);
});
