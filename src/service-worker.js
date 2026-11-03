"use strict";
const CACHE_NAME = "cerdikgo-shell-v2";
const APP_SHELL = ["/", "/manifest.webmanifest", "/offline.html", "/cerdikgo-mark.svg", "/icons/icon-192.png", "/icons/icon-512.png"];
self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith("cerdikgo-shell-") && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/") || request.headers.has("authorization")) return;
  if (request.mode !== "navigate") return;
  event.respondWith((async () => {
    try { return await fetch(request); }
    catch {
      const cache = await caches.open(CACHE_NAME);
      return (await cache.match("/")) || (await cache.match("/offline.html")) || new Response("CerdikGo offline.", {status:503,headers:{"content-type":"text/plain;charset=utf-8","cache-control":"no-store"}});
    }
  })());
});