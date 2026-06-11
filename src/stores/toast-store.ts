import { create } from 'zustand'

let counter = 0

interface ToastState {
  msg: string
  id: number
  toast: (msg: string) => void
}

export const useToast = create<ToastState>((set) => ({
  msg: '',
  id: 0,
  toast: (msg: string) => set({ msg, id: ++counter }),
}))

/** 非Reactコードからも呼べるショートカット */
export const toast = (msg: string) => useToast.getState().toast(msg)
