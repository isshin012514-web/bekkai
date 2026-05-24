import { z } from 'zod'

export const outputSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  type: z.enum(['article', 'speech', 'product', 'post', 'other']),
  self_score: z
    .number()
    .min(0, '0以上で入力してください')
    .max(10, '10以下で入力してください'),
  self_note: z.string().optional(),
})

export type OutputFormValues = z.infer<typeof outputSchema>

export const roleModelSchema = z.object({
  name: z.string().min(1, '名前は必須です'),
  initials: z.string().min(1, '頭文字は必須です').max(4, '4文字以内'),
  color_key: z.enum(['purple', 'teal', 'coral', 'amber', 'blue']),
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
