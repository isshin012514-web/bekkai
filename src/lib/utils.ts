import { startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'
import type { Output, Input } from './types'

export function generateId(): string {
  return crypto.randomUUID()
}

export function nowISO(): string {
  return new Date().toISOString()
}

export function getWeekInterval(date: Date = new Date()) {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  }
}

export function isThisWeek(isoDate: string): boolean {
  const { start, end } = getWeekInterval()
  return isWithinInterval(new Date(isoDate), { start, end })
}

export function isLastWeek(isoDate: string): boolean {
  const now = new Date()
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const { start, end } = getWeekInterval(lastWeek)
  return isWithinInterval(new Date(isoDate), { start, end })
}

export function weeklyOutputs(outputs: Output[]): Output[] {
  return outputs.filter((o) => isThisWeek(o.created_at))
}

export function lastWeekOutputs(outputs: Output[]): Output[] {
  return outputs.filter((o) => isLastWeek(o.created_at))
}

export function weeklyInputs(inputs: Input[]): Input[] {
  return inputs.filter((i) => isThisWeek(i.created_at))
}

export function averageSelfScore(outputs: Output[]): number {
  if (outputs.length === 0) return 0
  const sum = outputs.reduce((acc, o) => acc + o.self_score, 0)
  return Number((sum / outputs.length).toFixed(1))
}

export function peerScoredCount(outputs: Output[]): number {
  return outputs.filter((o) => o.peer_score != null).length
}

export function outputInputRatio(outputCount: number, inputCount: number): number {
  if (inputCount === 0) return 0
  return Math.round((outputCount / inputCount) * 100)
}

export function roundScore(score: number): number {
  return Math.round(score * 2) / 2
}

export function clampScore(score: number): number {
  return Math.max(0, Math.min(10, roundScore(score)))
}
