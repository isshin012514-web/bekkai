import { useGrowthStore } from '@/stores/growth-store'
import { useBekkaiStore } from '@/stores/bekkai-store'
import { useEntriesStore } from '@/discovery/stores/entries-store'
import {
  DUMMY_OUTPUTS, DUMMY_REVIEWERS, DUMMY_ROLE_MODELS, DUMMY_UPCOMING_PEOPLE, DUMMY_INPUTS,
} from '@/lib/dummy-data'
import {
  demoFailurePower, demoRealizationPower, demoBekkais,
  emptyFailurePower, emptyRealizationPower,
} from '@/lib/types'
import { DEMO_CELL_ENTRIES } from '@/discovery/data'

export type SampleFeature = 'growth' | 'discovery' | 'bekkai' | 'realization' | 'failure'

const growthCore = (sample: boolean) => ({
  outputs: sample ? DUMMY_OUTPUTS : [],
  reviewers: sample ? DUMMY_REVIEWERS : [],
  roleModels: sample ? DUMMY_ROLE_MODELS : [],
  upcomingPeople: sample ? DUMMY_UPCOMING_PEOPLE : [],
  inputs: sample ? DUMMY_INPUTS : [],
})

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
