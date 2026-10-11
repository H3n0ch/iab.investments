import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { AufloesenRechner } from '@/components/AufloesenRechner'
import { Faq } from '@/components/Faq'
import { GuideCards } from '@/components/GuideCards'
import { InquiryModal } from '@/components/InquiryModal'
import { KeyFacts, QuickAnswer, Section, Sources, TextLink, Toc } from '@/components/seo/Blocks'
import { CtaButton, TrustLine } from '@/components/seo/CtaCard'
import { ProjectPreview } from '@/components/seo/ProjectPreview'
import { ZinsTimeline } from '@/components/seo/ZinsTimeline'
import { lapseCost } from '@/lib/aufloesen'
import { CATEGORIES } from '@/lib/categories'
import type { FaqItem } from '@/lib/faq'
import { formatDeadline, fristPath, iabYears } from '@/lib/iab'
import { eur, isTaxYear } from '@/lib/rechner'
import { articleLd, breadcrumbLd, faqLd, ldJson } from '@/lib/seo'
import { guidesBySlug } from '@/lib/wissen'

// Pilot of the guide template (SEO plan, section 2): the most valuable cluster.
// iab auflösen 390 · KD 19 · CPC 1,96 $ | auflösung iab 320 · KD 13 | investitionsabzugsbetrag auflösen 260 · KD 22 |
// auflösung investitionsabzugsbetrag 210 · KD 15 | iab auflösung 90 · KD 12 – all on this one page.

export const revalidate = 300

const PATH = '/iab-aufloesen'
const UPDATED = 'Oktober 2026'
const MODIFIED = '2026-10-11'
const TITLE = 'IAB auflösen: Kosten & Zinsen berechnen'
const DESCRIPTION =
  'Auflösung des IAB: Was kostet es, wenn der Investitionsabzugsbetrag aufgelöst wird? Nachzahlung + 0,15 % Zinsen pro Monat berechnen, Frist prüfen, Auswege.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { type: 'article', title: TITLE, description: DESCRIPTION },
}

const FAQ: FaqItem[] = [
  {
    q: 'Wann muss ich den IAB auflösen?',
    a: 'Aufgelöst wird der IAB, wenn Sie nicht bis zum Ende des dritten Wirtschaftsjahres nach der Bildung investieren. Für einen IAB aus 2023 ist das der 31.12.2026, für 2024 der 31.12.2027. Sie müssen nichts aktiv tun: Das Finanzamt macht den Abzug rückgängig, sobald es davon erfährt.',
  },
  {
    q: 'Wie hoch sind die Zinsen, wenn der IAB aufgelöst wird?',
    a: '0,15 % pro vollem Monat auf die Einkommensteuer-Nachzahlung, also 1,8 % pro Jahr. Der Zinslauf beginnt 15 Monate nach Ende des Jahres, in dem der IAB gebildet wurde. Bei einem IAB aus 2023 laufen die Zinsen also ab April 2025.',
  },
  {
    q: 'Muss ich die Auflösung dem Finanzamt melden?',
    a: 'Ja. Bleibt die Investition aus, müssen Sie das spätestens mit der Steuererklärung des Jahres angeben, in dem die Frist endet. Ihr Steuerberater beantragt dann die Änderung des Bescheids für das Bildungsjahr.',
  },
  {
    q: 'Kann ich die IAB-Frist verlängern?',
    a: 'Nein. Für IAB aus den Jahren 2017 bis 2019 hatte der Gesetzgeber die Frist wegen der Corona-Pandemie verlängert. Diese Sonderregeln sind ausgelaufen. Für heute laufende IAB gilt die reguläre Frist bis zum Ende des dritten Folgejahres.',
  },
  {
    q: 'Kann ich einen IAB freiwillig auflösen?',
    a: 'Ja. Wenn absehbar ist, dass keine Investition erfolgt, kann der IAB auch vor Fristende freiwillig rückgängig gemacht werden. Die Nachzahlung fällt trotzdem an. Weil der geänderte Bescheid früher kommt, laufen aber weniger Zinsmonate auf.',
  },
  {
    q: 'Was passiert, wenn ich weniger investiere als geplant?',
    a: 'Dann wird nur der nicht genutzte Teil des IAB aufgelöst. Der IAB darf höchstens 50 % der Anschaffungskosten betragen. Wer den vollen IAB nutzen will, muss also mindestens das Doppelte netto investieren.',
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

const TOC = [
  { id: 'bedeutung', label: 'Auflösung des IAB: was das bedeutet' },
  { id: 'fristen', label: 'Wann der IAB aufgelöst wird: Fristen je Jahrgang' },
  { id: 'kosten', label: 'Was die Auflösung kostet: Nachzahlung und Zinsen' },
  { id: 'projekte', label: 'Projekte, die jetzt noch passen' },
  { id: 'freiwillig', label: 'Investitionsabzugsbetrag freiwillig oder teilweise auflösen' },
  { id: 'anschaffung', label: 'Auflösung bei Anschaffung' },
  { id: 'auswege', label: 'Auflösung vermeiden: was bis Fristende lieferbar ist' },
  { id: 'rechner', label: 'Ihre Kosten berechnen (Rechner)' },
  { id: 'fragen', label: 'Häufige Fragen' },
]

const LIVE_SLUGS = CATEGORIES.filter((c) => !c.comingSoon).map((c) => c.slug)

export default async function IabAufloesenPage() {
  const years = iabYears()
  const urgent = years[0]
  // Worked example from our own tax engine – always the current most urgent vintage
  const exampleYear = isTaxYear(urgent) ? urgent : 2023
  const ex = lapseCost({ iab: 50000, zvE: 120000, year: exampleYear, joint: false, church: 0 })

  const jsonLd = [
    articleLd({ title: TITLE, description: DESCRIPTION, path: PATH, modified: MODIFIED }),
    breadcrumbLd([
      { name: 'Start', path: '/' },
      { name: 'IAB auflösen', path: PATH },
    ]),
    faqLd(FAQ),
  ]

  return (
    <>
      {jsonLd.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(d) }} />
      ))}

      {/* ── Hero: H1, direct answer, one button ── */}
      <section className="hero-under-header relative overflow-hidden bg-hero">
        {/* Same photo as the inquiry modal – mobile: full width under the navy overlay, md+: right half fading into the navy */}
        <div aria-hidden className="absolute inset-y-0 right-0 left-0 md:left-1/2">
          <Image src="/images/anfrage.jpg" alt="" fill loading="eager" fetchPriority="high" sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" style={{ objectPosition: 'center 72%' }} />
          <div className="absolute inset-0 bg-hero/85 md:bg-transparent md:bg-linear-to-r md:from-hero md:via-hero/50 md:to-hero/10" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-8 sm:py-12">
          <nav className="text-xs text-slate-400">
            <Link href="/" className="hover:text-white">Start</Link> / IAB auflösen
          </nav>
          <h1 className="mt-4 max-w-4xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            IAB auflösen: Was die Auflösung kostet und wie Sie sie vermeiden
          </h1>
          <div className="mt-4">
            <QuickAnswer updated={UPDATED}>
              Wird ein Investitionsabzugsbetrag nicht bis zum Ende des dritten Folgejahres investiert, kommt es zur{' '}
              <strong className="text-white">Auflösung des IAB</strong>: Das Finanzamt macht den Abzug im Jahr der Bildung rückgängig. Sie zahlen
              die gesparte Steuer nach, plus <strong className="text-white">0,15 % Zinsen pro Monat</strong>. Für einen IAB aus {urgent} endet die
              Frist am <strong className="text-amber-300">{formatDeadline(urgent)}</strong>.
            </QuickAnswer>
          </div>
          <div className="mt-6">
            <CtaButton where="hero" />
            <div className="mt-2">
              <TrustLine dark />
            </div>
          </div>
        </div>
      </section>

      {/* ── Content (element budget: key facts, text, one graphic, project preview, folded tool, FAQ, sources) ── */}
      <div className="mx-auto max-w-3xl space-y-10 px-4 py-12 leading-relaxed text-slate-700">
        <KeyFacts
          items={[
            <>Frist: Ende des <strong>dritten Wirtschaftsjahres</strong> nach der Bildung, für den IAB {urgent} also der {formatDeadline(urgent)}.</>,
            <>Kosten der Auflösung: Steuernachzahlung im Bildungsjahr plus <strong>0,15 % Zinsen pro Monat</strong> (1,8 % pro Jahr).</>,
            <>Die Zinsen laufen <strong>rückwirkend</strong> ab dem 1. April des zweiten Jahres nach der Bildung.</>,
            <>Vermeiden: bis Fristende ein bewegliches Wirtschaftsgut für <strong>mindestens das Doppelte des IAB</strong> anschaffen. Es zählt die Lieferung.</>,
            <>Teilweise investiert? Dann wird nur der ungenutzte Rest aufgelöst. Freiwillig auflösen ist jederzeit möglich.</>,
          ]}
        />

        <Toc items={TOC} />

        <Section id="bedeutung" title="Auflösung des IAB: was das bedeutet">
          <p>
            Ein Investitionsabzugsbetrag ist ein Versprechen an das Finanzamt: Sie ziehen bis zu 50 % einer geplanten Investition vorab vom Gewinn ab
            und investieren innerhalb von drei Jahren. Bleibt die Investition aus, wird der Abzug <strong>im Jahr seiner Bildung rückgängig gemacht</strong>{' '}
            (§ 7g Abs. 3 EStG). Umgangssprachlich heißt das „IAB auflösen“ oder „Investitionsabzugsbetrag auflösen“.
          </p>
          <p>
            Mit „Auflösung Investitionsabzugsbetrag“ ist manchmal auch etwas anderes gemeint: die <strong>Hinzurechnung bei Anschaffung</strong>, wenn Sie
            wie geplant investieren. Dann wird der IAB gewinnerhöhend hinzugerechnet und mit den Anschaffungskosten verrechnet, ganz ohne Nachzahlung.
            Diesen Fall erklärt der Abschnitt <a href="#anschaffung" className="font-medium text-emerald-700 underline underline-offset-2">Auflösung bei Anschaffung</a>.
          </p>
        </Section>

        <Section id="fristen" title="Wann der IAB aufgelöst wird: Fristen je Jahrgang">
          <p>Die Frist endet mit dem dritten Wirtschaftsjahr nach der Bildung. Bei kalendergleichem Wirtschaftsjahr gilt:</p>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 font-medium">IAB gebildet für</th>
                  <th className="px-4 py-2.5 font-medium">investieren bis</th>
                  <th className="px-4 py-2.5 font-medium">Zinsen bei Auflösung ab</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {years.map((y) => (
                  <tr key={y}>
                    <td className="px-4 py-2.5">
                      <Link href={fristPath(y)} className="font-medium text-emerald-700 underline underline-offset-2">Wirtschaftsjahr {y}</Link>
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-slate-900">{formatDeadline(y)}</td>
                    <td className="px-4 py-2.5">01.04.{y + 2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-slate-500">Quelle: § 7g Abs. 3 EStG, § 233a AO. Bei abweichendem Wirtschaftsjahr verschieben sich die Daten.</p>
        </Section>

        <Section id="kosten" title="Was die Auflösung kostet: Nachzahlung und Zinsen">
          <p>
            Zur Steuernachzahlung kommen Zinsen nach § 233a AO von <strong>0,15 % pro vollem Monat</strong>. Das Besondere beim IAB: Der Zinslauf beginnt
            nicht erst mit der Auflösung, sondern schon 15 Monate nach Ende des Bildungsjahres.
          </p>
          <ZinsTimeline year={exampleYear} />
          <p>
            <strong>Beispiel {exampleYear}:</strong> Ein Unternehmer bildet für {exampleYear} einen IAB von 50.000 € bei 120.000 € zu versteuerndem
            Einkommen (Einzelveranlagung). Investiert er nicht bis {formatDeadline(exampleYear)}, zahlt er <strong>{eur(ex.backTax)}</strong> Steuern
            nach. Kommt der geänderte Bescheid etwa ein halbes Jahr nach Fristende, sind das {ex.months} Zinsmonate, also weitere{' '}
            <strong>{eur(ex.interest)}</strong>. Zusammen <strong>{eur(ex.total)}</strong>. Mit Ihren eigenen Zahlen rechnet der{' '}
            <a href="#rechner" className="font-medium text-emerald-700 underline underline-offset-2">Rechner weiter unten</a>.
          </p>
        </Section>
      </div>

      {/* Project preview: the call to action in the text */}
      <div className="mx-auto max-w-6xl px-4 pb-12">
        <ProjectPreview slugs={LIVE_SLUGS} title="Auflösung vermeiden: Projekte, die jetzt noch passen" />
      </div>

      <div className="mx-auto max-w-3xl space-y-10 px-4 pb-12 leading-relaxed text-slate-700">
        <Section id="freiwillig" title="Investitionsabzugsbetrag freiwillig oder teilweise auflösen">
          <p>
            Steht fest, dass keine Investition mehr kommt, können Sie den IAB <strong>vor Fristende freiwillig auflösen</strong>. Die Nachzahlung bleibt
            gleich. Weil der geänderte Bescheid früher kommt, laufen aber weniger Zinsmonate auf.
          </p>
          <p>
            Investieren Sie weniger als geplant, wird nur der ungenutzte Teil aufgelöst. Weil der IAB höchstens 50 % der Anschaffungskosten betragen darf,
            deckt eine Investition von 60.000 € netto zum Beispiel einen IAB von 30.000 €. Ob eine Teilinvestition oder die freiwillige Auflösung
            günstiger ist, klären Sie mit Ihrem Steuerberater.
          </p>
          <p>
            <strong>Frist verlängern geht nicht.</strong> Die Corona-Sonderregeln galten nur für IAB aus 2017 bis 2019 und sind ausgelaufen.
          </p>
        </Section>

        <Section id="anschaffung" title="Auflösung bei Anschaffung">
          <p>
            Investieren Sie fristgerecht, wird der IAB im Jahr der Anschaffung dem Gewinn <strong>hinzugerechnet</strong> (§ 7g Abs. 2 EStG), höchstens 50 %
            der Anschaffungskosten. Gleichzeitig mindern Sie die Anschaffungskosten um denselben Betrag. Beides hebt sich auf. Auf die geminderten
            Kosten ist zusätzlich eine <TextLink href="/ratgeber/sonderabschreibung-7g">Sonderabschreibung von 40 %</TextLink> möglich. Beispiel: Bei
            100.000 € Investition und 50.000 € IAB bleiben 50.000 € Anschaffungskosten, davon 20.000 € Sonder-AfA im ersten Jahr.
          </p>
        </Section>

        <Section id="auswege" title="Auflösung vermeiden: was bis Fristende lieferbar ist">
          <p>
            Der IAB ist nicht an das ursprünglich geplante Wirtschaftsgut gebunden. Sie können ihn für jedes{' '}
            <TextLink href="/ratgeber/bewegliche-wirtschaftsgueter">bewegliche Wirtschaftsgut</TextLink> verwenden, das bis Fristende angeschafft und im
            Anschaffungs- und Folgejahr zu mindestens 90 % betrieblich genutzt oder vermietet wird, auch in{' '}
            <TextLink href="/ratgeber/iab-direktinvestment-betreibermodell">Betreibermodellen</TextLink>.
          </p>
          <p>
            Entscheidend ist die <strong>Lieferung</strong>, nicht die Bestellung. Kurzfristig umsetzbar sind oft{' '}
            <TextLink href="/photovoltaik-iab">PV-Modulpakete in Solarparks</TextLink>, <TextLink href="/batteriespeicher-iab">Batteriespeicher</TextLink>{' '}
            und sofort verfügbare <TextLink href="/tiny-house-iab">Tiny Houses</TextLink>.
          </p>
        </Section>
      </div>

      {/* Optional calculator: folded, offered below the explanation instead of dominating the top of the page */}
      <div className="mx-auto max-w-6xl px-4 pb-10">
        <details id="rechner" className="group scroll-mt-28 rounded-2xl border border-slate-200 bg-white shadow-sm open:bg-linear-to-br open:from-hero open:to-hero-2">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 sm:p-6">
            <span>
              <span className="block text-lg font-bold text-slate-900 group-open:text-white">Ihre Kosten der Auflösung berechnen</span>
              <span className="mt-0.5 block text-sm text-slate-500 group-open:text-slate-300">
                Optional: mit Ihrem IAB-Betrag, Jahrgang und Einkommen. Steuernachzahlung und Zinsen auf den Euro.
              </span>
            </span>
            <span className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 group-open:border-white/30 group-open:text-white">
              <span className="group-open:hidden">Rechner öffnen</span>
              <span className="hidden group-open:inline">Schließen</span>
            </span>
          </summary>
          <div className="px-5 pb-6 sm:px-6">
            <AufloesenRechner />
          </div>
        </details>
      </div>

      <div className="mx-auto max-w-3xl space-y-10 px-4 pb-12">
        <section id="fragen" className="scroll-mt-28">
          <h2 className="mb-5 text-2xl font-bold tracking-tight text-slate-900">Häufige Fragen zur Auflösung des IAB</h2>
          <Faq items={FAQ} />
        </section>

        <Sources
          updated={UPDATED}
          sources={[
            { label: '§ 7g EStG – Investitionsabzugsbeträge (gesetze-im-internet.de)', url: 'https://www.gesetze-im-internet.de/estg/__7g.html' },
            { label: '§ 233a AO – Verzinsung von Steuernachforderungen', url: 'https://www.gesetze-im-internet.de/ao_1977/__233a.html' },
            { label: '§ 238 AO – Höhe und Berechnung der Zinsen', url: 'https://www.gesetze-im-internet.de/ao_1977/__238.html' },
          ]}
        />

      </div>

      <section className="mx-auto max-w-6xl px-4">
        <h2 className="mb-5 text-xl font-bold tracking-tight text-slate-900">Weiterlesen</h2>
        <GuideCards guides={guidesBySlug(['iab-frist', 'iab-checkliste-jahresende', 'sonderabschreibung-7g'])} />
      </section>

      <InquiryModal
        title="Unterlagen & Kalkulation anfordern"
        form={{ preselected: [], options: LIVE_SLUGS, source: 'frist', submitLabel: 'Unterlagen & Kalkulation anfordern' }}
      />
    </>
  )
}
