// Tax maths for the IAB calculator (/iab-rechner). Pure functions, run in the browser.
// A calculation aid, not tax advice: income tax per § 32a EStG (2023–2026), solidarity surcharge with phase-in zone,
// simplified church tax (8/9 % of income tax, no child allowances). No trade tax.

export const TAX_YEARS = [2026, 2025, 2024, 2023] as const
export type TaxYear = (typeof TAX_YEARS)[number]

type Tariff = {
  /** Basic allowance (Grundfreibetrag) */
  gfb: number
  /** Upper end of zone 2 and its coefficient: (a2·y + 1.400)·y */
  z2: number
  a2: number
  /** Upper end of zone 3 and its coefficients: (a3·z + 2.397)·z + c3 */
  z3: number
  a3: number
  c3: number
  /** Zone 4 (42 %) and zone 5 (45 %, from 277.826 €) offsets */
  c4: number
  c5: number
  /** Solidarity surcharge exemption limit (single) */
  soliFree: number
}

// § 32a EStG in the version valid for each year. Verify against bmf-steuerrechner.de before changing.
const TARIFF: Record<TaxYear, Tariff> = {
  2026: { gfb: 12348, z2: 17799, a2: 914.51, z3: 69878, a3: 173.1, c3: 1034.87, c4: 11135.63, c5: 19470.38, soliFree: 20350 },
  2025: { gfb: 12096, z2: 17443, a2: 932.3, z3: 68480, a3: 176.64, c3: 1015.13, c4: 10911.92, c5: 19246.67, soliFree: 19950 },
  2024: { gfb: 11784, z2: 17005, a2: 954.8, z3: 66760, a3: 181.19, c3: 991.21, c4: 10636.31, c5: 18971.06, soliFree: 18130 },
  2023: { gfb: 10908, z2: 15999, a2: 979.18, z3: 62809, a3: 192.59, c3: 966.53, c4: 9972.98, c5: 18307.73, soliFree: 17543 },
}

const TOP_FROM = 277826

export function basicAllowance(year: TaxYear): number {
  return TARIFF[year].gfb
}

/** Income tax for one person (Grundtarif), whole euros rounded down */
export function incomeTax(zvE: number, year: TaxYear): number {
  const t = TARIFF[year]
  const x = Math.floor(Math.max(0, zvE))
  if (x <= t.gfb) return 0
  if (x <= t.z2) {
    const y = (x - t.gfb) / 10000
    return Math.floor((t.a2 * y + 1400) * y)
  }
  if (x <= t.z3) {
    const z = (x - t.z2) / 10000
    return Math.floor((t.a3 * z + 2397) * z + t.c3)
  }
  if (x < TOP_FROM) return Math.floor(0.42 * x - t.c4)
  return Math.floor(0.45 * x - t.c5)
}

export type TaxInput = { year: TaxYear; joint: boolean; /** 0, 8 or 9 (% of income tax) */ church: 0 | 8 | 9 }

export type TaxBreakdown = { est: number; soli: number; kist: number; total: number }

/** Income tax + solidarity surcharge + church tax for a taxable income */
export function totalTax(zvE: number, o: TaxInput): TaxBreakdown {
  const est = o.joint ? 2 * incomeTax(zvE / 2, o.year) : incomeTax(zvE, o.year)
  const free = TARIFF[o.year].soliFree * (o.joint ? 2 : 1)
  const soli = est <= free ? 0 : round2(Math.min(0.055 * est, 0.119 * (est - free)))
  const kist = round2((est * o.church) / 100)
  return { est, soli, kist, total: round2(est + soli + kist) }
}

function round2(v: number): number {
  return Math.round(v * 100) / 100
}

// ── IAB ───────────────────────────────────────────────────────────

export const IAB_CAP_PER_BUSINESS = 200000
export const PROFIT_LIMIT = 200000
/** Below this marginal rate, the rest of the IAB is usually better formed in a later year */
export const OPTIMUM_RATE = 0.3

/** Largest IAB allowed: 50 % of the planned net investment, at most 200.000 € per business */
export function maxIab(investment: number, businesses: number): number {
  return Math.max(0, Math.min(Math.floor(investment / 2), IAB_CAP_PER_BUSINESS * businesses))
}

/** Tax saved (deferred) in the formation year: tax(zvE) − tax(zvE − IAB) */
export function iabSaving(zvE: number, iab: number, o: TaxInput): number {
  return round2(totalTax(zvE, o).total - totalTax(Math.max(0, zvE - iab), o).total)
}

/** Marginal rate after the first `deducted` euros of IAB, measured over the next 100 € */
export function marginalRate(zvE: number, deducted: number, o: TaxInput): number {
  const a = totalTax(Math.max(0, zvE - deducted), o).total
  const b = totalTax(Math.max(0, zvE - deducted - 100), o).total
  return (a - b) / 100
}

export type CurvePoint = { iab: number; saving: number; rate: number }

/** Cumulative saving and marginal rate in steps (for the chart and the optimum) */
export function savingsCurve(zvE: number, max: number, o: TaxInput, step = 1000): CurvePoint[] {
  const base = totalTax(zvE, o).total
  const pts: CurvePoint[] = []
  for (let i = 0; i <= max; i += step) {
    pts.push({ iab: i, saving: round2(base - totalTax(Math.max(0, zvE - i), o).total), rate: marginalRate(zvE, i, o) })
  }
  if (pts.length && pts[pts.length - 1].iab !== max) {
    pts.push({ iab: max, saving: iabSaving(zvE, max, o), rate: marginalRate(zvE, max, o) })
  }
  return pts
}

/**
 * IAB up to which every euro still saves at least OPTIMUM_RATE. Beyond that point, forming the rest
 * in another year with the same income saves more. Returns `max` if the rate never drops below.
 */
export function optimumIab(zvE: number, max: number, o: TaxInput, step = 1000): number {
  for (let i = 0; i < max; i += step) {
    if (marginalRate(zvE, i, o) < OPTIMUM_RATE) return i
  }
  return max
}

export type SplitResult = { years: number; perYear: number[]; saving: number }

/**
 * Spread one IAB total over 1–3 formation years with the same taxable income each year.
 * Greedy in 1.000-€ steps: each step goes to the year where it saves the most (ties: the year with less IAB so far).
 */
export function splitIab(zvE: number, total: number, years: number, o: TaxInput, step = 1000): SplitResult {
  const perYear = Array.from({ length: years }, () => 0)
  const taxAfter = (deducted: number) => totalTax(Math.max(0, zvE - deducted), o).total
  let left = total
  while (left > 0) {
    const chunk = Math.min(step, left)
    let best = 0
    let bestGain = -1
    for (let y = 0; y < years; y++) {
      const gain = taxAfter(perYear[y]) - taxAfter(perYear[y] + chunk)
      if (gain > bestGain + 0.005 || (Math.abs(gain - bestGain) <= 0.005 && perYear[y] < perYear[best])) {
        bestGain = gain
        best = y
      }
    }
    perYear[best] += chunk
    left -= chunk
  }
  const saving = round2(perYear.reduce((s, v) => s + iabSaving(zvE, v, o), 0))
  return { years, perYear, saving }
}
