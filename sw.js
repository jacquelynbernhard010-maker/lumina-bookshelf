/**
 * Lumina Bookshelf - Offline Service Worker
 * Provides offline shell caching and instant load times.
 */

const CACHE_NAME = 'lumina-bookshelf-v1.0';

const PRECACHE_ASSETS = [
    './',
    './index.html',
    './reader.html',
    './manifest.json',
    './assets/css/style.css',
    './assets/css/reader.css',
    './assets/js/db.js',
    './assets/js/app.js',
    './assets/js/reader.js',
    './assets/js/sound.js',
    './assets/js/epub_extractor.js',
    './assets/js/mobi_parser.js',
    './assets/images/icons/icon-192.png',
    './assets/images/icons/icon-512.png',
    './assets/images/icons/close.png',
    './assets/images/icons/reload.png',
    './assets/images/icons/star.png',
    './assets/images/icons/book.png',
    './assets/images/icons/folder.png',
    './assets/images/ui/cat_paw.png',
    './assets/images/cat_loaf.png',
    './assets/sounds/click_soft_01.wav',
    './assets/sounds/confirm_01.wav',
    './assets/sounds/pop_03.wav',
    './assets/sounds/meow_hello_02.wav',
    './assets/sounds/toggle_on_01.wav'
];

// Install: precache app shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS).catch((err) => {
                console.warn('[SW] Some precache assets skipped:', err);
            });
        }).then(() => self.skipWaiting())
    );
});

// Activate: delete old cache versions
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch: network-first for HTML, stale-while-revalidate for assets
self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    // Ignore non-http requests (chrome-extension, etc)
    if (!req.url.startsWith('http')) return;

    // HTML documents: try network first, fallback to cached offline shell
    if (req.headers.get('accept') && req.headers.get('accept').includes('text/html')) {
        event.respondWith(
            fetch(req)
                .then((res) => {
                    if (res && res.status === 200) {
                        const copy = res.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
                    }
                    return res;
                })
                .catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
        );
        return;
    }

    // Static assets: cache-first with network background update (stale-while-revalidate)
    event.respondWith(
        caches.match(req).then((cached) => {
            const networkFetch = fetch(req).then((res) => {
                if (res && res.status === 200) {
                    const copy = res.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
                }
                return res;
            }).catch(() => null);

            return cached || networkFetch;
        })
    );
});
