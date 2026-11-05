import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const gate = await readFile(new URL("../src/validation-gate.js", import.meta.url), "utf8");
const index = await readFile(new URL("../src/index.html", import.meta.url), "utf8");
const wps = await readFile(new URL("../src/wps-office-bridge.js", import.meta.url), "utf8");

test("CerdikGo exposes a visible, accessible Validation Gate", () => {
  assert.match(index, /validation-gate\.js/);
  assert.match(gate, /VALIDATION GATE/);
  assert.match(index, /id="validationGateMenu"/);
  assert.match(index, /id="validationGateMount"/);
  assert.match(gate, /validationGateMount/);
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

test("Core workspace controls and network status have ID, EN and ZH translations", () => {
  for (const language of ["id", "en", "zh"]) {
    assert.ok(index.includes(`${language}: {`), `Missing language pack: ${language}`);
  }
  for (const key of ["tools:", "conversation:", "docLabel:", "composer:", "networkOnline:", "networkOffline:"]) {
    assert.ok(index.includes(key), `Missing translation key: ${key}`);
  }
  assert.match(index, /#workspaceTools > summary strong/);
  assert.match(index, /#voiceConversationState/);
  assert.match(index, /id="networkStatusText"/);
});

test("Voice transcription preserves Android Tap-to-Open keyboard behavior", () => {
  const transcriptHandler = index.slice(index.indexOf('voiceUseTranscript.addEventListener("click"'), index.indexOf('voiceSendToAI.addEventListener("click"'));
  assert.match(transcriptHandler, /input.value = transcript/);
  assert.doesNotMatch(transcriptHandler, /input\.focus\(\)/);
  const transcriptionReady = index.slice(index.indexOf('voiceTranscript.value = String(result.text'), index.indexOf('} catch (error)', index.indexOf('voiceTranscript.value = String(result.text')));
  assert.doesNotMatch(transcriptionReady, /voiceTranscript\.focus\(\)/);
});


test("Validation Gate, Protection Mode and Hybrid Connectivity are exposed from header menus", () => {
  const header = index.slice(index.indexOf('<header class="top">'), index.indexOf('</header>', index.indexOf('<header class="top">')));
  assert.match(header, /id="validationGateMenu"/);
  assert.match(header, /id="systemStatusMenu"/);
  assert.match(header, /id="protectionStatusCard"/);
  assert.match(header, /Hybrid Connectivity/);
  assert.match(index, /id="validationGateMount"/);
  const deckStart = index.indexOf('<section class="status-deck"');
  const deckEnd = index.indexOf('</section>', deckStart);
  assert.doesNotMatch(index.slice(deckStart, deckEnd), /status-cards|protectionStatusCard/);
});

test("Android Tap-to-Open keeps prompt selection from opening the keyboard", () => {
  const start = index.indexOf("function usePrompt(prompt)");
  const end = index.indexOf("document.querySelectorAll(\"[data-prompt]\")", start);
  assert.ok(start >= 0 && end > start, "Prompt handler must remain identifiable");
  const handler = index.slice(start, end);
  assert.match(handler, /input\.value = prompt/);
  assert.doesNotMatch(handler, /input\.focus\(\)/);
});

test("Header status menus are mutually exclusive and dismiss on outside tap or Escape", () => {
  assert.match(index, /menu\.open && !menu\.contains\(event\.target\)/);
  assert.match(index, /if \(event\.key !== "Escape"\) return/);
  assert.match(index, /for \(const other of menus\) if \(other !== menu\) other\.open = false/);
});

test("Header status menu labels and descriptions follow ID, EN and ZH language selection", () => {
  for (const value of ["validationGate:", "systemStatus:", "protectionSubtitle:", "hybridSubtitle:"]) {
    assert.equal((index.match(new RegExp(value, "g")) || []).length, 3, `Expected three translations for ${value}`);
  }
  assert.match(index, /#validationGateMenu > summary span/);
  assert.match(index, /#systemStatusMenu > summary span/);
});
