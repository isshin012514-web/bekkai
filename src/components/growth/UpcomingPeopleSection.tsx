import { useState } from 'react'
import { Calendar, MessageSquare, ChevronDown, ChevronUp, Plus } from 'lucide-react'
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
  const [open, setOpen] = useState(false)
  const upcoming = people.filter((p) => !p.met)

  return (
    <section className="mx-4 mt-4 border border-border-card rounded-lg">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium">会いたい人 · 質問10</h2>
          <span className="text-[11px] text-text-tertiary">{upcoming.length}人予定</span>
        </div>
        {open ? <ChevronUp size={16} className="text-text-tertiary" /> : <ChevronDown size={16} className="text-text-tertiary" />}
      </button>

      {open && (
        <div className="px-4 pb-4">
          {upcoming.length === 0 && (
            <p className="text-sm text-text-tertiary text-center py-3">
              会いたい人を追加して質問を準備しましょう
            </p>
          )}
          {upcoming.map((person) => (
            <button
              key={person.id}
              onClick={() => onSelect(person)}
              className="w-full text-left bg-surface-secondary rounded-lg p-3 mb-2"
            >
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={14} className="text-text-secondary" />
                <span className="text-sm font-medium">
                  {person.name}
                  {person.meeting_date && (
                    <span className="text-text-secondary font-normal ml-1">
                      ({format(new Date(person.meeting_date), 'M/d')})
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare size={14} className="text-text-secondary" />
                <span className="text-[12px] text-text-secondary">
                  質問 {person.questions.length} / 10 準備済
                </span>
              </div>
              <div className="mt-2 h-1.5 bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(person.questions.length / 10) * 100}%`,
                    backgroundColor: person.questions.length >= 10 ? 'var(--color-done)' : 'var(--color-waiting)',
                  }}
                />
              </div>
            </button>
          ))}
          <div className="flex items-center justify-between mt-1">
            <p className="text-[11px] text-text-tertiary">
              過去会った人 {metCount}人 · 質問総数 {totalQuestions}
            </p>
            <button onClick={onAdd} className="inline-flex items-center gap-1 text-[12px] text-primary hover:underline">
              <Plus size={12} />
              追加
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
