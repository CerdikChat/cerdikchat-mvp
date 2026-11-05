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

test("Gate rejects failure reports without an explicit reason", () => {
  assert.match(gate, /if\(\(status===\"rejected\"\|\|status===\"unavailable\"\)&&!explanation\.trim\(\)\)return false/);
});

test("AI workspace reports only the outcome of its own request", () => {
  assert.match(wps, /gate\("ai-core","accepted"/);
  assert.match(wps, /gate\("ai-core","rejected"/);
  assert.match(wps, /Permintaan analisis teks gagal:/);
});

test("Main chat reports AI Core ACCEPTED only after a successful HTTP response and non-empty reply", () => {
  assert.match(index, /let aiResponseVerified = false/);
  assert.match(index, /if \(!response\.ok\)/);
  assert.match(index, /if \(!answer\)/);
  assert.match(index, /aiResponseVerified = true/);
  assert.match(index, /CerdikGoValidationGate\?\.report\(\s*"ai-core",\s*"accepted"/);
  assert.match(index, /CerdikGoValidationGate\?\.report\(\s*"ai-core",\s*"rejected"/);
  assert.match(index, /if \(!aiResponseVerified\)/);
});

test("Main chat does not mark AI Core accepted from online status or model-generated text alone", () => {
  const acceptedAt = index.indexOf('"accepted"');
  const replyCheckAt = index.indexOf('if (!answer)');
  assert.ok(acceptedAt > replyCheckAt, "ACCEPTED report must follow the non-empty reply check");
  assert.match(index, /Endpoint \/api\/chat mengembalikan HTTP/);
});
