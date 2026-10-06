'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ModalButton } from './ModalButton'

const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY)

/** "Unlock details" bar for signed-out visitors; client-side so the home page stays static */
export function RegisterBanner() {
  const [signedIn, setSignedIn] = useState<boolean | null>(configured ? null : false)

  useEffect(() => {
    if (!configured) return
    createClient()
      .auth.getUser()
      .then(({ data }) => setSignedIn(Boolean(data.user)))
  }, [])

  if (signedIn !== false) return null

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
      <p className="text-sm text-emerald-900">
        <strong>Kennzahlen und Unterlagen kostenlos freischalten</strong>: Mit einem Konto sehen Sie bei allen Angeboten alle Details.
      </p>
      <ModalButton modal="register" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500">
        Kostenlos registrieren
      </ModalButton>
    </div>
  )
}
