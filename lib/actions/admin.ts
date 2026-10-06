'use server'

import { revalidatePath } from 'next/cache'
import { sendPartnerActivation } from '@/lib/email'
import { requireAdmin } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { LEAD_STATUSES, type LeadStatus } from '@/lib/supabase/types'
import { DEFAULT_COUNTRY, isCountryCode } from '@/lib/countries'

// ── Leads ─────────────────────────────────────────────────
export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  await requireAdmin()
  if (!LEAD_STATUSES.includes(status)) throw new Error('Ungültiger Status')
  await getSupabaseAdmin().from('leads').update({ status }).eq('id', leadId)
  revalidatePath('/admin', 'layout')
}

export async function updateLeadCRM(leadId: string, formData: FormData) {
  await requireAdmin()
  const notes = (formData.get('notes') as string | null) || null
  const followUpRaw = formData.get('follow_up_at') as string | null
  const follow_up_at = followUpRaw ? new Date(followUpRaw).toISOString() : null
  await getSupabaseAdmin().from('leads').update({ notes, follow_up_at }).eq('id', leadId)
  revalidatePath('/admin', 'layout')
}

export async function addLeadActivity(leadId: string, formData: FormData) {
  const adminEmail = await requireAdmin()
  const channel = String(formData.get('channel') ?? 'notiz')
  const outcome = String(formData.get('outcome') ?? 'erreicht')
  const notes = (formData.get('notes') as string | null) || null
  const followUpRaw = formData.get('follow_up_at') as string | null

  const supabase = getSupabaseAdmin()
  await supabase.from('lead_activities').insert({ lead_id: leadId, admin_email: adminEmail, channel, outcome, notes })

  if (outcome === 'kein_interesse') {
    await supabase.from('leads').update({ follow_up_at: null, status: 'abgelehnt' }).eq('id', leadId)
  } else if (outcome === 'konvertiert') {
    await supabase.from('leads').update({ follow_up_at: null, status: 'abgeschlossen' }).eq('id', leadId)
  } else if (followUpRaw) {
    await supabase.from('leads').update({ follow_up_at: new Date(followUpRaw).toISOString() }).eq('id', leadId)
  }
  revalidatePath('/admin', 'layout')
}

// ── Offers ────────────────────────────────────────────────
function euroToCents(v: FormDataEntryValue | null): number | null {
  const n = Number(String(v ?? '').replace(/\./g, '').replace(',', '.'))
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : null
}

function countryOf(formData: FormData): string {
  const c = String(formData.get('country') ?? '')
  return isCountryCode(c) ? c : DEFAULT_COUNTRY
}

function lines(v: FormDataEntryValue | null): string[] {
  return String(v ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
}

/** "Label: Wert" per line */
function parseFacts(v: FormDataEntryValue | null) {
  return lines(v)
    .map((l) => {
      const i = l.indexOf(':')
      return i > 0 ? { label: l.slice(0, i).trim(), value: l.slice(i + 1).trim() } : null
    })
    .filter((f): f is { label: string; value: string } => Boolean(f?.label && f.value))
}

/** "Bezeichnung | URL" per line */
function parseDocuments(v: FormDataEntryValue | null) {
  return lines(v)
    .map((l) => {
      const [label, url] = l.split('|').map((x) => x.trim())
      return label && url?.startsWith('http') ? { label, url } : null
    })
    .filter((d): d is { label: string; url: string } => Boolean(d))
}

export async function createOffer(formData: FormData) {
  await requireAdmin()
  const supabase = getSupabaseAdmin()
  const slug = String(formData.get('category') ?? '')
  const { data: cat } = await supabase.from('categories').select('id').eq('slug', slug).single()
  if (!cat) throw new Error('Kategorie nicht gefunden – wurde supabase/schema.sql ausgeführt?')

  const text = (k: string) => String(formData.get(k) ?? '').trim() || null
  await supabase.from('offers').insert({
    category_id: cat.id,
    title: text('title') ?? 'Ohne Titel',
    description: text('description'),
    location: text('location'),
    country: countryOf(formData),
    min_investment_cents: euroToCents(formData.get('min_investment')),
    expected_yield: text('expected_yield'),
    availability: text('availability'),
    image_url: text('image_url'),
    provider_name: text('provider_name'),
    gallery: lines(formData.get('gallery')),
    details: text('details'),
    facts: parseFacts(formData.get('facts')),
    documents: parseDocuments(formData.get('documents')),
    is_published: formData.get('is_published') === 'on',
  })
  revalidatePath('/admin/offers')
  revalidatePath(`/${slug}`)
}

export async function setOfferPublished(offerId: string, slug: string, published: boolean) {
  await requireAdmin()
  await getSupabaseAdmin().from('offers').update({ is_published: published }).eq('id', offerId)
  revalidatePath('/admin/offers')
  revalidatePath(`/${slug}`)
}

export async function deleteOffer(offerId: string, slug: string) {
  await requireAdmin()
  await getSupabaseAdmin().from('offers').delete().eq('id', offerId)
  revalidatePath('/admin/offers')
  revalidatePath(`/${slug}`)
}

// ── Provider submissions ──────────────────────────────────
/** Creates a published offer from the (possibly edited) submission and marks it as approved */
export async function approveSubmission(submissionId: string, formData: FormData) {
  await requireAdmin()
  const supabase = getSupabaseAdmin()
  const { data: sub } = await supabase.from('provider_submissions').select('*').eq('id', submissionId).single()
  if (!sub) throw new Error('Einreichung nicht gefunden')

  const slug = String(formData.get('category') ?? '')
  const { data: cat } = await supabase.from('categories').select('id').eq('slug', slug).single()
  if (!cat) throw new Error('Kategorie nicht gefunden – wurde supabase/schema.sql ausgeführt?')

  const text = (k: string) => String(formData.get(k) ?? '').trim() || null
  const { data: offer, error } = await supabase
    .from('offers')
    .insert({
      category_id: cat.id,
      title: text('title') ?? sub.title,
      description: text('description'),
      location: text('location'),
      country: countryOf(formData),
      min_investment_cents: euroToCents(formData.get('min_investment')),
      expected_yield: text('expected_yield'),
      availability: text('availability'),
      image_url: text('image_url'),
      provider_name: sub.company,
      details: sub.description,
      documents: sub.documents_url ? [{ label: 'Unterlagen des Anbieters', url: sub.documents_url }] : [],
      is_published: true,
    })
    .select('id')
    .single()
  if (error || !offer) throw new Error(`Angebot konnte nicht angelegt werden: ${error?.message}`)

  await supabase
    .from('provider_submissions')
    .update({ status: 'freigeschaltet', offer_id: offer.id, category_slug: slug, admin_notes: text('admin_notes') })
    .eq('id', submissionId)
  revalidatePath('/admin', 'layout')
  revalidatePath(`/${slug}`)
}

export async function rejectSubmission(submissionId: string, formData: FormData) {
  await requireAdmin()
  const admin_notes = String(formData.get('admin_notes') ?? '').trim() || null
  await getSupabaseAdmin().from('provider_submissions').update({ status: 'abgelehnt', admin_notes }).eq('id', submissionId)
  revalidatePath('/admin', 'layout')
}

// ── Tax advisor partners ──────────────────────────────────
function partnerCode(firm: string): string {
  const base = firm
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/\b(steuerberatungsgesellschaft|steuerberatung|steuerberater|steuerkanzlei|kanzlei|gmbh|mbb|partg|und)\b/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24)
    .replace(/-$/, '')
  const suffix = Math.random().toString(36).slice(2, 6)
  return `${base || 'kanzlei'}-${suffix}`
}

/** Activates a tax advisor partner, assigns a referral code and mails the referral link */
export async function activatePartner(partnerId: string) {
  await requireAdmin()
  const supabase = getSupabaseAdmin()
  const { data: p } = await supabase.from('tax_advisor_partners').select('*').eq('id', partnerId).single()
  if (!p) throw new Error('Partner nicht gefunden')

  // Keep an existing code on re-activation; retry on the rare collision
  let code: string | null = p.code
  for (let i = 0; !code && i < 5; i++) {
    const candidate = partnerCode(p.firm)
    const { data: taken } = await supabase.from('tax_advisor_partners').select('id').eq('code', candidate).maybeSingle()
    if (!taken) code = candidate
  }
  if (!code) throw new Error('Kein freier Partner-Code gefunden')

  await supabase.from('tax_advisor_partners').update({ status: 'aktiv', code }).eq('id', partnerId)
  await sendPartnerActivation({ firm: p.firm, contactName: p.contact_name, email: p.email, code }).catch((e) =>
    console.error('partner activation mail failed', e)
  )
  revalidatePath('/admin', 'layout')
}

export async function rejectPartner(partnerId: string) {
  await requireAdmin()
  await getSupabaseAdmin().from('tax_advisor_partners').update({ status: 'abgelehnt' }).eq('id', partnerId)
  revalidatePath('/admin', 'layout')
}
