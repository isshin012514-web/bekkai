import { FlaskConical, User, Eye } from 'lucide-react'
import { useSampleView } from '@/stores/sample-view-store'
import type { SampleFeature } from '@/lib/samples'

interface SampleControlsProps {
  feature: SampleFeature
  /** アクセントカラー（HEX）。各機能のタブ色に合わせる */
  accent: string
}

/**
 * 「Myデータ / サンプル」の表示切替トグル。
 * サンプル表示中はMyデータを安全に退避し、戻すと復元する（データは消えない）。
 */
export function SampleControls({ feature, accent }: SampleControlsProps) {
  const mode = useSampleView((s) => s.modes[feature])
  const setSample = useSampleView((s) => s.setSample)
  const sample = mode === 'sample'

  const base = 'flex-1 flex items-center justify-center gap-1 text-[11px] py-1.5 rounded-md transition-colors'

  return (
    <div className="mx-4 mt-3">
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-text-tertiary shrink-0">表示</span>
        <div className="flex-1 flex gap-1 p-0.5 bg-surface-secondary rounded-lg border border-border-card">
          <button
            onClick={() => setSample(feature, false)}
            className={base}
            style={!sample ? { background: accent, color: '#fff' } : { color: 'var(--color-text-secondary)' }}
          >
            <User size={12} />Myデータ
          </button>
          <button
            onClick={() => setSample(feature, true)}
            className={base}
            style={sample ? { background: accent, color: '#fff' } : { color: 'var(--color-text-secondary)' }}
          >
            <FlaskConical size={12} />サンプル
          </button>
        </div>
      </div>
      {sample && (
        <div className="mt-2 flex items-start gap-1.5 text-[10px] leading-relaxed rounded-lg px-2.5 py-1.5" style={{ background: `${accent}14`, color: accent }}>
          <Eye size={12} className="shrink-0 mt-0.5" />
          <span>サンプルを表示中です。あなたのデータは安全に保管されています。「Myデータ」に戻すと元に戻ります（ここでの編集は保存されません）。</span>
        </div>
      )}
    </div>
  )
}
