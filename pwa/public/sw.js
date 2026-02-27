const STATIC_CACHE = 'saeg-static-v1';
const IMAGE_CACHE = 'saeg-images-v1';
const CATALOG_CACHE = 'saeg-catalog-v1';
const OFFLINE_URL = '/offline';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(['/', '/catalogue', OFFLINE_URL]))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => ![STATIC_CACHE, IMAGE_CACHE, CATALOG_CACHE].includes(key))
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== 'GET') return;

  if (req.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (cache) => {
        const hit = await cache.match(req);
        const network = fetch(req)
          .then((res) => {
            if (res.ok) cache.put(req, res.clone());
            return res;
          })
          .catch(() => hit);
        return hit || network;
      })
    );
    return;
  }

  if (url.pathname.startsWith('/api/products') || url.pathname.startsWith('/catalogue')) {
    event.respondWith(
      caches.open(CATALOG_CACHE).then(async (cache) => {
        try {
          const res = await fetch(req);
          if (res.ok) cache.put(req, res.clone());
          return res;
        } catch {
          const hit = await cache.match(req);
          if (hit) return hit;
          return caches.match(OFFLINE_URL);
        }
      })
    );
    return;
  }

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(async () => {
        const cached = await caches.match(req);
        return cached || caches.match(OFFLINE_URL);
      })
    );
  }
});
