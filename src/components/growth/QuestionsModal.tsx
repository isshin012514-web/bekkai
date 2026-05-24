import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import type { UpcomingPerson } from '@/lib/types'
import { Modal } from '@/components/ui/Modal'
import { useGrowthStore } from '@/stores/growth-store'

interface QuestionsModalProps {
  open: boolean
  onClose: () => void
  person: UpcomingPerson | null
}

export function QuestionsModal({ open, onClose, person }: QuestionsModalProps) {
  const updateUpcomingPerson = useGrowthStore((s) => s.updateUpcomingPerson)
  const markAsMet = useGrowthStore((s) => s.markAsMet)
  const [newQuestion, setNewQuestion] = useState('')
  const [learnings, setLearnings] = useState('')
  const [showMetForm, setShowMetForm] = useState(false)

  if (!person) return null

  const handleAddQuestion = () => {
    if (!newQuestion.trim() || person.questions.length >= 10) return
    updateUpcomingPerson(person.id, {
      questions: [...person.questions, newQuestion.trim()],
    })
    setNewQuestion('')
  }

  const handleRemoveQuestion = (index: number) => {
    updateUpcomingPerson(person.id, {
      questions: person.questions.filter((_, i) => i !== index),
    })
  }

  const handleMarkAsMet = () => {
    markAsMet(person.id, learnings)
    setShowMetForm(false)
    setLearnings('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="質問リスト">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-medium">{person.name}</h3>
            {person.meeting_date && (
              <p className="text-[11px] text-text-tertiary">
                予定日: {format(new Date(person.meeting_date), 'yyyy/MM/dd')}
              </p>
            )}
          </div>
          <span className={`text-sm font-medium ${person.questions.length >= 10 ? 'text-done' : 'text-waiting'}`}>
            {person.questions.length} / 10
          </span>
        </div>

        <div className="h-1.5 bg-surface-secondary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${(person.questions.length / 10) * 100}%`,
              backgroundColor: person.questions.length >= 10 ? 'var(--color-done)' : 'var(--color-waiting)',
            }}
          />
        </div>

        {!person.met && person.questions.length < 10 && (
          <div className="flex gap-2">
            <input
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="質問を追加..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddQuestion()
                }
              }}
              className="flex-1 px-3 py-2 border border-border-card rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-surface"
            />
            <button
              type="button"
              onClick={handleAddQuestion}
              className="px-3 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus size={16} />
            </button>
          </div>
        )}

        <div className="space-y-2">
          {person.questions.map((q, i) => (
            <div key={i} className="flex items-start gap-2 bg-surface-secondary rounded-lg p-3">
              <span className="text-[11px] text-text-tertiary font-medium mt-0.5 shrink-0">
                {i + 1}.
              </span>
              <p className="text-sm flex-1">{q}</p>
              {!person.met && (
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(i)}
                  className="p-1 text-text-tertiary hover:text-red-500 shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        {!person.met && (
          <>
            {showMetForm ? (
              <div className="space-y-3 pt-3 border-t border-border-card">
                <textarea
                  value={learnings}
                  onChange={(e) => setLearnings(e.target.value)}
                  placeholder="この人から学んだこと..."
                  rows={3}
                  className="w-full px-3 py-2.5 border border-border-card rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none bg-surface"
                />
                <button
                  type="button"
                  onClick={handleMarkAsMet}
                  className="w-full py-2.5 bg-done text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  会った記録をつける
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowMetForm(true)}
                className="w-full py-2.5 border border-done text-done rounded-lg text-sm font-medium hover:bg-done-bg transition-colors"
              >
                会えた！
              </button>
            )}
          </>
        )}

        {person.met && person.learnings_after && (
          <div className="bg-done-bg rounded-lg p-3">
            <p className="text-[12px] font-medium text-done mb-1">学び</p>
            <p className="text-sm">{person.learnings_after}</p>
          </div>
        )}
      </div>
    </Modal>
  )
}
