'use client'

import { useEffect, useRef, useState } from 'react'
import { ASSESSMENT_DELAY_MONTHS, INTEREST_PER_MONTH, lapseCost } from '@/lib/aufloesen'
import { daysUntilDeadline, formatDeadline, iabYears } from '@/lib/iab'
import { eur, eur2, isTaxYear } from '@/lib/rechner'
import type { TaxYear } from '@/lib/tax'
import { track } from '@/lib/track'
import { CtaButton, TrustLine } from './seo/CtaCard'
import { SaveResult } from './seo/SaveResult'

const input =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
const label = 'mb-1.5 block text-sm font-medium text-slate-700'
const seg = (on: boolean) =>
  `flex-1 rounded-lg px-2 py-2 text-sm font-medium transition-colors ${on ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-white'}`

function euroIn(v: string): number {
  const n = Number(v.replace(/[^\d]/g, ''))
  return Number.isFinite(n) ? n : 0
}
const show = (n: number) => (n ? n.toLocaleString('de-DE') : '')
const date = (d: Date) => d.toLocaleDateString('de-DE', { month: '2-digit', year: 'numeric' })

export function AufloesenRechner() {
  // Running vintages that have a tax tariff, most urgent (oldest) first
  const [years] = useState(() => iabYears().filter(isTaxYear))
  const [year, setYear] = useState<TaxYear>(years[0])
  const [iab, setIab] = useState(50000)
  const [zvE, setZvE] = useState(120000)
  const [joint, setJoint] = useState(false)
  const [church, setChurch] = useState<0 | 8 | 9>(0)
  const used = useRef(false)

  // Link from the „Ergebnis speichern“ e-mail: ?iab=…&jahr=…#rechner restores the values and opens the folded calculator
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const iabParam = Number(p.get('iab'))
    const yearParam = Number(p.get('jahr'))
    if (iabParam > 0 || yearParam) {
      queueMicrotask(() => {
        if (iabParam > 0) setIab(Math.min(iabParam, 200000))
        const y = years.find((x) => x === yearParam)
        if (y) setYear(y)
      })
    }
    if (window.location.hash === '#rechner') {
      const d = document.getElementById('rechner')
      if (d instanceof HTMLDetailsElement) {
        d.open = true
        d.scrollIntoView()
      }
    }
  }, [years])
  // First interaction = the entry question was answered (funnel step „Einstiegsfrage“)
  const touch = () => {
    if (used.current) return
    used.current = true
    track('Rechner genutzt', { rechner: 'aufloesen' })
  }

  const r = lapseCost({ iab, zvE, year, joint, church })
  const days = daysUntilDeadline(year)
  const scale = Math.max(r.total, 1)

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
      {/* ── Inputs: the entry question first, details folded away ── */}
      <div className="space-y-5 self-start rounded-2xl bg-white p-5 shadow-2xl shadow-slate-950/30 sm:p-6">
        <label className="block">
          <span className="mb-2 block text-lg font-bold text-slate-900">Wie hoch ist Ihr IAB?</span>
          <div className="relative">
            <input
              inputMode="numeric"
              value={show(iab)}
              onChange={(e) => {
                setIab(Math.min(euroIn(e.target.value), 200000))
                touch()
              }}
              className={`${input} pr-8 text-xl font-semibold`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">€</span>
          </div>
        </label>
        <div>
          <span className={label}>Gebildet für Wirtschaftsjahr</span>
          <div className="grid grid-cols-4 gap-1 rounded-xl bg-slate-100 p-1">
            {years.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => {
                  setYear(y)
                  touch()
                }}
                className={seg(year === y)}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
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
            <p className="text-xs text-slate-500">Ohne Angabe: 120.000 € Einkommen, Einzelveranlagung, keine Kirchensteuer.</p>
          </div>
        </details>
      </div>

      {/* ── Result ── */}
      <div className="min-w-0 space-y-5">
        <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 sm:p-6">
          <p className="text-sm text-slate-300">Wenn Sie nicht bis {formatDeadline(year)} investieren, kostet Sie das ca.</p>
          <p className="mt-1 text-5xl font-extrabold tracking-tight text-amber-300 tabular-nums">{eur(r.total)}</p>
          <p className="mt-2 text-sm text-slate-300">
            {days > 0 ? (
              <>
                Noch <strong className="text-white">{days} Tage</strong> bis zum Fristende.
              </>
            ) : (
              'Die Frist ist abgelaufen.'
            )}
          </p>
          {/* The result always ends in the one primary action, pre-filled with what was just entered */}
          <div className="mt-5 border-t border-white/10 pt-5">
            <p className="text-sm font-semibold text-white">
              Lieber investieren: passende Projekte + Kalkulation für {eur(iab)} IAB, lieferbar bis {formatDeadline(year)}
            </p>
            <CtaButton prefill={iab > 0 ? { iabAmount: iab, year } : undefined} where="rechner-ergebnis" className="mt-3 w-full sm:w-auto" />
            <div className="mt-2">
              <TrustLine dark />
            </div>
            <div className="mt-4">
              <SaveResult
                key={`${iab}-${year}`}
                iabAmount={iab}
                year={year}
                summary={`IAB ${eur(iab)} aus ${year}, Frist ${formatDeadline(year)}. Bei Auflösung ca. ${eur(r.total)} (Nachzahlung ${eur(r.backTax)} + Zinsen ${eur(r.interest)}).`}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm font-semibold text-slate-900">Auflösen oder rechtzeitig investieren?</p>
          <div className="mt-4 space-y-4">
            <div>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="font-medium text-slate-700">IAB auflösen</span>
                <span className="font-semibold tabular-nums text-slate-900">{eur2(r.total)}</span>
              </div>
              {/* Stacked: back tax + interest, 2px surface gap between segments */}
              <div className="flex h-6 gap-0.5">
                <span className="h-6 rounded-l bg-slate-700 transition-all" style={{ width: `${(r.backTax / scale) * 100}%` }} title={`Steuernachzahlung ${eur2(r.backTax)}`} />
                {r.interest > 0 && (
                  <span className="h-6 rounded-r bg-amber-500 transition-all" style={{ width: `${Math.max(1, (r.interest / scale) * 100)}%` }} title={`Zinsen ${eur(r.interest)}`} />
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-slate-700" /> Steuernachzahlung {eur2(r.backTax)}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" /> Zinsen {eur(r.interest)} ({r.months} Monate × 0,15 %)
                </span>
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="font-medium text-slate-700">Rechtzeitig investieren</span>
                <span className="font-semibold tabular-nums text-emerald-700">0,00 € Nachzahlung</span>
              </div>
              <div className="h-6 rounded bg-slate-50" />
              <p className="mt-2 text-xs text-slate-600">
                Mindestens <strong>{eur(iab * 2)} netto</strong> investieren, dann bleibt die Steuerstundung erhalten. Zusätzlich sind bis zu{' '}
                <strong>{eur(iab * 0.4)}</strong> Sonderabschreibung möglich (40 % der um den IAB geminderten Kosten).
              </p>
            </div>
          </div>
          <details className="mt-4 text-xs text-slate-500">
            <summary className="cursor-pointer">So ist gerechnet</summary>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>Nachzahlung: Steuer auf {eur(zvE)} minus Steuer auf {eur(Math.max(0, zvE - iab))} im Jahr {year} (Einkommensteuer, Soli, Kirchensteuer).</li>
              <li>
                Zinsen nach § 233a AO: {(INTEREST_PER_MONTH * 100).toLocaleString('de-DE')} % pro vollem Monat auf die Einkommensteuer-Nachzahlung von{' '}
                {eur(r.incomeTaxPart)}, ab {date(r.start)} (15 Monate nach Ende des Bildungsjahres).
              </li>
              <li>Annahme: geänderter Bescheid etwa {ASSESSMENT_DELAY_MONTHS} Monate nach Fristende, also bis {date(r.end)}. Kommt er später, steigen die Zinsen.</li>
              <li>Soli und Kirchensteuer werden nicht verzinst. Rechenhilfe, keine Steuerberatung.</li>
            </ul>
          </details>
        </div>

      </div>
    </div>
  )
}
