import { ArrowRight, RotateCcw } from 'lucide-react'

const STEPS = [
  { label: 'INPUT', color: 'bg-primary text-white' },
  { label: 'OUTPUT\nx100倍', color: 'bg-waiting text-white' },
  { label: '採点', color: 'bg-done text-white' },
  { label: '次の打手', color: 'bg-primary-light text-white' },
] as const

export function GrowthCycleSection() {
  return (
    <section className="mx-4 mt-4 border border-border-card rounded-lg p-4">
      <h2 className="text-sm font-medium mb-3">成長サイクル</h2>
      <div className="flex items-center justify-between gap-1">
        {STEPS.map((step, i) => (
          <div key={step.label} className="flex items-center gap-1">
            <div
              className={`${step.color} px-2 py-1.5 rounded text-[11px] font-medium text-center whitespace-pre-line leading-tight`}
            >
              {step.label}
            </div>
            {i < STEPS.length - 1 && (
              <ArrowRight size={12} className="text-text-tertiary shrink-0" />
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-1 mt-2 text-[11px] text-text-tertiary">
        <RotateCcw size={12} />
        <span>ループしてINPUTに戻る</span>
      </div>
    </section>
  )
}
