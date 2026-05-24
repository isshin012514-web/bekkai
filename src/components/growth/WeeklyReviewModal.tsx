import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { useGrowthStore } from '@/stores/growth-store'
import {
  weeklyOutputs,
  lastWeekOutputs,
  weeklyInputs,
  averageSelfScore,
  peerScoredCount,
} from '@/lib/utils'

interface WeeklyReviewModalProps {
  open: boolean
  onClose: () => void
}

export function WeeklyReviewModal({ open, onClose }: WeeklyReviewModalProps) {
  const { outputs, inputs } = useGrowthStore()

  const weekly = useMemo(() => weeklyOutputs(outputs), [outputs])
  const lastWeek = useMemo(() => lastWeekOutputs(outputs), [outputs])
  const weekInputs = useMemo(() => weeklyInputs(inputs), [inputs])

  const avgScore = averageSelfScore(weekly)
  const lastAvgScore = averageSelfScore(lastWeek)
  const peerCount = peerScoredCount(weekly)

  const outputDiff = weekly.length - lastWeek.length
  const scoreDiff = Number((avgScore - lastAvgScore).toFixed(1))

  function TrendIcon({ value }: { value: number }) {
    if (value > 0) return <TrendingUp size={14} className="text-done" />
    if (value < 0) return <TrendingDown size={14} className="text-waiting" />
    return <Minus size={14} className="text-text-tertiary" />
  }

  return (
    <Modal open={open} onClose={onClose} title="週次振り返り">
      <div className="space-y-5">
        <div>
          <h3 className="text-sm font-medium mb-3">今週の成績</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-secondary rounded-lg p-3">
              <p className="text-[11px] text-text-secondary">アウトプット数</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-medium">{weekly.length}</span>
                <div className="flex items-center gap-0.5">
                  <TrendIcon value={outputDiff} />
                  <span className={`text-[11px] ${outputDiff > 0 ? 'text-done' : outputDiff < 0 ? 'text-waiting' : 'text-text-tertiary'}`}>
                    {outputDiff > 0 ? `+${outputDiff}` : outputDiff}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-surface-secondary rounded-lg p-3">
              <p className="text-[11px] text-text-secondary">自己採点平均</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-medium">{avgScore.toFixed(1)}</span>
                <div className="flex items-center gap-0.5">
                  <TrendIcon value={scoreDiff} />
                  <span className={`text-[11px] ${scoreDiff > 0 ? 'text-done' : scoreDiff < 0 ? 'text-waiting' : 'text-text-tertiary'}`}>
                    {scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-surface-secondary rounded-lg p-3">
              <p className="text-[11px] text-text-secondary">他者採点件数</p>
              <span className="text-xl font-medium">{peerCount}</span>
            </div>
            <div className="bg-surface-secondary rounded-lg p-3">
              <p className="text-[11px] text-text-secondary">インプット数</p>
              <span className="text-xl font-medium">{weekInputs.length}</span>
            </div>
          </div>
        </div>

        {weekly.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">今週のアウトプット</h3>
            <div className="space-y-1.5">
              {weekly.map((o) => (
                <div key={o.id} className="flex items-center justify-between py-1.5">
                  <span className="text-sm truncate mr-2">{o.title}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-text-secondary">
                      {o.self_score.toFixed(1)}
                    </span>
                    {o.peer_score != null && (
                      <span className="text-[11px] text-done">
                        / {o.peer_score.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-primary-bg rounded-lg p-4">
          <p className="text-[12px] font-medium text-primary mb-1">来週の目標</p>
          <p className="text-sm text-text-secondary">
            アウトプット数を{weekly.length + 2}件以上にする
          </p>
        </div>
      </div>
    </Modal>
  )
}
