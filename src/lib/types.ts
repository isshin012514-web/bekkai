export type OutputType = 'article' | 'speech' | 'product' | 'post' | 'other'

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
  peer_note?: string
  peer_scored_at?: string
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
  created_at: string
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
  { key: 'originality' as const, label: '独自性', hint: '自分なりの視点・切り口があったか' },
  { key: 'communication' as const, label: '伝達力', hint: 'わかりやすく伝えられたか' },
  { key: 'practicality' as const, label: '実用性', hint: '相手にとって価値ある内容だったか' },
  { key: 'audience_response' as const, label: '聴衆の反応', hint: '相手の反応・手応えはどうだったか' },
  { key: 'completeness' as const, label: '完成度', hint: '準備・仕上がりは十分だったか' },
] as const
