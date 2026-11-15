// Root service worker for the home page. Its scope is "/", so it sits above every app on
// the domain: it must only ever answer requests for files home owns and let everything
// else go straight to the network (no respondWith), so apps behave as if it didn't exist.
// VERSION and PRECACHE are filled in at build time (integrations/service-worker.mjs).

const VERSION = "39d664ebb356";
const PRECACHE = ["/","/_home/404.astro_astro_type_script_index_0_lang.C40pxmOD.js","/_home/Apps.astro_astro_type_script_index_0_lang.BT-WJz7G.js","/_home/apps.CKY6NP2l.js","/_home/Base.BLogrUQH.css","/_home/CommandPalette.astro_astro_type_script_index_0_lang.BlacO29y.js","/_home/fuzzy.Bf_E0eRO.js","/_home/geist-latin-wght-normal.BgDaEnEv.woff2","/_home/geist-mono-latin-wght-normal.XN7g48iV.woff2","/_home/Header.astro_astro_type_script_index_0_lang.Bl6k1_Uk.js","/_home/index.BOtkclQf.css","/_home/instrument-serif-latin-400-italic.DKMiL14s.woff2","/_home/live-posts.C5qtQ1oI.js","/_home/theme.CiGLF9Ht.js","/_home/Writing.astro_astro_type_script_index_0_lang.CkQNTz_n.js","/404.html","/apple-touch-icon-180x180.png","/favicon.svg","/manifest.webmanifest","/maskable-icon-512x512.png","/pwa-192x192.png","/pwa-512x512.png","/pwa-64x64.png"];
const CACHE = `home-${VERSION}`;
const OWNED = new Set([...PRECACHE, '/index.html']);

function isOwned(url) {
  if (url.origin !== self.location.origin) return false;
  return OWNED.has(url.pathname) || url.pathname.startsWith('/_home/');
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE.map((p) => new Request(p, { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  // Other apps share this origin's CacheStorage: only ever delete our own caches.
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('home-') && k !== CACHE).map((k) => caches.delete(k)))),
  );
});

function timeout(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));
}

async function networkFirst(request, key) {
  const cache = await caches.open(CACHE);
  try {
    const res = await Promise.race([fetch(request), timeout(4000)]);
    if (res.ok) cache.put(key, res.clone());
    return res;
  } catch {
    return (await cache.match(key)) ?? (await cache.match('/404.html')) ?? Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request, { ignoreSearch: true });
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) cache.put(request, res.clone());
  return res;
}

async function staleWhileRevalidate(event) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(event.request, { ignoreSearch: true });
  const update = fetch(event.request)
    .then((res) => {
      if (res.ok) cache.put(event.request, res.clone());
      return res;
    })
    .catch(() => hit ?? Response.error());
  if (hit) {
    event.waitUntil(update);
    return hit;
  }
  return update;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (!isOwned(url)) return;

  if (url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(networkFirst(request, '/'));
  } else if (url.pathname.startsWith('/_home/')) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(staleWhileRevalidate(event));
  }
});
