import { useMemo } from 'react'
import { RotateCcw } from 'lucide-react'
import { useGrowthStore } from '@/stores/growth-store'
import { weeklyOutputs, weeklyInputs } from '@/lib/utils'

interface WeeklyReviewButtonProps {
  onPress: () => void
}

export function WeeklyReviewButton({ onPress }: WeeklyReviewButtonProps) {
  const { outputs, inputs, weeklyGoals, lastWeeklyReportViewedAt } = useGrowthStore()

  const hasUpdate = useMemo(() => {
    if (!lastWeeklyReportViewedAt) return true
    const viewedAt = new Date(lastWeeklyReportViewedAt).getTime()

    const weekly = weeklyOutputs(outputs)
    const weekInput = weeklyInputs(inputs)

    const latestOutput = weekly.length > 0
      ? Math.max(...weekly.map((o) => new Date(o.created_at).getTime()))
      : 0
    const latestInput = weekInput.length > 0
      ? Math.max(...weekInput.map((i) => new Date(i.created_at).getTime()))
      : 0
    const latestGoal = weeklyGoals.length > 0
      ? Math.max(...weeklyGoals.map((g) => new Date(g.created_at).getTime()))
      : 0

    // Check if any scored_at is newer
    const latestScore = weekly.length > 0
      ? Math.max(...weekly.filter((o) => o.scored_at).map((o) => new Date(o.scored_at!).getTime()), 0)
      : 0

    const latest = Math.max(latestOutput, latestInput, latestGoal, latestScore)
    return latest > viewedAt
  }, [outputs, inputs, weeklyGoals, lastWeeklyReportViewedAt])

  return (
    <section className="mx-4 mt-4 mb-8">
      <button
        onClick={onPress}
        className="w-full flex items-center justify-between border border-border-card rounded-lg p-4 hover:bg-surface-secondary transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <RotateCcw size={16} className="text-text-secondary" />
            {hasUpdate && (
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white" />
            )}
          </div>
          <div className="text-left">
            <p className="text-sm font-medium">週次レポート</p>
            <p className="text-[11px] text-text-tertiary">日曜 21:00 リマインダー</p>
          </div>
        </div>
        {hasUpdate && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary text-white font-medium">NEW</span>
        )}
      </button>
    </section>
  )
}
