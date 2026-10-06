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
        <span className="hidden max-w-40 truncate text-xs text-slate-400 md:block">{email}</span>
        <button type="submit" className="rounded-lg px-3 py-1.5 text-sm text-slate-300 hover:text-white">
          Abmelden
        </button>
      </form>
    )
  }

  const redirect = pathname && !['/login', '/registrieren'].includes(pathname) ? `?redirectTo=${encodeURIComponent(pathname)}` : ''
  return (
    <>
      <Link href={`/login${redirect}`} className="rounded-lg px-3 py-1.5 text-sm text-slate-300 hover:text-white">
        Anmelden
      </Link>
      <ModalButton modal="register" className="rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-white transition-colors hover:bg-emerald-500">
        <span className="sm:hidden">Registrieren</span>
        <span className="hidden sm:inline">Kostenlos registrieren</span>
      </ModalButton>
    </>
  )
}
