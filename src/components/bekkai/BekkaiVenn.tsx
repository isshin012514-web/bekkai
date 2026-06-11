import { useState } from 'react'
import { BEKKAI_SCORE_LABELS } from '@/lib/types'

interface BekkaiVennProps {
  scores: [number, number, number] // self, excellent, different
  ideaCounts: [number, number, number]
  onSelectAxis: (idx: 0 | 1 | 2) => void
  onOpenIntegrate: () => void
}

const COLORS = ['#6366f1', '#D97706', '#059669']
const MIN_R = 60
const MAX_R = 92
const DEF_R = 78

// 円中心（固定）— viewBox 360x360 に余白を持たせ 100% でも見切れない配置
const CENTERS = [
  { cx: 180, cy: 100 }, // self（上）
  { cx: 252, cy: 224 }, // excellent（右下）
  { cx: 108, cy: 224 }, // different（左下）
]
const CENTROID = {
  cx: (CENTERS[0].cx + CENTERS[1].cx + CENTERS[2].cx) / 3,
  cy: (CENTERS[0].cy + CENTERS[1].cy + CENTERS[2].cy) / 3,
}

function radius(score: number) {
  return score === 0 ? DEF_R : MIN_R + (MAX_R - MIN_R) * (score / 100)
}

// 2円の交差領域（レンズ）中心を、中心線上の根軸位置で近似 → 半径変化で位置がスライド
function lensPoint(i: number, j: number, ri: number, rj: number) {
  const a = CENTERS[i], b = CENTERS[j]
  const dx = b.cx - a.cx, dy = b.cy - a.cy
  const d = Math.hypot(dx, dy) || 1
  const t = (d * d + ri * ri - rj * rj) / (2 * d) // a からの距離
  const clamped = Math.max(ri * 0.2, Math.min(d - rj * 0.2, t))
  return { x: a.cx + (dx / d) * clamped, y: a.cy + (dy / d) * clamped }
}

// 中心から外側（重心の反対）へラベルをずらす単位ベクトル
function outwardDir(i: number) {
  const c = CENTERS[i]
  const dx = c.cx - CENTROID.cx, dy = c.cy - CENTROID.cy
  const d = Math.hypot(dx, dy) || 1
  return { x: dx / d, y: dy / d }
}

export function BekkaiVenn({ scores, ideaCounts, onSelectAxis, onOpenIntegrate }: BekkaiVennProps) {
  const [hover, setHover] = useState<number | null>(null)
  const rs = scores.map(radius)
  const allSet = scores.every((v) => v > 0)

  const NAMES = [['自分らしい', 'やり方'], ['優れた', 'やり方'], ['別の', 'やり方']]
  const GRADS = ['url(#bvS)', 'url(#bvE)', 'url(#bvD)']

  // overlap / bekkai positions (slide with radii)
  const pSelfDiff = lensPoint(0, 2, rs[0], rs[2])   // 独りよがり
  const pSelfExc = lensPoint(0, 1, rs[0], rs[1])    // コモディティ
  const pExcDiff = lensPoint(1, 2, rs[1], rs[2])    // 長続きしない
  const bekkai = {
    x: (pSelfDiff.x + pSelfExc.x + pExcDiff.x) / 3,
    y: (pSelfDiff.y + pSelfExc.y + pExcDiff.y) / 3,
  }

  return (
    <svg viewBox="0 0 360 360" className="w-full max-w-[380px] mx-auto block" style={{ touchAction: 'manipulation' }}>
      <defs>
        <radialGradient id="bvS" cx="50%" cy="40%"><stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" /><stop offset="100%" stopColor="#6366f1" stopOpacity="0.04" /></radialGradient>
        <radialGradient id="bvE" cx="60%" cy="40%"><stop offset="0%" stopColor="#D97706" stopOpacity="0.18" /><stop offset="100%" stopColor="#D97706" stopOpacity="0.04" /></radialGradient>
        <radialGradient id="bvD" cx="40%" cy="60%"><stop offset="0%" stopColor="#059669" stopOpacity="0.18" /><stop offset="100%" stopColor="#059669" stopOpacity="0.04" /></radialGradient>
      </defs>

      {/* Circles */}
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          cx={CENTERS[i].cx}
          cy={CENTERS[i].cy}
          r={rs[i]}
          fill={GRADS[i]}
          stroke={COLORS[i]}
          strokeWidth={hover === i ? 2.5 : 1.5}
          strokeOpacity={hover === i ? 0.9 : 0.4}
          style={{ cursor: 'pointer', transition: 'r 0.5s cubic-bezier(0.23,1,0.32,1), stroke-width 0.2s, stroke-opacity 0.2s' }}
          onClick={() => onSelectAxis(i as 0 | 1 | 2)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
        />
      ))}
      {/* 未評価の円：脈動リングでタップを促す */}
      {[0, 1, 2].map((i) => (
        scores[i] === 0 ? (
          <circle key={`pulse-${i}`} cx={CENTERS[i].cx} cy={CENTERS[i].cy} r={rs[i]} fill="none"
            stroke={COLORS[i]} strokeWidth="2.5" className="bekkai-pulse-ring" pointerEvents="none" />
        ) : null
      ))}
      {/* Hover deepen overlay (separate filled circle so opacity stacks) */}
      {hover !== null && (
        <circle cx={CENTERS[hover].cx} cy={CENTERS[hover].cy} r={rs[hover]} fill={COLORS[hover]} fillOpacity={0.12} pointerEvents="none"
          style={{ transition: 'r 0.5s cubic-bezier(0.23,1,0.32,1)' }} />
      )}

      {/* Circle names + score — 半径に追従しつつ、ブロック全体が円内に収まる位置へ */}
      {[0, 1, 2].map((i) => {
        const dir = outwardDir(i)
        const c = CENTERS[i]
        // ラベルブロック（名前2行＋スコア1行 ≈ 上下22px）が円からはみ出さないよう、
        // 外向きオフセットを「半径 − ブロック余白」でクランプする
        const block = 24
        const off = Math.max(0, Math.min(rs[i] * 0.42, rs[i] - block - 14))
        const nx = c.cx + dir.x * off
        const ny = c.cy + dir.y * off
        return (
          <g key={i} pointerEvents="none">
            <text x={nx} y={ny - 9} textAnchor="middle" fill={COLORS[i]} fontSize="12" fontWeight="600">{NAMES[i][0]}</text>
            <text x={nx} y={ny + 5} textAnchor="middle" fill={COLORS[i]} fontSize="12" fontWeight="600">{NAMES[i][1]}</text>
            {scores[i] > 0 ? (
              <text x={nx} y={ny + 22} textAnchor="middle" fill={COLORS[i]} fontSize="12" fontWeight="700" opacity="0.5">
                {scores[i]} {BEKKAI_SCORE_LABELS[scores[i]]}{ideaCounts[i] > 0 ? ` ・案${ideaCounts[i]}` : ''}
              </text>
            ) : ideaCounts[i] > 0 ? (
              <text x={nx} y={ny + 21} textAnchor="middle" fill={COLORS[i]} fontSize="9" fontWeight="600" opacity="0.7">案{ideaCounts[i]}件</text>
            ) : (
              <text x={nx} y={ny + 21} textAnchor="middle" fill={COLORS[i]} fontSize="9" fontWeight="600" opacity="0.7">タップして評価</text>
            )}
          </g>
        )
      })}

      {/* Overlap labels — slide with radii */}
      <OverlapLabel x={pSelfDiff.x} y={pSelfDiff.y} lines={['独り', 'よがり']} />
      <OverlapLabel x={pSelfExc.x} y={pSelfExc.y} lines={['コモ', 'ディティ']} />
      <OverlapLabel x={pExcDiff.x} y={pExcDiff.y} lines={['長続き', 'しない']} />

      {/* Bekkai center badge */}
      <g style={{ cursor: 'pointer', transition: 'opacity 0.4s' }} opacity={allSet ? 1 : 0.3} onClick={onOpenIntegrate}>
        <rect x={bekkai.x - 25} y={bekkai.y - 12} width="50" height="24" rx="12" fill="#DC2626" />
        <text x={bekkai.x} y={bekkai.y + 5} textAnchor="middle" fill="white" fontSize="12" fontWeight="700">別解</text>
      </g>
    </svg>
  )
}

function OverlapLabel({ x, y, lines }: { x: number; y: number; lines: [string, string] }) {
  const w = 56
  return (
    <g pointerEvents="none" style={{ transition: 'all 0.5s cubic-bezier(0.23,1,0.32,1)' }}>
      <rect x={x - w / 2} y={y - 14} width={w} height="28" rx="4" fill="white" fillOpacity="0.85" stroke="#ccc" strokeWidth="0.5" />
      <text x={x} y={y - 2} textAnchor="middle" fill="#666" fontSize="10" fontWeight="500">{lines[0]}</text>
      <text x={x} y={y + 10} textAnchor="middle" fill="#666" fontSize="10" fontWeight="500">{lines[1]}</text>
    </g>
  )
}
