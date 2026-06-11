import { useGrowthStore } from '@/stores/growth-store'
import { useBekkaiStore } from '@/stores/bekkai-store'
import { useEntriesStore } from '@/discovery/stores/entries-store'
import { format } from 'date-fns'
import {
  DUMMY_OUTPUTS, DUMMY_REVIEWERS, DUMMY_ROLE_MODELS, DUMMY_UPCOMING_PEOPLE, DUMMY_INPUTS,
} from '@/lib/dummy-data'
import { getWeekInterval, generateId, nowISO } from '@/lib/utils'
import {
  demoFailurePower, demoRealizationPower, demoBekkais,
  emptyFailurePower, emptyRealizationPower,
} from '@/lib/types'
import { DEMO_CELL_ENTRIES } from '@/discovery/data'

export type SampleFeature = 'growth' | 'discovery' | 'bekkai' | 'realization' | 'failure'

const growthCore = (sample: boolean) => {
  const weekKey = format(getWeekInterval().start, 'yyyy-MM-dd')
  return {
    outputs: sample ? DUMMY_OUTPUTS : [],
    reviewers: sample ? DUMMY_REVIEWERS : [],
    roleModels: sample ? DUMMY_ROLE_MODELS : [],
    upcomingPeople: sample ? DUMMY_UPCOMING_PEOPLE : [],
    inputs: sample ? DUMMY_INPUTS : [],
    weeklyGoals: sample ? [
      { id: generateId(), week: weekKey, goal: '記事を1本公開する', done: true, created_at: nowISO() },
      { id: generateId(), week: weekKey, goal: '失敗談ベースの投稿を3本下書き', done: false, created_at: nowISO() },
    ] : [],
    actionPlans: sample ? [
      { id: generateId(), week: weekKey, theme: '"出す"を習慣化する週', goals: ['毎日1メモ', '8割で公開'], ifThenRules: [{ id: generateId(), if: '完璧にしたくなったら', then: '下書きのまま翌朝公開する' }], created_at: nowISO() },
    ] : [],
  }
}

/** その機能だけにサンプルデータを読み込む（他機能は触らない） */
export function loadSample(feature: SampleFeature): void {
  switch (feature) {
    case 'growth':
      // seedData は set でトップレベルマージするため、失敗力/実現力は保持される
      useGrowthStore.getState().seedData(growthCore(true))
      break
    case 'failure':
      useGrowthStore.getState().setFailurePower(demoFailurePower())
      break
    case 'realization':
      useGrowthStore.getState().setRealizationPower(demoRealizationPower())
      break
    case 'bekkai':
      useBekkaiStore.getState().importData({ bekkais: demoBekkais() })
      break
    case 'discovery':
      useEntriesStore.getState().importEntries({ ...DEMO_CELL_ENTRIES })
      break
  }
}

/** その機能だけを空にする（他機能は触らない） */
export function clearFeature(feature: SampleFeature): void {
  switch (feature) {
    case 'growth':
      useGrowthStore.getState().seedData(growthCore(false))
      break
    case 'failure':
      useGrowthStore.getState().setFailurePower(emptyFailurePower())
      break
    case 'realization':
      useGrowthStore.getState().setRealizationPower(emptyRealizationPower())
      break
    case 'bekkai':
      useBekkaiStore.getState().importData({ bekkais: [] })
      break
    case 'discovery':
      useEntriesStore.getState().importEntries({})
      break
  }
}
