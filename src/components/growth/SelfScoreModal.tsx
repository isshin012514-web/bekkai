import { useState, useMemo } from 'react'
import { PenLine } from 'lucide-react'
import { OUTPUT_TYPE_LABELS, SELF_SCORE_CRITERIA } from '@/lib/types'
import type { SelfScoreDetail } from '@/lib/types'
import { Modal } from '@/components/ui/Modal'
import { useGrowthStore } from '@/stores/growth-store'

interface SelfScoreModalProps {
  open: boolean
  onClose: () => void
}

const DEFAULT_DETAIL: SelfScoreDetail = {
  originality: 5,
  communication: 5,
  practicality: 5,
  audience_response: 5,
  completeness: 5,
}

export function SelfScoreModal({ open, onClose }: SelfScoreModalProps) {
  const { outputs, updateOutput } = useGrowthStore()
  const [selectedOutputId, setSelectedOutputId] = useState<string>('')
  const [detail, setDetail] = useState<SelfScoreDetail>({ ...DEFAULT_DETAIL })
  const [good, setGood] = useState('')
  const [improve, setImprove] = useState('')

  // Outputs that haven't been self-scored yet (self_score === 0) come first,
  // then already scored ones for re-scoring
  const unscoredOutputs = outputs.filter((o) => o.self_score === 0)
  const scoredOutputs = outputs.filter((o) => o.self_score > 0)

  const selectedOutput = outputs.find((o) => o.id === selectedOutputId)

  const overallScore = useMemo(() => {
    const sum = detail.originality + detail.communication + detail.practicality + detail.audience_response + detail.completeness
    return Math.round((sum / 5) * 2) / 2
  }, [detail])

  const handleSelectOutput = (id: string) => {
    setSelectedOutputId(id)
    const output = outputs.find((o) => o.id === id)
    if (output?.self_score_detail) {
      setDetail({ ...output.self_score_detail })
      setGood(output.self_good ?? '')
      setImprove(output.self_improve ?? '')
    } else {
      setDetail({ ...DEFAULT_DETAIL })
      setGood('')
      setImprove('')
    }
  }

  const updateCriteria = (key: keyof SelfScoreDetail, value: number) => {
    setDetail((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = () => {
    if (!selectedOutputId) return
    updateOutput(selectedOutputId, {
      self_score: overallScore,
      self_score_detail: detail,
      self_good: good || undefined,
      self_improve: improve || undefined,
      scored_at: new Date().toISOString(),
    })
    handleClose()
  }

  const handleClose = () => {
    setSelectedOutputId('')
    setDetail({ ...DEFAULT_DETAIL })
    setGood('')
    setImprove('')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="自己採点">
      <div className="space-y-5">
        {/* Output selection */}
        <div>
          <label className="block text-[12px] font-medium text-text-secondary mb-2">
            採点するアウトプットを選択
          </label>

          {unscoredOutputs.length > 0 && (
            <div className="space-y-2 max-h-32 overflow-y-auto mb-2">
              <p className="text-[10px] text-text-tertiary font-medium">未採点</p>
              {unscoredOutputs.map((output) => (
                <button
                  key={output.id}
                  type="button"
                  onClick={() => handleSelectOutput(output.id)}
                  className={`w-full text-left rounded-lg p-3 border transition-colors ${
                    selectedOutputId === output.id
                      ? 'border-primary bg-primary-bg'
                      : 'border-border-card hover:bg-surface-secondary'
                  }`}
                >
                  <p className="text-sm font-medium">{output.title}</p>
                  <span className="text-[11px] text-text-tertiary">{OUTPUT_TYPE_LABELS[output.type]}</span>
                </button>
              ))}
            </div>
          )}

          {scoredOutputs.length > 0 && (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              <p className="text-[10px] text-text-tertiary font-medium">採点済み（再採点）</p>
              {scoredOutputs.slice(0, 5).map((output) => (
                <button
                  key={output.id}
                  type="button"
                  onClick={() => handleSelectOutput(output.id)}
                  className={`w-full text-left rounded-lg p-3 border transition-colors ${
                    selectedOutputId === output.id
                      ? 'border-primary bg-primary-bg'
                      : 'border-border-card hover:bg-surface-secondary'
                  }`}
                >
                  <p className="text-sm font-medium">{output.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-text-tertiary">{OUTPUT_TYPE_LABELS[output.type]}</span>
                    <span className="text-[11px] text-text-secondary">現在 {output.self_score.toFixed(1)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {outputs.length === 0 && (
            <p className="text-sm text-text-tertiary text-center py-4">
              まずアウトプットを記録してください
            </p>
          )}
        </div>

        {/* Scoring form (shown when output selected) */}
        {selectedOutput && (
          <>
            {/* Selected output info */}
            <div className="bg-surface-secondary rounded-lg p-3">
              <p className="text-sm font-medium">{selectedOutput.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-text-tertiary">{OUTPUT_TYPE_LABELS[selectedOutput.type]}</span>
                {selectedOutput.audience && (
                  <span className="text-[11px] text-text-tertiary">→ {selectedOutput.audience}</span>
                )}
              </div>
            </div>

            {/* 5 criteria sliders */}
            <div className="bg-surface-secondary rounded-lg p-3">
              <p className="text-[12px] font-medium text-text-secondary mb-3">観点別スコア</p>
              <div className="space-y-3">
                {SELF_SCORE_CRITERIA.map((c) => (
                  <div key={c.key}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[12px] font-medium">{c.label}</span>
                      <span className="text-[12px] text-primary font-medium w-8 text-right">
                        {detail[c.key].toFixed(1)}
                      </span>
                    </div>
                    <p className="text-[10px] text-text-tertiary mb-1">{c.hint}</p>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={0.5}
                      value={detail[c.key]}
                      onChange={(e) => updateCriteria(c.key, parseFloat(e.target.value))}
                      className="w-full accent-primary h-1.5"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-border-card flex items-center justify-between">
                <span className="text-[12px] font-medium text-text-secondary">総合スコア</span>
                <span className="text-lg font-bold text-primary">{overallScore.toFixed(1)}</span>
              </div>
            </div>

            {/* できたこと */}
            <div>
              <label className="block text-[12px] font-medium text-text-secondary mb-1">
                できたこと
              </label>
              <textarea
                value={good}
                onChange={(e) => setGood(e.target.value)}
                rows={2}
                placeholder="例：データを使って説得力を出せた、質問に的確に答えられた"
                className="w-full px-3 py-2.5 border border-border-card rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none bg-surface"
              />
            </div>

            {/* できなかったこと */}
            <div>
              <label className="block text-[12px] font-medium text-text-secondary mb-1">
                できなかったこと
              </label>
              <textarea
                value={improve}
                onChange={(e) => setImprove(e.target.value)}
                rows={2}
                placeholder="例：結論が曖昧だった、時間配分がうまくいかなかった"
                className="w-full px-3 py-2.5 border border-border-card rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none bg-surface"
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full inline-flex items-center justify-center gap-1.5 py-3 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <PenLine size={16} />
              採点を保存
            </button>
          </>
        )}
      </div>
    </Modal>
  )
}
