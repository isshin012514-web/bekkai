import { Sun, Moon, Monitor, Search, TrendingUp, Sparkles, HelpCircle, Database, AlertTriangle, Rocket } from 'lucide-react'
import { useTheme } from '@/lib/use-theme'

type AppTab = 'growth' | 'discovery' | 'bekkai' | 'realization' | 'failure' | 'data'

const TABS: { key: AppTab; label: string; Icon: typeof TrendingUp; active: string }[] = [
  { key: 'growth', label: '成長力', Icon: TrendingUp, active: 'border-primary text-primary' },
  { key: 'discovery', label: '発見力', Icon: Search, active: 'border-[#7c6cff] text-[#7c6cff]' },
  { key: 'bekkai', label: '別解力', Icon: Sparkles, active: 'border-[#DC2626] text-[#DC2626]' },
  { key: 'realization', label: '実現力', Icon: Rocket, active: 'border-[#EA580C] text-[#EA580C]' },
  { key: 'failure', label: '失敗力', Icon: AlertTriangle, active: 'border-[#0D9488] text-[#0D9488]' },
  { key: 'data', label: 'データ', Icon: Database, active: 'border-text-primary text-text-primary' },
]

interface AppHeaderProps {
  activeTab: AppTab
  onTabChange: (tab: AppTab) => void
  onHelp?: () => void
}

export function AppHeader({ activeTab, onTabChange, onHelp }: AppHeaderProps) {
  const { theme, toggle } = useTheme()

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor

  return (
    <header className="border-b border-border-card">
      <div className="flex items-center justify-between px-4 py-2.5">
        <h1 className="text-base font-semibold leading-tight">bekkai</h1>
        <div className="flex items-center gap-1">
          {onHelp && (
            <button
              onClick={onHelp}
              className="p-1.5 rounded-lg hover:bg-surface-secondary"
              title="この機能の使い方"
            >
              <HelpCircle size={16} className="text-text-secondary" />
            </button>
          )}
          <button
            onClick={toggle}
            className="p-1.5 rounded-lg hover:bg-surface-secondary"
            title={`テーマ: ${theme}`}
          >
            <ThemeIcon size={16} className="text-text-secondary" />
          </button>
        </div>
      </div>
      <div className="flex px-2">
        {TABS.map(({ key, label, Icon, active }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`flex-1 min-w-0 flex items-center justify-center gap-1 px-1 py-2 text-[13px] font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === key ? active : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Icon size={14} className="shrink-0" />
            {label}
          </button>
        ))}
      </div>
    </header>
  )
}
