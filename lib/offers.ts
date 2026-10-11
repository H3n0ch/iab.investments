import 'server-only'
import { createPublicClient, isSupabaseConfigured } from '@/lib/supabase/server'
import type { GatedOfferData, MarketOffer, OfferDocument, OfferFact, PublicOffer } from '@/lib/supabase/types'
import { getAllDemoOffers, getDemoOffer, getDemoOffers } from '@/lib/demo-offers'
import { personalKeys } from '@/lib/datasheets'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { CATEGORIES } from '@/lib/categories'

/** Categories on the site – offers of removed categories (e.g. Wohnmobile) stay in the DB but never show */
const SITE_SLUGS = CATEGORIES.map((c) => c.slug)

// Local preview only: example offers until Supabase is configured. Never in production.
export const useDemo = !isSupabaseConfigured && process.env.NODE_ENV === 'development'

const PUBLIC_COLUMNS =
  'id, category_id, title, description, location, country, min_investment_cents, expected_yield, availability, image_url, gallery, public_facts, is_published, created_at'

export async function getOffersForCategory(slug: string): Promise<PublicOffer[]> {
  if (useDemo) return getDemoOffers(slug)
  if (!isSupabaseConfigured || !SITE_SLUGS.includes(slug)) return []
  const supabase = createPublicClient()
  const { data: cat } = await supabase.from('categories').select('id').eq('slug', slug).maybeSingle()
  if (!cat) return []
  const { data } = await supabase
    .from('offers')
    .select(PUBLIC_COLUMNS)
    .eq('category_id', cat.id)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
  return (data ?? []) as PublicOffer[]
}

/** All published offers across categories, newest first – for the marketplace, the calculator and the home page */
export async function getAllOffers(): Promise<MarketOffer[]> {
  if (useDemo) return getAllDemoOffers().sort((a, b) => b.created_at.localeCompare(a.created_at))
  if (!isSupabaseConfigured) return []
  const { data } = await createPublicClient()
    .from('offers')
    .select(`${PUBLIC_COLUMNS}, categories!inner(slug)`)
    .eq('is_published', true)
    .in('categories.slug', SITE_SLUGS)
    .order('created_at', { ascending: false })
  return ((data ?? []) as unknown as (PublicOffer & { categories: { slug: string } })[]).map(({ categories, ...o }) => ({
    ...o,
    category_slug: categories.slug,
  }))
}

/** Public part of a single published offer (no account needed). */
export async function getPublicOffer(slug: string, id: string): Promise<PublicOffer | null> {
  if (useDemo) return getDemoOffer(slug, id)
  if (!isSupabaseConfigured || !SITE_SLUGS.includes(slug) || !/^[0-9a-f-]{36}$/i.test(id)) return null
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('offers')
    .select(`${PUBLIC_COLUMNS}, categories!inner(slug)`)
    .eq('id', id)
    .eq('is_published', true)
    .eq('categories.slug', slug)
    .maybeSingle()
  if (!data) return null
  const offer = { ...(data as unknown as PublicOffer & { categories?: unknown }) }
  delete offer.categories
  return offer
}

/** Labels (and data sheet keys) of the gated facts are public – shown blurred; values only after the inquiry. */
export async function getOfferFactLabels(slug: string, id: string): Promise<OfferFact[]> {
  const gated = await loadGated(slug, id)
  return gated?.facts.map((f) => ({ key: f.key, label: f.label, value: '' })) ?? []
}

/**
 * Gated part of an offer. Call ONLY after verifying the user is signed in –
 * reads with the service key because these columns aren't granted to anon/authenticated.
 */
export async function getGatedOffer(slug: string, id: string): Promise<GatedOfferData | null> {
  return loadGated(slug, id)
}

async function loadGated(slug: string, id: string): Promise<GatedOfferData | null> {
  if (useDemo) return getDemoOffer(slug, id)
  if (!isSupabaseConfigured) return null
  const { data } = await getSupabaseAdmin()
    .from('offers')
    .select('details, facts, documents')
    .eq('id', id)
    .eq('is_published', true)
    .maybeSingle()
  if (!data) return null
  // Provider-identifying fields (operator, manufacturer, exact site) never reach the browser – not even after
  // the inquiry. The label stays, so the page can say „im persönlichen Gespräch“.
  const personal = personalKeys(slug)
  const facts = (Array.isArray(data.facts) ? (data.facts as OfferFact[]) : []).map((f) =>
    f.key && personal.has(f.key) ? { key: f.key, label: f.label, value: '' } : f,
  )
  return {
    details: data.details ?? null,
    facts,
    documents: Array.isArray(data.documents) ? (data.documents as OfferDocument[]) : [],
  }
}

/** Remember which registered user looked at which offer (shown to the admin later). */
export async function recordOfferView(userId: string, offerId: string): Promise<void> {
  if (!isSupabaseConfigured || useDemo) return
  const supabase = getSupabaseAdmin()
  const { data } = await supabase.from('offer_views').select('view_count').eq('user_id', userId).eq('offer_id', offerId).maybeSingle()
  if (data) {
    await supabase
      .from('offer_views')
      .update({ view_count: data.view_count + 1, last_viewed_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('offer_id', offerId)
  } else {
    await supabase.from('offer_views').insert({ user_id: userId, offer_id: offerId })
  }
}

export type MarketStat = {
  slug: string
  count: number
  /** Lowest entry ticket in euros */
  minEntry: number | null
  /** Offers deliverable right away or within weeks / by year end */
  fastCount: number
  /** Range of the providers' stated first-year yield in % – only from 2+ offers, so no single offer is revealed */
  yieldRange: [number, number] | null
  /** Range of the price per kWp in € (PV) – same rule */
  kwpPriceRange: [number, number] | null
}

const FAST_RE = /sofort|woche|bis dez|lieferbar/i
const num = (v: string | undefined, re: RegExp) => {
  const m = v?.replace(/\./g, '').match(re)
  return m ? Number(m[1].replace(',', '.')) : null
}
const range = (xs: (number | null)[]): [number, number] | null => {
  const v = xs.filter((x): x is number => x != null && Number.isFinite(x))
  return v.length >= 2 ? [Math.min(...v), Math.max(...v)] : null
}

/**
 * Market snapshot per category, computed from the data sheets of all published offers – our own data, the part of a
 * guide page nobody else has. Aggregates only: ranges need at least two offers, so no single offer is revealed.
 */
export async function getMarketSnapshot(): Promise<MarketStat[]> {
  type Row = { min_investment_cents: number | null; availability: string | null; facts: OfferFact[]; slug: string }
  let rows: Row[] = []
  if (useDemo) {
    rows = getAllDemoOffers().map((o) => ({ min_investment_cents: o.min_investment_cents, availability: o.availability, facts: [], slug: o.category_slug }))
  } else if (isSupabaseConfigured) {
    const { data } = await getSupabaseAdmin()
      .from('offers')
      .select('min_investment_cents, availability, facts, categories!inner(slug)')
      .eq('is_published', true)
      .in('categories.slug', SITE_SLUGS)
    rows = ((data ?? []) as unknown as (Omit<Row, 'slug'> & { categories: { slug: string } })[]).map((r) => ({ ...r, slug: r.categories.slug }))
  }
  const bySlug = new Map<string, Row[]>()
  for (const r of rows) bySlug.set(r.slug, [...(bySlug.get(r.slug) ?? []), r])
  return [...bySlug.entries()].map(([slug, rs]) => {
    const fact = (r: Row, key: string) => (Array.isArray(r.facts) ? r.facts : []).find((f) => f.key === key)?.value
    const entries = rs.map((r) => r.min_investment_cents).filter((c): c is number => c != null)
    return {
      slug,
      count: rs.length,
      minEntry: entries.length ? Math.min(...entries) / 100 : null,
      fastCount: rs.filter((r) => r.availability && FAST_RE.test(r.availability)).length,
      yieldRange: range(rs.map((r) => num(fact(r, 'rendite'), /(\d+(?:,\d+)?)\s*%/))),
      kwpPriceRange: range(rs.map((r) => num(fact(r, 'preis_kwp'), /(\d+(?:,\d+)?)\s*€/))),
    }
  })
}

/** Offer for the in-text project preview: public data plus the keys of its gated fields – never their values */
export type PreviewOffer = MarketOffer & { gatedKeys: string[] }

/**
 * 2–3 offers for the project preview on guide pages: given categories, quickly deliverable ones first.
 * Gated facts are reduced to their keys here, on the server, so no locked value can reach the page.
 */
export async function getPreviewOffers({ slugs, limit = 3 }: { slugs: string[]; limit?: number }): Promise<PreviewOffer[]> {
  const offers = (await getAllOffers()).filter((o) => slugs.includes(o.category_slug))
  if (offers.length === 0) return []
  let keysById = new Map<string, string[]>()
  if (!useDemo && isSupabaseConfigured) {
    const { data } = await getSupabaseAdmin()
      .from('offers')
      .select('id, facts')
      .in('id', offers.map((o) => o.id))
    keysById = new Map(
      ((data ?? []) as { id: string; facts: OfferFact[] }[]).map((r) => [r.id, (Array.isArray(r.facts) ? r.facts : []).map((f) => f.key).filter((k): k is string => Boolean(k))]),
    )
  }
  const fast = (o: MarketOffer) => (o.availability && FAST_RE.test(o.availability) ? 0 : 1)
  // One per category first, so the preview shows the range of options, then fill up
  const sorted = [...offers].sort((a, b) => fast(a) - fast(b))
  const picked: MarketOffer[] = []
  for (const slug of slugs) {
    const o = sorted.find((x) => x.category_slug === slug && !picked.includes(x))
    if (o) picked.push(o)
  }
  for (const o of sorted) if (picked.length < limit && !picked.includes(o)) picked.push(o)
  return picked.slice(0, limit).map((o) => ({ ...o, gatedKeys: keysById.get(o.id) ?? [] }))
}

/** Published offers for the sitemap */
export async function getPublishedOfferPaths(): Promise<{ slug: string; id: string }[]> {
  if (!isSupabaseConfigured) return []
  const { data } = await createPublicClient().from('offers').select('id, categories!inner(slug)').eq('is_published', true).in('categories.slug', SITE_SLUGS)
  return ((data ?? []) as unknown as { id: string; categories: { slug: string } }[]).map((r) => ({ slug: r.categories.slug, id: r.id }))
}
