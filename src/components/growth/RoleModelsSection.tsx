import { Plus } from 'lucide-react'
import type { RoleModel } from '@/lib/types'
import { ROLE_MODEL_COLORS } from '@/lib/types'

interface RoleModelsSectionProps {
  roleModels: RoleModel[]
  onSelect: (rm: RoleModel) => void
  onAdd: () => void
}

export function RoleModelsSection({ roleModels, onSelect, onAdd }: RoleModelsSectionProps) {
  return (
    <section className="px-4 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium">ロールモデル</h2>
        <button onClick={onAdd} className="text-[12px] text-primary hover:underline">
          + 追加
        </button>
      </div>
      <div className="flex items-center gap-3">
        {roleModels.slice(0, 4).map((rm) => {
          const color = ROLE_MODEL_COLORS[rm.color_key]
          return (
            <button
              key={rm.id}
              onClick={() => onSelect(rm)}
              className="flex flex-col items-center gap-1"
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-[11px] font-medium"
                style={{ backgroundColor: color.bg, color: color.text }}
              >
                {rm.initials}
              </div>
              <span className="text-[11px] text-text-secondary">{rm.name}</span>
            </button>
          )
        })}
        <button onClick={onAdd} className="flex flex-col items-center gap-1">
          <div className="w-11 h-11 rounded-full border border-border-card flex items-center justify-center">
            <Plus size={16} className="text-text-tertiary" />
          </div>
          <span className="text-[11px] text-text-tertiary">追加</span>
        </button>
      </div>
    </section>
  )
}
