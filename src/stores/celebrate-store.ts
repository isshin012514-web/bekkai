import { create } from 'zustand'
import { haptic } from '@/lib/haptics'

let counter = 0

interface CelebrateState {
  id: number
  fire: () => void
}

export const useCelebrate = create<CelebrateState>((set) => ({
  id: 0,
  fire: () => { haptic('success'); set({ id: ++counter }) },
}))

/** 祝祭エフェクトを発火（非Reactからも呼べる） */
export const celebrate = () => useCelebrate.getState().fire()
