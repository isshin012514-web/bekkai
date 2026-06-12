import { useMemo } from 'react'
import { TrendingUp, Search, Sparkles, Rocket, AlertTriangle, LineChart, ChevronRight, ArrowRight, Cloud, Flame } from 'lucide-react'
import type { AppTab } from '@/components/AppHeader'
import { useGrowthStore } from '@/stores/growth-store'
import { useBekkaiStore } from '@/stores/bekkai-store'
import { useEntriesStore } from '@/discovery/stores/entries-store'
import { weeklyOutputs } from '@/lib/utils'
import { currentStreak } from '@/lib/daily'
import { useSampleView, getRealData } from '@/stores/sample-view-store'
import { DailyPrompt } from '@/components/DailyPrompt'
import { CountUp } from '@/components/CountUp'
import { Badges } from '@/components/Badges'

interface HomeScreenProps {
  onNavigate: (tab: AppTab) => void
  onDeepenInput?: (question: string) => void
}

export function HomeScreen({ onNavigate, onDeepenInput }: HomeScreenProps) {
  // ストア変更で再描画させるための購読（値はサマリーには直接使わない）
  const { outputs, inputs, failurePower, realizationPower } = useGrowthStore()
  const bekkais = useBekkaiStore((s) => s.bekkais)
  const entries = useEntriesStore((s: { entries: Record<string, unknown[]> }) => s.entries)
  const modes = useSampleView((s) => s.modes)

  // サマリーは「実データ（Myデータ）」で集計。サンプル表示中の機能は退避中の実データを使う。
  const real = useMemo(() => getRealData(),
    [outputs, inputs, failurePower, realizationPower, bekkais, entries, modes])

  const rOutputs = (real.growthCore.outputs ?? []) as { created_at: string }[]
  const rInputs = (real.growthCore.inputs ?? []) as { created_at: string }[]
  const rBekkais = (real.bekkais ?? []) as { created_at?: string }[]

  const weekOut = useMemo(() => weeklyOutputs(rOutputs as never).length, [rOutputs])

  const streak = useMemo(() => {
    const dates: string[] = []
    rOutputs.forEach((o) => o.created_at && dates.push(o.created_at))
    rInputs.forEach((i) => i.created_at && dates.push(i.created_at))
    rBekkais.forEach((b) => b.created_at && dates.push(b.created_at))
    if (real.failurePower) Object.values(real.failurePower).forEach((v) => Array.isArray(v) && v.forEach((x: { created_at?: string }) => x?.created_at && dates.push(x.created_at)))
    if (real.realizationPower) [...(real.realizationPower.combinations ?? []), ...(real.realizationPower.quantityQualities ?? []), ...(real.realizationPower.team ?? [])].forEach((x) => (x as { created_at?: string })?.created_at && dates.push((x as { created_at: string }).created_at))
    Object.values(real.entries ?? {}).forEach((v) => Array.isArray(v) && v.forEach((x: unknown) => { const c = (x as { created_at?: string })?.created_at; if (c) dates.push(c) }))
    return currentStreak(dates)
  }, [real, rOutputs, rInputs, rBekkais])

  const forces = useMemo(() => {
    const discoveryCount = Object.values(real.entries ?? {}).reduce((s: number, v) => s + (Array.isArray(v) ? v.length : 0), 0)
    const failCount = real.failurePower ? Object.values(real.failurePower).reduce((s: number, v) => s + (Array.isArray(v) ? v.length : 0), 0) : 0
    const realCount = real.realizationPower ? (real.realizationPower.combinations?.length ?? 0) + (real.realizationPower.quantityQualities?.length ?? 0) + (real.realizationPower.team?.length ?? 0) : 0
    // 流れ順（発見→別解→実現→失敗→成長）
    return [
      { key: 'discovery' as AppTab, label: '発見力', sub: '解くべき問題を見つける', Icon: Search, color: '#7c6cff', count: discoveryCount, badge: 'STEP ①' },
      { key: 'bekkai' as AppTab, label: '別解力', sub: '自分の答えを出す', Icon: Sparkles, color: '#DC2626', count: rBekkais.length, badge: 'STEP ②' },
      { key: 'realization' as AppTab, label: '実現力', sub: '別解を形にする', Icon: Rocket, color: '#EA580C', count: realCount, badge: 'STEP ③' },
      { key: 'failure' as AppTab, label: '失敗力', sub: '転びを糧にする', Icon: AlertTriangle, color: '#0D9488', count: failCount, badge: 'ループ' },
      { key: 'growth' as AppTab, label: '成長力', sub: 'アウトプットで伸ばす', Icon: TrendingUp, color: '#185FA5', count: rOutputs.length + rInputs.length, badge: '土台' },
    ]
  }, [real, rOutputs, rInputs, rBekkais])

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
      {/* ヒーロー（メッシュグラデ） */}
      <div className="mesh-hero mx-4 mt-4 rounded-2xl px-5 py-5 text-white" style={{ background: 'linear-gradient(135deg,#185FA5,#7c6cff)' }}>
        <div className="relative z-10">
          <p className="text-[11px] opacity-80">ようこそ</p>
          <h1 className="text-xl font-bold mt-0.5">答えのない問いに、<br />自分の<span className="underline decoration-2 underline-offset-2">別解</span>を。</h1>
          <div className="flex gap-4 mt-3 text-[12px] items-center">
            <span>記録 <CountUp value={total} className="text-base font-bold" /> 件</span>
            <span>今週のOUT <CountUp value={weekOut} className="text-base font-bold" /> 件</span>
            {streak > 0 && (
              <span className="flex items-center gap-0.5 ml-auto rounded-full px-2 py-0.5"
                style={{ background: streak >= 30 ? 'rgba(245,158,11,.45)' : streak >= 7 ? 'rgba(234,88,12,.4)' : 'rgba(255,255,255,.2)' }}>
                <Flame size={streak >= 7 ? 15 : 13} className={streak >= 7 ? 'drop-shadow' : ''} />
                <b className="text-base"><CountUp value={streak} /></b>日連続
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 今日の問い */}
      <DailyPrompt onDeepen={onDeepenInput} onNavigate={onNavigate} />

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
      <p className="mx-4 mt-5 mb-2.5 text-[13px] font-semibold text-text-secondary">5つの力</p>
      <div className="mx-4 grid grid-cols-2 gap-3">
        {forces.map((f) => (
          <button
            key={f.key}
            onClick={() => onNavigate(f.key)}
            className="text-left border border-border-card rounded-2xl p-4 min-h-[128px] flex flex-col hover:bg-surface-secondary transition-colors active:scale-[0.98]"
            style={{ borderColor: `${f.color}33` }}
          >
            <div className="flex items-center justify-between">
              <span className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${f.color}1A` }}>
                <f.Icon size={24} style={{ color: f.color }} />
              </span>
              <span className="text-[12px] font-bold px-3 py-1 rounded-full" style={{ background: `${f.color}1F`, color: f.color }}>{f.badge}</span>
            </div>
            <div className="flex items-baseline gap-2 mt-3">
              <p className="text-[17px] font-bold" style={{ color: f.color }}>{f.label}</p>
              {f.count > 0 && <span className="text-[11px] text-text-tertiary">{f.count}件</span>}
            </div>
            <p className="text-[11px] text-text-tertiary leading-snug mt-0.5">{f.sub}</p>
          </button>
        ))}

        {/* 成長の可視化（ダッシュボード）カード */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="text-left border border-border-card rounded-2xl p-4 min-h-[128px] hover:bg-surface-secondary transition-colors active:scale-[0.98] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary-bg">
              <LineChart size={24} className="text-primary" />
            </span>
            <ChevronRight size={18} className="text-text-tertiary" />
          </div>
          <div>
            <p className="text-[17px] font-bold mt-3 text-primary">成長の可視化</p>
            <p className="text-[11px] text-text-tertiary leading-snug mt-0.5">サマリー・週次レポート</p>
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

      {/* 獲得した称号（折りたたみ・2軍） */}
      <Badges />

      <button onClick={() => onNavigate('about')} className="mx-auto mt-4 block text-[11px] text-text-tertiary underline underline-offset-2">
        bekkai とは？
      </button>
    </div>
  )
}
