import { useState } from 'react'
import Icon from './components/Icon'
import MandalaHome from './components/MandalaHome'
import MandalaModule from './components/MandalaModule'
import CellDetail from './components/CellDetail'
import ConceptView from './components/ConceptView'
import ReviewView from './components/ReviewView'
import { DataProvider } from './DataContext'
import { useEntriesStore } from './stores/entries-store'
import { toast } from '@/stores/toast-store'

export default function DiscoveryApp({ data }) {
  const [view, setView] = useState({ type: 'home' })

  // 段階的開示：「自分」が空のうちは他モジュールへ入れない（どの経路でも）
  const navigate = (to) => {
    if ((to.type === 'module' || to.type === 'cell') && to.moduleId && to.moduleId !== 'self') {
      const e = useEntriesStore.getState().entries
      const selfCount = Object.entries(e).filter(([k]) => k.startsWith('self-')).reduce((n, [, v]) => n + (Array.isArray(v) ? v.length : 0), 0)
      if (selfCount === 0) { toast('「自分」を1つ埋めると解放されます'); return }
    }
    setView(to)
  }
  const goHome = () => navigate({ type: 'home' })
  const goBack = () => {
    if (view.type === 'cell' && view.from === 'review') navigate({ type: 'review' })
    else if (view.type === 'cell') navigate({ type: 'module', moduleId: view.moduleId })
    else goHome()
  }

  return (
    <DataProvider data={data}>
      <div className="discovery-scope bg-bg min-h-0">
        {view.type !== 'home' && (
          <div className="flex items-center gap-2 px-3 pt-3">
            <button onClick={goBack} className="text-text-dim text-xs pl-2.5 pr-3 py-1.5 rounded-full border border-border hover:border-border-light hover:text-text transition-all flex items-center gap-1">
              <Icon name="arrow" size={13} className="rotate-180" /> 戻る
            </button>
          </div>
        )}

        <div className="max-w-lg mx-auto px-3 pb-8">
          {view.type === 'home' && <MandalaHome onNavigate={navigate} />}
          {view.type === 'concept' && <ConceptView onNavigate={navigate} />}
          {view.type === 'review' && <ReviewView onNavigate={navigate} />}
          {view.type === 'module' && <MandalaModule moduleId={view.moduleId} onNavigate={navigate} />}
          {view.type === 'cell' && (
            <CellDetail
              key={`${view.moduleId}-${view.cellId}-${view.focusIndex ?? ''}`}
              moduleId={view.moduleId}
              cellId={view.cellId}
              onNavigate={navigate}
              focusIndex={view.focusIndex}
            />
          )}
        </div>
      </div>
    </DataProvider>
  )
}
