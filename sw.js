const CACHE = 'work-hours-v3';
const FILES = ['./', './index.html', './manifest.json', './icon-180.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const isPage = e.request.mode === 'navigate';
  if (isPage) {
    // Try for a fresh version, fall back to the saved copy when offline
    e.respondWith(
      fetch(e.request, { cache: 'no-store' }).then(r => {
        if (!r.ok) return caches.match('./index.html').then(c => c || r);
        const copy = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); return r;
      })
        .catch(() => caches.match('./index.html'))
    );
  } else {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
});
