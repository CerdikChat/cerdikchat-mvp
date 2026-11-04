import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import process from "node:process";

const checks = [];
const add = (name, ok, detail) => checks.push({ name, ok, detail });

const requiredFiles = [
  "worker.js",
  "wrangler.toml",
  "src/index.html",
  "src/manifest.webmanifest",
  "auth/google-auth.js",
  "integrations/model-router.js",
  "integrations/agent-gateway.js",
  "tests/worker.test.mjs",
];

for (const path of requiredFiles) {
  try {
    await access(path, constants.R_OK);
    add(`File: ${path}`, true, "readable");
  } catch {
    add(`File: ${path}`, false, "missing or unreadable");
  }
}

const nodeMajor = Number(process.versions.node.split(".")[0]);
add("Node.js >= 20", nodeMajor >= 20, `detected ${process.versions.node}`);

let wrangler = "";
try {
  wrangler = await readFile("wrangler.toml", "utf8");
  for (const [name, pattern] of [
    ["Worker entry point", /^main\s*=\s*"worker\.js"/m],
    ["Static assets binding", /binding\s*=\s*"ASSETS"/],
    ["Workers AI binding", /binding\s*=\s*"AI"/],
    ["D1 binding", /binding\s*=\s*"DB"/],
    ["Rate limiter binding", /name\s*=\s*"CHAT_RATE_LIMITER"/],
  ]) {
    add(name, pattern.test(wrangler), pattern.test(wrangler) ? "declared" : "not found in wrangler.toml");
  }
} catch {
  add("Wrangler configuration", false, "wrangler.toml could not be read");
}

try {
  const pkg = JSON.parse(await readFile("package.json", "utf8"));
  add("npm test script", typeof pkg.scripts?.test === "string", pkg.scripts?.test ?? "missing");
  add("npm doctor script", typeof pkg.scripts?.doctor === "string", pkg.scripts?.doctor ?? "missing");
} catch {
  add("package.json", false, "missing or invalid JSON");
}

let failed = 0;
for (const item of checks) {
  const status = item.ok ? "PASS" : "FAIL";
  console.log(`[${status}] ${item.name} — ${item.detail}`);
  if (!item.ok) failed++;
}

console.log(`\nCerdikGo installation preflight: ${checks.length - failed}/${checks.length} checks passed.`);
console.log("This is a local source/configuration preflight; it does not verify Cloudflare credentials, remote bindings, model availability, or deployment health.");
if (failed > 0) process.exitCode = 1;
