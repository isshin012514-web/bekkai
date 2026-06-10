import { useState, useEffect } from 'react'
import { Share2, Copy, Check } from 'lucide-react'
import { OUTPUT_TYPE_LABELS, SELF_SCORE_CRITERIA } from '@/lib/types'
import { Modal } from '@/components/ui/Modal'
import { useGrowthStore } from '@/stores/growth-store'

interface RequestReviewModalProps {
  open: boolean
  onClose: () => void
  initialOutputId?: string
}

// アプリ別の共有設定
const SHARE_APPS = [
  {
    id: 'line',
    label: 'LINE',
    emoji: '💬',
    color: 'bg-[#06C755] text-white',
    url: (text: string) => `https://line.me/R/share?text=${encodeURIComponent(text)}`,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    emoji: '📱',
    color: 'bg-[#25D366] text-white',
    url: (text: string) => `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
  },
  {
    id: 'mail',
    label: 'メール',
    emoji: '✉️',
    color: 'bg-surface-secondary text-text-primary border border-border-card',
    url: (text: string) => `mailto:?subject=${encodeURIComponent('採点依頼')}&body=${encodeURIComponent(text)}`,
  },
  {
    id: 'sms',
    label: 'SMS',
    emoji: '💌',
    color: 'bg-surface-secondary text-text-primary border border-border-card',
    url: (text: string) => `sms:?body=${encodeURIComponent(text)}`,
  },
] as const

export function RequestReviewModal({ open, onClose, initialOutputId }: RequestReviewModalProps) {
  const { outputs } = useGrowthStore()
  const [selectedOutputId, setSelectedOutputId] = useState<string>(initialOutputId ?? '')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (open) setSelectedOutputId(initialOutputId ?? '')
  }, [open, initialOutputId])

  const unreviewedOutputs = outputs.filter((o) => o.peer_score == null)
  const selectedOutput = outputs.find((o) => o.id === selectedOutputId)

  const buildShareText = () => {
    if (!selectedOutput) return ''

    const detail = selectedOutput.self_score_detail
    const detailLines = detail
      ? SELF_SCORE_CRITERIA.map((c) => `  ${c.label}: ${detail[c.key].toFixed(1)}`).join('\n')
      : ''

    const audienceLine = selectedOutput.audience ? `対象: ${selectedOutput.audience}` : ''

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

  const handleNativeShare = async () => {
    if (!selectedOutputId) return
    const text = buildShareText()
    if (navigator.share) {
      try { await navigator.share({ title: '採点依頼', text }) } catch {}
    } else {
      handleCopy()
    }
  }

  const handleAppShare = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleCopy = async () => {
    const text = buildShareText()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const handleClose = () => {
    setSelectedOutputId('')
    setCopied(false)
    onClose()
  }

  const shareText = buildShareText()

  return (
    <Modal open={open} onClose={handleClose} title="採点依頼">
      <div className="space-y-5">
        {/* アウトプット選択 */}
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
                    <span className="text-[11px] text-text-tertiary">{OUTPUT_TYPE_LABELS[output.type]}</span>
                    {output.self_score > 0 && (
                      <span className="text-[11px] text-text-tertiary">自己 {output.self_score.toFixed(1)}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* メッセージプレビュー */}
        {selectedOutput && (
          <div className="bg-surface-secondary rounded-lg p-3 max-h-44 overflow-y-auto">
            <p className="text-[11px] text-text-tertiary mb-1">送信メッセージプレビュー</p>
            <p className="text-[12px] text-text-secondary whitespace-pre-line leading-relaxed">
              {shareText}
            </p>
          </div>
        )}

        {/* ── アプリ別送信ボタン ── */}
        {selectedOutput && (
          <div>
            <p className="text-[12px] font-medium text-text-secondary mb-2">送り先を選択</p>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {SHARE_APPS.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => handleAppShare(app.url(shareText))}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-[11px] font-medium transition-opacity hover:opacity-80 active:scale-95 ${app.color}`}
                >
                  <span className="text-lg leading-none">{app.emoji}</span>
                  {app.label}
                </button>
              ))}
            </div>

            {/* その他・コピー */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleNativeShare}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Share2 size={15} />
                その他のアプリ
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary-bg transition-colors"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? 'コピー済' : 'コピー'}
              </button>
            </div>
          </div>
        )}

        {/* アウトプット未選択時 */}
        {!selectedOutput && unreviewedOutputs.length > 0 && (
          <div className="flex gap-2 opacity-40 pointer-events-none">
            <button className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-medium">
              <Share2 size={15} className="inline mr-1" />
              送る
            </button>
            <button className="px-4 py-2.5 border border-primary text-primary rounded-lg text-sm font-medium">
              <Copy size={15} className="inline" />
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}
