import { useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { BookOpen, FileText, Video, Users, Mic, Package, MessageSquare, Star, PenLine, ChevronDown, ChevronUp, Image } from 'lucide-react'
import type { Output, Input } from '@/lib/types'
import { INPUT_TYPE_LABELS, OUTPUT_TYPE_LABELS, SELF_SCORE_CRITERIA } from '@/lib/types'

const INPUT_ICONS: Record<string, typeof BookOpen> = {
  book: BookOpen, article: FileText, video: Video, dialogue: Users, other: FileText,
}

const OUTPUT_ICONS: Record<string, typeof Mic> = {
  article: FileText, speech: Mic, product: Package, post: MessageSquare, other: FileText,
}

/* ── Section 1: IN / OUT ── */

type IOTab = 'all' | 'input' | 'output'
const IO_TABS: { key: IOTab; label: string }[] = [
  { key: 'all', label: 'すべて' },
  { key: 'input', label: 'INPUT' },
  { key: 'output', label: 'OUTPUT' },
]

/* ── Section 2: 自己採点/フィードバック記録 ── */

type ScoreTab = 'all' | 'self' | 'feedback'
const SCORE_TABS: { key: ScoreTab; label: string }[] = [
  { key: 'all', label: 'すべて' },
  { key: 'self', label: '自己採点' },
  { key: 'feedback', label: 'フィードバック' },
]

interface RecordsSectionProps {
  inputs: Input[]
  outputs: Output[]
  onSelectOutput: (output: Output) => void
}

export function RecordsSection({ inputs, outputs, onSelectOutput }: RecordsSectionProps) {
  const [activeIOTab, setActiveIOTab] = useState<IOTab | null>(null)
  const [activeScoreTab, setActiveScoreTab] = useState<ScoreTab | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const inputCount = inputs.length
  const outputCount = outputs.length
  const scoredOutputs = outputs.filter((o) => o.self_score > 0)
  const selfCount = scoredOutputs.length
  const reviewedOutputs = outputs.filter((o) => o.peer_score != null)
  const feedbackCount = reviewedOutputs.length

  /* ── 自己 vs 他者 比較 ── */
  const avgSelf = reviewedOutputs.length > 0
    ? reviewedOutputs.reduce((s, o) => s + o.self_score, 0) / reviewedOutputs.length
    : null
  const avgPeer = reviewedOutputs.length > 0
    ? reviewedOutputs.reduce((s, o) => s + (o.peer_score ?? 0), 0) / reviewedOutputs.length
    : null
  const gap = avgSelf != null && avgPeer != null ? avgSelf - avgPeer : null

  /* ── IO items ── */
  type IOItem = { kind: 'input'; data: Input; at: string } | { kind: 'output'; data: Output; at: string }
  const ioItems: IOItem[] = [
    ...inputs.map((i): IOItem => ({ kind: 'input', data: i, at: i.created_at })),
    ...outputs.map((o): IOItem => ({ kind: 'output', data: o, at: o.created_at })),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())

  const filteredIO = ioItems.filter((item) => {
    if (activeIOTab === 'all') return true
    return item.kind === activeIOTab
  })

  /* ── Score items ── */
  type ScoreItem = { kind: 'self'; data: Output; at: string } | { kind: 'feedback'; data: Output; at: string }
  const scoreItems: ScoreItem[] = [
    ...scoredOutputs.map((o): ScoreItem => ({ kind: 'self', data: o, at: o.scored_at ?? o.created_at })),
    ...reviewedOutputs.map((o): ScoreItem => ({ kind: 'feedback', data: o, at: o.peer_scored_at! })),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())

  const filteredScore = scoreItems.filter((item) => {
    if (activeScoreTab === 'all') return true
    return item.kind === activeScoreTab
  })

  const handleIOTabClick = (key: IOTab) => {
    if (activeIOTab === key) {
      setActiveIOTab(null)
      setExpandedId(null)
    } else {
      setActiveIOTab(key)
    }
  }

  const handleScoreTabClick = (key: ScoreTab) => {
    if (activeScoreTab === key) {
      setActiveScoreTab(null)
      setExpandedId(null)
    } else {
      setActiveScoreTab(key)
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <>
      {/* ── Section 1: IN / OUT 記録 ── */}
      <section className="mx-4 mt-6 border border-border-card rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">IN / OUT 記録</h2>
          <div className="flex items-center gap-2 text-[11px] text-text-tertiary">
            <span>IN {inputCount}</span>
            <span>OUT {outputCount}</span>
          </div>
        </div>

        <div className="flex gap-1">
          {IO_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => handleIOTabClick(t.key)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1 ${
                activeIOTab === t.key
                  ? 'bg-primary text-white'
                  : 'bg-surface-secondary text-text-secondary hover:bg-surface'
              }`}
            >
              {t.label}
              {activeIOTab === t.key ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            </button>
          ))}
        </div>

        {activeIOTab !== null && (
          <div className="space-y-0.5 mt-3">
            {filteredIO.length === 0 && (
              <p className="text-sm text-text-tertiary text-center py-4">まだ記録がありません</p>
            )}
            {filteredIO.map((item, i) => {
              if (item.kind === 'input') {
                const input = item.data as Input
                const Icon = INPUT_ICONS[input.type] ?? FileText
                const itemId = `in-${input.id}`
                const isExpanded = expandedId === itemId
                return (
                  <div key={`${itemId}-${i}`}>
                    <button
                      onClick={() => toggleExpand(itemId)}
                      className="w-full flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-surface-secondary transition-colors text-left"
                    >
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
                        {isExpanded ? <ChevronUp size={12} className="text-text-tertiary" /> : <ChevronDown size={12} className="text-text-tertiary" />}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="ml-11 mr-2 mb-2 bg-surface-secondary rounded-lg p-3 space-y-2">
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
                        <div className="text-[11px] text-text-tertiary">
                          {format(new Date(input.created_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              }
              const output = item.data as Output
              const Icon = OUTPUT_ICONS[output.type] ?? FileText
              const itemId = `out-${output.id}`
              const isExpanded = expandedId === itemId
              return (
                <div key={`${itemId}-${i}`}>
                  <button
                    onClick={() => toggleExpand(itemId)}
                    className="w-full flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-surface-secondary transition-colors text-left"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary-bg flex items-center justify-center shrink-0">
                      <Icon size={13} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{output.title}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] px-1 py-0.5 rounded bg-waiting-bg text-waiting font-medium">OUT</span>
                        <span className="text-[11px] text-text-tertiary">{OUTPUT_TYPE_LABELS[output.type]}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] text-text-tertiary">
                        {formatDistanceToNow(new Date(output.created_at), { locale: ja, addSuffix: false })}
                      </span>
                      {isExpanded ? <ChevronUp size={12} className="text-text-tertiary" /> : <ChevronDown size={12} className="text-text-tertiary" />}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="ml-11 mr-2 mb-2 bg-surface-secondary rounded-lg p-3 space-y-2">
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
                          <Image size={12} />
                          <span>図式・資料あり</span>
                        </div>
                      )}
                      {output.memo && (
                        <div className="text-[12px]">
                          <span className="text-text-tertiary">メモ</span>
                          <p className="text-text-primary mt-0.5">{output.memo}</p>
                        </div>
                      )}
                      <div className="text-[11px] text-text-tertiary">
                        {format(new Date(output.created_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                      </div>
                      <button
                        onClick={() => onSelectOutput(output)}
                        className="text-[11px] text-primary hover:underline"
                      >
                        詳細を見る
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── Section 2: 自己採点/フィードバック記録 ── */}
      <section className="mx-4 mt-4 border border-border-card rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">自己採点/フィードバック記録</h2>
          <div className="flex items-center gap-2 text-[11px] text-text-tertiary">
            <span>自己 {selfCount}件</span>
            <span>FB {feedbackCount}件</span>
          </div>
        </div>

        <div className="flex gap-1">
          {SCORE_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => handleScoreTabClick(t.key)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1 ${
                activeScoreTab === t.key
                  ? 'bg-primary text-white'
                  : 'bg-surface-secondary text-text-secondary hover:bg-surface'
              }`}
            >
              {t.label}
              {activeScoreTab === t.key ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            </button>
          ))}
        </div>

        {activeScoreTab !== null && (
          <>
            {/* 自己 vs 他者 比較カード */}
            {avgSelf != null && avgPeer != null && gap != null && (
              <div className="bg-surface-secondary rounded-lg p-3 mt-3">
                <p className="text-[11px] text-text-tertiary mb-2">他者との比較（採点済み{reviewedOutputs.length}件）</p>
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex-1 text-center">
                    <p className="text-[10px] text-text-tertiary">自己採点</p>
                    <p className="text-lg font-bold text-waiting">{avgSelf.toFixed(1)}</p>
                  </div>
                  <div className="text-text-tertiary text-sm">vs</div>
                  <div className="flex-1 text-center">
                    <p className="text-[10px] text-text-tertiary">他者採点</p>
                    <p className="text-lg font-bold text-done">{avgPeer.toFixed(1)}</p>
                  </div>
                </div>
                <div className="space-y-1 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-tertiary w-6">自己</span>
                    <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-waiting" style={{ width: `${(avgSelf / 10) * 100}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-tertiary w-6">他者</span>
                    <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-done" style={{ width: `${(avgPeer / 10) * 100}%` }} />
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-center font-medium">
                  {Math.abs(gap) < 0.3 ? (
                    <span className="text-done">自己評価と他者評価がほぼ一致しています</span>
                  ) : gap > 0 ? (
                    <span className="text-waiting">自己評価が他者より{gap.toFixed(1)}点高め（甘め）</span>
                  ) : (
                    <span className="text-primary">自己評価が他者より{Math.abs(gap).toFixed(1)}点低め（辛め）</span>
                  )}
                </p>
              </div>
            )}

            <div className="space-y-0.5 mt-3">
              {filteredScore.length === 0 && (
                <p className="text-sm text-text-tertiary text-center py-4">まだ採点がありません</p>
              )}
              {filteredScore.map((item, i) => {
                if (item.kind === 'self') {
                  const output = item.data
                  const detail = output.self_score_detail
                  const itemId = `self-${output.id}`
                  const isExpanded = expandedId === itemId
                  return (
                    <div key={`${itemId}-${i}`}>
                      <button
                        onClick={() => toggleExpand(itemId)}
                        className="w-full flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-surface-secondary transition-colors text-left"
                      >
                        <div className="w-7 h-7 rounded-full bg-waiting-bg flex items-center justify-center shrink-0">
                          <PenLine size={13} className="text-waiting" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{output.title}</p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-text-secondary">自己 {output.self_score.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[11px] text-text-tertiary">
                            {formatDistanceToNow(new Date(output.scored_at ?? output.created_at), { locale: ja, addSuffix: false })}
                          </span>
                          {isExpanded ? <ChevronUp size={12} className="text-text-tertiary" /> : <ChevronDown size={12} className="text-text-tertiary" />}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="ml-11 mr-2 mb-2 bg-surface-secondary rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between text-[12px]">
                            <span className="text-text-tertiary">総合スコア</span>
                            <span className="text-primary font-bold text-base">{output.self_score.toFixed(1)}</span>
                          </div>
                          {detail && (
                            <div className="space-y-1.5">
                              {SELF_SCORE_CRITERIA.map((c) => (
                                <div key={c.key} className="flex items-center gap-2">
                                  <span className="text-[11px] text-text-tertiary w-14">{c.label}</span>
                                  <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
                                    <div className="h-full rounded-full bg-waiting" style={{ width: `${(detail[c.key] / 10) * 100}%` }} />
                                  </div>
                                  <span className="text-[11px] text-text-secondary w-6 text-right">{detail[c.key].toFixed(1)}</span>
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
                          <button
                            onClick={() => onSelectOutput(output)}
                            className="text-[11px] text-primary hover:underline"
                          >
                            詳細を見る
                          </button>
                        </div>
                      )}
                    </div>
                  )
                }

                // feedback
                const output = item.data
                const itemId = `fb-${output.id}`
                const isExpanded = expandedId === itemId
                return (
                  <div key={`${itemId}-${i}`}>
                    <button
                      onClick={() => toggleExpand(itemId)}
                      className="w-full flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-surface-secondary transition-colors text-left"
                    >
                      <div className="w-7 h-7 rounded-full bg-done-bg flex items-center justify-center shrink-0">
                        <Star size={13} className="text-done" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{output.title}</p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-text-secondary">
                            自己 {output.self_score.toFixed(1)} → 他者 {output.peer_score?.toFixed(1)}
                          </span>
                          <span className={`text-[11px] font-medium ${(output.peer_score ?? 0) >= output.self_score ? 'text-done' : 'text-waiting'}`}>
                            ({(output.peer_score ?? 0) > output.self_score ? '+' : ''}{((output.peer_score ?? 0) - output.self_score).toFixed(1)})
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[11px] text-text-tertiary">
                          {formatDistanceToNow(new Date(output.peer_scored_at!), { locale: ja, addSuffix: false })}
                        </span>
                        {isExpanded ? <ChevronUp size={12} className="text-text-tertiary" /> : <ChevronDown size={12} className="text-text-tertiary" />}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="ml-11 mr-2 mb-2 bg-surface-secondary rounded-lg p-3 space-y-2">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-text-tertiary w-6">自己</span>
                            <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-waiting" style={{ width: `${(output.self_score / 10) * 100}%` }} />
                            </div>
                            <span className="text-[11px] text-text-secondary w-6 text-right">{output.self_score.toFixed(1)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-text-tertiary w-6">他者</span>
                            <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-done" style={{ width: `${((output.peer_score ?? 0) / 10) * 100}%` }} />
                            </div>
                            <span className="text-[11px] text-text-secondary w-6 text-right">{output.peer_score?.toFixed(1)}</span>
                          </div>
                        </div>
                        {output.self_score_detail && (
                          <div className="space-y-1">
                            <p className="text-[11px] text-text-tertiary font-medium">観点別</p>
                            {SELF_SCORE_CRITERIA.map((c) => (
                              <div key={c.key} className="flex items-center gap-2 text-[11px]">
                                <span className="text-text-tertiary w-14">{c.label}</span>
                                <span className="text-text-secondary">{output.self_score_detail![c.key].toFixed(1)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {output.peer_note && (
                          <div className="text-[12px]">
                            <span className="text-text-tertiary">他者コメント</span>
                            <p className="text-done mt-0.5">{output.peer_note}</p>
                          </div>
                        )}
                        {output.peer_scored_at && (
                          <div className="text-[11px] text-text-tertiary">
                            評価日: {format(new Date(output.peer_scored_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                          </div>
                        )}
                        <button
                          onClick={() => onSelectOutput(output)}
                          className="text-[11px] text-primary hover:underline"
                        >
                          詳細を見る
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </section>
    </>
  )
}
