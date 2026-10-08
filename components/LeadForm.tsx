'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { startTransition, useActionState, useEffect, useRef, useState } from 'react'
import { submitLead, type LeadFormState } from '@/lib/actions/leads'
import { CATEGORIES } from '@/lib/categories'
import { categoryShareText, CONSENT_CALL_TEXT, CONSENT_PRIVACY_TEXT, FEE_NOTE, offerShareText } from '@/lib/consent'
import { BUDGETS, formatDeadline, iabYears, investTimings, LEGAL_FORMS } from '@/lib/iab'
import { track } from '@/lib/track'

// Multi-step inquiry „Unterlagen & Kalkulation anfordern“, used on every page:
// category → IAB amount → deadline → budget → timing → contact + consents.
// Steps whose value the page already knows (category page, deadline check, offer) are skipped.

type Source = 'check' | 'tile' | 'landing' | 'offer' | 'frist' | 'angebot' | 'ratgeber' | 'rechner'
type StepId = 'kategorie' | 'iab' | 'frist' | 'budget' | 'zeitpunkt' | 'kontakt'

type Props = {
  preselected: string[]
  /** Restrict selectable categories; defaults to all */
  options?: string[]
  source: Source
  /** Exact IAB amount in euros, known from a calculator – skips the amount step */
  iabAmount?: number
  /** Formation year, known from the deadline check – skips the deadline step */
  year?: number
  /** Offer mode: category fixed, consent names exactly this offer */
  offer?: { id: string; title: string; categorySlug: string; categoryName: string }
  submitLabel?: string
  /** Referral code of a tax advisor partner – stored as utm_source 'partner:<code>' */
  partner?: string
  /** Prefill for signed-in users */
  defaults?: { name?: string | null; email?: string | null; phone?: string | null; company?: string | null }
}

const STEP_LABELS: Record<StepId, string> = {
  kategorie: 'Investitionsgut',
  iab: 'IAB-Höhe',
  frist: 'Frist',
  budget: 'Budget',
  zeitpunkt: 'Zeitpunkt',
  kontakt: 'Kontakt',
}

/** Server field errors → the step that shows the field */
const FIELD_STEP: Record<string, StepId> = {
  categories: 'kategorie',
  iab_amount_eur: 'iab',
  budget: 'budget',
  invest_timing: 'zeitpunkt',
}

const ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'gclid'] as const
const ATTR_STORE = 'iab_attr'

const [privacyBefore, privacyAfter] = CONSENT_PRIVACY_TEXT.split('Datenschutzerklärung')

const input =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
const chip = (on: boolean) =>
  `rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
    on ? 'border-emerald-600 bg-emerald-50 font-semibold text-emerald-800' : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
  }`
const euroIn = (v: string) => Number(v.replace(/[^\d]/g, '')) || 0

export function LeadForm({ preselected, options, source, iabAmount, year, offer, submitLabel, partner, defaults }: Props) {
  const router = useRouter()
  const [state, action, pending] = useActionState<LeadFormState, FormData>(submitLead, null)

  const [selected, setSelected] = useState<string[]>(offer ? [offer.categorySlug] : preselected)
  const [iabText, setIabText] = useState(iabAmount ? iabAmount.toLocaleString('de-DE') : '')
  const [noIab, setNoIab] = useState(iabAmount === 0)
  const [yearChoice, setYearChoice] = useState<number | 'offen' | null>(year ?? null)
  const [budget, setBudget] = useState('')
  const [timing, setTiming] = useState('')
  const [stepError, setStepError] = useState('')
  const [sentTo, setSentTo] = useState('')

  const steps = (
    [
      !offer && preselected.length === 0 && 'kategorie',
      iabAmount == null && 'iab',
      year == null && !noIab && 'frist',
      'budget',
      'zeitpunkt',
      'kontakt',
    ] as (StepId | false)[]
  ).filter((s): s is StepId => Boolean(s))
  const [current, setCurrent] = useState<StepId>(steps[0])
  const idx = Math.max(0, steps.indexOf(current))

  const tRef = useRef<HTMLInputElement>(null)
  const pathRef = useRef<HTMLInputElement>(null)
  const attrRefs = useRef<Partial<Record<(typeof ATTR_KEYS)[number], HTMLInputElement | null>>>({})
  const tracked = useRef(false)

  // Client-only values: render timestamp (bot check), landing path, campaign attribution.
  // Attribution survives navigation within the session (ad click lands on one page, inquiry on another).
  useEffect(() => {
    if (tRef.current) tRef.current.value = String(Date.now())
    if (pathRef.current) pathRef.current.value = window.location.pathname
    const params = new URLSearchParams(window.location.search)
    let stored: Record<string, string> = {}
    try {
      stored = JSON.parse(sessionStorage.getItem(ATTR_STORE) ?? '{}')
    } catch {}
    const fromUrl = Object.fromEntries(ATTR_KEYS.map((k) => [k, params.get(k) ?? '']).filter(([, v]) => v))
    const attr = Object.keys(fromUrl).length ? fromUrl : stored
    try {
      if (Object.keys(fromUrl).length) sessionStorage.setItem(ATTR_STORE, JSON.stringify(fromUrl))
    } catch {}
    for (const k of ATTR_KEYS) {
      const el = attrRefs.current[k]
      if (el) el.value = k === 'utm_source' && partner ? `partner:${partner}` : (attr[k] ?? '')
    }
  }, [partner])

  // A new server result with field errors: jump back to the step that shows the first one (state adjusted during render)
  const [seenState, setSeenState] = useState(state)
  if (seenState !== state) {
    setSeenState(state)
    const first = Object.keys(state?.fieldErrors ?? {}).map((k) => FIELD_STEP[k]).find((s) => s && steps.includes(s))
    if (first) setCurrent(first)
  }

  useEffect(() => {
    if (!state?.ok) return
    // The inquiry unlocks all offer details (cookie) – refresh so listings and offer pages show them
    router.refresh()
    if (!tracked.current) {
      tracked.current = true
      track('Lead', { source, kategorie: selected.join(',') })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- react to a new server result only
  }, [state])

  if (state?.ok) {
    return (
      <div className="animate-fade-up rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-2xl text-white">✉</div>
        <p className="mt-3 text-lg font-bold text-slate-900">Fast geschafft: Bitte bestätigen Sie Ihre E-Mail</p>
        <p className="mt-1 text-sm text-slate-600">
          Wir haben einen Bestätigungslink an <strong>{sentTo || 'Ihre E-Mail-Adresse'}</strong> gesendet. Nach dem Klick bearbeiten wir Ihre
          Anfrage und melden uns telefonisch. Die Projektdetails auf dieser Seite sind schon jetzt für Sie freigeschaltet.
        </p>
      </div>
    )
  }

  const fe = state?.fieldErrors ?? {}
  const err = (k: string) => fe[k] && <p className="mt-1 text-xs text-red-600">{fe[k]}</p>
  const cats = options ? CATEGORIES.filter((c) => options.includes(c.slug)) : CATEGORIES
  const iabEur = noIab ? 0 : euroIn(iabText)
  const yearValue = typeof yearChoice === 'number' ? yearChoice : null

  const goTo = (to: StepId) => {
    setStepError('')
    setCurrent(to)
    track('Wizard Schritt', { schritt: steps.indexOf(to) + 1, name: to, source })
  }
  const next = (override?: Partial<{ noIab: boolean }>) => {
    const problem =
      current === 'kategorie' && selected.length === 0
        ? 'Bitte wählen Sie mindestens ein Investitionsgut.'
        : current === 'iab' && !(override?.noIab ?? noIab) && iabEur <= 0
          ? 'Bitte geben Sie den Betrag ein oder wählen Sie „Noch kein IAB gebildet“.'
          : ''
    if (problem) return setStepError(problem)
    // Recompute: choosing „no IAB“ removes the deadline step
    const skipFrist = override?.noIab ?? noIab
    const order = steps.filter((s) => !(s === 'frist' && skipFrist))
    const following = order[order.indexOf(current) + 1]
    if (following) goTo(following)
  }
  const back = () => idx > 0 && goTo(steps[idx - 1])

  const shareText = offer
    ? offerShareText(offer.title, offer.categoryName)
    : categoryShareText(CATEGORIES.filter((c) => selected.includes(c.slug)).map((c) => c.name))

  return (
    <form
      className="space-y-4"
      noValidate
      // Manual dispatch instead of `action={…}` so React doesn't reset the inputs on validation errors
      onSubmit={(e) => {
        e.preventDefault()
        if (current !== 'kontakt') return next()
        const fd = new FormData(e.currentTarget)
        setSentTo(String(fd.get('email') ?? ''))
        startTransition(() => action(fd))
      }}
    >
      <input type="hidden" name="source" value={source} />
      {selected.map((slug) => (
        <input key={slug} type="hidden" name="categories" value={slug} />
      ))}
      <input type="hidden" name="iab_amount_eur" value={noIab || iabEur > 0 ? String(iabEur) : ''} />
      <input type="hidden" name="iab_year" value={yearValue ?? ''} />
      <input type="hidden" name="budget" value={budget} />
      <input type="hidden" name="invest_timing" value={timing} />
      {offer && <input type="hidden" name="offer_id" value={offer.id} />}
      <input ref={tRef} type="hidden" name="_t" defaultValue="" />
      <input ref={pathRef} type="hidden" name="landing_path" defaultValue="" />
      {ATTR_KEYS.map((k) => (
        <input key={k} ref={(el) => { attrRefs.current[k] = el }} type="hidden" name={k} defaultValue="" />
      ))}
      {/* Honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Schritt {idx + 1} von {steps.length} · <span className="font-semibold text-slate-700">{STEP_LABELS[current]}</span>
          </span>
          {idx > 0 && (
            <button type="button" onClick={back} className="font-medium text-slate-500 hover:text-slate-900">
              ← Zurück
            </button>
          )}
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${((idx + 1) / steps.length) * 100}%` }} />
        </div>
      </div>

      {current === 'kategorie' && (
        <fieldset>
          <legend className="mb-2 text-base font-semibold text-slate-900">Wofür möchten Sie Unterlagen erhalten?</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {cats.map((c) => {
              const on = selected.includes(c.slug)
              return (
                <button
                  key={c.slug}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSelected((s) => (s.includes(c.slug) ? s.filter((x) => x !== c.slug) : [...s, c.slug]))}
                  className={chip(on)}
                >
                  {c.name}
                  {c.comingSoon && <span className="ml-1.5 text-[11px] font-normal text-slate-400">(vormerken)</span>}
                </button>
              )
            })}
          </div>
          {err('categories')}
        </fieldset>
      )}

      {current === 'iab' && (
        <div>
          <label className="block">
            <span className="mb-2 block text-base font-semibold text-slate-900">Wie hoch ist Ihr Investitionsabzugsbetrag?</span>
            <div className="relative">
              <input
                inputMode="numeric"
                value={noIab ? '' : iabText}
                disabled={noIab}
                onChange={(e) => setIabText(e.target.value ? euroIn(e.target.value).toLocaleString('de-DE') : '')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    next()
                  }
                }}
                placeholder="z. B. 50.000"
                className={`${input} pr-8 text-base`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">€</span>
            </div>
          </label>
          {noIab ? (
            <button type="button" onClick={() => setNoIab(false)} className="mt-2 text-sm font-medium text-slate-500 underline underline-offset-2 hover:text-slate-800">
              Doch einen IAB-Betrag angeben
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setNoIab(true)
                setYearChoice(null)
                next({ noIab: true })
              }}
              className="mt-2 text-sm font-medium text-slate-500 underline underline-offset-2 hover:text-slate-800"
            >
              Noch kein IAB gebildet, ich plane erst
            </button>
          )}
          {err('iab_amount_eur')}
        </div>
      )}

      {current === 'frist' && (
        <fieldset>
          <legend className="mb-2 text-base font-semibold text-slate-900">Für welches Wirtschaftsjahr haben Sie den IAB gebildet?</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {iabYears().map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => {
                  setYearChoice(y)
                  goTo('budget')
                }}
                className={chip(yearChoice === y)}
              >
                {y} <span className="block text-xs font-normal text-slate-500">investieren bis {formatDeadline(y)}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setYearChoice('offen')
              goTo('budget')
            }}
            className="mt-2 text-sm font-medium text-slate-500 underline underline-offset-2 hover:text-slate-800"
          >
            Weiß ich nicht genau
          </button>
        </fieldset>
      )}

      {current === 'budget' && (
        <fieldset>
          <legend className="mb-2 text-base font-semibold text-slate-900">Welches Budget planen Sie (netto, inkl. Eigenkapital)?</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {BUDGETS.map((b) => (
              <button
                key={b.value}
                type="button"
                onClick={() => {
                  setBudget(b.value)
                  goTo('zeitpunkt')
                }}
                className={chip(budget === b.value)}
              >
                {b.label}
              </button>
            ))}
          </div>
          {iabEur > 0 && (
            <p className="mt-2 text-xs text-slate-500">
              Für einen IAB von {iabEur.toLocaleString('de-DE')} € sind mindestens {(iabEur * 2).toLocaleString('de-DE')} € netto Investition nötig.
            </p>
          )}
          {err('budget')}
        </fieldset>
      )}

      {current === 'zeitpunkt' && (
        <fieldset>
          <legend className="mb-2 text-base font-semibold text-slate-900">Wann möchten Sie investieren?</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {investTimings().map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => {
                  setTiming(t.value)
                  goTo('kontakt')
                }}
                className={chip(timing === t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
          {err('invest_timing')}
        </fieldset>
      )}

      {current === 'kontakt' && (
        <>
          <p className="text-base font-semibold text-slate-900">Wohin dürfen wir Unterlagen und Kalkulation senden?</p>
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
              {fe.phone ? err('phone') : <p className="mt-1 text-[11px] text-slate-400">Für Rückfragen zu Ihrer Anfrage.</p>}
            </div>
            <select name="legal_form" defaultValue="" className={`${input} sm:col-span-2`} aria-label="Rechtsform (optional)">
              <option value="">Rechtsform (optional)</option>
              {LEGAL_FORMS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2.5 rounded-xl bg-slate-50 p-3">
            <label className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-600">
              <input type="checkbox" name="consent_share" className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600" />
              <span>{shareText} *</span>
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
        </>
      )}

      {stepError && <p className="text-sm text-red-600">{stepError}</p>}
      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

      {(current === 'kategorie' || current === 'iab' || current === 'kontakt') && (
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-emerald-600 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500 disabled:opacity-60"
        >
          {current !== 'kontakt' ? 'Weiter →' : pending ? 'Wird gesendet…' : submitLabel ?? 'Unterlagen & Kalkulation anfordern'}
        </button>
      )}
      <p className="text-center text-xs text-slate-400">{FEE_NOTE} Kein Passwort nötig.</p>
    </form>
  )
}
