import { useEffect, useRef } from 'react'
import {
  X, TrendingUp, Search, Sparkles, Rocket, AlertTriangle, ArrowRight, RefreshCw,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const ONBOARD_KEY = 'bekkai-onboarded'

export function isOnboarded(): boolean {
  try { return localStorage.getItem(ONBOARD_KEY) === '1' } catch { return true }
}
export function markOnboarded() {
  try { localStorage.setItem(ONBOARD_KEY, '1') } catch { /* noop */ }
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
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])
  if (!open) return null

  const close = () => { markOnboarded(); onClose() }

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
            bekkai は「答えのない問いに、<b>自分なりの答え（別解）</b>を出し、それを<b>実現する</b>」ためのアプリ。
            5つの力が1本の流れでつながっています。
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

          <button onClick={close} className="w-full py-3 rounded-[10px] text-white text-sm font-semibold mt-5 bg-primary">
            はじめる
          </button>
          <p className="text-[10px] text-text-tertiary text-center mt-2">この画面は「データ」タブからいつでも開けます</p>
        </div>
      </div>
    </div>
  )
}
