import { BookOpen, FileText, Video, Users } from 'lucide-react'
import type { Input, InputType } from '@/lib/types'
import { weeklyInputs } from '@/lib/utils'
import { weeklyOutputs } from '@/lib/utils'
import type { Output } from '@/lib/types'

const TYPE_ICONS: Record<InputType, typeof BookOpen> = {
  book: BookOpen,
  article: FileText,
  video: Video,
  dialogue: Users,
  other: FileText,
}

const TYPE_LABELS: Record<InputType, string> = {
  book: '本',
  article: '記事',
  video: '動画',
  dialogue: '対話',
  other: '他',
}

interface InputRecordSectionProps {
  inputs: Input[]
  outputs: Output[]
  onAddInput: () => void
}

export function InputRecordSection({ inputs, outputs, onAddInput }: InputRecordSectionProps) {
  const weekInputs = weeklyInputs(inputs)
  const weekOutputs = weeklyOutputs(outputs)

  const counts: Record<InputType, number> = {
    book: 0,
    article: 0,
    video: 0,
    dialogue: 0,
    other: 0,
  }
  for (const input of weekInputs) {
    counts[input.type]++
  }

  const mainTypes: InputType[] = ['book', 'article', 'video', 'dialogue']
  const outputCount = weekOutputs.length
  const inputCount = weekInputs.length
  const ratio = inputCount > 0 ? Math.round((outputCount / inputCount) * 100) : 0

  return (
    <section className="mx-4 mt-4 border border-border-card rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium">インプット記録</h2>
        <button onClick={onAddInput} className="text-[12px] text-primary hover:underline">
          + 記録
        </button>
      </div>
      <div className="flex justify-between mb-3">
        {mainTypes.map((type) => {
          const Icon = TYPE_ICONS[type]
          return (
            <div key={type} className="flex flex-col items-center gap-1">
              <Icon size={16} className="text-text-secondary" />
              <span className="text-lg font-medium">{counts[type]}</span>
              <span className="text-[11px] text-text-tertiary">{TYPE_LABELS[type]}</span>
            </div>
          )
        })}
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border-card">
        <span className="text-[12px] text-text-secondary">アウトプット比率</span>
        <span className="text-[12px] font-medium">
          {outputCount} / {inputCount} = {ratio}%
        </span>
      </div>
    </section>
  )
}
