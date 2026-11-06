import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const config = await readFile(new URL("../.gitleaks.toml", import.meta.url), "utf8");
const blocks = config.split(/^\[\[rules\.allowlists\]\]\s*$/m).slice(1);

test("Gitleaks keeps default rules and exactly two narrow rule-level exceptions", () => {
  assert.match(config, /^useDefault\s*=\s*true$/m);
  assert.doesNotMatch(config, /^\[\[allowlists\]\]/m);
  assert.equal(blocks.length, 2);
});

test("localStorage false positive is constrained to its exact source path and literal", () => {
  assert.match(blocks[0], /condition\s*=\s*"AND"/);
  assert.match(blocks[0], /regexTarget\s*=\s*"line"/);
  assert.ok(blocks[0].includes("src/prompt-intelligence\\.js"));
  assert.ok(blocks[0].includes("cerdikgo-prompt-vault-v1"));
});

test("audit-note exception is constrained to one verified commit SHA and exact path", () => {
  assert.match(blocks[1], /condition\s*=\s*"AND"/);
  assert.match(blocks[1], /regexTarget\s*=\s*"line"/);
  assert.ok(blocks[1].includes("docs/PRIMARY-AUTH-FAIL-CLOSED-MAIN-CANDIDATE\\.md"));
  assert.ok(blocks[1].includes("693bbd632480b760fff5ecab11be355d9288773c"));
});
