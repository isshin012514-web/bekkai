import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import type { Output } from '@/lib/types'
import { OUTPUT_TYPE_LABELS } from '@/lib/types'
import { Modal } from '@/components/ui/Modal'

interface OutputDetailModalProps {
  open: boolean
  onClose: () => void
  output: Output | null
}

export function OutputDetailModal({ open, onClose, output }: OutputDetailModalProps) {
  if (!output) return null

  return (
    <Modal open={open} onClose={onClose} title="アウトプット詳細">
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-medium">{output.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] bg-surface-secondary text-text-secondary">
              {OUTPUT_TYPE_LABELS[output.type]}
            </span>
            <span className="text-[11px] text-text-tertiary">
              {format(new Date(output.created_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-secondary rounded-lg p-3">
            <p className="text-[11px] text-text-secondary mb-0.5">自己採点</p>
            <p className="text-xl font-medium">{output.self_score.toFixed(1)}</p>
          </div>
          <div className={`rounded-lg p-3 ${output.peer_score != null ? 'bg-done-bg' : 'bg-waiting-bg'}`}>
            <p className="text-[11px] text-text-secondary mb-0.5">他者採点</p>
            <p className="text-xl font-medium">
              {output.peer_score != null ? output.peer_score.toFixed(1) : '未採点'}
            </p>
          </div>
        </div>

        {output.self_note && (
          <div>
            <p className="text-[12px] font-medium text-text-secondary mb-1">自己メモ</p>
            <p className="text-sm text-text-primary bg-surface-secondary rounded-lg p-3">
              {output.self_note}
            </p>
          </div>
        )}

        {output.peer_note && (
          <div>
            <p className="text-[12px] font-medium text-text-secondary mb-1">他者コメント</p>
            <p className="text-sm text-text-primary bg-done-bg rounded-lg p-3">
              {output.peer_note}
            </p>
          </div>
        )}

        {output.self_score !== undefined && output.peer_score != null && (
          <div className="bg-surface-secondary rounded-lg p-3">
            <p className="text-[12px] font-medium text-text-secondary mb-1">ギャップ分析</p>
            <div className="flex items-center gap-2">
              <span className="text-sm">自己 {output.self_score.toFixed(1)}</span>
              <span className="text-text-tertiary">vs</span>
              <span className="text-sm">他者 {output.peer_score.toFixed(1)}</span>
              <span className={`text-sm font-medium ${output.peer_score > output.self_score ? 'text-done' : output.peer_score < output.self_score ? 'text-waiting' : 'text-text-secondary'}`}>
                ({(output.peer_score - output.self_score) > 0 ? '+' : ''}{(output.peer_score - output.self_score).toFixed(1)})
              </span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
