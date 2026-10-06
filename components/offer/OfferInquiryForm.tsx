'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { startTransition, useActionState, useEffect, useRef, useState } from 'react'
import { submitOfferInquiry, type OfferInquiryState } from '@/lib/actions/leads'
import { CONSENT_CALL_TEXT, CONSENT_PRIVACY_TEXT, offerShareText } from '@/lib/consent'
import { formatDeadline, iabYears, investTimings, LEGAL_FORMS } from '@/lib/iab'

type Props = {
  categorySlug: string
  categoryName: string
  offerId: string
  offerTitle: string
  /** Prefill for the investment amount (minimum ticket of the offer, euros) */
  minInvestment: number | null
  /** Prefill for signed-in users */
  defaults?: { name?: string | null; email?: string | null; phone?: string | null; company?: string | null }
}

const [privacyBefore, privacyAfter] = CONSENT_PRIVACY_TEXT.split('Datenschutzerklärung')

const input =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
const lbl = 'mb-1 block text-xs font-medium text-slate-600'

// Direct inquiry for one offer: replaces "register first, then request" – one step, one sellable lead
export function OfferInquiryForm({ categorySlug, categoryName, offerId, offerTitle, minInvestment, defaults }: Props) {
  const router = useRouter()
  const [state, action, pending] = useActionState<OfferInquiryState, FormData>(submitOfferInquiry, null)
  const [timing, setTiming] = useState('')
  const tRef = useRef<HTMLInputElement>(null)
  const pathRef = useRef<HTMLInputElement>(null)
  const utmRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (tRef.current) tRef.current.value = String(Date.now())
    if (pathRef.current) pathRef.current.value = window.location.pathname
    if (utmRef.current) utmRef.current.value = new URLSearchParams(window.location.search).get('utm_source') ?? ''
  }, [])

  // The inquiry set the unlock cookie – re-render the page with all details
  useEffect(() => {
    if (state?.unlocked) router.refresh()
  }, [state, router])

  if (state?.ok) {
    return (
      <div className="animate-fade-up rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-2xl text-white">✓</div>
        <p className="mt-3 text-lg font-bold text-slate-900">Anfrage gesendet</p>
        <p className="mt-1 text-sm text-slate-600">
          Kalkulation, Kennzahlen und Unterlagen sehen Sie jetzt auf dieser Seite. Der Anbieter ruft Sie zurück, kostenlos und unverbindlich.
        </p>
      </div>
    )
  }

  const fe = state?.fieldErrors ?? {}
  const err = (k: string) => fe[k] && <p className="mt-1 text-xs text-red-600">{fe[k]}</p>
  const timings = investTimings()

  return (
    <form
      className="space-y-4"
      noValidate
      // Manual dispatch instead of `action={…}` so React doesn't reset the inputs on validation errors
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        startTransition(() => action(fd))
      }}
    >
      <input type="hidden" name="category" value={categorySlug} />
      <input type="hidden" name="offer_id" value={offerId} />
      <input type="hidden" name="invest_timing" value={timing} />
      <input ref={tRef} type="hidden" name="_t" defaultValue="" />
      <input ref={pathRef} type="hidden" name="landing_path" defaultValue="" />
      <input ref={utmRef} type="hidden" name="utm_source" defaultValue="" />
      {/* Honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <input name="name" defaultValue={defaults?.name ?? undefined} placeholder="Vor- und Nachname *" autoComplete="name" className={input} />
          {err('name')}
        </div>
        <input name="company" defaultValue={defaults?.company ?? undefined} placeholder="Firma (optional)" autoComplete="organization" className={input} />
        <div>
          <input name="email" type="email" defaultValue={defaults?.email ?? undefined} placeholder="E-Mail *" autoComplete="email" className={input} />
          {err('email')}
        </div>
        <div>
          <input name="phone" type="tel" defaultValue={defaults?.phone ?? undefined} placeholder="Telefon *" autoComplete="tel" className={input} />
          {fe.phone ? err('phone') : <p className="mt-1 text-[11px] text-slate-400">Für den Rückruf des Anbieters zu diesem Angebot.</p>}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className={lbl}>Rechtsform *</span>
          <select name="legal_form" defaultValue="" className={input}>
            <option value="" disabled>Bitte wählen</option>
            {LEGAL_FORMS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          {err('legal_form')}
        </label>
        <label className="block">
          <span className={lbl}>Investitionssumme (€ netto) *</span>
          <input
            name="investment"
            inputMode="numeric"
            defaultValue={minInvestment ? minInvestment.toLocaleString('de-DE') : undefined}
            placeholder="z. B. 50.000"
            className={input}
          />
          {err('investment')}
        </label>
        <label className="block">
          <span className={lbl}>IAB gebildet für (optional)</span>
          <select name="iab_year" defaultValue="" className={input}>
            <option value="">Kein IAB / weiß nicht</option>
            {iabYears().map((y) => <option key={y} value={y}>WJ {y} (Frist {formatDeadline(y)})</option>)}
          </select>
        </label>
      </div>

      <fieldset>
        <legend className={lbl}>Wann möchten Sie investieren? *</legend>
        <div className="flex flex-wrap gap-2">
          {timings.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTiming(t.value)}
              aria-pressed={timing === t.value}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                timing === t.value ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {err('invest_timing')}
      </fieldset>

      <div className="space-y-2.5 rounded-xl bg-slate-50 p-3">
        <label className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-600">
          <input type="checkbox" name="consent_share" className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600" />
          <span>{offerShareText(offerTitle, categoryName)} *</span>
        </label>
        {err('consent_share')}
        <label className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-600">
          <input type="checkbox" name="consent_call" className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600" />
          <span>{CONSENT_CALL_TEXT} *</span>
        </label>
        {err('consent_call')}
        <label className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-600">
          <input type="checkbox" name="consent_privacy" className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600" />
          <span>
            {privacyBefore}
            <Link href="/datenschutz" target="_blank" className="underline">Datenschutzerklärung</Link>
            {privacyAfter} *
          </span>
        </label>
        {err('consent_privacy')}
      </div>

      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-emerald-600 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500 disabled:opacity-60"
      >
        {pending ? 'Wird gesendet…' : 'Angebot unverbindlich anfragen'}
      </button>
      <p className="text-center text-xs text-slate-400">Kostenlos & unverbindlich · Kein Passwort nötig · Rückruf vom Anbieter</p>
    </form>
  )
}
