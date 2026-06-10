import { useState } from 'react'
import { format } from 'date-fns'
import { Check, Target } from 'lucide-react'
import { useGrowthStore } from '@/stores/growth-store'
import { getWeekInterval } from '@/lib/utils'

export function WeeklyGoalsDisplay() {
  const { weeklyGoals, deleteWeeklyGoal } = useGrowthStore()
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  const { start: weekStart } = getWeekInterval()
  const weekKey = format(weekStart, 'yyyy-MM-dd')
  const thisWeekGoals = weeklyGoals.filter((g) => g.week === weekKey)

  if (thisWeekGoals.length === 0) return null

  const handleCheck = (id: string) => {
    if (deletingIds.has(id)) return
    setDeletingIds((prev) => new Set(prev).add(id))
    setTimeout(() => {
      deleteWeeklyGoal(id)
      setDeletingIds((prev) => { const s = new Set(prev); s.delete(id); return s })
    }, 600)
  }

  return (
    <section className="px-4 mt-3">
      <div className="bg-primary-bg rounded-lg px-3 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Target size={13} className="text-primary" />
            <span className="text-[12px] font-medium text-primary">今週の目標</span>
          </div>
          <span className="text-[11px] text-text-tertiary">{thisWeekGoals.length}件</span>
        </div>
        <div className="space-y-1.5">
          {thisWeekGoals.map((goal) => {
            const isDeleting = deletingIds.has(goal.id)
            return (
              <button
                key={goal.id}
                type="button"
                onClick={() => handleCheck(goal.id)}
                className={`w-full flex items-center gap-2 text-left transition-all duration-500 ${
                  isDeleting ? 'opacity-0 -translate-x-2' : 'opacity-100'
                }`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                  isDeleting
                    ? 'bg-done border-done'
                    : 'border-primary/40 hover:border-primary'
                }`}>
                  {isDeleting && <Check size={10} className="text-white" />}
                </div>
                <span className={`text-[12px] ${isDeleting ? 'line-through text-text-tertiary' : 'text-text-primary'}`}>
                  {goal.goal}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
