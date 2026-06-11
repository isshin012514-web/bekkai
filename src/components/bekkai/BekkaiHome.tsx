import { useMemo, useState } from 'react'
import { Plus, ChevronLeft, Trash2, Star, Search } from 'lucide-react'
import type { BekkaiAxis } from '@/lib/types'
import { useBekkaiStore } from '@/stores/bekkai-store'
import { useEntriesStore } from '@/discovery/stores/entries-store'
import { SampleControls } from '@/components/SampleControls'
import { SampleHint } from '@/components/SampleHint'
import { Term } from '@/components/Term'
import { toast } from '@/stores/toast-store'
import { BekkaiVenn } from './BekkaiVenn'
import { HintTicker } from './HintTicker'
import { AreaSheet } from './AreaSheet'
import { IntegrateSheet } from './IntegrateSheet'

const AXIS_BY_IDX: BekkaiAxis[] = ['self', 'excellent', 'different']
const COLORS = ['#6366f1', '#D97706', '#059669']
const BGS = ['#EEF2FF', '#FFFBEB', '#ECFDF5']

export function BekkaiHome() {
  const bekkais = useBekkaiStore((s) => s.bekkais)
  const addBekkai = useBekkaiStore((s) => s.addBekkai)
  const updateBekkai = useBekkaiStore((s) => s.updateBekkai)
  const deleteBekkai = useBekkaiStore((s) => s.deleteBekkai)

  const [activeId, setActiveId] = useState<string | null>(null)
  const [editingAxis, setEditingAxis] = useState<BekkaiAxis | null>(null)
  const [integrateOpen, setIntegrateOpen] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const active = useMemo(() => bekkais.find((b) => b.id === activeId) ?? null, [bekkais, activeId])

  // 発見力の気づき → 別解テーマへワンタップ引用（問題・未来・目標・自分を優先）
  const entries = useEntriesStore((s: { entries: Record<string, unknown[]> }) => s.entries)
  const discoverySuggestions = useMemo(() => {
    const pick: string[] = []
    for (const mod of ['problem', 'future', 'goal', 'self']) {
      for (const [k, list] of Object.entries(entries ?? {})) {
        if (!k.startsWith(mod + '-') || !Array.isArray(list)) continue
        for (const e of list) {
          const t = typeof e === 'string' ? e : ((e as { text?: string; name?: string; label?: string })?.text ?? (e as { name?: string })?.name ?? (e as { label?: string })?.label)
          if (t && t.trim()) pick.push(t.trim())
        }
      }
    }
    return [...new Set(pick)].slice(0, 6)
  }, [entries])

  const handleNew = () => {
    const id = addBekkai('')
    setActiveId(id)
  }

  // ===== List view =====
  if (!active) {
    return (
      <div className="pb-6">
        <SampleControls feature="bekkai" accent="#DC2626" />
        <section className="mx-4 mt-4">
          <button onClick={handleNew} className="w-full py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-1.5" style={{ background: 'linear-gradient(135deg,#DC2626,#F97316)' }}>
            <Plus size={18} />新しい別解をつくる
          </button>
        </section>

        {bekkais.length === 0 ? (
          <div className="text-center text-text-tertiary text-[13px] leading-loose px-8 py-12">
            <div className="text-3xl opacity-40 mb-3">◑◐</div>
            「自分らしい」「優れた」「別の」やり方を<br />組み合わせて、自分なりの別解を見つけましょう。
            <div className="mt-4 flex justify-center"><SampleHint feature="bekkai" accent="#DC2626" /></div>
          </div>
        ) : (
          <section className="mx-4 mt-4">
            <h2 className="text-sm font-medium mb-2">保存した別解 <span className="text-[11px] text-text-tertiary">{bekkais.length}件</span></h2>
            <div className="flex flex-col gap-2">
              {bekkais.map((b) => {
                const filled = [b.self.score, b.excellent.score, b.different.score].filter((v) => v > 0).length
                return (
                  <div key={b.id} className="border border-border-card rounded-lg p-3 relative">
                    <button onClick={() => setActiveId(b.id)} className="w-full text-left">
                      <div className="flex items-center gap-1.5 mb-1">
                        {b.is_key && <Star size={12} className="text-waiting fill-waiting flex-shrink-0" />}
                        <span className="text-sm font-medium flex-1 truncate">{b.theme || '無題のテーマ'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {[b.self, b.excellent, b.different].map((a, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-px rounded-lg" style={{ background: BGS[i], color: COLORS[i] }}>
                            {a.score > 0 ? a.score : '–'}
                          </span>
                        ))}
                        <span className="text-[10px] text-text-tertiary ml-1">{filled}/3 評価</span>
                        {b.conclusion && <span className="text-[10px] text-red-600 ml-auto">別解あり</span>}
                      </div>
                    </button>
                    {confirmDeleteId === b.id ? (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border-card">
                        <span className="text-[11px] text-text-tertiary flex-1">削除しますか？</span>
                        <button onClick={() => { deleteBekkai(b.id); setConfirmDeleteId(null) }} className="px-2.5 py-1 bg-red-500 text-white rounded text-[11px] font-medium">削除</button>
                        <button onClick={() => setConfirmDeleteId(null)} className="px-2.5 py-1 border border-border-card rounded text-[11px] text-text-secondary">戻る</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDeleteId(b.id)} className="absolute top-3 right-3 text-text-tertiary hover:text-red-500"><Trash2 size={13} /></button>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </div>
    )
  }

  // ===== Editor view =====
  const scores: [number, number, number] = [active.self.score, active.excellent.score, active.different.score]
  const ideaCounts: [number, number, number] = [active.self.ideas.length, active.excellent.ideas.length, active.different.ideas.length]
  const total = scores.reduce((a, b) => a + b, 0)
  const allSet = scores.every((v) => v > 0)
  const pct = total > 0 ? scores.map((v) => Math.round((v / total) * 100)) : [33, 33, 33]

  // diagnosis
  let diag = { text: '各円をタップして評価を入力', cls: 'bg-surface-secondary border-border-card text-text-secondary' }
  if (!allSet) {
    const miss: string[] = []
    if (!scores[0]) miss.push('自分らしさ')
    if (!scores[1]) miss.push('優れている')
    if (!scores[2]) miss.push('別のやり方')
    diag = { text: `各円をタップ — 未入力: ${miss.join(' / ')}`, cls: 'bg-surface-secondary border-border-card text-text-secondary' }
  } else {
    const max = Math.max(...scores), min = Math.min(...scores)
    if (max - min <= 20) {
      diag = { text: 'バランス型 — 3要素が均等に近い構成', cls: scores.every((v) => v >= 60) ? 'bg-red-50 border-red-200 text-red-600' : 'bg-surface-secondary border-border-card text-text-secondary' }
    } else {
      const domIdx = scores.indexOf(max)
      const name = ['自分らしさ', '優れたやり方', '別のやり方'][domIdx]
      const r = Math.round((max / total) * 100)
      diag = { text: `「${name}」重心型 — ${r}%の濃度で軸足`, cls: 'border' }
    }
  }
  const domIdx = scores.indexOf(Math.max(...scores))

  const editValue = editingAxis ? active[editingAxis] : null

  return (
    <div className="pb-6">
      {/* Back + theme */}
      <div className="px-4 pt-3 pb-2 border-b border-border-card flex items-center gap-2">
        <button onClick={() => { setActiveId(null); setConfirmDeleteId(null) }} className="w-8 h-8 -ml-1 flex items-center justify-center text-text-secondary"><ChevronLeft size={20} /></button>
        <input value={active.theme} onChange={(e) => updateBekkai(active.id, { theme: e.target.value })}
          placeholder="テーマ（例: 地方飲食店の集客）" className="flex-1 px-3 py-2 bg-surface-secondary border border-border-card rounded-lg text-[13px] outline-none focus:border-primary" />
        <button onClick={() => updateBekkai(active.id, { is_key: !active.is_key })} className="w-8 h-8 flex items-center justify-center text-text-tertiary">
          <Star size={16} className={active.is_key ? 'text-waiting fill-waiting' : ''} />
        </button>
      </div>

      {/* 発見力からワンタップ引用（テーマ未入力時） */}
      {!active.theme.trim() && discoverySuggestions.length > 0 && (
        <div className="px-4 pt-2.5">
          <p className="text-[10px] text-text-tertiary mb-1.5 flex items-center gap-1">
            <Search size={11} className="text-[#7c6cff]" />発見力の気づきから引用
          </p>
          <div className="flex flex-wrap gap-1.5">
            {discoverySuggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => updateBekkai(active.id, { theme: s })}
                className="text-[11px] px-2.5 py-1 rounded-full border border-[#7c6cff55] text-[#7c6cff] hover:bg-[#7c6cff14] transition-colors max-w-full truncate"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Venn */}
      <div className="py-2 px-4" style={{ background: 'linear-gradient(180deg,var(--color-surface) 0%,var(--color-surface-secondary) 100%)' }}>
        <BekkaiVenn scores={scores} ideaCounts={ideaCounts} onSelectAxis={(i) => setEditingAxis(AXIS_BY_IDX[i])} onOpenIntegrate={() => allSet && setIntegrateOpen(true)} />
        <div className="flex items-center justify-center flex-wrap gap-x-2 gap-y-0.5 text-[9px] text-text-tertiary mt-0.5">
          <span>重なりの意味:</span>
          <Term def="自分らしさに偏りすぎて、独善的・自己満足になる状態。">独りよがり</Term>
          <span>/</span>
          <Term def="優等生的で他と差がなく、埋もれてしまう状態（コモディティ化）。">コモディティ</Term>
          <span>/</span>
          <Term def="奇抜・斬新だが支持されず、続けられない状態。">長続きしない</Term>
        </div>
      </div>

      <div className="mt-2"><HintTicker /></div>

      {/* Concentration */}
      <div className="px-4 pt-2.5 pb-1">
        <div className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">構成比（濃度バランス）</div>
        <div className="flex h-[26px] rounded-[7px] overflow-hidden bg-black/[0.04] gap-0.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-full flex items-center justify-center min-w-0 overflow-hidden transition-[width] duration-500"
              style={{ width: `${total > 0 ? (scores[i] / total) * 100 : 33.3}%`, background: COLORS[i], borderRadius: i === 0 ? '7px 0 0 7px' : i === 2 ? '0 7px 7px 0' : 0 }}>
              {total > 0 && scores[i] / total >= 0.1 && <span className="text-[11px] font-bold text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.15)' }}>{pct[i]}%</span>}
            </div>
          ))}
        </div>
        <div className="flex gap-3.5 mt-1.5 flex-wrap">
          {['自分らしさ', '優れている', '別のやり方'].map((l, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[10px] text-text-secondary">
              <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: COLORS[i] }} />{l} <span className="font-bold text-text-primary">{total > 0 ? `${pct[i]}%` : '–'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Diagnosis */}
      <div className={`mx-4 mt-1 mb-1.5 px-3 py-2 rounded-lg text-[12px] text-center border ${diag.cls}`}
        style={diag.text.includes('重心型') ? { background: BGS[domIdx], borderColor: COLORS[domIdx] + '33', color: COLORS[domIdx] } : {}}>
        <strong>{diag.text}</strong>
      </div>

      {/* Ideas summary */}
      {ideaCounts.some((c) => c > 0) && (
        <div className="mx-4 mb-1.5 flex flex-wrap gap-1">
          {[0, 1, 2].flatMap((i) => active[AXIS_BY_IDX[i]].ideas.map((t, j) => (
            <span key={`${i}-${j}`} className="text-[10px] px-2 py-0.5 rounded-lg flex items-center gap-1" style={{ background: BGS[i], color: COLORS[i] }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: COLORS[i] }} />{t}
            </span>
          )))}
        </div>
      )}

      {/* Integrate */}
      <button onClick={() => setIntegrateOpen(true)} disabled={!allSet}
        className="block mx-4 mt-1 w-[calc(100%-32px)] py-3.5 rounded-xl text-white text-sm font-semibold disabled:opacity-35"
        style={{ background: 'linear-gradient(135deg,#DC2626,#F97316)', boxShadow: '0 4px 16px rgba(220,38,38,0.2)' }}>
        統合して別解を導く
      </button>

      {/* Sheets */}
      <AreaSheet
        axis={editingAxis}
        value={editValue ?? active.self}
        downside={active.downside}
        onClose={() => setEditingAxis(null)}
        onChange={(v) => editingAxis && updateBekkai(active.id, { [editingAxis]: v })}
        onDownsideChange={(t) => updateBekkai(active.id, { downside: t })}
      />
      <IntegrateSheet
        open={integrateOpen}
        bekkai={active}
        onClose={() => setIntegrateOpen(false)}
        onEditAxis={(ax) => { setIntegrateOpen(false); setTimeout(() => setEditingAxis(ax), 250) }}
        onChangeConclusion={(t) => updateBekkai(active.id, { conclusion: t })}
        onConfirm={() => { setIntegrateOpen(false); if (active.conclusion?.trim()) toast('✨ 別解がまとまりました') }}
      />
    </div>
  )
}
