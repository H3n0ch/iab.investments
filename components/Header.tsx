'use client'

// Header in the style of Milk the Sun: logo left, white pill navigation in the middle, outlined pill buttons right.
// On the home page it floats transparent over the hero photo and turns navy once the page is scrolled.

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AuthNav } from './AuthNav'
import { ModalButton } from './ModalButton'

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span className={`text-lg font-extrabold tracking-tight ${dark ? 'text-slate-900' : 'text-white'}`}>
      iab<span className="text-emerald-500">.investments</span>
    </span>
  )
}

const NAV = [
  { href: '/', label: 'Startseite' },
  { href: '/angebote', label: 'Marktplatz' },
  { href: '/iab-rechner', label: 'IAB-Rechner' },
  { href: '/ratgeber', label: 'Wissen' },
  { href: '/so-funktionierts', label: "So funktioniert's" },
  { href: '/anbieter', label: 'Für Anbieter' },
]

const isActive = (pathname: string, href: string) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`))

export function Header() {
  const pathname = usePathname() ?? ''
  const home = pathname === '/'
  const [scrolled, setScrolled] = useState(false)
  const [menu, setMenu] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile menu on navigation (state adjusted during render, keyed by pathname)
  const [menuPath, setMenuPath] = useState(pathname)
  if (menuPath !== pathname) {
    setMenuPath(pathname)
    setMenu(false)
  }

  const transparent = home && !scrolled && !menu

  return (
    <header
      className={`${home ? 'fixed inset-x-0' : 'sticky'} top-0 z-40 transition-colors duration-300 ${
        transparent ? 'bg-transparent' : 'bg-slate-900/95 shadow-lg shadow-slate-950/20 backdrop-blur'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-20">
        <Link href="/" aria-label="Startseite" className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Hauptnavigation" className="hidden rounded-full bg-white px-2 py-1.5 shadow-lg shadow-slate-950/10 lg:block">
          <ul className="flex items-center">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  aria-current={isActive(pathname, n.href) ? 'page' : undefined}
                  className={`block whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors xl:px-4 ${
                    isActive(pathname, n.href) ? 'text-emerald-600' : 'text-slate-800 hover:text-emerald-600'
                  }`}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <AuthNav />
          <button
            type="button"
            onClick={() => setMenu((m) => !m)}
            aria-expanded={menu}
            aria-label={menu ? 'Menü schließen' : 'Menü öffnen'}
            className="flex h-10 w-10 items-center justify-center rounded-full text-white ring-1 ring-white/40 transition-colors hover:bg-white/10 lg:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5" aria-hidden>
              {menu ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {menu && (
        <nav aria-label="Hauptnavigation" className="border-t border-white/10 px-4 pb-4 lg:hidden">
          <ul className="mx-auto max-w-7xl space-y-1 pt-3">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  aria-current={isActive(pathname, n.href) ? 'page' : undefined}
                  className={`block rounded-xl px-4 py-2.5 text-base font-medium ${
                    isActive(pathname, n.href) ? 'bg-white/10 text-emerald-400' : 'text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
          <ModalButton
            modal="register"
            className="mx-auto mt-3 block w-full max-w-7xl rounded-xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white hover:bg-emerald-500 sm:hidden"
          >
            Kostenlos registrieren
          </ModalButton>
        </nav>
      )}
    </header>
  )
}
