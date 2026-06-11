// bekkai service worker（インストール可能化＋通知クリック処理）
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

// ネットワーク優先のパススルー（オフラインキャッシュは最小限）
self.addEventListener('fetch', () => { /* デフォルト動作に委ねる */ })

// 通知タップでアプリを前面に
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ('focus' in c) return c.focus() }
      if (self.clients.openWindow) return self.clients.openWindow('/')
    }),
  )
})
