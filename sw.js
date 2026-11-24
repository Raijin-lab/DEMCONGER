/* Service worker – Demande d'absence A2CIM
   Changer CACHE_VERSION à chaque modification de l'application
   pour forcer la mise à jour chez tous les utilisateurs. */
const CACHE_VERSION = "a2cim-absence-v5";
const FICHIERS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(FICHIERS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((noms) => Promise.all(noms.filter((n) => n !== CACHE_VERSION).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  // Page : réseau d'abord (toujours la dernière version), cache si hors ligne
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((rep) => {
          const copie = rep.clone();
          caches.open(CACHE_VERSION).then((c) => c.put("./index.html", copie));
          return rep;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Autres fichiers : cache d'abord
  event.respondWith(
    caches.match(req).then((enCache) => enCache || fetch(req).then((rep) => {
      const copie = rep.clone();
      caches.open(CACHE_VERSION).then((c) => c.put(req, copie));
      return rep;
    }))
  );
});
