const CACHE = 'jinro-v3';
const SHELL = ['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const put = res => { if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return res; };
  // ページ本体はネット優先（更新をすぐ反映）、つながらなければ保存済みを使う
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(put).catch(() => caches.match(e.request).then(h => h || caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(put)));
});
