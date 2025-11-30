// 給這次快取一個名字，之後更新可以改版本號
const CACHE_NAME = 'nan-todo-v1';

const URLS_TO_CACHE = [
  './',
  './index.html',
  './ling-helper.png',
  './icon-192.png',
  './icon-512.png'
];

// 安裝階段：把需要的檔案先塞進快取
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// 啟用階段：清掉舊版快取（如果版本名不一樣）
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
});

// 之後每次抓檔案都先問快取，沒有再問網路
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(response => {
      // 先用快取的，如果沒有就去抓網路
      return (
        response ||
        fetch(event.request).catch(() => {
          // 網路掛了時，至少回首頁讓小本本打得開
          return caches.match('./index.html');
        })
      );
    })
  );
});
