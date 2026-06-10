import { useState, useRef } from 'react'
import { Download, Upload, Check, AlertTriangle, Sparkles, Copy, Database } from 'lucide-react'
import { exportAll, importAll, buildAIPrompt } from '@/lib/data-bundle'

export function DataHome() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'exported' | 'imported' | 'copied' | 'error'>('idle')
  const [msg, setMsg] = useState('')
  const [aiOpen, setAiOpen] = useState(false)
  const [aiText, setAiText] = useState('')

  const flash = (s: typeof status, m = '') => {
    setStatus(s); setMsg(m); setTimeout(() => setStatus('idle'), 3000)
  }

  const handleExport = () => {
    try {
      const data = exportAll(new Date().toISOString())
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bekkai-backup-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
      URL.revokeObjectURL(url)
      flash('exported')
    } catch {
      flash('error', 'エクスポートに失敗しました')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const r = importAll(JSON.parse(ev.target?.result as string))
        const parts = [r.growth && '成長力', r.discovery && '発見力', r.bekkai && '別解力'].filter(Boolean)
        flash('imported', `復元: ${parts.join('・')}`)
      } catch {
        flash('error', 'ファイル形式が正しくありません')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const openAI = () => { setAiText(buildAIPrompt()); setAiOpen(true) }

  const copyAI = async () => {
    try {
      await navigator.clipboard.writeText(aiText || buildAIPrompt())
      flash('copied', 'AIに渡す文章をコピーしました')
    } catch {
      flash('error', 'コピーに失敗しました')
    }
  }

  const openChat = async (kind: 'chatgpt' | 'claude') => {
    const text = aiText || buildAIPrompt()
    try { await navigator.clipboard.writeText(text) } catch { /* noop */ }
    const url = kind === 'chatgpt' ? 'https://chatgpt.com/' : 'https://claude.ai/new'
    window.open(url, '_blank', 'noopener')
    flash('copied', 'コピー済み。開いた画面に貼り付けてください')
  }

  return (
    <div className="pb-6">
      {/* Backup / Restore */}
      <section className="mx-4 mt-4 border border-border-card rounded-lg p-4">
        <div className="flex items-center gap-2 mb-1">
          <Database size={16} className="text-text-secondary" />
          <h2 className="text-sm font-medium">バックアップ・復元</h2>
        </div>
        <p className="text-[11px] text-text-secondary leading-relaxed mb-3">
          成長力・発見力・別解力・実現力・失敗力のすべてのデータを、1つのJSONファイルにまとめて保存／復元します。機種変更や別端末・公開URLへの移行に使えます。
        </p>

        {status === 'exported' && <Banner ok>全データをバックアップしました</Banner>}
        {status === 'imported' && <Banner ok>{msg}</Banner>}
        {status === 'copied' && <Banner ok>{msg}</Banner>}
        {status === 'error' && <Banner>{msg}</Banner>}

        <div className="flex gap-3">
          <button type="button" onClick={handleExport}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 border border-border-card rounded-lg text-sm text-text-secondary hover:bg-surface-secondary transition-colors">
            <Download size={14} />エクスポート
          </button>
          <button type="button" onClick={() => fileInputRef.current?.click()}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 border border-border-card rounded-lg text-sm text-text-secondary hover:bg-surface-secondary transition-colors">
            <Upload size={14} />インポート
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />
      </section>

      {/* AI相談 */}
      <section className="mx-4 mt-4 border border-border-card rounded-lg p-4">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={16} className="text-primary" />
          <h2 className="text-sm font-medium">AIに相談する</h2>
        </div>
        <p className="text-[11px] text-text-secondary leading-relaxed mb-3">
          3機能すべてのデータを要約した相談文を生成します。コピーしてChatGPTやClaudeに貼り付ければ、自分専用の壁打ち相手になります。
        </p>
        <button type="button" onClick={openAI}
          className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm text-white font-medium"
          style={{ background: 'linear-gradient(135deg,#185FA5,#3B82C4)' }}>
          <Sparkles size={14} />相談文をつくる
        </button>

        {aiOpen && (
          <div className="mt-3 border border-border-card rounded-lg p-3 bg-surface-secondary">
            <textarea readOnly value={aiText}
              className="w-full h-44 text-[11px] leading-relaxed bg-surface border border-border-card rounded-lg p-2 resize-none outline-none text-text-primary" />
            <div className="flex gap-2 mt-2">
              <button type="button" onClick={copyAI}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] bg-primary text-white">
                <Copy size={13} />コピー
              </button>
              <button type="button" onClick={() => openChat('chatgpt')}
                className="flex-1 py-2 rounded-lg text-[12px] border border-border-card text-text-secondary hover:bg-surface">ChatGPTで開く</button>
              <button type="button" onClick={() => openChat('claude')}
                className="flex-1 py-2 rounded-lg text-[12px] border border-border-card text-text-secondary hover:bg-surface">Claudeで開く</button>
            </div>
            <button type="button" onClick={() => setAiOpen(false)} className="w-full text-[11px] text-text-tertiary mt-2">閉じる</button>
          </div>
        )}
      </section>
    </div>
  )
}

function Banner({ children, ok }: { children: React.ReactNode; ok?: boolean }) {
  return (
    <div className={`flex items-center gap-2 mb-3 p-2 rounded-lg ${ok ? 'bg-done-bg' : 'bg-waiting-bg'}`}>
      {ok ? <Check size={14} className="text-done" /> : <AlertTriangle size={14} className="text-waiting" />}
      <span className={`text-[12px] ${ok ? 'text-done' : 'text-waiting'}`}>{children}</span>
    </div>
  )
}
