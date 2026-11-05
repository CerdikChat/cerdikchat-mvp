import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [workspace, bridge, security] = await Promise.all([
  readFile(new URL("../src/index.html", import.meta.url), "utf8"),
  readFile(new URL("../src/bridge.html", import.meta.url), "utf8"),
  readFile(new URL("../src/security-update.html", import.meta.url), "utf8"),
]);

test("Primary workspace exposes both security and context bridge pages", () => {
  assert.match(workspace, /href="\/security-update\.html"/);
  assert.match(workspace, /href="\/bridge\.html"/);
  assert.match(workspace, /Security Update · Antivirus Gateway/);
  assert.match(workspace, /ChatGPT Go · Context Bridge/);
});

test("Context Bridge is manual, bounded, and does not claim a custom MCP connection", () => {
  assert.match(bridge, /PREVIEW · NO CUSTOM MCP/);
  assert.match(bridge, /Jembatan manual/i);
  assert.match(bridge, /tidak ada eksekusi agent/i);
  for (let i = 1; i <= 9; i++) {
    assert.match(bridge, new RegExp("ATLAS-0" + i));
  }
});

test("Antivirus status page does not claim the scanner is active", () => {
  assert.match(security, /scanner engine masih dalam tahap penyediaan/i);
  assert.match(security, /belum dinyatakan aktif/i);
  assert.match(security, /fail-closed/i);
});


test("Context Bridge loads an implemented client module", async () => {
  const client = await readFile(new URL("../src/bridge.js", import.meta.url), "utf8");
  assert.match(bridge, /src="\/bridge\.js"/);
  assert.match(client, /function validatePackage/);
  assert.match(client, /cerdikgo\.task\.v1/);
  assert.match(client, /execution_mode: "plan_only"/);
});

test("Context Bridge validates bounded task data and preserves nine specialist IDs", async () => {
  const client = await readFile(new URL("../src/bridge.js", import.meta.url), "utf8");
  assert.match(client, /MAX_INTENT = 4000/);
  assert.match(client, /ATLAS-\$\{String\(i \+ 1\)/);
  assert.match(client, /controlled_action/);
  assert.match(client, /database_writes: false/);
  assert.match(client, /external_calls_made: false/);
});

test("Context Bridge does not claim a server endpoint or automatic account synchronization", () => {
  assert.match(bridge, /Jembatan manual/i);
  assert.match(bridge, /NO CUSTOM MCP/);
  assert.match(bridge, /ringkasan rencana lokal/i);
  assert.doesNotMatch(bridge, /endpoint Preview yang sudah tersedia/i);
});
