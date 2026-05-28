interface MetricCardProps {
  label: string
  value: string | number
  sub?: string
  subColor?: string
}

function MetricCard({ label, value, sub, subColor }: MetricCardProps) {
  return (
    <div className="flex-1 bg-surface-secondary rounded-lg px-3 py-3">
      <p className="text-[11px] text-text-secondary mb-1">{label}</p>
      <p className="text-2xl font-medium leading-none">{value}</p>
      {sub && (
        <p className={`text-[11px] mt-1 ${subColor ?? 'text-text-tertiary'}`}>{sub}</p>
      )}
    </div>
  )
}

interface WeeklySummaryProps {
  outputCount: number
  lastWeekOutputCount: number
  selfScoredCount: number
  peerScoredCount: number
}

export function WeeklySummary({
  outputCount,
  lastWeekOutputCount,
  selfScoredCount,
  peerScoredCount,
}: WeeklySummaryProps) {
  const diff = outputCount - lastWeekOutputCount
  const diffLabel = diff > 0 ? `先週 +${diff}` : diff < 0 ? `先週 ${diff}` : '先週と同じ'
  const diffColor = diff > 0 ? 'text-done' : diff < 0 ? 'text-waiting' : 'text-text-tertiary'

  return (
    <section className="px-4 pt-4">
      <h2 className="text-sm font-medium text-text-secondary mb-2">今週のサマリー</h2>
      <div className="flex gap-2">
        <MetricCard
          label="アウトプット"
          value={outputCount}
          sub={diffLabel}
          subColor={diffColor}
        />
        <MetricCard
          label="自己採点"
          value={selfScoredCount}
          sub="件"
        />
        <MetricCard
          label="他者採点"
          value={peerScoredCount}
          sub="件"
        />
      </div>
    </section>
  )
}
