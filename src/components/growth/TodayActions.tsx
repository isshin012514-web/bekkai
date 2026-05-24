import { BookOpen, ArrowDown, PenLine, Share2, Plus } from 'lucide-react'

interface TodayActionsProps {
  onAddOutput: () => void
  onRequestReview: () => void
  onAddInput: () => void
  onSelfScore: () => void
}

export function TodayActions({ onAddOutput, onRequestReview, onAddInput, onSelfScore }: TodayActionsProps) {
  return (
    <section className="mx-4 mt-4 bg-primary-bg rounded-lg p-4">
      <h2 className="text-sm font-medium text-primary mb-3">アクション</h2>
      <div className="flex flex-col items-center gap-0">
        {/* Step 1: Input */}
        <button
          onClick={onAddInput}
          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-primary/40 text-primary bg-surface rounded-lg text-[12px] font-medium hover:bg-primary-bg transition-colors"
        >
          <BookOpen size={14} />
          インプットを記録
        </button>

        <ArrowDown size={14} className="text-primary/40 my-1" />

        {/* Step 2: Output */}
        <button
          onClick={onAddOutput}
          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          アウトプットを記録
        </button>

        <ArrowDown size={14} className="text-primary/40 my-1" />

        {/* Step 3: Self Score */}
        <button
          onClick={onSelfScore}
          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-primary/40 text-primary bg-surface rounded-lg text-[12px] font-medium hover:bg-primary-bg transition-colors"
        >
          <PenLine size={14} />
          自己採点
        </button>

        <ArrowDown size={14} className="text-primary/40 my-1" />

        {/* Step 4: Request Review (with share) */}
        <button
          onClick={onRequestReview}
          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-primary/40 text-primary bg-surface rounded-lg text-[12px] font-medium hover:bg-primary-bg transition-colors"
        >
          <Share2 size={14} />
          採点依頼
        </button>
      </div>
    </section>
  )
}
