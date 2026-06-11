import { useState } from 'react'

/**
 * 専門用語に点線下線をつけ、タップで1行解説のポップオーバーを表示する。
 * 例: <Term def="投資しても一度後退し、ある点から急に正に転じる成長曲線">Jカーブ</Term>
 */
export function Term({ children, def }: { children: React.ReactNode; def: string }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o) }}
        className="underline decoration-dotted decoration-from-font underline-offset-2 cursor-help"
      >
        {children}
      </button>
      {open && (
        <>
          <span className="fixed inset-0 z-[75]" onClick={() => setOpen(false)} />
          <span className="absolute left-0 top-full mt-1 z-[76] block w-56 text-[11px] leading-relaxed font-normal text-left bg-text-primary text-surface rounded-lg px-3 py-2 shadow-lg">
            {def}
          </span>
        </>
      )}
    </span>
  )
}
