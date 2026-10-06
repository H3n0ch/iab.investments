'use client'

import Link from 'next/link'
import { startTransition, useActionState, useEffect, useRef } from 'react'
import { submitProvider, type ProviderFormState } from '@/lib/actions/providers'
import { CATEGORIES } from '@/lib/categories'
import { COUNTRIES } from '@/lib/countries'

const input =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'

function Err({ msg }: { msg?: string }) {
  return msg ? <p className="mt-1 text-xs text-red-600">{msg}</p> : null
}

export function ProviderForm() {
  const [state, action, pending] = useActionState<ProviderFormState, FormData>(submitProvider, null)
  const tRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (tRef.current) tRef.current.value = String(Date.now())
  }, [])

  if (state?.ok) {
    return (
      <div className="animate-fade-up rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-2xl text-white">✓</div>
        <p className="mt-3 text-lg font-bold text-slate-900">Danke für Ihre Einreichung</p>
        <p className="mt-1 text-sm text-slate-600">
          Wir sichten Ihr Produkt und melden uns in den nächsten Werktagen. Eine Bestätigung ist per E-Mail unterwegs.
        </p>
      </div>
    )
  }

  const fe = state?.fieldErrors ?? {}

  return (
    <form
      className="space-y-5"
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

      <fieldset className="space-y-3">
        <legend className="mb-2 text-sm font-semibold text-slate-900">Ihr Unternehmen</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <input name="company" placeholder="Firma *" autoComplete="organization" className={input} />
            <Err msg={fe.company} />
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
          <input name="website" placeholder="Website, z. B. www.beispiel.de" autoComplete="url" className={`${input} sm:col-span-2`} />
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-2 text-sm font-semibold text-slate-900">Ihr Produkt</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <select name="category" defaultValue="" className={input}>
              <option value="" disabled>
                Kategorie wählen *
              </option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
              <option value="sonstige">Andere bewegliche Wirtschaftsgüter</option>
            </select>
            <Err msg={fe.category} />
          </div>
          <div>
            <input name="title" placeholder="Produktbezeichnung *" className={input} />
            <Err msg={fe.title} />
          </div>
          <div className="sm:col-span-2">
            <textarea
              name="description"
              rows={6}
              placeholder="Beschreibung *: Was erwirbt der Kunde konkret? Wie funktioniert das Betreiber- oder Nutzungsmodell? Laufzeit, Erträge, Rückkauf, Lieferzeit …"
              className={input}
            />
            <Err msg={fe.description} />
          </div>
          <div>
            <input name="min_investment" inputMode="decimal" placeholder="Mindestinvestition in € netto" className={input} />
            <Err msg={fe.min_investment} />
          </div>
          <input name="location" placeholder="Standort, z. B. Brandenburg oder bundesweit" className={input} />
          <select name="country" defaultValue="DE" className={input} aria-label="Land">
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                Land: {c.name}
              </option>
            ))}
          </select>
          <input name="availability" placeholder="Verfügbarkeit, z. B. Lieferung bis Dez." className={input} />
          <input name="expected_yield" placeholder='Ertrag, z. B. "ca. 6 % p.a. laut Anbieter"' className={input} />
          <input name="image_url" placeholder="Link zu einem Produktbild (optional)" className={input} />
          <input name="documents_url" placeholder="Link zu Exposé oder Unterlagen (optional)" className={input} />
        </div>
      </fieldset>

      <div className="rounded-xl bg-slate-50 p-3">
        <label className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-600">
          <input type="checkbox" name="consent_privacy" className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600" />
          <span>
            Ich habe die{' '}
            <Link href="/datenschutz" target="_blank" className="underline">
              Datenschutzerklärung
            </Link>{' '}
            gelesen und bin einverstanden, dass iab.investments meine Angaben zur Prüfung der Einreichung und zur Kontaktaufnahme
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
        {pending ? 'Wird gesendet…' : 'Produkt einreichen'}
      </button>
      <p className="text-center text-xs text-slate-400">Die Einreichung ist unverbindlich. Wir melden uns persönlich.</p>
    </form>
  )
}
