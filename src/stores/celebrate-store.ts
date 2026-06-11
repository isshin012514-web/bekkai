import { create } from 'zustand'

let counter = 0

interface CelebrateState {
  id: number
  fire: () => void
}

export const useCelebrate = create<CelebrateState>((set) => ({
  id: 0,
  fire: () => set({ id: ++counter }),
}))

/** 祝祭エフェクトを発火（非Reactからも呼べる） */
export const celebrate = () => useCelebrate.getState().fire()
