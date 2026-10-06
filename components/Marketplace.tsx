'use client'

// Marketplace (/angebote), modelled on PV marketplaces like Milk the Sun: public listing cards, details after free
// registration, inquiries forwarded to the provider. Exactly one category is shown at a time – never a mixed list.

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CATEGORIES, formatEuro } from '@/lib/categories'
import { countryName, DEFAULT_COUNTRY, isCountryCode } from '@/lib/countries'
import { createClient } from '@/lib/supabase/client'
import type { MarketOffer } from '@/lib/supabase/types'
import { CountrySelect } from './CountrySelect'
import { ModalButton } from './ModalButton'
import { OfferCard } from './OfferList'

const SORTS = [
  { value: 'newest', label: 'Neueste zuerst' },
  { value: 'price_asc', label: 'Einstieg aufsteigend' },
  { value: 'price_desc', label: 'Einstieg absteigend' },
] as const
type Sort = (typeof SORTS)[number]['value']

const BUDGETS = [
  { value: 0, label: 'Jedes Budget' },
  { value: 25000, label: 'bis 25.000 €' },
  { value: 50000, label: 'bis 50.000 €' },
  { value: 100000, label: 'bis 100.000 €' },
  { value: 200000, label: 'bis 200.000 €' },
  { value: 400000, label: 'bis 400.000 €' },
]

const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY)

const chip = (on: boolean) =>
  `whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
    on ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
  }`

export function Marketplace({ offers }: { offers: MarketOffer[] }) {
  // Default: first category (demand order) that has offers
  const [cat, setCat] = useState(() => (CATEGORIES.find((c) => offers.some((o) => o.category_slug === c.slug)) ?? CATEGORIES[0]).slug)
  const [maxEuro, setMaxEuro] = useState(0)
  const [land, setLand] = useState<string>(DEFAULT_COUNTRY)
  const [sort, setSort] = useState<Sort>('newest')
  // null = unknown yet; read client-side so the page stays static
  const [signedIn, setSignedIn] = useState<boolean | null>(configured ? null : false)

  useEffect(() => {
    if (!configured) return
    createClient()
      .auth.getUser()
      .then(({ data }) => setSignedIn(Boolean(data.user)))
  }, [])

  // Deep links from the search bar, calculator and home page: /angebote?kategorie=photovoltaik-iab&budget=100000&land=DE
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const k = params.get('kategorie')
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from the URL after hydration
    if (k && CATEGORIES.some((c) => c.slug === k)) setCat(k)
    const b = Number(params.get('budget'))
    if (b > 0) setMaxEuro(b)
    const l = params.get('land')
    if (l !== null) setLand(isCountryCode(l) ? l : '')
  }, [])

  const switchTo = (slug: string) => {
    setCat(slug)
    // Keep the URL shareable without a navigation
    const params = new URLSearchParams(window.location.search)
    params.set('kategorie', slug)
    window.history.replaceState(null, '', `?${params}`)
  }

  const c = CATEGORIES.find((x) => x.slug === cat)!
  const ofCat = offers.filter((o) => o.category_slug === cat)
  const inSelectedLand = ofCat.filter((o) => !land || (o.country ?? 'DE') === land)
  // Nothing in the chosen country: show the German offers instead of an empty list
  const fallback = inSelectedLand.length === 0 && land !== '' && land !== DEFAULT_COUNTRY
  const inCat = fallback ? ofCat.filter((o) => (o.country ?? 'DE') === DEFAULT_COUNTRY) : inSelectedLand
  const min = (o: MarketOffer) => o.min_investment_cents ?? Number.MAX_SAFE_INTEGER
  const shown = inCat
    .filter((o) => !maxEuro || o.min_investment_cents == null || o.min_investment_cents <= maxEuro * 100)
    .sort((a, b) =>
      sort === 'price_asc' ? min(a) - min(b) : sort === 'price_desc' ? min(b) - min(a) : b.created_at.localeCompare(a.created_at)
    )

  const budgetOptions = BUDGETS.some((b) => b.value === maxEuro)
    ? BUDGETS
    : [...BUDGETS, { value: maxEuro, label: `bis ${maxEuro.toLocaleString('de-DE')} €` }].sort((a, b) => a.value - b.value)
  const selectCls = 'rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-slate-900'
  const landLabel = fallback ? `in ${countryName(DEFAULT_COUNTRY)}` : land ? `in ${countryName(land)}` : 'in allen Ländern'

  return (
    <div className="flex w-full min-w-0 gap-8">
      {/* ── Sidebar (desktop) ─────────────────────────── */}
      <aside className="hidden w-60 shrink-0 space-y-6 lg:block">
        <div>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Investitionsgut</p>
          <div className="space-y-0.5">
            {CATEGORIES.map((x) => {
              const on = x.slug === cat
              return (
                <button
                  key={x.slug}
                  type="button"
                  onClick={() => switchTo(x.slug)}
                  aria-pressed={on}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    on ? 'bg-slate-900 font-semibold text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className="truncate">
                    {x.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="px-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Land</p>
          <CountrySelect value={land} onChange={setLand} buttonClassName="rounded-lg border border-slate-300 bg-white px-3 py-2" />
        </div>

        <div className="px-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Max. Einstieg (netto)</p>
          <div className="space-y-1">
            {budgetOptions.map((b) => (
              <label key={b.value} className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input type="radio" name="budget" checked={maxEuro === b.value} onChange={() => setMaxEuro(b.value)} className="accent-slate-900" />
                {b.label}
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-slate-900 p-5 text-white">
          <p className="text-sm font-bold">Wie viel müssen Sie investieren?</p>
          <p className="mt-1 text-xs text-slate-400">Der IAB-Rechner zeigt Steuereffekt, Investitionsvolumen und passende Kategorien.</p>
          <Link href="/iab-rechner" className="mt-3 block rounded-lg bg-emerald-500 py-2 text-center text-xs font-bold text-white transition-colors hover:bg-emerald-400">
            Zum IAB-Rechner →
          </Link>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* ── Category switch (mobile) ─────────────────── */}
        <div className="-mx-4 mb-4 flex gap-1.5 overflow-x-auto px-4 pb-1 lg:hidden">
          {CATEGORIES.map((x) => (
            <button key={x.slug} type="button" onClick={() => switchTo(x.slug)} aria-pressed={x.slug === cat} className={chip(x.slug === cat)}>
              {x.name}
            </button>
          ))}
        </div>

        {/* ── Active category ─────────────────────────── */}
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              {c.name}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Aktuelle Angebote {landLabel}
              {maxEuro > 0 && ` bis ${formatEuro(maxEuro)} netto`} ·{' '}
              <Link href={`/${c.slug}`} className="text-emerald-700 hover:underline">
                Alles zu {c.name} mit IAB
              </Link>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <CountrySelect value={land} onChange={setLand} className="w-44 lg:hidden" buttonClassName="rounded-lg border border-slate-300 bg-white px-3 py-1.5" />
            <select value={maxEuro} onChange={(e) => setMaxEuro(Number(e.target.value))} className={`${selectCls} lg:hidden`} aria-label="Max. Einstieg">
              {budgetOptions.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={selectCls} aria-label="Sortieren">
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!signedIn && signedIn !== null && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-sm text-emerald-900">
              <strong>Kostenlos registrieren</strong> und bei allen Angeboten Kennzahlen, Unterlagen und Details sehen.
            </p>
            <ModalButton modal="register" className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-500">
              Konto erstellen
            </ModalButton>
          </div>
        )}

        {fallback && inCat.length > 0 && (
          <p className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Für {c.name} in {countryName(land)} sind gerade keine Projekte online. Wir zeigen Ihnen Angebote aus Deutschland.{' '}
            <a href="#anfrage" className="font-semibold text-emerald-700 hover:underline">
              Projekte in {countryName(land)} anfragen
            </a>
          </p>
        )}

        {shown.length > 0 ? (
          <div className="space-y-4">
            {shown.map((o) => (
              <OfferCard key={o.id} offer={o} category={c} />
            ))}
            <p className="text-xs text-slate-400">Alle Preise netto. Ertragsangaben stammen von den Anbietern und sind nicht garantiert.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <p className="text-base font-medium text-slate-700">
              {inCat.length > 0
                ? `Keine Angebote für ${c.name} bis ${formatEuro(maxEuro)} netto`
                : `Aktuell keine Angebote für ${c.name} ${landLabel}`}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {inCat.length > 0 && maxEuro > 0 && (
                <button type="button" onClick={() => setMaxEuro(0)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Budget zurücksetzen
                </button>
              )}
              {land && !fallback && ofCat.some((o) => (o.country ?? 'DE') !== land) && (
                <button type="button" onClick={() => setLand('')} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Andere Länder anzeigen
                </button>
              )}
              <a href="#anfrage" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500">
                Anbieter für {c.name} anfragen
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
