import type { NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

// Double opt-in link from sendLeadDoi. Marks the lead as confirmed (= sellable) and clears the token,
// so a second click or a guessed token does nothing.
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') ?? ''
  const done = new URL('/anfrage/bestaetigt', request.nextUrl.origin)

  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) {
    done.searchParams.set('status', 'ungueltig')
    return Response.redirect(done, 303)
  }

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('leads')
      .update({ doi_confirmed_at: new Date().toISOString(), doi_token: null })
      .eq('doi_token', token)
      .select('id, lead_type')
      .maybeSingle()
    if (error) throw error
    if (!data) done.searchParams.set('status', 'ungueltig')
    else if (data.lead_type === 'flaeche') done.searchParams.set('typ', 'flaeche')
  } catch (e) {
    console.error('doi confirm failed', e)
    done.searchParams.set('status', 'fehler')
  }
  return Response.redirect(done, 303)
}
