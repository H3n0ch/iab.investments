import 'server-only'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import type { Profile } from '@/lib/supabase/types'

export type CurrentUser = { id: string; email: string; profile: Profile | null }

/** Signed-in user (investor or admin) or null. Safe to call before Supabase is configured. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!isSupabaseConfigured) return null
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('id, full_name, phone, company').eq('id', user.id).maybeSingle()
  return { id: user.id, email: user.email ?? '', profile: (profile as Profile | null) ?? null }
}

/** Only allow redirects to internal paths (prevents open redirects via ?redirectTo=) */
export function safeRedirectPath(value: unknown, fallback = '/'): string {
  const v = typeof value === 'string' ? value : ''
  return v.startsWith('/') && !v.startsWith('//') ? v : fallback
}
