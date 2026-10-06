export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })),
  }
}

export function FaqJsonLd({ items }: { items: { q: string; a: string }[] }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(items)).replace(/</g, '\\u003c') }} />
  )
}

/** Set `jsonLd={false}` when a page renders several FAQ blocks and emits one combined <FaqJsonLd />. */
export function Faq({ items, jsonLd = true }: { items: { q: string; a: string }[]; jsonLd?: boolean }) {
  return (
    <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
      {items.map((i) => (
        <details key={i.q} className="group p-4 sm:p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900">
            {i.q}
            <span className="shrink-0 text-slate-400 transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{i.a}</p>
        </details>
      ))}
      {jsonLd && <FaqJsonLd items={items} />}
    </div>
  )
}
