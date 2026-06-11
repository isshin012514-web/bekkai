import { Lock } from 'lucide-react'

/** まだ解放されていないセクションのプレースホルダ。条件を満たすと中身が表示される。 */
export function LockGate({ title, requirement }: { title: string; requirement: string }) {
  return (
    <section className="border border-dashed border-border-card rounded-lg px-3 py-3 flex items-center gap-2.5 bg-surface-secondary/40">
      <span className="w-7 h-7 rounded-lg bg-surface-secondary flex items-center justify-center shrink-0">
        <Lock size={14} className="text-text-tertiary" />
      </span>
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-text-secondary">{title}<span className="ml-1.5 text-[9px] text-text-tertiary border border-border-card rounded px-1 py-0.5 align-middle">ロック中</span></p>
        <p className="text-[10px] text-text-tertiary leading-relaxed mt-0.5">{requirement}</p>
      </div>
    </section>
  )
}
