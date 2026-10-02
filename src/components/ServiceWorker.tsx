'use client';

import { useEffect } from 'react';

export default function ServiceWorker() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    // Check if in development or preview/iframe environment (Cloud Run run.app or localhost)
    const isDevOrPreview =
      process.env.NODE_ENV === 'development' ||
      window.location.hostname.includes('localhost') ||
      window.location.hostname.includes('127.0.0.1') ||
      window.location.hostname.includes('run.app');

    if (isDevOrPreview) {
      // Clean up any stale service workers or caches that cause unexpected token '<' errors
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          reg.unregister();
        }
      });
      if ('caches' in window) {
        caches.keys().then((keys) => {
          for (const key of keys) {
            caches.delete(key);
          }
        });
      }
      return;
    }

    // Only register on production domain
    navigator.serviceWorker
      .register('/sw.js')
      .catch((error) => {
        console.warn('SW registration skipped:', error);
      });
  }, []);

  return null;
}
