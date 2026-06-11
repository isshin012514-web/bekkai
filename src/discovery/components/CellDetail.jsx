import { useState, useEffect } from 'react'
import Icon from './Icon'
import { useData } from '../DataContext'
import { useEntriesStore } from '../stores/entries-store'
import EntryDetailSheet from './EntryDetailSheet'

const EMPTY = []

// 確信度バッジ（検証ステータス）の表示定義
const STATUS_BADGE = {
  untested: { label: '未検証', color: 'text-muted' },
  testing: { label: '検証中', color: 'warning' },
  confident: { label: '確信', color: 'success' },
  rethink: { label: '要再考', color: 'danger' },
}

// 絶対日時（yyyy/MM/dd HH:mm）
function formatDateTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export default function CellDetail({ moduleId, cellId, onNavigate, focusIndex }) {
  const [showAdd, setShowAdd] = useState(false)
  const [draft, setDraft] = useState('')
  const [reasonDraft, setReasonDraft] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [detailIndex, setDetailIndex] = useState(null)
  const [toast, setToast] = useState(null)

  const { MODULES, MODULE_DETAILS } = useData()

  // 永続化ストアから当該セルの項目を購読（bekkai 準拠の保存方法: Zustand + persist）
  const entryKey = `${moduleId}-${cellId}`
  const entries = useEntriesStore((s) => s.entries[entryKey] ?? EMPTY)
  const addEntry = useEntriesStore((s) => s.addEntry)
  const addEntryObject = useEntriesStore((s) => s.addEntryObject)
  const removeEntry = useEntriesStore((s) => s.removeEntry)

  // トースト自動消去（bekkai パターン 5-4）
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2000)
    return () => clearTimeout(t)
  }, [toast])

  // 横断レビュー等からの深いリンク：指定された項目の詳細シートを開く
  useEffect(() => {
    if (typeof focusIndex === 'number') setDetailIndex(focusIndex)
  }, [focusIndex, moduleId, cellId])

  const mod = MODULES.find((m) => m.id === moduleId)
  const detail = MODULE_DETAILS[moduleId]
  if (!mod || !detail) return null

  const cell = detail.cells.find((c) => c.id === cellId)
  if (!cell) return null

  const isStrength = moduleId === 'self' && cellId === 'strength'
  const isWeakness = moduleId === 'self' && cellId === 'weakness'
  const isCan = moduleId === 'self' && cellId === 'can'
  const isCant = moduleId === 'self' && cellId === 'cant'
  const isCondition = moduleId === 'self' && cellId === 'condition'
  const isBreak = moduleId === 'self' && cellId === 'break'
  const isOthers = moduleId === 'self' && cellId === 'others'
  const isCompare = moduleId === 'self' && cellId === 'compare'
  const isSpecial =
    isStrength || isWeakness || isCan || isCant || isCondition || isBreak || isOthers || isCompare

  const handleSave = () => {
    if (!draft.trim()) return
    addEntry(moduleId, cellId, draft, reasonDraft)
    setDraft('')
    setReasonDraft('')
    setShowAdd(false)
    setToast('保存しました')
  }

  const handleDelete = (index) => {
    removeEntry(moduleId, cellId, index)
    setConfirmDelete(null)
    setToast('削除しました')
  }

  // self セル（強み/弱み等）の構造化追加・削除
  const handleAddSpecial = (obj) => {
    addEntryObject(moduleId, cellId, obj)
    setToast('保存しました')
  }
  const handleRemoveSpecial = (index) => {
    removeEntry(moduleId, cellId, index)
    setToast('削除しました')
  }

  return (
    <div className="py-6 space-y-4">
      <div className="animate-fade text-center space-y-1.5">
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-1 tile"
          style={{
            background: `color-mix(in srgb, var(--color-${mod.color}) 14%, var(--color-surface))`,
            border: `1px solid color-mix(in srgb, var(--color-${mod.color}) 30%, transparent)`,
          }}
        >
          <Icon name={mod.id} size={24} className="relative z-10" style={{ color: `var(--color-${mod.color})` }} />
        </div>
        <h1 className="text-xl font-bold tracking-tight">{cell.name}</h1>
        <p className="text-text-muted text-xs">{cell.sub}</p>
        <div className="inline-flex items-center gap-2 mt-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/6">
          <Icon name={mod.id} size={12} style={{ color: `var(--color-${mod.color})` }} />
          <span className="text-[11px] font-medium" style={{ color: `var(--color-${mod.color})` }}>
            {mod.name}
          </span>
          <span className="text-[11px] text-text-muted">›</span>
          <span className="text-[11px] text-text-dim">{cell.name}</span>
        </div>
      </div>

      {isStrength && <StrengthView entries={entries} color={mod.color} onRemove={handleRemoveSpecial} onOpen={setDetailIndex} />}
      {isWeakness && <WeaknessView entries={entries} color={mod.color} onRemove={handleRemoveSpecial} onOpen={setDetailIndex} />}
      {isCan && <CanView entries={entries} color={mod.color} onRemove={handleRemoveSpecial} onOpen={setDetailIndex} />}
      {isCant && <CantView entries={entries} color={mod.color} onRemove={handleRemoveSpecial} onOpen={setDetailIndex} />}
      {isCondition && <ConditionView entries={entries} good color={mod.color} onRemove={handleRemoveSpecial} onOpen={setDetailIndex} />}
      {isBreak && <ConditionView entries={entries} good={false} color={mod.color} onRemove={handleRemoveSpecial} onOpen={setDetailIndex} />}
      {isOthers && <OthersView entries={entries} color={mod.color} onRemove={handleRemoveSpecial} onOpen={setDetailIndex} />}
      {isCompare && <CompareView entries={entries} color={mod.color} onRemove={handleRemoveSpecial} onOpen={setDetailIndex} />}

      {isSpecial && (
        <SpecialAddForm cellId={cellId} cellName={cell.name} color={mod.color} onAdd={handleAddSpecial} />
      )}

      {!isSpecial && (
        <div className="animate-fade space-y-3">
          {/* セクション見出し */}
          <div className="flex items-center gap-2 px-1">
            <Icon name="list" size={15} className="text-text-muted" />
            <h2 className="text-sm font-medium">登録状況</h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.05] text-text-muted tabular-nums">
              {entries.length}件
            </span>
          </div>

          {/* 空状態 */}
          {entries.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface px-4 py-12 text-center">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/[0.03] border border-border text-text-muted mb-3">
                <Icon name="list" size={18} />
              </span>
              <p className="text-sm text-text-dim">まだ登録がありません</p>
              <p className="text-[11px] text-text-muted mt-1.5">下のボタンから最初の項目を追加しましょう</p>
            </div>
          ) : (
            /* 項目ごとに独立したカード（縦表記） */
            <div className="space-y-2.5">
              {entries.map((entry, i) => {
                const text = typeof entry === 'string' ? entry : entry.text
                const created = typeof entry === 'string' ? null : entry.created_at
                const evCount = typeof entry === 'string' ? 0 : entry.evidence?.length ?? 0
                const fbCount = typeof entry === 'string' ? 0 : entry.feedback?.length ?? 0
                const score = typeof entry === 'string' ? null : entry.score
                const hasNote = typeof entry === 'string' ? false : !!entry.detail
                const hasReason = typeof entry === 'string' ? false : !!entry.reason
                const st = typeof entry === 'string' ? null : STATUS_BADGE[entry.status]
                const key = (entry && entry.id) || i
                return (
                  <div key={key} className="animate-fade rounded-2xl border border-border bg-surface p-4">
                    {/* 番号バッジ + 本文（縦に積む） */}
                    <button
                      onClick={() => setDetailIndex(i)}
                      className="w-full flex items-start gap-3 text-left"
                    >
                      <span
                        className="mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold tabular-nums"
                        style={{
                          background: `color-mix(in srgb, var(--color-${mod.color}) 18%, transparent)`,
                          color: `var(--color-${mod.color})`,
                        }}
                      >
                        {i + 1}
                      </span>
                      <p className="flex-1 text-sm leading-relaxed text-text-dim whitespace-pre-wrap break-words">
                        {text}
                      </p>
                    </button>

                    {/* 付加情報バッジ（確信度 / 仮説 / 採点 / 根拠 / FB / メモ） */}
                    {(st || score || evCount > 0 || fbCount > 0 || hasNote || hasReason) && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pl-9">
                        {st && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{
                              background: `color-mix(in srgb, var(--color-${st.color}) 14%, transparent)`,
                              color: `var(--color-${st.color})`,
                            }}
                          >
                            {st.label}
                          </span>
                        )}
                        {hasReason && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-text-muted">
                            <Icon name="lightbulb" size={10} />仮説
                          </span>
                        )}
                        {score && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{
                              background: `color-mix(in srgb, var(--color-${mod.color}) 14%, transparent)`,
                              color: `var(--color-${mod.color})`,
                            }}
                          >
                            <Icon name="flag" size={10} />採点 {score.overall.toFixed(1)}
                          </span>
                        )}
                        {evCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-text-muted">
                            <Icon name="list" size={10} />根拠 {evCount}
                          </span>
                        )}
                        {fbCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-text-muted">
                            <Icon name="around" size={10} />FB {fbCount}
                          </span>
                        )}
                        {hasNote && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-text-muted">メモ</span>
                        )}
                      </div>
                    )}

                    {/* メタ情報 + 操作（下段） */}
                    <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-border">
                      {confirmDelete === i ? (
                        <>
                          <span className="text-[11px] text-text-muted">削除しますか？</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleDelete(i)}
                              className="px-3 py-1 rounded-md bg-danger text-white text-[11px] font-medium hover:opacity-90 transition-opacity"
                            >
                              削除
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="px-3 py-1 rounded-md border border-border text-text-muted text-[11px] hover:text-text-dim transition-colors"
                            >
                              キャンセル
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-[11px] text-text-muted">
                            {created ? formatDateTime(created) : '—'}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => setDetailIndex(i)}
                              className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md transition-colors hover:bg-white/[0.04]"
                              style={{ color: `var(--color-${mod.color})` }}
                            >
                              <Icon name="search" size={12} />詳細
                            </button>
                            <button
                              onClick={() => setConfirmDelete(i)}
                              className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md text-text-muted hover:text-danger transition-colors"
                            >
                              <Icon name="trash" size={12} />削除
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {!isSpecial && (
        <>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="w-full rounded-xl p-3 text-center transition-all border"
            style={{
              background: `color-mix(in srgb, var(--color-${mod.color}) 8%, transparent)`,
              borderColor: `color-mix(in srgb, var(--color-${mod.color}) 30%, transparent)`,
            }}
          >
            <span className="text-sm font-medium" style={{ color: `var(--color-${mod.color})` }}>
              + 新しい項目を追加
            </span>
          </button>

          {showAdd && (
            <div className="animate-fade bg-surface rounded-xl p-4 border border-border space-y-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-text-muted">{cell.name}</label>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  autoFocus
                  className="w-full bg-surface-2 rounded-lg p-3 text-sm text-text border border-border focus:border-accent outline-none resize-none"
                  rows={2}
                  placeholder={`${cell.name}について書く...`}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-text-muted">なぜそう思うか（仮説・根拠）<span className="text-text-muted/60 font-normal"> ・任意</span></label>
                <textarea
                  value={reasonDraft}
                  onChange={(e) => setReasonDraft(e.target.value)}
                  className="w-full bg-surface-2 rounded-lg p-3 text-sm text-text border border-border focus:border-accent outline-none resize-none"
                  rows={2}
                  placeholder="例：◯◯というデータ／経験から、こう考えた"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={!draft.trim()}
                  className="flex-1 py-2 rounded-lg text-xs font-medium transition-colors disabled:cursor-not-allowed"
                  style={draft.trim()
                    ? { background: `var(--color-${mod.color})`, color: '#fff' }
                    : { background: 'var(--color-surface-3)', color: 'var(--color-text-muted)' }}
                >
                  保存
                </button>
                <button
                  onClick={() => { setShowAdd(false); setDraft(''); setReasonDraft('') }}
                  className="flex-1 py-2 rounded-lg text-xs text-text-dim bg-surface-2 hover:text-text transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <div className="animate-fade bg-surface-2 rounded-xl p-4 border border-border">
        <h4 className="text-[11px] text-text-muted mb-2.5">このモジュール内の他の項目</h4>
        <div className="flex flex-wrap gap-2">
          {detail.cells.map((c) => (
            <button
              key={c.id}
              onClick={() => onNavigate({ type: 'cell', moduleId, cellId: c.id })}
              className={`text-[11px] px-3 py-1.5 rounded-lg transition-all ${
                c.id === cellId
                  ? 'font-bold border'
                  : 'bg-surface text-text-muted hover:text-text-dim'
              }`}
              style={c.id === cellId ? {
                background: `color-mix(in srgb, var(--color-${mod.color}) 20%, var(--color-surface))`,
                borderColor: `var(--color-${mod.color})`,
                color: `var(--color-${mod.color})`,
              } : {}}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* 項目詳細シート（根拠の引用・自己採点・フィードバック等。自分セルでも共通） */}
      {detailIndex !== null && (
        <EntryDetailSheet
          moduleId={moduleId}
          cellId={cellId}
          index={detailIndex}
          color={mod.color}
          onClose={() => setDetailIndex(null)}
          onToast={setToast}
        />
      )}

      {/* トースト通知（bekkai パターン 5-4） */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-surface-3 text-text text-[12px] px-4 py-2 rounded-full shadow-lg border border-border pointer-events-none animate-fade">
          {toast}
        </div>
      )}
    </div>
  )
}

// 各項目の2段階削除ボタン（自分セル共通）
function ItemDeleteButton({ onConfirm }) {
  const [armed, setArmed] = useState(false)
  if (armed) {
    return (
      <span className="inline-flex items-center gap-1 shrink-0">
        <button onClick={onConfirm} className="text-[10px] px-2 py-0.5 rounded-md bg-danger text-white font-medium hover:opacity-90 transition-opacity">
          削除
        </button>
        <button onClick={() => setArmed(false)} className="text-[10px] px-2 py-0.5 rounded-md border border-border text-text-muted hover:text-text-dim transition-colors">
          取消
        </button>
      </span>
    )
  }
  return (
    <button onClick={() => setArmed(true)} aria-label="削除" className="shrink-0 p-1 text-text-muted hover:text-danger transition-colors">
      <Icon name="trash" size={13} />
    </button>
  )
}

// 自分セル共通の付加情報フッター（根拠/アウトプット/メモ/添付/FB/採点へのハブ）
function SpecialFooter({ entry, color, onOpen, onRemove }) {
  const isObj = entry && typeof entry === 'object'
  const st = isObj ? STATUS_BADGE[entry.status] : null
  const hasReason = isObj && !!entry.reason
  const evCount = isObj ? entry.evidence?.length ?? 0 : 0
  const fbCount = isObj ? entry.feedback?.length ?? 0 : 0
  const score = isObj ? entry.score : null
  return (
    <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-border">
      <div className="flex flex-wrap items-center gap-1.5 min-w-0">
        {st && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `color-mix(in srgb, var(--color-${st.color}) 14%, transparent)`, color: `var(--color-${st.color})` }}>
            {st.label}
          </span>
        )}
        {hasReason && (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-text-muted"><Icon name="lightbulb" size={10} />仮説</span>
        )}
        {score && (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `color-mix(in srgb, var(--color-${color}) 14%, transparent)`, color: `var(--color-${color})` }}>
            <Icon name="flag" size={10} />採点 {score.overall.toFixed(1)}
          </span>
        )}
        {evCount > 0 && (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-text-muted"><Icon name="list" size={10} />根拠 {evCount}</span>
        )}
        {fbCount > 0 && (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-text-muted"><Icon name="around" size={10} />FB {fbCount}</span>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={onOpen} className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md transition-colors hover:bg-white/[0.04]" style={{ color: `var(--color-${color})` }}>
          <Icon name="search" size={12} />詳細
        </button>
        <ItemDeleteButton onConfirm={onRemove} />
      </div>
    </div>
  )
}

function StrengthView({ entries, color, onRemove, onOpen }) {
  return (
    <div className="space-y-2">
      {entries.map((s, i) => (
        <div key={(s && s.id) || i} className="animate-fade bg-surface rounded-xl p-4 border border-border">
          <button onClick={() => onOpen(i)} className="w-full flex items-center justify-between gap-2 mb-2 text-left">
            <span className="text-sm font-bold flex-1">{s.text}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/15 text-accent-light shrink-0">Lv.{s.level}</span>
          </button>
          <div className="flex gap-1 mb-2">
            {[...Array(5)].map((_, j) => (
              <div key={j} className={`h-1.5 flex-1 rounded-full ${j < s.level ? 'bg-accent' : 'bg-border'}`} />
            ))}
          </div>
          {s.detail && <p className="text-[11px] text-text-dim">{s.detail}</p>}
          <SpecialFooter entry={s} color={color} onOpen={() => onOpen(i)} onRemove={() => onRemove(i)} />
        </div>
      ))}
    </div>
  )
}

function WeaknessView({ entries, color, onRemove, onOpen }) {
  return (
    <div className="space-y-2">
      {entries.map((w, i) => (
        <div key={(w && w.id) || i} className="animate-fade bg-surface rounded-xl p-4 border border-border">
          <button onClick={() => onOpen(i)} className="w-full flex items-center justify-between gap-2 mb-2 text-left">
            <span className="text-sm font-bold flex-1">{w.text}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-danger/15 text-danger shrink-0">Lv.{w.level}</span>
          </button>
          <div className="flex gap-1 mb-2">
            {[...Array(5)].map((_, j) => (
              <div key={j} className={`h-1.5 flex-1 rounded-full ${j < w.level ? 'bg-danger' : 'bg-border'}`} />
            ))}
          </div>
          {w.detail && <p className="text-[11px] text-danger/70 mb-1">⚠ {w.detail}</p>}
          {w.fix && (
            <div className="bg-success/8 rounded-lg px-2.5 py-1.5">
              <p className="text-[11px] text-success">対策: {w.fix}</p>
            </div>
          )}
          <SpecialFooter entry={w} color={color} onOpen={() => onOpen(i)} onRemove={() => onRemove(i)} />
        </div>
      ))}
    </div>
  )
}

function CanView({ entries, color, onRemove, onOpen }) {
  return (
    <div className="space-y-2">
      {entries.map((e, i) => {
        const t = typeof e === 'string' ? e : e.text
        return (
          <div key={(e && e.id) || i} className="animate-fade bg-surface rounded-xl p-3 border border-border">
            <button onClick={() => onOpen(i)} className="w-full flex items-center gap-2 text-left">
              <span className="text-success text-xs">✓</span>
              <span className="text-sm text-text-dim flex-1">{t}</span>
            </button>
            <SpecialFooter entry={e} color={color} onOpen={() => onOpen(i)} onRemove={() => onRemove(i)} />
          </div>
        )
      })}
    </div>
  )
}

function CantView({ entries, color, onRemove, onOpen }) {
  return (
    <div className="space-y-2">
      {entries.map((c, i) => (
        <div key={(c && c.id) || i} className="animate-fade bg-surface rounded-xl p-3 border border-border">
          <button onClick={() => onOpen(i)} className="w-full flex items-center justify-between gap-2 mb-1 text-left">
            <span className="text-sm flex-1">{c.text}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
              c.type === '学ぶ' ? 'bg-info/15 text-info' :
              c.type === '仕組み化' ? 'bg-warning/15 text-warning' :
              'bg-accent/15 text-accent-light'
            }`}>
              {c.type}
            </span>
          </button>
          {c.action && <p className="text-[11px] text-text-dim">→ {c.action}</p>}
          <SpecialFooter entry={c} color={color} onOpen={() => onOpen(i)} onRemove={() => onRemove(i)} />
        </div>
      ))}
    </div>
  )
}

function ConditionView({ entries, good, color, onRemove, onOpen }) {
  return (
    <div className="space-y-2">
      {entries.map((e, i) => {
        const t = typeof e === 'string' ? e : e.text
        return (
          <div key={(e && e.id) || i} className="animate-fade bg-surface rounded-xl p-3 border border-border">
            <button onClick={() => onOpen(i)} className="w-full flex items-center gap-2 text-left">
              <span className={good ? 'text-success' : 'text-danger'}>{good ? '↑' : '↓'}</span>
              <span className="text-sm text-text-dim flex-1">{t}</span>
            </button>
            <SpecialFooter entry={e} color={color} onOpen={() => onOpen(i)} onRemove={() => onRemove(i)} />
          </div>
        )
      })}
    </div>
  )
}

function OthersView({ entries, color, onRemove, onOpen }) {
  return (
    <div className="space-y-2">
      {entries.map((o, i) => (
        <div key={(o && o.id) || i} className="animate-fade bg-surface rounded-xl p-3 border border-border">
          <button onClick={() => onOpen(i)} className="w-full text-left">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-info/15 text-info">{o.from}</span>
            <p className="text-sm text-text-dim mt-2 leading-relaxed">「{o.text}」</p>
          </button>
          <SpecialFooter entry={o} color={color} onOpen={() => onOpen(i)} onRemove={() => onRemove(i)} />
        </div>
      ))}
    </div>
  )
}

function CompareView({ entries, color, onRemove, onOpen }) {
  return (
    <div className="space-y-2">
      {entries.map((c, i) => (
        <div key={(c && c.id) || i} className="animate-fade bg-surface rounded-xl p-3 border border-border">
          <button onClick={() => onOpen(i)} className="w-full flex items-center justify-between gap-2 text-left">
            <span className="text-xs text-text-muted flex-1">{c.label}</span>
            <span className="text-sm font-bold shrink-0" style={{ color: `var(--color-${c.color || 'info'})` }}>{c.value}</span>
          </button>
          <SpecialFooter entry={c} color={color} onOpen={() => onOpen(i)} onRemove={() => onRemove(i)} />
        </div>
      ))}
    </div>
  )
}

// 自分セル（強み/弱み/できること等）の構造化入力フォーム
const CANT_TYPES = ['学ぶ', '仕組み化', '任せる']
const FROM_OPTIONS = ['上司', '先輩', '後輩', '同期', '取引先', '友人', 'その他']
const TONE_OPTIONS = [
  { key: 'success', label: '良い' },
  { key: 'info', label: '中立' },
  { key: 'warning', label: '課題' },
  { key: 'accent', label: '希少' },
]

function SpecialAddForm({ cellId, cellName, color, onAdd }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [level, setLevel] = useState(3)
  const [detail, setDetail] = useState('')
  const [fix, setFix] = useState('')
  const [type, setType] = useState('学ぶ')
  const [action, setAction] = useState('')
  const [from, setFrom] = useState('先輩')
  const [label, setLabel] = useState('')
  const [value, setValue] = useState('')
  const [tone, setTone] = useState('info')

  // 比較セル用：記録した自分の他項目（強み・できること等）から引用
  const allEntries = useEntriesStore((s) => s.entries)
  const compareSuggestions = (() => {
    if (cellId !== 'compare') return []
    const out = []
    for (const key of ['self-strength', 'self-can', 'self-weakness', 'self-cant']) {
      const list = allEntries[key]
      if (Array.isArray(list)) for (const e of list) { const t = typeof e === 'string' ? e : (e?.text || e?.name); if (t && t.trim()) out.push(t.trim()) }
    }
    return [...new Set(out)].slice(0, 6)
  })()

  const accent = `var(--color-${color})`
  const inputCls = 'w-full bg-surface-2 rounded-lg p-3 text-sm text-text border border-border focus:border-accent outline-none'

  const reset = () => {
    setText(''); setLevel(3); setDetail(''); setFix(''); setType('学ぶ')
    setAction(''); setFrom('先輩'); setLabel(''); setValue(''); setTone('info'); setOpen(false)
  }

  const canSave =
    cellId === 'compare' ? !!(label.trim() && value.trim()) : !!text.trim()

  const submit = () => {
    if (!canSave) return
    let obj
    switch (cellId) {
      case 'strength': obj = { text: text.trim(), level, detail: detail.trim() }; break
      case 'weakness': obj = { text: text.trim(), level, detail: detail.trim(), fix: fix.trim() }; break
      case 'cant': obj = { text: text.trim(), type, action: action.trim() }; break
      case 'others': obj = { from, text: text.trim() }; break
      case 'compare': obj = { label: label.trim(), value: value.trim(), color: tone }; break
      default: obj = { text: text.trim() } // can / condition / break
    }
    onAdd(obj)
    reset()
  }

  // セルごとの主テキスト・補足のラベル
  const textLabel =
    cellId === 'others' ? '評価・コメント' :
    cellId === 'cant' ? 'できないこと' :
    cellId === 'strength' ? '強み' :
    cellId === 'weakness' ? '弱み' :
    cellName
  const textPlaceholder = `${textLabel}を書く…`

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="w-full rounded-xl p-3 text-center transition-all border"
        style={{
          background: `color-mix(in srgb, ${accent} 8%, transparent)`,
          borderColor: `color-mix(in srgb, ${accent} 30%, transparent)`,
        }}
      >
        <span className="text-sm font-medium" style={{ color: accent }}>＋ 新しい項目を追加</span>
      </button>

      {open && (
        <div className="animate-fade bg-surface rounded-xl p-4 border border-border space-y-3">
          {/* 誰から（他者視点のみ先頭に） */}
          {cellId === 'others' && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-text-muted">誰から</label>
              <div className="flex flex-wrap gap-1.5">
                {FROM_OPTIONS.map((opt) => {
                  const active = from === opt
                  return (
                    <button key={opt} onClick={() => setFrom(opt)}
                      className="text-[11px] px-3 py-1.5 rounded-lg border transition-all"
                      style={active
                        ? { background: `color-mix(in srgb, ${accent} 18%, transparent)`, borderColor: `color-mix(in srgb, ${accent} 50%, transparent)`, color: accent }
                        : { borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                      {opt}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* 比較セルは label / value */}
          {cellId === 'compare' ? (
            <>
              {compareSuggestions.length > 0 && (
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-text-muted">記録した自分の項目から引用</label>
                  <div className="flex flex-wrap gap-1.5">
                    {compareSuggestions.map((s, i) => (
                      <button key={i} type="button" onClick={() => setLabel(s)}
                        className="text-[11px] px-2.5 py-1 rounded-full border transition-colors"
                        style={{ borderColor: 'color-mix(in srgb, var(--color-accent) 45%, transparent)', color: 'var(--color-accent)' }}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-text-muted">何を比べる（対象）</label>
                <input value={label} onChange={(e) => setLabel(e.target.value)} autoFocus placeholder="例：企画力 / 営業力（上のチップからも選べる）" className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-text-muted">どこで・相対ポジション</label>
                <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="例：組織内で3位くらい / 日本で上位10% / 同業の中で中位" className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-text-muted">トーン</label>
                <div className="flex flex-wrap gap-1.5">
                  {TONE_OPTIONS.map((opt) => {
                    const active = tone === opt.key
                    const c = `var(--color-${opt.key})`
                    return (
                      <button key={opt.key} onClick={() => setTone(opt.key)}
                        className="text-[11px] px-3 py-1.5 rounded-lg border transition-all"
                        style={active
                          ? { background: `color-mix(in srgb, ${c} 18%, transparent)`, borderColor: `color-mix(in srgb, ${c} 50%, transparent)`, color: c }
                          : { borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-text-muted">{textLabel}</label>
              <textarea value={text} onChange={(e) => setText(e.target.value)} autoFocus={cellId !== 'others'} rows={2} placeholder={textPlaceholder} className={`${inputCls} resize-none`} />
            </div>
          )}

          {/* レベル（強み・弱み） */}
          {(cellId === 'strength' || cellId === 'weakness') && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-text-muted">レベル（1〜5）</label>
                <span className="text-[13px] font-bold tabular-nums" style={{ color: accent }}>Lv.{level}</span>
              </div>
              <input type="range" min={1} max={5} step={1} value={level} onChange={(e) => setLevel(parseInt(e.target.value, 10))} className="w-full h-1.5" style={{ accentColor: accent }} />
            </div>
          )}

          {/* 補足（強み=発揮条件 / 弱み=状況） */}
          {(cellId === 'strength' || cellId === 'weakness') && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-text-muted">
                {cellId === 'strength' ? 'どんな時に発揮されるか' : 'どんな時に出るか'}<span className="text-text-muted/60 font-normal"> ・任意</span>
              </label>
              <textarea value={detail} onChange={(e) => setDetail(e.target.value)} rows={2} placeholder="例：目的が明確な時に最も発揮される" className={`${inputCls} resize-none`} />
            </div>
          )}

          {/* 対策（弱みのみ） */}
          {cellId === 'weakness' && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-text-muted">対策<span className="text-text-muted/60 font-normal"> ・任意</span></label>
              <input value={fix} onChange={(e) => setFix(e.target.value)} placeholder="例：チェックリスト化" className={inputCls} />
            </div>
          )}

          {/* タイプ・対応（できないこと） */}
          {cellId === 'cant' && (
            <>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-text-muted">どう向き合うか</label>
                <div className="flex flex-wrap gap-1.5">
                  {CANT_TYPES.map((opt) => {
                    const active = type === opt
                    return (
                      <button key={opt} onClick={() => setType(opt)}
                        className="text-[11px] px-3 py-1.5 rounded-lg border transition-all"
                        style={active
                          ? { background: `color-mix(in srgb, ${accent} 18%, transparent)`, borderColor: `color-mix(in srgb, ${accent} 50%, transparent)`, color: accent }
                          : { borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-text-muted">アクション<span className="text-text-muted/60 font-normal"> ・任意</span></label>
                <input value={action} onChange={(e) => setAction(e.target.value)} placeholder="例：学習計画を作る" className={inputCls} />
              </div>
            </>
          )}

          <div className="flex gap-2">
            <button onClick={submit} disabled={!canSave} className="flex-1 py-2 rounded-lg text-xs font-medium transition-colors disabled:cursor-not-allowed"
              style={canSave ? { background: accent, color: '#fff' } : { background: 'var(--color-surface-3)', color: 'var(--color-text-muted)' }}>
              保存
            </button>
            <button onClick={reset} className="flex-1 py-2 rounded-lg text-xs text-text-dim bg-surface-2 hover:text-text transition-colors">
              キャンセル
            </button>
          </div>
        </div>
      )}
    </>
  )
}
