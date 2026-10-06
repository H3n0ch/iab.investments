import { CATEGORIES, type Category, type Goal } from './categories'

// IAB is capped at 200.000 € per business (§ 7g EStG); it covers up to 50 % of the
// planned cost, so `max * 2` is the investment volume it can back.
export const AMOUNTS = [
  { value: 'lt50', label: 'bis 50.000 €', max: 50000 },
  { value: '50-100', label: '50.000 – 100.000 €', max: 100000 },
  { value: '100-150', label: '100.000 – 150.000 €', max: 150000 },
  { value: '150-200', label: '150.000 – 200.000 €', max: 200000 },
] as const
export type AmountValue = (typeof AMOUNTS)[number]['value']

/** Asked in offer inquiries and the calculator – lets buyers price leads by segment */
export const LEGAL_FORMS = [
  { value: 'einzelunternehmen', label: 'Einzelunternehmen' },
  { value: 'freiberufler', label: 'Freiberufler' },
  { value: 'personengesellschaft', label: 'GbR / OHG / KG / PartG' },
  { value: 'gmbh', label: 'GmbH / UG' },
  { value: 'gmbh-co-kg', label: 'GmbH & Co. KG' },
  { value: 'sonstige', label: 'Sonstige' },
] as const

export function investTimings(now = new Date()) {
  const y = now.getFullYear()
  return [
    { value: 'sofort', label: 'Sofort' },
    { value: 'dieses-jahr', label: `Bis Ende ${y}` },
    { value: 'naechstes-jahr', label: `${y + 1}` },
    { value: 'offen', label: 'Noch offen' },
  ]
}

export const isValidLegalForm = (v: unknown): v is string => LEGAL_FORMS.some((f) => f.value === v)
export const isValidTiming = (v: unknown): v is string => investTimings().some((t) => t.value === v)

/** Bucket of a IAB amount in euros, as stored in leads.iab_amount */
export function amountBucket(iab: number): AmountValue {
  return iab <= 50000 ? 'lt50' : iab <= 100000 ? '50-100' : iab <= 150000 ? '100-150' : '150-200'
}

/**
 * Selectable formation years: the last four fiscal years incl. the current one.
 * A IAB formed for fiscal year X must be invested by the end of X + 3.
 */
export function iabYears(now = new Date()): number[] {
  const y = now.getFullYear()
  return [y - 3, y - 2, y - 1, y]
}

export function iabDeadline(year: number): Date {
  return new Date(Date.UTC(year + 3, 11, 31))
}

export function formatDeadline(year: number): string {
  return iabDeadline(year).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })
}

export function daysUntilDeadline(year: number, now = new Date()): number {
  return Math.ceil((iabDeadline(year).getTime() - now.getTime()) / 86400000)
}

export function isValidAmount(v: unknown): v is AmountValue {
  return AMOUNTS.some((a) => a.value === v)
}

export function isValidGoal(v: unknown): v is Goal {
  return v === 'rendite' || v === 'eigennutzung' || v === 'steuer'
}

/**
 * Rank categories for a check result. Goal fit dominates; categories whose typical
 * entry ticket exceeds the IAB budget bracket are pushed down (but not hidden –
 * IAB covers up to 50 % of the planned cost, so the actual investment can be higher).
 */
export function matchCategories(amount: AmountValue, goal: Goal, limit = 3): Category[] {
  const budget = AMOUNTS.find((a) => a.value === amount)!.max * 2
  // Categories without vetted providers yet are not recommended by the check
  return CATEGORIES.filter((c) => !c.comingSoon).map((c, i) => {
    let score = 0
    const goalIdx = c.goals.indexOf(goal)
    if (goalIdx === 0) score += 10
    else if (goalIdx > 0) score += 6
    if (c.minInvestment <= budget) score += 4
    else score -= 4
    return { c, score, i }
  })
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, limit)
    .map((x) => x.c)
}
