import { ChevronRight, RotateCcw } from 'lucide-react'

const STEPS = [
  { label: 'INPUT',  sub: '３割', bg: 'bg-sky-100',    text: 'text-sky-700',    border: 'border-sky-300' },
  { label: 'OUTPUT', sub: '７割', bg: 'bg-primary',     text: 'text-white',      border: 'border-primary' },
  { label: '採点',   sub: null,   bg: 'bg-emerald-500', text: 'text-white',      border: 'border-emerald-500' },
  { label: '次の打手', sub: null, bg: 'bg-slate-700',   text: 'text-white',      border: 'border-slate-700' },
]

export function GrowthCycleSection() {
  return (
    <section className="mx-4 mt-4 border border-border-card rounded-lg p-4">
      <h2 className="text-sm font-medium mb-3">成長サイクル</h2>
      <div className="flex items-center justify-between">
        {STEPS.map((step, i) => (
          <div key={step.label} className="flex items-center gap-1">
            <div className={`${step.bg} ${step.text} border ${step.border} rounded-lg px-2.5 py-2 text-center min-w-[52px]`}>
              <p className="text-[11px] font-bold leading-tight">{step.label}</p>
              {step.sub && <p className="text-[10px] leading-tight opacity-80">{step.sub}</p>}
            </div>
            {i < STEPS.length - 1 && <ChevronRight size={14} className="text-text-tertiary shrink-0" />}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-1 mt-2.5 text-[11px] text-text-tertiary">
        <RotateCcw size={11} />
        <span>ループしてINPUTに戻る</span>
      </div>
    </section>
  )
}
