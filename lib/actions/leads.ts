'use server'

import { randomBytes } from 'node:crypto'
import { cookies, headers } from 'next/headers'
import { CATEGORIES, formatEuro } from '@/lib/categories'
import { CONSENT_VERSION, LAND_SHARE_TEXT, SHARE_LABEL } from '@/lib/consent'
import {
  amountBucket,
  BUDGETS,
  CALLBACK_TIMES,
  formatDeadline,
  iabDeadline,
  iabYears,
  investTimings,
  isValidLegalForm,
  isValidTiming,
  LAND_TYPES,
  LEGAL_FORMS,
} from '@/lib/iab'
import { getCurrentUser } from '@/lib/auth'
import { sanitizeStep, setLeadCategories, stepColumns } from '@/lib/lead-steps'
import { getMarketSnapshot, getPublicOffer } from '@/lib/offers'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { sendCalcReport, sendLeadAdminNotification, sendLeadDoi, sendLeadStarted, sendResultMail } from '@/lib/email'
import { UNLOCK_COOKIE } from '@/lib/unlock'
import { calcHint, computeCalc, eur, eur2, isTaxYear, reportRows, type CalcParams } from '@/lib/rechner'

export type LeadFormState = { ok: boolean; error?: string; fieldErrors?: Record<string, string> } | null

const SOURCES = ['check', 'tile', 'landing', 'offer', 'frist', 'angebot', 'ratgeber', 'rechner'] as const
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Bots submit instantly; humans need a few seconds to fill the form
const MIN_FILL_MS = 2500

function str(fd: FormData, key: string, max = 200): string {
  return String(fd.get(key) ?? '').trim().slice(0, max)
}

/** After an inquiry the visitor sees all offer details right away – no account, no e-mail needed */
async function unlockOffers() {
  ;(await cookies()).set(UNLOCK_COOKIE, '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  })
}

const validPhone = (p: string | null) => (p ?? '').replace(/[^0-9]/g, '').length >= 6

/** Tracking fields every inquiry form sends (landing path, campaign, Google Ads click id) */
function attribution(fd: FormData) {
  return {
    landing_path: str(fd, 'landing_path', 300) || null,
    utm_source: str(fd, 'utm_source', 100) || null,
    utm_medium: str(fd, 'utm_medium', 100) || null,
    utm_campaign: str(fd, 'utm_campaign', 150) || null,
    gclid: str(fd, 'gclid', 200) || null,
  }
}

export type InquiryState = { ok: boolean; shared?: boolean; error?: string; fieldErrors?: Record<string, string> }

/**
 * Inquiry „Unterlagen & Kalkulation anfordern“ (2 pages: situation, then contact). Saved only now, on submit.
 * With consent to pass the data on, the lead is complete (sellable after the double opt-in). Without it, it is
 * stored as „ohne Weitergabe“: the visitor may be called about the own inquiry, but the lead is not sold.
 * The same contact within 30 days is matched to the existing lead instead of creating a duplicate.
 */
export async function submitInquiry(fd: FormData): Promise<InquiryState> {
  // Honeypot + timing: pretend success so bots don't retry
  const renderedAt = Number(fd.get('_t') ?? 0)
  if (str(fd, 'website') || (renderedAt && Date.now() - renderedAt < MIN_FILL_MS)) return { ok: true, shared: true }

  const name = str(fd, 'name', 120)
  const email = str(fd, 'email', 200).toLowerCase()
  const phone = str(fd, 'phone', 40).replace(/[^0-9+ ()/-]/g, '') || null
  const sourceRaw = str(fd, 'source')
  const offerRaw = str(fd, 'offer_id')
  const shared = fd.get('consent_share') === 'on'

  const raw: Record<string, unknown> = Object.fromEntries([...fd.entries()].filter(([k]) => k !== 'categories'))
  const step = sanitizeStep({ ...raw, categories: fd.getAll('categories').map(String), form_step: shared ? 'abschluss' : 'kontakt' })
  const categories = CATEGORIES.filter((c) => step.categories?.includes(c.slug))

  const fieldErrors: Record<string, string> = {}
  if (categories.length === 0) fieldErrors.categories = 'Bitte wählen Sie mindestens ein Investitionsgut.'
  if (!step.budget) fieldErrors.budget = 'Bitte wählen Sie Ihr Budget.'
  if (name.length < 2) fieldErrors.name = 'Bitte geben Sie Ihren Namen an.'
  if (!validPhone(phone)) fieldErrors.phone = 'Bitte geben Sie Ihre Telefonnummer an, z. B. 0171 1234567.'
  if (!EMAIL_RE.test(email)) fieldErrors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse an.'
  if (fd.get('consent_call') !== 'on') fieldErrors.consent_call = 'Bitte bestätigen Sie, dass wir Sie zu Ihrer Anfrage anrufen dürfen.'
  if (fd.get('consent_privacy') !== 'on') fieldErrors.consent_privacy = 'Bitte bestätigen Sie die Datenschutzerklärung.'
  if (Object.keys(fieldErrors).length) return { ok: false, fieldErrors }

  const offer = offerRaw && categories.length === 1 ? await getPublicOffer(categories[0].slug, offerRaw) : null
  const source = (SOURCES as readonly string[]).includes(sourceRaw) ? sourceRaw : 'landing'
  // Exactly the sentence shown at the checkbox, plus what it referred to
  const shareText = `${SHARE_LABEL} [Auswahl: ${offer ? `Projekt „${offer.title}“ (${categories[0].name})` : categories.map((c) => c.name).join(', ')}]`
  const doiToken = shared ? randomBytes(24).toString('base64url') : null
  const now = new Date().toISOString()

  const h = await headers()
  const user = await getCurrentUser()
  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch (e) {
    console.error(e)
    return { ok: false, error: 'Ihre Anfrage konnte gerade nicht gespeichert werden. Bitte versuchen Sie es später erneut.' }
  }

  const data = {
    name,
    email,
    phone,
    ...stepColumns(step),
    consent_text_version: CONSENT_VERSION,
    consent_privacy: true,
    consent_call: true,
    consent_share: shared,
    // Exact wording – proof of consent when the lead is passed on
    consent_share_text: shared ? shareText : null,
    consent_at: now,
    completed_at: shared ? now : null,
    doi_token: doiToken,
    notified_at: now,
  }

  // Same e-mail or phone within 30 days → update the existing lead (no duplicate for the buyers)
  const since = new Date(Date.now() - 30 * 86400000).toISOString()
  const { data: existing } = await supabase
    .from('leads')
    .select('id')
    .eq('lead_type', 'investor')
    .gte('created_at', since)
    .or(phone ? `email.eq.${email},phone.eq."${phone}"` : `email.eq.${email}`)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  let leadId: string
  if (existing) {
    const { error } = await supabase.from('leads').update(data).eq('id', existing.id)
    if (error) {
      console.error('inquiry update failed', error)
      return { ok: false, error: 'Ihre Anfrage konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.' }
    }
    leadId = existing.id
    await supabase.from('lead_activities').insert({
      lead_id: leadId,
      admin_email: 'system',
      channel: 'notiz',
      outcome: 'interessiert',
      notes: `Erneut angefragt über ${str(fd, 'landing_path', 300) || 'die Website'}`,
    })
  } else {
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        ...data,
        source,
        offer_id: offer?.id ?? null,
        ...attribution(fd),
        user_agent: h.get('user-agent')?.slice(0, 300) ?? null,
        user_id: user?.id ?? null,
      })
      .select('id')
      .single()
    if (error || !lead) {
      console.error('inquiry insert failed', error)
      return { ok: false, error: 'Ihre Anfrage konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.' }
    }
    leadId = lead.id
  }
  await setLeadCategories(leadId, categories.map((c) => c.slug))
  await unlockOffers()

  const iabEur = step.iab_amount_eur ?? 0
  const facts: [string, string][] = []
  if (offer) facts.push(['Projekt', offer.title])
  facts.push(['IAB', iabEur > 0 ? formatEuro(iabEur) : 'noch kein IAB'])
  if (step.iab_year) facts.push(['Frist', formatDeadline(step.iab_year)])
  if (step.budget) facts.push(['Budget', BUDGETS.find((b) => b.value === step.budget)?.label ?? step.budget])
  if (step.invest_timing) facts.push(['Zeitpunkt', investTimings().find((t) => t.value === step.invest_timing)?.label ?? step.invest_timing])
  if (step.legal_form) facts.push(['Rechtsform', LEGAL_FORMS.find((f) => f.value === step.legal_form)?.label ?? step.legal_form])
  if (step.callback_time) facts.push(['Rückruf', CALLBACK_TIMES.find((c) => c.value === step.callback_time)?.label ?? step.callback_time])
  if (step.budget === 'gt200') facts.push(['Hinweis', 'Großes Ticket: Provisionspartner'])

  const mails: Promise<unknown>[] = []
  if (shared) {
    const mail = {
      id: leadId,
      name,
      email,
      phone,
      company: step.company || null,
      amountLabel: iabEur > 0 ? formatEuro(iabEur) : 'noch kein IAB',
      deadline: step.iab_year ? formatDeadline(step.iab_year) : null,
      goalLabel: null,
      categoryNames: categories.map((c) => c.name),
      source,
      extra: [...facts.filter(([k]) => k !== 'IAB' && k !== 'Frist'), ['Status', '✓ mit Weitergabe, Double-Opt-in ausstehend'], ['Telefon-Einwilligung', 'ja']] as [string, string][],
    }
    mails.push(sendLeadAdminNotification(mail), sendLeadDoi({ ...mail, token: doiToken! }))
  } else {
    // Speed to lead: callable right away, but without consent to pass it on – not to be sold
    mails.push(
      sendLeadStarted({
        id: leadId,
        name,
        email,
        phone,
        resumed: Boolean(existing),
        facts: [['Interesse', categories.map((c) => c.name).join(', ')], ...facts, ['Seite', str(fd, 'landing_path', 300) || '–']],
      }),
    )
  }
  // A failing mail must not lose the lead – it's already stored
  await Promise.allSettled(mails).then((rs) => rs.forEach((r) => r.status === 'rejected' && console.error('inquiry mail failed', r.reason)))

  return { ok: true, shared }
}

/** Personal summary in the last step: how many matching projects there are (own data, before the last consent) */
export async function getInquirySummary(slugs: string[]): Promise<{ count: number; minEntry: number | null; fast: number }> {
  const stats = (await getMarketSnapshot()).filter((s) => slugs.includes(s.slug))
  const entries = stats.map((s) => s.minEntry).filter((x): x is number => x != null)
  return {
    count: stats.reduce((n, s) => n + s.count, 0),
    minEntry: entries.length ? Math.min(...entries) : null,
    fast: stats.reduce((n, s) => n + s.fastCount, 0),
  }
}

/**
 * „Ergebnis speichern & Frist-Erinnerung erhalten“ under a calculator result: a soft contact without password.
 * Not sellable (consent_share = false) – it is the start of the deadline reminders and a later inquiry.
 */
export async function saveResult(_prev: LeadFormState, fd: FormData): Promise<LeadFormState> {
  const renderedAt = Number(fd.get('_t') ?? 0)
  if (str(fd, 'website') || (renderedAt && Date.now() - renderedAt < MIN_FILL_MS)) return { ok: true }

  const email = str(fd, 'email', 200).toLowerCase()
  const name = str(fd, 'name', 120)
  const iabEur = Math.min(Math.max(0, Math.floor(Number(str(fd, 'iab_amount_eur')) || 0)), 200_000)
  const yearRaw = Number(str(fd, 'iab_year'))
  const reminder = fd.get('reminder') === 'on'
  const summary = str(fd, 'summary', 600)
  const page = str(fd, 'page', 200)

  const fieldErrors: Record<string, string> = {}
  if (!EMAIL_RE.test(email)) fieldErrors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse an.'
  if (fd.get('consent_privacy') !== 'on') fieldErrors.consent_privacy = 'Bitte bestätigen Sie die Datenschutzerklärung.'
  if (Object.keys(fieldErrors).length) return { ok: false, fieldErrors }

  const iabYear = iabYears().includes(yearRaw) ? yearRaw : null
  const token = randomBytes(24).toString('base64url')
  // Path of the calculator page only (no open redirect): the result link re-opens it pre-filled
  const path = /^\/[a-z0-9/-]*$/.test(page) ? page : '/iab-aufloesen'
  const resultUrl = `${path}?${new URLSearchParams({ ...(iabEur ? { iab: String(iabEur) } : {}), ...(iabYear ? { jahr: String(iabYear) } : {}) })}#rechner`

  const h = await headers()
  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch (e) {
    console.error(e)
    return { ok: false, error: 'Das Ergebnis konnte gerade nicht gespeichert werden. Bitte versuchen Sie es später erneut.' }
  }

  const { data: lead, error } = await supabase
    .from('leads')
    .insert({
      name: name || email.split('@')[0],
      email,
      source: 'ergebnis',
      iab_amount_eur: iabEur || null,
      iab_amount: iabEur > 0 ? amountBucket(iabEur) : null,
      iab_year: iabYear,
      iab_deadline: iabYear ? iabDeadline(iabYear).toISOString().slice(0, 10) : null,
      message: [summary, `Frist-Erinnerung: ${reminder ? 'ja' : 'nein'}`].filter(Boolean).join('\n'),
      ...attribution(fd),
      user_agent: h.get('user-agent')?.slice(0, 300) ?? null,
      consent_text_version: CONSENT_VERSION,
      consent_privacy: true,
      consent_share: false,
      consent_at: new Date().toISOString(),
      doi_token: token,
    })
    .select('id')
    .single()

  if (error || !lead) {
    console.error('save result insert failed', error)
    return { ok: false, error: 'Das Ergebnis konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.' }
  }

  await sendResultMail({ email, name, summary, resultPath: resultUrl, deadline: iabYear ? formatDeadline(iabYear) : null, reminder, token }).catch((e) =>
    console.error('result mail failed', e),
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

/**
 * /solarpark-flaeche-verpachten: landowners offering land to solar park developers.
 * Separate lead type – the buyers are developers, not the investment providers.
 */
export async function submitLandLead(_prev: LeadFormState, fd: FormData): Promise<LeadFormState> {
  const renderedAt = Number(fd.get('_t') ?? 0)
  if (str(fd, 'website') || (renderedAt && Date.now() - renderedAt < MIN_FILL_MS)) return { ok: true }

  const name = str(fd, 'name', 120)
  const email = str(fd, 'email', 200).toLowerCase()
  const phone = str(fd, 'phone', 40) || null
  const area = Math.min(Number(str(fd, 'land_area_ha').replace(',', '.')) || 0, 100_000)
  const plz = str(fd, 'land_plz', 10)
  const landType = str(fd, 'land_type')
  const grid = str(fd, 'grid', 20)

  const fieldErrors: Record<string, string> = {}
  if (!(area > 0)) fieldErrors.land_area_ha = 'Bitte geben Sie die Größe der Fläche in Hektar an.'
  if (!/^\d{5}$/.test(plz)) fieldErrors.land_plz = 'Bitte geben Sie die Postleitzahl der Fläche an.'
  if (!LAND_TYPES.some((t) => t.value === landType)) fieldErrors.land_type = 'Bitte wählen Sie die Art der Fläche.'
  if (name.length < 2) fieldErrors.name = 'Bitte geben Sie Ihren Namen an.'
  if (!EMAIL_RE.test(email)) fieldErrors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse an.'
  if (!validPhone(phone)) fieldErrors.phone = 'Bitte geben Sie Ihre Telefonnummer an, damit ein Projektierer Sie zurückrufen kann.'
  if (fd.get('consent_share') !== 'on') fieldErrors.consent_share = 'Ohne diese Einwilligung können wir die Fläche nicht anbieten.'
  if (fd.get('consent_call') !== 'on') fieldErrors.consent_call = 'Projektierer melden sich telefonisch. Bitte bestätigen Sie den Rückruf.'
  if (fd.get('consent_privacy') !== 'on') fieldErrors.consent_privacy = 'Bitte bestätigen Sie die Datenschutzerklärung.'
  if (Object.keys(fieldErrors).length) return { ok: false, fieldErrors }

  const typeLabel = LAND_TYPES.find((t) => t.value === landType)!.label
  const gridLabel = grid === 'ja' ? 'Netzanschluss in der Nähe bekannt' : grid === 'nein' ? 'kein Netzanschluss bekannt' : 'Netzanschluss unbekannt'
  const token = randomBytes(24).toString('base64url')
  const h = await headers()
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
      lead_type: 'flaeche',
      land_area_ha: area,
      land_plz: plz,
      land_type: landType,
      message: gridLabel,
      source: 'flaeche',
      ...attribution(fd),
      user_agent: h.get('user-agent')?.slice(0, 300) ?? null,
      consent_text_version: CONSENT_VERSION,
      consent_privacy: true,
      consent_share: true,
      consent_share_text: LAND_SHARE_TEXT,
      consent_call: true,
      consent_at: new Date().toISOString(),
      doi_token: token,
    })
    .select('id')
    .single()

  if (error || !lead) {
    console.error('land lead insert failed', error)
    return { ok: false, error: 'Die Anfrage konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.' }
  }

  const extra: [string, string][] = [
    ['Fläche', `${area.toLocaleString('de-DE')} ha`],
    ['PLZ', plz],
    ['Art', typeLabel],
    ['Netz', gridLabel],
    ['Double-Opt-in', 'ausstehend'],
  ]
  const mail = { id: lead.id, name, email, phone, company: null, amountLabel: null, deadline: null, goalLabel: null, categoryNames: [], source: 'flaeche', extra }
  await Promise.allSettled([sendLeadAdminNotification(mail), sendLeadDoi({ ...mail, token })]).then((rs) =>
    rs.forEach((r) => r.status === 'rejected' && console.error('land lead mail failed', r.reason))
  )
  return { ok: true }
}

