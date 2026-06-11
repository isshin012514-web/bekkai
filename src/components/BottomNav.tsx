import { Home, TrendingUp, Search, Sparkles, Rocket, AlertTriangle } from 'lucide-react'
import type { AppTab } from '@/components/AppHeader'
import { haptic } from '@/lib/haptics'

const FORCES: { key: AppTab; label: string; Icon: typeof TrendingUp; color: string }[] = [
  { key: 'home', label: 'ホーム', Icon: Home, color: '#475569' },
  { key: 'growth', label: '成長力', Icon: TrendingUp, color: '#185FA5' },
  { key: 'discovery', label: '発見力', Icon: Search, color: '#7c6cff' },
  { key: 'bekkai', label: '別解力', Icon: Sparkles, color: '#DC2626' },
  { key: 'realization', label: '実現力', Icon: Rocket, color: '#EA580C' },
  { key: 'failure', label: '失敗力', Icon: AlertTriangle, color: '#0D9488' },
]

interface BottomNavProps {
  activeTab: AppTab
  onTabChange: (tab: AppTab) => void
}

/**
 * 下部ナビ（5つの力）。
 * 非アクティブはアイコンのみ・控えめ、アクティブは色付きピル＋ラベル。
 */
export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-border-card bg-surface shadow-[0_-1px_10px_rgba(0,0,0,0.05)]"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 10px)' }}
    >
      <div className="flex items-stretch max-w-[480px] mx-auto px-2 pt-2 pb-1">
        {FORCES.map(({ key, label, Icon, color }) => {
          const on = activeTab === key
          return (
            <button
              key={key}
              onClick={() => { haptic('select'); if (on) window.scrollTo({ top: 0, behavior: 'smooth' }); else onTabChange(key) }}
              aria-label={label}
              aria-pressed={on}
              className="flex-1 flex items-center justify-center min-w-0 min-h-[44px]"
            >
              <span
                className="flex items-center justify-center gap-1 rounded-full transition-all duration-200"
                style={on
                  ? { background: `${color}1A`, color, paddingInline: '12px', paddingBlock: '6px' }
                  : { color: 'var(--color-text-tertiary)', padding: '6px' }}
              >
                <Icon size={19} className="shrink-0" />
                {on && <span className="text-[12px] font-semibold whitespace-nowrap">{label}</span>}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
