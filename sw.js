/* ============================================
   Service Worker — PWA
   Cache-first strategy para assets estaticos
   ============================================ */

const CACHE_NAME = 'rv-portfolio-v1';
const STATIC_ASSETS = [
    '/portifolio/',
    '/portifolio/index.html',
    '/portifolio/404.html',
    '/portifolio/assets/css/style.css',
    '/portifolio/assets/js/main.js',
    '/portifolio/assets/js/github.js',
    '/portifolio/assets/js/analytics.js',
    '/portifolio/manifest.json',
    '/portifolio/assets/images/favicon/icon-192.png',
    '/portifolio/assets/images/favicon/icon-512.png'
];

// Instalacao — cachear assets estaticos
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Ativacao — limpar caches antigos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch — cache-first para assets, network-first para API
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignorar requests nao-GET
    if (request.method !== 'GET') return;

    // API GitHub — network-first com cache
    if (url.hostname === 'api.github.com') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                    return response;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    // Assets estaticos — cache-first
    event.respondWith(
        caches.match(request).then(cached => {
            if (cached) return cached;
            return fetch(request).then(response => {
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                return response;
            });
        })
    );
});
