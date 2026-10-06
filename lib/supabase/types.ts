export const LEAD_STATUSES = [
  'neu',
  'kontaktiert',
  'qualifiziert',
  'weitergegeben',
  'abgeschlossen',
  'abgelehnt',
] as const
export type LeadStatus = (typeof LEAD_STATUSES)[number]

export type Offer = {
  id: string
  category_id: string
  title: string
  description: string | null
  location: string | null
  /** ISO country code, default 'DE' */
  country: string
  min_investment_cents: number | null
  expected_yield: string | null
  availability: string | null
  image_url: string | null
  provider_name: string | null
  is_published: boolean
  created_at: string
  gallery: string[]
  /** Gated: only delivered to registered users */
  details: string | null
  facts: OfferFact[]
  documents: OfferDocument[]
}

export type OfferFact = { label: string; value: string }
export type OfferDocument = { label: string; url: string }

/** Columns readable without an account (RLS/grants in supabase/schema.sql) */
export type PublicOffer = Omit<Offer, 'provider_name' | 'details' | 'facts' | 'documents'>

/** Public offer plus its category slug – used across categories (marketplace, calculator) */
export type MarketOffer = PublicOffer & { category_slug: string }

/** Gated part of an offer – loaded server-side for registered users only */
export type GatedOfferData = Pick<Offer, 'details' | 'facts' | 'documents'>

export type Lead = {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  iab_amount: string | null
  iab_year: number | null
  iab_deadline: string | null
  goal: string | null
  source: string | null
  /** Free text from the contact form */
  message: string | null
  offer_id: string | null
  landing_path: string | null
  utm_source: string | null
  consent_text_version: string | null
  consent_privacy: boolean
  consent_share: boolean
  /** Consent to be called by iab.investments and the named provider */
  consent_call: boolean
  /** Exact wording of the share consent the lead agreed to */
  consent_share_text: string | null
  consent_at: string | null
  legal_form: string | null
  /** Planned investment, net */
  investment_cents: number | null
  invest_timing: string | null
  status: LeadStatus
  notes: string | null
  follow_up_at: string | null
  user_id: string | null
  created_at: string
}

export type Profile = {
  id: string
  full_name: string | null
  phone: string | null
  company: string | null
}

export type LeadActivity = {
  id: string
  lead_id: string
  admin_email: string
  channel: string
  outcome: string
  notes: string | null
  created_at: string
}

export const SUBMISSION_STATUSES = ['neu', 'freigeschaltet', 'abgelehnt'] as const
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number]

export type ProviderSubmission = {
  id: string
  company: string
  contact_name: string
  email: string
  phone: string | null
  website: string | null
  category_slug: string | null
  title: string
  description: string
  location: string | null
  country: string
  min_investment_cents: number | null
  expected_yield: string | null
  availability: string | null
  image_url: string | null
  documents_url: string | null
  status: SubmissionStatus
  admin_notes: string | null
  offer_id: string | null
  created_at: string
}

export type TaxAdvisorPartner = {
  id: string
  firm: string
  contact_name: string
  email: string
  phone: string | null
  city: string | null
  website: string | null
  message: string | null
  code: string | null
  status: 'neu' | 'aktiv' | 'abgelehnt'
  admin_notes: string | null
  created_at: string
}
