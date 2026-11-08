import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../src/index.html", import.meta.url), "utf8");

test("CerdikGo welcome screen is clean and contains no mascot artwork", () => {
  assert.doesNotMatch(html, /welcome-mascot|atlas9-mascot\.svg/i);
  assert.doesNotMatch(html, /ATLAS-9 robot|thumbs-up pose/i);
});

test("welcome typography remains present and readable without a mascot spacer", () => {
  assert.match(html, /class="workspace-intro"/);
  assert.match(html, /CERDIKGO · AI INNOVATION WORKSPACE/);
  assert.match(html, /Ruang Kerja AI/);
  assert.match(html, /\.workspace-intro\{max-width:760px;margin:18px auto 20px;text-align:left\}/);
  assert.match(html, /\.workspace-intro\{margin:12px 2px 15px\}/);
});

test("desktop and Android responsive workspace layouts remain defined", () => {
  assert.match(html, /@media\(max-width:720px\)/);
  assert.match(html, /\.workspace-intro h1\{font-size:clamp\(25px,7vw,32px\)\}/);
  assert.match(html, /\.workspace-launcher/);
});
