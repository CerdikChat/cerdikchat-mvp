import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [serviceWorker, indexHtml, offlineHtml] = await Promise.all([
  readFile(new URL("../src/service-worker.js", import.meta.url), "utf8"),
  readFile(new URL("../src/index.html", import.meta.url), "utf8"),
  readFile(new URL("../src/offline.html", import.meta.url), "utf8"),
]);



test("account sign-in is located inside settings and not in the main workspace", () => {
  assert.ok(indexHtml.includes('id="settingsOpen"'));
  assert.ok(indexHtml.includes('<dialog class="settings-dialog" id="settingsDialog"'));
  assert.ok(indexHtml.includes('aria-controls="settingsDialog"'));
  const dialogStart = indexHtml.indexOf('id="settingsDialog"');
  const authPanel = indexHtml.indexOf('id="authPanel"');
  const dialogEnd = indexHtml.indexOf("</dialog>", dialogStart);
  assert.ok(dialogStart >= 0 && authPanel > dialogStart && authPanel < dialogEnd);
  assert.ok(!indexHtml.includes('Google sub:'));
  assert.ok(indexHtml.includes("Akun Google belum memiliki akses ke CerdikGo."));
});
\ntest("day and night mode toggle is accessible and persists locally", () => {
  assert.match(indexHtml, /id="themeToggle"/);
  assert.match(indexHtml, /aria-pressed="false"/);
  assert.match(indexHtml, /THEME_STORAGE_KEY = "cerdikgo-theme"/);
  assert.match(indexHtml, /localStorage\.getItem\(THEME_STORAGE_KEY\)/);
  assert.match(indexHtml, /localStorage\.setItem\(THEME_STORAGE_KEY, selected\)/);
  assert.match(indexHtml, /prefers-color-scheme: light/);
  assert.match(indexHtml, /data-theme="light"/);
  assert.match(indexHtml, /Aktifkan mode malam/);
  assert.match(indexHtml, /Aktifkan mode siang/);
});

test("PWA registers a same-origin root-scoped service worker over secure contexts", () => {
  assert.match(indexHtml, /navigator\.serviceWorker\.register\("\/service-worker\.js", \{ scope: "\/" \}\)/);
  assert.match(indexHtml, /window\.isSecureContext/);
});

test("CerdikGo brand mark is used in the workspace and offline screen", () => {
  assert.ok(indexHtml.includes('href="/cerdikgo-mark.svg"'));
  assert.ok(indexHtml.includes('src="/cerdikgo-mark.svg"'));
  assert.ok(offlineHtml.includes('src="/cerdikgo-mark.svg"'));
});

test("offline UI distinguishes network reachability from AI service health", () => {
  assert.match(indexHtml, /navigator\.onLine/);
  assert.match(indexHtml, /Layanan AI diverifikasi saat permintaan dijalankan/);
  assert.match(indexHtml, /Chat, login, dan analisis file memerlukan internet/);
});

test("service worker caches only the static app shell", () => {
  assert.ok(serviceWorker.includes('APP_SHELL = ["/", "/manifest.webmanifest", "/offline.html", "/cerdikgo-mark.svg"]'));
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


import vm from "node:vm";

function createServiceWorkerHarness({ networkFetch = async () => new Response("network") } = {}) {
  const listeners = new Map();
  const cacheData = new Map();
  const deletedCaches = [];
  const cache = {
    async addAll(paths) { cacheData.set("shell", [...paths]); },
    async match(key) {
      if (key === "/" && cacheData.has("shell")) return new Response("cached-app-shell");
      if (key === "/offline.html" && cacheData.has("shell")) return new Response("cached-offline-page");
      return undefined;
    },
  };
  const cacheStorage = {
    async open() { return cache; },
    async keys() { return ["cerdikgo-shell-old", "unrelated-cache", "cerdikgo-shell-v1"]; },
    async delete(key) { deletedCaches.push(key); return true; },
  };
  const self = {
    location: { origin: "https://app.test" },
    clients: { claim: async () => {} },
    skipWaiting: async () => {},
    addEventListener(type, handler) { listeners.set(type, handler); },
  };
  vm.runInNewContext(serviceWorker, {
    self,
    caches: cacheStorage,
    fetch: networkFetch,
    URL,
    Response,
  });
  return { listeners, cacheData, deletedCaches };
}

test("service worker install pre-caches the app shell before activation", async () => {
  const harness = createServiceWorkerHarness();
  let pending;
  harness.listeners.get("install")({ waitUntil(promise) { pending = promise; } });
  await pending;
  assert.deepEqual(harness.cacheData.get("shell"), ["/", "/manifest.webmanifest", "/offline.html", "/cerdikgo-mark.svg"]);
});

test("activation removes only obsolete CerdikGo shell caches", async () => {
  const harness = createServiceWorkerHarness();
  let pending;
  harness.listeners.get("activate")({ waitUntil(promise) { pending = promise; } });
  await pending;
  assert.deepEqual(harness.deletedCaches, ["cerdikgo-shell-old"]);
});

test("fetch handler leaves API, cross-origin, non-GET and authorized requests untouched", () => {
  const harness = createServiceWorkerHarness();
  const handler = harness.listeners.get("fetch");
  const cases = [
    { url: "https://app.test/api/chat", method: "GET", mode: "navigate", headers: new Headers() },
    { url: "https://other.test/page", method: "GET", mode: "navigate", headers: new Headers() },
    { url: "https://app.test/page", method: "POST", mode: "navigate", headers: new Headers() },
    { url: "https://app.test/page", method: "GET", mode: "navigate", headers: new Headers({ authorization: "Bearer test" }) },
    { url: "https://app.test/app.js", method: "GET", mode: "same-origin", headers: new Headers() },
  ];
  for (const request of cases) {
    let intercepted = false;
    handler({ request, respondWith() { intercepted = true; } });
    assert.equal(intercepted, false, request.url);
  }
});

test("failed navigation fetch falls back to the cached app shell", async () => {
  const harness = createServiceWorkerHarness({
    networkFetch: async () => { throw new TypeError("offline"); },
  });
  // Simulate the app shell having been cached during installation.
  harness.cacheData.set("shell", ["/", "/manifest.webmanifest", "/offline.html"]);
  let responsePromise;
  harness.listeners.get("fetch")({
    request: {
      url: "https://app.test/private-route",
      method: "GET",
      mode: "navigate",
      headers: new Headers(),
    },
    respondWith(promise) { responsePromise = promise; },
  });
  const response = await responsePromise;
  assert.equal(await response.text(), "cached-app-shell");
  assert.equal(response.status, 200);
});
