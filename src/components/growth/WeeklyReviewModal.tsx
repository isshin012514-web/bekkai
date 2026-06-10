import { useState, useMemo, useEffect } from 'react'
import { format } from 'date-fns'
import { isWithinInterval } from 'date-fns'
import { TrendingUp, TrendingDown, Minus, Plus, Trash2, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { useGrowthStore } from '@/stores/growth-store'
import {
  averageSelfScore,
  peerScoredCount,
  getWeekInterval,
} from '@/lib/utils'
import { SELF_SCORE_CRITERIA } from '@/lib/types'

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

// SVGレーダーチャート（観点別スコア）
function RadarChart({ data }: { data: { label: string; value: number; peerValue?: number }[] }) {
  const size = 160
  const cx = size / 2
  const cy = size / 2
  const r = 60
  const n = data.length

  const angleOf = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2

  const point = (i: number, ratio: number) => {
    const a = angleOf(i)
    return { x: cx + r * ratio * Math.cos(a), y: cy + r * ratio * Math.sin(a) }
  }

  const selfPoints = data.map((d, i) => point(i, d.value / 10))
  const peerPoints = data.some((d) => d.peerValue != null)
    ? data.map((d, i) => point(i, (d.peerValue ?? 0) / 10))
    : null

  const toPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z'

  // 背景グリッド
  const gridLevels = [0.25, 0.5, 0.75, 1]

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* グリッド */}
      {gridLevels.map((level) => (
        <polygon
          key={level}
          points={data.map((_, i) => {
            const p = point(i, level)
            return `${p.x},${p.y}`
          }).join(' ')}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-border-card"
        />
      ))}
      {/* 軸線 */}
      {data.map((_, i) => {
        const p = point(i, 1)
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="currentColor" strokeWidth="0.5" className="text-border-card" />
      })}
      {/* 他者エリア */}
      {peerPoints && (
        <path d={toPath(peerPoints)} fill="rgba(34,197,94,0.15)" stroke="rgb(34,197,94)" strokeWidth="1.5" />
      )}
      {/* 自己エリア */}
      <path d={toPath(selfPoints)} fill="rgba(59,130,246,0.15)" stroke="rgb(59,130,246)" strokeWidth="1.5" />
      {/* ラベル */}
      {data.map((d, i) => {
        const a = angleOf(i)
        const lx = cx + (r + 18) * Math.cos(a)
        const ly = cy + (r + 18) * Math.sin(a)
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="8"
            fill="currentColor"
            className="text-text-tertiary"
          >
            {d.label}
          </text>
        )
      })}
    </svg>
  )
}

// 横棒グラフ（出力別スコア）
function ScoreBar({ label, selfScore, peerScore, max = 10 }: { label: string; selfScore: number; peerScore?: number; max?: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[11px] text-text-primary truncate mr-2 max-w-[180px]">{label}</span>
        <div className="flex items-center gap-1 shrink-0 text-[11px]">
          <span className="text-waiting">{selfScore.toFixed(1)}</span>
          {peerScore != null && <span className="text-done">/ {peerScore.toFixed(1)}</span>}
        </div>
      </div>
      <div className="space-y-0.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-text-tertiary w-5">自己</span>
          <div className="flex-1 h-2.5 bg-surface rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-waiting transition-all" style={{ width: `${(selfScore / max) * 100}%` }} />
          </div>
        </div>
        {peerScore != null && (
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-text-tertiary w-5">他者</span>
            <div className="flex-1 h-2.5 bg-surface rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-done transition-all" style={{ width: `${(peerScore / max) * 100}%` }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function WeeklyReviewModal({ open, onClose }: WeeklyReviewModalProps) {
  const { outputs, inputs, weeklyGoals, addWeeklyGoal, toggleWeeklyGoal, deleteWeeklyGoal, markWeeklyReportViewed } = useGrowthStore()
  const [newGoal, setNewGoal] = useState('')
  const [weekOffset, setWeekOffset] = useState(0) // 0 = current week, -1 = last week, etc.

  // Reset to current week when modal opens
  useEffect(() => {
    if (open) {
      setWeekOffset(0)
      markWeeklyReportViewed()
    }
  }, [open, markWeeklyReportViewed])

  // Compute selected week interval
  const { selectedWeekInterval, prevWeekInterval } = useMemo(() => {
    const selectedBase = new Date()
    selectedBase.setDate(selectedBase.getDate() + weekOffset * 7)
    const prevBase = new Date()
    prevBase.setDate(prevBase.getDate() + (weekOffset - 1) * 7)
    return {
      selectedWeekInterval: getWeekInterval(selectedBase),
      prevWeekInterval: getWeekInterval(prevBase),
    }
  }, [weekOffset])

  const { start: weekStart, end: weekEnd } = selectedWeekInterval
  const { start: prevStart, end: prevEnd } = prevWeekInterval

  // Filter outputs/inputs for selected week
  const weekly = useMemo(() =>
    outputs.filter((o) => isWithinInterval(new Date(o.created_at), { start: weekStart, end: weekEnd })),
    [outputs, weekStart, weekEnd]
  )
  const lastWeek = useMemo(() =>
    outputs.filter((o) => isWithinInterval(new Date(o.created_at), { start: prevStart, end: prevEnd })),
    [outputs, prevStart, prevEnd]
  )
  const weekInputs = useMemo(() =>
    inputs.filter((i) => isWithinInterval(new Date(i.created_at), { start: weekStart, end: weekEnd })),
    [inputs, weekStart, weekEnd]
  )

  const weekKey = format(weekStart, 'yyyy-MM-dd')
  const isCurrentWeek = weekOffset === 0

  const avgScore = averageSelfScore(weekly)
  const lastAvgScore = averageSelfScore(lastWeek)
  const peerCount = peerScoredCount(weekly)
  const selfScoredCount = useMemo(() => weekly.filter((o) => o.self_score > 0).length, [weekly])

  const outputDiff = weekly.length - lastWeek.length
  const scoreDiff = Number((avgScore - lastAvgScore).toFixed(1))

  const thisWeekGoals = weeklyGoals.filter((g) => g.week === weekKey)
  const doneCount = thisWeekGoals.filter((g) => g.done).length
  const goalDoneRate = thisWeekGoals.length > 0 ? doneCount / thisWeekGoals.length : 0

  const message = useMemo(
    () => getEncouragementMessage(weekly.length, weekInputs.length, avgScore, scoreDiff, goalDoneRate),
    [weekly.length, weekInputs.length, avgScore, scoreDiff, goalDoneRate],
  )

  // 観点別平均（自己・他者）
  const criteriaAvg = useMemo(() => {
    const scored = weekly.filter((o) => o.self_score_detail)
    const peerScored = weekly.filter((o) => o.peer_score_detail)
    return SELF_SCORE_CRITERIA.map((c) => {
      const selfAvg = scored.length > 0
        ? scored.reduce((sum, o) => sum + (o.self_score_detail?.[c.key] ?? 0), 0) / scored.length
        : 0
      const peerAvg = peerScored.length > 0
        ? peerScored.reduce((sum, o) => sum + (o.peer_score_detail?.[c.key] ?? 0), 0) / peerScored.length
        : undefined
      return { label: c.label, value: selfAvg, peerValue: peerAvg }
    })
  }, [weekly])

  const hasCriteriaData = criteriaAvg.some((d) => d.value > 0)

  // 自己 vs 他者 平均比較
  const reviewedOutputs = weekly.filter((o) => o.peer_score != null)
  const avgSelf = reviewedOutputs.length > 0
    ? reviewedOutputs.reduce((s, o) => s + o.self_score, 0) / reviewedOutputs.length
    : null
  const avgPeer = reviewedOutputs.length > 0
    ? reviewedOutputs.reduce((s, o) => s + (o.peer_score ?? 0), 0) / reviewedOutputs.length
    : null

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

  const maxCount = Math.max(weekly.length, lastWeek.length, 1)

  // Week label for navigation
  const weekLabel = isCurrentWeek
    ? '今週'
    : `${format(weekStart, 'M/d')}〜${format(weekEnd, 'M/d')}`

  const prevWeekLabel = `${format(prevStart, 'M/d')}〜${format(prevEnd, 'M/d')}`

  return (
    <Modal open={open} onClose={onClose} title="週次レポート">
      <div className="space-y-5">
        {/* 週ナビゲーション */}
        <div className="flex items-center justify-between bg-surface-secondary rounded-lg px-3 py-2">
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            className="p-1 rounded hover:bg-surface transition-colors"
          >
            <ChevronLeft size={18} className="text-text-secondary" />
          </button>
          <span className="text-sm font-medium text-text-primary">{weekLabel}</span>
          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            disabled={weekOffset >= 0}
            className="p-1 rounded hover:bg-surface transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={18} className="text-text-secondary" />
          </button>
        </div>

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
          <h3 className="text-sm font-medium mb-2">成績</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-surface-secondary rounded-lg p-3">
              <p className="text-[11px] text-text-secondary">アウトプット</p>
              <div className="flex items-center gap-1.5 mt-0.5">
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
              <p className="text-[11px] text-text-secondary">インプット</p>
              <span className="text-xl font-medium">{weekInputs.length}</span>
            </div>
            <div className="bg-surface-secondary rounded-lg p-3">
              <p className="text-[11px] text-text-secondary">自己採点</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xl font-medium">{selfScoredCount}件</span>
                {selfScoredCount > 0 && <span className="text-[11px] text-text-tertiary">avg {avgScore.toFixed(1)}</span>}
              </div>
            </div>
            <div className="bg-surface-secondary rounded-lg p-3">
              <p className="text-[11px] text-text-secondary">他者採点</p>
              <span className="text-xl font-medium">{peerCount}件</span>
            </div>
          </div>
        </div>

        {/* ── グラフ① IN/OUT 比率バー ── */}
        <div>
          <h3 className="text-sm font-medium mb-2">IN / OUT バランス</h3>
          <div className="bg-surface-secondary rounded-lg p-3 space-y-2">
            {(weekly.length + weekInputs.length) > 0 ? (
              <>
                <div className="flex h-5 rounded-full overflow-hidden text-[10px] font-medium">
                  <div
                    className="bg-primary flex items-center justify-center text-white transition-all"
                    style={{ width: `${(weekInputs.length / (weekInputs.length + weekly.length)) * 100}%`, minWidth: weekInputs.length > 0 ? '20%' : '0' }}
                  >
                    {weekInputs.length > 0 && `IN ${weekInputs.length}`}
                  </div>
                  <div
                    className="bg-waiting flex items-center justify-center text-white transition-all"
                    style={{ width: `${(weekly.length / (weekInputs.length + weekly.length)) * 100}%`, minWidth: weekly.length > 0 ? '20%' : '0' }}
                  >
                    {weekly.length > 0 && `OUT ${weekly.length}`}
                  </div>
                </div>
                <p className="text-[11px] text-text-tertiary text-center">
                  目標比率: <span className="text-primary font-medium">IN 3割</span> : <span className="text-waiting font-medium">OUT 7割</span>
                </p>
              </>
            ) : (
              <p className="text-[12px] text-text-tertiary text-center py-2">まだ記録がありません</p>
            )}
          </div>
        </div>

        {/* ── グラフ② 今週 vs 前週 ── */}
        <div>
          <h3 className="text-sm font-medium mb-2">
            {isCurrentWeek ? '今週 vs 先週' : `${weekLabel} vs ${prevWeekLabel}`}
          </h3>
          <div className="space-y-3 bg-surface-secondary rounded-lg p-3">
            {/* アウトプット数 */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-text-secondary">アウトプット数</span>
                <span className="text-text-tertiary">{weekly.length} / {lastWeek.length}</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-text-tertiary w-8">選択週</span>
                  <div className="flex-1 h-3 bg-surface rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(weekly.length / maxCount) * 100}%` }} />
                  </div>
                  <span className="text-[10px] text-primary w-4 text-right font-medium">{weekly.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-text-tertiary w-8">前週</span>
                  <div className="flex-1 h-3 bg-surface rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-text-tertiary" style={{ width: `${(lastWeek.length / maxCount) * 100}%` }} />
                  </div>
                  <span className="text-[10px] text-text-tertiary w-4 text-right">{lastWeek.length}</span>
                </div>
              </div>
            </div>
            {/* 自己採点平均 */}
            {(avgScore > 0 || lastAvgScore > 0) && (
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-text-secondary">自己採点平均</span>
                  <div className="flex items-center gap-1">
                    <span className="text-text-tertiary">{avgScore.toFixed(1)} / {lastAvgScore.toFixed(1)}</span>
                    <TrendIcon value={scoreDiff} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-tertiary w-8">選択週</span>
                    <div className="flex-1 h-3 bg-surface rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-waiting" style={{ width: `${(avgScore / 10) * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-waiting w-6 text-right font-medium">{avgScore.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-tertiary w-8">前週</span>
                    <div className="flex-1 h-3 bg-surface rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-text-tertiary" style={{ width: `${(lastAvgScore / 10) * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-text-tertiary w-6 text-right">{lastAvgScore.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── 自己 vs 他者 平均比較 ── */}
        {avgSelf !== null && avgPeer !== null && (
          <div>
            <h3 className="text-sm font-medium mb-2">自己 vs 他者 平均</h3>
            <div className="bg-surface-secondary rounded-lg p-3">
              <div className="flex items-center gap-4 mb-2">
                <div className="flex-1 text-center">
                  <p className="text-[10px] text-text-tertiary">自己採点</p>
                  <p className="text-2xl font-bold text-waiting">{avgSelf.toFixed(1)}</p>
                </div>
                <div className="text-text-tertiary text-sm">vs</div>
                <div className="flex-1 text-center">
                  <p className="text-[10px] text-text-tertiary">他者採点</p>
                  <p className="text-2xl font-bold text-done">{avgPeer.toFixed(1)}</p>
                </div>
              </div>
              <p className="text-[11px] text-center font-medium">
                {(() => {
                  const gap = avgSelf - avgPeer
                  if (Math.abs(gap) < 0.3) return <span className="text-done">自己評価と他者評価がほぼ一致</span>
                  if (gap > 0) return <span className="text-waiting">自己評価が{gap.toFixed(1)}点高め（甘め）</span>
                  return <span className="text-primary">自己評価が{Math.abs(gap).toFixed(1)}点低め（辛め）</span>
                })()}
              </p>
              <p className="text-[10px] text-text-tertiary text-center mt-1">{reviewedOutputs.length}件のFBを元に算出</p>
            </div>
          </div>
        )}

        {/* ── グラフ③ 観点別レーダーチャート ── */}
        {hasCriteriaData && (
          <div>
            <h3 className="text-sm font-medium mb-2">観点別スコア（週平均）</h3>
            <div className="bg-surface-secondary rounded-lg p-3 flex flex-col items-center">
              <RadarChart data={criteriaAvg} />
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-1.5 rounded-full bg-blue-500" />
                  <span className="text-[10px] text-text-tertiary">自己</span>
                </div>
                {criteriaAvg.some((d) => d.peerValue != null) && (
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] text-text-tertiary">他者</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── グラフ④ アウトプット別スコアバー ── */}
        {weekly.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">アウトプット別スコア</h3>
            <div className="bg-surface-secondary rounded-lg p-3 space-y-3">
              {weekly.map((o) => (
                <ScoreBar
                  key={o.id}
                  label={o.title}
                  selfScore={o.self_score}
                  peerScore={o.peer_score ?? undefined}
                />
              ))}
            </div>
          </div>
        )}

        {/* 今週の目標 */}
        <div className="bg-primary-bg rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] font-medium text-primary">目標</p>
            {thisWeekGoals.length > 0 && (
              <span className="text-[11px] text-text-tertiary">{doneCount}/{thisWeekGoals.length} 達成</span>
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
                      goal.done ? 'bg-done border-done' : 'border-border-card hover:border-primary'
                    }`}
                  >
                    {goal.done && <Check size={12} className="text-white" />}
                  </button>
                  <span className={`text-sm flex-1 ${goal.done ? 'line-through text-text-tertiary' : 'text-text-primary'}`}>
                    {goal.goal}
                  </span>
                  <button type="button" onClick={() => deleteWeeklyGoal(goal.id)} className="text-text-tertiary hover:text-red-500 p-0.5 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-tertiary mb-3">
              {isCurrentWeek ? '目標を追加しましょう' : 'この週の目標はありません'}
            </p>
          )}
          {isCurrentWeek && (
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
          )}
        </div>
      </div>
    </Modal>
  )
}
