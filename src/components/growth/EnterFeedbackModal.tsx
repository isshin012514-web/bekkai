import { useState } from 'react'
import { OUTPUT_TYPE_LABELS, SELF_SCORE_CRITERIA } from '@/lib/types'
import type { Output } from '@/lib/types'
import { Modal } from '@/components/ui/Modal'
import { useGrowthStore } from '@/stores/growth-store'
import { nowISO } from '@/lib/utils'
import { ClipboardPaste, X } from 'lucide-react'

interface EnterFeedbackModalProps {
  open: boolean
  onClose: () => void
}

const DEFAULT_DETAIL = {
  originality: 5,
  communication: 5,
  practicality: 5,
  audience_response: 5,
  completeness: 5,
}

// 採点依頼フォーマットのテキストからスコアを自動抽出
function parseFeedbackText(text: string): {
  totalScore: number | null
  detail: typeof DEFAULT_DETAIL | null
  note: string
} {
  const lines = text.split('\n').map((l) => l.trim())

  // 総合スコア: 数字（小数含む）を探す
  // 「総合スコア: 7.5」「総合: 8」「8/10」「8点」など
  let totalScore: number | null = null
  const totalPatterns = [
    /総合[^0-9]*([0-9]+(?:\.[0-9]+)?)/,
    /([0-9]+(?:\.[0-9]+)?)\s*[\/／]\s*10/,
    /スコア[^0-9]*([0-9]+(?:\.[0-9]+)?)/,
  ]
  for (const line of lines) {
    for (const p of totalPatterns) {
      const m = line.match(p)
      if (m) {
        const v = parseFloat(m[1])
        if (v >= 0 && v <= 10) { totalScore = v; break }
      }
    }
    if (totalScore !== null) break
  }

  // 観点別: 「独自性: 7.5」「伝達力　8」など
  const keyMap: Record<string, keyof typeof DEFAULT_DETAIL> = {
    '独自性': 'originality',
    '伝達力': 'communication',
    '実用性': 'practicality',
    '聴衆': 'audience_response',
    '完成度': 'completeness',
  }
  const detail = { ...DEFAULT_DETAIL }
  let foundAny = false
  for (const line of lines) {
    for (const [ja, key] of Object.entries(keyMap)) {
      if (line.includes(ja)) {
        const m = line.match(/([0-9]+(?:\.[0-9]+)?)/)
        if (m) {
          const v = parseFloat(m[1])
          if (v >= 0 && v <= 10) { detail[key] = v; foundAny = true }
        }
      }
    }
  }

  // コメント: 「コメント」「一言」以降の行、またはスコア行以外のテキスト行
  const noteLines: string[] = []
  let inComment = false
  for (const line of lines) {
    if (/コメント|一言|感想|メモ/.test(line)) { inComment = true; continue }
    if (inComment && line) noteLines.push(line)
    // スコア数値だけの行は除外、それ以外の文章行を拾う
    if (!inComment && line && !/^[0-9.\/]+$/.test(line) && !/採点|スコア|依頼|観点|お願い|■|【|】/.test(line) && line.length > 3) {
      noteLines.push(line)
    }
  }

  return {
    totalScore,
    detail: foundAny ? detail : null,
    note: noteLines.slice(0, 3).join('\n'),
  }
}

export function EnterFeedbackModal({ open, onClose }: EnterFeedbackModalProps) {
  const { outputs, updateOutput } = useGrowthStore()
  const [selectedId, setSelectedId] = useState('')
  const [peerScore, setPeerScore] = useState(5)
  const [detail, setDetail] = useState({ ...DEFAULT_DETAIL })
  const [peerNote, setPeerNote] = useState('')
  const [saved, setSaved] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [pasteMode, setPasteMode] = useState(false)

  const targets = outputs.filter((o) => o.self_score > 0 && o.peer_score == null)
  const selected = outputs.find((o) => o.id === selectedId)

  const setDetailKey = (key: keyof typeof DEFAULT_DETAIL, val: number) => {
    setDetail((d) => ({ ...d, [key]: val }))
  }

  const handleSelect = (o: Output) => {
    setSelectedId(o.id)
    setSaved(false)
  }

  // ペーストテキストを解析して自動入力
  const handleParsePaste = () => {
    const result = parseFeedbackText(pasteText)
    if (result.totalScore !== null) setPeerScore(result.totalScore)
    if (result.detail) setDetail(result.detail)
    if (result.note) setPeerNote(result.note)
    setPasteMode(false)
    setPasteText('')
  }

  const handleSubmit = () => {
    if (!selectedId) return
    updateOutput(selectedId, {
      peer_score: peerScore,
      peer_score_detail: { ...detail },
      peer_note: peerNote || undefined,
      peer_scored_at: nowISO(),
    })
    setSaved(true)
  }

  const handleClose = () => {
    setSelectedId('')
    setPeerScore(5)
    setDetail({ ...DEFAULT_DETAIL })
    setPeerNote('')
    setSaved(false)
    setPasteMode(false)
    setPasteText('')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="フィードバックを入力">
      <div className="space-y-5">
        {/* アウトプット選択 */}
        <div>
          <label className="block text-[12px] font-medium text-text-secondary mb-2">
            評価されたアウトプットを選択
          </label>
          {targets.length === 0 ? (
            <p className="text-sm text-text-tertiary text-center py-4">
              自己採点済みのアウトプットがありません
            </p>
          ) : (
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {targets.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => handleSelect(o)}
                  className={`w-full text-left rounded-lg p-2.5 border transition-colors ${
                    selectedId === o.id
                      ? 'border-primary bg-primary-bg'
                      : 'border-border-card hover:bg-surface-secondary'
                  }`}
                >
                  <p className="text-sm font-medium">{o.title}</p>
                  <p className="text-[11px] text-text-tertiary mt-0.5">
                    {OUTPUT_TYPE_LABELS[o.type]}　自己 {o.self_score.toFixed(1)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {selected && !saved && (
          <>
            {/* ── テキスト自動入力 ── */}
            <div className="border border-border-card rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setPasteMode((v) => !v)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-surface-secondary transition-colors"
              >
                <ClipboardPaste size={14} className="text-primary" />
                <span className="text-[12px] font-medium text-primary">採点結果テキストを貼り付けて自動入力</span>
              </button>
              {pasteMode && (
                <div className="border-t border-border-card p-3 space-y-2 bg-surface-secondary">
                  <p className="text-[11px] text-text-tertiary">
                    採点依頼のフォーマットで返ってきたテキストをそのまま貼り付けてください。スコアを自動で読み取ります。
                  </p>
                  <textarea
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    rows={5}
                    placeholder="採点結果のテキストをここに貼り付け…"
                    className="w-full px-3 py-2 border border-border-card rounded-lg text-[12px] focus:outline-none focus:border-primary resize-none bg-surface"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleParsePaste}
                      disabled={!pasteText.trim()}
                      className="flex-1 py-2 bg-primary text-white rounded-lg text-[12px] font-medium hover:opacity-90 disabled:opacity-40"
                    >
                      自動入力する
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPasteMode(false); setPasteText('') }}
                      className="px-3 py-2 border border-border-card rounded-lg text-[12px] text-text-secondary hover:bg-surface"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 総合スコア */}
            <div>
              <label className="block text-[12px] font-medium text-text-secondary mb-2">
                総合スコア: <span className="text-primary font-bold text-base">{peerScore.toFixed(1)}</span>
              </label>
              <input
                type="range" min={0} max={10} step={0.5} value={peerScore}
                onChange={(e) => setPeerScore(parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[10px] text-text-tertiary mt-0.5">
                <span>0</span><span>5</span><span>10</span>
              </div>
            </div>

            {/* 観点別スコア */}
            <div>
              <label className="block text-[12px] font-medium text-text-secondary mb-2">観点別スコア</label>
              <div className="space-y-3">
                {SELF_SCORE_CRITERIA.map((c) => (
                  <div key={c.key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] text-text-secondary">{c.label}</span>
                      <span className="text-[12px] font-medium text-primary">{detail[c.key].toFixed(1)}</span>
                    </div>
                    <input
                      type="range" min={0} max={10} step={0.5} value={detail[c.key]}
                      onChange={(e) => setDetailKey(c.key, parseFloat(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* コメント */}
            <div>
              <label className="block text-[12px] font-medium text-text-secondary mb-1">
                コメント (任意)
              </label>
              <textarea
                value={peerNote}
                onChange={(e) => setPeerNote(e.target.value)}
                rows={3}
                placeholder="もらったフィードバックのコメント…"
                className="w-full px-3 py-2.5 border border-border-card rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none bg-surface"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              フィードバックを保存
            </button>
          </>
        )}

        {saved && (
          <div className="text-center py-4">
            <p className="text-2xl mb-2">✅</p>
            <p className="text-sm font-medium text-text-primary">保存しました</p>
            <p className="text-[12px] text-text-tertiary mt-1">記録セクションで確認できます</p>
            <button onClick={handleClose} className="mt-4 px-6 py-2 bg-surface-secondary text-text-secondary rounded-lg text-sm hover:bg-surface transition-colors">
              閉じる
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}
