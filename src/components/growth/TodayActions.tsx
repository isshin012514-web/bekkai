import { BookOpen, ArrowDown, PenLine, Plus, MessageSquare, Zap } from 'lucide-react'

interface TodayActionsProps {
  onAddOutput: () => void
  onAddInput: () => void
  onSelfScore: () => void
  onEnterFeedback: () => void
  onNextActionPlan: () => void
}

export function TodayActions({ onAddOutput, onAddInput, onSelfScore, onEnterFeedback, onNextActionPlan }: TodayActionsProps) {

  return (
    <section className="mx-4 mt-4 bg-primary-bg rounded-lg p-4">
      <h2 className="text-sm font-medium text-primary mb-3">アクション</h2>
      <div className="flex flex-col items-center gap-0">
        {/* 全て青塗りで統一 */}
        <button onClick={onAddInput}
          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-lg text-[13px] font-medium hover:opacity-90 transition-opacity">
          <BookOpen size={15} />インプットを記録
        </button>

        <ArrowDown size={14} className="text-primary/40 my-1" />

        <button onClick={onAddOutput}
          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
          <Plus size={16} />アウトプットを記録
        </button>

        <ArrowDown size={14} className="text-primary/40 my-1" />

        <button onClick={onSelfScore}
          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-lg text-[13px] font-medium hover:opacity-90 transition-opacity">
          <PenLine size={15} />自己採点
        </button>

        <ArrowDown size={14} className="text-primary/40 my-1" />

        <button onClick={onEnterFeedback}
          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-lg text-[13px] font-medium hover:opacity-90 transition-opacity">
          <MessageSquare size={15} />フィードバック
        </button>

        <ArrowDown size={14} className="text-primary/40 my-1" />

        <button onClick={onNextActionPlan}
          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-lg text-[13px] font-medium hover:opacity-90 transition-opacity">
          <Zap size={15} />次の打ち手を立てる
        </button>
      </div>
    </section>
  )
}
