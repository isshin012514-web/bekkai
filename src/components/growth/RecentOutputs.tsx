import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import type { Output } from '@/lib/types'
import { OUTPUT_TYPE_LABELS } from '@/lib/types'

interface RecentOutputsProps {
  outputs: Output[]
  onViewAll: () => void
  onSelect: (output: Output) => void
}

function ScoreBadge({ label, score, variant }: { label: string; score?: number; variant: 'self' | 'peer-done' | 'peer-waiting' }) {
  if (variant === 'peer-waiting') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-waiting-bg text-waiting">
        他者待ち
      </span>
    )
  }

  if (variant === 'peer-done' && score != null) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-done-bg text-done">
        他者 {score.toFixed(1)}
      </span>
    )
  }

  return (
    <span className="text-[11px] text-text-secondary">
      {label} {score?.toFixed(1)}
    </span>
  )
}

export function RecentOutputs({ outputs, onViewAll, onSelect }: RecentOutputsProps) {
  const recent = outputs.slice(0, 3)

  return (
    <section className="px-4 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium">最近のアウトプット</h2>
        <button onClick={onViewAll} className="text-[12px] text-primary hover:underline">
          すべて見る
        </button>
      </div>
      <div className="space-y-2">
        {recent.length === 0 && (
          <p className="text-sm text-text-tertiary text-center py-6">
            まだアウトプットがありません。<br />
            上の「+ アウトプット」から記録しましょう！
          </p>
        )}
        {recent.map((output) => (
          <button
            key={output.id}
            onClick={() => onSelect(output)}
            className="w-full text-left border border-border-card rounded-lg p-3 hover:bg-surface-secondary transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium leading-snug">{output.title}</p>
              <span className="text-[11px] text-text-tertiary whitespace-nowrap">
                {formatDistanceToNow(new Date(output.created_at), { locale: ja, addSuffix: false })}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] bg-surface-secondary text-text-secondary">
                {OUTPUT_TYPE_LABELS[output.type]}
              </span>
              <ScoreBadge label="自己" score={output.self_score} variant="self" />
              {output.peer_score != null ? (
                <ScoreBadge label="他者" score={output.peer_score} variant="peer-done" />
              ) : (
                <ScoreBadge label="" variant="peer-waiting" />
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
