import { useState } from 'react'
import {
  Rocket, Layers, Repeat, Users, Clock, Plus, Trash2,
  ChevronDown, ChevronUp, Handshake, Sparkles,
} from 'lucide-react'
import { useGrowthStore } from '@/stores/growth-store'
import { generateId, nowISO } from '@/lib/utils'
import {
  emptyRealizationPower, ADJUST_TYPE_LABELS, INVEST_PATTERN_LABELS, COMBINE_STATUS_LABELS,
} from '@/lib/types'
import type {
  RealizationPower, Combination, QuantityQuality, TeamMember,
  AdjustType, InvestPattern, CombineStatus, MemberType,
} from '@/lib/types'

// ─── 共通UI ───────────────────────────────────────────────────────
const inputCls =
  'w-full text-[12px] bg-surface border border-border-card rounded-lg px-3 py-2 placeholder:text-text-tertiary focus:outline-none focus:border-real'

function SubSection({
  icon, title, sub, count, children, defaultOpen = false,
}: {
  icon: React.ReactNode
  title: string
  sub: string
  count?: number
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className="border border-border-card rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-real-bg text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-real shrink-0">{icon}</span>
          <h3 className="text-[13px] font-medium text-real shrink-0">{title}</h3>
          <span className="text-[10px] text-text-tertiary truncate">{sub}</span>
          {count != null && count > 0 && !open && (
            <span className="text-[10px] bg-real text-white rounded-full px-1.5 py-0.5 leading-none shrink-0">{count}</span>
          )}
        </div>
        {open ? <ChevronUp size={15} className="text-text-tertiary shrink-0" /> : <ChevronDown size={15} className="text-text-tertiary shrink-0" />}
      </button>
      {open && <div className="border-t border-border-card p-3">{children}</div>}
    </section>
  )
}

const Note = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[11px] text-text-tertiary mb-3 leading-relaxed bg-surface-secondary rounded-lg px-3 py-2">{children}</p>
)
const FieldLabel = ({ n, text, hint }: { n: string; text: string; hint?: string }) => (
  <p className="text-[11px] font-medium text-text-secondary mb-1.5">
    {n} {text}{hint && <span className="ml-1 text-text-tertiary font-normal">{hint}</span>}
  </p>
)
const AddBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button onClick={onClick} className="flex items-center gap-1 text-[11px] text-real mt-3 hover:opacity-70 transition-opacity">
    <Plus size={12} />{label}
  </button>
)
const SaveCancel = ({ onSave, onCancel, saveLabel = '追加する' }: { onSave: () => void; onCancel: () => void; saveLabel?: string }) => (
  <div className="flex gap-2 pt-1">
    <button onClick={onSave} className="flex-1 py-2 bg-real text-white rounded-lg text-[12px] font-medium hover:opacity-90 transition-opacity">{saveLabel}</button>
    <button onClick={onCancel} className="px-4 py-2 border border-border-card rounded-lg text-[12px] text-text-secondary hover:bg-surface-secondary transition-colors">キャンセル</button>
  </div>
)
const DeleteBtn = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} className="text-text-tertiary hover:text-fail-danger transition-colors shrink-0"><Trash2 size={13} /></button>
)
const Stars = ({ value, onChange, max = 5 }: { value: number; onChange?: (n: number) => void; max?: number }) => (
  <div className="flex gap-1">
    {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
      <button
        key={n}
        onClick={onChange ? () => onChange(value === n ? n - 1 : n) : undefined}
        disabled={!onChange}
        className={`${onChange ? 'flex-1 py-1.5' : ''} text-[13px] leading-none ${value >= n ? 'text-real' : 'text-text-tertiary'} ${onChange ? 'rounded-lg border ' + (value >= n ? 'border-real bg-real-bg' : 'border-border-card bg-surface') : ''}`}
      >★</button>
    ))}
  </div>
)

const STATUS_STYLE: Record<CombineStatus, string> = {
  trying: 'bg-waiting-bg text-waiting',
  failed: 'bg-fail-danger-bg text-fail-danger',
  succeeded: 'bg-done-bg text-done',
}

// ─── ① 組み合わせ・連鎖 ───────────────────────────────────────────
function CombinationSub({ rp, save }: { rp: RealizationPower; save: (next: Partial<RealizationPower>) => void }) {
  const items = rp.combinations
  const empty = { bekkai: '', elementsText: '', status: 'trying' as CombineStatus, adjustType: null as AdjustType | null, adjustNote: '' }
  const [f, setF] = useState(empty)
  const [adding, setAdding] = useState(false)

  const add = () => {
    if (!f.bekkai.trim()) return
    const elements = f.elementsText.split(/[、,\n]/).map((s) => s.trim()).filter(Boolean)
    const item: Combination = {
      id: generateId(), bekkai: f.bekkai.trim(), elements,
      status: f.status, adjustType: f.adjustType, adjustNote: f.adjustNote.trim(),
      created_at: nowISO(),
    }
    save({ combinations: [item, ...items] })
    setF(empty); setAdding(false)
  }
  const remove = (id: string) => save({ combinations: items.filter((i) => i.id !== id) })
  const setStatus = (id: string, status: CombineStatus) =>
    save({ combinations: items.map((i) => (i.id === id ? { ...i, status } : i)) })

  const adjustOpts = Object.entries(ADJUST_TYPE_LABELS) as [AdjustType, string][]
  const statusOpts = Object.entries(COMBINE_STATUS_LABELS) as [CombineStatus, string][]

  return (
    <SubSection icon={<Layers size={14} />} title="組み合わせ・連鎖" sub="要素を掛けて新しいイチをつくる" count={items.length} defaultOpen>
      <Note>組み合わせるだけで新しいイチになるから楽。失敗はつきもの。自分らしさを残し、バランス・組み合わせ・濃度を変えて修正し、数をこなす。</Note>
      <div className="space-y-2">
        {items.map((i) => (
          <div key={i.id} className="bg-surface border border-border-card rounded-lg p-3">
            <div className="flex items-start gap-2">
              <p className="text-[12px] text-text-primary font-medium flex-1">{i.bekkai}</p>
              <span className={`text-[9px] rounded px-1.5 py-0.5 font-medium shrink-0 ${STATUS_STYLE[i.status]}`}>{COMBINE_STATUS_LABELS[i.status]}</span>
              <DeleteBtn onClick={() => remove(i.id)} />
            </div>
            {i.elements.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 mt-2">
                {i.elements.map((el, idx) => (
                  <span key={idx} className="flex items-center gap-1">
                    {idx > 0 && <span className="text-real text-[11px]">×</span>}
                    <span className="text-[10px] bg-real-bg text-real rounded px-1.5 py-0.5">{el}</span>
                  </span>
                ))}
              </div>
            )}
            {i.adjustType && (
              <p className="text-[11px] text-real mt-2">修正: {ADJUST_TYPE_LABELS[i.adjustType]}</p>
            )}
            {i.adjustNote && <p className="text-[11px] text-text-secondary mt-0.5">{i.adjustNote}</p>}
            <div className="flex gap-1.5 mt-2">
              {statusOpts.map(([k, l]) => (
                <button key={k} onClick={() => setStatus(i.id, k)}
                  className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${i.status === k ? 'bg-real text-white border-real font-medium' : 'border-border-card text-text-secondary'}`}>{l}</button>
              ))}
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-[11px] text-text-tertiary text-center py-2">まだ記録がありません</p>}
      </div>
      {adding ? (
        <div className="mt-3 space-y-2.5 border-t border-border-card pt-3">
          <div><FieldLabel n="①" text="実現したい別解" /><input className={inputCls} placeholder="例：訪問営業 × データ分析で先回り提案" value={f.bekkai} onChange={(e) => setF({ ...f, bekkai: e.target.value })} /></div>
          <div><FieldLabel n="②" text="組み合わせる・連鎖させる要素" hint="（、や改行で区切る）" /><textarea className={inputCls} rows={2} placeholder="足で稼ぐ訪問、得意先データ、同業の成功事例" value={f.elementsText} onChange={(e) => setF({ ...f, elementsText: e.target.value })} /></div>
          <div>
            <FieldLabel n="③" text="修正のコツ" hint="（自分らしさは残す）" />
            <div className="flex flex-col gap-1.5">
              {adjustOpts.map(([k, l]) => (
                <button key={k} onClick={() => setF({ ...f, adjustType: f.adjustType === k ? null : k })}
                  className={`text-[11px] py-1.5 rounded-lg border transition-colors ${f.adjustType === k ? 'bg-real text-white border-real font-medium' : 'bg-surface border-border-card text-text-secondary'}`}>{l}を変える</button>
              ))}
            </div>
          </div>
          <input className={inputCls} placeholder="どう修正したか（メモ）" value={f.adjustNote} onChange={(e) => setF({ ...f, adjustNote: e.target.value })} />
          <SaveCancel onSave={add} onCancel={() => setAdding(false)} />
        </div>
      ) : (
        <AddBtn onClick={() => setAdding(true)} label="別解の組み合わせを追加" />
      )}
    </SubSection>
  )
}

// ─── ② 量→質 ─────────────────────────────────────────────────────
const PATTERN_DESC: Record<InvestPattern, string> = {
  linear: '投資に対して質がバランスよく上がる',
  jcurve: '投資しても一度後退し、ある点から正に転じる',
  loop: '「問い→仮の答え→別解→行動」を回して質に転じる',
}

function PatternChart({ pattern }: { pattern: InvestPattern }) {
  if (pattern === 'linear') {
    return (
      <svg viewBox="0 0 200 60" className="w-full h-12">
        <line x1="5" y1="55" x2="195" y2="55" stroke="var(--color-border-card)" strokeWidth="1" />
        <path d="M5 55 L195 8" fill="none" stroke="var(--color-real)" strokeWidth="2" />
      </svg>
    )
  }
  if (pattern === 'jcurve') {
    return (
      <svg viewBox="0 0 200 60" className="w-full h-12">
        <line x1="5" y1="55" x2="195" y2="55" stroke="var(--color-border-card)" strokeWidth="1" />
        <path d="M5 25 C 40 25, 50 55, 90 55 C 140 55, 160 12, 195 6" fill="none" stroke="var(--color-real)" strokeWidth="2" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 200 60" className="w-full h-12">
      <circle cx="100" cy="30" r="20" fill="none" stroke="var(--color-real)" strokeWidth="2" strokeDasharray="4 3" />
      <path d="M118 22 l4 -6 l-7 1" fill="none" stroke="var(--color-real)" strokeWidth="2" />
    </svg>
  )
}

function QuantityQualitySub({ rp, save }: { rp: RealizationPower; save: (next: Partial<RealizationPower>) => void }) {
  const items = rp.quantityQualities
  const empty = {
    theme: '', pattern: 'linear' as InvestPattern, targetHours: 1000, doneHours: 0, note: '',
    question: '', tentativeAnswer: '', alternative: '', action: '', loopCount: 0,
  }
  const [f, setF] = useState(empty)
  const [adding, setAdding] = useState(false)

  const add = () => {
    if (!f.theme.trim()) return
    const item: QuantityQuality = { ...f, theme: f.theme.trim(), id: generateId(), created_at: nowISO() }
    save({ quantityQualities: [item, ...items] })
    setF(empty); setAdding(false)
  }
  const remove = (id: string) => save({ quantityQualities: items.filter((i) => i.id !== id) })
  const addHours = (id: string, h: number) =>
    save({ quantityQualities: items.map((i) => (i.id === id ? { ...i, doneHours: Math.max(0, i.doneHours + h) } : i)) })
  const incLoop = (id: string) =>
    save({ quantityQualities: items.map((i) => (i.id === id ? { ...i, loopCount: i.loopCount + 1 } : i)) })

  const patternOpts = Object.entries(INVEST_PATTERN_LABELS) as [InvestPattern, string][]

  return (
    <SubSection icon={<Repeat size={14} />} title="量 → 質" sub="量をこなして質に転化させる" count={items.length}>
      <Note>根本に必要なのは質。だが量をこなすことで質に転化する。3つの投資パターンを問題に当てはめ、1万時間を目処に逆算。雑用を1万時間やっても無意味、内容に細心の注意を。</Note>
      <div className="space-y-2">
        {items.map((i) => {
          const pct = i.targetHours > 0 ? Math.min(100, Math.round((i.doneHours / i.targetHours) * 100)) : 0
          return (
            <div key={i.id} className="bg-surface border border-border-card rounded-lg p-3">
              <div className="flex items-start gap-2">
                <p className="text-[12px] text-text-primary font-medium flex-1">{i.theme}</p>
                <span className="text-[9px] bg-real-bg text-real rounded px-1.5 py-0.5 font-medium shrink-0">{INVEST_PATTERN_LABELS[i.pattern]}</span>
                <DeleteBtn onClick={() => remove(i.id)} />
              </div>
              <PatternChart pattern={i.pattern} />
              <div className="flex items-center justify-between text-[10px] text-text-tertiary">
                <span><Clock size={10} className="inline mr-0.5" />{i.doneHours.toLocaleString()} / {i.targetHours.toLocaleString()}h</span>
                <span className="text-real font-medium">{pct}%</span>
              </div>
              <div className="h-1.5 bg-surface-secondary rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-real rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex gap-1.5 mt-2">
                {[1, 5, 10].map((h) => (
                  <button key={h} onClick={() => addHours(i.id, h)} className="text-[10px] px-2 py-1 rounded-full border border-border-card text-text-secondary hover:bg-surface-secondary">+{h}h</button>
                ))}
                <button onClick={() => addHours(i.id, -1)} className="text-[10px] px-2 py-1 rounded-full border border-border-card text-text-tertiary hover:bg-surface-secondary">−1h</button>
              </div>
              {i.pattern === 'loop' && (
                <div className="mt-2 bg-surface-secondary rounded-lg p-2.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-text-tertiary">ループ</span>
                    <button onClick={() => incLoop(i.id)} className="text-[10px] text-real font-medium">{i.loopCount}周目 +1</button>
                  </div>
                  {i.question && <p className="text-[11px] text-text-secondary">問い: {i.question}</p>}
                  {i.tentativeAnswer && <p className="text-[11px] text-text-secondary">仮の答え: {i.tentativeAnswer}</p>}
                  {i.alternative && <p className="text-[11px] text-real">別解: {i.alternative}</p>}
                  {i.action && <p className="text-[11px] text-text-secondary">行動: {i.action}</p>}
                </div>
              )}
              {i.note && <p className="text-[11px] text-text-tertiary mt-1.5">注意: {i.note}</p>}
            </div>
          )
        })}
        {items.length === 0 && <p className="text-[11px] text-text-tertiary text-center py-2">まだ記録がありません</p>}
      </div>
      {adding ? (
        <div className="mt-3 space-y-2.5 border-t border-border-card pt-3">
          <div><FieldLabel n="①" text="取り組み" /><input className={inputCls} placeholder="例：提案資料づくりの質を量で上げる" value={f.theme} onChange={(e) => setF({ ...f, theme: e.target.value })} /></div>
          <div>
            <FieldLabel n="②" text="投資パターン" />
            <div className="flex gap-1.5">
              {patternOpts.map(([k, l]) => (
                <button key={k} onClick={() => setF({ ...f, pattern: k })}
                  className={`flex-1 text-[11px] py-1.5 rounded-lg border transition-colors ${f.pattern === k ? 'bg-real text-white border-real font-medium' : 'bg-surface border-border-card text-text-secondary'}`}>{l}</button>
              ))}
            </div>
            <p className="text-[10px] text-text-tertiary mt-1.5">{PATTERN_DESC[f.pattern]}</p>
            <PatternChart pattern={f.pattern} />
          </div>
          <div className="flex gap-2">
            <div className="flex-1"><FieldLabel n="③" text="目標時間(h)" hint="1万時間が目処" /><input type="number" className={inputCls} value={f.targetHours} onChange={(e) => setF({ ...f, targetHours: Number(e.target.value) || 0 })} /></div>
            <div className="flex-1"><FieldLabel n="④" text="現在(h)" /><input type="number" className={inputCls} value={f.doneHours} onChange={(e) => setF({ ...f, doneHours: Number(e.target.value) || 0 })} /></div>
          </div>
          {f.pattern === 'loop' && (
            <div className="space-y-2 bg-surface-secondary rounded-lg p-2.5">
              <p className="text-[10px] text-real font-medium">問い → 仮の答え → 別解 → 行動</p>
              <input className={inputCls} placeholder="問い" value={f.question} onChange={(e) => setF({ ...f, question: e.target.value })} />
              <input className={inputCls} placeholder="仮の答え" value={f.tentativeAnswer} onChange={(e) => setF({ ...f, tentativeAnswer: e.target.value })} />
              <input className={inputCls} placeholder="別解" value={f.alternative} onChange={(e) => setF({ ...f, alternative: e.target.value })} />
              <input className={inputCls} placeholder="行動" value={f.action} onChange={(e) => setF({ ...f, action: e.target.value })} />
            </div>
          )}
          <input className={inputCls} placeholder="内容への注意（雑用化を防ぐ）" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
          <SaveCancel onSave={add} onCancel={() => setAdding(false)} />
        </div>
      ) : (
        <AddBtn onClick={() => setAdding(true)} label="取り組みを追加" />
      )}
    </SubSection>
  )
}

// ─── ③ チーム・実行力 ─────────────────────────────────────────────
function TeamSub({ rp, save }: { rp: RealizationPower; save: (next: Partial<RealizationPower>) => void }) {
  const items = rp.team
  const empty = { name: '', role: '', type: 'member' as MemberType, shinyo: 0, shinrai: 0 }
  const [f, setF] = useState(empty)
  const [adding, setAdding] = useState(false)
  const [editingConfidence, setEditingConfidence] = useState(false)
  const [confDraft, setConfDraft] = useState(rp.confidence)

  const add = () => {
    if (!f.name.trim()) return
    const item: TeamMember = { ...f, name: f.name.trim(), role: f.role.trim(), id: generateId(), created_at: nowISO() }
    save({ team: [item, ...items] })
    setF(empty); setAdding(false)
  }
  const remove = (id: string) => save({ team: items.filter((i) => i.id !== id) })
  const update = (id: string, patch: Partial<TeamMember>) =>
    save({ team: items.map((i) => (i.id === id ? { ...i, ...patch } : i)) })

  const members = items.filter((i) => i.type === 'member')
  const assets = items.filter((i) => i.type === 'asset')

  return (
    <SubSection icon={<Users size={14} />} title="チーム・実行力" sub="1000点はチームで取る" count={items.length}>
      <Note>1000点を取るにはメンバーが要る。リーダーシップ＝根拠のない自信が、メンバーを説得する。信用は成果で飛躍、信頼は人柄。無形の資産（友人・顧客）もフル活用。</Note>

      {/* 自信＝根拠のない自信 */}
      <div className="bg-real-bg rounded-lg p-3 mb-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Sparkles size={12} className="text-real" />
          <span className="text-[11px] font-medium text-real">自信（根拠のない自信）</span>
        </div>
        {editingConfidence ? (
          <div className="space-y-2">
            <textarea className={inputCls} rows={2} placeholder="メンバーを説得する、あなたの核となる確信" value={confDraft} onChange={(e) => setConfDraft(e.target.value)} />
            <div className="flex gap-2">
              <button onClick={() => { save({ confidence: confDraft.trim() }); setEditingConfidence(false) }} className="flex-1 py-1.5 bg-real text-white rounded-lg text-[11px] font-medium">保存</button>
              <button onClick={() => { setConfDraft(rp.confidence); setEditingConfidence(false) }} className="px-3 py-1.5 border border-border-card rounded-lg text-[11px] text-text-secondary">取消</button>
            </div>
          </div>
        ) : (
          <button onClick={() => { setConfDraft(rp.confidence); setEditingConfidence(true) }} className="text-left w-full">
            {rp.confidence
              ? <p className="text-[12px] text-text-primary leading-relaxed">「{rp.confidence}」</p>
              : <p className="text-[11px] text-text-tertiary">タップして根拠のない自信を宣言する</p>}
          </button>
        )}
      </div>

      {/* メンバー */}
      <p className="text-[10px] text-text-tertiary mb-1.5 flex items-center gap-1"><Users size={11} />メンバー</p>
      <div className="space-y-2">
        {members.map((i) => <MemberCard key={i.id} m={i} onRemove={() => remove(i.id)} onUpdate={(p) => update(i.id, p)} />)}
        {members.length === 0 && <p className="text-[11px] text-text-tertiary text-center py-2">まだメンバーがいません</p>}
      </div>

      {/* 無形の資産 */}
      <p className="text-[10px] text-text-tertiary mt-3 mb-1.5 flex items-center gap-1"><Handshake size={11} />無形の資産（友人・顧客）</p>
      <div className="space-y-2">
        {assets.map((i) => <MemberCard key={i.id} m={i} onRemove={() => remove(i.id)} onUpdate={(p) => update(i.id, p)} />)}
        {assets.length === 0 && <p className="text-[11px] text-text-tertiary text-center py-2">まだ登録がありません</p>}
      </div>

      {adding ? (
        <div className="mt-3 space-y-2.5 border-t border-border-card pt-3">
          <div className="flex gap-1.5">
            {([['member', 'メンバー'], ['asset', '無形の資産']] as [MemberType, string][]).map(([k, l]) => (
              <button key={k} onClick={() => setF({ ...f, type: k })}
                className={`flex-1 text-[11px] py-1.5 rounded-lg border transition-colors ${f.type === k ? 'bg-real text-white border-real font-medium' : 'bg-surface border-border-card text-text-secondary'}`}>{l}</button>
            ))}
          </div>
          <input className={inputCls} placeholder={f.type === 'member' ? '名前' : '資産名（友人・顧客など）'} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <input className={inputCls} placeholder={f.type === 'member' ? '役割' : '関係・活かし方'} value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} />
          <div><p className="text-[10px] text-text-tertiary mb-1">信用（成果で上がる）</p><Stars value={f.shinyo} onChange={(n) => setF({ ...f, shinyo: n })} /></div>
          <div><p className="text-[10px] text-text-tertiary mb-1">信頼（人柄）</p><Stars value={f.shinrai} onChange={(n) => setF({ ...f, shinrai: n })} /></div>
          <SaveCancel onSave={add} onCancel={() => setAdding(false)} />
        </div>
      ) : (
        <AddBtn onClick={() => setAdding(true)} label="メンバー・資産を追加" />
      )}
    </SubSection>
  )
}

function MemberCard({ m, onRemove, onUpdate }: { m: TeamMember; onRemove: () => void; onUpdate: (p: Partial<TeamMember>) => void }) {
  return (
    <div className="bg-surface border border-border-card rounded-lg p-3">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-text-primary font-medium">{m.name}</p>
          {m.role && <p className="text-[10px] text-text-tertiary">{m.role}</p>}
        </div>
        <DeleteBtn onClick={onRemove} />
      </div>
      <div className="flex gap-3 mt-2">
        <div className="flex-1">
          <p className="text-[9px] text-text-tertiary mb-0.5">信用</p>
          <Stars value={m.shinyo} onChange={(n) => onUpdate({ shinyo: n })} />
        </div>
        <div className="flex-1">
          <p className="text-[9px] text-text-tertiary mb-0.5">信頼</p>
          <Stars value={m.shinrai} onChange={(n) => onUpdate({ shinrai: n })} />
        </div>
      </div>
    </div>
  )
}

// ─── タブ・ホーム ─────────────────────────────────────────────────
export function RealizationPowerHome() {
  const realizationPower = useGrowthStore((s) => s.realizationPower) ?? emptyRealizationPower()
  const setRealizationPower = useGrowthStore((s) => s.setRealizationPower)

  const rp = realizationPower
  const save = (next: Partial<RealizationPower>) => setRealizationPower({ ...rp, ...next })

  return (
    <div className="pb-6">
      <div className="mx-4 mt-4 bg-real-bg rounded-lg px-4 py-3">
        <p className="text-[11px] text-real leading-relaxed">
          <Rocket size={12} className="inline mr-1" />
          別解は<b>実現しなければ独りよがり</b>。<br />
          ①組み合わせ・連鎖で形にし、②量で質に転化させ、③チームで1000点を取る。
        </p>
        <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 mt-2 text-[10px] text-text-secondary">
          <span className="bg-[#DC2626] text-white rounded px-1.5 py-0.5 font-medium">別解</span>
          <span className="text-text-tertiary">→</span>
          <span>組み合わせ</span><span className="text-text-tertiary">→</span>
          <span>量→質</span><span className="text-text-tertiary">→</span>
          <span>チーム</span><span className="text-text-tertiary">→</span>
          <span className="bg-real text-white rounded px-1.5 py-0.5 font-medium">実現</span>
        </div>
      </div>

      <div className="mx-4 mt-4 space-y-3">
        <CombinationSub rp={rp} save={save} />
        <QuantityQualitySub rp={rp} save={save} />
        <TeamSub rp={rp} save={save} />
      </div>
    </div>
  )
}
