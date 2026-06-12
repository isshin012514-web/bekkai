import { useEffect, useRef, useState } from 'react'
import {
  X, TrendingUp, Search, Sparkles, Rocket, AlertTriangle, ArrowRight, RefreshCw, LockOpen,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const ONBOARD_KEY = 'bekkai-onboarded'
const SKIP_KEY = 'bekkai-onboarding-skip'
const LAUNCH_KEY = 'onboarding-launch-count'
const VER_KEY = 'onboarding-version-seen'
// 内容を大きく変えたら上げる → 既存ユーザーにも1回だけ再表示される
const ONBOARDING_VERSION = '2'
// 自動表示する初回からの回数
const AUTO_SHOW_LAUNCHES = 3

export function isOnboarded(): boolean {
  try { return localStorage.getItem(ONBOARD_KEY) === '1' } catch { return true }
}
export function markOnboarded() {
  try {
    localStorage.setItem(ONBOARD_KEY, '1')
    localStorage.setItem(VER_KEY, ONBOARDING_VERSION)
  } catch { /* noop */ }
}
/** 起動時に使い方を自動表示しない設定か（既定: 表示する） */
export function isOnboardingSkipped(): boolean {
  try { return localStorage.getItem(SKIP_KEY) === '1' } catch { return false }
}
function setOnboardingSkip(skip: boolean) {
  try { skip ? localStorage.setItem(SKIP_KEY, '1') : localStorage.removeItem(SKIP_KEY) } catch { /* noop */ }
}

/** 起動時に自動表示すべきか：最初の数回 or バージョン更新時のみ（手動オフは尊重） */
export function shouldAutoShowOnboarding(): boolean {
  if (isOnboardingSkipped()) return false
  try {
    const count = Number(localStorage.getItem(LAUNCH_KEY) || 0)
    const verSeen = localStorage.getItem(VER_KEY)
    return count < AUTO_SHOW_LAUNCHES || verSeen !== ONBOARDING_VERSION
  } catch { return true }
}
/** 起動回数を1つ進める（アプリ起動時に一度だけ呼ぶ） */
export function registerLaunch() {
  try {
    const count = Number(localStorage.getItem(LAUNCH_KEY) || 0)
    localStorage.setItem(LAUNCH_KEY, String(Math.min(count + 1, 99)))
  } catch { /* noop */ }
}

interface Power {
  icon: LucideIcon
  color: string
  name: string
  role: string
  detail: string
}

// 流れ（発見→別解→実現）と、土台の成長力・横の失敗力
const FLOW: Power[] = [
  { icon: Search, color: '#7c6cff', name: '発見力', role: '解くべき問題を見つける', detail: '8視点の自己分析マンダラで、本当に取り組むべき課題を発見する。' },
  { icon: Sparkles, color: '#DC2626', name: '別解力', role: '自分なりの答えを出す', detail: '「自分らしい × 優れた × 別の」を掛け合わせ、答えのない問いに別解を出す。' },
  { icon: Rocket, color: '#EA580C', name: '実現力', role: '別解を形にする', detail: '組み合わせ・連鎖、量→質、チームで、別解を「実現」までやり切る。' },
]
const FAILURE: Power = { icon: AlertTriangle, color: '#0D9488', name: '失敗力', role: '転びを糧にする', detail: '行動の前にリスクを設計し、後に失敗を次の別解へ還流させる。' }
const GROWTH: Power = { icon: TrendingUp, color: '#185FA5', name: '成長力', role: 'すべてを回すエンジン', detail: 'INPUT→OUTPUT→採点→次の打ち手。このサイクルが4つの力すべてを前に進める。' }

interface OnboardingModalProps {
  open: boolean
  onClose: () => void
}

export function OnboardingModal({ open, onClose }: OnboardingModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [dontShow, setDontShow] = useState(isOnboardingSkipped())
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) setDontShow(isOnboardingSkipped())
    return () => { document.body.style.overflow = '' }
  }, [open])
  if (!open) return null

  const close = () => { markOnboarded(); setOnboardingSkip(dontShow); onClose() }

  const Card = ({ p, badge }: { p: Power; badge?: string }) => {
    const Icon = p.icon
    return (
      <div className="flex gap-3 p-3 rounded-xl border border-border-card bg-surface">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${p.color}1A` }}>
          <Icon size={18} style={{ color: p.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[13px] font-semibold" style={{ color: p.color }}>{p.name}</span>
            <span className="text-[11px] text-text-secondary">— {p.role}</span>
            {badge && <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: `${p.color}1A`, color: p.color }}>{badge}</span>}
          </div>
          <p className="text-[11px] text-text-secondary leading-relaxed mt-0.5">{p.detail}</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[70] flex items-end justify-center" onClick={(e) => { if (e.target === overlayRef.current) close() }}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative w-full max-w-[430px] bg-surface rounded-t-2xl max-h-[90vh] flex flex-col animate-slide-up">
        <div className="w-9 h-1 rounded-full bg-black/15 mx-auto mt-2" />
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border-card">
          <span className="text-[15px]">🧭</span>
          <h2 className="text-[15px] font-semibold flex-1">bekkai の全体像 — 5つの力</h2>
          <button onClick={close} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-secondary"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <p className="text-[12px] text-text-secondary leading-relaxed mb-4">
            <b>自己分析で終わらせない。</b>bekkai は「答えのない問いに、<b>自分だけの答え（別解）</b>を出し、<b>実現する</b>」ためのアプリ。
            就活・キャリア・事業づくりを、5つの力が1本の流れで前に進めます。
          </p>

          {/* 流れの帯 */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap mb-4 bg-surface-secondary rounded-lg py-2.5 px-2">
            {FLOW.map((p, i) => (
              <span key={p.name} className="flex items-center gap-1.5">
                {i > 0 && <ArrowRight size={13} className="text-text-tertiary" />}
                <span className="text-[11px] font-medium px-2 py-1 rounded-full" style={{ background: `${p.color}1A`, color: p.color }}>{p.name}</span>
              </span>
            ))}
          </div>

          {/* 流れ3つ */}
          <div className="flex flex-col gap-2.5">
            {FLOW.map((p, i) => <Card key={p.name} p={p} badge={`STEP ${i + 1}`} />)}
          </div>

          {/* 失敗力（ループ） */}
          <div className="flex items-center gap-1.5 my-3 text-[11px] text-text-tertiary">
            <RefreshCw size={12} />
            <span>つまずいたら <b style={{ color: FAILURE.color }}>失敗力</b> で立て直し、また別解へ戻る</span>
          </div>
          <Card p={FAILURE} badge="ループ" />

          {/* 成長力（土台） */}
          <div className="my-3 text-[11px] text-text-tertiary text-center">— そして、すべての土台 —</div>
          <Card p={GROWTH} badge="エンジン" />

          {/* 段階的開示の説明 */}
          <div className="mt-4 flex gap-2.5 p-3 rounded-xl bg-surface-secondary">
            <LockOpen size={16} className="text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] font-semibold text-text-primary">少しずつ解放されます</p>
              <p className="text-[11px] text-text-secondary leading-relaxed mt-0.5">
                最初は<b>「まずここだけ」</b>の項目だけ開いています。埋めると次の項目が解放。
                一度に全部やらなくて大丈夫。1つずつでOKです。
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 mt-4 cursor-pointer select-none">
            <input type="checkbox" checked={dontShow} onChange={(e) => setDontShow(e.target.checked)}
              className="w-4 h-4 accent-[color:var(--color-primary)]" />
            <span className="text-[12px] text-text-secondary">次回から起動時に自動表示しない</span>
          </label>
          <button onClick={close} className="w-full py-3 rounded-[10px] text-white text-sm font-semibold mt-3 bg-primary">
            はじめる
          </button>
          <p className="text-[10px] text-text-tertiary text-center mt-2">この画面は「データ」タブの「?」からいつでも開けます</p>
        </div>
      </div>
    </div>
  )
}
