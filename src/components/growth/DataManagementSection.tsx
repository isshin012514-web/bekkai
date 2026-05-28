import { useState, useRef } from 'react'
import { Download, Upload, Check, AlertTriangle } from 'lucide-react'
import { useGrowthStore } from '@/stores/growth-store'

export function DataManagementSection() {
  const { exportData, importData } = useGrowthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'exported' | 'imported' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleExport = () => {
    try {
      const data = exportData()
      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bekkai-backup-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setStatus('exported')
      setTimeout(() => setStatus('idle'), 3000)
    } catch {
      setStatus('error')
      setErrorMsg('エクスポートに失敗しました')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const handleImport = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const json = ev.target?.result as string
        const data = JSON.parse(json)

        // Basic validation
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid format')
        }

        importData({
          outputs: Array.isArray(data.outputs) ? data.outputs : [],
          reviewers: Array.isArray(data.reviewers) ? data.reviewers : [],
          roleModels: Array.isArray(data.roleModels) ? data.roleModels : [],
          upcomingPeople: Array.isArray(data.upcomingPeople) ? data.upcomingPeople : [],
          inputs: Array.isArray(data.inputs) ? data.inputs : [],
          weeklyGoals: Array.isArray(data.weeklyGoals) ? data.weeklyGoals : [],
        })

        setStatus('imported')
        setTimeout(() => setStatus('idle'), 3000)
      } catch {
        setStatus('error')
        setErrorMsg('ファイル形式が正しくありません')
        setTimeout(() => setStatus('idle'), 3000)
      }
    }
    reader.readAsText(file)

    // Reset so same file can be re-selected
    e.target.value = ''
  }

  return (
    <section className="mx-4 mt-4 border border-border-card rounded-lg p-4">
      <h2 className="text-sm font-medium mb-3">データ管理</h2>

      {status === 'exported' && (
        <div className="flex items-center gap-2 mb-3 p-2 bg-done-bg rounded-lg">
          <Check size={14} className="text-done" />
          <span className="text-[12px] text-done">バックアップを保存しました</span>
        </div>
      )}

      {status === 'imported' && (
        <div className="flex items-center gap-2 mb-3 p-2 bg-done-bg rounded-lg">
          <Check size={14} className="text-done" />
          <span className="text-[12px] text-done">データを復元しました</span>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-2 mb-3 p-2 bg-waiting-bg rounded-lg">
          <AlertTriangle size={14} className="text-waiting" />
          <span className="text-[12px] text-waiting">{errorMsg}</span>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleExport}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 border border-border-card rounded-lg text-sm text-text-secondary hover:bg-surface-secondary transition-colors"
        >
          <Download size={14} />
          バックアップ
        </button>
        <button
          type="button"
          onClick={handleImport}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 border border-border-card rounded-lg text-sm text-text-secondary hover:bg-surface-secondary transition-colors"
        >
          <Upload size={14} />
          復元
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      <p className="text-[10px] text-text-tertiary mt-2 text-center">
        JSONファイルでデータのバックアップ・復元ができます
      </p>
    </section>
  )
}
