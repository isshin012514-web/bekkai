import { useState } from 'react'
import {
  AlertTriangle, Search, BarChart3, Flag, CornerUpLeft, Target,
  Plus, Trash2, Pencil, Sparkles, ChevronDown, ChevronUp,
} from 'lucide-react'
import { useGrowthStore } from '@/stores/growth-store'
import { SampleControls } from '@/components/SampleControls'
import { SampleHint } from '@/components/SampleHint'
import { Term } from '@/components/Term'
import { LockGate } from '@/components/LockGate'
import { toast } from '@/stores/toast-store'
import { generateId, nowISO } from '@/lib/utils'
import { emptyFailurePower, RISK_LEVEL_LABELS, J_CURVE_LABELS, RETREAT_DECISION_LABELS } from '@/lib/types'
import type {
  FailurePower, FailureItem, Premortem, RiskDesign, SuccessDeclaration,
  RetreatJudgment, Metacognition, RiskLevel, JCurvePhase, RetreatDecision,
} from '@/lib/types'

// ─── 共通UI ───────────────────────────────────────────────────────
const inputCls =
  'w-full text-[12px] bg-surface border border-border-card rounded-lg px-3 py-2 placeholder:text-text-tertiary focus:outline-none focus:border-fail'

const LV_TEXT: Record<RiskLevel, string> = { low: 'text-done', mid: 'text-waiting', high: 'text-fail-danger' }
const IMPACT_LABELS: Record<RiskLevel, string> = { low: '小', mid: '中', high: '大' }

const Note = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[11px] text-text-tertiary mb-3 leading-relaxed bg-surface-secondary rounded-lg px-3 py-2">{children}</p>
)

const FieldLabel = ({ text, hint }: { text: string; hint?: string }) => (
  <p className="text-[11px] font-medium text-text-secondary mb-1.5">
    {text}{hint && <span className="ml-1 text-text-tertiary font-normal">{hint}</span>}
  </p>
)

/** 詳細表示の1行（登録フォームと同じ項目を読み取り表示） */
const DetailRow = ({ label, children }: { label: string; children?: React.ReactNode }) =>
  children ? (
    <div>
      <p className="text-[10px] text-text-tertiary">{label}</p>
      <div className="text-[12px] text-text-primary leading-snug">{children}</div>
    </div>
  ) : null

function LevelPicker({ value, onChange, labels }: { value: RiskLevel; onChange: (v: RiskLevel) => void; labels?: Record<RiskLevel, string> }) {
  const opts: { k: RiskLevel; on: string }[] = [
    { k: 'low', on: 'bg-done-bg border-done text-done font-medium' },
    { k: 'mid', on: 'bg-waiting-bg border-waiting text-waiting font-medium' },
    { k: 'high', on: 'bg-fail-danger-bg border-fail-danger text-fail-danger font-medium' },
  ]
  const lab = labels ?? RISK_LEVEL_LABELS
  return (
    <div className="flex gap-1.5">
      {opts.map((o) => (
        <button key={o.k} onClick={() => onChange(o.k)}
          className={`flex-1 text-[11px] py-1.5 rounded-lg border transition-colors ${value === o.k ? o.on : 'bg-surface border-border-card text-text-secondary'}`}>
          {lab[o.k]}
        </button>
      ))}
    </div>
  )
}

const SaveCancel = ({ onSave, onCancel, saveLabel }: { onSave: () => void; onCancel: () => void; saveLabel: string }) => (
  <div className="flex gap-2 pt-1">
    <button onClick={onSave} className="flex-1 py-2 bg-fail text-white rounded-lg text-[12px] font-medium hover:opacity-90 transition-opacity">{saveLabel}</button>
    <button onClick={onCancel} className="px-4 py-2 border border-border-card rounded-lg text-[12px] text-text-secondary hover:bg-surface-secondary transition-colors">キャンセル</button>
  </div>
)

// Jカーブ図
const J_POS: Record<JCurvePhase, [number, number]> = { launch: [20, 22], valley: [90, 55], recovery: [150, 28], unknown: [100, 40] }
function JCurve({ phase }: { phase: JCurvePhase }) {
  const [x, y] = J_POS[phase]
  return (
    <svg viewBox="0 0 200 60" className="w-full h-12 mt-2">
      <path d="M5 20 C 40 20, 50 55, 90 55 C 140 55, 160 10, 195 5" fill="none" stroke="var(--color-fail)" strokeWidth="2" />
      <circle cx={x} cy={y} r="5" fill="var(--color-fail)" />
    </svg>
  )
}

// リスク×リターンのマトリクス
function RiskMatrix({ items }: { items: RiskDesign[] }) {
  const zone = (r: RiskLevel, ret: RiskLevel) => {
    if ((r === 'low' && ret !== 'low') || (r === 'mid' && ret === 'high')) return 'recommend'
    if (r === 'high' && ret === 'low') return 'warn'
    return 'normal'
  }
  const cell = (ri: number, ci: number) => {
    const r = (['high', 'mid', 'low'] as RiskLevel[])[ri]
    const ret = (['low', 'mid', 'high'] as RiskLevel[])[ci]
    const z = zone(r, ret)
    const here = items.filter((i) => i.risk === r && i.ret === ret)
    const base = z === 'recommend' ? 'bg-done-bg' : z === 'warn' ? 'bg-fail-danger-bg' : 'bg-surface-secondary'
    return (
      <div key={`${ri}-${ci}`} className={`${base} rounded h-11 flex items-center justify-center`}>
        {here.length > 0 && <span className="w-2 h-2 rounded-full bg-fail" />}
        {here.length > 1 && <span className="text-[9px] text-fail ml-0.5">×{here.length}</span>}
      </div>
    )
  }
  return (
    <div className="mb-3">
      <div className="flex items-stretch gap-1">
        <div className="w-8 flex flex-col justify-between text-[9px] text-text-tertiary text-right pr-0.5 py-0.5">
          <span>リスク高</span><span>中</span><span>低</span>
        </div>
        <div className="flex-1 grid grid-rows-3 gap-1">
          {[0, 1, 2].map((ri) => <div key={ri} className="grid grid-cols-3 gap-1">{[0, 1, 2].map((ci) => cell(ri, ci))}</div>)}
        </div>
      </div>
      <div className="flex justify-end gap-3 text-[9px] text-text-tertiary mt-1 pr-1"><span>← リターン低</span><span>中</span><span>高 →</span></div>
    </div>
  )
}

// ─── 汎用 CRUDセクション（一覧→タップで詳細→編集/削除） ───────────
interface CrudConfig<T extends { id: string; created_at: string }, F> {
  icon: React.ReactNode
  title: string
  sub: string
  note: React.ReactNode
  defaultOpen?: boolean
  items: T[]
  onChange: (next: T[]) => void
  blank: F
  toForm: (item: T) => F
  build: (form: F, base: T | null) => T
  valid: (form: F) => boolean
  summary: (item: T) => React.ReactNode
  detail: (item: T, update: (patch: Partial<T>) => void) => React.ReactNode
  fields: (form: F, set: (f: F) => void) => React.ReactNode
  addLabel: string
  saveLabel: string
  topContent?: React.ReactNode
  emptyText?: string
  filter?: { label: string; pred: (item: T) => boolean }
  suggest?: { label: string; make: () => F }
  locked?: boolean
  lockRequirement?: string
}

function CrudSection<T extends { id: string; created_at: string }, F>(cfg: CrudConfig<T, F>) {
  const { items, onChange } = cfg
  const [open, setOpen] = useState(cfg.defaultOpen ?? false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<F>(cfg.blank)
  const [filterOn, setFilterOn] = useState(false)

  const startAdd = () => { setForm(cfg.blank); setEditingId(null); setExpandedId(null); setAdding(true) }
  const startEdit = (item: T) => { setForm(cfg.toForm(item)); setAdding(false); setEditingId(item.id) }
  const cancel = () => { setAdding(false); setEditingId(null); setForm(cfg.blank) }
  const saveNew = () => { if (!cfg.valid(form)) return; onChange([cfg.build(form, null), ...items]); toast('追加しました'); cancel() }
  const saveEdit = (item: T) => { if (!cfg.valid(form)) return; onChange(items.map((i) => (i.id === item.id ? cfg.build(form, item) : i))); cancel() }
  const remove = (id: string) => { onChange(items.filter((i) => i.id !== id)); if (expandedId === id) setExpandedId(null) }
  const update = (id: string, patch: Partial<T>) => onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)))

  const shown = filterOn && cfg.filter ? items.filter(cfg.filter.pred) : items

  if (cfg.locked) {
    return <LockGate title={cfg.title} requirement={cfg.lockRequirement ?? '前のステップを埋めると解放されます'} />
  }

  return (
    <section className="border border-border-card rounded-lg overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between px-3 py-2.5 bg-fail-bg text-left">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-fail shrink-0">{cfg.icon}</span>
          <h3 className="text-[13px] font-medium text-fail shrink-0">{cfg.title}</h3>
          <span className="text-[10px] text-text-tertiary truncate">{cfg.sub}</span>
          {items.length > 0 && !open && (
            <span className="text-[10px] bg-fail text-white rounded-full px-1.5 py-0.5 leading-none shrink-0">{items.length}</span>
          )}
        </div>
        {open ? <ChevronUp size={15} className="text-text-tertiary shrink-0" /> : <ChevronDown size={15} className="text-text-tertiary shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-border-card p-3">
          <Note>{cfg.note}</Note>
          {cfg.topContent}

          {cfg.filter && items.length > 0 && (
            <div className="flex items-center justify-between mb-2">
              <button onClick={() => setFilterOn((v) => !v)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${filterOn ? 'bg-fail text-white border-fail' : 'border-border-card text-text-secondary'}`}>
                {cfg.filter.label}
              </button>
              <span className="text-[10px] text-text-tertiary">{shown.length}件</span>
            </div>
          )}

          <div className="space-y-2">
            {shown.map((item) => {
              if (editingId === item.id) {
                return (
                  <div key={item.id} className="bg-surface border border-fail/50 rounded-lg p-3 space-y-2.5">
                    <p className="text-[10px] text-fail font-medium">編集中</p>
                    {cfg.fields(form, setForm)}
                    <SaveCancel onSave={() => saveEdit(item)} onCancel={cancel} saveLabel="保存する" />
                  </div>
                )
              }
              const isExpanded = expandedId === item.id
              return (
                <div key={item.id} className="bg-surface border border-border-card rounded-lg overflow-hidden">
                  <button onClick={() => setExpandedId(isExpanded ? null : item.id)} className="w-full text-left p-3 flex items-start gap-2">
                    <div className="flex-1 min-w-0">{cfg.summary(item)}</div>
                    {isExpanded ? <ChevronUp size={14} className="text-text-tertiary shrink-0 mt-0.5" /> : <ChevronDown size={14} className="text-text-tertiary shrink-0 mt-0.5" />}
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-3 border-t border-border-card pt-2.5 space-y-2.5">
                      {cfg.detail(item, (patch) => update(item.id, patch))}
                      <div className="flex items-center gap-3 pt-1">
                        <button onClick={() => startEdit(item)} className="flex items-center gap-1 text-[11px] text-fail hover:opacity-70 transition-opacity">
                          <Pencil size={12} />編集する
                        </button>
                        <button onClick={() => remove(item.id)} className="flex items-center gap-1 text-[11px] text-fail-danger hover:opacity-70 transition-opacity ml-auto">
                          <Trash2 size={12} />削除
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            {shown.length === 0 && <p className="text-[11px] text-text-tertiary text-center py-2">{cfg.emptyText ?? 'まだ記録がありません'}</p>}
          </div>

          {adding ? (
            <div className="mt-3 space-y-2.5 border-t border-border-card pt-3">
              {cfg.fields(form, setForm)}
              <SaveCancel onSave={saveNew} onCancel={cancel} saveLabel={cfg.saveLabel} />
            </div>
          ) : editingId == null && (
            <div className="flex gap-3 mt-3">
              <button onClick={startAdd} className="flex items-center gap-1 text-[11px] text-fail hover:opacity-70 transition-opacity"><Plus size={12} />{cfg.addLabel}</button>
              {cfg.suggest && (
                <button onClick={() => { setForm(cfg.suggest!.make()); setEditingId(null); setExpandedId(null); setAdding(true) }}
                  className="flex items-center gap-1 text-[11px] text-fail hover:opacity-70 transition-opacity"><Sparkles size={12} />{cfg.suggest.label}</button>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

// ─── フォーム値の型 ───────────────────────────────────────────────
type FFailure = { content: string; lesson: string; avoidance: string; avoidable: boolean }
type FPre = { risk: string; probability: RiskLevel; impact: RiskLevel; countermeasure: string }
type FRisk = { challenge: string; risk: RiskLevel; ret: RiskLevel; toleranceLine: string }
type FDecl = { content: string; deadline: string }
type FRetreat = { target: string; jCurvePhase: JCurvePhase; retreatReason: string; affectedParties: string; decision: RetreatDecision | null; nextAlternative: string }
type FMeta = { roleModel: string; theirJudgment: string; diff: string; decisionScore: number; stayInField: boolean | null }

const idc = (base: { id: string; created_at: string } | null) =>
  base ? { id: base.id, created_at: base.created_at } : { id: generateId(), created_at: nowISO() }

// ─── タブ・ホーム ─────────────────────────────────────────────────
export function FailurePowerHome() {
  const failurePower = useGrowthStore((s) => s.failurePower) ?? emptyFailurePower()
  const setFailurePower = useGrowthStore((s) => s.setFailurePower)
  const fp = failurePower
  const save = (next: Partial<FailurePower>) => setFailurePower({ ...fp, ...next })
  const isEmpty = Object.values(fp).every((v) => !Array.isArray(v) || v.length === 0)

  return (
    <div className="pb-6">
      <SampleControls feature="failure" accent="#0D9488" />
      {isEmpty && <div className="mt-3 flex justify-center"><SampleHint feature="failure" accent="#0D9488" /></div>}
      {/* イントロ + 成長サイクル内の位置づけ */}
      <div className="mx-4 mt-4 bg-fail-bg rounded-lg px-4 py-3">
        <p className="text-[11px] text-fail leading-relaxed">
          失敗と成功は両輪。失敗は「成功のプロトタイプ」。<br />
          行動の<b>前</b>にリスクを設計し、<b>後</b>に失敗を次の別解へ繋げる。
        </p>
        <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 mt-2 text-[10px] text-text-secondary">
          <span>INPUT</span><span className="text-text-tertiary">→</span>
          <span>OUTPUT</span><span className="text-text-tertiary">→</span>
          <span>採点</span><span className="text-text-tertiary">→</span>
          <span>FB</span><span className="text-text-tertiary">→</span>
          <span>次の打ち手</span><span className="text-text-tertiary">→</span>
          <span className="bg-fail text-white rounded px-1.5 py-0.5 font-medium">失敗力</span>
        </div>
      </div>

      <div className="mx-4 mt-4 space-y-3">
        {/* ① 失敗リスト */}
        <CrudSection<FailureItem, FFailure>
          icon={<AlertTriangle size={14} />} title="失敗リスト" sub="日々更新・回避できる失敗を蓄積" defaultOpen
          note="成功の再現性はないが、失敗はみんなほとんど同じ。回避できる失敗は仕組みで回避する。"
          items={fp.failureList} onChange={(next) => save({ failureList: next })}
          addLabel="失敗を記録" saveLabel="追加する"
          filter={{ label: '回避できる失敗のみ', pred: (i) => i.avoidable }}
          blank={{ content: '', lesson: '', avoidance: '', avoidable: true }}
          toForm={(i) => ({ content: i.content, lesson: i.lesson, avoidance: i.avoidance, avoidable: i.avoidable })}
          valid={(f) => !!f.content.trim()}
          build={(f, base) => ({ ...idc(base), content: f.content.trim(), lesson: f.lesson, avoidance: f.avoidance, avoidable: f.avoidable })}
          summary={(i) => (
            <div className="flex items-start gap-2">
              <span className="text-[12px] text-text-primary font-medium flex-1">{i.content}</span>
              {i.avoidable && <span className="text-[9px] bg-done-bg text-done rounded px-1.5 py-0.5 shrink-0 font-medium">回避可</span>}
            </div>
          )}
          detail={(i) => (
            <>
              <DetailRow label="失敗内容">{i.content}</DetailRow>
              <DetailRow label="原因 / 教訓">{i.lesson}</DetailRow>
              <DetailRow label="回避策">{i.avoidance}</DetailRow>
              <DetailRow label="回避できる失敗">{i.avoidable ? 'はい' : 'いいえ'}</DetailRow>
            </>
          )}
          fields={(f, set) => (
            <>
              <input className={inputCls} placeholder="失敗内容" value={f.content} onChange={(e) => set({ ...f, content: e.target.value })} />
              <input className={inputCls} placeholder="原因 / 教訓" value={f.lesson} onChange={(e) => set({ ...f, lesson: e.target.value })} />
              <input className={inputCls} placeholder="回避策" value={f.avoidance} onChange={(e) => set({ ...f, avoidance: e.target.value })} />
              <button onClick={() => set({ ...f, avoidable: !f.avoidable })}
                className={`text-[11px] px-2.5 py-1 rounded-full border ${f.avoidable ? 'bg-done-bg border-done text-done font-medium' : 'border-border-card text-text-secondary'}`}>
                {f.avoidable ? '✓ ' : ''}回避できる失敗
              </button>
            </>
          )}
        />

        {/* ② 仮想失敗 */}
        <CrudSection<Premortem, FPre>
          icon={<Search size={14} />} title="仮想失敗" sub="行動の前に失敗を見積もる"
          note="失敗はチャンスロス。立て直すより、先に転びそうな所を想像しておく。"
          items={fp.premortems} onChange={(next) => save({ premortems: next })}
          addLabel="想定を追加" saveLabel="追加する"
          suggest={{ label: 'AI提案', make: () => ({ risk: '準備不足でヒアリングが浅くなる', probability: 'mid', impact: 'high', countermeasure: '前日に質問を3つ作る' }) }}
          blank={{ risk: '', probability: 'mid', impact: 'mid', countermeasure: '' }}
          toForm={(i) => ({ risk: i.risk, probability: i.probability, impact: i.impact, countermeasure: i.countermeasure })}
          valid={(f) => !!f.risk.trim()}
          build={(f, base) => ({ ...idc(base), risk: f.risk.trim(), probability: f.probability, impact: f.impact, countermeasure: f.countermeasure })}
          summary={(i) => (
            <>
              <span className="text-[12px] text-text-primary font-medium">{i.risk}</span>
              <div className="flex gap-3 mt-1 text-[10px]">
                <span className="text-text-tertiary">確率 <b className={LV_TEXT[i.probability]}>{RISK_LEVEL_LABELS[i.probability]}</b></span>
                <span className="text-text-tertiary">影響 <b className={LV_TEXT[i.impact]}>{IMPACT_LABELS[i.impact]}</b></span>
              </div>
            </>
          )}
          detail={(i) => (
            <>
              <DetailRow label="想定する失敗">{i.risk}</DetailRow>
              <DetailRow label="発生確率"><span className={LV_TEXT[i.probability]}>{RISK_LEVEL_LABELS[i.probability]}</span></DetailRow>
              <DetailRow label="影響度"><span className={LV_TEXT[i.impact]}>{IMPACT_LABELS[i.impact]}</span></DetailRow>
              <DetailRow label="先回りの対策">{i.countermeasure}</DetailRow>
            </>
          )}
          fields={(f, set) => (
            <>
              <input className={inputCls} placeholder="想定する失敗" value={f.risk} onChange={(e) => set({ ...f, risk: e.target.value })} />
              <div><p className="text-[10px] text-text-tertiary mb-1">発生確率</p><LevelPicker value={f.probability} onChange={(k) => set({ ...f, probability: k })} /></div>
              <div><p className="text-[10px] text-text-tertiary mb-1">影響度</p><LevelPicker value={f.impact} onChange={(k) => set({ ...f, impact: k })} labels={IMPACT_LABELS} /></div>
              <input className={inputCls} placeholder="先回りの対策" value={f.countermeasure} onChange={(e) => set({ ...f, countermeasure: e.target.value })} />
            </>
          )}
        />

        {/* ③ リスク設計 */}
        <CrudSection<RiskDesign, FRisk>
          icon={<BarChart3 size={14} />} title="リスク設計" sub="リスク×リターンを先に置く"
          locked={fp.failureList.length === 0} lockRequirement="まず「失敗リスト」を1つ記録すると解放されます"
          note="ローリスク・ミドルリターン / ミドルリスク・ハイリターンを狙う。緑が推奨ゾーン。"
          topContent={<RiskMatrix items={fp.riskDesigns} />}
          items={fp.riskDesigns} onChange={(next) => save({ riskDesigns: next })}
          addLabel="挑戦を設計" saveLabel="追加する"
          blank={{ challenge: '', risk: 'low', ret: 'mid', toleranceLine: '' }}
          toForm={(i) => ({ challenge: i.challenge, risk: i.risk, ret: i.ret, toleranceLine: i.toleranceLine })}
          valid={(f) => !!f.challenge.trim()}
          build={(f, base) => ({ ...idc(base), challenge: f.challenge.trim(), risk: f.risk, ret: f.ret, toleranceLine: f.toleranceLine })}
          summary={(i) => (
            <>
              <span className="text-[12px] text-text-primary font-medium">{i.challenge}</span>
              <div className="flex gap-2 mt-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-secondary text-text-secondary">リスク {RISK_LEVEL_LABELS[i.risk]}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-secondary text-text-secondary">リターン {RISK_LEVEL_LABELS[i.ret]}</span>
              </div>
            </>
          )}
          detail={(i) => (
            <>
              <DetailRow label="挑戦内容">{i.challenge}</DetailRow>
              <DetailRow label="リスクの大きさ">{RISK_LEVEL_LABELS[i.risk]}</DetailRow>
              <DetailRow label="期待リターン">{RISK_LEVEL_LABELS[i.ret]}</DetailRow>
              <DetailRow label="リスク許容ライン"><span className="text-waiting">{i.toleranceLine}</span></DetailRow>
            </>
          )}
          fields={(f, set) => (
            <>
              <input className={inputCls} placeholder="挑戦内容" value={f.challenge} onChange={(e) => set({ ...f, challenge: e.target.value })} />
              <div><p className="text-[10px] text-text-tertiary mb-1">リスクの大きさ</p><LevelPicker value={f.risk} onChange={(k) => set({ ...f, risk: k })} /></div>
              <div><p className="text-[10px] text-text-tertiary mb-1">期待リターン</p><LevelPicker value={f.ret} onChange={(k) => set({ ...f, ret: k })} /></div>
              <input className={inputCls} placeholder="リスク許容ライン（ここまでなら許せる）" value={f.toleranceLine} onChange={(e) => set({ ...f, toleranceLine: e.target.value })} />
            </>
          )}
        />

        {/* ④ 成功宣言 */}
        <CrudSection<SuccessDeclaration, FDecl>
          icon={<Flag size={14} />} title="成功宣言" sub="先に宣言して言い訳をなくす"
          note="成功を先に宣言する。期限が来たら達成 / 未達を記録。後から見返し・編集もできる。"
          items={fp.declarations} onChange={(next) => save({ declarations: next })}
          addLabel="成功を宣言" saveLabel="宣言する"
          blank={{ content: '', deadline: '' }}
          toForm={(i) => ({ content: i.content, deadline: i.deadline })}
          valid={(f) => !!f.content.trim()}
          build={(f, base) => ({ ...idc(base), content: f.content.trim(), deadline: f.deadline, result: base?.result ?? 'pending' })}
          summary={(i) => (
            <div className="flex items-start gap-2">
              <span className="text-[12px] text-text-primary font-medium flex-1">「{i.content}」</span>
              {i.result === 'achieved' && <span className="text-[9px] bg-done-bg text-done rounded px-1.5 py-0.5 font-medium shrink-0">達成</span>}
              {i.result === 'failed' && <span className="text-[9px] bg-fail-danger-bg text-fail-danger rounded px-1.5 py-0.5 font-medium shrink-0">未達</span>}
            </div>
          )}
          detail={(i, update) => (
            <>
              <DetailRow label="宣言内容">「{i.content}」</DetailRow>
              <DetailRow label="期限">{i.deadline || '—'}</DetailRow>
              <div>
                <p className="text-[10px] text-text-tertiary mb-1">結果</p>
                <div className="flex gap-2">
                  <button onClick={() => update({ result: 'achieved' })}
                    className={`text-[11px] px-3 py-1 rounded-lg border font-medium ${i.result === 'achieved' ? 'bg-done text-white border-done' : 'bg-surface border-border-card text-text-secondary'}`}>達成</button>
                  <button onClick={() => update({ result: 'failed' })}
                    className={`text-[11px] px-3 py-1 rounded-lg border font-medium ${i.result === 'failed' ? 'bg-fail-danger text-white border-fail-danger' : 'bg-surface border-border-card text-text-secondary'}`}>未達</button>
                  {i.result !== 'pending' && (
                    <button onClick={() => update({ result: 'pending' })} className="text-[11px] px-2 py-1 rounded-lg text-text-tertiary">未記録に戻す</button>
                  )}
                </div>
                {i.result === 'failed' && <p className="text-[11px] text-fail mt-1.5">→ 失敗リストに登録しましょう</p>}
              </div>
            </>
          )}
          fields={(f, set) => (
            <>
              <input className={inputCls} placeholder="こう成功させる、という宣言" value={f.content} onChange={(e) => set({ ...f, content: e.target.value })} />
              <input type="date" className={inputCls} value={f.deadline} onChange={(e) => set({ ...f, deadline: e.target.value })} />
            </>
          )}
        />

        {/* ⑤ 撤退ジャッジ */}
        <CrudSection<RetreatJudgment, FRetreat>
          icon={<CornerUpLeft size={14} />} title="撤退ジャッジ" sub="Jカーブで続行/撤退を判断"
          locked={fp.failureList.length === 0} lockRequirement="まず「失敗リスト」を1つ記録すると解放されます"
          note={<><Term def="投資しても一度後退し、ある点から急に正へ転じる成長曲線。今が「谷」か「回復」かで判断が変わる。">Jカーブ</Term>のどこにいるか、撤退理由を説明できるか、誰に迷惑がかかるか。逆算して判断する。</>}
          items={fp.retreatJudgments} onChange={(next) => save({ retreatJudgments: next })}
          addLabel="判断を追加" saveLabel="記録する"
          blank={{ target: '', jCurvePhase: 'valley', retreatReason: '', affectedParties: '', decision: null, nextAlternative: '' }}
          toForm={(i) => ({ target: i.target, jCurvePhase: i.jCurvePhase, retreatReason: i.retreatReason, affectedParties: i.affectedParties, decision: i.decision, nextAlternative: i.nextAlternative })}
          valid={(f) => !!f.target.trim() || f.decision != null}
          build={(f, base) => ({ ...idc(base), target: f.target.trim(), jCurvePhase: f.jCurvePhase, retreatReason: f.retreatReason, affectedParties: f.affectedParties, decision: f.decision, nextAlternative: f.nextAlternative })}
          summary={(i) => (
            <div className="flex items-start gap-2">
              <span className="text-[12px] text-text-primary font-medium flex-1">{i.target || '（無題）'}</span>
              {i.decision && (
                <span className={`text-[9px] rounded px-1.5 py-0.5 font-medium shrink-0 ${i.decision === 'retreat' ? 'bg-fail-danger-bg text-fail-danger' : i.decision === 'pivot' ? 'bg-fail-bg text-fail' : 'bg-done-bg text-done'}`}>
                  {RETREAT_DECISION_LABELS[i.decision]}
                </span>
              )}
            </div>
          )}
          detail={(i) => (
            <>
              <DetailRow label="今の取り組み">{i.target}</DetailRow>
              <DetailRow label="Jカーブの位置">{J_CURVE_LABELS[i.jCurvePhase]}</DetailRow>
              <JCurve phase={i.jCurvePhase} />
              <DetailRow label="撤退理由">{i.retreatReason}</DetailRow>
              <DetailRow label="迷惑をかける相手・範囲">{i.affectedParties}</DetailRow>
              <DetailRow label="判断">{i.decision ? RETREAT_DECISION_LABELS[i.decision] : ''}</DetailRow>
              {i.decision === 'pivot' && <DetailRow label="次の別解"><span className="text-fail">{i.nextAlternative}</span></DetailRow>}
            </>
          )}
          fields={(f, set) => (
            <>
              <div><FieldLabel text="① 今の取り組み" /><input className={inputCls} placeholder="例：新規チャネルの開拓" value={f.target} onChange={(e) => set({ ...f, target: e.target.value })} /></div>
              <div>
                <FieldLabel text="② Jカーブのどこ？" />
                <div className="flex gap-1.5">
                  {(Object.keys(J_CURVE_LABELS) as JCurvePhase[]).map((p) => (
                    <button key={p} onClick={() => set({ ...f, jCurvePhase: p })}
                      className={`flex-1 text-[11px] py-1.5 rounded-lg border transition-colors ${f.jCurvePhase === p ? 'bg-fail text-white border-fail font-medium' : 'bg-surface border-border-card text-text-secondary'}`}>
                      {J_CURVE_LABELS[p]}
                    </button>
                  ))}
                </div>
                <JCurve phase={f.jCurvePhase} />
              </div>
              <div><FieldLabel text="③ 撤退理由を説明できるか" /><input className={inputCls} placeholder="撤退するなら、その理由" value={f.retreatReason} onChange={(e) => set({ ...f, retreatReason: e.target.value })} /></div>
              <div><FieldLabel text="④ 迷惑をかける相手・範囲" /><input className={inputCls} placeholder="撤退しないことで誰が困るか" value={f.affectedParties} onChange={(e) => set({ ...f, affectedParties: e.target.value })} /></div>
              <div>
                <FieldLabel text="⑤ 判断" />
                <div className="flex gap-1.5">
                  {(Object.keys(RETREAT_DECISION_LABELS) as RetreatDecision[]).map((d) => {
                    const on = d === 'retreat' ? 'bg-fail-danger text-white border-fail-danger' : d === 'pivot' ? 'bg-fail text-white border-fail' : 'bg-done text-white border-done'
                    return (
                      <button key={d} onClick={() => set({ ...f, decision: d })}
                        className={`flex-1 text-[12px] py-2 rounded-lg border font-medium transition-colors ${f.decision === d ? on : 'bg-surface border-border-card text-text-secondary'}`}>
                        {RETREAT_DECISION_LABELS[d]}
                      </button>
                    )
                  })}
                </div>
              </div>
              {f.decision === 'pivot' && (
                <div><FieldLabel text="→ 次の別解" /><input className={inputCls} placeholder="ピボット先のアクション" value={f.nextAlternative} onChange={(e) => set({ ...f, nextAlternative: e.target.value })} /></div>
              )}
            </>
          )}
        />

        {/* ⑥ メタ認知 */}
        <CrudSection<Metacognition, FMeta>
          icon={<Target size={14} />} title="メタ認知" sub="優れた人との差分を見る"
          locked={fp.failureList.length === 0} lockRequirement="まず「失敗リスト」を1つ記録すると解放されます"
          note={<><Term def="自分の思考や判断を一段上から客観的に眺めること。人は自分に甘いので、第三者の視点で見直すと盲点に気づける。">メタ認知</Term>＝人は自分に甘い。周囲の優れた人になったつもりで、自分の意思決定を第三者視点で評価する。</>}
          items={fp.metacognitions} onChange={(next) => save({ metacognitions: next })}
          addLabel="振り返りを追加" saveLabel="記録する"
          blank={{ roleModel: '', theirJudgment: '', diff: '', decisionScore: 0, stayInField: null }}
          toForm={(i) => ({ roleModel: i.roleModel, theirJudgment: i.theirJudgment, diff: i.diff, decisionScore: i.decisionScore, stayInField: i.stayInField })}
          valid={(f) => !!f.roleModel.trim() || !!f.diff.trim()}
          build={(f, base) => ({ ...idc(base), roleModel: f.roleModel.trim(), theirJudgment: f.theirJudgment, diff: f.diff, decisionScore: f.decisionScore, stayInField: f.stayInField })}
          summary={(i) => (
            <div className="flex items-start gap-2">
              <span className="text-[12px] text-text-primary font-medium flex-1">{i.roleModel || '比較対象なし'}</span>
              {i.decisionScore > 0 && <span className="text-[11px] text-fail shrink-0">{'★'.repeat(i.decisionScore)}</span>}
            </div>
          )}
          detail={(i) => (
            <>
              <DetailRow label="比較対象（ロールモデル）">{i.roleModel}</DetailRow>
              <DetailRow label="その人ならどう判断したか">{i.theirJudgment}</DetailRow>
              <DetailRow label="自分の判断との差分">{i.diff}</DetailRow>
              <DetailRow label="最高の意思決定だったか">{i.decisionScore > 0 ? <span className="text-fail">{'★'.repeat(i.decisionScore)}{'☆'.repeat(5 - i.decisionScore)}</span> : '未評価'}</DetailRow>
              <DetailRow label="このフィールドで戦い続ける？">{i.stayInField == null ? '' : i.stayInField ? '戦い続ける' : <span className="text-fail">違うフィールドへ</span>}</DetailRow>
            </>
          )}
          fields={(f, set) => (
            <>
              <div><FieldLabel text="① 比較対象（ロールモデル）" /><input className={inputCls} placeholder="例：尊敬する先輩 A さん" value={f.roleModel} onChange={(e) => set({ ...f, roleModel: e.target.value })} /></div>
              <div><FieldLabel text="② その人ならどう判断したか" /><input className={inputCls} placeholder="第三者の視点で" value={f.theirJudgment} onChange={(e) => set({ ...f, theirJudgment: e.target.value })} /></div>
              <div><FieldLabel text="③ 自分の判断との差分" /><input className={inputCls} placeholder="何が違ったか" value={f.diff} onChange={(e) => set({ ...f, diff: e.target.value })} /></div>
              <div>
                <FieldLabel text="④ 最高の意思決定だったか" />
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => set({ ...f, decisionScore: n })}
                      className={`flex-1 py-2 rounded-lg border text-[12px] font-medium transition-colors ${f.decisionScore >= n ? 'bg-fail text-white border-fail' : 'bg-surface border-border-card text-text-tertiary'}`}>★</button>
                  ))}
                </div>
              </div>
              <div>
                <FieldLabel text="⑤ このフィールドで戦い続ける？" />
                <div className="flex gap-1.5">
                  {[{ k: true, l: '戦い続ける' }, { k: false, l: '違うフィールドへ' }].map((o) => (
                    <button key={String(o.k)} onClick={() => set({ ...f, stayInField: o.k })}
                      className={`flex-1 py-2 rounded-lg border text-[12px] transition-colors ${f.stayInField === o.k ? 'bg-fail text-white border-fail font-medium' : 'bg-surface border-border-card text-text-secondary'}`}>{o.l}</button>
                  ))}
                </div>
                {f.stayInField === false && <p className="text-[11px] text-fail mt-2">→ 差分が大きいなら、勝てるフィールドにピボットする</p>}
              </div>
            </>
          )}
        />
      </div>
    </div>
  )
}
