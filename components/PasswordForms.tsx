'use client'

import Link from 'next/link'
import { startTransition, useActionState } from 'react'
import { requestPasswordReset, updatePassword, type PasswordState } from '@/lib/actions/auth'

const input =
  'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
const button = 'w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60'

function Success({ icon, title, text, href, linkLabel }: { icon: string; title: string; text: string; href: string; linkLabel: string }) {
  return (
    <div className="animate-fade-up space-y-3 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-2xl text-white">{icon}</div>
      <p className="text-lg font-bold text-slate-900">{title}</p>
      <p className="text-sm text-slate-600">{text}</p>
      <Link href={href} className="inline-block text-sm font-semibold text-emerald-700 hover:underline">
        {linkLabel}
      </Link>
    </div>
  )
}

export function ForgotPasswordForm({ initialError }: { initialError?: string | null }) {
  const [state, action, pending] = useActionState<PasswordState, FormData>(requestPasswordReset, null)

  if (state?.ok) {
    return (
      <Success
        icon="✉"
        title="E-Mail ist unterwegs"
        text="Falls ein Konto mit dieser E-Mail-Adresse existiert, erhalten Sie in Kürze einen Link zum Zurücksetzen. Schauen Sie auch im Spam-Ordner nach."
        href="/login"
        linkLabel="Zurück zur Anmeldung →"
      />
    )
  }

  const error = state?.error ?? initialError
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        startTransition(() => action(fd))
      }}
    >
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <input type="email" name="email" required autoComplete="email" placeholder="E-Mail" className={input} />
      <button type="submit" disabled={pending} className={button}>
        {pending ? 'Wird gesendet…' : 'Link zum Zurücksetzen senden'}
      </button>
    </form>
  )
}

export function NewPasswordForm() {
  const [state, action, pending] = useActionState<PasswordState, FormData>(updatePassword, null)

  if (state?.ok) {
    return (
      <Success
        icon="✓"
        title="Passwort geändert"
        text="Ihr neues Passwort ist gespeichert und Sie sind angemeldet."
        href="/angebote"
        linkLabel="Zu den Angeboten →"
      />
    )
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        startTransition(() => action(fd))
      }}
    >
      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      <input type="password" name="password" required minLength={8} autoComplete="new-password" placeholder="Neues Passwort (mind. 8 Zeichen)" className={input} />
      <input type="password" name="password_repeat" required minLength={8} autoComplete="new-password" placeholder="Neues Passwort wiederholen" className={input} />
      <button type="submit" disabled={pending} className={button}>
        {pending ? 'Wird gespeichert…' : 'Passwort speichern'}
      </button>
    </form>
  )
}
