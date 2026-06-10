import { useMemo } from 'react'
import { useGrowthStore } from '@/stores/growth-store'
import DiscoveryApp from './DiscoveryApp'

export function DiscoveryWrapper() {
  const outputs = useGrowthStore((s) => s.outputs)

  const data = useMemo(() => ({
    BEKKAI_OUTPUTS: outputs.map((o) => ({
      id: o.id,
      title: o.title,
      type: o.type,
      self_score: o.self_score,
      created_at: o.created_at,
    })),
  }), [outputs])

  return <DiscoveryApp data={data} />
}
