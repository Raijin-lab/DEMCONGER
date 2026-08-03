const CACHE_NAME = 'absence-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// Installation du service worker et mise en cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Récupération des requêtes (Offline mode)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retourne la version en cache si elle existe, sinon fait la requête réseau
        return response || fetch(event.request);
      })
  );
});