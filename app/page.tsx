import Image from 'next/image'
import Link from 'next/link'
import { CategoryGrid } from '@/components/CategoryGrid'
import { DeadlineBanner } from '@/components/DeadlineBanner'
import { GuideCards } from '@/components/GuideCards'
import { Faq } from '@/components/Faq'
import { OfferCard } from '@/components/OfferList'
import { OfferSearch } from '@/components/OfferSearch'
import { FristCta } from '@/components/FristCta'
import { TrustBar } from '@/components/TrustBar'
import { TrustBlock } from '@/components/TrustBlock'
import { getCategory } from '@/lib/categories'
import { HOME_FAQ } from '@/lib/faq'
import { formatDeadline, iabYears } from '@/lib/iab'
import { getAllOffers } from '@/lib/offers'
import { guidesBySlug } from '@/lib/wissen'

export const revalidate = 300

const HERO_IMAGE = getCategory('batteriespeicher-iab')!.image!

export default async function Home() {
  const years = iabYears()
  const latest = (await getAllOffers())
    .map((o) => ({ offer: o, category: getCategory(o.category_slug) }))
    // Categories still under review (e.g. mining hardware) are not promoted on the home page
    .filter((x): x is { offer: typeof x.offer; category: NonNullable<typeof x.category> } => Boolean(x.category && !x.category.comingSoon))
    .slice(0, 3)

  return (
    <>
      {/* Hero: full-height photos, header floating on top, slogan, glass subline, search */}
      {/* No overflow-hidden on the section: the search dropdowns must be able to extend below the hero */}
      <section className="hero-under-header relative z-10 flex min-h-svh flex-col bg-slate-900">
        {/* One full-bleed photo, no colour filter – only a light neutral shade at the top (header) and behind the text */}
        <div aria-hidden className="absolute inset-0 overflow-hidden">
          <Image
            src={HERO_IMAGE.src}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: HERO_IMAGE.position }}
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/45 via-black/10 to-black/25" />
        </div>

        <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-12 text-center">
          <DeadlineBanner />
          <h1 className="mt-6 text-balance text-[clamp(32px,4.4vw,52px)] font-bold leading-[1.08] tracking-[-0.02em] text-white [text-shadow:0_2px_6px_rgba(0,0,0,.35),0_10px_36px_rgba(0,0,0,.35)]">
            Investieren statt abführen.
          </h1>
          {/* Exactly two lines from sm up: one sentence per line */}
          <div className="mt-4 max-w-full text-balance rounded-[14px] bg-[rgb(9_24_38/0.42)] px-[18px] py-2.5 shadow-[0_10px_30px_-14px_rgba(0,0,0,.5)] ring-1 ring-white/15 backdrop-blur-[10px]">
            <p className="text-[clamp(15px,1.15vw,17px)] font-medium leading-normal text-white sm:whitespace-nowrap">Ratgeber und geprüfte Projekte für Ihren Investitionsabzugsbetrag.</p>
            <p className="mt-1 text-sm text-slate-300 sm:whitespace-nowrap">Von PV über Batteriespeicher bis zum Tiny House.</p>
          </div>
          <OfferSearch className="mt-[clamp(28px,4vh,44px)] w-full text-left" />
        </div>

        <a
          href="#kategorien"
          aria-label="Weiter nach unten"
          className="relative mx-auto mb-6 flex h-11 w-11 items-center justify-center rounded-full bg-slate-900/50 text-white ring-1 ring-white/30 backdrop-blur transition-colors hover:bg-slate-900/70"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5" aria-hidden>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </a>
      </section>

      <TrustBar />

      {/* Current projects: one tile per category – no mixed offer list */}
      <section id="kategorien" className="mx-auto max-w-6xl scroll-mt-14 px-4 py-14">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Aktuelle Projekte</h2>
          <p className="mt-2 text-slate-500">Wählen Sie ein Investitionsgut und sehen Sie reale Projekte unserer Anbieter. Alle Preise netto.</p>
        </div>
        <CategoryGrid />
      </section>

      {/* Newest offers with locked details – details come with the free inquiry */}
      {latest.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-14">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Neueste Projekte</h2>
              <p className="mt-2 text-slate-500">Frisch eingetroffen. Alle Preise netto.</p>
            </div>
            <Link href="/angebote" className="font-semibold text-emerald-700 hover:underline">Alle Projekte →</Link>
          </div>
          <div className="space-y-4">
            {latest.map(({ offer, category }) => (
              <OfferCard key={offer.id} offer={offer} category={category} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl space-y-6 px-4 pb-14">
        <FristCta />
        <TrustBlock />
      </section>


      {/* How it works */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">So funktioniert&apos;s</h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              ['Frist prüfen', 'Frist-Check oder IAB-Rechner: Sie sehen, bis wann und wie viel Sie investieren müssen.'],
              ['Unterlagen anfordern', 'Ein kurzes Formular, kein Passwort. Projektdetails sehen Sie sofort, Kalkulation und Unterlagen folgen.'],
              ['Persönlicher Rückruf', 'Wir melden uns und stellen den Kontakt zum passenden Anbieter her, kostenlos und unverbindlich.'],
            ].map(([t, d], i) => (
              <li key={t} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">{i + 1}</span>
                <p className="mt-3 font-semibold text-slate-900">{t}</p>
                <p className="mt-1 text-sm text-slate-500">{d}</p>
              </li>
            ))}
          </ol>
          <Link href="/so-funktionierts" className="mt-6 inline-block font-semibold text-emerald-700 hover:underline">
            Mehr zum Ablauf, zu Kosten und Datenschutz →
          </Link>
        </div>
      </section>

      {/* Deadline explainer */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-8 rounded-3xl bg-slate-900 p-6 text-white sm:p-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Die IAB-Frist kurz erklärt</h2>
            <p className="mt-3 text-slate-300">
              Ein Investitionsabzugsbetrag muss bis zum Ende des dritten auf seine Bildung folgenden Wirtschaftsjahres
              investiert werden. Sonst wird er rückwirkend aufgelöst, und es fallen Nachzahlungszinsen an.
            </p>
            <Link href="/ratgeber/iab-frist" className="mt-5 inline-block font-semibold text-emerald-400 hover:underline">
              Zum Ratgeber →
            </Link>
          </div>
          <table className="w-full self-center text-sm">
            <thead>
              <tr className="text-left text-slate-400">
                <th className="pb-2 font-medium">IAB gebildet für</th>
                <th className="pb-2 font-medium">Investieren bis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {years.map((y, i) => (
                <tr key={y}>
                  <td className="py-2.5">Wirtschaftsjahr {y}</td>
                  <td className={`py-2.5 font-semibold ${i === 0 ? 'text-amber-300' : ''}`}>{formatDeadline(y)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Tax advisor partner programme */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="grid items-center gap-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Für Steuerberater</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Ihre Mandanten fragen: „Was soll ich mit dem IAB kaufen?“</h2>
            <p className="mt-2 max-w-2xl text-slate-600">
              Geben Sie ihnen mit unserem kostenlosen Partnerprogramm einen Marktüberblick über bewegliche Wirtschaftsgüter. Die
              steuerliche Beurteilung bleibt bei Ihnen, wir stellen nur den Kontakt zu Anbietern her.
            </p>
          </div>
          <Link href="/steuerberater" className="justify-self-start rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold text-white hover:bg-emerald-500">
            Partner werden →
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">IAB-Wissen</h2>
            <p className="mt-2 text-slate-500">Regeln, Fristen und Fallstricke verständlich erklärt.</p>
          </div>
          <Link href="/ratgeber" className="font-semibold text-emerald-700 hover:underline">Alle Ratgeber →</Link>
        </div>
        <GuideCards guides={guidesBySlug(['investitionsabzugsbetrag', 'sonderabschreibung-7g', 'iab-direktinvestment-betreibermodell'])} />
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-6">
        <h2 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">Häufige Fragen</h2>
        <Faq items={HOME_FAQ} />
        <Link href="/ratgeber/iab-faq" className="mt-4 inline-block font-semibold text-emerald-700 hover:underline">
          Alle Fragen zum IAB →
        </Link>
      </section>
    </>
  )
}
