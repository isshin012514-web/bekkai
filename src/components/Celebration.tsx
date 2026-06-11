import { useEffect, useState } from 'react'
import { useCelebrate } from '@/stores/celebrate-store'

const COLORS = ['#DC2626', '#EA580C', '#F59E0B', '#185FA5', '#7c6cff', '#0D9488', '#059669']

export function Celebration() {
  const id = useCelebrate((s) => s.id)
  const [on, setOn] = useState(false)

  useEffect(() => {
    if (!id) return
    setOn(true)
    const t = setTimeout(() => setOn(false), 1100)
    return () => clearTimeout(t)
  }, [id])

  if (!on) return null

  const N = 20
  return (
    <div className="fixed inset-0 z-[90] pointer-events-none flex items-center justify-center">
      {Array.from({ length: N }).map((_, i) => {
        const ang = (i / N) * 360 + (i % 2 ? 9 : 0)
        const dist = 110 + (i % 4) * 36
        const x = Math.cos((ang * Math.PI) / 180) * dist
        const y = Math.sin((ang * Math.PI) / 180) * dist - 30
        const style = {
          background: COLORS[i % COLORS.length],
          animationDelay: `${(i % 5) * 25}ms`,
          ['--tx' as string]: `${x.toFixed(0)}px`,
          ['--ty' as string]: `${y.toFixed(0)}px`,
        } as React.CSSProperties
        return <span key={`${id}-${i}`} className="confetti-piece" style={style} />
      })}
    </div>
  )
}
