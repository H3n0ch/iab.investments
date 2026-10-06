'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { isAdminEmail } from '@/lib/admin-auth'
import { safeRedirectPath } from '@/lib/auth'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { CONSENT_VERSION } from '@/lib/consent'
import { sendLeadAdminNotification, sendPasswordReset } from '@/lib/email'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const NOT_CONFIGURED = 'Konten sind noch nicht eingerichtet (Supabase fehlt in .env.local).'

function back(path: string, params: Record<string, string>): never {
  redirect(`${path}?${new URLSearchParams(params)}`)
}

export async function signIn(formData: FormData) {
  const redirectTo = safeRedirectPath(formData.get('redirectTo'))
  if (!isSupabaseConfigured) back('/login', { error: NOT_CONFIGURED, redirectTo })

  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    const msg = error.message.includes('Email not confirmed')
      ? 'Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse über den Link in unserer E-Mail.'
      : 'E-Mail oder Passwort falsch.'
    back('/login', { error: msg, redirectTo })
  }

  revalidatePath('/', 'layout')
  if (isAdminEmail(data.user.email) && redirectTo === '/') redirect('/admin')
  redirect(redirectTo)
}

export type RegisterState = { ok: boolean; needsConfirm?: boolean; error?: string } | null

/** Used by the register page and the register modal (useActionState). Every new account also becomes a CRM lead. */
export async function registerAccount(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  if (!isSupabaseConfigured) return { ok: false, error: NOT_CONFIGURED }

  const full_name = String(formData.get('full_name') ?? '').trim().slice(0, 120)
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const phone = String(formData.get('phone') ?? '').trim().slice(0, 40)
  const company = String(formData.get('company') ?? '').trim().slice(0, 160)

  if (full_name.length < 2) return { ok: false, error: 'Bitte geben Sie Ihren Namen an.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'Bitte geben Sie eine gültige E-Mail-Adresse an.' }
  if (phone.replace(/[^0-9]/g, '').length < 6) return { ok: false, error: 'Bitte geben Sie eine gültige Telefonnummer an.' }
  if (password.length < 8) return { ok: false, error: 'Das Passwort muss mindestens 8 Zeichen haben.' }
  if (formData.get('consent_privacy') !== 'on') return { ok: false, error: 'Bitte bestätigen Sie die Datenschutzerklärung.' }

  // Created confirmed via the admin API, then signed in right away: no confirmation mail, the details unlock instantly.
  // (signUp with "Confirm email" on waited for Supabase's mailer and returned no session.)
  const { data, error } = await getSupabaseAdmin().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    // Picked up by the handle_new_user trigger (supabase/schema.sql)
    user_metadata: { full_name, phone, company },
  })
  if (error?.code === 'email_exists' || /already (been )?registered/i.test(error?.message ?? '')) {
    return { ok: false, error: 'Für diese E-Mail-Adresse gibt es bereits ein Konto. Bitte melden Sie sich an.' }
  }
  if (error || !data.user) {
    console.error('createUser failed', error)
    return { ok: false, error: 'Registrierung fehlgeschlagen. Bitte prüfen Sie Ihre Angaben.' }
  }

  const supabase = await createClient()
  const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
  if (signInErr) console.error('sign-in after register failed', signInErr)

  // A failing CRM entry must not block the account
  try {
    const { data: lead, error: leadErr } = await getSupabaseAdmin()
      .from('leads')
      .insert({
        name: full_name,
        email,
        phone,
        company: company || null,
        source: 'registrierung',
        landing_path: String(formData.get('landing_path') ?? '').slice(0, 300) || null,
        user_id: data.user.id,
        consent_text_version: CONSENT_VERSION,
        consent_privacy: true,
        // Sharing with providers only happens when the user explicitly requests an offer
        consent_share: false,
        consent_at: new Date().toISOString(),
      })
      .select('id')
      .single()
    if (leadErr) throw leadErr
    await sendLeadAdminNotification({
      id: lead.id, name: full_name, email, phone, company: company || null,
      amountLabel: null, deadline: null, goalLabel: null, categoryNames: [], source: 'registrierung',
    })
  } catch (e) {
    console.error('registration lead failed', e)
  }

  revalidatePath('/', 'layout')
  return { ok: true, needsConfirm: Boolean(signInErr) }
}

export async function signOut() {
  if (isSupabaseConfigured) {
    const supabase = await createClient()
    await supabase.auth.signOut()
  }
  revalidatePath('/', 'layout')
  redirect('/')
}

export type PasswordState = { ok: boolean; error?: string } | null

/** Always answers ok – never reveals whether an account exists for the address */
export async function requestPasswordReset(_prev: PasswordState, formData: FormData): Promise<PasswordState> {
  if (!isSupabaseConfigured) return { ok: false, error: NOT_CONFIGURED }
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'Bitte geben Sie eine gültige E-Mail-Adresse an.' }

  try {
    // Preferred: our own branded mail via Resend, with a link that /auth/confirm verifies server-side
    const { data, error } = await getSupabaseAdmin().auth.admin.generateLink({ type: 'recovery', email })
    if (!error && data.properties?.hashed_token) {
      const link = `${APP_URL}/auth/confirm?token_hash=${data.properties.hashed_token}&type=recovery&next=/passwort-neu`
      if (await sendPasswordReset({ email, link })) return { ok: true }
    }
    // Fallback without Resend: Supabase's own mailer (PKCE code → /auth/callback)
    if (!error) {
      const supabase = await createClient()
      await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${APP_URL}/auth/callback?next=/passwort-neu` })
    }
  } catch (e) {
    console.error('password reset failed', e)
  }
  return { ok: true }
}

export async function updatePassword(_prev: PasswordState, formData: FormData): Promise<PasswordState> {
  const password = String(formData.get('password') ?? '')
  if (password.length < 8) return { ok: false, error: 'Das Passwort muss mindestens 8 Zeichen haben.' }
  if (password !== String(formData.get('password_repeat') ?? '')) return { ok: false, error: 'Die Passwörter stimmen nicht überein.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Der Link ist abgelaufen. Bitte fordern Sie einen neuen an.' }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    console.error('updatePassword failed', error)
    const same = error.message.toLowerCase().includes('different from the old')
    return { ok: false, error: same ? 'Bitte wählen Sie ein anderes als das bisherige Passwort.' : 'Das Passwort konnte nicht gespeichert werden.' }
  }
  revalidatePath('/', 'layout')
  return { ok: true }
}
