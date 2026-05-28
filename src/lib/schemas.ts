import { z } from 'zod'

const scoreField = z.number().min(0).max(10)

/* アウトプット記録（採点は別） */
export const outputSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  type: z.enum(['article', 'speech', 'product', 'post', 'other']),
  audience: z.string().optional(),
  audience_reaction: z.string().optional(),
  has_visuals: z.boolean().optional(),
  linked_input_ids: z.array(z.string()).optional(),
  memo: z.string().optional(),
})

export type OutputFormValues = z.infer<typeof outputSchema>

/* 自己採点 */
export const selfScoreSchema = z.object({
  self_score_detail: z.object({
    originality: scoreField,
    communication: scoreField,
    practicality: scoreField,
    audience_response: scoreField,
    completeness: scoreField,
  }),
  self_good: z.string().optional(),
  self_improve: z.string().optional(),
})

export type SelfScoreFormValues = z.infer<typeof selfScoreSchema>

export const roleModelSchema = z.object({
  name: z.string().min(1, '名前は必須です'),
  initials: z.string().min(1, '頭文字は必須です').max(4, '4文字以内'),
  color_key: z.enum(['purple', 'teal', 'coral', 'amber', 'blue']),
  admire_point: z.string().optional(),
})

export type RoleModelFormValues = z.infer<typeof roleModelSchema>

export const upcomingPersonSchema = z.object({
  name: z.string().min(1, '名前は必須です'),
  meeting_date: z.string().optional(),
})

export type UpcomingPersonFormValues = z.infer<typeof upcomingPersonSchema>

export const inputSchema = z.object({
  type: z.enum(['book', 'article', 'video', 'dialogue', 'other']),
  title: z.string().min(1, 'タイトルは必須です'),
  learning: z.string().optional(),
})

export type InputFormValues = z.infer<typeof inputSchema>
