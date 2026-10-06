'use client'

import { useState } from 'react'
import { CATEGORIES, GOALS, type Goal } from '@/lib/categories'
import { CategoryCard } from './CategoryCard'

const BUDGETS = [
  { value: 0, label: 'Jedes Budget' },
  { value: 25000, label: 'bis 25.000 €' },
  { value: 50000, label: 'bis 50.000 €' },
]

const chip = (on: boolean) =>
  `whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
    on ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
  }`

export function CategoryGrid() {
  const [goal, setGoal] = useState<Goal | null>(null)
  const [budget, setBudget] = useState(0)

  const shown = CATEGORIES.filter(
    (c) => (!goal || c.goals.includes(goal)) && (!budget || c.minInvestment <= budget)
  )

  return (
    <>
      <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <button type="button" onClick={() => setGoal(null)} className={chip(goal === null)}>
          Alle
        </button>
        {GOALS.map((g) => (
          <button key={g.value} type="button" onClick={() => setGoal(goal === g.value ? null : g.value)} className={chip(goal === g.value)}>
            {g.label}
          </button>
        ))}
        <span className="mx-1 hidden w-px bg-slate-200 sm:block" />
        {BUDGETS.slice(1).map((b) => (
          <button key={b.value} type="button" onClick={() => setBudget(budget === b.value ? 0 : b.value)} className={chip(budget === b.value)}>
            {b.label}
          </button>
        ))}
      </div>


      {shown.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          Keine Kategorie passt zu diesen Filtern.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((c) => (
            <CategoryCard key={c.slug} category={c} />
          ))}
        </div>
      )}

    </>
  )
}
