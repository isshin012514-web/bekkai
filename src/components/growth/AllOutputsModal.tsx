import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import type { Output } from '@/lib/types'
import { OUTPUT_TYPE_LABELS } from '@/lib/types'
import { Modal } from '@/components/ui/Modal'

interface AllOutputsModalProps {
  open: boolean
  onClose: () => void
  outputs: Output[]
  onSelect: (output: Output) => void
}

export function AllOutputsModal({ open, onClose, outputs, onSelect }: AllOutputsModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="すべてのアウトプット">
      <div className="space-y-2">
        {outputs.length === 0 && (
          <p className="text-sm text-text-tertiary text-center py-8">
            まだアウトプットがありません
          </p>
        )}
        {outputs.map((output) => (
          <button
            key={output.id}
            onClick={() => {
              onClose()
              onSelect(output)
            }}
            className="w-full text-left border border-border-card rounded-lg p-3 hover:bg-surface-secondary transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium leading-snug">{output.title}</p>
              <span className="text-[11px] text-text-tertiary whitespace-nowrap">
                {format(new Date(output.created_at), 'M/d', { locale: ja })}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] bg-surface-secondary text-text-secondary">
                {OUTPUT_TYPE_LABELS[output.type]}
              </span>
              <span className="text-[11px] text-text-secondary">
                自己 {output.self_score.toFixed(1)}
              </span>
              {output.peer_score != null ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-done-bg text-done">
                  他者 {output.peer_score.toFixed(1)}
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-waiting-bg text-waiting">
                  他者待ち
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </Modal>
  )
}
