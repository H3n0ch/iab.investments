import type { Metadata } from 'next'
import Link from 'next/link'
import { Faq } from '@/components/Faq'
import { FristCheck } from '@/components/FristCheck'
import { GuideCards } from '@/components/GuideCards'
import { TrustBlock } from '@/components/TrustBlock'
import type { FaqItem } from '@/lib/faq'
import { formatDeadline, fristPath, FRIST_PAGE_YEARS } from '@/lib/iab'
import { getAllOffers } from '@/lib/offers'
import { guidesBySlug } from '@/lib/wissen'

// Deadline page per formation year (/iab-2023-frist, /iab-2024-frist …).
// Target keywords: „iab <year> wann auflösen“, „investitionsabzugsbetrag <year>“.

export function fristMetadata(year: number): Metadata {
  const deadline = formatDeadline(year)
  return {
    title: `IAB ${year} auflösen: Frist ${deadline} – bis wann investieren?`,
    description: `Investitionsabzugsbetrag ${year}: Investieren Sie bis ${deadline}, sonst wird der IAB rückgängig gemacht – mit Nachzahlung und Zinsen. Frist-Check, Countdown und passende Projekte.`,
    alternates: { canonical: fristPath(year) },
  }
}

function faq(year: number): FaqItem[] {
  const deadline = formatDeadline(year)
  return [
    {
      q: `Wann muss ich den IAB ${year} auflösen?`,
      a: `Gar nicht, wenn Sie rechtzeitig investieren. Ein IAB, den Sie für das Wirtschaftsjahr ${year} gebildet haben, muss bis zum Ende des dritten Folgejahres verwendet werden, also bis ${deadline}. Bis dahin muss ein begünstigtes bewegliches Wirtschaftsgut angeschafft sein. Andernfalls macht das Finanzamt den Abzug im Jahr ${year} rückgängig.`,
    },
    {
      q: `Was passiert, wenn ich bis ${deadline} nicht investiere?`,
      a: `Der Steuerbescheid ${year} wird geändert, auch wenn er bestandskräftig ist. Die gesparte Steuer ist nachzuzahlen, zuzüglich Zinsen von 0,15 % pro vollem Monat ab dem 1. April ${year + 2} (§ 233a AO).`,
    },
    {
      q: 'Reicht es, im Dezember zu bestellen?',
      a: 'Nein. Maßgeblich ist die Anschaffung, also in der Regel Lieferung bzw. Übergang des wirtschaftlichen Eigentums. Eine Bestellung oder Anzahlung reicht nicht, wenn erst im Januar geliefert wird.',
    },
    {
      q: 'Wie viel muss ich investieren?',
      a: 'Der IAB darf höchstens 50 % der Anschaffungskosten betragen. Um einen IAB von 50.000 € voll zu nutzen, brauchen Sie also mindestens 100.000 € netto Investition. Investieren Sie weniger, wird nur der ungenutzte Teil rückgängig gemacht.',
    },
    {
      q: 'Muss ich das ursprünglich geplante Wirtschaftsgut kaufen?',
      a: 'Nein. Seit 2016 muss das Wirtschaftsgut bei der Bildung nicht benannt werden. Sie können den IAB für jedes begünstigte bewegliche Wirtschaftsgut verwenden, das im Jahr der Anschaffung und im Folgejahr zu mindestens 90 % betrieblich genutzt oder vermietet wird.',
    },
  ]
}

const link = 'font-medium text-emerald-700 underline underline-offset-2'

export async function FristJahrgangPage({ year }: { year: number }) {
  const deadline = formatDeadline(year)
  const offers = await getAllOffers()
  const others = FRIST_PAGE_YEARS.filter((y) => y !== year)

  return (
    <>
      <section className="hero-under-header bg-linear-to-br from-hero to-hero-2">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
          <nav className="text-xs text-slate-400">
            <Link href="/" className="hover:text-white">Start</Link> / <Link href="/iab-aufloesen" className="hover:text-white">IAB auflösen</Link> / IAB {year}
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            IAB {year} auflösen: Frist {deadline}
          </h1>
          <p className="mb-8 mt-3 max-w-3xl text-slate-300">
            Haben Sie für {year} einen Investitionsabzugsbetrag gebildet, muss die Investition bis {deadline} geliefert sein. Sonst wird der IAB
            rückwirkend aufgelöst: Steuernachzahlung plus Zinsen. Prüfen Sie hier Ihre Frist und was das Versäumen kostet.
          </p>
          <FristCheck defaultYear={year} offers={offers} />
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-12 px-4 py-12 leading-relaxed text-slate-700">
        <section>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Bis wann muss der IAB {year} investiert sein?</h2>
          <p className="mt-3">
            Ein IAB gilt für die drei Wirtschaftsjahre nach seiner Bildung (§ 7g Abs. 3 EStG). Für einen IAB aus dem Wirtschaftsjahr {year}{' '}
            endet die Frist am <strong>{deadline}</strong>. Bei abweichendem Wirtschaftsjahr verschiebt sich das Datum entsprechend.
          </p>
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <tbody>
                {[
                  ['IAB gebildet für', `Wirtschaftsjahr ${year}`],
                  ['Investition spätestens', deadline],
                  ['Zinslauf bei Auflösung ab', `01.04.${year + 2}`],
                  ['Nötige Investition', 'mindestens das Doppelte des IAB, netto'],
                ].map(([k, v]) => (
                  <tr key={k} className="border-b border-slate-100 last:border-0">
                    <td className="bg-slate-50 px-4 py-2.5 text-slate-500">{k}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-900">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Was bei Fristablauf passiert</h2>
          <p className="mt-3">
            Wird nicht rechtzeitig investiert, macht das Finanzamt den Abzug im Jahr {year} rückgängig und ändert den damaligen Bescheid. Die gesparte
            Steuer ist nachzuzahlen. Dazu kommen Zinsen nach § 233a AO von 0,15 % pro vollem Monat, und zwar rückwirkend ab dem 1. April {year + 2}.
            Weitere Details und die Möglichkeit der freiwilligen Auflösung erklärt die Seite <Link href="/iab-aufloesen" className={link}>IAB auflösen</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Was bis {deadline} noch lieferbar ist</h2>
          <p className="mt-3">
            Entscheidend ist die Lieferung, nicht die Bestellung. Bei Direktinvestments übernimmt ein Betreiber Aufbau und Betrieb, Sie werden Eigentümer
            des Wirtschaftsguts: <Link href="/photovoltaik-iab" className={link}>PV-Module in einem Solarpark</Link>,{' '}
            <Link href="/batteriespeicher-iab" className={link}>Batteriespeicher</Link> oder{' '}
            <Link href="/tiny-house-iab" className={link}>mobile Tiny Houses</Link> zur Vermietung. Fordern Sie Unterlagen früh an, damit Kaufvertrag
            und Lieferung vor dem Jahresende sicher stehen.
          </p>
        </section>

        <section>
          <h2 className="mb-5 text-2xl font-bold tracking-tight text-slate-900">Häufige Fragen zum IAB {year}</h2>
          <Faq items={faq(year)} />
        </section>

        <TrustBlock />

        <p className="rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-500">
          Quelle: § 7g Abs. 1–4 EStG, § 233a AO, § 238 Abs. 1a AO. Allgemeine Information, keine Steuerberatung. Ob und wie Sie Ihren IAB verwenden
          oder auflösen, klären Sie bitte mit Ihrem Steuerberater.
        </p>
      </div>

      <section className="mx-auto max-w-6xl px-4">
        <h2 className="mb-5 text-xl font-bold tracking-tight text-slate-900">Weiterlesen</h2>
        {others.length > 0 && (
          <p className="mb-4 text-sm text-slate-600">
            Andere Jahrgänge:{' '}
            {others.map((y, i) => (
              <span key={y}>
                {i > 0 && ' · '}
                <Link href={fristPath(y)} className={link}>IAB {y}: Frist {formatDeadline(y)}</Link>
              </span>
            ))}
          </p>
        )}
        <GuideCards guides={guidesBySlug(['iab-frist', 'iab-checkliste-jahresende', 'iab-voraussetzungen'])} />
      </section>
    </>
  )
}
