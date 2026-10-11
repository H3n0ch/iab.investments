'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type ChangeEvent, useEffect, useRef, useState, useTransition } from 'react'
import { getInquirySummary, submitInquiry } from '@/lib/actions/leads'
import { CATEGORIES, formatEuro } from '@/lib/categories'
import { CALL_LABEL, CONSENT_CALL_TEXT, SHARE_LABEL } from '@/lib/consent'
import { BUDGETS, CALLBACK_TIMES, formatDeadline, iabYears, investTimings, LEGAL_FORMS } from '@/lib/iab'
import { track } from '@/lib/track'

// Inquiry „Unterlagen & Kalkulation anfordern“ on 2 pages (like TinyInvest):
// 1 „Ihre Situation“ (Investitionsgut, IAB & Frist, Budget, Zeitpunkt) → 2 Kontakt & Einwilligungen.
// Nothing is saved before the visitor clicks „Kostenlos anfordern“ – then submitInquiry stores everything at once.

type Source = 'check' | 'tile' | 'landing' | 'offer' | 'frist' | 'angebot' | 'ratgeber' | 'rechner'

export type LeadFormProps = {
  preselected: string[]
  /** Restrict selectable categories; defaults to all */
  options?: string[]
  source: Source
  /** Exact IAB amount in euros, known from a calculator – pre-fills the amount */
  iabAmount?: number
  /** Formation year, known from the deadline check */
  year?: number
  /** Offer mode: category fixed, consent names exactly this offer */
  offer?: { id: string; title: string; categorySlug: string; categoryName: string }
  submitLabel?: string
  /** Referral code of a tax advisor partner – stored as utm_source 'partner:<code>' */
  partner?: string
  /** Prefill for signed-in users */
  defaults?: { name?: string | null; email?: string | null; phone?: string | null; company?: string | null }
}

type Summary = { count: number; minEntry: number | null; fast: number }

const ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'gclid'] as const
const ATTR_STORE = 'iab_attr'

const input =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
/** Filled in correctly: green border, room for the check mark */
const inputOk = (ok: boolean) => (ok ? `${input} border-emerald-500 pr-9` : input)
const label = 'mb-1 block text-xs font-medium text-slate-600'
const choice = (on: boolean) =>
  `flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
    on ? 'border-emerald-600 bg-emerald-50 font-semibold text-emerald-900 ring-1 ring-emerald-600' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
  }`
const pill = (on: boolean) =>
  `rounded-lg border px-2 py-1.5 text-center text-sm transition-colors ${
    on ? 'border-emerald-600 bg-emerald-50 font-semibold text-emerald-900 ring-1 ring-emerald-600' : 'border-slate-200 text-slate-700 hover:border-slate-400'
  }`
const euroIn = (v: string) => Number(v.replace(/[^\d]/g, '')) || 0

const VALID: Record<string, (v: string) => boolean> = {
  name: (v) => v.trim().length >= 2,
  phone: (v) => v.replace(/[^0-9]/g, '').length >= 6 && /^[0+]/.test(v.trim()),
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
}

function Check({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 shrink-0 text-emerald-600 ${className}`} aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  )
}

/** Check mark inside a correctly filled text field */
const FieldCheck = ({ show }: { show: boolean }) => (show ? <Check className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" /> : null)

/** Budget bucket that backs the full IAB (IAB ≤ 50 % of the cost → 2 × IAB) */
function recommendedBudget(iab: number): string | null {
  if (iab <= 0) return null
  const need = iab * 2
  return need <= 50000 ? 'lt50' : need <= 100000 ? '50-100' : need <= 200000 ? '100-200' : 'gt200'
}

/** With a known deadline the timing question is answered already */
function timingFor(year: number): string {
  return year + 3 <= new Date().getFullYear() ? 'dieses-jahr' : 'naechstes-jahr'
}

export function LeadForm({ preselected, options, source, iabAmount, year, offer, submitLabel, partner, defaults }: LeadFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const [page, setPage] = useState<1 | 2>(1)
  const [done, setDone] = useState<null | { shared: boolean }>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [summary, setSummary] = useState<Summary | null>(null)

  // Answers of page 1 – kept in state, so „Zurück“ loses nothing
  const [selected, setSelected] = useState<string[]>(offer ? [offer.categorySlug] : preselected)
  const [iabText, setIabText] = useState(iabAmount ? iabAmount.toLocaleString('de-DE') : '')
  const [noIab, setNoIab] = useState(iabAmount === 0)
  const [yearChoice, setYearChoice] = useState<number | null>(year ?? null)
  const [budget, setBudget] = useState('')
  const [timing, setTiming] = useState('')
  const [callback, setCallback] = useState('')
  const [phoneHint, setPhoneHint] = useState('')
  // Contact fields filled in correctly (green + check mark while typing)
  const [ok, setOk] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(Object.entries(VALID).map(([k, f]) => [k, f(String(defaults?.[k as keyof typeof defaults] ?? ''))])),
  )
  const checkField = (e: ChangeEvent<HTMLInputElement>) => {
    const v = VALID[e.target.name]?.(e.target.value) ?? false
    if (v !== ok[e.target.name]) setOk({ ...ok, [e.target.name]: v })
  }

  const iabEur = noIab ? 0 : euroIn(iabText)
  const deadlineKnown = !noIab && yearChoice != null
  const askCategory = !offer && preselected.length === 0

  // Summary with own data for page 2
  useEffect(() => {
    if (page !== 2) return
    let alive = true
    getInquirySummary(selected).then((s) => alive && setSummary(s)).catch(() => {})
    return () => {
      alive = false
    }
  }, [page, selected])

  // Attribution (campaign, Google Ads, partner) – kept for the session
  const attrRef = useRef<Record<string, string>>({})
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    let stored: Record<string, string> = {}
    try {
      stored = JSON.parse(sessionStorage.getItem(ATTR_STORE) ?? '{}')
    } catch {}
    const fromUrl = Object.fromEntries(ATTR_KEYS.map((k) => [k, params.get(k) ?? '']).filter(([, v]) => v))
    try {
      if (Object.keys(fromUrl).length) sessionStorage.setItem(ATTR_STORE, JSON.stringify(fromUrl))
    } catch {}
    attrRef.current = { ...(Object.keys(fromUrl).length ? fromUrl : stored), ...(partner ? { utm_source: `partner:${partner}` } : {}) }
  }, [partner])
  const renderedAt = useRef(0)
  useEffect(() => {
    renderedAt.current = Date.now()
  }, [])

  const clearErrors = () => {
    if (Object.keys(errors).length || error) {
      setErrors({})
      setError('')
    }
  }

  // ── Page 1 → 2: only checks, nothing is sent ─────────────
  const next = () => {
    const e: Record<string, string> = {}
    if (selected.length === 0) e.categories = 'Bitte wählen Sie mindestens ein Investitionsgut.'
    if (!noIab && iabEur > 0 && !yearChoice) e.iab = 'Bitte wählen Sie das Jahr, für das der IAB gebildet wurde.'
    if (!noIab && iabEur === 0 && yearChoice) e.iab = 'Bitte geben Sie den IAB-Betrag ein – oder „Noch kein IAB gebildet“.'
    if (!budget) e.budget = 'Bitte wählen Sie Ihr Budget.'
    setErrors(e)
    setError('')
    if (Object.keys(e).length) return
    setPage(2)
    track('Wizard Schritt', { schritt: 2, name: 'kontakt', source })
  }

  // ── Page 2: the one and only save ────────────────────────
  const submit = (form: HTMLFormElement) => {
    const fd = new FormData(form)
    fd.set('source', source)
    fd.set('_t', String(renderedAt.current))
    fd.set('landing_path', window.location.pathname)
    for (const [k, v] of Object.entries(attrRef.current)) fd.set(k, v)
    for (const slug of selected) fd.append('categories', slug)
    if (offer) fd.set('offer_id', offer.id)
    fd.set('iab_amount_eur', noIab ? '0' : String(iabEur))
    if (deadlineKnown && iabEur > 0) fd.set('iab_year', String(yearChoice))
    fd.set('budget', budget)
    const t = deadlineKnown && iabEur > 0 ? timingFor(yearChoice!) : timing
    if (t) fd.set('invest_timing', t)
    if (callback) fd.set('callback_time', callback)
    startTransition(async () => {
      const r = await submitInquiry(fd)
      if (!r.ok) {
        setErrors(r.fieldErrors ?? {})
        setError(r.error ?? '')
        if (r.fieldErrors && (r.fieldErrors.categories || r.fieldErrors.budget)) setPage(1)
        return
      }
      track('Lead', { source, kategorie: selected.join(','), weitergabe: r.shared ? 'ja' : 'nein' })
      setDone({ shared: Boolean(r.shared) })
      // With consent the inquiry unlocks all offer details (cookie) – refresh so listings show them
      router.refresh()
    })
  }

  // ── Done ─────────────────────────────────────────────────
  if (done) {
    const steps: [string, string, string][] = done.shared
      ? [
          ['✉', 'E-Mail bestätigen', 'Wir haben Ihnen einen Link geschickt. Erst danach geben wir etwas weiter.'],
          ['📞', 'Kurzer Rückruf', 'Meist am nächsten Werktag, zu Budget und Frist.'],
          ['📄', 'Unterlagen & Kalkulation', 'Passende Projekte mit allen Zahlen. Die Projektdetails sind schon jetzt freigeschaltet.'],
        ]
      : [
          ['📞', 'Kurzer Rückruf', 'Meist am nächsten Werktag. Wir besprechen Budget, Frist und passende Projekte.'],
          ['🔒', 'Keine Weitergabe', 'Ihre Angaben bleiben bei uns. Unterlagen von Anbietern gibt es erst, wenn Sie zustimmen.'],
        ]
    return (
      <div className="animate-fade-up">
        <p className="text-base font-semibold text-slate-900">Danke, Ihre Anfrage ist da.</p>
        <ol className="mt-3 space-y-2.5">
          {steps.map(([icon, t, d]) => (
            <li key={t} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">{icon}</span>
              <span>
                <span className="block text-sm font-semibold text-slate-900">{t}</span>
                <span className="block text-sm text-slate-500">{d}</span>
              </span>
            </li>
          ))}
        </ol>
        <Link href="/angebote" className="mt-5 inline-block text-sm font-semibold text-emerald-700 underline underline-offset-2">
          Aktuelle Projekte ansehen
        </Link>
      </div>
    )
  }

  const pool = options ? CATEGORIES.filter((c) => options.includes(c.slug)) : CATEGORIES
  const live = pool.filter((c) => !c.comingSoon)
  const later = pool.filter((c) => c.comingSoon)
  const err = (k: string) => errors[k] && <p className="mt-1 text-xs text-red-600">{errors[k]}</p>
  const recommended = recommendedBudget(iabEur)

  const toggle = (slug: string) => {
    clearErrors()
    setSelected((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug]))
  }
  const catButton = (c: (typeof CATEGORIES)[number]) => {
    const on = selected.includes(c.slug)
    return (
      <button key={c.slug} type="button" aria-pressed={on} onClick={() => toggle(c.slug)} className={`${choice(on)} justify-center text-center`}>
        {on && <Check />}
        {c.name}
      </button>
    )
  }

  return (
    <div>
      {/* Progress: 1/2 · 2/2 with a thin line */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            {page}/2 · {page === 1 ? 'Ihre Situation' : 'Ihre Kontaktdaten'}
          </span>
          {page === 2 && (
            <button type="button" onClick={() => (clearErrors(), setPage(1))} className="font-medium text-slate-500 hover:text-slate-900">
              ← Zurück
            </button>
          )}
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: page === 1 ? '50%' : '100%' }} />
        </div>
      </div>

      {/* ── Page 1 · Ihre Situation ── */}
      {page === 1 && (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            next()
          }}
          className="space-y-3.5"
        >
          {askCategory && (
            <div>
              <span className={label}>Wofür möchten Sie Unterlagen? (Mehrfachauswahl)</span>
              <div className="grid grid-cols-3 gap-1.5">{live.map(catButton)}</div>
              {later.length > 0 && (
                <details className="mt-1.5 text-xs" open={later.some((c) => selected.includes(c.slug))}>
                  <summary className="cursor-pointer text-slate-500">Weitere (bald verfügbar, vormerken)</summary>
                  <div className="mt-1.5 grid grid-cols-2 gap-1.5 sm:grid-cols-3">{later.map(catButton)}</div>
                </details>
              )}
              {err('categories')}
            </div>
          )}

          <div>
            <div className="flex items-baseline justify-between gap-2">
              <span className={label}>Ihr IAB und das Jahr der Bildung</span>
              <label className="flex shrink-0 items-center gap-1.5 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={noIab}
                  onChange={(e) => {
                    clearErrors()
                    setNoIab(e.target.checked)
                  }}
                  className="h-3.5 w-3.5 accent-emerald-600"
                />
                Noch kein IAB gebildet
              </label>
            </div>
            {!noIab ? (
              <>
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-1.5">
                  <div className="relative">
                    <input
                      inputMode="numeric"
                      value={iabText}
                      aria-label="IAB-Betrag"
                      onChange={(e) => {
                        clearErrors()
                        setIabText(e.target.value ? euroIn(e.target.value).toLocaleString('de-DE') : '')
                      }}
                      placeholder="z. B. 50.000"
                      className={`${inputOk(iabEur > 0)} pr-12`}
                    />
                    <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 text-sm text-slate-400">
                      €{iabEur > 0 && <Check />}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {iabYears().map((y) => (
                      <button
                        key={y}
                        type="button"
                        aria-pressed={yearChoice === y}
                        onClick={() => {
                          clearErrors()
                          setYearChoice(yearChoice === y ? null : y)
                        }}
                        className={pill(yearChoice === y)}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="mt-1 min-h-4 text-xs text-slate-600">
                  {iabEur > 0 && yearChoice ? `Frist ${formatDeadline(yearChoice)} · mindestens ${formatEuro(iabEur * 2)} netto investieren` : ' '}
                </p>
              </>
            ) : (
              <p className="text-xs text-slate-500">Kein Problem – wir zeigen Ihnen, wie Sie den IAB für Ihre Investition nutzen.</p>
            )}
            {err('iab')}
          </div>

          <div>
            <span className={label}>Geplantes Budget (netto, inkl. Eigenkapital)</span>
            <div className="grid grid-cols-2 gap-1.5">
              {BUDGETS.map((b) => (
                <button
                  key={b.value}
                  type="button"
                  aria-pressed={budget === b.value}
                  onClick={() => {
                    clearErrors()
                    setBudget(b.value)
                  }}
                  className={choice(budget === b.value)}
                >
                  <span>{b.label}</span>
                  <span className="flex items-center gap-1.5">
                    {recommended === b.value && <span className="shrink-0 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">passt</span>}
                    {budget === b.value && <Check />}
                  </span>
                </button>
              ))}
            </div>
            {err('budget')}
          </div>

          {!(deadlineKnown && iabEur > 0) && (
            <div>
              <span className={label}>Wann möchten Sie investieren?</span>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {investTimings().map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    aria-pressed={timing === t.value}
                    onClick={() => setTiming(timing === t.value ? '' : t.value)}
                    className={`${pill(timing === t.value)} text-xs`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-600 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500"
          >
            Weiter →
          </button>
        </form>
      )}

      {/* ── Page 2 · Kontakt & Einwilligungen – saved only on submit ── */}
      {page === 2 && (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            submit(e.currentTarget)
          }}
        >
          <p className="text-base font-semibold text-slate-900">Wohin dürfen wir die Unterlagen senden?</p>
          <p className="mt-0.5 min-h-5 text-sm text-slate-600">
            {summary && summary.count > 0 ? (
              <>
                <strong className="text-slate-900">
                  {summary.count} passende {summary.count === 1 ? 'Projekt' : 'Projekte'}
                </strong>
                {summary.minEntry ? `, Einstieg ab ${formatEuro(summary.minEntry)}` : ''}
                {summary.fast ? `, ${summary.fast} kurzfristig lieferbar` : ''}
              </>
            ) : (
              ' '
            )}
          </p>

          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <label className="block">
              <span className={label}>Vor- und Nachname</span>
              <span className="relative block">
                <input name="name" defaultValue={defaults?.name ?? undefined} autoComplete="name" onChange={checkField} className={inputOk(ok.name)} />
                <FieldCheck show={ok.name} />
              </span>
              {err('name')}
            </label>
            <label className="block">
              <span className={label}>Telefon</span>
              <span className="relative block">
              <input
                name="phone"
                type="tel"
                inputMode="tel"
                defaultValue={defaults?.phone ?? undefined}
                autoComplete="tel"
                placeholder="0171 1234567"
                onBlur={(e) => {
                  const digits = e.target.value.replace(/[^0-9]/g, '')
                  setPhoneHint(e.target.value && (digits.length < 6 || !/^[0+]/.test(e.target.value.trim())) ? 'Bitte Nummer prüfen.' : '')
                }}
                onChange={checkField}
                className={inputOk(ok.phone)}
              />
              <FieldCheck show={ok.phone} />
              </span>
              {errors.phone ? err('phone') : phoneHint && <p className="mt-1 text-xs text-amber-700">{phoneHint}</p>}
            </label>
            <label className="col-span-2 block">
              <span className={label}>E-Mail</span>
              <span className="relative block">
                <input name="email" type="email" inputMode="email" defaultValue={defaults?.email ?? undefined} autoComplete="email" onChange={checkField} className={inputOk(ok.email)} />
                <FieldCheck show={ok.email} />
              </span>
              {err('email')}
            </label>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="mr-0.5 text-xs text-slate-600">Rückruf am besten:</span>
            {CALLBACK_TIMES.map((c) => (
              <button
                key={c.value}
                type="button"
                aria-pressed={callback === c.value}
                onClick={() => setCallback(callback === c.value ? '' : c.value)}
                className={`rounded-full border px-2.5 py-0.5 text-xs ${callback === c.value ? 'border-emerald-600 bg-emerald-50 font-semibold text-emerald-900' : 'border-slate-300 text-slate-600 hover:border-slate-400'}`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <details className="mt-1.5 text-xs">
            <summary className="cursor-pointer text-slate-500">Firma angeben (optional)</summary>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <input name="company" defaultValue={defaults?.company ?? undefined} placeholder="Firma" autoComplete="organization" className={input} />
              <select name="legal_form" defaultValue="" className={input} aria-label="Rechtsform">
                <option value="">Rechtsform</option>
                {LEGAL_FORMS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </details>

          {/* Consents – none pre-ticked; passing on is recommended, not required */}
          <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-700">
            <label className="flex items-start gap-2">
              <input type="checkbox" name="consent_share" className="mt-px h-4 w-4 shrink-0 accent-emerald-600" />
              <span>
                {SHARE_LABEL} <span className="text-emerald-700">(empfohlen)</span>
              </span>
            </label>
            <label className="flex items-start gap-2">
              <input type="checkbox" name="consent_call" onChange={clearErrors} className="mt-px h-4 w-4 shrink-0 accent-emerald-600" />
              <span>
                {CALL_LABEL} *{' '}
                <details className="inline">
                  <summary className="inline cursor-pointer text-slate-500 underline">Details</summary>
                  <span className="mt-1 block text-slate-500">{CONSENT_CALL_TEXT}</span>
                </details>
              </span>
            </label>
            {err('consent_call')}
            <label className="flex items-start gap-2">
              <input type="checkbox" name="consent_privacy" onChange={clearErrors} className="mt-px h-4 w-4 shrink-0 accent-emerald-600" />
              <span>
                Ich akzeptiere die{' '}
                <Link href="/datenschutz" target="_blank" className="underline">
                  Datenschutzerklärung
                </Link>
                . *
              </span>
            </label>
            {err('consent_privacy')}
          </div>

          {error && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="mt-3 w-full rounded-lg bg-emerald-600 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500 disabled:opacity-50"
          >
            {pending ? 'Einen Moment…' : submitLabel && !/unterlagen & kalkulation anfordern/i.test(submitLabel) ? submitLabel : 'Kostenlos anfordern'}
          </button>
          <p className="mt-1.5 text-center text-[11px] text-slate-500">🔒 Kostenlos · kein Passwort · Weitergabe nur mit Ihrer Zustimmung</p>
        </form>
      )}
    </div>
  )
}
