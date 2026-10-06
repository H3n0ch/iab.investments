import Link from 'next/link'
import type { GuideLink } from '@/lib/wissen'

export function GuideCards({ guides, columns = 3 }: { guides: GuideLink[]; columns?: 2 | 3 }) {
  return (
    <ul className={`grid gap-4 sm:grid-cols-2 ${columns === 3 ? 'lg:grid-cols-3' : ''}`}>
      {guides.map((g) => (
        <li key={g.slug}>
          <Link
            href={g.href}
            className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-emerald-500 hover:shadow-md"
          >
            <span className="font-semibold text-slate-900">{g.title}</span>
            <span className="mt-1 text-sm leading-relaxed text-slate-500">{g.teaser}</span>
            <span className="mt-auto pt-3 text-sm font-semibold text-emerald-700">Weiterlesen →</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
