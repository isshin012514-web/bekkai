import { useState } from 'react'
import { Sparkles, Check } from 'lucide-react'
import { useGrowthStore } from '@/stores/growth-store'
import { toast } from '@/stores/toast-store'
import { todaysQuestion, todayKey } from '@/lib/daily'

const ANSWERED_KEY = 'daily-answered'

function answeredToday(): boolean {
  try { return localStorage.getItem(ANSWERED_KEY) === todayKey() } catch { return false }
}

export function DailyPrompt() {
  const addInput = useGrowthStore((s) => s.addInput)
  const q = todaysQuestion()
  const [answer, setAnswer] = useState('')
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(answeredToday())

  const submit = () => {
    if (!answer.trim()) return
    addInput({ type: 'dialogue', title: answer.trim(), learning: `今日の問い: ${q.text}` })
    try { localStorage.setItem(ANSWERED_KEY, todayKey()) } catch { /* noop */ }
    setDone(true); setOpen(false); setAnswer('')
    toast('記録しました')
  }

  return (
    <div className="mx-4 mt-3 rounded-xl border border-border-card overflow-hidden">
      <div className="px-4 py-3 bg-primary-bg">
        <div className="flex items-center gap-1.5 mb-1">
          <Sparkles size={12} className="text-primary" />
          <span className="text-[10px] font-medium text-primary">今日の問い</span>
          {done && <span className="ml-auto text-[10px] text-done flex items-center gap-0.5"><Check size={11} />記録済み</span>}
        </div>
        <p className="text-[13px] text-text-primary font-medium leading-snug">{q.text}</p>
      </div>

      {done && !open ? (
        <button onClick={() => { setDone(false); setOpen(true) }} className="w-full py-2 text-[11px] text-text-tertiary hover:bg-surface-secondary">
          もう一度書く
        </button>
      ) : open ? (
        <div className="p-3 space-y-2">
          <textarea
            autoFocus rows={2} value={answer} onChange={(e) => setAnswer(e.target.value)}
            placeholder="30秒で、思いつくままに"
            className="w-full text-[12px] bg-surface border border-border-card rounded-lg px-3 py-2 placeholder:text-text-tertiary focus:outline-none focus:border-primary"
          />
          <div className="flex gap-2">
            <button onClick={submit} disabled={!answer.trim()}
              className="flex-1 py-2 rounded-lg text-[12px] font-medium text-white bg-primary disabled:opacity-40 disabled:cursor-not-allowed">記録する</button>
            <button onClick={() => { setOpen(false); setAnswer('') }} className="px-4 py-2 border border-border-card rounded-lg text-[12px] text-text-secondary">閉じる</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="w-full py-2.5 text-[12px] font-medium text-primary hover:bg-surface-secondary">
          書いて記録する（30秒）
        </button>
      )}
    </div>
  )
}
