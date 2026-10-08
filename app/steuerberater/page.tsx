import type { Metadata } from 'next'
import Link from 'next/link'
import { Faq } from '@/components/Faq'
import { PartnerForm } from '@/components/PartnerForm'
import { CATEGORIES, formatEuro } from '@/lib/categories'
import type { FaqItem } from '@/lib/faq'
import { formatDeadline, iabYears } from '@/lib/iab'

export const metadata: Metadata = {
  title: 'Partnerprogramm für Steuerberater: Mandanten mit auslaufendem IAB unterstützen',
  description:
    'Ihre Mandanten haben einen Investitionsabzugsbetrag gebildet und suchen eine passende Investition? Mit dem Partnerprogramm von iab.investments geben Sie ihnen einen Marktüberblick, ohne selbst Anbieter suchen zu müssen.',
  alternates: { canonical: '/steuerberater' },
}

const PARTNER_FAQ: FaqItem[] = [
  {
    q: 'Beraten Sie meine Mandanten steuerlich?',
    a: 'Nein. Wir erbringen keine Steuerberatung und beraten auch nicht zu konkreten Angeboten. Wir zeigen Ihren Mandanten, welche Kategorien beweglicher Wirtschaftsgüter es gibt, und stellen den Kontakt zu Anbietern her. Die steuerliche Beurteilung bleibt vollständig bei Ihnen.',
  },
  {
    q: 'Was kostet das Partnerprogramm?',
    a: 'Für Sie und Ihre Mandanten ist die Teilnahme kostenlos. Wir finanzieren uns über die Anbieter, an die wir Anfragen weitergeben.',
  },
  {
    q: 'Erhalte ich eine Vergütung für Empfehlungen?',
    a: 'Darüber sprechen wir gern persönlich. Wir gestalten die Zusammenarbeit so, dass sie zu Ihrem Berufsrecht passt, insbesondere mit Blick auf die Unabhängigkeit, die Annahme von Vorteilen und mögliche Herausgabepflichten gegenüber Mandanten.',
  },
  {
    q: 'Wie wird eine Anfrage meiner Kanzlei zugeordnet?',
    a: 'Nach der Freischaltung erhalten Sie einen persönlichen Empfehlungslink. Anfragen, die Ihre Mandanten über diesen Link stellen, ordnen wir Ihrer Kanzlei zu. Dafür setzen wir keine Cookies, die Zuordnung erfolgt allein über den Link.',
  },
  {
    q: 'Erfahre ich, ob mein Mandant investiert hat?',
    a: 'Nur, wenn Ihr Mandant damit einverstanden ist. Ohne seine Einwilligung geben wir keine Daten an Sie weiter. Für die steuerliche Erfassung der Investition erhalten Sie die Unterlagen ohnehin von Ihrem Mandanten.',
  },
]

export default function SteuerberaterPage() {
  const years = iabYears()
  const minEntry = Math.min(...CATEGORIES.map((c) => c.minInvestment))

  return (
    <>
      <section className="hero-under-header bg-linear-to-br from-hero to-hero-2">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
          <nav className="text-xs text-slate-400">
            <Link href="/" className="hover:text-white">Start</Link> / Für Steuerberater
          </nav>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Partnerprogramm für Steuerberater
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-300">
            Ihre Mandanten haben einen Investitionsabzugsbetrag gebildet, aber noch keine passende Investition? Geben Sie ihnen mit
            iab.investments einen Marktüberblick über bewegliche Wirtschaftsgüter, ohne selbst Anbieter recherchieren zu müssen.
          </p>
          <Link href="#anmelden" className="mt-7 inline-block rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold text-white hover:bg-emerald-500">
            Kostenlos Partner werden
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-12 px-4 py-12 leading-relaxed text-slate-700">
        <section>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Das Problem kennen Sie aus Ihrer Kanzlei</h2>
          <p className="mt-3">
            Viele Ihrer Mandanten haben in den vergangenen Jahren einen IAB gebildet. Für einen IAB aus dem Wirtschaftsjahr {years[0]}{' '}
            endet die Investitionsfrist am <strong className="text-slate-900">{formatDeadline(years[0])}</strong>. Spätestens im Herbst
            kommt dann die Frage: „Was soll ich denn kaufen?“ Steht keine Investition im eigenen Betrieb an, droht die Rückgängigmachung
            mit Nachzahlung und Zinsen.
          </p>
          <p className="mt-3">
            Als Steuerberater können und wollen Sie keine Produkte empfehlen. Gleichzeitig möchten Sie Ihren Mandanten helfen, die Frist
            zu halten. Genau hier setzt iab.investments an: Wir bieten einen neutralen Überblick über Kategorien beweglicher
            Wirtschaftsgüter, von PV-Modulen über Batteriespeicher bis zu Containern und Tiny Houses, ab {formatEuro(minEntry)} netto.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Klare Rollenverteilung</h2>
          <p className="mt-3">
            Die steuerliche Beurteilung bleibt bei Ihnen. Wir erbringen keine Steuerberatung und beraten nicht zu konkreten Angeboten.
            Wir helfen Ihren Mandanten, die passende Kategorie für Betrag, Frist und Ziel zu finden, und stellen den Kontakt zu Anbietern
            her. Verträge schließen Ihre Mandanten direkt mit dem Anbieter. Ob ein konkretes Wirtschaftsgut für den IAB geeignet ist, klären
            sie mit Ihnen.
          </p>
          <p className="mt-3">
            Dadurch entsteht kein Wettbewerb zu Ihrer Kanzlei. Im Gegenteil: Ihre Mandanten kommen mit konkreten Angeboten und Unterlagen
            zu Ihnen zurück, die Sie steuerlich prüfen können.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">So funktioniert das Partnerprogramm</h2>
          <ol className="mt-5 space-y-5">
            {[
              ['Anmelden', 'Melden Sie Ihre Kanzlei über das Formular unten an. Das dauert zwei Minuten.'],
              ['Persönlicher Empfehlungslink', 'Nach einem kurzen Gespräch schalten wir Sie frei. Sie erhalten einen Link mit einer Seite für Ihre Mandanten, auf der Ihre Kanzlei als Empfehlungsgeber genannt ist.'],
              ['Mandanten informieren', 'Geben Sie den Link an Mandanten weiter, deren IAB ausläuft, zum Beispiel im Jahresabschlussgespräch, im Mandantenrundschreiben oder per E-Mail.'],
              ['Wir kümmern uns um den Rest', 'Ihre Mandanten sehen passende Investitionsgüter und erhalten Angebote. Anfragen über Ihren Link ordnen wir Ihrer Kanzlei zu.'],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">{i + 1}</span>
                <div>
                  <p className="font-semibold text-slate-900">{t}</p>
                  <p className="mt-1">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Material für Ihre Mandantenkommunikation</h2>
          <p className="mt-3">
            Unsere Ratgeber erklären die Grundlagen verständlich und eignen sich zum Weitergeben, etwa der Artikel{' '}
            <Link href="/ratgeber/iab-checkliste-jahresende" className="font-medium text-emerald-700 underline underline-offset-2">
              Checkliste: IAB-Investition vor dem Jahresende
            </Link>{' '}
            oder die{' '}
            <Link href="/ratgeber/iab-frist" className="font-medium text-emerald-700 underline underline-offset-2">
              Fristen-Tabelle zum IAB
            </Link>
            . Der{' '}
            <Link href="/iab-rechner" className="font-medium text-emerald-700 underline underline-offset-2">
              IAB-Rechner
            </Link>{' '}
            zeigt Ihren Mandanten, welches Investitionsvolumen nötig ist. Den{' '}
            <Link href="/angebote" className="font-medium text-emerald-700 underline underline-offset-2">
              Projekte
            </Link>{' '}
            können Sie jederzeit selbst ansehen.
          </p>
        </section>

        <section id="anmelden" className="scroll-mt-20">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-bold text-slate-900">Kanzlei anmelden</h2>
            <p className="mb-5 mt-1 text-sm text-slate-500">Kostenlos und unverbindlich. Pflichtfelder sind mit * markiert.</p>
            <PartnerForm />
          </div>
        </section>

        <section>
          <h2 className="mb-5 text-2xl font-bold tracking-tight text-slate-900">Fragen von Steuerberatern</h2>
          <Faq items={PARTNER_FAQ} />
        </section>
      </div>
    </>
  )
}
