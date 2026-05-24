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

export function AddOutputModal({ open, onClose }: AddOutputModalProps) {
  const addOutput = useGrowthStore((s) => s.addOutput)
  const inputs = useGrowthStore((s) => s.inputs)

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
      audience: '',
      audience_reaction: '',
      has_visuals: false,
      linked_input_ids: [],
      memo: '',
    },
  })

  const selectedInputIds = watch('linked_input_ids') ?? []
  const hasVisuals = watch('has_visuals')

  const toggleInput = (id: string) => {
    const current = selectedInputIds
    if (current.includes(id)) {
      setValue('linked_input_ids', current.filter((x) => x !== id))
    } else {
      setValue('linked_input_ids', [...current, id])
    }
  }

  const onSubmit = (data: OutputFormValues) => {
    addOutput({
      ...data,
      self_score: 0,
    })
    reset()
    onClose()
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="アウトプットを記録">
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

        {/* Audience */}
        <div>
          <label className="block text-[12px] font-medium text-text-secondary mb-1">
            誰に向けて
          </label>
          <input
            {...register('audience')}
            placeholder="例：チームメンバー、クラスメイト、SNSフォロワー"
            className="w-full px-3 py-2.5 border border-border-card rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-surface"
          />
        </div>

        {/* Audience reaction */}
        <div>
          <label className="block text-[12px] font-medium text-text-secondary mb-1">
            聴衆の反応
          </label>
          <textarea
            {...register('audience_reaction')}
            rows={2}
            placeholder="例：質問が3つ出た、うなずきが多かった、いいね20件"
            className="w-full px-3 py-2.5 border border-border-card rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none bg-surface"
          />
        </div>

        {/* Visuals toggle */}
        <div className="flex items-center justify-between">
          <label className="text-[12px] font-medium text-text-secondary">
            図式・資料を使った
          </label>
          <button
            type="button"
            onClick={() => setValue('has_visuals', !hasVisuals)}
            className={`w-10 h-6 rounded-full transition-colors relative ${
              hasVisuals ? 'bg-primary' : 'bg-surface-secondary border border-border-card'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow absolute top-1 transition-transform ${
              hasVisuals ? 'translate-x-5' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {/* Linked Inputs */}
        {inputs.length > 0 && (
          <div>
            <label className="block text-[12px] font-medium text-text-secondary mb-1">
              関連インプット
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {inputs.slice(0, 10).map((input) => (
                <button
                  key={input.id}
                  type="button"
                  onClick={() => toggleInput(input.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] border transition-colors ${
                    selectedInputIds.includes(input.id)
                      ? 'border-primary bg-primary-bg text-primary'
                      : 'border-border-card text-text-secondary hover:bg-surface-secondary'
                  }`}
                >
                  {input.title.length > 15 ? input.title.slice(0, 15) + '…' : input.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Memo */}
        <div>
          <label className="block text-[12px] font-medium text-text-secondary mb-1">
            メモ (任意)
          </label>
          <textarea
            {...register('memo')}
            rows={2}
            placeholder="その他の記録やメモ..."
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
