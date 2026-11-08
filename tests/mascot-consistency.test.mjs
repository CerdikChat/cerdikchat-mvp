import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../src/index.html", import.meta.url), "utf8");
const mascot = await readFile(new URL("../src/atlas9-mascot.svg", import.meta.url), "utf8");

test("welcome uses one canonical ATLAS-9 asset instead of inline or duplicate artwork", () => {
  assert.equal((html.match(/src="\/atlas9-mascot\.svg"/g) || []).length, 1);
  assert.match(html, /<img src="\/atlas9-mascot\.svg" alt="ATLAS-9 robot putih-biru dengan cape biru, mengangkat jempol"/);
  const mascotContainer = html.match(/<div class="welcome-mascot">([\s\S]*?)<\/div>/)?.[1] || "";\n  assert.doesNotMatch(mascotContainer, /<svg\\b/);
});

test("the same mascot image has responsive desktop and Android sizing rules", () => {
  assert.match(html, /\.welcome-mascot img\{[^}]*width:100%[^}]*height:auto[^}]*object-fit:contain/);
  assert.match(html, /@media\(max-width:720px\)\{\.welcome-mascot\{width:min\(92vw,380px\)/);
  assert.match(html, /\.welcome-mascot img\{max-height:min\(58vh,340px\)\}/);
});

test("mascot is a scalable vector with accessible description and thumb-up pose", () => {
  assert.match(mascot, /viewBox="0 0 640 520"/);
  assert.match(mascot, /white and electric-blue armored robot/i);
  assert.match(mascot, /thumbs-up pose/i);
  assert.match(mascot, /<path d="M477 161/);
  assert.match(mascot, /id="cape"/);
});
