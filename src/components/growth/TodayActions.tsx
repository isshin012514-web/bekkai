import { Plus, Send } from 'lucide-react'

interface TodayActionsProps {
  onAddOutput: () => void
  onRequestReview: () => void
}

export function TodayActions({ onAddOutput, onRequestReview }: TodayActionsProps) {
  return (
    <section className="mx-4 mt-4 bg-primary-bg rounded-lg p-4">
      <h2 className="text-sm font-medium text-primary mb-3">今日のアクション</h2>
      <div className="flex gap-3">
        <button
          onClick={onAddOutput}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          アウトプット
        </button>
        <button
          onClick={onRequestReview}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 border border-primary text-primary bg-surface rounded-lg text-sm font-medium hover:bg-primary-bg transition-colors"
        >
          <Send size={16} />
          採点依頼
        </button>
      </div>
    </section>
  )
}
