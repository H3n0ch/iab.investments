import { activatePartner, rejectPartner } from '@/lib/actions/admin'
import { requireAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import type { TaxAdvisorPartner } from '@/lib/supabase/types'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://iab.investments'

const BADGE: Record<TaxAdvisorPartner['status'], string> = {
  neu: 'border-amber-200 bg-amber-50 text-amber-700',
  aktiv: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  abgelehnt: 'border-slate-200 bg-slate-50 text-slate-500',
}

export default async function AdminPartnerPage() {
  await requireAdmin()
  const supabase = getSupabaseAdmin()
  const [{ data, error }, { data: leadRows }] = await Promise.all([
    supabase.from('tax_advisor_partners').select('*').order('created_at', { ascending: false }),
    supabase.from('leads').select('utm_source').like('utm_source', 'partner:%'),
  ])

  const partners = (data ?? []) as TaxAdvisorPartner[]
  const leadCount: Record<string, number> = {}
  for (const r of (leadRows ?? []) as { utm_source: string }[]) {
    const code = r.utm_source.slice('partner:'.length)
    leadCount[code] = (leadCount[code] ?? 0) + 1
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-lg font-bold text-slate-900">Steuerberater-Partner</h1>
        <p className="mt-1 text-sm text-slate-500">
          Anmeldungen über /steuerberater. Beim Freischalten wird ein Empfehlungslink erzeugt und an die Kanzlei gemailt. Leads über den
          Link tragen im CRM die Quelle „partner:Code“.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">Partner konnten nicht geladen werden: {error.message}</p>}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {partners.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-400">Noch keine Anmeldungen.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {partners.map((p) => (
              <li key={p.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-4">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">
                    {p.firm}
                    {p.city && <span className="font-normal text-slate-400"> · {p.city}</span>}
                  </p>
                  <p className="text-xs text-slate-500">
                    {p.contact_name} · <a href={`mailto:${p.email}`} className="underline">{p.email}</a>
                    {p.phone && <> · {p.phone}</>}
                    {' · '}
                    {new Date(p.created_at).toLocaleDateString('de-DE')}
                  </p>
                  {p.message && <p className="mt-2 whitespace-pre-line rounded-lg bg-slate-50 p-2.5 text-sm text-slate-600">{p.message}</p>}
                  {p.code && (
                    <p className="mt-2 text-xs text-slate-500">
                      Link: <code className="rounded bg-slate-100 px-1.5 py-0.5">{`${APP_URL}/empfehlung/${p.code}`}</code> ·{' '}
                      <strong className="text-slate-900">{leadCount[p.code] ?? 0}</strong> Leads
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${BADGE[p.status]}`}>{p.status}</span>
                  {p.status !== 'aktiv' && (
                    <form action={activatePartner.bind(null, p.id)}>
                      <button type="submit" className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500">
                        Freischalten
                      </button>
                    </form>
                  )}
                  {p.status !== 'abgelehnt' && (
                    <form action={rejectPartner.bind(null, p.id)}>
                      <button type="submit" className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                        {p.status === 'aktiv' ? 'Deaktivieren' : 'Ablehnen'}
                      </button>
                    </form>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
