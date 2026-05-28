import { RotateCcw } from 'lucide-react'

interface WeeklyReviewButtonProps {
  onPress: () => void
}

export function WeeklyReviewButton({ onPress }: WeeklyReviewButtonProps) {
  return (
    <section className="mx-4 mt-4 mb-8">
      <button
        onClick={onPress}
        className="w-full flex items-center justify-between border border-border-card rounded-lg p-4 hover:bg-surface-secondary transition-colors"
      >
        <div className="flex items-center gap-2">
          <RotateCcw size={16} className="text-text-secondary" />
          <div className="text-left">
            <p className="text-sm font-medium">週次レポート</p>
            <p className="text-[11px] text-text-tertiary">日曜 21:00 リマインダー</p>
          </div>
        </div>
      </button>
    </section>
  )
}
