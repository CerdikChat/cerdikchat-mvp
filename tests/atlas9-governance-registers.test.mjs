import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const requiredDocs = [
  "../docs/ATLAS9-MASTER-DEVELOPMENT-LEDGER.md",
  "../docs/CERDIKGO-ENGINEERING-CHANGELOG.md",
  "../docs/ATLAS9-TESTING-AND-QA-REGISTER.md",
  "../docs/ATLAS9-SECURITY-GOVERNANCE-REGISTER.md",
  "../docs/ATLAS9-DECISION-AND-APPROVAL-REGISTER.md",
  "../docs/CERDIKGO-OPEN-ISSUES-AND-HANDOVER.md",
  "../docs/CERDIKGO-SEVEN-DIMENSION-BENCHMARK.md"
];

test("required ATLAS-9 registers and benchmark specification exist with dated status entries", async () => {
  for (const relativePath of requiredDocs) {
    const content = await readFile(new URL(relativePath, import.meta.url), "utf8");
    assert.ok(content.includes("2026-11-06"), `${relativePath} must contain a dated entry`);
    assert.match(content, /VERIFIED|FAILED|BLOCKED|NOT TESTED|PLANNED/, `${relativePath} must use controlled status vocabulary`);
  }
});

test("pilot manifest is explicitly a 35-task smoke set, not a full capability benchmark", async () => {
  const raw = await readFile(new URL("../benchmarks/seven-dimension/tasks.v0.1.json", import.meta.url), "utf8");
  const manifest = JSON.parse(raw);
  assert.equal(manifest.task_count, 35);
  assert.equal(manifest.tasks.length, 35);
  assert.equal(manifest.status, "PILOT_SMOKE_SET_NOT_A_FULL_COMPETITIVE_BENCHMARK");
  assert.equal(new Set(manifest.tasks.map(task => task.id)).size, 35);
  assert.equal(new Set(manifest.tasks.map(task => task.dimension)).size, 7);
});

test("benchmark specification preserves seven independent gates and unmeasured status", async () => {
  const content = await readFile(new URL("../docs/CERDIKGO-SEVEN-DIMENSION-BENCHMARK.md", import.meta.url), "utf8");
  for (const phrase of [
    "General AI reasoning",
    "Coding and engineering",
    "Specialized research and analysis",
    "Governance, audit and control",
    "Organizational workflow integration",
    "Product identity and specialization",
    "Ecosystem maturity and scale",
    "NOT MEASURED",
    "100% VERIFIED"
  ]) {
    assert.ok(content.includes(phrase), `missing benchmark requirement: ${phrase}`);
  }
});
