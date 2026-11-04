import worker from "../worker.js";

const TOTAL = 99990;
const CONCURRENCY = 100;
const base = "https://atlas9-test.invalid";
const env = {
  GOOGLE_CLIENT_ID: "atlas9-synthetic-client.apps.googleusercontent.com",
  GOOGLE_AUTH_REQUIRED: "true",
  ENVIRONMENT: "test"
};
const cases = [
  ["auth-config", "/api/auth/config", "GET", 200],
  ["admin-session-fail-closed", "/api/admin/session", "GET", 401],
  ["pending-queue-fail-closed", "/api/admin/users/pending", "GET", 401],
  ["decision-method-guard", "/api/admin/users/decide", "GET", 405],
  ["decision-auth-fail-closed", "/api/admin/users/decide", "POST", 401],
  ["unknown-route", "/__atlas9_unknown__", "GET", 404]
];
const samples = new Array(TOTAL);
const counts = Object.fromEntries(cases.map(c => [c[0], { total: 0, passed: 0, failed: 0 }]));
let firstFailure = null;
const start = performance.now();

async function execute(i) {
  const c = cases[i % cases.length];
  const request = new Request(base + c[1], {
    method: c[2],
    headers: { origin: base, ...(c[2] === "POST" ? { "content-type": "application/json" } : {}) }
  });
  const before = performance.now();
  const response = await worker.fetch(request, env, {});
  const elapsed = performance.now() - before;
  samples[i] = elapsed;
  const item = counts[c[0]];
  item.total++;
  let pass = response.status === c[3];
  if (c[0] === "auth-config") {
    const body = await response.json();
    pass = pass && body.required === true && body.configured === true &&
      typeof body.csrfToken === "string" && body.csrfToken.length === 43;
  } else {
    await response.body?.cancel();
  }
  if (pass) item.passed++;
  else {
    item.failed++;
    if (!firstFailure) firstFailure = { index: i, scenario: c[0], expected: c[3], actual: response.status };
  }
}

async function lane(n) {
  for (let i = n; i < TOTAL; i += CONCURRENCY) {
    try { await execute(i); }
    catch (error) {
      const item = counts[cases[i % cases.length][0]];
      item.total++;
      item.failed++;
      if (!firstFailure) firstFailure = { index: i, error: String(error) };
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, (_, n) => lane(n)));
const elapsed = performance.now() - start;
const sorted = samples.sort((a, b) => a - b);
const pct = p => sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * p) - 1)];
const passed = Object.values(counts).reduce((n, x) => n + x.passed, 0);
const failed = TOTAL - passed;
const report = {
  campaign: "ATLAS-9 CerdikChat synthetic local Worker stress",
  target: TOTAL, completed: TOTAL, passed, failed,
  passRatePercent: Number((passed / TOTAL * 100).toFixed(4)),
  concurrency: CONCURRENCY,
  durationMs: Number(elapsed.toFixed(2)),
  throughputPerSecond: Number((TOTAL / elapsed * 1000).toFixed(2)),
  latencyMs: { p50: Number(pct(.50).toFixed(3)), p95: Number(pct(.95).toFixed(3)), p99: Number(pct(.99).toFixed(3)), max: Number(sorted.at(-1).toFixed(3)) },
  scenarios: counts, firstFailure,
  safety: "In-process Worker handler only; synthetic requests; no public network, D1 writes, Google calls, AI inference, or Production traffic."
};
console.log(JSON.stringify(report, null, 2));
if (failed) throw new Error("ATLAS-9 stress campaign failed: " + failed + " cases");
