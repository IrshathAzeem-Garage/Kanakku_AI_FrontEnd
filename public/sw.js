const CACHE_NAME = 'kanakku-ai-static-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Cache-first for static local assets only, NEVER cache /api/ financial endpoints
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Strictly skip caching for any API requests or uploaded images
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/uploads')) {
    return;
  }

  // Handle standard navigation and static assets
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return (
          cachedResponse ||
          fetch(event.request).catch(() => {
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          })
        );
      })
    );
  }
});
