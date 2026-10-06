import type { Metadata } from 'next'
import Link from 'next/link'
import { AufloesenRechner } from '@/components/AufloesenRechner'
import { Faq } from '@/components/Faq'
import { GuideCards } from '@/components/GuideCards'
import { OfferCard } from '@/components/OfferList'
import { getCategory } from '@/lib/categories'
import type { FaqItem } from '@/lib/faq'
import { daysUntilDeadline, formatDeadline, iabYears } from '@/lib/iab'
import { getAllOffers } from '@/lib/offers'
import { guidesBySlug } from '@/lib/wissen'

// Landing page for the highest-intent cluster: "IAB auflösen", "IAB Frist abgelaufen", "IAB rückgängig machen",
// "IAB Frist verlängern", "IAB auflösen Zinsen". /ratgeber/iab-frist stays the informational deadline page and links here.

export const revalidate = 300

export const metadata: Metadata = {
  title: 'IAB auflösen: Was passiert, wenn die Frist abläuft? Zinsen, Rückgängigmachung, Auswege',
  description:
    'IAB auflösen oder noch investieren? Berechnen Sie Steuernachzahlung und Zinsen bei Rückgängigmachung des Investitionsabzugsbetrags und finden Sie schnell lieferbare Investitionsgüter vor Fristende.',
  alternates: { canonical: '/iab-aufloesen' },
}

const FAQ: FaqItem[] = [
  {
    q: 'Was passiert, wenn ich den IAB nicht rechtzeitig investiere?',
    a: 'Der IAB wird im Jahr seiner Bildung rückgängig gemacht. Das Finanzamt ändert den Steuerbescheid dieses Jahres, auch wenn er schon bestandskräftig ist. Die damals gesparte Steuer ist nachzuzahlen, zuzüglich Zinsen nach § 233a AO.',
  },
  {
    q: 'Wie hoch sind die Zinsen, wenn der IAB aufgelöst wird?',
    a: '0,15 % pro vollem Monat auf die Einkommensteuer-Nachzahlung, also 1,8 % pro Jahr. Der Zinslauf beginnt 15 Monate nach Ende des Jahres, in dem der IAB gebildet wurde. Bei einem IAB aus 2023 laufen die Zinsen also ab April 2025.',
  },
  {
    q: 'Kann ich die IAB-Frist verlängern?',
    a: 'Nein. Für IAB aus den Jahren 2017 bis 2019 hatte der Gesetzgeber die Frist wegen der Corona-Pandemie verlängert. Diese Sonderregeln sind ausgelaufen. Für heute laufende IAB gilt die reguläre Frist bis zum Ende des dritten Folgejahres.',
  },
  {
    q: 'Kann ich einen IAB freiwillig auflösen?',
    a: 'Ja. Wenn absehbar ist, dass keine Investition erfolgt, kann der IAB auch vor Fristende freiwillig rückgängig gemacht werden. Die Nachzahlung fällt trotzdem an. Weil der geänderte Bescheid früher kommt, laufen aber weniger Zinsmonate auf. Ob das sinnvoll ist, klären Sie mit Ihrem Steuerberater.',
  },
  {
    q: 'Was passiert, wenn ich weniger investiere als geplant?',
    a: 'Dann wird nur der nicht genutzte Teil des IAB rückgängig gemacht. Der IAB darf höchstens 50 % der Anschaffungskosten betragen. Wer den vollen IAB nutzen will, muss also mindestens das Doppelte netto investieren.',
  },
  {
    q: 'Reicht es, vor Fristende zu bestellen?',
    a: 'Nein. Maßgeblich ist die Anschaffung, also in der Regel die Lieferung bzw. der Übergang des wirtschaftlichen Eigentums. Eine Bestellung oder Anzahlung im Dezember reicht nicht, wenn erst im Januar geliefert wird.',
  },
  {
    q: 'Muss ich genau das Wirtschaftsgut kaufen, das ich ursprünglich geplant hatte?',
    a: 'Nein. Seit 2016 muss das Wirtschaftsgut bei der Bildung nicht mehr benannt werden. Der IAB kann für jedes begünstigte bewegliche Wirtschaftsgut verwendet werden, das fristgerecht angeschafft und mindestens zu 90 % betrieblich genutzt oder vermietet wird.',
  },
]

const link = 'font-medium text-emerald-700 underline underline-offset-2'

export default async function IabAufloesenPage() {
  const years = iabYears()
  // Offers that can realistically be delivered before year end
  const fast = (await getAllOffers())
    .filter((o) => o.availability && /sofort|woche/i.test(o.availability))
    .slice(0, 3)
    .map((o) => ({ offer: o, category: getCategory(o.category_slug) }))
    .filter((x): x is { offer: typeof x.offer; category: NonNullable<typeof x.category> } => Boolean(x.category))

  return (
    <>
      <section className="bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
          <nav className="text-xs text-slate-400">
            <Link href="/" className="hover:text-white">Start</Link> / IAB auflösen
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">IAB auflösen oder noch investieren?</h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Läuft die Frist ab, wird der Investitionsabzugsbetrag rückwirkend aufgelöst: Steuernachzahlung plus 0,15 % Zinsen pro Monat.
            Berechnen Sie, was das kostet, und wie viel Zeit Ihnen noch bleibt. Alle Beträge netto.
          </p>

          {/* Countdown for the running vintages, most urgent first */}
          <div className="mb-8 mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {years.map((y, i) => {
              const d = daysUntilDeadline(y)
              return (
                <div key={y} className={`rounded-xl px-3 py-2.5 ring-1 ${i === 0 ? 'bg-amber-400/15 ring-amber-400/40' : 'bg-white/5 ring-white/10'}`}>
                  <p className="text-xs text-slate-400">IAB aus {y}</p>
                  <p className={`text-sm font-bold ${i === 0 ? 'text-amber-300' : 'text-white'}`}>bis {formatDeadline(y)}</p>
                  <p className="text-xs text-slate-400">{d > 0 ? `noch ${d} Tage` : 'abgelaufen'}</p>
                </div>
              )
            })}
          </div>

          <AufloesenRechner />
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-12 px-4 py-12 leading-relaxed text-slate-700">
        <section>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Was „IAB auflösen“ bedeutet</h2>
          <p className="mt-3">
            Ein Investitionsabzugsbetrag ist ein Versprechen an das Finanzamt: Sie dürfen bis zu 50 % einer geplanten Investition vorab vom
            Gewinn abziehen, müssen aber bis zum Ende des dritten Folgejahres tatsächlich investieren. Bleibt die Investition aus, wird der
            Abzug <strong>im Jahr seiner Bildung rückgängig gemacht</strong> (§ 7g Abs. 3 EStG). Das Finanzamt ändert dafür den damaligen
            Steuerbescheid, auch wenn er längst bestandskräftig ist.
          </p>
          <p className="mt-3">
            Umgangssprachlich heißt das „IAB auflösen“. Der Steuervorteil fällt weg, und weil die Steuer rückwirkend fällig wird, kommen
            Zinsen hinzu. Bis wann Ihre Frist läuft, zeigt die Tabelle im Ratgeber <Link href="/ratgeber/iab-frist" className={link}>IAB-Frist</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Was die Auflösung kostet</h2>
          <p className="mt-3">
            Zur Steuernachzahlung kommen Zinsen nach § 233a AO von <strong>0,15 % pro vollem Monat</strong>. Das Besondere beim IAB: Der
            Zinslauf beginnt nicht erst mit der Auflösung, sondern schon 15 Monate nach Ende des Jahres, in dem der IAB gebildet wurde.
          </p>
          <p className="mt-3">
            <strong>Beispiel:</strong> Ein Unternehmer hat für 2023 einen IAB von 50.000 € gebildet, bei 120.000 € zu versteuerndem
            Einkommen. Investiert er nicht bis zum 31.12.2026, zahlt er rund 23.000 € Steuern nach. Die Zinsen laufen ab April 2025. Kommt der
            geänderte Bescheid Mitte 2027, sind das 27 Monate, also weitere rund 850 €. Ihre eigenen Zahlen rechnen Sie oben im Rechner.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Kann man die Frist verlängern?</h2>
          <p className="mt-3">
            Nein. Während der Corona-Pandemie hatte der Gesetzgeber die Frist für IAB aus den Jahren 2017 bis 2019 ausnahmsweise verlängert.
            Diese Sonderregeln sind ausgelaufen. Für alle heute laufenden IAB gilt die reguläre Frist bis zum Ende des dritten Folgejahres,
            ohne Möglichkeit einer Verlängerung.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Freiwillig auflösen oder teilweise investieren</h2>
          <p className="mt-3">
            Steht fest, dass keine Investition mehr kommt, können Sie den IAB auch <strong>vor Fristende freiwillig rückgängig machen</strong>.
            Die Nachzahlung bleibt gleich, aber weil der geänderte Bescheid früher kommt, laufen weniger Zinsmonate auf.
          </p>
          <p className="mt-3">
            Investieren Sie weniger als geplant, wird nur der ungenutzte Teil aufgelöst. Weil der IAB höchstens 50 % der Anschaffungskosten
            betragen darf, deckt eine Investition von 60.000 € netto zum Beispiel einen IAB von 30.000 €. Ob eine Teilinvestition oder die
            freiwillige Auflösung für Sie günstiger ist, klären Sie mit Ihrem Steuerberater.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Auswege bei knapper Zeit</h2>
          <p className="mt-3">
            Der IAB ist nicht an das ursprünglich geplante Wirtschaftsgut gebunden. Sie können ihn für jedes{' '}
            <Link href="/ratgeber/bewegliche-wirtschaftsgueter" className={link}>bewegliche Wirtschaftsgut</Link> verwenden, das bis Fristende
            angeschafft und im Anschaffungs- und Folgejahr zu mindestens 90 % betrieblich genutzt oder vermietet wird. Auch{' '}
            <Link href="/ratgeber/iab-direktinvestment-betreibermodell" className={link}>Betreibermodelle</Link> kommen infrage.
          </p>
          <p className="mt-3">
            Entscheidend ist die <strong>Lieferung</strong>, nicht die Bestellung. Kurze Lieferzeiten gibt es oft bei{' '}
            <Link href="/ladeinfrastruktur-iab" className={link}>Ladeinfrastruktur</Link>, <Link href="/mietcontainer-iab" className={link}>Containern</Link>{' '}
            und <Link href="/photovoltaik-iab" className={link}>PV-Modulpaketen</Link>. Was Sie vor dem Jahresende prüfen sollten, zeigt die{' '}
            <Link href="/ratgeber/iab-checkliste-jahresende" className={link}>IAB-Checkliste</Link>.
          </p>
        </section>
      </div>

      {fast.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-12">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Schnell verfügbare Angebote</h2>
              <p className="mt-1 text-slate-500">Sofort oder in wenigen Wochen lieferbar. Alle Preise netto.</p>
            </div>
            <Link href="/angebote" className="font-semibold text-emerald-700 hover:underline">Alle Angebote →</Link>
          </div>
          <div className="space-y-4">
            {fast.map(({ offer, category }) => (
              <OfferCard key={offer.id} offer={offer} category={category} />
            ))}
          </div>
        </section>
      )}

      <div className="mx-auto max-w-3xl space-y-12 px-4 pb-12">
        <section>
          <h2 className="mb-5 text-2xl font-bold tracking-tight text-slate-900">Häufige Fragen zur IAB-Auflösung</h2>
          <Faq items={FAQ} />
        </section>
        <p className="rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-500">
          Allgemeine Information, keine Steuerberatung. iab.investments stellt den Kontakt zu Anbietern beweglicher Wirtschaftsgüter her und
          berät nicht zu konkreten Angeboten. Ob und wie Sie Ihren IAB verwenden oder auflösen, klären Sie bitte mit Ihrem Steuerberater.
        </p>
      </div>

      <section className="mx-auto max-w-6xl px-4">
        <h2 className="mb-5 text-xl font-bold tracking-tight text-slate-900">Weiterlesen</h2>
        <GuideCards guides={guidesBySlug(['iab-frist', 'iab-checkliste-jahresende', 'iab-voraussetzungen'])} />
      </section>
    </>
  )
}
