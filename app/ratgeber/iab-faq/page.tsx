import type { Metadata } from 'next'
import Link from 'next/link'
import { GuideCards } from '@/components/GuideCards'
import { guidesBySlug } from '@/lib/wissen'
import { Faq, FaqJsonLd } from '@/components/Faq'
import { CATEGORIES } from '@/lib/categories'
import { ALL_IAB_FAQ, IAB_FAQ } from '@/lib/faq'
import { FristCta } from '@/components/FristCta'

export const metadata: Metadata = {
  title: 'IAB FAQ: Häufige Fragen zum Investitionsabzugsbetrag (§ 7g EStG)',
  description:
    'Höhe, Frist, Gewinngrenze, begünstigte Wirtschaftsgüter, Vermietung und Sonderabschreibung: Die wichtigsten Fragen und Antworten zum Investitionsabzugsbetrag nach § 7g EStG.',
  alternates: { canonical: '/ratgeber/iab-faq' },
}

export default function IabFaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <nav className="text-xs text-slate-400">
        <Link href="/" className="hover:text-slate-700">Start</Link> / <Link href="/ratgeber" className="hover:text-slate-700">Wissen</Link> / FAQ
      </nav>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        Häufige Fragen zum Investitionsabzugsbetrag
      </h1>
      <p className="mt-4 text-lg text-slate-600">
        Die wichtigsten Regeln zum IAB nach § 7g EStG: kurz beantwortet, mit konkreten Zahlen und Fristen.
      </p>

      {/* Jump links */}
      <ul className="mt-6 flex flex-wrap gap-2">
        {IAB_FAQ.map((g) => (
          <li key={g.group}>
            <a href={`#${encodeURIComponent(g.group)}`} className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600 hover:border-slate-400">
              {g.group}
            </a>
          </li>
        ))}
      </ul>

      <FaqJsonLd items={ALL_IAB_FAQ} />
      <div className="mt-10 space-y-10">
        {IAB_FAQ.map((g) => (
          <section key={g.group} id={encodeURIComponent(g.group)} className="scroll-mt-20">
            <h2 className="mb-4 text-xl font-bold text-slate-900">{g.group}</h2>
            <Faq items={g.items} jsonLd={false} />
          </section>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="mb-4 text-xl font-bold text-slate-900">Fragen zu einzelnen Investitionsgütern</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {CATEGORIES.map((c) => (
            <li key={c.slug}>
              <Link href={`/${c.slug}`} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:border-slate-300 hover:shadow-sm">
                {c.name} mit IAB
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-xl font-bold text-slate-900">Ausführlich erklärt</h2>
        <GuideCards guides={guidesBySlug(['investitionsabzugsbetrag', 'sonderabschreibung-7g', 'bewegliche-wirtschaftsgueter', 'iab-rechtsform-gmbh-freiberufler'])} columns={2} />
      </section>

      <FristCta className="mt-12" />

      <p className="mt-8 text-xs text-slate-400">
        Diese Antworten dienen der allgemeinen Information und ersetzen keine Steuerberatung. Stand: Oktober 2026.
      </p>
    </div>
  )
}
