import { useState, useMemo, useEffect } from 'react'
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

function getEncouragementMessage(
  outputCount: number,
  inputCount: number,
  avgScore: number,
  scoreDiff: number,
  goalDoneRate: number,
): { emoji: string; title: string; body: string } {
  // Goal completion
  if (goalDoneRate >= 1 && outputCount >= 3) {
    return { emoji: '🏆', title: '素晴らしい週でした！', body: '全ての目標を達成し、アウトプットも充実しています。この調子で来週も頑張りましょう！' }
  }
  if (outputCount >= 5) {
    return { emoji: '🔥', title: '圧倒的なアウトプット量！', body: `今週は${outputCount}件のアウトプット。量が質を生む段階です。素晴らしい勢いを維持しましょう！` }
  }
  if (scoreDiff > 0.5) {
    return { emoji: '📈', title: 'スコアが上がっています！', body: '先週より自己採点が向上。成長を実感できる週でしたね。' }
  }
  if (outputCount >= 3 && avgScore >= 7) {
    return { emoji: '✨', title: '質の高いアウトプット！', body: '量と質のバランスが取れた良い週でした。' }
  }
  if (inputCount >= 5) {
    return { emoji: '📚', title: 'インプット充実！', body: `${inputCount}件のインプット。来週はこれをアウトプットに変えていきましょう！` }
  }
  if (outputCount >= 1) {
    return { emoji: '👍', title: 'お疲れさまでした！', body: 'アウトプットを続けていること自体が大きな一歩です。来週も1件ずつ積み重ねましょう。' }
  }
  return { emoji: '💪', title: '来週こそ！', body: '今週はお休みモードでしたが、小さな一歩でもOK。来週インプットから始めてみましょう。' }
}

export function WeeklyReviewModal({ open, onClose }: WeeklyReviewModalProps) {
  const { outputs, inputs, weeklyGoals, addWeeklyGoal, toggleWeeklyGoal, deleteWeeklyGoal, markWeeklyReportViewed } = useGrowthStore()
  const [newGoal, setNewGoal] = useState('')

  const weekly = useMemo(() => weeklyOutputs(outputs), [outputs])
  const lastWeek = useMemo(() => lastWeekOutputs(outputs), [outputs])
  const weekInputs = useMemo(() => weeklyInputs(inputs), [inputs])

  const avgScore = averageSelfScore(weekly)
  const lastAvgScore = averageSelfScore(lastWeek)
  const peerCount = peerScoredCount(weekly)
  const selfScoredCount = useMemo(() => weekly.filter((o) => o.self_score > 0).length, [weekly])

  const outputDiff = weekly.length - lastWeek.length
  const scoreDiff = Number((avgScore - lastAvgScore).toFixed(1))

  const { start: weekStart } = getWeekInterval()
  const weekKey = format(weekStart, 'yyyy-MM-dd')
  const thisWeekGoals = weeklyGoals.filter((g) => g.week === weekKey)
  const doneCount = thisWeekGoals.filter((g) => g.done).length
  const goalDoneRate = thisWeekGoals.length > 0 ? doneCount / thisWeekGoals.length : 0

  const message = useMemo(
    () => getEncouragementMessage(weekly.length, weekInputs.length, avgScore, scoreDiff, goalDoneRate),
    [weekly.length, weekInputs.length, avgScore, scoreDiff, goalDoneRate],
  )

  // Mark as viewed when opened
  useEffect(() => {
    if (open) markWeeklyReportViewed()
  }, [open, markWeeklyReportViewed])

  const handleAddGoal = () => {
    const text = newGoal.trim()
    if (!text) return
    addWeeklyGoal({ week: weekKey, goal: text, done: false })
    setNewGoal('')
  }

  // Max score for chart scaling
  const maxScore = 10

  function TrendIcon({ value }: { value: number }) {
    if (value > 0) return <TrendingUp size={14} className="text-done" />
    if (value < 0) return <TrendingDown size={14} className="text-waiting" />
    return <Minus size={14} className="text-text-tertiary" />
  }

  return (
    <Modal open={open} onClose={onClose} title="週次レポート">
      <div className="space-y-5">
        {/* 励ましメッセージ */}
        <div className="bg-gradient-to-r from-primary-bg to-surface-secondary rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{message.emoji}</span>
            <div>
              <p className="text-sm font-medium text-primary">{message.title}</p>
              <p className="text-[12px] text-text-secondary mt-1 leading-relaxed">{message.body}</p>
            </div>
          </div>
        </div>

        {/* 成績カード */}
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
              <p className="text-[11px] text-text-secondary">インプット数</p>
              <span className="text-xl font-medium">{weekInputs.length}</span>
            </div>
            <div className="bg-surface-secondary rounded-lg p-3">
              <p className="text-[11px] text-text-secondary">自己採点</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-medium">{selfScoredCount}件</span>
                {selfScoredCount > 0 && (
                  <span className="text-[11px] text-text-tertiary">平均 {avgScore.toFixed(1)}</span>
                )}
              </div>
            </div>
            <div className="bg-surface-secondary rounded-lg p-3">
              <p className="text-[11px] text-text-secondary">他者採点</p>
              <span className="text-xl font-medium">{peerCount}件</span>
            </div>
          </div>
        </div>

        {/* 今週 vs 先週 グラフ */}
        <div>
          <h3 className="text-sm font-medium mb-3">今週 vs 先週</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-text-secondary">アウトプット数</span>
                <span className="text-text-tertiary">今週 {weekly.length} / 先週 {lastWeek.length}</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-text-tertiary w-8">今週</span>
                  <div className="flex-1 h-3 bg-surface rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, (weekly.length / Math.max(weekly.length, lastWeek.length, 1)) * 100)}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-text-tertiary w-8">先週</span>
                  <div className="flex-1 h-3 bg-surface rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-text-tertiary transition-all" style={{ width: `${Math.min(100, (lastWeek.length / Math.max(weekly.length, lastWeek.length, 1)) * 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>
            {(avgScore > 0 || lastAvgScore > 0) && (
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-text-secondary">自己採点平均</span>
                  <div className="flex items-center gap-1">
                    <span className="text-text-tertiary">{avgScore.toFixed(1)} / {lastAvgScore.toFixed(1)}</span>
                    <TrendIcon value={scoreDiff} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-tertiary w-8">今週</span>
                    <div className="flex-1 h-3 bg-surface rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-waiting transition-all" style={{ width: `${(avgScore / maxScore) * 100}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-tertiary w-8">先週</span>
                    <div className="flex-1 h-3 bg-surface rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-text-tertiary transition-all" style={{ width: `${(lastAvgScore / maxScore) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* アウトプット別スコアグラフ */}
        {weekly.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">アウトプット別スコア</h3>
            <div className="space-y-2">
              {weekly.map((o) => (
                <div key={o.id}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[12px] truncate mr-2 max-w-[200px]">{o.title}</span>
                    <div className="flex items-center gap-1 shrink-0 text-[11px]">
                      <span className="text-text-secondary">{o.self_score.toFixed(1)}</span>
                      {o.peer_score != null && (
                        <span className="text-done">/ {o.peer_score.toFixed(1)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-waiting" style={{ width: `${(o.self_score / maxScore) * 100}%` }} />
                    </div>
                    {o.peer_score != null && (
                      <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-done" style={{ width: `${(o.peer_score / maxScore) * 100}%` }} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-4 justify-center mt-1">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-waiting" />
                  <span className="text-[10px] text-text-tertiary">自己</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-done" />
                  <span className="text-[10px] text-text-tertiary">他者</span>
                </div>
              </div>
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
