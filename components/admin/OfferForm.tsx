'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createOffer, updateOffer } from '@/lib/actions/admin'
import { CATEGORIES } from '@/lib/categories'
import { COUNTRIES } from '@/lib/countries'
import { getDatasheet } from '@/lib/datasheets'
import type { Offer } from '@/lib/supabase/types'

// Create / edit an offer. The data sheet fields follow the chosen category (lib/datasheets.ts);
// each field is marked public or 🔒 – the split is fixed per field so all offers look the same.

const input = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500'

export type EditableOffer = Offer & { categories: { slug: string; name: string } | null }

export function OfferForm({ offer }: { offer?: EditableOffer }) {
  const [category, setCategory] = useState(offer?.categories?.slug ?? CATEGORIES[0].slug)
  const sheet = getDatasheet(category)
  const all = [...(offer?.public_facts ?? []), ...(offer?.facts ?? [])]
  const valueOf = (key: string) => all.find((f) => f.key === key)?.value ?? ''
  // Free-form facts (no data sheet key) stay editable as text
  const freeFacts = (offer?.facts ?? []).filter((f) => !f.key || !sheet?.some((s) => s.fields.some((x) => x.key === f.key)))
  const action = offer ? updateOffer.bind(null, offer.id) : createOffer

  return (
    <form key={offer?.id ?? 'new'} action={action} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
      <div className="flex items-center justify-between sm:col-span-2">
        <p className="text-sm font-semibold text-slate-900">{offer ? `Angebot bearbeiten: ${offer.title}` : 'Neues Angebot'}</p>
        {offer && (
          <Link href="/admin/offers" className="text-xs text-slate-500 hover:underline">
            Abbrechen
          </Link>
        )}
      </div>
      <select name="category" required value={category} onChange={(e) => setCategory(e.target.value)} className={input}>
        {CATEGORIES.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.icon} {c.name}
            {c.comingSoon ? ' (bald verfügbar)' : ''}
          </option>
        ))}
      </select>
      <input name="title" required defaultValue={offer?.title} placeholder="Titel *, z. B. Solarpark Hirschbach (Oberpfalz)" className={input} />
      <input name="location" defaultValue={offer?.location ?? ''} placeholder="Region (öffentlich), z. B. Oberpfalz, Bayern" className={input} />
      <select name="country" defaultValue={offer?.country ?? 'DE'} className={input}>
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>
      <input
        name="min_investment"
        inputMode="decimal"
        defaultValue={offer?.min_investment_cents != null ? String(offer.min_investment_cents / 100) : ''}
        placeholder="Einstieg in € netto (öffentlich), z. B. 120000"
        className={input}
      />
      <input name="expected_yield" defaultValue={offer?.expected_yield ?? ''} placeholder='Ertrag öffentlich, z. B. "Erlöse aus EEG-Vergütung"' className={input} />
      <input name="availability" defaultValue={offer?.availability ?? ''} placeholder="Verfügbarkeit, z. B. Lieferung bis Dez." className={input} />
      <input name="image_url" type="url" defaultValue={offer?.image_url ?? ''} placeholder="Bild-URL (optional)" className={input} />
      <input name="provider_name" defaultValue={offer?.provider_name ?? ''} placeholder="Anbieter (intern, nie öffentlich)" className={`${input} sm:col-span-2`} />
      <textarea name="description" rows={2} defaultValue={offer?.description ?? ''} placeholder="Kurzbeschreibung (öffentlich)" className={`${input} sm:col-span-2`} />
      <textarea
        name="gallery"
        rows={2}
        defaultValue={(offer?.gallery ?? []).join('\n')}
        placeholder="Weitere Bild-URLs für die Galerie (eine pro Zeile, öffentlich)"
        className={`${input} sm:col-span-2`}
      />

      {sheet ? (
        sheet.map((s) => (
          <fieldset key={s.title} className="grid gap-3 rounded-xl border border-slate-200 p-3 sm:col-span-2 sm:grid-cols-2">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Datenblatt · {s.title}</legend>
            {s.fields.map((f) => (
              <label key={`${category}-${f.key}`} className="block">
                <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  {f.label}
                  {f.level === 'public' ? (
                    <span className="rounded bg-emerald-50 px-1 text-[10px] font-semibold text-emerald-700">öffentlich</span>
                  ) : f.level === 'inquiry' ? (
                    <span className="rounded bg-slate-100 px-1 text-[10px] font-semibold text-slate-500">🔒 nach Anfrage</span>
                  ) : (
                    <span className="rounded bg-amber-50 px-1 text-[10px] font-semibold text-amber-700">🤝 nur persönlich, nie online</span>
                  )}
                </span>
                <input name={`ds_${f.key}`} defaultValue={valueOf(f.key)} placeholder={f.placeholder} className={input} />
              </label>
            ))}
          </fieldset>
        ))
      ) : (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 sm:col-span-2">
          Für diese Kategorie gibt es noch kein festes Datenblatt. Nutzen Sie die freien Kennzahlen unten.
        </p>
      )}

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 sm:col-span-2">Nur nach Anfrage 🔒</p>
      <textarea name="details" rows={5} defaultValue={offer?.details ?? ''} placeholder="Ausführliche Beschreibung, Betreibermodell, Ablauf" className={`${input} sm:col-span-2`} />
      <textarea
        name="facts"
        rows={3}
        defaultValue={freeFacts.map((f) => `${f.label}: ${f.value}`).join('\n')}
        placeholder={'Weitere Kennzahlen, eine pro Zeile „Bezeichnung: Wert“, z. B.\nRückkaufoption: ja'}
        className={input}
      />
      <textarea
        name="documents"
        rows={3}
        defaultValue={(offer?.documents ?? []).map((d) => `${d.label} | ${d.url}`).join('\n')}
        placeholder={'Unterlagen nach Anfrage – nur ohne Anbieter-Logo/-Namen! Eine pro Zeile „Bezeichnung | URL“, z. B.\nExposé (neutral) | https://…/expose.pdf'}
        className={input}
      />
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" name="is_published" defaultChecked={offer?.is_published ?? false} className="h-4 w-4 accent-emerald-600" />
        Veröffentlicht (nur mit Freigabe des Anbieters, keine erfundenen Zahlen)
      </label>
      <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 sm:justify-self-end">
        {offer ? 'Speichern' : 'Anlegen'}
      </button>
    </form>
  )
}
