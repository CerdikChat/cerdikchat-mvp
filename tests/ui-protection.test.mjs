import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const html = await readFile(new URL("../src/index.html", import.meta.url), "utf8");
const serviceWorker = await readFile(new URL("../src/service-worker.js", import.meta.url), "utf8");
const robot = await readFile(new URL("../src/cerdikgo-protection-robot.svg", import.meta.url), "utf8");

test("Protection Mode banner is present and initially hidden until auth state is known", () => {
  assert.match(html, /id="protectionBanner"[^>]*hidden/);
  assert.match(html, /id="protectionTitle"/);
  assert.match(html, /CERDIKGO · PROTECTION MODE ON/);
});

test("Protection Mode is tied to verified application authentication state", () => {
  assert.match(html, /const visible = isAuthenticated;/);
  assert.match(html, /updateProtectionVisibility\(\);/);
  assert.match(html, /adminPlaceholder\.hidden = !\(isAuthenticated && currentRole === "admin"\)/);
});

test("Composer focus and typing collapse the banner; one-touch control restores it", () => {
  assert.match(html, /protectionCollapse\.addEventListener\("click", \(\) => setProtectionCollapsed\(true\)\)/);
  assert.match(html, /protectionRestore\.addEventListener\("click", \(\) => setProtectionCollapsed\(false\)\)/);
  assert.match(html, /input\.addEventListener\("focus", \(\) => \{ if \(!protectionCollapsed\) setProtectionCollapsed\(true\); \}\)/);
  assert.match(html, /input\.value\.length && !protectionCollapsed/);
  assert.match(html, /aria-label="Tampilkan banner Cerdik Protection Mode"/);
});

test("Reduced-motion preference is respected", () => {
  assert.match(html, /prefers-reduced-motion:reduce\).*protection-banner/);
});

test("Original robot artwork is valid SVG and cached by the versioned app shell", () => {
  assert.match(robot, /^<svg[\s>]/);
  assert.match(robot, /CerdikGo Protection Robot/);
  assert.match(serviceWorker, /cerdikgo-shell-v2/);
  assert.match(serviceWorker, /\/cerdikgo-protection-robot\.svg/);
});

test("All inline JavaScript parses without syntax errors", () => {
  const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
    .map(match => match[1].trim())
    .filter(Boolean);
  assert.ok(scripts.length > 0, "Expected at least one inline script");
  for (const source of scripts) new vm.Script(source, { filename: "src/index.html:inline-script" });
});

test("Targeted workspace refresh includes responsive dashboard and explicit controlled-beta status", () => {
  assert.match(html, /CerdikGo · AI Innovation Workspace/);
  assert.match(html, /CONTROLLED BETA/);
  assert.match(html, /ATLAS-9 targeted screen refresh/);
  assert.match(html, /@media\(max-width:720px\)/);
});

test("Hybrid connectivity simulator is interactive, local-only, and clearly labelled", () => {
  assert.match(html, /Local-only connectivity scenario simulator/);
  assert.match(html, /data-channel="Fiber"/);
  assert.match(html, /data-channel="Cellular A"/);
  assert.match(html, /data-channel="Cellular B"/);
  assert.match(html, /data-channel="Wi-Fi Mesh"/);
  assert.match(html, /data-channel="LoRa Radio"/);
  assert.match(html, /SIMULATION ONLY/);
  assert.match(html, /connectivityReset\?\.addEventListener/);
  assert.match(html, /channel\.available = !channel\.available/);
});

test("Theme toggle retains accessible labels and persisted preference", () => {
  assert.match(html, /localStorage\.getItem\(THEME_STORAGE_KEY\)/);
  assert.match(html, /localStorage\.setItem\(THEME_STORAGE_KEY, selected\)/);
  assert.match(html, /Aktifkan mode siang/);
  assert.match(html, /Aktifkan mode malam/);
});
