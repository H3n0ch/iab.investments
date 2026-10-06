import 'server-only'
import { createPublicClient, isSupabaseConfigured } from '@/lib/supabase/server'
import type { GatedOfferData, MarketOffer, OfferDocument, OfferFact, PublicOffer } from '@/lib/supabase/types'
import { getAllDemoOffers, getDemoOffer, getDemoOffers } from '@/lib/demo-offers'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

// Local preview only: example offers until Supabase is configured. Never in production.
export const useDemo = !isSupabaseConfigured && process.env.NODE_ENV === 'development'

const PUBLIC_COLUMNS =
  'id, category_id, title, description, location, country, min_investment_cents, expected_yield, availability, image_url, gallery, is_published, created_at'

export async function getOffersForCategory(slug: string): Promise<PublicOffer[]> {
  if (useDemo) return getDemoOffers(slug)
  if (!isSupabaseConfigured) return []
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
    .order('created_at', { ascending: false })
  return ((data ?? []) as unknown as (PublicOffer & { categories: { slug: string } })[]).map(({ categories, ...o }) => ({
    ...o,
    category_slug: categories.slug,
  }))
}

/** Public part of a single published offer (no account needed). */
export async function getPublicOffer(slug: string, id: string): Promise<PublicOffer | null> {
  if (useDemo) return getDemoOffer(slug, id)
  if (!isSupabaseConfigured || !/^[0-9a-f-]{36}$/i.test(id)) return null
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

/** Labels of the key facts are public (shown with a lock); values only for registered users. */
export async function getOfferFactLabels(slug: string, id: string): Promise<string[]> {
  const gated = await loadGated(slug, id)
  return gated?.facts.map((f) => f.label) ?? []
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
  return {
    details: data.details ?? null,
    facts: Array.isArray(data.facts) ? (data.facts as OfferFact[]) : [],
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

/** Published offers for the sitemap */
export async function getPublishedOfferPaths(): Promise<{ slug: string; id: string }[]> {
  if (!isSupabaseConfigured) return []
  const { data } = await createPublicClient().from('offers').select('id, categories!inner(slug)').eq('is_published', true)
  return ((data ?? []) as unknown as { id: string; categories: { slug: string } }[]).map((r) => ({ slug: r.categories.slug, id: r.id }))
}
