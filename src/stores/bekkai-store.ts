import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Bekkai } from '@/lib/types'
import { emptyBekkaiArea } from '@/lib/types'
import { generateId, nowISO } from '@/lib/utils'

interface BekkaiData {
  bekkais: Bekkai[]
}

interface BekkaiState extends BekkaiData {
  addBekkai: (theme?: string) => string // returns new id
  updateBekkai: (id: string, data: Partial<Omit<Bekkai, 'id' | 'user_id' | 'created_at'>>) => void
  deleteBekkai: (id: string) => void
  exportData: () => BekkaiData
  importData: (data: BekkaiData) => void
  resetAll: () => void
}

export const useBekkaiStore = create<BekkaiState>()(
  persist(
    (set, get) => ({
      bekkais: [],

      addBekkai: (theme = '') => {
        const id = generateId()
        const now = nowISO()
        const bekkai: Bekkai = {
          id,
          user_id: 'local',
          theme,
          self: emptyBekkaiArea(),
          excellent: emptyBekkaiArea(),
          different: emptyBekkaiArea(),
          downside: '',
          conclusion: '',
          created_at: now,
          updated_at: now,
        }
        set((state) => ({ bekkais: [bekkai, ...state.bekkais] }))
        return id
      },

      updateBekkai: (id, data) =>
        set((state) => ({
          bekkais: state.bekkais.map((b) =>
            b.id === id ? { ...b, ...data, updated_at: nowISO() } : b,
          ),
        })),

      deleteBekkai: (id) =>
        set((state) => ({ bekkais: state.bekkais.filter((b) => b.id !== id) })),

      exportData: () => ({ bekkais: get().bekkais }),
      importData: (data) => set(() => ({ bekkais: data.bekkais ?? [] })),
      resetAll: () => set(() => ({ bekkais: [] })),
    }),
    { name: 'bekkai-store' },
  ),
)
