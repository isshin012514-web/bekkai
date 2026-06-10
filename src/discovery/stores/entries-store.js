import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_DATA } from '../data'

// ID生成（bekkai: lib/utils.ts の generateId 準拠）
const generateId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`

const keyOf = (moduleId, cellId) => `${moduleId}-${cellId}`

/**
 * セル項目ストア（bekkai の Zustand + persist パターン準拠）。
 *
 * - localStorage キー: "discovery-8m-entries"
 * - 初回はバンドル済みの DEFAULT_DATA.CELL_ENTRIES をシードし、
 *   以降はユーザーの追加・削除を自動永続化する。
 * - entries: { `${moduleId}-${cellId}`: Array<string | object> }
 */
export const useEntriesStore = create()(
  persist(
    (set, get) => ({
      entries: DEFAULT_DATA.CELL_ENTRIES,

      // テキスト項目を追加（id・作成時刻つきオブジェクトで保存）。
      // reason: 「なぜそう思うか」の仮説・根拠（任意）。
      addEntry: (moduleId, cellId, text, reason) =>
        set((state) => {
          const value = text?.trim()
          if (!value) return state
          const key = keyOf(moduleId, cellId)
          const list = state.entries[key] ?? []
          const entry = { id: generateId(), text: value, created_at: new Date().toISOString() }
          const r = reason?.trim()
          if (r) entry.reason = r
          return { entries: { ...state.entries, [key]: [...list, entry] } }
        }),

      // 構造化オブジェクトをそのまま追加（強み/弱み等の self セル用）。
      // id・作成時刻を付与し、与えられたフィールド（level/detail/fix/type など）を保持する。
      addEntryObject: (moduleId, cellId, obj) =>
        set((state) => {
          if (!obj) return state
          const key = keyOf(moduleId, cellId)
          const list = state.entries[key] ?? []
          const entry = { id: generateId(), created_at: new Date().toISOString(), ...obj }
          return { entries: { ...state.entries, [key]: [...list, entry] } }
        }),

      // index 指定で項目を部分更新（文字列項目はオブジェクトへ正規化してから merge）。
      // 詳細メモ・根拠（bekkaiアウトプット）・自己採点などの付加情報に使う。
      updateEntryAt: (moduleId, cellId, index, patch) =>
        set((state) => {
          const key = keyOf(moduleId, cellId)
          const list = state.entries[key] ?? []
          if (index < 0 || index >= list.length) return state
          const current = list[index]
          const base =
            typeof current === 'string'
              ? { id: generateId(), text: current, created_at: new Date().toISOString() }
              : current
          const next = list.map((item, i) =>
            i === index ? { ...base, ...patch, updated_at: new Date().toISOString() } : item,
          )
          return { entries: { ...state.entries, [key]: next } }
        }),

      // index 指定で削除
      removeEntry: (moduleId, cellId, index) =>
        set((state) => {
          const key = keyOf(moduleId, cellId)
          const list = state.entries[key] ?? []
          return { entries: { ...state.entries, [key]: list.filter((_, i) => i !== index) } }
        }),

      // セルを初期状態（デフォルト）に戻す
      resetCell: (moduleId, cellId) =>
        set((state) => {
          const key = keyOf(moduleId, cellId)
          return { entries: { ...state.entries, [key]: DEFAULT_DATA.CELL_ENTRIES[key] ?? [] } }
        }),

      // 全データをデフォルトへ
      resetAll: () => set(() => ({ entries: DEFAULT_DATA.CELL_ENTRIES })),

      // インポート（エクスポートしたJSONで全データを置き換え）。
      // entries オブジェクト（{ `${moduleId}-${cellId}`: [...] }）を受け取る。
      importEntries: (next) =>
        set(() => ({ entries: next && typeof next === 'object' ? next : {} })),
    }),
    // version 2: 初期データを空にした本番リリース。旧バージョンの永続データ（テスト用シード）は
    // migrate 未指定のため破棄され、空の初期状態から開始する。
    { name: 'discovery-8m-entries', version: 2 },
  ),
)
