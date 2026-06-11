import { useMemo, useState } from 'react'
import { startOfWeek, subWeeks, addDays } from 'date-fns'
import { LineChart, TrendingUp, Search, Sparkles, Rocket, AlertTriangle } from 'lucide-react'
import { useGrowthStore } from '@/stores/growth-store'
import { useBekkaiStore } from '@/stores/bekkai-store'
import { useEntriesStore } from '@/discovery/stores/entries-store'
import { peerScoredCount } from '@/lib/utils'
import { WeeklySummary } from './WeeklySummary'
import { WeeklyReviewButton } from './WeeklyReviewButton'
import { WeeklyReviewModal } from './WeeklyReviewModal'

const WEEKS = 8

function fmtMD(d: Date) { return `${d.getMonth() + 1}/${d.getDate()}` }

// ── 週ごとのアウトプット数（棒） ──────────────────────────────
function WeeklyBars({ buckets }: { buckets: { ws: Date; out: number }[] }) {
  const max = Math.max(1, ...buckets.map((b) => b.out))
  return (
    <div>
      <div className="flex gap-1.5 h-28">
        {buckets.map((b, i) => {
          const pct = (b.out / max) * 100
          return (
            <div key={i} className="flex-1 relative">
              <div
                className="absolute bottom-0 left-0 right-0 rounded-t bg-primary transition-all"
                style={{ height: b.out > 0 ? `${Math.max(4, pct)}%` : '0' }}
              />
              {b.out > 0 && (
                <div className="absolute left-0 right-0 text-center text-[9px] text-text-tertiary leading-none"
                  style={{ bottom: `calc(${Math.max(4, pct)}% + 2px)` }}>{b.out}</div>
              )}
            </div>
          )
        })}
      </div>
      <div className="flex gap-1.5 mt-1">
        {buckets.map((b, i) => (
          <span key={i} className="flex-1 text-center text-[8px] text-text-tertiary">{fmtMD(b.ws)}</span>
        ))}
      </div>
    </div>
  )
}

// ── 自己採点の推移（折れ線, 0..10） ──────────────────────────
function ScoreTrend({ buckets }: { buckets: { avg: number | null }[] }) {
  const W = 280, H = 90, pad = 8
  const xs = buckets.map((_, i) => pad + (i * (W - pad * 2)) / Math.max(1, buckets.length - 1))
  const y = (v: number) => H - pad - (v / 10) * (H - pad * 2)
  const pts = buckets.map((b, i) => ({ x: xs[i], v: b.avg })).filter((p) => p.v != null) as { x: number; v: number }[]
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${y(p.v).toFixed(1)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 90 }}>
      {[0, 5, 10].map((g) => (
        <g key={g}>
          <line x1={pad} x2={W - pad} y1={y(g)} y2={y(g)} stroke="var(--color-border-card)" strokeWidth="0.5" />
          <text x={0} y={y(g) + 3} fontSize="7" fill="var(--color-text-tertiary)">{g}</text>
        </g>
      ))}
      {pts.length > 1 && <path d={path} fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />}
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={y(p.v)} r="2.5" fill="var(--color-primary)" />)}
    </svg>
  )
}

// ── 5つの力の記録量（横棒） ──────────────────────────────────
function ForceActivity({ rows }: { rows: { key: string; label: string; Icon: typeof TrendingUp; color: string; count: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count))
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.key} className="flex items-center gap-2">
          <r.Icon size={13} style={{ color: r.color }} className="shrink-0" />
          <span className="text-[11px] text-text-secondary w-12 shrink-0">{r.label}</span>
          <div className="flex-1 h-2 bg-surface-secondary rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${(r.count / max) * 100}%`, background: r.color }} />
          </div>
          <span className="text-[11px] font-medium w-7 text-right shrink-0" style={{ color: r.color }}>{r.count}</span>
        </div>
      ))}
    </div>
  )
}

const Card = ({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) => (
  <section className="mx-4 mt-4 border border-border-card rounded-lg p-4">
    <div className="mb-3">
      <h2 className="text-sm font-medium">{title}</h2>
      {sub && <p className="text-[10px] text-text-tertiary mt-0.5">{sub}</p>}
    </div>
    {children}
  </section>
)

export function GrowthDashboard() {
  const { outputs, inputs, failurePower, realizationPower } = useGrowthStore()
  const bekkais = useBekkaiStore((s) => s.bekkais)
  const entries = useEntriesStore((s: { entries: Record<string, unknown[]> }) => s.entries)
  const [weeklyOpen, setWeeklyOpen] = useState(false)

  const selfScoredTotal = useMemo(() => outputs.filter((o) => o.self_score > 0).length, [outputs])
  const peerCount = useMemo(() => peerScoredCount(outputs), [outputs])

  const buckets = useMemo(() => {
    const now = new Date()
    const weekStarts = Array.from({ length: WEEKS }, (_, i) => startOfWeek(subWeeks(now, WEEKS - 1 - i), { weekStartsOn: 1 }))
    return weekStarts.map((ws) => {
      const we = addDays(ws, 7)
      const inRange = (iso: string) => { const t = new Date(iso); return t >= ws && t < we }
      const outs = outputs.filter((o) => inRange(o.created_at))
      const ins = inputs.filter((i) => inRange(i.created_at))
      const scored = outs.filter((o) => o.self_score > 0)
      const avg = scored.length ? scored.reduce((s, o) => s + o.self_score, 0) / scored.length : null
      return { ws, out: outs.length, in: ins.length, avg }
    })
  }, [outputs, inputs])

  const forceRows = useMemo(() => {
    const discoveryCount = Object.values(entries ?? {}).reduce((s, v) => s + (Array.isArray(v) ? v.length : 0), 0)
    const failCount = failurePower ? Object.values(failurePower).reduce((s, v) => s + (Array.isArray(v) ? v.length : 0), 0) : 0
    const realCount = realizationPower ? realizationPower.combinations.length + realizationPower.quantityQualities.length + realizationPower.team.length : 0
    return [
      { key: 'growth', label: '成長力', Icon: TrendingUp, color: '#185FA5', count: outputs.length + inputs.length },
      { key: 'discovery', label: '発見力', Icon: Search, color: '#7c6cff', count: discoveryCount },
      { key: 'bekkai', label: '別解力', Icon: Sparkles, color: '#DC2626', count: bekkais.length },
      { key: 'realization', label: '実現力', Icon: Rocket, color: '#EA580C', count: realCount },
      { key: 'failure', label: '失敗力', Icon: AlertTriangle, color: '#0D9488', count: failCount },
    ]
  }, [outputs, inputs, entries, failurePower, realizationPower, bekkais])

  const totalRecords = forceRows.reduce((s, r) => s + r.count, 0)
  const totalOut8w = buckets.reduce((s, b) => s + b.out, 0)

  return (
    <div className="pb-6">
      <div className="mx-4 mt-4 bg-primary-bg rounded-lg px-4 py-3">
        <p className="text-[12px] text-primary leading-relaxed flex items-center gap-1.5">
          <LineChart size={14} />成長の可視化
        </p>
        <p className="text-[11px] text-text-secondary mt-1">
          記録の積み重ねとアウトプットの推移を一目で。サマリーと週次レポートはここで確認できます。
        </p>
      </div>

      {/* サマリー（累計） */}
      <WeeklySummary
        inputCount={inputs.length}
        outputCount={outputs.length}
        selfScoredCount={selfScoredTotal}
        peerScoredCount={peerCount}
      />

      {/* 5つの力の記録量 */}
      <Card title="5つの力の記録量" sub={`累計 ${totalRecords} 件の記録`}>
        {totalRecords === 0
          ? <p className="text-[11px] text-text-tertiary text-center py-3">まだ記録がありません。各タブで記録を始めましょう。</p>
          : <ForceActivity rows={forceRows} />}
      </Card>

      {/* アウトプットの推移 */}
      <Card title="アウトプットの推移" sub={`直近8週で ${totalOut8w} 件`}>
        <WeeklyBars buckets={buckets} />
      </Card>

      {/* 自己採点の推移 */}
      <Card title="自己採点の推移" sub="週ごとの平均（0〜10）">
        {buckets.some((b) => b.avg != null)
          ? <ScoreTrend buckets={buckets} />
          : <p className="text-[11px] text-text-tertiary text-center py-3">採点済みのアウトプットがまだありません。</p>}
      </Card>

      {/* 週次レポート */}
      <WeeklyReviewButton onPress={() => setWeeklyOpen(true)} />
      <WeeklyReviewModal open={weeklyOpen} onClose={() => setWeeklyOpen(false)} />
    </div>
  )
}
