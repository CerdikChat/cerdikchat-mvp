import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const workerSource = readFileSync(new URL("../worker.js", import.meta.url), "utf8");

test("Core AI prompt declares the canonical nine ATLAS-9 specialists", () => {
  const required = [
    "1. ATLAS-01 — Research Intelligence",
    "2. ATLAS-02 — Engineering (NEXUS)",
    "3. ATLAS-03 — AI & Prompt Intelligence",
    "4. ATLAS-04 — Cybersecurity",
    "5. ATLAS-05 — Governance & Compliance (AEGIS)",
    "6. ATLAS-06 — Data Intelligence (SENTINEL)",
    "7. ATLAS-07 — Business Strategy (ORACLE)",
    "8. ATLAS-08 — Product & UX",
    "9. ATLAS-09 — Quality Assurance",
  ];

  let previousIndex = -1;
  for (const role of required) {
    const index = workerSource.indexOf(role);
    assert.notEqual(index, -1, `Missing canonical role: ${role}`);
    assert.ok(index > previousIndex, `Canonical roles are out of order: ${role}`);
    previousIndex = index;
  }
});

test("Core AI prompt separates Optimus Prime from the nine specialist seats", () => {
  assert.match(workerSource, /Optimus Prime adalah koordinator di luar daftar sembilan spesialis/);
  assert.match(workerSource, /Jangan menambahkan TITAN,\s*GENESIS, atau TERRA sebagai spesialis aktif/);
});
