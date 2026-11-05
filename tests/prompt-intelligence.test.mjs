import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../src/index.html", import.meta.url), "utf8");
const script = await readFile(new URL("../src/prompt-intelligence.js", import.meta.url), "utf8");

test("Prompt Intelligence is added as an additive workspace module", () => {
  assert.match(html, /id="promptIntelligence"/);
  assert.match(html, /data-pi-open/);
  assert.match(html, /id="feed"/);
  assert.match(html, /id="chatForm"/);
});

test("Sidebar, home and composer entry points are present", () => {
  assert.match(html, /class="pi-nav"[^>]*data-pi-open/);
  assert.match(html, /class="pi-home-card"[^>]*data-pi-open/);
  assert.match(html, /aria-label="Improve with Prompt Intelligence"/);
});

test("The module exposes generation, optimization and evaluation controls", () => {
  assert.match(html, /id="piGenerate"/);
  assert.match(html, /id="piOptimize"/);
  assert.match(html, /id="piEvaluate"/);
  assert.match(script, /askAI\("generate"\)/);
  assert.match(script, /askAI\("optimize"\)/);
  assert.match(script, /evaluatePrompt\(result\.value\)/);
});

test("All six initial professional domains are available", () => {
  for (const domain of ["blue", "research", "audit", "trade", "life", "creative"]) {
    assert.match(html, new RegExp('option value="' + domain + '"'));
  }
  assert.match(script, /Blue Economy & Aquaculture/);
  assert.match(script, /Strategic Research & Advisory/);
  assert.match(script, /Audit, Governance & Quality/);
  assert.match(script, /International Trade & Business/);
  assert.match(script, /Life Sciences & Clinical Research/);
  assert.match(script, /Creative & Digital Productivity/);
});

test("Generation reuses the existing chat API and same-origin session", () => {
  assert.match(script, /fetch\("\/api\/chat"/);
  assert.match(script, /credentials:\s*"same-origin"/);
  assert.match(script, /AUTH_REQUIRED/);
});

test("Prompt Vault is device-local and does not introduce a database dependency", () => {
  assert.match(script, /localStorage\.getItem\(STORAGE_KEY\)/);
  assert.match(script, /localStorage\.setItem\(STORAGE_KEY/);
  assert.match(script, /cerdikgo-prompt-vault-v1/);
  assert.doesNotMatch(script, /\/api\/prompt\/library/);
});

test("Prompt Intelligence follows the existing ID, EN and ZH selector", () => {
  assert.match(html, /window\.CerdikGoPromptI18n\?\.\(lang\)/);
  assert.match(script, /window\.CerdikGoPromptI18n =/);
  assert.match(script, /zh:/);
  assert.match(script, /en:/);
  assert.match(script, /id:/);
});

test("Quality score is explicitly heuristic and includes verification caveat", () => {
  assert.match(html, /heuristic/);
  assert.match(html, /bukan jaminan kebenaran hasil AI/);
  assert.match(script, /function evaluatePrompt\(/);
});


test("Inline SVG gradient IDs are unique across the complete workspace", () => {
  const ids = [...html.matchAll(/\\bid=["']([^"']+)["']/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size, "HTML id attributes must be unique");
  for (const reference of html.matchAll(/url\\(#([^)]*)\\)/g)) {
    assert.ok(ids.includes(reference[1]), `SVG/CSS reference #${reference[1]} must resolve to an existing ID`);
  }
});
