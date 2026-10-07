'use client'

import { useEffect, useRef, useState } from 'react'
import type { CurvePoint } from '@/lib/tax'

// Two small charts sharing one x-axis (IAB in €): cumulative saving on top, marginal rate below.
// Two measures of different scale → two charts, never a dual y-axis. One crosshair spans both.

const ACCENT = '#16a34a' // emerald-600 (brand green) – the data
const GRID = '#e2e8f0' // slate-200 – hairline grid
const AXIS_TEXT = '#64748b' // slate-500
const INK = '#0f172a' // slate-900 – "Ihr IAB" marker
const OPT = '#b45309' // amber-700 – optimum marker (label carries the meaning, not the color)

const eur = (v: number) => v.toLocaleString('de-DE', { maximumFractionDigits: 0 }) + ' €'
const pct = (v: number) => (v * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 }) + ' %'
const kEur = (v: number) => (v >= 1000 ? `${Math.round(v / 1000).toLocaleString('de-DE')}k` : `${v}`)

function niceStep(max: number, ticks = 4): number {
  const raw = max / ticks
  const mag = 10 ** Math.floor(Math.log10(raw || 1))
  const n = raw / mag
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag
}

type Props = { points: CurvePoint[]; current: number; optimum: number | null }

export function SavingsChart({ points, current, optimum }: Props) {
  const wrap = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(600)
  const [hover, setHover] = useState<number | null>(null)

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(280, Math.round(e.contentRect.width))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  if (points.length < 2) return null

  const pad = { l: 52, r: 16 }
  const topH = 150
  const botH = 96
  const gap = 34
  const axisH = 26
  const height = topH + gap + botH + axisH
  const innerW = width - pad.l - pad.r
  const maxX = points[points.length - 1].iab
  const maxS = Math.max(...points.map((p) => p.saving), 1)
  const sStep = niceStep(maxS)
  const sTop = Math.ceil(maxS / sStep) * sStep
  const rTop = 0.5 // marginal rates rarely exceed 50 %

  const x = (v: number) => pad.l + (v / maxX) * innerW
  const yS = (v: number) => topH - (v / sTop) * (topH - 8)
  const botY0 = topH + gap
  const yR = (v: number) => botY0 + botH - (Math.min(v, rTop) / rTop) * botH

  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(p.iab).toFixed(1)},${yS(p.saving).toFixed(1)}`).join('')
  const area = `${line}L${x(maxX).toFixed(1)},${yS(0)}L${x(0).toFixed(1)},${yS(0)}Z`
  // Step line: the rate holds over each 1.000-€ step
  const rateLine = points
    .map((p, i) => {
      const nx = x(points[Math.min(i + 1, points.length - 1)].iab)
      return `${i ? 'L' : 'M'}${x(p.iab).toFixed(1)},${yR(p.rate).toFixed(1)}H${nx.toFixed(1)}`
    })
    .join('')

  const xStep = niceStep(maxX, width < 420 ? 3 : 5)
  const xTicks: number[] = []
  for (let v = 0; v <= maxX + 1; v += xStep) xTicks.push(v)
  const sTicks: number[] = []
  for (let v = 0; v <= sTop + 1; v += sStep) sTicks.push(v)
  const rTicks = [0, 0.1, 0.2, 0.3, 0.4, 0.5]

  const hp = hover != null ? points[hover] : null
  const nearest = (clientX: number) => {
    const rect = wrap.current!.getBoundingClientRect()
    const v = ((clientX - rect.left - pad.l) / innerW) * maxX
    let best = 0
    for (let i = 1; i < points.length; i++) if (Math.abs(points[i].iab - v) < Math.abs(points[best].iab - v)) best = i
    return best
  }

  const marker = (v: number, color: string, label: string, anchorRight: boolean) => (
    <g>
      <line x1={x(v)} x2={x(v)} y1={4} y2={botY0 + botH} stroke={color} strokeWidth={1} />
      <text x={x(v) + (anchorRight ? -5 : 5)} y={14} textAnchor={anchorRight ? 'end' : 'start'} fontSize={11} fontWeight={600} fill={INK}>
        {label}
      </text>
    </g>
  )

  const curIdx = points.findIndex((p) => p.iab >= current)
  const cur = points[curIdx < 0 ? points.length - 1 : curIdx]

  return (
    <div ref={wrap} className="relative select-none">
      <svg
        width={width}
        height={height}
        role="img"
        aria-label="Steuerersparnis kumuliert und Grenzsteuersatz je IAB-Betrag"
        onPointerMove={(e) => setHover(nearest(e.clientX))}
        onPointerLeave={() => setHover(null)}
        className="block touch-none"
      >
        {/* ── Top: cumulative saving ── */}
        {sTicks.map((v) => (
          <g key={`s${v}`}>
            <line x1={pad.l} x2={width - pad.r} y1={yS(v)} y2={yS(v)} stroke={GRID} strokeWidth={1} />
            <text x={pad.l - 8} y={yS(v) + 4} textAnchor="end" fontSize={11} fill={AXIS_TEXT}>
              {kEur(v)}
            </text>
          </g>
        ))}
        <path d={area} fill={ACCENT} opacity={0.1} />
        <path d={line} fill="none" stroke={ACCENT} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {/* ── Bottom: marginal rate ── */}
        {rTicks.map((v) => (
          <g key={`r${v}`}>
            <line x1={pad.l} x2={width - pad.r} y1={yR(v)} y2={yR(v)} stroke={GRID} strokeWidth={1} />
            <text x={pad.l - 8} y={yR(v) + 4} textAnchor="end" fontSize={11} fill={AXIS_TEXT}>
              {v * 100} %
            </text>
          </g>
        ))}
        <path d={rateLine} fill="none" stroke={ACCENT} strokeWidth={2} strokeLinejoin="round" />

        <text x={pad.l} y={topH + 22} fontSize={11} fontWeight={600} fill={AXIS_TEXT}>
          Grenzsteuersatz: was der nächste Euro IAB spart
        </text>

        {/* ── Shared x-axis ── */}
        {xTicks.map((v) => (
          <text key={`x${v}`} x={x(v)} y={height - 8} textAnchor="middle" fontSize={11} fill={AXIS_TEXT}>
            {kEur(v)}
          </text>
        ))}

        {optimum != null && optimum < maxX && marker(optimum, OPT, 'Optimum', optimum > maxX * 0.6)}
        {marker(cur.iab, INK, 'Ihr IAB', cur.iab > maxX * 0.6)}
        <circle cx={x(cur.iab)} cy={yS(cur.saving)} r={5} fill={ACCENT} stroke="#fff" strokeWidth={2} />

        {/* ── Crosshair ── */}
        {hp && (
          <g pointerEvents="none">
            <line x1={x(hp.iab)} x2={x(hp.iab)} y1={4} y2={botY0 + botH} stroke={AXIS_TEXT} strokeWidth={1} />
            <circle cx={x(hp.iab)} cy={yS(hp.saving)} r={4} fill={ACCENT} stroke="#fff" strokeWidth={2} />
            <circle cx={x(hp.iab)} cy={yR(hp.rate)} r={4} fill={ACCENT} stroke="#fff" strokeWidth={2} />
          </g>
        )}
      </svg>

      {hp && (
        <div
          className="pointer-events-none absolute top-6 z-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg"
          style={x(hp.iab) > width / 2 ? { right: width - x(hp.iab) + 10 } : { left: x(hp.iab) + 10 }}
        >
          <p className="font-semibold text-slate-900">IAB {eur(hp.iab)}</p>
          <p className="text-slate-600">Ersparnis: {eur(hp.saving)}</p>
          <p className="text-slate-600">Grenzsatz danach: {pct(hp.rate)}</p>
        </div>
      )}
    </div>
  )
}
