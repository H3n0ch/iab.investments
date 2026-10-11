// Automatic lead rating for the CRM (🔥 heiß / warm / kalt): who to call first.
// Pure function – used in the CRM list (client) and in admin mails (server).

export type LeadScore = 'heiss' | 'warm' | 'kalt'

type ScoreInput = {
  iab_deadline: string | null
  budget: string | null
  invest_timing: string | null
  completed_at: string | null
  consent_share: boolean
  iab_amount_eur: number | null
}

export function leadScore(l: ScoreInput, now = Date.now()): LeadScore {
  let points = 0
  if (l.iab_deadline) {
    const days = (new Date(l.iab_deadline).getTime() - now) / 86400000
    if (days >= 0 && days < 120) points += 3
    else if (days >= 0 && days < 400) points += 1
  }
  if (l.budget === 'gt200') points += 3
  else if (l.budget === '100-200') points += 2
  else if (l.budget === '50-100') points += 1
  if (l.invest_timing === 'sofort' || l.invest_timing === 'dieses-jahr') points += 2
  if ((l.iab_amount_eur ?? 0) >= 50000) points += 1
  if (l.completed_at && l.consent_share) points += 1
  return points >= 6 ? 'heiss' : points >= 3 ? 'warm' : 'kalt'
}

export const SCORE_BADGES: Record<LeadScore, { label: string; color: string; rank: number }> = {
  heiss: { label: '🔥 Heiß', color: 'bg-red-600 text-white', rank: 0 },
  warm: { label: 'Warm', color: 'bg-amber-100 text-amber-800', rank: 1 },
  kalt: { label: 'Kalt', color: 'bg-slate-100 text-slate-500', rank: 2 },
}
