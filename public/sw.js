// AstroWave Service Worker v2
const CACHE_NAME = 'astrowave-v2';

// Safe static assets only - NEVER cache dynamic HTML pages or RSC streams
const STATIC_ASSETS = [
  '/favicon.svg',
  '/favicon.png',
  '/favicon-awe.svg',
  '/favicon-awe.png',
  '/logo/astrowave-logo.svg',
  '/logo/astrowave-icon.svg',
];

// Install - cache static assets only
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('SW: Precache failed for some assets', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate - purge all older caches
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

// Fetch - safe handling avoiding Next.js RSC collisions
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip external requests
  if (url.origin !== self.location.origin) return;

  // CRITICAL: NEVER intercept API routes or Next.js internal endpoints
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/')) {
    return;
  }

  // CRITICAL: NEVER intercept React Server Component (RSC) requests
  // Next.js App Router uses the RSC header and _rsc query parameter.
  // Intercepting these and returning cached HTML causes:
  // "Uncaught SyntaxError: Unexpected token '<'"
  if (
    request.headers.get('RSC') === '1' ||
    request.headers.get('Next-Router-State-Tree') ||
    request.headers.get('Next-Router-Prefetch') ||
    request.headers.get('accept')?.includes('text/x-component') ||
    url.searchParams.has('_rsc')
  ) {
    return;
  }

  // Only serve pre-cached static icons and images
  if (
    url.pathname.match(/\.(svg|png|jpg|jpeg|ico|woff2)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
  }
});
