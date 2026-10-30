import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../src/index.html", import.meta.url), "utf8");

test("mobile navigation has accessible controls and a labelled navigation region", () => {
  assert.match(html, /<aside class="side" id="sideNav" aria-label="Navigasi utama">/);
  assert.match(html, /id="menuToggle"[^>]*aria-controls="sideNav"/);
  assert.match(html, /aria-expanded="false"[^>]*aria-label="Buka navigasi"/);
  assert.match(html, /id="navBackdrop"[^>]*aria-label="Tutup navigasi"[^>]*hidden/);
});

test("tablet and mobile layouts move the sidebar into an off-canvas drawer", () => {
  assert.match(html, /@media\s*\(max-width:\s*1024px\)/);
  assert.match(html, /\.app\.nav-open \.side\s*\{\s*transform:\s*translateX\(0\)/);
  assert.match(html, /\.app\.nav-open \.nav-backdrop/);
  assert.match(html, /@media\s*\(max-width:\s*480px\)/);
  assert.match(html, /grid-template-columns:\s*1fr/);
});

test("navigation supports toggle, backdrop dismissal, Escape, and prompt selection", () => {
  assert.match(html, /function setNavigationOpen\(open\)/);
  assert.match(html, /menuToggle\.setAttribute\("aria-expanded", String\(open\)\)/);
  assert.match(html, /navBackdrop\.addEventListener\("click", \(\) => setNavigationOpen\(false\)\)/);
  assert.match(html, /event\.key === "Escape"/);
  assert.match(html, /usePrompt\(button\.dataset\.prompt \|\| ""\);\s*setNavigationOpen\(false\);/);
});
