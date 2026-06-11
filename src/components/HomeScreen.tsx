import { useMemo } from 'react'
import { TrendingUp, Search, Sparkles, Rocket, AlertTriangle, LineChart, ChevronRight } from 'lucide-react'
import type { AppTab } from '@/components/AppHeader'
import { useGrowthStore } from '@/stores/growth-store'
import { useBekkaiStore } from '@/stores/bekkai-store'
import { useEntriesStore } from '@/discovery/stores/entries-store'
import { weeklyOutputs } from '@/lib/utils'

interface HomeScreenProps {
  onNavigate: (tab: AppTab) => void
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const { outputs, inputs, failurePower, realizationPower } = useGrowthStore()
  const bekkais = useBekkaiStore((s) => s.bekkais)
  const entries = useEntriesStore((s: { entries: Record<string, unknown[]> }) => s.entries)

  const weekOut = useMemo(() => weeklyOutputs(outputs).length, [outputs])

  const forces = useMemo(() => {
    const discoveryCount = Object.values(entries ?? {}).reduce((s, v) => s + (Array.isArray(v) ? v.length : 0), 0)
    const failCount = failurePower ? Object.values(failurePower).reduce((s, v) => s + (Array.isArray(v) ? v.length : 0), 0) : 0
    const realCount = realizationPower ? realizationPower.combinations.length + realizationPower.quantityQualities.length + realizationPower.team.length : 0
    return [
      { key: 'growth' as AppTab, label: '成長力', sub: 'アウトプットで伸ばす', Icon: TrendingUp, color: '#185FA5', count: outputs.length + inputs.length },
      { key: 'discovery' as AppTab, label: '発見力', sub: '解くべき問題を見つける', Icon: Search, color: '#7c6cff', count: discoveryCount },
      { key: 'bekkai' as AppTab, label: '別解力', sub: '自分の答えを出す', Icon: Sparkles, color: '#DC2626', count: bekkais.length },
      { key: 'realization' as AppTab, label: '実現力', sub: '別解を形にする', Icon: Rocket, color: '#EA580C', count: realCount },
      { key: 'failure' as AppTab, label: '失敗力', sub: '転びを糧にする', Icon: AlertTriangle, color: '#0D9488', count: failCount },
    ]
  }, [outputs, inputs, entries, failurePower, realizationPower, bekkais])

  const total = forces.reduce((s, f) => s + f.count, 0)

  return (
    <div className="pb-6">
      {/* ヒーロー */}
      <div className="mx-4 mt-4 rounded-2xl px-5 py-5 text-white" style={{ background: 'linear-gradient(135deg,#185FA5,#7c6cff)' }}>
        <p className="text-[11px] opacity-80">ようこそ</p>
        <h1 className="text-xl font-bold mt-0.5">答えのない問いに、<br />自分の<span className="underline decoration-2 underline-offset-2">別解</span>を。</h1>
        <div className="flex gap-4 mt-3 text-[12px]">
          <span>記録 <b className="text-base">{total}</b> 件</span>
          <span>今週のOUT <b className="text-base">{weekOut}</b> 件</span>
        </div>
      </div>

      {/* 5つの力 */}
      <p className="mx-4 mt-5 mb-2 text-[12px] font-medium text-text-secondary">5つの力</p>
      <div className="mx-4 grid grid-cols-2 gap-2.5">
        {forces.map((f) => (
          <button
            key={f.key}
            onClick={() => onNavigate(f.key)}
            className="text-left border border-border-card rounded-xl p-3 hover:bg-surface-secondary transition-colors active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${f.color}1A` }}>
                <f.Icon size={18} style={{ color: f.color }} />
              </span>
              {f.count > 0 && (
                <span className="text-[11px] font-semibold" style={{ color: f.color }}>{f.count}</span>
              )}
            </div>
            <p className="text-[13px] font-semibold mt-2" style={{ color: f.color }}>{f.label}</p>
            <p className="text-[10px] text-text-tertiary leading-tight mt-0.5">{f.sub}</p>
          </button>
        ))}

        {/* 成長の可視化（ダッシュボード）カード */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="text-left border border-border-card rounded-xl p-3 hover:bg-surface-secondary transition-colors active:scale-[0.98] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary-bg">
              <LineChart size={18} className="text-primary" />
            </span>
            <ChevronRight size={16} className="text-text-tertiary" />
          </div>
          <div>
            <p className="text-[13px] font-semibold mt-2 text-primary">成長の可視化</p>
            <p className="text-[10px] text-text-tertiary leading-tight mt-0.5">サマリー・週次レポート</p>
          </div>
        </button>
      </div>

      {/* フロー（5つの力のつながり） */}
      <div className="mx-4 mt-5 bg-surface-secondary rounded-xl px-3 py-3">
        <p className="text-[10px] text-text-tertiary mb-2">流れ</p>
        <div className="flex items-center justify-center gap-1 flex-wrap text-[11px]">
          {[['発見', '#7c6cff'], ['別解', '#DC2626'], ['実現', '#EA580C']].map(([t, c], i) => (
            <span key={t} className="flex items-center gap-1">
              {i > 0 && <span className="text-text-tertiary">→</span>}
              <span className="px-2 py-0.5 rounded-full font-medium" style={{ background: `${c}1A`, color: c }}>{t}</span>
            </span>
          ))}
          <span className="text-text-tertiary">＋</span>
          <span className="px-2 py-0.5 rounded-full font-medium" style={{ background: '#0D94881A', color: '#0D9488' }}>失敗で立て直す</span>
        </div>
      </div>
    </div>
  )
}
