import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { BookOpen, FileText, Video, Users, Mic, Package, MessageSquare, Star, PenLine } from 'lucide-react'
import type { Output, Input } from '@/lib/types'
import { INPUT_TYPE_LABELS, OUTPUT_TYPE_LABELS } from '@/lib/types'

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

/* ── Section 2: 自己採点/フィードバック ── */

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
  const [ioTab, setIoTab] = useState<IOTab>('all')
  const [scoreTab, setScoreTab] = useState<ScoreTab>('all')

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
    if (ioTab === 'all') return true
    return item.kind === ioTab
  }).slice(0, 6)

  /* ── Score items ── */
  type ScoreItem = { kind: 'self'; data: Output; at: string } | { kind: 'feedback'; data: Output; at: string }
  const scoreItems: ScoreItem[] = [
    ...outputs.map((o): ScoreItem => ({ kind: 'self', data: o, at: o.created_at })),
    ...outputs
      .filter((o) => o.peer_score != null && o.peer_scored_at)
      .map((o): ScoreItem => ({ kind: 'feedback', data: o, at: o.peer_scored_at! })),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())

  const filteredScore = scoreItems.filter((item) => {
    if (scoreTab === 'all') return true
    return item.kind === scoreTab
  }).slice(0, 5)

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

        <div className="flex gap-1 mb-3">
          {IO_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setIoTab(t.key)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                ioTab === t.key
                  ? 'bg-primary text-white'
                  : 'bg-surface-secondary text-text-secondary hover:bg-surface'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="space-y-0.5">
          {filteredIO.length === 0 && (
            <p className="text-sm text-text-tertiary text-center py-4">まだ記録がありません</p>
          )}
          {filteredIO.map((item, i) => {
            if (item.kind === 'input') {
              const input = item.data as Input
              const Icon = INPUT_ICONS[input.type] ?? FileText
              return (
                <div key={`in-${input.id}-${i}`} className="flex items-center gap-2.5 py-2 px-2 rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-primary-bg flex items-center justify-center shrink-0">
                    <Icon size={13} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{input.title}</p>
                    <p className="text-[11px] text-text-tertiary">{INPUT_TYPE_LABELS[input.type]}</p>
                  </div>
                  <span className="text-[11px] text-text-tertiary shrink-0">
                    {formatDistanceToNow(new Date(input.created_at), { locale: ja, addSuffix: false })}
                  </span>
                </div>
              )
            }
            const output = item.data as Output
            const Icon = OUTPUT_ICONS[output.type] ?? FileText
            return (
              <button
                key={`out-${output.id}-${i}`}
                onClick={() => onSelectOutput(output)}
                className="w-full flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-surface-secondary transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-full bg-waiting-bg flex items-center justify-center shrink-0">
                  <Icon size={13} className="text-waiting" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{output.title}</p>
                  <span className="text-[11px] text-text-secondary">{OUTPUT_TYPE_LABELS[output.type]}</span>
                </div>
                <span className="text-[11px] text-text-tertiary shrink-0">
                  {formatDistanceToNow(new Date(output.created_at), { locale: ja, addSuffix: false })}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── Section 2: 自己採点/フィードバック ── */}
      <section className="mx-4 mt-4 border border-border-card rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">自己採点/フィードバック</h2>
          <div className="flex items-center gap-2 text-[11px] text-text-tertiary">
            <span>自己 {selfCount}</span>
            <span>FB {feedbackCount}</span>
          </div>
        </div>

        <div className="flex gap-1 mb-3">
          {SCORE_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setScoreTab(t.key)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                scoreTab === t.key
                  ? 'bg-primary text-white'
                  : 'bg-surface-secondary text-text-secondary hover:bg-surface'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 自己 vs 他者 比較カード */}
        {avgSelf != null && avgPeer != null && gap != null && (
          <div className="bg-surface-secondary rounded-lg p-3 mb-3">
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
            {/* Comparison bars */}
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

        <div className="space-y-0.5">
          {filteredScore.length === 0 && (
            <p className="text-sm text-text-tertiary text-center py-4">まだ採点がありません</p>
          )}
          {filteredScore.map((item, i) => {
            if (item.kind === 'self') {
              const output = item.data
              const detail = output.self_score_detail
              return (
                <button
                  key={`self-${output.id}-${i}`}
                  onClick={() => onSelectOutput(output)}
                  className="w-full flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-surface-secondary transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-waiting-bg flex items-center justify-center shrink-0">
                    <PenLine size={13} className="text-waiting" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{output.title}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-text-secondary">自己 {output.self_score.toFixed(1)}</span>
                      {detail && (
                        <span className="text-[10px] text-text-tertiary">
                          独{detail.originality} 実{detail.practicality} 完{detail.completeness}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] text-text-tertiary shrink-0">
                    {formatDistanceToNow(new Date(output.created_at), { locale: ja, addSuffix: false })}
                  </span>
                </button>
              )
            }

            // feedback
            const output = item.data
            return (
              <button
                key={`fb-${output.id}-${i}`}
                onClick={() => onSelectOutput(output)}
                className="w-full flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-surface-secondary transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-full bg-done-bg flex items-center justify-center shrink-0">
                  <Star size={13} className="text-done" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{output.title}</p>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[11px] text-text-secondary">
                      自己 {output.self_score.toFixed(1)} → 他者 {output.peer_score?.toFixed(1)}
                    </span>
                    <span className={`text-[11px] font-medium ${(output.peer_score ?? 0) >= output.self_score ? 'text-done' : 'text-waiting'}`}>
                      ({(output.peer_score ?? 0) > output.self_score ? '+' : ''}{((output.peer_score ?? 0) - output.self_score).toFixed(1)})
                    </span>
                  </div>
                  {/* Mini comparison bars */}
                  <div className="flex items-center gap-1">
                    <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden flex">
                      <div className="h-full bg-waiting rounded-full" style={{ width: `${(output.self_score / 10) * 100}%` }} />
                    </div>
                    <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden flex">
                      <div className="h-full bg-done rounded-full" style={{ width: `${((output.peer_score ?? 0) / 10) * 100}%` }} />
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-text-tertiary shrink-0">
                  {formatDistanceToNow(new Date(output.peer_scored_at!), { locale: ja, addSuffix: false })}
                </span>
              </button>
            )
          })}
        </div>
      </section>
    </>
  )
}
