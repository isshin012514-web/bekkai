import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { BookOpen, FileText, Video, Users, Mic, Package, MessageSquare, Star } from 'lucide-react'
import type { Output, Input } from '@/lib/types'
import { OUTPUT_TYPE_LABELS, INPUT_TYPE_LABELS } from '@/lib/types'

const INPUT_ICONS: Record<string, typeof BookOpen> = {
  book: BookOpen, article: FileText, video: Video, dialogue: Users, other: FileText,
}

const OUTPUT_ICONS: Record<string, typeof Mic> = {
  article: FileText, speech: Mic, product: Package, post: MessageSquare, other: FileText,
}

interface RecordsSectionProps {
  inputs: Input[]
  outputs: Output[]
  onSelectOutput: (output: Output) => void
}

export function RecordsSection({ inputs, outputs, onSelectOutput }: RecordsSectionProps) {
  const inputCount = inputs.length
  const outputCount = outputs.length
  const reviewedOutputs = outputs.filter((o) => o.peer_score != null)

  // IN/OUT mixed timeline
  type IOItem = { kind: 'input'; data: Input; at: string } | { kind: 'output'; data: Output; at: string }
  const ioItems: IOItem[] = [
    ...inputs.map((i): IOItem => ({ kind: 'input', data: i, at: i.created_at })),
    ...outputs.map((o): IOItem => ({ kind: 'output', data: o, at: o.created_at })),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())

  const visibleIO = ioItems.slice(0, 5)

  return (
    <>
      {/* IN / OUT Timeline */}
      <section className="mx-4 mt-6 border border-border-card rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">IN / OUT 記録</h2>
          <div className="flex items-center gap-2 text-[11px] text-text-tertiary">
            <span>IN {inputCount}</span>
            <span>OUT {outputCount}</span>
          </div>
        </div>
        <div className="space-y-0.5">
          {visibleIO.length === 0 && (
            <p className="text-sm text-text-tertiary text-center py-4">
              まだ記録がありません
            </p>
          )}
          {visibleIO.map((item, i) => {
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
                  <span className="text-[11px] text-text-secondary">自己 {output.self_score.toFixed(1)}</span>
                </div>
                <span className="text-[11px] text-text-tertiary shrink-0">
                  {formatDistanceToNow(new Date(output.created_at), { locale: ja, addSuffix: false })}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Feedback / Review Section */}
      <section className="mx-4 mt-4 border border-border-card rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">自己採点/フィードバック</h2>
          <span className="text-[11px] text-text-tertiary">{reviewedOutputs.length}件</span>
        </div>
        <div className="space-y-0.5">
          {reviewedOutputs.length === 0 && (
            <p className="text-sm text-text-tertiary text-center py-4">
              まだ採点がありません
            </p>
          )}
          {reviewedOutputs.slice(0, 3).map((output, i) => (
            <button
              key={`rev-${output.id}-${i}`}
              onClick={() => onSelectOutput(output)}
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
              <span className="text-[11px] text-text-tertiary shrink-0">
                {formatDistanceToNow(new Date(output.peer_scored_at!), { locale: ja, addSuffix: false })}
              </span>
            </button>
          ))}
        </div>
      </section>
    </>
  )
}
