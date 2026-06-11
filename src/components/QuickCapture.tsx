import { useEffect, useRef, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useGrowthStore } from '@/stores/growth-store'
import { toast } from '@/stores/toast-store'

/**
 * どこからでも開けるクイックメモ。思いつきを成長力のインプット（その他）として保存。
 * 右下のFAB → 入力シート。
 */
export function QuickCapture() {
  const addInput = useGrowthStore((s) => s.addInput)
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const save = () => {
    if (!text.trim()) return
    addInput({ type: 'other', title: text.trim(), learning: 'クイックメモ' })
    setText(''); setOpen(false)
    toast('メモを保存しました')
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="クイックメモ"
        className="fixed right-4 z-30 w-12 h-12 rounded-full bg-primary text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 78px)' }}
      >
        <Plus size={24} />
      </button>

      {open && (
        <div ref={overlayRef} className="fixed inset-0 z-[70] flex items-end justify-center" onClick={(e) => { if (e.target === overlayRef.current) setOpen(false) }}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative w-full max-w-[430px] bg-surface rounded-t-2xl animate-slide-up">
            <div className="w-9 h-1 rounded-full bg-black/15 mx-auto mt-2" />
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border-card">
              <h2 className="text-[15px] font-semibold flex-1">さっとメモ</h2>
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-secondary"><X size={18} /></button>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-[11px] text-text-tertiary">思いついたことを書き留めて、あとで各機能に振り分けましょう。（成長力のインプットに保存）</p>
              <textarea
                autoFocus rows={3} value={text} onChange={(e) => setText(e.target.value)}
                placeholder="例：◯◯のやり方、別解になりそう"
                className="w-full text-[13px] bg-surface-secondary border border-border-card rounded-lg px-3 py-2.5 placeholder:text-text-tertiary focus:outline-none focus:border-primary"
              />
              <button onClick={save} disabled={!text.trim()}
                className="w-full py-2.5 rounded-lg text-sm font-medium text-white bg-primary disabled:opacity-40 disabled:cursor-not-allowed">
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
