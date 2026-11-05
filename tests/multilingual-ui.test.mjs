import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../src/index.html", import.meta.url), "utf8");

test("Indonesian, English and Simplified Chinese provide human-facing workspace copy", () => {
  for (const value of [
    "welcomeDescription", "sideTitle", "sideNote", "languageButton", "closeDialog",
    "closeNav", "openNav"
  ]) {
    assert.match(html, new RegExp(value + ":"));
  }
  assert.match(html, /A workspace to think clearly/);
  assert.match(html, /关于测试版/);
  assert.match(html, /CerdikChat 仍处于测试阶段/);
});

test("Language selection updates welcome and beta guidance, not only the header", () => {
  assert.match(html, /setText\("#welcome \.workspace-intro h1", p\.welcome\)/);
  assert.match(html, /setText\("#welcome \.workspace-intro p", p\.welcomeDescription\)/);
  assert.match(html, /setText\("#sideNavigation h2", p\.sideTitle\)/);
  assert.match(html, /setText\("\.side-note", p\.sideNote\)/);
  assert.match(html, /window\.CerdikGoPromptI18n\?\.\(lang\)/);
  assert.match(html, /cerdikgo:ui-language-changed/);
});

test("Navigation and language controls expose localized accessible names", () => {
  assert.match(html, /navLabels\[navLanguage\]\[open \? 0 : 1\]/);
  assert.match(html, /navBackdrop\.setAttribute\("aria-label", p\.closeNav\)/);
  assert.match(html, /languageOpen\.setAttribute\("aria-label", p\.languageButton\)/);
  assert.match(html, /languageClose\.setAttribute\("aria-label", p\.closeDialog\)/);
  assert.match(html, /window\.CerdikGoUiLanguage = lang/);
});

test("Language preference remains local to the user's device", () => {
  assert.match(html, /localStorage\.setItem\("cerdikgo-ui-language", lang\)/);
  assert.match(html, /localStorage\.getItem\("cerdikgo-ui-language"\)/);
});
