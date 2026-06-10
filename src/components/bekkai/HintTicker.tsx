import { useEffect, useState } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { BEKKAI_HINTS, BEKKAI_CAT_COLOR } from '@/lib/bekkai-hints'

export function HintTicker() {
  const [idx, setIdx] = useState(0)
  const [open, setOpen] = useState(false)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    if (open) return
    const t = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setIdx((i) => (i + 1) % BEKKAI_HINTS.length)
        setFade(true)
      }, 150)
    }, 5000)
    return () => clearInterval(t)
  }, [open])

  const hint = BEKKAI_HINTS[idx]
  const color = BEKKAI_CAT_COLOR[hint.cat]

  const step = (delta: number) => {
    setFade(false)
    setTimeout(() => {
      setIdx((i) => (i + delta + BEKKAI_HINTS.length) % BEKKAI_HINTS.length)
      setFade(true)
    }, 120)
  }

  return (
    <div className="mx-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left bg-surface-secondary border border-border-card rounded-[10px] px-3.5 py-2.5 relative"
      >
        <div className="text-[9px] font-semibold uppercase tracking-[0.1em] text-text-tertiary flex items-center gap-1 mb-0.5">
          HINT
          <span className="text-[8px] px-1.5 py-px rounded font-semibold" style={{ background: color.bg, color: color.text }}>
            {hint.cat}
          </span>
        </div>
        <div className="text-[12px] font-medium text-text-primary leading-snug transition-opacity duration-300" style={{ opacity: fade ? 1 : 0 }}>
          {hint.title}
        </div>
        <ChevronRight size={14} className="text-text-tertiary absolute right-3 top-1/2 -translate-y-1/2" />
      </button>

      {open && (
        <div className="mt-2 p-3 bg-surface border border-border-card rounded-[10px]">
          <div className="text-[13px] font-semibold text-red-600 leading-relaxed mb-2">{hint.question}</div>
          <div className="text-[11px] text-text-secondary leading-relaxed mb-2.5">{hint.detail}</div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => step(-1)} className="inline-flex items-center gap-0.5 px-3 py-1.5 rounded-md text-[11px] border border-border-card text-text-secondary">
              <ChevronLeft size={12} />前
            </button>
            <button onClick={() => step(1)} className="inline-flex items-center gap-0.5 px-3 py-1.5 rounded-md text-[11px] bg-primary-bg text-primary border border-primary/20">
              次<ChevronRight size={12} />
            </button>
            <span className="text-[10px] text-text-tertiary ml-1">{idx + 1} / {BEKKAI_HINTS.length}</span>
            <button onClick={() => setOpen(false)} className="px-3 py-1.5 rounded-md text-[11px] border border-border-card text-text-secondary ml-auto">閉じる</button>
          </div>
        </div>
      )}
    </div>
  )
}
