import { useState } from 'react'
import { Send } from 'lucide-react'
import { OUTPUT_TYPE_LABELS } from '@/lib/types'
import { Modal } from '@/components/ui/Modal'
import { useGrowthStore } from '@/stores/growth-store'

interface RequestReviewModalProps {
  open: boolean
  onClose: () => void
}

export function RequestReviewModal({ open, onClose }: RequestReviewModalProps) {
  const { outputs, reviewers, updateOutput } = useGrowthStore()
  const [selectedOutputId, setSelectedOutputId] = useState<string>('')
  const [selectedReviewerId, setSelectedReviewerId] = useState<string>('')

  const unreviewedOutputs = outputs.filter((o) => o.peer_score == null)

  const handleSend = () => {
    if (!selectedOutputId || !selectedReviewerId) return
    updateOutput(selectedOutputId, { reviewer_id: selectedReviewerId })
    setSelectedOutputId('')
    setSelectedReviewerId('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="採点依頼">
      <div className="space-y-5">
        <div>
          <label className="block text-[12px] font-medium text-text-secondary mb-2">
            アウトプットを選択
          </label>
          {unreviewedOutputs.length === 0 ? (
            <p className="text-sm text-text-tertiary text-center py-4">
              未採点のアウトプットはありません
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {unreviewedOutputs.map((output) => (
                <button
                  key={output.id}
                  type="button"
                  onClick={() => setSelectedOutputId(output.id)}
                  className={`w-full text-left rounded-lg p-3 border transition-colors ${
                    selectedOutputId === output.id
                      ? 'border-primary bg-primary-bg'
                      : 'border-border-card hover:bg-surface-secondary'
                  }`}
                >
                  <p className="text-sm font-medium">{output.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-text-tertiary">
                      {OUTPUT_TYPE_LABELS[output.type]}
                    </span>
                    <span className="text-[11px] text-text-tertiary">
                      自己 {output.self_score.toFixed(1)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-[12px] font-medium text-text-secondary mb-2">
            採点者を選択
          </label>
          {reviewers.length === 0 ? (
            <p className="text-sm text-text-tertiary text-center py-4">
              採点者が登録されていません
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {reviewers.map((reviewer) => (
                <button
                  key={reviewer.id}
                  type="button"
                  onClick={() => setSelectedReviewerId(reviewer.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    selectedReviewerId === reviewer.id
                      ? 'border-primary bg-primary-bg text-primary'
                      : 'border-border-card hover:bg-surface-secondary'
                  }`}
                >
                  {reviewer.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleSend}
          disabled={!selectedOutputId || !selectedReviewerId}
          className="w-full inline-flex items-center justify-center gap-1.5 py-3 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={16} />
          採点依頼を送る
        </button>
      </div>
    </Modal>
  )
}
