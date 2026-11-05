import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const gate = await readFile(new URL("../src/validation-gate.js", import.meta.url), "utf8");
const index = await readFile(new URL("../src/index.html", import.meta.url), "utf8");
const wps = await readFile(new URL("../src/wps-office-bridge.js", import.meta.url), "utf8");

test("CerdikGo exposes a visible, accessible Validation Gate", () => {
  assert.match(index, /validation-gate\.js/);
  assert.match(gate, /VALIDATION GATE/);
  assert.match(gate, /aria-expanded/);
  assert.match(gate, /aria-live|aria-label/);
});

test("Gate distinguishes accepted, rejected, pending and unavailable states", () => {
  for (const state of ["accepted", "rejected", "pending", "unavailable", "na"]) {
    assert.match(gate, new RegExp(state));
  }
  assert.match(gate, /Alasan penolakan:/);
  assert.match(gate, /PENDING berarti belum ada bukti/);
});

test("Gate requires explicit, bounded evidence before ACCEPTED and reasons before failure states", () => {
  assert.match(gate, /typeof reason !== "string"/);
  assert.match(gate, /\["accepted", "rejected", "unavailable"\]\.includes\(status\)/);
  assert.match(gate, /explanation\.length > 500/);
  assert.match(gate, /aria-live="polite"/);
  assert.match(gate, /cg-gate-symbol[^>]*>i</);
});

test("AI workspace reports only the outcome of its own request", () => {
  assert.match(wps, /gate\("ai-core","accepted"/);
  assert.match(wps, /gate\("ai-core","rejected"/);
  assert.match(wps, /Permintaan analisis teks gagal:/);
});
