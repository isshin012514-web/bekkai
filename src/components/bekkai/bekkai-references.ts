import { useMemo } from 'react'
import type { BekkaiAxis } from '@/lib/types'
import { useGrowthStore } from '@/stores/growth-store'
import { useEntriesStore } from '@/discovery/stores/entries-store'

export interface RefItem {
  source: '成長力' | '発見力'
  text: string
  quote: string // 引用ボタンで理由欄に入れる文言
}

/**
 * 「なぜその評価？」で参照できる、成長力・発見力からの実データを軸ごとに返す。
 * - self（自分らしさ）   : 高スコアのアウトプット / 発見力の強み・自分軸
 * - excellent（優れた）  : アウトプット量・平均スコア / 発見力の目標
 * - different（別の）    : 発見力の課題・市場トレンド
 */
export function useBekkaiReferences(axis: BekkaiAxis): RefItem[] {
  const outputs = useGrowthStore((s) => s.outputs)
  const entries = useEntriesStore((s: { entries: Record<string, unknown[]> }) => s.entries)

  return useMemo(() => {
    const items: RefItem[] = []
    const entryText = (key: string): string[] => {
      const list = (entries?.[key] ?? []) as Array<string | { text?: string; name?: string; detail?: string }>
      return list
        .map((e) => (typeof e === 'string' ? e : e.text ?? e.name ?? e.detail ?? ''))
        .filter(Boolean)
    }

    if (axis === 'self') {
      // 高スコアのアウトプット上位
      ;[...outputs]
        .sort((a, b) => (b.self_score ?? 0) - (a.self_score ?? 0))
        .slice(0, 3)
        .forEach((o) => {
          if ((o.self_score ?? 0) > 0) {
            items.push({
              source: '成長力',
              text: `${o.title} — 自己評価 ${o.self_score}`,
              quote: `${o.title}（自己評価${o.self_score}）の経験`,
            })
          }
        })
      // 発見力: 強み・自分軸
      entryText('self-strength').slice(0, 3).forEach((t) =>
        items.push({ source: '発見力', text: `強み: ${t}`, quote: `${t}が強み（発見力）` }),
      )
    } else if (axis === 'excellent') {
      if (outputs.length > 0) {
        const avg = (outputs.reduce((s, o) => s + (o.self_score ?? 0), 0) / outputs.length).toFixed(1)
        items.push({
          source: '成長力',
          text: `アウトプット ${outputs.length}件 / 平均スコア ${avg}`,
          quote: `アウトプット${outputs.length}件・平均${avg}の実績`,
        })
      }
      entryText('market-goal').slice(0, 2).forEach((t) =>
        items.push({ source: '発見力', text: `目標: ${t}`, quote: `目標「${t}」（発見力）` }),
      )
    } else {
      // different
      entryText('self-weakness').slice(0, 2).forEach((t) =>
        items.push({ source: '発見力', text: `弱み（逆手に）: ${t}`, quote: `弱み「${t}」を逆張りに活かす` }),
      )
      entryText('market-future').slice(0, 2).forEach((t) =>
        items.push({ source: '発見力', text: `未来トレンド: ${t}`, quote: `${t}のトレンドに乗る` }),
      )
    }
    return items
  }, [axis, outputs, entries])
}
