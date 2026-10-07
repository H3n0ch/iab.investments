'use client'

import { useState } from 'react'
import { CATEGORIES } from '@/lib/categories'
import { DEFAULT_COUNTRY } from '@/lib/countries'
import { CategorySelect } from './CategorySelect'
import { CountrySelect } from './CountrySelect'

const BUDGETS = [
  { value: '', label: 'Jedes Budget' },
  { value: '25000', label: 'bis 25.000 €' },
  { value: '50000', label: 'bis 50.000 €' },
  { value: '100000', label: 'bis 100.000 €' },
  { value: '200000', label: 'bis 200.000 €' },
  { value: '400000', label: 'bis 400.000 €' },
]

const label = 'block px-4 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400'
// Each field is its own soft tile inside the white bar (like Milk the Sun)
const field = 'rounded-xl bg-slate-50 ring-1 ring-slate-200/70 transition-colors hover:bg-slate-100'

/**
 * Marketplace search (like Milk the Sun): one investment good, budget and country → /angebote.
 * A GET form – the marketplace reads kategorie/budget/land from the query string.
 */
export function OfferSearch({ className = '' }: { className?: string }) {
  const [cat, setCat] = useState(CATEGORIES[0].slug)
  const [land, setLand] = useState<string>(DEFAULT_COUNTRY)

  return (
    <form
      action="/angebote"
      method="get"
      role="search"
      className={`mx-auto grid max-w-4xl gap-2 rounded-2xl bg-white p-2 shadow-2xl shadow-slate-950/40 md:grid-cols-[1.3fr_1fr_1fr_auto] ${className}`}
    >
      <input type="hidden" name="kategorie" value={cat} />
      <input type="hidden" name="land" value={land} />
      <div className={field}>
        <span className={label}>Investitionsgut</span>
        <CategorySelect value={cat} onChange={setCat} buttonClassName="px-4 pb-2.5 pt-0.5 font-medium" />
      </div>
      <label className={`block ${field}`}>
        <span className={label}>Budget (netto)</span>
        <select name="budget" defaultValue="" className="w-full cursor-pointer rounded-lg border-0 bg-transparent px-4 pb-2.5 pt-0.5 text-sm font-medium text-slate-900 outline-none">
          {BUDGETS.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
      </label>
      <div className={field}>
        <span className={label}>Land</span>
        <CountrySelect value={land} onChange={setLand} buttonClassName="px-4 pb-2.5 pt-0.5 font-medium" />
      </div>
      <button
        type="submit"
        className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-900/20 transition-colors hover:bg-emerald-500"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="h-4 w-4" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        Suche starten
        <span aria-hidden>→</span>
      </button>
    </form>
  )
}
