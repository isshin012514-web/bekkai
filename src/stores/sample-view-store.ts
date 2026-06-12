import { create } from 'zustand'
import { loadSample } from '@/lib/samples'
import type { SampleFeature } from '@/lib/samples'
import { useGrowthStore } from '@/stores/growth-store'
import { useBekkaiStore } from '@/stores/bekkai-store'
import { useEntriesStore } from '@/discovery/stores/entries-store'

const FEATURES: SampleFeature[] = ['growth', 'discovery', 'bekkai', 'realization', 'failure']
const stashKey = (f: SampleFeature) => `sample-stash-${f}`
const modeKey = (f: SampleFeature) => `sample-mode-${f}`

// ── 機能ごとに「今の実データ」を読み書き ──────────────────────────
function snapshot(feature: SampleFeature): unknown {
  const g = useGrowthStore.getState()
  switch (feature) {
    case 'growth':
      return { outputs: g.outputs, reviewers: g.reviewers, roleModels: g.roleModels, upcomingPeople: g.upcomingPeople, inputs: g.inputs, weeklyGoals: g.weeklyGoals, actionPlans: g.actionPlans }
    case 'failure': return g.failurePower
    case 'realization': return g.realizationPower
    case 'bekkai': return useBekkaiStore.getState().bekkais
    case 'discovery': return useEntriesStore.getState().entries
  }
}

function restore(feature: SampleFeature, data: unknown): void {
  if (data == null) return // 退避データが無ければ何もしない（実データを壊さない）
  const g = useGrowthStore.getState()
  switch (feature) {
    case 'growth': g.seedData(data as Parameters<typeof g.seedData>[0]); break
    case 'failure': g.setFailurePower(data as Parameters<typeof g.setFailurePower>[0]); break
    case 'realization': g.setRealizationPower(data as Parameters<typeof g.setRealizationPower>[0]); break
    case 'bekkai': useBekkaiStore.getState().importData({ bekkais: data as never }); break
    case 'discovery': useEntriesStore.getState().importEntries(data as Record<string, unknown[]>); break
  }
}

function readMode(f: SampleFeature): 'mydata' | 'sample' {
  try { return localStorage.getItem(modeKey(f)) === '1' ? 'sample' : 'mydata' } catch { return 'mydata' }
}

/** いずれかの機能がサンプル表示中か（クラウド同期の停止判定に使う） */
export function isAnySampleMode(): boolean {
  return FEATURES.some((f) => readMode(f) === 'sample')
}

function stashed(feature: SampleFeature): unknown {
  try { return JSON.parse(localStorage.getItem(stashKey(feature)) || 'null') } catch { return null }
}

export interface RealData {
  growthCore: { outputs: unknown[]; inputs: unknown[]; roleModels: unknown[]; upcomingPeople: unknown[] }
  failurePower: Record<string, unknown> | null
  realizationPower: { combinations: unknown[]; quantityQualities: unknown[]; team: unknown[]; confidence?: string } | null
  bekkais: unknown[]
  entries: Record<string, unknown[]>
}

/**
 * サマリー集計用の「実データ（Myデータ）」を返す。
 * サンプル表示中の機能は、退避中の実データ（stash）から読む。
 * → サンプルはサマリーに反映されない。
 */
export function getRealData(): RealData {
  const g = useGrowthStore.getState()
  const growthReal = readMode('growth') === 'sample'
    ? (stashed('growth') as RealData['growthCore'] | null)
    : { outputs: g.outputs, inputs: g.inputs, roleModels: g.roleModels, upcomingPeople: g.upcomingPeople }
  const failureReal = readMode('failure') === 'sample' ? (stashed('failure') as RealData['failurePower']) : (g.failurePower as unknown as RealData['failurePower'])
  const realizationReal = readMode('realization') === 'sample' ? (stashed('realization') as RealData['realizationPower']) : (g.realizationPower as unknown as RealData['realizationPower'])
  const bekkaisReal = readMode('bekkai') === 'sample' ? (stashed('bekkai') as unknown[]) : useBekkaiStore.getState().bekkais
  const entriesReal = readMode('discovery') === 'sample' ? (stashed('discovery') as Record<string, unknown[]>) : useEntriesStore.getState().entries
  return {
    growthCore: growthReal ?? { outputs: [], inputs: [], roleModels: [], upcomingPeople: [] },
    failurePower: failureReal ?? null,
    realizationPower: realizationReal ?? null,
    bekkais: bekkaisReal ?? [],
    entries: entriesReal ?? {},
  }
}

interface SampleViewState {
  modes: Record<SampleFeature, 'mydata' | 'sample'>
  /** sample=true でサンプル表示、false で Myデータに戻す（非破壊） */
  setSample: (feature: SampleFeature, sample: boolean) => void
  /** 全機能を Myデータに戻す（サインイン時に呼ぶ） */
  exitAll: () => void
}

const initialModes = (): Record<SampleFeature, 'mydata' | 'sample'> =>
  FEATURES.reduce((acc, f) => { acc[f] = readMode(f); return acc }, {} as Record<SampleFeature, 'mydata' | 'sample'>)

export const useSampleView = create<SampleViewState>((set, get) => ({
  modes: initialModes(),

  setSample: (feature, sample) => {
    const cur = get().modes[feature]
    if (sample && cur === 'mydata') {
      // 実データを退避 → サンプルを表示
      try { localStorage.setItem(stashKey(feature), JSON.stringify(snapshot(feature) ?? null)) } catch { /* noop */ }
      try { localStorage.setItem(modeKey(feature), '1') } catch { /* noop */ }
      loadSample(feature)
      set((s) => ({ modes: { ...s.modes, [feature]: 'sample' } }))
    } else if (!sample && cur === 'sample') {
      // 退避した実データを復元 → Myデータに戻す
      let data: unknown = null
      try { data = JSON.parse(localStorage.getItem(stashKey(feature)) || 'null') } catch { /* noop */ }
      restore(feature, data)
      try { localStorage.removeItem(stashKey(feature)) } catch { /* noop */ }
      try { localStorage.removeItem(modeKey(feature)) } catch { /* noop */ }
      set((s) => ({ modes: { ...s.modes, [feature]: 'mydata' } }))
    }
  },

  exitAll: () => {
    FEATURES.forEach((f) => { if (get().modes[f] === 'sample') get().setSample(f, false) })
  },
}))
