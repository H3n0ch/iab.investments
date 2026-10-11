import Link from 'next/link'
import { CATEGORIES, formatEuro } from '@/lib/categories'
import { getMarketSnapshot } from '@/lib/offers'

const pct = (n: number) => n.toLocaleString('de-DE', { maximumFractionDigits: 1 })
/** „5,5–6“, or a single value when all offers state the same */
const span = ([a, b]: [number, number], f: (n: number) => string) => (a === b ? f(a) : `${f(a)}–${f(b)}`)

/**
 * „Marktüberblick“: live figures from our own offers (count, entry, fast delivery, yield range).
 * Unique data for every guide page – updates itself whenever offers change.
 */
export async function MarketSnapshot({ title = 'Marktüberblick: was Sie für Ihren IAB jetzt bekommen', slugs }: { title?: string; slugs?: string[] }) {
  const stats = await getMarketSnapshot()
  const cats = CATEGORIES.filter((c) => !c.comingSoon && (!slugs || slugs.includes(c.slug)))
  const rows = cats.map((c) => ({ c, s: stats.find((x) => x.slug === c.slug) })).filter((x) => x.s && x.s.count > 0)
  if (rows.length === 0) return null
  const total = rows.reduce((n, r) => n + r.s!.count, 0)
  const today = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <section aria-label="Marktüberblick">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">
        Automatisch berechnet aus {total} aktuellen Projekten unserer Anbieter · Stand {today} · alle Werte netto
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {rows.map(({ c, s }) => (
          <Link
            key={c.slug}
            href={`/${c.slug}`}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-emerald-500"
          >
            <p className="font-bold text-slate-900 group-hover:text-emerald-700">{c.name}</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Projekte</dt>
                <dd className="font-semibold text-slate-900">{s!.count}</dd>
              </div>
              {s!.minEntry != null && (
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Einstieg ab</dt>
                  <dd className="font-semibold text-slate-900">{formatEuro(s!.minEntry)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">kurzfristig lieferbar</dt>
                <dd className="font-semibold text-slate-900">{s!.fastCount}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Rendite lt. Anbieter</dt>
                <dd className="font-semibold text-slate-900">
                  {s!.yieldRange ? `${span(s!.yieldRange, pct)} %` : 'nach Anfrage'}
                </dd>
              </div>
              {s!.kwpPriceRange && (
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Preis je kWp</dt>
                  <dd className="font-semibold text-slate-900">
                    {span(s!.kwpPriceRange, formatEuro)}
                  </dd>
                </div>
              )}
            </dl>
            <p className="mt-3 text-xs font-semibold text-emerald-700">Projekte ansehen →</p>
          </Link>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-slate-400">Renditeangaben sind Prognosen der Anbieter und nicht garantiert. Spannen erst ab zwei Projekten.</p>
    </section>
  )
}
