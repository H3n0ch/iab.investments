import type { Metadata } from 'next'
import Link from 'next/link'
import { Faq } from '@/components/Faq'
import { ProviderForm } from '@/components/ProviderForm'
import { CATEGORIES } from '@/lib/categories'
import type { FaqItem } from '@/lib/faq'
import { formatDeadline, iabYears } from '@/lib/iab'

export const metadata: Metadata = {
  title: 'Für Anbieter: Investitionsgüter für IAB-Investoren vorstellen',
  description:
    'Sie bieten bewegliche Wirtschaftsgüter für den Investitionsabzugsbetrag an? Stellen Sie Ihr Produkt auf iab.investments vor und erreichen Sie Unternehmer mit auslaufendem IAB.',
  alternates: { canonical: '/anbieter' },
}

const PROVIDER_FAQ: FaqItem[] = [
  {
    q: 'Welche Produkte passen zu iab.investments?',
    a: 'Abnutzbare bewegliche Wirtschaftsgüter, die Unternehmer für ihren Investitionsabzugsbetrag nutzen können, zum Beispiel PV-Module, Batteriespeicher, Container, Tiny Houses, Ladeinfrastruktur, Wohnmobile, Werbeflächen oder Mining-Hardware. Gebäude, Grundstücke, Fondsbeteiligungen und Software passen nicht.',
  },
  {
    q: 'Was kostet die Vorstellung meines Produkts?',
    a: 'Die Einreichung ist kostenlos und unverbindlich. Die Konditionen für die Vermittlung von Anfragen besprechen wir nach der Sichtung persönlich mit Ihnen.',
  },
  {
    q: 'Wie lange dauert die Freischaltung?',
    a: 'In der Regel melden wir uns innerhalb weniger Werktage. Wenn Angaben fehlen, fragen wir nach. Sobald alles vollständig ist, schalten wir das Angebot frei.',
  },
  {
    q: 'Welche Angaben werden öffentlich angezeigt?',
    a: 'Öffentlich sichtbar sind Titel, Kurzbeschreibung, Standort, Mindestinvestition (netto), Verfügbarkeit, Ertragsangabe und Bilder. Ausführliche Beschreibung, Kennzahlen und Unterlagen sehen nur registrierte Nutzer. Ihr Firmenname wird nicht öffentlich angezeigt.',
  },
  {
    q: 'Wie erhalte ich Anfragen?',
    a: 'Interessenten wählen Kategorien oder konkrete Angebote und willigen ausdrücklich in die Weitergabe ihrer Kontaktdaten an bis zu drei Anbieter ein. Wir leiten passende Anfragen an Sie weiter, und Sie nehmen direkt Kontakt auf.',
  },
]

export default function AnbieterPage() {
  const years = iabYears()

  return (
    <>
      <section className="bg-slate-900">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
          <nav className="text-xs text-slate-400">
            <Link href="/" className="hover:text-white">Start</Link> / Für Anbieter
          </nav>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Stellen Sie Ihr Investitionsgut Unternehmern mit IAB vor
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-300">
            Auf iab.investments suchen Unternehmer gezielt nach beweglichen Wirtschaftsgütern, weil ihr Investitionsabzugsbetrag
            ausläuft. Reichen Sie Ihr Produkt ein. Wir sichten es und schalten es frei.
          </p>
          <Link href="#einreichen" className="mt-7 inline-block rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold text-white hover:bg-emerald-500">
            Produkt einreichen
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-12 px-4 py-12 leading-relaxed text-slate-700">
        <section>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Eine Zielgruppe mit konkretem Bedarf</h2>
          <p className="mt-3">
            Unternehmer, die einen Investitionsabzugsbetrag gebildet haben, müssen innerhalb von drei Jahren investieren. Für einen IAB
            aus dem Wirtschaftsjahr {years[0]} endet die Frist am <strong className="text-slate-900">{formatDeadline(years[0])}</strong>.
            Wer bis dahin nicht investiert, muss die gestundete Steuer mit Zinsen nachzahlen. Unsere Besucher kommen deshalb mit einem
            klaren Anlass, einem ungefähren Budget und einer festen Frist.
          </p>
          <p className="mt-3">
            Interessenten registrieren sich, sehen sich Angebote im Detail an und fragen gezielt an. Mit jeder Anfrage erhalten Sie
            Kontaktdaten und die gewünschte Kategorie bzw. das angefragte Angebot. Alle
            Beträge auf unserer Seite sind Nettobeträge, denn unsere Zielgruppe sind ausschließlich Unternehmer.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">So läuft die Zusammenarbeit</h2>
          <ol className="mt-5 space-y-5">
            {[
              ['Produkt einreichen', 'Beschreiben Sie Ihr Produkt im Formular unten: Was erwirbt der Kunde, wie funktioniert das Modell, was kostet der Einstieg und wann kann geliefert werden?'],
              ['Sichtung und Gespräch', 'Wir prüfen, ob die Angaben vollständig sind und ob es sich um ein bewegliches Wirtschaftsgut handelt, das grundsätzlich für den IAB infrage kommt. Danach sprechen wir persönlich über Details und Konditionen.'],
              ['Freischaltung', 'Wir legen Ihr Angebot in der passenden Kategorie an und schalten es frei. Ab dann ist es für Interessenten sichtbar.'],
              ['Anfragen erhalten', 'Interessenten, die in die Weitergabe ihrer Daten eingewilligt haben, leiten wir an Sie weiter. Beratung, Angebot und Vertrag laufen direkt zwischen Ihnen und dem Kunden.'],
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
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Was wir von Anbietern erwarten</h2>
          <p className="mt-3">
            Unsere Besucher vertrauen darauf, dass die Angebote auf iab.investments zu ihrem Anliegen passen. Deshalb schalten wir nur
            Produkte frei, die einige Grundanforderungen erfüllen:
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>
              Der Kunde erwirbt ein konkretes, eindeutig zugeordnetes{' '}
              <Link href="/ratgeber/bewegliche-wirtschaftsgueter" className="font-medium text-emerald-700 underline underline-offset-2">
                bewegliches Wirtschaftsgut
              </Link>
              , keine Gesellschaftsbeteiligung.
            </li>
            <li>Preise werden netto angegeben, Ertragsangaben sind als Angaben des Anbieters gekennzeichnet.</li>
            <li>Lieferzeit und Übergabe sind verbindlich geregelt, damit Kunden ihre IAB-Frist einhalten können.</li>
            <li>Bei Betreibermodellen deckt der Miet- oder Betreibervertrag mindestens die steuerliche Bindungsfrist ab.</li>
            <li>Kunden erhalten vollständige Unterlagen für ihre Buchhaltung und ihren Steuerberater.</li>
          </ul>
          <p className="mt-3">
            Welche Fragen Investoren typischerweise stellen, lesen Sie in unserem Artikel{' '}
            <Link href="/ratgeber/iab-direktinvestment-betreibermodell" className="font-medium text-emerald-700 underline underline-offset-2">
              IAB-Direktinvestments und Betreibermodelle
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Kategorien auf iab.investments</h2>
          <p className="mt-3">
            Ihr Produkt passt in keine dieser Kategorien? Reichen Sie es trotzdem ein. Wir erweitern das Angebot laufend.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/${c.slug}`} className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:border-slate-400">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section id="einreichen" className="scroll-mt-20">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-bold text-slate-900">Produkt einreichen</h2>
            <p className="mb-5 mt-1 text-sm text-slate-500">
              Je vollständiger Ihre Angaben, desto schneller können wir freischalten. Pflichtfelder sind mit * markiert.
            </p>
            <ProviderForm />
          </div>
        </section>

        <section>
          <h2 className="mb-5 text-2xl font-bold tracking-tight text-slate-900">Fragen von Anbietern</h2>
          <Faq items={PROVIDER_FAQ} />
        </section>
      </div>
    </>
  )
}
