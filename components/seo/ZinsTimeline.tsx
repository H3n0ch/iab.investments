import { assumedAssessment, interestStart } from '@/lib/aufloesen'
import { formatDeadline, iabDeadline } from '@/lib/iab'

// Own graphic per page (SEO plan: unique visuals): investment window vs. interest period when the IAB lapses.
// Pure SVG, server-rendered, scales with the container.

const W = 720
const PAD = 16
const fmt = (d: Date) => d.toLocaleDateString('de-DE', { month: '2-digit', year: 'numeric' })

export function ZinsTimeline({ year }: { year: number }) {
  const start = new Date(Date.UTC(year, 11, 31))
  const zins = interestStart(year)
  const frist = iabDeadline(year)
  const bescheid = assumedAssessment(year)
  const end = new Date(bescheid.getFullYear(), bescheid.getMonth() + 3, 1)
  const x = (d: Date) => PAD + ((d.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * (W - 2 * PAD)

  const marks = [
    { d: start, label: `IAB ${year} gebildet`, sub: `WJ-Ende ${fmt(start)}`, y: 150 },
    { d: zins, label: 'Zinslauf beginnt', sub: zins.toLocaleDateString('de-DE'), y: 182 },
    { d: frist, label: 'Fristende', sub: formatDeadline(year), y: 150 },
    { d: bescheid, label: 'geänderter Bescheid', sub: `ca. ${fmt(bescheid)}`, y: 182 },
  ]

  return (
    <figure className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <svg viewBox={`0 0 ${W} 205`} role="img" aria-labelledby={`zins-title-${year}`} className="h-auto w-full">
        <title id={`zins-title-${year}`}>
          Zeitstrahl IAB {year}: Investition bis {formatDeadline(year)}, Zinsen bei Auflösung ab {zins.toLocaleDateString('de-DE')}
        </title>
        {/* Investment window */}
        <rect x={x(start)} y={28} width={x(frist) - x(start)} height={30} rx={6} className="fill-emerald-100" />
        <text x={x(start) + 10} y={48} className="fill-emerald-800 text-[13px] font-semibold">Zeitraum zum Investieren (3 Jahre)</text>
        {/* Interest period if the IAB lapses */}
        <rect x={x(zins)} y={70} width={x(bescheid) - x(zins)} height={30} rx={6} className="fill-amber-100" />
        <text x={x(zins) + 10} y={90} className="fill-amber-800 text-[13px] font-semibold">Zinsen bei Auflösung: 0,15 % pro Monat</text>
        {/* Axis */}
        <line x1={PAD} x2={W - PAD} y1={118} y2={118} className="stroke-slate-300" strokeWidth={2} />
        {marks.map((m) => (
          <g key={m.label}>
            <line x1={x(m.d)} x2={x(m.d)} y1={20} y2={m.y - 16} className="stroke-slate-400" strokeDasharray="3 3" />
            <circle cx={x(m.d)} cy={118} r={5} className={m.label === 'Fristende' ? 'fill-red-600' : 'fill-slate-700'} />
            <text x={x(m.d)} y={m.y - 2} textAnchor={m.d === start ? 'start' : m.d === bescheid ? 'end' : 'middle'} className="fill-slate-900 text-[12px] font-semibold">
              {m.label}
            </text>
            <text x={x(m.d)} y={m.y + 13} textAnchor={m.d === start ? 'start' : m.d === bescheid ? 'end' : 'middle'} className="fill-slate-500 text-[11px]">
              {m.sub}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="mt-2 text-xs text-slate-500">
        Die Zinsen laufen rückwirkend ab dem 1. April {year + 2}, auch wenn der Bescheid erst nach Fristende kommt. Annahme: Bescheid ca. 6 Monate
        nach Fristende.
      </figcaption>
    </figure>
  )
}
