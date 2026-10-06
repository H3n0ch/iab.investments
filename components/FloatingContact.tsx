'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { openModal } from './SiteModal'

// Other audiences (admin, providers, tax advisors) or pages that are forms themselves
const HIDDEN_PREFIXES = ['/admin', '/login', '/registrieren', '/passwort', '/anbieter', '/steuerberater']
const SHOW_AFTER_PX = 400

export function FloatingContact() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible || HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null

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
