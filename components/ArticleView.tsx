import type { Metadata } from 'next'
import Link from 'next/link'
import { CategoryCard } from '@/components/CategoryCard'
import { Faq } from '@/components/Faq'
import { GuideCards } from '@/components/GuideCards'
import { LeadForm } from '@/components/LeadForm'
import { RichText } from '@/components/RichText'
import { CATEGORIES } from '@/lib/categories'
import { articlePath, guidesBySlug, readingMinutes, UPDATED, type Article } from '@/lib/wissen'

// Article layout for /ratgeber/[slug] and the root-level keyword pages (/iab-photovoltaik …).

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://iab.investments'

export function articleMetadata(a: Article): Metadata {
  return {
    title: a.seoTitle,
    description: a.description,
    alternates: { canonical: articlePath(a) },
    openGraph: { type: 'article', title: a.seoTitle, description: a.description },
  }
}

const anchor = (h: string) =>
  h
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export function ArticleView({ article: a }: { article: Article }) {
  const categories = CATEGORIES.filter((c) => a.categories.includes(c.slug)).slice(0, 3)
  // Offer the article's categories in the form; articles without categories offer all live ones
  const formOptions = a.categories.length ? a.categories : CATEGORIES.filter((c) => !c.comingSoon).map((c) => c.slug)
  const related = guidesBySlug(a.related)
  const url = `${APP_URL}${articlePath(a)}`
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: a.title,
      description: a.description,
      inLanguage: 'de-DE',
      mainEntityOfPage: url,
      publisher: { '@type': 'Organization', name: 'iab.investments', url: APP_URL },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Start', item: APP_URL },
        { '@type': 'ListItem', position: 2, name: 'Wissen', item: `${APP_URL}/ratgeber` },
        { '@type': 'ListItem', position: 3, name: a.title, item: url },
      ],
    },
  ]

  return (
    <>
      <article className="mx-auto max-w-3xl px-4 py-12">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
        <nav className="text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-700">Start</Link> / <Link href="/ratgeber" className="hover:text-slate-700">Wissen</Link> / {a.title}
        </nav>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{a.title}</h1>
        <p className="mt-3 text-xs text-slate-400">
          {readingMinutes(a)} Min. Lesezeit · Stand: {UPDATED}
        </p>
        <p className="mt-5 text-lg leading-relaxed text-slate-600">
          <RichText text={a.intro} />
        </p>

        {/* Table of contents */}
        <nav aria-label="Inhalt" className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Inhalt</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
            {a.sections.map((s) => (
              <li key={s.h}>
                <a href={`#${anchor(s.h)}`} className="text-slate-700 hover:text-emerald-700 hover:underline">{s.h}</a>
              </li>
            ))}
            <li>
              <a href="#fragen" className="text-slate-700 hover:text-emerald-700 hover:underline">Häufige Fragen</a>
            </li>
          </ol>
        </nav>

        <div className="mt-10 space-y-10 leading-relaxed text-slate-700">
          {a.sections.map((s) => (
            <section key={s.h} id={anchor(s.h)} className="scroll-mt-20">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">{s.h}</h2>
              {s.p.map((p, i) => (
                <p key={i} className="mt-3">
                  <RichText text={p} />
                </p>
              ))}
              {s.list && (
                <ul className="mt-3 list-disc space-y-1.5 pl-5">
                  {s.list.map((l, i) => (
                    <li key={i}>
                      <RichText text={l} />
                    </li>
                  ))}
                </ul>
              )}
              {s.after?.map((p, i) => (
                <p key={i} className="mt-3">
                  <RichText text={p} />
                </p>
              ))}
            </section>
          ))}

          {/* Every guide converts on the page itself: inquiry wizard for the article's categories */}
          <div id="anfrage" className="scroll-mt-20 rounded-2xl border-2 border-emerald-500 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-lg font-bold text-slate-900">Unterlagen & Kalkulation anfordern</p>
            <p className="mb-4 mt-1 text-sm text-slate-500">
              Passende Projekte für Ihren IAB, kostenlos und unverbindlich. Wir melden uns persönlich.
            </p>
            <LeadForm preselected={[]} options={formOptions} source="ratgeber" />
          </div>

          <section id="fragen" className="scroll-mt-20">
            <h2 className="mb-5 text-2xl font-bold tracking-tight text-slate-900">Häufige Fragen</h2>
            <Faq items={a.faq} />
            <Link href="/ratgeber/iab-faq" className="mt-4 inline-block text-sm font-semibold text-emerald-700 hover:underline">
              Alle Fragen zum IAB →
            </Link>
          </section>

          <p className="text-xs text-slate-400">
            Dieser Artikel dient der allgemeinen Information und ersetzt keine Steuerberatung. Ob ein Wirtschaftsgut für Ihren IAB
            geeignet ist, klären Sie bitte mit Ihrem Steuerberater. Stand: {UPDATED}.
          </p>
        </div>
      </article>

      <section className="mx-auto max-w-6xl px-4 pb-6">
        <h2 className="mb-5 text-xl font-bold tracking-tight text-slate-900">Weiterlesen</h2>
        <GuideCards guides={related} columns={2} />
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-8">
          <h2 className="mb-5 text-xl font-bold tracking-tight text-slate-900">Passende Investitionsgüter</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <CategoryCard key={c.slug} category={c} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
