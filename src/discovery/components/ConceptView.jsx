import Icon from './Icon'
import { useData } from '../DataContext'

const STEP_ICON = { 1: 'search', 2: 'list', 3: 'shield', 4: 'flag' }

export default function ConceptView({ onNavigate }) {
  const { DISCOVERY_CONCEPT, MODULES, RESOURCE_SET } = useData()
  return (
    <div className="py-7 space-y-6">
      <div className="text-center animate-fade">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-[20px] glow-pulse mb-3.5 tile" style={{ background: 'var(--color-accent)' }}>
          <Icon name="search" size={28} sw={1.7} className="relative z-10 text-white drop-shadow-lg" />
        </div>
        <h1 className="text-2xl font-bold title-gradient tracking-tight">発見力</h1>
        <p className="text-accent-light text-sm mt-2 font-medium">{DISCOVERY_CONCEPT.definition}</p>
      </div>

      <div className="animate-fade glass rounded-2xl p-4">
        <p className="text-xs text-text-dim leading-relaxed">{DISCOVERY_CONCEPT.lead}</p>
      </div>

      <div>
        <h2 className="text-[11px] font-semibold text-text-dim tracking-label uppercase mono mb-3 flex items-center gap-2">
          <Icon name="compass" size={14} className="text-accent-light" /> Method
        </h2>
        <div className="space-y-2">
          {DISCOVERY_CONCEPT.steps.map((s, i) => (
            <div key={s.no} className={`animate-pop delay-${i + 1} glass rounded-2xl p-3.5 flex items-center gap-3.5`}>
              <div className="shrink-0 w-10 h-10 rounded-xl bg-accent/15 border border-accent/15 flex items-center justify-center text-accent-light">
                <Icon name={STEP_ICON[s.no]} size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] mono text-text-muted">0{s.no}</span>
                  <span className="text-sm font-semibold">{s.title}</span>
                </div>
                <p className="text-[11px] text-text-dim mt-0.5 leading-snug">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="animate-fade rounded-2xl p-4 border border-accent/15" style={{ background: 'color-mix(in srgb, var(--color-accent) 8%, var(--color-surface))' }}>
        <h3 className="text-sm font-semibold mb-1.5">8M ― 視点を変えるフレームワーク</h3>
        <p className="text-[11px] text-text-dim leading-relaxed">{DISCOVERY_CONCEPT.note}</p>
      </div>

      <div>
        <h2 className="text-[11px] font-semibold text-text-dim tracking-label uppercase mono mb-3">8 Windows</h2>
        <div className="space-y-1.5">
          {MODULES.map((m) => (
            <button
              key={m.id}
              onClick={() => onNavigate({ type: 'module', moduleId: m.id })}
              className="w-full flex items-center gap-3 bg-white/[0.02] rounded-xl p-3 border border-border hover:border-border-light hover:bg-white/[0.04] transition-all text-left group"
            >
              <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `color-mix(in srgb, var(--color-${m.color}) 13%, transparent)`, color: `var(--color-${m.color})` }}>
                <Icon name={m.id} size={17} />
              </span>
              <div className="flex-1">
                <span className="text-sm font-semibold" style={{ color: `var(--color-${m.color})` }}>{m.name}</span>
                <span className="text-[11px] text-text-dim ml-2">{m.sub}</span>
              </div>
              {RESOURCE_SET.includes(m.id) && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-warning/12 text-warning border border-warning/20 shrink-0">リソース</span>
              )}
              <Icon name="arrow" size={14} className="text-text-muted shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ))}
        </div>
      </div>

      <div className="animate-fade rounded-xl p-3.5 border border-warning/15 bg-warning/[0.04]">
        <p className="text-[11px] text-text-dim leading-relaxed">
          <span className="text-warning font-semibold">自分・周り・市場</span>はリソースを把握する3点セット。
          強み弱み・動かせる人・時間・コスト・顧客・競合をまとめて見極める。
        </p>
      </div>
    </div>
  )
}
