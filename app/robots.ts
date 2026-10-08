import type { MetadataRoute } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://iab.investments'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/login', '/empfehlung/', '/lp/', '/anfrage/'] },
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}
