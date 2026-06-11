import { Cloud, CloudOff, RefreshCw, UploadCloud, DownloadCloud, LogOut, Check, AlertTriangle } from 'lucide-react'
import { useCloudSync } from '@/lib/use-cloud-sync'

function formatTime(ms: number): string {
  if (!ms) return '—'
  const d = new Date(ms)
  const diff = Date.now() - ms
  if (diff < 60_000) return 'たった今'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}分前`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}時間前`
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function CloudSyncSection() {
  const cs = useCloudSync()

  // 未設定：開発者向けの控えめな案内のみ
  if (!cs.configured) {
    return (
      <section className="mx-4 mt-4 border border-border-card rounded-lg p-4">
        <div className="flex items-center gap-2 mb-1">
          <CloudOff size={16} className="text-text-tertiary" />
          <h2 className="text-sm font-medium">クラウド同期</h2>
          <span className="text-[10px] text-text-tertiary bg-surface-secondary rounded px-1.5 py-0.5">未設定</span>
        </div>
        <p className="text-[11px] text-text-secondary leading-relaxed">
          Firebase を設定すると、Googleログインで複数端末のデータを自動同期できます（無料）。設定後にこのカードが有効になります。
        </p>
      </section>
    )
  }

  const statusChip = () => {
    if (!cs.user) return null
    if (cs.status === 'syncing') return <span className="text-[10px] text-primary inline-flex items-center gap-1"><RefreshCw size={11} className="animate-spin" />同期中…</span>
    if (cs.status === 'error') return <span className="text-[10px] text-fail-danger inline-flex items-center gap-1"><AlertTriangle size={11} />エラー</span>
    return <span className="text-[10px] text-done inline-flex items-center gap-1"><Check size={11} />同期済み</span>
  }

  return (
    <section className="mx-4 mt-4 border border-border-card rounded-lg p-4">
      <div className="flex items-center gap-2 mb-1">
        <Cloud size={16} className="text-primary" />
        <h2 className="text-sm font-medium flex-1">クラウド同期</h2>
        {statusChip()}
      </div>

      {!cs.ready ? (
        <p className="text-[11px] text-text-tertiary">読み込み中…</p>
      ) : !cs.user ? (
        <>
          <p className="text-[11px] text-text-secondary leading-relaxed mb-3">
            Googleでログインすると、別の端末ともデータが自動で同期されます。データは自分のアカウントだけが読み書きできます。
          </p>
          <button
            type="button" onClick={cs.signIn} disabled={cs.busy}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border border-border-card bg-surface hover:bg-surface-secondary transition-colors disabled:opacity-50"
          >
            <GoogleMark />Googleでログイン
          </button>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-3 bg-surface-secondary rounded-lg px-3 py-2">
            {cs.user.photoURL
              ? <img src={cs.user.photoURL} alt="" className="w-6 h-6 rounded-full" />
              : <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary">{(cs.user.displayName || cs.user.email || '?').slice(0, 1)}</div>}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-text-primary truncate">{cs.user.displayName || cs.user.email}</p>
              <p className="text-[10px] text-text-tertiary">最終同期: {formatTime(cs.lastSync)}</p>
            </div>
          </div>

          {cs.conflict ? (
            <div className="mb-3 border border-waiting rounded-lg p-3 bg-waiting-bg">
              <p className="text-[12px] text-waiting font-medium mb-1.5">データが両方にあります</p>
              <p className="text-[11px] text-text-secondary leading-relaxed mb-2.5">
                クラウドにもこの端末にもデータがあります。どちらを残しますか？（もう一方は上書きされます）
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={cs.resolveRemote} disabled={cs.busy}
                  className="flex-1 py-2 rounded-lg text-[12px] bg-primary text-white font-medium disabled:opacity-50">クラウドを使う</button>
                <button type="button" onClick={cs.resolveLocal} disabled={cs.busy}
                  className="flex-1 py-2 rounded-lg text-[12px] border border-border-card text-text-secondary disabled:opacity-50">この端末を使う</button>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-text-secondary leading-relaxed mb-3">
              変更は自動でクラウドに保存されます。手動でも操作できます。
            </p>
          )}

          {cs.error && <div className="mb-3 text-[11px] text-fail-danger">{cs.error}</div>}

          <div className="flex gap-2">
            <button type="button" onClick={cs.pushNow} disabled={cs.busy || cs.conflict}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 border border-border-card rounded-lg text-[12px] text-text-secondary hover:bg-surface-secondary transition-colors disabled:opacity-50">
              <UploadCloud size={13} />今すぐ保存
            </button>
            <button type="button" onClick={cs.pullNow} disabled={cs.busy || cs.conflict}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 border border-border-card rounded-lg text-[12px] text-text-secondary hover:bg-surface-secondary transition-colors disabled:opacity-50">
              <DownloadCloud size={13} />取得
            </button>
            <button type="button" onClick={cs.signOutNow} disabled={cs.busy}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-border-card rounded-lg text-[12px] text-text-tertiary hover:bg-surface-secondary transition-colors disabled:opacity-50">
              <LogOut size={13} />
            </button>
          </div>
        </>
      )}
    </section>
  )
}

function GoogleMark() {
  return (
    <svg width="15" height="15" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 18.9 12 24 12c3.1 0 5.8 1.1 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.6 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C41 36.2 44 30.6 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  )
}
