'use client'

import Link from 'next/link'
import { startTransition, useActionState, useEffect, useRef } from 'react'
import { submitContact, type LeadFormState } from '@/lib/actions/leads'
import { CONSENT_PRIVACY_TEXT } from '@/lib/consent'

const [privacyBefore, privacyAfter] = CONSENT_PRIVACY_TEXT.split('Datenschutzerklärung')

const input =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'

export function ContactForm() {
  const [state, action, pending] = useActionState<LeadFormState, FormData>(submitContact, null)
  const tRef = useRef<HTMLInputElement>(null)
  const pathRef = useRef<HTMLInputElement>(null)
  const utmRef = useRef<HTMLInputElement>(null)

  // Client-only values: render timestamp (bot check), landing path, UTM source
  useEffect(() => {
    if (tRef.current) tRef.current.value = String(Date.now())
    if (pathRef.current) pathRef.current.value = window.location.pathname
    if (utmRef.current) utmRef.current.value = new URLSearchParams(window.location.search).get('utm_source') ?? ''
  }, [])

  if (state?.ok) {
    return (
      <div className="animate-fade-up rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-2xl text-white">✓</div>
        <p className="mt-3 text-lg font-bold text-slate-900">Nachricht gesendet</p>
        <p className="mt-1 text-sm text-slate-600">Danke! Wir melden uns in Kürze bei Ihnen.</p>
      </div>
    )
  }

  const fe = state?.fieldErrors ?? {}

  return (
    <form
      className="space-y-3"
      noValidate
      // Manual dispatch instead of `action={…}` so React doesn't reset the inputs on validation errors
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        startTransition(() => action(fd))
      }}
    >
      <input ref={tRef} type="hidden" name="_t" defaultValue="" />
      <input ref={pathRef} type="hidden" name="landing_path" defaultValue="" />
      <input ref={utmRef} type="hidden" name="utm_source" defaultValue="" />
      {/* Honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <input name="name" placeholder="Vor- und Nachname *" autoComplete="name" className={input} />
          {fe.name && <p className="mt-1 text-xs text-red-600">{fe.name}</p>}
        </div>
        <div>
          <input name="email" type="email" placeholder="E-Mail *" autoComplete="email" className={input} />
          {fe.email && <p className="mt-1 text-xs text-red-600">{fe.email}</p>}
        </div>
        <input name="phone" type="tel" placeholder="Telefon (für Rückruf, optional)" autoComplete="tel" className={`${input} sm:col-span-2`} />
      </div>
      <div>
        <textarea
          name="message"
          rows={4}
          placeholder="Wobei können wir helfen? z. B. „Welche Investitionsgüter kommen für meinen IAB infrage?“ *"
          className={`${input} resize-none`}
        />
        {fe.message && <p className="mt-1 text-xs text-red-600">{fe.message}</p>}
      </div>

      <label className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-600">
        <input type="checkbox" name="consent_privacy" className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600" />
        <span>
          {privacyBefore}
          <Link href="/datenschutz" target="_blank" className="underline">Datenschutzerklärung</Link>
          {privacyAfter} *
        </span>
      </label>
      {fe.consent_privacy && <p className="text-xs text-red-600">{fe.consent_privacy}</p>}

      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-60"
      >
        {pending ? 'Wird gesendet…' : 'Nachricht senden'}
      </button>
    </form>
  )
}
