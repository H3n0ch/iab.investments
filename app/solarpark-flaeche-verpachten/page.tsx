import type { Metadata } from 'next'
import Link from 'next/link'
import { Faq } from '@/components/Faq'
import { FlaechenForm } from '@/components/FlaechenForm'
import type { FaqItem } from '@/lib/faq'

// Separate funnel for landowners („fläche für solarpark verpachten“). Buyers are solar park developers.

export const metadata: Metadata = {
  title: 'Fläche für Solarpark verpachten: Pacht, Voraussetzungen, Ablauf',
  description:
    'Fläche für einen Solarpark verpachten: Welche Flächen geeignet sind, welche Pacht üblich ist und wie der Ablauf aussieht. Fläche kostenlos von Projektierern prüfen lassen.',
  alternates: { canonical: '/solarpark-flaeche-verpachten' },
}

const FAQ: FaqItem[] = [
  {
    q: 'Wie viel Pacht zahlt ein Solarpark pro Hektar?',
    a: 'Übliche Pachten liegen je nach Region, Netzanschluss und Flächenart grob zwischen 1.500 und 3.500 € pro Hektar und Jahr, in Einzelfällen darüber. Oft gibt es zusätzlich eine Einmalzahlung bei Baubeginn oder eine Beteiligung am Ertrag. Verbindlich ist nur das konkrete Angebot eines Projektierers.',
  },
  {
    q: 'Wie groß muss eine Fläche für einen Solarpark sein?',
    a: 'Projektierer suchen meist zusammenhängende Flächen ab etwa 3 bis 5 Hektar. Kleinere Flächen können passen, wenn mehrere Eigentümer benachbarter Flächen gemeinsam verpachten.',
  },
  {
    q: 'Welche Flächen eignen sich besonders?',
    a: 'Flächen entlang von Autobahnen und Schienenwegen (EEG-Korridor), Konversionsflächen und benachteiligte landwirtschaftliche Gebiete. Wichtig sind außerdem ein Netzanschluss in erreichbarer Nähe, wenig Verschattung und keine Schutzgebiete.',
  },
  {
    q: 'Wie lange läuft ein Pachtvertrag?',
    a: 'Üblich sind 20 bis 30 Jahre, häufig mit Verlängerungsoption. Der Projektierer übernimmt Planung, Genehmigung, Bau, Betrieb und am Ende den Rückbau.',
  },
  {
    q: 'Bleibt die Fläche landwirtschaftlich nutzbar?',
    a: 'Bei Agri-PV ja, dort werden die Module so aufgeständert, dass Bewirtschaftung oder Beweidung möglich bleibt. Bei klassischen Freiflächenanlagen ist meist nur noch extensive Pflege, etwa durch Schafe, möglich.',
  },
]

export default function FlaechePage() {
  return (
    <>
      <section className="hero-under-header bg-linear-to-br from-hero to-hero-2">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
          <nav className="text-xs text-slate-400">
            <Link href="/" className="hover:text-white">Start</Link> / Fläche verpachten
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Fläche für Solarpark verpachten</h1>
          <p className="mt-3 text-slate-300">
            Sie besitzen Acker, Grünland oder eine Brachfläche? Solarpark-Projektierer suchen geeignete Flächen und zahlen dafür über 20 bis 30 Jahre
            eine feste Pacht. Beschreiben Sie Ihre Fläche, wir stellen sie passenden Projektierern vor. Für Sie kostenlos.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-12 px-4 py-10 leading-relaxed text-slate-700">
        <section id="anfrage" className="scroll-mt-20 rounded-2xl border-2 border-emerald-500 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-lg font-bold text-slate-900">Fläche kostenlos prüfen lassen</p>
          <p className="mb-4 mt-1 text-sm text-slate-500">Drei Angaben zur Fläche genügen. Wir melden uns, bevor wir Ihre Daten weitergeben.</p>
          <FlaechenForm />
        </section>

        <section>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Welche Flächen Projektierer suchen</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>zusammenhängend, meist ab etwa 3 bis 5 Hektar</li>
            <li>Netzanschluss (Umspannwerk oder Mittelspannungsleitung) in erreichbarer Nähe</li>
            <li>bevorzugt entlang von Autobahnen und Bahnlinien, Konversionsflächen oder benachteiligte Gebiete</li>
            <li>wenig Verschattung, keine Natur- oder Wasserschutzgebiete</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">So läuft die Verpachtung ab</h2>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5">
            <li>Sie beschreiben Ihre Fläche, wir prüfen die Eckdaten und rufen Sie an.</li>
            <li>Mit Ihrem Einverständnis stellen wir die Fläche ausgewählten Projektierern vor.</li>
            <li>Interessierte Projektierer prüfen Netzanschluss und Planungsrecht und machen ein Pachtangebot.</li>
            <li>Sie entscheiden. Den Vertrag schließen Sie direkt mit dem Projektierer, idealerweise nach rechtlicher Prüfung.</li>
          </ol>
        </section>

        <section>
          <h2 className="mb-5 text-2xl font-bold tracking-tight text-slate-900">Häufige Fragen zur Solarpark-Pacht</h2>
          <Faq items={FAQ} />
        </section>

        <p className="rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-500">
          Allgemeine Information, keine Rechts- oder Steuerberatung. Pachthöhen sind Erfahrungswerte und hängen vom Einzelfall ab. Sie möchten selbst
          in Solarparks investieren? Lesen Sie <Link href="/solarpark-anteile-kaufen" className="underline">Solarpark-Anteile kaufen</Link>.
        </p>
      </div>
    </>
  )
}
