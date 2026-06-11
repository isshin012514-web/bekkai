import { useState } from 'react'
import { Cloud, CloudOff, RefreshCw, UploadCloud, DownloadCloud, LogOut, Check, AlertTriangle, Mail } from 'lucide-react'
import { useCloudSync } from '@/lib/use-cloud-sync'
import type { CloudSync } from '@/lib/use-cloud-sync'

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
        <EmailAuthForm cs={cs} />
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

function EmailAuthForm({ cs }: { cs: CloudSync }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [notice, setNotice] = useState<string | null>(null)

  const inputCls = 'w-full text-[13px] bg-surface border border-border-card rounded-lg px-3 py-2.5 placeholder:text-text-tertiary focus:outline-none focus:border-primary'

  const submit = async () => {
    setNotice(null)
    if (!email.trim() || !password) return
    const ok = mode === 'login' ? await cs.signInEmail(email, password) : await cs.signUpEmail(email, password)
    if (ok) { setPassword('') }
  }

  const forgot = async () => {
    setNotice(null)
    if (!email.trim()) { setNotice('先にメールアドレスを入力してください'); return }
    const ok = await cs.resetPw(email)
    if (ok) setNotice('パスワード再設定メールを送信しました')
  }

  return (
    <div>
      <p className="text-[11px] text-text-secondary leading-relaxed mb-3">
        メールアドレスとパスワードで{mode === 'login' ? 'ログイン' : '新規登録'}すると、別の端末ともデータが自動で同期されます。データは自分のアカウントだけが読み書きできます。
      </p>

      {/* ログイン / 新規登録 切替 */}
      <div className="flex gap-1 p-0.5 bg-surface-secondary rounded-lg border border-border-card mb-2.5">
        {(['login', 'signup'] as const).map((m) => (
          <button key={m} type="button" onClick={() => { setMode(m); setNotice(null) }}
            className={`flex-1 text-[12px] py-1.5 rounded-md transition-colors ${mode === m ? 'bg-primary text-white font-medium' : 'text-text-secondary'}`}>
            {m === 'login' ? 'ログイン' : '新規登録'}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <input type="email" inputMode="email" autoComplete="email" className={inputCls}
          placeholder="メールアドレス" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className={inputCls}
          placeholder={mode === 'login' ? 'パスワード' : 'パスワード（6文字以上）'} value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit() }} />
      </div>

      {cs.error && <p className="text-[11px] text-fail-danger mt-2">{cs.error}</p>}
      {notice && <p className="text-[11px] text-done mt-2">{notice}</p>}

      <button type="button" onClick={submit} disabled={cs.busy || !email.trim() || !password}
        className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-white bg-primary mt-3 disabled:opacity-50">
        <Mail size={15} />{mode === 'login' ? 'ログイン' : '登録して同期を始める'}
      </button>

      {mode === 'login' && (
        <button type="button" onClick={forgot} disabled={cs.busy}
          className="w-full text-[11px] text-text-tertiary mt-2 hover:text-text-secondary">
          パスワードを忘れた場合
        </button>
      )}
    </div>
  )
}
