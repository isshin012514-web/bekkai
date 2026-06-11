import { toast } from '@/stores/toast-store'

export const APP_URL = 'https://bekkai.vercel.app/'

/** Web Share API があれば共有シート、無ければURL付きテキストをクリップボードへ */
export async function share(opts: { title?: string; text: string; url?: string }): Promise<void> {
  const url = opts.url ?? APP_URL
  const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }
  if (nav.share) {
    try { await nav.share({ title: opts.title ?? 'bekkai', text: opts.text, url }); return } catch { /* キャンセル等は無視 */ return }
  }
  try {
    await navigator.clipboard.writeText(`${opts.text}\n${url}`)
    toast('共有テキストをコピーしました')
  } catch {
    toast('コピーに失敗しました')
  }
}

export function shareApp(): Promise<void> {
  return share({
    title: 'bekkai',
    text: '自己分析で終わらせない。自分だけの「別解」を出して実現するアプリ「bekkai」。無料・登録なしで使えるよ。',
  })
}

export function shareBekkai(theme: string, conclusion: string): Promise<void> {
  const t = theme.trim() || '私の別解'
  const body = conclusion.trim()
    ? `【${t}】に対する私の別解:\n${conclusion.trim()}`
    : `【${t}】について、bekkaiで別解を考えています。`
  return share({ title: 'bekkai', text: `${body}\n\n― 自己分析アプリ bekkai で作成` })
}
