import Icon from './Icon'
import { useData } from '../DataContext'
import { useEntriesStore } from '../stores/entries-store'

const GRID_ORDER = [0, 1, 2, 3, -1, 4, 5, 6, 7]

export default function MandalaModule({ moduleId, onNavigate }) {
  const { MODULES, MODULE_DETAILS, MODULE_INTRO } = useData()
  const CELL_ENTRIES = useEntriesStore((s) => s.entries)
  const mod = MODULES.find((m) => m.id === moduleId)
  const detail = MODULE_DETAILS[moduleId]
  const intro = MODULE_INTRO[moduleId]
  if (!mod || !detail) return null

  return (
    <div className="py-7 space-y-5">
      <div className="text-center animate-fade space-y-2">
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-[18px] mb-0.5 relative tile"
          style={{
            background: 'var(--color-surface)',
            border: `1px solid color-mix(in srgb, var(--color-${mod.color}) 28%, var(--color-border))`,
          }}
        >
          <span className="absolute -top-5 -right-5 w-16 h-16 rounded-full blur-2xl" style={{ background: `var(--color-${mod.color})`, opacity: 0.22 }} />
          <Icon name={mod.id} size={24} className="relative z-10" style={{ color: `var(--color-${mod.color})` }} />
        </div>
        <h1 className="text-xl font-bold tracking-tight">{mod.name}</h1>
        <p className="text-text-muted text-xs">{mod.sub}</p>
      </div>

      {intro && (
        <div
          className="animate-fade rounded-2xl p-4 border backdrop-blur-sm"
          style={{
            background: `var(--color-surface)`,
            borderColor: `color-mix(in srgb, var(--color-${mod.color}) 18%, var(--color-border))`,
          }}
        >
          <div className="flex items-start gap-2 mb-2.5">
            <p className="text-xs text-text-dim leading-relaxed flex-1">{intro.lead}</p>
            {intro.resource && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-warning/12 text-warning shrink-0 whitespace-nowrap border border-warning/20">リソース3点</span>
            )}
          </div>
          <div className="space-y-1.5 pt-2.5 border-t border-border">
            {intro.questions.map((q, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[10px] font-bold mt-px mono" style={{ color: `var(--color-${mod.color})` }}>Q{i + 1}</span>
                <span className="text-[11px] text-text-dim leading-snug">{q}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2.5 aspect-square">
        {GRID_ORDER.map((cellIdx, gridPos) => {
          if (cellIdx === -1) {
            return (
              <div
                key="center"
                className="animate-pop tile rounded-[20px] flex flex-col items-center justify-center gap-1.5 relative"
                style={{
                  background: `var(--color-${mod.color})`,
                  boxShadow: `0 8px 28px color-mix(in srgb, var(--color-${mod.color}) 35%, transparent), inset 0 1px 0 rgba(255,255,255,0.18)`,
                }}
              >
                <Icon name={mod.id} size={22} className="relative z-10 text-white drop-shadow" />
                <span className="text-[13px] font-bold relative z-10 text-white">{mod.name}</span>
              </div>
            )
          }

          const cell = detail.cells[cellIdx]
          const entryKey = `${moduleId}-${cell.id}`
          const entries = CELL_ENTRIES[entryKey]
          const hasEntries = entries && entries.length > 0
          const num = cellIdx + 1

          return (
            <button
              key={cell.id}
              onClick={() => onNavigate({ type: 'cell', moduleId, cellId: cell.id })}
              className={`animate-pop delay-${gridPos + 1} tile rounded-[20px] flex flex-col items-center justify-center gap-1.5 relative px-1.5`}
              style={{
                background: 'var(--color-surface)',
                border: hasEntries
                  ? `1px solid color-mix(in srgb, var(--color-${mod.color}) 28%, var(--color-border))`
                  : '1px solid var(--color-border)',
              }}
            >
              {hasEntries && (
                <span className="absolute -top-6 -right-6 w-14 h-14 rounded-full blur-2xl" style={{ background: `var(--color-${mod.color})`, opacity: 0.15 }} />
              )}
              <span
                className="absolute top-2 left-2 text-[9px] font-bold mono opacity-50"
                style={{ color: hasEntries ? `var(--color-${mod.color})` : 'var(--color-text-muted)' }}
              >
                {String(num).padStart(2, '0')}
              </span>
              {hasEntries && (
                <span
                  className="absolute top-2 right-2 min-w-[15px] h-[15px] px-1 rounded-full flex items-center justify-center text-[8px] font-bold text-white z-10 mono"
                  style={{ background: `var(--color-${mod.color})` }}
                >
                  {entries.length}
                </span>
              )}
              <span className="text-[11px] font-semibold text-text relative z-10 text-center leading-tight">{cell.name}</span>
              <span className="text-[8px] text-text-muted relative z-10 text-center leading-tight">{cell.sub}</span>
            </button>
          )
        })}
      </div>

      <div className="animate-fade glass rounded-2xl p-4 space-y-2.5">
        <h3 className="text-[11px] font-semibold text-text-dim tracking-wide flex items-center gap-2">
          <span className="w-1 h-3.5 rounded-full" style={{ background: `var(--color-${mod.color})` }} />
          登録済みの項目
        </h3>
        {detail.cells.map((cell) => {
          const entryKey = `${moduleId}-${cell.id}`
          const entries = CELL_ENTRIES[entryKey]
          if (!entries || entries.length === 0) return null

          return (
            <button
              key={cell.id}
              onClick={() => onNavigate({ type: 'cell', moduleId, cellId: cell.id })}
              className="w-full text-left bg-white/[0.02] rounded-xl p-3 border border-border hover:border-border-light hover:bg-white/[0.04] transition-all"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: `var(--color-${mod.color})` }} />
                <span className="text-xs font-semibold text-text">{cell.name}</span>
                <span className="text-[10px] text-text-muted ml-auto mono">{entries.length}</span>
              </div>
              <div className="space-y-1 pl-3.5">
                {entries.slice(0, 2).map((e, i) => (
                  <p key={i} className="text-[11px] text-text-dim truncate">
                    {typeof e === 'string' ? e : e.text}
                  </p>
                ))}
                {entries.length > 2 && (
                  <p className="text-[10px] text-text-muted">+{entries.length - 2}</p>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 -mx-1 px-1">
        <span className="text-[10px] text-text-muted shrink-0 tracking-label mono">8M</span>
        {MODULES.map((m) => (
          <button
            key={m.id}
            onClick={() => onNavigate({ type: 'module', moduleId: m.id })}
            className={`shrink-0 text-[10px] pl-2 pr-2.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              m.id === moduleId
                ? 'font-semibold border'
                : 'bg-white/[0.02] border border-border text-text-muted hover:text-text-dim'
            }`}
            style={m.id === moduleId ? {
              background: `color-mix(in srgb, var(--color-${m.color}) 14%, transparent)`,
              borderColor: `color-mix(in srgb, var(--color-${m.color}) 45%, transparent)`,
              color: `var(--color-${m.color})`,
            } : {}}
          >
            <Icon name={m.id} size={12} style={{ color: m.id === moduleId ? `var(--color-${m.color})` : 'var(--color-text-muted)' }} />
            {m.name}
          </button>
        ))}
      </div>
    </div>
  )
}
