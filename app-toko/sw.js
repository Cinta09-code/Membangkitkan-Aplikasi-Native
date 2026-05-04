const CACHE_NAME = 'toko-pwa-v1';
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// 1. TAHAP INSTALL: Simpan file-file penting ke Cache Browser
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Membuka cache dan menyimpan aset...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] Semua aset berhasil di-cache!');
        return self.skipWaiting(); // Aktifkan SW baru segera
      })
  );
});

// 2. TAHAP ACTIVATE: Bersihkan cache lama
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] Menghapus cache lama:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. TAHAP FETCH: Mencegat request. Jika offline, ambil dari Cache!
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Jika file ada di cache, kembalikan file tersebut (Offline Mode)
        if (response) {
          console.log('[SW] Melayani dari cache:', event.request.url);
          return response;
        }
        // Jika tidak ada di cache, ambil dari internet (Online Mode)
        console.log('[SW] Mengambil dari jaringan:', event.request.url);
        return fetch(event.request).then(networkResponse => {
          // Jangan cache request API yang dinamis
          if (!event.request.url.includes('api-toko')) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        });
      })
      .catch(() => {
        // Fallback jika benar-benar offline dan tidak ada cache
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      })
  );
});