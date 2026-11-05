import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const workerSource = readFileSync(new URL("../worker.js", import.meta.url), "utf8");

test("main Core AI prompt declares exactly the canonical nine ATLAS-9 specialists in order", () => {
  const required = [
    "ATLAS-01 — Research Intelligence",
    "ATLAS-02 — Engineering (NEXUS)",
    "ATLAS-03 — AI & Prompt Intelligence",
    "ATLAS-04 — Cybersecurity",
    "ATLAS-05 — Governance & Compliance (AEGIS)",
    "ATLAS-06 — Data Intelligence (SENTINEL)",
    "ATLAS-07 — Business Strategy (ORACLE)",
    "ATLAS-08 — Product & UX",
    "ATLAS-09 — Quality Assurance",
  ];
  let previousIndex = -1;
  for (const role of required) {
    const index = workerSource.indexOf(role);
    assert.notEqual(index, -1, `Missing canonical role: ${role}`);
    assert.ok(index > previousIndex, `Canonical roles are out of order: ${role}`);
    previousIndex = index;
  }
});

test("Optimus Prime is coordinator outside the nine specialist seats", () => {
  assert.match(workerSource, /Optimus Prime adalah koordinator di luar sembilan kursi spesialis/);
  assert.match(workerSource, /Jangan menambahkan TITAN, GENESIS, atau TERRA sebagai spesialis aktif/);
});

test("main prompt is truthful about one model and non-executing specialist profiles", () => {
  assert.match(workerSource, /Semua profil merupakan pendekatan analitis dalam satu model AI/);
  assert.match(workerSource, /Jangan mengklaim sembilan agen independen sedang berjalan/);
  assert.match(workerSource, /Jangan mengklaim routing multi-agent atau eksekusi paralel tanpa bukti runtime/);
});
