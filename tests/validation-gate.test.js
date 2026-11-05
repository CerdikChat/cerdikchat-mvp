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
  assert.match(wps, /cerdikgo:ai-core-verified/);
  assert.match(wps, /gate\("ai-core","rejected"/);
  assert.match(wps, /Permintaan analisis teks gagal:/);
});

test("Main chat reports AI Core ACCEPTED only after a successful HTTP response and non-empty reply", () => {
  assert.match(index, /let aiResponseVerified = false/);
  assert.match(index, /if \(!response\.ok\)/);
  assert.match(index, /if \(!answer\)/);
  assert.match(index, /aiResponseVerified = true/);
  assert.match(index, /cerdikgo:ai-core-verified/);
  assert.match(index, /CerdikGoValidationGate\?\.report\(\s*"ai-core",\s*"rejected"/);
  assert.match(index, /if \(!aiResponseVerified\)/);
});

test("Main chat does not mark AI Core accepted from online status or model-generated text alone", () => {
  const acceptedEventAt = index.indexOf('cerdikgo:ai-core-verified');
  const replyCheckAt = index.indexOf('if (!answer)');
  assert.ok(acceptedEventAt > replyCheckAt, "AI evidence event must follow the non-empty reply check");
  assert.match(index, /const model = typeof data\.model === "string" \? data\.model\.trim\(\) : ""/);
  assert.match(index, /response\.status !== 200 \|\| !model/);
});

test("Validation Gate accepts AI Core only through strict evidence event", () => {
  assert.match(gate, /cerdikgo:ai-core-verified/);
  assert.match(gate, /detail\.httpStatus !== 200/);
  assert.match(gate, /typeof detail\.model !== "string"/);
  assert.match(gate, /typeof detail\.reply !== "string"/);
});

test("WPS bridge requires HTTP 200, model identifier and non-empty reply before reporting AI evidence", () => {
  assert.match(wps, /response\.status!==200\|\|!reply\|\|!model/);
  assert.match(wps, /cerdikgo:ai-core-verified/);
  assert.match(wps, /gate\("ai-core","rejected"/);
});

test("Conversation workspace exposes the four requested tool cards", () => {
  for (const action of ["documents", "voice", "research", "validation"]) {
    assert.match(index, new RegExp('data-workspace-action="' + action + '"'));
  }
  assert.match(index, /id="cgToolsTitle">Alat kerja/);
});

test("Composer shortcuts are connected to existing attachment, voice and tools controls", () => {
  assert.match(index, /id="composerAttach"/);
  assert.match(index, /id="composerVoice"/);
  assert.match(index, /id="composerMore"/);
  assert.match(index, /querySelector\("#chooseAnalysisFile"\)\?\.click\(\)/);
  assert.match(index, /querySelector\("#voiceRecord"\)\?\.click\(\)/);
  assert.match(index, /querySelector\("#cerdikgoValidationGate"\)\?\.scrollIntoView/);
});
