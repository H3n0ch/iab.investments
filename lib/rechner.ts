// Shared by the calculator UI (live) and the report action (server recomputes – never trusts client numbers).
import {
  basicAllowance,
  iabSaving,
  marginalRate,
  maxIab,
  optimumIab,
  PROFIT_LIMIT,
  splitIab,
  TAX_YEARS,
  totalTax,
  type SplitResult,
  type TaxBreakdown,
  type TaxYear,
} from './tax'

export type CalcParams = {
  zvE: number
  joint: boolean
  year: TaxYear
  church: 0 | 8 | 9
  /** Planned net investment */
  investment: number
  businesses: number
  /** Profit of the (largest) business in the formation year – § 7g profit limit */
  profit: number
  /** Requested IAB; null = use the maximum */
  iab: number | null
  category: string
}

export type CalcResult = {
  max: number
  iab: number
  profitOk: boolean
  without: TaxBreakdown
  with: TaxBreakdown
  saving: number
  /** saving / IAB */
  effRate: number
  /** Marginal rate before the first and after the last IAB euro */
  rateStart: number
  rateEnd: number
  optimum: number
  split2: SplitResult
  split3: SplitResult
  /** Part of the IAB pushes the income below the basic allowance and has no effect */
  belowAllowance: boolean
}

export function computeCalc(p: CalcParams): CalcResult {
  const o = { year: p.year, joint: p.joint, church: p.church }
  const max = maxIab(p.investment, p.businesses)
  const profitOk = p.profit <= PROFIT_LIMIT
  const iab = profitOk ? Math.min(p.iab ?? max, max) : 0
  const saving = iabSaving(p.zvE, iab, o)
  return {
    max,
    iab,
    profitOk,
    without: totalTax(p.zvE, o),
    with: totalTax(Math.max(0, p.zvE - iab), o),
    saving,
    effRate: iab ? saving / iab : 0,
    rateStart: marginalRate(p.zvE, 0, o),
    rateEnd: marginalRate(p.zvE, Math.max(0, iab - 100), o),
    optimum: optimumIab(p.zvE, iab, o),
    split2: splitIab(p.zvE, iab, 2, o),
    split3: splitIab(p.zvE, iab, 3, o),
    belowAllowance: p.zvE - iab < basicAllowance(p.year) * (p.joint ? 2 : 1),
  }
}

export const eur = (v: number) => v.toLocaleString('de-DE', { maximumFractionDigits: 0 }) + ' €'
export const eur2 = (v: number) => v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
export const pct = (v: number) => (v * 100).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %'

/** The hint looks at the whole IAB range, not just the starting marginal rate */
export function calcHint(r: CalcResult): string {
  if (!r.iab) return 'Mit diesen Angaben ergibt sich kein Investitionsabzugsbetrag.'
  if (r.optimum < r.iab) {
    return `Bis ${eur(r.optimum)} IAB spart jeder Euro mindestens 30 %. Danach sinkt Ihr Grenzsteuersatz von ${pct(r.rateStart)} auf ${pct(r.rateEnd)}, im Durchschnitt sparen Sie ${pct(r.effRate)}. Den Rest in einem Folgejahr zu bilden, bringt bei gleichem Einkommen mehr.`
  }
  return `Ihr Grenzsteuersatz bleibt über den ganzen IAB bei mindestens 30 % (von ${pct(r.rateStart)} auf ${pct(r.rateEnd)}). Im Durchschnitt spart jeder Euro IAB ${pct(r.effRate)}.`
}

export function reportRows(p: CalcParams, r: CalcResult, categoryName: string | null): [string, string][] {
  return [
    ['Zu versteuerndes Einkommen', `${eur(p.zvE)} (${p.joint ? 'Zusammenveranlagung' : 'Einzelveranlagung'}, ${p.year})`],
    ['Kirchensteuer', p.church ? `${p.church} %` : 'keine'],
    ['Geplante Investition', `${eur(p.investment)} netto${categoryName ? ` · ${categoryName}` : ''}`],
    ['Investitionsabzugsbetrag', eur(r.iab)],
    ['Steuer ohne IAB', eur2(r.without.total)],
    ['Steuer mit IAB', eur2(r.with.total)],
    ['Steuerersparnis', `${eur2(r.saving)} (${pct(r.effRate)} des IAB)`],
    ['Verteilt auf 2 Jahre', `${eur2(r.split2.saving)} (bei gleichem Einkommen)`],
  ]
}

export function isTaxYear(v: number): v is TaxYear {
  return (TAX_YEARS as readonly number[]).includes(v)
}
