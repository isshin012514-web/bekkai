import { FlaskConical } from 'lucide-react'
import { useSampleView } from '@/stores/sample-view-store'
import type { SampleFeature } from '@/lib/samples'

/** 空状態に置く「書き方に迷ったら → サンプルを見る」導線 */
export function SampleHint({ feature, accent }: { feature: SampleFeature; accent: string }) {
  const setSample = useSampleView((s) => s.setSample)
  return (
    <button
      onClick={() => setSample(feature, true)}
      className="mx-auto flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full border transition-colors hover:bg-surface-secondary"
      style={{ color: accent, borderColor: `${accent}55` }}
    >
      <FlaskConical size={12} />書き方に迷ったら、サンプルを見る
    </button>
  )
}
