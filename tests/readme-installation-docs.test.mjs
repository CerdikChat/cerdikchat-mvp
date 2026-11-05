import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
const worker = readFileSync(new URL("../worker.js", import.meta.url), "utf8");

test("installation guide describes the active Workers AI model and binding", () => {
  assert.match(readme, /Cloudflare Workers AI/);
  assert.match(readme, /@cf\/google\/gemma-4-26b-a4b-it/);
  assert.match(readme, /env\.AI/);
  assert.match(worker, /MODEL: "@cf\/google\/gemma-4-26b-a4b-it"/);
});

test("installation guide does not instruct users to configure obsolete Gemini API credentials", () => {
  assert.doesNotMatch(readme, /GEMINI_API_KEY\s*=/);
  assert.doesNotMatch(readme, /GEMINI_MODEL\s*=/);
  assert.doesNotMatch(readme, /wrangler secret put GEMINI_API_KEY/);
  assert.match(readme, /No Gemini API key is required/);
});

test("installation guide keeps safe local checks and explicitly avoids deployment", () => {
  assert.match(readme, /npm test/);
  assert.match(readme, /deploy --dry-run/);
  assert.match(readme, /does not deploy the Worker/);
  assert.match(readme, /Do not run D1 migrations/);
});
