import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { outputSchema, type OutputFormValues } from '@/lib/schemas'
import { OUTPUT_TYPE_LABELS } from '@/lib/types'
import type { OutputType, Attachment, Input } from '@/lib/types'
import { Modal } from '@/components/ui/Modal'
import { AttachmentPicker } from '@/components/ui/AttachmentPicker'
import { useGrowthStore } from '@/stores/growth-store'
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react'

interface AddOutputModalProps {
  open: boolean
  onClose: () => void
  initialLinkedInputId?: string | null
}

const OUTPUT_TYPES: OutputType[] = ['article', 'speech', 'product', 'post', 'other']

export function AddOutputModal({ open, onClose, initialLinkedInputId }: AddOutputModalProps) {
  const addOutput = useGrowthStore((s) => s.addOutput)
  const inputs = useGrowthStore((s) => s.inputs)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  // 「元になったインプット」単一選択（メイン）
  const [baseInputId, setBaseInputId] = useState<string | null>(null)
  const [inputListOpen, setInputListOpen] = useState(false)

  const baseInput: Input | undefined = inputs.find((i) => i.id === baseInputId)

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

  // initialLinkedInputId が渡されたら自動でセット
  useEffect(() => {
    if (open && initialLinkedInputId) {
      setBaseInputId(initialLinkedInputId)
      setValue('linked_input_ids', [initialLinkedInputId])
      setInputListOpen(false)
    }
  }, [open, initialLinkedInputId, setValue])

  // baseInput が変わったら linked_input_ids も更新
  const selectBaseInput = (input: Input) => {
    setBaseInputId(input.id)
    setValue('linked_input_ids', [input.id])
    setInputListOpen(false)
  }

  const clearBaseInput = () => {
    setBaseInputId(null)
    setValue('linked_input_ids', [])
  }

  const hasVisuals = watch('has_visuals')

  const onSubmit = (data: OutputFormValues) => {
    addOutput({ ...data, self_score: 0, attachments })
    reset()
    setAttachments([])
    setBaseInputId(null)
    onClose()
  }

  const handleClose = () => {
    reset()
    setAttachments([])
    setBaseInputId(null)
    setInputListOpen(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="アウトプットを記録">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* ── インプットを選んで素材にする ── */}
        <div>
          <label className="block text-[12px] font-medium text-text-secondary mb-2">
            元になったインプット（選ぶと内容を参照できます）
          </label>

          {/* 未選択：リスト展開ボタン */}
          {!baseInput ? (
            <button
              type="button"
              onClick={() => setInputListOpen((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-2.5 border border-border-card rounded-lg text-sm text-text-secondary hover:bg-surface-secondary transition-colors"
            >
              <span className="flex items-center gap-2">
                <BookOpen size={14} />
                インプットを選択…
              </span>
              {inputListOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          ) : (
            /* 選択済み：インプット内容カード */
            <div className="border border-primary/40 bg-primary-bg rounded-lg p-3 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-text-primary">{baseInput.title}</p>
                <button
                  type="button"
                  onClick={clearBaseInput}
                  className="text-[11px] text-text-tertiary hover:text-text-secondary shrink-0 mt-0.5"
                >
                  変更
                </button>
              </div>
              {baseInput.learning && (
                <div className="bg-surface rounded-lg p-2.5">
                  <p className="text-[10px] text-primary font-medium mb-1">インプット内容（参考）</p>
                  <p className="text-[12px] text-text-secondary leading-relaxed whitespace-pre-wrap">
                    {baseInput.learning}
                  </p>
                </div>
              )}
              {!baseInput.learning && (
                <p className="text-[11px] text-text-tertiary">（学び・メモなし）</p>
              )}
            </div>
          )}

          {/* インプット一覧 */}
          {inputListOpen && !baseInput && (
            <div className="mt-1.5 border border-border-card rounded-lg overflow-hidden max-h-52 overflow-y-auto">
              {inputs.length === 0 ? (
                <p className="text-sm text-text-tertiary text-center py-4">インプット記録がありません</p>
              ) : (
                inputs.map((input) => (
                  <button
                    key={input.id}
                    type="button"
                    onClick={() => selectBaseInput(input)}
                    className="w-full text-left px-3 py-2.5 hover:bg-surface-secondary transition-colors border-b border-border-card last:border-b-0"
                  >
                    <p className="text-sm text-text-primary">{input.title}</p>
                    {input.learning && (
                      <p className="text-[11px] text-text-tertiary mt-0.5 line-clamp-1">
                        {input.learning}
                      </p>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* ── アウトプットのタイトル ── */}
        <div>
          <label className="block text-[12px] font-medium text-text-secondary mb-1">
            アウトプットのタイトル
          </label>
          <input
            {...register('title')}
            placeholder={baseInput ? `例：${baseInput.title}を〇〇に活かした話` : '何をアウトプットしましたか？'}
            className="w-full px-3 py-2.5 border border-border-card rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-surface"
          />
          {errors.title && (
            <p className="text-[11px] text-red-500 mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* ── アウトプット内容・気づき ── */}
        <div>
          <label className="block text-[12px] font-medium text-text-secondary mb-1">
            {baseInput ? 'インプットを活かしてどんなアウトプットをしたか' : 'アウトプット内容・気づき'}
          </label>
          <textarea
            {...register('memo')}
            rows={4}
            placeholder={
              baseInput && baseInput.learning
                ? `【インプット内容】\n${baseInput.learning}\n\n↓ これをもとに…`
                : 'アウトプットした内容や気づきを書きましょう'
            }
            className="w-full px-3 py-2.5 border border-border-card rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none bg-surface"
          />
        </div>

        {/* ── 種別 ── */}
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

        {/* ── 誰に向けて ── */}
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

        {/* ── 聴衆の反応 ── */}
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

        {/* ── 図式・資料トグル ── */}
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

        {/* ── 添付ファイル ── */}
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
