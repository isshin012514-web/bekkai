import { useEffect, useRef, useState } from 'react'
import {
  X, TrendingUp, Search, Sparkles,
  BookOpen, PenLine, ClipboardCheck, Zap, Users,
  User, Grid3x3, MessageCircle, Filter, Link2,
  MousePointerClick, BarChart3, Lightbulb,
  AlertTriangle, Flag, CornerUpLeft, Target,
  Rocket, Layers, Repeat,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type GuideFeature = 'growth' | 'discovery' | 'bekkai' | 'realization' | 'failure'

interface Step { icon: LucideIcon; color: string; title: string; body: string }
interface Guide { icon: LucideIcon; accent: string; title: string; intro: string; steps: Step[] }

const GUIDES: Record<GuideFeature, Guide> = {
  growth: {
    icon: TrendingUp,
    accent: '#185FA5',
    title: '成長力の使い方',
    intro: 'アウトプットを軸に自分を伸ばす機能です。「インプット→アウトプット→採点→次の打ち手」のサイクルを回して成長を可視化します。',
    steps: [
      { icon: BookOpen, color: '#185FA5', title: '① インプットを記録', body: '本・記事・動画・対話など、学んだことを記録します。後でアウトプットと紐付けられます。' },
      { icon: PenLine, color: '#0F6E56', title: '② アウトプットを記録', body: '学びを使った成果（記事・発言・成果物・投稿）を残します。図や資料の有無、誰に向けたかも記録できます。' },
      { icon: ClipboardCheck, color: '#854F0B', title: '③ 採点する', body: '独自性・伝達力・実用性・反応・完成度で自己採点。他者からのフィードバックも記録でき、客観視できます。' },
      { icon: Zap, color: '#185FA5', title: '④ 次の打ち手を立てる', body: '振り返りから翌週のアクションプランやIf-Thenルールを設定。サイクルを継続する仕組みです。' },
      { icon: Users, color: '#7C3AED', title: 'ロールモデル・会う人', body: '目標とする人や、これから会う人・聞きたい質問を管理。学びを次のインプットにつなげます。' },
    ],
  },
  discovery: {
    icon: Search,
    accent: '#6a5ae0',
    title: '発見力の使い方',
    intro: '「解くべき問題」を見つける自己分析マンダラです。8つの視点で自分とまわりを深掘り、本当に取り組むべき課題を発見します。',
    steps: [
      { icon: User, color: '#6a5ae0', title: '① まず「自分」から', body: 'いきなり全部埋めなくてOK。「自分」の強み・弱みの2マスから始めると、5分で1周する感覚がつかめます。' },
      { icon: Grid3x3, color: '#D97706', title: '② 8つの視点を埋める', body: '目的・目標・問題・昔・自分・周り・市場・未来。各モジュールのマスに気づきを追加していきます。' },
      { icon: MessageCircle, color: '#0F6E56', title: '③「なぜ？」を添える', body: '各項目に根拠や仮説を書き添えると、分析が深まり後で見返したときに活きます。' },
      { icon: Filter, color: '#185FA5', title: '④ 横断レビューで発見', body: '全体を俯瞰して、視点をまたいだ気づきから「解くべき問題」を見つけます。' },
      { icon: Link2, color: '#DC2626', title: '別解力へつなぐ', body: 'ここで見つけた強み・弱み・市場の動きは、別解力の「なぜその評価？」で引用できます。' },
    ],
  },
  bekkai: {
    icon: Sparkles,
    accent: '#DC2626',
    title: '別解力の使い方',
    intro: '別解とは、答えのない問いに対して「自分らしさ × 優れている × 他と違う」を掛け合わせ、自分なりの答えを見つけること。3つが重なる部分が「別解」です。',
    steps: [
      { icon: MousePointerClick, color: '#6366f1', title: '① 3つの円をタップして評価', body: '「自分らしい」「優れた」「別の」やり方の3つの円をタップ。強さを選び、理由とアイデアを入力します。成長力・発見力のデータを引用もできます。' },
      { icon: BarChart3, color: '#D97706', title: '② 構成比で「軸足」を見る', body: '円の大きさと構成比バーで、どこに重心があるか一目でわかります。バランス型が正解とは限らず、あえて偏らせるのも戦略です。' },
      { icon: Sparkles, color: '#DC2626', title: '③ 統合して「別解」を導く', body: '中央の「別解」または下のボタンから統合画面へ。3つの視点を踏まえ、あなたならではの答えを言語化します。' },
      { icon: Lightbulb, color: '#059669', title: 'ヒントを活用', body: '画面下のヒントは5秒ごとに切り替わり、前後に手動でも移動できます。タップで問いを深掘りでき、発想を助けます。' },
    ],
  },
  realization: {
    icon: Rocket,
    accent: '#EA580C',
    title: '実現力の使い方',
    intro: '別解は実現しなければ独りよがり。①要素の組み合わせ・連鎖で形にし、②量をこなして質に転化させ、③チームで1000点を取る。別解を「絵に描いた餅」で終わらせないための機能です。',
    steps: [
      { icon: Layers, color: '#EA580C', title: '① 組み合わせ・連鎖', body: '要素を掛け合わせるだけで新しいイチになるから楽。失敗はつきもの。自分らしさを残し、バランス・組み合わせ・濃度を変えて修正し、数をこなします。' },
      { icon: Repeat, color: '#D97706', title: '② 量 → 質', body: '根本に必要なのは質だが、量をこなして質に転化させる。正比 / Jカーブ / ループの3パターンを当てはめ、1万時間を目処に逆算。雑用化を防ぐため内容に注意します。' },
      { icon: Users, color: '#EA580C', title: '③ チーム・実行力', body: '1000点はチームで取る。メンバーの信用（成果で上がる）と信頼（人柄）を可視化し、友人・顧客など無形の資産もフル活用します。' },
      { icon: Sparkles, color: '#BE123C', title: '自信＝根拠のない自信', body: '別解を実現するリーダーシップは「根拠のない自信」。それがメンバーを説得します。あなたの核となる確信を言語化しておきましょう。' },
    ],
  },
  failure: {
    icon: AlertTriangle,
    accent: '#0D9488',
    title: '失敗力の使い方',
    intro: '失敗と成功は両輪。失敗は「成功のプロトタイプ」です。行動の前にリスクを設計し、後に失敗を次の別解へ繋げる。無防備なまま転ばないための機能です。',
    steps: [
      { icon: AlertTriangle, color: '#0D9488', title: '① 失敗リスト', body: '成功の再現性はないが、失敗はみんなほとんど同じ。回避できる失敗を蓄積し、仕組みで回避できるようにします。' },
      { icon: Search, color: '#854F0B', title: '② 仮想失敗（プリモーテム）', body: '行動の前に、起こりうる失敗・発生確率・影響度・先回りの対策を書き出します。失敗はチャンスロス、先に見積もります。' },
      { icon: BarChart3, color: '#854F0B', title: '③ リスク設計', body: 'ローリスク・ミドルリターン / ミドルリスク・ハイリターンを狙う。挑戦をリスク×リターンのマトリクスに置き、許容ラインを決めます。' },
      { icon: Flag, color: '#0D9488', title: '④ 成功宣言', body: '成功を先に宣言して言い訳をなくします。期限が来たら達成/未達を記録。記録はタップで詳細を見返し、編集・削除もできます。' },
      { icon: CornerUpLeft, color: '#BE123C', title: '⑤ 撤退ジャッジ', body: 'Jカーブのどこにいるか、撤退理由を説明できるか、誰に迷惑がかかるかで継続/ピボット/撤退を判断します。' },
      { icon: Target, color: '#0F6E56', title: '⑥ メタ認知', body: '人は自分に甘い。優れた人になったつもりで、自分の意思決定との差分を第三者視点で振り返ります。' },
    ],
  },
}

const HIDDEN_PREFIX = 'guide-hidden-'

export function isGuideHidden(feature: GuideFeature): boolean {
  try { return localStorage.getItem(HIDDEN_PREFIX + feature) === '1' } catch { return true }
}
export function markGuideHidden(feature: GuideFeature) {
  try { localStorage.setItem(HIDDEN_PREFIX + feature, '1') } catch { /* noop */ }
}

interface FeatureGuideProps {
  feature: GuideFeature
  open: boolean
  onClose: () => void
}

export function FeatureGuide({ feature, open, onClose }: FeatureGuideProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [dontShow, setDontShow] = useState(false)
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) setDontShow(false)
    return () => { document.body.style.overflow = '' }
  }, [open])
  if (!open) return null

  const g = GUIDES[feature]
  const HeadIcon = g.icon

  const close = () => {
    if (dontShow) markGuideHidden(feature)
    onClose()
  }

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[60] flex items-end justify-center" onClick={(e) => { if (e.target === overlayRef.current) close() }}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative w-full max-w-[430px] bg-surface rounded-t-2xl max-h-[88vh] flex flex-col animate-slide-up">
        <div className="w-9 h-1 rounded-full bg-black/15 mx-auto mt-2" />
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border-card">
          <HeadIcon size={16} style={{ color: g.accent }} />
          <h2 className="text-[15px] font-semibold flex-1">{g.title}</h2>
          <button onClick={close} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-secondary"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <p className="text-[12px] text-text-secondary leading-relaxed mb-4">{g.intro}</p>
          <div className="flex flex-col gap-3">
            {g.steps.map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className="flex gap-3 p-3 rounded-xl border border-border-card">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}1A` }}>
                    <Icon size={18} style={{ color: s.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-semibold mb-1">{s.title}</div>
                    <div className="text-[11px] text-text-secondary leading-relaxed">{s.body}</div>
                  </div>
                </div>
              )
            })}
          </div>
          <label className="flex items-center gap-2 mt-4 cursor-pointer select-none">
            <input type="checkbox" checked={dontShow} onChange={(e) => setDontShow(e.target.checked)}
              className="w-4 h-4 accent-[color:var(--color-primary)]" />
            <span className="text-[12px] text-text-secondary">次回以降このガイドを自動表示しない</span>
          </label>
          <button onClick={close} className="w-full py-3 rounded-[10px] text-white text-sm font-semibold mt-3" style={{ background: g.accent }}>
            はじめる
          </button>
        </div>
      </div>
    </div>
  )
}
