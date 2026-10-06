'use server'

import { CATEGORIES, formatEuro } from '@/lib/categories'
import { CONSENT_VERSION } from '@/lib/consent'
import { DEFAULT_COUNTRY, isCountryCode } from '@/lib/countries'
import { sendProviderAdminNotification, sendProviderConfirmation } from '@/lib/email'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export type ProviderFormState = { ok: boolean; error?: string; fieldErrors?: Record<string, string> } | null

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Bots submit instantly; humans need a while for this longer form
const MIN_FILL_MS = 4000

function str(fd: FormData, key: string, max = 200): string {
  return String(fd.get(key) ?? '').trim().slice(0, max)
}

function euroToCents(v: string): number | null {
  const n = Number(v.replace(/[€\s]/g, '').replace(/\./g, '').replace(',', '.'))
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : null
}

function url(v: string): string | null {
  if (!v) return null
  const withScheme = /^https?:\/\//i.test(v) ? v : `https://${v}`
  try {
    return new URL(withScheme).toString()
  } catch {
    return null
  }
}

export async function submitProvider(_prev: ProviderFormState, fd: FormData): Promise<ProviderFormState> {
  // Honeypot + timing: pretend success so bots don't retry
  const renderedAt = Number(fd.get('_t') ?? 0)
  if (str(fd, 'fax') || (renderedAt && Date.now() - renderedAt < MIN_FILL_MS)) {
    return { ok: true }
  }

  const company = str(fd, 'company', 160)
  const contactName = str(fd, 'contact_name', 120)
  const email = str(fd, 'email', 200).toLowerCase()
  const phone = str(fd, 'phone', 40) || null
  const website = url(str(fd, 'website', 300))
  const categorySlug = str(fd, 'category', 80)
  const title = str(fd, 'title', 160)
  const description = str(fd, 'description', 4000)
  const minRaw = str(fd, 'min_investment', 40)
  const minCents = minRaw ? euroToCents(minRaw) : null
  const consentPrivacy = fd.get('consent_privacy') === 'on'

  const category = CATEGORIES.find((c) => c.slug === categorySlug)
  const fieldErrors: Record<string, string> = {}
  if (company.length < 2) fieldErrors.company = 'Bitte geben Sie Ihre Firma an.'
  if (contactName.length < 2) fieldErrors.contact_name = 'Bitte geben Sie einen Ansprechpartner an.'
  if (!EMAIL_RE.test(email)) fieldErrors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse an.'
  if (!category && categorySlug !== 'sonstige') fieldErrors.category = 'Bitte wählen Sie eine Kategorie.'
  if (title.length < 3) fieldErrors.title = 'Bitte geben Sie eine Produktbezeichnung an.'
  if (description.length < 40) fieldErrors.description = 'Bitte beschreiben Sie Ihr Produkt in mindestens ein paar Sätzen.'
  if (minRaw && !minCents) fieldErrors.min_investment = 'Bitte geben Sie einen Betrag in Euro an, z. B. 25000.'
  if (!consentPrivacy) fieldErrors.consent_privacy = 'Bitte bestätigen Sie die Datenschutzerklärung.'
  if (Object.keys(fieldErrors).length) return { ok: false, fieldErrors }

  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch (e) {
    console.error(e)
    return { ok: false, error: 'Die Einreichung konnte gerade nicht gespeichert werden. Bitte versuchen Sie es später erneut.' }
  }

  const { data, error } = await supabase
    .from('provider_submissions')
    .insert({
      company,
      contact_name: contactName,
      email,
      phone,
      website,
      category_slug: categorySlug,
      title,
      description,
      location: str(fd, 'location', 160) || null,
      country: isCountryCode(str(fd, 'country')) ? str(fd, 'country') : DEFAULT_COUNTRY,
      min_investment_cents: minCents,
      expected_yield: str(fd, 'expected_yield', 160) || null,
      availability: str(fd, 'availability', 160) || null,
      image_url: url(str(fd, 'image_url', 500)),
      documents_url: url(str(fd, 'documents_url', 500)),
      consent_text_version: CONSENT_VERSION,
      consent_privacy_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error || !data) {
    console.error('provider submission insert failed', error)
    return { ok: false, error: 'Die Einreichung konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.' }
  }

  const mail = {
    id: data.id,
    company,
    contactName,
    email,
    phone,
    website,
    categoryName: category?.name ?? 'Sonstige',
    title,
    minInvestment: minCents ? `${formatEuro(minCents / 100)} netto` : null,
  }
  await Promise.allSettled([sendProviderAdminNotification(mail), sendProviderConfirmation(mail)]).then((rs) =>
    rs.forEach((r) => r.status === 'rejected' && console.error('provider mail failed', r.reason))
  )

  return { ok: true }
}
