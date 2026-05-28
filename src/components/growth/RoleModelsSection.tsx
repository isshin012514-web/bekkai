import { useState } from 'react'
import { Plus, ChevronDown, ChevronUp } from 'lucide-react'
import type { RoleModel } from '@/lib/types'
import { ROLE_MODEL_COLORS } from '@/lib/types'

interface RoleModelsSectionProps {
  roleModels: RoleModel[]
  onSelect: (rm: RoleModel) => void
  onAdd: () => void
}

export function RoleModelsSection({ roleModels, onSelect, onAdd }: RoleModelsSectionProps) {
  const [open, setOpen] = useState(false)

  return (
    <section className="mx-4 mt-4 border border-border-card rounded-lg">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium">ロールモデル</h2>
          <span className="text-[11px] text-text-tertiary">{roleModels.length}人</span>
        </div>
        {open ? <ChevronUp size={16} className="text-text-tertiary" /> : <ChevronDown size={16} className="text-text-tertiary" />}
      </button>

      {open && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-3 flex-wrap">
            {roleModels.map((rm) => {
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
                  <span className="text-[11px] text-text-secondary max-w-[56px] truncate">{rm.name}</span>
                  {rm.admire_point && (
                    <span className="text-[10px] text-text-tertiary max-w-[72px] truncate">{rm.admire_point}</span>
                  )}
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
        </div>
      )}
    </section>
  )
}
