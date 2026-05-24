import { ChevronLeft, Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/lib/use-theme'

interface GrowthHeaderProps {
  score: number
  maxScore: number
}

export function GrowthHeader({ score, maxScore }: GrowthHeaderProps) {
  const { theme, toggle } = useTheme()

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border-card">
      <div className="flex items-center gap-2">
        <button className="p-1 -ml-1 rounded-lg hover:bg-surface-secondary">
          <ChevronLeft size={20} className="text-text-secondary" />
        </button>
        <div>
          <p className="text-[11px] text-text-secondary leading-tight">5つの力 · CORE</p>
          <h1 className="text-lg font-medium leading-tight">成長力</h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="p-1.5 rounded-lg hover:bg-surface-secondary"
          title={`テーマ: ${theme}`}
        >
          <ThemeIcon size={16} className="text-text-secondary" />
        </button>
        <span className="inline-flex items-center justify-center min-w-[40px] px-2 py-0.5 rounded-full bg-primary-bg text-primary text-sm font-medium">
          {score} / {maxScore}
        </span>
      </div>
    </header>
  )
}
