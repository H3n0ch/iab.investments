'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { startTransition, useActionState, useEffect, useRef, useState } from 'react'
import { submitLead, type LeadFormState } from '@/lib/actions/leads'
import { CATEGORIES } from '@/lib/categories'
import { categoryShareText, CONSENT_CALL_TEXT, CONSENT_PRIVACY_TEXT } from '@/lib/consent'

type Props = {
  preselected: string[]
  /** Restrict selectable categories (e.g. check result); defaults to all */
  options?: string[]
  source: 'check' | 'tile' | 'landing' | 'offer' | 'frist'
  amount?: string
  year?: number
  goal?: string
  offerId?: string
  submitLabel?: string
  /** Short variant for the check: categories already chosen in the result step, no company field */
  compact?: boolean
  /** Referral code of a tax advisor partner – stored as utm_source 'partner:<code>' */
  partner?: string
  /** Prefill for signed-in users */
  defaults?: { name?: string | null; email?: string | null; phone?: string | null; company?: string | null }
}

const [privacyBefore, privacyAfter] = CONSENT_PRIVACY_TEXT.split('Datenschutzerklärung')

const input =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'

export function LeadForm({ preselected, options, source, amount, year, goal, offerId, submitLabel, compact = false, partner, defaults }: Props) {
  const router = useRouter()
  const [state, action, pending] = useActionState<LeadFormState, FormData>(submitLead, null)
  const [selected, setSelected] = useState<string[]>(preselected)
  const tRef = useRef<HTMLInputElement>(null)
  const pathRef = useRef<HTMLInputElement>(null)
  const utmRef = useRef<HTMLInputElement>(null)

  // Client-only values: render timestamp (bot check), landing path, UTM source
  useEffect(() => {
    if (tRef.current) tRef.current.value = String(Date.now())
    if (pathRef.current) pathRef.current.value = window.location.pathname
    if (utmRef.current) utmRef.current.value = partner ? `partner:${partner}` : (new URLSearchParams(window.location.search).get('utm_source') ?? '')
  }, [partner])

  // The inquiry unlocks all offer details (cookie) – refresh so listings and offer pages show them
  useEffect(() => {
    if (state?.ok) router.refresh()
  }, [state, router])

  if (state?.ok) {
    return (
      <div className="animate-fade-up rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-2xl text-white">✓</div>
        <p className="mt-3 text-lg font-bold text-slate-900">Anfrage gesendet</p>
        <p className="mt-1 text-sm text-slate-600">
          Passende Anbieter melden sich in Kürze telefonisch bei Ihnen. Alle Angebotsdetails sind jetzt für Sie freigeschaltet.
        </p>
      </div>
    )
  }

  const fe = state?.fieldErrors ?? {}
  const cats = options ? CATEGORIES.filter((c) => options.includes(c.slug)) : CATEGORIES
  const toggle = (slug: string) =>
    setSelected((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug]))

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
      <input type="hidden" name="source" value={source} />
      {amount && <input type="hidden" name="iab_amount" value={amount} />}
      {year && <input type="hidden" name="iab_year" value={year} />}
      {goal && <input type="hidden" name="goal" value={goal} />}
      {offerId && <input type="hidden" name="offer_id" value={offerId} />}
      <input ref={tRef} type="hidden" name="_t" defaultValue="" />
      <input ref={pathRef} type="hidden" name="landing_path" defaultValue="" />
      <input ref={utmRef} type="hidden" name="utm_source" defaultValue="" />
      {/* Honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {compact ? (
        selected.map((slug) => <input key={slug} type="hidden" name="categories" value={slug} />)
      ) : (
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-slate-700">Für welche Investitionsgüter möchten Sie Angebote?</legend>
          <div className="flex flex-wrap gap-2">
            {cats.map((c) => {
              const on = selected.includes(c.slug)
              return (
                <label
                  key={c.slug}
                  className={`cursor-pointer select-none rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    on ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
                  }`}
                >
                  <input type="checkbox" name="categories" value={c.slug} checked={on} onChange={() => toggle(c.slug)} className="sr-only" />
                  {c.name}
                </label>
              )
            })}
          </div>
          {fe.categories && <p className="mt-1 text-xs text-red-600">{fe.categories}</p>}
        </fieldset>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <input name="name" defaultValue={defaults?.name ?? undefined} placeholder="Vor- und Nachname *" autoComplete="name" className={input} />
          {fe.name && <p className="mt-1 text-xs text-red-600">{fe.name}</p>}
        </div>
        {!compact && <input name="company" defaultValue={defaults?.company ?? undefined} placeholder="Firma (optional)" autoComplete="organization" className={input} />}
        <div>
          <input name="email" type="email" defaultValue={defaults?.email ?? undefined} placeholder="E-Mail *" autoComplete="email" className={input} />
          {fe.email && <p className="mt-1 text-xs text-red-600">{fe.email}</p>}
        </div>
        <div className={compact ? 'sm:col-span-2' : ''}>
          <input name="phone" type="tel" defaultValue={defaults?.phone ?? undefined} placeholder="Telefon *" autoComplete="tel" className={input} />
          {fe.phone ? (
            <p className="mt-1 text-xs text-red-600">{fe.phone}</p>
          ) : (
            <p className="mt-1 text-[11px] text-slate-400">Für den Rückruf der Anbieter zu Ihrer Anfrage.</p>
          )}
        </div>
      </div>

      <div className={`space-y-2.5 rounded-xl bg-slate-50 p-3 ${compact ? '[&_label]:text-[11px] [&_label]:leading-snug' : ''}`}>
        <label className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-600">
          <input type="checkbox" name="consent_share" className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600" />
          <span>{categoryShareText(CATEGORIES.filter((c) => selected.includes(c.slug)).map((c) => c.name))} *</span>
        </label>
        {fe.consent_share && <p className="text-xs text-red-600">{fe.consent_share}</p>}
        <label className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-600">
          <input type="checkbox" name="consent_call" className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600" />
          <span>{CONSENT_CALL_TEXT} *</span>
        </label>
        {fe.consent_call && <p className="text-xs text-red-600">{fe.consent_call}</p>}
        <label className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-600">
          <input type="checkbox" name="consent_privacy" className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600" />
          <span>
            {privacyBefore}
            <Link href="/datenschutz" target="_blank" className="underline">Datenschutzerklärung</Link>
            {privacyAfter} *
          </span>
        </label>
        {fe.consent_privacy && <p className="text-xs text-red-600">{fe.consent_privacy}</p>}
      </div>

      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-emerald-600 py-3 text-base font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-60 transition-colors"
      >
        {pending ? 'Wird gesendet…' : submitLabel ?? 'Kostenlos Angebote erhalten'}
      </button>
      <p className="text-center text-xs text-slate-400">Kostenlos & unverbindlich · Persönlicher Kontakt</p>
    </form>
  )
}
