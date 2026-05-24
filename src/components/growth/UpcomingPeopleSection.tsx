import { Calendar, MessageSquare } from 'lucide-react'
import type { UpcomingPerson } from '@/lib/types'
import { format } from 'date-fns'

interface UpcomingPeopleSectionProps {
  people: UpcomingPerson[]
  metCount: number
  totalQuestions: number
  onSelect: (person: UpcomingPerson) => void
  onAdd: () => void
}

export function UpcomingPeopleSection({
  people,
  metCount,
  totalQuestions,
  onSelect,
  onAdd,
}: UpcomingPeopleSectionProps) {
  const upcoming = people.filter((p) => !p.met)
  const current = upcoming[0]

  return (
    <section className="mx-4 mt-6 border border-border-card rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium">会いたい人 · 質問10</h2>
        <button onClick={onAdd} className="text-[12px] text-primary hover:underline">
          + 追加
        </button>
      </div>
      {current && (
        <button
          onClick={() => onSelect(current)}
          className="w-full text-left bg-surface-secondary rounded-lg p-3 mb-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={14} className="text-text-secondary" />
            <span className="text-sm font-medium">
              {current.name}
              {current.meeting_date && (
                <span className="text-text-secondary font-normal ml-1">
                  ({format(new Date(current.meeting_date), 'M/d')})
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare size={14} className="text-text-secondary" />
            <span className="text-[12px] text-text-secondary">
              質問 {current.questions.length} / 10 準備済
            </span>
          </div>
          <div className="mt-2 h-1.5 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(current.questions.length / 10) * 100}%`,
                backgroundColor: current.questions.length >= 10 ? 'var(--color-done)' : 'var(--color-waiting)',
              }}
            />
          </div>
        </button>
      )}
      <p className="text-[11px] text-text-tertiary">
        過去会った人 {metCount}人 · 質問総数 {totalQuestions}
      </p>
    </section>
  )
}
