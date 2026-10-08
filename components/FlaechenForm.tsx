'use client'

import Link from 'next/link'
import { startTransition, useActionState, useEffect, useRef } from 'react'
import { submitLandLead, type LeadFormState } from '@/lib/actions/leads'
import { CONSENT_CALL_TEXT, CONSENT_PRIVACY_TEXT, LAND_SHARE_TEXT } from '@/lib/consent'
import { LAND_TYPES } from '@/lib/iab'
import { track } from '@/lib/track'

// Landowners offering land for solar parks – a separate lead type, sold to solar park developers.

const [privacyBefore, privacyAfter] = CONSENT_PRIVACY_TEXT.split('Datenschutzerklärung')
const input =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
const lbl = 'mb-1 block text-xs font-medium text-slate-600'

export function FlaechenForm() {
  const [state, action, pending] = useActionState<LeadFormState, FormData>(submitLandLead, null)
  const tRef = useRef<HTMLInputElement>(null)
  const pathRef = useRef<HTMLInputElement>(null)
  const refs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    if (tRef.current) tRef.current.value = String(Date.now())
    if (pathRef.current) pathRef.current.value = window.location.pathname
    const params = new URLSearchParams(window.location.search)
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'gclid']) {
      const el = refs.current[k]
      if (el) el.value = params.get(k) ?? ''
    }
  }, [])

  useEffect(() => {
    if (state?.ok) track('Lead', { source: 'flaeche' })
  }, [state])

  if (state?.ok) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-2xl text-white">✉</div>
        <p className="mt-3 text-lg font-bold text-slate-900">Fast geschafft: Bitte bestätigen Sie Ihre E-Mail</p>
        <p className="mt-1 text-sm text-slate-600">Nach Ihrer Bestätigung prüfen wir die Fläche und melden uns telefonisch.</p>
      </div>
    )
  }

  const fe = state?.fieldErrors ?? {}
  const err = (k: string) => fe[k] && <p className="mt-1 text-xs text-red-600">{fe[k]}</p>

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        startTransition(() => action(fd))
      }}
    >
      <input ref={tRef} type="hidden" name="_t" defaultValue="" />
      <input ref={pathRef} type="hidden" name="landing_path" defaultValue="" />
      {['utm_source', 'utm_medium', 'utm_campaign', 'gclid'].map((k) => (
        <input key={k} ref={(el) => { refs.current[k] = el }} type="hidden" name={k} defaultValue="" />
      ))}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className={lbl}>Größe (Hektar) *</span>
          <input name="land_area_ha" inputMode="decimal" placeholder="z. B. 5" className={input} />
          {err('land_area_ha')}
        </label>
        <label className="block">
          <span className={lbl}>PLZ der Fläche *</span>
          <input name="land_plz" inputMode="numeric" maxLength={5} placeholder="z. B. 14469" className={input} />
          {err('land_plz')}
        </label>
        <label className="block">
          <span className={lbl}>Art der Fläche *</span>
          <select name="land_type" defaultValue="" className={input}>
            <option value="" disabled>Bitte wählen</option>
            {LAND_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          {err('land_type')}
        </label>
      </div>
      <label className="block">
        <span className={lbl}>Netzanschluss (Umspannwerk, Mittelspannung) in der Nähe?</span>
        <select name="grid" defaultValue="unbekannt" className={input}>
          <option value="unbekannt">Weiß ich nicht</option>
          <option value="ja">Ja, ist mir bekannt</option>
          <option value="nein">Nein</option>
        </select>
      </label>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <input name="name" placeholder="Vor- und Nachname *" autoComplete="name" className={input} />
          {err('name')}
        </div>
        <div>
          <input name="email" type="email" placeholder="E-Mail *" autoComplete="email" className={input} />
          {err('email')}
        </div>
        <div>
          <input name="phone" type="tel" placeholder="Telefon *" autoComplete="tel" className={input} />
          {err('phone')}
        </div>
      </div>

      <div className="space-y-2.5 rounded-xl bg-slate-50 p-3">
        <label className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-600">
          <input type="checkbox" name="consent_share" className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600" />
          <span>{LAND_SHARE_TEXT} *</span>
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
        {pending ? 'Wird gesendet…' : 'Fläche kostenlos prüfen lassen'}
      </button>
      <p className="text-center text-xs text-slate-400">Für Sie kostenlos und unverbindlich. Wir werden von den Projektierern vergütet.</p>
    </form>
  )
}
