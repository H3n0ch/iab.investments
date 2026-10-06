import 'server-only'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

type AccountData = { email: string; full_name: string; phone: string | null; company: string | null }

/**
 * Account in the background for an offer inquiry: creates the user if needed (generateLink does that for
 * `magiclink`, the handle_new_user trigger fills the profile) and returns a one-time link that signs in
 * via /auth/confirm and opens `next`. Null if Supabase refuses – the inquiry itself is stored regardless.
 */
export async function magicAccessLink(a: AccountData, next: string): Promise<string | null> {
  const { data, error } = await getSupabaseAdmin().auth.admin.generateLink({
    type: 'magiclink',
    email: a.email,
    options: { data: { full_name: a.full_name, phone: a.phone ?? '', company: a.company ?? '' } },
  })
  const token = data?.properties?.hashed_token
  if (error || !token) {
    console.error('magic link failed', error)
    return null
  }
  // New users get a 'signup' token, existing ones a 'magiclink' token – verifyOtp needs the matching type
  const type: EmailOtpType = data.properties.verification_type === 'signup' ? 'signup' : 'magiclink'
  return `${APP_URL}/auth/confirm?${new URLSearchParams({ token_hash: token, type, next })}`
}

/** Fallback without Resend: Supabase's own mailer sends the sign-in link (PKCE code → /auth/callback). */
export async function sendSupabaseMagicLink(a: AccountData, next: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email: a.email,
    options: {
      shouldCreateUser: true,
      data: { full_name: a.full_name, phone: a.phone ?? '', company: a.company ?? '' },
      emailRedirectTo: `${APP_URL}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  })
  if (error) console.error('supabase magic link failed', error)
}
