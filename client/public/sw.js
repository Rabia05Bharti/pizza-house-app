const CACHE_NAME = 'pizza-house-pwa-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => caches.delete(key)));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Always let network handle API and JS bundle requests
  if (event.request.url.includes('/api/') || event.request.destination === 'script' || event.request.destination === 'style') {
    return;
  }
});
