import { requireAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

// Google Ads offline conversion import (CSV). Cookie-free alternative to a conversion tag:
// every confirmed (double opt-in) lead that came from an ad click (gclid) counts as one conversion.
// Upload in Google Ads under Ziele → Conversions → Uploads; the conversion name must match the one created there.

const CONVERSION_NAME = process.env.GOOGLE_ADS_CONVERSION_NAME ?? 'IAB Lead bestätigt'

export async function GET(request: Request) {
  await requireAdmin()
  const days = Math.min(Math.max(Number(new URL(request.url).searchParams.get('tage')) || 90, 1), 90)
  const from = new Date(Date.now() - days * 86400000).toISOString()

  const { data, error } = await getSupabaseAdmin()
    .from('leads')
    .select('gclid, doi_confirmed_at')
    .not('gclid', 'is', null)
    .not('doi_confirmed_at', 'is', null)
    .gte('doi_confirmed_at', from)
    .order('doi_confirmed_at', { ascending: true })
  if (error) return new Response(`Export fehlgeschlagen: ${error.message}`, { status: 500 })

  // Google expects "yyyy-mm-dd hh:mm:ss+zzzz"
  const time = (iso: string) => iso.replace('T', ' ').replace(/\.\d+/, '').replace('Z', '+0000')
  const rows = (data ?? []).map((r) => [r.gclid, CONVERSION_NAME, time(r.doi_confirmed_at!), '', 'EUR'])
  const csv = [['Google Click ID', 'Conversion Name', 'Conversion Time', 'Conversion Value', 'Conversion Currency'], ...rows]
    .map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n')

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="ads-conversions-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
