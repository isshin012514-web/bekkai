import { useState } from 'react'
import { format } from 'date-fns'
import { Zap, Plus, Trash2, Pencil, Sparkles, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { useGrowthStore } from '@/stores/growth-store'
import { getWeekInterval, generateId } from '@/lib/utils'
import type { IfThenRule } from '@/lib/types'

// ─── ルールベースAI提案 ───────────────────────────────────────────
function buildSuggestion(texts: string[]): {
  theme: string
  goals: string[]
  rules: IfThenRule[]
} | null {
  if (texts.length === 0) return null
  const t = texts.join(' ')

  if (/準備|ヒアリング|質問|商談/.test(t)) {
    return {
      theme: '商談準備',
      goals: ['商談前に質問を3つ作る', '顧客情報を事前に調べておく'],
      rules: [
        { id: generateId(), if: '商談予定が入ったら', then: '前日に質問を3つ作成する' },
        { id: generateId(), if: '資料を見返すタイミングになったら', then: 'まず相手の課題をメモする' },
      ],
    }
  }
  if (/時間|タスク|期限|返信|先延ばし/.test(t)) {
    return {
      theme: 'タスク管理',
      goals: ['当日のタスクを朝に3つ決める', '返信は当日中に行う'],
      rules: [
        { id: generateId(), if: '朝イチに席に座ったら', then: 'その日やることを3つ書き出す' },
        { id: generateId(), if: 'メールを受け取ったら', then: '2分以内に返信か期限設定をする' },
      ],
    }
  }
  if (/知識|勉強|インプット|学|読/.test(t)) {
    return {
      theme: 'インプット強化',
      goals: ['毎日15分関連書籍を読む', '週1回学びをアウトプットする'],
      rules: [
        { id: generateId(), if: '電車に乗ったら', then: '本か記事を開く' },
        { id: generateId(), if: '1章読み終わったら', then: '3行でメモを書く' },
      ],
    }
  }
  if (/伝え|説明|プレゼン|資料|スライド|わかりにく/.test(t)) {
    return {
      theme: '伝達力向上',
      goals: ['話す前に結論を1行でまとめる', '毎週1回アウトプットを発信する'],
      rules: [
        { id: generateId(), if: '話し始める前に', then: '結論を一言で言う' },
        { id: generateId(), if: '資料を作るとき', then: '1ページ1メッセージにする' },
      ],
    }
  }
  if (/関係|信頼|コミュニケーション|雑談/.test(t)) {
    return {
      theme: '関係構築',
      goals: ['週1回社内で雑談する機会を作る', '相手の名前を会話で1回使う'],
      rules: [
        { id: generateId(), if: '誰かとすれ違ったら', then: '一言声をかける' },
        { id: generateId(), if: 'ミーティング前の5分に', then: '近況を聞く' },
      ],
    }
  }

  // フィードバックテキストはあるが該当キーワードなし → 空テンプレ
  return null
}

// ─── サブコンポーネント ───────────────────────────────────────────

function GoalInput({
  value,
  onChange,
  onRemove,
  showRemove,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  onRemove: () => void
  showRemove: boolean
  placeholder: string
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0 mt-0.5" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 text-[12px] bg-white border border-border-card rounded-lg px-2.5 py-1.5 placeholder:text-text-tertiary focus:outline-none focus:border-primary"
      />
      {showRemove && (
        <button onClick={onRemove} className="text-text-tertiary hover:text-red-400 transition-colors shrink-0">
          <Trash2 size={13} />
        </button>
      )}
    </div>
  )
}

function IfThenRow({
  rule,
  onChange,
  onRemove,
  showRemove,
}: {
  rule: IfThenRule
  onChange: (r: IfThenRule) => void
  onRemove: () => void
  showRemove: boolean
}) {
  return (
    <div className="flex flex-col gap-1 p-2 bg-white border border-border-card rounded-lg">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-bold text-purple-600 w-7 shrink-0">IF</span>
        <input
          type="text"
          value={rule.if}
          onChange={(e) => onChange({ ...rule, if: e.target.value })}
          placeholder="〇〇なら"
          className="flex-1 text-[12px] bg-surface-secondary border border-border-card rounded px-2 py-1 placeholder:text-text-tertiary focus:outline-none focus:border-primary"
        />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-bold text-primary w-7 shrink-0">THEN</span>
        <input
          type="text"
          value={rule.then}
          onChange={(e) => onChange({ ...rule, then: e.target.value })}
          placeholder="△△する"
          className="flex-1 text-[12px] bg-surface-secondary border border-border-card rounded px-2 py-1 placeholder:text-text-tertiary focus:outline-none focus:border-primary"
        />
        {showRemove && (
          <button onClick={onRemove} className="text-text-tertiary hover:text-red-400 transition-colors shrink-0">
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── メインコンポーネント ────────────────────────────────────────

interface NextActionPlanSectionProps {
  sectionRef?: React.RefObject<HTMLElement | null>
}

export function NextActionPlanSection({ sectionRef }: NextActionPlanSectionProps) {
  const { outputs, actionPlans, upsertActionPlan, deleteActionPlan } = useGrowthStore()

  const { start: weekStart } = getWeekInterval()
  const weekKey = format(weekStart, 'yyyy-MM-dd')
  const plan = actionPlans.find((p) => p.week === weekKey)

  // ── 開閉状態 ──
  const [isOpen, setIsOpen] = useState(false)

  // ── フォーム状態 ──
  const [isEditing, setIsEditing] = useState(false)
  const [theme, setTheme] = useState('')
  const [goals, setGoals] = useState<string[]>([''])
  const [rules, setRules] = useState<IfThenRule[]>([{ id: generateId(), if: '', then: '' }])
  const [suggestFeedback, setSuggestFeedback] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const startEdit = () => {
    if (plan) {
      setTheme(plan.theme)
      setGoals(plan.goals.length > 0 ? plan.goals : [''])
      setRules(plan.ifThenRules.length > 0 ? plan.ifThenRules : [{ id: generateId(), if: '', then: '' }])
    } else {
      setTheme('')
      setGoals([''])
      setRules([{ id: generateId(), if: '', then: '' }])
    }
    setConfirmDelete(false)
    setIsEditing(true)
  }

  const handleSave = () => {
    const validGoals = goals.filter((g) => g.trim())
    const validRules = rules.filter((r) => r.if.trim() || r.then.trim())
    upsertActionPlan(weekKey, {
      theme: theme.trim(),
      goals: validGoals,
      ifThenRules: validRules,
    })
    setIsEditing(false)
  }

  const handleCancel = () => setIsEditing(false)

  // ── ゴール操作 ──
  const updateGoal = (i: number, v: string) =>
    setGoals((prev) => prev.map((g, idx) => (idx === i ? v : g)))
  const addGoal = () => {
    if (goals.length < 3) setGoals((prev) => [...prev, ''])
  }
  const removeGoal = (i: number) =>
    setGoals((prev) => prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i))

  // ── IF-THEN操作 ──
  const updateRule = (id: string, updated: IfThenRule) =>
    setRules((prev) => prev.map((r) => (r.id === id ? updated : r)))
  const addRule = () =>
    setRules((prev) => [...prev, { id: generateId(), if: '', then: '' }])
  const removeRule = (id: string) =>
    setRules((prev) => prev.length === 1 ? prev : prev.filter((r) => r.id !== id))

  // ── AI提案 ──
  const handleSuggest = () => {
    const feedbackTexts = outputs
      .filter((o) => o.peer_note || o.self_improve)
      .slice(0, 5)
      .flatMap((o) => [o.peer_note, o.self_improve].filter((s): s is string => !!s))

    const suggestion = buildSuggestion(feedbackTexts)
    if (suggestion) {
      setTheme(suggestion.theme)
      setGoals(suggestion.goals)
      setRules(suggestion.rules)
      setSuggestFeedback(null)
    } else if (feedbackTexts.length === 0) {
      setSuggestFeedback('まだフィードバックが記録されていません。自己採点やFBを入力後に使えます。')
    } else {
      setSuggestFeedback('フィードバックの内容からテンプレートを特定できませんでした。直接入力してください。')
    }
  }

  // ── 削除 ──
  const handleDelete = () => {
    if (plan) {
      deleteActionPlan(plan.id)
      setConfirmDelete(false)
      setIsEditing(false)
    }
  }

  const canSave = theme.trim() || goals.some((g) => g.trim())

  // ────────────────────────────────────────────────────────────────
  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      id="next-action-plan"
      className="mx-4 mt-6 border border-border-card rounded-lg overflow-hidden"
    >
      {/* ヘッダー（タップで開閉） */}
      <button
        onClick={() => { setIsOpen((o) => !o); setIsEditing(false) }}
        className="w-full flex items-center justify-between px-4 py-3 bg-primary-bg text-left"
      >
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-primary" />
          <h2 className="text-sm font-medium text-primary">次の打ち手</h2>
          <span className="text-[11px] text-text-tertiary">翌週アクションプラン</span>
          {plan && !isOpen && (
            <span className="text-[10px] bg-primary text-white rounded-full px-1.5 py-0.5 leading-none">設定済み</span>
          )}
        </div>
        {isOpen
          ? <ChevronUp size={16} className="text-text-tertiary" />
          : <ChevronDown size={16} className="text-text-tertiary" />
        }
      </button>

      {isOpen && <div className="border-t border-border-card" />}

      {isOpen && <div className="p-4">
        {/* ── 編集フォーム ── */}
        {isEditing ? (
          <div className="space-y-5">
            {/* AI提案ボタン */}
            <button
              onClick={handleSuggest}
              className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-primary/40 rounded-lg text-[12px] text-primary hover:bg-primary-bg transition-colors"
            >
              <Sparkles size={13} />
              フィードバックからAI提案
            </button>
            {suggestFeedback && (
              <p className="text-[11px] text-text-tertiary -mt-3 text-center">{suggestFeedback}</p>
            )}

            {/* ① 改善テーマ */}
            <div>
              <p className="text-[11px] font-medium text-text-secondary mb-1.5">
                ① 改善テーマ
                <span className="ml-1 text-text-tertiary font-normal">今週の反省から1つ選ぶ</span>
              </p>
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="例：商談の質問力　酒の知識　タスク管理"
                className="w-full text-[12px] bg-white border border-border-card rounded-lg px-3 py-2 placeholder:text-text-tertiary focus:outline-none focus:border-primary"
              />
            </div>

            {/* ② 翌週目標 */}
            <div>
              <p className="text-[11px] font-medium text-text-secondary mb-1.5">
                ② 翌週目標
                <span className="ml-1 text-text-tertiary font-normal">行動レベルで・最大3件</span>
              </p>
              <div className="space-y-2">
                {goals.map((g, i) => (
                  <GoalInput
                    key={i}
                    value={g}
                    onChange={(v) => updateGoal(i, v)}
                    onRemove={() => removeGoal(i)}
                    showRemove={goals.length > 1}
                    placeholder={
                      i === 0 ? '例：商談前に質問を3つ作る' :
                      i === 1 ? '例：毎日15分ウイスキーを勉強する' :
                               '例：見積依頼は当日返信する'
                    }
                  />
                ))}
                {goals.length < 3 && (
                  <button
                    onClick={addGoal}
                    className="flex items-center gap-1 text-[11px] text-primary hover:opacity-70 transition-opacity"
                  >
                    <Plus size={12} />
                    目標を追加
                  </button>
                )}
              </div>
            </div>

            {/* ③ IF-THENルール */}
            <div>
              <p className="text-[11px] font-medium text-text-secondary mb-1.5">
                ③ IF-THENルール
                <span className="ml-1 text-text-tertiary font-normal">行動のトリガーを設定する</span>
              </p>
              <div className="space-y-2">
                {rules.map((r) => (
                  <IfThenRow
                    key={r.id}
                    rule={r}
                    onChange={(updated) => updateRule(r.id, updated)}
                    onRemove={() => removeRule(r.id)}
                    showRemove={rules.length > 1}
                  />
                ))}
                <button
                  onClick={addRule}
                  className="flex items-center gap-1 text-[11px] text-primary hover:opacity-70 transition-opacity"
                >
                  <Plus size={12} />
                  ルールを追加
                </button>
              </div>
            </div>

            {/* 保存 / キャンセル */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSave}
                disabled={!canSave}
                className="flex-1 py-2 bg-primary text-white rounded-lg text-[12px] font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                保存する
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-border-card rounded-lg text-[12px] text-text-secondary hover:bg-surface-secondary transition-colors"
              >
                キャンセル
              </button>
            </div>

            {/* 削除 */}
            {plan && (
              <div className="pt-1 border-t border-border-card">
                {confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-text-tertiary flex-1">プランを削除しますか？</span>
                    <button onClick={handleDelete} className="px-2.5 py-1 bg-red-500 text-white rounded text-[11px] font-medium">削除</button>
                    <button onClick={() => setConfirmDelete(false)} className="px-2.5 py-1 border border-border-card rounded text-[11px] text-text-secondary">戻る</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={11} />
                    プランを削除
                  </button>
                )}
              </div>
            )}
          </div>

        ) : plan ? (
          /* ── 表示モード ── */
          <div className="space-y-4">
            {/* テーマ */}
            {plan.theme && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-text-tertiary">改善テーマ</span>
                <span className="px-2.5 py-1 bg-primary text-white rounded-full text-[11px] font-medium">
                  {plan.theme}
                </span>
              </div>
            )}

            {/* 翌週目標 */}
            {plan.goals.length > 0 && (
              <div>
                <p className="text-[11px] text-text-tertiary mb-2">翌週目標</p>
                <div className="space-y-1.5">
                  {plan.goals.map((g, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded border border-primary/40 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={10} className="text-primary opacity-0" />
                      </div>
                      <span className="text-[12px] text-text-primary">{g}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* IF-THENルール */}
            {plan.ifThenRules.length > 0 && plan.ifThenRules.some((r) => r.if || r.then) && (
              <div>
                <p className="text-[11px] text-text-tertiary mb-2">IF-THENルール</p>
                <div className="space-y-2">
                  {plan.ifThenRules.filter((r) => r.if || r.then).map((r) => (
                    <div key={r.id} className="bg-surface-secondary rounded-lg px-3 py-2 space-y-0.5">
                      {r.if && (
                        <p className="text-[11px]">
                          <span className="font-bold text-purple-600">IF　</span>
                          <span className="text-text-primary">{r.if}</span>
                        </p>
                      )}
                      {r.then && (
                        <p className="text-[11px]">
                          <span className="font-bold text-primary">THEN</span>
                          <span className="text-text-primary ml-1">{r.then}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 編集ボタン */}
            <button
              onClick={startEdit}
              className="flex items-center gap-1 text-[11px] text-primary hover:opacity-70 transition-opacity pt-1"
            >
              <Pencil size={12} />
              編集する
            </button>
          </div>

        ) : (
          /* ── 空状態 ── */
          <div className="text-center py-4">
            <p className="text-[12px] text-text-secondary mb-1">翌週の行動をここで設計しましょう</p>
            <p className="text-[11px] text-text-tertiary mb-4">フィードバックをもとに、来週やることを決める</p>
            <button
              onClick={startEdit}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-[12px] font-medium hover:opacity-90 transition-opacity"
            >
              <Zap size={13} />
              プランを立てる
            </button>
          </div>
        )}
      </div>}
    </section>
  )
}
