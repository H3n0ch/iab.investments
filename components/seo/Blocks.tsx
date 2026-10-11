import Link from 'next/link'
import type { ReactNode } from 'react'

// Building blocks of the guide template (SEO plan, section 2). Server components, no client JS.

/** Direct answer to the search query in 2–3 sentences – what snippets and AI answers quote. Shown in the hero. */
export function QuickAnswer({ children, updated }: { children: ReactNode; updated: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-base leading-relaxed text-slate-200 sm:text-lg">{children}</p>
      <p className="mt-3 text-xs text-slate-400">
        Stand: {updated} · Keine Steuerberatung
      </p>
    </div>
  )
}

/** „Das Wichtigste in Kürze“ – short, quotable facts */
export function KeyFacts({ items }: { items: ReactNode[] }) {
  return (
    <section aria-label="Das Wichtigste in Kürze" className="border-l-4 border-emerald-600 pl-5">
      <h2 className="text-lg font-bold text-slate-900">Das Wichtigste in Kürze</h2>
      <ul className="mt-3 space-y-2">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-slate-700">
            <span aria-hidden className="mt-0.5 font-bold text-emerald-700">✓</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function Toc({ items }: { items: { id: string; label: string }[] }) {
  return (
    <nav aria-label="Inhalt" className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Inhalt</p>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
        {items.map((it) => (
          <li key={it.id}>
            <a href={`#${it.id}`} className="text-slate-700 hover:text-emerald-700 hover:underline">{it.label}</a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

/** Content section with anchor for the table of contents */
export function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  )
}

export type Source = { label: string; url: string }

/** Sources and disclaimer as one quiet text line – no box (element budget) */
export function Sources({ sources, updated }: { sources: Source[]; updated: string }) {
  return (
    <p className="border-t border-slate-200 pt-4 text-xs leading-relaxed text-slate-500">
      Quellen:{' '}
      {sources.map((s, i) => (
        <span key={s.url}>
          {i > 0 && ' · '}
          <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-slate-800">
            {s.label}
          </a>
        </span>
      ))}
      . Stand: {updated}. Allgemeine Information, keine Steuerberatung. Ob und wie Sie Ihren IAB verwenden oder auflösen, klären Sie bitte
      mit Ihrem Steuerberater.
    </p>
  )
}

/** Inline text link in the guide style */
export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="font-medium text-emerald-700 underline underline-offset-2">
      {children}
    </Link>
  )
}
