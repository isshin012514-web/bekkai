import { useState } from 'react'
import { Share2, Copy, Check } from 'lucide-react'
import { OUTPUT_TYPE_LABELS, SELF_SCORE_CRITERIA } from '@/lib/types'
import { Modal } from '@/components/ui/Modal'
import { useGrowthStore } from '@/stores/growth-store'

interface RequestReviewModalProps {
  open: boolean
  onClose: () => void
}

export function RequestReviewModal({ open, onClose }: RequestReviewModalProps) {
  const { outputs } = useGrowthStore()
  const [selectedOutputId, setSelectedOutputId] = useState<string>('')
  const [copied, setCopied] = useState(false)

  const unreviewedOutputs = outputs.filter((o) => o.peer_score == null)
  const selectedOutput = outputs.find((o) => o.id === selectedOutputId)

  const buildShareText = () => {
    if (!selectedOutput) return ''

    const detail = selectedOutput.self_score_detail
    const detailLines = detail
      ? SELF_SCORE_CRITERIA.map((c) => `  ${c.label}: ${detail[c.key].toFixed(1)}`).join('\n')
      : ''

    const audienceLine = selectedOutput.audience
      ? `対象: ${selectedOutput.audience}`
      : ''

    const selfLines = [
      selectedOutput.self_good ? `できたこと: ${selectedOutput.self_good}` : null,
      selectedOutput.self_improve ? `できなかったこと: ${selectedOutput.self_improve}` : null,
    ].filter(Boolean)

    return [
      `【採点依頼】`,
      ``,
      `■ アウトプット`,
      `「${selectedOutput.title}」（${OUTPUT_TYPE_LABELS[selectedOutput.type]}）`,
      audienceLine || null,
      ``,
      selectedOutput.self_score > 0 ? `■ 自己採点: ${selectedOutput.self_score.toFixed(1)}/10` : null,
      detailLines || null,
      ...selfLines,
      ``,
      `■ お願いしたいこと`,
      `以下の5つの観点で採点をお願いします！`,
      ``,
      ...SELF_SCORE_CRITERIA.map((c, i) => `${i + 1}. ${c.label}（0-10）\n   → ${c.hint}`),
      ``,
      `総合スコア（0-10）と一言コメントもお願いします！`,
    ].filter((l) => l !== null).join('\n')
  }

  const handleShare = async () => {
    if (!selectedOutputId) return
    const text = buildShareText()

    if (navigator.share) {
      try {
        await navigator.share({ title: '採点依頼', text })
      } catch {
        // User cancelled share
      }
    } else {
      await handleCopy()
    }
  }

  const handleCopy = async () => {
    const text = buildShareText()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard not available
    }
  }

  const handleClose = () => {
    setSelectedOutputId('')
    setCopied(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="採点依頼">
      <div className="space-y-5">
        <div>
          <label className="block text-[12px] font-medium text-text-secondary mb-2">
            採点してもらうアウトプットを選択
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
                    {output.self_score > 0 && (
                      <span className="text-[11px] text-text-tertiary">
                        自己 {output.self_score.toFixed(1)}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Share preview */}
        {selectedOutput && (
          <div className="bg-surface-secondary rounded-lg p-3 max-h-52 overflow-y-auto">
            <p className="text-[11px] text-text-tertiary mb-1">送信メッセージプレビュー</p>
            <p className="text-[12px] text-text-secondary whitespace-pre-line leading-relaxed">
              {buildShareText()}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleShare}
            disabled={!selectedOutputId}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Share2 size={16} />
            外部アプリで送る
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!selectedOutputId}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-3 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary-bg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'コピー済' : 'コピー'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
