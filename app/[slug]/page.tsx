import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CategoryCard } from '@/components/CategoryCard'
import { Faq } from '@/components/Faq'
import { GuideCards } from '@/components/GuideCards'
import { LeadForm } from '@/components/LeadForm'
import { OfferList } from '@/components/OfferList'
import { CATEGORIES, formatEuro, GOALS, getCategory } from '@/lib/categories'
import { getOffersForCategory } from '@/lib/offers'
import { articlesForCategory, guidesBySlug } from '@/lib/wissen'

export const revalidate = 300
export const dynamicParams = false

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: PageProps<'/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const c = getCategory(slug)
  if (!c) return {}
  return {
    title: c.seoTitle,
    description: c.seoDescription,
    alternates: { canonical: `/${c.slug}` },
    openGraph: { title: c.seoTitle, description: c.seoDescription },
  }
}

export default async function CategoryPage({ params }: PageProps<'/[slug]'>) {
  const { slug } = await params
  const c = getCategory(slug)
  if (!c) notFound()

  const offers = await getOffersForCategory(slug)
  // Articles about this category first, padded with the basics
  const knowledge = [...articlesForCategory(c.slug), ...guidesBySlug(['investitionsabzugsbetrag', 'bewegliche-wirtschaftsgueter', 'iab-frist'])]
    .filter((g, i, all) => all.findIndex((x) => x.slug === g.slug) === i)
    .slice(0, 3)
  const related = CATEGORIES.filter((x) => x.slug !== c.slug && x.goals.some((g) => c.goals.includes(g))).slice(0, 3)

  return (
    <>
      {/* Compact header – the offer list is the main content */}
      <section className="hero-under-header relative overflow-hidden bg-slate-900">
        {c.image && (
          <>
            <Image
              src={c.image.src}
              alt=""
              fill
              loading="eager"
              sizes="100vw"
              className="object-cover opacity-35"
              style={{ objectPosition: c.image.position }}
            />
            <div aria-hidden className="absolute inset-0 bg-linear-to-r from-slate-900 via-slate-900/85 to-slate-900/40" />
            {c.image.credit && <span className="absolute bottom-1 right-2 z-10 text-[10px] text-white/50">{c.image.credit}</span>}
          </>
        )}
        <div className="relative mx-auto max-w-6xl px-4 py-8 sm:py-10">
          <nav className="text-xs text-slate-400">
            <Link href="/" className="hover:text-white">Start</Link> / <Link href="/#kategorien" className="hover:text-white">Investitionsgüter</Link> / {c.name}
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {c.name} mit IAB
          </h1>
          <p className="mt-3 max-w-2xl text-slate-300">{c.short}</p>
          <dl className="mt-5 flex flex-wrap gap-2">
            {[
              ['Einstieg', `ab ${formatEuro(c.minInvestment)} netto`],
              ['Aufwand', c.effort],
              ['Geeignet für', c.goals.map((g) => GOALS.find((x) => x.value === g)!.label).join(', ')],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
                <dt className="text-[11px] text-slate-400">{k}</dt>
                <dd className="text-sm font-semibold capitalize text-white">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {c.riskNote && (
        <div className="mx-auto mt-6 max-w-6xl px-4">
          <div className="flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
            <p>{c.riskNote}</p>
          </div>
        </div>
      )}

      {/* Project list */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <OfferList category={c} offers={offers} />
      </section>

      {/* General inquiry */}
      <section id="anfrage" className="mx-auto max-w-3xl scroll-mt-20 px-4 pb-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-lg font-bold text-slate-900">
            {c.comingSoon ? `Für ${c.name} vormerken` : 'Unterlagen & Kalkulation anfordern'}
          </p>
          <p className="mb-4 mt-1 text-sm text-slate-500">
            {c.comingSoon
              ? 'Wir melden uns, sobald das erste freigegebene Projekt verfügbar ist. Kostenlos und unverbindlich.'
              : `Wir senden Ihnen passende Projekte für ${c.name}, auch solche, die noch nicht online sind, und melden uns persönlich.`}
          </p>
          <LeadForm preselected={[c.slug]} source="landing" submitLabel={c.comingSoon ? 'Kostenlos vormerken' : undefined} />
        </div>
      </section>

      {/* SEO content */}
      <section className="mx-auto max-w-3xl px-4 pb-10">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{c.name} als Investitionsgut für den IAB</h2>
        <p className="mt-3 leading-relaxed text-slate-700">{c.intro}</p>
        <ul className="mt-4 list-disc space-y-1.5 pl-5 text-slate-700">
          {c.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-14">
        <h2 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">Fragen zu {c.name} und IAB</h2>
        <Faq items={c.faq} />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Wissen zu {c.name} und IAB</h2>
          <Link href="/ratgeber" className="text-sm font-semibold text-emerald-700 hover:underline">Alle Ratgeber →</Link>
        </div>
        <GuideCards guides={knowledge} />
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-6xl px-4">
          <h2 className="mb-5 text-xl font-bold tracking-tight text-slate-900">Weitere Investitionsgüter</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <CategoryCard key={r.slug} category={r} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
