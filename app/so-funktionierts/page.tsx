import type { Metadata } from 'next'
import Link from 'next/link'
import { ModalButton } from '@/components/ModalButton'
import { Faq } from '@/components/Faq'
import { GuideCards } from '@/components/GuideCards'
import { LeadForm } from '@/components/LeadForm'
import { CATEGORIES, formatEuro } from '@/lib/categories'
import { IAB_FAQ } from '@/lib/faq'
import { formatDeadline, iabYears } from '@/lib/iab'
import { guidesBySlug } from '@/lib/wissen'

export const metadata: Metadata = {
  title: 'So funktioniert iab.investments: Investitionsgut für Ihren IAB finden',
  description:
    'Wie iab.investments Unternehmern mit auslaufendem Investitionsabzugsbetrag hilft: Ablauf, Kosten, Datenschutz und was wir tun und nicht tun. Kostenlos und unverbindlich.',
  alternates: { canonical: '/so-funktionierts' },
}

const STEPS = [
  {
    t: 'Frist prüfen',
    d: 'Mit dem Frist-Check oder dem IAB-Rechner sehen Sie, bis wann Sie investieren müssen, wie viel nötig ist und was eine Auflösung kosten würde.',
  },
  {
    t: 'Projekte ansehen',
    d: 'Wir zeigen reale Projekte unserer Anbieter, vom PV-Modulpaket über Batteriespeicher bis zum Tiny House, mit einheitlichen Eckdaten. Kategorien, für die wir noch keinen Anbieter haben, zeigen ein klar gekennzeichnetes Beispiel.',
  },
  {
    t: 'Unterlagen anfordern',
    d: 'Ein kurzes Formular in wenigen Schritten, kein Passwort. Projektdetails sehen Sie sofort. Nach Bestätigung Ihrer E-Mail-Adresse melden wir uns persönlich.',
  },
  {
    t: 'Kontakt zum passenden Anbieter',
    d: 'Wir stellen den Kontakt zu dem Anbieter her, der zu Ihrem Betrag, Ihrer Frist und Ihrem Ziel passt. Details, Konditionen und Verträge besprechen Sie direkt mit ihm. Sie entscheiden in Ruhe, ob Sie investieren.',
  },
]

export default function SoFunktioniertsPage() {
  const years = iabYears()
  const platformFaq = IAB_FAQ.find((g) => g.group === 'iab.investments')?.items ?? []
  const minEntry = Math.min(...CATEGORIES.map((c) => c.minInvestment))

  return (
    <>
      <section className="hero-under-header bg-linear-to-br from-hero to-hero-2">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
          <nav className="text-xs text-slate-400">
            <Link href="/" className="hover:text-white">Start</Link> / So funktioniert&apos;s
          </nav>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            So finden Sie das passende Investitionsgut für Ihren IAB
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-300">
            iab.investments bringt Unternehmer, deren Investitionsabzugsbetrag ausläuft, mit Anbietern beweglicher Wirtschaftsgüter
            zusammen. Für Sie ist das kostenlos und unverbindlich.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="#anfrage" className="rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold text-white hover:bg-emerald-500">
              Jetzt anfragen
            </Link>
            <ModalButton modal="contact" className="rounded-lg px-5 py-2.5 font-semibold text-slate-200 ring-1 ring-white/20 hover:bg-white/10">
              Fragen? Kontakt aufnehmen
            </ModalButton>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-12 px-4 py-12 leading-relaxed text-slate-700">
        <section>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Für wen iab.investments gedacht ist</h2>
          <p className="mt-3">
            Viele Unternehmer haben in den vergangenen Jahren einen Investitionsabzugsbetrag gebildet und damit Steuern in die
            Zukunft verschoben. Damit der Vorteil bestehen bleibt, muss innerhalb von drei Jahren in ein bewegliches Wirtschaftsgut
            investiert werden. Für einen IAB aus dem Wirtschaftsjahr {years[0]} endet die Frist am{' '}
            <strong className="text-slate-900">{formatDeadline(years[0])}</strong>.
          </p>
          <p className="mt-3">
            Nicht jeder Betrieb hat dann eine passende Investition parat. Genau hier setzen wir an: Wir zeigen Ihnen, welche
            Investitionsgüter grundsätzlich für den IAB infrage kommen, und stellen den Kontakt zu Anbietern her, die liefern können.
            Unser Angebot richtet sich an Gewerbetreibende, Freiberufler, Land- und Forstwirte und Kapitalgesellschaften. Alle
            Beträge auf unserer Seite sind Nettobeträge, die Einstiege beginnen bei {formatEuro(minEntry)} netto.
          </p>
          <p className="mt-3">
            Wenn Sie sich zuerst mit den Regeln vertraut machen möchten, lesen Sie unseren Grundlagenartikel{' '}
            <Link href="/ratgeber/investitionsabzugsbetrag" className="font-medium text-emerald-700 underline underline-offset-2">
              Investitionsabzugsbetrag einfach erklärt
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Der Ablauf in vier Schritten</h2>
          <ol className="mt-6 space-y-5">
            {STEPS.map((s, i) => (
              <li key={s.t} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">{i + 1}</span>
                <div>
                  <p className="font-semibold text-slate-900">{s.t}</p>
                  <p className="mt-1">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Was wir tun und was nicht</h2>
          <p className="mt-3">
            Wir sind Kontaktvermittler. Wir helfen Ihnen, die passende Kategorie für Ihren Betrag, Ihre Frist und Ihr Ziel zu finden,
            und stellen den Kontakt zu Anbietern her. Wir kennen die Kategorien, ihre typischen Einstiegsbeträge und Lieferzeiten und
            können einschätzen, was bei einer nahen Frist realistisch ist.
          </p>
          <p className="mt-3">
            Zu konkreten Angeboten beraten wir nicht, und wir wirken nicht an Vertragsabschlüssen mit. Verträge schließen Sie direkt
            mit dem Anbieter. Eine Steuer-, Rechts- oder Anlageberatung bieten wir nicht an. Ob ein Wirtschaftsgut steuerlich für Ihren
            IAB geeignet ist und wie es sich auswirkt, klären Sie bitte mit Ihrem Steuerberater. Renditeangaben stammen von den Anbietern
            und sind nicht garantiert.
          </p>
          <p className="mt-3">
            Welche Fragen Sie einem Anbieter stellen sollten, haben wir im Artikel{' '}
            <Link href="/ratgeber/iab-direktinvestment-betreibermodell" className="font-medium text-emerald-700 underline underline-offset-2">
              IAB-Direktinvestments und Betreibermodelle
            </Link>{' '}
            zusammengestellt.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Welche Anbieter wir zeigen</h2>
          <p className="mt-3">
            Wir zeigen nur Projekte von Anbietern, die wir kennen und die der Darstellung zugestimmt haben. Wonach wir Anbieter auswählen,
            haben wir offen beschrieben: <Link href="/anbieter#pruefkriterien" className="font-medium text-emerald-700 underline underline-offset-2">unsere
            Prüfkriterien</Link>. Eine Empfehlung oder eine Prüfung der wirtschaftlichen Qualität eines einzelnen Projekts ist das ausdrücklich nicht.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Kosten, Datenschutz und Konto</h2>
          <p className="mt-3">
            Für Sie ist iab.investments kostenlos. Wir werden von den Anbietern vergütet, an die wir Anfragen vermitteln. Ihre Daten
            geben wir nur mit Ihrer ausdrücklichen Einwilligung und nach Bestätigung Ihrer E-Mail-Adresse weiter, und zwar an ausgewählte
            Anbieter der Kategorien, die Sie gewählt haben. Die Einwilligung können Sie jederzeit per E-Mail widerrufen. Details stehen in unserer{' '}
            <Link href="/datenschutz" className="font-medium text-emerald-700 underline underline-offset-2">Datenschutzerklärung</Link>.
          </p>
          <p className="mt-3">
            Sie brauchen kein Konto und kein Passwort. Nach Ihrer Anfrage sehen Sie die Details aller Projekte direkt in diesem Browser.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Diese Investitionsgüter finden Sie bei uns</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/${c.slug}`} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm hover:border-slate-300 hover:shadow-sm">
                  <span className="font-medium text-slate-800">{c.name}</span>
                  <span className="shrink-0 text-xs text-slate-500">ab {formatEuro(c.minInvestment)} netto</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section id="anfrage" className="scroll-mt-20">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-bold text-slate-900">Unterlagen & Kalkulation anfordern</h2>
            <p className="mb-4 mt-1 text-sm text-slate-500">
              Wählen Sie, was Sie interessiert. Wir melden uns persönlich, kostenlos und unverbindlich.
            </p>
            <LeadForm preselected={[]} source="landing" />
          </div>
        </section>

        <section>
          <h2 className="mb-5 text-2xl font-bold tracking-tight text-slate-900">Fragen zu iab.investments</h2>
          <Faq items={platformFaq} />
          <Link href="/ratgeber/iab-faq" className="mt-4 inline-block text-sm font-semibold text-emerald-700 hover:underline">
            Alle Fragen zum IAB →
          </Link>
        </section>
      </div>

      <section className="mx-auto max-w-6xl px-4">
        <h2 className="mb-5 text-xl font-bold tracking-tight text-slate-900">Wissen zum Investitionsabzugsbetrag</h2>
        <GuideCards guides={guidesBySlug(['investitionsabzugsbetrag', 'iab-checkliste-jahresende', 'iab-frist'])} />
      </section>
    </>
  )
}
