import Link from 'next/link'
import { AuthNav } from './AuthNav'

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span className={`text-lg font-extrabold tracking-tight ${dark ? 'text-slate-900' : 'text-white'}`}>
      iab<span className="text-emerald-500">.investments</span>
    </span>
  )
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" aria-label="Startseite">
          <Logo />
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/angebote" className="hidden rounded-lg px-3 py-1.5 text-slate-300 hover:text-white sm:block">
            Angebote
          </Link>
          <Link href="/iab-rechner" className="hidden rounded-lg px-3 py-1.5 text-slate-300 hover:text-white md:block">
            IAB-Rechner
          </Link>
          <Link href="/ratgeber" className="hidden rounded-lg px-3 py-1.5 text-slate-300 hover:text-white sm:block">
            Wissen
          </Link>
          <Link href="/so-funktionierts" className="hidden rounded-lg px-3 py-1.5 text-slate-300 hover:text-white xl:block">
            So funktioniert&apos;s
          </Link>
          <Link href="/anbieter" className="hidden rounded-lg px-3 py-1.5 text-slate-300 hover:text-white lg:block">
            Für Anbieter
          </Link>
          <AuthNav />
        </nav>
      </div>
    </header>
  )
}
