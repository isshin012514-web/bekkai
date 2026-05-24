import { useState } from 'react'
import { Share2, Copy, Check } from 'lucide-react'
import { OUTPUT_TYPE_LABELS } from '@/lib/types'
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
      ? `\n  独自性: ${detail.originality.toFixed(1)}  実用性: ${detail.practicality.toFixed(1)}  完成度: ${detail.completeness.toFixed(1)}`
      : ''

    const goodLine = selectedOutput.self_good
      ? `\n良かった点: ${selectedOutput.self_good}`
      : ''

    const improveLine = selectedOutput.self_improve
      ? `\n改善点: ${selectedOutput.self_improve}`
      : ''

    return [
      `【採点依頼】`,
      ``,
      `■ アウトプット`,
      `「${selectedOutput.title}」（${OUTPUT_TYPE_LABELS[selectedOutput.type]}）`,
      ``,
      `■ 自己採点: ${selectedOutput.self_score.toFixed(1)}/10${detailLines}`,
      goodLine ? `${goodLine}` : null,
      improveLine ? `${improveLine}` : null,
      ``,
      `■ お願いしたいこと`,
      `以下の3つの観点で採点をお願いします！`,
      ``,
      `1. 独自性（0-10）`,
      `   → 自分なりの視点や切り口があるか`,
      `2. 実用性（0-10）`,
      `   → 誰かの役に立つか・使えるか`,
      `3. 完成度（0-10）`,
      `   → 質・量ともに仕上がっているか`,
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
                    <span className="text-[11px] text-text-tertiary">
                      自己 {output.self_score.toFixed(1)}
                    </span>
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
