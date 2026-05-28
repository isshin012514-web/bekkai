import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Output, Reviewer, RoleModel, UpcomingPerson, Input, WeeklyGoal } from '@/lib/types'
import { generateId, nowISO } from '@/lib/utils'

interface GrowthData {
  outputs: Output[]
  reviewers: Reviewer[]
  roleModels: RoleModel[]
  upcomingPeople: UpcomingPerson[]
  inputs: Input[]
  weeklyGoals: WeeklyGoal[]
}

interface GrowthState extends GrowthData {
  addOutput: (data: Omit<Output, 'id' | 'user_id' | 'created_at'>) => void
  updateOutput: (id: string, data: Partial<Output>) => void
  deleteOutput: (id: string) => void

  addReviewer: (data: Omit<Reviewer, 'id' | 'user_id'>) => void
  updateReviewer: (id: string, data: Partial<Reviewer>) => void
  deleteReviewer: (id: string) => void

  addRoleModel: (data: Omit<RoleModel, 'id' | 'user_id' | 'created_at'>) => void
  updateRoleModel: (id: string, data: Partial<RoleModel>) => void
  deleteRoleModel: (id: string) => void
  addLearningNote: (roleModelId: string, text: string) => void

  addUpcomingPerson: (data: Omit<UpcomingPerson, 'id' | 'user_id' | 'met'>) => void
  updateUpcomingPerson: (id: string, data: Partial<UpcomingPerson>) => void
  markAsMet: (id: string, learnings: string) => void
  deleteUpcomingPerson: (id: string) => void

  addInput: (data: Omit<Input, 'id' | 'user_id' | 'created_at'>) => void
  updateInput: (id: string, data: Partial<Input>) => void
  deleteInput: (id: string) => void

  addWeeklyGoal: (data: Omit<WeeklyGoal, 'id' | 'created_at'>) => void
  updateWeeklyGoal: (id: string, data: Partial<WeeklyGoal>) => void
  toggleWeeklyGoal: (id: string) => void
  deleteWeeklyGoal: (id: string) => void

  seedData: (data: {
    outputs: Output[]
    reviewers: Reviewer[]
    roleModels: RoleModel[]
    upcomingPeople: UpcomingPerson[]
    inputs: Input[]
  }) => void

  exportData: () => GrowthData
  importData: (data: GrowthData) => void

  resetAll: () => void
}

const USER_ID = 'local-user'

export const useGrowthStore = create<GrowthState>()(
  persist(
    (set, get) => ({
      outputs: [],
      reviewers: [],
      roleModels: [],
      upcomingPeople: [],
      inputs: [],
      weeklyGoals: [],

      addOutput: (data) =>
        set((state) => ({
          outputs: [
            { ...data, id: generateId(), user_id: USER_ID, created_at: nowISO() },
            ...state.outputs,
          ],
        })),

      updateOutput: (id, data) =>
        set((state) => ({
          outputs: state.outputs.map((o) => (o.id === id ? { ...o, ...data } : o)),
        })),

      deleteOutput: (id) =>
        set((state) => ({
          outputs: state.outputs.filter((o) => o.id !== id),
        })),

      addReviewer: (data) =>
        set((state) => ({
          reviewers: [
            ...state.reviewers,
            { ...data, id: generateId(), user_id: USER_ID },
          ],
        })),

      updateReviewer: (id, data) =>
        set((state) => ({
          reviewers: state.reviewers.map((r) => (r.id === id ? { ...r, ...data } : r)),
        })),

      deleteReviewer: (id) =>
        set((state) => ({
          reviewers: state.reviewers.filter((r) => r.id !== id),
        })),

      addRoleModel: (data) =>
        set((state) => ({
          roleModels: [
            ...state.roleModels,
            { ...data, id: generateId(), user_id: USER_ID, created_at: nowISO() },
          ],
        })),

      updateRoleModel: (id, data) =>
        set((state) => ({
          roleModels: state.roleModels.map((r) => (r.id === id ? { ...r, ...data } : r)),
        })),

      deleteRoleModel: (id) =>
        set((state) => ({
          roleModels: state.roleModels.filter((r) => r.id !== id),
        })),

      addLearningNote: (roleModelId, text) =>
        set((state) => ({
          roleModels: state.roleModels.map((r) =>
            r.id === roleModelId
              ? { ...r, learning_notes: [{ at: nowISO(), text }, ...r.learning_notes] }
              : r,
          ),
        })),

      addUpcomingPerson: (data) =>
        set((state) => ({
          upcomingPeople: [
            ...state.upcomingPeople,
            { ...data, id: generateId(), user_id: USER_ID, met: false },
          ],
        })),

      updateUpcomingPerson: (id, data) =>
        set((state) => ({
          upcomingPeople: state.upcomingPeople.map((p) =>
            p.id === id ? { ...p, ...data } : p,
          ),
        })),

      markAsMet: (id, learnings) =>
        set((state) => ({
          upcomingPeople: state.upcomingPeople.map((p) =>
            p.id === id
              ? { ...p, met: true, met_at: nowISO(), learnings_after: learnings }
              : p,
          ),
        })),

      deleteUpcomingPerson: (id) =>
        set((state) => ({
          upcomingPeople: state.upcomingPeople.filter((p) => p.id !== id),
        })),

      addInput: (data) =>
        set((state) => ({
          inputs: [
            { ...data, id: generateId(), user_id: USER_ID, created_at: nowISO() },
            ...state.inputs,
          ],
        })),

      updateInput: (id, data) =>
        set((state) => ({
          inputs: state.inputs.map((i) => (i.id === id ? { ...i, ...data } : i)),
        })),

      deleteInput: (id) =>
        set((state) => ({
          inputs: state.inputs.filter((i) => i.id !== id),
        })),

      addWeeklyGoal: (data) =>
        set((state) => ({
          weeklyGoals: [
            { ...data, id: generateId(), created_at: nowISO() },
            ...state.weeklyGoals,
          ],
        })),

      updateWeeklyGoal: (id, data) =>
        set((state) => ({
          weeklyGoals: state.weeklyGoals.map((g) => (g.id === id ? { ...g, ...data } : g)),
        })),

      toggleWeeklyGoal: (id) =>
        set((state) => ({
          weeklyGoals: state.weeklyGoals.map((g) =>
            g.id === id ? { ...g, done: !g.done } : g,
          ),
        })),

      deleteWeeklyGoal: (id) =>
        set((state) => ({
          weeklyGoals: state.weeklyGoals.filter((g) => g.id !== id),
        })),

      seedData: (data) => set(() => ({ ...data })),

      exportData: (): GrowthData => {
        const s = get()
        return {
          outputs: s.outputs,
          reviewers: s.reviewers,
          roleModels: s.roleModels,
          upcomingPeople: s.upcomingPeople,
          inputs: s.inputs,
          weeklyGoals: s.weeklyGoals,
        }
      },

      importData: (data) =>
        set(() => ({
          outputs: data.outputs ?? [],
          reviewers: data.reviewers ?? [],
          roleModels: data.roleModels ?? [],
          upcomingPeople: data.upcomingPeople ?? [],
          inputs: data.inputs ?? [],
          weeklyGoals: data.weeklyGoals ?? [],
        })),

      resetAll: () =>
        set(() => ({
          outputs: [],
          reviewers: [],
          roleModels: [],
          upcomingPeople: [],
          inputs: [],
          weeklyGoals: [],
        })),
    }),
    {
      name: 'bekkai-growth-store',
    },
  ),
)
