'use server'

import { headers } from 'next/headers'
import { magicAccessLink, sendSupabaseMagicLink } from '@/lib/account'
import { CATEGORIES, formatEuro, getCategory, GOALS } from '@/lib/categories'
import { categoryShareText, CONSENT_VERSION, offerShareText } from '@/lib/consent'
import {
  AMOUNTS,
  amountBucket,
  formatDeadline,
  iabDeadline,
  iabYears,
  investTimings,
  isValidAmount,
  isValidGoal,
  isValidLegalForm,
  isValidTiming,
  LEGAL_FORMS,
} from '@/lib/iab'
import { getCurrentUser } from '@/lib/auth'
import { getPublicOffer } from '@/lib/offers'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { sendCalcReport, sendLeadAdminNotification, sendLeadConfirmation, sendOfferInquiryConfirmation } from '@/lib/email'
import { calcHint, computeCalc, eur, eur2, isTaxYear, reportRows, type CalcParams } from '@/lib/rechner'

export type LeadFormState = { ok: boolean; error?: string; fieldErrors?: Record<string, string> } | null

const SOURCES = ['check', 'tile', 'landing', 'offer', 'frist'] as const
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Bots submit instantly; humans need a few seconds to fill the form
const MIN_FILL_MS = 2500

function str(fd: FormData, key: string, max = 200): string {
  return String(fd.get(key) ?? '').trim().slice(0, max)
}

const PHONE_ERROR = 'Bitte geben Sie Ihre Telefonnummer an, damit der Anbieter Sie zurückrufen kann.'
const validPhone = (p: string | null) => (p ?? '').replace(/[^0-9]/g, '').length >= 6

export async function submitLead(_prev: LeadFormState, fd: FormData): Promise<LeadFormState> {
  // Honeypot + timing: pretend success so bots don't retry
  const renderedAt = Number(fd.get('_t') ?? 0)
  if (str(fd, 'website') || (renderedAt && Date.now() - renderedAt < MIN_FILL_MS)) {
    return { ok: true }
  }

  const name = str(fd, 'name', 120)
  const email = str(fd, 'email', 200).toLowerCase()
  const phone = str(fd, 'phone', 40) || null
  const company = str(fd, 'company', 160) || null
  const amount = str(fd, 'iab_amount')
  const yearRaw = Number(str(fd, 'iab_year'))
  const goal = str(fd, 'goal')
  const sourceRaw = str(fd, 'source')
  const offerRaw = str(fd, 'offer_id')
  const offerId = /^[0-9a-f-]{36}$/i.test(offerRaw) ? offerRaw : null
  const slugs = fd.getAll('categories').map(String)
  const consentPrivacy = fd.get('consent_privacy') === 'on'
  const consentShare = fd.get('consent_share') === 'on'
  const consentCall = fd.get('consent_call') === 'on'

  const fieldErrors: Record<string, string> = {}
  if (name.length < 2) fieldErrors.name = 'Bitte geben Sie Ihren Namen an.'
  if (!EMAIL_RE.test(email)) fieldErrors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse an.'
  if (!validPhone(phone)) fieldErrors.phone = PHONE_ERROR
  const categories = CATEGORIES.filter((c) => slugs.includes(c.slug))
  if (categories.length === 0) fieldErrors.categories = 'Bitte wählen Sie mindestens eine Kategorie.'
  if (!consentPrivacy) fieldErrors.consent_privacy = 'Bitte bestätigen Sie die Datenschutzerklärung.'
  if (!consentShare) fieldErrors.consent_share = 'Ohne diese Einwilligung können wir keine Anbieter vermitteln.'
  if (!consentCall) fieldErrors.consent_call = 'Die Anbieter melden sich telefonisch. Bitte bestätigen Sie den Rückruf.'
  if (Object.keys(fieldErrors).length) return { ok: false, fieldErrors }

  const iabAmount = isValidAmount(amount) ? amount : null
  const iabYear = iabYears().includes(yearRaw) ? yearRaw : null
  const iabGoal = isValidGoal(goal) ? goal : null
  const source = (SOURCES as readonly string[]).includes(sourceRaw) ? sourceRaw : 'landing'

  const h = await headers()
  const user = await getCurrentUser()
  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch (e) {
    console.error(e)
    return { ok: false, error: 'Die Anfrage konnte gerade nicht gespeichert werden. Bitte versuchen Sie es später erneut.' }
  }

  const { data: cats, error: catErr } = await supabase
    .from('categories')
    .select('id, slug')
    .in('slug', categories.map((c) => c.slug))
  if (catErr) console.error('categories lookup failed', catErr)

  const { data: lead, error } = await supabase
    .from('leads')
    .insert({
      name,
      email,
      phone,
      company,
      iab_amount: iabAmount,
      iab_year: iabYear,
      iab_deadline: iabYear ? iabDeadline(iabYear).toISOString().slice(0, 10) : null,
      goal: iabGoal,
      source,
      offer_id: offerId,
      landing_path: str(fd, 'landing_path', 300) || null,
      utm_source: str(fd, 'utm_source', 100) || null,
      user_agent: h.get('user-agent')?.slice(0, 300) ?? null,
      consent_text_version: CONSENT_VERSION,
      consent_privacy: true,
      consent_share: true,
      consent_share_text: categoryShareText(categories.map((c) => c.name)),
      consent_call: true,
      consent_at: new Date().toISOString(),
      user_id: user?.id ?? null,
    })
    .select('id')
    .single()

  if (error || !lead) {
    console.error('lead insert failed', error)
    return { ok: false, error: 'Die Anfrage konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.' }
  }

  if (cats?.length) {
    const { error: lcErr } = await supabase
      .from('lead_categories')
      .insert(cats.map((c) => ({ lead_id: lead.id, category_id: c.id })))
    if (lcErr) console.error('lead_categories insert failed', lcErr)
  }

  const mail = {
    id: lead.id,
    name,
    email,
    phone,
    company,
    amountLabel: AMOUNTS.find((a) => a.value === iabAmount)?.label ?? null,
    deadline: iabYear ? formatDeadline(iabYear) : null,
    goalLabel: GOALS.find((g) => g.value === iabGoal)?.label ?? null,
    categoryNames: categories.map((c) => c.name),
    source,
    extra: [['Telefon-Einwilligung', 'ja']] as [string, string][],
  }
  // A failing mail must not lose the lead – it's already stored
  await Promise.allSettled([sendLeadAdminNotification(mail), sendLeadConfirmation(mail)]).then((rs) =>
    rs.forEach((r) => r.status === 'rejected' && console.error('lead mail failed', r.reason))
  )

  return { ok: true }
}

/** "Fragen? Kontakt aufnehmen" – help choosing a category, stored as CRM lead without consent to share */
export async function submitContact(_prev: LeadFormState, fd: FormData): Promise<LeadFormState> {
  const renderedAt = Number(fd.get('_t') ?? 0)
  if (str(fd, 'website') || (renderedAt && Date.now() - renderedAt < MIN_FILL_MS)) {
    return { ok: true }
  }

  const name = str(fd, 'name', 120)
  const email = str(fd, 'email', 200).toLowerCase()
  const phone = str(fd, 'phone', 40) || null
  const message = str(fd, 'message', 2000)

  const fieldErrors: Record<string, string> = {}
  if (name.length < 2) fieldErrors.name = 'Bitte geben Sie Ihren Namen an.'
  if (!EMAIL_RE.test(email)) fieldErrors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse an.'
  if (message.length < 5) fieldErrors.message = 'Bitte schreiben Sie kurz, wobei wir helfen können.'
  if (fd.get('consent_privacy') !== 'on') fieldErrors.consent_privacy = 'Bitte bestätigen Sie die Datenschutzerklärung.'
  if (Object.keys(fieldErrors).length) return { ok: false, fieldErrors }

  const h = await headers()
  const user = await getCurrentUser()
  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch (e) {
    console.error(e)
    return { ok: false, error: 'Die Nachricht konnte gerade nicht gesendet werden. Bitte versuchen Sie es später erneut.' }
  }

  const { data: lead, error } = await supabase
    .from('leads')
    .insert({
      name,
      email,
      phone,
      message,
      source: 'kontakt',
      landing_path: str(fd, 'landing_path', 300) || null,
      utm_source: str(fd, 'utm_source', 100) || null,
      user_agent: h.get('user-agent')?.slice(0, 300) ?? null,
      consent_text_version: CONSENT_VERSION,
      consent_privacy: true,
      consent_share: false,
      consent_at: new Date().toISOString(),
      user_id: user?.id ?? null,
    })
    .select('id')
    .single()

  if (error || !lead) {
    console.error('contact insert failed', error)
    return { ok: false, error: 'Die Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut.' }
  }

  await sendLeadAdminNotification({
    id: lead.id, name, email, phone, company: null, amountLabel: null, deadline: null, goalLabel: null,
    categoryNames: [], source: 'kontakt', message,
  }).catch((e) => console.error('contact mail failed', e))

  return { ok: true }
}

export type CalcReportState = { ok: boolean; mailed?: boolean; error?: string; fieldErrors?: Record<string, string> } | null

/** IAB-Rechner: result report by e-mail – the calculator's lead gate. Recomputes server-side from the inputs. */
export async function submitCalcReport(_prev: CalcReportState, fd: FormData): Promise<CalcReportState> {
  const renderedAt = Number(fd.get('_t') ?? 0)
  if (str(fd, 'website') || (renderedAt && Date.now() - renderedAt < MIN_FILL_MS)) return { ok: true }

  const name = str(fd, 'name', 120)
  const email = str(fd, 'email', 200).toLowerCase()
  const phone = str(fd, 'phone', 40) || null
  const legalForm = str(fd, 'legal_form')
  const timing = str(fd, 'invest_timing')
  const fieldErrors: Record<string, string> = {}
  if (name.length < 2) fieldErrors.name = 'Bitte geben Sie Ihren Namen an.'
  if (!EMAIL_RE.test(email)) fieldErrors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse an.'
  if (!isValidLegalForm(legalForm)) fieldErrors.legal_form = 'Bitte wählen Sie Ihre Rechtsform.'
  if (!isValidTiming(timing)) fieldErrors.invest_timing = 'Bitte wählen Sie, wann Sie investieren möchten.'
  if (phone && !validPhone(phone)) fieldErrors.phone = 'Bitte prüfen Sie die Telefonnummer.'
  if (fd.get('consent_privacy') !== 'on') fieldErrors.consent_privacy = 'Bitte bestätigen Sie die Datenschutzerklärung.'
  if (Object.keys(fieldErrors).length) return { ok: false, fieldErrors }

  const num = (k: string, max: number) => Math.min(Math.max(0, Math.floor(Number(fd.get(k)) || 0)), max)
  const yearRaw = num('year', 3000)
  const churchRaw = num('church', 9)
  const category = CATEGORIES.find((c) => c.slug === str(fd, 'category'))
  const params: CalcParams = {
    zvE: num('zvE', 10_000_000),
    joint: fd.get('joint') === '1',
    year: isTaxYear(yearRaw) ? yearRaw : 2026,
    church: churchRaw === 8 || churchRaw === 9 ? churchRaw : 0,
    investment: num('investment', 50_000_000),
    businesses: Math.max(1, num('businesses', 5)),
    profit: num('profit', 100_000_000),
    iab: num('iab', 1_000_000),
    category: category?.slug ?? '',
  }
  const r = computeCalc(params)
  const rows = reportRows(params, r, category?.name ?? null)
  const hint = calcHint(r)
  const amount = amountBucket(r.iab)
  const legalLabel = LEGAL_FORMS.find((f) => f.value === legalForm)!.label
  const timingLabel = investTimings().find((t) => t.value === timing)!.label

  const h = await headers()
  const user = await getCurrentUser()
  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch (e) {
    console.error(e)
    return { ok: false, error: 'Der Bericht konnte gerade nicht erstellt werden. Bitte versuchen Sie es später erneut.' }
  }

  const { data: lead, error } = await supabase
    .from('leads')
    .insert({
      name,
      email,
      phone,
      source: 'rechner',
      legal_form: legalForm,
      invest_timing: timing,
      investment_cents: params.investment ? params.investment * 100 : null,
      iab_amount: r.iab ? amount : null,
      iab_year: iabYears().includes(params.year) ? params.year : null,
      iab_deadline: iabYears().includes(params.year) ? iabDeadline(params.year).toISOString().slice(0, 10) : null,
      message: [...rows.map(([k, v]) => `${k}: ${v}`), '', hint].join('\n'),
      landing_path: str(fd, 'landing_path', 300) || null,
      utm_source: str(fd, 'utm_source', 100) || null,
      user_agent: h.get('user-agent')?.slice(0, 300) ?? null,
      consent_text_version: CONSENT_VERSION,
      consent_privacy: true,
      consent_share: false,
      consent_at: new Date().toISOString(),
      user_id: user?.id ?? null,
    })
    .select('id')
    .single()

  if (error || !lead) {
    console.error('calc report insert failed', error)
    return { ok: false, error: 'Der Bericht konnte nicht erstellt werden. Bitte versuchen Sie es erneut.' }
  }

  if (category) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', category.slug).maybeSingle()
    if (cat) await supabase.from('lead_categories').insert({ lead_id: lead.id, category_id: cat.id })
  }

  const [mailed] = await Promise.all([
    sendCalcReport({ name, email, rows, saving: eur2(r.saving), hint }).catch((e) => {
      console.error('calc report mail failed', e)
      return false
    }),
    sendLeadAdminNotification({
      id: lead.id, name, email, phone, company: null,
      amountLabel: eur(r.iab), deadline: iabYears().includes(params.year) ? formatDeadline(params.year) : null, goalLabel: null,
      categoryNames: category ? [category.name] : [], source: 'rechner', message: rows.map(([k, v]) => `${k}: ${v}`).join('\n'),
      extra: [['Rechtsform', legalLabel], ['Zeitpunkt', timingLabel]],
    }).catch((e) => console.error('calc admin mail failed', e)),
  ])

  return { ok: true, mailed }
}

export type OfferInquiryState = { ok: boolean; mailed?: boolean; signedIn?: boolean; error?: string; fieldErrors?: Record<string, string> } | null

/**
 * Offer page: direct inquiry instead of registering first. Stores a sellable lead for exactly this offer
 * (with consent to share with its provider and to be called), then creates the account in the background
 * and mails a magic link that opens the offer with all details.
 */
export async function submitOfferInquiry(_prev: OfferInquiryState, fd: FormData): Promise<OfferInquiryState> {
  const renderedAt = Number(fd.get('_t') ?? 0)
  if (str(fd, 'website') || (renderedAt && Date.now() - renderedAt < MIN_FILL_MS)) return { ok: true }

  const slug = str(fd, 'category')
  const offerRaw = str(fd, 'offer_id')
  const category = getCategory(slug)
  const offer = category ? await getPublicOffer(slug, offerRaw) : null
  if (!category || !offer) return { ok: false, error: 'Dieses Angebot ist nicht mehr verfügbar.' }

  const name = str(fd, 'name', 120)
  const email = str(fd, 'email', 200).toLowerCase()
  const phone = str(fd, 'phone', 40) || null
  const company = str(fd, 'company', 160) || null
  const legalForm = str(fd, 'legal_form')
  const timing = str(fd, 'invest_timing')
  const investment = Math.min(Number(str(fd, 'investment').replace(/[^0-9]/g, '')) || 0, 100_000_000)
  const yearRaw = Number(str(fd, 'iab_year'))

  const fieldErrors: Record<string, string> = {}
  if (name.length < 2) fieldErrors.name = 'Bitte geben Sie Ihren Namen an.'
  if (!EMAIL_RE.test(email)) fieldErrors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse an.'
  if (!validPhone(phone)) fieldErrors.phone = PHONE_ERROR
  if (!isValidLegalForm(legalForm)) fieldErrors.legal_form = 'Bitte wählen Sie Ihre Rechtsform.'
  if (investment < 1000) fieldErrors.investment = 'Bitte geben Sie die geplante Investitionssumme an.'
  if (!isValidTiming(timing)) fieldErrors.invest_timing = 'Bitte wählen Sie, wann Sie investieren möchten.'
  if (fd.get('consent_share') !== 'on') fieldErrors.consent_share = 'Ohne diese Einwilligung kann der Anbieter Sie nicht kontaktieren.'
  if (fd.get('consent_call') !== 'on') fieldErrors.consent_call = 'Der Anbieter meldet sich telefonisch. Bitte bestätigen Sie den Rückruf.'
  if (fd.get('consent_privacy') !== 'on') fieldErrors.consent_privacy = 'Bitte bestätigen Sie die Datenschutzerklärung.'
  if (Object.keys(fieldErrors).length) return { ok: false, fieldErrors }

  const iabYear = iabYears().includes(yearRaw) ? yearRaw : null
  const legalLabel = LEGAL_FORMS.find((f) => f.value === legalForm)!.label
  const timingLabel = investTimings().find((t) => t.value === timing)!.label
  const path = `/${category.slug}/${offer.id}`

  const h = await headers()
  const user = await getCurrentUser()
  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch (e) {
    console.error(e)
    return { ok: false, error: 'Die Anfrage konnte gerade nicht gespeichert werden. Bitte versuchen Sie es später erneut.' }
  }

  const { data: lead, error } = await supabase
    .from('leads')
    .insert({
      name,
      email,
      phone,
      company,
      legal_form: legalForm,
      investment_cents: investment * 100,
      invest_timing: timing,
      iab_year: iabYear,
      iab_deadline: iabYear ? iabDeadline(iabYear).toISOString().slice(0, 10) : null,
      source: 'angebot',
      offer_id: offer.id,
      landing_path: str(fd, 'landing_path', 300) || path,
      utm_source: str(fd, 'utm_source', 100) || null,
      user_agent: h.get('user-agent')?.slice(0, 300) ?? null,
      consent_text_version: CONSENT_VERSION,
      consent_privacy: true,
      consent_share: true,
      // Exact wording with the offer named – proof of consent when the lead is passed on
      consent_share_text: offerShareText(offer.title, category.name),
      consent_call: true,
      consent_at: new Date().toISOString(),
      user_id: user?.id ?? null,
    })
    .select('id')
    .single()

  if (error || !lead) {
    console.error('offer inquiry insert failed', error)
    return { ok: false, error: 'Die Anfrage konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.' }
  }

  const { data: cat } = await supabase.from('categories').select('id').eq('slug', category.slug).maybeSingle()
  if (cat) await supabase.from('lead_categories').insert({ lead_id: lead.id, category_id: cat.id })

  // Account in the background – a failure never loses the lead
  const account = { email, full_name: name, phone, company }
  const accessLink = user ? null : await magicAccessLink(account, path).catch(() => null)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const deadline = iabYear ? formatDeadline(iabYear) : null

  const [mailed] = await Promise.all([
    sendOfferInquiryConfirmation({ name, email, offerTitle: offer.title, offerUrl: `${appUrl}${path}`, accessLink, deadline }).catch((e) => {
      console.error('offer inquiry mail failed', e)
      return false
    }),
    sendLeadAdminNotification({
      id: lead.id, name, email, phone, company,
      amountLabel: null, deadline, goalLabel: null,
      categoryNames: [category.name], source: 'angebot',
      extra: [
        ['Angebot', offer.title],
        ['Rechtsform', legalLabel],
        ['Investition', `${formatEuro(investment)} netto`],
        ['Zeitpunkt', timingLabel],
        ['Telefon-Einwilligung', 'ja'],
      ],
    }).catch((e) => console.error('offer inquiry admin mail failed', e)),
  ])
  // Without Resend, Supabase's own mailer delivers the sign-in link
  if (!mailed && !user) await sendSupabaseMagicLink(account, path).catch(() => {})

  return { ok: true, mailed, signedIn: Boolean(user) }
}
