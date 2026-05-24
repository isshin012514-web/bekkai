import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { roleModelSchema, type RoleModelFormValues } from '@/lib/schemas'
import { ROLE_MODEL_COLORS, type RoleModelColor } from '@/lib/types'
import { Modal } from '@/components/ui/Modal'
import { useGrowthStore } from '@/stores/growth-store'

interface AddRoleModelModalProps {
  open: boolean
  onClose: () => void
}

const COLOR_KEYS: RoleModelColor[] = ['purple', 'teal', 'coral', 'amber', 'blue']

export function AddRoleModelModal({ open, onClose }: AddRoleModelModalProps) {
  const addRoleModel = useGrowthStore((s) => s.addRoleModel)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RoleModelFormValues>({
    resolver: zodResolver(roleModelSchema),
    defaultValues: {
      name: '',
      initials: '',
      color_key: 'purple',
    },
  })

  const selectedColor = watch('color_key')

  const onSubmit = (data: RoleModelFormValues) => {
    addRoleModel({ ...data, learning_notes: [] })
    reset()
    onClose()
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="ロールモデル追加">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-[12px] font-medium text-text-secondary mb-1">
            名前
          </label>
          <input
            {...register('name')}
            placeholder="ロールモデルの名前"
            className="w-full px-3 py-2.5 border border-border-card rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-surface"
          />
          {errors.name && (
            <p className="text-[11px] text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-[12px] font-medium text-text-secondary mb-1">
            頭文字 (アバター表示用)
          </label>
          <input
            {...register('initials')}
            placeholder="例: 平尾、AS"
            maxLength={4}
            className="w-full px-3 py-2.5 border border-border-card rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-surface"
          />
          {errors.initials && (
            <p className="text-[11px] text-red-500 mt-1">{errors.initials.message}</p>
          )}
        </div>

        <div>
          <label className="block text-[12px] font-medium text-text-secondary mb-1">
            カラー
          </label>
          <div className="flex gap-3">
            {COLOR_KEYS.map((key) => {
              const color = ROLE_MODEL_COLORS[key]
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setValue('color_key', key)}
                  className={`w-10 h-10 rounded-full transition-all ${selectedColor === key ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                  style={{ backgroundColor: color.bg }}
                />
              )
            })}
          </div>
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
