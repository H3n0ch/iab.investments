import { LeadsCRM, type LeadRow, type OfferView } from '@/components/admin/LeadsCRM'
import { requireAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import type { LeadActivity } from '@/lib/supabase/types'

function daysAgo(n: number): number {
  return Date.now() - n * 86400000
}

export default async function AdminLeadsPage({ searchParams }: PageProps<'/admin/leads'>) {
  await requireAdmin()
  const { id } = await searchParams
  const supabase = getSupabaseAdmin()

  const [{ data: leads, error }, { data: activities }] = await Promise.all([
    supabase
      .from('leads')
      .select('*, lead_categories(categories(slug, name))')
      .order('created_at', { ascending: false })
      .limit(500),
    supabase.from('lead_activities').select('*').order('created_at', { ascending: false }).limit(2000),
  ])

  if (error) {
    return <p className="p-6 text-sm text-red-600">Leads konnten nicht geladen werden: {error.message}</p>
  }

  const rows = (leads ?? []) as LeadRow[]

  // Which offers did registered leads look at? Most viewed first.
  const userIds = [...new Set(rows.map((l) => l.user_id).filter((x): x is string => Boolean(x)))]
  const { data: viewRows } = userIds.length
    ? await supabase
        .from('offer_views')
        .select('user_id, offer_id, view_count, last_viewed_at, offers(title, categories(slug))')
        .in('user_id', userIds)
        .order('view_count', { ascending: false })
    : { data: [] }
  const views: Record<string, OfferView[]> = {}
  for (const v of (viewRows ?? []) as unknown as {
    user_id: string
    offer_id: string
    view_count: number
    last_viewed_at: string
    offers: { title: string; categories: { slug: string } | null } | null
  }[]) {
    if (!v.offers?.categories) continue
    ;(views[v.user_id] ??= []).push({
      offer_id: v.offer_id,
      title: v.offers.title,
      slug: v.offers.categories.slug,
      view_count: v.view_count,
      last_viewed_at: v.last_viewed_at,
    })
  }
  const startOfWeek = daysAgo(7)
  const stats = [
    { label: 'Leads gesamt', value: rows.length, color: 'text-slate-900' },
    { label: 'Letzte 7 Tage', value: rows.filter((l) => new Date(l.created_at).getTime() > startOfWeek).length, color: 'text-emerald-600' },
    { label: 'Neu', value: rows.filter((l) => l.status === 'neu').length, color: 'text-blue-600' },
    { label: 'Weitergegeben', value: rows.filter((l) => l.status === 'weitergegeben').length, color: 'text-violet-600' },
  ]

  return (
    <LeadsCRM
      leads={rows}
      activities={(activities ?? []) as LeadActivity[]}
      stats={stats}
      views={views}
      initialId={typeof id === 'string' ? id : undefined}
    />
  )
}
