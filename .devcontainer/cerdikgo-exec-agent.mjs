#!/usr/bin/env node
/**
 * CerdikGo Codespaces Safe Execution Bridge.
 * Executes fixed, audited tasks requested through one private GitHub issue.
 * No arbitrary shell input is accepted.
 */
import { spawnSync } from "node:child_process";

const REPO = "CerdikChat/cerdikchat-mvp";
const ISSUE = Number(process.argv.find((v) => /^\d+$/.test(v)) || 56);
const POLL_MS = 15000;
const MAX_OUTPUT = 7000;
const TASKS = Object.freeze({
  env: [
    ["node", ["--version"]],
    ["npm", ["--version"]],
    ["git", ["status", "--short", "--branch"]],
  ],
  install: [["npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund"]]],
  test: [["npm", ["test"]]],
  "dry-run": [[
    "npx",
    ["--yes", "wrangler@4.153.0", "deploy", "--dry-run", "--outdir", "/tmp/cerdikgo-worker-build"],
  ]],
});

function run(program, args, options = {}) {
  const result = spawnSync(program, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    timeout: options.timeout ?? 900000,
    maxBuffer: 2 * 1024 * 1024,
    shell: false,
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.error) throw result.error;
  return {
    status: result.status,
    signal: result.signal,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
  };
}

function gh(args, options = {}) {
  const result = run("gh", ["api", ...args], { timeout: 30000 });
  if (result.status !== 0) {
    throw new Error((result.stderr || "GitHub CLI request failed").slice(0, 1200));
  }
  return result.stdout.trim();
}

function redact(value) {
  return value
    .replace(/gh[pousr]_[A-Za-z0-9_]{20,}/g, "[REDACTED_GITHUB_TOKEN]")
    .replace(/github_pat_[A-Za-z0-9_]{20,}/g, "[REDACTED_GITHUB_TOKEN]")
    .replace(/Bearer\s+\S+/gi, "Bearer [REDACTED]")
    .replace(/(api[_-]?key|token|secret|password)\s*[:=]\s*[^\s,;]+/gi, "$1=[REDACTED]");
}

function post(body) {
  gh([
    `repos/${REPO}/issues/${ISSUE}/comments`,
    "-X", "POST",
    "-f", `body=${body}`,
  ]);
}

function loadComments() {
  const raw = gh([
    `repos/${REPO}/issues/${ISSUE}/comments?per_page=100`,
    "--paginate",
    "--jq", ".[] | @json",
  ]);
  return raw ? raw.split("\n").filter(Boolean).map((line) => JSON.parse(line)) : [];
}

function hasWritePermission(login) {
  if (!/^[A-Za-z0-9-]{1,39}$/.test(login)) return false;
  try {
    const permission = gh([
      `repos/${REPO}/collaborators/${encodeURIComponent(login)}/permission`,
      "--jq", ".permission",
    ]);
    return ["write", "maintain", "admin"].includes(permission);
  } catch {
    return false;
  }
}

function executeTask(task) {
  const steps = TASKS[task];
  const output = [];
  let overallStatus = 0;
  for (const [program, args] of steps) {
    output.push(`$ ${program} ${args.join(" ")}`);
    const result = run(program, args);
    output.push(`exit_code=${result.status ?? "unknown"}`);
    if (result.stdout) output.push(result.stdout);
    if (result.stderr) output.push(result.stderr);
    if (result.status !== 0) {
      overallStatus = result.status ?? 1;
      break;
    }
  }
  const body = redact(output.join("\n")).slice(-MAX_OUTPUT);
  return { ok: overallStatus === 0, body, exitCode: overallStatus };
}

async function main() {
  if (!Number.isSafeInteger(ISSUE) || ISSUE < 1) throw new Error("Invalid issue number.");
  const repoInfo = JSON.parse(gh([`repos/${REPO}`]));
  if (repoInfo.full_name?.toLowerCase() !== REPO.toLowerCase()) {
    throw new Error("Repository identity check failed.");
  }
  const issueInfo = JSON.parse(gh([`repos/${REPO}/issues/${ISSUE}`]));
  if (issueInfo.pull_request || issueInfo.state !== "open") {
    throw new Error("Queue issue must be an open issue, not a pull request.");
  }

  // Ignore all historic comments. Only newly added requests are eligible.
  let lastSeenId = loadComments().reduce((max, item) => Math.max(max, item.id), 0);
  console.log(`CerdikGo safe execution bridge listening on ${REPO}#${ISSUE}`);
  console.log("Allowed tasks: env, install, test, dry-run. Ctrl+C stops the bridge.");

  while (true) {
    try {
      const comments = loadComments().sort((a, b) => a.id - b.id);
      for (const comment of comments) {
        if (comment.id <= lastSeenId) continue;
        lastSeenId = comment.id;
        const match = /^\/cerdikgo (env|install|test|dry-run)$/.exec((comment.body || "").trim());
        if (!match) continue;

        const task = match[1];
        const actor = comment.user?.login || "unknown";
        if (!hasWritePermission(actor)) {
          console.log(`Rejected request from non-writer: ${actor}`);
          continue;
        }

        post(`Accepted \`${task}\` from @${actor}. Running fixed allowlisted task in Codespaces Preview. No arbitrary shell commands are supported.`);
        console.log(`Running task=${task}, requested_by=${actor}`);
        const result = executeTask(task);
        const status = result.ok ? "PASS" : "FAIL";
        post(`**CerdikGo task: ${task} — ${status}**\n\n`
          + `Exit code: ${result.exitCode}\n\n`
          + `\`\`\`text\\n${result.body}\\n\`\`\`\\n\\n`
          + "Preview-only execution. No deployment, database migration, secrets, OAuth, billing, merge, or Production operations were performed.");
        console.log(`Completed task=${task}, status=${status}`);
      }
    } catch (error) {
      console.error(`Bridge poll error: ${String(error).slice(0, 1000)}`);
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  }
}

main().catch((error) => {
  console.error(`Bridge stopped: ${String(error).slice(0, 1200)}`);
  process.exitCode = 1;
});
