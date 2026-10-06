import type { EmailOtpType } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { safeRedirectPath } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

// Target of the links we send via Resend (token_hash from auth.admin.generateLink): password reset and
// the magic link from an offer inquiry. Verifying server-side sets the session cookie.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = safeRedirectPath(searchParams.get('next'))

  if (tokenHash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }
  if (type === 'recovery') {
    const err = encodeURIComponent('Der Link ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen an.')
    return NextResponse.redirect(`${origin}/passwort-vergessen?error=${err}`)
  }
  const error = 'Der Link ist abgelaufen. Bitte melden Sie sich an oder legen Sie über „Passwort vergessen“ ein Passwort fest.'
  return NextResponse.redirect(`${origin}/login?${new URLSearchParams({ error, redirectTo: next })}`)
}
