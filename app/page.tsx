import Image from 'next/image'
import Link from 'next/link'
import { CategoryGrid } from '@/components/CategoryGrid'
import { DeadlineBanner } from '@/components/DeadlineBanner'
import { GuideCards } from '@/components/GuideCards'
import { Faq } from '@/components/Faq'
import { OfferCard } from '@/components/OfferList'
import { OfferSearch } from '@/components/OfferSearch'
import { RegisterBanner } from '@/components/RegisterBanner'
import { TrustBar } from '@/components/TrustBar'
import { getCategory } from '@/lib/categories'
import { HOME_FAQ } from '@/lib/faq'
import { formatDeadline, iabYears } from '@/lib/iab'
import { getAllOffers } from '@/lib/offers'
import { guidesBySlug } from '@/lib/wissen'

export const revalidate = 300

const HERO_IMAGES = ['photovoltaik-iab', 'batteriespeicher-iab', 'mietcontainer-iab', 'tiny-house-iab', 'wohnmobil-iab', 'ladeinfrastruktur-iab']
  .map((slug) => getCategory(slug))
  .filter((c) => c?.image) as NonNullable<ReturnType<typeof getCategory>>[]


export default async function Home() {
  const years = iabYears()
  const latest = (await getAllOffers())
    .map((o) => ({ offer: o, category: getCategory(o.category_slug) }))
    // Categories still under review (e.g. mining hardware) are not promoted on the home page
    .filter((x): x is { offer: typeof x.offer; category: NonNullable<typeof x.category> } => Boolean(x.category && !x.category.comingSoon))
    .slice(0, 3)

  return (
    <>
      {/* Hero: search only (marketplace entry, like Milk the Sun) */}
      {/* No overflow-hidden on the section: the search dropdowns must be able to extend below the hero */}
      <section className="relative z-10 bg-slate-900">
        {/* Six category photos in two rows of three under a ~85 % navy overlay */}
        <div aria-hidden className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-2">
            {HERO_IMAGES.map((c) => (
              <div key={c.slug} className="relative">
                <Image
                  src={c.image!.src}
                  alt=""
                  fill
                  loading="eager"
                  sizes="34vw"
                  className="object-cover"
                  style={{ objectPosition: c.image!.position }}
                />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-slate-900/85" />
          <div className="pointer-events-none absolute -right-40 -top-40 h-120 w-120 rounded-full bg-emerald-500/15 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 py-12 text-center sm:py-20">
          <div>
            <DeadlineBanner />
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              Ihr IAB läuft aus?
              <br />
              <span className="text-emerald-400">Finden Sie das passende Investitionsgut.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-300 sm:text-lg">
              Von PV über Batteriespeicher bis zum Tiny House: Finden Sie die passende Investition für Ihren IAB. Alle Preise netto.
            </p>
            <OfferSearch className="mt-8 text-left" />
          </div>
        </div>
      </section>

      <TrustBar />

      {/* Current projects: one tile per category – no mixed offer list */}
      <section id="kategorien" className="mx-auto max-w-6xl scroll-mt-14 px-4 py-14">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Aktuelle Projekte</h2>
          <p className="mt-2 text-slate-500">Wählen Sie ein Investitionsgut und sehen Sie alle aktuellen Angebote. Alle Preise netto.</p>
        </div>
        <CategoryGrid />
      </section>

      {/* Newest offers with locked details – the main sign-up hook (like TinyMarket's ProjectsPreview) */}
      {latest.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-14">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Neueste Angebote</h2>
              <p className="mt-2 text-slate-500">Frisch eingetroffen. Alle Preise netto.</p>
            </div>
            <Link href="/angebote" className="font-semibold text-emerald-700 hover:underline">Alle Angebote →</Link>
          </div>
          <div className="space-y-4">
            {latest.map(({ offer, category }) => (
              <OfferCard key={offer.id} offer={offer} category={category} />
            ))}
          </div>
          <RegisterBanner />
        </section>
      )}


      {/* How it works */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">So funktioniert&apos;s</h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              ['Angebote suchen', 'Produkt und Budget wählen und alle passenden Angebote im Marktplatz sehen. Alle Preise netto.'],
              ['Angebot anfragen', 'Ein kurzes Formular, kein Passwort. Kalkulation und Unterlagen erhalten Sie sofort per E-Mail.'],
              ['Rückruf vom Anbieter', 'Der Anbieter meldet sich direkt bei Ihnen, kostenlos und unverbindlich.'],
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
