import 'server-only'
import { CATEGORIES } from '@/lib/categories'
import { amountBucket, iabDeadline, iabYears, isFormStep, isValidBudget, isValidCallbackTime, isValidLegalForm, isValidTiming } from '@/lib/iab'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

// Clean-up of the inquiry answers (2-page form, saved on submit in submitInquiry):
// only whitelisted fields and values reach the leads table.

export type StepPayload = {
  categories?: string[]
  /** 0 = no IAB formed yet, null = not answered */
  iab_amount_eur?: number | null
  iab_year?: number | null
  budget?: string
  invest_timing?: string
  legal_form?: string
  company?: string
  callback_time?: string
  form_step?: string
}

/** Turns untrusted input (FormData values or beacon JSON) into a clean update */
export function sanitizeStep(raw: Record<string, unknown>): StepPayload {
  const out: StepPayload = {}
  if (Array.isArray(raw.categories)) {
    const slugs = raw.categories.map(String)
    out.categories = CATEGORIES.filter((c) => slugs.includes(c.slug)).map((c) => c.slug)
  }
  if (raw.iab_amount_eur !== undefined && raw.iab_amount_eur !== '') {
    const n = Math.floor(Number(String(raw.iab_amount_eur).replace(/[^0-9]/g, '')))
    if (Number.isFinite(n)) out.iab_amount_eur = Math.min(Math.max(0, n), 200_000)
  }
  if (raw.iab_year !== undefined) {
    const y = Number(raw.iab_year)
    out.iab_year = iabYears().includes(y) ? y : null
  }
  if (isValidBudget(raw.budget)) out.budget = raw.budget
  if (isValidTiming(raw.invest_timing)) out.invest_timing = raw.invest_timing
  if (isValidLegalForm(raw.legal_form)) out.legal_form = raw.legal_form
  if (typeof raw.company === 'string') out.company = raw.company.trim().slice(0, 160)
  if (isValidCallbackTime(raw.callback_time)) out.callback_time = raw.callback_time
  if (isFormStep(raw.form_step)) out.form_step = raw.form_step
  return out
}

/** Column values for a step update (also used when a lead is started with pre-filled values) */
export function stepColumns(p: StepPayload): Record<string, unknown> {
  const cols: Record<string, unknown> = {}
  if (p.iab_amount_eur !== undefined && p.iab_amount_eur !== null) {
    cols.iab_amount_eur = p.iab_amount_eur
    cols.iab_amount = p.iab_amount_eur > 0 ? amountBucket(p.iab_amount_eur) : null
    if (p.iab_amount_eur === 0) {
      cols.iab_year = null
      cols.iab_deadline = null
    }
  }
  if (p.iab_year !== undefined && !(p.iab_amount_eur === 0)) {
    cols.iab_year = p.iab_year
    cols.iab_deadline = p.iab_year ? iabDeadline(p.iab_year).toISOString().slice(0, 10) : null
  }
  if (p.budget) cols.budget = p.budget
  if (p.invest_timing) cols.invest_timing = p.invest_timing
  if (p.legal_form) cols.legal_form = p.legal_form
  if (p.company !== undefined) cols.company = p.company || null
  if (p.callback_time) cols.callback_time = p.callback_time
  if (p.form_step) cols.form_step = p.form_step
  return cols
}

/** Replaces the lead's categories (lead_categories join table) */
export async function setLeadCategories(leadId: string, slugs: string[]) {
  const supabase = getSupabaseAdmin()
  await supabase.from('lead_categories').delete().eq('lead_id', leadId)
  if (slugs.length === 0) return
  const { data: cats } = await supabase.from('categories').select('id').in('slug', slugs)
  if (cats?.length) await supabase.from('lead_categories').insert(cats.map((c) => ({ lead_id: leadId, category_id: c.id })))
}
