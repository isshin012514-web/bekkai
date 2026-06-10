import { Sparkles, FileX } from 'lucide-react'
import { loadSample, clearFeature } from '@/lib/samples'
import type { SampleFeature } from '@/lib/samples'

interface SampleControlsProps {
  feature: SampleFeature
  hasData: boolean
  /** アクセントカラー（HEX）。各機能のタブ色に合わせる */
  accent: string
}

/**
 * 「サンプルを見る / 空で始める」のセグメントトグル。
 * 各機能ホームの先頭に置く。hasData は親が自分のストアから算出して渡す。
 */
export function SampleControls({ feature, hasData, accent }: SampleControlsProps) {
  const onSample = () => {
    if (hasData && !window.confirm('現在の入力をサンプルデータで置き換えます。よろしいですか？')) return
    loadSample(feature)
  }
  const onEmpty = () => {
    if (hasData && !window.confirm('この機能のデータをすべて削除して空にします。よろしいですか？')) return
    clearFeature(feature)
  }

  // hasData なら「サンプル寄り」、空なら「空寄り」を選択状態として見せる
  const sampleActive = hasData
  const base = 'flex-1 flex items-center justify-center gap-1 text-[11px] py-1.5 rounded-md transition-colors'

  return (
    <div className="mx-4 mt-3 flex items-center gap-2">
      <span className="text-[10px] text-text-tertiary shrink-0">表示データ</span>
      <div className="flex-1 flex gap-1 p-0.5 bg-surface-secondary rounded-lg border border-border-card">
        <button
          onClick={onSample}
          className={base}
          style={sampleActive ? { background: accent, color: '#fff' } : undefined}
        >
          <Sparkles size={12} />サンプル
        </button>
        <button
          onClick={onEmpty}
          className={base}
          style={!sampleActive ? { background: accent, color: '#fff' } : { color: 'var(--color-text-secondary)' }}
        >
          <FileX size={12} />空で始める
        </button>
      </div>
    </div>
  )
}
