import { Sun, Moon, Monitor, HelpCircle, Database } from 'lucide-react'
import { useTheme } from '@/lib/use-theme'

export type AppTab = 'growth' | 'discovery' | 'bekkai' | 'realization' | 'failure' | 'data'

interface AppHeaderProps {
  activeTab: AppTab
  onTabChange: (tab: AppTab) => void
  onHelp?: () => void
}

export function AppHeader({ activeTab, onTabChange, onHelp }: AppHeaderProps) {
  const { theme, toggle } = useTheme()
  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor
  const dataActive = activeTab === 'data'

  return (
    <header className="sticky top-0 z-30 border-b border-border-card bg-surface" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-base font-semibold leading-tight">bekkai</h1>
        <div className="flex items-center gap-0.5">
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
