'use client'

import Link from 'next/link'
import { startTransition, useActionState, useEffect, useRef } from 'react'
import { submitPartner, type PartnerFormState } from '@/lib/actions/partners'

const input =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'

function Err({ msg }: { msg?: string }) {
  return msg ? <p className="mt-1 text-xs text-red-600">{msg}</p> : null
}

export function PartnerForm() {
  const [state, action, pending] = useActionState<PartnerFormState, FormData>(submitPartner, null)
  const tRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (tRef.current) tRef.current.value = String(Date.now())
  }, [])

  if (state?.ok) {
    return (
      <div className="animate-fade-up rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-2xl text-white">✓</div>
        <p className="mt-3 text-lg font-bold text-slate-900">Danke für Ihre Anmeldung</p>
        <p className="mt-1 text-sm text-slate-600">
          Wir melden uns in den nächsten Werktagen persönlich. Eine Bestätigung ist per E-Mail unterwegs.
        </p>
      </div>
    )
  }

  const fe = state?.fieldErrors ?? {}

  return (
    <form
      className="space-y-4"
      noValidate
      // Manual dispatch so React doesn't reset the inputs on validation errors
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        startTransition(() => action(fd))
      }}
    >
      <input ref={tRef} type="hidden" name="_t" defaultValue="" />
      {/* Honeypot */}
      <input type="text" name="fax" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <input name="firm" placeholder="Kanzlei *" autoComplete="organization" className={input} />
          <Err msg={fe.firm} />
        </div>
        <div>
          <input name="contact_name" placeholder="Ansprechpartner *" autoComplete="name" className={input} />
          <Err msg={fe.contact_name} />
        </div>
        <div>
          <input name="email" type="email" placeholder="E-Mail *" autoComplete="email" className={input} />
          <Err msg={fe.email} />
        </div>
        <input name="phone" type="tel" placeholder="Telefon" autoComplete="tel" className={input} />
        <input name="city" placeholder="Ort" autoComplete="address-level2" className={input} />
        <input name="website" placeholder="Website" autoComplete="url" className={input} />
        <textarea
          name="message"
          rows={3}
          placeholder="Optional: Wie viele Mandanten mit IAB betreuen Sie ungefähr? Was ist Ihnen bei der Zusammenarbeit wichtig?"
          className={`${input} sm:col-span-2`}
        />
      </div>

      <div className="rounded-xl bg-slate-50 p-3">
        <label className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-600">
          <input type="checkbox" name="consent_privacy" className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600" />
          <span>
            Ich habe die{' '}
            <Link href="/datenschutz" target="_blank" className="underline">
              Datenschutzerklärung
            </Link>{' '}
            gelesen und bin einverstanden, dass iab.investments meine Angaben zur Bearbeitung der Anmeldung und zur Kontaktaufnahme
            verarbeitet. *
          </span>
        </label>
        <Err msg={fe.consent_privacy} />
      </div>

      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-emerald-600 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500 disabled:opacity-60"
      >
        {pending ? 'Wird gesendet…' : 'Kostenlos Partner werden'}
      </button>
      <p className="text-center text-xs text-slate-400">Unverbindlich. Wir melden uns persönlich.</p>
    </form>
  )
}
