import type { Metadata } from 'next'
import Link from 'next/link'
import { GuideCards } from '@/components/GuideCards'
import { CATEGORIES } from '@/lib/categories'
import { guidesBySlug, iabGuides, wissenswertes } from '@/lib/wissen'
import { FristCta } from '@/components/FristCta'

export const metadata: Metadata = {
  title: 'IAB-Wissen: Ratgeber zum Investitionsabzugsbetrag',
  description:
    'Ratgeber zum Investitionsabzugsbetrag nach § 7g EStG: Grundlagen, Voraussetzungen, Frist, Sonderabschreibung, degressive AfA, bewegliche Wirtschaftsgüter und Betreibermodelle.',
  alternates: { canonical: '/ratgeber' },
}

const START = ['investitionsabzugsbetrag', 'iab-voraussetzungen', 'iab-frist']

export default function RatgeberPage() {
  const start = guidesBySlug(START)
  const rest = iabGuides().filter((g) => !START.includes(g.slug))

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <nav className="text-xs text-slate-400">
        <Link href="/" className="hover:text-slate-700">Start</Link> / Wissen
      </nav>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">IAB-Wissen</h1>
      <div className="mt-4 max-w-3xl space-y-3 text-lg leading-relaxed text-slate-600">
        <p>
          Der Investitionsabzugsbetrag nach § 7g EStG ist für kleine und mittlere Betriebe eines der wirksamsten Steuerinstrumente.
          Er hat aber Regeln, Fristen und Fallstricke, die man kennen sollte, bevor man investiert.
        </p>
        <p className="text-base">
          In unseren Ratgebern erklären wir die Grundlagen verständlich und mit Beispielen: von der Gewinngrenze über die
          Sonderabschreibung bis zu der Frage, welche Wirtschaftsgüter überhaupt begünstigt sind. Die Artikel dienen der allgemeinen
          Information und ersetzen keine Steuerberatung.
        </p>
      </div>

      <section className="mt-12">
        <h2 className="mb-5 text-xl font-bold tracking-tight text-slate-900">Hier starten</h2>
        <GuideCards guides={start} />
      </section>

      <section className="mt-12">
        <h2 className="mb-5 text-xl font-bold tracking-tight text-slate-900">Vertiefung</h2>
        <GuideCards guides={rest} />
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Wissenswertes</h2>
        <p className="mb-5 mt-1 text-sm text-slate-500">Photovoltaik und Speicher als Investment, Abfindung, Steuern für Gutverdiener.</p>
        <GuideCards guides={wissenswertes()} />
      </section>

      <section className="mt-12">
        <h2 className="mb-5 text-xl font-bold tracking-tight text-slate-900">Investitionsgüter im Detail</h2>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <li key={c.slug}>
              <Link href={`/${c.slug}`} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:border-slate-300 hover:shadow-sm">
                {c.name} mit IAB
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <FristCta className="mt-12" />
    </div>
  )
}
