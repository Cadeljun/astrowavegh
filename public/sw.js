// AstroWave Service Worker
const CACHE_NAME = 'astrowave-v1';
const STATIC_ASSETS = [
  '/',
  '/tickets',
  '/scan/login',
  '/favicon.svg',
  '/favicon.png',
  '/logo/astrowave-logo.svg',
];

// Install - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip API calls
  if (url.pathname.startsWith('/api/')) return;

  // Skip external requests
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Return cached, update in background
        const fetchPromise = fetch(request).then((response) => {
          if (response && response.status === 200) {
            const cache = caches.open(CACHE_NAME);
            cache.then((c) => c.put(request, response.clone()));
          }
          return response;
        }).catch(() => cached);
        
        return cached;
      }

      // Not cached - fetch and cache
      return fetch(request).then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }

        // Cache static assets
        if (
          url.pathname.startsWith('/_next/static/') ||
          url.pathname.match(/\.(jpg|jpeg|png|svg|ico|woff2|css|js)$/)
        ) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }

        return response;
      });
    })
  );
});
