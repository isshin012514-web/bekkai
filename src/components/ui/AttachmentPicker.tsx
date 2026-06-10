import { useRef } from 'react'
import { Camera, Paperclip, X, FileText } from 'lucide-react'
import type { Attachment } from '@/lib/types'
import { generateId, nowISO } from '@/lib/utils'

const MAX_SIZE_MB = 5

interface AttachmentPickerProps {
  attachments: Attachment[]
  onChange: (attachments: Attachment[]) => void
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function AttachmentPicker({ attachments, onChange }: AttachmentPickerProps) {
  const cameraRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const newAttachments: Attachment[] = []

    for (const file of Array.from(files)) {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        alert(`${file.name} は${MAX_SIZE_MB}MBを超えています。スキップします。`)
        continue
      }
      const data = await readAsDataURL(file)
      newAttachments.push({
        id: generateId(),
        name: file.name,
        mime: file.type,
        data,
        created_at: nowISO(),
      })
    }

    if (newAttachments.length > 0) {
      onChange([...attachments, ...newAttachments])
    }
  }

  const remove = (id: string) => {
    onChange(attachments.filter((a) => a.id !== id))
  }

  return (
    <div>
      <label className="block text-[12px] font-medium text-text-secondary mb-2">
        添付ファイル（写真・図・資料）
      </label>

      {/* ボタン行 */}
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border-card text-[12px] text-text-secondary hover:bg-surface-secondary transition-colors"
        >
          <Camera size={14} />
          カメラ
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border-card text-[12px] text-text-secondary hover:bg-surface-secondary transition-colors"
        >
          <Paperclip size={14} />
          写真・ファイル
        </button>
      </div>

      {/* 隠しinput */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*,application/pdf,.pdf,.png,.jpg,.jpeg,.gif,.webp"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* プレビュー */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((a) => (
            <div key={a.id} className="relative group">
              {a.mime.startsWith('image/') ? (
                <div className="w-20 h-20 rounded-lg overflow-hidden border border-border-card">
                  <img
                    src={a.data}
                    alt={a.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-lg border border-border-card bg-surface-secondary flex flex-col items-center justify-center gap-1 px-1">
                  <FileText size={20} className="text-text-tertiary" />
                  <span className="text-[9px] text-text-tertiary text-center leading-tight line-clamp-2 break-all">
                    {a.name}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => remove(a.id)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
