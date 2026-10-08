'use client'

import { useRef, useState, useSyncExternalStore } from 'react'
import { lapseCost } from '@/lib/aufloesen'
import { CATEGORIES, getCategory } from '@/lib/categories'
import { formatDeadline, iabDeadline, iabYears } from '@/lib/iab'
import { eur, isTaxYear } from '@/lib/rechner'
import type { MarketOffer } from '@/lib/supabase/types'
import type { TaxYear } from '@/lib/tax'
import { track } from '@/lib/track'
import { LeadForm } from './LeadForm'
import { OfferCard } from './OfferList'

// Frist-Check (deadline pages): tax year + IAB amount → deadline, cost of missing it, live countdown,
// matching real projects, then the inquiry wizard pre-filled with amount and year.

const input =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
const label = 'mb-1.5 block text-sm font-medium text-slate-700'
const seg = (on: boolean) =>
  `flex-1 rounded-lg px-2 py-2 text-sm font-medium transition-colors ${on ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-white'}`
const euroIn = (v: string) => Number(v.replace(/[^\d]/g, '')) || 0
const show = (n: number) => (n ? n.toLocaleString('de-DE') : '')
/** Deadline leads are only offered categories with a lead buyer */
const LIVE_SLUGS = CATEGORIES.filter((c) => !c.comingSoon).map((c) => c.slug)

// Current time, ticking once a minute. null during server rendering and hydration, so the markup matches.
const subscribeMinute = (cb: () => void) => {
  const t = setInterval(cb, 60_000)
  return () => clearInterval(t)
}
const minuteSnapshot = () => Math.floor(Date.now() / 60_000) * 60_000
const serverSnapshot = () => null
function useNow(): number | null {
  return useSyncExternalStore(subscribeMinute, minuteSnapshot, serverSnapshot)
}

function Countdown({ year, now }: { year: number; now: number | null }) {
  // Deadline = end of 31.12. (German time is close enough for a countdown)
  const end = iabDeadline(year).getTime() + 86_400_000
  const left = now == null ? null : Math.max(0, end - now)
  const parts =
    left == null
      ? [['–', 'Tage'], ['–', 'Std.'], ['–', 'Min.']]
      : [
          [Math.floor(left / 86_400_000), 'Tage'],
          [Math.floor((left % 86_400_000) / 3_600_000), 'Std.'],
          [Math.floor((left % 3_600_000) / 60_000), 'Min.'],
        ]
  return (
    <div className="flex gap-2" aria-label="Verbleibende Zeit bis Fristende">
      {parts.map(([v, l]) => (
        <div key={l} className="min-w-16 rounded-xl bg-white/10 px-3 py-2 text-center ring-1 ring-white/15">
          <p className="text-2xl font-extrabold tabular-nums text-white">{v}</p>
          <p className="text-[11px] text-slate-400">{l}</p>
        </div>
      ))}
    </div>
  )
}

export function FristCheck({ defaultYear, offers }: { defaultYear: number; offers: MarketOffer[] }) {
  const [years] = useState(() => iabYears().filter(isTaxYear))
  const [year, setYear] = useState<TaxYear>(() => (isTaxYear(defaultYear) && years.includes(defaultYear) ? defaultYear : years[0]))
  const [iab, setIab] = useState(50000)
  const [zvE, setZvE] = useState(120000)
  const [joint, setJoint] = useState(false)
  const [church, setChurch] = useState<0 | 8 | 9>(0)
  const used = useRef(false)

  const touch = () => {
    if (used.current) return
    used.current = true
    track('Frist-Check', { jahr: year })
  }

  const r = lapseCost({ iab, zvE, year, joint, church })
  const now = useNow()
  const expired = now != null && iabDeadline(year).getTime() + 86_400_000 < now
  // 2–3 real projects per live category that a IAB of this size can back (IAB ≤ 50 % of the cost)
  const perCategory = new Map<string, number>()
  const matching = offers
    .filter((o) => {
      const c = getCategory(o.category_slug)
      if (!c || c.comingSoon) return false
      // Full use needs ≥ 2 × IAB; tickets far above that are out of reach for this lead
      if (o.min_investment_cents != null && iab > 0 && o.min_investment_cents / 100 > iab * 3) return false
      const n = perCategory.get(o.category_slug) ?? 0
      if (n >= 2) return false
      perCategory.set(o.category_slug, n + 1)
      return true
    })
    .slice(0, 6)

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        {/* ── Inputs ── */}
        <div className="space-y-5 self-start rounded-2xl bg-white p-5 shadow-2xl shadow-slate-950/30 sm:p-6">
          <p className="text-lg font-bold text-slate-900">Frist-Check</p>
          <div>
            <span className={label}>IAB gebildet für Wirtschaftsjahr</span>
            <div className="grid grid-cols-4 gap-1 rounded-xl bg-slate-100 p-1">
              {years.map((y) => (
                <button key={y} type="button" onClick={() => { setYear(y); touch() }} className={seg(year === y)}>
                  {y}
                </button>
              ))}
            </div>
          </div>
          <label className="block">
            <span className={label}>Höhe des IAB (€)</span>
            <input inputMode="numeric" value={show(iab)} onChange={(e) => { setIab(Math.min(euroIn(e.target.value), 200000)); touch() }} className={input} />
          </label>
          <details className="text-sm">
            <summary className="cursor-pointer font-medium text-slate-600">Genauer rechnen (Einkommen, Splitting, Kirchensteuer)</summary>
            <div className="mt-3 space-y-4">
              <label className="block">
                <span className={label}>Zu versteuerndes Einkommen {year} ohne IAB (€)</span>
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
                  <span className={label}>Kirchensteuer</span>
                  <select value={church} onChange={(e) => setChurch(Number(e.target.value) as 0 | 8 | 9)} className={input}>
                    <option value={0}>keine</option>
                    <option value={8}>8 %</option>
                    <option value={9}>9 %</option>
                  </select>
                </label>
              </div>
              <p className="text-xs text-slate-500">Ohne Angabe rechnen wir mit 120.000 € Einkommen, Einzelveranlagung, ohne Kirchensteuer.</p>
            </div>
          </details>
        </div>

        {/* ── Result ── */}
        <div className="min-w-0 space-y-4 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 sm:p-6">
          {expired ? (
            <p className="text-lg font-semibold text-white">
              Die Frist für Ihren IAB aus {year} ist am {formatDeadline(year)} abgelaufen. Der IAB wird rückgängig gemacht.
            </p>
          ) : (
            <>
              <p className="text-sm text-slate-300">Ihr Ergebnis</p>
              <p className="text-2xl font-bold leading-snug text-white sm:text-3xl">
                Sie müssen bis <span className="text-amber-300">{formatDeadline(year)}</span> mindestens{' '}
                <span className="text-amber-300">{eur(iab * 2)} netto</span> investieren.
              </p>
              <p className="text-slate-300">
                Sonst zahlen Sie ca. <strong className="text-white">{eur(r.backTax)} Steuern nach</strong> plus{' '}
                <strong className="text-white">{eur(r.interest)} Zinsen</strong> ({r.months} Monate × 0,15 %).
              </p>
              <Countdown year={year} now={now} />
              <p className="text-xs text-slate-400">
                Maßgeblich ist die Lieferung bzw. Anschaffung bis zum Fristende, nicht die Bestellung. Rechenhilfe, keine Steuerberatung.
              </p>
            </>
          )}
          <a href="#anfrage" className="inline-block rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-400">
            Passende Projekte & Kalkulation anfordern
          </a>
        </div>
      </div>

      {matching.length > 0 && (
        <div className="rounded-2xl bg-white p-5 sm:p-6">
          <p className="text-lg font-bold text-slate-900">Projekte, die zu {eur(iab)} IAB passen</p>
          <p className="mb-4 mt-1 text-sm text-slate-500">Reale Projekte unserer Anbieter. Details sehen Sie nach Ihrer kostenlosen Anfrage.</p>
          <div className="space-y-4">
            {matching.map((o) => (
              <OfferCard key={o.id} offer={o} category={getCategory(o.category_slug)!} />
            ))}
          </div>
        </div>
      )}

      <div id="anfrage" className="scroll-mt-20 rounded-2xl border-2 border-emerald-500 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-lg font-bold text-slate-900">Unterlagen & Kalkulation anfordern</p>
        <p className="mb-4 mt-1 text-sm text-slate-500">
          Wir senden Ihnen Projekte, die bis {formatDeadline(year)} lieferbar sind, und melden uns persönlich.
        </p>
        <LeadForm key={`${year}-${iab}`} preselected={[]} options={LIVE_SLUGS} source="frist" iabAmount={iab > 0 ? iab : undefined} year={iab > 0 ? year : undefined} />
      </div>
    </div>
  )
}
