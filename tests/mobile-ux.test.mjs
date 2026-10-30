import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../src/index.html", import.meta.url), "utf8");

test("mobile navigation has accessible controls and a labelled navigation region", () => {
  assert.ok(html.includes('<aside class="side" id="sideNav" aria-label="Navigasi utama">'));
  assert.ok(html.includes('id="menuToggle" type="button" aria-controls="sideNav" aria-expanded="false"'));
  assert.ok(html.includes('id="navBackdrop" type="button" aria-label="Tutup navigasi" hidden'));
});

test("tablet and mobile layouts move the sidebar into an off-canvas drawer", () => {
  assert.ok(html.includes("@media (max-width: 1024px)"));
  assert.ok(html.includes(".app.nav-open .side { transform: translateX(0); }"));
  assert.ok(html.includes(".nav-backdrop[hidden] { display: none; }"));
  assert.ok(html.includes("@media (max-width: 480px)"));
  assert.ok(html.includes(".suggestions { grid-template-columns: 1fr; gap: 8px; }"));
});

test("navigation supports toggle, backdrop dismissal, Escape, and prompt selection", () => {
  assert.ok(html.includes("function setNavigationOpen(open)"));
  assert.ok(html.includes('menuToggle.setAttribute("aria-expanded", String(open))'));
  assert.ok(html.includes('navBackdrop.addEventListener("click", () => setNavigationOpen(false))'));
  assert.ok(html.includes('event.key === "Escape"'));
  assert.ok(html.includes('usePrompt(button.dataset.prompt || "");\n        setNavigationOpen(false);'));
});
