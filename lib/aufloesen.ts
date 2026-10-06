// Cost of letting an IAB lapse (/iab-aufloesen). A calculation aid, not tax advice.
// Reversal happens in the formation year; interest under § 233a AO runs from 15 months after that year ends
// (§ 7g Abs. 3 Satz 4 EStG excludes § 233a Abs. 2a AO, so the interest runs from the formation year).
import { totalTax, type TaxYear } from './tax'

/** 0,15 % per full month (§ 238 Abs. 1a AO, since 2019) */
export const INTEREST_PER_MONTH = 0.0015
/** Assumption: the amended assessment arrives about this many months after the deadline */
export const ASSESSMENT_DELAY_MONTHS = 6

export function interestStart(formationYear: number): Date {
  return new Date(formationYear + 2, 3, 1) // 1 April, two years later = 15 months after 31.12.
}

/** Assumed end of the interest period: deadline (31.12. of year + 3) plus the assessment delay */
export function assumedAssessment(formationYear: number): Date {
  return new Date(formationYear + 4, ASSESSMENT_DELAY_MONTHS - 1, 30)
}

/** Full months between two dates (§ 238 AO counts only full months) */
export function fullMonths(from: Date, to: Date): number {
  if (to < from) return 0
  // `to` is inclusive: a month starting on the 1st is complete on the last day of that month
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate() + 1)
  let m = (end.getFullYear() - from.getFullYear()) * 12 + (end.getMonth() - from.getMonth())
  if (end.getDate() < from.getDate()) m -= 1
  return Math.max(0, m)
}

export type LapseResult = {
  /** Tax due again: income tax + soli + church tax */
  backTax: number
  /** Only income tax bears interest (no interest on soli / church tax) */
  incomeTaxPart: number
  months: number
  interest: number
  total: number
  start: Date
  end: Date
}

export function lapseCost(o: { iab: number; zvE: number; year: TaxYear; joint: boolean; church: 0 | 8 | 9; end?: Date }): LapseResult {
  const t = { year: o.year, joint: o.joint, church: o.church }
  const without = totalTax(o.zvE, t)
  const withIab = totalTax(Math.max(0, o.zvE - o.iab), t)
  const backTax = Math.round((without.total - withIab.total) * 100) / 100
  const incomeTaxPart = without.est - withIab.est
  const start = interestStart(o.year)
  const end = o.end ?? assumedAssessment(o.year)
  const months = fullMonths(start, end)
  // Interest base rounded down to full 50 €, interest rounded down to full euros (§ 238 Abs. 2 AO, § 239 AO)
  const base = Math.floor(incomeTaxPart / 50) * 50
  const interest = Math.floor(base * INTEREST_PER_MONTH * months)
  return { backTax, incomeTaxPart, months, interest, total: Math.round((backTax + interest) * 100) / 100, start, end }
}
