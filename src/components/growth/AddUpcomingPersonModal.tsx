import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { upcomingPersonSchema, type UpcomingPersonFormValues } from '@/lib/schemas'
import { Modal } from '@/components/ui/Modal'
import { useGrowthStore } from '@/stores/growth-store'

interface AddUpcomingPersonModalProps {
  open: boolean
  onClose: () => void
}

export function AddUpcomingPersonModal({ open, onClose }: AddUpcomingPersonModalProps) {
  const addUpcomingPerson = useGrowthStore((s) => s.addUpcomingPerson)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpcomingPersonFormValues>({
    resolver: zodResolver(upcomingPersonSchema),
    defaultValues: {
      name: '',
      meeting_date: '',
    },
  })

  const onSubmit = (data: UpcomingPersonFormValues) => {
    addUpcomingPerson({
      name: data.name,
      meeting_date: data.meeting_date || undefined,
      questions: [],
    })
    reset()
    onClose()
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="会いたい人を追加">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-[12px] font-medium text-text-secondary mb-1">
            名前
          </label>
          <input
            {...register('name')}
            placeholder="会いたい人の名前"
            className="w-full px-3 py-2.5 border border-border-card rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-surface"
          />
          {errors.name && (
            <p className="text-[11px] text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-[12px] font-medium text-text-secondary mb-1">
            予定日 (任意)
          </label>
          <input
            type="date"
            {...register('meeting_date')}
            className="w-full px-3 py-2.5 border border-border-card rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-surface"
          />
        </div>

        <div className="bg-primary-bg rounded-lg p-3">
          <p className="text-[12px] text-primary">
            追加後、質問リストから10個の質問を準備しましょう。
          </p>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          追加する
        </button>
      </form>
    </Modal>
  )
}
