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
const SCORE_OPTIONS = Array.from({ length: 21 }, (_, i) => i * 0.5)

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
      self_note: '',
    },
  })

  const selfScore = watch('self_score')

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
    <Modal open={open} onClose={handleClose} title="アウトプット記録">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

        <div>
          <label className="block text-[12px] font-medium text-text-secondary mb-1">
            自己採点 (0-10)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={10}
              step={0.5}
              value={selfScore}
              onChange={(e) => setValue('self_score', parseFloat(e.target.value))}
              className="flex-1 accent-primary"
            />
            <select
              value={selfScore}
              onChange={(e) => setValue('self_score', parseFloat(e.target.value))}
              className="w-16 px-2 py-1.5 border border-border-card rounded-lg text-sm text-center bg-surface"
            >
              {SCORE_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v.toFixed(1)}
                </option>
              ))}
            </select>
          </div>
          {errors.self_score && (
            <p className="text-[11px] text-red-500 mt-1">{errors.self_score.message}</p>
          )}
        </div>

        <div>
          <label className="block text-[12px] font-medium text-text-secondary mb-1">
            メモ (任意)
          </label>
          <textarea
            {...register('self_note')}
            rows={3}
            placeholder="振り返りや気づきを記録..."
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
