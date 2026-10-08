'use client'

// Listing layout adapted from TinyMarket (components/marketplace/MarketplaceShell.tsx
// + components/ProjectCard.tsx): filter sidebar left, wide result cards right.

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { CATEGORIES, formatEuro, type Category } from '@/lib/categories'
import { cardFacts } from '@/lib/datasheets'
import type { PublicOffer } from '@/lib/supabase/types'
import { Flag } from './Flag'

const SORTS = [
  { value: 'newest', label: 'Neueste zuerst' },
  { value: 'price_asc', label: 'Einstieg aufsteigend' },
  { value: 'price_desc', label: 'Einstieg absteigend' },
] as const
type Sort = (typeof SORTS)[number]['value']

const BUDGETS = [
  { value: 0, label: 'Alle' },
  { value: 25000, label: 'bis 25.000 €' },
  { value: 50000, label: 'bis 50.000 €' },
  { value: 100000, label: 'bis 100.000 €' },
  { value: 200000, label: 'bis 200.000 €' },
]

function applySortAndFilter(offers: PublicOffer[], sort: Sort, maxEuro: number): PublicOffer[] {
  const filtered = maxEuro
    ? offers.filter((o) => o.min_investment_cents == null || o.min_investment_cents <= maxEuro * 100)
    : offers
  const min = (o: PublicOffer) => o.min_investment_cents ?? Number.MAX_SAFE_INTEGER
  const copy = [...filtered]
  if (sort === 'price_asc') return copy.sort((a, b) => min(a) - min(b))
  if (sort === 'price_desc') return copy.sort((a, b) => (b.min_investment_cents ?? 0) - (a.min_investment_cents ?? 0))
  return copy.sort((a, b) => b.created_at.localeCompare(a.created_at))
}

type Props = {
  category: Category
  offers: PublicOffer[]
}

export function OfferList({ category: c, offers }: Props) {
  const [sort, setSort] = useState<Sort>('newest')
  const [maxEuro, setMaxEuro] = useState(0)
  const shown = applySortAndFilter(offers, sort, maxEuro)

  const selectCls = 'rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-slate-900'

  const categoryNav = (
    <nav className="space-y-0.5">
      {CATEGORIES.map((cat) => {
        const active = cat.slug === c.slug
        return (
          <Link
            key={cat.slug}
            href={`/${cat.slug}`}
            className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
              active ? 'bg-slate-900 font-semibold text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span className="truncate">
              {cat.name}
            </span>
          </Link>
        )
      })}
    </nav>
  )

  const emptyState = c.comingSoon ? (
    <ComingSoonState category={c} />
  ) : (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <p className="text-base font-medium text-slate-700">
        {offers.length === 0 ? 'Aktuell sind noch keine Projekte online' : 'Keine Projekte für diesen Filter'}
      </p>
      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
        {offers.length === 0
          ? 'Fordern Sie unverbindlich Unterlagen an. Wir melden uns mit passenden Projekten, auch solchen, die noch nicht online sind.'
          : 'Passen Sie die Filter an oder senden Sie eine allgemeine Anfrage.'}
      </p>
      <a href="#anfrage" className="mt-5 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500">
        Jetzt anfragen
      </a>
    </div>
  )

  return (
    <div className="flex w-full min-w-0 gap-8">
      {/* ── Desktop sidebar ──────────────────────────────── */}
      <aside className="hidden w-60 shrink-0 lg:block">
        <Link href="/angebote" className="mb-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50">
          ← Alle Projekte
        </Link>
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Investitionsgüter</p>
        {categoryNav}

        <div className="mt-6 px-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Max. Einstieg</p>
          <div className="space-y-1">
            {BUDGETS.map((b) => (
              <label key={b.value} className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  type="radio"
                  name="budget"
                  checked={maxEuro === b.value}
                  onChange={() => setMaxEuro(b.value)}
                  className="accent-slate-900"
                />
                {b.label}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-slate-900 p-5 text-white">
          <p className="text-sm font-bold">Nichts Passendes dabei?</p>
          <p className="mt-1 text-xs text-slate-400">Anbieter melden sich auch mit Angeboten, die noch nicht online sind.</p>
          <a
            href="#anfrage"
            className="mt-3 block rounded-lg bg-emerald-500 py-2 text-center text-xs font-bold text-white transition-colors hover:bg-emerald-400"
          >
            Allgemein anfragen
          </a>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* ── Mobile: category tabs ───────────────────────── */}
        <div className="-mx-4 mb-4 flex gap-1.5 overflow-x-auto px-4 pb-1 lg:hidden">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                cat.slug === c.slug ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white text-slate-600'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* ── Results header ──────────────────────────────── */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-slate-500">
            {c.comingSoon ? 'Beispielprojekt für' : 'Aktuelle Projekte für'} <span className="font-semibold text-slate-900">{c.name}</span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <select value={maxEuro} onChange={(e) => setMaxEuro(Number(e.target.value))} className={`${selectCls} lg:hidden`} aria-label="Max. Einstieg">
              {BUDGETS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.value ? b.label : 'Jedes Budget'}
                </option>
              ))}
            </select>
            <label className="text-xs text-slate-500" htmlFor="offer-sort">
              Sortieren:
            </label>
            <select id="offer-sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={selectCls}>
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Categories without a lead buyer never list offers – only the labelled sample project */}
        {!c.comingSoon && shown.length > 0 ? (
          <div className="space-y-4">
            {shown.map((o) => (
              <OfferCard key={o.id} offer={o} category={c} />
            ))}
            <p className="text-xs text-slate-400">Ertragsangaben stammen von den Anbietern und sind nicht garantiert.</p>
          </div>
        ) : (
          emptyState
        )}
      </div>

    </div>
  )
}

/** „Bald verfügbar“: a realistic sample project, clearly marked as example, plus the pre-registration CTA */
function ComingSoonState({ category: c }: { category: Category }) {
  const s = c.sampleProject
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <strong>Bald verfügbar.</strong> Für {c.name} sprechen wir gerade mit Anbietern. Merken Sie sich kostenlos vor, dann melden wir uns
        mit dem ersten freigegebenen Projekt.
      </div>
      {s && (
        <div className="overflow-hidden rounded-xl border border-dashed border-slate-300 bg-white">
          <div className="flex flex-col sm:flex-row">
            <div className={`relative h-40 w-full shrink-0 bg-linear-to-br sm:h-auto sm:w-64 ${c.gradient}`}>
              {c.image && (
                <Image src={c.image.src} alt={c.image.alt} fill sizes="(min-width: 640px) 256px, 100vw" className="object-cover opacity-80" style={{ objectPosition: c.image.position }} />
              )}
              <span className="absolute left-2 top-2 rounded-full bg-slate-900 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">Beispiel</span>
            </div>
            <div className="flex-1 p-4 sm:p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{s.location} · kein reales Angebot</p>
              <h3 className="mt-1 text-lg font-bold leading-tight text-slate-900">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.text}</p>
              <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {s.facts.map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-slate-50 px-2.5 py-2">
                    <dt className="text-[11px] text-slate-400">{k}</dt>
                    <dd className="text-sm font-semibold text-slate-800">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      )}
      <a href="#anfrage" className="inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500">
        Jetzt vormerken
      </a>
    </div>
  )
}

export function OfferCard({ offer: o, category: c }: { offer: PublicOffer; category: Category }) {
  const price = o.min_investment_cents != null ? formatEuro(o.min_investment_cents / 100) : null
  const facts = cardFacts(c.slug, o.public_facts ?? [])
  const excerpt = o.description ? o.description.slice(0, 160).trimEnd() + (o.description.length > 160 ? '…' : '') : null

  const priceBlock = (compact: boolean) => (
    <div className={compact ? 'flex flex-wrap items-baseline gap-x-4 gap-y-1' : 'flex flex-col items-end gap-1'}>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-slate-400 ${compact ? 'text-xs' : 'text-sm'}`}>ab</span>
        <span className={`font-extrabold text-[#003580] ${compact ? 'text-xl' : 'text-2xl'}`}>{price ?? 'auf Anfrage'}</span>
        {price && <span className={`text-slate-400 ${compact ? 'text-xs' : 'text-sm'}`}>netto</span>}
      </div>
      {o.expected_yield && (
        <span className={`font-bold text-emerald-600 ${compact ? 'text-sm' : 'text-right text-sm'}`}>{o.expected_yield}</span>
      )}
    </div>
  )

  return (
    <Link
      href={`/${c.slug}/${o.id}`}
      className="group block overflow-hidden rounded-xl border border-slate-200 bg-white ring-emerald-500 transition duration-200 hover:border-emerald-500 hover:shadow-xl hover:ring-1 focus-within:border-emerald-500 focus-within:ring-1"
    >
      <div className="flex flex-col sm:flex-row">
        {/* ── Image ─────────────────────────────── */}
        <div className={`relative h-48 w-full shrink-0 overflow-hidden bg-linear-to-br sm:h-auto sm:w-64 lg:w-72 ${c.gradient}`}>
          {o.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary provider URLs
            <img src={o.image_url} alt={o.title} className="absolute inset-0 h-full w-full object-cover" />
          ) : c.image ? (
            <>
              <Image src={c.image.src} alt={c.image.alt} fill sizes="(min-width: 1024px) 288px, (min-width: 640px) 256px, 100vw" className="object-cover" style={{ objectPosition: c.image.position }} />
              {c.image.credit && <span className="absolute right-1.5 top-1 text-[8px] text-white/70">{c.image.credit}</span>}
            </>
          ) : null}
          <div className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {c.name}
          </div>
        </div>

        {/* ── Middle: content ─────────────────────── */}
        <div className="flex min-w-0 flex-1 flex-col px-4 py-4 sm:px-5">
          <div className="space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                <Flag code={o.country} /> {o.location ?? 'Standort auf Anfrage'}
              </p>
              <span className="flex shrink-0 items-center gap-1 rounded-md border border-violet-200 bg-violet-50 px-1.5 py-0.5 sm:hidden">
                <span className="text-xs font-semibold text-violet-700">IAB</span>
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">✓</span>
              </span>
            </div>

            <h3 className="line-clamp-2 text-lg font-bold leading-tight text-[#003580] group-hover:underline sm:text-xl">{o.title}</h3>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-sm bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 sm:text-sm">Verfügbar</span>
              {o.availability && (
                <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600 sm:text-sm">{o.availability}</span>
              )}
              <span className="rounded border border-teal-200 bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700 sm:text-sm">Bewegliches WG</span>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-700 sm:text-sm">
              {facts.length > 0 ? (
                facts.map((f) => (
                  <span key={f.label}>
                    <span className="text-slate-400">{f.label}:</span> <span className="font-semibold">{f.value}</span>
                  </span>
                ))
              ) : (
                <span>{c.yieldProfile}</span>
              )}
            </div>

            {excerpt && <p className="line-clamp-2 text-xs leading-relaxed text-slate-500 sm:text-sm">{excerpt}</p>}
          </div>

          {/* Mobile: price + CTA */}
          <div className="mt-3 sm:hidden">
            <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">{priceBlock(true)}</div>
            <span className="mt-2 block w-full rounded-lg bg-emerald-600 px-3 py-2.5 text-center text-sm font-bold text-white shadow-sm transition-colors group-hover:bg-emerald-500">
              Details ansehen →
            </span>
          </div>

          {/* Provider row – name is shared only after the inquiry */}
          <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3 sm:mt-auto">
            <div className="h-11 w-11 shrink-0 rounded-xl border border-slate-200 bg-slate-100" />
            <div className="min-w-0 flex-1">
              <p className="select-none truncate text-sm font-semibold text-slate-300 blur-sm">Anbieter GmbH &amp; Co. KG</p>
              <p className="mt-0.5 text-xs text-slate-400">Anbieter und Unterlagen mit Ihrer Anfrage</p>
            </div>
          </div>
        </div>

        {/* ── Right: badges + price + CTA (desktop) ─── */}
        <div className="hidden w-44 shrink-0 flex-col items-end justify-between border-l border-slate-100 px-4 py-4 sm:flex lg:w-52 lg:px-5">
          <span title="Für den Investitionsabzugsbetrag geeignet (bewegliches Wirtschaftsgut)" className="flex items-center gap-1 rounded-lg border border-violet-200 bg-violet-50 px-2 py-1">
            <span className="text-xs font-semibold text-violet-700">IAB</span>
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">✓</span>
          </span>
          <div className="mt-3 w-full">{priceBlock(false)}</div>
          <span className="mt-4 block w-full rounded-lg bg-emerald-600 px-3 py-2.5 text-center text-sm font-bold text-white shadow-sm transition-colors group-hover:bg-emerald-500">
            Details →
          </span>
        </div>
      </div>
    </Link>
  )
}
