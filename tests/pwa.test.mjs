import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [serviceWorker, indexHtml, offlineHtml] = await Promise.all([
  readFile(new URL("../src/service-worker.js", import.meta.url), "utf8"),
  readFile(new URL("../src/index.html", import.meta.url), "utf8"),
  readFile(new URL("../src/offline.html", import.meta.url), "utf8"),
]);

test("PWA registers a same-origin root-scoped service worker over secure contexts", () => {
  assert.match(indexHtml, /navigator\.serviceWorker\.register\("\/service-worker\.js", \{ scope: "\/" \}\)/);
  assert.match(indexHtml, /window\.isSecureContext/);
});

test("offline UI distinguishes network reachability from AI service health", () => {
  assert.match(indexHtml, /navigator\.onLine/);
  assert.match(indexHtml, /Layanan AI diverifikasi saat permintaan dijalankan/);
  assert.match(indexHtml, /Chat, login, dan analisis file memerlukan internet/);
});

test("service worker caches only the static app shell", () => {
  assert.match(serviceWorker, /APP_SHELL = \["\/", "\/manifest\.webmanifest", "\/offline\.html"\]/);
  assert.match(serviceWorker, /cerdikgo-shell-v1/);
  assert.match(serviceWorker, /key\.startsWith\("cerdikgo-shell-"\)/);
});

test("service worker never intercepts API, non-GET, cross-origin or authorized requests", () => {
  assert.match(serviceWorker, /request\.method !== "GET"/);
  assert.match(serviceWorker, /url\.origin !== self\.location\.origin/);
  assert.match(serviceWorker, /url\.pathname\.startsWith\("\/api\/"\)/);
  assert.match(serviceWorker, /request\.headers\.has\("authorization"\)/);
  assert.match(serviceWorker, /request\.mode !== "navigate"/);
});

test("offline fallback makes no promise of offline chat or local persistence", () => {
  assert.match(offlineHtml, /Chat AI, Google Sign-In, analisis dokumen, dan sinkronisasi memerlukan koneksi internet/);
  assert.match(offlineHtml, /Tidak ada pesan atau dokumen yang disimpan otomatis/);
});
