import type { MetadataRoute } from 'next'
import { CATEGORIES } from '@/lib/categories'
import { getPublishedOfferPaths } from '@/lib/offers'
import { FRIST_PAGE_YEARS, fristPath } from '@/lib/iab'
import { ARTICLES, articlePath } from '@/lib/wissen'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://iab.investments'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const offers = await getPublishedOfferPaths()
  return [
    { url: APP_URL, changeFrequency: 'weekly', priority: 1 },
    ...CATEGORIES.map((c) => ({ url: `${APP_URL}/${c.slug}`, changeFrequency: 'weekly' as const, priority: 0.8 })),
    ...offers.map((o) => ({ url: `${APP_URL}/${o.slug}/${o.id}`, changeFrequency: 'weekly' as const, priority: 0.6 })),
    { url: `${APP_URL}/angebote`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${APP_URL}/iab-rechner`, changeFrequency: 'monthly', priority: 0.8 },
    ...CATEGORIES.map((c) => ({ url: `${APP_URL}/iab-rechner/${c.slug.replace(/-iab$/, '')}`, changeFrequency: 'monthly' as const, priority: 0.6 })),
    { url: `${APP_URL}/ratgeber`, changeFrequency: 'weekly', priority: 0.7 },
    // Root-level keyword pages (a.path) rank higher than the general guides
    ...ARTICLES.map((a) => ({ url: `${APP_URL}${articlePath(a)}`, changeFrequency: 'monthly' as const, priority: a.path ? 0.8 : 0.7 })),
    { url: `${APP_URL}/so-funktionierts`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${APP_URL}/anbieter`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${APP_URL}/steuerberater`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${APP_URL}/ratgeber/iab-frist`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${APP_URL}/iab-aufloesen`, changeFrequency: 'monthly', priority: 0.9 },
    ...FRIST_PAGE_YEARS.map((y) => ({ url: `${APP_URL}${fristPath(y)}`, changeFrequency: 'monthly' as const, priority: 0.9 })),
    { url: `${APP_URL}/solarpark-flaeche-verpachten`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${APP_URL}/ratgeber/iab-faq`, changeFrequency: 'monthly', priority: 0.7 },
  ]
}
