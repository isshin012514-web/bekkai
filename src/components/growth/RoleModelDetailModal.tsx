import { useState } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Plus, Trash2 } from 'lucide-react'
import type { RoleModel } from '@/lib/types'
import { ROLE_MODEL_COLORS } from '@/lib/types'
import { Modal } from '@/components/ui/Modal'
import { useGrowthStore } from '@/stores/growth-store'

interface RoleModelDetailModalProps {
  open: boolean
  onClose: () => void
  roleModel: RoleModel | null
}

export function RoleModelDetailModal({ open, onClose, roleModel }: RoleModelDetailModalProps) {
  const addLearningNote = useGrowthStore((s) => s.addLearningNote)
  const deleteRoleModel = useGrowthStore((s) => s.deleteRoleModel)
  const [noteText, setNoteText] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!roleModel) return null

  const color = ROLE_MODEL_COLORS[roleModel.color_key]

  const handleAddNote = () => {
    if (!noteText.trim()) return
    addLearningNote(roleModel.id, noteText.trim())
    setNoteText('')
  }

  return (
    <Modal open={open} onClose={onClose} title="ロールモデル詳細">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-sm font-medium"
            style={{ backgroundColor: color.bg, color: color.text }}
          >
            {roleModel.initials}
          </div>
          <div>
            <h3 className="text-base font-medium">{roleModel.name}</h3>
            <p className="text-[11px] text-text-tertiary">
              追加: {format(new Date(roleModel.created_at), 'yyyy/MM/dd', { locale: ja })}
            </p>
          </div>
        </div>

        <div>
          <p className="text-[12px] font-medium text-text-secondary mb-2">学びメモ</p>
          <div className="flex gap-2 mb-3">
            <input
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="この人から学んだこと..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddNote()
                }
              }}
              className="flex-1 px-3 py-2 border border-border-card rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-surface"
            />
            <button
              type="button"
              onClick={handleAddNote}
              className="px-3 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus size={16} />
            </button>
          </div>
          {roleModel.learning_notes.length === 0 ? (
            <p className="text-sm text-text-tertiary text-center py-4">
              まだメモがありません
            </p>
          ) : (
            <div className="space-y-2">
              {roleModel.learning_notes.map((note, i) => (
                <div key={i} className="bg-surface-secondary rounded-lg p-3">
                  <p className="text-sm">{note.text}</p>
                  <p className="text-[11px] text-text-tertiary mt-1">
                    {format(new Date(note.at), 'M/d HH:mm', { locale: ja })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            if (!confirmDelete) { setConfirmDelete(true); return }
            deleteRoleModel(roleModel.id)
            setConfirmDelete(false)
            onClose()
          }}
          className={`w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            confirmDelete
              ? 'bg-red-500 text-white'
              : 'border border-border-card text-text-secondary hover:text-red-500 hover:border-red-300'
          }`}
        >
          <Trash2 size={14} />
          {confirmDelete ? '本当に削除する' : '削除'}
        </button>
      </div>
    </Modal>
  )
}
