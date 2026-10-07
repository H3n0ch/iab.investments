'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signOut } from '@/lib/actions/auth'
import { createClient } from '@/lib/supabase/client'
import { ModalButton } from './ModalButton'

const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY)

/** Client-side so the header doesn't make every (static) page dynamic. */
export function AuthNav() {
  const pathname = usePathname()
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    if (!configured) return
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setEmail(session?.user.email ?? null))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (email) {
    return (
      <form action={signOut} className="flex items-center gap-2">
        <span className={`${pill} hidden max-w-56 md:flex`}>
          <UserIcon />
          <span className="truncate">{email}</span>
        </span>
        <button type="submit" aria-label="Abmelden" title="Abmelden" className={`${pill} w-11 justify-center px-0 lg:w-12`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4" aria-hidden>
            <path d="M12 3v8M6.3 7.3a8 8 0 1 0 11.4 0" />
          </svg>
        </button>
      </form>
    )
  }

  const redirect = pathname && !['/login', '/registrieren'].includes(pathname) ? `?redirectTo=${encodeURIComponent(pathname)}` : ''
  return (
    <>
      <Link href={`/login${redirect}`} aria-label="Anmelden" className={`${pill} w-11 justify-center px-0 sm:w-auto sm:px-5`}>
        <UserIcon />
        <span className="hidden sm:inline">Anmelden</span>
      </Link>
      <ModalButton
        modal="register"
        // Phones: in the header's menu instead, the bar is too narrow
        className={`${register} hidden sm:flex`}
      >
        <RegisterContent />
      </ModalButton>
    </>
  )
}

// Outlined pill like "Anmelden", with a check (= free, no risk); without display so callers pick flex/hidden
export const register =
  'h-11 items-center gap-2 whitespace-nowrap rounded-full px-5 text-[15px] font-semibold text-white ring-[1.5px] ring-white/50 transition-colors hover:bg-white/10 lg:h-12'

export function RegisterContent() {
  return (
    <>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden>
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
      Kostenlos registrieren
    </>
  )
}

// Outlined pill on the navy/transparent header (like Milk the Sun's "Mein Konto")
const pill =
  'flex h-11 items-center gap-2 rounded-full px-5 text-[15px] font-semibold text-white ring-[1.5px] ring-white/50 transition-colors hover:bg-white/10 lg:h-12'

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4 shrink-0" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  )
}
