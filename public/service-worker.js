const CACHE_NAME = 'claude-chat-v1';
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json'
];

// インストール時に静的ファイルをキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_FILES))
  );
  self.skipWaiting();
});

// 古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// リクエスト処理
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API リクエストはキャッシュしない（常にネット経由）
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // 静的ファイルはキャッシュ優先、なければネットから取得
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
