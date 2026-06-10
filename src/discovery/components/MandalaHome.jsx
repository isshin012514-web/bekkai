import { useState } from 'react'
import Icon from './Icon'
import { useData } from '../DataContext'
import { useEntriesStore } from '../stores/entries-store'
import { SampleControls } from '@/components/SampleControls'

const GRID_ORDER = [
  { pos: 0, idx: 0 },
  { pos: 1, idx: 1 },
  { pos: 2, idx: 2 },
  { pos: 3, idx: 3 },
  { pos: 4, idx: -1 },
  { pos: 5, idx: 4 },
  { pos: 6, idx: 5 },
  { pos: 7, idx: 6 },
  { pos: 8, idx: 7 },
]

const ONBOARD_KEY = 'discovery-8m-onboarded'

// 進捗リング（filled / total セル）
function ProgressRing({ value, total, color = 'accent', size = 30, sw = 3 }) {
  const r = (size - sw) / 2
  const c = 2 * Math.PI * r
  const ratio = total > 0 ? value / total : 0
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-border)" strokeWidth={sw} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={`var(--color-${color})`} strokeWidth={sw} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - ratio)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  )
}

export default function MandalaHome({ onNavigate }) {
  const { MODULES, DISCOVERY_CONCEPT, MODULE_DETAILS } = useData()
  const storeEntries = useEntriesStore((s) => s.entries)
  const [onboarded, setOnboarded] = useState(
    () => typeof localStorage !== 'undefined' && localStorage.getItem(ONBOARD_KEY) === '1',
  )

  const dismissOnboard = () => {
    setOnboarded(true)
    if (typeof localStorage !== 'undefined') localStorage.setItem(ONBOARD_KEY, '1')
  }

  // ストア（実データ）から件数・埋まったセル数を算出
  const statFor = (moduleId) => {
    const detail = MODULE_DETAILS[moduleId]
    if (!detail) return { count: 0, filled: 0, total: 0 }
    let count = 0
    let filled = 0
    for (const cell of detail.cells) {
      const n = storeEntries[`${moduleId}-${cell.id}`]?.length || 0
      count += n
      if (n > 0) filled += 1
    }
    return { count, filled, total: detail.cells.length }
  }

  const allStats = MODULES.map((m) => ({ id: m.id, ...statFor(m.id) }))
  const totalCells = allStats.reduce((s, x) => s + x.total, 0)
  const totalFilled = allStats.reduce((s, x) => s + x.filled, 0)
  const totalEntries = allStats.reduce((s, x) => s + x.count, 0)

  return (
    <div className="py-5 space-y-5">
      <div className="-mx-1">
        <SampleControls feature="discovery" hasData={totalEntries > 0} accent="#7c6cff" />
      </div>
      <div className="space-y-1">
        <h1 className="text-[17px] font-semibold text-text leading-tight">8つの視点で深掘る</h1>
        <p className="text-[11px] text-text-muted">発見力 ― 解くべき問題を解くための力</p>
      </div>

      {/* はじめての方へ（最小ルート誘導） */}
      {!onboarded && (
        <div className="animate-fade glass rounded-2xl p-4 space-y-3 relative" style={{ borderColor: 'color-mix(in srgb, var(--color-self) 30%, transparent)' }}>
          <button onClick={dismissOnboard} aria-label="閉じる" className="absolute top-3 right-3 p-1 text-text-muted hover:text-text transition-colors">
            <Icon name="plus" size={15} className="rotate-45" />
          </button>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'color-mix(in srgb, var(--color-self) 18%, transparent)' }}>
              <Icon name="self" size={15} style={{ color: 'var(--color-self)' }} />
            </span>
            <h2 className="text-sm font-bold">はじめての方へ</h2>
          </div>
          <p className="text-[12px] text-text-dim leading-relaxed">
            いきなり64マス全部は埋めなくてOK。まずは <span className="font-semibold" style={{ color: 'var(--color-self)' }}>「自分」</span> の
            <span className="font-semibold">強み・弱み</span> の2マスだけ書いてみましょう。5分で1周する感覚がつかめます。
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onNavigate({ type: 'cell', moduleId: 'self', cellId: 'strength' })}
              className="flex-1 py-2 rounded-lg text-xs font-medium text-white"
              style={{ background: 'var(--color-self)' }}
            >
              「強み」から始める
            </button>
            <button onClick={dismissOnboard} className="px-4 py-2 rounded-lg text-xs text-text-dim bg-surface-2 hover:text-text transition-colors">
              あとで
            </button>
          </div>
        </div>
      )}

      {/* 全体の進捗 */}
      <div className="animate-fade glass rounded-2xl p-4 flex items-center gap-4">
        <div className="relative">
          <ProgressRing value={totalFilled} total={totalCells} size={52} sw={5} />
          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold tabular-nums">
            {totalCells > 0 ? Math.round((totalFilled / totalCells) * 100) : 0}%
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-text">全体の進捗</div>
          <div className="text-[11px] text-text-muted mt-0.5">
            {totalFilled}/{totalCells} マス着手 ・ {totalEntries} 件登録
          </div>
        </div>
        <button
          onClick={() => onNavigate({ type: 'review' })}
          className="shrink-0 inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full border border-border text-text-dim hover:text-text hover:border-border-light transition-all"
        >
          <Icon name="filter" size={12} />横断レビュー
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2.5 aspect-square">
        {GRID_ORDER.map(({ pos, idx }) => {
          if (idx === -1) {
            return (
              <button
                key="center"
                onClick={() => onNavigate({ type: 'concept' })}
                className="animate-pop tile rounded-[22px] flex flex-col items-center justify-center gap-1.5 glow-pulse relative"
                style={{ background: 'var(--color-accent)' }}
              >
                <Icon name="search" size={26} sw={1.7} className="relative z-10 text-white drop-shadow" />
                <span className="text-[13px] font-bold relative z-10 tracking-tight text-white">発見力</span>
                <span className="text-[7px] text-white/55 relative z-10 tracking-label uppercase mono">Discovery</span>
              </button>
            )
          }
          const m = MODULES[idx]
          const st = statFor(m.id)
          return (
            <button
              key={m.id}
              onClick={() => onNavigate({ type: 'module', moduleId: m.id })}
              className={`animate-pop delay-${pos + 1} tile rounded-[22px] flex flex-col items-center justify-center gap-2 relative`}
              style={{
                background: 'var(--color-surface)',
                border: `1px solid color-mix(in srgb, var(--color-${m.color}) 16%, var(--color-border))`,
              }}
            >
              <span
                className="absolute -top-7 -right-7 w-20 h-20 rounded-full blur-2xl pointer-events-none"
                style={{ background: `var(--color-${m.color})`, opacity: 0.16 }}
              />
              {st.filled > 0 && (
                <span
                  className="absolute top-2 right-2 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[8px] font-bold text-white z-10 mono"
                  style={{ background: `var(--color-${m.color})` }}
                >
                  {st.filled}
                </span>
              )}
              <Icon name={m.id} size={23} className="relative z-10" style={{ color: `var(--color-${m.color})` }} />
              <div className="relative z-10 text-center">
                <div className="text-[12px] font-semibold text-text leading-none">{m.name}</div>
                <div className="text-[8px] text-text-muted mt-1">{m.sub}</div>
              </div>
            </button>
          )
        })}
      </div>

      <button
        onClick={() => onNavigate({ type: 'concept' })}
        className="w-full animate-fade glass rounded-2xl p-4 text-left hover:border-accent/30 transition-all group flex items-center gap-3.5"
      >
        <span className="w-9 h-9 rounded-xl bg-accent/12 border border-accent/15 flex items-center justify-center text-accent-light shrink-0">
          <Icon name="compass" size={18} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-xs font-semibold text-text">発見力とは / 方法論</span>
          </div>
          <p className="text-[11px] text-text-dim leading-snug line-clamp-2">{DISCOVERY_CONCEPT.lead}</p>
        </div>
        <Icon name="arrow" size={15} className="text-text-muted shrink-0 group-hover:translate-x-0.5 transition-transform" />
      </button>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-[11px] font-semibold text-text-dim tracking-wide">モジュール別の進捗</h2>
          <span className="text-[10px] text-text-muted mono">8 MODULES</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {MODULES.map((m, i) => {
            const st = statFor(m.id)
            return (
              <button
                key={m.id}
                onClick={() => onNavigate({ type: 'module', moduleId: m.id })}
                className={`animate-pop delay-${i + 1} tile rounded-2xl p-3 flex flex-col items-center gap-1.5`}
                style={{
                  background: 'var(--color-surface)',
                  border: `1px solid var(--color-border)`,
                }}
              >
                <div className="relative">
                  <ProgressRing value={st.filled} total={st.total} color={m.color} size={30} sw={3} />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Icon name={m.id} size={11} style={{ color: `var(--color-${m.color})` }} />
                  </span>
                </div>
                <div className="text-[10px] font-medium text-text relative z-10">{m.name}</div>
                <div className="text-[9px] text-text-muted relative z-10 mono">{st.filled}/{st.total}</div>
              </button>
            )
          })}
        </div>
      </div>

    </div>
  )
}
