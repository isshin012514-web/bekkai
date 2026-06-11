export interface BadgeCtx {
  discovery: number
  bekkaiTotal: number
  bekkaiDone: number
  outputs: number
  inputs: number
  failure: number
  realization: number
  realizationDone: number
  streak: number
}

import { Footprints, Search, Sparkles, Target, Zap, Rocket, Shield, Flame, Trophy } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface BadgeDef {
  key: string
  Icon: LucideIcon
  color: string
  label: string
  desc: string
  earned: (c: BadgeCtx) => boolean
}

export const BADGES: BadgeDef[] = [
  { key: 'first-step', Icon: Footprints, color: '#0F9D58', label: '最初の一歩', desc: '何か1件記録した', earned: (c) => c.discovery + c.bekkaiTotal + c.outputs + c.inputs + c.failure + c.realization > 0 },
  { key: 'analyst', Icon: Search, color: '#7c6cff', label: '自己分析家', desc: '発見力で20件記録', earned: (c) => c.discovery >= 20 },
  { key: 'first-bekkai', Icon: Sparkles, color: '#DC2626', label: '初めての別解', desc: '別解を1つ完成', earned: (c) => c.bekkaiDone >= 1 },
  { key: 'bekkai-master', Icon: Target, color: '#B91C1C', label: '別解マスター', desc: '別解を3つ完成', earned: (c) => c.bekkaiDone >= 3 },
  { key: 'output-machine', Icon: Zap, color: '#185FA5', label: 'アウトプット魔', desc: 'アウトプット10件', earned: (c) => c.outputs >= 10 },
  { key: 'realizer', Icon: Rocket, color: '#EA580C', label: '実現者', desc: '実現力を成功させた', earned: (c) => c.realizationDone >= 1 },
  { key: 'resilient', Icon: Shield, color: '#0D9488', label: '転んでも', desc: '失敗力で3件記録', earned: (c) => c.failure >= 3 },
  { key: 'streak-7', Icon: Flame, color: '#EA580C', label: '継続の炎', desc: '7日連続記録', earned: (c) => c.streak >= 7 },
  { key: 'streak-30', Icon: Trophy, color: '#D97706', label: '習慣の達人', desc: '30日連続記録', earned: (c) => c.streak >= 30 },
]

export function earnedBadges(c: BadgeCtx): BadgeDef[] {
  return BADGES.filter((b) => b.earned(c))
}
