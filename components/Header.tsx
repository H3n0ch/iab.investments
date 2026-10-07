'use client'

// Header in the style of Milk the Sun: logo left, white pill navigation in the middle, outlined pill buttons right.
// Transparent on every page; once scrolled it turns into frosted glass (navy only with the mobile menu open). On the home page it floats over the hero photo.

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AuthNav, RegisterContent, register } from './AuthNav'
import { ModalButton } from './ModalButton'

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span className={`text-lg font-extrabold tracking-tight ${dark ? 'text-slate-900' : 'text-white'}`}>
      iab<span className={dark ? 'text-emerald-600' : 'text-emerald-400'}>.investments</span>
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

  const transparent = !menu && !scrolled
  const frosted = !menu && scrolled

  return (
    <header
      className={`${home ? 'fixed inset-x-0' : 'sticky'} top-0 z-40 transition-colors duration-300 ${
        transparent
          ? 'bg-transparent'
          : frosted
            ? 'bg-slate-900/25 shadow-[inset_0_-1px_0_rgb(255_255_255/0.1)] backdrop-blur-md backdrop-saturate-150'
            : 'bg-slate-900/95 shadow-lg shadow-slate-950/20 backdrop-blur'
      }`}
    >
      <div className="mx-auto flex h-[68px] max-w-[1480px] items-center justify-between gap-4 px-4 sm:px-[clamp(16px,3vw,56px)] lg:h-[84px]">
        <Link href="/" aria-label="Startseite" className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Hauptnavigation" className="hidden rounded-full bg-white p-1.5 shadow-[0_16px_40px_-18px_rgb(5_20_40/0.6)] lg:block">
          <ul className="flex items-center gap-0.5">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  aria-current={isActive(pathname, n.href) ? 'page' : undefined}
                  className={`flex h-11 items-center whitespace-nowrap rounded-full px-3 text-sm font-semibold tracking-[.005em] transition-colors xl:px-4 xl:text-[15.5px] ${
                    isActive(pathname, n.href) ? 'text-emerald-600' : 'text-slate-900 hover:bg-slate-100'
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
            className="flex h-11 w-11 items-center justify-center rounded-full text-white ring-[1.5px] ring-white/50 transition-colors hover:bg-white/10 lg:hidden"
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
            className={`${register} mx-auto mt-3 flex w-full max-w-7xl justify-center sm:hidden`}
          >
            <RegisterContent />
          </ModalButton>
        </nav>
      )}
    </header>
  )
}
