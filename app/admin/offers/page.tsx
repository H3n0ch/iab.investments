import { createOffer, deleteOffer, setOfferPublished } from '@/lib/actions/admin'
import { requireAdmin } from '@/lib/admin-auth'
import { CATEGORIES, formatEuro } from '@/lib/categories'
import { COUNTRIES } from '@/lib/countries'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import type { Offer } from '@/lib/supabase/types'

const input = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500'

export default async function AdminOffersPage() {
  await requireAdmin()
  const { data, error } = await getSupabaseAdmin()
    .from('offers')
    .select('*, categories(slug, name)')
    .order('created_at', { ascending: false })

  const offers = (data ?? []) as (Offer & { categories: { slug: string; name: string } | null })[]

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <h1 className="text-lg font-bold text-slate-900">Angebote</h1>

      <form action={createOffer} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
        <p className="text-sm font-semibold text-slate-900 sm:col-span-2">Neues Angebot</p>
        <select name="category" required className={input}>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
        <input name="title" required placeholder="Titel *" className={input} />
        <input name="location" placeholder="Standort, z. B. Brandenburg" className={input} />
        <select name="country" defaultValue={'DE'} className={input}>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
        <input name="min_investment" inputMode="decimal" placeholder="Mindestinvestment in € (z. B. 25000)" className={input} />
        <input name="expected_yield" placeholder='Ertrag, z. B. "ca. 6 % p.a. laut Anbieter"' className={input} />
        <input name="availability" placeholder="Verfügbarkeit, z. B. Lieferung bis Dez." className={input} />
        <input name="image_url" type="url" placeholder="Bild-URL (optional)" className={input} />
        <input name="provider_name" placeholder="Anbieter (intern, nicht öffentlich)" className={input} />
        <textarea name="description" rows={2} placeholder="Kurzbeschreibung (öffentlich)" className={`${input} sm:col-span-2`} />
        <textarea name="gallery" rows={2} placeholder="Weitere Bild-URLs für die Galerie (eine pro Zeile, öffentlich)" className={`${input} sm:col-span-2`} />
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 sm:col-span-2">Nur für registrierte Nutzer 🔒</p>
        <textarea name="details" rows={5} placeholder="Ausführliche Beschreibung" className={`${input} sm:col-span-2`} />
        <textarea
          name="facts"
          rows={4}
          placeholder={'Kennzahlen, eine pro Zeile im Format „Bezeichnung: Wert“, z. B.\nVertragslaufzeit: 10 Jahre\nRückkaufoption: ja'}
          className={input}
        />
        <textarea
          name="documents"
          rows={4}
          placeholder={'Unterlagen, eine pro Zeile im Format „Bezeichnung | URL“, z. B.\nExposé | https://…/expose.pdf'}
          className={input}
        />
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" name="is_published" className="h-4 w-4 accent-emerald-600" /> Sofort veröffentlichen
        </label>
        <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 sm:justify-self-end">
          Anlegen
        </button>
      </form>

      {error && <p className="text-sm text-red-600">Angebote konnten nicht geladen werden: {error.message}</p>}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {offers.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-400">Noch keine Angebote.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500">
              <tr>
                <th className="px-4 py-2.5 font-medium">Angebot</th>
                <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Kategorie</th>
                <th className="hidden px-4 py-2.5 font-medium md:table-cell">Anbieter</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {offers.map((o) => {
                const slug = o.categories?.slug ?? ''
                return (
                  <tr key={o.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{o.title}</p>
                      <p className="text-xs text-slate-400">
                        {[o.location, o.min_investment_cents != null ? `ab ${formatEuro(o.min_investment_cents / 100)}` : null].filter(Boolean).join(' · ')}
                      </p>
                    </td>
                    <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">{o.categories?.name}</td>
                    <td className="hidden px-4 py-3 text-slate-600 md:table-cell">{o.provider_name ?? '–'}</td>
                    <td className="px-4 py-3">
                      <form action={setOfferPublished.bind(null, o.id, slug, !o.is_published)}>
                        <button
                          type="submit"
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                            o.is_published ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-500'
                          }`}
                          title="Status umschalten"
                        >
                          {o.is_published ? 'Online' : 'Entwurf'}
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <form action={deleteOffer.bind(null, o.id, slug)}>
                        <button type="submit" className="text-xs text-red-500 hover:underline">
                          Löschen
                        </button>
                      </form>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
