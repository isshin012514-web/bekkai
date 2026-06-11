import { useState, useEffect } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import {
  BookOpen, FileText, Video, Users, Mic, Package, MessageSquare,
  Star, ChevronDown, ChevronUp, Image, Download, Trash2,
  AlignLeft, PenLine, MessageCircle, ArrowRight, Share2,
} from 'lucide-react'
import type { Output, Input } from '@/lib/types'
import { INPUT_TYPE_LABELS, OUTPUT_TYPE_LABELS, SELF_SCORE_CRITERIA } from '@/lib/types'
import { useGrowthStore } from '@/stores/growth-store'

const INPUT_ICONS: Record<string, typeof BookOpen> = {
  book: BookOpen, article: FileText, video: Video, dialogue: Users, other: FileText,
}
const OUTPUT_ICONS: Record<string, typeof Mic> = {
  article: FileText, speech: Mic, product: Package, post: MessageSquare, other: FileText,
}

type ListTab = 'all' | 'output' | 'input' | 'key'
const LIST_TABS: { key: ListTab; label: string }[] = [
  { key: 'all',    label: 'すべて' },
  { key: 'output', label: 'OUT' },
  { key: 'input',  label: 'IN' },
  { key: 'key',    label: '★ 重要' },
]

type DetailTab = 'detail' | 'self' | 'fb'

interface RecordsSectionProps {
  inputs: Input[]
  outputs: Output[]
  onSelectOutput: (output: Output) => void
  onOutputFromInput?: (inputId: string) => void
  onRequestReview?: (outputId: string) => void
}

function AttachmentsDisplay({ attachments }: { attachments: NonNullable<Input['attachments']> }) {
  if (attachments.length === 0) return null
  return (
    <div>
      <p className="text-[11px] text-text-tertiary mb-1.5">添付ファイル</p>
      <div className="flex flex-wrap gap-2">
        {attachments.map((a) =>
          a.mime.startsWith('image/') ? (
            <img key={a.id} src={a.data} alt={a.name} className="w-20 h-20 object-cover rounded-lg border border-border-card" />
          ) : (
            <a key={a.id} href={a.data} download={a.name}
              className="flex items-center gap-1 px-2 py-1 rounded-lg border border-border-card text-[11px] text-text-secondary hover:bg-surface-secondary">
              <Download size={11} />
              {a.name.length > 16 ? a.name.slice(0, 16) + '…' : a.name}
            </a>
          )
        )}
      </div>
    </div>
  )
}

function DeleteConfirm({ onConfirm, onCancel, label }: { onConfirm: () => void; onCancel: () => void; label: string }) {
  return (
    <div className="flex items-center gap-2 pt-2 border-t border-border-card mt-1">
      <span className="text-[11px] text-text-tertiary flex-1">{label}</span>
      <button onClick={onConfirm} className="px-2.5 py-1 bg-red-500 text-white rounded text-[11px] font-medium">削除</button>
      <button onClick={onCancel} className="px-2.5 py-1 border border-border-card rounded text-[11px] text-text-secondary">キャンセル</button>
    </div>
  )
}

// ── レーダーチャート ──
function RadarChart({ self, peer }: { self: { [k: string]: number }; peer: { [k: string]: number } }) {
  const keys = SELF_SCORE_CRITERIA.map((c) => c.key)
  const labels = SELF_SCORE_CRITERIA.map((c) => c.label)
  const n = keys.length
  const cx = 80, cy = 80, r = 60
  const angles = keys.map((_, i) => (Math.PI * 2 * i) / n - Math.PI / 2)

  const point = (val: number, idx: number) => {
    const ratio = Math.min(val, 10) / 10
    return {
      x: cx + r * ratio * Math.cos(angles[idx]),
      y: cy + r * ratio * Math.sin(angles[idx]),
    }
  }
  const toPath = (scores: Record<string, number>) =>
    keys.map((k, i) => point(scores[k] ?? 0, i)).map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z'

  const grids = [0.25, 0.5, 0.75, 1]

  return (
    <svg viewBox="0 0 160 160" className="w-full max-w-[200px] mx-auto">
      {/* グリッド */}
      {grids.map((g) => (
        <polygon key={g}
          points={angles.map((a) => `${(cx + r * g * Math.cos(a)).toFixed(1)},${(cy + r * g * Math.sin(a)).toFixed(1)}`).join(' ')}
          fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
      ))}
      {/* 軸 */}
      {angles.map((a, i) => (
        <line key={i} x1={cx} y1={cy} x2={(cx + r * Math.cos(a)).toFixed(1)} y2={(cy + r * Math.sin(a)).toFixed(1)}
          stroke="#e2e8f0" strokeWidth="0.8" />
      ))}
      {/* 他者（緑） */}
      <path d={toPath(peer)} fill="rgba(34,197,94,0.15)" stroke="rgb(34,197,94)" strokeWidth="1.5" />
      {/* 自己（青） */}
      <path d={toPath(self)} fill="rgba(59,130,246,0.15)" stroke="rgb(59,130,246)" strokeWidth="1.5" />
      {/* ラベル */}
      {labels.map((label, i) => {
        const lx = cx + (r + 14) * Math.cos(angles[i])
        const ly = cy + (r + 14) * Math.sin(angles[i])
        return (
          <text key={i} x={lx.toFixed(1)} y={ly.toFixed(1)}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="7" fill="#64748b">{label}</text>
        )
      })}
    </svg>
  )
}

// ── 詳細タブ切替ボタン ──
function DetailTabBar({
  itemId, dTab, setDetailTab, hasSelf, hasFb, selfScore, peerScore,
}: {
  itemId: string
  dTab: DetailTab
  setDetailTab: (id: string, t: DetailTab) => void
  hasSelf: boolean
  hasFb: boolean
  selfScore: number
  peerScore: number | null | undefined
}) {
  const tabs: { key: DetailTab; icon: typeof AlignLeft; label: string; has: boolean; score?: string }[] = [
    { key: 'detail', icon: AlignLeft,      label: '詳細',    has: true },
    { key: 'self',   icon: PenLine,        label: '自己採点', has: hasSelf, score: hasSelf ? selfScore.toFixed(1) : undefined },
    { key: 'fb',     icon: MessageCircle,  label: 'FB',      has: hasFb,   score: hasFb ? peerScore?.toFixed(1) : undefined },
  ]
  return (
    <div className="flex gap-1.5 p-2 bg-surface border-b border-border-card">
      {tabs.map((t) => {
        const active = dTab === t.key
        const Icon = t.icon
        return (
          <button
            key={t.key}
            onClick={() => setDetailTab(itemId, t.key)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
              active
                ? 'bg-primary text-white shadow-sm'
                : t.has
                  ? 'bg-surface-secondary text-text-secondary hover:bg-surface'
                  : 'bg-surface-secondary text-text-tertiary opacity-40'
            }`}
          >
            <Icon size={13} />
            <span>{t.label}</span>
            {t.score && (
              <span className={`text-[9px] font-bold leading-none ${active ? 'text-white/80' : 'text-primary'}`}>
                {t.score}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export function RecordsSection({ inputs, outputs, onSelectOutput, onOutputFromInput, onRequestReview }: RecordsSectionProps) {
  const { updateInput, updateOutput, deleteInput, deleteOutput } = useGrowthStore()
  const [open, setOpen] = useState(false)
  const [listTab, setListTab] = useState<ListTab>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [detailTabs, setDetailTabs] = useState<Record<string, DetailTab>>({})
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!toastMsg) return
    const t = setTimeout(() => setToastMsg(null), 2000)
    return () => clearTimeout(t)
  }, [toastMsg])

  const showToast = (msg: string) => setToastMsg(msg)
  const toggleExpand = (id: string) => { setExpandedId((p) => p === id ? null : id); setConfirmDeleteId(null) }
  const getDetailTab = (id: string): DetailTab => detailTabs[id] ?? 'detail'
  const setDetailTab = (id: string, tab: DetailTab) => setDetailTabs((p) => ({ ...p, [id]: tab }))
  const toggleInputKey  = (i: Input)  => updateInput(i.id,  { is_key: !i.is_key })
  const toggleOutputKey = (o: Output) => updateOutput(o.id, { is_key: !o.is_key })

  const scoredOutputs   = outputs.filter((o) => o.self_score > 0)
  const reviewedOutputs = outputs.filter((o) => o.peer_score != null)

  type ListItem = { kind: 'input'; data: Input; at: string } | { kind: 'output'; data: Output; at: string }
  const allItems: ListItem[] = [
    ...inputs.map((i): ListItem  => ({ kind: 'input',  data: i, at: i.created_at })),
    ...outputs.map((o): ListItem => ({ kind: 'output', data: o, at: o.created_at })),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())

  const filtered = allItems.filter((item) => {
    if (listTab === 'all')    return true
    if (listTab === 'output') return item.kind === 'output'
    if (listTab === 'input')  return item.kind === 'input'
    if (listTab === 'key')    return item.data.is_key === true
    return true
  })

  return (
    <>
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white text-[12px] px-4 py-2 rounded-full shadow-lg pointer-events-none">
          {toastMsg}
        </div>
      )}

      <section className="mx-4 mt-6 border border-border-card rounded-lg">
        <button
          onClick={() => { setOpen(!open); setExpandedId(null) }}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium">記録</h2>
            <div className="flex items-center gap-1.5 text-[11px] text-text-tertiary">
              <span>IN {inputs.length}</span>
              <span>OUT {outputs.length}</span>
              <span>採点 {scoredOutputs.length}</span>
              <span>FB {reviewedOutputs.length}</span>
            </div>
          </div>
          {open ? <ChevronUp size={16} className="text-text-tertiary" /> : <ChevronDown size={16} className="text-text-tertiary" />}
        </button>

        {open && (
          <div className="px-4 pb-4">
            {/* リストタブ */}
            <div className="flex gap-1 mb-3">
              {LIST_TABS.map((t) => (
                <button key={t.key} onClick={() => setListTab(t.key)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                    listTab === t.key
                      ? t.key === 'key' ? 'bg-amber-400 text-white' : 'bg-primary text-white'
                      : 'bg-surface-secondary text-text-secondary hover:bg-surface'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="space-y-0.5">
              {filtered.length === 0 && (
                <p className="text-sm text-text-tertiary text-center py-6">
                  {allItems.length === 0 ? 'まだ記録がありません' : '該当する記録がありません'}
                </p>
              )}

              {filtered.map((item, i) => {
                // ── INPUT ──
                if (item.kind === 'input') {
                  const input = item.data as Input
                  const Icon = INPUT_ICONS[input.type] ?? FileText
                  const itemId = `in-${input.id}`
                  const isExp = expandedId === itemId
                  return (
                    <div key={`${itemId}-${i}`}>
                      <div className="flex items-center gap-1">
                        <button onClick={() => toggleExpand(itemId)}
                          className="flex-1 flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-surface-secondary transition-colors text-left">
                          <div className="w-7 h-7 rounded-full bg-primary-bg flex items-center justify-center shrink-0">
                            <Icon size={13} className="text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{input.title}</p>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] px-1 py-0.5 rounded bg-primary-bg text-primary font-medium">IN</span>
                              <span className="text-[11px] text-text-tertiary">{INPUT_TYPE_LABELS[input.type]}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[11px] text-text-tertiary">
                              {formatDistanceToNow(new Date(input.created_at), { locale: ja, addSuffix: false })}
                            </span>
                            {isExp ? <ChevronUp size={12} className="text-text-tertiary" /> : <ChevronDown size={12} className="text-text-tertiary" />}
                          </div>
                        </button>
                        <button onClick={() => toggleInputKey(input)} className="p-1.5 shrink-0" title="重要">
                          <Star size={15} className={input.is_key ? 'fill-amber-400 text-amber-400' : 'text-text-tertiary'} />
                        </button>
                      </div>
                      {isExp && (
                        <div className="ml-11 mr-2 mb-2 bg-surface-secondary border border-border-card rounded-lg p-3 space-y-2">
                          <div className="flex items-center gap-3 text-[12px]">
                            <span className="text-text-tertiary">種別</span>
                            <span className="text-text-primary">{INPUT_TYPE_LABELS[input.type]}</span>
                          </div>
                          {input.learning && (
                            <div className="text-[12px]">
                              <span className="text-text-tertiary">学び・メモ</span>
                              <p className="text-text-primary mt-0.5">{input.learning}</p>
                            </div>
                          )}
                          {input.attachments && input.attachments.length > 0 && <AttachmentsDisplay attachments={input.attachments} />}
                          <div className="text-[11px] text-text-tertiary">
                            {format(new Date(input.created_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                          </div>
                          {onOutputFromInput && (
                            <button onClick={() => onOutputFromInput(input.id)}
                              className="flex items-center gap-1.5 text-[11px] text-primary hover:underline font-medium">
                              <ArrowRight size={12} />このインプットからアウトプット作成
                            </button>
                          )}
                          {confirmDeleteId === itemId
                            ? <DeleteConfirm label="削除しますか？"
                                onConfirm={() => { deleteInput(input.id); setConfirmDeleteId(null); setExpandedId(null); showToast('削除しました') }}
                                onCancel={() => setConfirmDeleteId(null)} />
                            : <button onClick={() => setConfirmDeleteId(itemId)} className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-600">
                                <Trash2 size={11} />削除
                              </button>
                          }
                        </div>
                      )}
                    </div>
                  )
                }

                // ── OUTPUT ──
                const output = item.data as Output
                const Icon = OUTPUT_ICONS[output.type] ?? FileText
                const itemId = `out-${output.id}`
                const isExp = expandedId === itemId
                const dTab = getDetailTab(itemId)
                const hasSelf = output.self_score > 0
                const hasFb   = output.peer_score != null

                return (
                  <div key={`${itemId}-${i}`}>
                    {/* 行 */}
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleExpand(itemId)}
                        className="flex-1 flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-surface-secondary transition-colors text-left">
                        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <Icon size={13} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{output.title}</p>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] text-text-tertiary">{OUTPUT_TYPE_LABELS[output.type]}</span>
                            {hasSelf && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface border border-border-card text-text-secondary">自己 {output.self_score.toFixed(1)}</span>}
                            {hasFb   && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-done-bg border border-done/30 text-done">FB {output.peer_score?.toFixed(1)}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[11px] text-text-tertiary">
                            {formatDistanceToNow(new Date(output.created_at), { locale: ja, addSuffix: false })}
                          </span>
                          {isExp ? <ChevronUp size={12} className="text-text-tertiary" /> : <ChevronDown size={12} className="text-text-tertiary" />}
                        </div>
                      </button>
                      <button onClick={() => toggleOutputKey(output)} className="p-1.5 shrink-0" title="重要">
                        <Star size={15} className={output.is_key ? 'fill-amber-400 text-amber-400' : 'text-text-tertiary'} />
                      </button>
                    </div>

                    {/* 展開 */}
                    {isExp && (
                      <div className="ml-11 mr-2 mb-2 border border-border-card rounded-lg overflow-hidden">
                        {/* タブバー */}
                        <DetailTabBar
                          itemId={itemId} dTab={dTab} setDetailTab={setDetailTab}
                          hasSelf={hasSelf} hasFb={hasFb}
                          selfScore={output.self_score} peerScore={output.peer_score}
                        />

                        <div className="p-3 space-y-2 bg-surface-secondary">
                          {/* ── 詳細 ── */}
                          {dTab === 'detail' && (
                            <>
                              <div className="flex items-center gap-3 text-[12px]">
                                <span className="text-text-tertiary">種別</span>
                                <span className="text-text-primary">{OUTPUT_TYPE_LABELS[output.type]}</span>
                              </div>
                              {output.audience && (
                                <div className="flex items-center gap-3 text-[12px]">
                                  <span className="text-text-tertiary">対象</span>
                                  <span className="text-text-primary">{output.audience}</span>
                                </div>
                              )}
                              {output.audience_reaction && (
                                <div className="text-[12px]">
                                  <span className="text-text-tertiary">聴衆の反応</span>
                                  <p className="text-text-primary mt-0.5">{output.audience_reaction}</p>
                                </div>
                              )}
                              {output.has_visuals && (
                                <div className="flex items-center gap-1.5 text-[12px] text-text-secondary">
                                  <Image size={12} /><span>図式・資料あり</span>
                                </div>
                              )}
                              {output.memo && (
                                <div className="text-[12px]">
                                  <span className="text-text-tertiary">メモ</span>
                                  <p className="text-text-primary mt-0.5">{output.memo}</p>
                                </div>
                              )}
                              {output.attachments && output.attachments.length > 0 && (
                                <AttachmentsDisplay attachments={output.attachments} />
                              )}
                              <div className="text-[11px] text-text-tertiary">
                                {format(new Date(output.created_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                              </div>
                              <div className="flex items-center gap-3">
                                <button onClick={() => onSelectOutput(output)} className="text-[11px] text-primary hover:underline">
                                  詳細を見る
                                </button>
                                {output.peer_score == null && onRequestReview && (
                                  <button
                                    onClick={() => onRequestReview(output.id)}
                                    className="flex items-center gap-1 text-[11px] text-text-secondary hover:text-primary transition-colors"
                                  >
                                    <Share2 size={11} />
                                    採点依頼
                                  </button>
                                )}
                              </div>
                              {confirmDeleteId === itemId
                                ? <DeleteConfirm label="削除しますか？"
                                    onConfirm={() => { deleteOutput(output.id); setConfirmDeleteId(null); setExpandedId(null); showToast('削除しました') }}
                                    onCancel={() => setConfirmDeleteId(null)} />
                                : <button onClick={() => setConfirmDeleteId(itemId)} className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-600">
                                    <Trash2 size={11} />削除
                                  </button>
                              }
                            </>
                          )}

                          {/* ── 自己採点 ── */}
                          {dTab === 'self' && (
                            hasSelf ? (
                              <>
                                <div className="flex items-center justify-between">
                                  <span className="text-[12px] text-text-tertiary">総合スコア</span>
                                  <span className="text-primary font-bold text-xl">{output.self_score.toFixed(1)}</span>
                                </div>
                                {output.self_score_detail && (
                                  <div className="space-y-1.5">
                                    {SELF_SCORE_CRITERIA.map((c) => (
                                      <div key={c.key} className="flex items-center gap-2">
                                        <span className="text-[11px] text-text-tertiary w-14">{c.label}</span>
                                        <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
                                          <div className="h-full rounded-full bg-waiting" style={{ width: `${(output.self_score_detail![c.key] / 10) * 100}%` }} />
                                        </div>
                                        <span className="text-[11px] text-text-secondary w-6 text-right">{output.self_score_detail![c.key].toFixed(1)}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {output.self_good && (
                                  <div className="text-[12px]">
                                    <span className="text-text-tertiary">できたこと</span>
                                    <p className="text-text-primary mt-0.5">{output.self_good}</p>
                                  </div>
                                )}
                                {output.self_improve && (
                                  <div className="text-[12px]">
                                    <span className="text-text-tertiary">できなかったこと</span>
                                    <p className="text-text-primary mt-0.5">{output.self_improve}</p>
                                  </div>
                                )}
                                {output.scored_at && (
                                  <div className="text-[11px] text-text-tertiary">
                                    採点日: {format(new Date(output.scored_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                                  </div>
                                )}
                                {confirmDeleteId === `self-${output.id}`
                                  ? <DeleteConfirm label="採点を削除しますか？"
                                      onConfirm={() => {
                                        updateOutput(output.id, { self_score: 0, self_score_detail: undefined, self_good: undefined, self_improve: undefined, scored_at: undefined })
                                        setConfirmDeleteId(null); showToast('採点を削除しました')
                                      }}
                                      onCancel={() => setConfirmDeleteId(null)} />
                                  : <button onClick={() => setConfirmDeleteId(`self-${output.id}`)} className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-600">
                                      <Trash2 size={11} />採点を削除
                                    </button>
                                }
                              </>
                            ) : (
                              <div className="text-center py-4">
                                <p className="text-[12px] text-text-tertiary">まだ自己採点がありません</p>
                              </div>
                            )
                          )}

                          {/* ── FB ── */}
                          {dTab === 'fb' && (
                            hasFb ? (
                              <>
                                {/* 総合スコア比較 */}
                                <div className="flex items-center justify-center gap-6 py-1">
                                  <div className="text-center">
                                    <p className="text-[10px] text-text-tertiary">自己</p>
                                    <p className="text-xl font-bold text-blue-500">{output.self_score.toFixed(1)}</p>
                                  </div>
                                  <div className="text-text-tertiary text-sm">vs</div>
                                  <div className="text-center">
                                    <p className="text-[10px] text-text-tertiary">他者</p>
                                    <p className="text-xl font-bold text-green-500">{output.peer_score?.toFixed(1)}</p>
                                  </div>
                                </div>
                                {/* レーダーチャート */}
                                {output.self_score_detail && output.peer_score_detail && (
                                  <>
                                    <RadarChart self={output.self_score_detail as unknown as {[k:string]:number}} peer={output.peer_score_detail as unknown as {[k:string]:number}} />
                                    <div className="flex items-center justify-center gap-4 text-[10px]">
                                      <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-500 inline-block rounded" />自己</span>
                                      <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-green-500 inline-block rounded" />他者</span>
                                    </div>
                                  </>
                                )}
                                {output.peer_note && (
                                  <div className="text-[12px]">
                                    <span className="text-text-tertiary">コメント</span>
                                    <p className="text-done mt-0.5">{output.peer_note}</p>
                                  </div>
                                )}
                                {output.peer_scored_at && (
                                  <div className="text-[11px] text-text-tertiary">
                                    評価日: {format(new Date(output.peer_scored_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                                  </div>
                                )}
                                {confirmDeleteId === `fb-${output.id}`
                                  ? <DeleteConfirm label="FBを削除しますか？"
                                      onConfirm={() => {
                                        updateOutput(output.id, { peer_score: undefined, peer_score_detail: undefined, peer_note: undefined, peer_scored_at: undefined })
                                        setConfirmDeleteId(null); showToast('フィードバックを削除しました')
                                      }}
                                      onCancel={() => setConfirmDeleteId(null)} />
                                  : <button onClick={() => setConfirmDeleteId(`fb-${output.id}`)} className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-600">
                                      <Trash2 size={11} />FBを削除
                                    </button>
                                }
                              </>
                            ) : (
                              <div className="text-center py-4">
                                <p className="text-[12px] text-text-tertiary">まだフィードバックがありません</p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </section>

    </>
  )
}
