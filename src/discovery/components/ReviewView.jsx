import { useMemo, useState } from 'react'
import Icon from './Icon'
import { useData } from '../DataContext'
import { useEntriesStore } from '../stores/entries-store'

const STATUS_BADGE = {
  untested: { label: '未検証', color: 'text-muted' },
  testing: { label: '検証中', color: 'warning' },
  confident: { label: '確信', color: 'success' },
  rethink: { label: '要再考', color: 'danger' },
}

// 項目の本文を取り出す（文字列／構造化オブジェクト両対応）
const textOf = (e) =>
  typeof e === 'string'
    ? e
    : e?.text ||
      (e?.label ? `${e.label}${e?.value ? '：' + e.value : ''}` : '') ||
      e?.from ||
      '項目'

// フィルタ定義（key, ラベル, 述語）
const FILTERS = [
  { key: 'all', label: 'すべて', test: () => true },
  { key: 'confident', label: '確信', test: (it) => it.status === 'confident' },
  { key: 'testing', label: '検証中', test: (it) => it.status === 'testing' },
  { key: 'rethink', label: '要再考', test: (it) => it.status === 'rethink' },
  { key: 'untested', label: '未検証', test: (it) => !it.status || it.status === 'untested' },
  { key: 'reason', label: '仮説あり', test: (it) => it.hasReason },
  { key: 'noreason', label: '仮説なし', test: (it) => !it.hasReason },
  { key: 'score', label: '採点あり', test: (it) => it.hasScore },
  { key: 'evidence', label: '根拠あり', test: (it) => it.evCount > 0 },
  { key: 'feedback', label: 'FBあり', test: (it) => it.fbCount > 0 },
  { key: 'weak_nofix', label: '弱み・対策なし', test: (it) => it.moduleId === 'self' && it.cellId === 'weakness' && !it.fix },
]

export default function ReviewView({ onNavigate }) {
  const { MODULES, MODULE_DETAILS } = useData()
  const storeEntries = useEntriesStore((s) => s.entries)
  const [active, setActive] = useState('all')

  // 全モジュール×全セルの項目をフラット化
  const items = useMemo(() => {
    const list = []
    for (const m of MODULES) {
      const detail = MODULE_DETAILS[m.id]
      if (!detail) continue
      for (const cell of detail.cells) {
        const arr = storeEntries[`${m.id}-${cell.id}`] || []
        arr.forEach((e, index) => {
          const obj = typeof e === 'object' && e ? e : null
          list.push({
            moduleId: m.id,
            cellId: cell.id,
            index,
            moduleName: m.name,
            cellName: cell.name,
            color: m.color,
            text: textOf(e),
            status: obj?.status,
            hasReason: !!obj?.reason,
            hasScore: !!obj?.score,
            evCount: obj?.evidence?.length ?? 0,
            fbCount: obj?.feedback?.length ?? 0,
            fix: obj?.fix,
            score: obj?.score,
          })
        })
      }
    }
    return list
  }, [MODULES, MODULE_DETAILS, storeEntries])

  const counts = useMemo(() => {
    const c = {}
    for (const f of FILTERS) c[f.key] = items.filter(f.test).length
    return c
  }, [items])

  const filtered = items.filter(FILTERS.find((f) => f.key === active)?.test ?? (() => true))

  return (
    <div className="py-7 space-y-5">
      <div className="text-center animate-fade space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-[18px] mb-0.5 tile"
          style={{ background: 'var(--color-surface)', border: '1px solid color-mix(in srgb, var(--color-accent) 28%, var(--color-border))' }}>
          <Icon name="filter" size={22} style={{ color: 'var(--color-accent)' }} />
        </div>
        <h1 className="text-xl font-bold tracking-tight">横断レビュー</h1>
        <p className="text-text-muted text-xs">8M全体を条件で絞って見直す</p>
      </div>

      {/* フィルタチップ */}
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => {
          const isActive = active === f.key
          return (
            <button
              key={f.key}
              onClick={() => setActive(f.key)}
              className={`text-[11px] px-3 py-1.5 rounded-full border transition-all inline-flex items-center gap-1.5 ${
                isActive ? 'font-semibold' : 'text-text-muted hover:text-text-dim'
              }`}
              style={isActive
                ? { background: 'color-mix(in srgb, var(--color-accent) 16%, transparent)', borderColor: 'color-mix(in srgb, var(--color-accent) 50%, transparent)', color: 'var(--color-accent)' }
                : { borderColor: 'var(--color-border)' }}
            >
              {f.label}
              <span className="text-[9px] mono opacity-70">{counts[f.key]}</span>
            </button>
          )
        })}
      </div>

      {/* 結果 */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 px-0.5">
          <h2 className="text-sm font-medium">該当項目</h2>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.05] text-text-muted tabular-nums">{filtered.length}件</span>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface px-4 py-12 text-center">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/[0.03] border border-border text-text-muted mb-3">
              <Icon name="filter" size={18} />
            </span>
            <p className="text-sm text-text-dim">該当する項目がありません</p>
            <p className="text-[11px] text-text-muted mt-1.5">別の条件を選ぶか、項目を登録してみましょう</p>
          </div>
        ) : (
          filtered.map((it) => {
            const st = STATUS_BADGE[it.status]
            return (
              <button
                key={`${it.moduleId}-${it.cellId}-${it.index}`}
                onClick={() => onNavigate({ type: 'cell', moduleId: it.moduleId, cellId: it.cellId, focusIndex: it.index, from: 'review' })}
                className="w-full text-left animate-fade rounded-2xl border border-border bg-surface p-4 hover:border-border-light transition-all"
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Icon name={it.moduleId} size={12} style={{ color: `var(--color-${it.color})` }} />
                  <span className="text-[10px] font-medium" style={{ color: `var(--color-${it.color})` }}>{it.moduleName}</span>
                  <span className="text-[10px] text-text-muted">›</span>
                  <span className="text-[10px] text-text-dim">{it.cellName}</span>
                </div>
                <p className="text-sm text-text-dim leading-relaxed whitespace-pre-wrap break-words">{it.text}</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  {st && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ background: `color-mix(in srgb, var(--color-${st.color}) 14%, transparent)`, color: `var(--color-${st.color})` }}>
                      {st.label}
                    </span>
                  )}
                  {it.hasReason && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-text-muted"><Icon name="lightbulb" size={10} />仮説</span>
                  )}
                  {it.hasScore && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ background: `color-mix(in srgb, var(--color-${it.color}) 14%, transparent)`, color: `var(--color-${it.color})` }}>
                      <Icon name="flag" size={10} />採点 {it.score.overall.toFixed(1)}
                    </span>
                  )}
                  {it.evCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-text-muted"><Icon name="list" size={10} />根拠 {it.evCount}</span>
                  )}
                  {it.fbCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-text-muted"><Icon name="around" size={10} />FB {it.fbCount}</span>
                  )}
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
