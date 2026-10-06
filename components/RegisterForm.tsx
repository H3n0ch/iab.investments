'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { startTransition, useActionState, useEffect, useRef } from 'react'
import { registerAccount, type RegisterState } from '@/lib/actions/auth'

const input =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'

type Props = {
  /** Page variant: go there after sign-up. Modal variant (unset): stay and refresh so gated details unlock. */
  redirectTo?: string
  /** Called after a successful sign-up with an active session (e.g. to close the modal) */
  onDone?: () => void
  /** Offer-specific wording when unlocking a single offer */
  submitLabel?: string
  successTitle?: string
}

export function RegisterForm({ redirectTo, onDone, submitLabel, successTitle }: Props) {
  const router = useRouter()
  const [state, action, pending] = useActionState<RegisterState, FormData>(registerAccount, null)
  const pathRef = useRef<HTMLInputElement>(null)
  const redirectRef = useRef<HTMLInputElement>(null)

  // Client-only: where the user signed up (CRM) and where the confirmation link should lead back to
  useEffect(() => {
    const here = window.location.pathname + window.location.search
    if (pathRef.current) pathRef.current.value = window.location.pathname
    if (redirectRef.current) redirectRef.current.value = redirectTo ?? here
  }, [redirectTo])

  useEffect(() => {
    if (!state?.ok || state.needsConfirm) return
    if (redirectTo) router.push(redirectTo)
    else router.refresh()
    onDone?.()
  }, [state, redirectTo, router, onDone])

  if (state?.ok) {
    return (
      <div className="animate-fade-up rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-2xl text-white">
          {state.needsConfirm ? '✉' : '✓'}
        </div>
        <p className="mt-3 text-lg font-bold text-slate-900">{state.needsConfirm ? 'Bitte bestätigen Sie Ihre E-Mail' : (successTitle ?? 'Konto erstellt')}</p>
        <p className="mt-1 text-sm text-slate-600">
          {state.needsConfirm
            ? 'Wir haben Ihnen einen Bestätigungslink geschickt. Ein Klick darauf, und das Angebot ist für Sie freigeschaltet.'
            : 'Alle Kennzahlen und Unterlagen sind jetzt für Sie sichtbar.'}
        </p>
      </div>
    )
  }

  return (
    <form
      className="space-y-3"
      // Manual dispatch instead of `action={…}` so React doesn't reset the inputs on validation errors
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        startTransition(() => action(fd))
      }}
    >
      <input ref={pathRef} type="hidden" name="landing_path" defaultValue="" />
      <input ref={redirectRef} type="hidden" name="redirectTo" defaultValue="" />
      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      <input name="full_name" required autoComplete="name" placeholder="Vor- und Nachname *" className={input} />
      <input name="company" autoComplete="organization" placeholder="Firma (optional)" className={input} />
      <input type="email" name="email" required autoComplete="email" placeholder="E-Mail *" className={input} />
      <input type="tel" name="phone" required minLength={6} autoComplete="tel" placeholder="Telefon *" className={input} />
      <input type="password" name="password" required minLength={8} autoComplete="new-password" placeholder="Passwort (mind. 8 Zeichen) *" className={input} />
      <label className="flex items-start gap-2.5 pt-1 text-xs leading-relaxed text-slate-600">
        <input type="checkbox" name="consent_privacy" required className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600" />
        <span>
          Ich habe die{' '}
          <Link href="/datenschutz" target="_blank" className="underline">
            Datenschutzerklärung
          </Link>{' '}
          gelesen und bin mit der Speicherung meiner Angaben für mein Konto einverstanden. Eine Weitergabe an Anbieter erfolgt erst,
          wenn ich ein Angebot ausdrücklich anfrage. *
        </span>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-60"
      >
        {pending ? 'Wird freigeschaltet…' : (submitLabel ?? 'Konto erstellen')}
      </button>
    </form>
  )
}
