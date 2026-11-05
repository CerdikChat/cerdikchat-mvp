import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile(
  new URL("../benchmarks/seven-dimension/tasks.v0.1.json", import.meta.url),
  "utf8"
));

test("seven-dimension pilot manifest has exactly seven dimensions and 35 unique tasks", () => {
  assert.equal(manifest.schema_version, "1.0.0");
  assert.equal(manifest.dataset_version, "0.1.0");
  assert.equal(manifest.dimensions.length, 7);
  assert.equal(manifest.tasks.length, 35);
  assert.equal(manifest.task_count, 35);
  assert.equal(new Set(manifest.dimensions).size, 7);
  assert.equal(new Set(manifest.tasks.map(task => task.id)).size, 35);
});

test("each competitive dimension has five reproducible smoke tasks", () => {
  for (const dimension of manifest.dimensions) {
    const tasks = manifest.tasks.filter(task => task.dimension === dimension);
    assert.equal(tasks.length, 5, dimension);
    for (const task of tasks) {
      assert.match(task.id, /^[A-Z]{2,3}-\d{3}$/);
      assert.ok(task.prompt.trim().length >= 20);
      assert.ok(Array.isArray(task.acceptance_checks));
      assert.ok(task.acceptance_checks.length >= 1);
      assert.ok(task.acceptance_checks.every(item => typeof item === "string" && item.length > 0));
    }
  }
});
