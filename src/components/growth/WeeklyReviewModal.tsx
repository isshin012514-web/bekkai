import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { TrendingUp, TrendingDown, Minus, Plus, Trash2, Check } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { useGrowthStore } from '@/stores/growth-store'
import {
  weeklyOutputs,
  lastWeekOutputs,
  weeklyInputs,
  averageSelfScore,
  peerScoredCount,
  getWeekInterval,
} from '@/lib/utils'

interface WeeklyReviewModalProps {
  open: boolean
  onClose: () => void
}

export function WeeklyReviewModal({ open, onClose }: WeeklyReviewModalProps) {
  const { outputs, inputs, weeklyGoals, addWeeklyGoal, toggleWeeklyGoal, deleteWeeklyGoal } = useGrowthStore()
  const [newGoal, setNewGoal] = useState('')

  const weekly = useMemo(() => weeklyOutputs(outputs), [outputs])
  const lastWeek = useMemo(() => lastWeekOutputs(outputs), [outputs])
  const weekInputs = useMemo(() => weeklyInputs(inputs), [inputs])

  const avgScore = averageSelfScore(weekly)
  const lastAvgScore = averageSelfScore(lastWeek)
  const peerCount = peerScoredCount(weekly)

  const outputDiff = weekly.length - lastWeek.length
  const scoreDiff = Number((avgScore - lastAvgScore).toFixed(1))

  const { start: weekStart } = getWeekInterval()
  const weekKey = format(weekStart, 'yyyy-MM-dd')
  const thisWeekGoals = weeklyGoals.filter((g) => g.week === weekKey)
  const doneCount = thisWeekGoals.filter((g) => g.done).length

  const handleAddGoal = () => {
    const text = newGoal.trim()
    if (!text) return
    addWeeklyGoal({ week: weekKey, goal: text, done: false })
    setNewGoal('')
  }

  function TrendIcon({ value }: { value: number }) {
    if (value > 0) return <TrendingUp size={14} className="text-done" />
    if (value < 0) return <TrendingDown size={14} className="text-waiting" />
    return <Minus size={14} className="text-text-tertiary" />
  }

  return (
    <Modal open={open} onClose={onClose} title="週次レポート">
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

        {/* 今週の目標 */}
        <div className="bg-primary-bg rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] font-medium text-primary">今週の目標</p>
            {thisWeekGoals.length > 0 && (
              <span className="text-[11px] text-text-tertiary">
                {doneCount}/{thisWeekGoals.length} 達成
              </span>
            )}
          </div>

          {thisWeekGoals.length > 0 ? (
            <div className="space-y-1.5 mb-3">
              {thisWeekGoals.map((goal) => (
                <div key={goal.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleWeeklyGoal(goal.id)}
                    className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      goal.done
                        ? 'bg-done border-done'
                        : 'border-border-card hover:border-primary'
                    }`}
                  >
                    {goal.done && <Check size={12} className="text-white" />}
                  </button>
                  <span className={`text-sm flex-1 ${goal.done ? 'line-through text-text-tertiary' : 'text-text-primary'}`}>
                    {goal.goal}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteWeeklyGoal(goal.id)}
                    className="text-text-tertiary hover:text-red-500 p-0.5 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-tertiary mb-3">目標を追加しましょう</p>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
              placeholder="新しい目標を入力..."
              className="flex-1 text-sm bg-white rounded-lg border border-border-card px-3 py-2 placeholder:text-text-tertiary focus:outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={handleAddGoal}
              disabled={!newGoal.trim()}
              className="px-3 py-2 bg-primary text-white rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
