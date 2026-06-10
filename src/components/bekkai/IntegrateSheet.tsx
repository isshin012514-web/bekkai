import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import type { Bekkai, BekkaiAxis } from '@/lib/types'
import { BEKKAI_AXIS_LABELS, BEKKAI_SCORE_LABELS } from '@/lib/types'

const AXES: { key: BekkaiAxis; color: string; bg: string }[] = [
  { key: 'self', color: '#6366f1', bg: '#EEF2FF' },
  { key: 'excellent', color: '#D97706', bg: '#FFFBEB' },
  { key: 'different', color: '#059669', bg: '#ECFDF5' },
]

const PROMPTS = [
  '3つが重なる部分はどこ？',
  '弱い領域をあえて活かすなら？',
  'この濃度だからこそできることは？',
  'マイナス面を逆手に取ると？',
]

interface IntegrateSheetProps {
  open: boolean
  bekkai: Bekkai
  onClose: () => void
  onEditAxis: (axis: BekkaiAxis) => void
  onChangeConclusion: (text: string) => void
  onConfirm: () => void
}

export function IntegrateSheet({ open, bekkai, onClose, onEditAxis, onChangeConclusion, onConfirm }: IntegrateSheetProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])
  if (!open) return null

  const insertPrompt = (t: string) => {
    onChangeConclusion(bekkai.conclusion ? `${bekkai.conclusion}\n【${t}】\n` : `【${t}】\n`)
  }

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-end justify-center" onClick={(e) => { if (e.target === overlayRef.current) onClose() }}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative w-full max-w-[430px] bg-surface rounded-t-2xl max-h-[88vh] flex flex-col animate-slide-up">
        <div className="w-9 h-1 rounded-full bg-black/15 mx-auto mt-2" />
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border-card">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-red-600" />
          <h2 className="text-[15px] font-semibold flex-1">統合して別解を導く</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-secondary"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {AXES.map(({ key, color, bg }) => {
            const a = bekkai[key]
            const label = a.score > 0 ? `${BEKKAI_SCORE_LABELS[a.score]}（${a.score}）` : '未評価'
            return (
              <div key={key} onClick={() => onEditAxis(key)} className="flex items-start gap-2.5 py-2.5 border-b border-black/5 cursor-pointer active:bg-surface-secondary rounded-md">
                <span className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-text-tertiary">{BEKKAI_AXIS_LABELS[key]}</div>
                  <div className="text-[13px] font-bold my-px">{label}</div>
                  <div className="text-[11px] text-text-secondary leading-snug whitespace-pre-wrap">{a.reason || '（理由未入力）'}</div>
                  {a.ideas.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {a.ideas.map((t, i) => <span key={i} className="text-[10px] px-1.5 py-px rounded-lg" style={{ background: bg, color }}>{t}</span>)}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-text-tertiary flex-shrink-0 pt-1">編集</span>
              </div>
            )
          })}
          {bekkai.downside && (
            <div onClick={() => onEditAxis('different')} className="flex items-start gap-2.5 py-2.5 cursor-pointer active:bg-surface-secondary rounded-md">
              <span className="w-2 h-2 rounded-full mt-1 flex-shrink-0 bg-red-600" />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-text-tertiary">マイナス面と打ち手</div>
                <div className="text-[11px] text-text-secondary leading-snug whitespace-pre-wrap">{bekkai.downside}</div>
              </div>
              <span className="text-[10px] text-text-tertiary flex-shrink-0 pt-1">編集</span>
            </div>
          )}

          <span className="text-[13px] font-semibold text-red-600 block mb-1.5 mt-4">あなたの「別解」は何か？</span>
          <textarea value={bekkai.conclusion} onChange={(e) => onChangeConclusion(e.target.value)}
            placeholder="3つの視点を踏まえて、あなたならではの別解を言語化してください"
            className="w-full min-h-[80px] border border-red-200 rounded-lg p-3 text-[13px] resize-none outline-none leading-relaxed bg-red-50 text-text-primary focus:border-red-600" />
          <div className="flex flex-wrap gap-1 mt-2 mb-4">
            {PROMPTS.map((p) => (
              <button key={p} onClick={() => insertPrompt(p)} className="text-[10px] px-2 py-1 rounded-xl bg-red-50 border border-red-100 text-red-600">{p}</button>
            ))}
          </div>

          <button onClick={onConfirm} className="w-full py-3 rounded-[10px] text-white text-sm font-semibold mb-4 bg-red-600">別解を確定する</button>
        </div>
      </div>
    </div>
  )
}
