'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { track } from '@/lib/track'
import { openModal } from './SiteModal'

// Other audiences (admin, providers, tax advisors) or pages that are forms themselves
const HIDDEN_PREFIXES = ['/admin', '/login', '/registrieren', '/passwort', '/anbieter', '/steuerberater', '/anfrage']
const SHOW_AFTER_PX = 400

/**
 * Pages with an inquiry form (`#anfrage`) get a sticky CTA to it – a bottom bar on mobile, a button on desktop –
 * hidden while the form itself is on screen. All other pages keep the „Kontakt aufnehmen“ button.
 */
export function FloatingContact() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  // Set by the observer of this page's form; stale values from a previous page are ignored via `path`
  const [formView, setFormView] = useState<{ path: string; inView: boolean } | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SHOW_AFTER_PX)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const form = document.getElementById('anfrage')
    if (!form) return
    // The observer reports the initial state right away, so pages with a form are detected without an extra render
    const io = new IntersectionObserver(([e]) => setFormView({ path: pathname, inView: e.isIntersecting }), { threshold: 0.1 })
    io.observe(form)
    return () => io.disconnect()
  }, [pathname])
  const hasForm = formView?.path === pathname
  const formInView = hasForm && formView.inView

  if (!scrolled || HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null

  if (hasForm) {
    if (formInView) return null
    return (
      <a
        href="#anfrage"
        onClick={() => track('Sticky CTA')}
        className="animate-fade-up print:hidden fixed inset-x-0 bottom-0 z-30 flex items-center justify-center gap-2 bg-emerald-600 px-4 py-3.5 text-center font-bold text-white shadow-[0_-4px_16px_rgba(0,0,0,0.12)] hover:bg-emerald-500 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:rounded-full sm:px-5 sm:py-3 sm:shadow-xl sm:shadow-emerald-900/25"
      >
        <span className="text-sm sm:text-base">Unterlagen & Kalkulation anfordern</span>
        <span className="hidden text-xs font-medium text-emerald-100 sm:inline">kostenlos</span>
      </a>
    )
  }

  return (
    <button
      type="button"
      onClick={() => openModal('contact')}
      aria-label="Fragen? Kontakt aufnehmen"
      className="animate-fade-up print:hidden fixed bottom-4 right-4 z-30 flex items-center gap-2.5 rounded-full bg-slate-900 px-4 py-3 text-white shadow-xl shadow-slate-900/25 transition-all hover:-translate-y-0.5 hover:bg-slate-800 sm:bottom-6 sm:right-6 sm:py-3 sm:pl-4 sm:pr-5"
    >
      <span className="text-sm font-bold sm:hidden">Kontakt</span>
      <span className="hidden text-left sm:block">
        <span className="block text-sm font-bold">Fragen? Kontakt aufnehmen</span>
        <span className="block text-xs text-slate-300">Wir helfen bei der Suche</span>
      </span>
    </button>
  )
}
