import { useEffect, useRef, useState } from 'react'
import { X, Link2, Plus } from 'lucide-react'
import type { BekkaiAreaEval, BekkaiAxis } from '@/lib/types'
import { BEKKAI_AXIS_LABELS, BEKKAI_AXIS_DESC } from '@/lib/types'
import { useBekkaiReferences } from './bekkai-references'

const AXIS_COLOR: Record<BekkaiAxis, string> = {
  self: '#6366f1', excellent: '#D97706', different: '#059669',
}
const SCORE_OPTS = [
  { v: 20, l: '弱い' }, { v: 40, l: 'やや弱' }, { v: 60, l: 'やや強' }, { v: 80, l: '強い' }, { v: 100, l: '核心' },
]

interface AreaSheetProps {
  axis: BekkaiAxis | null
  value: BekkaiAreaEval
  downside?: string // only for 'different'
  onClose: () => void
  onChange: (value: BekkaiAreaEval) => void
  onDownsideChange: (text: string) => void
}

export function AreaSheet({ axis, value, downside, onClose, onChange, onDownsideChange }: AreaSheetProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [ideaDraft, setIdeaDraft] = useState('')
  const [refOpen, setRefOpen] = useState(false)
  const refs = useBekkaiReferences(axis ?? 'self')

  useEffect(() => {
    if (axis) {
      document.body.style.overflow = 'hidden'
      setIdeaDraft('')
      setRefOpen(false)
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [axis])

  if (!axis) return null
  const color = AXIS_COLOR[axis]

  const addIdea = () => {
    const t = ideaDraft.trim()
    if (!t) return
    onChange({ ...value, ideas: [...value.ideas, t] })
    setIdeaDraft('')
  }
  const rmIdea = (i: number) => onChange({ ...value, ideas: value.ideas.filter((_, idx) => idx !== i) })

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-end justify-center" onClick={(e) => { if (e.target === overlayRef.current) onClose() }}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative w-full max-w-[430px] bg-surface rounded-t-2xl max-h-[88vh] flex flex-col animate-slide-up">
        <div className="w-9 h-1 rounded-full bg-black/15 mx-auto mt-2" />
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border-card">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
          <h2 className="text-[15px] font-semibold flex-1">{BEKKAI_AXIS_LABELS[axis]}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-secondary"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <p className="text-[11px] text-text-secondary leading-relaxed mb-3.5">{BEKKAI_AXIS_DESC[axis]}</p>

          {/* Score */}
          <span className="text-[12px] font-medium block mb-1.5">この領域の強さ</span>
          <div className="flex gap-1 mb-4">
            {SCORE_OPTS.map((o) => {
              const sel = value.score === o.v
              return (
                <button key={o.v} onClick={() => onChange({ ...value, score: o.v })}
                  className="flex-1 py-2.5 rounded-lg border text-[11px] leading-tight transition-colors"
                  style={sel ? { background: color, color: 'white', borderColor: 'transparent' } : {}}
                  >
                  <span className={sel ? '' : 'text-text-secondary'}>{o.l}<br />{o.v}</span>
                </button>
              )
            })}
          </div>

          {/* Reason + references */}
          <span className="text-[12px] font-medium block mb-1.5">なぜその評価？</span>
          <div className="border border-border-card rounded-[10px] mb-3.5 overflow-hidden">
            <button onClick={() => setRefOpen((o) => !o)} className="w-full flex items-center gap-1.5 px-3 py-2.5 bg-surface-secondary text-[12px] font-medium text-text-secondary">
              <Link2 size={14} />成長力・発見力から参照
            </button>
            {refOpen && (
              <div className="px-3 py-2 border-t border-border-card">
                {refs.length === 0 ? (
                  <p className="text-[11px] text-text-tertiary py-2">参照できるデータがまだありません。成長力・発見力タブで記録すると、ここに表示されます。</p>
                ) : refs.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 py-2 border-b border-black/5 last:border-b-0 text-[11px] leading-snug">
                    <span className="text-[9px] font-semibold px-1.5 py-px rounded flex-shrink-0 mt-0.5" style={r.source === '成長力' ? { background: 'var(--color-primary-bg)', color: 'var(--color-primary)' } : { background: '#EDE9FE', color: '#7C3AED' }}>{r.source}</span>
                    <span className="text-text-secondary flex-1">{r.text}</span>
                    <button onClick={() => onChange({ ...value, reason: value.reason ? `${value.reason}\n→ ${r.quote}` : `→ ${r.quote}` })} className="text-[10px] text-primary flex-shrink-0 px-1.5 py-0.5 rounded">引用</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <textarea value={value.reason} onChange={(e) => onChange({ ...value, reason: e.target.value })}
            placeholder={axis === 'self' ? '自分の経験・価値観との接点を書く' : axis === 'excellent' ? '競合優位性・数字的根拠を書く' : '逆張り・ユニークさの根拠を書く'}
            className="w-full min-h-[68px] border border-border-card rounded-lg p-2.5 text-[13px] resize-none outline-none leading-relaxed mb-4 bg-surface text-text-primary focus:border-primary" />

          {/* Downside (different only) */}
          {axis === 'different' && (
            <>
              <span className="text-[12px] font-medium block mb-1.5">マイナス面と打ち手</span>
              <textarea value={downside ?? ''} onChange={(e) => onDownsideChange(e.target.value)}
                placeholder="例: スケールしにくい → コンテンツ化で拡散"
                className="w-full min-h-[68px] border border-border-card rounded-lg p-2.5 text-[13px] resize-none outline-none leading-relaxed mb-4 bg-surface text-text-primary focus:border-primary" />
            </>
          )}

          {/* Ideas */}
          <span className="text-[12px] font-medium block mb-1.5">この領域でのアイデア</span>
          <div className="flex gap-1.5 mb-1.5">
            <input value={ideaDraft} onChange={(e) => setIdeaDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addIdea() } }}
              placeholder="アイデアを入力" className="flex-1 px-2.5 py-2 border border-border-card rounded-lg text-[13px] outline-none bg-surface text-text-primary focus:border-primary" />
            <button onClick={addIdea} className="w-9 h-9 rounded-lg text-white flex items-center justify-center flex-shrink-0" style={{ background: color }}><Plus size={18} /></button>
          </div>
          <div className="flex flex-wrap gap-1 mb-4">
            {value.ideas.map((t, i) => (
              <span key={i} className="text-[11px] px-2 py-0.5 rounded-xl flex items-center gap-1" style={{ background: axis === 'self' ? '#EEF2FF' : axis === 'excellent' ? '#FFFBEB' : '#ECFDF5', color }}>
                {t}<button onClick={() => rmIdea(i)} className="opacity-50">×</button>
              </span>
            ))}
          </div>

          <button onClick={onClose} className="w-full py-3 rounded-[10px] text-white text-sm font-semibold mb-4" style={{ background: color }}>保存して戻る</button>
        </div>
      </div>
    </div>
  )
}
