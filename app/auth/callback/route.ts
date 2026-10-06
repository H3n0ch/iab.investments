import { NextResponse, type NextRequest } from 'next/server'
import { safeRedirectPath } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

// Target of the confirmation link in the sign-up e-mail (adapted from TinyMarket)
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = safeRedirectPath(searchParams.get('next'))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }
  const err = encodeURIComponent('Der Bestätigungslink ist ungültig oder abgelaufen. Bitte melden Sie sich an.')
  return NextResponse.redirect(`${origin}/login?error=${err}`)
}
