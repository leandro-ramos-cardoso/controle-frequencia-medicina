// Service worker mínimo para o PWA.
// Estratégia: network-first para navegação (HTML), cache-first para assets
// estáticos. Não cacheia respostas de API/Server Actions — dados sempre
// vêm da rede quando disponível; o app trata o "sem rede" no próprio
// código (ver lib/offline/queue.ts), não aqui.

const CACHE_NAME = 'frequencia-medicina-shell-v1';
const OFFLINE_URL = '/offline';

const PRECACHE_URLS = [OFFLINE_URL, '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Nunca interceptar métodos que não sejam GET (Server Actions usam POST).
  if (request.method !== 'GET') return;

  // Navegação de página: tenta rede, cai para a tela de offline se falhar.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Assets estáticos (same-origin): cache-first com atualização em segundo plano.
  const url = new URL(request.url);
  if (url.origin === self.location.origin && /\.(js|css|png|jpg|jpeg|svg|woff2?)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return response;
          })
      )
    );
  }
});
