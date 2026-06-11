import { useEffect, useMemo } from 'react'
import { useGrowthStore } from '@/stores/growth-store'
import { useBekkaiStore } from '@/stores/bekkai-store'
import { useEntriesStore } from '@/discovery/stores/entries-store'
import { currentStreak } from '@/lib/daily'
import { earnedBadges, BADGES } from '@/lib/badges'
import { celebrate } from '@/stores/celebrate-store'
import { toast } from '@/stores/toast-store'

const SEEN_KEY = 'earned-badges'

export function Badges() {
  const { outputs, inputs, failurePower, realizationPower } = useGrowthStore()
  const bekkais = useBekkaiStore((s) => s.bekkais)
  const entries = useEntriesStore((s: { entries: Record<string, unknown[]> }) => s.entries)

  const ctx = useMemo(() => {
    const discovery = Object.values(entries ?? {}).reduce((s, v) => s + (Array.isArray(v) ? v.length : 0), 0)
    const failure = failurePower ? Object.values(failurePower).reduce((s, v) => s + (Array.isArray(v) ? v.length : 0), 0) : 0
    const realization = realizationPower ? realizationPower.combinations.length + realizationPower.quantityQualities.length + realizationPower.team.length : 0
    const realizationDone = realizationPower ? realizationPower.combinations.filter((c) => c.status === 'succeeded').length : 0
    const dates = [
      ...outputs.map((o) => o.created_at), ...inputs.map((i) => i.created_at), ...bekkais.map((b) => b.created_at),
    ]
    return {
      discovery, failure, realization, realizationDone,
      bekkaiTotal: bekkais.length,
      bekkaiDone: bekkais.filter((b) => b.conclusion?.trim()).length,
      outputs: outputs.length, inputs: inputs.length,
      streak: currentStreak(dates),
    }
  }, [outputs, inputs, bekkais, failurePower, realizationPower, entries])

  const earned = useMemo(() => earnedBadges(ctx), [ctx])

  // 新しく獲得した称号を検出して祝う
  useEffect(() => {
    let seen: string[] = []
    try { seen = JSON.parse(localStorage.getItem(SEEN_KEY) || '[]') } catch { /* noop */ }
    const fresh = earned.filter((b) => !seen.includes(b.key))
    if (fresh.length > 0 && seen.length >= 0) {
      // 初回ロードで一気に獲得済みを祝わないよう、seen が未保存(null)なら祝わず保存だけ
      const hadKey = localStorage.getItem(SEEN_KEY) !== null
      if (hadKey) { celebrate(); toast(`🎖 称号「${fresh[0].label}」を獲得！`) }
      try { localStorage.setItem(SEEN_KEY, JSON.stringify(earned.map((b) => b.key))) } catch { /* noop */ }
    }
  }, [earned])

  if (earned.length === 0) return null

  return (
    <div className="mx-4 mt-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-[12px] font-medium text-text-secondary">獲得した称号</span>
        <span className="text-[10px] text-text-tertiary">{earned.length}/{BADGES.length}</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {earned.map((b) => (
          <div key={b.key} title={b.desc}
            className="shrink-0 flex flex-col items-center justify-center gap-1 w-16 h-[68px] rounded-xl border bg-surface"
            style={{ borderColor: `${b.color}33` }}>
            <span className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${b.color}1A` }}>
              <b.Icon size={17} style={{ color: b.color }} strokeWidth={2.2} />
            </span>
            <span className="text-[8px] text-text-secondary text-center leading-tight px-1">{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
