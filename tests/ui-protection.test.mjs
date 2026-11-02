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
