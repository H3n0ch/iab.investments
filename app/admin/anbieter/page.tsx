import Link from 'next/link'
import { approveSubmission, rejectSubmission } from '@/lib/actions/admin'
import { requireAdmin } from '@/lib/admin-auth'
import { CATEGORIES, formatEuro } from '@/lib/categories'
import { COUNTRIES } from '@/lib/countries'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import type { ProviderSubmission, SubmissionStatus } from '@/lib/supabase/types'

const input = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500'

const BADGE: Record<SubmissionStatus, string> = {
  neu: 'border-amber-200 bg-amber-50 text-amber-700',
  freigeschaltet: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  abgelehnt: 'border-slate-200 bg-slate-50 text-slate-500',
}

export default async function AdminProvidersPage() {
  await requireAdmin()
  const { data, error } = await getSupabaseAdmin()
    .from('provider_submissions')
    .select('*')
    .order('created_at', { ascending: false })

  const subs = (data ?? []) as ProviderSubmission[]
  const open = subs.filter((s) => s.status === 'neu')
  const done = subs.filter((s) => s.status !== 'neu')

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div>
        <h1 className="text-lg font-bold text-slate-900">Anbieter-Einreichungen</h1>
        <p className="mt-1 text-sm text-slate-500">
          Eingereicht über <Link href="/anbieter" className="underline">/anbieter</Link>. Beim Freischalten wird ein veröffentlichtes Angebot angelegt.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">Einreichungen konnten nicht geladen werden: {error.message}</p>}

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Offen ({open.length})</h2>
        {open.length === 0 && <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400">Keine offenen Einreichungen.</p>}
        {open.map((s) => (
          <article key={s.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">{s.title}</p>
                <p className="text-xs text-slate-500">
                  {s.company} · {s.contact_name} · <a href={`mailto:${s.email}`} className="underline">{s.email}</a>
                  {s.phone && <> · {s.phone}</>}
                  {s.website && (
                    <>
                      {' · '}
                      <a href={s.website} target="_blank" rel="noopener noreferrer" className="underline">Website</a>
                    </>
                  )}
                </p>
              </div>
              <span className="text-xs text-slate-400">{new Date(s.created_at).toLocaleDateString('de-DE')}</span>
            </div>
            <p className="mt-3 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{s.description}</p>
            {s.documents_url && (
              <a href={s.documents_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-emerald-700 underline">
                Unterlagen öffnen
              </a>
            )}

            <form action={approveSubmission.bind(null, s.id)} className="mt-4 grid gap-3 sm:grid-cols-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 sm:col-span-2">Angebot vor dem Freischalten anpassen</p>
              <select name="category" required defaultValue={CATEGORIES.some((c) => c.slug === s.category_slug) ? s.category_slug! : ''} className={input}>
                <option value="" disabled>
                  Kategorie wählen *
                </option>
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
              <input name="title" required defaultValue={s.title} placeholder="Titel *" className={input} />
              <input name="location" defaultValue={s.location ?? ''} placeholder="Standort" className={input} />
              <select name="country" defaultValue={s.country ?? 'DE'} className={input}>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                name="min_investment"
                defaultValue={s.min_investment_cents != null ? String(s.min_investment_cents / 100) : ''}
                placeholder="Mindestinvestment in € netto"
                className={input}
              />
              <input name="expected_yield" defaultValue={s.expected_yield ?? ''} placeholder="Ertrag laut Anbieter" className={input} />
              <input name="availability" defaultValue={s.availability ?? ''} placeholder="Verfügbarkeit" className={input} />
              <input name="image_url" defaultValue={s.image_url ?? ''} placeholder="Bild-URL" className={`${input} sm:col-span-2`} />
              <textarea
                name="description"
                rows={2}
                defaultValue={s.description.slice(0, 300)}
                placeholder="Kurzbeschreibung (öffentlich)"
                className={`${input} sm:col-span-2`}
              />
              <input name="admin_notes" placeholder="Interne Notiz (optional)" className={`${input} sm:col-span-2`} />
              <p className="text-xs text-slate-400 sm:col-span-2">
                Die vollständige Beschreibung wird als Detailtext (nur für registrierte Nutzer) übernommen, der Firmenname als interner Anbieter.
              </p>
              <div className="flex flex-wrap justify-end gap-2 sm:col-span-2">
                <button
                  type="submit"
                  formAction={rejectSubmission.bind(null, s.id)}
                  formNoValidate
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Ablehnen
                </button>
                <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500">
                  Freischalten
                </button>
              </div>
            </form>
          </article>
        ))}
      </section>

      {done.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Bearbeitet</h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                {done.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{s.title}</p>
                      <p className="text-xs text-slate-400">
                        {[s.company, s.min_investment_cents != null ? `ab ${formatEuro(s.min_investment_cents / 100)} netto` : null, s.admin_notes]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${BADGE[s.status]}`}>{s.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
