import Link from 'next/link'
import { Faq } from '@/components/Faq'
import { GuideCards } from '@/components/GuideCards'
import { IabRechner } from '@/components/IabRechner'
import { CATEGORIES, type Category } from '@/lib/categories'
import type { FaqItem } from '@/lib/faq'
import { getAllOffers } from '@/lib/offers'
import { computeCalc, eur, pct } from '@/lib/rechner'
import { guidesBySlug } from '@/lib/wissen'

// Shared by /iab-rechner and /iab-rechner/[kategorie] (same calculator, preselected investment good)

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://iab.investments'

/** /iab-rechner/photovoltaik ↔ category slug photovoltaik-iab */
export function rechnerSlug(c: Category): string {
  return c.slug.replace(/-iab$/, '')
}

const EXAMPLES = [
  { label: 'Einzelunternehmer, ledig', zvE: 90000, joint: false, investment: 60000 },
  { label: 'Freiberuflerin, verheiratet', zvE: 160000, joint: true, investment: 120000 },
  { label: 'Unternehmer, Spitzensteuersatz', zvE: 120000, joint: false, investment: 200000 },
  { label: 'Gutverdiener mit hohem Gewinn', zvE: 180000, joint: false, investment: 160000 },
]

export const RECHNER_FAQ: FaqItem[] = [
  {
    q: 'Wie berechne ich den Investitionsabzugsbetrag?',
    a: 'Der IAB beträgt höchstens 50 % der voraussichtlichen Anschaffungskosten eines beweglichen Wirtschaftsguts, insgesamt höchstens 200.000 € je Betrieb. Die Steuerwirkung ist die Differenz aus Einkommensteuer, Solidaritätszuschlag und Kirchensteuer mit und ohne IAB.',
  },
  {
    q: 'Warum spart nicht jeder Euro IAB gleich viel?',
    a: 'Weil der Steuertarif progressiv ist. Solange Ihr Einkommen im Bereich des Spitzensteuersatzes bleibt, spart jeder Euro rund 44 % (42 % plus Solidaritätszuschlag). Drückt der IAB das Einkommen darunter, sinkt der Grenzsteuersatz Schritt für Schritt. Die Kurve im Rechner zeigt genau, ab wann.',
  },
  {
    q: 'Lohnt es sich, den IAB auf mehrere Jahre zu verteilen?',
    a: 'Oft ja. Wer statt eines großen IAB zwei kleinere in zwei Jahren bildet, bleibt in beiden Jahren länger im hohen Grenzsteuersatz. Bei 120.000 € Einkommen bringen 2 × 50.000 € rund 46.300 € statt 39.900 €, bei derselben Investition von 200.000 € netto. Voraussetzung ist ein ähnliches Einkommen in beiden Jahren.',
  },
  {
    q: 'Wie viel muss ich investieren, um meinen IAB zu nutzen?',
    a: 'Mindestens das Doppelte des IAB, weil der IAB höchstens 50 % der Anschaffungskosten betragen darf. Ein IAB von 50.000 € erfordert also eine Investition von mindestens 100.000 € netto.',
  },
  {
    q: 'Gilt der Rechner auch für eine GmbH?',
    a: 'Nein. Der Rechner bildet die Einkommensteuer ab. Eine GmbH zahlt Körperschaftsteuer, Solidaritätszuschlag und Gewerbesteuer zu einem nahezu festen Satz von rund 30 %. Dort gibt es keinen Progressionseffekt.',
  },
  {
    q: 'Ist das Ergebnis verbindlich?',
    a: 'Nein. Der Rechner ist eine Rechenhilfe und ersetzt keine Steuerberatung. Gewerbesteuer, Kinderfreibeträge bei der Kirchensteuer, Verluste und besondere Einkünfte sind nicht berücksichtigt. Lassen Sie Ihre Situation von Ihrem Steuerberater berechnen.',
  },
]

const AUDIENCES = [
  { t: 'Spitzenverdiener', d: 'Wer im 42-%-Bereich liegt, stundet mit jedem Euro IAB rund 44 % Steuern.', href: '/ratgeber/spitzensteuersatz-senken' },
  { t: 'Freiberufler', d: 'Ärzte, Berater, Architekten: IAB für bewegliche Wirtschaftsgüter, mit Blick auf die Abfärbewirkung.', href: '/ratgeber/iab-rechtsform-gmbh-freiberufler' },
  { t: 'Gutverdiener', d: 'Welche Hebel Angestellte und Unternehmer haben, und wo der IAB passt.', href: '/ratgeber/steuern-sparen-gutverdiener' },
  { t: 'Abfindung', d: 'Fünftelregelung, Sachwerte und die Frage, wann ein IAB überhaupt möglich ist.', href: '/ratgeber/abfindung-anlegen' },
]

export async function RechnerPage({ category }: { category?: Category }) {
  // Offers for the result step („Passende Angebote für Ihre … IAB“)
  const offers = await getAllOffers()
  const subject = category ? `für ${category.name}` : ''

  const appLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `IAB-Rechner ${subject}`.trim(),
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    url: `${APP_URL}/iab-rechner${category ? `/${rechnerSlug(category)}` : ''}`,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appLd) }} />
      <section className="bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
          <nav className="text-xs text-slate-400">
            <Link href="/" className="hover:text-white">Start</Link> /{' '}
            {category ? (
              <>
                <Link href="/iab-rechner" className="hover:text-white">IAB-Rechner</Link> / {category.name}
              </>
            ) : (
              'IAB-Rechner'
            )}
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {category ? `IAB-Rechner ${category.name}` : 'IAB-Rechner 2026'}: Steuerersparnis live berechnen
          </h1>
          <p className="mb-8 mt-3 max-w-3xl text-slate-300">
            Einkommen, Investition und IAB eingeben und sofort sehen, wie viel Steuer Sie sparen, wie viel jeder weitere Euro bringt und ob
            sich die Verteilung auf mehrere Jahre lohnt. Tarif nach § 32a EStG für 2023 bis 2026, mit Solidaritätszuschlag und Kirchensteuer.
            Alle Beträge netto.
          </p>
          <IabRechner initialCategory={category?.slug} offers={offers} />
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-12 px-4 py-12 leading-relaxed text-slate-700">
        <section>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">So rechnet der IAB-Rechner</h2>
          <p className="mt-3">
            Der Rechner ermittelt Einkommensteuer, Solidaritätszuschlag und Kirchensteuer einmal ohne und einmal mit Investitionsabzugsbetrag.
            Die Differenz ist Ihre Steuerersparnis im Jahr der Bildung. Grundlage ist der Tarif nach § 32a EStG des gewählten Jahres, beim
            Splittingverfahren die doppelte Steuer auf das halbe Einkommen. Der Solidaritätszuschlag wird mit Freigrenze und Milderungszone
            berechnet.
          </p>
          <p className="mt-3">
            Anders als viele Rechner bewertet unser Hinweis den <strong>gesamten IAB</strong>, nicht nur den Steuersatz vor dem ersten Euro.
            Die Kurve zeigt, ab welchem Betrag der Grenzsteuersatz sinkt, und der Mehrjahres-Vergleich, ob sich ein Teil des IAB in einem
            Folgejahr besser auswirkt. Im Jahr der Investition wird der IAB wieder hinzugerechnet. Dann sind zusätzlich bis zu 40 %{' '}
            <Link href="/ratgeber/sonderabschreibung-7g" className="font-medium text-emerald-700 underline underline-offset-2">Sonderabschreibung</Link>{' '}
            möglich.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Beispielrechnungen 2026</h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Fall</th>
                  <th className="px-4 py-2.5 font-medium">Einkommen</th>
                  <th className="px-4 py-2.5 font-medium">Investition</th>
                  <th className="px-4 py-2.5 font-medium">IAB</th>
                  <th className="px-4 py-2.5 font-medium">Ersparnis</th>
                  <th className="px-4 py-2.5 font-medium">2 Jahre</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 tabular-nums">
                {EXAMPLES.map((e) => {
                  const r = computeCalc({ ...e, year: 2026, church: 0, businesses: 1, profit: e.zvE, iab: null, category: '' })
                  return (
                    <tr key={e.label}>
                      <td className="px-4 py-2.5">{e.label}</td>
                      <td className="px-4 py-2.5">{eur(e.zvE)}{e.joint ? ' (Splitting)' : ''}</td>
                      <td className="px-4 py-2.5">{eur(e.investment)}</td>
                      <td className="px-4 py-2.5">{eur(r.iab)}</td>
                      <td className="px-4 py-2.5 font-semibold text-emerald-700">{eur(r.saving)} <span className="font-normal text-slate-400">({pct(r.effRate)})</span></td>
                      <td className="px-4 py-2.5">{eur(r.split2.saving)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-slate-400">Tarif 2026, ohne Kirchensteuer, voller IAB. „2 Jahre“: derselbe IAB auf zwei Bildungsjahre verteilt, bei gleichem Einkommen. Keine Steuerberatung.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Für wen sich der Rechner lohnt</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {AUDIENCES.map((a) => (
              <Link key={a.t} href={a.href} className="rounded-xl border border-slate-200 bg-white p-4 hover:border-emerald-500 hover:shadow-sm">
                <p className="font-semibold text-slate-900">{a.t} →</p>
                <p className="mt-1 text-sm text-slate-500">{a.d}</p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Rechtsgrundlage</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li><strong>§ 7g Abs. 1 EStG:</strong> IAB bis 50 % der Anschaffungskosten, höchstens 200.000 € je Betrieb, Gewinngrenze 200.000 €.</li>
            <li><strong>§ 7g Abs. 2 und 3 EStG:</strong> Hinzurechnung im Investitionsjahr, Rückgängigmachung bei fehlender Investition innerhalb von drei Jahren, Zinsen nach § 233a AO.</li>
            <li><strong>§ 7g Abs. 5 EStG:</strong> Sonderabschreibung bis 40 % im Jahr der Anschaffung und den vier Folgejahren.</li>
            <li><strong>§ 32a EStG:</strong> Einkommensteuertarif, <strong>SolZG:</strong> Solidaritätszuschlag mit Freigrenze und Milderungszone.</li>
          </ul>
          <p className="mt-3 text-sm">
            Fristen im Detail: <Link href="/ratgeber/iab-frist" className="font-medium text-emerald-700 underline underline-offset-2">IAB-Frist</Link>.
            Alle Voraussetzungen: <Link href="/ratgeber/iab-voraussetzungen" className="font-medium text-emerald-700 underline underline-offset-2">IAB-Voraussetzungen</Link>.
          </p>
        </section>

        {!category && (
          <section>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Rechner nach Investitionsgut</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link href={`/iab-rechner/${rechnerSlug(c)}`} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:border-slate-300 hover:shadow-sm">
                    IAB-Rechner {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h2 className="mb-5 text-2xl font-bold tracking-tight text-slate-900">Fragen zum IAB-Rechner</h2>
          <Faq items={RECHNER_FAQ} />
        </section>
      </div>

      <section className="mx-auto max-w-6xl px-4">
        <h2 className="mb-5 text-xl font-bold tracking-tight text-slate-900">Weiterlesen</h2>
        <GuideCards
          guides={guidesBySlug(
            category?.slug === 'photovoltaik-iab'
              ? ['iab-photovoltaik', 'photovoltaik-investment', 'sonderabschreibung-7g']
              : category?.slug === 'batteriespeicher-iab'
                ? ['batteriespeicher-investment', 'investitionsabzugsbetrag', 'sonderabschreibung-7g']
                : ['investitionsabzugsbetrag', 'spitzensteuersatz-senken', 'iab-checkliste-jahresende'],
          )}
        />
      </section>
    </>
  )
}
