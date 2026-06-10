import { useState } from 'react'
import Icon from './Icon'
import { useData } from '../DataContext'
import { useEntriesStore } from '../stores/entries-store'
import { scoreSetKeyForCell } from '../data'

// 自分セルの構造化入力で使う選択肢（CellDetail と揃える）
const CANT_TYPES = ['学ぶ', '仕組み化', '任せる']
const FROM_OPTIONS = ['上司', '先輩', '後輩', '同期', '取引先', '友人', 'その他']
const TONE_OPTIONS = [
  { key: 'success', label: '良い' },
  { key: 'info', label: '中立' },
  { key: 'warning', label: '課題' },
  { key: 'accent', label: '希少' },
]

const OUTPUT_TYPE_LABELS = {
  article: '記事',
  speech: '発言',
  product: '成果物',
  post: '投稿',
  other: 'その他',
}

// 確信度（検証ステータス）— 仮説→検証→確信 の発見力ループを項目ごとに追跡
const STATUS_OPTIONS = [
  { key: 'untested', label: '未検証', color: 'text-muted' },
  { key: 'testing', label: '検証中', color: 'warning' },
  { key: 'confident', label: '確信', color: 'success' },
  { key: 'rethink', label: '要再考', color: 'danger' },
]

const MAX_ATTACH_MB = 5

const genId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`

// ファイルを base64 dataURL に変換（bekkai AttachmentPicker 準拠）
const fileToAttachment = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () =>
      resolve({
        id: genId(),
        name: file.name,
        mime: file.type || 'application/octet-stream',
        data: reader.result,
        created_at: new Date().toISOString(),
      })
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

// 観点セットから初期ドラフト（各観点5点）を作る
const defaultDetail = (criteria) =>
  criteria.reduce((acc, c) => ((acc[c.key] = 5), acc), {})

// 平均を0.5刻みに丸める（bekkai の overallScore 準拠）
const calcOverall = (d, criteria) => {
  const sum = criteria.reduce((acc, c) => acc + (d[c.key] ?? 0), 0)
  return Math.round((sum / criteria.length) * 2) / 2
}

// 既存項目から編集ドラフトを組み立てる（セル種別ごとのフィールド）
const buildEditDraft = (entry, moduleId, cellId) => {
  const o = typeof entry === 'string' ? { text: entry } : { ...entry }
  if (moduleId === 'self') {
    switch (cellId) {
      case 'strength': return { text: o.text ?? '', level: o.level ?? 3, detail: o.detail ?? '' }
      case 'weakness': return { text: o.text ?? '', level: o.level ?? 3, detail: o.detail ?? '', fix: o.fix ?? '' }
      case 'cant': return { text: o.text ?? '', type: o.type ?? '学ぶ', action: o.action ?? '' }
      case 'others': return { from: o.from ?? '先輩', text: o.text ?? '' }
      case 'compare': return { label: o.label ?? '', value: o.value ?? '', color: o.color ?? 'info' }
      default: return { text: o.text ?? '' }
    }
  }
  return { text: o.text ?? '' }
}

function formatDateTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export default function EntryDetailSheet({ moduleId, cellId, index, color = 'accent', onClose, onToast }) {
  const { BEKKAI_OUTPUTS, SCORE_CRITERIA, SCORE_CRITERIA_SETS } = useData()
  const entryKey = `${moduleId}-${cellId}`
  const entry = useEntriesStore((s) => (s.entries[entryKey] ?? [])[index])
  const updateEntryAt = useEntriesStore((s) => s.updateEntryAt)

  // セル種別に応じた採点観点（既存スコアは保存時の観点セットを尊重）
  const sets = SCORE_CRITERIA_SETS ?? {}
  const existingSetKey = typeof entry === 'string' ? null : entry?.score?.criteria_set
  const scoreSetKey = existingSetKey || scoreSetKeyForCell(moduleId, cellId)
  const criteria = sets[scoreSetKey] ?? SCORE_CRITERIA

  const text =
    typeof entry === 'string'
      ? entry
      : entry?.text ||
        (entry?.label ? `${entry.label}${entry?.value ? '：' + entry.value : ''}` : '') ||
        entry?.from ||
        '項目'
  const created = typeof entry === 'string' ? null : entry?.created_at
  const updated = typeof entry === 'string' ? null : entry?.updated_at
  const status = typeof entry === 'string' ? '' : entry?.status ?? ''
  const detail = typeof entry === 'string' ? '' : entry?.detail ?? ''
  const reasonVal = typeof entry === 'string' ? '' : entry?.reason ?? ''
  const evidence = (typeof entry === 'string' ? null : entry?.evidence) ?? []
  const feedback = (typeof entry === 'string' ? null : entry?.feedback) ?? []
  const score = typeof entry === 'string' ? null : entry?.score ?? null

  const [note, setNote] = useState(detail)
  const [reason, setReason] = useState(reasonVal)
  const [showPicker, setShowPicker] = useState(false)
  const [scoring, setScoring] = useState(false)
  const [draft, setDraft] = useState(score?.detail ? { ...score.detail } : defaultDetail(criteria))
  // 既存項目の編集（本文・構造化フィールド）
  const [editing, setEditing] = useState(false)
  const [editDraft, setEditDraft] = useState(null)
  const [good, setGood] = useState(score?.good ?? '')
  const [improve, setImprove] = useState(score?.improve ?? '')
  // フィードバック入力（bekkai の他者評価 peer_score/peer_note 準拠）
  const [showFb, setShowFb] = useState(false)
  const [fbFrom, setFbFrom] = useState('')
  const [fbComment, setFbComment] = useState('')
  const [fbUseScore, setFbUseScore] = useState(false)
  const [fbScore, setFbScore] = useState(5)

  if (entry === undefined) return null

  const accent = `var(--color-${color})`
  const linkedIds = new Set(evidence.map((e) => e.id))
  const available = (BEKKAI_OUTPUTS ?? []).filter((o) => !linkedIds.has(o.id))
  const overall = calcOverall(draft, criteria)
  // 表示用の観点セット（保存済みスコアはその時の観点を尊重）
  const displayCriteria = score?.criteria_set ? sets[score.criteria_set] ?? criteria : criteria

  const startEdit = () => {
    setEditDraft(buildEditDraft(entry, moduleId, cellId))
    setEditing(true)
  }
  const saveEdit = () => {
    if (!editDraft) return
    const patch = {}
    for (const [k, v] of Object.entries(editDraft)) {
      patch[k] = typeof v === 'string' ? v.trim() : v
    }
    // 必須テキストが空なら保存しない（compare は label/value 必須）
    if (cellId === 'compare') {
      if (!patch.label || !patch.value) return
    } else if (!patch.text) {
      return
    }
    updateEntryAt(moduleId, cellId, index, patch)
    setEditing(false)
    onToast?.('項目を更新しました')
  }

  const saveNote = () => {
    if (note === detail) return
    updateEntryAt(moduleId, cellId, index, { detail: note })
    onToast?.('メモを保存しました')
  }

  const saveReason = () => {
    if (reason === reasonVal) return
    updateEntryAt(moduleId, cellId, index, { reason: reason.trim() || undefined })
    onToast?.('仮説・根拠を保存しました')
  }

  const setStatusVal = (k) => {
    updateEntryAt(moduleId, cellId, index, { status: status === k ? undefined : k })
    onToast?.('確信度を更新しました')
  }

  const addEvidence = (o) => {
    const snap = { id: o.id, kind: 'output', title: o.title, type: o.type, self_score: o.self_score }
    updateEntryAt(moduleId, cellId, index, { evidence: [...evidence, snap] })
    setShowPicker(false)
    onToast?.('根拠を追加しました')
  }

  const addNoteEvidence = () => {
    const snap = { id: genId(), kind: 'note', memo: '', attachments: [] }
    updateEntryAt(moduleId, cellId, index, { evidence: [...evidence, snap] })
    onToast?.('根拠を追加しました')
  }

  const updateEvidence = (id, patch) => {
    updateEntryAt(moduleId, cellId, index, {
      evidence: evidence.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    })
  }

  const removeEvidence = (id) => {
    updateEntryAt(moduleId, cellId, index, { evidence: evidence.filter((e) => e.id !== id) })
    onToast?.('根拠を外しました')
  }

  const addAttachments = async (id, fileList) => {
    const files = Array.from(fileList || [])
    if (files.length === 0) return
    const tooBig = files.find((f) => f.size > MAX_ATTACH_MB * 1024 * 1024)
    if (tooBig) {
      onToast?.(`${MAX_ATTACH_MB}MB以下のファイルにしてください`)
      return
    }
    const ev = evidence.find((e) => e.id === id)
    if (!ev) return
    const added = await Promise.all(files.map(fileToAttachment))
    updateEvidence(id, { attachments: [...(ev.attachments ?? []), ...added] })
    onToast?.('添付を追加しました')
  }

  const removeAttachment = (id, attId) => {
    const ev = evidence.find((e) => e.id === id)
    if (!ev) return
    updateEvidence(id, { attachments: (ev.attachments ?? []).filter((a) => a.id !== attId) })
  }

  const saveScore = () => {
    updateEntryAt(moduleId, cellId, index, {
      score: {
        overall,
        detail: { ...draft },
        criteria_set: scoreSetKey,
        good: good || undefined,
        improve: improve || undefined,
        scored_at: new Date().toISOString(),
      },
    })
    setScoring(false)
    onToast?.('採点を保存しました')
  }

  const addFeedback = () => {
    const item = {
      id: genId(),
      from: fbFrom.trim() || undefined,
      comment: fbComment.trim() || undefined,
      created_at: new Date().toISOString(),
    }
    if (fbUseScore) item.score = fbScore
    updateEntryAt(moduleId, cellId, index, { feedback: [...feedback, item] })
    setShowFb(false)
    setFbFrom('')
    setFbComment('')
    setFbUseScore(false)
    setFbScore(5)
    onToast?.('フィードバックを記録しました')
  }

  const removeFeedback = (id) => {
    updateEntryAt(moduleId, cellId, index, { feedback: feedback.filter((f) => f.id !== id) })
    onToast?.('フィードバックを削除しました')
  }

  const copyRequest = async () => {
    const lines = [
      '【意見をください】',
      `テーマ: ${text}`,
      reason ? `私の見立て: ${reason}` : null,
      '',
      'これについて、あなたの率直な意見・反応を教えてください。',
      '（任意で 0〜10 点の評価もいただけると助かります）',
    ].filter((l) => l !== null)
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      onToast?.('依頼文をコピーしました')
    } catch {
      onToast?.('コピーできませんでした')
    }
  }

  const removeScore = () => {
    updateEntryAt(moduleId, cellId, index, { score: undefined })
    setDraft(defaultDetail(criteria))
    setGood('')
    setImprove('')
    onToast?.('採点を削除しました')
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      {/* 背景 */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm animate-fade" onClick={onClose} />

      {/* シート本体 */}
      <div className="animate-sheet relative w-full max-w-lg max-h-[88vh] overflow-y-auto bg-surface border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl">
        {/* ハンドル + ヘッダー */}
        <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur px-5 pt-3 pb-3 border-b border-border">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border-light sm:hidden" />
          <div className="flex items-start gap-3">
            <span
              className="mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{ background: `color-mix(in srgb, ${accent} 18%, transparent)` }}
            >
              <Icon name={moduleId} size={14} style={{ color: accent }} />
            </span>
            <h3 className="flex-1 text-sm font-bold leading-relaxed">{text}</h3>
            <button
              onClick={() => (editing ? setEditing(false) : startEdit())}
              aria-label="編集"
              className="shrink-0 p-1 transition-colors"
              style={{ color: editing ? accent : 'var(--color-text-muted)' }}
            >
              <Icon name="pencil" size={16} />
            </button>
            <button onClick={onClose} aria-label="閉じる" className="shrink-0 p-1 text-text-muted hover:text-text transition-colors">
              <Icon name="plus" size={18} className="rotate-45" />
            </button>
          </div>
          {created && (
            <p className="text-[10px] text-text-muted mt-2 pl-10">
              {formatDateTime(created)}
              {updated && updated !== created && <span className="ml-2">· 更新 {formatDateTime(updated)}</span>}
            </p>
          )}
        </div>

        <div className="px-5 py-5 space-y-6">
          {/* 項目を編集（本文・構造化フィールド） */}
          {editing && editDraft && (
            <section
              className="rounded-xl border p-4 space-y-3"
              style={{ borderColor: `color-mix(in srgb, ${accent} 35%, transparent)`, background: `color-mix(in srgb, ${accent} 5%, transparent)` }}
            >
              <div className="flex items-center gap-1.5">
                <Icon name="pencil" size={13} style={{ color: accent }} />
                <h4 className="text-[11px] font-medium" style={{ color: accent }}>項目を編集</h4>
              </div>

              {/* 他者視点: 誰から */}
              {moduleId === 'self' && cellId === 'others' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] text-text-muted">誰から</label>
                  <div className="flex flex-wrap gap-1.5">
                    {FROM_OPTIONS.map((opt) => {
                      const active = editDraft.from === opt
                      return (
                        <button key={opt} onClick={() => setEditDraft((p) => ({ ...p, from: opt }))}
                          className="text-[11px] px-3 py-1.5 rounded-lg border transition-all"
                          style={active
                            ? { background: `color-mix(in srgb, ${accent} 18%, transparent)`, borderColor: `color-mix(in srgb, ${accent} 50%, transparent)`, color: accent }
                            : { borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 比較セルは label / value / トーン、その他は本文 */}
              {moduleId === 'self' && cellId === 'compare' ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-text-muted">比較軸</label>
                    <input value={editDraft.label} onChange={(e) => setEditDraft((p) => ({ ...p, label: e.target.value }))}
                      className="w-full bg-surface-2 rounded-lg p-3 text-sm text-text border border-border focus:border-accent outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-text-muted">評価</label>
                    <input value={editDraft.value} onChange={(e) => setEditDraft((p) => ({ ...p, value: e.target.value }))}
                      className="w-full bg-surface-2 rounded-lg p-3 text-sm text-text border border-border focus:border-accent outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-text-muted">トーン</label>
                    <div className="flex flex-wrap gap-1.5">
                      {TONE_OPTIONS.map((opt) => {
                        const active = editDraft.color === opt.key
                        const c = `var(--color-${opt.key})`
                        return (
                          <button key={opt.key} onClick={() => setEditDraft((p) => ({ ...p, color: opt.key }))}
                            className="text-[11px] px-3 py-1.5 rounded-lg border transition-all"
                            style={active
                              ? { background: `color-mix(in srgb, ${c} 18%, transparent)`, borderColor: `color-mix(in srgb, ${c} 50%, transparent)`, color: c }
                              : { borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                            {opt.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[11px] text-text-muted">
                    {cellId === 'strength' ? '強み' : cellId === 'weakness' ? '弱み' : cellId === 'cant' ? 'できないこと' : cellId === 'others' ? '評価・コメント' : '本文'}
                  </label>
                  <textarea value={editDraft.text} onChange={(e) => setEditDraft((p) => ({ ...p, text: e.target.value }))} rows={2}
                    className="w-full bg-surface-2 rounded-lg p-3 text-sm text-text border border-border focus:border-accent outline-none resize-none" />
                </div>
              )}

              {/* レベル（強み・弱み） */}
              {moduleId === 'self' && (cellId === 'strength' || cellId === 'weakness') && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-text-muted">レベル（1〜5）</label>
                    <span className="text-[13px] font-bold tabular-nums" style={{ color: accent }}>Lv.{editDraft.level}</span>
                  </div>
                  <input type="range" min={1} max={5} step={1} value={editDraft.level}
                    onChange={(e) => setEditDraft((p) => ({ ...p, level: parseInt(e.target.value, 10) }))}
                    className="w-full h-1.5" style={{ accentColor: accent }} />
                </div>
              )}

              {/* 補足（強み=発揮条件 / 弱み=状況） */}
              {moduleId === 'self' && (cellId === 'strength' || cellId === 'weakness') && (
                <div className="space-y-1.5">
                  <label className="text-[11px] text-text-muted">{cellId === 'strength' ? 'どんな時に発揮されるか' : 'どんな時に出るか'}</label>
                  <textarea value={editDraft.detail} onChange={(e) => setEditDraft((p) => ({ ...p, detail: e.target.value }))} rows={2}
                    className="w-full bg-surface-2 rounded-lg p-3 text-sm text-text border border-border focus:border-accent outline-none resize-none" />
                </div>
              )}

              {/* 対策（弱み） */}
              {moduleId === 'self' && cellId === 'weakness' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] text-text-muted">対策</label>
                  <input value={editDraft.fix} onChange={(e) => setEditDraft((p) => ({ ...p, fix: e.target.value }))}
                    className="w-full bg-surface-2 rounded-lg p-3 text-sm text-text border border-border focus:border-accent outline-none" />
                </div>
              )}

              {/* タイプ・対応（できないこと） */}
              {moduleId === 'self' && cellId === 'cant' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-text-muted">どう向き合うか</label>
                    <div className="flex flex-wrap gap-1.5">
                      {CANT_TYPES.map((opt) => {
                        const active = editDraft.type === opt
                        return (
                          <button key={opt} onClick={() => setEditDraft((p) => ({ ...p, type: opt }))}
                            className="text-[11px] px-3 py-1.5 rounded-lg border transition-all"
                            style={active
                              ? { background: `color-mix(in srgb, ${accent} 18%, transparent)`, borderColor: `color-mix(in srgb, ${accent} 50%, transparent)`, color: accent }
                              : { borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-text-muted">アクション</label>
                    <input value={editDraft.action} onChange={(e) => setEditDraft((p) => ({ ...p, action: e.target.value }))}
                      className="w-full bg-surface-2 rounded-lg p-3 text-sm text-text border border-border focus:border-accent outline-none" />
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-1">
                <button onClick={saveEdit} className="flex-1 py-2 rounded-lg text-xs font-medium text-white" style={{ background: accent }}>更新する</button>
                <button onClick={() => setEditing(false)} className="flex-1 py-2 rounded-lg text-xs text-text-dim bg-surface-2 hover:text-text transition-colors">キャンセル</button>
              </div>
            </section>
          )}

          {/* 確信度（検証ステータス） */}
          <section className="space-y-2">
            <h4 className="text-[11px] font-medium text-text-muted">確信度（検証ステータス）</h4>
            <div className="grid grid-cols-4 gap-1.5">
              {STATUS_OPTIONS.map((opt) => {
                const active = status === opt.key
                const c = `var(--color-${opt.color})`
                return (
                  <button
                    key={opt.key}
                    onClick={() => setStatusVal(opt.key)}
                    className="py-2 rounded-lg text-[11px] font-medium border transition-all"
                    style={
                      active
                        ? { background: `color-mix(in srgb, ${c} 18%, transparent)`, borderColor: `color-mix(in srgb, ${c} 50%, transparent)`, color: c }
                        : { borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }
                    }
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </section>

          {/* なぜそう思うか（仮説・根拠） */}
          <section className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Icon name="lightbulb" size={13} style={{ color: accent }} />
              <h4 className="text-[11px] font-medium text-text-muted">なぜそう思うか（仮説・根拠）</h4>
            </div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onBlur={saveReason}
              rows={2}
              placeholder="例：◯◯というデータ／経験から、こう考えた"
              className="w-full bg-surface-2 rounded-lg p-3 text-sm text-text border border-border focus:border-accent outline-none resize-none"
            />
          </section>

          {/* 補足メモ */}
          <section className="space-y-2">
            <h4 className="text-[11px] font-medium text-text-muted">補足メモ</h4>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={saveNote}
              rows={3}
              placeholder="背景・気づき・補足を書く…"
              className="w-full bg-surface-2 rounded-lg p-3 text-sm text-text border border-border focus:border-accent outline-none resize-none"
            />
          </section>

          {/* 根拠（bekkaiアウトプット） */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-medium text-text-muted">根拠（bekkaiのアウトプット）</h4>
              <span className="text-[9px] text-text-muted px-1.5 py-0.5 rounded-full bg-white/[0.04] border border-border">後で同期</span>
            </div>

            {evidence.length === 0 && !showPicker && (
              <p className="text-[11px] text-text-muted">アウトプットの引用や、メモ・添付を根拠として紐づけられます。</p>
            )}

            {evidence.map((o) => (
              <div key={o.id} className="rounded-xl bg-surface-2 border border-border p-3 space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: `color-mix(in srgb, ${accent} 16%, transparent)` }}>
                    <Icon name={o.kind === 'note' ? 'lightbulb' : 'flag'} size={13} style={{ color: accent }} />
                  </span>
                  <div className="flex-1 min-w-0">
                    {o.kind === 'note' ? (
                      <p className="text-[13px] text-text-dim">メモ・添付</p>
                    ) : (
                      <>
                        <p className="text-[13px] text-text-dim truncate">{o.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/[0.05] text-text-muted">{OUTPUT_TYPE_LABELS[o.type] ?? o.type}</span>
                          {typeof o.self_score === 'number' && (
                            <span className="text-[9px] text-text-muted">自己 {o.self_score.toFixed(1)}</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  <button onClick={() => removeEvidence(o.id)} aria-label="根拠を外す" className="shrink-0 p-1 text-text-muted hover:text-danger transition-colors">
                    <Icon name="trash" size={13} />
                  </button>
                </div>

                {/* メモ */}
                <textarea
                  defaultValue={o.memo ?? ''}
                  onBlur={(e) => {
                    const v = e.target.value
                    if (v !== (o.memo ?? '')) updateEvidence(o.id, { memo: v })
                  }}
                  rows={2}
                  placeholder="この根拠についてのメモ…"
                  className="w-full bg-surface rounded-lg p-2.5 text-[12px] text-text border border-border focus:border-accent outline-none resize-none"
                />

                {/* 添付一覧 */}
                {(o.attachments ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {o.attachments.map((a) => (
                      <div key={a.id} className="relative group">
                        {a.mime?.startsWith('image/') ? (
                          <img src={a.data} alt={a.name} className="w-16 h-16 rounded-lg object-cover border border-border" />
                        ) : (
                          <div className="flex items-center gap-1.5 max-w-[150px] rounded-lg bg-surface border border-border px-2.5 py-2">
                            <Icon name="paperclip" size={13} className="text-text-muted shrink-0" />
                            <span className="text-[11px] text-text-dim truncate">{a.name}</span>
                          </div>
                        )}
                        <button
                          onClick={() => removeAttachment(o.id, a.id)}
                          aria-label="添付を削除"
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-surface-3 border border-border-light flex items-center justify-center text-text-muted hover:text-danger transition-colors"
                        >
                          <Icon name="plus" size={11} className="rotate-45" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 添付追加 */}
                <label className="inline-flex items-center gap-1.5 text-[11px] font-medium cursor-pointer hover:opacity-80 transition-opacity" style={{ color: accent }}>
                  <Icon name="paperclip" size={12} />
                  ファイルを添付
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => { addAttachments(o.id, e.target.files); e.target.value = '' }}
                  />
                </label>
              </div>
            ))}

            {showPicker ? (
              <div className="rounded-xl border border-border bg-surface-2 p-2 space-y-1.5">
                <p className="text-[10px] text-text-muted px-1 pt-1">引用するアウトプットを選択</p>
                {available.length === 0 && (
                  <p className="text-[11px] text-text-muted px-1 py-2">追加できるアウトプットがありません。</p>
                )}
                {available.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => addEvidence(o)}
                    className="w-full text-left rounded-lg p-2.5 border border-border bg-surface hover:border-accent transition-colors"
                  >
                    <p className="text-[13px] text-text-dim truncate">{o.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/[0.05] text-text-muted">{OUTPUT_TYPE_LABELS[o.type] ?? o.type}</span>
                      {typeof o.self_score === 'number' && <span className="text-[9px] text-text-muted">自己 {o.self_score.toFixed(1)}</span>}
                    </div>
                  </button>
                ))}
                <button onClick={() => setShowPicker(false)} className="w-full py-1.5 text-[11px] text-text-muted hover:text-text-dim transition-colors">
                  閉じる
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowPicker(true)}
                  className="rounded-xl border border-dashed border-border-light py-2.5 text-[12px] font-medium transition-colors hover:bg-white/[0.02]"
                  style={{ color: accent }}
                >
                  ＋ アウトプット
                </button>
                <button
                  onClick={addNoteEvidence}
                  className="rounded-xl border border-dashed border-border-light py-2.5 text-[12px] font-medium transition-colors hover:bg-white/[0.02]"
                  style={{ color: accent }}
                >
                  ＋ メモ・添付
                </button>
              </div>
            )}
          </section>

          {/* フィードバックを聞く（bekkai の他者評価 準拠） */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-medium text-text-muted">フィードバックを聞く</h4>
              <button
                onClick={copyRequest}
                className="inline-flex items-center gap-1 text-[10px] text-text-muted px-2 py-0.5 rounded-full bg-white/[0.04] border border-border hover:text-text-dim transition-colors"
              >
                <Icon name="list" size={10} />依頼文をコピー
              </button>
            </div>

            {feedback.length === 0 && !showFb && (
              <p className="text-[11px] text-text-muted">他の人の意見・反応を記録できます。「依頼文をコピー」で聞きやすくなります。</p>
            )}

            {feedback.map((f) => (
              <div key={f.id} className="rounded-xl bg-surface-2 border border-border p-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: `color-mix(in srgb, ${accent} 16%, transparent)` }}>
                    <Icon name="around" size={12} style={{ color: accent }} />
                  </span>
                  <span className="text-[12px] font-medium text-text-dim flex-1 truncate">{f.from || '匿名'}</span>
                  {typeof f.score === 'number' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `color-mix(in srgb, ${accent} 14%, transparent)`, color: accent }}>
                      {f.score.toFixed(1)}
                    </span>
                  )}
                  <button onClick={() => removeFeedback(f.id)} aria-label="削除" className="shrink-0 p-1 text-text-muted hover:text-danger transition-colors">
                    <Icon name="trash" size={12} />
                  </button>
                </div>
                {f.comment && <p className="text-[12px] text-text-dim whitespace-pre-wrap break-words pl-8">{f.comment}</p>}
                {f.created_at && <p className="text-[10px] text-text-muted pl-8">{formatDateTime(f.created_at)}</p>}
              </div>
            ))}

            {showFb ? (
              <div className="rounded-xl border border-border bg-surface-2 p-3 space-y-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] text-text-muted">誰から</label>
                  <input
                    value={fbFrom}
                    onChange={(e) => setFbFrom(e.target.value)}
                    placeholder="例：先輩 / 同期 / 取引先"
                    className="w-full bg-surface rounded-lg p-2.5 text-[13px] text-text border border-border focus:border-accent outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-text-muted">内容</label>
                  <textarea
                    value={fbComment}
                    onChange={(e) => setFbComment(e.target.value)}
                    rows={2}
                    placeholder="もらった意見・反応を書く…"
                    className="w-full bg-surface rounded-lg p-2.5 text-[13px] text-text border border-border focus:border-accent outline-none resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-text-muted inline-flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={fbUseScore} onChange={(e) => setFbUseScore(e.target.checked)} style={{ accentColor: accent }} />
                      スコアをつける（任意）
                    </label>
                    {fbUseScore && <span className="text-[13px] font-bold tabular-nums" style={{ color: accent }}>{fbScore.toFixed(1)}</span>}
                  </div>
                  {fbUseScore && (
                    <input
                      type="range" min={0} max={10} step={0.5}
                      value={fbScore}
                      onChange={(e) => setFbScore(parseFloat(e.target.value))}
                      className="w-full h-1.5"
                      style={{ accentColor: accent }}
                    />
                  )}
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={addFeedback}
                    disabled={!fbComment.trim() && !fbFrom.trim()}
                    className="flex-1 py-2 rounded-lg text-xs font-medium text-white disabled:opacity-40"
                    style={{ background: accent }}
                  >
                    記録する
                  </button>
                  <button onClick={() => setShowFb(false)} className="flex-1 py-2 rounded-lg text-xs text-text-dim bg-surface hover:text-text transition-colors border border-border">
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowFb(true)}
                className="w-full rounded-xl border border-dashed border-border-light py-2.5 text-[12px] font-medium transition-colors hover:bg-white/[0.02]"
                style={{ color: accent }}
              >
                ＋ フィードバックを記録
              </button>
            )}
          </section>

          {/* 自己採点（bekkai準拠） */}
          <section className="space-y-3">
            <h4 className="text-[11px] font-medium text-text-muted">自己採点（5観点）</h4>

            {!scoring && score && (
              <div className="rounded-xl bg-surface-2 border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-text-muted">総合スコア</span>
                  <span className="text-2xl font-bold" style={{ color: accent }}>{score.overall.toFixed(1)}</span>
                </div>
                <div className="space-y-2">
                  {displayCriteria.map((c) => (
                    <div key={c.key} className="flex items-center gap-2">
                      <span className="text-[11px] text-text-muted w-16 shrink-0">{c.label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${((score.detail?.[c.key] ?? 0) / 10) * 100}%`, background: accent }} />
                      </div>
                      <span className="text-[11px] text-text-dim w-7 text-right tabular-nums">{(score.detail?.[c.key] ?? 0).toFixed(1)}</span>
                    </div>
                  ))}
                </div>
                {score.good && (
                  <div className="text-[12px]"><span className="text-text-muted">できたこと</span><p className="text-text-dim mt-0.5">{score.good}</p></div>
                )}
                {score.improve && (
                  <div className="text-[12px]"><span className="text-text-muted">できなかったこと</span><p className="text-text-dim mt-0.5">{score.improve}</p></div>
                )}
                {score.scored_at && <p className="text-[10px] text-text-muted">採点日: {formatDateTime(score.scored_at)}</p>}
                <div className="flex items-center gap-3 pt-1">
                  <button onClick={() => setScoring(true)} className="text-[11px] font-medium" style={{ color: accent }}>再採点する</button>
                  <button onClick={removeScore} className="flex items-center gap-1 text-[11px] text-text-muted hover:text-danger transition-colors">
                    <Icon name="trash" size={11} />採点を削除
                  </button>
                </div>
              </div>
            )}

            {!scoring && !score && (
              <button
                onClick={() => setScoring(true)}
                className="w-full rounded-xl border border-dashed border-border-light py-2.5 text-[12px] font-medium transition-colors hover:bg-white/[0.02]"
                style={{ color: accent }}
              >
                ＋ 自己採点する
              </button>
            )}

            {scoring && (
              <div className="rounded-xl bg-surface-2 border border-border p-4 space-y-4">
                <div className="space-y-3">
                  {criteria.map((c) => (
                    <div key={c.key}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[12px] font-medium text-text-dim">{c.label}</span>
                        <span className="text-[12px] font-bold tabular-nums" style={{ color: accent }}>{(draft[c.key] ?? 0).toFixed(1)}</span>
                      </div>
                      {c.hint && <p className="text-[10px] text-text-muted mb-1">{c.hint}</p>}
                      <input
                        type="range" min={0} max={10} step={0.5}
                        value={draft[c.key] ?? 0}
                        onChange={(e) => setDraft((p) => ({ ...p, [c.key]: parseFloat(e.target.value) }))}
                        className="w-full h-1.5"
                        style={{ accentColor: accent }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-[12px] font-medium text-text-muted">総合スコア</span>
                  <span className="text-lg font-bold" style={{ color: accent }}>{overall.toFixed(1)}</span>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-text-muted">できたこと</label>
                  <textarea value={good} onChange={(e) => setGood(e.target.value)} rows={2} placeholder="例：根拠を示して説得力を出せた"
                    className="w-full bg-surface rounded-lg p-2.5 text-[13px] text-text border border-border focus:border-accent outline-none resize-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-text-muted">できなかったこと</label>
                  <textarea value={improve} onChange={(e) => setImprove(e.target.value)} rows={2} placeholder="例：結論が曖昧だった"
                    className="w-full bg-surface rounded-lg p-2.5 text-[13px] text-text border border-border focus:border-accent outline-none resize-none" />
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={saveScore} className="flex-1 py-2 rounded-lg text-xs font-medium text-white" style={{ background: accent }}>採点を保存</button>
                  <button onClick={() => setScoring(false)} className="flex-1 py-2 rounded-lg text-xs text-text-dim bg-surface hover:text-text transition-colors border border-border">キャンセル</button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
