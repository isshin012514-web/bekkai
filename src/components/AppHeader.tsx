import { Sun, Moon, Monitor, HelpCircle, Database, LineChart } from 'lucide-react'
import { useTheme } from '@/lib/use-theme'

export type AppTab = 'home' | 'growth' | 'discovery' | 'bekkai' | 'realization' | 'failure' | 'dashboard' | 'data' | 'about'

interface AppHeaderProps {
  activeTab: AppTab
  onTabChange: (tab: AppTab) => void
  onHelp?: () => void
}

const ACCENT: Partial<Record<AppTab, string>> = {
  growth: '#185FA5', discovery: '#7c6cff', bekkai: '#DC2626', realization: '#EA580C', failure: '#0D9488', dashboard: '#185FA5',
}

export function AppHeader({ activeTab, onTabChange, onHelp }: AppHeaderProps) {
  const { theme, toggle } = useTheme()
  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor
  const dataActive = activeTab === 'data'
  const dashActive = activeTab === 'dashboard'
  const accent = ACCENT[activeTab]

  return (
    <header className="sticky top-0 z-30 border-b border-border-card bg-surface" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* 現在地のアクセントライン */}
      <div className="h-[3px] transition-colors duration-300" style={{ background: accent ?? 'transparent' }} />
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-base font-semibold leading-tight">bekkai</h1>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`p-1.5 rounded-lg transition-colors ${dashActive ? 'bg-primary-bg text-primary' : 'hover:bg-surface-secondary text-text-secondary'}`}
            title="成長の可視化（サマリー・週次レポート）"
            aria-pressed={dashActive}
          >
            <LineChart size={16} />
          </button>
          <button
            onClick={() => onTabChange('data')}
            className={`p-1.5 rounded-lg transition-colors ${dataActive ? 'bg-surface-secondary text-text-primary' : 'hover:bg-surface-secondary text-text-secondary'}`}
            title="データ（同期・バックアップ）"
            aria-pressed={dataActive}
          >
            <Database size={16} />
          </button>
          {onHelp && (
            <button onClick={onHelp} className="p-1.5 rounded-lg hover:bg-surface-secondary text-text-secondary" title="使い方・全体像">
              <HelpCircle size={16} />
            </button>
          )}
          <button onClick={toggle} className="p-1.5 rounded-lg hover:bg-surface-secondary text-text-secondary" title={`テーマ: ${theme}`}>
            <ThemeIcon size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}
