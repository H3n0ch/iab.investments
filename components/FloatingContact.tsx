'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { track } from '@/lib/track'
import { openModal } from './SiteModal'

// Other audiences (admin, providers, tax advisors) or pages that are forms themselves
const HIDDEN_PREFIXES = ['/admin', '/login', '/registrieren', '/passwort', '/anbieter', '/steuerberater', '/anfrage']
/** Offer detail page: /<kategorie>/<uuid> */
const OFFER_PAGE = /^\/[a-z0-9-]+\/[0-9a-f-]{36}$/

type Target = { path: string; kind: 'projekte' | 'anfrage'; inView: boolean }

/**
 * Sticky button, shown only after half of the page (calm pages, element budget):
 * - guide pages with a project preview (#projekte): „Aktuelle Projekte ansehen“, hidden while the preview is on screen
 * - offer pages: „Unterlagen & Kalkulation anfordern“ (opens the inquiry modal)
 * - other pages with a form: „Aktuelle Projekte ansehen“ → /angebote
 * - everything else keeps the „Kontakt aufnehmen“ button.
 */
export function FloatingContact() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [target, setTarget] = useState<Target | null>(null)

  useEffect(() => {
    const onScroll = () => {
      const half = (document.documentElement.scrollHeight - window.innerHeight) * 0.5
      setScrolled(window.scrollY > Math.max(400, half))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  useEffect(() => {
    const projekte = document.getElementById('projekte')
    const el = projekte ?? document.getElementById('anfrage')
    if (!el) return
    const kind = projekte ? 'projekte' : 'anfrage'
    // The observer reports the initial state right away, so the target is detected without an extra render
    const io = new IntersectionObserver(([e]) => setTarget({ path: pathname, kind, inView: e.isIntersecting }), { threshold: 0.1 })
    io.observe(el)
    return () => io.disconnect()
  }, [pathname])

  if (!scrolled || HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null
  const t = target?.path === pathname ? target : null

  if (t) {
    if (t.inView) return null
    const offerPage = OFFER_PAGE.test(pathname)
    const href = offerPage ? '#anfrage' : t.kind === 'projekte' ? '#projekte' : '/angebote'
    const label = offerPage ? 'Unterlagen & Kalkulation anfordern' : 'Aktuelle Projekte ansehen'
    return (
      <a
        href={href}
        onClick={() => track('Sticky CTA', { ziel: href })}
        className="animate-fade-up print:hidden fixed inset-x-0 bottom-0 z-30 flex items-center justify-center bg-slate-800/95 px-4 py-3 text-center text-sm font-semibold text-white shadow-[0_-4px_16px_rgba(0,0,0,0.12)] backdrop-blur hover:bg-slate-700 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:rounded-full sm:px-5 sm:shadow-xl"
      >
        {label} →
      </a>
    )
  }

  return (
    <button
      type="button"
      onClick={() => openModal('contact')}
      aria-label="Fragen? Kontakt aufnehmen"
      className="animate-fade-up print:hidden fixed bottom-4 right-4 z-30 flex items-center gap-2.5 rounded-full bg-slate-800 px-4 py-3 text-white shadow-xl shadow-slate-900/25 transition-all hover:-translate-y-0.5 hover:bg-slate-700 sm:bottom-6 sm:right-6 sm:py-3 sm:pl-4 sm:pr-5"
    >
      <span className="text-sm font-bold sm:hidden">Kontakt</span>
      <span className="hidden text-left sm:block">
        <span className="block text-sm font-bold">Fragen? Kontakt aufnehmen</span>
        <span className="block text-xs text-slate-300">Wir helfen bei der Suche</span>
      </span>
    </button>
  )
}
