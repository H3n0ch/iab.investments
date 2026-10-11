import Image from 'next/image'
import Link from 'next/link'
import { formatEuro, getCategory } from '@/lib/categories'
import { cardFacts, datasheetFields } from '@/lib/datasheets'
import { getMarketSnapshot, getPreviewOffers } from '@/lib/offers'
import { UnlockButton } from './UnlockButton'

// Project preview in the middle of a guide page (template element 5): 2–3 real projects with blurred key figures.
// It is the call to action in the text – the market figures sit in one line above instead of extra tiles.

/** The figures investors care most about come first on the card */
const PRIORITY = ['rendite', 'kaufpreis', 'preis_kwp', 'preis_kwh', 'ertrag', 'verguetung', 'auslastung']
const rank = (key: string) => (PRIORITY.includes(key) ? PRIORITY.indexOf(key) : PRIORITY.length)

export async function ProjectPreview({ slugs, title = 'Aktuelle Projekte für Ihren IAB' }: { slugs: string[]; title?: string }) {
  const [offers, stats] = await Promise.all([getPreviewOffers({ slugs, limit: 3 }), getMarketSnapshot()])
  if (offers.length === 0) return null

  const relevant = stats.filter((s) => slugs.includes(s.slug))
  const count = relevant.reduce((n, s) => n + s.count, 0)
  const fast = relevant.reduce((n, s) => n + s.fastCount, 0)
  const entries = relevant.map((s) => s.minEntry).filter((x): x is number => x != null)

  return (
    <section id="projekte" aria-label="Aktuelle Projekte" className="scroll-mt-28">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">
        {count} Projekte unserer Anbieter{entries.length ? ` · Einstieg ab ${formatEuro(Math.min(...entries))} netto` : ''}
        {fast ? ` · ${fast} kurzfristig lieferbar` : ''}
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {offers.map((o) => {
          const c = getCategory(o.category_slug)
          if (!c) return null
          const open = cardFacts(c.slug, o.public_facts ?? [])
          // Up to three locked figures the project really has – shown with the field's fake mask, never the value
          const locked = datasheetFields(c.slug)
            .filter((f) => f.level === 'inquiry' && o.gatedKeys.includes(f.key))
            .sort((a, b) => rank(a.key) - rank(b.key))
            .slice(0, 3)
          const image = o.image_url ?? c.image?.src
          return (
            <article key={o.id} className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
              <Link href={`/${c.slug}/${o.id}`} className={`relative block h-36 bg-linear-to-br ${c.gradient}`}>
                {image &&
                  (o.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element -- arbitrary provider URLs
                    <img src={image} alt={o.title} className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <Image src={image} alt={c.image?.alt ?? ''} fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                  ))}
                <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-medium text-white">{c.name}</span>
              </Link>
              <div className="flex flex-1 flex-col p-4">
                <Link href={`/${c.slug}/${o.id}`} className="font-bold leading-snug text-slate-900 hover:underline">
                  {o.title}
                </Link>
                <p className="mt-0.5 text-xs text-slate-500">
                  {[o.location, o.min_investment_cents != null ? `ab ${formatEuro(o.min_investment_cents / 100)} netto` : null].filter(Boolean).join(' · ')}
                </p>
                {open.length > 0 && (
                  <dl className="mt-3 space-y-1 text-sm">
                    {open.map((f) => (
                      <div key={f.label} className="flex justify-between gap-3">
                        <dt className="text-slate-500">{f.label}</dt>
                        <dd className="text-right font-medium text-slate-900">{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {locked.length > 0 && (
                  <dl className="mt-2 space-y-1 border-t border-slate-100 pt-2 text-sm">
                    {locked.map((f) => (
                      <div key={f.key} className="flex justify-between gap-3">
                        <dt className="text-slate-500">{f.label.replace(/ \(lt\. [^)]*\)$/, '')}</dt>
                        <dd aria-hidden className="select-none font-medium text-slate-500 blur-[5px]">{f.mask ?? '000.000'}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                <div className="mt-auto pt-4">
                  <UnlockButton categorySlug={c.slug} offerTitle={o.title} />
                </div>
              </div>
            </article>
          )
        })}
      </div>
      <p className="mt-2 text-[11px] text-slate-400">Kennzahlen und Unterlagen nach Ihrer kostenlosen Anfrage. Angaben der Anbieter, nicht garantiert.</p>
    </section>
  )
}
