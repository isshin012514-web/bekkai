import { useState } from 'react'
import { Smartphone, Bell, Check, Share2 } from 'lucide-react'
import { notifySupported, notifyPermission, requestNotify, showLocalNotification, isStandalone } from '@/lib/notify'
import { shareApp } from '@/lib/share'

export function AppInstallSection() {
  const [perm, setPerm] = useState<NotificationPermission>(notifyPermission())
  const installed = isStandalone()

  const enable = async () => {
    const p = await requestNotify()
    setPerm(p)
    if (p === 'granted') showLocalNotification('bekkai', '通知をオンにしました。週次レポートの更新などをお知らせします。')
  }

  return (
    <section className="mx-4 mt-4 border border-border-card rounded-lg p-4">
      <div className="flex items-center gap-2 mb-1">
        <Smartphone size={16} className="text-primary" />
        <h2 className="text-sm font-medium">アプリ・通知</h2>
      </div>
      <p className="text-[11px] text-text-secondary leading-relaxed mb-3">
        ホーム画面に追加すると、アプリのように1タップで開けて続けやすくなります。
        {installed ? '（インストール済み）' : ''}
      </p>

      {!installed && (
        <div className="text-[11px] text-text-secondary bg-surface-secondary rounded-lg px-3 py-2 mb-3 leading-relaxed">
          <b className="text-text-primary">ホーム画面に追加</b><br />
          iPhone(Safari): 共有 → 「ホーム画面に追加」<br />
          Android(Chrome): メニュー → 「アプリをインストール」
        </div>
      )}

      <button
        onClick={enable}
        disabled={!notifySupported() || perm === 'granted'}
        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 border border-border-card rounded-lg text-sm text-text-secondary hover:bg-surface-secondary transition-colors disabled:opacity-60"
      >
        {perm === 'granted' ? <><Check size={14} className="text-done" />通知はオン</> : <><Bell size={14} />通知を許可する</>}
      </button>
      {perm === 'denied' && notifySupported() && (
        <p className="text-[10px] text-text-tertiary mt-1.5">ブラウザの設定で通知がブロックされています。設定から許可してください。</p>
      )}

      <button
        onClick={shareApp}
        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm text-white font-medium mt-2"
        style={{ background: 'linear-gradient(135deg,#185FA5,#7c6cff)' }}
      >
        <Share2 size={14} />友だちにすすめる
      </button>
    </section>
  )
}
