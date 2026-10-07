'use client'

import Link from 'next/link'
import { startTransition, useActionState, useEffect, useRef, useState } from 'react'
import { submitCalcReport, type CalcReportState } from '@/lib/actions/leads'
import { CATEGORIES, formatEuro, getCategory } from '@/lib/categories'
import { CONSENT_PRIVACY_TEXT } from '@/lib/consent'
import { daysUntilDeadline, formatDeadline, iabYears, investTimings, LEGAL_FORMS } from '@/lib/iab'
import type { MarketOffer } from '@/lib/supabase/types'
import { calcHint, computeCalc, eur, eur2, pct, type CalcParams } from '@/lib/rechner'
import { savingsCurve, TAX_YEARS, type TaxYear } from '@/lib/tax'
import { SavingsChart } from './rechner/SavingsChart'

const input =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
const label = 'mb-1.5 block text-sm font-medium text-slate-700'
const seg = (on: boolean) =>
  `flex-1 rounded-lg px-2 py-2 text-sm font-medium transition-colors ${on ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-white'}`
const card = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6'

function euroIn(v: string): number {
  const n = Number(v.replace(/[^\d]/g, ''))
  return Number.isFinite(n) ? n : 0
}
const show = (n: number) => (n ? n.toLocaleString('de-DE') : '')

const [privacyBefore, privacyAfter] = CONSENT_PRIVACY_TEXT.split('Datenschutzerklärung')

export function IabRechner({ initialCategory, offers = [] }: { initialCategory?: string; offers?: MarketOffer[] }) {
  const [zvE, setZvE] = useState(120000)
  const [joint, setJoint] = useState(false)
  const [year, setYear] = useState<TaxYear>(2026)
  const [church, setChurch] = useState<0 | 8 | 9>(0)
  const [investment, setInvestment] = useState(200000)
  const [businesses, setBusinesses] = useState(1)
  const [profit, setProfit] = useState(120000)
  const [profitTouched, setProfitTouched] = useState(false)
  const [iab, setIab] = useState<number | null>(null) // null = follow the maximum
  const [category, setCategory] = useState(initialCategory ?? 'photovoltaik-iab')
  const [usageOk, setUsageOk] = useState(true)

  const params: CalcParams = { zvE, joint, year, church, investment, businesses, profit: profitTouched ? profit : zvE, iab, category }
  const r = computeCalc(params)
  const step = Math.max(1000, Math.ceil(r.max / 150 / 1000) * 1000)
  // The React Compiler memoizes this; no manual useMemo needed
  const curve = savingsCurve(zvE, r.max, { year, joint, church }, step)
  const hint = calcHint(r)

  // The IAB is formed for the selected tax year; the deadline only exists for the four running vintages
  const deadlineYear = iabYears().includes(year) ? year : null
  const days = deadlineYear ? daysUntilDeadline(deadlineYear) : null

  const maxBar = Math.max(r.without.total, 1)
  const variants = [
    { t: '1 Jahr', s: r.saving, per: [r.iab] },
    { t: '2 Jahre', s: r.split2.saving, per: r.split2.perYear },
    { t: '3 Jahre', s: r.split3.saving, per: r.split3.perYear },
  ]
  // Best = highest saving; on (near) ties the variant with fewer years wins
  const bestIdx = variants.reduce((b, v, i) => (v.s > variants[b].s + 1 ? i : b), 0)
  const quota = (t: number) => (zvE ? t / zvE : 0)

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,400px)_1fr]">
      {/* ── Inputs ─────────────────────────── */}
      <div className="space-y-5 self-start rounded-2xl bg-white p-5 shadow-2xl shadow-slate-950/30 sm:p-6 lg:sticky lg:top-20">
        <label className="block">
          <span className={label}>Zu versteuerndes Einkommen ohne IAB (€)</span>
          <input inputMode="numeric" value={show(zvE)} onChange={(e) => setZvE(euroIn(e.target.value))} className={input} />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className={label}>Veranlagung</span>
            <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
              <button type="button" onClick={() => setJoint(false)} className={seg(!joint)}>Einzel</button>
              <button type="button" onClick={() => setJoint(true)} className={seg(joint)}>Splitting</button>
            </div>
          </div>
          <label className="block">
            <span className={label}>Steuerjahr</span>
            <select value={year} onChange={(e) => setYear(Number(e.target.value) as TaxYear)} className={input}>
              {TAX_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </label>
        </div>

        <div>
          <span className={label}>Kirchensteuer</span>
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            {([0, 8, 9] as const).map((k) => (
              <button key={k} type="button" onClick={() => setChurch(k)} className={seg(church === k)}>
                {k ? `${k} %` : 'keine'}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className={label}>Investitionsgut</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={input}>
            {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </label>

        <div className="grid grid-cols-[1fr_auto] gap-3">
          <label className="block">
            <span className={label}>Geplante Investition (€ netto)</span>
            <input inputMode="numeric" value={show(investment)} onChange={(e) => setInvestment(euroIn(e.target.value))} className={input} />
          </label>
          <label className="block">
            <span className={label}>Betriebe</span>
            <select value={businesses} onChange={(e) => setBusinesses(Number(e.target.value))} className={input}>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
        </div>

        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-sm font-medium text-slate-700">Investitionsabzugsbetrag</span>
            <span className="text-sm font-bold tabular-nums text-slate-900">{eur(r.iab)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={Math.max(r.max, 1000)}
            step={1000}
            value={r.iab}
            disabled={!r.profitOk || r.max === 0}
            onChange={(e) => setIab(Number(e.target.value))}
            className="w-full accent-emerald-600"
            aria-label="Investitionsabzugsbetrag"
          />
          <div className="mt-1 flex justify-between text-xs text-slate-400">
            <span>0 €</span>
            <button type="button" onClick={() => setIab(null)} className="hover:text-slate-700">
              max. {eur(r.max)} (50 % der Investition)
            </button>
          </div>
        </div>

        <details className="rounded-xl bg-slate-50 p-3 text-sm">
          <summary className="cursor-pointer font-medium text-slate-700">Gewinngrenze und Nutzung prüfen</summary>
          <label className="mt-3 block">
            <span className={label}>Gewinn {businesses > 1 ? 'des größten Betriebs' : 'des Betriebs'} im Bildungsjahr (€)</span>
            <input
              inputMode="numeric"
              value={show(profitTouched ? profit : zvE)}
              onChange={(e) => {
                setProfitTouched(true)
                setProfit(euroIn(e.target.value))
              }}
              className={input}
            />
          </label>
          <label className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-slate-600">
            <input type="checkbox" checked={usageOk} onChange={(e) => setUsageOk(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600" />
            Das Wirtschaftsgut ist beweglich, abnutzbar und wird im Investitions- und Folgejahr zu mindestens 90 % betrieblich genutzt oder vermietet.
          </label>
        </details>
      </div>

      {/* ── Result ─────────────────────────── */}
      <div className="min-w-0 space-y-5">
        {!r.profitOk && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            Der Gewinn liegt über <strong>200.000 €</strong>. Für dieses Wirtschaftsjahr ist kein IAB möglich (§ 7g Abs. 1 EStG).
          </p>
        )}
        {!usageOk && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Ohne mindestens 90 % betriebliche Nutzung im Investitions- und Folgejahr wird der IAB rückwirkend aufgelöst, zuzüglich Zinsen.
          </p>
        )}

        {/* Hero figure */}
        <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 sm:p-6">
          <p className="text-sm text-slate-300">Steuerersparnis im Jahr {year}</p>
          <p className="mt-1 text-5xl font-extrabold tracking-tight text-emerald-400 tabular-nums">{eur(r.saving)}</p>
          <p className="mt-2 text-sm text-slate-300">
            {pct(r.effRate)} des IAB · Investition {eur(investment)} netto
            {deadlineYear && <> bis <strong className={days != null && days < 120 ? 'text-amber-300' : 'text-white'}>{formatDeadline(deadlineYear)}</strong></>}
          </p>
        </div>

        <MatchingOffers offers={offers} category={category} investment={investment} iab={r.iab} />

        {/* Without vs with IAB */}
        <div className={card}>
          <p className="text-sm font-semibold text-slate-900">Ihre Steuer ohne und mit IAB</p>
          <div className="mt-4 space-y-3">
            {[
              { k: 'Ohne IAB', t: r.without.total, color: 'bg-slate-300' },
              { k: 'Mit IAB', t: r.with.total, color: 'bg-emerald-600' },
            ].map((b) => (
              <div key={b.k} className="grid grid-cols-[72px_1fr_auto] items-center gap-3 text-sm">
                <span className="text-slate-600">{b.k}</span>
                <span className="h-6 rounded-r bg-slate-50">
                  <span className={`block h-6 rounded-r ${b.color} transition-all`} style={{ width: `${Math.max(0.5, (b.t / maxBar) * 100)}%` }} />
                </span>
                <span className="w-28 text-right font-semibold tabular-nums text-slate-900">{eur2(b.t)}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Steuerquote: {pct(quota(r.without.total))} ohne IAB, {pct(quota(r.with.total))} mit IAB (bezogen auf {eur(zvE)}).
          </p>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[360px] text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400">
                  <th className="py-1.5 font-medium"></th>
                  <th className="py-1.5 text-right font-medium">Ohne IAB</th>
                  <th className="py-1.5 text-right font-medium">Mit IAB</th>
                  <th className="py-1.5 text-right font-medium">Ersparnis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 tabular-nums">
                {([['Einkommensteuer', 'est'], ['Solidaritätszuschlag', 'soli'], ['Kirchensteuer', 'kist']] as const).map(([k, f]) => (
                  <tr key={f}>
                    <td className="py-2 text-slate-600">{k}</td>
                    <td className="py-2 text-right">{eur2(r.without[f])}</td>
                    <td className="py-2 text-right">{eur2(r.with[f])}</td>
                    <td className="py-2 text-right text-slate-700">{eur2(r.without[f] - r.with[f])}</td>
                  </tr>
                ))}
                <tr className="font-semibold text-slate-900">
                  <td className="py-2">Gesamt</td>
                  <td className="py-2 text-right">{eur2(r.without.total)}</td>
                  <td className="py-2 text-right">{eur2(r.with.total)}</td>
                  <td className="py-2 text-right text-emerald-700">{eur2(r.saving)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Marginal curve + hint */}
        {r.max > 0 && r.profitOk && (
          <div className={card}>
            <p className="text-sm font-semibold text-slate-900">Wie viel jeder weitere Euro IAB spart</p>
            <p className="mt-0.5 text-xs text-slate-500">Oben die kumulierte Ersparnis, unten der Grenzsteuersatz. Fahren Sie über die Kurve.</p>
            <div className="mt-4">
              <SavingsChart points={curve} current={r.iab} optimum={r.optimum < r.iab ? r.optimum : null} />
            </div>
            <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-900">{hint}</p>
            {r.belowAllowance && (
              <p className="mt-2 text-xs text-amber-800">
                Hinweis: Mit diesem IAB sinkt Ihr Einkommen unter den Grundfreibetrag. Dieser Teil des IAB spart keine Steuer.
              </p>
            )}
            <details className="mt-3 text-xs text-slate-500">
              <summary className="cursor-pointer">Werte als Tabelle</summary>
              <table className="mt-2 w-full tabular-nums">
                <thead>
                  <tr className="text-left text-slate-400">
                    <th className="py-1 font-medium">IAB</th>
                    <th className="py-1 text-right font-medium">Ersparnis</th>
                    <th className="py-1 text-right font-medium">Grenzsatz</th>
                  </tr>
                </thead>
                <tbody>
                  {curve.filter((_, i) => i % Math.max(1, Math.ceil(curve.length / 10)) === 0 || i === curve.length - 1).map((p) => (
                    <tr key={p.iab}>
                      <td className="py-0.5">{eur(p.iab)}</td>
                      <td className="py-0.5 text-right">{eur(p.saving)}</td>
                      <td className="py-0.5 text-right">{pct(p.rate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </div>
        )}

        {/* Multi-year optimizer */}
        {r.iab > 0 && (
          <div className={card}>
            <p className="text-sm font-semibold text-slate-900">Auf mehrere Jahre verteilen</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Derselbe IAB von {eur(r.iab)}, aufgeteilt auf mehrere Bildungsjahre. Annahme: gleiches Einkommen in jedem Jahr.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {variants.map((v, i) => {
                const isBest = i === bestIdx
                return (
                  <div key={v.t} className={`rounded-xl border p-4 ${isBest ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}>
                    <p className="text-xs font-medium text-slate-500">{v.t}{isBest && ' · beste Variante'}</p>
                    <p className="mt-1 text-xl font-extrabold tabular-nums text-slate-900">{eur(v.s)}</p>
                    {i > 0 && v.s > r.saving && <p className="text-xs font-semibold text-emerald-700">+{eur(v.s - r.saving)}</p>}
                    <p className="mt-1 text-[11px] text-slate-500">{v.per.filter(Boolean).map(eur).join(' + ')}</p>
                  </div>
                )
              })}
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
              Alle IAB eines Betriebs aus dem laufenden und den drei Vorjahren dürfen zusammen 200.000 € nicht übersteigen. Jeder IAB hat seine eigene
              Frist: Investiert werden muss bis zum Ende des dritten Folgejahres.
            </p>
          </div>
        )}

        {/* Calculation path */}
        <details className={`${card} group`}>
          <summary className="cursor-pointer text-sm font-semibold text-slate-900">Rechenweg im Detail</summary>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-600">
            <li>Höchstmöglicher IAB: min(50 % × {eur(investment)}; {businesses} × 200.000 €) = <strong>{eur(r.max)}</strong></li>
            <li>Gewinngrenze: {eur(params.profit)} {r.profitOk ? '≤' : '>'} 200.000 € → {r.profitOk ? 'IAB möglich' : 'kein IAB möglich'}</li>
            <li>Einkommensteuer {year} nach § 32a EStG{joint ? ' im Splittingverfahren (2 × Steuer auf die Hälfte)' : ''}: ohne IAB auf {eur(zvE)} = {eur2(r.without.est)}, mit IAB auf {eur(Math.max(0, zvE - r.iab))} = {eur2(r.with.est)}</li>
            <li>Solidaritätszuschlag 5,5 % mit Freigrenze und Milderungszone: {eur2(r.without.soli)} → {eur2(r.with.soli)}</li>
            <li>Kirchensteuer {church ? `${church} % der Einkommensteuer` : 'nicht berücksichtigt'}: {eur2(r.without.kist)} → {eur2(r.with.kist)}</li>
            <li>Ersparnis = {eur2(r.without.total)} − {eur2(r.with.total)} = <strong>{eur2(r.saving)}</strong>, das sind {pct(r.effRate)} von {eur(r.iab)}</li>
            <li>
              Im Jahr der Investition wird der IAB dem Gewinn wieder hinzugerechnet, und die Anschaffungskosten sinken um denselben Betrag. Auf
              die verbleibenden {eur(investment - r.iab)} sind zusätzlich bis zu 40 %{' '}
              <Link href="/ratgeber/sonderabschreibung-7g" className="text-emerald-700 underline">Sonderabschreibung</Link> und die reguläre AfA möglich.
            </li>
          </ol>
        </details>

        <ReportForm params={params} iab={r.iab} saving={r.saving} />

        <p className="px-1 text-[11px] leading-relaxed text-slate-400">
          Rechenhilfe, keine Steuerberatung. Tarif nach § 32a EStG, Solidaritätszuschlag mit Milderungszone, Kirchensteuer vereinfacht ohne
          Kinderfreibeträge, ohne Gewerbesteuer. Der IAB ist eine Steuerstundung. Lassen Sie Ihre Situation von Ihrem Steuerberater prüfen.
        </p>
      </div>
    </div>
  )
}

/** The calculator must not end in a dead end: offers for the chosen investment good within the budget, each with an inquiry button */
function MatchingOffers({ offers, category, investment, iab }: { offers: MarketOffer[]; category: string; investment: number; iab: number }) {
  const cat = getCategory(category)
  // Categories still under review (e.g. mining hardware) are not recommended
  const eligible = offers.filter(
    (o) => !getCategory(o.category_slug)?.comingSoon && (o.min_investment_cents == null || o.min_investment_cents / 100 <= investment),
  )
  const own = eligible.filter((o) => o.category_slug === category)
  const matches = [...own, ...eligible.filter((o) => o.category_slug !== category)].slice(0, 3)

  return (
    <div className={card}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Passende Angebote {iab > 0 ? `für Ihre ${eur(iab)} IAB` : 'für Ihre Investition'}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {own.length > 0 || !cat ? '' : `Für ${cat.name} gibt es aktuell kein Angebot in diesem Budget, daher ähnliche Investitionsgüter. `}
            Einstieg bis {eur(investment)} netto. Alle Preise netto.
          </p>
        </div>
        {cat && !cat.comingSoon && (
          <Link href={`/${cat.slug}`} className="text-xs font-semibold text-emerald-700 hover:underline">
            Alle Angebote {cat.name} →
          </Link>
        )}
      </div>
      {matches.length > 0 ? (
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {matches.map((o) => {
            const oc = getCategory(o.category_slug)
            const href = `/${o.category_slug}/${o.id}`
            return (
              <li key={o.id} className="flex flex-col overflow-hidden rounded-xl border border-slate-200">
                <Link href={href} className="block flex-1 p-3 hover:bg-slate-50">
                  <p className="text-[11px] font-medium text-slate-500">{oc?.name}</p>
                  <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-slate-900">{o.title}</p>
                  <p className="mt-1 text-xs font-bold text-[#003580]">
                    {o.min_investment_cents != null ? `ab ${formatEuro(o.min_investment_cents / 100)} netto` : 'Preis auf Anfrage'}
                  </p>
                  {o.expected_yield && <p className="text-[11px] text-emerald-700">{o.expected_yield}</p>}
                </Link>
                <Link href={`${href}#anfrage`} className="bg-emerald-600 py-2 text-center text-xs font-bold text-white hover:bg-emerald-500">
                  Angebot anfragen
                </Link>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Zu diesem Budget ist gerade kein Angebot online.{' '}
          <Link href={cat && !cat.comingSoon ? `/${cat.slug}#anfrage` : '/angebote'} className="font-semibold text-emerald-700 underline">
            Jetzt allgemein anfragen
          </Link>
          , Anbieter haben oft Angebote, die noch nicht online sind.
        </p>
      )}
    </div>
  )
}

function ReportForm({ params, iab, saving }: { params: CalcParams; iab: number; saving: number }) {
  const [state, action, pending] = useActionState<CalcReportState, FormData>(submitCalcReport, null)
  const tRef = useRef<HTMLInputElement>(null)
  const pathRef = useRef<HTMLInputElement>(null)
  const utmRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (tRef.current) tRef.current.value = String(Date.now())
    if (pathRef.current) pathRef.current.value = window.location.pathname
    if (utmRef.current) utmRef.current.value = new URLSearchParams(window.location.search).get('utm_source') ?? ''
  }, [])

  if (state?.ok) {
    return (
      <div id="rechner-report" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-2xl text-white">✓</div>
        <p className="mt-3 text-lg font-bold text-slate-900">{state.mailed ? 'Ihr Bericht ist unterwegs' : 'Danke, Ihr Bericht ist fertig'}</p>
        <p className="mt-1 text-sm text-slate-600">
          {state.mailed ? 'Sie erhalten Ihr Ergebnis in wenigen Minuten per E-Mail. ' : ''}
          Speichern Sie die Berechnung zusätzlich als PDF.
        </p>
        <button
          type="button"
          onClick={() => window.print()}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Als PDF speichern
        </button>
      </div>
    )
  }

  const fe = state?.fieldErrors ?? {}
  const field = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'

  return (
    <form
      className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-6"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        startTransition(() => action(fd))
      }}
    >
      <p className="text-lg font-bold text-slate-900">Ihr IAB-Bericht per E-Mail</p>
      <p className="mt-1 text-sm text-slate-500">
        Alle Werte, Rechenweg und Mehrjahres-Vergleich zum Weitergeben an Ihren Steuerberater, kostenlos{saving ? `: ${eur(saving)} Ersparnis bei ${eur(iab)} IAB` : ''}.
      </p>
      {(['zvE', 'year', 'church', 'investment', 'businesses', 'profit', 'category'] as const).map((k) => (
        <input key={k} type="hidden" name={k} value={String(params[k])} />
      ))}
      <input type="hidden" name="joint" value={params.joint ? '1' : '0'} />
      <input type="hidden" name="iab" value={iab} />
      <input ref={tRef} type="hidden" name="_t" defaultValue="" />
      <input ref={pathRef} type="hidden" name="landing_path" defaultValue="" />
      <input ref={utmRef} type="hidden" name="utm_source" defaultValue="" />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <input name="name" placeholder="Vor- und Nachname *" autoComplete="name" className={field} />
          {fe.name && <p className="mt-1 text-xs text-red-600">{fe.name}</p>}
        </div>
        <div>
          <input name="email" type="email" placeholder="E-Mail *" autoComplete="email" className={field} />
          {fe.email && <p className="mt-1 text-xs text-red-600">{fe.email}</p>}
        </div>
        <div>
          <select name="legal_form" defaultValue="" aria-label="Rechtsform" className={field}>
            <option value="" disabled>Rechtsform *</option>
            {LEGAL_FORMS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          {fe.legal_form && <p className="mt-1 text-xs text-red-600">{fe.legal_form}</p>}
        </div>
        <div>
          <select name="invest_timing" defaultValue="" aria-label="Geplanter Zeitpunkt der Investition" className={field}>
            <option value="" disabled>Wann investieren? *</option>
            {investTimings().map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          {fe.invest_timing && <p className="mt-1 text-xs text-red-600">{fe.invest_timing}</p>}
        </div>
        <div className="sm:col-span-2">
          <input name="phone" type="tel" placeholder="Telefon (optional)" autoComplete="tel" className={field} />
          {fe.phone ? (
            <p className="mt-1 text-xs text-red-600">{fe.phone}</p>
          ) : (
            <p className="mt-1 text-[11px] text-slate-400">Nur falls Sie einen Rückruf zu passenden Angeboten möchten. Wir geben die Nummer ohne Ihre Anfrage nicht weiter.</p>
          )}
        </div>
      </div>
      <label className="mt-3 flex items-start gap-2.5 text-xs leading-relaxed text-slate-600">
        <input type="checkbox" name="consent_privacy" className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600" />
        <span>
          {privacyBefore}
          <Link href="/datenschutz" target="_blank" className="underline">Datenschutzerklärung</Link>
          {privacyAfter} *
        </span>
      </label>
      {fe.consent_privacy && <p className="mt-1 text-xs text-red-600">{fe.consent_privacy}</p>}
      {state?.error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-4 w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
      >
        {pending ? 'Wird erstellt…' : 'Bericht kostenlos anfordern'}
      </button>
    </form>
  )
}
