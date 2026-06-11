import { TrendingUp, Search, Sparkles, Rocket, AlertTriangle, ArrowRight, Share2, ChevronLeft, Check } from 'lucide-react'
import type { AppTab } from '@/components/AppHeader'
import { shareApp } from '@/lib/share'

interface AboutScreenProps {
  onStart: () => void
  onBack: () => void
}

const POWERS = [
  { label: '発見力', sub: '解くべき問題を見つける', Icon: Search, color: '#7c6cff' },
  { label: '別解力', sub: '自分だけの答えを出す', Icon: Sparkles, color: '#DC2626' },
  { label: '実現力', sub: '別解を形にする', Icon: Rocket, color: '#EA580C' },
  { label: '失敗力', sub: '転びを糧にする', Icon: AlertTriangle, color: '#0D9488' },
  { label: '成長力', sub: 'すべてを回すエンジン', Icon: TrendingUp, color: '#185FA5' },
]

export function AboutScreen({ onStart, onBack }: AboutScreenProps) {
  return (
    <div className="pb-6">
      <div className="px-4 pt-3 pb-2">
        <button onClick={onBack} className="inline-flex items-center gap-1 text-[12px] text-text-secondary"><ChevronLeft size={16} />戻る</button>
      </div>

      {/* ヒーロー */}
      <div className="mx-4 rounded-2xl px-5 py-6 text-white text-center" style={{ background: 'linear-gradient(135deg,#185FA5,#7c6cff)' }}>
        <p className="text-[11px] opacity-80 tracking-wide">bekkai（別解）</p>
        <h1 className="text-[22px] font-bold mt-1 leading-snug">自己分析で、<br />終わらせない。</h1>
        <p className="text-[12px] opacity-90 mt-2">あなただけの「別解」を、実現するまで。</p>
        <button onClick={onStart} className="mt-4 inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-white text-primary text-sm font-semibold">
          無料で使ってみる<ArrowRight size={15} />
        </button>
        <p className="text-[10px] opacity-75 mt-2">登録なし・データは自分のもの</p>
      </div>

      {/* 課題 */}
      <div className="mx-4 mt-5">
        <p className="text-[13px] text-text-primary font-semibold leading-relaxed">
          「自己分析した。…で、どうすれば？」
        </p>
        <p className="text-[12px] text-text-secondary leading-relaxed mt-1.5">
          多くのツールは<b>「自分を知る」</b>で止まります。bekkai は、そこから
          <b>自分だけの答え（別解）</b>を出し、<b>実現するまで</b>を1本の流れで支えます。
        </p>
      </div>

      {/* 別解の定義 */}
      <div className="mx-4 mt-4 bg-surface-secondary rounded-xl px-4 py-3">
        <p className="text-[11px] text-text-tertiary mb-1.5">別解とは</p>
        <div className="flex items-center justify-center gap-1.5 flex-wrap text-[12px] font-medium">
          <span className="px-2 py-0.5 rounded-full" style={{ background: '#6366f11A', color: '#6366f1' }}>自分らしい</span>
          <span className="text-text-tertiary">×</span>
          <span className="px-2 py-0.5 rounded-full" style={{ background: '#D977061A', color: '#D97706' }}>優れている</span>
          <span className="text-text-tertiary">×</span>
          <span className="px-2 py-0.5 rounded-full" style={{ background: '#0596691A', color: '#059669' }}>他と違う</span>
        </div>
        <p className="text-[11px] text-text-secondary text-center mt-1.5">3つが重なる所が、あなたの「別解」。</p>
      </div>

      {/* 5つの力 */}
      <p className="mx-4 mt-5 mb-2 text-[12px] font-medium text-text-secondary">5つの力で前に進める</p>
      <div className="mx-4 space-y-2">
        {POWERS.map((p) => (
          <div key={p.label} className="flex items-center gap-3 border border-border-card rounded-xl p-3">
            <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${p.color}1A` }}>
              <p.Icon size={18} style={{ color: p.color }} />
            </span>
            <div>
              <p className="text-[13px] font-semibold" style={{ color: p.color }}>{p.label}</p>
              <p className="text-[11px] text-text-tertiary">{p.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* こんな人に */}
      <p className="mx-4 mt-5 mb-2 text-[12px] font-medium text-text-secondary">こんな人に</p>
      <div className="mx-4 space-y-1.5">
        {['就活・転職で自己分析を深めたい人', 'キャリアやこれからの方向に迷っている人', '個人事業・副業で自分らしい戦略をつくりたい人'].map((t) => (
          <div key={t} className="flex items-start gap-2 text-[12px] text-text-secondary">
            <Check size={15} className="text-primary shrink-0 mt-0.5" /><span>{t}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mx-4 mt-6 space-y-2">
        <button onClick={onStart} className="w-full inline-flex items-center justify-center gap-1.5 py-3 rounded-xl text-white text-sm font-semibold" style={{ background: 'linear-gradient(135deg,#185FA5,#7c6cff)' }}>
          無料で使ってみる<ArrowRight size={16} />
        </button>
        <button onClick={shareApp} className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border-card text-sm text-text-secondary">
          <Share2 size={14} />友だちにすすめる
        </button>
      </div>
    </div>
  )
}

export type { AppTab }
