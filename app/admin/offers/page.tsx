import Link from 'next/link'
import { OfferForm, type EditableOffer } from '@/components/admin/OfferForm'
import { deleteOffer, setOfferPublished } from '@/lib/actions/admin'
import { requireAdmin } from '@/lib/admin-auth'
import { formatEuro } from '@/lib/categories'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export default async function AdminOffersPage({ searchParams }: PageProps<'/admin/offers'>) {
  await requireAdmin()
  const { edit } = await searchParams
  const { data, error } = await getSupabaseAdmin()
    .from('offers')
    .select('*, categories(slug, name)')
    .order('created_at', { ascending: false })

  const offers = (data ?? []) as EditableOffer[]
  const editing = typeof edit === 'string' ? offers.find((o) => o.id === edit) : undefined

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <h1 className="text-lg font-bold text-slate-900">Angebote</h1>

      {/* Keyed: switching between offers must reset the chosen category and its data sheet fields */}
      <OfferForm key={editing?.id ?? 'new'} offer={editing} />

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
                    <td className="space-x-3 px-4 py-3 text-right">
                      <Link href={`/admin/offers?edit=${o.id}`} className="text-xs font-semibold text-slate-700 hover:underline">
                        Bearbeiten
                      </Link>
                      <form action={deleteOffer.bind(null, o.id, slug)} className="inline">
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
