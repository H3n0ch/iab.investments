import Link from 'next/link'
import { CATEGORIES } from '@/lib/categories'
import { DISCLAIMER } from '@/lib/consent'
import { iabGuides, wissenswertes } from '@/lib/wissen'
import { Logo } from './Header'

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <Logo dark />
          <p className="mt-3 text-sm text-slate-500">
            Das Portal für Unternehmer, deren Investitionsabzugsbetrag ausläuft.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Investitionsgüter</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/${c.slug}`} className="text-slate-600 hover:text-slate-900">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            <Link href="/ratgeber" className="hover:text-slate-600">Wissen</Link>
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {iabGuides().map((g) => (
              <li key={g.slug}>
                <Link href={g.href} className="text-slate-600 hover:text-slate-900">
                  {g.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Wissenswertes</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {wissenswertes().map((g) => (
              <li key={g.slug}>
                <Link href={g.href} className="text-slate-600 hover:text-slate-900">
                  {g.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Info</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li><Link href="/angebote" className="text-slate-600 hover:text-slate-900">Aktuelle Projekte</Link></li>
            <li><Link href="/iab-rechner" className="text-slate-600 hover:text-slate-900">IAB-Rechner</Link></li>
            <li><Link href="/iab-aufloesen" className="text-slate-600 hover:text-slate-900">IAB auflösen: Kosten und Auswege</Link></li>
            <li><Link href="/so-funktionierts" className="text-slate-600 hover:text-slate-900">So funktioniert&apos;s</Link></li>
            <li><Link href="/anbieter" className="text-slate-600 hover:text-slate-900">Für Anbieter: Produkt vorstellen</Link></li>
            <li><Link href="/steuerberater" className="text-slate-600 hover:text-slate-900">Für Steuerberater: Partnerprogramm</Link></li>
            <li><Link href="/ratgeber" className="text-slate-600 hover:text-slate-900">IAB-Wissen</Link></li>
            <li><Link href="/impressum" className="text-slate-600 hover:text-slate-900">Impressum</Link></li>
            <li><Link href="/datenschutz" className="text-slate-600 hover:text-slate-900">Datenschutz</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs leading-relaxed text-slate-400">{DISCLAIMER}</p>
      </div>
    </footer>
  )
}
