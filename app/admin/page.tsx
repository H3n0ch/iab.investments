import Link from 'next/link'
import { requireAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import type { LeadStatus } from '@/lib/supabase/types'

// Overview adapted from TinyMarket's app/admin/dashboard: key figures, lead sources, most viewed offers, newest leads.

type LeadLite = {
  id: string
  name: string
  source: string | null
  status: LeadStatus
  follow_up_at: string | null
  created_at: string
  landing_path: string | null
  utm_source: string | null
  utm_medium: string | null
  gclid: string | null
  consent_share: boolean
  doi_confirmed_at: string | null
  lead_categories: { categories: { name: string } | null }[] | null
}

const SOURCE_GROUPS = [
  { label: 'Angebotsanfragen', match: (s: string | null) => !['registrierung', 'kontakt', 'rechner', 'frist', 'ratgeber', 'flaeche'].includes(s ?? '') },
  { label: '🔥 Frist-Leads', match: (s: string | null) => s === 'frist' },
  { label: 'Ratgeber-Anfragen', match: (s: string | null) => s === 'ratgeber' },
  { label: '🌾 Flächen-Leads', match: (s: string | null) => s === 'flaeche' },
  { label: 'Registrierungen', match: (s: string | null) => s === 'registrierung' },
  { label: 'Kontaktanfragen', match: (s: string | null) => s === 'kontakt' },
  { label: 'Rechner-Berichte', match: (s: string | null) => s === 'rechner' },
]

const SOURCE_BADGES: Record<string, { label: string; color: string }> = {
  registrierung: { label: 'Registriert', color: 'border-sky-200 bg-sky-50 text-sky-700' },
  kontakt: { label: 'Kontaktanfrage', color: 'border-amber-200 bg-amber-50 text-amber-700' },
  rechner: { label: 'IAB-Rechner', color: 'border-violet-200 bg-violet-50 text-violet-700' },
  frist: { label: '🔥 Frist-Lead', color: 'border-red-200 bg-red-50 text-red-700' },
}
const REQUEST_BADGE = { label: 'Anfrage', color: 'border-emerald-200 bg-emerald-50 text-emerald-700' }

function since(days: number): number {
  return Date.now() - days * 86400000
}

/** Traffic channel of a lead – the basis for the 100-leads mix (organic / paid / partner) */
function channel(l: LeadLite): 'Paid' | 'Partner' | 'Kampagne' | 'Organisch' {
  if (l.gclid || /^(cpc|ppc|paid)/i.test(l.utm_medium ?? '')) return 'Paid'
  if (l.utm_source?.startsWith('partner:')) return 'Partner'
  if (l.utm_source) return 'Kampagne'
  return 'Organisch'
}
const CHANNELS = ['Organisch', 'Paid', 'Partner', 'Kampagne'] as const

type Agg = { leads: number; doi: number }
function aggregate(rows: LeadLite[], key: (l: LeadLite) => string[]): [string, Agg][] {
  const m = new Map<string, Agg>()
  for (const l of rows) {
    for (const k of key(l)) {
      const e = m.get(k) ?? { leads: 0, doi: 0 }
      e.leads += 1
      if (l.doi_confirmed_at) e.doi += 1
      m.set(k, e)
    }
  }
  return [...m.entries()].sort((a, b) => b[1].leads - a[1].leads)
}

export default async function AdminDashboard() {
  await requireAdmin()
  const supabase = getSupabaseAdmin()

  const [leadsRes, usersRes, offersRes, providersRes, partnersRes, viewsRes] = await Promise.all([
    supabase
      .from('leads')
      .select('id, name, source, status, follow_up_at, created_at, landing_path, utm_source, utm_medium, gclid, consent_share, doi_confirmed_at, lead_categories(categories(name))')
      .order('created_at', { ascending: false })
      .limit(5000),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('offers').select('id', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('provider_submissions').select('id', { count: 'exact', head: true }).eq('status', 'neu'),
    supabase.from('tax_advisor_partners').select('id', { count: 'exact', head: true }).eq('status', 'neu'),
    supabase.from('offer_views').select('offer_id, user_id, view_count, offers(title, categories(slug))').limit(5000),
  ])

  if (leadsRes.error) {
    return <p className="p-6 text-sm text-red-600">Daten konnten nicht geladen werden: {leadsRes.error.message}</p>
  }

  const leads = (leadsRes.data ?? []) as unknown as LeadLite[]
  const week = since(7)
  const month = since(30)
  const endOfToday = new Date().setHours(23, 59, 59, 999)
  const dueFollowUps = leads.filter((l) => l.follow_up_at && new Date(l.follow_up_at).getTime() <= endOfToday).length
  const newLeads = leads.filter((l) => l.status === 'neu').length
  const lastWeek = leads.filter((l) => new Date(l.created_at).getTime() > week).length

  const tiles = [
    { label: 'Neue Leads (unbearbeitet)', value: newLeads, color: newLeads ? 'text-blue-600' : 'text-slate-400', href: '/admin/leads' },
    { label: 'Wiedervorlagen fällig', value: dueFollowUps, color: dueFollowUps ? 'text-red-600' : 'text-slate-400', href: '/admin/leads' },
    { label: 'Leads letzte 7 Tage', value: lastWeek, color: 'text-emerald-600', href: '/admin/leads' },
    { label: 'Registrierte Nutzer', value: usersRes.count ?? 0, color: 'text-slate-900', href: null },
    { label: 'Veröffentlichte Angebote', value: offersRes.count ?? 0, color: 'text-slate-900', href: '/admin/offers' },
    { label: 'Anbieter zu prüfen', value: providersRes.count ?? 0, color: providersRes.count ? 'text-amber-600' : 'text-slate-400', href: '/admin/anbieter' },
    { label: 'Steuerberater zu prüfen', value: partnersRes.count ?? 0, color: partnersRes.count ? 'text-amber-600' : 'text-slate-400', href: '/admin/partner' },
  ]

  const sourceRows = SOURCE_GROUPS.map((g) => {
    const all = leads.filter((l) => g.match(l.source))
    return {
      label: g.label,
      week: all.filter((l) => new Date(l.created_at).getTime() > week).length,
      month: all.filter((l) => new Date(l.created_at).getTime() > month).length,
      total: all.length,
    }
  })

  // Most viewed offers: total views and distinct registered viewers
  const byOffer = new Map<string, { title: string; slug: string; views: number; users: number }>()
  for (const v of (viewsRes.data ?? []) as unknown as {
    offer_id: string
    view_count: number
    offers: { title: string; categories: { slug: string } | null } | null
  }[]) {
    if (!v.offers?.categories) continue
    const e = byOffer.get(v.offer_id) ?? { title: v.offers.title, slug: v.offers.categories.slug, views: 0, users: 0 }
    e.views += v.view_count
    e.users += 1
    byOffer.set(v.offer_id, e)
  }
  const topOffers = [...byOffer.entries()].sort((a, b) => b[1].views - a[1].views).slice(0, 5)

  // Conversion per page and category (inquiries only, last 30 days). Visitors per page: Plausible.
  const inquiries30 = leads.filter((l) => l.consent_share && new Date(l.created_at).getTime() > month)
  const byPage = aggregate(inquiries30, (l) => [l.landing_path ?? '(unbekannt)']).slice(0, 12)
  const byCategory = aggregate(inquiries30, (l) => (l.lead_categories ?? []).map((c) => c.categories?.name ?? '').filter(Boolean))

  // Channel mix per month (last 6 months) – organic vs. paid vs. tax advisor partners
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    return d.toISOString().slice(0, 7)
  })
  const inquiries = leads.filter((l) => l.consent_share)
  const mix = months.map((m) => {
    const inMonth = inquiries.filter((l) => l.created_at.slice(0, 7) === m)
    return {
      month: m,
      total: inMonth.length,
      doi: inMonth.filter((l) => l.doi_confirmed_at).length,
      byChannel: Object.fromEntries(CHANNELS.map((c) => [c, inMonth.filter((l) => channel(l) === c).length])) as Record<(typeof CHANNELS)[number], number>,
    }
  })

  // Tax advisor partners: leads per referral code (basis for the tipster commission)
  const byPartner = aggregate(
    inquiries.filter((l) => l.utm_source?.startsWith('partner:')),
    (l) => [l.utm_source!.slice('partner:'.length)],
  )
  const rate = (a: Agg) => (a.leads ? `${Math.round((a.doi / a.leads) * 100)} %` : '–')

  const card = 'rounded-2xl border border-slate-200 bg-white shadow-sm'

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <h1 className="text-lg font-bold text-slate-900">Übersicht</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {tiles.map((t) => {
          const inner = (
            <>
              <p className={`text-2xl font-extrabold tabular-nums ${t.color}`}>{t.value}</p>
              <p className="mt-0.5 text-xs text-slate-500">{t.label}</p>
            </>
          )
          return t.href ? (
            <Link key={t.label} href={t.href} className={`${card} p-4 transition-colors hover:border-slate-300`}>
              {inner}
            </Link>
          ) : (
            <div key={t.label} className={`${card} p-4`}>
              {inner}
            </div>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className={card}>
          <h2 className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">Leads nach Quelle</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400">
                <th className="px-5 py-2 font-medium">Quelle</th>
                <th className="px-3 py-2 text-right font-medium">7 Tage</th>
                <th className="px-3 py-2 text-right font-medium">30 Tage</th>
                <th className="px-5 py-2 text-right font-medium">Gesamt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sourceRows.map((r) => (
                <tr key={r.label}>
                  <td className="px-5 py-2.5 font-medium text-slate-800">{r.label}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">{r.week}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">{r.month}</td>
                  <td className="px-5 py-2.5 text-right font-semibold tabular-nums text-slate-900">{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className={card}>
          <h2 className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">👁 Meistgesehene Angebote</h2>
          {topOffers.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm text-slate-400">Noch keine Aufrufe von registrierten Nutzern.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {topOffers.map(([id, o]) => (
                <li key={id} className="flex items-center gap-3 px-5 py-2.5 text-sm">
                  <a href={`/${o.slug}/${id}`} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate font-medium text-blue-600 hover:underline">
                    {o.title}
                  </a>
                  <span className="shrink-0 text-xs text-slate-500">{o.users} Nutzer</span>
                  <span className="w-16 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-700">{o.views} Aufrufe</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className={card}>
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-900">📈 Anfragen pro Monat nach Kanal</h2>
          <p className="text-xs text-slate-400">
            Ziel: 100 Leads/Monat. Besucherzahlen: Plausible.{' '}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- CSV download from a route handler, not a page */}
            <a href="/admin/export/ads-conversions" className="font-semibold text-emerald-700 hover:underline">
              Google-Ads-Conversions (CSV)
            </a>
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400">
                <th className="px-5 py-2 font-medium">Monat</th>
                {CHANNELS.map((c) => (
                  <th key={c} className="px-3 py-2 text-right font-medium">{c}</th>
                ))}
                <th className="px-3 py-2 text-right font-medium">Gesamt</th>
                <th className="px-5 py-2 text-right font-medium">DOI ✓</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 tabular-nums">
              {mix.map((r) => (
                <tr key={r.month}>
                  <td className="px-5 py-2.5 font-medium text-slate-800">{r.month}</td>
                  {CHANNELS.map((c) => (
                    <td key={c} className="px-3 py-2.5 text-right text-slate-700">{r.byChannel[c]}</td>
                  ))}
                  <td className="px-3 py-2.5 text-right font-semibold text-slate-900">{r.total}</td>
                  <td className="px-5 py-2.5 text-right text-emerald-700">{r.doi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {[
          { title: 'Anfragen nach Seite (30 Tage)', rows: byPage, empty: 'Noch keine Anfragen in den letzten 30 Tagen.' },
          { title: 'Anfragen nach Kategorie (30 Tage)', rows: byCategory, empty: 'Noch keine Anfragen in den letzten 30 Tagen.' },
          { title: 'Steuerberater-Partner (gesamt)', rows: byPartner, empty: 'Noch keine Anfragen über Partner-Links.' },
        ].map((t) => (
          <section key={t.title} className={card}>
            <h2 className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">{t.title}</h2>
            {t.rows.length === 0 ? (
              <p className="px-5 py-6 text-center text-sm text-slate-400">{t.empty}</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-400">
                    <th className="px-5 py-2 font-medium">&nbsp;</th>
                    <th className="px-3 py-2 text-right font-medium">Anfragen</th>
                    <th className="px-5 py-2 text-right font-medium">DOI-Quote</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 tabular-nums">
                  {t.rows.map(([k, a]) => (
                    <tr key={k}>
                      <td className="max-w-0 truncate px-5 py-2.5 font-medium text-slate-800" title={k}>{k}</td>
                      <td className="px-3 py-2.5 text-right text-slate-700">{a.leads}</td>
                      <td className="px-5 py-2.5 text-right text-slate-700">{rate(a)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        ))}
      </div>

      <section className={card}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-900">🔔 Neueste Leads</h2>
          <Link href="/admin/leads" className="text-xs font-semibold text-emerald-700 hover:underline">
            Zum CRM →
          </Link>
        </div>
        {leads.length === 0 ? (
          <p className="px-5 py-6 text-center text-sm text-slate-400">Noch keine Leads.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {leads.slice(0, 8).map((l) => {
              const badge = (l.source && SOURCE_BADGES[l.source]) || REQUEST_BADGE
              return (
                <li key={l.id}>
                  <Link href={`/admin/leads?id=${l.id}`} className="flex items-center gap-3 px-5 py-2.5 text-sm hover:bg-slate-50">
                    <span className="min-w-0 flex-1 truncate font-medium text-slate-800">{l.name}</span>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${badge.color}`}>{badge.label}</span>
                    <span className="w-20 shrink-0 text-right text-xs text-slate-400">
                      {new Date(l.created_at).toLocaleDateString('de-DE')}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
