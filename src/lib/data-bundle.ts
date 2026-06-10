import { useGrowthStore } from '@/stores/growth-store'
import { useBekkaiStore } from '@/stores/bekkai-store'
import { useEntriesStore } from '@/discovery/stores/entries-store'
import { BEKKAI_SCORE_LABELS, OUTPUT_TYPE_LABELS } from '@/lib/types'

export interface DataBundle {
  app: 'bekkai'
  version: 1
  exported_at: string
  growth: ReturnType<ReturnType<typeof useGrowthStore.getState>['exportData']>
  discovery: { entries: Record<string, unknown[]> }
  bekkai: { bekkais: ReturnType<ReturnType<typeof useBekkaiStore.getState>['exportData']>['bekkais'] }
}

/** 3機能すべてのデータを1つのオブジェクトに束ねる */
export function exportAll(exportedAt: string): DataBundle {
  return {
    app: 'bekkai',
    version: 1,
    exported_at: exportedAt,
    growth: useGrowthStore.getState().exportData(),
    discovery: { entries: useEntriesStore.getState().entries ?? {} },
    bekkai: { bekkais: useBekkaiStore.getState().exportData().bekkais },
  }
}

/** 束ねたデータを各ストアへ復元。後方互換: 旧・成長力単体バックアップ(outputs直下)も読める */
export function importAll(raw: unknown): { growth: boolean; discovery: boolean; bekkai: boolean } {
  if (!raw || typeof raw !== 'object') throw new Error('invalid')
  const data = raw as Record<string, any>
  const result = { growth: false, discovery: false, bekkai: false }

  // 統合バンドル形式
  const growth = data.growth ?? (Array.isArray(data.outputs) ? data : null)
  if (growth && typeof growth === 'object') {
    useGrowthStore.getState().importData({
      outputs: Array.isArray(growth.outputs) ? growth.outputs : [],
      reviewers: Array.isArray(growth.reviewers) ? growth.reviewers : [],
      roleModels: Array.isArray(growth.roleModels) ? growth.roleModels : [],
      upcomingPeople: Array.isArray(growth.upcomingPeople) ? growth.upcomingPeople : [],
      inputs: Array.isArray(growth.inputs) ? growth.inputs : [],
      weeklyGoals: Array.isArray(growth.weeklyGoals) ? growth.weeklyGoals : [],
      actionPlans: Array.isArray(growth.actionPlans) ? growth.actionPlans : [],
      failurePower: growth.failurePower && typeof growth.failurePower === 'object' ? growth.failurePower : undefined,
    })
    result.growth = true
  }

  if (data.discovery?.entries && typeof data.discovery.entries === 'object') {
    useEntriesStore.getState().importEntries(data.discovery.entries)
    result.discovery = true
  }

  if (data.bekkai?.bekkais && Array.isArray(data.bekkai.bekkais)) {
    useBekkaiStore.getState().importData({ bekkais: data.bekkai.bekkais })
    result.bekkai = true
  }

  if (!result.growth && !result.discovery && !result.bekkai) throw new Error('no recognizable data')
  return result
}

/** AIに投げるための、読みやすい日本語サマリーを生成 */
export function buildAIPrompt(): string {
  const g = useGrowthStore.getState()
  const b = useBekkaiStore.getState().bekkais
  const entries = (useEntriesStore.getState().entries ?? {}) as Record<string, Array<string | { text?: string; name?: string; detail?: string }>>

  const lines: string[] = []
  lines.push('あなたは私のキャリア・事業づくりの壁打ち相手です。以下は私の自己分析データ（成長力・発見力・別解力）です。これを踏まえて、強み・課題・次の一手を具体的に助言してください。')
  lines.push('')

  // 別解力
  lines.push('## 別解力（自分らしい×優れた×別の やり方の掛け合わせ）')
  if (b.length === 0) {
    lines.push('（記録なし）')
  } else {
    b.forEach((x, i) => {
      lines.push(`### ${i + 1}. テーマ: ${x.theme || '無題'}`)
      const ax: [string, typeof x.self][] = [['自分らしい', x.self], ['優れた', x.excellent], ['別の', x.different]]
      ax.forEach(([label, a]) => {
        const sc = a.score > 0 ? `${BEKKAI_SCORE_LABELS[a.score]}(${a.score})` : '未評価'
        lines.push(`- ${label}やり方: ${sc}${a.reason ? ` / 理由: ${a.reason.replace(/\n/g, ' ')}` : ''}${a.ideas.length ? ` / アイデア: ${a.ideas.join('、')}` : ''}`)
      })
      if (x.downside) lines.push(`- マイナス面と打ち手: ${x.downside.replace(/\n/g, ' ')}`)
      if (x.conclusion) lines.push(`- 導いた別解: ${x.conclusion.replace(/\n/g, ' ')}`)
    })
  }
  lines.push('')

  // 成長力
  lines.push('## 成長力（アウトプット）')
  if (g.outputs.length === 0) {
    lines.push('（記録なし）')
  } else {
    const avg = (g.outputs.reduce((s, o) => s + (o.self_score ?? 0), 0) / g.outputs.length).toFixed(1)
    lines.push(`アウトプット総数: ${g.outputs.length}件 / 平均自己評価: ${avg}`)
    g.outputs.slice(0, 10).forEach((o) => {
      lines.push(`- [${OUTPUT_TYPE_LABELS[o.type] ?? o.type}] ${o.title}（自己${o.self_score}${o.peer_score != null ? ` / 他者${o.peer_score}` : ''}）`)
    })
    if (g.roleModels.length) lines.push(`ロールモデル: ${g.roleModels.map((r) => r.name).join('、')}`)
  }
  lines.push('')

  // 発見力
  lines.push('## 発見力（自己分析マンダラ）')
  const filled = Object.entries(entries).filter(([, v]) => Array.isArray(v) && v.length > 0)
  if (filled.length === 0) {
    lines.push('（記録なし）')
  } else {
    filled.forEach(([key, list]) => {
      const texts = list.map((e) => (typeof e === 'string' ? e : e.text ?? e.name ?? e.detail ?? '')).filter(Boolean)
      if (texts.length) lines.push(`- ${key}: ${texts.join('、')}`)
    })
  }

  return lines.join('\n')
}
