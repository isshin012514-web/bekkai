// 軽い触覚フィードバック。Web は Vibration API、未対応端末では no-op。
type Pattern = 'light' | 'success' | 'select'

const MAP: Record<Pattern, number | number[]> = {
  light: 8,
  select: 5,
  success: [10, 40, 18],
}

export function haptic(pattern: Pattern = 'light'): void {
  try {
    const nav = navigator as Navigator & { vibrate?: (p: number | number[]) => boolean }
    nav.vibrate?.(MAP[pattern])
  } catch { /* noop */ }
}
