// Replaced by scripts/build-pwa.mjs after the static export.
const CACHE = "__PWA_CACHE__";
const PREFIX = "__PWA_PREFIX__";
const ROOT = "__PWA_ROOT__";
const ASSETS = ["__PWA_ASSETS__"];

self.addEventListener("install", (event) => {
  // An incomplete download must not replace the working offline version.
  event.waitUntil(caches.open(CACHE).then((cache) =>
    cache.addAll(ASSETS.map((url) => new Request(url, { cache: "reload" }))),
  ).catch(async (error) => {
    await caches.delete(CACHE);
    throw error;
  }));
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    // Keep old assets while other windows may still need them for open drafts.
    if (!(await self.clients.matchAll({ includeUncontrolled: true })).length) {
      for (const key of await caches.keys()) {
        if (key.startsWith(PREFIX) && key !== CACHE) await caches.delete(key);
      }
    }
    await self.clients.claim();
  })());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "ACTIVATE_UPDATE") event.waitUntil(self.skipWaiting());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;
  const path = url.pathname === `${ROOT}index.html` ? ROOT : url.pathname;
  if (path === ROOT && event.request.mode !== "navigate") return;
  // Only public build files. Auth, Firestore and other Pages apps bypass us.
  if (!ASSETS.includes(path) && !path.startsWith(`${ROOT}_next/static/`)) return;
  event.respondWith((async () => {
    const own = await (await caches.open(CACHE)).match(path);
    if (own) return own;
    for (const key of await caches.keys()) {
      if (!key.startsWith(PREFIX)) continue;
      const old = await (await caches.open(key)).match(path);
      if (old) return old;
    }
    return fetch(event.request);
  })());
});
