import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { inputSchema, type InputFormValues } from '@/lib/schemas'
import { INPUT_TYPE_LABELS } from '@/lib/types'
import type { InputType, Attachment } from '@/lib/types'
import { Modal } from '@/components/ui/Modal'
import { AttachmentPicker } from '@/components/ui/AttachmentPicker'
import { useGrowthStore } from '@/stores/growth-store'

interface AddInputModalProps {
  open: boolean
  onClose: () => void
  /** 開いたときにプリフィルする初期値（今日の問いの深掘りなど） */
  initial?: Partial<InputFormValues>
}

const INPUT_TYPES: InputType[] = ['book', 'article', 'video', 'dialogue', 'other']

export function AddInputModal({ open, onClose, initial }: AddInputModalProps) {
  const addInput = useGrowthStore((s) => s.addInput)
  const [attachments, setAttachments] = useState<Attachment[]>([])

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InputFormValues>({
    resolver: zodResolver(inputSchema),
    defaultValues: {
      type: 'book',
      title: '',
      learning: '',
    },
  })

  const selectedType = watch('type')

  // 開いたときに初期値をプリフィル（深掘り用）
  useEffect(() => {
    if (open) reset({ type: 'book', title: '', learning: '', ...(initial ?? {}) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const onSubmit = (data: InputFormValues) => {
    addInput({ ...data, attachments })
    reset()
    setAttachments([])
    onClose()
  }

  const handleClose = () => {
    reset()
    setAttachments([])
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="インプット記録">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-[12px] font-medium text-text-secondary mb-1">
            種別
          </label>
          <div className="flex flex-wrap gap-2">
            {INPUT_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setValue('type', type)}
                className={`px-3 py-1.5 rounded-lg text-[12px] border transition-colors ${
                  selectedType === type
                    ? 'bg-primary text-white border-primary'
                    : 'border-border-card hover:bg-surface-secondary'
                }`}
              >
                {INPUT_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-medium text-text-secondary mb-1">
            タイトル
          </label>
          <input
            {...register('title')}
            placeholder="何をインプットしましたか？"
            className="w-full px-3 py-2.5 border border-border-card rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-surface"
          />
          {errors.title && (
            <p className="text-[11px] text-red-500 mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-[12px] font-medium text-text-secondary mb-1">
            学び・メモ (任意)
          </label>
          <textarea
            {...register('learning')}
            rows={3}
            placeholder="どんな学びがありましたか？"
            className="w-full px-3 py-2.5 border border-border-card rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none bg-surface"
          />
        </div>

        <AttachmentPicker attachments={attachments} onChange={setAttachments} />

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
