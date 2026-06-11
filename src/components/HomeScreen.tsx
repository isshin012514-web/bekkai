import { useMemo } from 'react'
import { TrendingUp, Search, Sparkles, Rocket, AlertTriangle, LineChart, ChevronRight, ArrowRight, Cloud, Flame } from 'lucide-react'
import type { AppTab } from '@/components/AppHeader'
import { useGrowthStore } from '@/stores/growth-store'
import { useBekkaiStore } from '@/stores/bekkai-store'
import { useEntriesStore } from '@/discovery/stores/entries-store'
import { weeklyOutputs } from '@/lib/utils'
import { currentStreak } from '@/lib/daily'
import { DailyPrompt } from '@/components/DailyPrompt'

interface HomeScreenProps {
  onNavigate: (tab: AppTab) => void
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const { outputs, inputs, failurePower, realizationPower } = useGrowthStore()
  const bekkais = useBekkaiStore((s) => s.bekkais)
  const entries = useEntriesStore((s: { entries: Record<string, unknown[]> }) => s.entries)

  const weekOut = useMemo(() => weeklyOutputs(outputs).length, [outputs])

  const streak = useMemo(() => {
    const dates: string[] = []
    outputs.forEach((o) => dates.push(o.created_at))
    inputs.forEach((i) => dates.push(i.created_at))
    bekkais.forEach((b) => dates.push(b.created_at))
    if (failurePower) Object.values(failurePower).forEach((v) => Array.isArray(v) && v.forEach((x: { created_at?: string }) => x?.created_at && dates.push(x.created_at)))
    if (realizationPower) [...realizationPower.combinations, ...realizationPower.quantityQualities, ...realizationPower.team].forEach((x) => x?.created_at && dates.push(x.created_at))
    Object.values(entries ?? {}).forEach((v) => Array.isArray(v) && v.forEach((x: unknown) => { const c = (x as { created_at?: string })?.created_at; if (c) dates.push(c) }))
    return currentStreak(dates)
  }, [outputs, inputs, bekkais, failurePower, realizationPower, entries])

  const forces = useMemo(() => {
    const discoveryCount = Object.values(entries ?? {}).reduce((s, v) => s + (Array.isArray(v) ? v.length : 0), 0)
    const failCount = failurePower ? Object.values(failurePower).reduce((s, v) => s + (Array.isArray(v) ? v.length : 0), 0) : 0
    const realCount = realizationPower ? realizationPower.combinations.length + realizationPower.quantityQualities.length + realizationPower.team.length : 0
    // 流れ順（発見→別解→実現→失敗→成長）
    return [
      { key: 'discovery' as AppTab, label: '発見力', sub: '解くべき問題を見つける', Icon: Search, color: '#7c6cff', count: discoveryCount, badge: 'STEP ①' },
      { key: 'bekkai' as AppTab, label: '別解力', sub: '自分の答えを出す', Icon: Sparkles, color: '#DC2626', count: bekkais.length, badge: 'STEP ②' },
      { key: 'realization' as AppTab, label: '実現力', sub: '別解を形にする', Icon: Rocket, color: '#EA580C', count: realCount, badge: 'STEP ③' },
      { key: 'failure' as AppTab, label: '失敗力', sub: '転びを糧にする', Icon: AlertTriangle, color: '#0D9488', count: failCount, badge: 'ループ' },
      { key: 'growth' as AppTab, label: '成長力', sub: 'アウトプットで伸ばす', Icon: TrendingUp, color: '#185FA5', count: outputs.length + inputs.length, badge: '土台' },
    ]
  }, [outputs, inputs, entries, failurePower, realizationPower, bekkais])

  const total = forces.reduce((s, f) => s + f.count, 0)

  // 次にやること：発見→別解→実現の順で、最初に空のステップを提案
  const nextStep = useMemo(() => {
    const flow = forces.slice(0, 3) // discovery, bekkai, realization
    const empty = flow.find((f) => f.count === 0)
    if (empty) {
      const msg: Record<string, string> = {
        discovery: 'まず発見力で「解くべき問題」を1つ見つけよう',
        bekkai: '見つけた課題に、別解力で自分の答えを出そう',
        realization: 'その別解を、実現力で形にしよう',
      }
      return { key: empty.key, color: empty.color, label: empty.label, text: msg[empty.key] }
    }
    return { key: 'dashboard' as AppTab, color: '#185FA5', label: '成長の可視化', text: 'いい流れ。成長の可視化で振り返ろう' }
  }, [forces])

  return (
    <div className="pb-6">
      {/* ヒーロー */}
      <div className="mx-4 mt-4 rounded-2xl px-5 py-5 text-white" style={{ background: 'linear-gradient(135deg,#185FA5,#7c6cff)' }}>
        <p className="text-[11px] opacity-80">ようこそ</p>
        <h1 className="text-xl font-bold mt-0.5">答えのない問いに、<br />自分の<span className="underline decoration-2 underline-offset-2">別解</span>を。</h1>
        <div className="flex gap-4 mt-3 text-[12px] items-center">
          <span>記録 <b className="text-base">{total}</b> 件</span>
          <span>今週のOUT <b className="text-base">{weekOut}</b> 件</span>
          {streak > 0 && (
            <span className="flex items-center gap-0.5 ml-auto bg-white/20 rounded-full px-2 py-0.5">
              <Flame size={13} /><b className="text-base">{streak}</b>日連続
            </span>
          )}
        </div>
      </div>

      {/* 今日の問い */}
      <DailyPrompt />

      {/* 次にやること */}
      <button
        onClick={() => onNavigate(nextStep.key)}
        className="mx-4 mt-3 w-[calc(100%-2rem)] flex items-center gap-3 rounded-xl px-4 py-3 text-left active:scale-[0.99] transition-transform"
        style={{ background: `${nextStep.color}14`, border: `1px solid ${nextStep.color}33` }}
      >
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-medium" style={{ color: nextStep.color }}>次にやること</p>
          <p className="text-[13px] text-text-primary font-medium leading-snug mt-0.5">{nextStep.text}</p>
        </div>
        <span className="flex items-center gap-1 text-[12px] font-medium shrink-0" style={{ color: nextStep.color }}>
          {nextStep.label}<ArrowRight size={14} />
        </span>
      </button>

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
              <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: `${f.color}14`, color: f.color }}>{f.badge}</span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <p className="text-[13px] font-semibold" style={{ color: f.color }}>{f.label}</p>
              {f.count > 0 && <span className="text-[10px] text-text-tertiary">{f.count}件</span>}
            </div>
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

      {/* クラウド同期への導線 */}
      <button
        onClick={() => onNavigate('data')}
        className="mx-4 mt-3 w-[calc(100%-2rem)] flex items-center gap-2 border border-border-card rounded-xl px-4 py-2.5 hover:bg-surface-secondary transition-colors active:scale-[0.99]"
      >
        <Cloud size={15} className="text-primary shrink-0" />
        <span className="text-[12px] text-text-secondary flex-1 text-left">クラウド同期・バックアップ</span>
        <ChevronRight size={15} className="text-text-tertiary" />
      </button>

      {/* フロー（5つの力のつながり） */}
      <div className="mx-4 mt-3 bg-surface-secondary rounded-xl px-3 py-3">
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

      <button onClick={() => onNavigate('about')} className="mx-auto mt-4 block text-[11px] text-text-tertiary underline underline-offset-2">
        bekkai とは？
      </button>
    </div>
  )
}
