import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const config = await readFile(new URL("../.gitleaks.toml", import.meta.url), "utf8");
const blocks = config.split(/^\[\[rules\.allowlists\]\]\s*$/m).slice(1);

test("Gitleaks keeps default rules and exactly three narrow rule-level exceptions", () => {
  assert.match(config, /^useDefault\s*=\s*true$/m);
  assert.doesNotMatch(config, /^\[\[allowlists\]\]/m);
  assert.equal(blocks.length, 3);
});

test("localStorage false positive is constrained to its exact source path and literal", () => {
  assert.match(blocks[0], /condition\s*=\s*"AND"/);
  assert.match(blocks[0], /regexTarget\s*=\s*"line"/);
  assert.ok(blocks[0].includes("src/prompt-intelligence\\.js"));
  assert.ok(blocks[0].includes("cerdikgo-prompt-vault-v1"));
});

test("auth candidate commit SHA is constrained to its exact audit-note path", () => {
  assert.match(blocks[1], /condition\s*=\s*"AND"/);
  assert.match(blocks[1], /regexTarget\s*=\s*"line"/);
  assert.ok(blocks[1].includes("docs/PRIMARY-AUTH-FAIL-CLOSED-MAIN-CANDIDATE\\.md"));
  assert.ok(blocks[1].includes("693bbd632480b760fff5ecab11be355d9288773c"));
});

test("master-ledger exception contains only two verified commit SHAs", () => {
  assert.match(blocks[2], /condition\s*=\s*"AND"/);
  assert.match(blocks[2], /regexTarget\s*=\s*"line"/);
  assert.ok(blocks[2].includes("docs/ATLAS9-MASTER-DEVELOPMENT-LEDGER\\.md"));
  assert.ok(blocks[2].includes("0a5fdea7f1c1c4091ff5fb674a1bac6bbb6ce8fb"));
  assert.ok(blocks[2].includes("abeca194672349e799bcfdd9d8f9c9dc82675947"));
});
