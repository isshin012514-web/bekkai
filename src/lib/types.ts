export type OutputType = 'article' | 'speech' | 'product' | 'post' | 'other'

export interface Attachment {
  id: string
  name: string
  mime: string    // 'image/jpeg' など
  data: string    // base64 data URL
  created_at: string
}

export interface SelfScoreDetail {
  originality: number      // 独自性
  communication: number    // 伝達力
  practicality: number     // 実用性
  audience_response: number // 聴衆の反応
  completeness: number     // 完成度
}

export interface Output {
  id: string
  user_id: string
  title: string
  type: OutputType
  audience?: string        // 誰に向けて
  audience_reaction?: string // 聴衆の反応（記述）
  has_visuals?: boolean    // 図式・資料を使ったか
  linked_input_ids?: string[] // 関連インプット
  memo?: string            // メモ
  self_score: number
  self_score_detail?: SelfScoreDetail
  self_good?: string       // できたこと
  self_improve?: string    // できなかったこと
  scored_at?: string       // 自己採点した日時
  created_at: string
  reviewer_id?: string
  peer_score?: number
  peer_score_detail?: SelfScoreDetail
  peer_note?: string
  peer_scored_at?: string
  is_key?: boolean         // 自分向き・重要フラグ
  attachments?: Attachment[]
}

export type ReviewerRelationship = 'boss' | 'peer' | 'friend' | 'mentor' | 'other'

export interface Reviewer {
  id: string
  user_id: string
  name: string
  relationship: ReviewerRelationship
  last_scored_at?: string
}

export type RoleModelColor = 'purple' | 'teal' | 'coral' | 'amber' | 'blue'

export interface RoleModel {
  id: string
  user_id: string
  name: string
  initials: string
  color_key: RoleModelColor
  admire_point?: string           // どんなところをロールモデルにしたか
  learning_notes: Array<{ at: string; text: string }>
  created_at: string
}

export interface UpcomingPerson {
  id: string
  user_id: string
  name: string
  meeting_date?: string
  questions: string[]
  met: boolean
  met_at?: string
  learnings_after?: string
}

export type InputType = 'book' | 'article' | 'video' | 'dialogue' | 'other'

export interface Input {
  id: string
  user_id: string
  type: InputType
  title: string
  learning?: string
  linked_output_id?: string
  is_key?: boolean         // 自分向き・重要フラグ
  attachments?: Attachment[]
  created_at: string
}

export interface WeeklyGoal {
  id: string
  week: string
  goal: string
  done: boolean
  created_at: string
}

export interface IfThenRule {
  id: string
  if: string
  then: string
}

export interface ActionPlan {
  id: string
  week: string        // yyyy-MM-dd（その週の月曜日）
  theme: string
  goals: string[]
  ifThenRules: IfThenRule[]
  created_at: string
}

// ========== 失敗力（Failure Power）==========

export type RiskLevel = 'low' | 'mid' | 'high'

/** ① 失敗リスト — 回避できる失敗を蓄積・日々更新 */
export interface FailureItem {
  id: string
  content: string      // 失敗内容
  lesson: string       // 原因 / 教訓
  avoidance: string    // 回避策
  avoidable: boolean   // 回避できる失敗か
  created_at: string
}

/** ② 仮想失敗（プリモーテム）— 行動の前に失敗を見積もる */
export interface Premortem {
  id: string
  risk: string         // 想定する失敗
  probability: RiskLevel
  impact: RiskLevel
  countermeasure: string // 先回りの対策
  created_at: string
}

/** ③ リスク設計 — リスク×リターンを先に置く */
export interface RiskDesign {
  id: string
  challenge: string    // 挑戦内容
  risk: RiskLevel
  ret: RiskLevel       // 期待リターン
  toleranceLine: string // リスク許容ライン
  created_at: string
}

/** ④ 成功宣言 — 先に宣言して言い訳をなくす */
export interface SuccessDeclaration {
  id: string
  content: string      // 宣言内容（後から編集不可）
  deadline: string     // 期限
  result: 'pending' | 'achieved' | 'failed'
  created_at: string
}

/** ⑤ 撤退ジャッジ — Jカーブで続行/撤退を判断 */
export type JCurvePhase = 'launch' | 'valley' | 'recovery' | 'unknown'
export type RetreatDecision = 'continue' | 'pivot' | 'retreat'

export interface RetreatJudgment {
  id: string
  target: string           // 今の取り組み
  jCurvePhase: JCurvePhase
  retreatReason: string    // 撤退理由を説明できるか
  affectedParties: string  // 迷惑をかける相手・範囲
  decision: RetreatDecision | null
  nextAlternative: string  // ピボット先の別解
  created_at: string
}

/** ⑥ メタ認知 — 優れた人との差分を第三者視点で見る */
export interface Metacognition {
  id: string
  roleModel: string        // 比較対象
  theirJudgment: string    // その人ならどう判断したか
  diff: string             // 自分の判断との差分
  decisionScore: number    // 最高の意思決定だったか（1..5, 0=未評価）
  stayInField: boolean | null // このフィールドで戦い続けるか
  created_at: string
}

export interface FailurePower {
  failureList: FailureItem[]
  premortems: Premortem[]
  riskDesigns: RiskDesign[]
  declarations: SuccessDeclaration[]
  retreatJudgments: RetreatJudgment[]
  metacognitions: Metacognition[]
}

export function emptyFailurePower(): FailurePower {
  return {
    failureList: [],
    premortems: [],
    riskDesigns: [],
    declarations: [],
    retreatJudgments: [],
    metacognitions: [],
  }
}

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  low: 'ロー', mid: 'ミドル', high: 'ハイ',
}

export const J_CURVE_LABELS: Record<JCurvePhase, string> = {
  launch: '立ち上げ', valley: '谷', recovery: '回復', unknown: '不明',
}

export const RETREAT_DECISION_LABELS: Record<RetreatDecision, string> = {
  continue: '継続', pivot: 'ピボット', retreat: '撤退',
}

// ========== 実現力（Realization Power）==========
// 別解は実現しなければ独りよがり。組み合わせ・連鎖／量→質／チームで実現する。

/** ① 組み合わせ・連鎖 — 要素を組み合わせて新しいイチをつくる。失敗したら自分らしさを残して修正 */
export type CombineStatus = 'trying' | 'failed' | 'succeeded'
export type AdjustType = 'balance' | 'combination' | 'concentration'

export interface Combination {
  id: string
  bekkai: string          // 実現したい別解
  elements: string[]      // 組み合わせる・連鎖させる要素
  status: CombineStatus   // 挑戦中 / 失敗 / 成功
  adjustType: AdjustType | null  // 修正のコツ（バランス / 組み合わせ / 濃度）
  adjustNote: string      // 自分らしさを残してどう修正したか
  created_at: string
}

/** ② 量→質 — 量をこなして質に転化させる。3つの投資パターンで逆算（1万時間が目処） */
export type InvestPattern = 'linear' | 'jcurve' | 'loop'

export interface QuantityQuality {
  id: string
  theme: string           // 取り組み
  pattern: InvestPattern  // 正比 / Jカーブ / ループ
  targetHours: number     // 目標投資時間（1万時間を目処に逆算）
  doneHours: number       // 現在の累積時間
  note: string            // 内容への注意（雑用にならないように）
  // pattern === 'loop' のときの「問い→仮の答え→別解→行動」
  question: string
  tentativeAnswer: string
  alternative: string
  action: string
  loopCount: number       // ループを回した回数
  created_at: string
}

/** ③ チーム・実行力 — 1000点を取るにはメンバーが要る。信用は成果で、信頼は人柄で上がる */
export type MemberType = 'member' | 'asset'  // メンバー / 無形の資産（友人・顧客）

export interface TeamMember {
  id: string
  name: string            // 名前 / 資産名
  role: string            // 役割 / 関係
  type: MemberType
  shinyo: number          // 信用（成果で飛躍的に上がる）0..5
  shinrai: number         // 信頼（人柄）0..5
  created_at: string
}

export interface RealizationPower {
  confidence: string      // 自信＝根拠のない自信（リーダーシップ・メンバーを説得する核）
  combinations: Combination[]
  quantityQualities: QuantityQuality[]
  team: TeamMember[]
}

export function emptyRealizationPower(): RealizationPower {
  return { confidence: '', combinations: [], quantityQualities: [], team: [] }
}

export const ADJUST_TYPE_LABELS: Record<AdjustType, string> = {
  balance: '要素のバランス', combination: '要素の組み合わせ', concentration: '正解と別解の濃度',
}

export const INVEST_PATTERN_LABELS: Record<InvestPattern, string> = {
  linear: '正比', jcurve: 'Jカーブ', loop: 'ループ',
}

export const COMBINE_STATUS_LABELS: Record<CombineStatus, string> = {
  trying: '挑戦中', failed: '失敗', succeeded: '成功',
}

/** デモ用のサンプル実現力データ */
export function demoRealizationPower(): RealizationPower {
  return {
    confidence: '泥臭い現場主義 × データ分析で、誰も拾えていない中堅得意先の伸びしろを必ず形にする。',
    combinations: [
      {
        id: 'demo-c1',
        bekkai: '訪問営業 × 期待値分析で「次に伸びる得意先」を先回りで攻める',
        elements: ['足で稼ぐ訪問頻度', '得意先別の期待値データ', '同業の成功事例'],
        status: 'trying',
        adjustType: 'combination',
        adjustNote: '最初はデータ偏重で空振り。自分らしい現場の肌感を残しつつ、データは「訪問先の優先順位づけ」だけに使う組み合わせに変えた。',
        created_at: '2026-05-20T09:00:00.000Z',
      },
      {
        id: 'demo-c2',
        bekkai: '勉強会 × SNS発信でファンを増やし、紹介で新規を取る',
        elements: ['社内勉強会の運営ノウハウ', '個人のSNS発信', '既存顧客との信頼関係'],
        status: 'failed',
        adjustType: 'concentration',
        adjustNote: '別解に振り切りすぎて怪しまれた。王道の対面提案(正解)を7割に戻し、SNS(別解)は3割の濃度に調整中。',
        created_at: '2026-05-12T09:00:00.000Z',
      },
    ],
    quantityQualities: [
      {
        id: 'demo-q1',
        theme: '提案資料づくりの質を量で上げる',
        pattern: 'jcurve',
        targetHours: 1000,
        doneHours: 180,
        note: 'ただ枚数を増やすのではなく、毎回1つ新しい見せ方を試すことを必須にする（雑用化を防ぐ）。',
        question: '', tentativeAnswer: '', alternative: '', action: '', loopCount: 0,
        created_at: '2026-04-01T09:00:00.000Z',
      },
      {
        id: 'demo-q2',
        theme: '別解の打ち手をループで磨く',
        pattern: 'loop',
        targetHours: 300,
        doneHours: 60,
        note: '1サイクルを1週間以内に収める。',
        question: '中堅得意先の発注が伸びないのはなぜ？',
        tentativeAnswer: '担当者が変わっても引き継ぎ提案がないから',
        alternative: '四半期ごとの「棚卸し提案」を仕組み化する',
        action: '来週、上位5社に棚卸し提案のたたき台を持っていく',
        loopCount: 3,
        created_at: '2026-04-15T09:00:00.000Z',
      },
    ],
    team: [
      { id: 'demo-t1', name: '田中 課長', role: '意思決定・予算承認', type: 'member', shinyo: 4, shinrai: 5, created_at: '2026-03-01T09:00:00.000Z' },
      { id: 'demo-t2', name: '佐藤さん（後輩）', role: 'データ集計・資料作成', type: 'member', shinyo: 3, shinrai: 4, created_at: '2026-03-05T09:00:00.000Z' },
      { id: 'demo-t3', name: '大学時代の友人（同業他社）', role: '業界の最新情報・壁打ち相手', type: 'asset', shinyo: 2, shinrai: 5, created_at: '2026-03-10T09:00:00.000Z' },
      { id: 'demo-t4', name: '既存の優良顧客 A社', role: '紹介・成功事例の発信元', type: 'asset', shinyo: 5, shinrai: 4, created_at: '2026-03-12T09:00:00.000Z' },
    ],
  }
}

export const OUTPUT_TYPE_LABELS: Record<OutputType, string> = {
  article: '記事',
  speech: '発言',
  product: '成果物',
  post: '投稿',
  other: 'その他',
}

export const INPUT_TYPE_LABELS: Record<InputType, string> = {
  book: '本',
  article: '記事',
  video: '動画',
  dialogue: '対話',
  other: 'その他',
}

export const RELATIONSHIP_LABELS: Record<ReviewerRelationship, string> = {
  boss: '上司',
  peer: '同僚',
  friend: '友人',
  mentor: 'メンター',
  other: 'その他',
}

export const ROLE_MODEL_COLORS: Record<RoleModelColor, { bg: string; text: string }> = {
  purple: { bg: '#7C3AED', text: '#FFFFFF' },
  teal: { bg: '#0F6E56', text: '#FFFFFF' },
  coral: { bg: '#DC2626', text: '#FFFFFF' },
  amber: { bg: '#D97706', text: '#FFFFFF' },
  blue: { bg: '#185FA5', text: '#FFFFFF' },
}

export const SELF_SCORE_CRITERIA = [
  { key: 'originality' as const, label: '独自性', hint: '自分なりの視点があるか・日本/業界で何位レベルか・希少性はあるか' },
  { key: 'communication' as const, label: '伝達力', hint: 'わかりやすく伝えられたか' },
  { key: 'practicality' as const, label: '実用性', hint: '相手にとって価値ある内容だったか' },
  { key: 'audience_response' as const, label: '聴衆の反応', hint: '相手の反応・手応えはどうだったか' },
  { key: 'completeness' as const, label: '完成度', hint: '準備・仕上がりは十分だったか' },
] as const

// ========== 別解力（Bekkai）==========

export type BekkaiAxis = 'self' | 'excellent' | 'different'

// 各領域の評価（0=未評価, 20/40/60/80/100）
export interface BekkaiAreaEval {
  score: number          // 0..100（0 は未評価）
  reason: string         // なぜその評価か
  ideas: string[]        // この領域でのアイデア・打ち手
}

export interface Bekkai {
  id: string
  user_id: string
  theme: string                          // テーマ・課題
  self: BekkaiAreaEval
  excellent: BekkaiAreaEval
  different: BekkaiAreaEval
  downside: string                       // 「別のやり方」のマイナス面と打ち手
  conclusion: string                     // 統合した「別解」の言語化
  is_key?: boolean
  created_at: string
  updated_at: string
}

export const BEKKAI_AXIS_LABELS: Record<BekkaiAxis, string> = {
  self: '自分らしいやり方',
  excellent: '優れたやり方',
  different: '別のやり方',
}

export const BEKKAI_AXIS_DESC: Record<BekkaiAxis, string> = {
  self: '自分の経験・知見・夢中になれること・価値観を反映したオリジナルの要素。アウトプットを繰り返すことで見つかる。',
  excellent: '「大きい・多い・安い・高い・早い」などの優等生的な強さ。陳腐化しやすいため他の視点との組み合わせが必要。',
  different: '優れたやり方の逆、価値観を無視する、誰もやっていないこと。マイナス面が付きまとうため補う打ち手が必要。',
}

export const BEKKAI_SCORE_LABELS: Record<number, string> = {
  20: '弱い', 40: 'やや弱', 60: 'やや強', 80: '強い', 100: '核心',
}

export function emptyBekkaiArea(): BekkaiAreaEval {
  return { score: 0, reason: '', ideas: [] }
}
