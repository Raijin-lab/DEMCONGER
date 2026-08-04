const CACHE_NAME = 'absence-cache-v9'; // Changement de version
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './121873.jpg'
];

// Installation du service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Stratégie : Network First (Réseau d'abord, Cache en secours)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si le réseau fonctionne, on met à jour le cache avec la nouvelle version
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si pas de réseau (hors-ligne), on cherche dans le cache
        return caches.match(event.request);
      })
  );
});
