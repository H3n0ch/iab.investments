import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { Faq } from '@/components/Faq'
import { LeadForm } from '@/components/LeadForm'
import { MarketHeroImage, MarketHeroImageFallback } from '@/components/MarketHeroImage'
import { Marketplace } from '@/components/Marketplace'
import { CATEGORIES, formatEuro } from '@/lib/categories'
import type { FaqItem } from '@/lib/faq'
import { getAllOffers } from '@/lib/offers'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Aktuelle Projekte für Ihren IAB: PV, Batteriespeicher, Tiny Houses',
  description:
    'Reale Projekte für Ihren Investitionsabzugsbetrag: PV-Direktinvestments, Batteriespeicher und mobile Tiny Houses. Eckdaten sofort, Unterlagen und Kalkulation nach kostenloser Anfrage. Alle Preise netto.',
  alternates: { canonical: '/angebote' },
}

const MARKET_FAQ: FaqItem[] = [
  {
    q: 'Woher kommen die Projekte?',
    a: 'Es sind reale Projekte von Anbietern, mit denen wir zusammenarbeiten und die der Darstellung zugestimmt haben. Eckdaten sehen Sie sofort. Kennzahlen, Unterlagen und den Anbieter nennen wir nach Ihrer kostenlosen Anfrage, ohne Passwort. Wir melden uns persönlich und stellen den Kontakt her.',
  },
  {
    q: 'Sind die Preise netto oder brutto?',
    a: 'Alle Preise sind Nettopreise. Für vorsteuerabzugsberechtigte Unternehmer ist die Umsatzsteuer ein durchlaufender Posten, und auch für die Berechnung des IAB zählen die Nettoanschaffungskosten.',
  },
  {
    q: 'Welches Budget brauche ich für meinen IAB?',
    a: 'Der IAB darf höchstens 50 % der Anschaffungskosten betragen. Um einen IAB vollständig zu verwenden, investieren Sie also mindestens das Doppelte. Bei einem IAB von 50.000 € sind das 100.000 € netto, verteilt auf ein oder mehrere Wirtschaftsgüter.',
  },
  {
    q: 'Wer ist mein Vertragspartner?',
    a: 'Verträge schließen Sie direkt mit dem Anbieter. iab.investments stellt nur den Kontakt her, berät nicht zu konkreten Angeboten und erbringt keine Steuerberatung.',
  },
]

export default async function AngebotePage() {
  const offers = await getAllOffers()
  const minEntry = Math.min(...CATEGORIES.map((c) => c.minInvestment))
  // Same default as Marketplace: first category (demand order) that has offers
  const defaultSlug = (CATEGORIES.find((c) => offers.some((o) => o.category_slug === c.slug)) ?? CATEGORIES[0]).slug

  return (
    <>
      <section className="hero-under-header relative bg-slate-900">
        {/* Photo of the selected category under a ~85 % navy overlay, like the home hero */}
        <Suspense fallback={<MarketHeroImageFallback defaultSlug={defaultSlug} />}>
          <MarketHeroImage defaultSlug={defaultSlug} />
        </Suspense>
        <div className="relative mx-auto max-w-6xl px-4 py-8 sm:py-10">
          <nav className="text-xs text-slate-400">
            <Link href="/" className="hover:text-white">Start</Link> / Projekte
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Aktuelle Projekte für Ihren IAB</h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Projekte und Investitionsgüter für Ihren Investitionsabzugsbetrag, ab {formatEuro(minEntry)} netto. Wählen Sie ein Investitionsgut, filtern Sie nach Land und Budget und fordern Sie kostenlos Unterlagen an.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-sm">
            <Link href="/iab-rechner" className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500">
              Budget mit dem IAB-Rechner ermitteln
            </Link>
            <Link href="/so-funktionierts" className="rounded-lg px-4 py-2 font-semibold text-slate-200 ring-1 ring-white/20 hover:bg-white/10">
              So funktioniert&apos;s
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <Marketplace offers={offers} />
      </section>

      <section id="anfrage" className="mx-auto max-w-3xl scroll-mt-20 px-4 pb-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">Unterlagen & Kalkulation anfordern</h2>
          <p className="mb-4 mt-1 text-sm text-slate-500">
            Wir senden Ihnen passende Projekte, auch solche, die noch nicht online sind, und melden uns persönlich.
          </p>
          <LeadForm preselected={[]} source="landing" />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-6">
        <h2 className="mb-5 text-2xl font-bold tracking-tight text-slate-900">Fragen zu den Projekten</h2>
        <Faq items={MARKET_FAQ} />
        <p className="mt-4 text-sm text-slate-500">
          Sie bieten selbst Investitionsgüter an?{' '}
          <Link href="/anbieter" className="font-semibold text-emerald-700 hover:underline">Für Anbieter →</Link>
        </p>
      </section>
    </>
  )
}
