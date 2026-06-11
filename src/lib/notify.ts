export function notifySupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function notifyPermission(): NotificationPermission {
  return notifySupported() ? Notification.permission : 'denied'
}

export async function requestNotify(): Promise<NotificationPermission> {
  if (!notifySupported()) return 'denied'
  try { return await Notification.requestPermission() } catch { return 'denied' }
}

export async function showLocalNotification(title: string, body: string): Promise<void> {
  if (notifyPermission() !== 'granted') return
  try {
    const reg = await navigator.serviceWorker?.getRegistration()
    if (reg) await reg.showNotification(title, { body, icon: '/favicon.svg', badge: '/favicon.svg' })
    else new Notification(title, { body, icon: '/favicon.svg' })
  } catch { /* noop */ }
}

/** インストール済み（スタンドアロン表示）か */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(display-mode: standalone)').matches
    || (window.navigator as { standalone?: boolean }).standalone === true
}
