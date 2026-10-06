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

const label = 'block px-4 pt-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400'

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
      className={`grid divide-y divide-slate-200 rounded-2xl bg-white shadow-2xl shadow-slate-950/40 md:divide-y-0 md:grid-cols-[1.3fr_1fr_1fr_auto] md:divide-x md:divide-slate-200 ${className}`}
    >
      <input type="hidden" name="kategorie" value={cat} />
      <input type="hidden" name="land" value={land} />
      <div>
        <span className={label}>Investitionsgut</span>
        <CategorySelect value={cat} onChange={setCat} buttonClassName="px-4 pb-3 pt-1" />
      </div>
      <label className="block">
        <span className={label}>Budget (netto)</span>
        <select name="budget" defaultValue="" className="w-full rounded-lg border-0 bg-transparent px-4 pb-3 pt-1 text-sm text-slate-900 outline-none">
          {BUDGETS.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
      </label>
      <div>
        <span className={label}>Land</span>
        <CountrySelect value={land} onChange={setLand} buttonClassName="px-4 pb-3 pt-1" />
      </div>
      <button
        type="submit"
        // Flush with the bar edges: full height, no margin; corners follow the bar
        className="rounded-b-2xl bg-emerald-600 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-emerald-500 md:rounded-l-none md:rounded-r-2xl md:py-0"
      >
        Suchen
      </button>
    </form>
  )
}
