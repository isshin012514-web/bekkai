interface MetricCardProps {
  label: string
  value: string | number
  sub?: string
  subColor?: string
}

function MetricCard({ label, value, sub, subColor }: MetricCardProps) {
  return (
    <div className="flex-1 bg-surface-secondary rounded-lg px-2 py-3">
      <p className="text-[10px] text-text-secondary mb-1 whitespace-nowrap leading-tight">{label}</p>
      <p className="text-2xl font-medium leading-none">{value}</p>
      {sub && (
        <p className={`text-[10px] mt-1 ${subColor ?? 'text-text-tertiary'}`}>{sub}</p>
      )}
    </div>
  )
}

interface WeeklySummaryProps {
  inputCount: number
  outputCount: number
  selfScoredCount: number
  peerScoredCount: number
}

export function WeeklySummary({
  inputCount,
  outputCount,
  selfScoredCount,
  peerScoredCount,
}: WeeklySummaryProps) {
  return (
    <section className="px-4 pt-4">
      <h2 className="text-sm font-medium text-text-secondary mb-2">サマリー（累計）</h2>
      <div className="grid grid-cols-4 gap-2">
        <MetricCard label="IN件数" value={inputCount} sub="件" />
        <MetricCard label="OUT件数" value={outputCount} sub="件" />
        <MetricCard label="自己採点" value={selfScoredCount} sub="件" />
        <MetricCard label="他者採点" value={peerScoredCount} sub="件" />
      </div>
    </section>
  )
}
