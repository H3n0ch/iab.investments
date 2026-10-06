import 'server-only'
import { redirect } from 'next/navigation'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const allow = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return allow.includes(email.toLowerCase())
}

/** Returns the admin's email or redirects. Use in admin pages and server actions. */
export async function requireAdmin(): Promise<string> {
  if (!isSupabaseConfigured) {
    redirect(`/login?error=${encodeURIComponent('Supabase ist noch nicht konfiguriert (.env.local).')}`)
  }
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/admin')
  if (!isAdminEmail(user.email)) redirect('/')
  return user.email!
}
