import { useState, useEffect } from 'react'
import { Share2, Copy, Check, ClipboardPaste, X } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { useGrowthStore } from '@/stores/growth-store'
import { OUTPUT_TYPE_LABELS, SELF_SCORE_CRITERIA } from '@/lib/types'
import type { Output } from '@/lib/types'
import { nowISO } from '@/lib/utils'

type FeedbackTab = 'request' | 'enter'

interface FeedbackModalProps {
  open: boolean
  onClose: () => void
  initialTab?: FeedbackTab
  initialOutputId?: string
}

// ── 採点依頼 共有アプリ設定 ──────────────────────────────────────
const SHARE_APPS = [
  { id: 'line',     label: 'LINE',     emoji: '💬', color: 'bg-[#06C755] text-white', url: (t: string) => `https://line.me/R/share?text=${encodeURIComponent(t)}` },
  { id: 'whatsapp', label: 'WhatsApp', emoji: '📱', color: 'bg-[#25D366] text-white', url: (t: string) => `https://api.whatsapp.com/send?text=${encodeURIComponent(t)}` },
  { id: 'mail',     label: 'メール',   emoji: '✉️', color: 'bg-surface-secondary text-text-primary border border-border-card', url: (t: string) => `mailto:?subject=${encodeURIComponent('採点依頼')}&body=${encodeURIComponent(t)}` },
  { id: 'sms',      label: 'SMS',      emoji: '💌', color: 'bg-surface-secondary text-text-primary border border-border-card', url: (t: string) => `sms:?body=${encodeURIComponent(t)}` },
] as const

// ── フィードバックテキスト自動解析 ──────────────────────────────
const DEFAULT_DETAIL = { originality: 5, communication: 5, practicality: 5, audience_response: 5, completeness: 5 }
type DetailType = typeof DEFAULT_DETAIL

function parseFeedbackText(text: string): { totalScore: number | null; detail: DetailType | null; note: string } {
  const lines = text.split('\n').map((l) => l.trim())
  let totalScore: number | null = null
  for (const line of lines) {
    for (const p of [/総合[^0-9]*([0-9]+(?:\.[0-9]+)?)/, /([0-9]+(?:\.[0-9]+)?)\s*[\/／]\s*10/, /スコア[^0-9]*([0-9]+(?:\.[0-9]+)?)/]) {
      const m = line.match(p)
      if (m) { const v = parseFloat(m[1]); if (v >= 0 && v <= 10) { totalScore = v; break } }
    }
    if (totalScore !== null) break
  }
  const keyMap: Record<string, keyof DetailType> = { '独自性': 'originality', '伝達力': 'communication', '実用性': 'practicality', '聴衆': 'audience_response', '完成度': 'completeness' }
  const detail = { ...DEFAULT_DETAIL }
  let foundAny = false
  for (const line of lines) {
    for (const [ja, key] of Object.entries(keyMap)) {
      if (line.includes(ja)) { const m = line.match(/([0-9]+(?:\.[0-9]+)?)/); if (m) { const v = parseFloat(m[1]); if (v >= 0 && v <= 10) { detail[key] = v; foundAny = true } } }
    }
  }
  const noteLines: string[] = []
  let inComment = false
  for (const line of lines) {
    if (/コメント|一言|感想|メモ/.test(line)) { inComment = true; continue }
    if (inComment && line) noteLines.push(line)
    if (!inComment && line && !/^[0-9.\/]+$/.test(line) && !/採点|スコア|依頼|観点|お願い|■|【|】/.test(line) && line.length > 3) noteLines.push(line)
  }
  return { totalScore, detail: foundAny ? detail : null, note: noteLines.slice(0, 3).join('\n') }
}

// ── 採点依頼テキスト生成 ─────────────────────────────────────────
function buildShareText(output: Output): string {
  const detail = output.self_score_detail
  const detailLines = detail ? SELF_SCORE_CRITERIA.map((c) => `  ${c.label}: ${detail[c.key].toFixed(1)}`).join('\n') : ''
  return [
    '【採点依頼】', '',
    '■ アウトプット',
    `「${output.title}」（${OUTPUT_TYPE_LABELS[output.type]}）`,
    output.audience ? `対象: ${output.audience}` : null, '',
    output.self_score > 0 ? `■ 自己採点: ${output.self_score.toFixed(1)}/10` : null,
    detailLines || null,
    output.self_good ? `できたこと: ${output.self_good}` : null,
    output.self_improve ? `できなかったこと: ${output.self_improve}` : null, '',
    '■ お願いしたいこと',
    '以下の5つの観点で採点をお願いします！', '',
    ...SELF_SCORE_CRITERIA.map((c, i) => `${i + 1}. ${c.label}（0-10）\n   → ${c.hint}`), '',
    '総合スコア（0-10）と一言コメントもお願いします！',
  ].filter((l) => l !== null).join('\n')
}

// ── メインコンポーネント ─────────────────────────────────────────
export function FeedbackModal({ open, onClose, initialTab = 'request', initialOutputId }: FeedbackModalProps) {
  const { outputs, updateOutput } = useGrowthStore()
  const [tab, setTab] = useState<FeedbackTab>(initialTab)

  // ── 採点依頼 state ──
  const [reqOutputId, setReqOutputId] = useState(initialOutputId ?? '')
  const [copied, setCopied] = useState(false)

  // ── FB入力 state ──
  const [enterId, setEnterId] = useState('')
  const [peerScore, setPeerScore] = useState(5)
  const [detail, setDetail] = useState({ ...DEFAULT_DETAIL })
  const [peerNote, setPeerNote] = useState('')
  const [saved, setSaved] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [pasteMode, setPasteMode] = useState(false)

  // モーダルが開くたびに初期値をリセット
  useEffect(() => {
    if (open) {
      setTab(initialTab)
      setReqOutputId(initialOutputId ?? '')
      setCopied(false)
      setEnterId('')
      setPeerScore(5)
      setDetail({ ...DEFAULT_DETAIL })
      setPeerNote('')
      setSaved(false)
      setPasteMode(false)
      setPasteText('')
    }
  }, [open, initialTab, initialOutputId])

  const handleClose = () => { onClose() }

  // ── 採点依頼 ──
  const unreviewedOutputs = outputs.filter((o) => o.peer_score == null)
  const reqOutput = outputs.find((o) => o.id === reqOutputId)
  const shareText = reqOutput ? buildShareText(reqOutput) : ''

  const handleNativeShare = async () => {
    if (!shareText) return
    if (navigator.share) { try { await navigator.share({ title: '採点依頼', text: shareText }) } catch {} }
    else handleCopy()
  }
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(shareText); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {}
  }

  // ── FB入力 ──
  const enterTargets = outputs.filter((o) => o.self_score > 0 && o.peer_score == null)
  const enterOutput = outputs.find((o) => o.id === enterId)

  const setDetailKey = (key: keyof DetailType, val: number) => setDetail((d) => ({ ...d, [key]: val }))

  const handleParsePaste = () => {
    const result = parseFeedbackText(pasteText)
    if (result.totalScore !== null) setPeerScore(result.totalScore)
    if (result.detail) setDetail(result.detail)
    if (result.note) setPeerNote(result.note)
    setPasteMode(false); setPasteText('')
  }

  const handleSubmit = () => {
    if (!enterId) return
    updateOutput(enterId, { peer_score: peerScore, peer_score_detail: { ...detail }, peer_note: peerNote || undefined, peer_scored_at: nowISO() })
    setSaved(true)
  }

  // ── タブボタン ──
  const TabBtn = ({ t, label }: { t: FeedbackTab; label: string }) => (
    <button
      onClick={() => setTab(t)}
      className={`flex-1 py-2 text-[12px] font-medium rounded-lg transition-colors ${
        tab === t ? 'bg-primary text-white' : 'bg-surface-secondary text-text-secondary hover:bg-surface'
      }`}
    >
      {label}
    </button>
  )

  return (
    <Modal open={open} onClose={handleClose} title="フィードバック">
      <div className="space-y-4">
        {/* タブ切り替え */}
        <div className="flex gap-1.5 p-1 bg-surface-secondary rounded-lg">
          <TabBtn t="request" label="採点依頼" />
          <TabBtn t="enter"   label="FB入力" />
        </div>

        {/* ── 採点依頼タブ ── */}
        {tab === 'request' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-text-secondary mb-2">採点してもらうアウトプットを選択</label>
              {unreviewedOutputs.length === 0 ? (
                <p className="text-sm text-text-tertiary text-center py-4">未採点のアウトプットはありません</p>
              ) : (
                <div className="space-y-1.5 max-h-44 overflow-y-auto">
                  {unreviewedOutputs.map((o) => (
                    <button key={o.id} type="button" onClick={() => setReqOutputId(o.id)}
                      className={`w-full text-left rounded-lg p-2.5 border transition-colors ${reqOutputId === o.id ? 'border-primary bg-primary-bg' : 'border-border-card hover:bg-surface-secondary'}`}
                    >
                      <p className="text-sm font-medium">{o.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-text-tertiary">{OUTPUT_TYPE_LABELS[o.type]}</span>
                        {o.self_score > 0 && <span className="text-[11px] text-text-tertiary">自己 {o.self_score.toFixed(1)}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {reqOutput && (
              <>
                <div className="bg-surface-secondary rounded-lg p-3 max-h-36 overflow-y-auto">
                  <p className="text-[11px] text-text-tertiary mb-1">送信メッセージプレビュー</p>
                  <p className="text-[12px] text-text-secondary whitespace-pre-line leading-relaxed">{shareText}</p>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {SHARE_APPS.map((app) => (
                    <button key={app.id} type="button" onClick={() => window.open(app.url(shareText), '_blank', 'noopener,noreferrer')}
                      className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-[11px] font-medium transition-opacity hover:opacity-80 active:scale-95 ${app.color}`}
                    >
                      <span className="text-lg leading-none">{app.emoji}</span>
                      {app.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={handleNativeShare}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90"
                  >
                    <Share2 size={15} />その他のアプリ
                  </button>
                  <button type="button" onClick={handleCopy}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary-bg"
                  >
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                    {copied ? 'コピー済' : 'コピー'}
                  </button>
                </div>
              </>
            )}
            {!reqOutput && unreviewedOutputs.length > 0 && (
              <div className="flex gap-2 opacity-40 pointer-events-none">
                <button className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-medium"><Share2 size={15} className="inline mr-1" />送る</button>
                <button className="px-4 py-2.5 border border-primary text-primary rounded-lg text-sm font-medium"><Copy size={15} className="inline" /></button>
              </div>
            )}
          </div>
        )}

        {/* ── FB入力タブ ── */}
        {tab === 'enter' && (
          <div className="space-y-4">
            {!saved ? (
              <>
                <div>
                  <label className="block text-[12px] font-medium text-text-secondary mb-2">評価されたアウトプットを選択</label>
                  {enterTargets.length === 0 ? (
                    <p className="text-sm text-text-tertiary text-center py-4">自己採点済みのアウトプットがありません</p>
                  ) : (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {enterTargets.map((o) => (
                        <button key={o.id} type="button" onClick={() => { setEnterId(o.id); setSaved(false) }}
                          className={`w-full text-left rounded-lg p-2.5 border transition-colors ${enterId === o.id ? 'border-primary bg-primary-bg' : 'border-border-card hover:bg-surface-secondary'}`}
                        >
                          <p className="text-sm font-medium">{o.title}</p>
                          <p className="text-[11px] text-text-tertiary mt-0.5">{OUTPUT_TYPE_LABELS[o.type]}　自己 {o.self_score.toFixed(1)}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {enterOutput && (
                  <>
                    {/* テキスト自動入力 */}
                    <div className="border border-border-card rounded-lg overflow-hidden">
                      <button type="button" onClick={() => setPasteMode((v) => !v)}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-surface-secondary transition-colors"
                      >
                        <ClipboardPaste size={14} className="text-primary" />
                        <span className="text-[12px] font-medium text-primary">採点結果テキストを貼り付けて自動入力</span>
                      </button>
                      {pasteMode && (
                        <div className="border-t border-border-card p-3 space-y-2 bg-surface-secondary">
                          <p className="text-[11px] text-text-tertiary">採点依頼のフォーマットで返ってきたテキストをそのまま貼り付けてください。</p>
                          <textarea value={pasteText} onChange={(e) => setPasteText(e.target.value)} rows={4}
                            placeholder="採点結果のテキストをここに貼り付け…"
                            className="w-full px-3 py-2 border border-border-card rounded-lg text-[12px] focus:outline-none focus:border-primary resize-none bg-surface"
                          />
                          <div className="flex gap-2">
                            <button type="button" onClick={handleParsePaste} disabled={!pasteText.trim()}
                              className="flex-1 py-2 bg-primary text-white rounded-lg text-[12px] font-medium hover:opacity-90 disabled:opacity-40"
                            >自動入力する</button>
                            <button type="button" onClick={() => { setPasteMode(false); setPasteText('') }}
                              className="px-3 py-2 border border-border-card rounded-lg text-[12px] text-text-secondary hover:bg-surface"
                            ><X size={14} /></button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 総合スコア */}
                    <div>
                      <label className="block text-[12px] font-medium text-text-secondary mb-2">
                        総合スコア: <span className="text-primary font-bold text-base">{peerScore.toFixed(1)}</span>
                      </label>
                      <input type="range" min={0} max={10} step={0.5} value={peerScore}
                        onChange={(e) => setPeerScore(parseFloat(e.target.value))} className="w-full accent-primary" />
                      <div className="flex justify-between text-[10px] text-text-tertiary mt-0.5"><span>0</span><span>5</span><span>10</span></div>
                    </div>

                    {/* 観点別スコア */}
                    <div>
                      <label className="block text-[12px] font-medium text-text-secondary mb-2">観点別スコア</label>
                      <div className="space-y-3">
                        {SELF_SCORE_CRITERIA.map((c) => (
                          <div key={c.key}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[12px] text-text-secondary">{c.label}</span>
                              <span className="text-[12px] font-medium text-primary">{detail[c.key].toFixed(1)}</span>
                            </div>
                            <input type="range" min={0} max={10} step={0.5} value={detail[c.key]}
                              onChange={(e) => setDetailKey(c.key, parseFloat(e.target.value))} className="w-full accent-primary" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* コメント */}
                    <div>
                      <label className="block text-[12px] font-medium text-text-secondary mb-1">コメント（任意）</label>
                      <textarea value={peerNote} onChange={(e) => setPeerNote(e.target.value)} rows={3}
                        placeholder="もらったフィードバックのコメント…"
                        className="w-full px-3 py-2.5 border border-border-card rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none bg-surface"
                      />
                    </div>

                    <button onClick={handleSubmit}
                      className="w-full py-3 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90"
                    >フィードバックを保存</button>
                  </>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-3xl mb-2">✅</p>
                <p className="text-sm font-medium text-text-primary">保存しました</p>
                <p className="text-[12px] text-text-tertiary mt-1">記録セクションで確認できます</p>
                <button onClick={handleClose} className="mt-4 px-6 py-2 bg-surface-secondary text-text-secondary rounded-lg text-sm hover:bg-surface">閉じる</button>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
