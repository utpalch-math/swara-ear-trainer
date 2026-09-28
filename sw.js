/* Service Worker for Swara Ear Trainer - Utpal Chattopadhyay (c) 2026 */

/*
 * RELEASE CHECKLIST: whenever index.html changes, bump the number in CACHE_NAME
 * below (v2 -> v3 -> ...). This worker is cache-first, so installed copies keep
 * serving the old files until sw.js itself changes; changing that one line is what
 * makes browsers install the new release.
 *
 * This app and Palta Practice both live on utpalch-math.github.io, and Cache Storage
 * is shared per origin. So activate must delete ONLY caches whose names start with
 * 'swara-cache-'. Never change it to "delete every other cache" - that would wipe
 * the other app's offline copy.
 *
 * CHANGES (sw.js v2, 2026-09-29):
 *  - CACHE_NAME bumped swara-cache-v1 -> swara-cache-v2.
 *  - Added CACHE_PREFIX; activate now deletes only old 'swara-cache-' caches
 *    (previously it deleted every other cache on the origin, including Palta's).
 *  - Install now fetches with cache:'reload' so a stale copy from the browser's
 *    HTTP cache is never stored as the offline copy.
 *  - Added this checklist comment (same rules as Palta's sw.js).
 */

// CHANGED v2: was 'swara-cache-v1' - bumped for this release.
const CACHE_NAME = 'swara-cache-v2';
// ADDED v2: only caches with this prefix belong to this app.
const CACHE_PREFIX = 'swara-cache-';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // CHANGED v2: cache:'reload' bypasses the browser's own HTTP cache (GitHub Pages
      // allows about 10 minutes), so the freshly released files are what get stored.
      return cache.addAll(ASSETS_TO_CACHE.map((url) => new Request(url, { cache: 'reload' })));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      // CHANGED v2: delete only this app's older caches. Previously this deleted every
      // cache not equal to CACHE_NAME, which also wiped Palta Practice's offline copy.
      return Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Unchanged: cache-first, falling back to the network.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
