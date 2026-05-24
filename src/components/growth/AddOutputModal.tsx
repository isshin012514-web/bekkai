import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { outputSchema, type OutputFormValues } from '@/lib/schemas'
import { OUTPUT_TYPE_LABELS } from '@/lib/types'
import type { OutputType } from '@/lib/types'
import { Modal } from '@/components/ui/Modal'
import { useGrowthStore } from '@/stores/growth-store'

interface AddOutputModalProps {
  open: boolean
  onClose: () => void
}

const OUTPUT_TYPES: OutputType[] = ['article', 'speech', 'product', 'post', 'other']

const CRITERIA = [
  { key: 'originality' as const, label: '独自性', hint: '自分なりの視点や切り口があるか' },
  { key: 'practicality' as const, label: '実用性', hint: '誰かの役に立つか・使えるか' },
  { key: 'completeness' as const, label: '完成度', hint: '質・量ともに仕上がっているか' },
]

export function AddOutputModal({ open, onClose }: AddOutputModalProps) {
  const addOutput = useGrowthStore((s) => s.addOutput)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OutputFormValues>({
    resolver: zodResolver(outputSchema),
    defaultValues: {
      title: '',
      type: 'article',
      self_score: 5,
      self_score_detail: { originality: 5, practicality: 5, completeness: 5 },
      self_note: '',
      self_good: '',
      self_improve: '',
    },
  })

  const selfScore = watch('self_score')
  const detail = watch('self_score_detail')

  // Auto-calc overall from detail average
  const updateOverall = (field: 'originality' | 'practicality' | 'completeness', value: number) => {
    const newDetail = { ...(detail ?? { originality: 5, practicality: 5, completeness: 5 }), [field]: value }
    setValue('self_score_detail', newDetail)
    const avg = Math.round(((newDetail.originality + newDetail.practicality + newDetail.completeness) / 3) * 2) / 2
    setValue('self_score', avg)
  }

  const onSubmit = (data: OutputFormValues) => {
    addOutput(data)
    reset()
    onClose()
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="アウトプット記録 & 自己採点">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-[12px] font-medium text-text-secondary mb-1">
            タイトル
          </label>
          <input
            {...register('title')}
            placeholder="何をアウトプットしましたか？"
            className="w-full px-3 py-2.5 border border-border-card rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-surface"
          />
          {errors.title && (
            <p className="text-[11px] text-red-500 mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Type */}
        <div>
          <label className="block text-[12px] font-medium text-text-secondary mb-1">
            種別
          </label>
          <div className="flex flex-wrap gap-2">
            {OUTPUT_TYPES.map((type) => (
              <label key={type} className="cursor-pointer">
                <input
                  type="radio"
                  value={type}
                  {...register('type')}
                  className="sr-only peer"
                />
                <span className="inline-block px-3 py-1.5 rounded-lg text-[12px] border border-border-card peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary transition-colors">
                  {OUTPUT_TYPE_LABELS[type]}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Criteria-based scoring */}
        <div className="bg-surface-secondary rounded-lg p-3">
          <label className="block text-[12px] font-medium text-text-secondary mb-2">
            自己採点（観点別）
          </label>
          <div className="space-y-3">
            {CRITERIA.map((c) => (
              <div key={c.key}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[12px] font-medium">{c.label}</span>
                  <span className="text-[12px] text-primary font-medium w-8 text-right">
                    {(detail?.[c.key] ?? 5).toFixed(1)}
                  </span>
                </div>
                <p className="text-[10px] text-text-tertiary mb-1">{c.hint}</p>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={0.5}
                  value={detail?.[c.key] ?? 5}
                  onChange={(e) => updateOverall(c.key, parseFloat(e.target.value))}
                  className="w-full accent-primary h-1.5"
                />
              </div>
            ))}
          </div>
          {/* Overall score display */}
          <div className="mt-3 pt-3 border-t border-border-card flex items-center justify-between">
            <span className="text-[12px] font-medium text-text-secondary">総合スコア</span>
            <span className="text-lg font-bold text-primary">{selfScore.toFixed(1)}</span>
          </div>
        </div>

        {/* Good points */}
        <div>
          <label className="block text-[12px] font-medium text-text-secondary mb-1">
            良かった点
          </label>
          <textarea
            {...register('self_good')}
            rows={2}
            placeholder="例：自分なりの仮説を入れられた、データを使って裏付けした"
            className="w-full px-3 py-2.5 border border-border-card rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none bg-surface"
          />
        </div>

        {/* Areas for improvement */}
        <div>
          <label className="block text-[12px] font-medium text-text-secondary mb-1">
            改善点・次回への学び
          </label>
          <textarea
            {...register('self_improve')}
            rows={2}
            placeholder="例：結論が弱かった、もっとユーザー視点を入れたい"
            className="w-full px-3 py-2.5 border border-border-card rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none bg-surface"
          />
        </div>

        {/* Free memo */}
        <div>
          <label className="block text-[12px] font-medium text-text-secondary mb-1">
            メモ (任意)
          </label>
          <textarea
            {...register('self_note')}
            rows={2}
            placeholder="その他の振り返りや気づき..."
            className="w-full px-3 py-2.5 border border-border-card rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none bg-surface"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          記録する
        </button>
      </form>
    </Modal>
  )
}
