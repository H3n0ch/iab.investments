'use server'

import { CONSENT_VERSION } from '@/lib/consent'
import { sendPartnerAdminNotification, sendPartnerConfirmation } from '@/lib/email'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export type PartnerFormState = { ok: boolean; error?: string; fieldErrors?: Record<string, string> } | null

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Bots submit instantly; humans need a few seconds to fill the form
const MIN_FILL_MS = 3000

function str(fd: FormData, key: string, max = 200): string {
  return String(fd.get(key) ?? '').trim().slice(0, max)
}

export async function submitPartner(_prev: PartnerFormState, fd: FormData): Promise<PartnerFormState> {
  // Honeypot + timing: pretend success so bots don't retry
  const renderedAt = Number(fd.get('_t') ?? 0)
  if (str(fd, 'fax') || (renderedAt && Date.now() - renderedAt < MIN_FILL_MS)) {
    return { ok: true }
  }

  const firm = str(fd, 'firm', 160)
  const contactName = str(fd, 'contact_name', 120)
  const email = str(fd, 'email', 200).toLowerCase()
  const phone = str(fd, 'phone', 40) || null
  const city = str(fd, 'city', 120) || null

  const fieldErrors: Record<string, string> = {}
  if (firm.length < 2) fieldErrors.firm = 'Bitte geben Sie den Namen Ihrer Kanzlei an.'
  if (contactName.length < 2) fieldErrors.contact_name = 'Bitte geben Sie einen Ansprechpartner an.'
  if (!EMAIL_RE.test(email)) fieldErrors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse an.'
  if (fd.get('consent_privacy') !== 'on') fieldErrors.consent_privacy = 'Bitte bestätigen Sie die Datenschutzerklärung.'
  if (Object.keys(fieldErrors).length) return { ok: false, fieldErrors }

  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch (e) {
    console.error(e)
    return { ok: false, error: 'Die Anmeldung konnte gerade nicht gespeichert werden. Bitte versuchen Sie es später erneut.' }
  }

  const { error } = await supabase.from('tax_advisor_partners').insert({
    firm,
    contact_name: contactName,
    email,
    phone,
    city,
    website: str(fd, 'website', 300) || null,
    message: str(fd, 'message', 2000) || null,
    consent_text_version: CONSENT_VERSION,
    consent_privacy_at: new Date().toISOString(),
  })
  if (error) {
    console.error('partner insert failed', error)
    return { ok: false, error: 'Die Anmeldung konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.' }
  }

  const mail = { firm, contactName, email, phone, city }
  await Promise.allSettled([sendPartnerAdminNotification(mail), sendPartnerConfirmation(mail)]).then((rs) =>
    rs.forEach((r) => r.status === 'rejected' && console.error('partner mail failed', r.reason))
  )
  return { ok: true }
}
